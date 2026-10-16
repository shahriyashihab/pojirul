import { Product, Order, CustomerDue, ShopExpense, StockInRecord, DailyCashRecord, ShopSettings } from '../types';
import { INITIAL_PRODUCTS, INITIAL_EXPENSES, INITIAL_CUSTOMERS_DUE, INITIAL_SETTINGS, INITIAL_STOCK_IN } from './initialData';

const FIREBASE_BASE_URL = 'https://pjri-e771a-default-rtdb.firebaseio.com';

// LocalStorage Keys for reliable offline caching and fast initial render
const STORAGE_KEYS = {
  PRODUCTS: 'bb_products_v1',
  ORDERS: 'bb_orders_v1',
  CUSTOMERS_DUE: 'bb_customers_due_v1',
  EXPENSES: 'bb_expenses_v1',
  STOCK_IN: 'bb_stock_in_v1',
  DAILY_CASH: 'bb_daily_cash_v1',
  SETTINGS: 'bb_settings_v1',
  AUTH: 'bb_admin_session_v1',
};

// Generic REST request with timeout
async function rtdbFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  const url = `${FIREBASE_BASE_URL}/${path}.json`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Firebase RTDB error at ${path}: ${res.statusText}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`Firebase RTDB network error for ${path}:`, err);
    return null;
  }
}

export const FirebaseService = {
  // --- PRODUCTS ---
  async getProducts(): Promise<Product[]> {
    const remote = await rtdbFetch<Record<string, Product> | Product[]>('products');
    if (remote) {
      const list: Product[] = Array.isArray(remote)
        ? remote.filter(Boolean)
        : Object.values(remote);
      if (list.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(list));
        return list;
      }
    }
    // Check local cache
    const cached = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    // Seed initial products to RTDB if empty
    await this.saveProducts(INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  },

  async saveProducts(products: Product[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    // Transform array to key-based object for RTDB
    const map: Record<string, Product> = {};
    products.forEach((p) => {
      map[p.id] = p;
    });
    await rtdbFetch('products', {
      method: 'PUT',
      body: JSON.stringify(map),
    });
  },

  async updateProduct(product: Product): Promise<void> {
    const current = await this.getProducts();
    const idx = current.findIndex((p) => p.id === product.id);
    let updated: Product[];
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = product;
    } else {
      updated = [product, ...current];
    }
    await this.saveProducts(updated);
  },

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    const remote = await rtdbFetch<Record<string, Order> | Order[]>('orders');
    if (remote) {
      const list: Order[] = Array.isArray(remote)
        ? remote.filter(Boolean)
        : Object.values(remote);
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list));
      return list;
    }
    const cached = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  },

  async createOrder(order: Order): Promise<void> {
    // 1. Save to orders in RTDB
    await rtdbFetch(`orders/${order.id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });

    // 2. Reduce product stock automatically
    const products = await this.getProducts();
    let productsModified = false;
    const updatedProducts = products.map((prod) => {
      const item = order.items.find((i) => i.productId === prod.id);
      if (item) {
        productsModified = true;
        const newStock = Math.max(0, prod.stockKg - item.quantityKg);
        return { ...prod, stockKg: newStock };
      }
      return prod;
    });

    if (productsModified) {
      await this.saveProducts(updatedProducts);
    }

    // 3. If there is dueAmount, update or add to customer due ledger
    if (order.dueAmount > 0) {
      await this.recordCustomerDueFromOrder(order);
    }

    // Update local orders cache
    const currentOrders = await this.getOrders();
    const updatedOrders = [order, ...currentOrders.filter((o) => o.id !== order.id)];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const now = new Date().toISOString();
    await rtdbFetch(`orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, updatedAt: now }),
    });

    const orders = await this.getOrders();
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status, updatedAt: now } : o));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
  },

  // --- CUSTOMER DUE LEDGER ---
  async getCustomersDue(): Promise<CustomerDue[]> {
    const remote = await rtdbFetch<Record<string, CustomerDue> | CustomerDue[]>('customers_due');
    if (remote) {
      const list: CustomerDue[] = Array.isArray(remote)
        ? remote.filter(Boolean)
        : Object.values(remote);
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS_DUE, JSON.stringify(list));
      return list;
    }
    const cached = localStorage.getItem(STORAGE_KEYS.CUSTOMERS_DUE);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    await this.saveCustomersDue(INITIAL_CUSTOMERS_DUE);
    return INITIAL_CUSTOMERS_DUE;
  },

  async saveCustomersDue(list: CustomerDue[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS_DUE, JSON.stringify(list));
    const map: Record<string, CustomerDue> = {};
    list.forEach((c) => {
      map[c.id] = c;
    });
    await rtdbFetch('customers_due', {
      method: 'PUT',
      body: JSON.stringify(map),
    });
  },

  async recordCustomerDueFromOrder(order: Order): Promise<void> {
    const dues = await this.getCustomersDue();
    const existing = dues.find((c) => c.phone === order.phone);
    const today = new Date().toISOString().split('T')[0];

    const newRecord = {
      id: `due-rec-${Date.now()}`,
      date: today,
      type: 'sale_due' as const,
      amount: order.dueAmount,
      memoNo: order.memoNo,
      note: `অর্ডার ক্রয় (${order.items.map((i) => i.productName).join(', ')})`,
    };

    if (existing) {
      const updatedDue: CustomerDue = {
        ...existing,
        customerName: order.customerName || existing.customerName,
        village: order.villageAddress || existing.village,
        moholla: existing.moholla || 'চরপাড়া',
        totalDue: existing.totalDue + order.dueAmount,
        lifetimePurchases: (existing.lifetimePurchases || 0) + order.totalAmount,
        history: [newRecord, ...(existing.history || [])],
      };
      const updatedList = dues.map((c) => (c.id === existing.id ? updatedDue : c));
      await this.saveCustomersDue(updatedList);
    } else {
      const newCustomerDue: CustomerDue = {
        id: `cust-${Date.now()}`,
        customerName: order.customerName,
        phone: order.phone,
        village: order.villageAddress,
        moholla: 'চরপাড়া',
        totalDue: order.dueAmount,
        lifetimePurchases: order.totalAmount,
        lastPaymentDate: '',
        history: [newRecord],
      };
      await this.saveCustomersDue([newCustomerDue, ...dues]);
    }
  },

  async recordDuePayment(customerId: string, amount: number, note?: string): Promise<void> {
    const dues = await this.getCustomersDue();
    const today = new Date().toISOString().split('T')[0];
    const updated = dues.map((c) => {
      if (c.id === customerId) {
        const remaining = Math.max(0, c.totalDue - amount);
        const newRecord = {
          id: `pay-rec-${Date.now()}`,
          date: today,
          type: 'payment_received' as const,
          amount,
          note: note || 'নগদ বাকি পরিশোধ জমা',
        };
        return {
          ...c,
          totalDue: remaining,
          lastPaymentDate: today,
          history: [newRecord, ...(c.history || [])],
        };
      }
      return c;
    });
    await this.saveCustomersDue(updated);
  },

  // --- EXPENSES ---
  async getExpenses(): Promise<ShopExpense[]> {
    const remote = await rtdbFetch<Record<string, ShopExpense> | ShopExpense[]>('expenses');
    if (remote) {
      const list: ShopExpense[] = Array.isArray(remote)
        ? remote.filter(Boolean)
        : Object.values(remote);
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(list));
      return list;
    }
    const cached = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    await this.saveExpenses(INITIAL_EXPENSES);
    return INITIAL_EXPENSES;
  },

  async saveExpenses(list: ShopExpense[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(list));
    const map: Record<string, ShopExpense> = {};
    list.forEach((e) => {
      map[e.id] = e;
    });
    await rtdbFetch('expenses', {
      method: 'PUT',
      body: JSON.stringify(map),
    });
  },

  async addExpense(expense: ShopExpense): Promise<void> {
    const list = await this.getExpenses();
    const updated = [expense, ...list];
    await this.saveExpenses(updated);
  },

  // --- STOCK IN (PURCHASE ENTRY) ---
  async getStockIns(): Promise<StockInRecord[]> {
    const remote = await rtdbFetch<Record<string, StockInRecord> | StockInRecord[]>('stock_ins');
    if (remote) {
      const list: StockInRecord[] = Array.isArray(remote)
        ? remote.filter(Boolean)
        : Object.values(remote);
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      localStorage.setItem(STORAGE_KEYS.STOCK_IN, JSON.stringify(list));
      return list;
    }
    const cached = localStorage.getItem(STORAGE_KEYS.STOCK_IN);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    await this.saveStockIns(INITIAL_STOCK_IN);
    return INITIAL_STOCK_IN;
  },

  async saveStockIns(list: StockInRecord[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.STOCK_IN, JSON.stringify(list));
    const map: Record<string, StockInRecord> = {};
    list.forEach((s) => {
      map[s.id] = s;
    });
    await rtdbFetch('stock_ins', {
      method: 'PUT',
      body: JSON.stringify(map),
    });
  },

  async addStockIn(record: StockInRecord): Promise<void> {
    // 1. Save stock in log
    const list = await this.getStockIns();
    await this.saveStockIns([record, ...list]);

    // 2. Increase stock of the product and update buy price
    const products = await this.getProducts();
    const updatedProducts = products.map((p) => {
      if (p.id === record.productId) {
        return {
          ...p,
          stockKg: p.stockKg + record.quantityKg,
          buyPricePerKg: record.buyPricePerKg > 0 ? record.buyPricePerKg : p.buyPricePerKg,
        };
      }
      return p;
    });
    await this.saveProducts(updatedProducts);
  },

  // --- DAILY CASH RECORDS ---
  async getDailyCashRecords(): Promise<DailyCashRecord[]> {
    const remote = await rtdbFetch<Record<string, DailyCashRecord> | DailyCashRecord[]>('daily_cash');
    if (remote) {
      const list: DailyCashRecord[] = Array.isArray(remote)
        ? remote.filter(Boolean)
        : Object.values(remote);
      localStorage.setItem(STORAGE_KEYS.DAILY_CASH, JSON.stringify(list));
      return list;
    }
    const cached = localStorage.getItem(STORAGE_KEYS.DAILY_CASH);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  },

  async setDailyOpeningCash(date: string, openingCash: number, notes?: string): Promise<void> {
    const records = await this.getDailyCashRecords();
    const existingIdx = records.findIndex((r) => r.date === date);
    let updated: DailyCashRecord[];
    const entry: DailyCashRecord = {
      id: `cash-${date}`,
      date,
      openingCash,
      notes,
    };
    if (existingIdx >= 0) {
      updated = [...records];
      updated[existingIdx] = entry;
    } else {
      updated = [entry, ...records];
    }
    localStorage.setItem(STORAGE_KEYS.DAILY_CASH, JSON.stringify(updated));
    await rtdbFetch(`daily_cash/${entry.id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    });
  },

  // --- SETTINGS ---
  async getSettings(): Promise<ShopSettings> {
    const remote = await rtdbFetch<ShopSettings>('settings');
    if (remote && remote.shopName) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(remote));
      return remote;
    }
    const cached = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    await this.saveSettings(INITIAL_SETTINGS);
    return INITIAL_SETTINGS;
  },

  async saveSettings(settings: ShopSettings): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    await rtdbFetch('settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // --- AUTH SESSION ---
  isAdminLoggedIn(): boolean {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  },

  setAdminLoggedIn(val: boolean): void {
    if (val) {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    }
  },
};

// Bengali Number & Currency Formatter Helper
export function formatTaka(amount: number): string {
  const rounded = Math.round(amount || 0);
  return `৳${rounded.toLocaleString('bn-BD')}`;
}

export function formatNumberBengali(num: number): string {
  return (num || 0).toLocaleString('bn-BD');
}

export function getBengaliDate(isoOrDateString?: string): string {
  if (!isoOrDateString) return '';
  const d = new Date(isoOrDateString);
  if (isNaN(d.getTime())) return isoOrDateString;
  return d.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

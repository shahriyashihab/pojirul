export type ProductUnit = 'কেজি' | 'বস্তা' | 'মণ';

export interface Product {
  id: string;
  name: string;
  category: 'গমের ভুসি' | 'খইল' | 'ফিড' | 'ছোলা ও ডাল' | 'খুদি ও কুঁড়া' | 'ভিটামিন ও খনিজ';
  imageUrl: string;
  buyPricePerKg: number;    // মোকাম থেকে পাইকারি কেনার দর (প্রতি কেজি)
  sellPricePerKg: number;   // খুচরা বিক্রয় দর (প্রতি কেজি)
  bagWeightKg: number;      // ১ বস্তায় কত কেজি (যেমন: ৫০ কেজি)
  bagSellPrice: number;     // ১ বস্তার দর
  stockKg: number;          // দোকানে বর্তমান মজুত (কেজি)
  minStockAlertKg: number;  // সতর্কতামূলক সর্বনিম্ন স্টক
  description: string;      // বিস্তারিত বিবরণ
  nutritionNote?: string;   // গাভী/ষাঁড়/ছাগলের পুষ্টির উপকারিতা
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantityKg: number;
  packageType: 'kg' | 'bag' | 'maund';
  unitPrice: number;
  buyPricePerKg: number;
  total: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash' | 'bkash_nagad' | 'partial' | 'due';
export type DeliveryType = 'home_delivery' | 'pickup';

export interface Order {
  id: string;
  memoNo: string;
  customerName: string;
  phone: string;
  villageAddress: string;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  items: OrderItem[];
  status: OrderStatus;
  source: 'online' | 'pos';
  createdAt: string; // ISO string
  updatedAt: string;
  note?: string;
}

export interface DuePaymentRecord {
  id: string;
  date: string;
  type: 'sale_due' | 'payment_received';
  amount: number;
  memoNo?: string;
  note?: string;
}

export const MOHOLLA_LIST = [
  'চরপাড়া',
  'উত্তর রামপুর',
  'ডেইরি জোন',
  'বাজার পাড়া',
  'দক্ষিণ পাড়া',
  'পশ্চিম পাড়া',
  'অন্যান্য',
] as const;

export type MohollaName = (typeof MOHOLLA_LIST)[number] | string;

export interface CustomerDue {
  id: string;
  customerName: string;
  fatherOrFarmName?: string;
  phone: string;
  village: string;
  moholla: string;
  totalDue: number;
  lifetimePurchases: number;
  lastPaymentDate: string;
  history: DuePaymentRecord[];
}

export type ExpenseCategory = 'rent' | 'transport' | 'labour' | 'electricity' | 'salary' | 'tea_snacks' | 'other';

export interface ShopExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
}

export interface StockInRecord {
  id: string;
  date: string;
  productId: string;
  productName: string;
  quantityKg: number;
  buyPricePerKg: number;
  totalCost: number;
  supplierName?: string;
  invoiceNo?: string;
  note?: string;
}

export interface DailyCashRecord {
  id: string;
  date: string; // YYYY-MM-DD
  openingCash: number;
  notes?: string;
}

export interface ShopSettings {
  shopName: string;
  proprietor: string;
  phone: string;
  secondaryPhone: string;
  address: string;
  bkashNumber: string;
  nagadNumber: string;
  deliveryCharge: number;
  freeDeliveryMinAmount: number;
  adminUsername: string;
  adminPassword: string;
  memoFooterNote: string;
  firebaseUrl: string;
}

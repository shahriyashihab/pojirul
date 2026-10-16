/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Product, Order, OrderItem, CustomerDue, ShopExpense, StockInRecord, DailyCashRecord, ShopSettings } from './types';
import { FirebaseService, formatTaka, formatNumberBengali } from './services/firebaseService';
import { INITIAL_SETTINGS } from './services/initialData';
import { Navbar } from './components/Navbar';
import { CustomerStore } from './components/CustomerStore';
import { CartModal } from './components/CartModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { PrintableMemo } from './components/PrintableMemo';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminLayout } from './components/AdminPanel/AdminLayout';
import { InfinityFreeExportModal } from './components/InfinityFreeExportModal';

export default function App() {
  const [activeView, setActiveView] = useState<'store' | 'admin'>('store');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Core Data Stores
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dues, setDues] = useState<CustomerDue[]>([]);
  const [expenses, setExpenses] = useState<ShopExpense[]>([]);
  const [stockIns, setStockIns] = useState<StockInRecord[]>([]);
  const [dailyCashRecords, setDailyCashRecords] = useState<DailyCashRecord[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(INITIAL_SETTINGS);

  // Cart & Modals
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isInfinityFreeModalOpen, setIsInfinityFreeModalOpen] = useState(false);
  const [activePrintOrder, setActivePrintOrder] = useState<Order | null>(null);

  // Toast / Live Alert State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Data Fetch
  const loadAllData = useCallback(async () => {
    try {
      const [prods, ords, dList, expList, stkList, cashList, sett] = await Promise.all([
        FirebaseService.getProducts(),
        FirebaseService.getOrders(),
        FirebaseService.getCustomersDue(),
        FirebaseService.getExpenses(),
        FirebaseService.getStockIns(),
        FirebaseService.getDailyCashRecords(),
        FirebaseService.getSettings(),
      ]);

      setProducts(prods);
      setOrders(ords);
      setDues(dList);
      setExpenses(expList);
      setStockIns(stkList);
      setDailyCashRecords(cashList);
      setSettings(sett);
    } catch (err) {
      console.warn('Initial data load error:', err);
    }
  }, []);

  useEffect(() => {
    loadAllData();
    setIsAdminLoggedIn(FirebaseService.isAdminLoggedIn());

    // 2. Realtime Background Polling every 5 seconds to listen to live orders from any mobile device
    const interval = setInterval(async () => {
      try {
        const latestOrders = await FirebaseService.getOrders();
        setOrders((prev) => {
          // If a new order arrived from someone else's phone
          if (latestOrders.length > prev.length && prev.length > 0) {
            const newest = latestOrders[0];
            showToast(`🔔 নতুন অর্ডার এসেছে! মেমো নং: ${newest.memoNo} (${formatTaka(newest.totalAmount)})`);
          }
          return latestOrders;
        });

        // Also sync products stock in case of external purchase
        const latestProducts = await FirebaseService.getProducts();
        setProducts(latestProducts);
      } catch (e) {
        // silent fail on intermittent network drop
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [loadAllData]);

  // Cart Operations
  const handleAddToCart = (item: OrderItem) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.productId === item.productId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const existing = updated[existingIdx];
        const newQty = existing.quantityKg + item.quantityKg;
        updated[existingIdx] = {
          ...existing,
          quantityKg: newQty,
          total: Math.round(newQty * existing.unitPrice),
        };
        return updated;
      }
      return [...prev, item];
    });
    showToast(`✅ ${item.productName} কার্টে যোগ হয়েছে!`);
  };

  const handleUpdateCartQuantity = (productId: string, quantityKg: number) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, quantityKg, total: Math.round(quantityKg * i.unitPrice) }
          : i
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Order Submission (Online)
  const handleSubmitOnlineOrder = async (order: Order) => {
    await FirebaseService.createOrder(order);
    // Refresh local stores
    const updatedOrders = await FirebaseService.getOrders();
    const updatedProducts = await FirebaseService.getProducts();
    const updatedDues = await FirebaseService.getCustomersDue();
    setOrders(updatedOrders);
    setProducts(updatedProducts);
    setDues(updatedDues);
  };

  const handleOrderSuccess = (order: Order) => {
    setActivePrintOrder(order);
    showToast(`🎉 আপনার অর্ডারটি সফল হয়েছে! মেমো নং: ${order.memoNo}`);
  };

  // Admin POS Counter Sale
  const handleCreatePOSOrder = async (order: Order) => {
    await FirebaseService.createOrder(order);
    const updatedOrders = await FirebaseService.getOrders();
    const updatedProducts = await FirebaseService.getProducts();
    const updatedDues = await FirebaseService.getCustomersDue();
    setOrders(updatedOrders);
    setProducts(updatedProducts);
    setDues(updatedDues);
    showToast(`✅ কাউন্টার মেমো সম্পন্ন: ${order.memoNo}`);
  };

  // Admin Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    await FirebaseService.updateOrderStatus(orderId, status);
    const updated = await FirebaseService.getOrders();
    setOrders(updated);
    showToast(`অর্ডার স্ট্যাটাস আপডেট হয়েছে: ${status}`);
  };

  // Admin Inventory Operations
  const handleAddStockIn = async (record: StockInRecord) => {
    await FirebaseService.addStockIn(record);
    const updatedStockIns = await FirebaseService.getStockIns();
    const updatedProducts = await FirebaseService.getProducts();
    setStockIns(updatedStockIns);
    setProducts(updatedProducts);
    showToast(`✅ মোকাম চালান স্টক এন্ট্রি সম্পন্ন!`);
  };

  const handleUpdateProduct = async (product: Product) => {
    await FirebaseService.updateProduct(product);
    const updated = await FirebaseService.getProducts();
    setProducts(updated);
    showToast(`পণ্য তথ্য আপডেট হয়েছে!`);
  };

  // Admin Due Ledger Operations
  const handleRecordDuePayment = async (customerId: string, amount: number, note?: string) => {
    await FirebaseService.recordDuePayment(customerId, amount, note);
    const updated = await FirebaseService.getCustomersDue();
    setDues(updated);
    showToast(`✅ বাকি জমা রসিদ এন্ট্রি সম্পন্ন: ${formatTaka(amount)}`);
  };

  const handleAddNewDueCustomer = async (customer: CustomerDue) => {
    const current = await FirebaseService.getCustomersDue();
    await FirebaseService.saveCustomersDue([customer, ...current]);
    const updated = await FirebaseService.getCustomersDue();
    setDues(updated);
    showToast(`নতুন বাকির খাতা তৈরি হয়েছে!`);
  };

  const handleImportDues = async (importedDues: CustomerDue[]) => {
    const current = await FirebaseService.getCustomersDue();
    const merged = [...importedDues, ...current];
    await FirebaseService.saveCustomersDue(merged);
    setDues(merged);
    showToast(`✅ ${formatNumberBengali(importedDues.length)} টি খতিয়ান সফলভাবে ইম্পোর্ট হয়েছে!`);
  };

  // Admin Expense Operations
  const handleAddExpense = async (expense: ShopExpense) => {
    await FirebaseService.addExpense(expense);
    const updated = await FirebaseService.getExpenses();
    setExpenses(updated);
    showToast(`দোকান খরচ এন্ট্রি সম্পন্ন: ${formatTaka(expense.amount)}`);
  };

  // Admin Daily Cash Operations
  const handleSaveOpeningCash = async (date: string, amount: number, notes?: string) => {
    await FirebaseService.setDailyOpeningCash(date, amount, notes);
    const updated = await FirebaseService.getDailyCashRecords();
    setDailyCashRecords(updated);
    showToast(`প্রারম্ভিক ক্যাশ ব্যালেন্স সংরক্ষিত: ${formatTaka(amount)}`);
  };

  // Admin Settings Operations
  const handleSaveSettings = async (newSettings: ShopSettings) => {
    await FirebaseService.saveSettings(newSettings);
    setSettings(newSettings);
    showToast(`দোকানের সেটিংস সংরক্ষিত হয়েছে!`);
  };

  // Admin Auth
  const handleAdminSuccessLogin = () => {
    FirebaseService.setAdminLoggedIn(true);
    setIsAdminLoggedIn(true);
    setActiveView('admin');
    showToast('অ্যাডমিন প্যানেলে স্বাগতম!');
  };

  const handleAdminLogout = () => {
    FirebaseService.setAdminLoggedIn(false);
    setIsAdminLoggedIn(false);
    setActiveView('store');
    showToast('লগআউট সম্পন্ন হয়েছে।');
  };

  const totalCartCount = cartItems.reduce((sum, it) => sum + 1, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-slate-700 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Navigation (Shown in Store View) */}
      {activeView === 'store' && (
        <Navbar
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenTracking={() => setIsTrackingOpen(true)}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          onOpenInfinityFreeGuide={() => setIsInfinityFreeModalOpen(true)}
          isAdminLoggedIn={isAdminLoggedIn}
          onGoToAdmin={() => setActiveView('admin')}
          onGoToStore={() => setActiveView('store')}
          activeView={activeView}
        />
      )}

      {/* Primary Views Switcher */}
      {activeView === 'store' ? (
        <CustomerStore
          products={products}
          onAddToCart={handleAddToCart}
          onOpenCart={() => setIsCartOpen(true)}
          shopPhone={settings.phone}
          shopAddress={settings.address}
        />
      ) : (
        <AdminLayout
          products={products}
          orders={orders}
          dues={dues}
          expenses={expenses}
          stockIns={stockIns}
          dailyCashRecords={dailyCashRecords}
          settings={settings}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onViewMemo={(ord) => setActivePrintOrder(ord)}
          onCreatePOSOrder={handleCreatePOSOrder}
          onAddStockIn={handleAddStockIn}
          onUpdateProduct={handleUpdateProduct}
          onRecordDuePayment={handleRecordDuePayment}
          onAddNewDueCustomer={handleAddNewDueCustomer}
          onImportDues={handleImportDues}
          onAddExpense={handleAddExpense}
          onSaveOpeningCash={handleSaveOpeningCash}
          onSaveSettings={handleSaveSettings}
          onLogout={handleAdminLogout}
          onGoToStore={() => setActiveView('store')}
        />
      )}

      {/* Modals */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        settings={settings}
        onSubmitOrder={handleSubmitOnlineOrder}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        orders={orders}
        onViewMemo={(ord) => setActivePrintOrder(ord)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        settings={settings}
        onSuccessLogin={handleAdminSuccessLogin}
      />

      <PrintableMemo
        order={activePrintOrder}
        settings={settings}
        onClose={() => setActivePrintOrder(null)}
      />

      <InfinityFreeExportModal
        isOpen={isInfinityFreeModalOpen}
        onClose={() => setIsInfinityFreeModalOpen(false)}
      />
    </div>
  );
}

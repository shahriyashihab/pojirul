import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  FileSpreadsheet,
  Boxes,
  BookOpen,
  Wallet,
  Settings,
  LogOut,
  Store,
  Menu,
  X,
  Radio
} from 'lucide-react';
import { Product, Order, CustomerDue, ShopExpense, StockInRecord, DailyCashRecord, ShopSettings } from '../../types';
import { AdminDashboard } from './AdminDashboard';
import { AdminFinancials } from './AdminFinancials';
import { AdminDailyCashbook } from './AdminDailyCashbook';
import { AdminOrders } from './AdminOrders';
import { AdminPOS } from './AdminPOS';
import { AdminInventory } from './AdminInventory';
import { AdminDueLedger } from './AdminDueLedger';
import { AdminExpenses } from './AdminExpenses';
import { AdminSettings } from './AdminSettings';
import { formatNumberBengali } from '../../services/firebaseService';

interface AdminLayoutProps {
  products: Product[];
  orders: Order[];
  dues: CustomerDue[];
  expenses: ShopExpense[];
  stockIns: StockInRecord[];
  dailyCashRecords: DailyCashRecord[];
  settings: ShopSettings;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  onViewMemo: (order: Order) => void;
  onCreatePOSOrder: (order: Order) => Promise<void>;
  onAddStockIn: (record: StockInRecord) => Promise<void>;
  onUpdateProduct: (product: Product) => Promise<void>;
  onRecordDuePayment: (customerId: string, amount: number, note?: string) => Promise<void>;
  onAddNewDueCustomer: (customer: CustomerDue) => Promise<void>;
  onImportDues?: (importedDues: CustomerDue[]) => Promise<void>;
  onAddExpense: (expense: ShopExpense) => Promise<void>;
  onSaveOpeningCash: (date: string, amount: number, notes?: string) => Promise<void>;
  onSaveSettings: (settings: ShopSettings) => Promise<void>;
  onLogout: () => void;
  onGoToStore: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  products,
  orders,
  dues,
  expenses,
  stockIns,
  dailyCashRecords,
  settings,
  onUpdateOrderStatus,
  onViewMemo,
  onCreatePOSOrder,
  onAddStockIn,
  onUpdateProduct,
  onRecordDuePayment,
  onAddNewDueCustomer,
  onImportDues,
  onAddExpense,
  onSaveOpeningCash,
  onSaveSettings,
  onLogout,
  onGoToStore,
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const lowStockCount = products.filter((p) => p.stockKg <= p.minStockAlertKg).length;

  const navItems = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'orders', label: 'লাইভ অর্ডার', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'pos', label: 'কাউন্টার মেমো (POS)', icon: ShoppingCart },
    { id: 'financials', label: 'বাৎসরিক লাভ-ক্ষতি অডিট', icon: TrendingUp },
    { id: 'cashbook', label: 'দৈনিক রোকার খাতা', icon: FileSpreadsheet },
    { id: 'inventory', label: 'পণ্য ও স্টক হিসাব', icon: Boxes, badge: lowStockCount, badgeColor: 'bg-amber-500' },
    { id: 'dues', label: 'বাকির খাতা (লেজার)', icon: BookOpen },
    { id: 'expenses', label: 'দোকান খরচের খাতা', icon: Wallet },
    { id: 'settings', label: 'দোকানের সেটিংস', icon: Settings },
  ];

  const handleExportBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      settings,
      products,
      orders,
      dues,
      expenses,
      stockIns,
      dailyCashRecords,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bhai-bhai-store-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="font-bold text-sm truncate">{settings.shopName}</div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 text-slate-300 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-30 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Shop Brand Header */}
          <div className="p-5 border-b border-slate-800">
            <h2 className="text-base font-bold text-white tracking-tight leading-snug">
              {settings.shopName}
            </h2>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>এডমিন একাউন্টিং কন্ট্রোল</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full text-white tabular-nums ${
                        item.badgeColor || 'bg-amber-600'
                      }`}
                    >
                      {formatNumberBengali(item.badge)}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <button
            onClick={onGoToStore}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span>দোকান ওয়েবসাইটে যান</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট করুন</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Desktop Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span>অ্যাডমিন প্যানেল</span>
            <span>/</span>
            <span className="font-bold text-slate-900">
              {navItems.find((n) => n.id === activeTab)?.label}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Live RTDB Status */}
            <div className="hidden sm:flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Firebase RTDB লাইভ সিঙ্ক</span>
            </div>

            <button
              onClick={onGoToStore}
              className="text-xs font-semibold text-emerald-800 hover:underline cursor-pointer"
            >
              ক্রেতার ভিউ দেখুন →
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <AdminDashboard
              products={products}
              orders={orders}
              dues={dues}
              expenses={expenses}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onViewMemo={onViewMemo}
              onUpdateOrderStatus={onUpdateOrderStatus}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrders
              orders={orders}
              onUpdateStatus={onUpdateOrderStatus}
              onViewMemo={onViewMemo}
            />
          )}

          {activeTab === 'pos' && (
            <AdminPOS
              products={products}
              dues={dues}
              onCreatePOSOrder={onCreatePOSOrder}
              onViewMemo={onViewMemo}
            />
          )}

          {activeTab === 'financials' && (
            <AdminFinancials
              products={products}
              orders={orders}
              expenses={expenses}
              stockIns={stockIns}
              dues={dues}
            />
          )}

          {activeTab === 'cashbook' && (
            <AdminDailyCashbook
              orders={orders}
              expenses={expenses}
              dues={dues}
              stockIns={stockIns}
              dailyCashRecords={dailyCashRecords}
              onSaveOpeningCash={onSaveOpeningCash}
            />
          )}

          {activeTab === 'inventory' && (
            <AdminInventory
              products={products}
              stockIns={stockIns}
              onAddStockIn={onAddStockIn}
              onUpdateProduct={onUpdateProduct}
            />
          )}

          {activeTab === 'dues' && (
            <AdminDueLedger
              dues={dues}
              onRecordDuePayment={onRecordDuePayment}
              onAddNewDueCustomer={onAddNewDueCustomer}
              onImportDues={onImportDues}
            />
          )}

          {activeTab === 'expenses' && (
            <AdminExpenses
              expenses={expenses}
              onAddExpense={onAddExpense}
            />
          )}

          {activeTab === 'settings' && (
            <AdminSettings
              settings={settings}
              onSaveSettings={onSaveSettings}
              onExportBackup={handleExportBackup}
            />
          )}
        </div>
      </main>
    </div>
  );
};

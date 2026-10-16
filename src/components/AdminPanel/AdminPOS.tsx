import React, { useState } from 'react';
import { Product, OrderItem, Order, PaymentMethod, CustomerDue, MOHOLLA_LIST } from '../../types';
import { formatTaka, formatNumberBengali } from '../../services/firebaseService';
import { ShoppingCart, Plus, Trash2, Printer, CheckCircle2, User, Phone, MapPin, Search } from 'lucide-react';

interface AdminPOSProps {
  products: Product[];
  dues?: CustomerDue[];
  onCreatePOSOrder: (order: Order) => Promise<void>;
  onViewMemo: (order: Order) => void;
}

export const AdminPOS: React.FC<AdminPOSProps> = ({ products, dues = [], onCreatePOSOrder, onViewMemo }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantityKg, setQuantityKg] = useState<number>(50);
  const [customPricePerKg, setCustomPricePerKg] = useState<number>(products[0]?.sellPricePerKg || 40);

  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walk_in');
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [moholla, setMoholla] = useState<string>('চরপাড়া');
  const [villageAddress, setVillageAddress] = useState<string>('দোকান সরাসরি বিক্রয়');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [posSuccessNote, setPosSuccessNote] = useState<string | null>(null);

  const currentProduct = products.find((p) => p.id === selectedProductId);

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setCustomPricePerKg(prod.sellPricePerKg);
      setQuantityKg(prod.bagWeightKg || 50);
    }
  };

  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    if (id === 'walk_in') {
      setCustomerName('');
      setPhone('');
      setMoholla('চরপাড়া');
      setVillageAddress('দোকান সরাসরি বিক্রয়');
      return;
    }
    const cust = dues.find((c) => c.id === id);
    if (cust) {
      setCustomerName(cust.customerName);
      setPhone(cust.phone);
      setMoholla(cust.moholla || 'চরপাড়া');
      setVillageAddress(cust.village || cust.moholla || 'দোকান সরাসরি বিক্রয়');
    }
  };

  const handleAddItem = () => {
    if (!currentProduct) return;
    if (quantityKg <= 0) {
      setErrorMsg('কেজির পরিমাণ ০ এর চেয়ে বেশি হতে হবে।');
      return;
    }

    if (quantityKg > currentProduct.stockKg) {
      setErrorMsg(`সতর্কতা: গুদামে বর্তমানে মাত্র ${formatNumberBengali(currentProduct.stockKg)} কেজি আছে!`);
    }

    const total = Math.round(quantityKg * customPricePerKg);
    const newItem: OrderItem = {
      productId: currentProduct.id,
      productName: currentProduct.name,
      quantityKg,
      packageType: 'kg',
      unitPrice: customPricePerKg,
      buyPricePerKg: currentProduct.buyPricePerKg,
      total,
    };

    const newItems = [...items, newItem];
    setItems(newItems);
    const newTotal = newItems.reduce((sum, it) => sum + it.total, 0);
    setPaidAmount(newTotal); // default to full cash paid
    setErrorMsg('');
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
    const newTotal = updated.reduce((sum, it) => sum + it.total, 0);
    setPaidAmount(newTotal);
  };

  const subtotal = items.reduce((sum, it) => sum + it.total, 0);
  const dueAmount = Math.max(0, subtotal - paidAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg('কমপক্ষে একটি পণ্য তালিকায় যোগ করুন।');
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('ক্রেতা বা খামারির নাম লিখুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const memoNo = `POS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      let method: PaymentMethod = 'cash';
      if (dueAmount > 0 && paidAmount > 0) method = 'partial';
      else if (dueAmount > 0 && paidAmount === 0) method = 'due';

      const order: Order = {
        id: `pos-${Date.now()}`,
        memoNo,
        customerName: customerName.trim(),
        phone: phone.trim() || '০১৭১০-০০০০০০',
        villageAddress: `${moholla}, ${villageAddress.trim()}`,
        deliveryType: 'pickup',
        paymentMethod: method,
        totalAmount: subtotal,
        paidAmount: Math.min(subtotal, paidAmount),
        dueAmount,
        items,
        status: 'delivered',
        source: 'pos',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      await onCreatePOSOrder(order);

      const totalKgSold = items.reduce((s, i) => s + i.quantityKg, 0);
      setPosSuccessNote(
        `✅ মেমো ${memoNo} সফল! গুদাম ও ওয়েবসাইট থেকে মোট ${formatNumberBengali(totalKgSold)} কেজি মাল স্বয়ংক্রিয়ভাবে মাইনাস হয়ে গেছে!`
      );
      setTimeout(() => setPosSuccessNote(null), 5000);

      // Reset form
      setItems([]);
      setSelectedCustomerId('walk_in');
      setCustomerName('');
      setPhone('');
      setVillageAddress('দোকান সরাসরি বিক্রয়');
      setPaidAmount(0);

      // Open printable memo
      onViewMemo(order);
    } catch (err) {
      console.error(err);
      setErrorMsg('মেমো তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedExistingCustomer = dues.find((c) => c.id === selectedCustomerId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-700" />
            <span>কাউন্টার ক্যাশ সেল ও মেমো তৈরি (POS Counter)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            দোকানে আসা খামারিকে হ্যান্ড ক্যাশে বিক্রয় — বিক্রি হওয়ামাত্রই ওয়েবসাইট থেকে মাল মাইনাস হয়ে যাবে
          </p>
        </div>
      </div>

      {posSuccessNote && (
        <div className="p-3.5 bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg animate-pulse">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{posSuccessNote}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
          {errorMsg}
        </div>
      )}

      {/* Main POS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product Selector (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2">
            পণ্য নির্বাচন ও বিক্রির পরিমাণ
          </h4>

          {/* Product Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">পণ্য সিলেক্ট করুন:</label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-emerald-500 text-slate-900"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (মজুত: {formatNumberBengali(p.stockKg)} কেজি)
                </option>
              ))}
            </select>
          </div>

          {currentProduct && (
            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>বর্তমান দোকানে মজুত:</span>
                <strong className="text-emerald-800 text-sm tabular-nums">
                  {formatNumberBengali(currentProduct.stockKg)} কেজি ({(currentProduct.stockKg / currentProduct.bagWeightKg).toFixed(1)} বস্তা)
                </strong>
              </div>
              <div className="flex justify-between">
                <span>১ বস্তার ওজন:</span>
                <span>{formatNumberBengali(currentProduct.bagWeightKg)} কেজি</span>
              </div>
              <div className="flex justify-between">
                <span>মোকামের পাইকারি কেনা দর:</span>
                <span>{formatTaka(currentProduct.buyPricePerKg)}/কেজি</span>
              </div>
            </div>
          )}

          {/* Quantity & Custom Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">বিক্রির পরিমাণ (কেজি):</label>
              <input
                type="number"
                min={1}
                value={quantityKg}
                onChange={(e) => setQuantityKg(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">বিক্রয় দর (প্রতি কেজি ৳):</label>
              <input
                type="number"
                min={1}
                value={customPricePerKg}
                onChange={(e) => setCustomPricePerKg(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold tabular-nums text-emerald-800"
              />
            </div>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500">শর্টকাট:</span>
            <button
              type="button"
              onClick={() => currentProduct && setQuantityKg(currentProduct.bagWeightKg)}
              className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
            >
              ১ বস্তা ({currentProduct ? formatNumberBengali(currentProduct.bagWeightKg) : 50}kg)
            </button>
            <button
              type="button"
              onClick={() => setQuantityKg(40)}
              className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
            >
              ১ মণ (৪০kg)
            </button>
            <button
              type="button"
              onClick={() => setQuantityKg(10)}
              className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
            >
              ১০ কেজি
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>মেমোতে পণ্য যোগ করুন</span>
          </button>
        </div>

        {/* Right: Memo Preview & Customer Details (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 border-b border-slate-100 pb-2 mb-3">
                মেমোর আইটেম তালিকা
              </h4>

              {items.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg">
                  বাম পাশ থেকে পণ্য নির্বাচন করে "মেমোতে পণ্য যোগ করুন" চাপুন।
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 mb-4">
                  {items.map((it, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-800">{it.productName}</strong>
                        <div className="text-[11px] text-slate-500">
                          {formatNumberBengali(it.quantityKg)} কেজি × {formatTaka(it.unitPrice)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold tabular-nums text-slate-900">{formatTaka(it.total)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Customer Selection from Mohollas */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">খামারি নির্বাচন / তথ্য:</label>
                  {selectedExistingCustomer && (
                    <span className="text-xs text-rose-700 font-bold tabular-nums">
                      পূর্বের বাকি আছে: {formatTaka(selectedExistingCustomer.totalDue)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      তালিকা থেকে খামারি বেছে নিন:
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => handleCustomerSelect(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="walk_in">দোকানের সরাসরি সাধারণ ক্রেতা (+ নতুন)</option>
                      {dues.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.customerName} ({c.moholla}) — বাকি {formatTaka(c.totalDue)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">মহল্লা / গ্রাম *</label>
                    <select
                      value={moholla}
                      onChange={(e) => setMoholla(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    >
                      {MOHOLLA_LIST.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">ক্রেতার নাম *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="যেমন: হাজী সামসুল আলম"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">মোবাইল নম্বর</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="০১৭১২-..."
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Money Calculation & Save Memo Button */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 mt-4">
              <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                <span>সর্বমোট বিল:</span>
                <span className="text-xl text-emerald-800 tabular-nums">{formatTaka(subtotal)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">হ্যান্ড ক্যাশ প্রদান (নগদ জমা):</label>
                  <input
                    type="number"
                    min={0}
                    max={subtotal}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold tabular-nums text-slate-900 bg-white"
                  />
                  <span className="text-[10px] text-emerald-700 font-medium">আজকের ক্যাশ ড্রয়ারে যুক্ত হবে</span>
                </div>

                <div>
                  <label className="block font-semibold text-rose-700 mb-1">অবশিষ্ট বকেয়া (বাকি খাতা):</label>
                  <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg font-bold tabular-nums text-rose-700 text-sm">
                    {formatTaka(dueAmount)}
                  </div>
                  <span className="text-[10px] text-rose-600 font-medium">{moholla}-এর বাকির খাতায় যুক্ত হবে</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>মাল মাইনাস ও মেমো তৈরি হচ্ছে...</span>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span>হ্যান্ড ক্যাশে বিক্রি কনফার্ম ও মেমো প্রিন্ট</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

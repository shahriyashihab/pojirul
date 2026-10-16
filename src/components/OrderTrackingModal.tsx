import React, { useState } from 'react';
import { Order } from '../types';
import { formatTaka, formatNumberBengali, getBengaliDate } from '../services/firebaseService';
import { X, Search, PackageCheck, Clock, CheckCircle, Truck, AlertCircle, FileText } from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onViewMemo: (order: Order) => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  orders,
  onViewMemo,
}) => {
  const [searchPhone, setSearchPhone] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const cleanInputPhone = searchPhone.replace(/\D/g, '');
  const matchedOrders = orders.filter((o) => {
    const cleanOrderPhone = o.phone.replace(/\D/g, '');
    return cleanOrderPhone.includes(cleanInputPhone) || o.memoNo.toLowerCase().includes(searchPhone.toLowerCase());
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { label: 'পেন্ডিং (অপেক্ষমাণ)', color: 'bg-amber-100 text-amber-800' };
      case 'confirmed':
        return { label: 'কনফার্ম হয়েছে', color: 'bg-blue-100 text-blue-800' };
      case 'processing':
        return { label: 'প্যাকিং ও প্রস্তুত হচ্ছে', color: 'bg-indigo-100 text-indigo-800' };
      case 'out_for_delivery':
        return { label: 'ডেলিভারির জন্য বের হয়েছে', color: 'bg-purple-100 text-purple-800' };
      case 'delivered':
        return { label: 'ডেলিভারি সম্পন্ন', color: 'bg-emerald-100 text-emerald-800' };
      case 'cancelled':
        return { label: 'বাতিল করা হয়েছে', color: 'bg-rose-100 text-rose-800' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-800' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">অর্ডার ট্র্যাকিং ও মেমো অনুসন্ধান</h2>
            <p className="text-xs text-slate-500">আপনার মোবাইল নম্বর বা মেমো নং দিয়ে অর্ডারের অবস্থা দেখুন</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Search Box */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchPhone}
                onChange={(e) => {
                  setSearchPhone(e.target.value);
                  setHasSearched(true);
                }}
                placeholder="মোবাইল নম্বর (যেমন: ০১৭১২...) অথবা মেমো নং"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Results */}
          {!hasSearched ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              উপরের বক্সে আপনার মোবাইল নম্বর টাইপ করুন।
            </div>
          ) : matchedOrders.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
              এই নম্বরে কোনো অর্ডার পাওয়া যায়নি। নম্বরটি সঠিকভাবে লিখুন অথবা দোকানে সরাসরি ফোন করুন।
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-600">
                পাওয়া গেছে: {formatNumberBengali(matchedOrders.length)} টি অর্ডার
              </div>

              {matchedOrders.map((ord) => {
                const badge = getStatusBadge(ord.status);
                return (
                  <div
                    key={ord.id}
                    className="p-4 border border-slate-200 rounded-xl bg-white shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-900">{ord.memoNo}</span>
                        <div className="text-[11px] text-slate-500">{getBengaliDate(ord.createdAt)}</div>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      <div>
                        <strong>পণ্য:</strong> {ord.items.map((i) => `${i.productName} (${formatNumberBengali(i.quantityKg)}kg)`).join(', ')}
                      </div>
                      <div className="flex justify-between pt-1">
                        <span>সর্বমোট: <strong>{formatTaka(ord.totalAmount)}</strong></span>
                        {ord.dueAmount > 0 ? (
                          <span className="text-rose-600 font-semibold">বাকি: {formatTaka(ord.dueAmount)}</span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">পরিশোধিত</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => onViewMemo(ord)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-700" />
                        <span>ক্যাশ মেমো দেখুন</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

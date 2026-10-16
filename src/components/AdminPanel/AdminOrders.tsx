import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { formatTaka, formatNumberBengali, getBengaliDate } from '../../services/firebaseService';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Truck,
  Package,
  XCircle,
  FileText,
  Phone,
  MessageCircle,
  ArrowRight
} from 'lucide-react';

interface AdminOrdersProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onViewMemo: (order: Order) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, onUpdateStatus, onViewMemo }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | 'online' | 'pos'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const statuses: { id: string; label: string }[] = [
    { id: 'all', label: 'সকল স্ট্যাটাস' },
    { id: 'pending', label: 'পেন্ডিং' },
    { id: 'confirmed', label: 'কনফার্ম' },
    { id: 'processing', label: 'প্যাকিং হচ্ছে' },
    { id: 'out_for_delivery', label: 'ডেলিভারিতে বের হয়েছে' },
    { id: 'delivered', label: 'সম্পন্ন' },
    { id: 'cancelled', label: 'বাতিল' },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchChannel = channelFilter === 'all' || o.source === channelFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      o.memoNo.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.villageAddress.toLowerCase().includes(q);
    return matchStatus && matchChannel && matchSearch;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await onUpdateStatus(orderId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'পেন্ডিং', color: 'bg-amber-100 text-amber-800' };
      case 'confirmed':
        return { label: 'কনফার্ম', color: 'bg-blue-100 text-blue-800' };
      case 'processing':
        return { label: 'প্যাকিং', color: 'bg-indigo-100 text-indigo-800' };
      case 'out_for_delivery':
        return { label: 'ডেলিভারিতে', color: 'bg-purple-100 text-purple-800' };
      case 'delivered':
        return { label: 'সম্পন্ন', color: 'bg-emerald-100 text-emerald-800' };
      case 'cancelled':
        return { label: 'বাতিল', color: 'bg-rose-100 text-rose-800' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-800' };
    }
  };

  const sendWhatsApp = (order: Order) => {
    const cleanPhone = order.phone.replace(/\D/g, '');
    const intlPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const text = `আসসালামু আলাইকুম ${order.customerName},\nমেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার থেকে আপনার মেমো নং ${order.memoNo} এর অর্ডারটি গ্রহণ করা হয়েছে।\nমোট বিল: ${formatTaka(order.totalAmount)}, জমা: ${formatTaka(order.paidAmount)}, বাকি: ${formatTaka(order.dueAmount)}।\nধন্যবাদ!`;
    const url = `https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <span>লাইভ অর্ডার ব্যবস্থাপনা (Live Order Control)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            অনলাইন ও কাউন্টার অর্ডারের লাইভ স্ট্যাটাস আপডেট, মেমো প্রিন্ট ও ক্রেতার সাথে যোগাযোগ
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="মেমো নং, নাম বা ফোন নম্বর..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Channel Source Selector (Online vs Store POS) */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/70 rounded-xl w-fit text-xs font-semibold">
        <button
          onClick={() => setChannelFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            channelFilter === 'all'
              ? 'bg-white text-slate-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          সকল অর্ডার ({formatNumberBengali(orders.length)})
        </button>
        <button
          onClick={() => setChannelFilter('online')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            channelFilter === 'online'
              ? 'bg-white text-blue-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-blue-900'
          }`}
        >
          🌐 শুধু অনলাইন অর্ডার ({formatNumberBengali(orders.filter((o) => o.source === 'online').length)})
        </button>
        <button
          onClick={() => setChannelFilter('pos')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            channelFilter === 'pos'
              ? 'bg-white text-emerald-900 shadow-xs font-bold'
              : 'text-slate-600 hover:text-emerald-900'
          }`}
        >
          🏪 দোকানের সরাসরি মেমো ({formatNumberBengali(orders.filter((o) => o.source === 'pos').length)})
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {statuses.map((s) => {
          const count =
            s.id === 'all'
              ? orders.length
              : orders.filter((o) => o.status === s.id).length;
          return (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === s.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{s.label}</span>
              <span className="text-[10px] bg-slate-200/50 px-1.5 py-0.2 rounded-full tabular-nums">
                {formatNumberBengali(count)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl text-slate-500 text-xs">
          কোনো অর্ডার পাওয়া যায়নি।
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((ord) => {
            const badge = getStatusBadge(ord.status);
            const isUpdating = updatingId === ord.id;

            return (
              <div
                key={ord.id}
                className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-colors space-y-4"
              >
                {/* Order Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-bold text-slate-900">{ord.memoNo}</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {ord.source === 'pos' ? 'দোকান কাউন্টার' : 'অনলাইন অর্ডার'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{getBengaliDate(ord.createdAt)}</span>
                  </div>
                </div>

                {/* Customer & Items Split */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Col 1: Customer Details */}
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-sm">{ord.customerName}</div>
                    <div className="text-slate-600 font-mono flex items-center gap-1">
                      <span>ফোন: {ord.phone}</span>
                    </div>
                    <div className="text-slate-500">ঠিকানা: {ord.villageAddress}</div>
                    {ord.note && (
                      <div className="text-slate-700 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                        "{ord.note}"
                      </div>
                    )}
                  </div>

                  {/* Col 2: Ordered Items */}
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-700">অর্ডারের পণ্যসমূহ:</div>
                    <ul className="space-y-1">
                      {ord.items.map((it, idx) => (
                        <li key={idx} className="flex justify-between text-slate-700">
                          <span>
                            • {it.productName} ({formatNumberBengali(it.quantityKg)} কেজি)
                          </span>
                          <span className="font-medium tabular-nums">{formatTaka(it.total)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Col 3: Money & Payment */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>সর্বমোট বিল:</span>
                      <span className="tabular-nums text-emerald-800">{formatTaka(ord.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>নগদ জমা:</span>
                      <span className="tabular-nums font-semibold">{formatTaka(ord.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between text-rose-600 font-bold border-t border-slate-200 pt-1">
                      <span>বাকি:</span>
                      <span className="tabular-nums">{formatTaka(ord.dueAmount)}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 pt-1">
                      মাধ্যম: {ord.paymentMethod === 'cash' ? 'নগদ' : ord.paymentMethod === 'bkash_nagad' ? 'বিকাশ/নগদ' : ord.paymentMethod === 'partial' ? 'আংশিক বাকি' : 'সম্পূর্ণ বাকি'}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  {/* Status Changers */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-slate-500 mr-1 font-medium">স্ট্যাটাস পরিবর্তন:</span>

                    {ord.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(ord.id, 'confirmed')}
                        disabled={isUpdating}
                        className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors cursor-pointer"
                      >
                        কনফার্ম করুন
                      </button>
                    )}

                    {ord.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusChange(ord.id, 'processing')}
                        disabled={isUpdating}
                        className="px-2.5 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors cursor-pointer"
                      >
                        প্যাকিং হচ্ছে
                      </button>
                    )}

                    {ord.status === 'processing' && (
                      <button
                        onClick={() => handleStatusChange(ord.id, 'out_for_delivery')}
                        disabled={isUpdating}
                        className="px-2.5 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors cursor-pointer"
                      >
                        ডেলিভারিতে বের হলো
                      </button>
                    )}

                    {ord.status === 'out_for_delivery' && (
                      <button
                        onClick={() => handleStatusChange(ord.id, 'delivered')}
                        disabled={isUpdating}
                        className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors cursor-pointer"
                      >
                        ডেলিভারি সম্পন্ন
                      </button>
                    )}

                    {ord.status !== 'cancelled' && ord.status !== 'delivered' && (
                      <button
                        onClick={() => handleStatusChange(ord.id, 'cancelled')}
                        disabled={isUpdating}
                        className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      >
                        বাতিল
                      </button>
                    )}
                  </div>

                  {/* Customer Communication & Memo */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${ord.phone}`}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      title="কল করুন"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      <span>কল</span>
                    </a>

                    <button
                      onClick={() => sendWhatsApp(ord)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors cursor-pointer"
                      title="হোয়াটসঅ্যাপে মেসেজ পাঠান"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => onViewMemo(ord)}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>মেমো প্রিন্ট</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

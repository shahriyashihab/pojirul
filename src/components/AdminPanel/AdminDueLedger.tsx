import React, { useState } from 'react';
import { CustomerDue, MOHOLLA_LIST, MohollaName } from '../../types';
import { formatTaka, formatNumberBengali, getBengaliDate } from '../../services/firebaseService';
import {
  BookOpen,
  Search,
  PlusCircle,
  Phone,
  MessageCircle,
  CheckCircle2,
  Calendar,
  X,
  History,
  ArrowUpDown,
  Download,
  Upload,
  MapPin,
  Building,
  User,
  Filter,
  FileSpreadsheet
} from 'lucide-react';

interface AdminDueLedgerProps {
  dues: CustomerDue[];
  onRecordDuePayment: (customerId: string, amount: number, note?: string) => Promise<void>;
  onAddNewDueCustomer: (customer: CustomerDue) => Promise<void>;
  onImportDues?: (importedDues: CustomerDue[]) => Promise<void>;
}

type SortOption = 'highest_due' | 'lowest_due' | 'name_asc' | 'date_recent' | 'lifetime_purchase';

export const AdminDueLedger: React.FC<AdminDueLedgerProps> = ({
  dues,
  onRecordDuePayment,
  onAddNewDueCustomer,
  onImportDues,
}) => {
  const [selectedMoholla, setSelectedMoholla] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('highest_due');

  const [paymentModalCustomer, setPaymentModalCustomer] = useState<CustomerDue | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(1000);
  const [paymentNote, setPaymentNote] = useState<string>('নগদ পরিশোধ');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  const [historyCustomer, setHistoryCustomer] = useState<CustomerDue | null>(null);

  // New Customer Modal
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustFatherFarm, setNewCustFatherFarm] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustMoholla, setNewCustMoholla] = useState<string>('চরপাড়া');
  const [newCustVillage, setNewCustVillage] = useState('');
  const [newCustOpeningDue, setNewCustOpeningDue] = useState<number>(0);
  const [newCustLifetime, setNewCustLifetime] = useState<number>(0);

  // Success toast inside due ledger
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // 1. Calculate Moholla-wise Dues Summary
  const mohollaStats: Record<string, { totalDue: number; customerCount: number }> = {};
  MOHOLLA_LIST.forEach((m) => {
    mohollaStats[m] = { totalDue: 0, customerCount: 0 };
  });

  dues.forEach((d) => {
    const moholla = d.moholla || 'অন্যান্য';
    if (!mohollaStats[moholla]) {
      mohollaStats[moholla] = { totalDue: 0, customerCount: 0 };
    }
    mohollaStats[moholla].totalDue += d.totalDue;
    if (d.totalDue > 0) {
      mohollaStats[moholla].customerCount += 1;
    }
  });

  const totalMarketDue = dues.reduce((sum, d) => sum + d.totalDue, 0);

  // 2. Filter by Moholla & Search
  let processedList = dues.filter((d) => {
    const matchMoholla = selectedMoholla === 'all' || (d.moholla || 'অন্যান্য') === selectedMoholla;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchMoholla;

    const matchSearch =
      d.customerName.toLowerCase().includes(q) ||
      (d.fatherOrFarmName && d.fatherOrFarmName.toLowerCase().includes(q)) ||
      d.phone.includes(q) ||
      d.village.toLowerCase().includes(q) ||
      (d.moholla && d.moholla.toLowerCase().includes(q));

    return matchMoholla && matchSearch;
  });

  // 3. Multi-Sorting Logic
  processedList.sort((a, b) => {
    if (sortOption === 'highest_due') {
      return b.totalDue - a.totalDue;
    }
    if (sortOption === 'lowest_due') {
      return a.totalDue - b.totalDue;
    }
    if (sortOption === 'name_asc') {
      return a.customerName.localeCompare(b.customerName, 'bn');
    }
    if (sortOption === 'lifetime_purchase') {
      return (b.lifetimePurchases || 0) - (a.lifetimePurchases || 0);
    }
    if (sortOption === 'date_recent') {
      const dateA = a.lastPaymentDate || '2000-01-01';
      const dateB = b.lastPaymentDate || '2000-01-01';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    }
    return 0;
  });

  // 4. Handle Due Payment Submit
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalCustomer || paymentAmount <= 0) return;

    setIsSubmittingPay(true);
    try {
      await onRecordDuePayment(paymentModalCustomer.id, paymentAmount, paymentNote);
      triggerToast(
        `✅ ${paymentModalCustomer.customerName}-এর মূল ব্যালেন্স থেকে ${formatTaka(paymentAmount)} মাইনাস করা হয়েছে!`
      );
      setPaymentModalCustomer(null);
      setPaymentAmount(0);
      setPaymentNote('নগদ পরিশোধ');
    } finally {
      setIsSubmittingPay(false);
    }
  };

  // 5. Handle New Customer
  const handleNewCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const newCustomer: CustomerDue = {
      id: `cust-${Date.now()}`,
      customerName: newCustName.trim(),
      fatherOrFarmName: newCustFatherFarm.trim(),
      phone: newCustPhone.trim() || '০১৭১০-০০০০০০',
      village: newCustVillage.trim() || newCustMoholla,
      moholla: newCustMoholla,
      totalDue: newCustOpeningDue,
      lifetimePurchases: newCustLifetime || newCustOpeningDue,
      lastPaymentDate: '',
      history:
        newCustOpeningDue > 0
          ? [
              {
                id: `rec-${Date.now()}`,
                date: today,
                type: 'sale_due',
                amount: newCustOpeningDue,
                note: 'প্রারম্ভিক বকেয়া বাকি',
              },
            ]
          : [],
    };

    await onAddNewDueCustomer(newCustomer);
    triggerToast(`✅ ${newCustomer.customerName} (${newCustomer.moholla}) বাকির খাতায় যুক্ত হয়েছেন!`);
    setShowNewCustomerModal(false);
    setNewCustName('');
    setNewCustFatherFarm('');
    setNewCustPhone('');
    setNewCustVillage('');
    setNewCustOpeningDue(0);
    setNewCustLifetime(0);
  };

  // 6. Export to CSV (Excel compatible)
  const handleExportCSV = () => {
    const headers = ['কাস্টমার নাম', 'পিতা/ফার্ম', 'মোবাইল', 'মহল্লা', 'গ্রাম/ঠিকানা', 'বর্তমান বাকি (টাকা)', 'মোট কেনাকাটা (টাকা)', 'শেষ জমার তারিখ'];
    const rows = dues.map((d) => [
      `"${d.customerName}"`,
      `"${d.fatherOrFarmName || ''}"`,
      `"${d.phone}"`,
      `"${d.moholla || ''}"`,
      `"${d.village || ''}"`,
      d.totalDue,
      d.lifetimePurchases || d.totalDue,
      `"${d.lastPaymentDate || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bhai-bhai-moholla-dues-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    triggerToast('✅ সম্পূর্ণ বাকির খাতা Excel/CSV ফাইলে এক্সপোর্ট হয়েছে!');
  };

  // 7. Import from JSON/CSV file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        let imported: CustomerDue[] = [];

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          imported = Array.isArray(parsed) ? parsed : parsed.dues || [];
        } else {
          // simple csv parse
          const lines = text.split('\n').filter(Boolean);
          // skip header
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
            if (cols.length >= 6) {
              imported.push({
                id: `cust-imp-${Date.now()}-${i}`,
                customerName: cols[0],
                fatherOrFarmName: cols[1],
                phone: cols[2],
                moholla: cols[3] || 'চরপাড়া',
                village: cols[4] || cols[3],
                totalDue: Number(cols[5]) || 0,
                lifetimePurchases: Number(cols[6]) || Number(cols[5]) || 0,
                lastPaymentDate: cols[7] || '',
                history: [],
              });
            }
          }
        }

        if (imported.length > 0 && onImportDues) {
          await onImportDues(imported);
          triggerToast(`✅ সফলভাবে ${formatNumberBengali(imported.length)} টি খতিয়ান ইম্পোর্ট করা হয়েছে!`);
        } else {
          alert('ফাইলটিতে সঠিক ফরম্যাটের কাস্টমার ডেটা পাওয়া যায়নি।');
        }
      } catch (err) {
        console.error(err);
        alert('ফাইল ইম্পোর্ট করতে সমস্যা হয়েছে। দয়া করে সঠিক ফাইল দিন।');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const sendDueWhatsApp = (customer: CustomerDue) => {
    const cleanPhone = customer.phone.replace(/\D/g, '');
    const intlPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const text = `আসসালামু আলাইকুম ${customer.customerName},\nমেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার থেকে আপনার খতিয়ানের বর্তমান মোট বকেয়া বাকি আছে: ${formatTaka(customer.totalDue)}।\nসুযোগমতো বকেয়া টাকা পরিশোধ করার জন্য অনুরোধ করা হলো।\nধন্যবাদ!`;
    const url = `https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3 bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg animate-pulse">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <span>মহল্লাভিত্তিক বাকির খাতা ও খামারি লেজার (Moholla Due Ledger)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            চারপাশের গ্রাম/মহল্লাভিত্তিক বাকি, সর্টিং, এক নামের ব্যক্তি শনাক্তকরণ ও এক্সেল ব্যাকআপ
          </p>
        </div>

        {/* Action Buttons: Export / Import / Add Customer */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer border border-slate-300 transition-colors"
            title="সম্পূর্ণ খাতা এক্সেলে নামান"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Excel Export</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer border border-slate-300 transition-colors">
            <Upload className="w-4 h-4 text-blue-700" />
            <span>Import</span>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowNewCustomerModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer shadow-xs whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ নতুন খাতা খুলুন</span>
          </button>
        </div>
      </div>

      {/* Moholla-wise Analytics Cards (Total Due per Moholla) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>মহল্লাভিত্তিক আলাদা মোট বাকির সারসংক্ষেপ:</span>
          <span className="text-rose-700 font-extrabold">
            বাজারে সর্বমোট বাকি: {formatTaka(totalMarketDue)}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {MOHOLLA_LIST.map((m) => {
            const stat = mohollaStats[m] || { totalDue: 0, customerCount: 0 };
            const isSelected = selectedMoholla === m;

            return (
              <button
                key={m}
                onClick={() => setSelectedMoholla(isSelected ? 'all' : m)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 truncate">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{m}</span>
                </div>
                <div className="text-sm font-extrabold text-rose-700 tabular-nums mt-1">
                  {formatTaka(stat.totalDue)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  বাকি গ্রাহক: {formatNumberBengali(stat.customerCount)} জন
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls: Search, Moholla Filter & Multi-Sorting */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, পিতার নাম/ফার্ম, মোবাইল বা মহল্লা দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Moholla & Sorting Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Moholla Filter Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">মহল্লা:</span>
            <select
              value={selectedMoholla}
              onChange={(e) => setSelectedMoholla(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="all">সকল মহল্লা (সব)</option>
              {MOHOLLA_LIST.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">সাজান:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="highest_due">সবচেয়ে বেশি বাকি আগে (Highest Due)</option>
              <option value="lowest_due">সবচেয়ে কম বাকি আগে (Lowest Due)</option>
              <option value="name_asc">নাম অনুযায়ী (A to Z / ক-খ)</option>
              <option value="lifetime_purchase">মোট কেনাকাটা অনুযায়ী (Top Buyer)</option>
              <option value="date_recent">সাম্প্রতিক লেনদেন অনুযায়ী</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Due List Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-700">
            খামারি তালিকা ({formatNumberBengali(processedList.length)} জন)
          </span>
          {selectedMoholla !== 'all' && (
            <button
              onClick={() => setSelectedMoholla('all')}
              className="text-emerald-700 hover:underline font-semibold"
            >
              ফিল্টার মুছুন (সকল মহল্লা দেখুন)
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-700">
                <th className="py-2.5 px-3">খামারি / কাস্টমার ও পরিচয়</th>
                <th className="py-2.5 px-3">মহল্লা / এলাকা</th>
                <th className="py-2.5 px-3">মোবাইল নম্বর</th>
                <th className="py-2.5 px-3 text-right">মোট বাজার করেছে</th>
                <th className="py-2.5 px-3 text-right">বর্তমান অবশিষ্ট বাকি</th>
                <th className="py-2.5 px-3 text-center">একশন ও পরিশোধ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    কোনো বাকির খাতা পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                processedList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Customer Identification with Father/Farm name */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{c.customerName}</span>
                      </div>
                      {c.fatherOrFarmName ? (
                        <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
                          {c.fatherOrFarmName}
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 mt-0.5">সাধারণ ক্রেতা</div>
                      )}
                    </td>

                    {/* Moholla Badge */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-800 font-semibold text-[11px]">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{c.moholla || 'অন্যান্য'}</span>
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[150px]">
                        {c.village}
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-3 font-mono font-medium text-slate-800">
                      {c.phone}
                    </td>

                    {/* Lifetime Purchases */}
                    <td className="py-3 px-3 text-right tabular-nums text-slate-700 font-semibold">
                      {formatTaka(c.lifetimePurchases || c.totalDue)}
                    </td>

                    {/* Current Due Balance */}
                    <td className="py-3 px-3 text-right">
                      <div className="font-extrabold tabular-nums text-rose-700 text-sm">
                        {formatTaka(c.totalDue)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {c.lastPaymentDate ? `শেষ জমা: ${getBengaliDate(c.lastPaymentDate)}` : 'কোনো জমা নেই'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setPaymentModalCustomer(c);
                            setPaymentAmount(Math.min(c.totalDue, 1000));
                          }}
                          className="px-2.5 py-1 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded cursor-pointer transition-colors shadow-xs"
                          title="টাকা জমা নিন এবং মূল ব্যালেন্স থেকে মাইনাস করুন"
                        >
                          জমা / পরিশোধ
                        </button>

                        <button
                          onClick={() => setHistoryCustomer(c)}
                          className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded cursor-pointer transition-colors"
                          title="লেনদেনের পূর্ণ খতিয়ান"
                        >
                          খতিয়ান
                        </button>

                        <button
                          onClick={() => sendDueWhatsApp(c)}
                          className="p-1 text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                          title="হোয়াটসঅ্যাপে তাগাদা পাঠান"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record Due Payment (Reduces Due Balance) */}
      {paymentModalCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 relative">
            <button
              onClick={() => setPaymentModalCustomer(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">বাকি পরিশোধ ও ব্যালেন্স মাইনাস</h3>
            <p className="text-xs text-slate-600 mb-1">
              <strong>{paymentModalCustomer.customerName}</strong> ({paymentModalCustomer.moholla})
            </p>
            {paymentModalCustomer.fatherOrFarmName && (
              <p className="text-[11px] text-slate-500 mb-3">{paymentModalCustomer.fatherOrFarmName}</p>
            )}

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs mb-4 flex justify-between">
              <span>বর্তমানে মূল বকেয়া বাকি:</span>
              <strong className="text-rose-700 tabular-nums">
                {formatTaka(paymentModalCustomer.totalDue)}
              </strong>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">পরিশোধিত টাকার পরিমাণ (৳) *</label>
                <input
                  type="number"
                  min={1}
                  max={paymentModalCustomer.totalDue}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold tabular-nums text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">পেমেন্ট মাধ্যম / মন্তব্য</label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="যেমন: হ্যান্ড ক্যাশ নগদ পরিশোধ"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>পরিশোধের পর নতুন বাকি থাকবে:</span>
                  <strong className="text-emerald-800">
                    {formatTaka(Math.max(0, paymentModalCustomer.totalDue - paymentAmount))}
                  </strong>
                </div>
                <div className="text-[10px] text-slate-500">
                  (এই টাকাটি স্বয়ংক্রিয়ভাবে আজকের দৈনিক রোকার খাতার ক্যাশ ইন-এ যুক্ত হবে)
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingPay}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
              >
                {isSubmittingPay ? 'মাইনাস হচ্ছে...' : 'টাকা জমা ও ব্যালেন্স মাইনাস করুন'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Full Due History */}
      {historyCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setHistoryCustomer(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">{historyCustomer.customerName} - লেজার খতিয়ান</h3>
            <p className="text-xs text-slate-500 mb-1">
              মহল্লা: <strong>{historyCustomer.moholla}</strong> · মোবাইল: {historyCustomer.phone}
            </p>
            {historyCustomer.fatherOrFarmName && (
              <p className="text-[11px] text-slate-500 mb-3">{historyCustomer.fatherOrFarmName}</p>
            )}

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 text-xs border border-slate-200 rounded-xl p-3">
              {(historyCustomer.history || []).length === 0 ? (
                <div className="py-6 text-center text-slate-400">কোনো পূর্ববর্তী লেনদেন নেই।</div>
              ) : (
                (historyCustomer.history || []).map((h) => (
                  <div key={h.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold ${
                            h.type === 'sale_due' ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {h.type === 'sale_due' ? '[-] বাকি মাল ক্রয়' : '[+] নগদ জমা পরিশোধ'}
                        </span>
                        {h.memoNo && <span className="font-mono text-slate-500 text-[11px]">({h.memoNo})</span>}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {getBengaliDate(h.date)} {h.note ? `· ${h.note}` : ''}
                      </div>
                    </div>

                    <div
                      className={`font-bold tabular-nums text-sm ${
                        h.type === 'sale_due' ? 'text-rose-700' : 'text-emerald-800'
                      }`}
                    >
                      {h.type === 'sale_due' ? `+${formatTaka(h.amount)}` : `-${formatTaka(h.amount)}`}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600">বর্তমান অবশিষ্ট বাকি:</span>
              <span className="text-base font-bold text-rose-700 tabular-nums">
                {formatTaka(historyCustomer.totalDue)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Due Customer */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 relative">
            <button
              onClick={() => setShowNewCustomerModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">নতুন বাকির খাতা খুলুন</h3>
            <p className="text-xs text-slate-500 mb-4">খামারির নাম, পিতা/ফার্মের নাম ও মহল্লা নির্বাচন করুন</p>

            <form onSubmit={handleNewCustomerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">খামারি / কাস্টমারের নাম *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="যেমন: রফিকুল ইসলাম"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  পিতার নাম বা ফার্মের নাম (একই নাম আলাদা করার জন্য)
                </label>
                <input
                  type="text"
                  value={newCustFatherFarm}
                  onChange={(e) => setNewCustFatherFarm(e.target.value)}
                  placeholder="যেমন: পিতা: মোঃ জয়নাল মিয়া অথবা রফিক ডেইরি"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">মহল্লা / গ্রাম *</label>
                  <select
                    value={newCustMoholla}
                    onChange={(e) => setNewCustMoholla(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {MOHOLLA_LIST.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="০১৭১২-..."
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">বিস্তারিত পাড়া বা ঠিকানা</label>
                <input
                  type="text"
                  value={newCustVillage}
                  onChange={(e) => setNewCustVillage(e.target.value)}
                  placeholder="যেমন: বটতলা সংলগ্ন"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">পূর্বের বাকি (৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={newCustOpeningDue}
                    onChange={(e) => setNewCustOpeningDue(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-bold tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">মোট কেনাকাটার পরিমাণ (৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={newCustLifetime}
                    onChange={(e) => setNewCustLifetime(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg tabular-nums"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
              >
                খাতা তৈরি করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

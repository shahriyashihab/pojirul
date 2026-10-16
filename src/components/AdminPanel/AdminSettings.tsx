import React, { useState } from 'react';
import { ShopSettings } from '../../types';
import { Settings, Save, ShieldCheck, Download, CheckCircle2, Database, KeyRound, Server } from 'lucide-react';
import { InfinityFreeExportModal } from '../InfinityFreeExportModal';

interface AdminSettingsProps {
  settings: ShopSettings;
  onSaveSettings: (settings: ShopSettings) => Promise<void>;
  onExportBackup: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  onSaveSettings,
  onExportBackup,
}) => {
  const [formData, setFormData] = useState<ShopSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveSettings(formData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isInfinityFreeModalOpen, setIsInfinityFreeModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-700" />
            <span>দোকানের সেটিংস ও নিরাপত্তা (Shop Settings)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            দোকানের নাম, ঠিকানা, বিকাশ/নগদ নম্বর এবং অ্যাডমিন পাসওয়ার্ড পরিবর্তন
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsInfinityFreeModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            <Server className="w-4 h-4 text-emerald-200" />
            <span>InfinityFree রেডি জিপ</span>
          </button>

          <button
            type="button"
            onClick={onExportBackup}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer transition-colors border border-slate-300"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>ডেটা ব্যাকআপ</span>
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>সকল সেটিংস সফলভাবে ক্লাউড ডেটাবেজে সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shop Info Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            দোকান ও মেমো তথ্য
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">দোকানের নাম *</label>
              <input
                type="text"
                required
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">প্রোপাইটর / মালিকের নাম</label>
              <input
                type="text"
                value={formData.proprietor}
                onChange={(e) => setFormData({ ...formData, proprietor: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">প্রধান মোবাইল নম্বর *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">বিকল্প মোবাইল নম্বর</label>
              <input
                type="text"
                value={formData.secondaryPhone}
                onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">দোকানের পূর্ণাঙ্গ ঠিকানা *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                ক্যাশ মেমোর নিচের ফুটনোট / নীতিমালা
              </label>
              <textarea
                rows={2}
                value={formData.memoFooterNote}
                onChange={(e) => setFormData({ ...formData, memoFooterNote: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Payment & Security Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment info */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              মোবাইল ব্যাংকিং অ্যাকাউন্ট
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">বিকাশ নম্বর</label>
                <input
                  type="text"
                  value={formData.bkashNumber}
                  onChange={(e) => setFormData({ ...formData, bkashNumber: e.target.value })}
                  placeholder="যেমন: ০১৭১২-৩৪৫৬৭৮ (পার্সোনাল)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">নগদ নম্বর</label>
                <input
                  type="text"
                  value={formData.nagadNumber}
                  onChange={(e) => setFormData({ ...formData, nagadNumber: e.target.value })}
                  placeholder="যেমন: ০১৮১২-৩৪৫৬৭৮ (মার্চেন্ট)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Admin Credentials */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-emerald-700" />
              <span>অ্যাডমিন লগইন ও পাসওয়ার্ড</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">লগইন ইউজারনেম *</label>
                <input
                  type="text"
                  required
                  value={formData.adminUsername}
                  onChange={(e) => setFormData({ ...formData, adminUsername: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">লগইন পাসওয়ার্ড *</label>
                <input
                  type="text"
                  required
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Database Status Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="font-semibold text-slate-800">Firebase Realtime Database: </span>
              <span className="font-mono text-slate-600">{formData.firebaseUrl}</span>
            </div>
          </div>
          <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
            সক্রিয় ও সংযুক্ত
          </span>
        </div>

        {/* InfinityFree Hosting Guidance */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm">
              <Server className="w-5 h-5 text-emerald-700" />
              <span>🌐 InfinityFree হোস্টিং সেটআপ (সাদা স্ক্রিনের স্থায়ী সমাধান):</span>
            </div>
            <button
              type="button"
              onClick={() => setIsInfinityFreeModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>রেডি জিপ ডাউনলোড ও গাইড</span>
            </button>
          </div>
          <p className="text-emerald-900 leading-relaxed">
            InfinityFree হলো সাধারণ ওয়েব হোস্টিং, যেখানে টার্মিনাল বা Node.js থাকে না। তাই কাঁচা সোর্স কোড দিলে স্ক্রিন সাদা হয়। আমরা পুরো অ্যাপটিকে স্বয়ংক্রিয় ব্রাউজার-ফ্রেন্ডলি বান্ডেল হিসেবে কম্পাইল করে প্রস্তুত রেখেছি। উপরের বাটনে ক্লিক করে <strong>'রেডি জিপ'</strong> নামিয়ে InfinityFree-এর <code className="bg-white px-1.5 py-0.5 border border-emerald-300 rounded font-mono font-bold">htdocs</code> ফোল্ডারে আনজিপ করলেই কোনো সাদা স্ক্রিন ছাড়াই ওয়েবসাইট সুন্দরভাবে চালু হয়ে যাবে!
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm cursor-pointer transition-colors shadow-md flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span>সংরক্ষিত হচ্ছে...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>সকল তথ্য ও সেটিংস সংরক্ষণ করুন</span>
            </>
          )}
        </button>
      </form>

      {/* InfinityFree Export and Instructions Modal */}
      <InfinityFreeExportModal
        isOpen={isInfinityFreeModalOpen}
        onClose={() => setIsInfinityFreeModalOpen(false)}
      />
    </div>
  );
};

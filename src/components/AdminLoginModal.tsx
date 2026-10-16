import React, { useState } from 'react';
import { ShopSettings } from '../types';
import { X, Lock, KeyRound, ShieldCheck } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ShopSettings;
  onSuccessLogin: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSuccessLogin,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const targetUser = settings.adminUsername || 'admin';
    const targetPass = settings.adminPassword || 'admin123';

    if (username.trim() === targetUser && password.trim() === targetPass) {
      onSuccessLogin();
      onClose();
    } else {
      setErrorMsg('ইউজারনেম অথবা পাসওয়ার্ড ভুল হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">দোকান মালিকের লগইন</h3>
            <p className="text-xs text-slate-500">অ্যাডমিন প্যানেল ও হিসাব খাতায় প্রবেশ</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ইউজারনেম (Username)
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              পাসওয়ার্ড (Password)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-0.5">
            <div><strong>ডিফল্ট ইউজারনেম:</strong> admin</div>
            <div><strong>ডিফল্ট পাসওয়ার্ড:</strong> admin123</div>
            <div className="text-[10px] text-slate-500 pt-1">(লগইন করার পর সেটিংস থেকে পরিবর্তন করা যাবে)</div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>প্রবেশ করুন</span>
          </button>
        </form>
      </div>
    </div>
  );
};

import React from 'react';
import { ShoppingBag, Lock, PhoneCall, ShieldCheck } from 'lucide-react';
import { formatNumberBengali } from '../services/firebaseService';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenTracking: () => void;
  onOpenAdminLogin: () => void;
  onOpenInfinityFreeGuide?: () => void;
  isAdminLoggedIn: boolean;
  onGoToAdmin: () => void;
  onGoToStore: () => void;
  activeView: 'store' | 'admin';
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenTracking,
  onOpenAdminLogin,
  onOpenInfinityFreeGuide,
  isAdminLoggedIn,
  onGoToAdmin,
  onGoToStore,
  activeView,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Bar Announcement */}
      <div className="bg-emerald-800 text-white text-xs py-1.5 px-4 text-center flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <span>🌾 ১০০% খাঁটি ও পুষ্টিকর গো-খাদ্য — সরাসরি মিল ও মোকাম থেকে সংগৃহীত</span>
        <span className="hidden md:inline text-emerald-200">·</span>
        {onOpenInfinityFreeGuide && (
          <button
            onClick={onOpenInfinityFreeGuide}
            className="inline-flex items-center gap-1 bg-emerald-900/80 hover:bg-emerald-950 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-100 hover:text-white transition-colors cursor-pointer border border-emerald-600/50"
          >
            <span>🌐 InfinityFree আপলোড গাইড ও জিপ</span>
          </button>
        )}
        <span className="hidden md:inline text-emerald-200">·</span>
        <a href="tel:01712345678" className="hidden md:flex items-center gap-1 hover:text-emerald-200 font-medium">
          <PhoneCall className="w-3.5 h-3.5" />
          <span>অর্ডার ও পরামর্শ: ০১৭১২-৩৪৫৬৭৮</span>
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={onGoToStore}
          className="text-left group cursor-pointer focus:outline-hidden"
        >
          <div className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors whitespace-nowrap">
            মেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার
          </div>
          <div className="text-xs text-slate-500 whitespace-nowrap">
            পাইকারি ও খুচরা বিক্রয় কেন্দ্র
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={onGoToStore}
            className={`whitespace-nowrap transition-colors hover:text-emerald-700 ${
              activeView === 'store' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600 pb-0.5' : ''
            }`}
          >
            পণ্য ক্যাটালগ
          </button>
          <button
            onClick={onOpenTracking}
            className="whitespace-nowrap transition-colors hover:text-emerald-700"
          >
            অর্ডার ট্র্যাক
          </button>
          <a
            href="#contact-info"
            onClick={(e) => {
              if (activeView !== 'store') {
                e.preventDefault();
                onGoToStore();
                setTimeout(() => {
                  document.getElementById('contact-info')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            className="whitespace-nowrap transition-colors hover:text-emerald-700"
          >
            যোগাযোগ ও ঠিকানা
          </a>
          {onOpenInfinityFreeGuide && (
            <button
              onClick={onOpenInfinityFreeGuide}
              className="whitespace-nowrap transition-colors text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>🌐 InfinityFree হোস্টিং</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Action & Admin Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Order Tracking Mobile */}
          <button
            onClick={onOpenTracking}
            className="lg:hidden text-xs text-slate-600 hover:text-emerald-700 font-medium px-2 py-1.5 border border-slate-200 rounded-md whitespace-nowrap"
          >
            অর্ডার ট্র্যাক
          </button>

          {/* Cart Button */}
          {activeView === 'store' && (
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 transition-all rounded-lg shadow-xs whitespace-nowrap cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>কার্ট</span>
              {cartCount > 0 && (
                <span className="bg-amber-400 text-slate-900 font-bold text-xs px-1.5 py-0.2 rounded-full tabular-nums">
                  {formatNumberBengali(cartCount)}
                </span>
              )}
            </button>
          )}

          {/* Admin Switch / Login Button */}
          {isAdminLoggedIn ? (
            <button
              onClick={activeView === 'admin' ? onGoToStore : onGoToAdmin}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors rounded-lg border border-slate-300 whitespace-nowrap cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{activeView === 'admin' ? 'দোকানে ফিরুন' : 'অ্যাডমিন প্যানেল'}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors rounded-lg border border-slate-200 whitespace-nowrap cursor-pointer"
              title="দোকান মালিকের লগইন"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>মালিকের লগইন</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

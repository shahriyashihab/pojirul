import React, { useState } from 'react';
import { Product, OrderItem } from '../types';
import { formatTaka, formatNumberBengali } from '../services/firebaseService';
import { Search, ShoppingCart, Check, Phone, MapPin, Truck, Award, Shield } from 'lucide-react';
import { DEFAULT_PRODUCT_IMAGE, FALLBACK_SVG_DATA } from '../utils/imageUtils';

interface CustomerStoreProps {
  products: Product[];
  onAddToCart: (item: OrderItem) => void;
  onOpenCart: () => void;
  shopPhone: string;
  shopAddress: string;
}

export const CustomerStore: React.FC<CustomerStoreProps> = ({
  products,
  onAddToCart,
  onOpenCart,
  shopPhone,
  shopAddress,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedItemMap, setAddedItemMap] = useState<Record<string, boolean>>({});

  // Individual product selected weights: productId -> { weightKg: number, packageType: 'kg'|'bag'|'maund' }
  const [selectionMap, setSelectionMap] = useState<
    Record<string, { weightKg: number; packageType: 'kg' | 'bag' | 'maund' }>
  >({});

  const categories = [
    { id: 'all', label: 'সকল পণ্য' },
    { id: 'গমের ভুসি', label: 'গমের ভুসি' },
    { id: 'খইল', label: 'সরিষার খইল' },
    { id: 'ফিড', label: 'দানাদার ফিড' },
    { id: 'ছোলা ও ডাল', label: 'ছোলা ও ডাল' },
    { id: 'খুদি ও কুঁড়া', label: 'খুদি ও কুঁড়া' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const getSelection = (product: Product) => {
    return (
      selectionMap[product.id] || {
        weightKg: product.bagWeightKg || 50,
        packageType: 'bag',
      }
    );
  };

  const handleWeightPreset = (
    product: Product,
    weightKg: number,
    packageType: 'kg' | 'bag' | 'maund'
  ) => {
    setSelectionMap((prev) => ({
      ...prev,
      [product.id]: { weightKg, packageType },
    }));
  };

  const handleCustomWeightChange = (product: Product, val: number) => {
    const safeVal = Math.max(1, Math.min(val, product.stockKg || 10000));
    setSelectionMap((prev) => ({
      ...prev,
      [product.id]: { weightKg: safeVal, packageType: 'kg' },
    }));
  };

  const calculateProductPrice = (product: Product, sel: { weightKg: number; packageType: 'kg' | 'bag' | 'maund' }) => {
    if (sel.packageType === 'bag' && sel.weightKg === product.bagWeightKg && product.bagSellPrice > 0) {
      return product.bagSellPrice;
    }
    return Math.round(sel.weightKg * product.sellPricePerKg);
  };

  const handleAdd = (product: Product) => {
    const sel = getSelection(product);
    const totalPrice = calculateProductPrice(product, sel);

    const item: OrderItem = {
      productId: product.id,
      productName: product.name,
      quantityKg: sel.weightKg,
      packageType: sel.packageType,
      unitPrice: product.sellPricePerKg,
      buyPricePerKg: product.buyPricePerKg,
      total: totalPrice,
    };

    onAddToCart(item);

    // Feedback tick
    setAddedItemMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30 mix-blend-overlay">
          <img
            src="/src/assets/images/hero_cattle_feed_store_1792082237019.jpg"
            alt="মেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3">
              <span>🌾 শতভাগ খাঁটি ও পুষ্টিকর গো-খাদ্যের বিশ্বস্ত মোকাম</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              গরু, মহিষ ও ছাগলের উন্নতমানের পুষ্টিকর খাবার
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed">
              সরাসরি কুষ্টিয়া ও কানাডিয়ান গমের ভুসি, ঘানির সরিষার খইল, ভাঙা বুটের ছোলা, চালের খুদ ও বিজ্ঞানসম্মত ভিটামিন ফিড। পাইকারি ও খুচরা মূল্যে সুলভে অর্ডার করুন।
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>দ্রুত হোম ডেলিভারি</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>সরাসরি মিল রেট</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>নগদ ও বাকি হিসাবের সুবিধা</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Search & Categories Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          {/* Category Tabs (Segmented Buttons) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === c.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="পণ্য বা ভুসির নাম খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>
        </div>

        {/* Status Strip showing item count & mobile layout confirmation */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 sm:pt-6 pb-1 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="font-bold text-slate-800 text-xs sm:text-sm">
              পণ্যের তালিকা ({formatNumberBengali(filteredProducts.length)} টি আইটেম)
            </span>
          </div>
          <div className="text-[10px] sm:text-xs text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold">
            মোবাইলে জোড়া (২টি) ভিউ
          </div>
        </div>

        {/* Product Grid: 2 columns on mobile (phone), 3 columns on laptop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 pt-2 sm:pt-4">
          {filteredProducts.map((product) => {
            const sel = getSelection(product);
            const price = calculateProductPrice(product, sel);
            const isOutOfStock = product.stockKg <= 0;
            const isLowStock = product.stockKg > 0 && product.stockKg <= product.minStockAlertKg;
            const isAdded = addedItemMap[product.id];

            return (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Product Image */}
                  <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-102"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (!target.dataset.fallbackTried) {
                          target.dataset.fallbackTried = '1';
                          target.src = DEFAULT_PRODUCT_IMAGE;
                        } else {
                          target.src = FALLBACK_SVG_DATA;
                        }
                      }}
                    />
                    {/* Unboxed Status Kicker */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/95 backdrop-blur-xs px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded text-[9px] sm:text-xs font-semibold text-slate-700 shadow-xs">
                      {product.category}
                    </div>
                    {isLowStock && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-amber-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded text-[9px] sm:text-xs font-medium">
                        মজুত সীমিত
                      </div>
                    )}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white font-bold text-xs sm:text-sm text-center p-2">
                        বর্তমানে স্টক শেষ
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-2.5 sm:p-5">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-slate-500 mb-1">
                      <span>মজুত: {formatNumberBengali(product.stockKg)} কেজি</span>
                      <span aria-hidden="true">·</span>
                      <span>১ বস্তা: {formatNumberBengali(product.bagWeightKg)} কেজি</span>
                    </div>

                    <h3 className="text-xs sm:text-base font-bold text-slate-900 mb-1 sm:mb-2 leading-snug line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-2 mb-2 sm:mb-3 leading-relaxed">
                      {product.description}
                    </p>

                    {product.nutritionNote && (
                      <div className="p-1.5 sm:p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-lg text-[10px] sm:text-xs text-emerald-900 mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                        <span className="font-semibold">পুষ্টি:</span> {product.nutritionNote}
                      </div>
                    )}

                    {/* Weight Selection Controls */}
                    <div className="space-y-1.5 sm:space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[10px] sm:text-xs font-medium text-slate-700 gap-0.5">
                        <span>পরিমাণ বাছুন:</span>
                        <span className="text-slate-500 tabular-nums">
                          প্রতি কেজি: {formatTaka(product.sellPricePerKg)}
                        </span>
                      </div>

                      {/* Presets - 2 cols on mobile, 4 on desktop */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleWeightPreset(product, 5, 'kg')}
                          className={`py-1 sm:py-1.5 px-1 text-[10px] sm:text-xs font-medium rounded border transition-colors cursor-pointer text-center truncate ${
                            sel.packageType === 'kg' && sel.weightKg === 5
                              ? 'bg-emerald-700 text-white border-emerald-700 font-bold'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          ৫ কেজি
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWeightPreset(product, 10, 'kg')}
                          className={`py-1 sm:py-1.5 px-1 text-[10px] sm:text-xs font-medium rounded border transition-colors cursor-pointer text-center truncate ${
                            sel.packageType === 'kg' && sel.weightKg === 10
                              ? 'bg-emerald-700 text-white border-emerald-700 font-bold'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          ১০ কেজি
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWeightPreset(product, 40, 'maund')}
                          className={`py-1 sm:py-1.5 px-1 text-[10px] sm:text-xs font-medium rounded border transition-colors cursor-pointer text-center truncate ${
                            sel.packageType === 'maund' && sel.weightKg === 40
                              ? 'bg-emerald-700 text-white border-emerald-700 font-bold'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          ১ মণ (৪০kg)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWeightPreset(product, product.bagWeightKg, 'bag')}
                          className={`py-1 sm:py-1.5 px-1 text-[10px] sm:text-xs font-medium rounded border transition-colors cursor-pointer text-center truncate ${
                            sel.packageType === 'bag'
                              ? 'bg-emerald-700 text-white border-emerald-700 font-bold'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          ১ বস্তা ({formatNumberBengali(product.bagWeightKg)}kg)
                        </button>
                      </div>

                      {/* Custom Weight Stepper */}
                      <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5">
                        <span className="text-[10px] sm:text-xs text-slate-500 whitespace-nowrap">অন্যান্য কেজি:</span>
                        <input
                          type="number"
                          min={1}
                          max={product.stockKg}
                          value={sel.weightKg}
                          onChange={(e) => handleCustomWeightChange(product, Number(e.target.value))}
                          className="w-16 sm:w-24 px-1.5 py-0.5 sm:py-1 text-xs border border-slate-300 rounded text-center font-bold tabular-nums"
                        />
                        <span className="text-[10px] sm:text-xs text-slate-600 font-medium">কেজি</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Calculated Price and Add Button */}
                <div className="p-2.5 sm:p-5 pt-2 sm:pt-3 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                  <div>
                    <div className="text-[10px] sm:text-xs text-slate-500">মোট মূল্য ({formatNumberBengali(sel.weightKg)} কেজি)</div>
                    <div className="text-sm sm:text-lg font-bold text-emerald-800 tabular-nums">
                      {formatTaka(price)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAdd(product)}
                    disabled={isOutOfStock}
                    className={`w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 py-2 sm:px-4 sm:py-2.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : isOutOfStock
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white shadow-xs'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>যোগ হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>কার্টে নিন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl my-8">
            <p className="text-slate-500 text-sm">কোনো পণ্য পাওয়া যায়নি। দয়া করে অন্য নামে চেষ্টা করুন।</p>
          </div>
        )}
      </main>

      {/* Contact & Store Info Footer */}
      <footer id="contact-info" className="mt-20 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-base font-bold text-slate-900 mb-2">মেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                খামারিদের নির্ভরযোগ্য প্রতিষ্ঠান। ডেইরি ক্যাটল ও পশুপালনের প্রতিটি পুষ্টিকর খাবারের সুষম সরবরাহ ও সরাসরি মোকাম চালানের পাইকারি রেট।
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>প্রোপাইটর: মোঃ শাহরিয়ার ইসলাম</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">যোগাযোগের ঠিকানা</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{shopAddress}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <a href={`tel:${shopPhone}`} className="hover:text-emerald-700 font-semibold">
                    {shopPhone}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">পেমেন্ট ও ডেলিভারি তথ্য</h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                • ক্যাশ অন ডেলিভারি (মাল পেয়ে নগদ টাকা পরিশোধ)
              </p>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                • বিকাশ, নগদ ও রকেটের মাধ্যমে সরাসরি মোবাইল পেমেন্ট
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                • স্থানীয় খামারিদের জন্য বাকি ও আংশিক পরিশোধের বিশেষ সুবিধা
              </p>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} মেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার। সর্বস্বত্ব সংরক্ষিত।</p>
            <p>রিয়েল-টাইম ক্লাউড ডেটাবেজে সার্বক্ষণিক পরিচালিত</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

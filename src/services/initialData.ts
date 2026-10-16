import { Product, CustomerDue, ShopExpense, ShopSettings, StockInRecord } from '../types';

export const INITIAL_SETTINGS: ShopSettings = {
  shopName: 'মেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার',
  proprietor: 'মোঃ শাহরিয়ার ইসলাম',
  phone: '০১৭১২-৩৪৫৬৭৮',
  secondaryPhone: '০১৮১২-৯৮৭৬৫৪',
  address: 'থানা মোড় বাজার, ডেইরি জোন রোড, বাংলাদেশ',
  bkashNumber: '০১৭১২-৩৪৫৬৭৮ (পার্সোনাল)',
  nagadNumber: '০১৮১২-৯৮৭৬৫৪ (মার্চেন্ট)',
  deliveryCharge: 60,
  freeDeliveryMinAmount: 3000,
  adminUsername: 'admin',
  adminPassword: 'admin123',
  memoFooterNote: 'বিক্রিত মাল ফেরত নেওয়া হয় না। উন্নত গো-খাদ্যে দুধ ও মাংসের সর্বোচ্চ নিশ্চয়তা। আমাদের সাথে থাকার জন্য ধন্যবাদ।',
  firebaseUrl: 'https://pjri-e771a-default-rtdb.firebaseio.com/',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-wheat-bran-1',
    name: 'লাল মোটা গমের ভুসি (স্পেশাল কুষ্টিয়া)',
    category: 'গমের ভুসি',
    imageUrl: '/src/assets/images/product_wheat_bran_1792082237586.jpg',
    buyPricePerKg: 38,
    sellPricePerKg: 44,
    bagWeightKg: 40,
    bagSellPrice: 1720,
    stockKg: 2400,
    minStockAlertKg: 400,
    description: '১০০% ভেজালমুক্ত দেশি লাল গম থেকে সংগৃহীত পুষ্টিকর ও সুগন্ধি মোটা ভুসি।',
    nutritionNote: 'দুধেল গাভীর দুধ উৎপাদন বৃদ্ধি ও হজম শক্তি বাড়াতে অত্যন্ত কার্যকর।'
  },
  {
    id: 'prod-wheat-bran-fine',
    name: 'চিকন গমের ভুসি (আমদানিকৃত কানাডিয়ান)',
    category: 'গমের ভুসি',
    imageUrl: '/src/assets/images/product_wheat_bran_1792082237586.jpg',
    buyPricePerKg: 42,
    sellPricePerKg: 48,
    bagWeightKg: 50,
    bagSellPrice: 2350,
    stockKg: 1850,
    minStockAlertKg: 300,
    description: 'উচ্চ আমিষ সমৃদ্ধ মিহি ও মিষ্টি স্বাদের চিকন গমের ভুসি।',
    nutritionNote: 'ষাঁড় মোটাতাজাকরণ ও বাড়ন্ত বাছুরের দ্রুত বৃদ্ধির জন্য চমৎকার খাদ্য।'
  },
  {
    id: 'prod-mustard-khol',
    name: 'ঘানির খাঁটি সরিষার খইল (চকলেট গুঁড়া ও চাপ)',
    category: 'খইল',
    imageUrl: '/src/assets/images/product_mustard_oilcake_1792082237453.jpg',
    buyPricePerKg: 52,
    sellPricePerKg: 60,
    bagWeightKg: 50,
    bagSellPrice: 2950,
    stockKg: 1200,
    minStockAlertKg: 250,
    description: 'কাঠের ঘানি ও উন্নত এক্সপেলারের প্রথম চাপ সরিষার খইল। ঝাঁঝালো ও সুগন্ধি।',
    nutritionNote: 'উচ্চ প্রোটিন (৩২%+) যা দুধের ফ্যাট ও ঘন বাড়ায় এবং গরুর শরীরে দ্রুত মাংস যোগায়।'
  },
  {
    id: 'prod-bengal-gram',
    name: 'ভাঙা বুটের ছোলা ও ছোলার কুঁড়া',
    category: 'ছোলা ও ডাল',
    imageUrl: '/src/assets/images/product_bengal_gram_1792082239843.jpg',
    buyPricePerKg: 78,
    sellPricePerKg: 90,
    bagWeightKg: 40,
    bagSellPrice: 3550,
    stockKg: 950,
    minStockAlertKg: 200,
    description: 'উচ্চ এনার্জি সমৃদ্ধ ভাঙা অস্ট্রেলিয়ান বুট ও মিষ্টি ছোলার ছাঁট।',
    nutritionNote: 'দুর্বল গাভী ও ষাঁড়ের মাংসপেশি শক্ত করতে এবং গর্ভকালীন পুষ্টির জন্য আদর্শ।'
  },
  {
    id: 'prod-pellet-dairy',
    name: 'উন্নত ডেইরি স্পেশাল দানাদার ফিড (২২% প্রোটিন)',
    category: 'ফিড',
    imageUrl: '/src/assets/images/product_pellet_feed_1792082238529.jpg',
    buyPricePerKg: 46,
    sellPricePerKg: 54,
    bagWeightKg: 50,
    bagSellPrice: 2650,
    stockKg: 2100,
    minStockAlertKg: 500,
    description: 'বিজ্ঞানসম্মত উপায়ে খনিজ, ভিটামিন, ইস্ট ও বাইপাস ফ্যাট মিশ্রিত পেলিটাইজড ফিড।',
    nutritionNote: 'প্রতিদিন ২-৩ কেজি ফিডে নিয়মিত গাভীর দুধ উৎপাদন সর্বোচ্চ স্তরে থাকে।'
  },
  {
    id: 'prod-broken-rice',
    name: 'উন্নত মোটা খুদের চাল ও কুঁড়া ফিড',
    category: 'খুদি ও কুঁড়া',
    imageUrl: '/src/assets/images/product_pellet_feed_1792082238529.jpg',
    buyPricePerKg: 34,
    sellPricePerKg: 40,
    bagWeightKg: 50,
    bagSellPrice: 1950,
    stockKg: 1600,
    minStockAlertKg: 300,
    description: 'পরিষ্কার ঝাড়াই করা চালের খুদ, কার্বোহাইড্রেটের উৎকৃষ্ট উৎস।',
    nutritionNote: 'গরুকে জাউ রেঁধে খাওয়ানোর জন্য অত্যন্ত উপযোগী ও পেটের সমস্যা দূর করে।'
  }
];

export const INITIAL_EXPENSES: ShopExpense[] = [
  {
    id: 'exp-1',
    title: 'মোকাম থেকে ট্রাকভাড়া ও পরিবহন',
    category: 'transport',
    amount: 4500,
    date: '2026-10-12',
    note: 'নারায়ণগঞ্জ মোকাম থেকে ৪০ বস্তা ভুসি ও খইল পরিবহন'
  },
  {
    id: 'exp-2',
    title: 'ট্রাক থেকে মাল আনলোড ও লেবার বিল',
    category: 'labour',
    amount: 1200,
    date: '2026-10-12',
    note: 'বস্তা প্রতি ২০ টাকা হারে ৬০ বস্তা কুলি খরচ'
  },
  {
    id: 'exp-3',
    title: 'দোকানের বিদ্যুৎ বিল (সেপ্টেম্বর)',
    category: 'electricity',
    amount: 850,
    date: '2026-10-10',
    note: 'পল্লী বিদ্যুৎ অফিস বিল'
  },
  {
    id: 'exp-4',
    title: 'দোকান কর্মচারীর সাপ্তাহিক হাজিরা',
    category: 'salary',
    amount: 3000,
    date: '2026-10-14',
    note: 'কর্মচারী রফিকুলের সাপ্তাহিক বেতন'
  }
];

export const INITIAL_CUSTOMERS_DUE: CustomerDue[] = [
  {
    id: 'cust-1',
    customerName: 'হাজী সামসুল আলম',
    fatherOrFarmName: 'সামসুল ডেইরি ফার্ম (পিতা: মরহুম আব্দুল কাদের)',
    phone: '০১৭৩৩-১২২৩৩৩',
    village: 'চরপাড়া পূর্ব পাড়া',
    moholla: 'চরপাড়া',
    totalDue: 8500,
    lifetimePurchases: 75000,
    lastPaymentDate: '2026-10-11',
    history: [
      {
        id: 'rec-1',
        date: '2026-10-05',
        type: 'sale_due',
        amount: 12500,
        memoNo: 'MEMO-1002',
        note: '৩ বস্তা ভুসি ও ১ বস্তা খইল ক্রয়',
      },
      {
        id: 'rec-2',
        date: '2026-10-11',
        type: 'payment_received',
        amount: 4000,
        note: 'বিকাশের মাধ্যমে আংশিক পরিশোধ',
      },
    ],
  },
  {
    id: 'cust-2',
    customerName: 'রফিকুল ইসলাম',
    fatherOrFarmName: 'রফিক ডেইরি (পিতা: মোঃ জয়নাল মিয়া)',
    phone: '০১৭২০-৯৯৮৮৭৭',
    village: 'চরপাড়া বটতলা',
    moholla: 'চরপাড়া',
    totalDue: 3200,
    lifetimePurchases: 28000,
    lastPaymentDate: '2026-10-09',
    history: [
      {
        id: 'rec-20',
        date: '2026-10-09',
        type: 'sale_due',
        amount: 3200,
        memoNo: 'MEMO-1005',
        note: '১ বস্তা গমের ভুসি বাকি',
      },
    ],
  },
  {
    id: 'cust-3',
    customerName: 'রফিকুল ইসলাম',
    fatherOrFarmName: 'ইসলাম অ্যাগ্রো (পিতা: মোঃ আক্কাস আলী)',
    phone: '০১৮১৬-৪৪৫৫৬৬',
    village: 'উত্তর রামপুর স্কুল রোড',
    moholla: 'উত্তর রামপুর',
    totalDue: 11400,
    lifetimePurchases: 92000,
    lastPaymentDate: '2026-10-12',
    history: [
      {
        id: 'rec-21',
        date: '2026-10-12',
        type: 'sale_due',
        amount: 11400,
        memoNo: 'MEMO-1015',
        note: '৪ বস্তা ডেইরি ফিড ও খইল বাকি',
      },
    ],
  },
  {
    id: 'cust-4',
    customerName: 'আজিজুল হক',
    fatherOrFarmName: 'আজিজ ডেইরি (পিতা: হাজী ইদ্রিস আলী)',
    phone: '০১৮১৯-৫৫৬৬৭৭',
    village: 'উত্তর রামপুর বাজার সংলগ্ন',
    moholla: 'উত্তর রামপুর',
    totalDue: 4200,
    lifetimePurchases: 36000,
    lastPaymentDate: '2026-10-08',
    history: [
      {
        id: 'rec-3',
        date: '2026-10-08',
        type: 'sale_due',
        amount: 4200,
        memoNo: 'MEMO-1008',
        note: '২ বস্তা দানাদার ফিড বাকি',
      },
    ],
  },
  {
    id: 'cust-5',
    customerName: 'মোঃ সোবহান খন্দকার',
    fatherOrFarmName: 'খন্দকার ডেইরি প্রজেক্ট (পিতা: মরহুম কাসেম খন্দকার)',
    phone: '০১৯১১-২২৩৩৪৪',
    village: 'ডেইরি জোন খামার বাড়ি',
    moholla: 'ডেইরি জোন',
    totalDue: 15800,
    lifetimePurchases: 120000,
    lastPaymentDate: '2026-10-13',
    history: [
      {
        id: 'rec-22',
        date: '2026-10-13',
        type: 'sale_due',
        amount: 15800,
        memoNo: 'MEMO-1020',
        note: '১০ বস্তা মোটা ভুসি ও খুদের চাল',
      },
    ],
  },
  {
    id: 'cust-6',
    customerName: 'মাস্টার মোজাম্মেল হক',
    fatherOrFarmName: 'পিতা: আলহাজ্ব আব্দুল গফুর',
    phone: '০১৭৫০-১১২২৩৩',
    village: 'বাজার পাড়া মসজিদ গলি',
    moholla: 'বাজার পাড়া',
    totalDue: 2500,
    lifetimePurchases: 18500,
    lastPaymentDate: '2026-10-07',
    history: [
      {
        id: 'rec-23',
        date: '2026-10-07',
        type: 'sale_due',
        amount: 2500,
        memoNo: 'MEMO-1004',
        note: '৫০ কেজি ভাঙা ছোলা',
      },
    ],
  },
  {
    id: 'cust-7',
    customerName: 'দেলোয়ার হোসেন',
    fatherOrFarmName: 'দেলোয়ার ডেইরি (পিতা: নূর মোহাম্মদ)',
    phone: '০১৮২৫-৭৭৮৮৯৯',
    village: 'দক্ষিণ পাড়া নদীর পাড়',
    moholla: 'দক্ষিণ পাড়া',
    totalDue: 6300,
    lifetimePurchases: 48000,
    lastPaymentDate: '2026-10-10',
    history: [
      {
        id: 'rec-24',
        date: '2026-10-10',
        type: 'sale_due',
        amount: 6300,
        memoNo: 'MEMO-1011',
        note: '২ বস্তা সরিষার খইল ও ভুসি',
      },
    ],
  },
];

export const INITIAL_STOCK_IN: StockInRecord[] = [
  {
    id: 'stock-in-1',
    date: '2026-10-01',
    productId: 'prod-wheat-bran-1',
    productName: 'লাল মোটা গমের ভুসি (স্পেশাল কুষ্টিয়া)',
    quantityKg: 3000,
    buyPricePerKg: 38,
    totalCost: 114000,
    supplierName: 'কুষ্টিয়া ফ্লাওয়ার মিলস',
    invoiceNo: 'KM-8842',
    note: '৭৫ বস্তা (৪০ কেজি প্রতিটি)'
  },
  {
    id: 'stock-in-2',
    date: '2026-10-03',
    productId: 'prod-mustard-khol',
    productName: 'ঘানির খাঁটি সরিষার খইল (চকলেট গুঁড়া ও চাপ)',
    quantityKg: 2000,
    buyPricePerKg: 52,
    totalCost: 104000,
    supplierName: 'যশোর অয়েল মিলস',
    invoiceNo: 'JM-1120',
    note: '৪০ বস্তা (৫০ কেজি প্রতিটি)'
  }
];

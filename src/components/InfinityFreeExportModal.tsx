import React, { useState } from 'react';
import { X, Download, Server, CheckCircle2, AlertTriangle, FileCode, ArrowRight, ShieldCheck, HelpCircle, Loader2 } from 'lucide-react';
import { generateInfinityFreeZip, downloadBlob } from '../services/infinityFreeExport';

interface InfinityFreeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfinityFreeExportModal: React.FC<InfinityFreeExportModalProps> = ({ isOpen, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    setIsGenerating(true);
    setIsSuccess(false);
    try {
      const blob = await generateInfinityFreeZip((msg) => setProgressMsg(msg));
      downloadBlob(blob, 'bhaibhai-cattlefeed-infinityfree-htdocs.zip');
      setIsSuccess(true);
    } catch (err) {
      console.error('Failed to generate zip:', err);
      alert('জিপ ফাইল তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsGenerating(false);
      setProgressMsg('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
              <Server className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">InfinityFree হোস্টিং গাইড ও রেডি প্যাকেজ</h3>
              <p className="text-xs text-emerald-100">সাদা স্ক্রিনের স্থায়ী সমাধান ও ৩ মিনিটে ওয়েবসাইট লাইভ করুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-100 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
          {/* Why White Screen Happened Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 text-xs sm:text-sm mb-1">
                আগে কেন InfinityFree-তে স্ক্রিন সাদা হয়ে ছিল?
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                InfinityFree হলো সাধারণ ওয়েব হোস্টিং (Apache+PHP), যেখানে Node.js বা টার্মিনাল থাকে না। আপনি পূর্বে প্রজেক্টের <strong>কাঁচা সোর্স কোড (.tsx / src)</strong> আপলোড করেছিলেন। কোনো সাধারণ ব্রাউজার সরাসরি TypeScript বা .tsx ফাইল চালাতে পারে না, তাই সাদা স্ক্রিন হয়েছিল।
              </p>
            </div>
          </div>

          {/* Solution Explanation */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-950 text-xs sm:text-sm mb-1">
                আমরা কীভাবে এটি ফিক্স করেছি?
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                আমরা সম্পূর্ণ কোডটি পিওর ব্রাউজার-ফ্রেন্ডলি জাভাস্ক্রিপ্ট বান্ডেল (<code className="bg-white px-1 py-0.5 rounded text-emerald-900 font-mono">assets/app.js</code>, <code className="bg-white px-1 py-0.5 rounded text-emerald-900 font-mono">assets/app.css</code> ও <code className="bg-white px-1 py-0.5 rounded text-emerald-900 font-mono">.htaccess</code>)-এ রূপান্তর করেছি। নিচে দেওয়া তৈরি জিপটি আপলোড করলেই সাইট নিমেষেই চালু হবে!
              </p>
            </div>
          </div>

          {/* Download Action Section */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                <span>InfinityFree রেডি জিপ প্যাকেজ</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                এতে রয়েছে: index.html, .htaccess, এবং assets ফোল্ডার (app.js ও app.css)
              </p>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={isGenerating}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-900/30 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{progressMsg || 'প্যাকেজ তৈরি হচ্ছে...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>রেডি জিপ ডাউনলোড করুন</span>
                </>
              )}
            </button>
          </div>

          {isSuccess && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-900 font-bold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>জিপ ফাইল সফলভাবে ডাউনলোড হয়েছে! নিচের ৩টি ধাপ অনুসরণ করে আপলোড করুন।</span>
            </div>
          )}

          {/* Step by step guide */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-700" />
              <span>InfinityFree-তে আপলোড করার ৩টি সহজ ধাপ:</span>
            </h4>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  ১
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-xs">
                    InfinityFree ড্যাশবোর্ডে গিয়ে "File Manager" ওপেন করুন
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    InfinityFree Control Panel থেকে File Manager-এ ক্লিক করে <strong className="text-slate-800">htdocs</strong> নামের ফোল্ডারে প্রবেশ করুন।
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  ২
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-xs">
                    htdocs ফোল্ডারের পুরনো ফাইলগুলো মুছে ফেলুন
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    আগে যা যা ফাইল ছিল সব সিলেক্ট করে 'Delete' করে দিন, যাতে কোনো পুরোনো কনফ্লিক্ট না থাকে।
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  ৩
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-xs">
                    নতুন ডাউনলোড করা জিপ ফাইলটি আপলোড করে Extract করুন
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    জিপ ফাইলটি আপলোড করে রাইট ক্লিক করে <strong>Extract</strong> করুন, যেন <code className="bg-white px-1 border border-slate-300 rounded font-mono">index.html</code>, <code className="bg-white px-1 border border-slate-300 rounded font-mono">.htaccess</code> এবং <code className="bg-white px-1 border border-slate-300 rounded font-mono">assets</code> সরাসরি htdocs ফোল্ডারের ভেতরে থাকে।
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  ৪
                </div>
                <div>
                  <p className="font-semibold text-emerald-950 text-xs">
                    ফোনে নতুন আপডেট না দেখালে: ব্রাউজার ক্যাশ (Cache) ক্লিয়ার করুন
                  </p>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                    আগে ওয়েবসাইট ভিজিট করে থাকলে ফোনের মেমরিতে পুরনো কোড জমা থাকতে পারে। নতুন ফাইল দেওয়ার পর সাইটটি ফোনের ব্রাউজারের <strong>Incognito (গোপনীয়) ট্যাব</strong>-এ খুলে দেখুন অথবা ব্রাউজার সেটিংস থেকে <strong>Clear Cache</strong> করুন। সাথে সাথে নতুন আপডেট চালু হয়ে যাবে।
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Notice about AI Studio direct zip download */}
          <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-600 text-xs">
            <span className="font-bold text-slate-800">নোট:</span> এমনকি আপনি যদি AI Studio থেকে সরাসরি প্রজেক্ট ZIP-ও ডাউনলোড করে আনজিপ করেন, তবুও আমরা রুট ফোল্ডারে ব্রাউজার অটোমেটিক লোডার ও রুট <code className="font-mono text-slate-700">assets/app.js</code> এবং ক্যাশ প্রতিরোধ ব্যবস্থা যুক্ত করে দিয়েছি যাতে কোনো অবস্থাতেই আর সাদা স্ক্রিন বা পুরনো ভার্সন না আটকে থাকে!
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
          >
            বুঝেছি, বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};

import JSZip from 'jszip';

export const HTACCESS_CONTENT = `# Apache configuration for React SPA on InfinityFree & cPanel
# মেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . index.html [L]
</IfModule>

# MIME Types configuration for JavaScript Modules and Styles
<IfModule mod_mime.c>
  AddType application/javascript .js .mjs
  AddType text/css .css
  AddType image/svg+xml .svg
  AddType application/json .json
  AddType font/woff2 .woff2
</IfModule>

# Security and CORS headers
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
  Header set X-Content-Type-Options "nosniff"
</IfModule>

# Prevent aggressive caching so updates take effect immediately on all devices
<FilesMatch "\.(html|htm|js|css|json)$">
  FileETag None
  <IfModule mod_headers.c>
    Header unset ETag
    Header set Cache-Control "max-age=0, no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "Wed, 11 Jan 1984 05:00:00 GMT"
  </IfModule>
</FilesMatch>

# Caching ONLY for static media/images
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 day"
  ExpiresByType image/jpeg "access plus 1 day"
  ExpiresByType image/gif "access plus 1 day"
  ExpiresByType image/png "access plus 1 day"
  ExpiresByType image/webp "access plus 1 day"
</IfModule>
`;

export const STANDALONE_INDEX_HTML = `<!doctype html>
<html lang="bn">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <title>মেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার</title>
    <meta name="description" content="অনলাইন গো-খাদ্য স্টোর এবং প্রফেশনাল একাউন্টিং ও লেজার ম্যানেজমেন্ট সিস্টেম" />
    <meta property="og:title" content="মেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার" />
    <meta property="og:description" content="অনলাইন গো-খাদ্য স্টোর এবং প্রফেশনাল একাউন্টিং ও লেজার ম্যানেজমেন্ট সিস্টেম" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" crossorigin href="./assets/app.css?v=2.5">
    <script type="module" crossorigin src="./assets/app.js?v=2.5"></script>
  </head>
  <body class="font-sans antialiased text-slate-800 bg-slate-50 selection:bg-emerald-600 selection:text-white">
    <div id="root">
      <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; font-family: 'Hind Siliguri', sans-serif; text-align: center; padding: 20px;">
        <div style="width: 44px; height: 44px; border: 4px solid #e2e8f0; border-top-color: #059669; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
        <h2 style="margin-top: 16px; font-size: 20px; font-weight: 700; color: #0f172a;">মেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার</h2>
        <p style="margin-top: 6px; font-size: 14px; color: #64748b;">লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    </div>
  </body>
</html>
`;

export const INSTRUCTIONS_TXT = `=====================================================
মেসার্স ভাই ভাই ভুসি ও গো-খাদ্য ভাণ্ডার
InfinityFree.com এ ওয়েবসাইট আপলোড নির্দেশিকা
=====================================================

কেন আগের বার স্ক্রিন সাদা হয়েছিল?
-----------------------------------------------------
InfinityFree হলো একটি সাধারণ PHP/Apache ফ্রি হোস্টিং। 
আপনি যখন কাঁচা প্রজেক্ট সোর্স কোড ডাউনলোড করেছিলেন, তখন তাতে ছিল React-এর কাঁচা .tsx ফাইল। 
কোনো ব্রাউজার সরাসরি .tsx পড়তে পারে না (এর জন্য Node.js কম্পাইলার লাগে)। তাই স্ক্রিন সাদা হয়ে ছিল।

এই প্যাকেজে কী আছে?
-----------------------------------------------------
এই জিপটিতে সম্পূর্ণ কম্পাইল করা রেডি প্রডাকশন ফাইল রয়েছে:
1. index.html   (প্রধান ওয়েবপেজ)
2. .htaccess    (InfinityFree এর জন্য Apache রিরাইট ও কনফিগ)
3. assets/app.js (সম্পূর্ণ জাভাস্ক্রিপ্ট অ্যাপ্লিকেশন বান্ডেল)
4. assets/app.css (সব ডিজাইন ও স্টাইলিং)

৩টি সহজ ধাপে কীভাবে আপনার InfinityFree সাইটে আপলোড করবেন:
-----------------------------------------------------
ধাপ ১: InfinityFree ড্যাশবোর্ডে লগইন করুন (app.infinityfree.net) এবং আপনার একাউন্টে যান।
ধাপ ২: "File Manager" বাটনে ক্লিক করুন।
ধাপ ৩: "htdocs" নামের ফোল্ডারে ডাবল ক্লিক করে প্রবেশ করুন।
ধাপ ৪: htdocs ফোল্ডারে যদি আগের কোনো ফাইল বা ফোল্ডার থাকে, সব সিলেক্ট করে Delete করে দিন।
ধাপ ৫: এই জিপ ফাইলের ভেতরের ফাইলগুলো (index.html, .htaccess এবং assets ফোল্ডার) সরাসরি htdocs ফোল্ডারে আপলোড করুন।
        (অথবা জিপ ফাইলটি আপলোড করে "Extract" বাটনে চাপুন)।

ব্যাস! এবার আপনার ব্রাউজারে ওয়েবসাইটের লিঙ্কে প্রবেশ করুন। ওয়েবসাইট সাথে সাথে চালু হয়ে যাবে!
`;

export async function generateInfinityFreeZip(onProgress?: (msg: string) => void): Promise<Blob> {
  const zip = new JSZip();

  if (onProgress) onProgress('কনফিগারেশন ও এইচটিএমএল ফাইল তৈরি হচ্ছে...');
  zip.file('index.html', STANDALONE_INDEX_HTML);
  zip.file('.htaccess', HTACCESS_CONTENT);
  zip.file('README_কিভাবে_আপলোড_করবেন.txt', INSTRUCTIONS_TXT);

  const assetsFolder = zip.folder('assets');

  if (onProgress) onProgress('প্রডাকশন জাভাস্ক্রিপ্ট বান্ডেল সংগ্রহ করা হচ্ছে...');
  try {
    const jsRes = await fetch('./assets/app.js');
    if (jsRes.ok) {
      const jsText = await jsRes.text();
      assetsFolder?.file('app.js', jsText);
      assetsFolder?.file('app-v2.js', jsText);
    } else {
      throw new Error('assets/app.js not accessible');
    }
  } catch (err) {
    console.warn('Fallback fetching dist/assets/app.js', err);
    const jsRes = await fetch('./dist/assets/app.js');
    const jsText = await jsRes.text();
    assetsFolder?.file('app.js', jsText);
    assetsFolder?.file('app-v2.js', jsText);
  }

  if (onProgress) onProgress('স্টাইল ও সিএসএস কোড সংগ্রহ করা হচ্ছে...');
  try {
    const cssRes = await fetch('./assets/app.css');
    if (cssRes.ok) {
      const cssText = await cssRes.text();
      assetsFolder?.file('app.css', cssText);
      assetsFolder?.file('app-v2.css', cssText);
    } else {
      throw new Error('assets/app.css not accessible');
    }
  } catch (err) {
    console.warn('Fallback fetching dist/assets/app.css', err);
    const cssRes = await fetch('./dist/assets/app.css');
    const cssText = await cssRes.text();
    assetsFolder?.file('app.css', cssText);
    assetsFolder?.file('app-v2.css', cssText);
  }

  if (onProgress) onProgress('পণ্যের প্রাক-নির্ধারিত ছবিগুলো যোগ করা হচ্ছে...');
  const imagesFolder = zip.folder('images');
  const imageFiles = [
    'hero_cattle_feed_store_1792082237019.jpg',
    'product_wheat_bran_1792082237586.jpg',
    'product_mustard_oilcake_1792082237453.jpg',
    'product_pellet_feed_1792082238529.jpg',
    'product_bengal_gram_1792082239843.jpg',
  ];
  for (const img of imageFiles) {
    try {
      const res = await fetch(`./images/${img}`);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        imagesFolder?.file(img, buf);
      }
    } catch {
      // ignore
    }
  }

  if (onProgress) onProgress('জিপ ফাইল কম্প্রেশন হচ্ছে...');
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  return blob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

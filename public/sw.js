// Service worker minimal buat Cemilan Beku PWA.
// Tujuan utamanya: bikin web "installable" + shell app (logo, manifest) tetap
// kebuka walau sinyal lagi jelek. Data produk/harga TETAP butuh internet
// (sengaja network-first) biar gak pernah nampilin harga/stok basi.

const CACHE_NAME = 'cb-shell-v1';
const SHELL_ASSETS = ['/logo.png', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Cuma pegang aset shell milik web sendiri (bukan API Supabase, bukan
  // halaman navigasi) — biar data produk/harga selalu ambil yang terbaru.
  const isShellAsset = url.origin === self.location.origin && SHELL_ASSETS.includes(url.pathname);
  if (!isShellAsset) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

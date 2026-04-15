// 멈춤연습 Service Worker
// 전략: stale-while-revalidate (오프라인에서도 최근 본 페이지 열림, 온라인이면 즉시 최신화)

const CACHE = 'stopcall-v1';
const CORE = [
  '/',
  '/index.html',
  '/library.html',
  '/simulator.html',
  '/chapter.html',
  '/manifest.webmanifest',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/docs/workbook_ch1_stop5_routine.md',
  '/docs/workbook_ch2_smishing.md',
  '/docs/workbook_ch3_messenger.md',
  '/docs/workbook_ch4_romance.md',
  '/docs/workbook_ch5_ai_voice.md',
  '/docs/workbook_ch6_deepfake_video.md',
  '/docs/workbook_ch7_investment_scam.md',
  '/docs/workbook_ch8_health_product.md',
  '/docs/workbook_ch9_fake_welfare.md'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // 외부 도메인(CDN 등)은 패스
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

const CACHE = 'chat-v1';
const ASSETS = ['/', '/chat', '/manifest.json', '/favicon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Solo cachear peticiones GET de recursos estáticos de la misma origen.
  // Ignorar API, auth, login, register y cualquier método no GET para no romper login/chat.
  if (e.request.method !== 'GET') return;
  if (url.pathname.startsWith('/api')) return;
  if (url.pathname.startsWith('/login') || url.pathname.startsWith('/register')) return;
  if (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.png') || url.pathname.endsWith('.ico')) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
  }
});

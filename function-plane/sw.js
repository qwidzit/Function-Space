const CACHE = 'fp-v6';
const SHELL = [
  './',
  './index.html',
  './src/styles.css',
  './src/physics-config.js',
  './src/audio.js',
  './src/accounts.js',
  './src/ui-kit.jsx',
  './src/app-logo.jsx',
  './src/data.jsx',
  './src/main-screen.jsx',
  './src/pack-selector.jsx',
  './src/level-selector.jsx',
  './src/settings-screen.jsx',
  './src/keyboard.jsx',
  './src/level-screen.jsx',
  './src/level-complete.jsx',
  './src/how-to-play.jsx',
  './src/achievements.jsx',
  './src/account-screen.jsx',
  './src/app.jsx',
  './icons/icon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

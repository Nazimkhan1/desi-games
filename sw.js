/* Offline support: network-first (so new games and fixes reach everyone right away),
   falling back to the cache when there is no internet (pass-play & vs-computer still work). */
var CACHE = 'desi-games-v4';
var ASSETS = ['./','./index.html','./app.css','./i18n.js','./app.js','./net.js','./firebase-config.js','./firebase-net.js',
  './games/kattam-katti.js','./games/saanp-seedhi.js','./games/cricket.js','./games/nau-goti.js','./games/ludo.js','./games/bagh-bakri.js','./games/carrom.js','./games/patang.js','./games/chor-sipahi.js',
  './manifest.webmanifest','./icons/icon.svg','./icons/favicon.svg','./icons/icon-192.png'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return k !== CACHE ? caches.delete(k) : null; })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(fetch(req, { cache: 'no-cache' }).then(function (res) {
    if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(req).then(function (r) { return r || caches.match('./index.html'); });
  }));
});

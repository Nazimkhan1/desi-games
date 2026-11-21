/* Minimal offline cache — app shell works without internet (pass-play & vs-computer). */
var CACHE = 'desi-games-v1';
var ASSETS = ['./','./index.html','./app.css','./i18n.js','./app.js','./games/kattam-katti.js','./manifest.webmanifest','./icons/icon.svg'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.map(function (k) { return k !== CACHE ? caches.delete(k) : null; })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(function (r) { return r || fetch(e.request).catch(function(){ return caches.match('./index.html'); }); }));
});

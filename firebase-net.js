/* FirebaseTransport — real cross-device online, same room API as LocalTransport
 * (code, role, id, on(type,fn), send(type,data), close()). Activates ONLY when
 * window.DG_FIREBASE_CONFIG is set (see firebase-config.js + FIREBASE.md). Otherwise
 * the LocalTransport from net.js stays (same-browser tabs). Uses Firebase compat SDK
 * (global `firebase`) loaded on demand, Anonymous Auth, and Realtime Database.
 *
 * Data model:  /rooms/{code}/meta = { game, ts }
 *              /rooms/{code}/msgs = push-list of { t, from, ts, ...data }  (mirrors a channel)
 */
(function () {
  window.DG = window.DG || {};
  var cfg = window.DG_FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey || !cfg.databaseURL) return; // no config → keep LocalTransport

  var V = '10.12.5';
  function load(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = function () { rej(new Error('load ' + src)); }; document.head.appendChild(s); }); }

  var ready = (function () {
    return load('https://www.gstatic.com/firebasejs/' + V + '/firebase-app-compat.js')
      .then(function () { return load('https://www.gstatic.com/firebasejs/' + V + '/firebase-database-compat.js'); })
      .then(function () { return load('https://www.gstatic.com/firebasejs/' + V + '/firebase-auth-compat.js'); })
      .then(function () { firebase.initializeApp(cfg); return firebase.auth().signInAnonymously(); })
      .then(function () { return firebase.database(); })
      .catch(function (e) { console.error('[DG] Firebase init failed:', e && e.message); return null; });
  })();

  function realRoom(db, code, role, gameId) {
    // Per-instance id for message filtering (NOT the auth uid — two tabs in one
    // browser share the same anonymous uid, which would drop each other's messages).
    var myId = 'c' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    var msgs = db.ref('rooms/' + code + '/msgs');
    var handlers = {};
    msgs.on('child_added', function (snap) {
      var m = snap.val(); if (!m || m.from === myId) return;
      (handlers[m.t] || []).forEach(function (fn) { fn(m); });
    });
    return {
      code: code, role: role, gameId: gameId, id: myId,
      on: function (t, fn) { (handlers[t] = handlers[t] || []).push(fn); return this; },
      send: function (t, data) { msgs.push(Object.assign({ t: t, from: myId, ts: firebase.database.ServerValue.TIMESTAMP }, data || {})); },
      close: function () { try { msgs.off(); } catch (e) {} }
    };
  }

  // create() must return a room synchronously (to show the code now); wire real room once ready.
  function create(gameId) {
    var code = '' + Math.floor(1000 + Math.random() * 9000);
    var live = null, pend = { h: {}, q: [] };
    var proxy = {
      code: code, role: 'host', gameId: gameId, id: null,
      on: function (t, fn) { if (live) live.on(t, fn); else (pend.h[t] = pend.h[t] || []).push(fn); return this; },
      send: function (t, data) { if (live) live.send(t, data); else pend.q.push([t, data]); },
      close: function () { if (live) live.close(); }
    };
    ready.then(function (db) {
      if (!db) return;
      db.ref('rooms/' + code + '/meta').set({ game: gameId, ts: firebase.database.ServerValue.TIMESTAMP });
      live = realRoom(db, code, 'host', gameId); proxy.id = live.id;
      Object.keys(pend.h).forEach(function (t) { pend.h[t].forEach(function (fn) { live.on(t, fn); }); });
      pend.q.forEach(function (q) { live.send(q[0], q[1]); });
    });
    return proxy;
  }

  function join(code) {
    // No meta gate (avoids a host-write vs guest-read race). Just join the channel;
    // the host's 'start' reply carries the gameId, and app.js times out if none comes.
    return ready.then(function (db) {
      if (!db) return null;
      return realRoom(db, code, 'guest', null);
    });
  }

  DG.net = { create: create, join: join, available: true, kind: 'firebase' };
  console.log('[DG] Firebase online transport active');
})();

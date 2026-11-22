/* Online transport (abstracted). Phase-1 transport = LocalTransport (BroadcastChannel +
   localStorage) so two TABS on the same browser can share a room and play — proves the
   room/sync flow locally. Phase-2 = swap in a FirebaseTransport with the SAME room API
   (code, role, id, on(type,fn), send(type,data), close()) for real cross-device play. */
window.DG = window.DG || {};
DG.net = (function () {
  var PREFIX = 'dg-room-';
  var hasBC = (typeof BroadcastChannel !== 'undefined');

  function makeRoom(code, role, gameId) {
    var myId = Math.random().toString(36).slice(2, 8);
    var handlers = {};
    var ch = hasBC ? new BroadcastChannel(PREFIX + code) : null;
    if (ch) ch.onmessage = function (e) {
      var m = e.data; if (!m || m.from === myId) return;
      (handlers[m.t] || []).forEach(function (fn) { fn(m); });
    };
    // storage fallback (if BroadcastChannel missing): relay via localStorage events
    function onStorage(e) {
      if (!ch && e.key === PREFIX + code + '-msg' && e.newValue) {
        try { var m = JSON.parse(e.newValue); if (m.from !== myId) (handlers[m.t] || []).forEach(function (fn) { fn(m); }); } catch (x) {}
      }
    }
    if (!ch) window.addEventListener('storage', onStorage);
    return {
      code: code, role: role, gameId: gameId, id: myId,
      on: function (t, fn) { (handlers[t] = handlers[t] || []).push(fn); return this; },
      send: function (t, data) {
        var msg = Object.assign({ t: t, from: myId }, data || {});
        if (ch) ch.postMessage(msg);
        else { try { localStorage.setItem(PREFIX + code + '-msg', JSON.stringify(Object.assign({}, msg, { _r: Math.random() }))); } catch (x) {} }
      },
      close: function () { try { if (ch) ch.close(); else window.removeEventListener('storage', onStorage); } catch (x) {} }
    };
  }

  function create(gameId) {
    var code = '' + Math.floor(1000 + Math.random() * 9000);
    try { localStorage.setItem(PREFIX + code, JSON.stringify({ game: gameId, ts: Date.now() })); } catch (e) {}
    return makeRoom(code, 'host', gameId);
  }

  function join(code) {
    var raw; try { raw = localStorage.getItem(PREFIX + code); } catch (e) {}
    if (!raw) return Promise.resolve(null);
    var info; try { info = JSON.parse(raw); } catch (e) { return Promise.resolve(null); }
    return Promise.resolve(makeRoom(code, 'guest', info.game));
  }

  return { create: create, join: join, available: hasBC, kind: 'local' };
})();

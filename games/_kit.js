/* Shared helpers for the newer games (24 Nov): styles, timers, names, result screen.
   Older games keep their own copies; new games use DG.kit so each file stays about the game itself. */
(function () {
  var st = document.createElement('style'); st.id = 'dk-style';
  st.textContent =
    '.dk{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;user-select:none;-webkit-user-select:none;}' +
    '.dk-chip{font-family:var(--font-d);font-weight:800;font-size:1rem;padding:8px 16px;border-radius:999px;background:var(--panel);border:1px solid var(--line);text-align:center;}' +
    '.dk-stats{display:flex;gap:14px;font-family:var(--font-d);font-weight:700;font-size:.86rem;color:var(--ink-soft);flex-wrap:wrap;justify-content:center;} .dk-stats b{color:var(--ink);}' +
    '.dk-hint{font-family:var(--font-d);font-weight:600;font-size:.86rem;color:var(--ink-soft);min-height:2.6em;text-align:center;max-width:360px;white-space:pre-line;}' +
    '.dk-cv{width:min(96vw,440px);height:auto;display:block;border-radius:14px;box-shadow:var(--shadow);touch-action:none;cursor:pointer;}' +
    '.dk-big{border:0;cursor:pointer;font-family:var(--font-d);font-weight:800;font-size:1.15rem;padding:16px 0;width:min(86vw,340px);border-radius:16px;color:#2a1803;background:linear-gradient(135deg,#f5a524,#ffd36b);box-shadow:var(--shadow);touch-action:manipulation;}' +
    '.dk-big:disabled{opacity:.45;cursor:default;} .dk-big:active{transform:scale(.97);}' +
    '.dk-row{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;}' +
    '.dk-btn{border:0;cursor:pointer;font-family:var(--font-d);font-weight:800;font-size:1rem;padding:13px 22px;border-radius:14px;color:#2a1803;background:linear-gradient(135deg,#f5a524,#ffd36b);touch-action:manipulation;}' +
    '.dk-btn.ghost{background:var(--panel);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);} .dk-btn:disabled{opacity:.45;cursor:default;}' +
    '.dk-btn.ok{background:linear-gradient(135deg,#2ecc71,#7be0a0);} .dk-btn.no{background:linear-gradient(135deg,#ff5e6e,#ff9aa5);}' +
    '.dk-result{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;margin-top:20px;} .dk-result .rt{font-family:var(--font-d);font-weight:800;font-size:1.6rem;} .dk-result .em{font-size:3rem;}' +
    '.dk-setup{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;max-width:380px;} .dk-setup h3{font-family:var(--font-d);margin:6px 0 0;font-size:1.3rem;}' +
    '.dk-rules{font-size:.86rem;color:var(--ink-soft);line-height:1.5;margin:0;white-space:pre-line;}';
  document.head.appendChild(st);

  function css(id, text) { if (document.getElementById(id)) return; var s = document.createElement('style'); s.id = id; s.textContent = text; document.head.appendChild(s); }
  function el(tag, cls, html, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; }
  function btn(parent, txt, cls, fn) { var b = el('button', 'dk-btn' + (cls ? ' ' + cls : ''), null, parent); b.type = 'button'; b.textContent = txt; b.onclick = fn; return b; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function lang(table) { return function () { return table[DG.lang] || table.en; }; }
  // timers that all stop when the game is closed
  function clock() {
    var c = { dead: false, ids: [], raf: 0 };
    c.later = function (fn, ms) { var id = setTimeout(function () { if (!c.dead) fn(); }, ms); c.ids.push(id); return id; };
    c.loop = function (fn) { var last = performance.now(); cancelAnimationFrame(c.raf);
      (function f(now) { if (c.dead) return; var dt = Math.min(0.05, (now - last) / 1000); last = now; if (fn(dt, now) === false) return; c.raf = requestAnimationFrame(f); })(last); };
    c.stop = function () { cancelAnimationFrame(c.raf); c.ids.forEach(clearTimeout); c.ids = []; };
    c.kill = function () { c.dead = true; c.stop(); };
    return c;
  }
  function pname(mode, i) { var t = DG.t(); return mode === 'ai' ? (i ? t.computer : t.you) : (i ? t.p2 : t.p1); }
  function canvas(parent, w, h) {
    var cv = el('canvas', 'dk-cv', null, parent); cv.style.aspectRatio = w + '/' + h;
    var g = cv.getContext('2d');
    function size() { var css = cv.getBoundingClientRect().width || 360, dpr = Math.min(window.devicePixelRatio || 1, 2.5); cv.width = Math.round(css * dpr); cv.height = Math.round(css * h / w * dpr); }
    function begin() { var k = cv.width / w; g.setTransform(k, 0, 0, k, 0, 0); return g; }
    function at(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * w, (e.clientY - r.top) / r.height * h]; }
    window.addEventListener('resize', size);
    return { cv: cv, g: g, size: size, begin: begin, at: at, off: function () { window.removeEventListener('resize', size); } };
  }
  /* Result screen. o = {mode, winner (0|1|-1 draw), names:[a,b], sub, em, again, extra:[[label, fn]], onExit} */
  function result(root, o) {
    var t = DG.t(), w = o.winner;
    var kind = w < 0 ? 'draw' : (o.mode === 'ai' && w !== 0 ? 'lose' : 'win');
    DG.result(kind);
    var txt = o.txt || (w < 0 ? t.drawRes : (o.mode === 'ai' ? (w === 0 ? t.youWin : t.youLose) : t.wins(o.names[w])));
    root.innerHTML = '';
    var box = el('div', 'dk-result', null, root);
    el('div', 'em', o.em || (w < 0 ? '🤝' : (kind === 'lose' ? '🤖' : '🏆')), box);
    el('div', 'rt', null, box).textContent = txt;
    if (o.sub) el('div', 'dk-hint', null, box).textContent = o.sub;
    var acts = el('div', 'dk-row', null, box);
    btn(acts, t.rematch, '', o.again);
    (o.extra || []).forEach(function (x) { btn(acts, x[0], 'ghost', x[1]); });
    btn(acts, t.exitGame, 'ghost', function () { o.onExit && o.onExit(); });
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }

  DG.kit = { css: css, el: el, btn: btn, esc: esc, lang: lang, clock: clock, pname: pname, canvas: canvas, result: result, shuffle: shuffle, pick: pick, clamp: clamp };
})();

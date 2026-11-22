/* Bagh-Bakri (बाघ-बकरी, Bagh-Chal). 5x5 board with diagonals on alternate points.
   4 bagh (tigers) start in the corners; 20 bakriyan (goats) are placed one by one, then moved.
   Bagh moves one step along a line, or jumps over a bakri to the empty point just beyond (eats it).
   Bagh wins after eating 5 bakriyan; bakriyan win when no bagh can move. Goats move first.
   Long play with no eating (100 moves in the moving phase) ends in a draw.
   Modes: pass (P1 = bakri, P2 = bagh) / ai (you choose the side). Engine exposed as DG.bagh. */
(function () {
  if (!document.getElementById('bb-style')) {
    var st = document.createElement('style'); st.id = 'bb-style';
    st.textContent =
      '.bb{display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;}' +
      '.bb-chip{font-family:var(--font-d);font-weight:800;font-size:1rem;padding:8px 16px;border-radius:999px;background:var(--panel);border:1px solid var(--line);display:flex;align-items:center;gap:8px;}' +
      '.bb-stats{display:flex;gap:18px;font-family:var(--font-d);font-weight:700;font-size:.85rem;color:var(--ink-soft);}' +
      '.bb-board{width:min(92vw,340px);height:auto;display:block;border-radius:16px;box-shadow:var(--shadow);background:var(--wood,#e6d099);touch-action:manipulation;user-select:none;-webkit-user-select:none;}' +
      '.bb-line{stroke:rgba(74,49,24,.62);stroke-width:2.2;stroke-linecap:round;fill:none;}' +
      '.bb-spot{fill:rgba(74,49,24,.6);}' +
      '.bb-pc{stroke:rgba(0,0,0,.25);stroke-width:1;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35));}' +
      '.bb-em{font-size:19px;text-anchor:middle;dominant-baseline:central;pointer-events:none;}' +
      '.bb-dest{fill:rgba(63,174,155,.22);stroke:#2c8a5c;stroke-width:2;stroke-dasharray:3 3;}' +
      '.bb-eat{fill:rgba(230,96,74,.2);stroke:#c0392b;stroke-width:2.4;stroke-dasharray:4 3;}' +
      '.bb-sel{fill:none;stroke:#fff;stroke-width:3;}' +
      '.bb-can{fill:none;stroke:rgba(255,255,255,.75);stroke-width:2;stroke-dasharray:3 3;}' +
      '.bb-last{fill:none;stroke:var(--marigold,#f5a524);stroke-width:2.5;}' +
      '.bb-tap{fill:transparent;cursor:pointer;}' +
      '.bb-hint{font-family:var(--font-d);font-weight:600;font-size:.86rem;color:var(--ink-soft);min-height:1.3em;text-align:center;max-width:340px;}' +
      '.bb-setup{display:flex;flex-direction:column;align-items:center;gap:14px;margin-top:14px;text-align:center;}' +
      '.bb-setup h3{font-family:var(--font-d);font-weight:800;font-size:1.35rem;margin:0;}' +
      '.bb-opt{border:1px solid var(--line);cursor:pointer;width:min(86vw,300px);text-align:left;font-family:var(--font-d);padding:12px 16px;border-radius:14px;background:var(--panel-2,rgba(255,255,255,.06));color:var(--ink);}' +
      '.bb-opt b{display:block;font-weight:800;font-size:1.08rem;} .bb-opt small{font-weight:600;font-size:.8rem;color:var(--ink-soft);}' +
      '.bb-rules{font-size:.8rem;color:var(--ink-soft);max-width:320px;line-height:1.5;}' +
      '.bb-result{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;margin-top:20px;} .bb-result .rt{font-family:var(--font-d);font-weight:800;font-size:1.6rem;}' +
      '.bb-acts{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;} .bb-btn{border:0;cursor:pointer;font-family:var(--font-d);font-weight:800;font-size:1rem;padding:13px 22px;border-radius:14px;color:#2a1803;background:linear-gradient(135deg,var(--marigold,#f5a524),var(--marigold2,#ffd36b));} .bb-btn.ghost{background:var(--panel);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);}';
    document.head.appendChild(st);
  }

  var BL = {
    hi:{ goat:'बकरी', tiger:'बाघ', place:'बकरी रखो', moveG:'बकरी चलाओ', moveT:'बाघ चलाओ — बकरी के ऊपर से कूदो तो खा जाओगे', hand:'हाथ में', eaten:'खाईं',
      pick:'तुम कौन बनोगे?', beGoat:'🐐 बकरी बनो', beGoatS:'20 बकरियाँ — चारों बाघ को घेर लो', beTiger:'🐯 बाघ बनो', beTigerS:'4 बाघ — 5 बकरियाँ खा जाओ',
      ate:'बाघ ने एक बकरी खा ली! 🐯', tigersWin:'🐯 बाघ जीत गए!', goatsWin:'🐐 बकरियों ने बाघ घेर लिए!', draw:'🤝 बराबरी — बहुत देर तक कोई नहीं खाया', side:'साइड बदलो',
      rules:'बकरी पहले चलती है। पहले 20 बकरियाँ एक-एक करके रखो, फिर लाइन पर एक कदम चलाओ। बाघ एक कदम चलता है या बकरी के ऊपर से कूदकर उसे खा जाता है। 5 बकरियाँ खा लीं तो बाघ जीते; कोई बाघ हिल न पाए तो बकरियाँ जीतीं।' },
    en:{ goat:'Goat', tiger:'Tiger', place:'place a goat', moveG:'move a goat', moveT:'move a tiger — jump over a goat to eat it', hand:'in hand', eaten:'eaten',
      pick:'Which side?', beGoat:'🐐 Play the goats', beGoatS:'20 goats — trap all four tigers', beTiger:'🐯 Play the tigers', beTigerS:'4 tigers — eat 5 goats',
      ate:'A tiger ate a goat! 🐯', tigersWin:'🐯 The tigers win!', goatsWin:'🐐 The goats trapped the tigers!', draw:'🤝 Draw — no one was eaten for a long time', side:'Switch side',
      rules:'Goats move first. Place the 20 goats one by one, then move them one step along a line. A tiger moves one step or jumps over a goat to eat it. Tigers win by eating 5 goats; goats win when no tiger can move.' },
    hinglish:{ goat:'Bakri', tiger:'Bagh', place:'bakri rakho', moveG:'bakri chalao', moveT:'bagh chalao — bakri ke upar se koodo to kha jaoge', hand:'haath mein', eaten:'khaayi',
      pick:'Tum kaun banoge?', beGoat:'🐐 Bakri bano', beGoatS:'20 bakriyan — chaaron bagh ko gher lo', beTiger:'🐯 Bagh bano', beTigerS:'4 bagh — 5 bakriyan kha jao',
      ate:'Bagh ne ek bakri kha li! 🐯', tigersWin:'🐯 Bagh jeet gaye!', goatsWin:'🐐 Bakriyon ne bagh gher liye!', draw:'🤝 Barabari — bahut der tak koi nahi khaya', side:'Side badlo',
      rules:'Bakri pehle chalti hai. Pehle 20 bakriyan ek-ek karke rakho, phir line par ek kadam chalao. Bagh ek kadam chalta hai ya bakri ke upar se koodkar use kha jaata hai. 5 bakriyan kha li to bagh jeete; koi bagh hil na paaye to bakriyan jeetin.' },
    bn:{ goat:'ছাগল', tiger:'বাঘ', place:'ছাগল রাখো', moveG:'ছাগল চালাও', moveT:'বাঘ চালাও — ছাগলের উপর দিয়ে লাফালে খেয়ে ফেলবে', hand:'হাতে', eaten:'খেয়েছে',
      pick:'তুমি কোন দিকে?', beGoat:'🐐 ছাগল হও', beGoatS:'২০টা ছাগল — চারটে বাঘকে ঘিরে ফেলো', beTiger:'🐯 বাঘ হও', beTigerS:'৪টে বাঘ — ৫টা ছাগল খেয়ে ফেলো',
      ate:'বাঘ একটা ছাগল খেয়ে ফেলল! 🐯', tigersWin:'🐯 বাঘ জিতেছে!', goatsWin:'🐐 ছাগলরা বাঘকে ঘিরে ফেলেছে!', draw:'🤝 ড্র — অনেকক্ষণ কেউ খায়নি', side:'দিক বদলাও',
      rules:'ছাগল আগে চলে। প্রথমে ২০টা ছাগল একে একে রাখো, তারপর লাইন ধরে এক ঘর চালাও। বাঘ এক ঘর যায় বা ছাগলের উপর দিয়ে লাফিয়ে তাকে খায়। ৫টা ছাগল খেলে বাঘ জেতে; কোনো বাঘ নড়তে না পারলে ছাগল জেতে।' }
  };
  function bl() { return BL[DG.lang] || BL.en; }

  /* ---------- engine ---------- */
  var G = 1, T = 2, GOATS = 20, WIN_EAT = 5, DRAW_QUIET = 100;
  var DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
  var STEP = [], JUMP = []; // STEP[i] = [to...], JUMP[i] = [[over, to]...]
  (function () {
    for (var i = 0; i < 25; i++) {
      var r = (i / 5) | 0, c = i % 5, diag = (r + c) % 2 === 0; STEP[i] = []; JUMP[i] = [];
      DIRS.forEach(function (d) {
        if (d[0] && d[1] && !diag) return;
        var r1 = r + d[0], c1 = c + d[1], r2 = r + 2 * d[0], c2 = c + 2 * d[1];
        if (r1 >= 0 && r1 < 5 && c1 >= 0 && c1 < 5) STEP[i].push(r1 * 5 + c1);
        if (r2 >= 0 && r2 < 5 && c2 >= 0 && c2 < 5) JUMP[i].push([r1 * 5 + c1, r2 * 5 + c2]);
      });
    }
  })();
  function fresh() { var b = new Array(25).fill(0); b[0] = b[4] = b[20] = b[24] = T; return { b: b, placed: 0, eaten: 0, turn: G, quiet: 0 }; }
  // move = [from, to, eatenIdx]; from = -1 for placing
  function moves(s) {
    var out = [], b = s.b, i, k;
    if (s.turn === G) {
      if (s.placed < GOATS) { for (i = 0; i < 25; i++) if (!b[i]) out.push([-1, i, -1]); }
      else for (i = 0; i < 25; i++) if (b[i] === G) for (k = 0; k < STEP[i].length; k++) if (!b[STEP[i][k]]) out.push([i, STEP[i][k], -1]);
    } else {
      for (i = 0; i < 25; i++) if (b[i] === T) {
        for (k = 0; k < STEP[i].length; k++) if (!b[STEP[i][k]]) out.push([i, STEP[i][k], -1]);
        for (k = 0; k < JUMP[i].length; k++) { var j = JUMP[i][k]; if (b[j[0]] === G && !b[j[1]]) out.push([i, j[1], j[0]]); }
      }
    }
    return out;
  }
  function apply(s, m) {
    var b = s.b.slice();
    if (m[0] >= 0) b[m[0]] = 0;
    b[m[1]] = s.turn;
    if (m[2] >= 0) b[m[2]] = 0;
    var placing = m[0] < 0;
    return { b: b, placed: s.placed + (placing ? 1 : 0), eaten: s.eaten + (m[2] >= 0 ? 1 : 0), turn: s.turn === G ? T : G,
      quiet: (placing || m[2] >= 0) ? 0 : s.quiet + 1 };
  }
  // winner for the side about to move: T, G, 'draw' or 0
  function result(s) {
    if (s.eaten >= WIN_EAT) return T;
    if (s.quiet >= DRAW_QUIET) return 'draw';
    if (!moves(s).length) return s.turn === T ? G : T;
    return 0;
  }
  var EDGE = []; for (var e = 0; e < 25; e++) { var er = (e / 5) | 0, ec = e % 5; EDGE[e] = (er === 0 || er === 4 || ec === 0 || ec === 4) ? 1 : 0; }
  function evalT(s) { // positive = good for tigers
    var r = result(s);
    if (r === T) return 10000 - s.placed; if (r === G) return -10000 + s.placed; if (r === 'draw') return 0;
    var b = s.b, mob = 0, eats = 0, trapped = 0, edge = 0, i, k;
    for (i = 0; i < 25; i++) {
      if (b[i] === G) edge += EDGE[i];
      if (b[i] !== T) continue;
      var m = 0;
      for (k = 0; k < STEP[i].length; k++) if (!b[STEP[i][k]]) m++;
      for (k = 0; k < JUMP[i].length; k++) { var j = JUMP[i][k]; if (b[j[0]] === G && !b[j[1]]) { eats++; m++; } }
      mob += m; if (!m) trapped++;
    }
    return s.eaten * 150 + eats * 40 + mob * 6 - trapped * 45 - edge * 3;
  }
  function ordered(s) { var ms = moves(s); ms.sort(function (x, y) { return (y[2] >= 0) - (x[2] >= 0); }); return ms; }
  var deadline = 0, aborted = false, nodes = 0;
  function search(s, depth, a, bt) {
    if ((++nodes & 1023) === 0 && Date.now() > deadline) aborted = true;
    if (aborted) return 0;
    var r = result(s);
    if (depth === 0 || r) return evalT(s);
    var ms = ordered(s), i, v;
    if (s.turn === T) { v = -1e9; for (i = 0; i < ms.length; i++) { v = Math.max(v, search(apply(s, ms[i]), depth - 1, a, bt)); a = Math.max(a, v); if (a >= bt) break; } }
    else { v = 1e9; for (i = 0; i < ms.length; i++) { v = Math.min(v, search(apply(s, ms[i]), depth - 1, a, bt)); bt = Math.min(bt, v); if (a >= bt) break; } }
    return v;
  }
  // iterative deepening within a time budget; keeps the best move of the deepest finished depth
  function aiPick(s, budgetMs) {
    var ms = moves(s).sort(function () { return Math.random() - .5; });
    var best = ms[0], maxT = s.turn === T;
    deadline = Date.now() + (budgetMs || 350); aborted = false; nodes = 0;
    for (var depth = 2; depth <= 8; depth++) {
      var bm = null, bv = maxT ? -1e9 : 1e9, a = -1e9, bt = 1e9;
      for (var i = 0; i < ms.length; i++) {
        var v = search(apply(s, ms[i]), depth - 1, a, bt);
        if (aborted) break;
        if (maxT ? v > bv : v < bv) { bv = v; bm = ms[i]; }
        if (maxT) a = Math.max(a, bv); else bt = Math.min(bt, bv);
      }
      if (aborted) break;
      best = bm; ms.splice(ms.indexOf(bm), 1); ms.unshift(bm);
      if (Math.abs(bv) > 9000) break;
    }
    return best;
  }
  DG.bagh = { fresh: fresh, moves: moves, apply: apply, result: result, aiPick: aiPick, STEP: STEP, JUMP: JUMP };

  /* ---------- UI ---------- */
  var U = 62, O = 26;
  function px(i) { return [O + (i % 5) * U, O + ((i / 5) | 0) * U]; }

  DG.register('bagh', {
    mount: function (wrap, opts) {
      var mode = opts.mode, X = bl();
      var root = document.createElement('div'); root.className = 'bb'; wrap.appendChild(root);
      var dead = false, timers = [];
      function later(fn, ms) { timers.push(setTimeout(function () { if (!dead) fn(); }, ms)); }
      var s, humanSide, sel, last, over, msg, chip, stats, boardWrap, hint;

      function isHuman(side) { return mode !== 'ai' || side === humanSide; }
      function name(side) {
        var nm = side === G ? X.goat : X.tiger;
        if (mode === 'ai') return (side === humanSide ? DG.t().you : DG.t().computer) + ' (' + nm + ')';
        return nm;
      }

      function setup() {
        X = bl(); root.innerHTML = '';
        var box = document.createElement('div'); box.className = 'bb-setup';
        box.innerHTML = '<h3>' + X.pick + '</h3>';
        [[G, X.beGoat, X.beGoatS], [T, X.beTiger, X.beTigerS]].forEach(function (o) {
          var b = document.createElement('button'); b.className = 'bb-opt';
          b.innerHTML = '<b>' + o[1] + '</b><small>' + o[2] + '</small>';
          b.onclick = function () { start(o[0]); };
          box.appendChild(b);
        });
        var r = document.createElement('p'); r.className = 'bb-rules'; r.textContent = X.rules; box.appendChild(r);
        root.appendChild(box);
      }

      function start(side) {
        X = bl(); humanSide = side; s = fresh(); sel = null; last = null; over = false; msg = '';
        root.innerHTML = '';
        chip = document.createElement('div'); chip.className = 'bb-chip';
        stats = document.createElement('div'); stats.className = 'bb-stats';
        boardWrap = document.createElement('div');
        hint = document.createElement('div'); hint.className = 'bb-hint';
        root.appendChild(chip); root.appendChild(stats); root.appendChild(boardWrap); root.appendChild(hint);
        boardWrap.addEventListener('click', function (e) { var t = e.target; if (t && t.classList.contains('bb-tap')) tap(+t.getAttribute('data-i')); });
        render(); maybeAi();
      }

      function legalFor(from) { return moves(s).filter(function (m) { return m[0] === from; }); }

      function render() {
        var ic = s.turn === G ? '🐐' : '🐯';
        chip.textContent = ic + ' ' + name(s.turn) + ' — ' + (s.turn === G ? (s.placed < GOATS ? X.place : X.moveG) : X.moveT);
        stats.innerHTML = '<span>🐐 ' + X.hand + ': ' + (GOATS - s.placed) + '</span><span>🐯 ' + X.eaten + ': ' + s.eaten + '/' + WIN_EAT + '</span>';
        hint.textContent = msg || '';
        var human = isHuman(s.turn) && !over, all = human ? moves(s) : [];
        var dests = sel != null ? legalFor(sel) : [];
        var movable = {}; all.forEach(function (m) { if (m[0] >= 0) movable[m[0]] = 1; });
        var W = O * 2 + U * 4, h = '<svg class="bb-board" viewBox="0 0 ' + W + ' ' + W + '" xmlns="http://www.w3.org/2000/svg">';
        var a = px(0), z = px(24);
        for (var k = 0; k < 5; k++) {
          h += '<line class="bb-line" x1="' + a[0] + '" y1="' + px(k * 5)[1] + '" x2="' + z[0] + '" y2="' + px(k * 5)[1] + '"/>';
          h += '<line class="bb-line" x1="' + px(k)[0] + '" y1="' + a[1] + '" x2="' + px(k)[0] + '" y2="' + z[1] + '"/>';
        }
        [[0, 24], [4, 20], [2, 10], [10, 22], [22, 14], [14, 2]].forEach(function (l) { var p = px(l[0]), q = px(l[1]); h += '<line class="bb-line" x1="' + p[0] + '" y1="' + p[1] + '" x2="' + q[0] + '" y2="' + q[1] + '"/>'; });
        for (var i = 0; i < 25; i++) {
          var p = px(i), v = s.b[i];
          h += '<circle class="bb-spot" cx="' + p[0] + '" cy="' + p[1] + '" r="4"/>';
          var d = dests.filter(function (m) { return m[1] === i; })[0];
          if (d) h += '<circle class="' + (d[2] >= 0 ? 'bb-eat' : 'bb-dest') + '" cx="' + p[0] + '" cy="' + p[1] + '" r="17"/>';
          if (human && s.turn === G && s.placed < GOATS && !v) h += '<circle class="bb-dest" cx="' + p[0] + '" cy="' + p[1] + '" r="9" opacity=".55"/>';
          if (last === i) h += '<circle class="bb-last" cx="' + p[0] + '" cy="' + p[1] + '" r="22"/>';
          if (v) {
            h += '<circle class="bb-pc" cx="' + p[0] + '" cy="' + p[1] + '" r="19" fill="' + (v === T ? '#e8892b' : '#fbf6ea') + '"/>';
            h += '<text class="bb-em" x="' + p[0] + '" y="' + (p[1] + 1) + '">' + (v === T ? '🐯' : '🐐') + '</text>';
            if (sel === i) h += '<circle class="bb-sel" cx="' + p[0] + '" cy="' + p[1] + '" r="22"/>';
            else if (movable[i]) h += '<circle class="bb-can" cx="' + p[0] + '" cy="' + p[1] + '" r="22"/>';
          }
          h += '<circle class="bb-tap" data-i="' + i + '" cx="' + p[0] + '" cy="' + p[1] + '" r="27"/>';
        }
        boardWrap.innerHTML = h + '</svg>';
      }

      function tap(i) {
        if (over || !isHuman(s.turn)) return;
        var all = moves(s);
        if (s.turn === G && s.placed < GOATS) { var pm = all.filter(function (m) { return m[1] === i; })[0]; if (pm) play(pm); return; }
        if (s.b[i] === s.turn) { sel = sel === i ? null : (legalFor(i).length ? i : null); render(); return; }
        if (sel != null) {
          var mv = legalFor(sel).filter(function (m) { return m[1] === i; })[0];
          if (mv) play(mv);
        }
      }

      function play(m) {
        msg = m[2] >= 0 ? X.ate : '';
        s = apply(s, m); sel = null; last = m[1];
        var r = result(s);
        if (r) { render(); return later(function () { finish(r); }, 700); }
        render(); maybeAi();
      }

      function maybeAi() {
        if (over || isHuman(s.turn)) return;
        later(function () { play(aiPick(s, 450)); }, 250);
      }

      function finish(r) {
        over = true; root.innerHTML = '';
        var txt, em;
        if (r === 'draw') { txt = X.draw; em = '🤝'; }
        else if (mode === 'ai') { txt = r === humanSide ? DG.t().youWin : DG.t().youLose; em = r === T ? '🐯' : '🐐'; }
        else { txt = r === T ? X.tigersWin : X.goatsWin; em = r === T ? '🐯' : '🐐'; }
        var box = document.createElement('div'); box.className = 'bb-result';
        box.innerHTML = '<div style="font-size:3rem">' + em + '</div><div class="rt"></div>';
        box.querySelector('.rt').textContent = txt;
        var sub = document.createElement('div'); sub.className = 'bb-hint'; sub.textContent = r === 'draw' ? '' : (r === T ? X.tigersWin : X.goatsWin); if (mode === 'ai' && r !== 'draw') box.appendChild(sub);
        var acts = document.createElement('div'); acts.className = 'bb-acts';
        var again = document.createElement('button'); again.className = 'bb-btn'; again.textContent = DG.t().rematch; again.onclick = function () { start(humanSide); };
        acts.appendChild(again);
        if (mode === 'ai') { var sw = document.createElement('button'); sw.className = 'bb-btn ghost'; sw.textContent = X.side; sw.onclick = function () { start(humanSide === G ? T : G); }; acts.appendChild(sw); }
        var exit = document.createElement('button'); exit.className = 'bb-btn ghost'; exit.textContent = DG.t().exitGame; exit.onclick = function () { opts.onExit && opts.onExit(); };
        acts.appendChild(exit); box.appendChild(acts); root.appendChild(box);
      }

      if (mode === 'ai') setup(); else start(G);
      return {
        destroy: function () { dead = true; timers.forEach(clearTimeout); wrap.innerHTML = ''; },
        _state: function () { return s; }
      };
    }
  });
})();

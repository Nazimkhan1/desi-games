/* Carrom (कैरम). 2 players: Safed (white, bottom) vs Kaala (black, top). Modes: pass / ai (you = white).
   Controls: slide the striker along your baseline with the slider, then drag anywhere on the board
   and let go (like a gulel / slingshot) — pull back, it shoots the other way; longer pull = harder.
   Rules (simple home rules):
   - pocket your own coin → shoot again; opponent's coin pocketed by you goes to them
   - Rani (queen): pocket it, then "cover" it by pocketing your own coin in the same or the next shot,
     otherwise it comes back to the centre
   - striker in a pocket = foul: one of your pocketed coins comes back, turn over
   - your last coin only counts once the Rani is covered (else it comes back)
   - first to pocket all 9 wins; points = opponent's coins left (+3 if you covered the Rani).
   Physics engine is exposed as DG.carrom for tests. */
(function () {
  if (!document.getElementById('cr-style')) {
    var st = document.createElement('style'); st.id = 'cr-style';
    st.textContent =
      '.cr{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;}' +
      '.cr-chip{font-family:var(--font-d);font-weight:800;font-size:1rem;padding:8px 16px;border-radius:999px;background:var(--panel);border:1px solid var(--line);display:flex;align-items:center;gap:8px;}' +
      '.cr-chip i{width:14px;height:14px;border-radius:50%;display:inline-block;box-shadow:0 0 0 2px rgba(255,255,255,.5);}' +
      '.cr-stats{display:flex;gap:16px;font-family:var(--font-d);font-weight:700;font-size:.84rem;color:var(--ink-soft);flex-wrap:wrap;justify-content:center;}' +
      '.cr-stats b{color:var(--ink);}' +
      '.cr-cv{width:min(94vw,420px);height:min(94vw,420px);display:block;border-radius:14px;box-shadow:var(--shadow);touch-action:none;user-select:none;-webkit-user-select:none;}' +
      '.cr-slide{width:min(80vw,340px);accent-color:var(--marigold,#f5a524);height:28px;}' +
      '.cr-slide:disabled{opacity:.35;}' +
      '.cr-hint{font-family:var(--font-d);font-weight:600;font-size:.85rem;color:var(--ink-soft);min-height:1.3em;text-align:center;max-width:360px;}' +
      '.cr-result{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;margin-top:20px;} .cr-result .rt{font-family:var(--font-d);font-weight:800;font-size:1.6rem;}' +
      '.cr-acts{display:flex;gap:10px;} .cr-btn{border:0;cursor:pointer;font-family:var(--font-d);font-weight:800;font-size:1rem;padding:13px 22px;border-radius:14px;color:#2a1803;background:linear-gradient(135deg,var(--marigold,#f5a524),var(--marigold2,#ffd36b));} .cr-btn.ghost{background:var(--panel);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);}';
    document.head.appendChild(st);
  }

  var CL = {
    hi:{ white:'सफ़ेद', black:'काला', queen:'रानी', left:'बची', turn:function(n){return n+' की बारी';},
      aim:'नीचे स्लाइडर से स्ट्राइकर रखो, फिर बोर्ड पर उंगली पीछे खींचकर छोड़ो (गुलेल की तरह)', blocked:'यहाँ गोटी है — स्ट्राइकर थोड़ा खिसकाओ',
      again:'गोटी गई! एक और चाल 👍', foul:'स्ट्राइकर पॉकेट में — फ़ाउल! एक गोटी वापस', queenIn:'रानी गई! अब अपनी एक गोटी डालकर ढको', covered:'रानी ढक गई! 👑 +3', queenBack:'रानी ढकी नहीं — वापस बीच में',
      lastBack:'पहले रानी ढको — आख़िरी गोटी वापस', thinking:'कंप्यूटर निशाना लगा रहा…', points:function(p){return p+' पॉइंट';}, rules:'' },
    en:{ white:'White', black:'Black', queen:'Queen', left:'left', turn:function(n){return n+"'s turn";},
      aim:'Place the striker with the slider, then pull back on the board and let go (like a slingshot)', blocked:'A coin is in the way — move the striker a little',
      again:'Pocketed! Shoot again 👍', foul:'Striker pocketed — foul! One coin comes back', queenIn:'Queen pocketed! Now cover it with one of your coins', covered:'Queen covered! 👑 +3', queenBack:'Queen not covered — back to the centre',
      lastBack:'Cover the queen first — last coin comes back', thinking:'Computer is aiming…', points:function(p){return p+' points';}, rules:'' },
    hinglish:{ white:'Safed', black:'Kaala', queen:'Rani', left:'bachi', turn:function(n){return n+' ki baari';},
      aim:'Neeche slider se striker rakho, phir board par ungli peeche kheench kar chhodo (gulel ki tarah)', blocked:'Yahan goti hai — striker thoda khiskao',
      again:'Goti gayi! Ek aur chaal 👍', foul:'Striker pocket mein — foul! Ek goti wapas', queenIn:'Rani gayi! Ab apni ek goti daal kar dhako', covered:'Rani dhak gayi! 👑 +3', queenBack:'Rani dhaki nahi — wapas beech mein',
      lastBack:'Pehle Rani dhako — aakhri goti wapas', thinking:'Computer nishana laga raha…', points:function(p){return p+' point';}, rules:'' },
    bn:{ white:'সাদা', black:'কালো', queen:'রানি', left:'বাকি', turn:function(n){return n+'-এর পালা';},
      aim:'নিচের স্লাইডারে স্ট্রাইকার রাখো, তারপর বোর্ডে আঙুল পেছনে টেনে ছাড়ো (গুলতির মতো)', blocked:'এখানে গুটি আছে — স্ট্রাইকার একটু সরাও',
      again:'গুটি পড়েছে! আরেকটা চাল 👍', foul:'স্ট্রাইকার পকেটে — ফাউল! একটা গুটি ফেরত', queenIn:'রানি পড়েছে! এবার নিজের একটা গুটি ফেলে ঢাকো', covered:'রানি ঢাকা হয়েছে! 👑 +3', queenBack:'রানি ঢাকা হয়নি — আবার মাঝখানে',
      lastBack:'আগে রানি ঢাকো — শেষ গুটি ফেরত', thinking:'কম্পিউটার নিশানা করছে…', points:function(p){return p+' পয়েন্ট';}, rules:'' }
  };
  function cl() { return CL[DG.lang] || CL.en; }

  /* ---------- physics (board units: playing surface 740 x 740) ---------- */
  var W = 740, RC = 15.9, RS = 21, PR = 24, PC = 25;          // coin, striker, pocket radius, pocket centre inset
  var POCKETS = [[PC, PC], [W - PC, PC], [PC, W - PC], [W - PC, W - PC]];
  var BASE = [W - 104, 104], BX0 = 168, BX1 = W - 168;          // baseline y for player 0 (bottom) / 1 (top)
  var DEC = 430, DAMP = 0.55, E_WALL = 0.72, E_BALL = 0.9, VMAX = 2300, DT = 1 / 240;

  function layout() {
    var c = W / 2, b = [{ k: 'q', x: c, y: c }], i, a;
    var ring1 = ['w', 'b', 'w', 'b', 'w', 'b'];
    for (i = 0; i < 6; i++) { a = i * Math.PI / 3; b.push({ k: ring1[i], x: c + Math.cos(a) * 2.02 * RC, y: c + Math.sin(a) * 2.02 * RC }); }
    for (i = 0; i < 12; i++) {
      a = i * Math.PI / 6; var d = (i % 2 === 0 ? 3.5 : 4.04) * RC;
      b.push({ k: i % 2 === 0 ? 'w' : 'b', x: c + Math.cos(a + Math.PI / 6) * d, y: c + Math.sin(a + Math.PI / 6) * d });
    }
    return b.map(function (o) { return { k: o.k, x: o.x, y: o.y, vx: 0, vy: 0, r: RC, m: 1, in: false }; });
  }
  function step(bs) {
    var i, j, a, b;
    for (i = 0; i < bs.length; i++) {
      a = bs[i]; if (a.in) continue;
      var sp = Math.hypot(a.vx, a.vy); if (!sp) continue;
      var ns = Math.max(0, sp - DEC * DT - sp * DAMP * DT);
      if (ns < 3) { a.vx = a.vy = 0; } else { a.vx *= ns / sp; a.vy *= ns / sp; }
      a.x += a.vx * DT; a.y += a.vy * DT;
      if (a.x < a.r) { a.x = a.r; a.vx = -a.vx * E_WALL; } else if (a.x > W - a.r) { a.x = W - a.r; a.vx = -a.vx * E_WALL; }
      if (a.y < a.r) { a.y = a.r; a.vy = -a.vy * E_WALL; } else if (a.y > W - a.r) { a.y = W - a.r; a.vy = -a.vy * E_WALL; }
    }
    for (i = 0; i < bs.length; i++) {
      a = bs[i]; if (a.in) continue;
      for (j = i + 1; j < bs.length; j++) {
        b = bs[j]; if (b.in) continue;
        var dx = b.x - a.x, dy = b.y - a.y, rr = a.r + b.r, d2 = dx * dx + dy * dy;
        if (d2 >= rr * rr || d2 === 0) continue;
        var d = Math.sqrt(d2), nx = dx / d, ny = dy / d, ov = rr - d, im = 1 / a.m + 1 / b.m;
        a.x -= nx * ov * (1 / a.m) / im; a.y -= ny * ov * (1 / a.m) / im;
        b.x += nx * ov * (1 / b.m) / im; b.y += ny * ov * (1 / b.m) / im;
        var vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (vn < 0) { var jj = -(1 + E_BALL) * vn / im; a.vx -= jj * nx / a.m; a.vy -= jj * ny / a.m; b.vx += jj * nx / b.m; b.vy += jj * ny / b.m; }
      }
    }
    var moving = false;
    for (i = 0; i < bs.length; i++) {
      a = bs[i]; if (a.in) continue;
      for (j = 0; j < 4; j++) { var p = POCKETS[j]; if (Math.hypot(a.x - p[0], a.y - p[1]) < PR) { a.in = true; a.vx = a.vy = 0; break; } }
      if (!a.in && (a.vx || a.vy)) moving = true;
    }
    return moving;
  }
  function striker(x, side) { return { k: 's', x: x, y: BASE[side], vx: 0, vy: 0, r: RS, m: 2.2, in: false }; }
  function clone(bs) { return bs.map(function (o) { return { k: o.k, x: o.x, y: o.y, vx: o.vx, vy: o.vy, r: o.r, m: o.m, in: o.in }; }); }
  function blockedAt(bs, x, side) { var y = BASE[side]; for (var i = 0; i < bs.length; i++) { var o = bs[i]; if (!o.in && o.k !== 's' && Math.hypot(o.x - x, o.y - y) < RS + o.r + 1) return true; } return false; }
  // run a whole shot without drawing; returns the bodies after everything stops
  function simulate(bs, x, side, ang, pow) {
    var b = clone(bs).filter(function (o) { return !o.in; }), s = striker(x, side);
    s.vx = Math.cos(ang) * pow * VMAX; s.vy = Math.sin(ang) * pow * VMAX; b.push(s);
    for (var n = 0; n < 240 * 12 && step(b); n++);
    return b;
  }
  function freeSpot(bs) { // nearest free place to the centre, for coins that come back
    var c = W / 2;
    for (var r = 0; r < 200; r += 6) for (var a = 0; a < 6.283; a += 0.35) {
      var x = c + Math.cos(a) * r, y = c + Math.sin(a) * r, ok = true;
      for (var i = 0; i < bs.length; i++) { var o = bs[i]; if (!o.in && Math.hypot(o.x - x, o.y - y) < o.r + RC + 0.5) { ok = false; break; } }
      if (ok) return [x, y];
      if (!r) break;
    }
    return [c, c];
  }

  /* ---------- AI: ghost-ball candidates, then full simulation ---------- */
  function aiShot(bs, side, mine, wantQueen) {
    var live = bs.filter(function (o) { return !o.in; }), cands = [];
    var targets = live.filter(function (o) { return o.k === mine || (o.k === 'q' && wantQueen); });
    if (!targets.length) targets = live.filter(function (o) { return o.k === 'q'; });
    function clear(x1, y1, x2, y2, rad, skip) {
      var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
      for (var i = 0; i < live.length; i++) {
        var o = live[i]; if (skip.indexOf(o) >= 0) continue;
        var t = ((o.x - x1) * dx + (o.y - y1) * dy) / (L * L); if (t < 0 || t > 1) continue;
        if (Math.hypot(x1 + dx * t - o.x, y1 + dy * t - o.y) < rad + o.r) return false;
      }
      return true;
    }
    for (var xi = 0; xi <= 12; xi++) {
      var x = BX0 + (BX1 - BX0) * xi / 12; if (blockedAt(live, x, side)) continue;
      var sy = BASE[side];
      targets.forEach(function (c) {
        POCKETS.forEach(function (p) {
          var dx = p[0] - c.x, dy = p[1] - c.y, dl = Math.hypot(dx, dy); dx /= dl; dy /= dl;
          var gx = c.x - dx * (RC + RS), gy = c.y - dy * (RC + RS);
          var ax = gx - x, ay = gy - sy, al = Math.hypot(ax, ay); if (al < 5) return;
          var cos = (ax * dx + ay * dy) / al; if (cos < 0.35) return;
          if (!clear(x, sy, gx, gy, RS, [c]) || !clear(c.x, c.y, p[0], p[1], RC, [c])) return;
          cands.push({ x: x, ang: Math.atan2(ay, ax), score: cos * 2 - (al + dl) / 900, dist: al + dl, cos: cos });
        });
      });
    }
    cands.sort(function (a, b) { return b.score - a.score; });
    cands = cands.slice(0, 18);
    var opp = mine === 'w' ? 'b' : 'w', best = null, bv = -1e9;
    function grade(after) {
      var v = 0;
      after.forEach(function (o, i) {
        if (!o.in) return;
        var was = live[i] && !live[i].in;
        if (o.k === 's') v -= 25; else if (o.k === mine && was) v += 12; else if (o.k === opp && was) v -= 7; else if (o.k === 'q' && was) v += wantQueen ? 14 : 2;
      });
      return v;
    }
    cands.forEach(function (c) {
      [0.32, 0.45, 0.62].forEach(function (base) {
        var pw = Math.min(1, base + c.dist / 4200 + (1 - c.cos) * .25);
        var v = grade(simulate(live, c.x, side, c.ang, pw)) + c.score;
        if (v > bv) { bv = v; best = { x: c.x, ang: c.ang, pow: pw }; }
      });
    });
    if (!best || bv < 1) { // nothing good: a few random pushes toward the coins, pick the least harmful
      for (var t = 0; t < 14; t++) {
        var x2 = BX0 + Math.random() * (BX1 - BX0); if (blockedAt(live, x2, side)) continue;
        var tg = targets[Math.floor(Math.random() * targets.length)] || live[0];
        var ang = Math.atan2(tg.y - BASE[side], tg.x - x2) + (Math.random() - .5) * .3, pw = .35 + Math.random() * .4;
        var v2 = grade(simulate(live, x2, side, ang, pw));
        if (!best || v2 > bv) { bv = v2; best = { x: x2, ang: ang, pow: pw }; }
      }
    }
    if (!best) best = { x: W / 2, ang: side ? Math.PI / 2 : -Math.PI / 2, pow: .5 };
    return best;
  }
  DG.carrom = { W: W, layout: layout, step: step, simulate: simulate, aiShot: aiShot, blockedAt: blockedAt, POCKETS: POCKETS, BASE: BASE };

  /* ---------- drawing ---------- */
  var F = 34, TOT = W + 2 * F;
  function drawBoard(g) {
    var gr = g.createLinearGradient(0, 0, TOT, TOT); gr.addColorStop(0, '#5a3418'); gr.addColorStop(1, '#3b2010');
    g.fillStyle = gr; g.fillRect(0, 0, TOT, TOT);
    g.save(); g.translate(F, F);
    var s = g.createRadialGradient(W / 2, W / 2, 40, W / 2, W / 2, W * .75); s.addColorStop(0, '#f1dcaa'); s.addColorStop(1, '#dcbf85');
    g.fillStyle = s; g.fillRect(0, 0, W, W);
    g.strokeStyle = 'rgba(90,50,20,.07)'; g.lineWidth = 1;
    for (var k = 0; k < W; k += 9) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 30 * Math.sin(k), W); g.stroke(); }
    g.strokeStyle = '#3a2412'; g.lineWidth = 2;
    // baselines on all four sides (double line with red circles at the ends)
    for (var side = 0; side < 4; side++) {
      g.save(); g.translate(W / 2, W / 2); g.rotate(side * Math.PI / 2); g.translate(-W / 2, -W / 2);
      var y = W - 104;
      g.beginPath(); g.moveTo(BX0, y - RS); g.lineTo(BX1, y - RS); g.moveTo(BX0, y + RS); g.lineTo(BX1, y + RS); g.stroke();
      [BX0, BX1].forEach(function (x) { g.beginPath(); g.arc(x, y, RS, 0, 7); g.fillStyle = '#b8322a'; g.fill(); g.stroke(); });
      // corner arrow toward the pocket
      g.beginPath(); g.moveTo(W - 150, W - 150); g.lineTo(W - 62, W - 62); g.stroke();
      g.beginPath(); g.moveTo(W - 62, W - 62); g.lineTo(W - 80, W - 66); g.moveTo(W - 62, W - 62); g.lineTo(W - 66, W - 80); g.stroke();
      g.restore();
    }
    g.beginPath(); g.arc(W / 2, W / 2, 86, 0, 7); g.stroke();
    g.beginPath(); g.arc(W / 2, W / 2, 20, 0, 7); g.fillStyle = '#b8322a'; g.fill(); g.stroke();
    // pockets
    POCKETS.forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], PR, 0, 7); g.fillStyle = '#151008'; g.fill(); g.strokeStyle = '#2b1a0c'; g.lineWidth = 3; g.stroke(); });
    g.restore();
  }
  function drawPiece(g, o, bad) {
    var c = { w: ['#fbf3dd', '#cdbb90'], b: ['#3a2c22', '#1b130d'], q: ['#e0473a', '#9b2219'], s: bad ? ['#f0a0a0', '#b44'] : ['#e9f0ff', '#7d97c9'] }[o.k];
    g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 5; g.shadowOffsetY = 2;
    var gr = g.createRadialGradient(o.x - o.r * .3, o.y - o.r * .3, 2, o.x, o.y, o.r); gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]);
    g.beginPath(); g.arc(o.x, o.y, o.r, 0, 7); g.fillStyle = gr; g.fill(); g.restore();
    g.beginPath(); g.arc(o.x, o.y, o.r * .62, 0, 7); g.strokeStyle = o.k === 'b' ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.22)'; g.lineWidth = 1.5; g.stroke();
    if (o.k === 's') { g.beginPath(); g.arc(o.x, o.y, o.r * .3, 0, 7); g.strokeStyle = '#3156a8'; g.lineWidth = 2; g.stroke(); }
  }

  DG.register('carrom', {
    mount: function (wrap, opts) {
      var mode = opts.mode, X = cl();
      var root = document.createElement('div'); root.className = 'cr'; wrap.appendChild(root);
      var dead = false, timers = [], raf = 0;
      function later(fn, ms) { timers.push(setTimeout(function () { if (!dead) fn(); }, ms)); }

      var bodies, turn, sx, phase, aim, pocketedBy, queenPending, queenOwner, msg, shotStart;
      var chip = document.createElement('div'); chip.className = 'cr-chip';
      var stats = document.createElement('div'); stats.className = 'cr-stats';
      var cv = document.createElement('canvas'); cv.className = 'cr-cv';
      var slide = document.createElement('input'); slide.type = 'range'; slide.min = 0; slide.max = 1000; slide.value = 500; slide.className = 'cr-slide'; slide.setAttribute('aria-label', 'striker');
      var hint = document.createElement('div'); hint.className = 'cr-hint';
      var g = cv.getContext('2d');

      var COLOR = ['w', 'b'];
      function isHuman(p) { return mode !== 'ai' || p === 0; }
      function pname(p) { var nm = p ? X.black : X.white; if (mode === 'ai') return (p ? DG.t().computer : DG.t().you) + ' (' + nm + ')'; return nm; }
      function left(k) { return bodies.filter(function (o) { return o.k === k && !o.in; }).length; }

      function size() {
        var css = cv.getBoundingClientRect().width || 360, dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        cv.width = Math.round(css * dpr); cv.height = cv.width; draw();
      }
      function toBoard(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * TOT - F, (e.clientY - r.top) / r.height * TOT - F]; }

      function draw() {
        var k = cv.width / TOT; g.setTransform(k, 0, 0, k, 0, 0);
        drawBoard(g); g.save(); g.translate(F, F);
        bodies.forEach(function (o) { if (!o.in) drawPiece(g, o); });
        if (phase === 'aim' || phase === 'ai') {
          var bad = blockedAt(bodies, sx, turn);
          var s = striker(sx, turn);
          if (aim && aim.pow > 0.03) {
            var L = 60 + aim.pow * 260, ex = s.x + Math.cos(aim.ang) * L, ey = s.y + Math.sin(aim.ang) * L;
            g.setLineDash([10, 8]); g.strokeStyle = 'rgba(40,20,5,.55)'; g.lineWidth = 3;
            g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(s.x + Math.cos(aim.ang) * 900, s.y + Math.sin(aim.ang) * 900); g.stroke(); g.setLineDash([]);
            g.strokeStyle = aim.pow > .8 ? '#c0392b' : aim.pow > .5 ? '#e67e22' : '#2c9a5c'; g.lineWidth = 7; g.lineCap = 'round';
            g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(ex, ey); g.stroke();
          }
          drawPiece(g, s, bad);
        }
        g.restore();
      }

      function render() {
        X = cl();
        chip.innerHTML = '<i style="background:' + (turn ? '#2b2118' : '#fbf3dd') + '"></i>' + X.turn(pname(turn));
        var q = queenOwner != null ? ' 👑 ' + pname(queenOwner).split(' (')[0] : (left('q') ? '' : ' 👑 …');
        stats.innerHTML = '<span>⚪ ' + X.white + ': <b>' + left('w') + '</b> ' + X.left + '</span><span>⚫ ' + X.black + ': <b>' + left('b') + '</b> ' + X.left + '</span><span>' + X.queen + (left('q') ? ' 🔴' : '') + q + '</span>';
        slide.disabled = !(phase === 'aim' && isHuman(turn));
        hint.textContent = msg || (phase === 'aim' && isHuman(turn) ? (blockedAt(bodies, sx, turn) ? X.blocked : X.aim) : (phase === 'ai' ? X.thinking : ''));
        draw();
      }

      function start() {
        X = cl(); bodies = layout(); turn = 0; sx = W / 2; phase = 'aim'; aim = null; queenPending = null; queenOwner = null; msg = ''; pocketedBy = { w: [], b: [] };
        root.innerHTML = '';
        [chip, stats, cv, slide, hint].forEach(function (e) { root.appendChild(e); });
        slide.value = 500;
        size(); beginTurn();
      }

      function beginTurn() {
        phase = isHuman(turn) ? 'aim' : 'ai'; aim = null;
        sx = W / 2; slide.value = 500;
        if (blockedAt(bodies, sx, turn)) for (var d = 10; d < 300; d += 10) { if (!blockedAt(bodies, sx + d, turn)) { sx += d; break; } if (!blockedAt(bodies, sx - d, turn)) { sx -= d; break; } }
        slide.value = Math.round((sx - BX0) / (BX1 - BX0) * 1000);
        render();
        if (phase === 'ai') later(aiTurn, 500);
      }

      slide.oninput = function () { if (phase !== 'aim') return; sx = BX0 + (BX1 - BX0) * slide.value / 1000; msg = ''; render(); };

      var drag = null;
      cv.addEventListener('pointerdown', function (e) {
        if (phase !== 'aim' || !isHuman(turn)) return;
        drag = toBoard(e); try { cv.setPointerCapture(e.pointerId); } catch (er) {}
        e.preventDefault();
      });
      cv.addEventListener('pointermove', function (e) {
        if (!drag) return; var p = toBoard(e), dx = drag[0] - p[0], dy = drag[1] - p[1], L = Math.hypot(dx, dy);
        aim = L < 8 ? null : { ang: Math.atan2(dy, dx), pow: Math.min(1, L / 230) };
        msg = ''; render();
      });
      function release() {
        if (!drag) return; drag = null;
        if (aim && aim.pow > 0.05 && !blockedAt(bodies, sx, turn)) shoot(sx, aim.ang, aim.pow);
        else { aim = null; render(); }
      }
      cv.addEventListener('pointerup', release); cv.addEventListener('pointercancel', function () { drag = null; aim = null; render(); });

      function aiTurn() {
        if (phase !== 'ai') return;
        var mine = COLOR[turn];
        var wantQueen = left('q') > 0 && (left(mine) > 1 || queenOwner == null);
        var shot = aiShot(bodies, turn, mine, wantQueen);
        var err = (Math.random() - .5) * 0.085, perr = 1 + (Math.random() - .5) * .22; // human-like miss so the computer is beatable
        // slide the striker into place, show the aim, then shoot
        var from = sx, n = 0;
        (function glide() {
          n++; sx = from + (shot.x - from) * Math.min(1, n / 18); render();
          if (n < 18) return later(glide, 30);
          aim = { ang: shot.ang + err, pow: Math.min(1, shot.pow * perr) }; render();
          later(function () { shoot(sx, aim.ang, aim.pow); }, 650);
        })();
      }

      function shoot(x, ang, pow) {
        phase = 'shoot'; msg = ''; render();
        var s = striker(x, turn); s.vx = Math.cos(ang) * pow * VMAX; s.vy = Math.sin(ang) * pow * VMAX;
        shotStart = bodies.map(function (o) { return o.in; });
        bodies.push(s); aim = null;
        var steps = 0;
        (function frame() {
          if (dead) return;
          var moving = false;
          for (var i = 0; i < 4; i++) { moving = step(bodies); steps++; }
          draw();
          if (moving && steps < 240 * 14) raf = requestAnimationFrame(frame);
          else settle();
        })();
      }

      function backToCentre(o) { var p = freeSpot(bodies); o.in = false; o.x = p[0]; o.y = p[1]; o.vx = o.vy = 0; }

      function settle() {
        var s = bodies.pop(), mine = COLOR[turn], opp = COLOR[1 - turn];
        var newIn = bodies.filter(function (o, i) { return o.in && !shotStart[i]; });
        var ownIn = newIn.filter(function (o) { return o.k === mine; }), queenIn = newIn.some(function (o) { return o.k === 'q'; });
        var again = false, notes = [];
        if (s.in) {
          notes.push(X.foul);
          newIn.forEach(function (o) { if (o.k === mine || o.k === 'q') backToCentre(o); });
          var penalty = bodies.filter(function (o, i) { return o.in && o.k === mine; })[0]; if (penalty) backToCentre(penalty);
          if (queenPending === turn) { var qb = bodies.filter(function (o) { return o.k === 'q'; })[0]; if (qb.in) backToCentre(qb); queenPending = null; }
        } else {
          if (queenPending === turn) {
            if (ownIn.length) { queenOwner = turn; notes.push(X.covered); } else { backToCentre(bodies.filter(function (o) { return o.k === 'q'; })[0]); notes.push(X.queenBack); }
            queenPending = null;
          }
          if (queenIn) { if (ownIn.length) { queenOwner = turn; notes.push(X.covered); } else { queenPending = turn; notes.push(X.queenIn); } }
          if (ownIn.length || queenIn) again = true;
          if (ownIn.length && !queenIn && !notes.length) notes.push(X.again);
        }
        // last coin of a colour only counts once the queen is covered
        ['w', 'b'].forEach(function (k) {
          if (!left(k) && queenOwner == null) {
            var last = bodies.filter(function (o, i) { return o.k === k && o.in && !shotStart[i]; })[0] || bodies.filter(function (o) { return o.k === k; })[0];
            backToCentre(last); notes.push(X.lastBack); if (k === mine) again = false;
          }
        });
        msg = notes.join(' · ');
        var winner = !left('w') ? 0 : (!left('b') ? 1 : null);
        if (winner != null) { render(); return later(function () { finish(winner); }, 900); }
        if (!again) turn = 1 - turn;
        later(beginTurn, again ? 350 : 700);
      }

      function finish(w) {
        phase = 'over';
        var pts = left(COLOR[1 - w]) + (queenOwner === w ? 3 : 0);
        var txt = mode === 'ai' ? (w === 0 ? DG.t().youWin : DG.t().youLose) : DG.t().wins(pname(w));
        root.innerHTML = '';
        var box = document.createElement('div'); box.className = 'cr-result';
        box.innerHTML = '<div style="font-size:3rem">' + (w === 0 || mode !== 'ai' ? '🏆' : '🤖') + '</div><div class="rt"></div><div class="cr-hint"></div>';
        box.querySelector('.rt').textContent = txt;
        box.querySelector('.cr-hint').textContent = pname(w) + ' — ' + X.points(pts);
        var acts = document.createElement('div'); acts.className = 'cr-acts';
        var again = document.createElement('button'); again.className = 'cr-btn'; again.textContent = DG.t().rematch; again.onclick = start;
        var exit = document.createElement('button'); exit.className = 'cr-btn ghost'; exit.textContent = DG.t().exitGame; exit.onclick = function () { opts.onExit && opts.onExit(); };
        acts.appendChild(again); acts.appendChild(exit); box.appendChild(acts); root.appendChild(box);
      }

      var onResize = function () { if (phase !== 'over') size(); };
      window.addEventListener('resize', onResize);
      start();
      return {
        destroy: function () { dead = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout); window.removeEventListener('resize', onResize); wrap.innerHTML = ''; },
        _state: function () { return { bodies: bodies, turn: turn, phase: phase, queenOwner: queenOwner, queenPending: queenPending }; },
        _shoot: function (x, ang, pow) { if (phase === 'aim') { sx = x; shoot(x, ang, pow); } } // for tests
      };
    }
  });
})();

/* Kanche (कंचे) — the ring game, 2 players. Modes: pass / ai (you = Neela, blue).
   13 kanche sit in a plus shape inside a chalk ring drawn on mud.
   - First shot from the lakeer (throw line): place your goli with the slider.
   - Pull back on the ground and let go (like a gulel). Every kancha you knock out of the ring is yours
     and you shoot again.
   - Your goli stays where it stops: next time you shoot from there. If it stops inside the ring,
     it comes back to the lakeer.
   - Hit the other player's goli directly and you take one of their kanche (and shoot again).
   - When the ring is empty, whoever has more kanche wins.
   Physics + AI exposed as DG.kanche for tests. */
(function () {
  if (!document.getElementById('kc-style')) {
    var st = document.createElement('style'); st.id = 'kc-style';
    st.textContent =
      '.kc{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;}' +
      '.kc-chip{font-family:var(--font-d);font-weight:800;font-size:1rem;padding:8px 16px;border-radius:999px;background:var(--panel);border:1px solid var(--line);display:flex;align-items:center;gap:8px;}' +
      '.kc-chip i{width:14px;height:14px;border-radius:50%;display:inline-block;box-shadow:0 0 0 2px rgba(255,255,255,.5);}' +
      '.kc-stats{display:flex;gap:16px;font-family:var(--font-d);font-weight:700;font-size:.84rem;color:var(--ink-soft);flex-wrap:wrap;justify-content:center;}' +
      '.kc-stats b{color:var(--ink);}' +
      '.kc-cv{width:min(94vw,420px);height:min(94vw,420px);display:block;border-radius:14px;box-shadow:var(--shadow);touch-action:none;user-select:none;-webkit-user-select:none;}' +
      '.kc-slide{width:min(80vw,340px);accent-color:var(--marigold,#f5a524);height:28px;}' +
      '.kc-slide:disabled{opacity:.3;}' +
      '.kc-hint{font-family:var(--font-d);font-weight:600;font-size:.85rem;color:var(--ink-soft);min-height:2.6em;text-align:center;max-width:360px;}' +
      '.kc-result{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;margin-top:20px;} .kc-result .rt{font-family:var(--font-d);font-weight:800;font-size:1.6rem;}' +
      '.kc-acts{display:flex;gap:10px;} .kc-btn{border:0;cursor:pointer;font-family:var(--font-d);font-weight:800;font-size:1rem;padding:13px 22px;border-radius:14px;color:#2a1803;background:linear-gradient(135deg,var(--marigold,#f5a524),var(--marigold2,#ffd36b));} .kc-btn.ghost{background:var(--panel);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);}';
    document.head.appendChild(st);
  }

  var CL = {
    hi: { gotOut: function (n) { return n + ' कंचा बाहर, तुम्हारा!'; }, blue: 'नीला', red: 'लाल', ring: 'घेरे में', won: 'कंचे', turn: function (n) { return n + ' की बारी'; },
      aimLine: 'स्लाइडर से लकीर पर गोली रखो, फिर ज़मीन पर उंगली पीछे खींचकर छोड़ो (गुलेल की तरह)',
      aimLie: 'जहाँ गोली रुकी, वहीं से मारो — उंगली पीछे खींचकर छोड़ो', blocked: 'यहाँ कुछ रखा है — गोली थोड़ा खिसकाओ',
      out: function (n) { return n > 1 ? n + ' कंचे बाहर! एक और चाल 👍' : 'कंचा बाहर! एक और चाल 👍'; },
      steal: 'गोली मारी! एक कंचा छीन लिया 😎', inRing: 'गोली घेरे में रुकी — अगली बार लकीर से', thinking: 'कंप्यूटर निशाना लगा रहा…',
      got: function (n) { return n + ' कंचे'; }, rules: 'घेरे से कंचे बाहर निकालो — जो निकाला वो तुम्हारा। सामने वाले की गोली पर सीधी गोली मारो तो उसका एक कंचा तुम्हारा!' },
    en: { gotOut: function (n) { return n + ' out — yours!'; }, blue: 'Blue', red: 'Red', ring: 'in ring', won: 'won', turn: function (n) { return n + "'s turn"; },
      aimLine: 'Place your shooter on the line with the slider, then pull back on the ground and let go (like a slingshot)',
      aimLie: 'Shoot from where your shooter stopped — pull back and let go', blocked: 'Something is in the way — move a little',
      out: function (n) { return n > 1 ? n + ' marbles out! Shoot again 👍' : 'Marble out! Shoot again 👍'; },
      steal: 'Direct hit! You took one of their marbles 😎', inRing: 'Shooter stopped inside the ring — back to the line next time', thinking: 'Computer is aiming…',
      got: function (n) { return n + ' marbles'; }, rules: 'Knock marbles out of the ring to keep them. Hit the other shooter directly to take one of their marbles!' },
    hinglish: { gotOut: function (n) { return n + ' bahar — tumhara!'; }, blue: 'Neela', red: 'Laal', ring: 'ghere mein', won: 'kanche', turn: function (n) { return n + ' ki baari'; },
      aimLine: 'Slider se lakeer par goli rakho, phir zameen par ungli peeche kheench kar chhodo (gulel ki tarah)',
      aimLie: 'Jahan goli ruki, wahin se maaro — ungli peeche kheench kar chhodo', blocked: 'Yahan kuch rakha hai — goli thoda khiskao',
      out: function (n) { return n > 1 ? n + ' kanche bahar! Ek aur chaal 👍' : 'Kancha bahar! Ek aur chaal 👍'; },
      steal: 'Goli maari! Ek kancha chheen liya 😎', inRing: 'Goli ghere mein ruki — agli baar lakeer se', thinking: 'Computer nishana laga raha…',
      got: function (n) { return n + ' kanche'; }, rules: 'Ghere se kanche bahar nikalo — jo nikala wo tumhara. Saamne wale ki goli par seedhi goli maaro to uska ek kancha tumhara!' },
    bn: { gotOut: function (n) { return n + 'টা বাইরে — তোমার!'; }, blue: 'নীল', red: 'লাল', ring: 'বৃত্তে', won: 'মার্বেল', turn: function (n) { return n + '-এর পালা'; },
      aimLine: 'স্লাইডারে দাগের ওপর গুলি রাখো, তারপর মাটিতে আঙুল পেছনে টেনে ছাড়ো (গুলতির মতো)',
      aimLie: 'গুলি যেখানে থেমেছে সেখান থেকেই মারো — আঙুল পেছনে টেনে ছাড়ো', blocked: 'এখানে কিছু আছে — একটু সরাও',
      out: function (n) { return n > 1 ? n + 'টা মার্বেল বাইরে! আরেকটা চাল 👍' : 'মার্বেল বাইরে! আরেকটা চাল 👍'; },
      steal: 'সোজা গুলি! একটা মার্বেল কেড়ে নিলে 😎', inRing: 'গুলি বৃত্তের ভেতর থেমেছে — পরের বার দাগ থেকে', thinking: 'কম্পিউটার নিশানা করছে…',
      got: function (n) { return n + 'টা মার্বেল'; }, rules: 'বৃত্ত থেকে মার্বেল বার করো — যেটা বার করবে সেটা তোমার। অন্যের গুলিতে সোজা মারলে তার একটা মার্বেল তোমার!' }
  };
  function cl() { return CL[DG.lang] || CL.en; }

  /* ---------- physics (ground units 600 x 600) ---------- */
  var W = 600, CX = 300, CY = 250, RING = 165, RM = 10, RS = 13;
  var LINE = 560, LX0 = 90, LX1 = 510, N = 13;
  var DEC = 300, DAMP = 1.1, E_WALL = 0.35, E_BALL = 0.82, VMAX = 1500, DT = 1 / 240;

  function layout() {
    var b = [{ x: CX, y: CY }], s = RM * 2.5;
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { for (var k = 1; k <= 3; k++) b.push({ x: CX + d[0] * s * k, y: CY + d[1] * s * k }); });
    return b.map(function (o, i) { return { k: 'm', x: o.x, y: o.y, vx: 0, vy: 0, r: RM, m: 1, hue: (i * 137) % 360 }; });
  }
  function shooter(p, x, y) { return { k: 's', p: p, x: x, y: y, vx: 0, vy: 0, r: RS, m: 1.8 }; }
  function step(bs, hit) {
    var i, j, a, b;
    for (i = 0; i < bs.length; i++) {
      a = bs[i]; var sp = Math.hypot(a.vx, a.vy); if (!sp) continue;
      var ns = Math.max(0, sp - DEC * DT - sp * DAMP * DT);
      if (ns < 3) { a.vx = a.vy = 0; } else { a.vx *= ns / sp; a.vy *= ns / sp; }
      a.x += a.vx * DT; a.y += a.vy * DT;
      if (a.x < a.r) { a.x = a.r; a.vx = -a.vx * E_WALL; } else if (a.x > W - a.r) { a.x = W - a.r; a.vx = -a.vx * E_WALL; }
      if (a.y < a.r) { a.y = a.r; a.vy = -a.vy * E_WALL; } else if (a.y > W - a.r) { a.y = W - a.r; a.vy = -a.vy * E_WALL; }
    }
    for (i = 0; i < bs.length; i++) {
      a = bs[i];
      for (j = i + 1; j < bs.length; j++) {
        b = bs[j];
        var dx = b.x - a.x, dy = b.y - a.y, rr = a.r + b.r, d2 = dx * dx + dy * dy;
        if (d2 >= rr * rr || d2 === 0) continue;
        var d = Math.sqrt(d2), nx = dx / d, ny = dy / d, ov = rr - d, im = 1 / a.m + 1 / b.m;
        a.x -= nx * ov * (1 / a.m) / im; a.y -= ny * ov * (1 / a.m) / im;
        b.x += nx * ov * (1 / b.m) / im; b.y += ny * ov * (1 / b.m) / im;
        var vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (vn < 0) { var jj = -(1 + E_BALL) * vn / im; a.vx -= jj * nx / a.m; a.vy -= jj * ny / a.m; b.vx += jj * nx / b.m; b.vy += jj * ny / b.m; if (hit) hit(a, b); }
      }
    }
    for (i = 0; i < bs.length; i++) if (bs[i].vx || bs[i].vy) return true;
    return false;
  }
  function inRing(o) { return Math.hypot(o.x - CX, o.y - CY) <= RING; }
  function clone(bs) { return bs.map(function (o) { return { k: o.k, p: o.p, x: o.x, y: o.y, vx: o.vx, vy: o.vy, r: o.r, m: o.m, hue: o.hue }; }); }
  function shooterOf(bs, p) { for (var i = 0; i < bs.length; i++) if (bs[i].k === 's' && bs[i].p === p) return bs[i]; return null; }
  function blockedAt(bs, x, p) { for (var i = 0; i < bs.length; i++) { var o = bs[i]; if (o.k === 's' && o.p === p) continue; if (Math.hypot(o.x - x, o.y - LINE) < RS + o.r + 1) return true; } return false; }
  /* Run a whole shot without drawing. Returns {bodies, out, steal, me}: out = marbles knocked out of the ring. */
  function simulate(bs, p, x, y, ang, pow) {
    var b = clone(bs), s = shooterOf(b, p);
    if (!s) { s = shooter(p, x, y); b.push(s); }
    var before = b.filter(function (o) { return o.k === 'm' && inRing(o); });
    s.vx = Math.cos(ang) * pow * VMAX; s.vy = Math.sin(ang) * pow * VMAX;
    var steal = false;
    function hit(a, c) { if (a.k === 's' && c.k === 's' && (a === s || c === s)) steal = true; }
    for (var n = 0; n < 240 * 12 && step(b, hit); n++);
    var out = before.filter(function (o) { return !inRing(o); });
    return { bodies: b, out: out, steal: steal, me: s };
  }

  /* ---------- AI: ghost-ball shots that push a kancha straight out, plus a shot at the other goli ---------- */
  function aiShot(bs, p, oppWon) {
    var own = shooterOf(bs, p), opp = shooterOf(bs, 1 - p), cands = [];
    var marbles = bs.filter(function (o) { return o.k === 'm' && inRing(o); });
    var starts = own ? [[own.x, own.y]] : [];
    if (!own) for (var xi = 0; xi <= 12; xi++) { var lx = LX0 + (LX1 - LX0) * xi / 12; if (!blockedAt(bs, lx, p)) starts.push([lx, LINE]); }
    function clear(x1, y1, x2, y2, rad, skip) {
      var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
      for (var i = 0; i < bs.length; i++) {
        var o = bs[i]; if (o === skip || o === own) continue;
        var t = ((o.x - x1) * dx + (o.y - y1) * dy) / (L * L); if (t < 0 || t > 1) continue;
        if (Math.hypot(x1 + dx * t - o.x, y1 + dy * t - o.y) < rad + o.r) return false;
      }
      return true;
    }
    starts.forEach(function (st) {
      marbles.forEach(function (m) {
        // push it out along the line from the ring centre (or straight away from us if it sits in the middle)
        var dx = m.x - CX, dy = m.y - CY, dl = Math.hypot(dx, dy);
        var dirs = dl > 4 ? [[dx / dl, dy / dl]] : [];
        var ax0 = m.x - st[0], ay0 = m.y - st[1], a0 = Math.hypot(ax0, ay0); dirs.push([ax0 / a0, ay0 / a0]);
        dirs.forEach(function (d) {
          var gx = m.x - d[0] * (RM + RS), gy = m.y - d[1] * (RM + RS);
          var ax = gx - st[0], ay = gy - st[1], al = Math.hypot(ax, ay); if (al < 5) return;
          var cos = (ax * d[0] + ay * d[1]) / al; if (cos < 0.3) return;
          if (!clear(st[0], st[1], gx, gy, RS, m)) return;
          var exit = RING - (m.x - CX) * d[0] - (m.y - CY) * d[1];
          cands.push({ x: st[0], y: st[1], ang: Math.atan2(ay, ax), score: cos * 2 - al / 700, dist: al + exit, cos: cos });
        });
      });
      if (opp && oppWon > 0) {
        var ox = opp.x - st[0], oy = opp.y - st[1], ol = Math.hypot(ox, oy);
        if (clear(st[0], st[1], opp.x, opp.y, RS, opp)) cands.push({ x: st[0], y: st[1], ang: Math.atan2(oy, ox), score: 1.6 - ol / 700, dist: ol, cos: 1 });
      }
    });
    cands.sort(function (a, b) { return b.score - a.score; });
    cands = cands.slice(0, 16);
    var best = null, bv = -1e9;
    function grade(r) {
      var v = r.out.length * 10 + (r.steal && oppWon > 0 ? 7 : 0);
      if (inRing(r.me)) v -= 2.5 + (r.out.length ? 6 : 0);
      else { // a good lie: near the marbles that are still in
        var left = r.bodies.filter(function (o) { return o.k === 'm' && inRing(o); }), nd = 1e9;
        left.forEach(function (o) { nd = Math.min(nd, Math.hypot(o.x - r.me.x, o.y - r.me.y)); });
        if (left.length) v += Math.max(0, 1.5 - nd / 160);
      }
      return v;
    }
    cands.forEach(function (c) {
      [0.3, 0.45, 0.62].forEach(function (base) {
        var pw = Math.min(1, base + c.dist / 2200 + (1 - c.cos) * .25);
        var v = grade(simulate(bs, p, c.x, c.y, c.ang, pw)) + c.score * 0.3;
        if (v > bv) { bv = v; best = { x: c.x, y: c.y, ang: c.ang, pow: pw }; }
      });
    });
    if (!best) {
      var s0 = starts[0] || [own ? own.x : W / 2, own ? own.y : LINE], tg = marbles[0] || { x: CX, y: CY };
      best = { x: s0[0], y: s0[1], ang: Math.atan2(tg.y - s0[1], tg.x - s0[0]), pow: .55 };
    }
    return best;
  }
  DG.kanche = { W: W, CX: CX, CY: CY, RING: RING, LINE: LINE, layout: layout, step: step, simulate: simulate, aiShot: aiShot, inRing: inRing, shooter: shooter };

  /* ---------- drawing ---------- */
  var SPECK = (function () { var s = 7, r = []; function rnd() { s = (s * 16807) % 2147483647; return s / 2147483647; } for (var i = 0; i < 520; i++) r.push([rnd() * W, rnd() * W, rnd() * 2.2 + .5, rnd()]); return r; })();
  var PCOL = [['#8ec5ff', '#1d4fb8'], ['#ff9a8a', '#b3261e']];
  function drawGround(g) {
    var gr = g.createRadialGradient(W / 2, W * .45, 60, W / 2, W / 2, W * .8); gr.addColorStop(0, '#b98a5a'); gr.addColorStop(1, '#8a5f36');
    g.fillStyle = gr; g.fillRect(0, 0, W, W);
    SPECK.forEach(function (p) { g.fillStyle = p[3] > .5 ? 'rgba(60,35,15,.25)' : 'rgba(255,235,200,.18)'; g.beginPath(); g.arc(p[0], p[1], p[2], 0, 7); g.fill(); });
    // chalk ring (rough double stroke) + lakeer
    g.lineCap = 'round';
    [[0, 4.5, .85], [1.6, 2, .45]].forEach(function (c) {
      g.strokeStyle = 'rgba(250,246,235,' + c[2] + ')'; g.lineWidth = c[1];
      g.beginPath(); for (var a = 0; a <= 6.3; a += .05) { var rr = RING + Math.sin(a * 7) * c[0] + Math.cos(a * 13) * c[0] * .6; var x = CX + Math.cos(a) * rr, y = CY + Math.sin(a) * rr; if (!a) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke();
    });
    g.strokeStyle = 'rgba(250,246,235,.8)'; g.lineWidth = 4; g.setLineDash([18, 7]);
    g.beginPath(); g.moveTo(LX0 - 20, LINE); g.lineTo(LX1 + 20, LINE); g.stroke(); g.setLineDash([]);
  }
  function drawMarble(g, o, bad) {
    g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 5; g.shadowOffsetY = 2;
    var c = o.k === 's' ? (bad ? ['#f3b0b0', '#a33'] : PCOL[o.p]) : ['hsl(' + o.hue + ',80%,78%)', 'hsl(' + o.hue + ',70%,32%)'];
    var gr = g.createRadialGradient(o.x - o.r * .35, o.y - o.r * .35, 1, o.x, o.y, o.r); gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]);
    g.beginPath(); g.arc(o.x, o.y, o.r, 0, 7); g.fillStyle = gr; g.fill(); g.restore();
    // swirl + shine
    g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = o.r * .22;
    g.beginPath(); g.arc(o.x + o.r * .1, o.y + o.r * .1, o.r * .5, 0.4, 2.6); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(o.x - o.r * .38, o.y - o.r * .38, o.r * .2, 0, 7); g.fill();
    if (o.k === 's') { g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 2; g.beginPath(); g.arc(o.x, o.y, o.r + 2.5, 0, 7); g.stroke(); }
  }

  DG.register('kanche', {
    mount: function (wrap, opts) {
      var mode = opts.mode, X = cl();
      var root = document.createElement('div'); root.className = 'kc'; wrap.appendChild(root);
      var dead = false, timers = [], raf = 0;
      function later(fn, ms) { timers.push(setTimeout(function () { if (!dead) fn(); }, ms)); }

      var bodies, turn, sx, phase, aim, won, msg, shots, turns;
      var chip = document.createElement('div'); chip.className = 'kc-chip';
      var stats = document.createElement('div'); stats.className = 'kc-stats';
      var cv = document.createElement('canvas'); cv.className = 'kc-cv';
      var slide = document.createElement('input'); slide.type = 'range'; slide.min = 0; slide.max = 1000; slide.value = 500; slide.className = 'kc-slide'; slide.setAttribute('aria-label', 'goli');
      var hint = document.createElement('div'); hint.className = 'kc-hint';
      var g = cv.getContext('2d');

      function isHuman(p) { return mode !== 'ai' || p === 0; }
      function cname(p) { return p ? X.red : X.blue; }
      function pname(p) { if (mode === 'ai') return (p ? DG.t().computer : DG.t().you) + ' (' + cname(p) + ')'; return cname(p); }
      function ringLeft() { return bodies.filter(function (o) { return o.k === 'm'; }).length; }
      function own() { return shooterOf(bodies, turn); }

      function size() {
        var css = cv.getBoundingClientRect().width || 360, dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        cv.width = Math.round(css * dpr); cv.height = cv.width; draw();
      }
      function toGround(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * W]; }

      function shotFrom() { var o = own(); return o ? [o.x, o.y] : [sx, LINE]; }
      function draw() {
        var k = cv.width / W; g.setTransform(k, 0, 0, k, 0, 0);
        drawGround(g);
        bodies.forEach(function (o) { drawMarble(g, o); });
        if (phase === 'aim' || phase === 'ai') {
          var f = shotFrom(), bad = !own() && blockedAt(bodies, sx, turn);
          if (aim && aim.pow > 0.03) {
            var L = 40 + aim.pow * 200, ex = f[0] + Math.cos(aim.ang) * L, ey = f[1] + Math.sin(aim.ang) * L;
            g.setLineDash([9, 7]); g.strokeStyle = 'rgba(255,248,230,.55)'; g.lineWidth = 2.5;
            g.beginPath(); g.moveTo(f[0], f[1]); g.lineTo(f[0] + Math.cos(aim.ang) * 700, f[1] + Math.sin(aim.ang) * 700); g.stroke(); g.setLineDash([]);
            g.strokeStyle = aim.pow > .8 ? '#e74c3c' : aim.pow > .5 ? '#f39c12' : '#2ecc71'; g.lineWidth = 6; g.lineCap = 'round';
            g.beginPath(); g.moveTo(f[0], f[1]); g.lineTo(ex, ey); g.stroke();
          }
          if (!own()) drawMarble(g, shooter(turn, sx, LINE), bad);
          else { g.strokeStyle = '#ffd36b'; g.lineWidth = 2.5; g.setLineDash([4, 4]); g.beginPath(); g.arc(f[0], f[1], RS + 7, 0, 7); g.stroke(); g.setLineDash([]); }
        }
      }

      function render() {
        X = cl();
        chip.innerHTML = '<i style="background:' + PCOL[turn][1] + '"></i>' + X.turn(pname(turn));
        stats.innerHTML = '<span>🔵 ' + X.blue + ': <b>' + won[0] + '</b></span><span>🔴 ' + X.red + ': <b>' + won[1] + '</b></span><span>⭕ ' + X.ring + ': <b>' + ringLeft() + '</b></span>';
        var atLine = !own();
        slide.disabled = !(phase === 'aim' && isHuman(turn) && atLine);
        hint.textContent = msg || (phase === 'aim' && isHuman(turn) ? (atLine ? (blockedAt(bodies, sx, turn) ? X.blocked : X.aimLine) : X.aimLie) : (phase === 'ai' ? X.thinking : ''));
        draw();
      }

      function start() {
        X = cl(); bodies = layout(); turn = 0; sx = W / 2; phase = 'aim'; aim = null; won = [0, 0]; msg = X.rules; shots = 0; turns = 0;
        root.innerHTML = '';
        [chip, stats, cv, slide, hint].forEach(function (e) { root.appendChild(e); });
        slide.value = 500;
        size(); beginTurn(true);
      }

      function beginTurn(keepMsg) {
        phase = isHuman(turn) ? 'aim' : 'ai'; aim = null;
        if (!keepMsg && isHuman(turn) && mode === 'pass') msg = '';
        if (!own()) {
          sx = W / 2;
          if (blockedAt(bodies, sx, turn)) for (var d = 10; d < 260; d += 10) { if (!blockedAt(bodies, sx + d, turn)) { sx += d; break; } if (!blockedAt(bodies, sx - d, turn)) { sx -= d; break; } }
          slide.value = Math.round((sx - LX0) / (LX1 - LX0) * 1000);
        }
        render();
        if (phase === 'ai') later(aiTurn, 600);
      }

      slide.oninput = function () { if (phase !== 'aim' || own()) return; sx = LX0 + (LX1 - LX0) * slide.value / 1000; msg = ''; render(); };

      var drag = null;
      cv.addEventListener('pointerdown', function (e) {
        if (phase !== 'aim' || !isHuman(turn)) return;
        drag = toGround(e); try { cv.setPointerCapture(e.pointerId); } catch (er) {}
        e.preventDefault();
      });
      cv.addEventListener('pointermove', function (e) {
        if (!drag) return; var p = toGround(e), dx = drag[0] - p[0], dy = drag[1] - p[1], L = Math.hypot(dx, dy);
        aim = L < 7 ? null : { ang: Math.atan2(dy, dx), pow: Math.min(1, L / 190) };
        msg = ''; render();
      });
      function release() {
        if (!drag) return; drag = null;
        if (aim && aim.pow > 0.05 && (own() || !blockedAt(bodies, sx, turn))) shoot(aim.ang, aim.pow);
        else { aim = null; render(); }
      }
      cv.addEventListener('pointerup', release); cv.addEventListener('pointercancel', function () { drag = null; aim = null; render(); });

      function aiTurn() {
        if (phase !== 'ai') return;
        var shot = aiShot(bodies, turn, won[1 - turn]);
        var err = (Math.random() - .5) * 0.1, perr = 1 + (Math.random() - .5) * .22; // human-like miss
        var from = sx, n = 0, atLine = !own();
        msg = '';
        (function glide() {
          n++; if (atLine) sx = from + (shot.x - from) * Math.min(1, n / 18); render();
          if (n < 18) return later(glide, 30);
          aim = { ang: shot.ang + err, pow: Math.min(1, shot.pow * perr) }; render();
          later(function () { shoot(aim.ang, aim.pow); }, 650);
        })();
      }

      function shoot(ang, pow) {
        phase = 'shoot'; msg = ''; shots++;
        var s = own(); if (!s) { s = shooter(turn, sx, LINE); bodies.push(s); }
        var before = bodies.filter(function (o) { return o.k === 'm' && inRing(o); });
        s.vx = Math.cos(ang) * pow * VMAX; s.vy = Math.sin(ang) * pow * VMAX; aim = null;
        var steal = false;
        function hit(a, c) { if (a.k === 's' && c.k === 's' && (a === s || c === s)) steal = true; }
        render();
        var steps = 0;
        (function frame() {
          if (dead) return;
          var moving = false;
          for (var i = 0; i < 4; i++) { moving = step(bodies, hit); steps++; }
          draw();
          if (moving && steps < 240 * 14) raf = requestAnimationFrame(frame);
          else settle(before, steal);
        })();
      }

      function settle(before, steal) {
        var out = before.filter(function (o) { return !inRing(o); }), notes = [], again = false;
        var mine = own(), stuck = !!(mine && inRing(mine));
        if (out.length) { won[turn] += out.length; bodies = bodies.filter(function (o) { return out.indexOf(o) < 0; }); notes.push(stuck ? X.gotOut(out.length) : X.out(out.length)); again = true; }
        if (steal && won[1 - turn] > 0) { won[1 - turn]--; won[turn]++; notes.push(X.steal); again = true; }
        // a goli that stops inside the ring goes back to the lakeer, and the turn is over
        if (stuck) { notes.push(X.inRing); again = false; }
        if (!again) turns++;
        bodies = bodies.filter(function (o) { return !(o.k === 's' && inRing(o)); });
        msg = notes.join(' · ');
        if (!again && msg) msg = (pname(turn).split(' (')[0]) + ': ' + msg;
        if (!ringLeft()) { render(); return later(finish, 1000); }
        if (!again) turn = 1 - turn;
        later(beginTurn, again ? 400 : 800);
      }

      function finish() {
        phase = 'over';
        var w = won[0] === won[1] ? -1 : (won[0] > won[1] ? 0 : 1);
        var t = DG.t();
        var txt = w < 0 ? t.drawRes : (mode === 'ai' ? (w === 0 ? t.youWin : t.youLose) : t.wins(pname(w)));
        root.innerHTML = '';
        var box = document.createElement('div'); box.className = 'kc-result';
        box.innerHTML = '<div style="font-size:3rem">' + (w < 0 ? '🤝' : (w === 0 || mode !== 'ai' ? '🏆' : '🤖')) + '</div><div class="rt"></div><div class="kc-hint"></div>';
        box.querySelector('.rt').textContent = txt;
        box.querySelector('.kc-hint').textContent = '🔵 ' + pname(0) + ': ' + X.got(won[0]) + '  ·  🔴 ' + pname(1) + ': ' + X.got(won[1]);
        var acts = document.createElement('div'); acts.className = 'kc-acts';
        var again = document.createElement('button'); again.className = 'kc-btn'; again.textContent = t.rematch; again.onclick = start;
        var exit = document.createElement('button'); exit.className = 'kc-btn ghost'; exit.textContent = t.exitGame; exit.onclick = function () { opts.onExit && opts.onExit(); };
        acts.appendChild(again); acts.appendChild(exit); box.appendChild(acts); root.appendChild(box);
      }

      var onResize = function () { if (phase !== 'over') size(); };
      window.addEventListener('resize', onResize);
      start();
      return {
        destroy: function () { dead = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout); window.removeEventListener('resize', onResize); wrap.innerHTML = ''; },
        _state: function () { return { bodies: bodies, turn: turn, phase: phase, won: won, shots: shots, turns: turns, sx: sx }; },
        _shoot: function (ang, pow, x) { if (phase === 'aim') { if (x != null && !own()) sx = x; shoot(ang, pow); } } // for tests
      };
    }
  });
})();

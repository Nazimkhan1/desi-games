/* Patang Kaato (पतंग काटो) — kite fight from the rooftops. 2 kites: yours (left roof) vs computer or
   a friend (right roof). Steer your kite with your finger; when the two strings cross a "pench" starts:
   whoever moves their kite faster during the pench cuts the other ("Wo kaata!"). First to cut 3 wins.
   Pass mode: two players at once on one phone — left half of the screen steers the left kite,
   right half the right kite (multi-touch). Engine helpers exposed as DG.patang for tests. */
(function () {
  if (!document.getElementById('pt-style')) {
    var st = document.createElement('style'); st.id = 'pt-style';
    st.textContent =
      '.pt{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;}' +
      '.pt-score{display:flex;gap:12px;align-items:center;font-family:var(--font-d);font-weight:800;font-size:1rem;}' +
      '.pt-score span{display:flex;align-items:center;gap:7px;padding:7px 14px;border-radius:999px;background:var(--panel);border:1px solid var(--line);}' +
      '.pt-score i{width:13px;height:13px;border-radius:3px;transform:rotate(45deg);display:inline-block;}' +
      '.pt-cv{display:block;border-radius:16px;box-shadow:var(--shadow);touch-action:none;user-select:none;-webkit-user-select:none;}' +
      '.pt-hint{font-family:var(--font-d);font-weight:600;font-size:.85rem;color:var(--ink-soft);text-align:center;max-width:360px;}' +
      '.pt-result{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;margin-top:20px;} .pt-result .rt{font-family:var(--font-d);font-weight:800;font-size:1.6rem;}' +
      '.pt-acts{display:flex;gap:10px;} .pt-btn{border:0;cursor:pointer;font-family:var(--font-d);font-weight:800;font-size:1rem;padding:13px 22px;border-radius:14px;color:#2a1803;background:linear-gradient(135deg,var(--marigold,#f5a524),var(--marigold2,#ffd36b));} .pt-btn.ghost{background:var(--panel);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);}';
    document.head.appendChild(st);
  }

  var PL = {
    hi:{ you:'तुम', comp:'कंप्यूटर', left:'बायाँ', right:'दायाँ', ready:'तैयार…', go:'उड़ाओ! 🪁', pench:'पेंच! तेज़ी से घुमाओ!', cut:'वो काटा! ✂️', lost:'कट गई! 😩',
      hintAi:'उंगली से अपनी पतंग घुमाओ। डोर से डोर भिड़े (पेंच) तो पतंग तेज़ी से घुमाओ — जो तेज़, वो काटेगा! पहले 3 काटो।',
      hintPass:'दो खिलाड़ी एक साथ: बाएँ आधे पर बायाँ, दाएँ आधे पर दायाँ। पेंच में जो तेज़ घुमाए, वो काटे! पहले 3 काटो।', round:function(n){return 'राउंड '+n;} },
    en:{ you:'You', comp:'Computer', left:'Left', right:'Right', ready:'Ready…', go:'Fly! 🪁', pench:'Pench! Swing fast!', cut:'Wo kaata! ✂️', lost:'Cut! 😩',
      hintAi:'Steer your kite with your finger. When the strings cross (pench), swing your kite fast — the faster one cuts! First to 3.',
      hintPass:'Two players at once: left half steers the left kite, right half the right kite. In a pench, swing fast to cut! First to 3.', round:function(n){return 'Round '+n;} },
    hinglish:{ you:'Tum', comp:'Computer', left:'Baayan', right:'Daayan', ready:'Taiyaar…', go:'Udao! 🪁', pench:'Pench! Tezi se ghumao!', cut:'Wo kaata! ✂️', lost:'Kat gayi! 😩',
      hintAi:'Ungli se apni patang ghumao. Dor se dor bhide (pench) to patang tezi se ghumao — jo tez, wo kaatega! Pehle 3 kaato.',
      hintPass:'Do khiladi ek saath: baayen aadhe par baayan, daayen aadhe par daayan. Pench mein jo tez ghumaye, wo kaate! Pehle 3 kaato.', round:function(n){return 'Round '+n;} },
    bn:{ you:'তুমি', comp:'কম্পিউটার', left:'বাঁ', right:'ডান', ready:'তৈরি…', go:'ওড়াও! 🪁', pench:'প্যাঁচ! জোরে ঘোরাও!', cut:'ভোকাট্টা! ✂️', lost:'কেটে গেল! 😩',
      hintAi:'আঙুল দিয়ে তোমার ঘুড়ি ঘোরাও। সুতোয় সুতোয় প্যাঁচ লাগলে জোরে ঘোরাও — যে দ্রুত, সে কাটবে! আগে ৩টে কাটো।',
      hintPass:'দুজন একসাথে: বাঁ দিকের অর্ধেকে বাঁ ঘুড়ি, ডান দিকে ডান ঘুড়ি। প্যাঁচে যে দ্রুত ঘোরায়, সে কাটে! আগে ৩টে।', round:function(n){return 'রাউন্ড '+n;} }
  };
  function pl() { return PL[DG.lang] || PL.en; }

  /* ---------- world (logical units) ---------- */
  var W = 360, H = 540, ROOF = H - 70, VMAX = 430, WIN = 3;
  var ANCHOR = [[W * 0.2, ROOF - 20], [W * 0.8, ROOF - 20]];
  var COLS = [['#e63b2e', '#ffd23f'], ['#2a7de1', '#3fd18b']];

  function stringPts(i, k, t) { // polyline from the roof to the kite, with sag and a little wind sway
    var a = ANCHOR[i], dx = k.x - a[0], dy = k.y - a[1], L = Math.hypot(dx, dy);
    var cx = a[0] + dx * .5 + Math.sin(t * 1.3 + i) * 6, cy = a[1] + dy * .5 + L * .14;
    var pts = [];
    for (var n = 0; n <= 14; n++) { var u = n / 14, v = 1 - u; pts.push([v * v * a[0] + 2 * v * u * cx + u * u * k.x, v * v * a[1] + 2 * v * u * cy + u * u * k.y]); }
    return pts;
  }
  function segX(p1, p2, p3, p4) {
    var d = (p2[0] - p1[0]) * (p4[1] - p3[1]) - (p2[1] - p1[1]) * (p4[0] - p3[0]); if (!d) return null;
    var u = ((p3[0] - p1[0]) * (p4[1] - p3[1]) - (p3[1] - p1[1]) * (p4[0] - p3[0])) / d;
    var v = ((p3[0] - p1[0]) * (p2[1] - p1[1]) - (p3[1] - p1[1]) * (p2[0] - p1[0])) / d;
    return (u >= 0 && u <= 1 && v >= 0 && v <= 1) ? [p1[0] + u * (p2[0] - p1[0]), p1[1] + u * (p2[1] - p1[1])] : null;
  }
  function crossing(a, b) { // first crossing point of two string polylines (ignoring the last bit near each kite)
    for (var i = 0; i < a.length - 2; i++) for (var j = 0; j < b.length - 2; j++) { var x = segX(a[i], a[i + 1], b[j], b[j + 1]); if (x) return x; }
    return null;
  }
  function moveKite(k, tx, ty, dt, vmax) {
    vmax = vmax || VMAX;
    var ax = (tx - k.x) * 32 - k.vx * 7.5, ay = (ty - k.y) * 32 - k.vy * 7.5;
    k.vx += ax * dt; k.vy += ay * dt;
    var sp = Math.hypot(k.vx, k.vy); if (sp > vmax) { k.vx *= vmax / sp; k.vy *= vmax / sp; }
    k.x += k.vx * dt; k.y += k.vy * dt;
    if (k.x < 22) { k.x = 22; k.vx = Math.abs(k.vx) * .3; } if (k.x > W - 22) { k.x = W - 22; k.vx = -Math.abs(k.vx) * .3; }
    if (k.y < 28) { k.y = 28; k.vy = Math.abs(k.vy) * .3; } if (k.y > ROOF - 90) { k.y = ROOF - 90; k.vy = -Math.abs(k.vy) * .3; }
  }
  DG.patang = { W: W, H: H, stringPts: stringPts, crossing: crossing, moveKite: moveKite, ANCHOR: ANCHOR };

  /* ---------- drawing ---------- */
  var clouds = [[40, 70, 1], [220, 120, .8], [300, 40, .6], [120, 190, .7]];
  function drawSky(g, t) {
    var s = g.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#5fb6f2'); s.addColorStop(.7, '#bfe6ff'); s.addColorStop(1, '#ffe2b0');
    g.fillStyle = s; g.fillRect(0, 0, W, H);
    g.beginPath(); g.arc(W - 64, 74, 26, 0, 7); g.fillStyle = 'rgba(255,236,150,.95)'; g.fill();
    g.beginPath(); g.arc(W - 64, 74, 38, 0, 7); g.fillStyle = 'rgba(255,236,150,.25)'; g.fill();
    g.fillStyle = 'rgba(255,255,255,.85)';
    clouds.forEach(function (c) {
      var x = ((c[0] + t * 8 * c[2]) % (W + 120)) - 60, y = c[1], r = 16 * c[2] + 6;
      g.beginPath(); g.arc(x, y, r, 0, 7); g.arc(x + r, y - r * .5, r * 1.1, 0, 7); g.arc(x + r * 2, y, r, 0, 7); g.fill();
    });
    // rooftops
    var roofs = [[0, ROOF - 6, 120, '#c98b5a'], [110, ROOF + 14, 70, '#b5764a'], [175, ROOF + 4, 80, '#d49a69'], [250, ROOF - 6, 110, '#c98b5a']];
    roofs.forEach(function (r) { g.fillStyle = r[3]; g.fillRect(r[0], r[1], r[2], H - r[1]); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(r[0], r[1], r[2], 6);
      g.fillStyle = 'rgba(70,40,20,.35)'; for (var w = r[0] + 12; w < r[0] + r[2] - 14; w += 26) g.fillRect(w, r[1] + 22, 12, 16); });
  }
  function drawFlyer(g, i) { // tiny person on the roof holding the charkhi
    var a = ANCHOR[i];
    g.fillStyle = '#3a2416'; g.beginPath(); g.arc(a[0], a[1] - 14, 7, 0, 7); g.fill();
    g.fillStyle = COLS[i][0]; g.fillRect(a[0] - 7, a[1] - 7, 14, 20);
    g.fillStyle = '#3a2416'; g.fillRect(a[0] - 6, a[1] + 13, 4, 12); g.fillRect(a[0] + 2, a[1] + 13, 4, 12);
    g.fillStyle = '#f5d26b'; g.beginPath(); g.arc(a[0] + (i ? -11 : 11), a[1] + 2, 5, 0, 7); g.fill();
  }
  function drawString(g, pts, col, slack) {
    g.strokeStyle = col; g.lineWidth = 1.4; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (var n = 1; n < pts.length; n++) g.lineTo(pts[n][0], pts[n][1] + (slack ? Math.sin(n) * 3 : 0)); g.stroke();
  }
  function drawKite(g, k, i, t) {
    var tilt = Math.max(-.6, Math.min(.6, k.vx / 600)) + (k.spin || 0);
    g.save(); g.translate(k.x, k.y); g.rotate(tilt);
    // tail
    g.strokeStyle = COLS[i][1]; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 20);
    for (var n = 1; n <= 6; n++) g.lineTo(Math.sin(t * 7 + n) * 5, 20 + n * 6); g.stroke();
    g.beginPath(); g.moveTo(0, -22); g.lineTo(18, 0); g.lineTo(0, 22); g.lineTo(-18, 0); g.closePath();
    g.fillStyle = COLS[i][0]; g.fill();
    g.beginPath(); g.moveTo(0, -22); g.lineTo(18, 0); g.lineTo(0, 0); g.closePath(); g.fillStyle = COLS[i][1]; g.fill();
    g.beginPath(); g.moveTo(0, 22); g.lineTo(-18, 0); g.lineTo(0, 0); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(60,30,10,.55)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, -22); g.lineTo(0, 22); g.moveTo(-18, 0); g.quadraticCurveTo(0, -10, 18, 0); g.stroke();
    g.restore();
  }

  DG.register('patang', {
    mount: function (wrap, opts) {
      var mode = opts.mode, X = pl();
      var root = document.createElement('div'); root.className = 'pt'; wrap.appendChild(root);
      var dead = false, raf = 0, timers = [];
      function later(fn, ms) { timers.push(setTimeout(function () { if (!dead) fn(); }, ms)); }

      var score, roundNo, kites, targets, phase, pench, banner, bannerT, t, last, ai;
      var scoreEl = document.createElement('div'); scoreEl.className = 'pt-score';
      var cv = document.createElement('canvas'); cv.className = 'pt-cv';
      var hint = document.createElement('div'); hint.className = 'pt-hint';
      var g = cv.getContext('2d');
      function name(i) { return mode === 'ai' ? (i ? X.comp : X.you) : (i ? X.right : X.left); }
      function human(i) { return mode !== 'ai' || i === 0; }

      function size() {
        var w = Math.min(window.innerWidth * .94, 420, (window.innerHeight - 230) / (H / W));
        w = Math.max(w, 240);
        cv.style.width = w + 'px'; cv.style.height = (w * H / W) + 'px';
        var dpr = Math.min(window.devicePixelRatio || 1, 2.5); cv.width = Math.round(w * dpr); cv.height = Math.round(w * H / W * dpr);
      }
      function toWorld(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; }

      var pointers = {};
      cv.addEventListener('pointerdown', function (e) {
        var p = toWorld(e), side = mode === 'ai' ? 0 : (p[0] < W / 2 ? 0 : 1);
        if (!human(side)) return;
        pointers[e.pointerId] = side; targets[side] = [p[0], p[1] - 40]; // aim a bit above the finger so it stays visible
        try { cv.setPointerCapture(e.pointerId); } catch (er) {}
        e.preventDefault();
      });
      cv.addEventListener('pointermove', function (e) { var s = pointers[e.pointerId]; if (s == null) return; var p = toWorld(e); targets[s] = [p[0], p[1] - 40]; });
      function up(e) { var s = pointers[e.pointerId]; if (s == null) return; delete pointers[e.pointerId]; targets[s] = null; }
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

      function start() {
        X = pl(); score = [0, 0]; roundNo = 0;
        root.innerHTML = ''; [scoreEl, cv, hint].forEach(function (e) { root.appendChild(e); });
        hint.textContent = mode === 'ai' ? X.hintAi : X.hintPass;
        size(); newRound();
        last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
      }
      function renderScore() {
        scoreEl.innerHTML = [0, 1].map(function (i) { return '<span><i style="background:' + COLS[i][0] + '"></i>' + name(i) + ': ' + score[i] + '</span>'; }).join('<b>✂️</b>');
      }
      function newRound() {
        roundNo++; renderScore();
        kites = [0, 1].map(function (i) { return { x: ANCHOR[i][0] + (i ? -30 : 30), y: ROOF - 100, vx: 0, vy: -40, cut: false, spin: 0 }; });
        targets = [null, null]; pointers = {};
        pench = { on: false, m: 0, at: null };
        ai = { aggr: .62 + Math.random() * .28, phase: Math.random() * 6, hover: [W * .7, 150] };
        phase = 'ready'; t = t || 0; say(X.round(roundNo) + ' — ' + X.ready, 1.2);
        later(function () { phase = 'fly'; say(X.go, 0.9); }, 1200);
      }
      function say(s, secs) { banner = s; bannerT = secs; }

      function hoverTarget(i) { var k = kites[i]; return [k.x + Math.sin(t * .7 + i * 2) * 20, Math.min(k.y, 200) + Math.cos(t * .9 + i) * 14 - (k.y > 230 ? 60 : 0)]; }

      function aiTarget() {
        var me = kites[1], op = kites[0];
        if (pench.on) { // swing hard around the crossing point
          var sp = 70 + ai.aggr * 60; ai.phase += (4 + ai.aggr * 2.2) * lastDt;
          return [me.x + Math.cos(ai.phase) * sp, me.y + Math.sin(ai.phase) * sp * .7];
        }
        // go across the opponent's string: aim just past their kite, a bit lower than it
        var os = stringPts(0, op, t), mid = os[9];
        return [mid[0] - 30 + Math.sin(t * 1.1) * 25, mid[1] - 20 + Math.cos(t * .8) * 20];
      }

      var lastDt = 0.016, swishAt = [];
      function update(dt) {
        lastDt = dt; t += dt; if (bannerT > 0) bannerT -= dt;
        if (phase === 'ready') { kites.forEach(function (k, i) { moveKite(k, ANCHOR[i][0] + (i ? -40 : 40), ROOF - 180, dt); }); return; }
        if (phase === 'cut') {
          kites.forEach(function (k, i) {
            if (k.cut) { k.vx = 40 + Math.sin(t * 3) * 60; k.vy = 55; k.x += k.vx * dt; k.y += k.vy * dt; k.spin += dt * 2.2; }
            else moveKite(k, hoverTarget(i)[0], hoverTarget(i)[1], dt);
          });
          return;
        }
        for (var i = 0; i < 2; i++) {
          var tg = human(i) ? (targets[i] || hoverTarget(i)) : aiTarget();
          moveKite(kites[i], tg[0], tg[1], dt, human(i) ? VMAX : VMAX * (.6 + ai.aggr * .25)); // computer a bit slower than a fast finger
          if (human(i) && !pench.on && Math.hypot(kites[i].vx, kites[i].vy) > VMAX * .6 && t - (swishAt[i] || -9) > .7) { swishAt[i] = t; DG.sfx('swish'); }
        }
        var a = stringPts(0, kites[0], t), b = stringPts(1, kites[1], t), x = crossing(a, b);
        if (x) {
          if (!pench.on) { pench.on = true; pench.snd = 0; say(X.pench, 1.2); DG.buzz(40); }
          pench.at = x; pench.grace = 0.9; // tangled strings stay tangled for a moment even if they swing apart
        } else if (pench.on) {
          pench.grace -= dt;
          if (pench.grace <= 0) { pench.on = false; pench.m *= 0.6; } // the lead carries over to the next pench
        }
        if (pench.on) {
          pench.snd -= dt; if (pench.snd <= 0) { DG.sfx('pench'); pench.snd = 0.55; } // dor ki kirr-kirr while tangled
          var s0 = Math.hypot(kites[0].vx, kites[0].vy), s1 = Math.hypot(kites[1].vx, kites[1].vy);
          pench.m += Math.max(-1, Math.min(1, (s0 - s1) / 60)) * dt * 1.2 + (Math.random() - .5) * dt * .3; // faster kite wins in ~1–2 s
          if (Math.abs(pench.m) >= 1) cut(pench.m > 0 ? 1 : 0);
        }
      }

      function cut(loser) {
        phase = 'cut'; kites[loser].cut = true; pench.on = false;
        var winner = 1 - loser; score[winner]++; renderScore();
        say(mode === 'ai' && loser === 0 ? X.lost : X.cut, 2);
        DG.sfx('capture'); DG.buzz([60, 40, 120]);
        later(function () { DG.sfx(mode === 'ai' && loser === 0 ? 'snake' : 'home'); }, 250);
        later(function () { if (score[winner] >= WIN) finish(winner); else newRound(); }, 2300);
      }

      function draw() {
        var k = cv.width / W; g.setTransform(k, 0, 0, k, 0, 0);
        drawSky(g, t);
        for (var i = 0; i < 2; i++) {
          var kt = kites[i];
          if (kt.cut) { var a = ANCHOR[i]; drawString(g, [[a[0], a[1]], [a[0] + (i ? -30 : 30), a[1] - 40], [a[0] + (i ? -50 : 50), a[1] - 30]], 'rgba(40,20,10,.5)', true); }
          else drawString(g, stringPts(i, kt, t), i ? 'rgba(20,40,110,.75)' : 'rgba(120,20,10,.75)');
        }
        for (i = 0; i < 2; i++) { drawFlyer(g, i); drawKite(g, kites[i], i, t); }
        if (pench.on && pench.at) {
          g.beginPath(); g.arc(pench.at[0], pench.at[1], 7 + Math.sin(t * 30) * 3, 0, 7); g.fillStyle = 'rgba(255,200,40,.85)'; g.fill();
          // tug meter
          var w = 160, x0 = W / 2 - w / 2, m = Math.max(-1, Math.min(1, pench.m));
          g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x0 - 3, 13, w + 6, 14);
          g.fillStyle = COLS[1][0]; g.fillRect(x0, 16, w, 8);
          g.fillStyle = COLS[0][0]; g.fillRect(x0, 16, w / 2 + m * w / 2, 8);
        }
        if (bannerT > 0 && banner) {
          g.font = '800 26px "Baloo 2", system-ui, sans-serif'; g.textAlign = 'center'; g.lineWidth = 6; g.strokeStyle = 'rgba(20,10,40,.6)';
          g.strokeText(banner, W / 2, H * .42); g.fillStyle = '#fff'; g.fillText(banner, W / 2, H * .42);
        }
      }

      function loop(now) {
        if (dead || phase === 'over') return;
        var dt = Math.min(0.05, (now - last) / 1000); last = now;
        update(dt); draw();
        raf = requestAnimationFrame(loop);
      }

      function finish(w) {
        phase = 'over'; cancelAnimationFrame(raf); DG.result(mode === 'ai' && w !== 0 ? 'lose' : 'win');
        var txt = mode === 'ai' ? (w === 0 ? DG.t().youWin : DG.t().youLose) : DG.t().wins(name(w));
        root.innerHTML = '';
        var box = document.createElement('div'); box.className = 'pt-result';
        box.innerHTML = '<div style="font-size:3rem">🪁</div><div class="rt"></div><div class="pt-hint">' + score[0] + ' – ' + score[1] + '</div>';
        box.querySelector('.rt').textContent = txt;
        var acts = document.createElement('div'); acts.className = 'pt-acts';
        var again = document.createElement('button'); again.className = 'pt-btn'; again.textContent = DG.t().rematch; again.onclick = start;
        var exit = document.createElement('button'); exit.className = 'pt-btn ghost'; exit.textContent = DG.t().exitGame; exit.onclick = function () { opts.onExit && opts.onExit(); };
        acts.appendChild(again); acts.appendChild(exit); box.appendChild(acts); root.appendChild(box);
      }

      var onResize = function () { if (phase !== 'over') size(); };
      window.addEventListener('resize', onResize);
      start();
      return {
        destroy: function () { dead = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout); window.removeEventListener('resize', onResize); wrap.innerHTML = ''; },
        _state: function () { return { score: score, phase: phase, kites: kites, pench: pench, round: roundNo }; },
        _target: function (i, p) { targets[i] = p; } // for tests
      };
    }
  });
})();

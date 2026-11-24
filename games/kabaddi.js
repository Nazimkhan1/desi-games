/* Kabaddi (कबड्डी) — top view, 4 vs 4. Team 0 lives in the bottom half, team 1 in the top half.
   Raid: the raider crosses the middle line on one breath (7 s, "kabaddi-kabaddi…"), touches defenders and
   gets back over the line: each defender touched = 1 point and that defender is out.
   Two defenders on the raider at once = tackle: raider out, defending team +1. Breath runs out over there = out.
   Each point a team scores brings back one of its out players. A team with nobody left = लोना: +2 to the other
   team and everyone comes back. 8 raids (4 each).
   Controls: drag to move your piece — the raider when you raid, your captain (★) when you defend.
   pass: a finger that starts in the bottom half controls team 0, top half team 1. ai: team 1 is the computer. */
(function () {
  var K = DG.kit;
  var CL = {
    hi: { youRaid: '🏃 तुम्हारी रेड', raid: function (n) { return '🏃 ' + n + ' की रेड'; }, breath: 'साँस', chant: 'कबड्डी-कबड्डी…', drag: 'उँगली से खींचो — रेडर चलेगा', def: 'बचाव: ★ कप्तान को खींचो, दो मिलकर पकड़ो!', raidN: function (a, b) { return 'रेड ' + a + '/' + b; },
      pts: function (n) { return '✅ ' + n + ' पॉइंट!'; }, empty: 'ख़ाली रेड — 0', tackled: '🤼 पकड़ लिया! बचाव +1', noBreath: '😮‍💨 साँस टूट गई! आउट', lona: '💥 लोना! +2', go: '🤼 शुरू करो', red: 'लाल', blue: 'नीला',
      rules: 'रेड: उँगली से रेडर को खींचो, बीच की लाइन पार करो, विरोधी को छुओ और साँस ख़त्म होने से पहले वापस आओ — हर छुआ = 1 पॉइंट। दो विरोधी एक साथ लगे तो पकड़े गए। बचाव में ★ कप्तान को खींचो और साथी के साथ रेडर को घेरो।' },
    en: { youRaid: '🏃 Your raid', raid: function (n) { return '🏃 ' + n + "'s raid"; }, breath: 'Breath', chant: 'Kabaddi-kabaddi…', drag: 'Drag to move your raider', def: 'Defend: drag your ★ captain — two together make a tackle!', raidN: function (a, b) { return 'Raid ' + a + '/' + b; },
      pts: function (n) { return '✅ ' + n + ' point' + (n > 1 ? 's' : '') + '!'; }, empty: 'Empty raid — 0', tackled: '🤼 Tackled! Defence +1', noBreath: '😮‍💨 Out of breath! Out', lona: '💥 Lona! +2', go: '🤼 Start', red: 'Red', blue: 'Blue',
      rules: 'Raid: drag your raider over the middle line, touch defenders and get back before your breath runs out — each touch = 1 point. Two defenders on you at once = tackled. When defending, drag your ★ captain and close in with a teammate.' },
    hinglish: { youRaid: '🏃 Tumhari raid', raid: function (n) { return '🏃 ' + n + ' ki raid'; }, breath: 'Saans', chant: 'Kabaddi-kabaddi…', drag: 'Ungli se kheencho — raider chalega', def: 'Bachaav: ★ captain ko kheencho, do milkar pakdo!', raidN: function (a, b) { return 'Raid ' + a + '/' + b; },
      pts: function (n) { return '✅ ' + n + ' point!'; }, empty: 'Khaali raid — 0', tackled: '🤼 Pakad liya! Bachaav +1', noBreath: '😮‍💨 Saans toot gayi! Out', lona: '💥 Lona! +2', go: '🤼 Shuru karo', red: 'Laal', blue: 'Neela',
      rules: 'Raid: ungli se raider ko kheencho, beech ki line paar karo, virodhi ko chhuo aur saans khatam hone se pehle wapas aao — har chhua = 1 point. Do virodhi ek saath lage to pakde gaye. Bachaav mein ★ captain ko kheencho aur saathi ke saath raider ko ghero.' },
    bn: { youRaid: '🏃 তোমার রেড', raid: function (n) { return '🏃 ' + n + '-এর রেড'; }, breath: 'দম', chant: 'কাবাডি-কাবাডি…', drag: 'আঙুলে টানো — রেডার চলবে', def: 'রক্ষা: ★ ক্যাপ্টেনকে টানো, দুজনে মিলে ধরো!', raidN: function (a, b) { return 'রেড ' + a + '/' + b; },
      pts: function (n) { return '✅ ' + n + ' পয়েন্ট!'; }, empty: 'খালি রেড — ০', tackled: '🤼 ধরে ফেলেছে! রক্ষা +১', noBreath: '😮‍💨 দম ফুরিয়েছে! আউট', lona: '💥 লোনা! +২', go: '🤼 শুরু করো', red: 'লাল', blue: 'নীল',
      rules: 'রেড: আঙুলে রেডারকে টেনে মাঝের দাগ পেরোও, বিপক্ষকে ছোঁও আর দম ফুরোনোর আগে ফেরো — প্রতি ছোঁয়া = ১ পয়েন্ট। দুজন একসাথে লাগলে ধরা পড়বে। রক্ষায় ★ ক্যাপ্টেনকে টানো, সঙ্গীর সাথে ঘিরে ধরো।' }
  };
  var L = K.lang(CL);
  var W = 360, H = 440, MID = 220, R = 13, BREATH = 7, RAIDS = 8, VR = 135, VD = 100, VC = 118, TOUCH = 25;
  var COL = ['#e2513b', '#2f6fd6'];

  DG.register('kabaddi', {
    mount: function (wrap, opts) {
      var mode = opts.mode === 'ai' ? 'ai' : 'pass', c = K.clock(), X = L();
      var root = K.el('div', 'dk', null, wrap);
      var chip, stats, cvs, meter, mfill, hint, score, alive, raidNo, rt, raider, defs, breath, touched, phase, ptr, msg, msgT, chantT, tackleT, aiR;
      function tname(i) { X = L(); return mode === 'ai' ? K.pname('ai', i) : (i ? X.blue : X.red); }
      function human(t) { return mode !== 'ai' || t === 0; }
      function own(t, y) { return t === 0 ? y > MID : y < MID; }       // is y inside team t's half

      function intro() {
        c.stop(); root.innerHTML = ''; X = L();
        var box = K.el('div', 'dk-setup', null, root); K.el('div', 'za-hand', '🤼', box).style.fontSize = '3rem';
        K.el('p', 'dk-rules', null, box).textContent = X.rules; K.btn(K.el('div', 'dk-row', null, box), X.go, '', build);
      }
      function build() {
        root.innerHTML = ''; X = L();
        chip = K.el('div', 'dk-chip', null, root); stats = K.el('div', 'dk-stats', null, root);
        cvs = K.canvas(root, W, H);
        meter = K.el('div', null, null, root); meter.style.cssText = 'width:min(86vw,340px);height:12px;border-radius:8px;background:var(--panel);overflow:hidden;box-shadow:inset 0 0 0 1px var(--line)';
        mfill = K.el('div', null, null, meter); mfill.style.cssText = 'height:100%;width:100%;background:linear-gradient(90deg,#ff3b30,#f5a524,#2ecc71)';
        hint = K.el('div', 'dk-hint', null, root);
        ptr = {};
        cvs.cv.addEventListener('pointerdown', function (e) {
          e.preventDefault(); var p = cvs.at(e), t = mode === 'ai' ? 0 : (p[1] > MID ? 0 : 1);
          if (!human(t)) return; ptr[e.pointerId] = t; setTarget(t, p); try { cvs.cv.setPointerCapture(e.pointerId); } catch (er) {}
        });
        cvs.cv.addEventListener('pointermove', function (e) { var t = ptr[e.pointerId]; if (t == null) return; setTarget(t, cvs.at(e)); });
        var up = function (e) { var t = ptr[e.pointerId]; delete ptr[e.pointerId]; if (t != null) setTarget(t, null); };
        cvs.cv.addEventListener('pointerup', up); cvs.cv.addEventListener('pointercancel', up);
        score = [0, 0]; alive = [[1, 1, 1, 1], [1, 1, 1, 1]]; raidNo = 0; cvs.size(); nextRaid(); c.loop(loop);
      }
      // the piece team t controls right now: raider if t raids, else its captain
      function setTarget(t, p) { var piece = t === rt ? raider : captain(); if (!piece) return; piece.tgt = p ? [p[0], p[1] - 26] : null; }
      function captain() { for (var i = 0; i < defs.length; i++) if (defs[i].cap && !defs[i].out) return defs[i]; return null; }

      function nextRaid() {
        if (raidNo >= RAIDS) return finish();
        raidNo++; rt = (raidNo - 1) % 2; var dt = 1 - rt; phase = 'raid'; breath = BREATH; touched = []; tackleT = 0; chantT = 0; msg = ''; aiR = { back: false, want: 1 + (Math.random() < .35 ? 1 : 0) };
        raider = { x: W / 2, y: rt === 0 ? H - 34 : 34, tgt: null };
        var line = dt === 0 ? MID + 100 : MID - 100, idx = [];
        alive[dt].forEach(function (a, i) { if (a) idx.push(i); });
        defs = idx.map(function (i, k) { return { i: i, x: W * (k + 1) / (idx.length + 1), y: line, hx: W * (k + 1) / (idx.length + 1), hy: line, out: false, tgt: null, cap: false }; });
        if (defs.length) defs[Math.floor(defs.length / 2)].cap = true;
        DG.sfx('whistle'); render();
      }
      function render() {
        X = L(); chip.textContent = (mode === 'ai' && rt === 0 ? X.youRaid : X.raid(tname(rt))) + ' · ' + X.raidN(raidNo, RAIDS);
        stats.innerHTML = [0, 1].map(function (t) { var a = alive[t].filter(Boolean).length; return '<span style="color:' + COL[t] + '">●</span><span>' + K.esc(tname(t)) + ': <b>' + score[t] + '</b> (' + a + '/4)</span>'; }).join('');
        hint.textContent = msg || (human(rt) ? X.drag : X.def);
      }
      function say(m) { msg = m; msgT = 2; render(); }
      function moveTo(o, tx, ty, v, dt) { var dx = tx - o.x, dy = ty - o.y, d = Math.hypot(dx, dy); if (d < 1) return; var s = Math.min(d, v * dt); o.x += dx / d * s; o.y += dy / d * s; }

      function loop(dt) {
        if (msgT > 0) { msgT -= dt; if (msgT <= 0) { msg = ''; render(); } }
        if (phase === 'raid') step(dt);
        draw(); return true;
      }
      function step(dt) {
        var dtm = 1 - rt;
        // raider
        if (human(rt)) { if (raider.tgt) moveTo(raider, raider.tgt[0], raider.tgt[1], VR, dt); }
        else aiRaider(dt);
        raider.x = K.clamp(raider.x, R, W - R); raider.y = K.clamp(raider.y, R, H - R);
        var over = !own(rt, raider.y);
        if (over) { breath -= dt; chantT -= dt; if (chantT <= 0) { chantT = 0.45; DG.sfx('tick', 0); } }
        mfill.style.width = Math.max(0, breath / BREATH * 100) + '%';
        // defenders
        var deep = Math.abs(raider.y - MID) > 60 && over, near = defs.filter(function (d) { return !d.out; }).sort(function (a, b) { return Math.hypot(a.x - raider.x, a.y - raider.y) - Math.hypot(b.x - raider.x, b.y - raider.y); });
        defs.forEach(function (d) {
          if (d.out) return;
          if (d.cap && human(dtm)) { if (d.tgt) moveTo(d, d.tgt[0], d.tgt[1], VC, dt); }
          else {
            var rush = over && (deep || touched.length) && near.indexOf(d) < 2;
            if (rush) moveTo(d, raider.x, raider.y, VD * (touched.length ? 1.08 : 1), dt);
            else moveTo(d, d.hx + (raider.x - W / 2) * 0.25, d.hy, VD * .7, dt);
          }
          d.x = K.clamp(d.x, R, W - R); d.y = dtm === 0 ? K.clamp(d.y, MID + R, H - R) : K.clamp(d.y, R, MID - R);
        });
        if (over) {
          var close = 0;
          defs.forEach(function (d) {
            if (d.out) return; var dd = Math.hypot(d.x - raider.x, d.y - raider.y);
            if (dd < TOUCH) { close++; if (touched.indexOf(d) < 0) { touched.push(d); DG.sfx('clack', .8); DG.buzz(25); } }
          });
          tackleT = close >= 2 ? tackleT + dt : 0;
          if (tackleT > 0.25) return endRaid('tackle');
          if (breath <= 0) return endRaid('breath');
        } else if (touched.length || raider.crossed) return endRaid('home');
        if (over) raider.crossed = true;
      }
      function aiRaider(dt) {
        var dtm = 1 - rt, live = defs.filter(function (d) { return !d.out && touched.indexOf(d) < 0; });
        var threat = defs.filter(function (d) { return !d.out && Math.hypot(d.x - raider.x, d.y - raider.y) < 60; }).length;
        if (touched.length >= aiR.want || breath < 2.6 || threat >= 2 && touched.length) aiR.back = true;
        if (aiR.back || !live.length) { moveTo(raider, raider.x + (W / 2 - raider.x) * .2, rt === 0 ? H - 40 : 40, VR * .92, dt); return; }
        var tg = live.sort(function (a, b) { return Math.hypot(a.x - raider.x, a.y - raider.y) - Math.hypot(b.x - raider.x, b.y - raider.y); })[0];
        moveTo(raider, tg.x + (Math.random() - .5) * 8, tg.y + (dtm === 0 ? -6 : 6), VR * .9, dt);
      }
      function endRaid(how) {
        phase = 'end'; var dtm = 1 - rt;
        if (how === 'home') {
          var n = touched.length;
          if (n) { score[rt] += n; touched.forEach(function (d) { alive[dtm][d.i] = 0; d.out = true; }); revive(rt, n); DG.sfx('ting'); say(X.pts(n)); }
          else { DG.sfx('thud', .3); say(X.empty); }
        } else {
          score[dtm] += 1; revive(dtm, 1);
          // the raider is out: mark one alive player of the raiding team out
          var k = alive[rt].indexOf(1); if (k >= 0) alive[rt][k] = 0;
          DG.sfx(how === 'tackle' ? 'capture' : 'buzz'); DG.buzz(80); say(how === 'tackle' ? X.tackled : X.noBreath);
        }
        [0, 1].forEach(function (t) { if (!alive[t].some(Boolean)) { score[1 - t] += 2; alive[t] = [1, 1, 1, 1]; DG.sfx('crowd'); c.later(function () { say(X.lona); }, 900); } });
        render(); c.later(nextRaid, 2300);
      }
      function revive(t, n) { for (var i = 0; i < 4 && n > 0; i++) if (!alive[t][i]) { alive[t][i] = 1; n--; } }
      function finish() {
        phase = 'over'; c.stop(); cvs.off();
        K.result(root, { mode: mode, winner: score[0] === score[1] ? -1 : (score[0] > score[1] ? 0 : 1), names: [tname(0), tname(1)], em: '🤼',
          sub: tname(0) + ' ' + score[0] + ' – ' + score[1] + ' ' + tname(1), again: build, onExit: opts.onExit });
      }

      function draw() {
        var g = cvs.begin();
        g.fillStyle = '#c98f55'; g.fillRect(0, 0, W, H);
        g.fillStyle = 'rgba(0,0,0,.06)'; for (var i = 0; i < 50; i++) { g.beginPath(); g.arc((i * 83) % W, (i * 131) % H, 2, 0, 7); g.fill(); }
        g.strokeStyle = 'rgba(255,252,240,.9)'; g.lineWidth = 3; g.strokeRect(6, 6, W - 12, H - 12);
        g.lineWidth = 4; g.beginPath(); g.moveTo(6, MID); g.lineTo(W - 6, MID); g.stroke();
        g.lineWidth = 1.5; g.setLineDash([6, 5]); [MID - 70, MID + 70].forEach(function (y) { g.beginPath(); g.moveTo(6, y); g.lineTo(W - 6, y); g.stroke(); }); g.setLineDash([]);
        var dtm = 1 - rt;
        defs.forEach(function (d) { if (d.out) return; dot(g, d.x, d.y, COL[dtm], touched.indexOf(d) >= 0, d.cap && human(dtm) ? '★' : ''); });
        dot(g, raider.x, raider.y, COL[rt], false, '🏃');
        if (phase === 'raid' && !own(rt, raider.y)) { g.font = '800 14px "Baloo 2", system-ui'; g.textAlign = 'center'; g.fillStyle = '#fff'; g.fillText(X.chant, raider.x, raider.y + (rt === 0 ? -24 : 30)); }
        if (msg && msgT > 0) { g.font = '800 22px "Baloo 2", system-ui'; g.textAlign = 'center'; g.lineWidth = 6; g.strokeStyle = 'rgba(20,10,40,.6)'; g.strokeText(msg, W / 2, MID + 8); g.fillStyle = '#fff'; g.fillText(msg, W / 2, MID + 8); }
      }
      function dot(g, x, y, col, mark, label) {
        g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x + 2, y + 4, R, R * .7, 0, 0, 7); g.fill();
        g.fillStyle = col; g.beginPath(); g.arc(x, y, R, 0, 7); g.fill();
        g.lineWidth = mark ? 4 : 2; g.strokeStyle = mark ? '#ffd36b' : 'rgba(255,255,255,.8)'; g.stroke();
        if (label) { g.font = (label === '★' ? '800 14px system-ui' : '15px sans-serif'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(label, x, y + 1); }
      }

      intro();
      return { destroy: function () { c.kill(); if (cvs) cvs.off(); wrap.innerHTML = ''; }, _state: function () { return { score: score, alive: alive, raidNo: raidNo, phase: phase, raider: raider, defs: defs, touched: touched, breath: breath }; } };
    }
  });
})();

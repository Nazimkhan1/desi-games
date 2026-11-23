/* Gilli-Danda (गिल्ली-डंडा). Side view of a village maidan. Modes: pass (2 friends bat one after the
   other) / ai (you bat, then the computer bats).
   Each shot: tap once → the danda flicks the gilli up from the gucchi; tap again while it is in the air
   → strike. Tap timing decides the shot:
     - strike it falling at about knee height → the best, longest shot
     - strike it high or still rising → lofted (goes up, a fielder can catch it)
     - strike it low → flat, skims along the ground (cannot be caught, but shorter)
     - too early / too late (it touches the ground) → khali, a life gone
   A fielder kid stands somewhere out in the field; a lofted gilli that lands within his reach is caught.
   Distance is counted in danda lengths. Each innings: 6 shots or 3 lives. More danda wins.
   Engine exposed as DG.gilli for tests. */
(function () {
  if (!document.getElementById('gd-style')) {
    var st = document.createElement('style'); st.id = 'gd-style';
    st.textContent =
      '.gd{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;}' +
      '.gd-chip{font-family:var(--font-d);font-weight:800;font-size:1rem;padding:8px 16px;border-radius:999px;background:var(--panel);border:1px solid var(--line);}' +
      '.gd-stats{display:flex;gap:14px;font-family:var(--font-d);font-weight:700;font-size:.84rem;color:var(--ink-soft);flex-wrap:wrap;justify-content:center;}' +
      '.gd-stats b{color:var(--ink);}' +
      '.gd-cv{width:min(96vw,460px);aspect-ratio:3/2;height:auto;display:block;border-radius:14px;box-shadow:var(--shadow);touch-action:manipulation;user-select:none;-webkit-user-select:none;cursor:pointer;}' +
      '.gd-tap{border:0;cursor:pointer;font-family:var(--font-d);font-weight:800;font-size:1.15rem;padding:16px 0;width:min(86vw,340px);border-radius:16px;color:#2a1803;background:linear-gradient(135deg,var(--marigold,#f5a524),var(--marigold2,#ffd36b));box-shadow:var(--shadow);touch-action:manipulation;}' +
      '.gd-tap:disabled{opacity:.45;cursor:default;}' +
      '.gd-hint{font-family:var(--font-d);font-weight:600;font-size:.85rem;color:var(--ink-soft);min-height:2.6em;text-align:center;max-width:360px;}' +
      '.gd-result{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;margin-top:20px;} .gd-result .rt{font-family:var(--font-d);font-weight:800;font-size:1.6rem;}' +
      '.gd-acts{display:flex;gap:10px;} .gd-btn{border:0;cursor:pointer;font-family:var(--font-d);font-weight:800;font-size:1rem;padding:13px 22px;border-radius:14px;color:#2a1803;background:linear-gradient(135deg,var(--marigold,#f5a524),var(--marigold2,#ffd36b));} .gd-btn.ghost{background:var(--panel);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);}';
    document.head.appendChild(st);
  }

  var CL = {
    hi: { bats: function (n) { return n + ' की बल्लेबाज़ी'; }, score: 'स्कोर', lives: 'जान', shots: 'शॉट', flip: '⬆️ गिल्ली उछालो', hit: '💥 मारो!',
      hintFlip: 'पहले टैप: गिल्ली उछलेगी। दूसरा टैप: हवा में मारो — गिरती गिल्ली घुटने की ऊँचाई पर सबसे दूर जाती है',
      hintHit: 'अभी! गिरती गिल्ली पर मारो', far: function (d) { return '🎯 ' + d + ' डंडा दूर!'; }, flat: function (d) { return 'ज़मीन के साथ — ' + d + ' डंडा'; },
      caught: '🙌 पकड़ लिया! एक जान गई', miss: '😬 ख़ाली गया! एक जान गई', fielder: 'फ़ील्डर', danda: 'डंडा', target: function (n) { return 'जीतने को ' + n + ' डंडा चाहिए'; },
      over: function (n, s) { return n + ' की पारी ख़त्म: ' + s + ' डंडा'; }, next: function (n) { return 'अब ' + n + ' की बारी'; }, aiBat: 'कंप्यूटर खेल रहा…', total: function (a, b) { return a + ' डंडा बनाम ' + b + ' डंडा'; } },
    en: { bats: function (n) { return n + ' batting'; }, score: 'Score', lives: 'Lives', shots: 'Shots', flip: '⬆️ Flip the gilli', hit: '💥 Strike!',
      hintFlip: 'First tap flips the gilli up. Second tap strikes it in the air — hit it falling at knee height to go farthest',
      hintHit: 'Now! Hit it as it falls', far: function (d) { return '🎯 ' + d + ' danda lengths!'; }, flat: function (d) { return 'Along the ground — ' + d + ' danda'; },
      caught: '🙌 Caught! One life gone', miss: '😬 Missed! One life gone', fielder: 'Fielder', danda: 'danda', target: function (n) { return n + ' danda to win'; },
      over: function (n, s) { return n + "'s innings over: " + s + ' danda'; }, next: function (n) { return 'Now ' + n + ' bats'; }, aiBat: 'Computer is batting…', total: function (a, b) { return a + ' vs ' + b + ' danda'; } },
    hinglish: { bats: function (n) { return n + ' ki batting'; }, score: 'Score', lives: 'Jaan', shots: 'Shot', flip: '⬆️ Gilli uchhalo', hit: '💥 Maaro!',
      hintFlip: 'Pehla tap: gilli uchhlegi. Doosra tap: hawa mein maaro — girti gilli ghutne ki oonchai par sabse door jaati hai',
      hintHit: 'Abhi! Girti gilli par maaro', far: function (d) { return '🎯 ' + d + ' danda door!'; }, flat: function (d) { return 'Zameen ke saath — ' + d + ' danda'; },
      caught: '🙌 Pakad liya! Ek jaan gayi', miss: '😬 Khaali gaya! Ek jaan gayi', fielder: 'Fielder', danda: 'danda', target: function (n) { return 'Jeetne ko ' + n + ' danda chahiye'; },
      over: function (n, s) { return n + ' ki pari khatam: ' + s + ' danda'; }, next: function (n) { return 'Ab ' + n + ' ki baari'; }, aiBat: 'Computer khel raha…', total: function (a, b) { return a + ' danda vs ' + b + ' danda'; } },
    bn: { bats: function (n) { return n + '-এর ব্যাটিং'; }, score: 'স্কোর', lives: 'জান', shots: 'শট', flip: '⬆️ গিল্লি তোলো', hit: '💥 মারো!',
      hintFlip: 'প্রথম ট্যাপে গিল্লি লাফাবে। দ্বিতীয় ট্যাপে হাওয়ায় মারো — পড়ন্ত গিল্লি হাঁটুর উচ্চতায় মারলে সবচেয়ে দূরে যায়',
      hintHit: 'এখনই! পড়ন্ত গিল্লিতে মারো', far: function (d) { return '🎯 ' + d + ' ডান্ডা দূরে!'; }, flat: function (d) { return 'মাটি ঘেঁষে — ' + d + ' ডান্ডা'; },
      caught: '🙌 ধরে ফেলেছে! একটা জান গেল', miss: '😬 ফসকে গেল! একটা জান গেল', fielder: 'ফিল্ডার', danda: 'ডান্ডা', target: function (n) { return 'জিততে ' + n + ' ডান্ডা লাগবে'; },
      over: function (n, s) { return n + '-এর ইনিংস শেষ: ' + s + ' ডান্ডা'; }, next: function (n) { return 'এবার ' + n + '-এর পালা'; }, aiBat: 'কম্পিউটার খেলছে…', total: function (a, b) { return a + ' বনাম ' + b + ' ডান্ডা'; } }
  };
  function cl() { return CL[DG.lang] || CL.en; }

  /* ---------- engine (metres, seconds) ---------- */
  var G = 9.8, DANDA = 0.6, POP = 4.2, LIVES = 3, SHOTS = 6, REACH = 1.2, RUN = 6.2, REACT = 0.3;
  /* Strike quality from the gilli's height h (m) and whether it is still rising. Returns null for a miss. */
  function strike(h, rising) {
    if (h < 0.1) return null;
    var q = Math.max(0.15, 1 - Math.abs(h - 0.5) / 0.75);
    if (rising) q *= 0.78;
    var ang = rising ? 48 : 10 + Math.min(1, h / 0.95) * 38;       // degrees
    return { v: 9 + q * 17, ang: ang * Math.PI / 180, q: q };
  }
  function popHeight(t, vy) { return vy * t - G / 2 * t * t; }
  /* Flight of a struck gilli from height h: first landing x and time, then rolling/bouncing to a stop. */
  function flight(v, ang, h) {
    var vx = Math.cos(ang) * v, vy = Math.sin(ang) * v;
    var T = (vy + Math.sqrt(vy * vy + 2 * G * h)) / G, xl = vx * T;
    // after landing: steep shots die quickly, flat ones skim and roll on
    var keep = ang < 0.35 ? 0.45 : ang < 0.6 ? 0.3 : 0.12;
    var roll = (vx * keep) * (vx * keep) / (2 * 3.2);
    return { T: T, land: xl, stop: xl + roll, lofted: ang >= 0.35 };
  }
  function catchable(f, xf) { return f.lofted && Math.abs(f.land - xf) <= REACH + RUN * Math.max(0, f.T - REACT); }
  function toDanda(m) { return Math.max(0, Math.round(m / DANDA)); }
  function fielderSpot() { return 18 + Math.random() * 30; }
  /* Computer batting: aims for falling knee height, with human-like timing error. */
  function aiTiming(skill) {
    var sd = 0.16 - skill * 0.08, h = 0.5 + (Math.random() + Math.random() + Math.random() - 1.5) * sd * 1.4;
    var rising = Math.random() < 0.12 - skill * 0.06;
    return { h: h, rising: rising };
  }
  DG.gilli = { strike: strike, flight: flight, catchable: catchable, toDanda: toDanda, aiTiming: aiTiming, POP: POP, G: G };

  /* ---------- drawing ---------- */
  var VW = 360, VH = 240, GY = 196, PX0 = 46;          // view size, ground line, batter x on screen
  function kid(g, x, y, col, pose, s) {
    s = s || 1; g.save(); g.translate(x, y); g.scale(s, s);
    g.strokeStyle = '#3b2412'; g.lineWidth = 3; g.lineCap = 'round';
    var leg = Math.sin(pose * 9) * 5;
    g.beginPath(); g.moveTo(0, -16); g.lineTo(-4 - leg * .4, 0); g.moveTo(0, -16); g.lineTo(4 + leg * .4, 0); g.stroke();
    g.fillStyle = col; g.beginPath(); g.moveTo(-6, -30); g.lineTo(6, -30); g.lineTo(5, -15); g.lineTo(-5, -15); g.closePath(); g.fill();
    g.fillStyle = '#8a5a35'; g.beginPath(); g.arc(0, -36, 6, 0, 7); g.fill();
    g.fillStyle = '#1d140c'; g.beginPath(); g.arc(0, -38, 6, Math.PI, 0); g.fill();
    g.restore();
  }

  DG.register('gilli', {
    mount: function (wrap, opts) {
      var mode = opts.mode === 'ai' ? 'ai' : 'pass', X = cl();
      var root = document.createElement('div'); root.className = 'gd'; wrap.appendChild(root);
      var dead = false, timers = [], raf = 0;
      function later(fn, ms) { timers.push(setTimeout(function () { if (!dead) fn(); }, ms)); }

      var chip = document.createElement('div'); chip.className = 'gd-chip';
      var stats = document.createElement('div'); stats.className = 'gd-stats';
      var cv = document.createElement('canvas'); cv.className = 'gd-cv';
      var tap = document.createElement('button'); tap.className = 'gd-tap';
      var hint = document.createElement('div'); hint.className = 'gd-hint';
      var g = cv.getContext('2d');

      var bat, scores, lives, shots, phase, t, popVy, gx, gy, fl, xf, ff, caught, held, swing, msg, cam, best;
      function pname(p) { var t = DG.t(); return mode === 'ai' ? (p ? t.computer : t.you) : (p ? t.p2 : t.p1); }
      function human() { return mode !== 'ai' || bat === 0; }

      function size() { var css = cv.getBoundingClientRect().width || 360, dpr = Math.min(window.devicePixelRatio || 1, 2.5); cv.width = Math.round(css * dpr); cv.height = Math.round(cv.width * 2 / 3); draw(); }

      function S() { return 13; }                 // px per metre
      function sx(x) { return PX0 + (x - cam) * S(); }
      function draw() {
        if (!ff) return;
        var k = cv.width / VW; g.setTransform(k, 0, 0, k, 0, 0);
        var sky = g.createLinearGradient(0, 0, 0, GY); sky.addColorStop(0, '#7cc6f0'); sky.addColorStop(1, '#d8eef7');
        g.fillStyle = sky; g.fillRect(0, 0, VW, GY);
        // far trees / huts (parallax)
        g.fillStyle = '#7fae6a';
        for (var i = -1; i < 12; i++) { var tx = ((i * 70 - cam * 4) % 840 + 840) % 840 - 60; g.beginPath(); g.arc(tx, GY - 18, 22, Math.PI, 0); g.fill(); }
        g.fillStyle = '#c98f55'; var hx = ((300 - cam * 3) % 900 + 900) % 900 - 60; g.fillRect(hx, GY - 34, 34, 24); g.fillStyle = '#8b4f2a'; g.beginPath(); g.moveTo(hx - 5, GY - 34); g.lineTo(hx + 17, GY - 50); g.lineTo(hx + 39, GY - 34); g.fill();
        // ground
        var gr = g.createLinearGradient(0, GY, 0, VH); gr.addColorStop(0, '#c7965e'); gr.addColorStop(1, '#a8743f'); g.fillStyle = gr; g.fillRect(0, GY, VW, VH - GY);
        // distance marks every 10 danda
        g.fillStyle = 'rgba(255,255,255,.9)'; g.font = 'bold 9px sans-serif'; g.textAlign = 'center';
        for (var d = 10; d < 400; d += 10) { var mx = sx(d * DANDA); if (mx < -10 || mx > VW + 10) continue; g.fillRect(mx - 1, GY, 2, 7); g.fillText(d, mx, GY + 17); }
        if (best > 0) { var bx = sx(best * DANDA); if (bx > 0 && bx < VW) { g.fillStyle = '#e74c3c'; g.fillRect(bx - 1, GY - 22, 2, 22); g.beginPath(); g.moveTo(bx + 1, GY - 22); g.lineTo(bx + 12, GY - 18); g.lineTo(bx + 1, GY - 14); g.fill(); } }
        // gucchi (pit)
        g.fillStyle = '#5a3a1c'; g.beginPath(); g.ellipse(sx(0.25), GY + 1, 9, 3, 0, 0, 7); g.fill();
        // fielder
        var fxp = sx(ff.x); if (fxp > -20 && fxp < VW + 20) kid(g, fxp, GY, bat ? '#2f6fd6' : '#e2513b', ff.run, 1);
        if (fxp > VW - 6 && !held) { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(VW - 112, GY - 40, 104, 22); g.fillStyle = '#fff'; g.font = 'bold 11px sans-serif'; g.textAlign = 'center'; g.fillText('🧍 ' + X.fielder + ' ' + toDanda(ff.x) + ' →', VW - 60, GY - 25); }
        if (held) { g.font = '16px sans-serif'; g.textAlign = 'center'; g.fillText('🙌', fxp, GY - 52); }
        // batter with danda
        var bxp = sx(0) - 16;
        kid(g, bxp, GY, bat ? '#e2513b' : '#2f6fd6', 0, 1.05);
        var a = swing > 0 ? -0.2 - swing * 1.6 : (phase === 'up' ? -1.05 : 0.55);
        g.save(); g.translate(bxp + 4, GY - 22); g.rotate(a); g.fillStyle = '#7a4a1f'; g.fillRect(0, -2.2, 30, 4.4); g.restore();
        // gilli
        if (!held) {
          var px = sx(gx), py = GY - gy * S() - 2;
          g.save(); g.translate(px, py); g.rotate(phase === 'fly' || phase === 'up' ? t * 18 : 0);
          g.fillStyle = '#d9a35b'; g.strokeStyle = '#6b4219'; g.lineWidth = 1;
          g.beginPath(); g.moveTo(-7, 0); g.lineTo(-4, -2.5); g.lineTo(4, -2.5); g.lineTo(7, 0); g.lineTo(4, 2.5); g.lineTo(-4, 2.5); g.closePath(); g.fill(); g.stroke();
          g.restore();
        }
        // knee-height guide while the gilli is up
        if (phase === 'up') { g.strokeStyle = 'rgba(46,204,113,.7)'; g.lineWidth = 2; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(sx(-.5), GY - 0.5 * S() - 2); g.lineTo(sx(1.3), GY - 0.5 * S() - 2); g.stroke(); g.setLineDash([]); }
        // live distance
        if (phase === 'fly' || phase === 'shown') { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(VW - 92, 8, 84, 24); g.fillStyle = '#fff'; g.font = 'bold 13px sans-serif'; g.textAlign = 'center'; g.fillText(toDanda(gx) + ' ' + X.danda, VW - 50, 25); }
      }

      function render() {
        X = cl();
        chip.textContent = X.bats(pname(bat));
        var hearts = ''; for (var i = 0; i < LIVES; i++) hearts += i < lives ? '❤️' : '🤍';
        stats.innerHTML = '<span>' + esc(pname(0)) + ': <b>' + scores[0] + '</b></span><span>' + esc(pname(1)) + ': <b>' + (bat === 1 || scores[1] ? scores[1] : '–') + '</b></span><span>' + hearts + '</span><span>' + X.shots + ': <b>' + shots + '/' + SHOTS + '</b></span>';
        tap.textContent = phase === 'up' ? X.hit : X.flip;
        tap.disabled = !human() || !(phase === 'ready' || phase === 'up');
        hint.textContent = msg || (!human() ? X.aiBat : phase === 'up' ? X.hintHit : X.hintFlip);
        draw();
      }
      function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

      function start() {
        X = cl(); bat = 0; scores = [0, 0];
        root.innerHTML = ''; [chip, stats, cv, tap, hint].forEach(function (e) { root.appendChild(e); });
        size(); innings();
      }
      function innings() { lives = LIVES; shots = 0; best = 0; msg = ''; newShot(); }
      function newShot() {
        phase = 'ready'; t = 0; gx = 0.25; gy = 0; caught = false; held = false; swing = 0; cam = 0; fl = null;
        ff = { x: fielderSpot(), run: 0 }; xf = ff.x;
        if (bat === 1 && mode === 'ai') msg = X.target(scores[0] - scores[1] + 1);
        render();
        if (!human()) aiBat();
      }
      function onTap() {
        if (!human()) return;
        if (phase === 'ready') flip(); else if (phase === 'up') hit();
      }
      tap.onclick = onTap; cv.addEventListener('pointerdown', function (e) { e.preventDefault(); onTap(); });

      function flip() {
        phase = 'up'; msg = ''; t = 0; popVy = POP + (Math.random() - .5) * 0.5; swing = 0; render();
        var last = performance.now();
        (function frame(now) {
          if (dead || phase !== 'up') return;
          now = now || performance.now(); var dt = Math.min(0.05, (now - last) / 1000); last = now;
          t += dt; gy = popHeight(t, popVy); gx = 0.25 + t * 0.35;
          if (gy <= 0 && t > 0.1) { gy = 0; return result(null); }
          draw(); raf = requestAnimationFrame(frame);
        })();
      }
      function hit() {
        if (phase !== 'up') return;
        var rising = popVy - G * t > 0, s = strike(gy, rising);
        swing = 1;
        if (!s) return result(null);
        fly(s);
      }
      function fly(s) {
        phase = 'fly'; shots++; msg = '';
        fl = flight(s.v, s.ang, gy);
        caught = catchable(fl, xf);
        var vx = Math.cos(s.ang) * s.v, vy = Math.sin(s.ang) * s.v, h0 = gy, x0 = gx, ft = 0, landed = false, last = performance.now();
        render();
        (function frame(now) {
          if (dead) return;
          now = now || performance.now(); var dt = Math.min(0.05, (now - last) / 1000); last = now; ft += dt;
          swing = Math.max(0, swing - dt * 4);
          // fielder runs for the landing spot once he reacts
          if (ft > REACT && fl.lofted) { var dir = Math.sign(fl.land - ff.x), stepx = Math.min(Math.abs(fl.land - ff.x), RUN * dt); ff.x += dir * stepx; if (stepx > 0) ff.run += dt; }
          if (!landed) {
            gx = x0 + vx * ft; gy = h0 + vy * ft - G / 2 * ft * ft;
            if (ft >= fl.T) { landed = true; gx = x0 + fl.land; gy = 0; if (caught) { held = true; ff.x = gx; cam = Math.max(0, gx - 12); draw(); return later(function () { result('caught'); }, 500); } }
          } else {
            gx += (fl.stop + x0 - gx) * Math.min(1, dt * 3.2);
            if (Math.abs(fl.stop + x0 - gx) < 0.05) { gx = fl.stop + x0; cam = Math.max(0, gx - 12); draw(); return result('ok'); }
          }
          cam = Math.max(0, gx - 12);
          draw(); raf = requestAnimationFrame(frame);
        })();
      }
      function result(kind) {
        phase = 'shown';
        if (kind === 'ok') {
          var d = toDanda(gx); scores[bat] += d; best = Math.max(best, d);
          msg = fl.lofted ? X.far(d) : X.flat(d);
        } else {
          if (!kind) { shots++; swing = 0; }
          lives--; msg = kind === 'caught' ? X.caught : X.miss;
        }
        render();
        later(function () {
          if (lives <= 0 || shots >= SHOTS || (mode === 'ai' && bat === 1 && scores[1] > scores[0])) return endInnings();
          newShot();
        }, 1500);
      }
      function endInnings() {
        msg = X.over(pname(bat), scores[bat]); phase = 'shown'; render();
        if (bat === 0) later(function () { bat = 1; msg = X.next(pname(1)); innings(); }, 1800);
        else later(finish, 1600);
      }
      function aiBat() {
        // flip, then strike at the chosen height
        later(function () {
          if (phase !== 'ready') return;
          flip();
          var tm = aiTiming(0.55);
          var peak = popVy / G, target = tm.rising ? Math.max(0.05, peak - Math.sqrt(Math.max(0, 2 * (popVy * popVy / (2 * G) - tm.h) / G))) : peak + Math.sqrt(Math.max(0, 2 * (popVy * popVy / (2 * G) - tm.h) / G));
          (function wait() {
            if (phase !== 'up') return;
            if (t >= target) return hit();
            later(wait, 8);
          })();
        }, 900);
      }

      function finish() {
        phase = 'over';
        var t = DG.t(), w = scores[0] === scores[1] ? -1 : (scores[0] > scores[1] ? 0 : 1);
        var txt = w < 0 ? t.drawRes : (mode === 'ai' ? (w === 0 ? t.youWin : t.youLose) : t.wins(pname(w)));
        root.innerHTML = '';
        var box = document.createElement('div'); box.className = 'gd-result';
        box.innerHTML = '<div style="font-size:3rem">' + (w < 0 ? '🤝' : (w === 0 || mode !== 'ai' ? '🏆' : '🤖')) + '</div><div class="rt"></div><div class="gd-hint"></div>';
        box.querySelector('.rt').textContent = txt;
        box.querySelector('.gd-hint').textContent = pname(0) + ' ' + X.total(scores[0], scores[1]) + ' ' + pname(1);
        var acts = document.createElement('div'); acts.className = 'gd-acts';
        var again = document.createElement('button'); again.className = 'gd-btn'; again.textContent = t.rematch; again.onclick = start;
        var exit = document.createElement('button'); exit.className = 'gd-btn ghost'; exit.textContent = t.exitGame; exit.onclick = function () { opts.onExit && opts.onExit(); };
        acts.appendChild(again); acts.appendChild(exit); box.appendChild(acts); root.appendChild(box);
      }

      var onResize = function () { if (phase !== 'over') size(); };
      window.addEventListener('resize', onResize);
      start();
      return {
        destroy: function () { dead = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout); window.removeEventListener('resize', onResize); wrap.innerHTML = ''; },
        _state: function () { return { bat: bat, scores: scores, lives: lives, shots: shots, phase: phase, h: gy, t: t, vy: popVy }; },
        _tap: onTap
      };
    }
  });
})();

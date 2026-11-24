/* Lattu (लट्टू) — spinning-top fight, top view of a mitti ring.
   Each player pulls back (like a gulel) and lets go: the pull sets speed and spin. Both tops land together.
   Tops slide towards the middle (the ground is a shallow bowl), clash, and every hit takes spin away —
   the top that is spinning harder takes less damage. A top that stops spinning, or leaves the ring, loses.
   Each player has 3 jhatke (a tug on the string) per round to push their top at the other one.
   Pulling all the way (over 92%) is risky: the top may land wrong and fall at once. First to 2 rounds. */
(function () {
  var K = DG.kit;
  var CL = {
    hi: { youFell: 'तुम्हारा लट्टू गिर गया!', youOut: 'तुम्हारा लट्टू घेरे से बाहर!', aim: function (n) { return n + ': पीछे खींचो और छोड़ो (ज़ोर = घुमाव)'; }, wait: 'दोनों लट्टू तैयार…', fight: 'लड़ाई!', jh: 'झटका', round: function (r) { return 'राउंड ' + r; },
      fell: function (n) { return n + ' का लट्टू गिर गया!'; }, out: function (n) { return n + ' का लट्टू घेरे से बाहर!'; }, bad: 'बहुत ज़ोर! लट्टू उल्टा गिरा 😬', spin: 'घुमाव', red: 'लाल', blue: 'नीला',
      rules: 'खींच के छोड़ो → लट्टू घेरे में घूमेगा। टकराने पर जिसका घुमाव ज़्यादा, वो कम घिसता है। ⚡ झटका = अपना लट्टू सामने वाले पर धकेलो (3 बार)। बहुत ज़्यादा ज़ोर = उल्टा गिरने का ख़तरा।' },
    en: { youFell: 'Your top fell!', youOut: 'Your top left the ring!', aim: function (n) { return n + ': pull back and let go (pull = spin)'; }, wait: 'Both tops ready…', fight: 'Fight!', jh: 'Tug', round: function (r) { return 'Round ' + r; },
      fell: function (n) { return n + "'s top fell!"; }, out: function (n) { return n + "'s top left the ring!"; }, bad: 'Too hard! The top landed wrong 😬', spin: 'Spin', red: 'Red', blue: 'Blue',
      rules: 'Pull back and let go → the top spins in the ring. When they clash, the one spinning harder wears down less. ⚡ Tug = push your top at the other (3 times). Pulling too hard may make it land wrong.' },
    hinglish: { youFell: 'Tumhara lattu gir gaya!', youOut: 'Tumhara lattu ghere se bahar!', aim: function (n) { return n + ': peeche kheencho aur chhodo (zor = ghumav)'; }, wait: 'Dono lattu taiyaar…', fight: 'Ladai!', jh: 'Jhatka', round: function (r) { return 'Round ' + r; },
      fell: function (n) { return n + ' ka lattu gir gaya!'; }, out: function (n) { return n + ' ka lattu ghere se bahar!'; }, bad: 'Bahut zor! Lattu ulta gira 😬', spin: 'Ghumav', red: 'Laal', blue: 'Neela',
      rules: 'Kheench ke chhodo → lattu ghere mein ghoomega. Takraane par jiska ghumav zyada, woh kam ghista hai. ⚡ Jhatka = apna lattu saamne wale par dhakelo (3 baar). Bahut zyada zor = ulta girne ka khatra.' },
    bn: { youFell: 'তোমার লাট্টু পড়ে গেল!', youOut: 'তোমার লাট্টু বৃত্তের বাইরে!', aim: function (n) { return n + ': পেছনে টেনে ছাড়ো (জোর = ঘোরা)'; }, wait: 'দুটো লাট্টু তৈরি…', fight: 'লড়াই!', jh: 'ঝটকা', round: function (r) { return 'রাউন্ড ' + r; },
      fell: function (n) { return n + '-এর লাট্টু পড়ে গেল!'; }, out: function (n) { return n + '-এর লাট্টু বৃত্তের বাইরে!'; }, bad: 'খুব জোর! লাট্টু উল্টে পড়ল 😬', spin: 'ঘোরা', red: 'লাল', blue: 'নীল',
      rules: 'টেনে ছাড়ো → লাট্টু বৃত্তে ঘুরবে। ধাক্কায় যে বেশি জোরে ঘোরে, সে কম ক্ষয় হয়। ⚡ ঝটকা = নিজের লাট্টু অন্যটার দিকে ঠেলো (৩ বার)। খুব বেশি জোরে টানলে উল্টে পড়তে পারে।' }
  };
  var L = K.lang(CL);
  var W = 360, C = 180, R = 150, TR = 17, WIN = 2, JH = 3;
  var COL = [['#e2513b', '#ffb199'], ['#2f6fd6', '#9cc4ff']];
  var START = [[C, C + R - 26], [C, C - R + 26]];

  /* physics, exposed for tests */
  function stepTops(t, dt, hit) {
    for (var i = 0; i < 2; i++) {
      var a = t[i]; if (a.dead) continue;
      var dx = C - a.x, dy = C - a.y;
      a.vx += dx * 0.9 * dt; a.vy += dy * 0.9 * dt;                        // bowl pulls to the middle
      var w = a.spin < 25 ? (25 - a.spin) * 2.2 : 0;                        // wobble when it slows down
      a.vx += (Math.random() - .5) * w * dt * 10; a.vy += (Math.random() - .5) * w * dt * 10;
      a.vx *= 1 - 0.9 * dt; a.vy *= 1 - 0.9 * dt;
      a.x += a.vx * dt; a.y += a.vy * dt;
      a.spin -= (2.4 + Math.hypot(a.vx, a.vy) * 0.004) * dt; a.ang += a.spin * dt * 0.6;
    }
    var p = t[0], q = t[1];
    if (!p.dead && !q.dead) {
      var dx2 = q.x - p.x, dy2 = q.y - p.y, d = Math.hypot(dx2, dy2);
      if (d < TR * 2 && d > 0) {
        var nx = dx2 / d, ny = dy2 / d, ov = TR * 2 - d;
        p.x -= nx * ov / 2; p.y -= ny * ov / 2; q.x += nx * ov / 2; q.y += ny * ov / 2;
        var vn = (q.vx - p.vx) * nx + (q.vy - p.vy) * ny;
        if (vn < 0) {
          var imp = -vn * 1.75 + 60;                                         // spinning tops kick each other apart
          p.vx -= imp * nx * .5; p.vy -= imp * ny * .5; q.vx += imp * nx * .5; q.vy += imp * ny * .5;
          var force = Math.min(1, (-vn + 40) / 260), ps = Math.max(1, p.spin), qs = Math.max(1, q.spin);
          p.spin -= force * 9 * Math.min(2.2, qs / ps); q.spin -= force * 9 * Math.min(2.2, ps / qs);
          if (hit) hit(force);
        }
      }
    }
  }
  DG.lattu = { step: stepTops };

  DG.register('lattu', {
    mount: function (wrap, opts) {
      var mode = opts.mode === 'ai' ? 'ai' : 'pass', c = K.clock(), X = L();
      var root = K.el('div', 'dk', null, wrap);
      var chip = K.el('div', 'dk-chip', null, root), stats = K.el('div', 'dk-stats', null, root);
      var cvs = K.canvas(root, W, W), g = cvs.g;
      var row = K.el('div', 'dk-row', null, root), hint = K.el('div', 'dk-hint', null, root);
      var jb = [K.btn(row, '', '', function () { jhatka(0); }), K.btn(row, '', 'ghost', function () { jhatka(1); })];
      var tops, phase, who, drag, aim, shots, wins, roundNo, banner, bannerT, jhLeft, spinSnd;
      function name(i) { X = L(); return mode === 'ai' ? K.pname('ai', i) : (i ? X.blue : X.red); }
      function human(i) { return mode !== 'ai' || i === 0; }

      function newTop(i) { return { x: START[i][0], y: START[i][1], vx: 0, vy: 0, spin: 0, ang: Math.random() * 6, dead: false }; }
      function start() { wins = [0, 0]; roundNo = 0; newRound(); }
      function newRound() {
        roundNo++; tops = [newTop(0), newTop(1)]; shots = [null, null]; jhLeft = [JH, JH]; who = 0; phase = 'aim'; aim = null; banner = X.round(roundNo); bannerT = 1.2;
        cvs.size(); render(); c.loop(loop);
      }
      function render() {
        X = L();
        chip.textContent = phase === 'aim' ? X.aim(name(who)) : (phase === 'fight' ? X.fight : X.round(roundNo));
        stats.innerHTML = [0, 1].map(function (i) { return '<span style="color:' + COL[i][0] + '">●</span><span>' + K.esc(name(i)) + ': <b>' + wins[i] + '</b> · ' + X.spin + ' <b>' + Math.max(0, Math.round(tops[i].spin)) + '</b></span>'; }).join('');
        [0, 1].forEach(function (i) {
          jb[i].textContent = '⚡ ' + X.jh + ' (' + jhLeft[i] + ')'; jb[i].style.display = human(i) ? '' : 'none';
          jb[i].disabled = phase !== 'fight' || !jhLeft[i] || tops[i].dead;
          jb[i].style.background = 'linear-gradient(135deg,' + COL[i][0] + ',' + COL[i][1] + ')'; jb[i].style.color = '#fff';
        });
        if (!hint.textContent) hint.textContent = X.rules;
      }

      cvs.cv.addEventListener('pointerdown', function (e) { if (phase !== 'aim' || !human(who)) return; drag = cvs.at(e); try { cvs.cv.setPointerCapture(e.pointerId); } catch (er) {} e.preventDefault(); });
      cvs.cv.addEventListener('pointermove', function (e) {
        if (!drag) return; var p = cvs.at(e), dx = drag[0] - p[0], dy = drag[1] - p[1], l = Math.hypot(dx, dy);
        var had = !!aim; aim = l < 8 ? null : { ang: Math.atan2(dy, dx), pow: Math.min(1, l / 170) }; if (aim && !had) DG.sfx('pull');
      });
      function up() { if (!drag) return; drag = null; if (aim && aim.pow > 0.12) take(who, aim.ang, aim.pow); aim = null; }
      cvs.cv.addEventListener('pointerup', up); cvs.cv.addEventListener('pointercancel', function () { drag = null; aim = null; });

      function take(i, ang, pow) {
        shots[i] = { ang: ang, pow: pow }; DG.sfx('tap');
        if (i === 0) { who = 1; render(); if (!human(1)) c.later(aiAim, 500); return; }
        launch();
      }
      function aiAim() {
        var tx = C + (Math.random() - .5) * 60, ty = C + (Math.random() - .5) * 60;
        take(1, Math.atan2(ty - START[1][1], tx - START[1][0]), 0.62 + Math.random() * 0.3);
      }
      function launch() {
        phase = 'fight'; hint.textContent = ''; banner = X.fight; bannerT = 0.9; spinSnd = 0;
        DG.sfx('strike', 0.8);
        [0, 1].forEach(function (i) {
          var s = shots[i], t = tops[i];
          t.vx = Math.cos(s.ang) * (60 + s.pow * 170); t.vy = Math.sin(s.ang) * (60 + s.pow * 170);
          t.spin = 45 + s.pow * 45 + Math.random() * 6;
          if (s.pow > 0.92 && Math.random() < 0.35) { t.spin = 3; if (human(i)) hint.textContent = X.bad; }   // landed wrong
        });
        render();
      }
      function jhatka(i) {
        if (phase !== 'fight' || !jhLeft[i] || tops[i].dead) return;
        var a = tops[i], b = tops[1 - i], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
        a.vx += dx / d * 150; a.vy += dy / d * 150; a.spin -= 4; jhLeft[i]--;
        DG.sfx('swish'); DG.buzz(25); render();
      }
      function aiThink() {
        if (mode !== 'ai' || phase !== 'fight' || !jhLeft[1]) return;
        var a = tops[1], b = tops[0], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > 70 && a.spin > b.spin + 4 && Math.random() < 0.02) jhatka(1);
        if (Math.hypot(a.x - C, a.y - C) > R - 35 && Math.random() < 0.05) { var dx = C - a.x, dy = C - a.y, l = Math.hypot(dx, dy); a.vx += dx / l * 120; a.vy += dy / l * 120; a.spin -= 4; jhLeft[1]--; DG.sfx('swish'); }
      }

      function loop(dt) {
        if (bannerT > 0) bannerT -= dt;
        if (phase === 'fight') {
          for (var k = 0; k < 4; k++) stepTops(tops, dt / 4, function (f) { DG.sfx('clack', f); if (f > .5) DG.buzz(20); });
          aiThink();
          spinSnd -= dt; if (spinSnd <= 0) { spinSnd = 0.5; DG.sfx('spin', Math.min(1, (tops[0].spin + tops[1].spin) / 160)); }
          for (var i = 0; i < 2; i++) {
            var t = tops[i];
            if (Math.hypot(t.x - C, t.y - C) > R + 4) { t.dead = 'out'; DG.sfx('swish'); return endRound(1 - i, mode === 'ai' && i === 0 ? X.youOut : X.out(name(i))); }
            if (t.spin <= 0) { t.dead = 'fell'; DG.sfx('thud', 0.8); return endRound(1 - i, mode === 'ai' && i === 0 ? X.youFell : X.fell(name(i))); }
          }
          if (Math.random() < 0.1) render();
        }
        draw(); return phase !== 'over';
      }
      function endRound(w, msg) {
        phase = 'end'; wins[w]++; banner = msg; bannerT = 2; hint.textContent = msg; render(); draw();
        DG.sfx(mode === 'ai' && w === 1 ? 'lose' : 'home');
        c.later(function () { if (wins[w] >= WIN) finish(w); else newRound(); }, 2200);
      }
      function finish(w) {
        phase = 'over'; c.stop();
        K.result(root, { mode: mode, winner: w, names: [name(0), name(1)], em: '🌀', sub: wins[0] + ' – ' + wins[1], again: function () { rebuild(); start(); }, onExit: opts.onExit });
      }
      function rebuild() { root.innerHTML = ''; [chip, stats, cvs.cv, row, hint].forEach(function (e) { root.appendChild(e); }); hint.textContent = ''; }

      function draw() {
        var g2 = cvs.begin();
        g2.fillStyle = '#b07a45'; g2.fillRect(0, 0, W, W);
        for (var i = 0; i < 60; i++) { g2.fillStyle = 'rgba(70,40,15,.12)'; g2.beginPath(); g2.arc((i * 97) % W, (i * 57) % W, 2 + i % 3, 0, 7); g2.fill(); }
        var gr = g2.createRadialGradient(C, C, 20, C, C, R); gr.addColorStop(0, '#c99560'); gr.addColorStop(1, '#a86f3d');
        g2.fillStyle = gr; g2.beginPath(); g2.arc(C, C, R, 0, 7); g2.fill();
        g2.strokeStyle = 'rgba(255,250,235,.85)'; g2.lineWidth = 3; g2.setLineDash([9, 6]); g2.beginPath(); g2.arc(C, C, R, 0, 7); g2.stroke(); g2.setLineDash([]);
        for (i = 0; i < 2; i++) drawTop(g2, tops[i], i);
        if (phase === 'aim' && aim) {
          var s = START[who], l = 40 + aim.pow * 120;
          g2.strokeStyle = aim.pow > .92 ? '#ff3b30' : aim.pow > .6 ? '#f39c12' : '#2ecc71'; g2.lineWidth = 6; g2.lineCap = 'round';
          g2.beginPath(); g2.moveTo(s[0], s[1]); g2.lineTo(s[0] + Math.cos(aim.ang) * l, s[1] + Math.sin(aim.ang) * l); g2.stroke();
        }
        if (bannerT > 0 && banner) {
          g2.font = '800 24px "Baloo 2", system-ui, sans-serif'; g2.textAlign = 'center'; g2.lineWidth = 6; g2.strokeStyle = 'rgba(20,10,40,.6)';
          g2.strokeText(banner, C, C - 8); g2.fillStyle = '#fff'; g2.fillText(banner, C, C - 8);
        }
      }
      function drawTop(g2, t, i) {
        if (phase === 'aim' && i > who) { g2.globalAlpha = .35; }
        var wob = t.spin < 25 && phase === 'fight' ? (25 - t.spin) * 0.25 : 0, ox = Math.cos(t.ang * 0.3) * wob, oy = Math.sin(t.ang * 0.3) * wob;
        g2.fillStyle = 'rgba(0,0,0,.28)'; g2.beginPath(); g2.ellipse(t.x + 4, t.y + 5, TR, TR * .8, 0, 0, 7); g2.fill();
        g2.save(); g2.translate(t.x + ox, t.y + oy);
        if (t.dead === 'fell') g2.scale(1.15, .7);
        var gr = g2.createRadialGradient(-5, -5, 2, 0, 0, TR); gr.addColorStop(0, COL[i][1]); gr.addColorStop(1, COL[i][0]);
        g2.fillStyle = gr; g2.beginPath(); g2.arc(0, 0, TR, 0, 7); g2.fill();
        g2.rotate(t.ang); g2.strokeStyle = 'rgba(255,255,255,.75)'; g2.lineWidth = 2.5;
        for (var k = 0; k < 3; k++) { g2.beginPath(); g2.arc(0, 0, TR * (0.35 + k * 0.22), k * 2, k * 2 + 2.2); g2.stroke(); }
        g2.fillStyle = '#5b3a1a'; g2.beginPath(); g2.arc(0, 0, 3.5, 0, 7); g2.fill();
        g2.restore(); g2.globalAlpha = 1;
      }

      start();
      return { destroy: function () { c.kill(); cvs.off(); wrap.innerHTML = ''; }, _state: function () { return { tops: tops, phase: phase, wins: wins }; }, _take: take };
    }
  });
})();

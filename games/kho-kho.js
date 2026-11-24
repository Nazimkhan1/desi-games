/* Kho-Kho (खो-खो) — top view. Seven chasers sit on the middle line facing alternate ways; one active chaser runs.
   The active chaser may NOT cut across the middle line between the two poles (only round a pole), but the runners
   may. Tap a sitting teammate to give "खो!": he jumps up on the other side and you sit in his place.
   Touch a runner = caught. 3 runners at a time; when all 3 are caught, 3 new ones come in. 60 s per innings.
   Innings 1: team 1 chases, innings 2: team 2 chases. Most catches wins.
   Controls: drag the active chaser, tap a sitter for kho. When your team runs, drag your runner (the one with ★).
   pass: player 1 chases while player 2 runs (★), then they swap. ai: you chase, then the computer chases you. */
(function () {
  var K = DG.kit;
  var CL = {
    hi: { chase: function (n) { return '🏃 ' + n + ' पकड़ रहा है'; }, youChase: '🏃 तुम पकड़ रहे हो', time: 'समय', caught: 'पकड़े', kho: 'खो!', got: '✋ पकड़ा!', newB: 'नए 3 धावक!', inn: function (n) { return 'पारी ' + n + '/2'; },
      next: function (n) { return 'अब ' + n + ' पकड़ेगा 👉'; }, go: '🏃 शुरू करो', you: '★ तुम्हारा धावक — बचो!',
      rules: 'पकड़ने वाला: उँगली से खींचो। बीच की लाइन को खंभों के बीच से पार नहीं कर सकते — बैठे साथी पर टैप करो = "खो!", वो दूसरी तरफ़ से उठेगा। धावक को छुओ = पकड़ा। 60 सेकंड में ज़्यादा पकड़ो। दौड़ते वक़्त ★ वाले को खींचकर बचाओ।' },
    en: { chase: function (n) { return '🏃 ' + n + ' is chasing'; }, youChase: '🏃 You are chasing', time: 'Time', caught: 'Caught', kho: 'Kho!', got: '✋ Caught!', newB: '3 new runners!', inn: function (n) { return 'Innings ' + n + '/2'; },
      next: function (n) { return 'Now ' + n + ' chases 👉'; }, go: '🏃 Start', you: '★ Your runner — escape!',
      rules: 'Chaser: drag to run. You can’t cut across the middle line between the poles — tap a sitting teammate for "Kho!" and he gets up on the other side. Touch a runner = caught. Catch the most in 60 s. When running, drag the ★ runner to escape.' },
    hinglish: { chase: function (n) { return '🏃 ' + n + ' pakad raha hai'; }, youChase: '🏃 Tum pakad rahe ho', time: 'Time', caught: 'Pakde', kho: 'Kho!', got: '✋ Pakda!', newB: 'Naye 3 dhaavak!', inn: function (n) { return 'Pari ' + n + '/2'; },
      next: function (n) { return 'Ab ' + n + ' pakdega 👉'; }, go: '🏃 Shuru karo', you: '★ Tumhara dhaavak — bacho!',
      rules: 'Pakadne wala: ungli se kheencho. Beech ki line ko khambhon ke beech se paar nahi kar sakte — baithe saathi par tap karo = "Kho!", woh doosri taraf se uthega. Dhaavak ko chhuo = pakda. 60 second mein zyada pakdo. Daudte waqt ★ wale ko kheench ke bachao.' },
    bn: { chase: function (n) { return '🏃 ' + n + ' ধরছে'; }, youChase: '🏃 তুমি ধরছ', time: 'সময়', caught: 'ধরা', kho: 'খো!', got: '✋ ধরা পড়েছে!', newB: 'নতুন ৩ জন দৌড়বাজ!', inn: function (n) { return 'ইনিংস ' + n + '/২'; },
      next: function (n) { return 'এবার ' + n + ' ধরবে 👉'; }, go: '🏃 শুরু করো', you: '★ তোমার দৌড়বাজ — পালাও!',
      rules: 'যে ধরবে: আঙুলে টানো। খুঁটির মাঝখান দিয়ে মাঝের দাগ পেরোনো যাবে না — বসা সঙ্গীকে ট্যাপ করো = "খো!", সে অন্য দিক থেকে উঠবে। দৌড়বাজকে ছুঁলে = ধরা। ৬০ সেকেন্ডে বেশি ধরো। দৌড়নোর সময় ★-কে টেনে পালাও।' }
  };
  var L = K.lang(CL);
  var W = 360, H = 440, CX = 180, P0 = 30, P1 = 410, R = 11, VC = 128, VR = 96, TIME = 60;
  var SIT = []; for (var i = 0; i < 7; i++) SIT.push(70 + i * 50);
  var COL = ['#e2513b', '#2f6fd6'];

  DG.register('khokho', {
    mount: function (wrap, opts) {
      var mode = opts.mode === 'ai' ? 'ai' : 'pass', c = K.clock(), X = L();
      var root = K.el('div', 'dk', null, wrap);
      var clk = 0, chip, stats, cvs, hint, inn, score, chaser, sitters, runners, left, phase, ptr, msg, msgT, bubble, khoCool, aiKhoT;
      function name(i) { return K.pname(mode, i); }
      function chaseTeam() { return inn - 1; }                 // innings 1: team 0 chases
      function humanChases() { return mode !== 'ai' || chaseTeam() === 0; }
      function humanRuns() { return mode !== 'ai' || chaseTeam() === 1; }

      function intro() {
        c.stop(); root.innerHTML = ''; X = L();
        var box = K.el('div', 'dk-setup', null, root); K.el('div', 'za-hand', '🏃‍♂️🧎🧎🧎', box).style.fontSize = '2.4rem';
        K.el('p', 'dk-rules', null, box).textContent = X.rules; K.btn(K.el('div', 'dk-row', null, box), X.go, '', function () { score = [0, 0]; inn = 1; build(); });
      }
      function build() {
        root.innerHTML = ''; X = L();
        chip = K.el('div', 'dk-chip', null, root); stats = K.el('div', 'dk-stats', null, root);
        cvs = K.canvas(root, W, H); hint = K.el('div', 'dk-hint', null, root); ptr = {};
        cvs.cv.addEventListener('pointerdown', function (e) {
          e.preventDefault(); var p = cvs.at(e);
          // runner ★ grab
          var me = runners.filter(function (r) { return r.me && !r.out; })[0];
          if (humanRuns() && me && Math.hypot(me.x - p[0], me.y - p[1]) < 46) { ptr[e.pointerId] = 'run'; me.tgt = p; try { cvs.cv.setPointerCapture(e.pointerId); } catch (er) {} return; }
          if (!humanChases()) return;
          for (var k = 0; k < sitters.length; k++) if (sitters[k].sit && Math.abs(p[0] - CX) < 22 && Math.abs(p[1] - sitters[k].y) < 20) { kho(k); return; }
          ptr[e.pointerId] = 'chase'; chaser.tgt = p; try { cvs.cv.setPointerCapture(e.pointerId); } catch (er) {}
        });
        cvs.cv.addEventListener('pointermove', function (e) { var k = ptr[e.pointerId], p = cvs.at(e); if (k === 'chase') chaser.tgt = p; else if (k === 'run') { var me = runners.filter(function (r) { return r.me && !r.out; })[0]; if (me) me.tgt = p; } });
        var up = function (e) { var k = ptr[e.pointerId]; delete ptr[e.pointerId]; if (k === 'chase') chaser.tgt = null; else if (k === 'run') runners.forEach(function (r) { if (r.me) r.tgt = null; }); };
        cvs.cv.addEventListener('pointerup', up); cvs.cv.addEventListener('pointercancel', up);
        start(); cvs.size(); c.loop(loop);
      }
      function start() {
        left = TIME; phase = 'play'; khoCool = 0; aiKhoT = 0; msg = '';
        sitters = SIT.map(function (y, k) { return { y: y, sit: true, face: k % 2 ? 1 : -1 }; });
        chaser = { x: CX + 22, y: P0 + 6, tgt: null };
        newBatch(); DG.sfx('whistle'); render();
      }
      function newBatch() {
        runners = [0, 1, 2].map(function (k) { return { x: 60 + k * 120, y: (chaser && chaser.y > H / 2 ? 90 : 350) + (Math.random() - .5) * 50, vx: 0, vy: 0, out: false, safe: 1.2, me: humanRuns() && k === 1, tgt: null, wob: Math.random() * 6 }; });
      }
      function render() {
        X = L(); chip.textContent = X.inn(inn) + ' · ' + (mode === 'ai' && chaseTeam() === 0 ? X.youChase : X.chase(name(chaseTeam())));
        stats.innerHTML = '<span>' + K.esc(name(0)) + ': <b>' + score[0] + '</b></span><span>' + K.esc(name(1)) + ': <b>' + score[1] + '</b></span><span>' + X.time + ': <b>' + Math.ceil(left) + 's</b></span>';
        hint.textContent = msg || (humanRuns() && !humanChases() ? X.you : X.rules);
      }
      function say(m) { msg = m; msgT = 1.4; render(); }
      function side(x) { return x < CX ? -1 : 1; }
      function kho(k) {
        if (khoCool > 0 || phase !== 'play') return;
        var s = sitters[k], from = side(chaser.x);
        // the active chaser sits in the empty seat closest to him, the tapped one gets up on the other side
        var empty = sitters.filter(function (o) { return !o.sit; })[0]; if (empty) empty.sit = true;
        s.sit = false; chaser.x = CX - from * 22; chaser.y = s.y; chaser.tgt = null; khoCool = 0.5;
        bubble = { x: CX, y: s.y, t: 0.8 }; DG.sfx('ting'); DG.buzz(20);
      }

      function moveTo(o, tx, ty, v, dt) { var dx = tx - o.x, dy = ty - o.y, d = Math.hypot(dx, dy); if (d < 1) return; var s = Math.min(d, v * dt); o.x += dx / d * s; o.y += dy / d * s; }
      function loop(dt) {
        if (msgT > 0) { msgT -= dt; if (msgT <= 0) { msg = ''; render(); } }
        if (bubble) { bubble.t -= dt; if (bubble.t <= 0) bubble = null; }
        if (phase === 'play') step(dt);
        draw(); return true;
      }
      function step(dt) {
        left -= dt; khoCool -= dt; clk += dt * 0.6; if (Math.floor(left) !== Math.floor(left + dt)) { render(); if (left < 5.5) DG.sfx('tick', 1); }
        if (left <= 0) return endInnings();
        // chaser
        var was = side(chaser.x);
        if (humanChases()) { if (chaser.tgt) moveTo(chaser, chaser.tgt[0], chaser.tgt[1] - 20, VC, dt); }
        else aiChase(dt);
        chaser.x = K.clamp(chaser.x, R + 4, W - R - 4); chaser.y = K.clamp(chaser.y, R + 4, H - R - 4);
        if (side(chaser.x) !== was && chaser.y > P0 && chaser.y < P1) chaser.x = CX + was * 14;   // no cutting across between the poles
        if (Math.abs(chaser.x - CX) < 14 && chaser.y > P0 && chaser.y < P1) chaser.x = CX + side(chaser.x) * 14;
        // runners
        runners.forEach(function (r) {
          if (r.out) return;
          if (r.me && r.tgt) moveTo(r, r.tgt[0], r.tgt[1] - 20, VR * 1.08, dt);   // ★ follows the finger; without a finger it runs by itself
          else {
            var dx = r.x - chaser.x, dy = r.y - chaser.y, d = Math.hypot(dx, dy) || 1, ax = 0, ay = 0;
            var blocked = side(r.x) !== side(chaser.x) && chaser.y > P0 + 20 && chaser.y < P1 - 20;   // other side = safe for now
            if (d < 170 && !blocked) { ax += dx / d * (170 - d) / 170 * 3; ay += dy / d * (170 - d) / 170 * 3; if (d < 90) ax += -side(r.x) * 1.4; }   // flee, and cross the line
            var nearLine = Math.abs(r.x - CX); if (blocked && nearLine < 60) ax += side(r.x) * (60 - nearLine) / 60 * 2.5;   // stay off the line: a kho could pop up right there
            ax += (W / 2 - r.x) / W * 0.6 + Math.sin(clk + r.wob) * 0.2; ay += (H / 2 - r.y) / H * 0.8 + Math.cos(r.wob + clk) * 0.3;
            r.vx += ax * dt * 260; r.vy += ay * dt * 260; var sp = Math.hypot(r.vx, r.vy); if (sp > VR) { r.vx *= VR / sp; r.vy *= VR / sp; }
            r.x += r.vx * dt; r.y += r.vy * dt;
          }
          r.x = K.clamp(r.x, R + 4, W - R - 4); r.y = K.clamp(r.y, R + 4, H - R - 4);
          if (Math.abs(r.x - CX) < 13) sitters.forEach(function (s) { if (s.sit && Math.abs(r.y - s.y) < 14) r.y += (r.y < s.y ? -1 : 1) * 60 * dt; });
          if (r.safe > 0) r.safe -= dt;
          else if (Math.hypot(r.x - chaser.x, r.y - chaser.y) < R * 2 + 2) { r.out = true; score[chaseTeam()]++; DG.sfx('capture'); DG.buzz(50); say(X.got); }
        });
        if (runners.every(function (r) { return r.out; })) { newBatch(); DG.sfx('whistle'); say(X.newB); }
      }
      function aiChase(dt) {
        var live = runners.filter(function (r) { return !r.out; }); if (!live.length) return;
        var me = live.filter(function (r) { return r.me; })[0];
        var tg = live.sort(function (a, b) { return Math.hypot(a.x - chaser.x, a.y - chaser.y) - Math.hypot(b.x - chaser.x, b.y - chaser.y); })[0];
        if (me && Math.random() < 0.6 && side(me.x) === side(chaser.x)) tg = me;
        if (side(tg.x) !== side(chaser.x)) {
          aiKhoT -= dt;
          if (aiKhoT <= 0) { var best = -1, bd = 1e9; sitters.forEach(function (s, k) { if (!s.sit) return; var d = Math.abs(s.y - tg.y); if (d < bd) { bd = d; best = k; } });
            aiKhoT = 0.8 + Math.random() * 0.6; if (best >= 0 && Math.random() < 0.75) { kho(best); return; } }
          moveTo(chaser, CX + side(chaser.x) * 20, tg.y, VC * .9, dt); return;
        }
        moveTo(chaser, tg.x, tg.y, VC * .9, dt);
      }
      function endInnings() {
        phase = 'end'; DG.sfx('whistle'); render();
        if (inn === 2) return c.later(finish, 900);
        c.later(function () {
          root.innerHTML = ''; var box = K.el('div', 'dk-setup', null, root);
          K.el('h3', null, K.esc(name(0)) + ': ' + score[0] + ' ' + X.caught, box);
          K.btn(K.el('div', 'dk-row', null, box), X.next(name(1)), '', function () { inn = 2; build(); });
        }, 900);
      }
      function finish() {
        phase = 'over'; c.stop(); cvs.off();
        K.result(root, { mode: mode, winner: score[0] === score[1] ? -1 : (score[0] > score[1] ? 0 : 1), names: [name(0), name(1)], em: '🏃',
          sub: name(0) + ' ' + score[0] + ' – ' + score[1] + ' ' + name(1), again: function () { score = [0, 0]; inn = 1; build(); }, onExit: opts.onExit });
      }

      function draw() {
        var g = cvs.begin();
        g.fillStyle = '#c98f55'; g.fillRect(0, 0, W, H);
        g.strokeStyle = 'rgba(255,252,240,.9)'; g.lineWidth = 3; g.strokeRect(6, 6, W - 12, H - 12);
        g.lineWidth = 3; g.beginPath(); g.moveTo(CX, P0); g.lineTo(CX, P1); g.stroke();
        [P0, P1].forEach(function (y) { g.fillStyle = '#6b4219'; g.beginPath(); g.arc(CX, y, 7, 0, 7); g.fill(); });
        var ct = COL[chaseTeam()], rt = COL[1 - chaseTeam()];
        sitters.forEach(function (s) {
          if (!s.sit) return; g.fillStyle = ct; g.globalAlpha = .85; g.beginPath(); g.arc(CX, s.y, 10, 0, 7); g.fill(); g.globalAlpha = 1;
          g.fillStyle = '#fff'; g.font = '11px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s.face > 0 ? '▶' : '◀', CX, s.y);
        });
        runners.forEach(function (r) { if (r.out) return; g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(r.x + 2, r.y + 4, R, R * .7, 0, 0, 7); g.fill();
          g.fillStyle = rt; g.beginPath(); g.arc(r.x, r.y, R, 0, 7); g.fill(); g.strokeStyle = r.me ? '#ffd36b' : 'rgba(255,255,255,.8)'; g.lineWidth = r.me ? 4 : 2; g.stroke();
          if (r.me) { g.fillStyle = '#fff'; g.font = '800 12px system-ui'; g.fillText('★', r.x, r.y + 1); } });
        g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(chaser.x + 2, chaser.y + 4, R + 2, (R + 2) * .7, 0, 0, 7); g.fill();
        g.fillStyle = ct; g.beginPath(); g.arc(chaser.x, chaser.y, R + 2, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.stroke();
        g.font = '14px sans-serif'; g.fillText('🏃', chaser.x, chaser.y + 1);
        if (bubble) { g.font = '800 20px "Baloo 2", system-ui'; g.lineWidth = 5; g.strokeStyle = 'rgba(20,10,40,.6)'; g.strokeText(X.kho, bubble.x + 38, bubble.y - 10); g.fillStyle = '#ffd36b'; g.fillText(X.kho, bubble.x + 38, bubble.y - 10); }
        if (msg && msgT > 0) { g.font = '800 22px "Baloo 2", system-ui'; g.lineWidth = 6; g.strokeStyle = 'rgba(20,10,40,.6)'; g.strokeText(msg, W / 2, 24 + 14); g.fillStyle = '#fff'; g.fillText(msg, W / 2, 24 + 14); }
      }

      intro();
      return { destroy: function () { c.kill(); if (cvs) cvs.off(); wrap.innerHTML = ''; }, _state: function () { return { score: score, inn: inn, chaser: chaser, runners: runners, left: left }; } };
    }
  });
})();

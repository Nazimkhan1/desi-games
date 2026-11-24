/* Pitthu / Sitoliya (पिट्ठू). 7 flat stones in a pile.
   1) Girao: pull back and let go to throw the ball at the pile (3 tries; too soft falls short).
   2) Jamao: the stones fly apart; tap them biggest → smallest to build the pile again before the
      other side's ball reaches you. A wrong stone costs time. Pile done in time = "Pitthu!" = 1 point.
   pass: two players take 3 turns each. ai: you, then the computer plays its turns on screen. */
(function () {
  var K = DG.kit;
  var CL = {
    hi: { throwT: function (n) { return n + ': गेंद फेंको — पीछे खींचो, छोड़ो'; }, tries: 'मौके', build: 'बड़े से छोटा — पत्थर जमाओ!', ball: 'गेंद आ रही है…', turn: 'बारी',
      hit: '💥 गिर गया! अब जमाओ!', short: 'कम ज़ोर — गेंद पहले गिरी', missT: 'चूक गए!', noHit: '3 मौके ख़त्म — पिट्ठू नहीं गिरा', done: '🎉 पिट्ठू! +1', outT: '😬 गेंद लग गई — आउट!', wrong: 'ग़लत पत्थर! बड़ा वाला पहले', aiPlay: 'कंप्यूटर खेल रहा…',
      rules: 'पीछे खींचकर छोड़ो, गेंद से पत्थरों का ढेर गिराओ। फिर बड़े से छोटे क्रम में पत्थरों पर टैप करके पिट्ठू जमाओ — गेंद आने से पहले!' },
    en: { throwT: function (n) { return n + ': throw — pull back, let go'; }, tries: 'Tries', build: 'Biggest to smallest — build it!', ball: 'Ball is coming…', turn: 'Turn',
      hit: '💥 Down! Now build it!', short: 'Too soft — fell short', missT: 'Missed!', noHit: 'No tries left — pile still standing', done: '🎉 Pitthu! +1', outT: '😬 Hit by the ball — out!', wrong: 'Wrong stone! Bigger one first', aiPlay: 'Computer is playing…',
      rules: 'Pull back and let go to knock the pile down. Then tap the stones biggest to smallest to build the pile again — before the ball gets you!' },
    hinglish: { throwT: function (n) { return n + ': ball phenko — peeche kheencho, chhodo'; }, tries: 'Mauke', build: 'Bade se chhota — patthar jamao!', ball: 'Ball aa rahi hai…', turn: 'Baari',
      hit: '💥 Gir gaya! Ab jamao!', short: 'Kam zor — ball pehle giri', missT: 'Chook gaye!', noHit: '3 mauke khatam — pitthu nahi gira', done: '🎉 Pitthu! +1', outT: '😬 Ball lag gayi — out!', wrong: 'Galat patthar! Bada wala pehle', aiPlay: 'Computer khel raha…',
      rules: 'Peeche kheench ke chhodo, ball se pattharon ka dher girao. Phir bade se chhote kram mein pattharon par tap karke pitthu jamao — ball aane se pehle!' },
    bn: { throwT: function (n) { return n + ': বল ছোড়ো — পেছনে টেনে ছাড়ো'; }, tries: 'সুযোগ', build: 'বড় থেকে ছোট — সাজাও!', ball: 'বল আসছে…', turn: 'পালা',
      hit: '💥 পড়ে গেছে! এবার সাজাও!', short: 'জোর কম — বল আগেই পড়ল', missT: 'ফসকে গেল!', noHit: '৩টে সুযোগ শেষ — পিট্টু পড়েনি', done: '🎉 পিট্টু! +১', outT: '😬 বল লেগে গেছে — আউট!', wrong: 'ভুল পাথর! বড়টা আগে', aiPlay: 'কম্পিউটার খেলছে…',
      rules: 'পেছনে টেনে ছেড়ে বল দিয়ে পাথরের স্তূপ ফেলো। তারপর বড় থেকে ছোট ক্রমে পাথরে ট্যাপ করে আবার সাজাও — বল আসার আগে!' }
  };
  var L = K.lang(CL);
  var W = 360, H = 400, PX = 180, PY = 130, BX = 180, BY = 370, N = 7, TURNS = 3;

  DG.register('pitthu', {
    mount: function (wrap, opts) {
      var mode = opts.mode === 'ai' ? 'ai' : 'pass', c = K.clock(), X = L();
      var root = K.el('div', 'dk', null, wrap);
      var chip = K.el('div', 'dk-chip', null, root), stats = K.el('div', 'dk-stats', null, root);
      var cvs = K.canvas(root, W, H), hint = K.el('div', 'dk-hint', null, root);
      var bar = K.el('div', null, null, root); bar.style.cssText = 'width:min(86vw,340px);height:12px;border-radius:8px;background:var(--panel);overflow:hidden;box-shadow:inset 0 0 0 1px var(--line)';
      var fill = K.el('div', null, null, bar); fill.style.cssText = 'height:100%;width:0;background:linear-gradient(90deg,#2ecc71,#f5a524,#ff3b30)';
      var who, score, turnNo, phase, tries, stones, next, ball, aim, drag, ballT, ballMax, msg, msgT, shake;
      function name(i) { return K.pname(mode, i); }
      function human() { return mode !== 'ai' || who === 0; }

      function pile() { // biggest at the bottom
        var a = []; for (var i = 0; i < N; i++) a.push({ r: 30 - i * 3.2, x: PX, y: PY - i * 9, vx: 0, vy: 0, size: i, placed: true });
        return a;
      }
      function start() { score = [0, 0]; who = 0; turnNo = 1; newTurn(); c.loop(loop); }
      function newTurn() { stones = pile(); next = N; tries = 3; phase = 'throw'; ball = null; aim = null; ballT = 0; fill.style.width = '0'; msg = ''; render(); if (!human()) c.later(aiThrow, 900); }
      function render() {
        X = L();
        chip.textContent = phase === 'throw' ? X.throwT(name(who)) : (phase === 'build' ? X.build : name(who));
        stats.innerHTML = '<span>' + K.esc(name(0)) + ': <b>' + score[0] + '</b></span><span>' + K.esc(name(1)) + ': <b>' + score[1] + '</b></span><span>' + X.turn + ' <b>' + Math.min(turnNo, TURNS) + '/' + TURNS + '</b></span>' + (phase === 'throw' ? '<span>' + X.tries + ': <b>' + tries + '</b></span>' : '');
        hint.textContent = msg || (!human() ? X.aiPlay : (phase === 'build' ? X.ball : X.rules));
      }
      function say(m) { msg = m; msgT = 1.6; render(); }

      cvs.cv.addEventListener('pointerdown', function (e) {
        if (!human()) return; var p = cvs.at(e);
        if (phase === 'throw' && !ball) { drag = p; try { cvs.cv.setPointerCapture(e.pointerId); } catch (er) {} e.preventDefault(); return; }
        if (phase === 'build') tapStone(p);
      });
      cvs.cv.addEventListener('pointermove', function (e) {
        if (!drag) return; var p = cvs.at(e), dx = drag[0] - p[0], dy = drag[1] - p[1], l = Math.hypot(dx, dy);
        var had = !!aim; aim = l < 8 || dy > -2 && l < 20 ? null : { dx: dx / Math.max(l, 1), pow: Math.min(1, l / 180), ang: Math.atan2(dy, dx) }; if (aim && !had) DG.sfx('pull');
      });
      function up() { if (!drag) return; drag = null; if (aim && aim.pow > .1) throwBall(aim.ang, aim.pow); aim = null; }
      cvs.cv.addEventListener('pointerup', up); cvs.cv.addEventListener('pointercancel', function () { drag = null; aim = null; });

      function throwBall(ang, pow) {
        if (Math.sin(ang) > -0.15) ang = -Math.PI / 2 + (ang > -Math.PI / 2 ? .3 : -.3); // must go up the field
        tries--; DG.sfx('swish');
        var reach = 140 + pow * 300;                       // distance it can roll
        ball = { x: BX, y: BY, vx: Math.cos(ang), vy: Math.sin(ang), left: reach, done: false };
        render();
      }
      function aiThrow() {
        if (phase !== 'throw' || ball) return;
        var err = (Math.random() - .5) * 0.22, ang = Math.atan2(PY - BY, PX - BX) + err;
        throwBall(ang, 0.62 + Math.random() * 0.35);
      }
      function knock() {
        phase = 'build'; ball = null; DG.sfx('capture'); DG.sfx('clack', 1); DG.buzz(50); say(X.hit);
        stones.forEach(function (s) { var a = Math.random() * 6.283, sp = 120 + Math.random() * 200; s.vx = Math.cos(a) * sp; s.vy = Math.sin(a) * sp * .8; s.placed = false; });
        next = 0; ballMax = 9 + Math.random() * 3 - (turnNo - 1) * 0.6; ballT = 0;   // a bit less time each turn
        if (!human()) c.later(aiBuild, 1200);
      }
      function stoneAt(p) {
        var best = null, bd = 1e9;
        stones.forEach(function (s) { if (s.placed) return; var d = Math.hypot((p[0] - s.x) / 1, (p[1] - s.y) / .55); if (d < s.r + 14 && d < bd) { bd = d; best = s; } });
        return best;
      }
      function tapStone(p) { var s = stoneAt(p); if (s) chooseStone(s); }
      function chooseStone(s) {
        if (phase !== 'build') return;
        if (s.size !== next) { ballT += 0.7; s.shake = 0.3; DG.sfx('buzz'); DG.buzz(40); say(X.wrong); return; }
        s.placed = true; s.tx = PX; s.ty = PY - next * 9; next++; DG.sfx('place');
        if (next === N) { phase = 'scored'; score[who]++; DG.sfx('mill'); say(X.done); c.later(endTurn, 1600); }
      }
      function aiBuild() {
        if (phase !== 'build') return;
        var wrongPick = Math.random() < 0.12, pool = stones.filter(function (s) { return !s.placed; });
        var s = wrongPick && pool.length > 1 ? K.pick(pool.filter(function (x) { return x.size !== next; })) : stones[next];
        chooseStone(s);
        if (phase === 'build') c.later(aiBuild, 850 + Math.random() * 650);
      }
      function endTurn() {
        if (who === 0) who = 1; else { who = 0; turnNo++; }
        if (turnNo > TURNS) return finish();
        newTurn();
      }
      function finish() {
        phase = 'over'; c.stop();
        K.result(root, { mode: mode, winner: score[0] === score[1] ? -1 : (score[0] > score[1] ? 0 : 1), names: [name(0), name(1)], em: '🪨',
          sub: name(0) + ' ' + score[0] + ' – ' + score[1] + ' ' + name(1), again: function () { root.innerHTML = ''; [chip, stats, cvs.cv, hint, bar].forEach(function (e) { root.appendChild(e); }); start(); }, onExit: opts.onExit });
      }

      function loop(dt) {
        if (msgT > 0) { msgT -= dt; if (msgT <= 0) { msg = ''; render(); } }
        if (ball && !ball.done) {
          var sp = 520 * dt; ball.x += ball.vx * sp; ball.y += ball.vy * sp; ball.left -= sp;
          var hitY = PY - 20;
          if (ball.y <= PY + 14 && ball.y >= hitY - 30 && Math.abs(ball.x - PX) < 34) return knock(), true;
          if (ball.left <= 0 || ball.y < 0 || ball.x < 0 || ball.x > W) {
            ball.done = true; DG.sfx('thud', .4); say(ball.left <= 0 && ball.y > PY ? X.short : X.missT);
            c.later(function () { ball = null; if (tries <= 0) { say(X.noHit); c.later(endTurn, 1400); } else { render(); if (!human()) c.later(aiThrow, 700); } }, 600);
          }
        }
        stones.forEach(function (s) {
          if (s.placed && s.tx != null) { s.x += (s.tx - s.x) * Math.min(1, dt * 12); s.y += (s.ty - s.y) * Math.min(1, dt * 12); }
          else if (!s.placed) { s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= 1 - 3 * dt; s.vy *= 1 - 3 * dt; s.x = K.clamp(s.x, 34, W - 34); s.y = K.clamp(s.y, 60, H - 90); }
          if (s.shake > 0) s.shake -= dt;
        });
        if (phase === 'build') {
          ballT += dt; fill.style.width = Math.min(100, ballT / ballMax * 100) + '%';
          if (Math.floor(ballT * 2) !== Math.floor((ballT - dt) * 2) && ballT > ballMax - 3) DG.sfx('tick', 1);
          if (ballT >= ballMax) { phase = 'scored'; DG.sfx('thwack'); DG.buzz(90); say(X.outT); c.later(endTurn, 1600); }
        }
        draw(); return true;
      }

      function draw() {
        var g = cvs.begin();
        var gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#9fc77a'); gr.addColorStop(1, '#c49a5f'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 3; g.setLineDash([8, 6]); g.beginPath(); g.moveTo(40, BY - 26); g.lineTo(W - 40, BY - 26); g.stroke(); g.setLineDash([]);
        g.beginPath(); g.ellipse(PX, PY + 6, 46, 14, 0, 0, 7); g.stroke();
        // stones: draw unplaced first, then the pile bottom→top
        var list = stones.slice().sort(function (a, b) { return (a.placed ? 1 : 0) - (b.placed ? 1 : 0) || a.size - b.size; });
        list.forEach(function (s) {
          var jx = s.shake > 0 ? Math.sin(s.shake * 80) * 3 : 0;
          g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(s.x + 3 + jx, s.y + 6, s.r, s.r * .45, 0, 0, 7); g.fill();
          var sg = g.createLinearGradient(0, s.y - 8, 0, s.y + 8); sg.addColorStop(0, '#d9d2c5'); sg.addColorStop(1, '#8d8273');
          g.fillStyle = sg; g.beginPath(); g.ellipse(s.x + jx, s.y, s.r, s.r * .42, 0, 0, 7); g.fill();
          g.strokeStyle = 'rgba(60,50,40,.5)'; g.lineWidth = 1.2; g.stroke();
          if (phase === 'build' && !s.placed && s.size === next && human()) { g.strokeStyle = 'rgba(255,211,107,.9)'; g.lineWidth = 2.5; g.beginPath(); g.ellipse(s.x, s.y, s.r + 5, s.r * .42 + 5, 0, 0, 7); g.stroke(); }
        });
        // thrower + ball
        g.fillStyle = who ? '#2f6fd6' : '#e2513b'; g.beginPath(); g.arc(BX, BY + 6, 11, 0, 7); g.fill();
        if (aim) { var l = 40 + aim.pow * 110; g.strokeStyle = aim.pow > .75 ? '#e74c3c' : '#2ecc71'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(BX, BY); g.lineTo(BX + Math.cos(aim.ang) * l, BY + Math.sin(aim.ang) * l); g.stroke(); }
        if (ball && !ball.done) { g.fillStyle = '#fff'; g.beginPath(); g.arc(ball.x, ball.y, 7, 0, 7); g.fill(); g.strokeStyle = '#c0392b'; g.lineWidth = 1.5; g.stroke(); }
        if (msg && msgT > 0) {
          g.font = '800 22px "Baloo 2", system-ui, sans-serif'; g.textAlign = 'center'; g.lineWidth = 6; g.strokeStyle = 'rgba(20,10,40,.6)';
          g.strokeText(msg, W / 2, 40); g.fillStyle = '#fff'; g.fillText(msg, W / 2, 40);
        }
      }

      cvs.size(); start();
      return { destroy: function () { c.kill(); cvs.off(); wrap.innerHTML = ''; }, _state: function () { return { phase: phase, score: score, who: who, next: next, turnNo: turnNo }; }, _throw: throwBall, _stones: function () { return stones; }, _choose: chooseStone };
    }
  });
})();

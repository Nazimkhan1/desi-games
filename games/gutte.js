/* Gutte / Paanch Goti (गुट्टे) — five stones, one phone.
   Tap UCHHALO: the hand stone flies up. While it is in the air, tap the ground stones you must pick up
   (level 1: one per toss, level 2: two, level 3: three then one, level 4: all four), then tap PAKDO
   while it is falling near the hand. Picked the wrong count, or the stone hits the ground = turn over.
   Clear all 4 levels first to win. pass: two players take turns; ai: you vs computer. */
(function () {
  var K = DG.kit;
  var CL = {
    hi: { lvl: function (n, l) { return n + ' — लेवल ' + l; }, toss: '⬆️ उछालो', catchB: '✊ पकड़ो!', pick: function (k) { return 'हवा में रहते ' + k + ' गोटी उठाओ, फिर पकड़ो'; },
      dropped: '😬 गोटी ज़मीन पर गिरी!', few: '😬 पूरी गोटी नहीं उठाईं', early: '😬 जल्दी पकड़ा — गोटी अभी ऊपर थी', okT: '✓ शाबाश!', lvlUp: function (l) { return '🎉 लेवल ' + l + ' पूरा!'; }, aiPlay: 'कंप्यूटर खेल रहा…',
      rules: 'उछालो दबाओ → गोटी ऊपर जाएगी। हवा में रहते ज़मीन की गोटियों पर टैप करके उठाओ, फिर गिरती गोटी को हाथ के पास आते ही "पकड़ो"। लेवल 1: एक-एक, 2: दो-दो, 3: तीन फिर एक, 4: चारों एक साथ।' },
    en: { lvl: function (n, l) { return n + ' — level ' + l; }, toss: '⬆️ Toss', catchB: '✊ Catch!', pick: function (k) { return 'Pick up ' + k + ' while it is in the air, then catch'; },
      dropped: '😬 It hit the ground!', few: '😬 Didn’t pick up enough', early: '😬 Too early — it was still high', okT: '✓ Well done!', lvlUp: function (l) { return '🎉 Level ' + l + ' done!'; }, aiPlay: 'Computer is playing…',
      rules: 'Tap Toss → the stone goes up. While it is in the air, tap ground stones to pick them up, then tap Catch as it falls near the hand. Level 1: one at a time, 2: two, 3: three then one, 4: all four at once.' },
    hinglish: { lvl: function (n, l) { return n + ' — level ' + l; }, toss: '⬆️ Uchhalo', catchB: '✊ Pakdo!', pick: function (k) { return 'Hawa mein rehte ' + k + ' goti uthao, phir pakdo'; },
      dropped: '😬 Goti zameen par giri!', few: '😬 Poori goti nahi uthaayi', early: '😬 Jaldi pakda — goti abhi upar thi', okT: '✓ Shabaash!', lvlUp: function (l) { return '🎉 Level ' + l + ' poora!'; }, aiPlay: 'Computer khel raha…',
      rules: 'Uchhalo dabao → goti upar jaayegi. Hawa mein rehte zameen ki gotiyon par tap karke uthao, phir girti goti ko haath ke paas aate hi "Pakdo". Level 1: ek-ek, 2: do-do, 3: teen phir ek, 4: chaaron ek saath.' },
    bn: { lvl: function (n, l) { return n + ' — লেভেল ' + l; }, toss: '⬆️ ছোড়ো', catchB: '✊ ধরো!', pick: function (k) { return 'হাওয়ায় থাকতে ' + k + 'টা গুটি তোলো, তারপর ধরো'; },
      dropped: '😬 গুটি মাটিতে পড়ল!', few: '😬 সব গুটি তোলোনি', early: '😬 তাড়াতাড়ি ধরেছ — গুটি তখনও ওপরে', okT: '✓ সাবাশ!', lvlUp: function (l) { return '🎉 লেভেল ' + l + ' শেষ!'; }, aiPlay: 'কম্পিউটার খেলছে…',
      rules: 'ছোড়ো টেপো → গুটি ওপরে যাবে। হাওয়ায় থাকতে মাটির গুটিতে ট্যাপ করে তোলো, তারপর পড়ন্ত গুটি হাতের কাছে এলে "ধরো"। লেভেল ১: একটা করে, ২: দুটো, ৩: তিনটে তারপর একটা, ৪: চারটে একসাথে।' }
  };
  var L = K.lang(CL);
  var PLAN = { 1: [1, 1, 1, 1], 2: [2, 2], 3: [3, 1], 4: [4] };
  var W = 360, H = 400, HX = 180, HY = 330, TOP = 70;
  var CLR = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];

  DG.register('gutte', {
    mount: function (wrap, opts) {
      var mode = opts.mode === 'ai' ? 'ai' : 'pass', c = K.clock(), X = L();
      var root = K.el('div', 'dk', null, wrap);
      var chip = K.el('div', 'dk-chip', null, root), stats = K.el('div', 'dk-stats', null, root);
      var cvs = K.canvas(root, W, H), big = K.el('button', 'dk-big', null, root), hint = K.el('div', 'dk-hint', null, root);
      big.type = 'button'; big.addEventListener('pointerdown', function (e) { e.preventDefault(); if (human()) press(); });
      var prog, who, phase, stones, air, held, plan, tossI, need, msg, msgT, T;
      function name(i) { return K.pname(mode, i); }
      function human() { return mode !== 'ai' || who === 0; }

      function start() { prog = [{ l: 1 }, { l: 1 }]; who = 0; newTurn(); c.loop(loop); }
      function newTurn() { setLevel(prog[who].l); render(); if (!human()) c.later(aiPlay, 900); }
      function setLevel(l) {
        plan = PLAN[l]; tossI = 0; phase = 'ready'; air = null; held = 0;
        stones = []; for (var i = 0; i < 4; i++) stones.push({ x: 70 + i * 60 + (Math.random() - .5) * 26, y: 210 + (Math.random() - .5) * 60, up: false, col: CLR[i + 1] });
        T = 1.55 - (l - 1) * 0.12;
      }
      function render() {
        X = L(); chip.textContent = X.lvl(name(who), prog[who].l);
        stats.innerHTML = [0, 1].map(function (i) { return '<span>' + K.esc(name(i)) + ': <b>' + (prog[i].l - 1) + '/4</b></span>'; }).join('');
        big.textContent = phase === 'air' ? X.catchB : X.toss; big.disabled = !human() || !(phase === 'ready' || phase === 'air');
        need = plan[tossI];
        hint.textContent = msg || (!human() ? X.aiPlay : (phase === 'air' ? X.pick(need) : X.rules));
      }
      function say(m) { msg = m; msgT = 1.5; render(); }

      function press() { if (phase === 'ready') toss(); else if (phase === 'air') grab(); }
      function toss() { phase = 'air'; held = 0; air = { t: 0 }; DG.sfx('toss'); render(); }
      function grab() {
        var h = height(air.t);
        if (air.t < T * 0.5 || h > 0.55) { DG.sfx('buzz'); return fail(X.early); }
        if (held < need) { DG.sfx('buzz'); return fail(X.few); }
        DG.sfx('catch'); phase = 'ready'; air = null; tossI++;
        if (tossI >= plan.length) { // level done
          DG.sfx('mill'); say(X.lvlUp(prog[who].l)); prog[who].l++;
          if (prog[who].l > 4) return c.later(function () { finish(who); }, 1100);
          phase = 'between'; render(); return c.later(function () { setLevel(prog[who].l); render(); if (!human()) c.later(aiPlay, 700); }, 1200);
        }
        say(X.okT); if (!human()) c.later(aiPlay, 600);
      }
      function pickAt(p) {
        if (phase !== 'air' || held >= need) return;
        var best = null, bd = 30; stones.forEach(function (s) { if (s.up) return; var d = Math.hypot(s.x - p[0], s.y - p[1]); if (d < bd) { bd = d; best = s; } });
        if (best) { best.up = true; held++; DG.sfx('clack', .5); render(); }
      }
      cvs.cv.addEventListener('pointerdown', function (e) { e.preventDefault(); if (!human()) return; pickAt(cvs.at(e)); });
      function fail(m) {
        phase = 'fail'; air = null; DG.buzz(60); say(m);
        c.later(function () { who = 1 - who; msg = ''; newTurn(); }, 1500);
      }
      function aiPlay() {
        if (phase !== 'ready') return; toss();
        var slow = Math.random() < 0.12, k = 0;
        (function pickNext() {
          if (phase !== 'air') return;
          if (k < need && !slow) { var s = stones.filter(function (x) { return !x.up; })[0]; if (s) { c.later(function () { pickAt([s.x, s.y]); k++; pickNext(); }, 180 + Math.random() * 160); return; } }
          var when = T * (0.86 + Math.random() * 0.11) + (Math.random() < 0.1 ? 0.3 : 0);   // sometimes late
          c.later(function () { if (phase === 'air') grab(); }, Math.max(0, when - air.t) * 1000);
        })();
      }
      function height(t) { var u = t / T; return 4 * u * (1 - u); }
      function finish(w) {
        phase = 'over'; c.stop();
        K.result(root, { mode: mode, winner: w, names: [name(0), name(1)], em: '✊', sub: name(0) + ' ' + (prog[0].l - 1) + '/4 · ' + name(1) + ' ' + (prog[1].l - 1) + '/4',
          again: function () { root.innerHTML = ''; [chip, stats, cvs.cv, big, hint].forEach(function (e) { root.appendChild(e); }); msg = ''; start(); }, onExit: opts.onExit });
      }

      function loop(dt) {
        if (msgT > 0) { msgT -= dt; if (msgT <= 0) { msg = ''; render(); } }
        if (phase === 'air') { air.t += dt; if (air.t >= T) { DG.sfx('thud', .5); fail(X.dropped); } }
        draw(); return true;
      }
      function draw() {
        var g = cvs.begin();
        var gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#f3d9a6'); gr.addColorStop(1, '#c9935a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
        g.fillStyle = 'rgba(120,60,20,.18)'; g.beginPath(); g.ellipse(W / 2, 215, 160, 70, 0, 0, 7); g.fill();
        // catch zone
        if (phase === 'air') { var zy = HY - 0.55 * (HY - TOP); g.fillStyle = 'rgba(46,204,113,.18)'; g.fillRect(HX - 40, zy, 80, HY - zy); g.strokeStyle = 'rgba(46,204,113,.6)'; g.setLineDash([5, 4]); g.strokeRect(HX - 40, zy, 80, HY - zy); g.setLineDash([]); }
        stones.forEach(function (s) { if (s.up) return; stone(g, s.x, s.y, s.col, phase === 'air' && held < need && human()); });
        // hand
        g.font = '54px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(phase === 'air' ? '🤚' : '✊', HX, HY + 22);
        if (held) { g.font = '800 15px "Baloo 2", system-ui'; g.fillStyle = '#5a2d0c'; g.fillText('+' + held + '/' + need, HX + 46, HY + 22); }
        // the stone in the air
        var hy = phase === 'air' ? HY - height(air.t) * (HY - TOP) : HY - 8;
        if (phase !== 'fail') stone(g, HX, hy, CLR[0], false);
        if (msg && msgT > 0) { g.font = '800 20px "Baloo 2", system-ui'; g.lineWidth = 5; g.strokeStyle = 'rgba(20,10,40,.55)'; g.strokeText(msg, W / 2, 36); g.fillStyle = '#fff'; g.fillText(msg, W / 2, 36); }
      }
      function stone(g, x, y, col, glow) {
        if (glow) { g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 2.5; g.beginPath(); g.arc(x, y, 17, 0, 7); g.stroke(); }
        var sg = g.createRadialGradient(x - 4, y - 4, 2, x, y, 12); sg.addColorStop(0, '#fff'); sg.addColorStop(.35, col); sg.addColorStop(1, 'rgba(0,0,0,.45)');
        g.fillStyle = sg; g.beginPath(); g.arc(x, y, 11, 0, 7); g.fill();
      }

      cvs.size(); start();
      return { destroy: function () { c.kill(); cvs.off(); wrap.innerHTML = ''; }, _state: function () { return { prog: prog, who: who, phase: phase, tossI: tossI }; } };
    }
  });
})();

/* Zameen-Aasmaan (ज़मीन-आसमान) — listen to the WORD, not the hand.
   The caller says ज़मीन or आसमान and points 👆 or 👇 — sometimes the hand points the wrong way to trick you.
   Tap the top half for आसमान, the bottom half for ज़मीन. 15 calls each; faster right answers score more
   (3 for quick, 2, 1); a wrong tap or no tap scores 0. pass: player 1 then player 2. ai: you, then the computer. */
(function () {
  var K = DG.kit;
  K.css('za-style',
    '.za-field{position:relative;width:min(94vw,400px);height:min(62vh,470px);border-radius:20px;overflow:hidden;box-shadow:var(--shadow);touch-action:manipulation;cursor:pointer;}' +
    '.za-sky,.za-ground{position:absolute;left:0;right:0;height:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-d);font-weight:800;font-size:1.05rem;color:rgba(255,255,255,.85);transition:filter .15s;}' +
    '.za-sky{top:0;background:linear-gradient(#5fb6ef,#b9e2fb);align-items:flex-start;padding-top:12px;} .za-ground{bottom:0;background:linear-gradient(#8bc36a,#6b8f3a 40%,#8a5a2b);align-items:flex-end;padding-bottom:12px;}' +
    '.za-sky.ok,.za-ground.ok{filter:brightness(1.25) saturate(1.3);} .za-sky.no,.za-ground.no{filter:grayscale(1) brightness(.6);}' +
    '.za-call{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:2px;pointer-events:none;}' +
    '.za-word{font-family:var(--font-d);font-weight:800;font-size:2.4rem;color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.35),0 0 18px rgba(0,0,0,.35);}' +
    '.za-hand{font-size:3.4rem;line-height:1;} .za-pop{animation:zap .25s ease-out;} @keyframes zap{from{transform:scale(.5);opacity:0}to{transform:none;opacity:1}}' +
    '.za-pts{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-family:var(--font-d);font-weight:800;font-size:1.5rem;color:#ffd36b;text-shadow:0 2px 0 rgba(0,0,0,.4);pointer-events:none;}');
  var CL = {
    hi: { youTurn: 'तुम्हारी बारी', up: 'आसमान', down: 'ज़मीन', go: '☁️ शुरू करो', turn: function (n) { return n + ' की बारी'; }, pass: function (n) { return 'फ़ोन ' + n + ' को दो'; }, ready: 'तैयार', call: 'पुकार', pts: 'पॉइंट',
      rules: 'शब्द सुनो, हाथ नहीं! "आसमान" पर ऊपर का आधा, "ज़मीन" पर नीचे का आधा टैप करो। हाथ 👆👇 कभी-कभी उल्टा इशारा करेगा — धोखे में मत आना। जल्दी सही = ज़्यादा पॉइंट।', aiPlay: 'अब कंप्यूटर खेल रहा…' },
    en: { youTurn: 'Your turn', up: 'Sky', down: 'Ground', go: '☁️ Start', turn: function (n) { return n + "'s turn"; }, pass: function (n) { return 'Give the phone to ' + n; }, ready: 'Ready', call: 'Call', pts: 'points',
      rules: 'Follow the word, not the hand! "Sky" → tap the top half, "Ground" → the bottom half. The hand 👆👇 sometimes points the wrong way — don’t fall for it. Quick and right = more points.', aiPlay: 'Now the computer plays…' },
    hinglish: { youTurn: 'Tumhari baari', up: 'Aasmaan', down: 'Zameen', go: '☁️ Shuru karo', turn: function (n) { return n + ' ki baari'; }, pass: function (n) { return 'Phone ' + n + ' ko do'; }, ready: 'Taiyaar', call: 'Pukaar', pts: 'point',
      rules: 'Shabd suno, haath nahi! "Aasmaan" par upar ka aadha, "Zameen" par neeche ka aadha tap karo. Haath 👆👇 kabhi-kabhi ulta ishaara karega — dhokhe mein mat aana. Jaldi sahi = zyada point.', aiPlay: 'Ab computer khel raha…' },
    bn: { youTurn: 'তোমার পালা', up: 'আকাশ', down: 'মাটি', go: '☁️ শুরু করো', turn: function (n) { return n + '-এর পালা'; }, pass: function (n) { return 'ফোন ' + n + '-কে দাও'; }, ready: 'তৈরি', call: 'ডাক', pts: 'পয়েন্ট',
      rules: 'শব্দ শোনো, হাত নয়! "আকাশ" হলে ওপরের অর্ধেক, "মাটি" হলে নিচের অর্ধেক ট্যাপ করো। হাত 👆👇 মাঝে মাঝে উল্টো দেখাবে — ঠকো না। তাড়াতাড়ি ঠিক = বেশি পয়েন্ট।', aiPlay: 'এবার কম্পিউটার খেলছে…' }
  };
  var L = K.lang(CL), CALLS = 15;

  DG.register('zameen', {
    mount: function (wrap, opts) {
      var mode = opts.mode === 'ai' ? 'ai' : 'pass', c = K.clock(), X = L();
      var root = K.el('div', 'dk', null, wrap);
      var who, score, n, call, t0, open, els;
      function name(i) { return K.pname(mode, i); }

      function intro() {
        c.stop(); root.innerHTML = ''; X = L();
        var box = K.el('div', 'dk-setup', null, root);
        K.el('div', 'za-hand', '☁️👆👇🌱', box);
        K.el('p', 'dk-rules', null, box).textContent = X.rules;
        K.btn(K.el('div', 'dk-row', null, box), X.go, '', function () { score = [0, 0]; who = 0; play(); });
      }
      function play() {
        root.innerHTML = ''; X = L(); n = 0;
        var chip = K.el('div', 'dk-chip', null, root); chip.textContent = mode === 'ai' && who === 0 ? X.youTurn : X.turn(name(who));
        var stats = K.el('div', 'dk-stats', null, root);
        var f = K.el('div', 'za-field', null, root);
        var sky = K.el('div', 'za-sky', '☁️ ' + X.up, f), gr = K.el('div', 'za-ground', '🌱 ' + X.down, f);
        var cl = K.el('div', 'za-call', null, f), hand = K.el('div', 'za-hand', null, cl), word = K.el('div', 'za-word', X.ready, cl), pts = K.el('div', 'za-pts', null, f);
        els = { stats: stats, sky: sky, gr: gr, hand: hand, word: word, pts: pts, f: f };
        f.addEventListener('pointerdown', function (e) {
          e.preventDefault(); if (!open || (mode === 'ai' && who === 1)) return;
          var r = f.getBoundingClientRect(); answer(e.clientY - r.top < r.height / 2 ? 'up' : 'down');
        });
        paint(); c.later(next, 1100);
      }
      function paint() { els.stats.innerHTML = '<span>' + K.esc(name(0)) + ': <b>' + score[0] + '</b></span><span>' + K.esc(name(1)) + ': <b>' + score[1] + '</b></span><span>' + X.call + ' <b>' + n + '/' + CALLS + '</b></span>'; }
      function next() {
        if (n >= CALLS) return endTurn();
        n++; var dir = Math.random() < .5 ? 'up' : 'down', trick = n > 2 && Math.random() < 0.35;
        call = { dir: dir, hand: trick ? (dir === 'up' ? 'down' : 'up') : dir, id: n };
        var win = Math.max(1.0, 1.8 - n * 0.05); call.win = win;
        els.sky.className = 'za-sky'; els.gr.className = 'za-ground'; els.pts.textContent = '';
        els.word.textContent = dir === 'up' ? X.up : X.down; els.hand.textContent = call.hand === 'up' ? '👆' : '👇';
        [els.word, els.hand].forEach(function (e) { e.classList.remove('za-pop'); void e.offsetWidth; e.classList.add('za-pop'); });
        DG.sfx('toss'); open = true; t0 = performance.now(); paint();
        var id = n;
        if (mode === 'ai' && who === 1) {
          var rt = 0.42 + Math.random() * 0.6, wrong = Math.random() < (trick ? 0.2 : 0.06);
          c.later(function () { if (n === id && open) answer(wrong ? (dir === 'up' ? 'down' : 'up') : dir); }, rt * 1000);
        }
        c.later(function () { if (n === id && open) { open = false; DG.sfx('thud', .3); els.pts.textContent = '0'; c.later(next, 500); } }, win * 1000);
      }
      function answer(side) {
        open = false; var rt = (performance.now() - t0) / 1000, ok = side === call.dir;
        var p = ok ? (rt < call.win * 0.4 ? 3 : rt < call.win * 0.7 ? 2 : 1) : 0;
        score[who] += p; els.pts.textContent = ok ? '+' + p : '✗';
        (side === 'up' ? els.sky : els.gr).classList.add(ok ? 'ok' : 'no');
        DG.sfx(ok ? (p === 3 ? 'ting' : 'catch') : 'buzz'); if (!ok) DG.buzz(60);
        paint(); c.later(next, 550);
      }
      function endTurn() {
        if (who === 1) return finish();
        who = 1; root.innerHTML = '';
        var box = K.el('div', 'dk-setup', null, root);
        K.el('h3', null, K.esc(name(0)) + ': ' + score[0] + ' ' + X.pts, box);
        if (mode === 'ai') { K.el('p', 'dk-rules', null, box).textContent = X.aiPlay; c.later(play, 1300); }
        else K.btn(K.el('div', 'dk-row', null, box), X.pass(name(1)) + ' 👉', '', play);
      }
      function finish() {
        c.stop();
        K.result(root, { mode: mode, winner: score[0] === score[1] ? -1 : (score[0] > score[1] ? 0 : 1), names: [name(0), name(1)], em: '☁️',
          sub: name(0) + ' ' + score[0] + ' – ' + score[1] + ' ' + name(1), again: function () { score = [0, 0]; who = 0; play(); }, onExit: opts.onExit });
      }
      intro();
      return { destroy: function () { c.kill(); wrap.innerHTML = ''; }, _state: function () { return { score: score, who: who, n: n, call: call }; }, _answer: function (s) { if (open) answer(s); } };
    }
  });
})();

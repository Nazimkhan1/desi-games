/* Posham Pa (पोशम्पा) — two kids hold their hands up as a gate while everyone sings; kids walk under it.
   Hold your button to walk, let go to stop. Each time you get through the gate: +1.
   When the song ends the gate comes down: whoever is under it is caught (−2, back to the start).
   The song sometimes goes round twice — watch the words. 3 songs; most points wins.
   pass: two kids, two buttons (left / right). ai: you vs a computer kid. The rhyme is the traditional folk one. */
(function () {
  var K = DG.kit;
  var SONG = {
    hi: ['पोशम्पा भई पोशम्पा', 'डाकिये ने क्या किया?', 'सौ रुपये की घड़ी चुराई', 'अब तो जेल में जाना पड़ेगा', 'जेल की रोटी खानी पड़ेगी', 'जेल का पानी पीना पड़ेगा'],
    hinglish: ['Posham pa bhai posham pa', 'Daakiye ne kya kiya?', 'Sau rupaye ki ghadi churaayi', 'Ab to jail mein jaana padega', 'Jail ki roti khaani padegi', 'Jail ka paani peena padega'],
    en: ['Posham pa, oh posham pa', 'What did the postman do?', 'He stole a hundred-rupee watch', 'Now he has to go to jail', 'He’ll eat the jail’s roti', 'He’ll drink the jail’s water'],
    bn: ['পোশম পা ভাই পোশম পা', 'ডাকপিয়ন কী করেছে?', 'একশো টাকার ঘড়ি চুরি', 'এবার তো জেলে যেতে হবে', 'জেলের রুটি খেতে হবে', 'জেলের জল খেতে হবে']
  };
  var CL = {
    hi: { hold: 'दबाए रखो = चलो', song: function (n, t) { return 'गाना ' + n + '/' + t; }, caught: function (n) { return '🔒 ' + n + ' पकड़ा गया! −2'; }, through: '+1', safe: '😅 बच गए!', start: '🎵 शुरू करो', aiKid: 'कंप्यूटर',
      rules: 'बटन दबाए रखो तो बच्चा चलेगा, छोड़ो तो रुकेगा। दरवाज़े के नीचे से निकलो = +1। गाना ख़त्म होते ही दरवाज़ा गिरेगा — नीचे रहे तो पकड़े गए (−2)। गाना कभी दो बार भी चलता है, बोल पढ़ते रहो!' },
    en: { hold: 'Hold = walk', song: function (n, t) { return 'Song ' + n + '/' + t; }, caught: function (n) { return '🔒 ' + n + ' caught! −2'; }, through: '+1', safe: '😅 Safe!', start: '🎵 Start', aiKid: 'Computer',
      rules: 'Hold your button to walk, let go to stop. Get through the gate = +1. When the song ends the gate drops — if you are under it you are caught (−2). Sometimes the song goes round twice, so watch the words!' },
    hinglish: { hold: 'Dabaaye rakho = chalo', song: function (n, t) { return 'Gaana ' + n + '/' + t; }, caught: function (n) { return '🔒 ' + n + ' pakda gaya! −2'; }, through: '+1', safe: '😅 Bach gaye!', start: '🎵 Shuru karo', aiKid: 'Computer',
      rules: 'Button dabaaye rakho to bachcha chalega, chhodo to rukega. Darwaaze ke neeche se niklo = +1. Gaana khatam hote hi darwaaza girega — neeche rahe to pakde gaye (−2). Gaana kabhi do baar bhi chalta hai, bol padhte raho!' },
    bn: { hold: 'চেপে রাখো = হাঁটো', song: function (n, t) { return 'গান ' + n + '/' + t; }, caught: function (n) { return '🔒 ' + n + ' ধরা পড়েছে! −২'; }, through: '+১', safe: '😅 বেঁচে গেছ!', start: '🎵 শুরু করো', aiKid: 'কম্পিউটার',
      rules: 'বোতাম চেপে রাখলে হাঁটবে, ছাড়লে থামবে। দরজার নিচ দিয়ে বেরোলে = +১। গান শেষ হলেই দরজা নামবে — নিচে থাকলে ধরা (−২)। গান মাঝে মাঝে দুবার চলে, কথা দেখতে থাকো!' }
  };
  var L = K.lang(CL);
  var W = 360, H = 250, GY = 200, G0 = 158, G1 = 202, SP = 74, SONGS = 3, BEAT = 1.45;
  var KC = [['#e2513b', '#ffb199'], ['#2f6fd6', '#9cc4ff']];

  DG.register('posham', {
    mount: function (wrap, opts) {
      var mode = opts.mode === 'ai' ? 'ai' : 'pass', c = K.clock(), X = L();
      var root = K.el('div', 'dk', null, wrap);
      var chip, stats, cvs, line, row, hint, kids, score, songNo, t, plan, phase, gateY, msg, msgT, bg;
      function name(i) { return K.pname(mode, i); }

      function intro() {
        c.stop(); root.innerHTML = ''; X = L();
        var box = K.el('div', 'dk-setup', null, root);
        K.el('div', 'za-hand', '🙌🧒🧒🙌', box).style.fontSize = '2.6rem';
        K.el('p', 'dk-rules', null, box).textContent = X.rules;
        K.btn(K.el('div', 'dk-row', null, box), X.start, '', build);
      }
      function build() {
        root.innerHTML = ''; X = L();
        chip = K.el('div', 'dk-chip', null, root); stats = K.el('div', 'dk-stats', null, root);
        cvs = K.canvas(root, W, H);
        line = K.el('div', 'dk-chip', null, root); line.style.cssText += ';min-height:1.6em;color:#ffd36b;font-size:1.1rem';
        row = K.el('div', 'dk-row', null, root); hint = K.el('div', 'dk-hint', null, root);
        kids = [0, 1].map(function (i) { return { x: 30 + i * 34, hold: false, laps: 0, cool: 0 }; });
        [0, 1].forEach(function (i) {
          if (mode === 'ai' && i === 1) return;
          var b = K.el('button', 'dk-btn', '🚶 ' + K.esc(name(i)) + ' — ' + X.hold, row); b.type = 'button';
          b.style.background = 'linear-gradient(135deg,' + KC[i][0] + ',' + KC[i][1] + ')'; b.style.color = '#fff'; b.style.minWidth = mode === 'pass' ? '44%' : '80%'; b.style.padding = '20px 10px';
          var on = function (e) { e.preventDefault(); kids[i].hold = true; }, off = function () { kids[i].hold = false; };
          b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
        });
        score = [0, 0]; songNo = 0; cvs.size(); newSong(); c.loop(loop);
      }
      function newSong() {
        songNo++; t = -1.2; phase = 'sing'; gateY = 0; msg = '';
        var rounds = Math.random() < 0.45 ? 2 : 1, lines = SONG[DG.lang] || SONG.en, n = lines.length * rounds + (Math.random() < .5 ? 2 : 0); // sometimes repeat the first 2 lines too
        plan = { n: n, lines: lines, end: n * BEAT, brave: Math.random() < 0.3 };   // brave: computer kid gambles this song
        render();
      }
      function lineAt(k) { var ls = plan.lines; return ls[k % ls.length]; }
      function render() {
        X = L(); chip.textContent = X.song(songNo, SONGS);
        stats.innerHTML = [0, 1].map(function (i) { return '<span style="color:' + KC[i][0] + '">●</span><span>' + K.esc(name(i)) + ': <b>' + score[i] + '</b></span>'; }).join('');
        hint.textContent = msg || X.rules;
      }
      function say(m) { msg = m; msgT = 1.6; render(); }
      function under(k) { return k.x > G0 - 8 && k.x < G1 + 8; }

      function loop(dt) {
        if (msgT > 0) { msgT -= dt; if (msgT <= 0) { msg = ''; render(); } }
        if (phase === 'sing') {
          var before = t; t += dt;
          var bi = Math.floor(t / BEAT), pb = Math.floor(before / BEAT);
          if (t >= 0 && bi !== pb && bi < plan.n) { line.textContent = '🎵 ' + lineAt(bi); DG.sfx('tick', bi >= plan.n - 1 ? 1 : 0); }
          if (t >= plan.end) drop();
        }
        if (phase === 'drop') { gateY = Math.min(1, gateY + dt * 5); }
        // computer kid: walks, but waits near the gate if the song might end
        if (mode === 'ai') {
          var k = kids[1], left = plan.end - t, near = k.x > G0 - 40 && k.x < G0 - 6, lastLines = !plan.brave && left < BEAT * 1.5 + Math.random() * 0.4;
          k.hold = phase === 'sing' && !(near && lastLines);
        }
        kids.forEach(function (k, i) {
          if (k.cool > 0) { k.cool -= dt; return; }
          if (k.hold && phase !== 'drop') {
            var was = k.x; k.x += SP * dt;
            if (was <= G1 + 8 && k.x > G1 + 8) { score[i]++; DG.sfx('catch'); render(); }
            if (k.x > W + 14) k.x = -14;
            if (Math.floor(was / 22) !== Math.floor(k.x / 22)) DG.sfx('step');
          }
        });
        draw(); return true;
      }
      function drop() {
        phase = 'drop'; line.textContent = '🔒 !!!'; DG.sfx('thwack'); DG.buzz(80);
        var caught = [];
        kids.forEach(function (k, i) { if (under(k)) { caught.push(i); score[i] -= 2; k.x = 20 + i * 30; k.cool = 0.8; } });
        if (caught.length) { DG.sfx('capture'); say(caught.map(function (i) { return X.caught(name(i)); }).join(' · ')); } else say(X.safe);
        render();
        c.later(function () { if (songNo >= SONGS) finish(); else newSong(); }, 2200);
      }
      function finish() {
        phase = 'over'; c.stop(); cvs.off();
        K.result(root, { mode: mode, winner: score[0] === score[1] ? -1 : (score[0] > score[1] ? 0 : 1), names: [name(0), name(1)], em: '🙌',
          sub: name(0) + ' ' + score[0] + ' – ' + score[1] + ' ' + name(1), again: build, onExit: opts.onExit });
      }

      function kid(g, x, col, arm, walk) {
        g.save(); g.translate(x, GY);
        g.strokeStyle = '#3b2412'; g.lineWidth = 3.4; g.lineCap = 'round';
        var lg = walk ? Math.sin(x * 0.25) * 5 : 0;
        g.beginPath(); g.moveTo(0, -18); g.lineTo(-4 - lg, 0); g.moveTo(0, -18); g.lineTo(4 + lg, 0); g.stroke();
        g.fillStyle = col; g.beginPath(); g.moveTo(-7, -36); g.lineTo(7, -36); g.lineTo(6, -17); g.lineTo(-6, -17); g.closePath(); g.fill();
        if (arm != null) { g.beginPath(); g.moveTo(0, -34); g.lineTo(arm[0], arm[1]); g.stroke(); }
        g.fillStyle = '#8a5a35'; g.beginPath(); g.arc(0, -43, 7, 0, 7); g.fill(); g.fillStyle = '#1d140c'; g.beginPath(); g.arc(0, -45, 7, Math.PI, 0); g.fill();
        g.restore();
      }
      function draw() {
        var g = cvs.begin();
        var sk = g.createLinearGradient(0, 0, 0, GY); sk.addColorStop(0, '#ffcf8a'); sk.addColorStop(1, '#ffe9c4'); g.fillStyle = sk; g.fillRect(0, 0, W, GY);
        g.fillStyle = '#c99560'; g.fillRect(0, GY, W, H - GY);
        g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(G0 - 8, GY, G1 - G0 + 16, 4);
        // the gate: two kids, arms joined in an arch (down when it drops)
        var up = 1 - gateY, hy = GY - 34 - 42 * up;
        kid(g, G0 - 16, '#8e44ad', [16 + 6, hy - GY + 0], false); kid(g, G1 + 16, '#16a085', [-16 - 6, hy - GY], false);
        g.strokeStyle = '#3b2412'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(G0 + 6, hy); g.quadraticCurveTo((G0 + G1) / 2, hy - 8 * up, G1 - 6, hy); g.stroke();
        kids.forEach(function (k, i) { kid(g, k.x, KC[i][0], null, k.hold && phase === 'sing'); g.fillStyle = KC[i][0]; g.font = '800 11px "Baloo 2", system-ui'; g.textAlign = 'center'; g.fillText(name(i), k.x, GY + 18); });
        if (phase === 'sing' && t < 0) { g.font = '800 26px "Baloo 2", system-ui'; g.textAlign = 'center'; g.fillStyle = '#5a2d0c'; g.fillText(String(Math.ceil(-t)), W / 2, 60); }
      }

      intro();
      return { destroy: function () { c.kill(); if (cvs) cvs.off(); wrap.innerHTML = ''; }, _state: function () { return { score: score, kids: kids, phase: phase, t: t, plan: plan }; } };
    }
  });
})();

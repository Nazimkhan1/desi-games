/* Stapu / Kit-Kit (स्टापू, hopscotch). Chalk court: 1, 2, 3, [4|5], 6, [7|8].
   Level k: 1) throw the gitti into box k — a swinging power bar; tap the LEFT or RIGHT half of the button
   (the side matters only for the double boxes). On a line or in the wrong box = turn over.
   2) hop to the top in rhythm: a single box = 🦶 one foot, a double row = 👣 both feet — but in the row that has
   your gitti you land on one foot, and you never step in the gitti's box. Wrong foot or too late = turn over.
   Clear all 8 levels first to win. pass: two players take turns; ai: you vs computer. */
(function () {
  var K = DG.kit;
  var CL = {
    hi: { lvl: function (n, k) { return n + ' — खाना ' + k; }, throwB: '🎯 गिट्टी फेंको', left: '⬅ बायाँ', right: 'दायाँ ➡', one: '🦶 एक पैर', two: '👣 दोनों पैर',
      inBox: '✓ सही खाने में! अब कूदो', line: '😬 लाइन पर गिरी!', wrong: function (b) { return '😬 खाना ' + b + ' में गिरी'; }, out: '😬 बाहर गिरी!', hopNow: 'लय में कूदो!', late: '⏰ देर हो गई!', badFoot: '😬 ग़लत पैर!',
      done: function (k) { return '🎉 खाना ' + k + ' पूरा!'; }, aiPlay: 'कंप्यूटर खेल रहा…', rules: 'हिलती पट्टी पर सही समय टैप करो — गिट्टी उसी खाने में जाए। दोहरे खाने (4|5, 7|8) के लिए बटन का बायाँ/दायाँ हिस्सा दबाओ। फिर लय में कूदो: अकेला खाना = एक पैर, दोहरा = दोनों पैर, गिट्टी वाली कतार = एक पैर। 8 खाने पहले पूरे = जीत।' },
    en: { lvl: function (n, k) { return n + ' — box ' + k; }, throwB: '🎯 Throw the gitti', left: '⬅ Left', right: 'Right ➡', one: '🦶 One foot', two: '👣 Both feet',
      inBox: '✓ In the box! Now hop', line: '😬 On the line!', wrong: function (b) { return '😬 Landed in box ' + b; }, out: '😬 Out of the court!', hopNow: 'Hop in rhythm!', late: '⏰ Too late!', badFoot: '😬 Wrong foot!',
      done: function (k) { return '🎉 Box ' + k + ' done!'; }, aiPlay: 'Computer is playing…', rules: 'Tap when the swinging bar is right so the gitti lands in the box. For the double boxes (4|5, 7|8) tap the left or right half of the button. Then hop in rhythm: single box = one foot, double row = both feet, the gitti’s row = one foot. First to clear all 8 wins.' },
    hinglish: { lvl: function (n, k) { return n + ' — khaana ' + k; }, throwB: '🎯 Gitti phenko', left: '⬅ Baayan', right: 'Daayan ➡', one: '🦶 Ek pair', two: '👣 Dono pair',
      inBox: '✓ Sahi khaane mein! Ab koodo', line: '😬 Line par giri!', wrong: function (b) { return '😬 Khaana ' + b + ' mein giri'; }, out: '😬 Bahar giri!', hopNow: 'Lay mein koodo!', late: '⏰ Der ho gayi!', badFoot: '😬 Galat pair!',
      done: function (k) { return '🎉 Khaana ' + k + ' poora!'; }, aiPlay: 'Computer khel raha…', rules: 'Hilti patti par sahi time tap karo — gitti usi khaane mein jaaye. Dohre khaane (4|5, 7|8) ke liye button ka baayan/daayan hissa dabao. Phir lay mein koodo: akela khaana = ek pair, dohra = dono pair, gitti wali kataar = ek pair. 8 khaane pehle poore = jeet.' },
    bn: { lvl: function (n, k) { return n + ' — ঘর ' + k; }, throwB: '🎯 গুটি ছোড়ো', left: '⬅ বাঁ', right: 'ডান ➡', one: '🦶 এক পা', two: '👣 দুই পা',
      inBox: '✓ ঠিক ঘরে! এবার লাফাও', line: '😬 দাগে পড়েছে!', wrong: function (b) { return '😬 ঘর ' + b + '-এ পড়েছে'; }, out: '😬 বাইরে পড়েছে!', hopNow: 'তালে লাফাও!', late: '⏰ দেরি হয়ে গেল!', badFoot: '😬 ভুল পা!',
      done: function (k) { return '🎉 ঘর ' + k + ' শেষ!'; }, aiPlay: 'কম্পিউটার খেলছে…', rules: 'দোলা পট্টি ঠিক জায়গায় এলে ট্যাপ করো — গুটি সেই ঘরে পড়বে। জোড়া ঘরে (৪|৫, ৭|৮) বোতামের বাঁ/ডান দিক টেপো। তারপর তালে লাফাও: একা ঘর = এক পা, জোড়া = দুই পা, গুটির সারি = এক পা। আগে ৮টা ঘর শেষ = জয়।' }
  };
  var L = K.lang(CL);
  var ROWS = [[1], [2], [3], [4, 5], [6], [7, 8]];
  var W = 300, H = 420, X0 = 60, BW = 180, RH = 58, Y0 = H - 40;          // court geometry (row 0 at the bottom)
  function rowOf(b) { for (var r = 0; r < ROWS.length; r++) if (ROWS[r].indexOf(b) >= 0) return r; return -1; }
  function boxRect(b) { var r = rowOf(b), row = ROWS[r], i = row.indexOf(b), w = BW / row.length; return { x: X0 + i * w, y: Y0 - (r + 1) * RH, w: w, h: RH }; }
  /* where a throw lands: meter 0..1 along the court, side 0 left / 1 right → {box, line, out} */
  function landing(m, side) {
    var pos = m * ROWS.length * 1.08;                     // a full bar overshoots the court a little
    if (pos >= ROWS.length) return { out: true };
    var r = Math.floor(pos), f = pos - r;
    if (f < 0.1 || f > 0.9) return { line: true, row: r };
    var row = ROWS[r]; return { box: row.length === 1 ? row[0] : row[side] };
  }
  DG.stapu = { landing: landing, rowOf: rowOf };

  DG.register('stapu', {
    mount: function (wrap, opts) {
      var mode = opts.mode === 'ai' ? 'ai' : 'pass', c = K.clock(), X = L();
      var root = K.el('div', 'dk', null, wrap);
      var chip = K.el('div', 'dk-chip', null, root), stats = K.el('div', 'dk-stats', null, root);
      var cvs = K.canvas(root, W, H), row = K.el('div', 'dk-row', null, root), hint = K.el('div', 'dk-hint', null, root);
      var level, who, phase, meter, mdir, gitti, step, path, beatT, beat, kid, msg, msgT;
      function name(i) { return K.pname(mode, i); }
      function human() { return mode !== 'ai' || who === 0; }

      function start() { level = [1, 1]; who = 0; newTurn(); c.loop(loop); }
      function newTurn() { phase = 'throw'; meter = 0; mdir = 1; gitti = null; kid = { row: -1, side: .5 }; buttons(); render(); if (!human()) c.later(aiThrow, 900 + Math.random() * 600); }
      function buttons() {
        row.innerHTML = ''; X = L();
        if (phase === 'throw') {
          var b = K.el('button', 'dk-big', null, row); b.type = 'button'; b.style.display = 'flex'; b.style.justifyContent = 'space-between'; b.style.padding = '16px 18px';
          b.innerHTML = '<span>' + X.left + '</span><span>' + X.throwB + '</span><span>' + X.right + '</span>'; b.disabled = !human();
          b.addEventListener('pointerdown', function (e) { e.preventDefault(); if (!human() || phase !== 'throw') return; var r = b.getBoundingClientRect(); doThrow(e.clientX - r.left < r.width / 2 ? 0 : 1); });
        } else if (phase === 'hop') {
          [['one', 1], ['two', 2]].forEach(function (o) { var b = K.btn(row, X[o[0]], o[1] === 2 ? 'ghost' : '', function () {}); b.disabled = !human();
            b.onclick = null; b.addEventListener('pointerdown', function (e) { e.preventDefault(); if (human()) hop(o[1]); }); });
        }
      }
      function render() {
        X = L(); chip.textContent = X.lvl(name(who), level[who]);
        stats.innerHTML = [0, 1].map(function (i) { return '<span>' + K.esc(name(i)) + ': <b>' + (level[i] - 1) + '/8</b></span>'; }).join('');
        hint.textContent = msg || (!human() ? X.aiPlay : (phase === 'hop' ? X.hopNow : X.rules));
      }
      function say(m) { msg = m; msgT = 1.6; render(); }

      function doThrow(side) {
        if (phase !== 'throw') return; phase = 'flying'; DG.sfx('toss');
        var res = landing(meter, side), k = level[who];
        gitti = { from: [W / 2, H - 8], res: res, t: 0, side: side };
        var tgt = res.out ? [W / 2, 10] : (res.line ? [W / 2, Y0 - (res.row + (Math.random() < .5 ? 0 : 1)) * RH] : (function () { var r = boxRect(res.box); return [r.x + r.w / 2, r.y + r.h / 2]; })());
        gitti.to = tgt;
        c.later(function () {
          DG.sfx('thud', .4);
          if (res.box === k) { DG.sfx('ting'); say(X.inBox); c.later(startHop, 700); }
          else { DG.buzz(60); say(res.out ? X.out : (res.line ? X.line : X.wrong(res.box))); c.later(switchTurn, 1500); }
        }, 450);
        buttons();
      }
      function aiThrow() {
        if (phase !== 'throw') return;
        var k = level[who], r = rowOf(k), want = (r + 0.5) / (ROWS.length * 1.08), err = (Math.random() - .5) * 0.19;
        meter = K.clamp(want + err, 0, 1); var side = ROWS[r].length > 1 ? (Math.random() < .88 ? ROWS[r].indexOf(k) : 1 - ROWS[r].indexOf(k)) : 0;
        doThrow(side);
      }
      function startHop() {
        phase = 'hop'; var k = level[who], gr = rowOf(k);
        path = ROWS.map(function (rw, i) { return { row: i, need: (i === gr || rw.length === 1) ? 1 : 2, skip: rw.length === 1 && i === gr }; }).filter(function (p) { return !p.skip; });
        step = 0; beat = Math.max(0.6, 1.05 - (k - 1) * 0.05); beatT = beat; buttons(); render();
        if (!human()) aiHop();
      }
      function hop(feet) {
        if (phase !== 'hop') return; var p = path[step];
        if (feet !== p.need) { DG.sfx('buzz'); DG.buzz(70); return fall(X.badFoot); }
        DG.sfx('hop'); kid.row = p.row; kid.side = p.need === 2 ? .5 : (ROWS[p.row].length > 1 ? (ROWS[p.row].indexOf(level[who]) === 0 ? 1 : 0) : .5);
        step++; beatT = beat;
        if (step >= path.length) { phase = 'won'; DG.sfx('mill'); say(X.done(level[who])); level[who]++; buttons(); render();
          if (level[who] > 8) return c.later(function () { finish(who); }, 1200);
          return c.later(newTurn, 1400); }
      }
      function aiHop() {
        if (phase !== 'hop') return;
        c.later(function () { if (phase !== 'hop') return; var p = path[step]; hop(Math.random() < 0.06 ? 3 - p.need : p.need); if (phase === 'hop') aiHop(); }, beat * (0.45 + Math.random() * 0.4) * 1000);
      }
      function fall(m) { phase = 'fell'; say(m); buttons(); c.later(switchTurn, 1500); }
      function switchTurn() { who = 1 - who; msg = ''; newTurn(); }
      function finish(w) {
        phase = 'over'; c.stop();
        K.result(root, { mode: mode, winner: w, names: [name(0), name(1)], em: '🦶', sub: name(0) + ' ' + (level[0] - 1) + '/8 · ' + name(1) + ' ' + (level[1] - 1) + '/8',
          again: function () { root.innerHTML = ''; [chip, stats, cvs.cv, row, hint].forEach(function (e) { root.appendChild(e); }); msg = ''; start(); }, onExit: opts.onExit });
      }

      function loop(dt) {
        if (msgT > 0) { msgT -= dt; if (msgT <= 0) { msg = ''; render(); } }
        if (phase === 'throw') { meter += mdir * dt * 0.75; if (meter > 1) { meter = 1; mdir = -1; } if (meter < 0) { meter = 0; mdir = 1; } }
        if (gitti && gitti.t < 1) gitti.t = Math.min(1, gitti.t + dt / 0.45);
        if (phase === 'hop') { beatT -= dt; if (beatT <= 0) { DG.sfx('buzz'); fall(X.late); } }
        draw(); return true;
      }
      function draw() {
        var g = cvs.begin();
        g.fillStyle = '#9a7650'; g.fillRect(0, 0, W, H);
        for (var i = 0; i < 40; i++) { g.fillStyle = 'rgba(60,35,15,.12)'; g.beginPath(); g.arc((i * 71) % W, (i * 113) % H, 2 + i % 3, 0, 7); g.fill(); }
        g.strokeStyle = 'rgba(255,252,240,.9)'; g.lineWidth = 3; g.font = '800 22px "Baloo 2", system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle';
        for (var b = 1; b <= 8; b++) {
          var r = boxRect(b), cur = b === level[who];
          if (cur) { g.fillStyle = 'rgba(255,211,107,.28)'; g.fillRect(r.x, r.y, r.w, r.h); }
          if (phase === 'hop' && kid.row >= 0 && rowOf(b) === kid.row) { g.fillStyle = 'rgba(46,204,113,.25)'; g.fillRect(r.x, r.y, r.w, r.h); }
          g.strokeRect(r.x, r.y, r.w, r.h); g.fillStyle = 'rgba(255,252,240,.85)'; g.fillText(b, r.x + r.w / 2, r.y + r.h / 2);
        }
        // semicircle "aasmaan" on top
        g.beginPath(); g.arc(W / 2, Y0 - 6 * RH, BW / 2, Math.PI, 0); g.stroke();
        // power bar on the left
        if (phase === 'throw') {
          g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(16, Y0 - 6 * RH, 16, 6 * RH);
          var my = Y0 - meter * 6 * 1.08 * RH; g.fillStyle = '#ffd36b'; g.fillRect(12, my - 3, 24, 6);
          var tr = rowOf(level[who]), ty = Y0 - (tr + 0.5) * RH; g.fillStyle = 'rgba(46,204,113,.85)'; g.beginPath(); g.moveTo(40, ty); g.lineTo(48, ty - 6); g.lineTo(48, ty + 6); g.fill();
        }
        // gitti
        if (gitti) { var t = gitti.t, gx = gitti.from[0] + (gitti.to[0] - gitti.from[0]) * t, gy = gitti.from[1] + (gitti.to[1] - gitti.from[1]) * t - Math.sin(t * Math.PI) * 50;
          g.fillStyle = '#5a5248'; g.beginPath(); g.ellipse(gx, gy, 9, 6, .3, 0, 7); g.fill(); g.strokeStyle = '#2b251f'; g.lineWidth = 1.5; g.stroke(); }
        // the kid (feet)
        var ky = kid.row < 0 ? H - 20 : Y0 - (kid.row + 0.5) * RH, kx = X0 + BW * kid.side;
        g.font = '26px sans-serif'; g.fillText(phase === 'hop' && path && path[Math.min(step, path.length - 1)] && kid.row >= 0 ? (kid.side === .5 && ROWS[kid.row].length > 1 ? '👣' : '🦶') : '🧒', kx, ky);
      }

      cvs.size(); start();
      return { destroy: function () { c.kill(); cvs.off(); wrap.innerHTML = ''; }, _state: function () { return { level: level, who: who, phase: phase, path: path, step: step, meter: meter }; }, _throw: function (m, s) { meter = m; doThrow(s); }, _hop: hop };
    }
  });
})();

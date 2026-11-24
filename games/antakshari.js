/* Antakshari (अंताक्षरी). No song lyrics are stored: players sing from memory, the app keeps the game.
   pass: two teams on one phone. A team gets a letter and has N seconds to sing a song that starts with it;
         the other team taps ✓ (sang it) or ✗. After ✓ the singers tap the last letter of their song,
         and that letter goes to the other team. ✗ or time up: the other team gets the same letter.
         First to the target wins.
   ai (akele): practice — random letters, 15 s each, 3 lives, best streak is saved. */
(function () {
  var K = DG.kit;
  K.css('ak-style',
    '.ak-letter{font-family:var(--font-d);font-weight:800;font-size:5.4rem;line-height:1;width:150px;height:150px;border-radius:50%;display:grid;place-items:center;position:relative;background:radial-gradient(circle at 35% 30%,#2b3470,#141a40);box-shadow:0 0 0 3px #d9a441,var(--shadow);color:#ffd36b;}' +
    '.ak-letter small{position:absolute;bottom:18px;font-size:.9rem;color:var(--ink-soft);}' +
    '.ak-ring{position:absolute;inset:-9px;width:168px;height:168px;transform:rotate(-90deg);} .ak-ring circle{fill:none;stroke-width:6;} .ak-ring .bg{stroke:rgba(255,255,255,.08);} .ak-ring .fg{stroke:#2ecc71;stroke-linecap:round;transition:stroke-dashoffset .25s linear,stroke .3s;}' +
    '.ak-time{font-family:var(--font-d);font-weight:800;font-size:1.3rem;} .ak-time.low{color:#ff5e6e;}' +
    '.ak-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;width:min(94vw,380px);}' +
    '.ak-grid button{border:0;cursor:pointer;font-family:var(--font-d);font-weight:800;font-size:1.25rem;padding:9px 0;border-radius:12px;background:var(--panel);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);}' +
    '.ak-grid button small{display:block;font-size:.6rem;color:var(--ink-soft);font-weight:600;}' +
    '.ak-grid button:active{background:#f5a524;color:#2a1803;}' +
    '.ak-teams{display:flex;gap:10px;} .ak-team{padding:8px 14px;border-radius:14px;background:var(--panel);border:1px solid var(--line);font-family:var(--font-d);font-weight:700;text-align:center;min-width:110px;} .ak-team b{display:block;font-size:1.4rem;} .ak-team.on{box-shadow:0 0 0 2px #f5a524;}' +
    '.ak-names{display:flex;gap:8px;} .ak-names input{width:140px;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--panel);color:var(--ink);font:600 1rem var(--font-b,inherit);}' +
    '.ak-seg{display:flex;gap:6px;} .ak-seg button{border:0;cursor:pointer;padding:8px 14px;border-radius:999px;background:var(--panel);color:var(--ink);font-family:var(--font-d);font-weight:700;box-shadow:inset 0 0 0 1px var(--line);} .ak-seg button.on{background:#f5a524;color:#2a1803;}');

  // [letter, roman hint]
  var HI = [['अ','a'],['आ','aa'],['इ','i'],['उ','u'],['ए','e'],['ओ','o'],['क','ka'],['ख','kha'],['ग','ga'],['घ','gha'],['च','cha'],['छ','chha'],['ज','ja'],['झ','jha'],['ट','ta'],['ठ','tha'],['ड','da'],['त','ta'],['थ','tha'],['द','da'],['ध','dha'],['न','na'],['प','pa'],['फ','pha'],['ब','ba'],['भ','bha'],['म','ma'],['य','ya'],['र','ra'],['ल','la'],['व','va'],['श','sha'],['स','sa'],['ह','ha']];
  var BN = [['অ','o'],['আ','a'],['ই','i'],['উ','u'],['এ','e'],['ও','o'],['ক','ko'],['খ','kho'],['গ','go'],['ঘ','gho'],['চ','cho'],['ছ','chho'],['জ','jo'],['ঝ','jho'],['ট','to'],['ড','do'],['ত','to'],['থ','tho'],['দ','do'],['ধ','dho'],['ন','no'],['প','po'],['ফ','pho'],['ব','bo'],['ভ','bho'],['ম','mo'],['য','jo'],['র','ro'],['ল','lo'],['শ','sho'],['স','so'],['হ','ho']];
  var EN = 'ABCDEFGHIJKLMNOPRSTUVWY'.split('').map(function (c) { return [c, '']; });
  // start letters that have plenty of songs, so the first turn is fair
  var START = { hi: ['म','क','त','द','ज','ह','प','ब','स','च'], bn: ['আ','ম','ক','ত','এ','ভ','স','চ'], en: ['S','L','M','T','B','D','W','I','C','H'] };

  var CL = {
    hi: { title: 'अंताक्षरी', intro: 'दो टीम, एक फ़ोन। अक्षर मिलेगा — उसी से शुरू होने वाला गाना गाओ। दूसरी टीम बताएगी ✓ या ✗। गाने का आख़िरी अक्षर अगली टीम का अक्षर बनेगा।',
      teams: 'टीम के नाम', tA: 'टीम A', tB: 'टीम B', target: 'कितने पॉइंट तक?', secs: 'हर बारी का समय', go: '🎤 शुरू करो',
      turn: function (n) { return '🎤 ' + n + ' की बारी'; }, sing: 'इस अक्षर से गाना गाओ!', judge: 'दूसरी टीम बताए:', yes: '✓ गा दिया', no: '✗ नहीं आया',
      last: 'गाने का आख़िरी अक्षर कौन-सा था? चुनो 👇', timeUp: '⏰ समय ख़त्म!', pass: function (n) { return 'अब ' + n + ' को यही अक्षर मिला'; }, pts: 'पॉइंट',
      soloIntro: 'अकेले अभ्यास: हर अक्षर पर 15 सेकंड में गाना गाओ और ख़ुद ईमानदारी से ✓/✗ दबाओ। 3 जान।', soloGo: '🎤 अभ्यास शुरू', streak: 'लगातार', lives: 'जान', best: 'सबसे अच्छा',
      soloEnd: function (n, b) { return n + ' गाने! (सबसे अच्छा: ' + b + ')'; }, newBest: '🎉 नया रिकॉर्ड!' },
    en: { title: 'Antakshari', intro: 'Two teams, one phone. You get a letter — sing a song that starts with it. The other team judges ✓ or ✗. The last letter of your song becomes the next team’s letter.',
      teams: 'Team names', tA: 'Team A', tB: 'Team B', target: 'Play up to', secs: 'Time per turn', go: '🎤 Start',
      turn: function (n) { return '🎤 ' + n + "'s turn"; }, sing: 'Sing a song starting with this letter!', judge: 'Other team decides:', yes: '✓ Sang it', no: '✗ Couldn’t',
      last: 'What was the last letter of the song? Pick 👇', timeUp: '⏰ Time up!', pass: function (n) { return n + ' gets the same letter now'; }, pts: 'points',
      soloIntro: 'Solo practice: 15 seconds per letter, sing and honestly tap ✓/✗. 3 lives.', soloGo: '🎤 Start practice', streak: 'Streak', lives: 'Lives', best: 'Best',
      soloEnd: function (n, b) { return n + ' songs! (Best: ' + b + ')'; }, newBest: '🎉 New record!' },
    hinglish: { title: 'Antakshari', intro: 'Do team, ek phone. Akshar milega — usi se shuru hone wala gaana gao. Doosri team batayegi ✓ ya ✗. Gaane ka aakhri akshar agli team ka akshar banega.',
      teams: 'Team ke naam', tA: 'Team A', tB: 'Team B', target: 'Kitne point tak?', secs: 'Har baari ka time', go: '🎤 Shuru karo',
      turn: function (n) { return '🎤 ' + n + ' ki baari'; }, sing: 'Is akshar se gaana gao!', judge: 'Doosri team bataye:', yes: '✓ Ga diya', no: '✗ Nahi aaya',
      last: 'Gaane ka aakhri akshar kaunsa tha? Chuno 👇', timeUp: '⏰ Time khatam!', pass: function (n) { return 'Ab ' + n + ' ko yahi akshar mila'; }, pts: 'point',
      soloIntro: 'Akele practice: har akshar par 15 second mein gaana gao aur khud imaandari se ✓/✗ dabao. 3 jaan.', soloGo: '🎤 Practice shuru', streak: 'Lagaatar', lives: 'Jaan', best: 'Best',
      soloEnd: function (n, b) { return n + ' gaane! (Best: ' + b + ')'; }, newBest: '🎉 Naya record!' },
    bn: { title: 'অন্তাক্ষরী', intro: 'দুই দল, এক ফোন। একটা অক্ষর পাবে — সেই অক্ষর দিয়ে শুরু গান গাও। অন্য দল বলবে ✓ না ✗। গানের শেষ অক্ষর হবে পরের দলের অক্ষর।',
      teams: 'দলের নাম', tA: 'দল A', tB: 'দল B', target: 'কত পয়েন্ট পর্যন্ত?', secs: 'প্রতি পালার সময়', go: '🎤 শুরু করো',
      turn: function (n) { return '🎤 ' + n + '-এর পালা'; }, sing: 'এই অক্ষর দিয়ে গান গাও!', judge: 'অন্য দল বলবে:', yes: '✓ গেয়েছে', no: '✗ পারেনি',
      last: 'গানের শেষ অক্ষর কোনটা ছিল? বেছে নাও 👇', timeUp: '⏰ সময় শেষ!', pass: function (n) { return 'এবার ' + n + ' একই অক্ষর পেল'; }, pts: 'পয়েন্ট',
      soloIntro: 'একা অনুশীলন: প্রতি অক্ষরে ১৫ সেকেন্ডে গান গাও, নিজেই সৎভাবে ✓/✗ টিপো। ৩টে জান।', soloGo: '🎤 অনুশীলন শুরু', streak: 'টানা', lives: 'জান', best: 'সেরা',
      soloEnd: function (n, b) { return n + 'টা গান! (সেরা: ' + b + ')'; }, newBest: '🎉 নতুন রেকর্ড!' }
  };
  var L = K.lang(CL);
  function letters() { return DG.lang === 'bn' ? BN : (DG.lang === 'en' ? EN : HI); }
  function starts() { return START[DG.lang === 'bn' ? 'bn' : (DG.lang === 'en' ? 'en' : 'hi')]; }
  function hintOf(ch) { if (DG.lang !== 'hinglish') return ''; var x = letters().filter(function (p) { return p[0] === ch; })[0]; return x ? x[1] : ''; }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} return null; }

  DG.register('antakshari', {
    mount: function (wrap, opts) {
      var mode = opts.mode === 'ai' ? 'ai' : 'pass', c = K.clock();
      var root = K.el('div', 'dk', null, wrap);
      var names, score, turn, target, secs, letter, timer, left, lives, streak;

      function setup() {
        c.stop(); root.innerHTML = ''; var x = L();
        var box = K.el('div', 'dk-setup', null, root);
        K.el('h3', null, '🎤 ' + x.title, box);
        if (mode === 'ai') { K.el('p', 'dk-rules', null, box).textContent = x.soloIntro; K.el('p', 'dk-rules', x.best + ': <b>' + (store('dg-ak-best') || 0) + '</b>', box); K.btn(K.el('div', 'dk-row', null, box), x.soloGo, '', solo); return; }
        K.el('p', 'dk-rules', null, box).textContent = x.intro;
        K.el('b', null, x.teams, box);
        var nm = K.el('div', 'ak-names', null, box), saved = store('dg-ak-names') || [];
        var a = K.el('input', null, null, nm), b = K.el('input', null, null, nm);
        a.maxLength = b.maxLength = 14; a.placeholder = x.tA; b.placeholder = x.tB; a.value = saved[0] || ''; b.value = saved[1] || '';
        target = store('dg-ak-target') || 100; secs = store('dg-ak-secs') || 20;
        K.el('b', null, x.target, box); seg(box, [50, 100, 150], target, function (v) { target = v; store('dg-ak-target', v); });
        K.el('b', null, x.secs, box); seg(box, [15, 20, 30], secs, function (v) { secs = v; store('dg-ak-secs', v); }, 's');
        K.btn(K.el('div', 'dk-row', null, box), x.go, '', function () {
          names = [a.value.trim() || x.tA, b.value.trim() || x.tB]; store('dg-ak-names', [a.value.trim(), b.value.trim()]);
          score = [0, 0]; turn = 0; letter = K.pick(starts()); DG.sfx('whistle'); sing();
        });
      }
      function seg(parent, vals, cur, fn, suf) {
        var s = K.el('div', 'ak-seg', null, parent);
        vals.forEach(function (v) { var b = K.el('button', v === cur ? 'on' : '', v + (suf || ''), s); b.type = 'button';
          b.onclick = function () { s.querySelectorAll('button').forEach(function (o) { o.className = ''; }); b.className = 'on'; fn(v); }; });
      }

      function letterEl(parent) {
        var w = K.el('div', 'ak-letter', null, parent);
        w.innerHTML = '<svg class="ak-ring" viewBox="0 0 168 168"><circle class="bg" cx="84" cy="84" r="78"/><circle class="fg" cx="84" cy="84" r="78" stroke-dasharray="490" stroke-dashoffset="0"/></svg>' +
          '<span>' + K.esc(letter) + '</span>' + (hintOf(letter) ? '<small>' + hintOf(letter) + '</small>' : '');
        return w.querySelector('.fg');
      }
      function countdown(total, ring, tEl, onEnd) {
        left = total; tEl.textContent = left + 's';
        (function tickOnce() {
          timer = c.later(function () {
            left--; tEl.textContent = Math.max(0, left) + 's'; tEl.classList.toggle('low', left <= 5);
            ring.style.strokeDashoffset = String(490 * (1 - left / total)); ring.style.stroke = left <= 5 ? '#ff5e6e' : (left <= total / 2 ? '#f5a524' : '#2ecc71');
            if (left <= 0) { DG.sfx('buzz'); DG.buzz(120); return onEnd(); }
            DG.sfx('tick', left <= 5 ? 1 : 0); tickOnce();
          }, 1000);
        })();
      }
      function teamsBar() {
        var bar = K.el('div', 'ak-teams', null, root);
        [0, 1].forEach(function (i) { K.el('div', 'ak-team' + (i === turn ? ' on' : ''), K.esc(names[i]) + '<b>' + score[i] + '</b>', bar); });
      }

      /* ----- team game ----- */
      function sing(note) {
        c.stop(); root.innerHTML = ''; var x = L();
        teamsBar();
        K.el('div', 'dk-chip', null, root).textContent = x.turn(names[turn]);
        if (note) K.el('div', 'dk-hint', null, root).textContent = note;
        var ring = letterEl(root);
        var tEl = K.el('div', 'ak-time', null, root);
        K.el('div', 'dk-hint', null, root).textContent = x.sing + '\n' + x.judge;
        var row = K.el('div', 'dk-row', null, root);
        K.btn(row, x.yes, 'ok', function () { c.stop(); DG.sfx('ting'); score[turn] += 10; if (score[turn] >= target) return finish(); chooseLast(); });
        K.btn(row, x.no, 'no', function () { c.stop(); DG.sfx('buzz'); miss(); });
        countdown(secs, ring, tEl, function () { miss(L().timeUp + ' '); });
      }
      function miss(pre) { turn = 1 - turn; sing((pre || '') + L().pass(names[turn])); }
      function chooseLast() {
        root.innerHTML = ''; var x = L();
        teamsBar();
        K.el('div', 'dk-chip', null, root).textContent = '✓ +10 · ' + names[turn];
        K.el('div', 'dk-hint', null, root).textContent = x.last;
        var grid = K.el('div', 'ak-grid', null, root);
        letters().forEach(function (p) {
          var b = K.el('button', null, K.esc(p[0]) + (DG.lang === 'hinglish' ? '<small>' + p[1] + '</small>' : ''), grid); b.type = 'button';
          b.onclick = function () { DG.sfx('place'); letter = p[0]; turn = 1 - turn; sing(); };
        });
      }
      function finish() {
        c.stop();
        K.result(root, { mode: 'pass', winner: score[0] === score[1] ? -1 : (score[0] > score[1] ? 0 : 1), names: names, em: '🎤',
          sub: names[0] + ' ' + score[0] + ' – ' + score[1] + ' ' + names[1], again: function () { score = [0, 0]; turn = 0; letter = K.pick(starts()); sing(); },
          extra: [[L().teams, setup]], onExit: opts.onExit });
      }

      /* ----- solo practice ----- */
      function solo() { lives = 3; streak = 0; DG.sfx('whistle'); soloTurn(); }
      function soloTurn() {
        c.stop(); root.innerHTML = ''; var x = L();
        var pool = letters().filter(function (p) { return p[0] !== letter; }); letter = K.pick(streak < 3 ? starts() : pool.map(function (p) { return p[0]; }));
        var hearts = ''; for (var i = 0; i < 3; i++) hearts += i < lives ? '❤️' : '🤍';
        K.el('div', 'dk-stats', '<span>' + x.streak + ': <b>' + streak + '</b></span><span>' + hearts + '</span><span>' + x.best + ': <b>' + (store('dg-ak-best') || 0) + '</b></span>', root);
        var ring = letterEl(root), tEl = K.el('div', 'ak-time', null, root);
        K.el('div', 'dk-hint', null, root).textContent = x.sing;
        var row = K.el('div', 'dk-row', null, root);
        K.btn(row, x.yes, 'ok', function () { c.stop(); DG.sfx('ting'); streak++; soloTurn(); });
        K.btn(row, x.no, 'no', function () { c.stop(); DG.sfx('buzz'); loseLife(); });
        countdown(15, ring, tEl, loseLife);
      }
      function loseLife() {
        lives--; if (lives > 0) return soloTurn();
        var best = store('dg-ak-best') || 0, rec = streak > best; if (rec) store('dg-ak-best', streak);
        K.result(root, { mode: 'ai', winner: rec ? 0 : -1, em: '🎤', txt: rec ? L().newBest : L().soloEnd(streak, best), sub: rec ? L().soloEnd(streak, streak) : '',
          again: solo, onExit: opts.onExit });
      }

      setup();
      return { destroy: function () { c.kill(); wrap.innerHTML = ''; } };
    }
  });
})();

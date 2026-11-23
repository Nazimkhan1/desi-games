/* Raja-Mantri-Chor-Sipahi (चोर-सिपाही): the chit game for 4.
   Each round 4 chits are dealt: Raja 1000, Mantri 800, Sipahi 500, Chor 0.
   Raja shows up, calls the Mantri, Mantri must pick the Chor from the other two.
   Right → everyone keeps their chit points. Wrong → the Mantri's 800 go to the Chor.
   Modes: 'pass' (4 friends pass one phone, each peeks secretly) and 'ai' (you + 3 computer players).
   In 'ai' mode the two suspects show faces: the Chor looks nervous more often (a tell to read). */
(function () {
  if (!document.getElementById('cs-style')) {
    var st = document.createElement('style'); st.id = 'cs-style';
    st.textContent =
      '.cs{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;padding-bottom:18px;}' +
      '.cs h3{font-family:var(--font-d);font-weight:800;font-size:1.3rem;margin:4px 0 0;}' +
      '.cs-sub{color:var(--ink-soft);font-size:.92rem;margin:0;max-width:340px;line-height:1.45;}' +
      '.cs-chip{font-family:var(--font-d);font-weight:800;font-size:.95rem;padding:7px 15px;border-radius:999px;background:var(--panel);border:1px solid var(--line);}' +
      '.cs-btn{border:0;cursor:pointer;font-family:var(--font-d);font-weight:800;font-size:1rem;padding:13px 22px;border-radius:14px;color:#2a1803;background:linear-gradient(135deg,var(--marigold,#f5a524),var(--marigold2,#ffd36b));box-shadow:var(--shadow);}' +
      '.cs-btn.ghost{background:var(--panel);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);}' +
      '.cs-acts{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;}' +
      '.cs-seg{display:flex;gap:8px;} .cs-seg button{border:1px solid var(--line);background:var(--panel);color:var(--ink);font-family:var(--font-d);font-weight:800;padding:10px 18px;border-radius:12px;cursor:pointer;}' +
      '.cs-seg button.on{background:var(--marigold,#f5a524);color:#2a1803;border-color:transparent;}' +
      '.cs-names{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:min(92vw,340px);}' +
      '.cs-names input{width:100%;box-sizing:border-box;padding:11px 12px;border-radius:12px;border:1px solid var(--line);background:var(--panel);color:var(--ink);font:inherit;font-weight:600;}' +
      '.cs-names.one{grid-template-columns:1fr;}' +
      '.cs-table{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;width:min(92vw,340px);}' +
      '.cs-seat{display:flex;flex-direction:column;align-items:center;gap:6px;}' +
      '.cs-seat .nm{font-family:var(--font-d);font-weight:800;font-size:.9rem;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
      '.cs-seat .face{font-size:1.9rem;line-height:1;height:2rem;}' +
      '.cs-chit{width:118px;height:84px;perspective:600px;border:0;background:none;padding:0;cursor:default;}' +
      '.cs-chit .in{position:relative;width:100%;height:100%;transition:transform .55s;transform-style:preserve-3d;}' +
      '.cs-chit.open .in{transform:rotateY(180deg);}' +
      '.cs-chit .f,.cs-chit .b{position:absolute;inset:0;border-radius:10px;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;}' +
      '.cs-chit .f{background:repeating-linear-gradient(0deg,#f3ead2 0 11px,#e6d8b4 11px 12px);box-shadow:0 3px 10px rgba(0,0,0,.3);color:#6b5223;font-size:1.6rem;}' +
      '.cs-chit .f:after{content:"";position:absolute;left:50%;top:6px;bottom:6px;border-left:1.5px dashed rgba(107,82,35,.35);}' +
      '.cs-chit .b{transform:rotateY(180deg);background:#fffaf0;color:#3b2a10;box-shadow:0 3px 10px rgba(0,0,0,.3);border:2px solid #d9b45a;}' +
      '.cs-chit .b .ic{font-size:1.7rem;line-height:1;} .cs-chit .b .rl{font-family:var(--font-d);font-weight:800;font-size:.95rem;} .cs-chit .b .pt{font-size:.75rem;font-weight:700;opacity:.7;}' +
      '.cs-chit.tap{cursor:pointer;} .cs-chit.tap .f{outline:2px dashed var(--marigold,#f5a524);outline-offset:3px;animation:cswig 1.6s ease-in-out infinite;}' +
      '.cs-chit.pick .f{outline:3px solid var(--marigold,#f5a524);outline-offset:3px;}' +
      '@keyframes cswig{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}' +
      '.cs-big .cs-chit{width:170px;height:120px;} .cs-big .cs-chit .b .ic{font-size:2.6rem;} .cs-big .cs-chit .b .rl{font-size:1.25rem;}' +
      '.cs-say{font-family:var(--font-d);font-weight:700;font-size:1rem;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:8px 14px;max-width:330px;}' +
      '.cs-res{font-family:var(--font-d);font-weight:800;font-size:1.35rem;}' +
      '.cs-score{width:min(92vw,340px);border-collapse:collapse;font-size:.92rem;}' +
      '.cs-score th,.cs-score td{padding:7px 6px;border-bottom:1px solid var(--line);text-align:left;} .cs-score th{color:var(--ink-soft);font-weight:700;font-size:.8rem;}' +
      '.cs-score td.n{text-align:right;font-variant-numeric:tabular-nums;font-weight:800;} .cs-score tr.top td{color:var(--marigold,#f5a524);}' +
      '.cs-pts{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;font-size:.8rem;color:var(--ink-soft);}' +
      '.cs-pts span{background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:4px 9px;}' +
      '.cs-cover{font-size:3.4rem;line-height:1;}';
    document.head.appendChild(st);
  }

  var IC = ['👑', '📜', '🛡️', '🦹'], PTS = [1000, 800, 500, 0];
  var RAJA = 0, MANTRI = 1, SIPAHI = 2, CHOR = 3;
  var CALM = ['😐', '🙂', '😌', '🥱', '😶'], NERV = ['😅', '😬', '🫣', '😏', '🤭'];

  var CL = {
    hinglish: {
      roles: ['Raja', 'Mantri', 'Sipahi', 'Chor'], cpu: ['Bablu', 'Pinky', 'Golu'],
      howMany: 'Kitne round?', rounds: function (n) { return n + ' round'; },
      names: 'Chaaron ke naam likho', yourName: 'Aapka naam', ph: function (i) { return 'Khiladi ' + i; },
      intro: 'Chaar chitthiyan: Raja, Mantri, Sipahi, Chor. Mantri ko Chor pakadna hai!',
      deal: '▶ Chitthi daalo', round: function (n, of) { return 'Round ' + n + ' / ' + of; },
      pick: 'Ek chitthi uthao 👇', passTo: function (n) { return '📱 Phone ' + n + ' ko do'; },
      eyes: 'Baaki sab aankh band karo 🙈', see: '👀 Meri chitthi dekho', onlyYou: function (n) { return n + ', sirf aap dekho:'; },
      note: ['Raja ho! 1000 pakke 😎', 'Mantri ho! Chor aapko pakadna hai 🕵️', 'Sipahi ho! Chup-chaap raho 🤐', 'Chor ho! 🤫 Chehra seedha rakho'],
      hideNext: function (n) { return '🙈 Chhupao — ' + n + ' ki baari'; }, court: '👑 Darbar lagao',
      rajaSays: function (n) { return '👑 ' + n + ': "Main Raja hoon! Mera Mantri kaun hai?"'; },
      mantriSays: function (n) { return '📜 ' + n + ': "Hazir hoon, Maharaj!"'; },
      order: function (n) { return '👑 "' + n + ', Chor ka pata lagao!"'; },
      youPick: 'Aap Mantri ho! Chehre padho — Chor kaun? 👇', mPick: function (n) { return n + ', Chor ke naam par tap karo 👇'; },
      thinking: function (n) { return n + ' soch rahe hain… 🤔'; },
      caught: function (n) { return '🎉 Pakda gaya! ' + n + ' hi Chor tha'; }, escaped: function (n) { return '🏃 Galat! Chor ' + n + ' bach gaya'; },
      swap: 'Mantri ke 800 points Chor ko mil gaye!',
      player: 'Khiladi', thisR: 'Is round', total: 'Kul', next: '▶ Agla round', final: '🏆 Natija dekho',
      winner: function (n) { return '🏆 ' + n + ' jeete!'; }, tie: '🤝 Barabar!', setup: '⚙️ Naye khiladi',
      tip: 'Tip: Chor ka chehra aksar ghabraya hota hai 😅'
    },
    hi: {
      roles: ['राजा', 'मंत्री', 'सिपाही', 'चोर'], cpu: ['बबलू', 'पिंकी', 'गोलू'],
      howMany: 'कितने राउंड?', rounds: function (n) { return n + ' राउंड'; },
      names: 'चारों के नाम लिखो', yourName: 'आपका नाम', ph: function (i) { return 'खिलाड़ी ' + i; },
      intro: 'चार चिट्ठियाँ: राजा, मंत्री, सिपाही, चोर। मंत्री को चोर पकड़ना है!',
      deal: '▶ चिट्ठी डालो', round: function (n, of) { return 'राउंड ' + n + ' / ' + of; },
      pick: 'एक चिट्ठी उठाओ 👇', passTo: function (n) { return '📱 फ़ोन ' + n + ' को दो'; },
      eyes: 'बाक़ी सब आँख बंद करो 🙈', see: '👀 मेरी चिट्ठी देखो', onlyYou: function (n) { return n + ', सिर्फ़ आप देखो:'; },
      note: ['राजा हो! 1000 पक्के 😎', 'मंत्री हो! चोर आपको पकड़ना है 🕵️', 'सिपाही हो! चुपचाप रहो 🤐', 'चोर हो! 🤫 चेहरा सीधा रखो'],
      hideNext: function (n) { return '🙈 छुपाओ — ' + n + ' की बारी'; }, court: '👑 दरबार लगाओ',
      rajaSays: function (n) { return '👑 ' + n + ': "मैं राजा हूँ! मेरा मंत्री कौन है?"'; },
      mantriSays: function (n) { return '📜 ' + n + ': "हाज़िर हूँ, महाराज!"'; },
      order: function (n) { return '👑 "' + n + ', चोर का पता लगाओ!"'; },
      youPick: 'आप मंत्री हो! चेहरे पढ़ो — चोर कौन? 👇', mPick: function (n) { return n + ', चोर के नाम पर टैप करो 👇'; },
      thinking: function (n) { return n + ' सोच रहे हैं… 🤔'; },
      caught: function (n) { return '🎉 पकड़ा गया! ' + n + ' ही चोर था'; }, escaped: function (n) { return '🏃 ग़लत! चोर ' + n + ' बच गया'; },
      swap: 'मंत्री के 800 पॉइंट चोर को मिल गए!',
      player: 'खिलाड़ी', thisR: 'इस राउंड', total: 'कुल', next: '▶ अगला राउंड', final: '🏆 नतीजा देखो',
      winner: function (n) { return '🏆 ' + n + ' जीते!'; }, tie: '🤝 बराबर!', setup: '⚙️ नए खिलाड़ी',
      tip: 'टिप: चोर का चेहरा अक्सर घबराया होता है 😅'
    },
    en: {
      roles: ['Raja', 'Mantri', 'Sipahi', 'Chor'], cpu: ['Bablu', 'Pinky', 'Golu'],
      howMany: 'How many rounds?', rounds: function (n) { return n + ' rounds'; },
      names: 'Type all four names', yourName: 'Your name', ph: function (i) { return 'Player ' + i; },
      intro: 'Four chits: King, Minister, Soldier, Thief. The Mantri must catch the Chor!',
      deal: '▶ Deal the chits', round: function (n, of) { return 'Round ' + n + ' / ' + of; },
      pick: 'Pick a chit 👇', passTo: function (n) { return '📱 Give the phone to ' + n; },
      eyes: 'Everyone else, close your eyes 🙈', see: '👀 Show my chit', onlyYou: function (n) { return n + ', only you look:'; },
      note: ['You are the Raja! 1000 is yours 😎', 'You are the Mantri! Catch the Chor 🕵️', 'You are the Sipahi! Stay quiet 🤐', 'You are the Chor! 🤫 Keep a straight face'],
      hideNext: function (n) { return '🙈 Hide it — ' + n + "'s turn"; }, court: '👑 Call the court',
      rajaSays: function (n) { return '👑 ' + n + ': "I am the Raja! Who is my Mantri?"'; },
      mantriSays: function (n) { return '📜 ' + n + ': "At your service, Maharaj!"'; },
      order: function (n) { return '👑 "' + n + ', find the Chor!"'; },
      youPick: 'You are the Mantri! Read their faces — who is the Chor? 👇', mPick: function (n) { return n + ', tap the Chor\'s name 👇'; },
      thinking: function (n) { return n + ' is thinking… 🤔'; },
      caught: function (n) { return '🎉 Caught! ' + n + ' was the Chor'; }, escaped: function (n) { return '🏃 Wrong! Chor ' + n + ' got away'; },
      swap: "The Mantri's 800 points go to the Chor!",
      player: 'Player', thisR: 'This round', total: 'Total', next: '▶ Next round', final: '🏆 See the result',
      winner: function (n) { return '🏆 ' + n + ' wins!'; }, tie: "🤝 It's a tie!", setup: '⚙️ New players',
      tip: 'Tip: the Chor often looks nervous 😅'
    },
    bn: {
      roles: ['রাজা', 'মন্ত্রী', 'সিপাই', 'চোর'], cpu: ['বাবলু', 'পিঙ্কি', 'গোলু'],
      howMany: 'কত রাউন্ড?', rounds: function (n) { return n + ' রাউন্ড'; },
      names: 'চারজনের নাম লেখো', yourName: 'তোমার নাম', ph: function (i) { return 'খেলোয়াড় ' + i; },
      intro: 'চারটে চিরকুট: রাজা, মন্ত্রী, সিপাই, চোর। মন্ত্রীকে চোর ধরতে হবে!',
      deal: '▶ চিরকুট বাঁটো', round: function (n, of) { return 'রাউন্ড ' + n + ' / ' + of; },
      pick: 'একটা চিরকুট তোলো 👇', passTo: function (n) { return '📱 ফোনটা ' + n + '-কে দাও'; },
      eyes: 'বাকিরা চোখ বন্ধ করো 🙈', see: '👀 আমার চিরকুট দেখাও', onlyYou: function (n) { return n + ', শুধু তুমি দেখো:'; },
      note: ['তুমি রাজা! 1000 পাকা 😎', 'তুমি মন্ত্রী! চোর ধরো 🕵️', 'তুমি সিপাই! চুপ করে থাকো 🤐', 'তুমি চোর! 🤫 মুখ সোজা রাখো'],
      hideNext: function (n) { return '🙈 লুকোও — এবার ' + n; }, court: '👑 দরবার বসাও',
      rajaSays: function (n) { return '👑 ' + n + ': "আমি রাজা! আমার মন্ত্রী কে?"'; },
      mantriSays: function (n) { return '📜 ' + n + ': "হাজির, মহারাজ!"'; },
      order: function (n) { return '👑 "' + n + ', চোর খুঁজে বার করো!"'; },
      youPick: 'তুমি মন্ত্রী! মুখ দেখো — চোর কে? 👇', mPick: function (n) { return n + ', চোরের নামে ট্যাপ করো 👇'; },
      thinking: function (n) { return n + ' ভাবছে… 🤔'; },
      caught: function (n) { return '🎉 ধরা পড়েছে! ' + n + '-ই চোর'; }, escaped: function (n) { return '🏃 ভুল! চোর ' + n + ' পালিয়ে গেল'; },
      swap: 'মন্ত্রীর 800 পয়েন্ট চোর পেয়ে গেল!',
      player: 'খেলোয়াড়', thisR: 'এই রাউন্ড', total: 'মোট', next: '▶ পরের রাউন্ড', final: '🏆 ফল দেখো',
      winner: function (n) { return '🏆 ' + n + ' জিতেছে!'; }, tie: '🤝 সমান!', setup: '⚙️ নতুন খেলোয়াড়',
      tip: 'টিপ: চোরের মুখ প্রায়ই ঘাবড়ানো থাকে 😅'
    }
  };

  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  /* Points for one round: roles[i] = role of player i; guess = player index the Mantri picked. */
  function score(roles, guess) {
    var pts = roles.map(function (r) { return PTS[r]; });
    if (roles[guess] !== CHOR) { var m = roles.indexOf(MANTRI), c = roles.indexOf(CHOR); pts[c] = PTS[MANTRI]; pts[m] = 0; }
    return pts;
  }
  /* A face for a suspect: the Chor looks nervous 60% of the time, the Sipahi 25%. */
  function face(role) { var nerv = Math.random() < (role === CHOR ? 0.6 : 0.25); var p = nerv ? NERV : CALM; return p[Math.floor(Math.random() * p.length)]; }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }

  DG.chor = { score: score, PTS: PTS, face: face };

  DG.register('chor', {
    mount: function (wrap, opts) {
      var mode = opts.mode === 'ai' ? 'ai' : 'pass';
      var root = document.createElement('div'); root.className = 'cs'; wrap.appendChild(root);
      var timers = [], players = [], totals, roundNo, nRounds = store('dg-chor-rounds') || 5, roles, faces, last;
      function T() { return CL[DG.lang] || CL.en; }
      function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
      function clear() { timers.forEach(clearTimeout); timers = []; root.innerHTML = ''; try { window.scrollTo(0, 0); (wrap.closest('.game-root,#gameRoot') || wrap).scrollTop = 0; } catch (e) {} }
      function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; root.appendChild(e); return e; }
      function btn(parent, txt, cls, fn) { var b = document.createElement('button'); b.className = 'cs-btn' + (cls ? ' ' + cls : ''); b.textContent = txt; b.onclick = fn; parent.appendChild(b); return b; }
      function nm(i) { return players[i].name; }
      function chitHTML(role) {
        var x = T();
        return '<div class="in"><div class="f">✉️</div><div class="b">' + (role == null ? '' :
          '<span class="ic">' + IC[role] + '</span><span class="rl">' + esc(x.roles[role]) + '</span><span class="pt">' + PTS[role] + '</span>') + '</div></div>';
      }
      function chit(role, open) { var c = document.createElement('button'); c.type = 'button'; c.className = 'cs-chit' + (open ? ' open' : ''); c.innerHTML = chitHTML(role); return c; }
      function chip() { h('div', 'cs-chip', T().round(roundNo, nRounds)); }

      /* ----- setup ----- */
      function setup() {
        clear(); var x = T();
        h('h3', null, '👮 ' + esc(DG.gname({ n: { hi: 'राजा-मंत्री-चोर-सिपाही', en: 'Raja Mantri Chor Sipahi', hinglish: 'Raja-Mantri-Chor-Sipahi', bn: 'রাজা-মন্ত্রী-চোর-সিপাই' } })));
        h('p', 'cs-sub', esc(x.intro));
        h('div', 'cs-pts', [0, 1, 2, 3].map(function (r) { return '<span>' + IC[r] + ' ' + esc(x.roles[r]) + ' ' + PTS[r] + '</span>'; }).join(''));
        h('p', 'cs-sub', '<b>' + esc(x.howMany) + '</b>');
        var seg = h('div', 'cs-seg');
        [5, 10].forEach(function (n) {
          var b = document.createElement('button'); b.textContent = x.rounds(n); if (n === nRounds) b.className = 'on';
          b.onclick = function () { nRounds = n; store('dg-chor-rounds', n); seg.querySelectorAll('button').forEach(function (o) { o.className = ''; }); b.className = 'on'; };
          seg.appendChild(b);
        });
        h('p', 'cs-sub', '<b>' + esc(mode === 'ai' ? x.yourName : x.names) + '</b>');
        var box = h('div', 'cs-names' + (mode === 'ai' ? ' one' : ''));
        var saved = store('dg-chor-names') || [];
        var n = mode === 'ai' ? 1 : 4, ins = [];
        for (var i = 0; i < n; i++) {
          var inp = document.createElement('input'); inp.maxLength = 14; inp.placeholder = mode === 'ai' ? DG.t().you : x.ph(i + 1);
          inp.value = saved[i] || ''; box.appendChild(inp); ins.push(inp);
        }
        var acts = h('div', 'cs-acts');
        btn(acts, x.deal, '', function () {
          var typed = ins.map(function (e) { return e.value.trim(); });
          store('dg-chor-names', mode === 'ai' ? [typed[0]].concat(saved.slice(1)) : typed);
          if (mode === 'ai') players = [{ name: typed[0] || DG.t().you, cpu: false }].concat(x.cpu.map(function (c) { return { name: c, cpu: true }; }));
          else players = typed.map(function (v, k) { return { name: v || x.ph(k + 1), cpu: false }; });
          totals = [0, 0, 0, 0]; roundNo = 0; nextRound();
        });
        btn(acts, DG.t().exitGame, 'ghost', function () { opts.onExit && opts.onExit(); });
      }

      /* ----- deal ----- */
      function nextRound() {
        roundNo++; roles = shuffle([0, 1, 2, 3]); faces = roles.map(face);
        if (mode === 'ai') pickChit(); else passTo(0);
      }
      /* ai: four folded chits, you pick one; the rest go to the computer players. */
      function pickChit() {
        clear(); var x = T(); chip(); h('p', 'cs-say', esc(x.pick));
        var grid = h('div', 'cs-table'), pile = shuffle([0, 1, 2, 3]), done = false;
        pile.forEach(function (role) {
          var c = chit(role, false); c.classList.add('tap'); grid.appendChild(c);
          c.onclick = function () {
            if (done) return; done = true;
            // what you pick is your role; the other three chits go to the computer players at random
            var others = shuffle(pile.filter(function (r) { return r !== role; }));
            roles = [role].concat(others); faces = roles.map(face);
            grid.querySelectorAll('.cs-chit').forEach(function (o) { o.classList.remove('tap'); });
            c.classList.add('pick', 'open');
            later(showMine, 900);
          };
        });
      }
      function showMine() {
        clear(); var x = T(); chip();
        h('p', 'cs-sub', esc(x.onlyYou(nm(0))));
        var big = h('div', 'cs-big'); big.appendChild(chit(roles[0], true));
        h('div', 'cs-say', esc(x.note[roles[0]]));
        btn(h('div', 'cs-acts'), x.court, '', court);
      }
      /* pass: hand the phone round; each player peeks alone. */
      function passTo(i) {
        clear(); var x = T(); chip();
        h('div', 'cs-cover', '🙈');
        h('h3', null, esc(x.passTo(nm(i))));
        h('p', 'cs-sub', esc(x.eyes));
        btn(h('div', 'cs-acts'), x.see, '', function () { peek(i); });
      }
      function peek(i) {
        clear(); var x = T(); chip();
        h('p', 'cs-sub', esc(x.onlyYou(nm(i))));
        var big = h('div', 'cs-big'), c = chit(roles[i], false); big.appendChild(c);
        later(function () { c.classList.add('open'); }, 60);
        h('div', 'cs-say', esc(x.note[roles[i]]));
        btn(h('div', 'cs-acts'), i < 3 ? x.hideNext(nm(i + 1)) : x.court, '', function () { if (i < 3) passTo(i + 1); else court(); });
      }

      /* ----- court ----- */
      function court() {
        clear(); var x = T(); chip();
        var raja = roles.indexOf(RAJA), mantri = roles.indexOf(MANTRI);
        var two = [0, 1, 2, 3].filter(function (k) { return roles[k] === SIPAHI || roles[k] === CHOR; });
        var say = h('div', 'cs-say', esc(x.rajaSays(nm(raja))));
        var table = h('div', 'cs-table'), cards = [], seats = [];
        [raja, mantri].concat(two).forEach(function (k, idx) {
          var s = document.createElement('div'); s.className = 'cs-seat';
          var showFace = mode === 'ai' && idx >= 2 && players[k].cpu;
          s.innerHTML = '<div class="face">' + (idx >= 2 ? (showFace ? faces[k] : (players[k].cpu ? '' : '🙂')) : '') + '</div>';
          var c = chit(roles[k], false); s.appendChild(c);
          var n = document.createElement('div'); n.className = 'nm'; n.textContent = nm(k) + (mode === 'ai' && k === 0 && nm(0) !== DG.t().you ? ' (' + DG.t().you + ')' : ''); s.appendChild(n);
          table.appendChild(s); cards[k] = c; seats[k] = s;
        });
        var ask = h('p', 'cs-sub', '');
        later(function () { cards[raja].classList.add('open'); }, 250);
        later(function () { say.textContent = x.mantriSays(nm(mantri)); cards[mantri].classList.add('open'); }, 1300);
        later(function () {
          say.textContent = x.order(nm(mantri));
          var decided = false;
          function decide(k) {
            if (decided) return; decided = true; ask.remove();
            two.forEach(function (o) { cards[o].classList.remove('tap'); cards[o].onclick = null; });
            cards[k].classList.add('pick'); reveal(k, two, cards);
          }
          if (players[mantri].cpu) {
            ask.textContent = x.thinking(nm(mantri));
            // computer Mantri can't read a human face; between two computers it reads the faces a little
            var g = two[Math.floor(Math.random() * 2)];
            if (players[two[0]].cpu && players[two[1]].cpu) {
              var nv = two.filter(function (k) { return NERV.indexOf(faces[k]) >= 0; });
              if (nv.length === 1 && Math.random() < 0.7) g = nv[0];
            }
            later(function () { decide(g); }, 1500);
          } else {
            ask.textContent = mode === 'ai' ? x.youPick : x.mPick(nm(mantri));
            two.forEach(function (k) { cards[k].classList.add('tap'); cards[k].onclick = function () { decide(k); }; seats[k].querySelector('.nm').onclick = function () { decide(k); }; });
          }
        }, 2400);
      }
      function reveal(guess, two, cards) {
        var x = T(), chor = roles.indexOf(CHOR), ok = roles[guess] === CHOR;
        later(function () { two.forEach(function (k) { cards[k].classList.add('open'); }); }, 500);
        later(function () {
          var pts = score(roles, guess); last = pts;
          for (var k = 0; k < 4; k++) totals[k] += pts[k];
          var res = h('div', 'cs-res', esc(ok ? x.caught(nm(chor)) : x.escaped(nm(chor))));
          if (!ok) h('p', 'cs-sub', esc(x.swap));
          var acts = h('div', 'cs-acts');
          if (roundNo < nRounds) btn(acts, x.next, '', nextRound); else btn(acts, x.final, '', finish);
          table(pts);
          if (mode === 'ai' && roundNo === 1) h('p', 'cs-sub', esc(x.tip));
          try { res.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
        }, 1300);
      }
      function table(pts) {
        var x = T(), order = [0, 1, 2, 3].sort(function (a, b) { return totals[b] - totals[a]; });
        var s = '<thead><tr><th>' + esc(x.player) + '</th>' + (pts ? '<th>' + esc(x.thisR) + '</th>' : '') + '<th style="text-align:right">' + esc(x.total) + '</th></tr></thead><tbody>';
        order.forEach(function (k, idx) {
          s += '<tr' + (idx === 0 && totals[k] > 0 ? ' class="top"' : '') + '><td>' + esc(nm(k)) + '</td>' +
            (pts ? '<td>' + IC[roles[k]] + ' +' + pts[k] + '</td>' : '') + '<td class="n">' + totals[k] + '</td></tr>';
        });
        h('table', 'cs-score', s + '</tbody>');
      }
      function finish() {
        clear(); var x = T();
        var best = Math.max.apply(null, totals), win = [0, 1, 2, 3].filter(function (k) { return totals[k] === best; });
        h('div', 'cs-cover', '🏆');
        h('div', 'cs-res', esc(win.length > 1 ? x.tie + ' ' + win.map(nm).join(', ') : (mode === 'ai' && win[0] === 0 ? DG.t().youWin : x.winner(nm(win[0])))));
        table(null);
        var acts = h('div', 'cs-acts');
        btn(acts, DG.t().rematch, '', function () { totals = [0, 0, 0, 0]; roundNo = 0; nextRound(); });
        btn(acts, x.setup, 'ghost', setup);
        btn(acts, DG.t().exitGame, 'ghost', function () { opts.onExit && opts.onExit(); });
      }

      setup();
      return {
        destroy: function () { timers.forEach(clearTimeout); timers = []; },
        _state: function () { return { players: players, roles: roles, totals: totals, roundNo: roundNo, nRounds: nRounds, last: last }; }
      };
    }
  });
})();

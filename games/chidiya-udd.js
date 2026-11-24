/* Chidiya Udd (चिड़िया उड़) — two-player reflex game on one phone.
   A caller shows "<thing> उड़!". If it can really fly, be first to tap your button: +1.
   If it can't fly (भैंस उड़!) and you tap: −1. 20 calls, each one a little faster. Most points wins.
   pass: player 2's button is at the top, turned round, so two friends face each other across the phone.
   ai: the computer holds the top button (quick, but sometimes fooled). */
(function () {
  var K = DG.kit;
  K.css('cu-style',
    '.cu{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;}' +
    '.cu-pad{border:0;width:min(92vw,380px);height:92px;border-radius:20px;font-family:var(--font-d);font-weight:800;font-size:1.35rem;color:#fff;cursor:pointer;touch-action:manipulation;box-shadow:var(--shadow);display:flex;align-items:center;justify-content:center;gap:10px;transition:transform .06s,filter .2s;}' +
    '.cu-pad:active{transform:scale(.97);} .cu-pad.top{transform:rotate(180deg);} .cu-pad.top:active{transform:rotate(180deg) scale(.97);}' +
    '.cu-pad.p0{background:linear-gradient(135deg,#e2513b,#ff9a7a);} .cu-pad.p1{background:linear-gradient(135deg,#2f6fd6,#7fb0ff);} .cu-pad:disabled{filter:grayscale(.6) brightness(.7);cursor:default;}' +
    '.cu-pad b{background:rgba(0,0,0,.22);padding:2px 12px;border-radius:999px;}' +
    '.cu-pad.good{animation:cug .4s;} .cu-pad.bad{animation:cub .4s;} @keyframes cug{50%{box-shadow:0 0 0 6px #2ecc71}} @keyframes cub{25%{margin-left:-10px}75%{margin-left:10px}}' +
    '.cu-card{width:min(92vw,380px);min-height:190px;border-radius:22px;background:radial-gradient(circle at 50% 30%,#2b3470,#141a40);box-shadow:0 0 0 2px #d9a441;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;position:relative;overflow:hidden;}' +
    '.cu-em{font-size:4.6rem;line-height:1;} .cu-em.fly{animation:cuf .9s ease-out;} @keyframes cuf{from{transform:translateY(40px) scale(.6);opacity:0}to{transform:none;opacity:1}}' +
    '.cu-txt{font-family:var(--font-d);font-weight:800;font-size:1.7rem;color:#ffd36b;text-align:center;}' +
    '.cu-sub{font-family:var(--font-d);font-weight:700;font-size:.9rem;color:var(--ink-soft);min-height:1.3em;text-align:center;}' +
    '.cu-bar{position:absolute;left:0;bottom:0;height:5px;background:#f5a524;}');

  // [emoji, flies?, hi, en, hinglish, bn]
  var ITEMS = [
    ['🦜',1,'तोता','Parrot','Tota','টিয়া'],['🐦',1,'चिड़िया','Bird','Chidiya','পাখি'],['🕊️',1,'कबूतर','Pigeon','Kabootar','পায়রা'],['🐦‍⬛',1,'कौआ','Crow','Kauwa','কাক'],
    ['🦚',1,'मोर','Peacock','Mor','ময়ূর'],['🦋',1,'तितली','Butterfly','Titli','প্রজাপতি'],['🪰',1,'मक्खी','Fly','Makkhi','মাছি'],['🦟',1,'मच्छर','Mosquito','Machchhar','মশা'],
    ['🦅',1,'चील','Eagle','Cheel','চিল'],['🦉',1,'उल्लू','Owl','Ullu','পেঁচা'],['✈️',1,'हवाई जहाज़','Aeroplane','Hawai jahaaz','এরোপ্লেন'],['🪁',1,'पतंग','Kite','Patang','ঘুড়ি'],
    ['🎈',1,'गुब्बारा','Balloon','Gubbara','বেলুন'],['🐝',1,'मधुमक्खी','Bee','Madhumakkhi','মৌমাছি'],['🦆',1,'बत्तख','Duck','Battakh','হাঁস'],['🚁',1,'हेलिकॉप्टर','Helicopter','Helicopter','হেলিকপ্টার'],
    ['🦇',1,'चमगादड़','Bat','Chamgadad','বাদুড়'],['🐞',1,'भिंडी कीड़ा','Ladybird','Bhindi keeda','লেডিবার্ড'],
    ['🐃',0,'भैंस','Buffalo','Bhains','মোষ'],['🐄',0,'गाय','Cow','Gaay','গরু'],['🐘',0,'हाथी','Elephant','Haathi','হাতি'],['🐎',0,'घोड़ा','Horse','Ghoda','ঘোড়া'],
    ['🐕',0,'कुत्ता','Dog','Kutta','কুকুর'],['🐈',0,'बिल्ली','Cat','Billi','বিড়াল'],['🪑',0,'कुर्सी','Chair','Kursi','চেয়ার'],['🐢',0,'कछुआ','Tortoise','Kachhua','কচ্ছপ'],
    ['🐟',0,'मछली','Fish','Machhli','মাছ'],['🚲',0,'साइकिल','Cycle','Cycle','সাইকেল'],['🚌',0,'बस','Bus','Bus','বাস'],['🌳',0,'पेड़','Tree','Ped','গাছ'],
    ['⛰️',0,'पहाड़','Mountain','Pahaad','পাহাড়'],['🐪',0,'ऊँट','Camel','Oont','উট'],['🐐',0,'बकरी','Goat','Bakri','ছাগল'],['🏺',0,'मटका','Matka','Matka','কলসি'],
    ['🥟',0,'समोसा','Samosa','Samosa','শিঙাড়া'],['🦁',0,'शेर','Lion','Sher','সিংহ'],['🥔',0,'आलू','Potato','Aloo','আলু'],['🐊',0,'मगरमच्छ','Crocodile','Magarmachh','কুমির'],
    ['🚂',0,'रेलगाड़ी','Train','Railgaadi','রেলগাড়ি'],['🐸',0,'मेंढक','Frog','Mendhak','ব্যাঙ']
  ];
  var LI = { hi: 2, en: 3, hinglish: 4, bn: 5 };
  var CL = {
    hi: { udd: ' उड़!', tap: '🙌 उड़!', ready: 'तैयार हो जाओ…', call: function (n, t) { return 'पुकार ' + n + '/' + t; }, got: function (n) { return '⚡ ' + n + ' +1'; }, oops: function (n) { return '😂 ' + n + ' −1 — यह नहीं उड़ता!'; }, nobody: 'किसी ने नहीं पकड़ा!', safe: '👍 सही — कोई नहीं फँसा',
      rules: 'जो सच में उड़ता है उस पर सबसे पहले अपना बटन दबाओ (+1)। जो नहीं उड़ता उस पर दबाया तो −1। हर पुकार थोड़ी तेज़। 20 पुकार।', go: '🐦 शुरू करो' },
    en: { udd: ' fly!', tap: '🙌 Fly!', ready: 'Get ready…', call: function (n, t) { return 'Call ' + n + '/' + t; }, got: function (n) { return '⚡ ' + n + ' +1'; }, oops: function (n) { return '😂 ' + n + ' −1 — that can’t fly!'; }, nobody: 'Nobody got it!', safe: '👍 Right — nobody was fooled',
      rules: 'If it really flies, be first to tap your button (+1). Tap on something that can’t fly: −1. Each call gets faster. 20 calls.', go: '🐦 Start' },
    hinglish: { udd: ' udd!', tap: '🙌 Udd!', ready: 'Taiyaar ho jao…', call: function (n, t) { return 'Pukaar ' + n + '/' + t; }, got: function (n) { return '⚡ ' + n + ' +1'; }, oops: function (n) { return '😂 ' + n + ' −1 — yeh nahi udta!'; }, nobody: 'Kisi ne nahi pakda!', safe: '👍 Sahi — koi nahi phansa',
      rules: 'Jo sach mein udta hai us par sabse pehle apna button dabao (+1). Jo nahi udta us par dabaya to −1. Har pukaar thodi tez. 20 pukaar.', go: '🐦 Shuru karo' },
    bn: { udd: ' ওড়ে!', tap: '🙌 ওড়ে!', ready: 'তৈরি হও…', call: function (n, t) { return 'ডাক ' + n + '/' + t; }, got: function (n) { return '⚡ ' + n + ' +১'; }, oops: function (n) { return '😂 ' + n + ' −১ — এটা ওড়ে না!'; }, nobody: 'কেউ ধরতে পারেনি!', safe: '👍 ঠিক — কেউ ঠকেনি',
      rules: 'যেটা সত্যি ওড়ে, সবার আগে নিজের বোতাম টেপো (+১)। যেটা ওড়ে না তাতে টিপলে −১। প্রতি ডাক একটু দ্রুত। ২০টা ডাক।', go: '🐦 শুরু করো' }
  };
  var L = K.lang(CL), CALLS = 20;

  DG.register('chidiya', {
    mount: function (wrap, opts) {
      var mode = opts.mode === 'ai' ? 'ai' : 'pass', c = K.clock(), X = L();
      var root = K.el('div', 'cu', null, wrap);
      var pads, card, em, txt, sub, barEl, score, n, item, open, taken, deck, aiTimer;
      function name(i) { return K.pname(mode, i); }

      function intro() {
        c.stop(); root.innerHTML = ''; X = L();
        var box = K.el('div', 'dk-setup', null, root);
        K.el('div', 'cu-em', '🐦', box); K.el('h3', null, DG.gname({ n: { hi: 'चिड़िया उड़', en: 'Chidiya Udd (Bird Flies)', hinglish: 'Chidiya Udd', bn: 'পাখি ওড়ে' } }), box);
        K.el('p', 'dk-rules', null, box).textContent = X.rules;
        K.btn(K.el('div', 'dk-row', null, box), X.go, '', start);
      }
      function start() {
        root.innerHTML = ''; X = L(); score = [0, 0]; n = 0;
        // a fair deck: about 60% flyers, no repeats
        var fl = K.shuffle(ITEMS.filter(function (x) { return x[1]; })), nf = K.shuffle(ITEMS.filter(function (x) { return !x[1]; }));
        deck = K.shuffle(fl.slice(0, 12).concat(nf.slice(0, 8)));
        pads = [mkPad(1), null, mkPad(0)];
        card = K.el('div', 'cu-card', null, root);
        em = K.el('div', 'cu-em', null, card); txt = K.el('div', 'cu-txt', null, card); sub = K.el('div', 'cu-sub', null, card); barEl = K.el('div', 'cu-bar', null, card);
        root.insertBefore(card, pads[2]);
        pads = [pads[2], pads[0]];
        paintPads(); em.textContent = '🙂'; txt.textContent = X.ready; sub.textContent = '';
        c.later(nextCall, 1400);
      }
      function mkPad(i) {
        var b = K.el('button', 'cu-pad p' + i + (i === 1 && mode === 'pass' ? ' top' : ''), null, root); b.type = 'button';
        b.addEventListener('pointerdown', function (e) { e.preventDefault(); if (mode === 'ai' && i === 1) return; press(i); });
        return b;
      }
      function paintPads() { [0, 1].forEach(function (i) { pads[i].innerHTML = '<span>' + K.esc(name(i)) + '</span> ' + X.tap + ' <b>' + score[i] + '</b>'; pads[i].disabled = mode === 'ai' && i === 1; }); }

      function nextCall() {
        if (n >= CALLS) return finish();
        item = deck[n]; n++; open = true; taken = false; var id = n; // timers below belong to this call only
        var win = Math.max(0.85, 1.7 - n * 0.045);           // seconds to react, shrinking
        em.className = 'cu-em fly'; void em.offsetWidth; em.textContent = item[0];
        txt.textContent = item[LI[DG.lang] || 3] + X.udd; sub.textContent = X.call(n, CALLS);
        DG.sfx(item[1] ? 'toss' : 'tap');
        barEl.style.transition = 'none'; barEl.style.width = '100%'; void barEl.offsetWidth; barEl.style.transition = 'width ' + win + 's linear'; barEl.style.width = '0';
        if (mode === 'ai') {
          var fooled = !item[1] && Math.random() < 0.09, react = item[1] ? 0.38 + Math.random() * 0.75 : 0.45 + Math.random() * 0.3;
          if (item[1] && Math.random() < 0.08) react = 99;        // sometimes the computer is too slow
          if (item[1] || fooled) aiTimer = c.later(function () { if (n === id) press(1); }, react * 1000);
        }
        c.later(function () { if (n === id) closeCall(); }, win * 1000);
      }
      function press(i) {
        if (!open || taken === i || (taken !== false && item[1])) return;
        if (item[1]) { taken = i; score[i]++; DG.sfx('ting'); flash(i, 'good'); sub.textContent = X.got(name(i)); open = false; paintPads(); c.later(gap, 650); }
        else { score[i]--; DG.sfx('buzz'); DG.buzz(70); flash(i, 'bad'); sub.textContent = X.oops(name(i)); taken = i; paintPads(); }
      }
      function flash(i, cls) { var p = pads[i]; p.classList.remove('good', 'bad'); void p.offsetWidth; p.classList.add(cls); }
      function closeCall() {
        if (!open) return; open = false;
        if (item[1] && taken === false) { sub.textContent = X.nobody; DG.sfx('thud', .3); }
        else if (!item[1] && taken === false) { sub.textContent = X.safe; }
        gap();
      }
      var gapping = false;
      function gap() { if (gapping) return; gapping = true; c.later(function () { gapping = false; em.textContent = '·'; txt.textContent = ''; c.later(nextCall, 350 + Math.random() * 400); }, 550); }
      function finish() {
        c.stop();
        K.result(root, { mode: mode, winner: score[0] === score[1] ? -1 : (score[0] > score[1] ? 0 : 1), names: [name(0), name(1)], em: '🐦',
          sub: name(0) + ' ' + score[0] + ' – ' + score[1] + ' ' + name(1), again: start, onExit: opts.onExit });
      }

      intro();
      return { destroy: function () { c.kill(); wrap.innerHTML = ''; }, _state: function () { return { score: score, n: n, item: item, open: open }; }, _press: press };
    }
  });
})();

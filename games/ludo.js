/* Ludo (लूडो). 2–4 players, 4 gotiyan each. Modes: pass (all human) / ai (you = red, rest computer).
   Rules (common Indian home rules):
   - a 6 brings a goti out of the ghar; 6, a cut or reaching home gives one more turn
   - three 6s in a row: the turn is lost
   - landing on an opponent (not on a ★ / start square) cuts it back to its ghar
   - the last steps need the exact number; first to bring all 4 home wins.
   Rules engine is exposed as DG.ludo for tests. Registers into DG. */
(function () {
  if (!document.getElementById('ld-style')) {
    var st = document.createElement('style'); st.id = 'ld-style';
    st.textContent =
      '.ld{display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;}' +
      '.ld-board{width:min(94vw,400px);height:auto;display:block;border-radius:14px;box-shadow:var(--shadow);background:var(--wood,#e6d099);touch-action:manipulation;user-select:none;-webkit-user-select:none;}' +
      '.ld-cell{fill:rgba(255,250,236,.78);stroke:rgba(74,49,24,.45);stroke-width:.8;}' +
      '.ld-star{font-size:13px;fill:rgba(74,49,24,.55);text-anchor:middle;dominant-baseline:central;pointer-events:none;}' +
      '.ld-tok{stroke:#fff;stroke-width:2;filter:drop-shadow(0 1.5px 1.5px rgba(0,0,0,.45));transition:cx .1s linear,cy .1s linear;}' +
      '.ld-ring{fill:none;stroke:#fff;stroke-width:2.2;stroke-dasharray:4 3;animation:ldspin 1.2s linear infinite;transform-box:fill-box;transform-origin:center;pointer-events:none;}' +
      '@keyframes ldspin{to{transform:rotate(360deg)}}' +
      '.ld-hit{fill:transparent;cursor:pointer;}' +
      '.ld-bar{display:flex;align-items:center;gap:14px;}' +
      '.ld-chip{font-family:var(--font-d);font-weight:800;font-size:1rem;padding:8px 16px;border-radius:999px;background:var(--panel);border:1px solid var(--line);display:flex;align-items:center;gap:9px;}' +
      '.ld-chip i{width:14px;height:14px;border-radius:50%;display:inline-block;box-shadow:0 0 0 2px rgba(255,255,255,.6);}' +
      '.ld-hint{font-family:var(--font-d);font-weight:600;font-size:.88rem;color:var(--ink-soft);min-height:1.3em;text-align:center;}' +
      '.ld-dice{width:64px;height:64px;border-radius:16px;border:0;cursor:pointer;background:linear-gradient(135deg,#fff,#ffeccc);box-shadow:0 8px 18px rgba(0,0,0,.45),inset 0 0 0 3px var(--pc,#fff);display:grid;place-items:center;transition:transform .1s;}' +
      '.ld-dice:active{transform:scale(.92);} .ld-dice:disabled{opacity:.55;cursor:default;}' +
      '.ld-dice.roll{animation:ldroll .45s ease;} @keyframes ldroll{0%{transform:rotate(0) scale(1)}50%{transform:rotate(200deg) scale(.86)}100%{transform:rotate(360deg) scale(1)}}' +
      '.ld-dice.go{animation:ldpulse 1s ease-in-out infinite;} @keyframes ldpulse{0%,100%{box-shadow:0 8px 18px rgba(0,0,0,.45),inset 0 0 0 3px var(--pc)}50%{box-shadow:0 0 0 6px var(--pc),inset 0 0 0 3px var(--pc)}}' +
      '.ld-pips{display:grid;grid-template-columns:repeat(3,10px);grid-template-rows:repeat(3,10px);gap:4px;}' +
      '.ld-pips span{width:10px;height:10px;display:block;} .ld-pips span.on{background:#2a1030;border-radius:50%;}' +
      '.ld-setup{display:flex;flex-direction:column;align-items:center;gap:14px;margin-top:14px;text-align:center;}' +
      '.ld-setup h3{font-family:var(--font-d);font-weight:800;font-size:1.35rem;margin:0;}' +
      '.ld-opts{display:flex;flex-direction:column;gap:10px;width:min(86vw,300px);}' +
      '.ld-opt{border:1px solid var(--line);cursor:pointer;font-family:var(--font-d);font-weight:800;font-size:1.05rem;padding:13px 16px;border-radius:14px;background:var(--panel-2,rgba(255,255,255,.06));color:var(--ink);display:flex;align-items:center;justify-content:space-between;gap:10px;}' +
      '.ld-opt .dots{display:flex;gap:5px;} .ld-opt .dots i{width:13px;height:13px;border-radius:50%;display:inline-block;}' +
      '.ld-rules{font-size:.8rem;color:var(--ink-soft);max-width:320px;line-height:1.5;}' +
      '.ld-result{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;margin-top:20px;} .ld-result .rt{font-family:var(--font-d);font-weight:800;font-size:1.6rem;}' +
      '.ld-acts{display:flex;gap:10px;} .ld-btn{border:0;cursor:pointer;font-family:var(--font-d);font-weight:800;font-size:1rem;padding:13px 22px;border-radius:14px;color:#2a1803;background:linear-gradient(135deg,var(--marigold,#f5a524),var(--marigold2,#ffd36b));} .ld-btn.ghost{background:var(--panel);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);}';
    document.head.appendChild(st);
  }

  var LL = {
    hi:{ pick:'कितने खिलाड़ी?', np:function(n){return n+' खिलाड़ी';}, vs:function(n){return 'तुम + '+n+' कंप्यूटर';}, colors:['लाल','हरा','पीला','नीला'],
      turn:function(n){return n+' की बारी';}, rollNow:'पासा डालो 🎲', pickTok:'कौन सी गोटी चलानी है? उस पर टैप करो', need6:'गोटी निकालने के लिए 6 चाहिए', noMove:'कोई चाल नहीं बनी',
      three6:'तीन बार 6 — बारी गई 😅', cut:'काट दी! ✂️ एक और बारी', home:'गोटी घर पहुँची! 🏠', six:'6 आया — एक और बारी', you:'तुम', comp:function(c){return 'कंप्यूटर ('+c+')';},
      rules:'6 पर गोटी बाहर निकलती है। 6, काटने या घर पहुँचने पर एक और बारी। ★ वाले खाने पर कोई नहीं कटता। चारों गोटी पहले घर लाओ!' },
    en:{ pick:'How many players?', np:function(n){return n+' players';}, vs:function(n){return 'You + '+n+' computer'+(n>1?'s':'');}, colors:['Red','Green','Yellow','Blue'],
      turn:function(n){return n+"'s turn";}, rollNow:'Roll the dice 🎲', pickTok:'Which piece? Tap it', need6:'You need a 6 to bring a piece out', noMove:'No move possible',
      three6:'Three 6s — turn lost 😅', cut:'Cut! ✂️ One more turn', home:'Piece reached home! 🏠', six:'A 6 — one more turn', you:'You', comp:function(c){return 'Computer ('+c+')';},
      rules:'A 6 brings a piece out. A 6, a cut or reaching home gives another turn. Nobody can be cut on a ★ square. Bring all four home first!' },
    hinglish:{ pick:'Kitne khiladi?', np:function(n){return n+' khiladi';}, vs:function(n){return 'Tum + '+n+' computer';}, colors:['Laal','Hara','Peela','Neela'],
      turn:function(n){return n+' ki baari';}, rollNow:'Paasa daalo 🎲', pickTok:'Kaun si goti chalani hai? Us par tap karo', need6:'Goti nikalne ke liye 6 chahiye', noMove:'Koi chaal nahi bani',
      three6:'Teen baar 6 — baari gayi 😅', cut:'Kaat di! ✂️ Ek aur baari', home:'Goti ghar pahunchi! 🏠', six:'6 aaya — ek aur baari', you:'Tum', comp:function(c){return 'Computer ('+c+')';},
      rules:'6 par goti bahar nikalti hai. 6, kaatne ya ghar pahunchne par ek aur baari. ★ wale khaane par koi nahi katta. Chaaron goti pehle ghar lao!' },
    bn:{ pick:'কতজন খেলবে?', np:function(n){return n+' জন';}, vs:function(n){return 'তুমি + '+n+' কম্পিউটার';}, colors:['লাল','সবুজ','হলুদ','নীল'],
      turn:function(n){return n+'-এর পালা';}, rollNow:'ছক্কা দাও 🎲', pickTok:'কোন গুটি চালবে? তাতে ট্যাপ করো', need6:'গুটি বের করতে ৬ লাগবে', noMove:'কোনো চাল নেই',
      three6:'তিনবার ৬ — পালা গেল 😅', cut:'কেটে দিলে! ✂️ আরেকটা পালা', home:'গুটি ঘরে পৌঁছেছে! 🏠', six:'৬ পড়েছে — আরেকটা পালা', you:'তুমি', comp:function(c){return 'কম্পিউটার ('+c+')';},
      rules:'৬ পড়লে গুটি বের হয়। ৬, কাটা বা ঘরে পৌঁছালে আরেকটা পালা। ★ ঘরে কেউ কাটা পড়ে না। চারটে গুটি আগে ঘরে আনো!' }
  };
  function lt() { return LL[DG.lang] || LL.en; }

  /* ---------- board geometry (15 x 15 grid, [row, col]) ---------- */
  var COL = ['#d9443a', '#2c9a5c', '#e7a91c', '#3478d4']; // red, green, yellow, blue (clockwise)
  var TRACK = (function () {
    var t = [], i;
    for (i = 1; i <= 5; i++) t.push([6, i]);
    for (i = 5; i >= 0; i--) t.push([i, 6]);
    t.push([0, 7]);
    for (i = 0; i <= 5; i++) t.push([i, 8]);
    for (i = 9; i <= 14; i++) t.push([6, i]);
    t.push([7, 14]);
    for (i = 14; i >= 9; i--) t.push([8, i]);
    for (i = 9; i <= 14; i++) t.push([i, 8]);
    t.push([14, 7]);
    for (i = 14; i >= 9; i--) t.push([i, 6]);
    for (i = 5; i >= 0; i--) t.push([8, i]);
    t.push([7, 0]); t.push([6, 0]);
    return t; // 52 squares, index 0 = red start
  })();
  var START = [0, 13, 26, 39];
  var SAFE = [0, 8, 13, 21, 26, 34, 39, 47];
  var HOME = [
    [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
    [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
    [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
    [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]]
  ];
  var YARD = [[0, 0], [0, 9], [9, 9], [9, 0]];
  var FIN = 56; // progress: -1 yard, 0..50 track, 51..55 home column, 56 home

  /* ---------- rules engine (pure) ---------- */
  function absOf(color, p) { return (START[color] + p) % 52; }
  function target(p, d) { if (p < 0) return d === 6 ? 0 : null; var n = p + d; return n <= FIN ? n : null; }
  function legal(tokens, color, d) {
    var out = [];
    for (var k = 0; k < 4; k++) { var n = target(tokens[color][k], d); if (n !== null) out.push({ k: k, from: tokens[color][k], to: n }); }
    return out;
  }
  // which opponent tokens a move would cut: [[color, k], ...]
  function cutsOf(tokens, seats, color, to) {
    if (to > 50) return [];
    var a = absOf(color, to); if (SAFE.indexOf(a) >= 0) return [];
    var res = [];
    seats.forEach(function (c) {
      if (c === color) return;
      for (var k = 0; k < 4; k++) { var p = tokens[c][k]; if (p >= 0 && p <= 50 && absOf(c, p) === a) res.push([c, k]); }
    });
    return res;
  }
  // danger: an opponent token 1..6 squares behind abs square a
  function threatened(tokens, seats, color, a) {
    if (SAFE.indexOf(a) >= 0) return false;
    for (var s = 0; s < seats.length; s++) {
      var c = seats[s]; if (c === color) continue;
      for (var k = 0; k < 4; k++) {
        var p = tokens[c][k]; if (p < 0 || p > 50) continue;
        var gap = (a - absOf(c, p) + 52) % 52;
        if (gap >= 1 && gap <= 6 && p + gap <= 50) return true;
      }
    }
    return false;
  }
  function aiPick(tokens, seats, color, moves) {
    var best = null, bestS = -1e9;
    moves.forEach(function (m) {
      var s = m.to / 10;
      if (m.to === FIN) s += 100;
      if (cutsOf(tokens, seats, color, m.to).length) s += 80 + tokens[color][m.k];
      if (m.from < 0) s += 45;
      if (m.from <= 50 && m.to > 50) s += 50;
      if (m.to <= 50) {
        var a = absOf(color, m.to);
        if (SAFE.indexOf(a) >= 0) s += 22;
        if (threatened(tokens, seats, color, a)) s -= 30;
      }
      if (m.from >= 0 && m.from <= 50 && threatened(tokens, seats, color, absOf(color, m.from))) s += 18 + m.from / 5; // run away
      if (m.from >= 0 && m.from <= 50 && SAFE.indexOf(absOf(color, m.from)) >= 0) s -= 8;
      s += Math.random() * 2;
      if (s > bestS) { bestS = s; best = m; }
    });
    return best;
  }
  DG.ludo = { TRACK: TRACK, START: START, SAFE: SAFE, FIN: FIN, legal: legal, cutsOf: cutsOf, aiPick: aiPick, absOf: absOf };

  /* ---------- drawing ---------- */
  var S = 24, NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs, parent) { var e = document.createElementNS(NS, name); for (var a in attrs) e.setAttribute(a, attrs[a]); if (parent) parent.appendChild(e); return e; }
  function cxy(rc) { return [rc[1] * S + S / 2, rc[0] * S + S / 2]; }
  function yardSpot(color, k) { var y = YARD[color]; return [(y[1] + (k % 2 ? 4 : 2)) * S, (y[0] + (k < 2 ? 2 : 4)) * S]; }
  var FINC = [[6.55, 7.5], [7.5, 6.55], [8.45, 7.5], [7.5, 8.45]];
  function posXY(color, k, p) {
    if (p < 0) return yardSpot(color, k);
    if (p <= 50) return cxy(TRACK[absOf(color, p)]);
    if (p < FIN) return cxy(HOME[color][p - 51]);
    var f = FINC[color], o = [[-.3, -.3], [.3, -.3], [-.3, .3], [.3, .3]][k];
    return [(f[0] + o[0] * .9) * S, (f[1] + o[1] * .9) * S];
  }
  var PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  function diceFace(n) { var s = '<span class="ld-pips">'; for (var i = 0; i < 9; i++) s += '<span' + (PIPS[n].indexOf(i) >= 0 ? ' class="on"' : '') + '></span>'; return s + '</span>'; }

  function drawBoard(svg) {
    var g = el('g', {}, svg), i, c;
    // yards
    for (c = 0; c < 4; c++) {
      var y = YARD[c];
      el('rect', { x: y[1] * S + 1, y: y[0] * S + 1, width: 6 * S - 2, height: 6 * S - 2, rx: 10, fill: COL[c] }, g);
      el('rect', { x: (y[1] + 1) * S, y: (y[0] + 1) * S, width: 4 * S, height: 4 * S, rx: 8, fill: 'rgba(255,250,236,.92)' }, g);
      for (i = 0; i < 4; i++) { var sp = yardSpot(c, i); el('circle', { cx: sp[0], cy: sp[1], r: 10, fill: 'none', stroke: COL[c], 'stroke-width': 2, opacity: .55 }, g); }
    }
    // track squares
    TRACK.forEach(function (rc, idx) {
      var fill = null;
      for (c = 0; c < 4; c++) if (START[c] === idx) fill = COL[c];
      var r = el('rect', { x: rc[1] * S, y: rc[0] * S, width: S, height: S, class: 'ld-cell' }, g);
      if (fill) { r.setAttribute('style', 'fill:' + fill); }
      if (SAFE.indexOf(idx) >= 0) { var p = cxy(rc); var t = el('text', { x: p[0], y: p[1] + 1, class: 'ld-star' }, g); t.textContent = '★'; if (fill) t.setAttribute('style', 'fill:rgba(255,255,255,.85)'); }
    });
    // home columns
    for (c = 0; c < 4; c++) HOME[c].forEach(function (rc) { el('rect', { x: rc[1] * S, y: rc[0] * S, width: S, height: S, class: 'ld-cell', style: 'fill:' + COL[c] + ';opacity:.85' }, g); });
    // centre triangles
    var m = 7.5 * S, a = 6 * S, b = 9 * S;
    [[a, a, a, b], [a, a, b, a], [b, a, b, b], [a, b, b, b]].forEach(function (q, ci) {
      el('polygon', { points: q[0] + ',' + q[1] + ' ' + q[2] + ',' + q[3] + ' ' + m + ',' + m, fill: COL[ci], stroke: 'rgba(74,49,24,.5)', 'stroke-width': .8 }, g);
    });
    return el('g', {}, svg); // token layer
  }

  DG.register('ludo', {
    mount: function (wrap, opts) {
      var mode = opts.mode, T = lt();
      var root = document.createElement('div'); root.className = 'ld'; wrap.appendChild(root);
      var timers = [], dead = false;
      function later(fn, ms) { var id = setTimeout(function () { if (!dead) fn(); }, ms); timers.push(id); return id; }

      var seats, human, tokens, turn, sixes, phase, cur, moves, lastD;
      var svg, layer, chip, hint, dice;

      function nameOf(c) {
        var cn = T.colors[c];
        if (mode === 'ai') return human[c] ? T.you : T.comp(cn);
        return cn;
      }

      /* ----- setup: how many players ----- */
      function setup() {
        T = lt(); root.innerHTML = '';
        var box = document.createElement('div'); box.className = 'ld-setup';
        box.innerHTML = '<h3>' + T.pick + '</h3>';
        var o = document.createElement('div'); o.className = 'ld-opts';
        [[2, [0, 2]], [3, [0, 1, 2]], [4, [0, 1, 2, 3]]].forEach(function (opt) {
          var b = document.createElement('button'); b.className = 'ld-opt';
          var dots = opt[1].map(function (c) { return '<i style="background:' + COL[c] + '"></i>'; }).join('');
          b.innerHTML = '<span>' + (mode === 'ai' ? T.vs(opt[0] - 1) : T.np(opt[0])) + '</span><span class="dots">' + dots + '</span>';
          b.onclick = function () { start(opt[1]); };
          o.appendChild(b);
        });
        box.appendChild(o);
        var r = document.createElement('p'); r.className = 'ld-rules'; r.textContent = T.rules; box.appendChild(r);
        root.appendChild(box);
      }

      /* ----- game ----- */
      function start(seatList) {
        T = lt(); root.innerHTML = '';
        seats = seatList.slice(); human = {};
        seats.forEach(function (c, i) { human[c] = (mode !== 'ai') || i === 0; });
        tokens = [[-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1]];
        turn = 0; sixes = 0; phase = 'roll'; moves = []; lastD = 0;

        var bar = document.createElement('div'); bar.className = 'ld-bar';
        chip = document.createElement('div'); chip.className = 'ld-chip';
        bar.appendChild(chip); root.appendChild(bar);
        svg = el('svg', { viewBox: '0 0 360 360', class: 'ld-board', role: 'img', 'aria-label': 'Ludo board' });
        root.appendChild(svg); layer = drawBoard(svg);
        var row = document.createElement('div'); row.className = 'ld-bar';
        dice = document.createElement('button'); dice.className = 'ld-dice'; dice.setAttribute('aria-label', 'dice');
        dice.innerHTML = '<span style="font-size:1.9rem">🎲</span>';
        dice.onclick = function () { if (phase === 'roll' && human[seats[turn]]) roll(); };
        row.appendChild(dice); root.appendChild(row);
        hint = document.createElement('div'); hint.className = 'ld-hint'; root.appendChild(hint);
        beginTurn();
      }

      function renderTokens() {
        layer.innerHTML = '';
        var groups = {};
        seats.forEach(function (c) { for (var k = 0; k < 4; k++) { var p = tokens[c][k]; if (p < 0 || p === FIN) continue; var xy = posXY(c, k, p), key = xy.join(','); (groups[key] = groups[key] || []).push([c, k]); } });
        var movable = {};
        if (phase === 'pick') moves.forEach(function (m) { movable[m.k] = 1; });
        seats.forEach(function (c) {
          for (var k = 0; k < 4; k++) {
            var p = tokens[c][k], xy = posXY(c, k, p), r = 8.5;
            if (p >= 0 && p < FIN) {
              var grp = groups[xy.join(',')];
              if (grp.length > 1) { var i = grp.findIndex(function (q) { return q[0] === c && q[1] === k; }); var off = [[-4, -4], [4, -4], [-4, 4], [4, 4]][i % 4]; xy = [xy[0] + off[0], xy[1] + off[1]]; r = 6.5; }
            }
            if (p === FIN) r = 5.5;
            el('circle', { cx: xy[0], cy: xy[1], r: r, fill: COL[c], class: 'ld-tok' }, layer);
            el('circle', { cx: xy[0], cy: xy[1], r: r * .38, fill: 'rgba(255,255,255,.55)', 'pointer-events': 'none' }, layer);
            if (c === cur && movable[k] && human[c]) {
              el('circle', { cx: xy[0], cy: xy[1], r: r + 3.5, class: 'ld-ring' }, layer);
              var hit = el('circle', { cx: xy[0], cy: xy[1], r: 13, class: 'ld-hit' }, layer);
              hit.addEventListener('click', (function (kk) { return function () { choose(kk); }; })(k));
            }
          }
        });
      }

      function renderBar() {
        chip.innerHTML = '<i style="background:' + COL[cur] + '"></i>' + T.turn(nameOf(cur));
        dice.style.setProperty('--pc', COL[cur]);
        var canRoll = phase === 'roll' && human[cur];
        dice.disabled = !canRoll;
        dice.classList.toggle('go', canRoll);
      }
      function say(s) { hint.textContent = s || ''; }

      function beginTurn() {
        cur = seats[turn]; phase = 'roll'; moves = [];
        renderBar(); renderTokens();
        if (human[cur]) say(T.rollNow); else { say(''); later(roll, 650); }
      }

      function nextTurn() { sixes = 0; turn = (turn + 1) % seats.length; beginTurn(); }

      function roll() {
        if (phase !== 'roll') return;
        phase = 'rolling'; renderBar();
        var d = (DG.ludoDice && DG.ludoDice.length) ? DG.ludoDice.shift() : 1 + Math.floor(Math.random() * 6); // DG.ludoDice: test hook
        lastD = d;
        dice.classList.remove('roll'); void dice.offsetWidth; dice.classList.add('roll'); DG.sfx('dice');
        later(function () {
          dice.innerHTML = diceFace(d);
          if (d === 6) { sixes++; if (sixes === 3) { say(T.three6); DG.sfx('buzz'); return later(nextTurn, 1100); } DG.sfx('bonus'); }
          moves = legal(tokens, cur, d);
          if (!moves.length) { say(tokens[cur].every(function (p) { return p < 0 || p === FIN; }) && d !== 6 ? T.need6 : T.noMove); return later(nextTurn, 950); }
          var same = moves.every(function (m) { return m.from === moves[0].from; });
          if (!human[cur]) { phase = 'anim'; renderBar(); return later(function () { doMove(aiPick(tokens, seats, cur, moves)); }, 550); }
          if (same) { phase = 'anim'; renderBar(); return later(function () { doMove(moves[0]); }, 380); }
          phase = 'pick'; renderBar(); renderTokens(); say(T.pickTok);
        }, 460);
      }

      function choose(k) {
        if (phase !== 'pick') return;
        for (var i = 0; i < moves.length; i++) if (moves[i].k === k) { phase = 'anim'; renderBar(); doMove(moves[i]); return; }
      }

      function doMove(m) {
        var c = cur, steps = [];
        if (m.from < 0) steps.push(0); else for (var p = m.from + 1; p <= m.to; p++) steps.push(p);
        say('');
        (function walk(i) {
          if (i >= steps.length) return settle(c, m);
          tokens[c][m.k] = steps[i]; renderTokens(); DG.sfx(i === 0 && m.from < 0 ? 'place' : 'step');
          later(function () { walk(i + 1); }, 130);
        })(0);
      }

      function settle(c, m) {
        var cut = cutsOf(tokens, seats, c, m.to);
        cut.forEach(function (q) { tokens[q[0]][q[1]] = -1; });
        renderTokens();
        if (cut.length) { DG.sfx('capture'); DG.buzz(60); } else if (m.to === FIN) DG.sfx('home');
        if (tokens[c].every(function (p) { return p === FIN; })) return later(function () { finish(c); }, 500);
        var extra = lastD === 6 || cut.length > 0 || m.to === FIN;
        if (cut.length) say(T.cut); else if (m.to === FIN) say(T.home); else if (lastD === 6) say(T.six);
        if (lastD !== 6) sixes = 0;
        if (extra) later(function () { phase = 'roll'; moves = []; renderBar(); renderTokens(); if (!human[cur]) later(roll, 600); else if (!cut.length && m.to !== FIN && lastD !== 6) say(T.rollNow); }, 500);
        else later(nextTurn, 450);
      }

      function finish(c) {
        phase = 'over'; T = lt(); root.innerHTML = ''; DG.result(mode === 'ai' && !human[c] ? 'lose' : 'win');
        var txt = mode === 'ai' ? (human[c] ? DG.t().youWin : DG.t().wins(nameOf(c))) : DG.t().wins(nameOf(c));
        var r = document.createElement('div'); r.className = 'ld-result';
        r.innerHTML = '<div style="font-size:3rem">' + (mode === 'ai' && !human[c] ? '🤖' : '🏆') + '</div><div class="rt"></div>';
        r.querySelector('.rt').textContent = txt;
        var acts = document.createElement('div'); acts.className = 'ld-acts';
        var again = document.createElement('button'); again.className = 'ld-btn'; again.textContent = DG.t().rematch; again.onclick = function () { start(seats); };
        var other = document.createElement('button'); other.className = 'ld-btn ghost'; other.textContent = T.pick.replace('?', ''); other.onclick = setup;
        var exit = document.createElement('button'); exit.className = 'ld-btn ghost'; exit.textContent = DG.t().exitGame; exit.onclick = function () { opts.onExit && opts.onExit(); };
        acts.appendChild(again); acts.appendChild(other); acts.appendChild(exit); r.appendChild(acts);
        root.appendChild(r);
      }

      setup();
      return {
        destroy: function () { dead = true; timers.forEach(clearTimeout); wrap.innerHTML = ''; },
        _state: function () { return { seats: seats, tokens: tokens, turn: turn, phase: phase, cur: cur }; } // for tests
      };
    }
  });
})();

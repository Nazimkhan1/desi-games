/* Ashta-Chamma (अष्टा-चम्मा / Chowka Bhara) — 5×5 board, 4 kauri (cowries).
   Throw: open faces 1–3 = that many steps; all 4 open = चम्मा (4); none open = अष्टा (8). 4 and 8 give another throw.
   Each player's 4 pieces start on their home square (middle of their side). Path: outer ring anticlockwise
   (16 squares), then inner ring clockwise (8), then the centre. Home squares (✕) and the centre are safe.
   Landing on an opponent on a normal square sends it home and gives another throw.
   A player may enter the inner ring only after cutting at least one piece. Exact throw needed for the centre.
   2–4 players: pass (all human) or ai (you + computers). */
(function () {
  var K = DG.kit;
  K.css('ac-style',
    '.ac-board{width:min(92vw,380px);aspect-ratio:1;display:block;border-radius:14px;box-shadow:var(--shadow);}' +
    '.ac-kauri{display:flex;gap:10px;justify-content:center;min-height:46px;align-items:center;}' +
    '.ac-k{width:30px;height:40px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fffaf0,#e6d6b8);box-shadow:0 3px 6px rgba(0,0,0,.4);position:relative;transition:transform .2s;}' +
    '.ac-k.open::after{content:"";position:absolute;left:46%;top:16%;width:4px;height:68%;border-radius:3px;background:repeating-linear-gradient(#5a3a1c 0 3px,#e6d6b8 3px 5px);}' +
    '.ac-k.closed{background:radial-gradient(circle at 35% 30%,#f1e2c4,#b99a6c);} .ac-kauri.shake .ac-k{animation:acs .35s ease;} @keyframes acs{0%{transform:translateY(0) rotate(0)}50%{transform:translateY(-14px) rotate(140deg)}100%{transform:translateY(0) rotate(360deg)}}' +
    '.ac-tok{cursor:pointer;} .ac-ring{fill:none;stroke:#ffd36b;stroke-width:2.5;stroke-dasharray:4 3;animation:acr 1s linear infinite;} @keyframes acr{to{stroke-dashoffset:-14}}' +
    '.ac-opts{display:flex;flex-direction:column;gap:10px;width:min(86vw,320px);}' +
    '.ac-opts button{border:0;cursor:pointer;padding:14px;border-radius:14px;background:var(--panel);color:var(--ink);font-family:var(--font-d);font-weight:800;font-size:1rem;box-shadow:inset 0 0 0 1px var(--line);display:flex;justify-content:space-between;align-items:center;}' +
    '.ac-opts i{display:inline-block;width:12px;height:12px;border-radius:50%;margin-left:4px;}');

  var CL = {
    hi: { youTurn: 'तुम्हारी बारी', pick: 'कितने खिलाड़ी?', np: function (n) { return n + ' खिलाड़ी'; }, vs: function (n) { return 'तुम + ' + n + ' कंप्यूटर'; }, colors: ['लाल', 'हरा', 'पीला', 'नीला'],
      turn: function (n) { return n + ' की बारी'; }, throwB: '🐚 कौड़ी फेंको', pickTok: 'कौन-सी गोटी चलाओगे? चमकती गोटी पर टैप करो', noMove: 'कोई चाल नहीं — अगली बारी', you: 'तुम', comp: function (c) { return 'कंप्यूटर (' + c + ')'; },
      ashta: 'अष्टा! 8 + एक और बारी', chamma: 'चम्मा! 4 + एक और बारी', cut: '✂️ काट दी! एक और बारी', home: '🏠 बीच में पहुँची!', needCut: 'अंदर जाने से पहले एक गोटी काटनी होगी',
      rules: '1–3 खुली कौड़ी = उतने घर। 4 खुली = चम्मा (4), 0 खुली = अष्टा (8) — दोनों पर एक और बारी। ✕ वाले घर सुरक्षित। अंदर के घेरे में जाने से पहले एक गोटी काटना ज़रूरी। चारों गोटी बीच में = जीत।' },
    en: { youTurn: 'Your turn', pick: 'How many players?', np: function (n) { return n + ' players'; }, vs: function (n) { return 'You + ' + n + ' computer'; }, colors: ['Red', 'Green', 'Yellow', 'Blue'],
      turn: function (n) { return n + "'s turn"; }, throwB: '🐚 Throw kauri', pickTok: 'Which piece? Tap a glowing one', noMove: 'No move — next turn', you: 'You', comp: function (c) { return 'Computer (' + c + ')'; },
      ashta: 'Ashta! 8 + another throw', chamma: 'Chamma! 4 + another throw', cut: '✂️ Cut! Another throw', home: '🏠 Reached the centre!', needCut: 'Cut one piece before entering the inner ring',
      rules: '1–3 open shells = that many squares. 4 open = Chamma (4), none open = Ashta (8) — both give another throw. ✕ squares are safe. Cut one piece before entering the inner ring. All 4 pieces in the centre wins.' },
    hinglish: { youTurn: 'Tumhari baari', pick: 'Kitne khiladi?', np: function (n) { return n + ' khiladi'; }, vs: function (n) { return 'Tum + ' + n + ' computer'; }, colors: ['Laal', 'Hara', 'Peela', 'Neela'],
      turn: function (n) { return n + ' ki baari'; }, throwB: '🐚 Kauri phenko', pickTok: 'Kaunsi goti chalaoge? Chamakti goti par tap karo', noMove: 'Koi chaal nahi — agli baari', you: 'Tum', comp: function (c) { return 'Computer (' + c + ')'; },
      ashta: 'Ashta! 8 + ek aur baari', chamma: 'Chamma! 4 + ek aur baari', cut: '✂️ Kaat di! Ek aur baari', home: '🏠 Beech mein pahunchi!', needCut: 'Andar jaane se pehle ek goti kaatni hogi',
      rules: '1–3 khuli kauri = utne ghar. 4 khuli = Chamma (4), 0 khuli = Ashta (8) — dono par ek aur baari. ✕ wale ghar safe. Andar ke ghere mein jaane se pehle ek goti kaatna zaroori. Chaaron goti beech mein = jeet.' },
    bn: { youTurn: 'তোমার পালা', pick: 'কতজন খেলোয়াড়?', np: function (n) { return n + ' জন'; }, vs: function (n) { return 'তুমি + ' + n + ' কম্পিউটার'; }, colors: ['লাল', 'সবুজ', 'হলুদ', 'নীল'],
      turn: function (n) { return n + '-এর পালা'; }, throwB: '🐚 কড়ি চালো', pickTok: 'কোন গুটি চালবে? জ্বলজ্বলে গুটিতে ট্যাপ করো', noMove: 'চাল নেই — পরের পালা', you: 'তুমি', comp: function (c) { return 'কম্পিউটার (' + c + ')'; },
      ashta: 'অষ্টা! ৮ + আরেক দান', chamma: 'চম্মা! ৪ + আরেক দান', cut: '✂️ কেটে দিয়েছ! আরেক দান', home: '🏠 মাঝখানে পৌঁছেছে!', needCut: 'ভেতরের ঘরে যেতে আগে একটা গুটি কাটতে হবে',
      rules: '১–৩টে খোলা কড়ি = ততো ঘর। ৪টে খোলা = চম্মা (৪), একটাও খোলা নয় = অষ্টা (৮) — দুটোতেই আরেক দান। ✕ ঘর নিরাপদ। ভেতরের ঘরে ঢোকার আগে একটা গুটি কাটা দরকার। চারটে গুটি মাঝখানে = জয়।' }
  };
  var L = K.lang(CL);
  var COL = ['#e2513b', '#2ecc71', '#f5c518', '#2f6fd6'];
  // path for player 0 (bottom); others are the same path turned by 90° each
  var OUTER = [[4,2],[4,3],[4,4],[3,4],[2,4],[1,4],[0,4],[0,3],[0,2],[0,1],[0,0],[1,0],[2,0],[3,0],[4,0],[4,1]];
  var INNER = [[3,1],[2,1],[1,1],[1,2],[1,3],[2,3],[3,3],[3,2]];
  var PATH = OUTER.concat(INNER).concat([[2,2]]), END = PATH.length - 1, INNER_AT = 16;
  var SAFE = { '4,2': 1, '2,0': 1, '0,2': 1, '2,4': 1, '2,2': 1 };
  function rot(rc, k) { var r = rc[0], c = rc[1]; for (var i = 0; i < k; i++) { var t = r; r = c; c = 4 - t; } return [r, c]; }
  function cell(p, pos) { return rot(PATH[pos], p); }
  function key(rc) { return rc[0] + ',' + rc[1]; }
  function throwValue(open) { return open === 0 ? 8 : open; }

  /* rules engine (exposed for tests) */
  function legal(st, p, d) {
    var out = [], seen = {};
    st.tok[p].forEach(function (pos, k) {
      if (pos >= END) return; var np = pos + d;
      if (np > END) return;
      if (np >= INNER_AT && !st.cut[p]) return;
      if (seen[pos]) return; seen[pos] = 1;
      out.push({ k: k, from: pos, to: np });
    });
    return out;
  }
  function victims(st, p, to) {
    var rc = cell(p, to), v = [];
    if (SAFE[key(rc)]) return v;
    st.players.forEach(function (q) { if (q === p) return; st.tok[q].forEach(function (pos, k) { if (pos < END && key(cell(q, pos)) === key(rc)) v.push([q, k]); }); });
    return v;
  }
  DG.ashta = { legal: legal, victims: victims, cell: cell, throwValue: throwValue, END: END };

  DG.register('ashta', {
    mount: function (wrap, opts) {
      var mode = opts.mode === 'ai' ? 'ai' : 'pass', c = K.clock(), X = L();
      var root = K.el('div', 'dk', null, wrap);
      var st, human, turn, phase, moves, lastD, chip, svg, kau, btnT, hint;
      function nameOf(p) { X = L(); return mode === 'ai' ? (human[p] ? X.you : X.comp(X.colors[p])) : X.colors[p]; }

      function setup() {
        c.stop(); root.innerHTML = ''; X = L();
        var box = K.el('div', 'dk-setup', null, root);
        K.el('h3', null, '🐚 ' + X.pick, box);
        var o = K.el('div', 'ac-opts', null, box);
        [[2, [0, 2]], [3, [0, 1, 2]], [4, [0, 1, 2, 3]]].forEach(function (opt) {
          var b = K.el('button', null, '<span>' + (mode === 'ai' ? X.vs(opt[0] - 1) : X.np(opt[0])) + '</span><span>' + opt[1].map(function (p) { return '<i style="background:' + COL[p] + '"></i>'; }).join('') + '</span>', o);
          b.type = 'button'; b.onclick = function () { DG.sfx('tap'); start(opt[1]); };
        });
        K.el('p', 'dk-rules', null, box).textContent = X.rules;
      }
      function start(players) {
        st = { players: players.slice(), tok: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]], cut: [0,0,0,0] };
        human = {}; players.forEach(function (p, i) { human[p] = mode !== 'ai' || i === 0; });
        turn = 0; root.innerHTML = '';
        chip = K.el('div', 'dk-chip', null, root);
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 300 300'); svg.setAttribute('class', 'ac-board'); root.appendChild(svg);
        svg.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[data-k]'); if (t) choose(+t.getAttribute('data-k')); });
        kau = K.el('div', 'ac-kauri', null, root);
        btnT = K.el('button', 'dk-big', null, root); btnT.type = 'button'; btnT.onclick = function () { if (phase === 'throw' && human[cur()]) doThrow(); };
        hint = K.el('div', 'dk-hint', null, root);
        showKauri([1, 0, 1, 0]); begin();
      }
      function cur() { return st.players[turn]; }
      function begin() { phase = 'throw'; moves = []; render(); hint.textContent = human[cur()] ? '' : ''; if (!human[cur()]) c.later(doThrow, 700); }
      function next() { turn = (turn + 1) % st.players.length; begin(); }

      function render() {
        X = L(); var p = cur();
        chip.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:' + COL[p] + ';margin-right:6px"></span>' + K.esc(mode === 'ai' && human[p] ? X.youTurn : X.turn(nameOf(p)));
        btnT.textContent = X.throwB; btnT.disabled = !(phase === 'throw' && human[p]);
        var s = '', U = 60;
        for (var r = 0; r < 5; r++) for (var cc = 0; cc < 5; cc++) {
          var inner = r >= 1 && r <= 3 && cc >= 1 && cc <= 3, ctr = r === 2 && cc === 2;
          s += '<rect x="' + cc * U + '" y="' + r * U + '" width="' + U + '" height="' + U + '" fill="' + (ctr ? '#f5a524' : (inner ? '#e9d3a8' : '#f4e6c6')) + '" stroke="#8b5a2b" stroke-width="1.5"/>';
          if (SAFE[r + ',' + cc]) s += '<path d="M' + (cc * U + 10) + ' ' + (r * U + 10) + 'L' + (cc * U + 50) + ' ' + (r * U + 50) + 'M' + (cc * U + 50) + ' ' + (r * U + 10) + 'L' + (cc * U + 10) + ' ' + (r * U + 50) + '" stroke="#b4462b" stroke-width="2.5" opacity=".55"/>';
        }
        st.players.forEach(function (q) { var h = cell(q, 0); s += '<rect x="' + (h[1] * U + 3) + '" y="' + (h[0] * U + 3) + '" width="' + (U - 6) + '" height="' + (U - 6) + '" fill="none" stroke="' + COL[q] + '" stroke-width="3" rx="6"/>'; });
        // pieces, grouped per square
        var groups = {};
        st.players.forEach(function (q) { st.tok[q].forEach(function (pos, k) { var kk = key(cell(q, pos)); (groups[kk] = groups[kk] || []).push([q, k, pos]); }); });
        var movable = {}; if (phase === 'pick') moves.forEach(function (m) { movable[m.k] = 1; });
        Object.keys(groups).forEach(function (kk) {
          var g = groups[kk], rc = kk.split(',').map(Number), n = g.length, cols = Math.ceil(Math.sqrt(n));
          g.forEach(function (t, i) {
            var rr = n === 1 ? 16 : (n <= 4 ? 11 : 8), ox = n === 1 ? 0 : ((i % cols) - (cols - 1) / 2) * rr * 2.05, oy = n === 1 ? 0 : (Math.floor(i / cols) - (Math.ceil(n / cols) - 1) / 2) * rr * 2.05;
            var x = rc[1] * U + U / 2 + ox, y = rc[0] * U + U / 2 + oy, can = t[0] === p && movable[t[1]] && human[p];
            s += '<g' + (can ? ' class="ac-tok" data-k="' + t[1] + '"' : '') + '><circle cx="' + x + '" cy="' + y + '" r="' + rr + '" fill="' + COL[t[0]] + '" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>' +
              '<circle cx="' + (x - rr * .3) + '" cy="' + (y - rr * .3) + '" r="' + rr * .35 + '" fill="rgba(255,255,255,.45)"/>' +
              (can ? '<circle class="ac-ring" cx="' + x + '" cy="' + y + '" r="' + (rr + 4) + '"/><circle cx="' + x + '" cy="' + y + '" r="' + Math.max(rr + 6, 20) + '" fill="transparent"/>' : '') + '</g>';
          });
        });
        svg.innerHTML = s;
      }
      function showKauri(open) { kau.innerHTML = open.map(function (o) { return '<span class="ac-k ' + (o ? 'open' : 'closed') + '"></span>'; }).join(''); }

      function doThrow() {
        if (phase !== 'throw') return; phase = 'rolling'; render();
        var open = [0, 0, 0, 0].map(function () { return Math.random() < 0.5 ? 1 : 0; });
        if (DG.ashtaThrow && DG.ashtaThrow.length) open = DG.ashtaThrow.shift();   // test hook
        var n = open.reduce(function (a, b) { return a + b; }, 0), d = throwValue(n); lastD = d;
        kau.classList.remove('shake'); void kau.offsetWidth; kau.classList.add('shake'); DG.sfx('dice');
        c.later(function () {
          showKauri(open); var p = cur();
          hint.textContent = d === 8 ? X.ashta : (d === 4 ? X.chamma : '');
          if (d === 8 || d === 4) DG.sfx('bonus');
          moves = legal(st, p, d);
          if (!moves.length) {
            var blocked = st.tok[p].some(function (pos) { return pos < INNER_AT && pos + d >= INNER_AT && pos + d <= END && !st.cut[p]; });
            hint.textContent = (hint.textContent ? hint.textContent + ' · ' : '') + (blocked ? X.needCut : X.noMove);
            return c.later(function () { if (d === 4 || d === 8) { phase = 'throw'; render(); if (!human[p]) c.later(doThrow, 600); } else next(); }, 1200);
          }
          if (!human[p]) { phase = 'anim'; return c.later(function () { move(aiPick(p, moves)); }, 600); }
          if (moves.length === 1) { phase = 'anim'; return c.later(function () { move(moves[0]); }, 350); }
          phase = 'pick'; render(); if (!hint.textContent) hint.textContent = X.pickTok;
        }, 420);
      }
      function choose(k) { if (phase !== 'pick') return; var m = moves.filter(function (x) { return x.k === k; })[0]; if (m) { phase = 'anim'; move(m); } }
      function aiPick(p, ms) {
        var best = ms[0], bs = -1e9;
        ms.forEach(function (m) {
          var s = m.to * 2, v = victims(st, p, m.to).length, safe = SAFE[key(cell(p, m.to))];
          if (v) s += 100 * v; if (m.to === END) s += 80; if (safe) s += 25;
          if (SAFE[key(cell(p, m.from))] && m.from > 0) s -= 10;
          s += Math.random() * 4; if (s > bs) { bs = s; best = m; }
        });
        return best;
      }
      function move(m) {
        var p = cur(), pos = m.from;
        (function walk() {
          if (pos >= m.to) return settle(p, m);
          pos++; st.tok[p][m.k] = pos; DG.sfx('step'); render();
          c.later(walk, 150);
        })();
      }
      function settle(p, m) {
        var v = victims(st, p, m.to);
        v.forEach(function (t) { st.tok[t[0]][t[1]] = 0; });
        if (v.length) { st.cut[p] = 1; DG.sfx('capture'); DG.buzz(60); hint.textContent = X.cut; }
        else if (m.to === END) { DG.sfx('home'); hint.textContent = X.home; }
        render();
        if (st.tok[p].every(function (x) { return x >= END; })) return c.later(function () { finish(p); }, 700);
        var again = lastD === 4 || lastD === 8 || v.length > 0;
        c.later(function () { if (again) { phase = 'throw'; render(); if (!human[p]) c.later(doThrow, 600); } else { hint.textContent = ''; next(); } }, 600);
      }
      function finish(p) {
        c.stop(); var players = st.players.slice();
        var w = mode === 'ai' ? (human[p] ? 0 : 1) : 0;
        K.result(root, { mode: mode, winner: w, txt: mode === 'ai' && human[p] ? DG.t().youWin : DG.t().wins(nameOf(p)), em: mode === 'ai' && !human[p] ? '🤖' : '🏆',
          again: function () { start(players); }, extra: [[L().pick.replace('?', ''), setup]], onExit: opts.onExit });
      }

      setup();
      return { destroy: function () { c.kill(); wrap.innerHTML = ''; }, _state: function () { return { st: st, phase: phase, turn: turn }; } };
    }
  });
})();

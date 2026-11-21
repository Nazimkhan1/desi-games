/* Desi Games shell: lobby, i18n, game launcher. Offline modes work with no backend. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var set = function (id, v) { var e = $(id); if (e) e.textContent = v; };

  var CUR = null, roomMode = 'create', activeGame = null;

  /* ---------- lobby render ---------- */
  function renderGrid() {
    var t = DG.t(), grid = $('grid'); grid.innerHTML = '';
    DG.GAMES.forEach(function (g) {
      var b = document.createElement('button'); b.className = 'tile' + (g.play ? '' : ' soon');
      b.style.setProperty('--c1', g.c1); b.style.setProperty('--c2', g.c2);
      var sub = (DG.lang === 'en') ? '' : g.n.en;
      b.innerHTML =
        (g.hot ? '<span class="badge">' + t.trending + '</span>' : '') +
        '<span class="emoji">' + g.ic + '</span>' +
        (g.play ? '' : '<span class="soon-tag">' + t.soon + ' 🔜</span>') +
        '<div class="t-hi">' + DG.gname(g) + '</div>' +
        '<div class="t-en">' + sub + '</div>' +
        '<div class="players">' + t.players(g.p) + '</div>';
      b.onclick = function () { openSheet(g); };
      grid.appendChild(b);
    });
  }

  function buildLangMenu() {
    var m = $('langMenu'); m.innerHTML = '';
    DG.ORDER.forEach(function (code) {
      var btn = document.createElement('button'); if (code === DG.lang) btn.className = 'on';
      btn.innerHTML = '<span>' + DG.L[code].langName + '</span>' + (code === DG.lang ? '<span>✓</span>' : '');
      btn.onclick = function () { DG.setLang(code); m.classList.remove('show'); applyLang(); };
      m.appendChild(btn);
    });
  }

  function applyLang() {
    var t = DG.t();
    set('langLbl', t.langName); set('lvl', t.level); set('liveTxt', t.online('2,418'));
    set('heroTitle', t.heroTitle); set('heroSub', t.heroSub); set('btnCreate', t.create); set('btnJoin', t.join);
    set('secTitle', t.allGames); set('secAll', t.all); set('note', t.note);
    set('mOnlineT', t.online_t); set('mOnlineS', t.online_s); set('mPassT', t.pass_t); set('mPassS', t.pass_s); set('mAiT', t.ai_t); set('mAiS', t.ai_s);
    set('rCodeLbl', t.codeLbl); set('rYou', t.you); set('rWait', t.waiting); set('rWa', t.wa); set('rCopy', t.copy);
    document.querySelectorAll('.nav .nb').forEach(function (b) {
      var map = { home: t.navHome, friends: t.navFriends, rank: t.navRank, me: t.navMe };
      b.querySelector('.nt').textContent = map[b.dataset.nav];
    });
    renderGrid(); buildLangMenu();
    if (CUR) { set('sHi', DG.gname(CUR)); set('sEn', CUR.n.en); set('rGame', DG.gname(CUR)); }
    set('rTitle', roomMode === 'join' ? t.roomJoin : t.roomCreated);
    set('rSub', roomMode === 'join' ? t.enterCode : t.sendCode);
    document.documentElement.lang = (DG.lang === 'bn' ? 'bn' : (DG.lang === 'en' ? 'en' : 'hi'));
  }

  /* ---------- mode sheet ---------- */
  function openSheet(g) {
    CUR = g; var ic = $('sIc'); ic.textContent = g.ic; ic.style.setProperty('--c1', g.c1); ic.style.setProperty('--c2', g.c2);
    set('sHi', DG.gname(g)); set('sEn', g.n.en);
    $('scrim').classList.add('show'); $('sheet').classList.add('show');
  }
  function closeSheet() { $('scrim').classList.remove('show'); $('sheet').classList.remove('show'); }

  /* ---------- room (online preview; real sync = Phase 2 / Firebase) ---------- */
  function randCode() { var s = ''; for (var i = 0; i < 4; i++) s += Math.floor(Math.random() * 10); return s; }
  function openRoom(g, mode) {
    closeSheet(); roomMode = mode; var game = g || CUR || DG.GAMES[0]; CUR = game;
    set('rIc', game.ic); set('rGame', DG.gname(game));
    var code = randCode(); var cEl = $('rCode'); cEl.textContent = code.split('').join(' '); cEl.dataset.raw = code;
    var t = DG.t();
    set('rTitle', mode === 'join' ? t.roomJoin : t.roomCreated);
    set('rSub', mode === 'join' ? t.enterCode : t.sendCode);
    $('room').classList.add('show');
    toast(t.tOnlineSoon);
  }
  function closeRoom() { $('room').classList.remove('show'); }

  /* ---------- game launcher ---------- */
  function launchGame(game, mode) {
    closeSheet();
    var factory = DG.getGame(game.id);
    if (!factory) { toast(DG.t().tGameSoon); return; }
    CUR = game;
    var t = DG.t();
    set('gameTitle', DG.gname(game));
    set('gameMode', mode === 'pass' ? t.pass_t.split('—')[1].trim() : t.ai_t.split('—')[1].trim());
    var wrap = $('gameWrap'); wrap.innerHTML = '';
    activeGame = factory.mount(wrap, { mode: mode, game: game, onExit: exitGame });
    $('gameRoot').classList.add('show');
  }
  function exitGame() {
    if (activeGame && activeGame.destroy) activeGame.destroy();
    activeGame = null; $('gameRoot').classList.remove('show'); $('gameWrap').innerHTML = '';
  }

  /* ---------- share / copy ---------- */
  function copyText(txt, ok) {
    try { navigator.clipboard.writeText(txt).then(function () { toast(ok); }, function () { fb(txt, ok); }); }
    catch (e) { fb(txt, ok); }
  }
  function fb(txt, ok) {
    var ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast(ok); } catch (e) { toast($('rCode').dataset.raw || ''); }
    document.body.removeChild(ta);
  }

  /* ---------- toast ---------- */
  var toEl = $('toast'), toT;
  function toast(m) { toEl.textContent = m; toEl.classList.add('show'); clearTimeout(toT); toT = setTimeout(function () { toEl.classList.remove('show'); }, 2200); }

  /* ---------- wire up ---------- */
  $('langBtn').onclick = function (e) { e.stopPropagation(); $('langMenu').classList.toggle('show'); };
  document.addEventListener('click', function () { $('langMenu').classList.remove('show'); });
  $('btnCreate').onclick = function () { openRoom(null, 'create'); };
  $('btnJoin').onclick = function () { openRoom(null, 'join'); };
  $('navPlay').onclick = function () { openRoom(null, 'create'); };
  $('secAll').onclick = function () { toast(DG.t().tListSoon); };
  $('scrim').onclick = closeSheet;
  $('mOnline').onclick = function () { openRoom(CUR, 'create'); };
  $('mPass').onclick = function () { launchGame(CUR, 'pass'); };
  $('mAi').onclick = function () { launchGame(CUR, 'ai'); };
  $('roomBack').onclick = closeRoom;
  $('rWa').onclick = function () { copyText(DG.t().invite(DG.gname(CUR || DG.GAMES[0]), $('rCode').dataset.raw || '7429'), DG.t().tInvite); };
  $('rCopy').onclick = function () { copyText($('rCode').dataset.raw || '', DG.t().tCopied); };
  $('gameBack').onclick = exitGame;
  document.querySelectorAll('.nav .nb').forEach(function (b) {
    b.onclick = function () {
      document.querySelectorAll('.nav .nb').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      if (b.dataset.nav !== 'home') toast(DG.t().tSoon(DG.t().navSoon[b.dataset.nav]));
    };
  });

  applyLang();

  if ('serviceWorker' in navigator) { try { navigator.serviceWorker.register('sw.js'); } catch (e) {} }
})();

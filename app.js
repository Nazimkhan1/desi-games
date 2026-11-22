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
        '<div class="t-top">' +
          '<span class="t-icon"><span class="t-emoji">' + g.ic + '</span></span>' +
          (g.hot ? '<span class="t-flame">🔥</span>' : '') +
        '</div>' +
        '<div class="t-name">' + DG.gname(g) + '</div>' +
        '<div class="t-sub">' + sub + '</div>' +
        '<div class="t-foot">' + (g.play ? t.players(g.p) : '<span class="t-soon">' + t.soon + '</span>') + '</div>';
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
    set('brandName', t.brand); set('langLbl', t.langName); set('lvl', t.level); set('liveTxt', t.online('2,418'));
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

  /* ---------- online room (room-code multiplayer; local transport now, Firebase later) ---------- */
  var NETT = {
    hi:{ join:'जुड़ो', nf:'❌ यह रूम नहीं मिला', wait:'दोस्त का इंतज़ार…', paste:'4 अंक का कोड डालो', joined:'जुड़ गया ✓' },
    en:{ join:'Join', nf:'❌ Room not found', wait:'Waiting for friend…', paste:'Enter the 4-digit code', joined:'Joined ✓' },
    hinglish:{ join:'Judo', nf:'❌ Yeh room nahi mila', wait:'Dost ka intezaar…', paste:'4 digit ka code daalo', joined:'Jud gaya ✓' },
    bn:{ join:'যোগ দাও', nf:'❌ রুম পাওয়া যায়নি', wait:'বন্ধুর অপেক্ষা…', paste:'৪ সংখ্যার কোড দাও', joined:'যোগ হয়েছে ✓' }
  };
  function nt() { return NETT[DG.lang] || NETT.en; }
  var room = null, roomGame = null;
  function gameById(id) { for (var i = 0; i < DG.GAMES.length; i++) if (DG.GAMES[i].id === id) return DG.GAMES[i]; return DG.GAMES[0]; }
  function onlineGame() { for (var i = 0; i < DG.GAMES.length; i++) if (DG.GAMES[i].online) return DG.GAMES[i]; return DG.GAMES[0]; }
  function showRoom() { $('room').classList.add('show'); }
  function closeRoom() { $('room').classList.remove('show'); if (room) { try { room.close(); } catch (e) {} room = null; } }

  function startCreate(g) {
    closeSheet();
    var game = (g && g.online) ? g : onlineGame();
    CUR = game; roomMode = 'create'; roomGame = game;
    var t = DG.t();
    set('rIc', game.ic); set('rGame', DG.gname(game));
    set('rTitle', t.roomCreated); set('rSub', t.sendCode); set('rWait', nt().wait);
    $('codeBox').classList.remove('hide'); $('rPlayers').classList.remove('hide'); $('rShareBtns').classList.remove('hide'); $('joinBox').classList.remove('show');
    var gs = $('rGuest'); gs.classList.add('wait'); gs.querySelector('.pa').textContent = '?';
    room = DG.net.create(game.id);
    var cEl = $('rCode'); cEl.textContent = room.code.split('').join(' '); cEl.dataset.raw = room.code;
    var started = false;
    room.on('hello', function () {
      room.send('start', { game: roomGame.id });
      if (started) return; started = true;
      var g2 = $('rGuest'); g2.classList.remove('wait'); g2.querySelector('.pa').textContent = '🧑🏻'; g2.querySelector('span').textContent = nt().joined;
      setTimeout(function () { launchOnline(roomGame, 'host', room); }, 550);
    });
    showRoom();
  }

  function startJoin() {
    closeSheet(); roomMode = 'join';
    var t = DG.t();
    set('rIc', '🔑'); set('rGame', t.roomJoin); set('rTitle', t.roomJoin); set('rSub', t.enterCode);
    $('codeBox').classList.add('hide'); $('rPlayers').classList.add('hide'); $('rShareBtns').classList.add('hide'); $('joinBox').classList.add('show');
    $('rJoinBtn').textContent = nt().join; $('rJoinInput').value = '';
    showRoom();
    setTimeout(function () { try { $('rJoinInput').focus(); } catch (e) {} }, 300);
  }

  function doJoin() {
    var code = ($('rJoinInput').value || '').replace(/\D/g, '').slice(0, 4);
    if (code.length < 4) { toast(nt().paste); return; }
    $('rJoinBtn').disabled = true;
    Promise.resolve(DG.net.join(code)).then(function (r) {
      $('rJoinBtn').disabled = false;
      if (!r) { toast(nt().nf); return; }
      room = r;
      var launched = false;
      r.on('start', function (m) {
        if (launched) return; launched = true;
        var g = (r.gameId && gameById(r.gameId)) || gameById(m && m.game) || onlineGame();
        roomGame = g; launchOnline(g, 'guest', r);
      });
      r.send('hello', {});
      setTimeout(function () { if (!launched && $('room').classList.contains('show')) { toast(nt().nf); closeRoom(); } }, 6000);
    }, function () { $('rJoinBtn').disabled = false; toast(nt().nf); });
  }

  function launchOnline(game, role, net) {
    $('room').classList.remove('show');
    CUR = game;
    var t = DG.t(), mp = t.online_t.split('—');
    set('gameTitle', DG.gname(game)); set('gameMode', mp[1] ? mp[1].trim() : 'Online');
    var factory = DG.getGame(game.id);
    var wrap = $('gameWrap'); wrap.innerHTML = '';
    activeGame = factory.mount(wrap, { mode: 'online', game: game, net: net, role: role, onExit: exitOnline });
    $('gameRoot').classList.add('show');
  }
  function exitOnline() { if (room) { try { room.close(); } catch (e) {} room = null; } exitGame(); }

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
  $('btnCreate').onclick = function () { startCreate(null); };
  $('btnJoin').onclick = function () { startJoin(); };
  $('navPlay').onclick = function () { startCreate(null); };
  $('secAll').onclick = function () { toast(DG.t().tListSoon); };
  $('scrim').onclick = closeSheet;
  $('mOnline').onclick = function () { if (CUR && CUR.online) startCreate(CUR); else toast(DG.t().tOnlineSoon); };
  $('mPass').onclick = function () { launchGame(CUR, 'pass'); };
  $('mAi').onclick = function () { launchGame(CUR, 'ai'); };
  $('roomBack').onclick = closeRoom;
  $('rJoinBtn').onclick = function () { doJoin(); };
  $('rJoinInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') doJoin(); });
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

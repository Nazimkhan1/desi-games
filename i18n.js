/* Shared state: games catalogue + 4-language strings. window.DG namespace. */
window.DG = (function () {
  var GAMES = [
    { id:'kattam',ic:'⭕', c1:'#19d7c9', c2:'#0e8f8e', p:'2', play:1, hot:1, n:{hi:'कट्टम-कट्टी',en:'Tic-Tac-Toe',hinglish:'Kattam-Katti',bn:'কাটাকুটি'} },
    { id:'saanp', ic:'🐍', c1:'#36d26a', c2:'#0e8f6e', p:'2', play:1, hot:1, n:{hi:'साँप-सीढ़ी',en:'Snakes & Ladders',hinglish:'Saanp-Seedhi',bn:'সাপ-সিঁড়ি'} },
    { id:'ludo',  ic:'🎲', c1:'#ff3d6e', c2:'#5b5cff', p:'2-4', hot:1, n:{hi:'लूडो',en:'Ludo',hinglish:'Ludo',bn:'লুডো'} },
    { id:'bagh',  ic:'🐯', c1:'#ff9a1e', c2:'#e5531b', p:'2',        n:{hi:'बाघ-बकरी',en:'Goats & Tigers',hinglish:'Bagh-Bakri',bn:'বাঘ-ছাগল'} },
    { id:'nau',   ic:'⚫', c1:'#9a6bff', c2:'#5b3fd6', p:'2',        n:{hi:'नौ-गोटी',en:'Nine Men’s Morris',hinglish:'Nau-Goti',bn:'নয়-গুটি'} },
    { id:'carrom',ic:'🎯', c1:'#ffcf4d', c2:'#c0841b', p:'2-4',      n:{hi:'कैरम',en:'Carrom',hinglish:'Carrom',bn:'ক্যারম'} },
    { id:'patang',ic:'🪁', c1:'#45b1ff', c2:'#2f6fd6', p:'1-2',      n:{hi:'पतंग काटो',en:'Kite Fight',hinglish:'Patang Kaato',bn:'ঘুড়ি কাটাকাটি'} },
    { id:'chor',  ic:'👮', c1:'#ff5ea0', c2:'#df1d6e', p:'4',        n:{hi:'चोर-सिपाही',en:'Cops & Robbers',hinglish:'Chor-Sipahi',bn:'চোর-পুলিশ'} },
    { id:'kanche',ic:'🔵', c1:'#19d7c9', c2:'#1a8fd6', p:'1-2',      n:{hi:'कंचे',en:'Marbles',hinglish:'Kanche',bn:'মার্বেল'} },
    { id:'gilli', ic:'🏏', c1:'#9be34a', c2:'#4e9e2d', p:'1-2',      n:{hi:'गिल्ली-डंडा',en:'Gilli Danda',hinglish:'Gilli-Danda',bn:'গিল্লি-ডান্ডা'} }
  ];

  var L = {
    hi:{ langName:'हिंदी', level:'लेवल 7', online:function(n){return n+' online अभी';}, players:function(p){return '👥 '+p+' खिलाड़ी';}, trending:'🔥 Trending', soon:'जल्द',
      heroTitle:'दोस्तों के साथ खेलो! 👑', heroSub:'रूम बनाओ, कोड भेजो — साथ में मज़ा दुगना।', create:'➕ रूम बनाओ', join:'🔑 कोड डालो',
      allGames:'🔥 सारे खेल', all:'सभी', note:'बचपन वाले सारे देसी खेल — एक ही app में 🎪\nFree · बिना login · online भी, offline भी',
      navHome:'होम', navFriends:'दोस्त', navRank:'रैंक', navMe:'मैं',
      online_t:'दोस्त के साथ — Online', online_s:'रूम कोड शेयर करके साथ खेलो', pass_t:'Pass & Play — Offline', pass_s:'एक ही फ़ोन पे बारी-बारी', ai_t:'अकेले — vs Computer', ai_s:'प्रैक्टिस करो कभी भी',
      roomCreated:'रूम बन गया', roomJoin:'कोड से जुड़ो', codeLbl:'रूम कोड', sendCode:'दोस्त को यह कोड भेजो 👇', enterCode:'दोस्त का कोड डालो, या नीचे से share करो 👇', you:'तुम', waiting:'इंतज़ार…', wa:'💬 WhatsApp पे भेजो', copy:'📋 कोड कॉपी करो',
      tCopied:'कोड कॉपी हो गया ✓', tInvite:'न्योता कॉपी — WhatsApp पे paste करो 💬', tSoon:function(x){return x+' — जल्द आ रहा है';}, tListSoon:'पूरी लिस्ट जल्द!', tGameSoon:'यह खेल जल्द आ रहा है 🔜', tOnlineSoon:'Online जल्द — अभी Pass & Play या Computer से खेलो 🙂',
      navSoon:{friends:'👥 दोस्त',rank:'🏆 रैंकिंग',me:'🙂 प्रोफाइल'}, invite:function(g,c){return 'आओ '+g+' खेलें! 🎮 Desi Games में कोड डालो: '+c+'\n👉 nextgrade.in/games';},
      p1:'खिलाड़ी 1', p2:'खिलाड़ी 2', computer:'कंप्यूटर', yourTurn:function(m){return 'तुम्हारी बारी ('+m+')';}, turnOf:function(n,m){return n+' की बारी ('+m+')';}, aiThinking:'कंप्यूटर सोच रहा…', wins:function(n){return '🎉 '+n+' जीता!';}, youWin:'🎉 तुम जीत गए!', youLose:'😅 कंप्यूटर जीता', drawRes:'🤝 बराबरी!', rematch:'↻ फिर से', exitGame:'बाहर', tapCell:'खाली जगह पर टैप करो', roll:'🎲 डालो', rolled:function(n){return '🎲 '+n;} },
    en:{ langName:'English', level:'Level 7', online:function(n){return n+' online now';}, players:function(p){return '👥 '+p+' players';}, trending:'🔥 Trending', soon:'Soon',
      heroTitle:'Play with Friends! 👑', heroSub:'Create a room, share the code — double the fun.', create:'➕ Create Room', join:'🔑 Enter Code',
      allGames:'🔥 All Games', all:'See all', note:'All your favourite desi games — in one app 🎪\nFree · no login · online & offline',
      navHome:'Home', navFriends:'Friends', navRank:'Rank', navMe:'Me',
      online_t:'With Friends — Online', online_s:'Share a room code and play together', pass_t:'Pass & Play — Offline', pass_s:'Same phone, take turns', ai_t:'Solo — vs Computer', ai_s:'Practice anytime',
      roomCreated:'Room created', roomJoin:'Join with code', codeLbl:'Room Code', sendCode:'Send this code to your friend 👇', enterCode:"Enter your friend's code, or share below 👇", you:'You', waiting:'Waiting…', wa:'💬 Send on WhatsApp', copy:'📋 Copy code',
      tCopied:'Code copied ✓', tInvite:'Invite copied — paste on WhatsApp 💬', tSoon:function(x){return x+' — coming soon';}, tListSoon:'Full list coming soon!', tGameSoon:'This game is coming soon 🔜', tOnlineSoon:'Online coming soon — try Pass & Play or Computer 🙂',
      navSoon:{friends:'👥 Friends',rank:'🏆 Ranking',me:'🙂 Profile'}, invite:function(g,c){return "Let's play "+g+'! 🎮 Open Desi Games, enter code: '+c+'\n👉 nextgrade.in/games';},
      p1:'Player 1', p2:'Player 2', computer:'Computer', yourTurn:function(m){return 'Your turn ('+m+')';}, turnOf:function(n,m){return n+"'s turn ("+m+')';}, aiThinking:'Computer thinking…', wins:function(n){return '🎉 '+n+' wins!';}, youWin:'🎉 You win!', youLose:'😅 Computer wins', drawRes:'🤝 It’s a draw!', rematch:'↻ Rematch', exitGame:'Exit', tapCell:'Tap an empty cell', roll:'🎲 Roll', rolled:function(n){return '🎲 '+n;} },
    hinglish:{ langName:'Hinglish', level:'Level 7', online:function(n){return n+' online abhi';}, players:function(p){return '👥 '+p+' khiladi';}, trending:'🔥 Trending', soon:'Soon',
      heroTitle:'Doston ke saath khelo! 👑', heroSub:'Room banao, code bhejo — maza double.', create:'➕ Room Banao', join:'🔑 Code Daalo',
      allGames:'🔥 Saare Khel', all:'Sabhi', note:'Bachpan wale saare desi khel — ek hi app mein 🎪\nFree · bina login · online bhi, offline bhi',
      navHome:'Home', navFriends:'Dost', navRank:'Rank', navMe:'Main',
      online_t:'Dost ke saath — Online', online_s:'Room code share karke saath khelo', pass_t:'Pass & Play — Offline', pass_s:'Ek hi phone pe baari-baari', ai_t:'Akele — vs Computer', ai_s:'Practice karo kabhi bhi',
      roomCreated:'Room ban gaya', roomJoin:'Code se judo', codeLbl:'Room Code', sendCode:'Dost ko yeh code bhejo 👇', enterCode:'Dost ka code daalo, ya niche se share karo 👇', you:'Tum', waiting:'Intezaar…', wa:'💬 WhatsApp pe bhejo', copy:'📋 Code copy karo',
      tCopied:'Code copy ho gaya ✓', tInvite:'Nyota copy — WhatsApp pe paste karo 💬', tSoon:function(x){return x+' — jald aa raha hai';}, tListSoon:'Puri list jald!', tGameSoon:'Yeh khel jald aa raha hai 🔜', tOnlineSoon:'Online jald — abhi Pass & Play ya Computer se khelo 🙂',
      navSoon:{friends:'👥 Dost',rank:'🏆 Ranking',me:'🙂 Profile'}, invite:function(g,c){return 'Aao '+g+' khelein! 🎮 Desi Games mein code daalo: '+c+'\n👉 nextgrade.in/games';},
      p1:'Khiladi 1', p2:'Khiladi 2', computer:'Computer', yourTurn:function(m){return 'Teri baari ('+m+')';}, turnOf:function(n,m){return n+' ki baari ('+m+')';}, aiThinking:'Computer soch raha…', wins:function(n){return '🎉 '+n+' jeeta!';}, youWin:'🎉 Tum jeet gaye!', youLose:'😅 Computer jeeta', drawRes:'🤝 Barabari!', rematch:'↻ Phir se', exitGame:'Bahar', tapCell:'Khali jagah par tap karo', roll:'🎲 Daalo', rolled:function(n){return '🎲 '+n;} },
    bn:{ langName:'বাংলা', level:'লেভেল ৭', online:function(n){return n+' online এখন';}, players:function(p){return '👥 '+p+' জন';}, trending:'🔥 Trending', soon:'শীঘ্রই',
      heroTitle:'বন্ধুদের সাথে খেলো! 👑', heroSub:'রুম বানাও, কোড পাঠাও — মজা দ্বিগুণ।', create:'➕ রুম বানাও', join:'🔑 কোড দাও',
      allGames:'🔥 সব খেলা', all:'সব', note:'ছোটবেলার সব দেশি খেলা — এক অ্যাপে 🎪\nFree · login ছাড়া · online ও offline',
      navHome:'হোম', navFriends:'বন্ধু', navRank:'র‍্যাঙ্ক', navMe:'আমি',
      online_t:'বন্ধুর সাথে — Online', online_s:'রুম কোড শেয়ার করে একসাথে খেলো', pass_t:'Pass & Play — Offline', pass_s:'একই ফোনে পালা করে', ai_t:'একা — vs Computer', ai_s:'যেকোনো সময় practice করো',
      roomCreated:'রুম তৈরি', roomJoin:'কোড দিয়ে যোগ দাও', codeLbl:'রুম কোড', sendCode:'বন্ধুকে এই কোড পাঠাও 👇', enterCode:'বন্ধুর কোড দাও, বা নিচে থেকে share করো 👇', you:'তুমি', waiting:'অপেক্ষা…', wa:'💬 WhatsApp-এ পাঠাও', copy:'📋 কোড কপি করো',
      tCopied:'কোড কপি হয়েছে ✓', tInvite:'নিমন্ত্রণ কপি — WhatsApp-এ paste করো 💬', tSoon:function(x){return x+' — শীঘ্রই আসছে';}, tListSoon:'পুরো তালিকা শীঘ্রই!', tGameSoon:'এই খেলা শীঘ্রই আসছে 🔜', tOnlineSoon:'Online শীঘ্রই — এখন Pass & Play বা Computer-এ খেলো 🙂',
      navSoon:{friends:'👥 বন্ধু',rank:'🏆 র‍্যাঙ্কিং',me:'🙂 প্রোফাইল'}, invite:function(g,c){return 'চলো '+g+' খেলি! 🎮 Desi Games-এ কোড দাও: '+c+'\n👉 nextgrade.in/games';},
      p1:'খেলোয়াড় ১', p2:'খেলোয়াড় ২', computer:'কম্পিউটার', yourTurn:function(m){return 'তোমার পালা ('+m+')';}, turnOf:function(n,m){return n+'-এর পালা ('+m+')';}, aiThinking:'কম্পিউটার ভাবছে…', wins:function(n){return '🎉 '+n+' জিতেছে!';}, youWin:'🎉 তুমি জিতেছ!', youLose:'😅 কম্পিউটার জিতেছে', drawRes:'🤝 ড্র!', rematch:'↻ আবার', exitGame:'বাইরে', tapCell:'খালি ঘরে ট্যাপ করো', roll:'🎲 দাও', rolled:function(n){return '🎲 '+n;} }
  };

  var ORDER = ['hi','en','bn','hinglish'];
  var state = { lang:'hi', games:{} };
  try{ var s=localStorage.getItem('dg_lang'); if(s && L[s]) state.lang=s; }catch(e){}

  return {
    GAMES:GAMES, L:L, ORDER:ORDER,
    get lang(){ return state.lang; },
    setLang:function(c){ state.lang=c; try{localStorage.setItem('dg_lang',c);}catch(e){} },
    t:function(){ return L[state.lang]; },
    gname:function(g){ return g.n[state.lang] || g.n.en; },
    register:function(id,factory){ state.games[id]=factory; },
    getGame:function(id){ return state.games[id]; }
  };
})();

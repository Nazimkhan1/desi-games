/* Desi Games — Dost (friends), Rank, Main (profile) tabs + local stats.
   Everything is stored on this phone only (localStorage 'dg-stats'); no login, no server.
   app.js calls DG.stats.record(gameId, mode, kind, opponent) from DG.result, and
   DG.pages.show(tab, api) to draw a tab. */
(function () {
  window.DG = window.DG || {};
  var KEY = 'dg-stats';

  /* ---------- text (4 languages) ---------- */
  var TX = {
    hi: {
      live: function (n) { return n + ' खेल · free · बिना login'; },
      player: 'खिलाड़ी', level: 'लेवल', xp: 'XP', coins: 'सिक्के',
      // friends
      fTitle: 'दोस्तों के साथ', fSub: 'रूम बनाओ, कोड भेजो — दोस्त अपने फ़ोन से जुड़ जाएगा।',
      fCreate: '🎮 रूम बनाओ', fJoin: '🔑 कोड से जुड़ो', fOnlineGames: '🌐 Online वाले खेल', fPick: 'खेल चुनो, रूम बन जाएगा',
      fInviteT: '📲 दोस्तों को बुलाओ', fInviteS: 'Desi Games का लिंक WhatsApp पर भेजो', fInviteBtn: 'WhatsApp पर भेजो',
      fInviteMsg: 'बचपन वाले देसी खेल — कट्टम-कट्टी, साँप-सीढ़ी, लूडो, क्रिकेट… दोस्तों के साथ online खेलो, free 🎮\n👉 https://desi-games.nextgrade.in',
      fRecent: '🕘 जिनके साथ खेले', fNone: 'अभी तक कोई online खेल नहीं। ऊपर से रूम बनाओ और दोस्त को कोड भेजो!',
      fAgain: 'फिर खेलो', fRecord: function (w, l, d) { return 'तुम ' + w + ' · वो ' + l + (d ? ' · बराबर ' + d : ''); },
      // rank
      rTitle: 'मेरी रैंक', rNext: function (n, t) { return 'अगली रैंक "' + t + '" — लेवल ' + n + ' पर'; }, rTop: 'सबसे ऊँची रैंक मिल गई! 👑',
      rBest: '🏅 मेरे खेल', rBestS: 'Computer और online दोस्तों से जीत-हार', rW: 'जीत', rL: 'हार', rD: 'बराबर', rP: 'खेले',
      rNoGames: 'अभी कोई खेल नहीं खेला। कोई भी खेल चुनो — हर खेल से XP मिलेगा!',
      rBadges: '🎖️ तमगे', rGot: function (a, b) { return a + '/' + b + ' मिले'; },
      rHow: 'XP कैसे मिलता है', rHowS: 'जीत +30 · बराबर +15 · हार भी +10 · एक फ़ोन पर दोस्त के साथ +12 · रोज़ पहला खेल +20 सिक्के',
      rNote: 'बिना login रिकॉर्ड इसी फ़ोन में रहता है; Gmail login पर cloud में भी।',
      // me
      mName: 'तुम्हारा नाम', mNamePh: 'नाम लिखो', mSaved: 'नाम सेव हो गया ✓', mAvatar: '🙂 अपना चेहरा चुनो', mBuy: function (c) { return '🪙 ' + c; },
      mBought: 'मिल गया! ✓', mNoCoins: function (c) { return 'और ' + c + ' सिक्के चाहिए — खेलते रहो!'; },
      mStats: '📊 मेरा हिसाब', sPlayed: 'खेले', sWins: 'जीत', sRate: 'जीत %', sStreak: 'दिन लगातार', sBest: 'सबसे लंबी लगातार', sFav: 'पसंदीदा खेल', sKinds: 'अलग-अलग खेल',
      mSettings: '⚙️ सेटिंग', mLang: 'भाषा', mSound: 'आवाज़', on: 'चालू', off: 'बंद',
      mReset: 'रिकॉर्ड मिटाओ', mResetQ: 'पक्का? सारे XP, सिक्के, तमगे और रिकॉर्ड मिट जाएँगे।', mResetDone: 'रिकॉर्ड मिट गया',
      aT: '☁️ रिकॉर्ड हमेशा के लिए बचाओ', aS: 'Gmail से login करो — XP, सिक्के, तमगे सब तुम्हारे Google account में सेव रहेंगे। फ़ोन बदलो या app हटाओ, login करते ही सब वापस। Login ज़रूरी नहीं है।', aBtn: 'Google से login करो', aIn: '✅ Google से जुड़े हो', aSync: 'रिकॉर्ड cloud में सेव है ☁️', aOut: 'Logout', aOutQ: 'Logout करें? तुम्हारा रिकॉर्ड Google account में सुरक्षित रहेगा, दोबारा login करते ही वापस मिलेगा।', aDone: 'Login हो गया ✓ रिकॉर्ड सेव', aBye: 'Logout हो गया', aErr: 'Login नहीं हुआ — फिर से कोशिश करो', aOff: 'Login के लिए internet चाहिए', aNo: 'Google login अभी चालू नहीं है', lbT: '🌍 सबकी रैंक', lbS: 'Top 50 · XP के हिसाब से', lbLoad: 'लोड हो रहा है…', lbEmpty: 'अभी कोई नहीं — पहले बनो!', lbJoin: 'सबकी रैंक में अपना नाम लाने के लिए Gmail से login करो (ज़रूरी नहीं)।', lbYou: '(तुम)', lbFail: 'अभी लोड नहीं हुआ — internet देखो',
      mPrivacy: '🔒 तुम्हारा रिकॉर्ड इसी फ़ोन में रहता है, कहीं नहीं जाता। Online खेल में सिर्फ़ तुम्हारा नाम और चेहरा उस दोस्त को दिखता है जिसके साथ खेल रहे हो। Gmail से login करोगे तो रिकॉर्ड Firebase (Google) पर तुम्हारे account में सेव होगा; सबकी रैंक में सिर्फ़ app वाला नाम और चेहरा दिखता है, Gmail पता कभी नहीं।',
      dash: '—'
    },
    en: {
      live: function (n) { return n + ' games · free · no login'; },
      player: 'Player', level: 'Level', xp: 'XP', coins: 'Coins',
      fTitle: 'Play with friends', fSub: 'Make a room, send the code — your friend joins from their own phone.',
      fCreate: '🎮 Make a room', fJoin: '🔑 Join with code', fOnlineGames: '🌐 Online games', fPick: 'Pick a game to make a room',
      fInviteT: '📲 Invite friends', fInviteS: 'Send the Desi Games link on WhatsApp', fInviteBtn: 'Send on WhatsApp',
      fInviteMsg: 'Childhood desi games — Tic-Tac-Toe, Snakes & Ladders, Ludo, Cricket… play online with friends, free 🎮\n👉 https://desi-games.nextgrade.in',
      fRecent: '🕘 Played with', fNone: 'No online games yet. Make a room above and send the code to a friend!',
      fAgain: 'Play again', fRecord: function (w, l, d) { return 'You ' + w + ' · them ' + l + (d ? ' · draws ' + d : ''); },
      rTitle: 'My rank', rNext: function (n, t) { return 'Next rank "' + t + '" at level ' + n; }, rTop: 'You reached the top rank! 👑',
      rBest: '🏅 My games', rBestS: 'Wins and losses vs computer and online friends', rW: 'Won', rL: 'Lost', rD: 'Draw', rP: 'Played',
      rNoGames: 'No games played yet. Pick any game — every game gives XP!',
      rBadges: '🎖️ Badges', rGot: function (a, b) { return a + '/' + b + ' earned'; },
      rHow: 'How you get XP', rHowS: 'Win +30 · draw +15 · even a loss +10 · with a friend on one phone +12 · first game of the day +20 coins',
      rNote: 'Without login your record stays on this phone; with Gmail login it is also saved in the cloud.',
      mName: 'Your name', mNamePh: 'Type your name', mSaved: 'Name saved ✓', mAvatar: '🙂 Pick your face', mBuy: function (c) { return '🪙 ' + c; },
      mBought: 'Unlocked! ✓', mNoCoins: function (c) { return 'Need ' + c + ' more coins — keep playing!'; },
      mStats: '📊 My stats', sPlayed: 'Played', sWins: 'Wins', sRate: 'Win %', sStreak: 'Day streak', sBest: 'Best streak', sFav: 'Favourite', sKinds: 'Different games',
      mSettings: '⚙️ Settings', mLang: 'Language', mSound: 'Sound', on: 'On', off: 'Off',
      mReset: 'Clear my record', mResetQ: 'Sure? All XP, coins, badges and records will be deleted.', mResetDone: 'Record cleared',
      aT: '☁️ Keep your record forever', aS: 'Log in with Gmail — XP, coins and badges are saved to your Google account. Change phones or reinstall, log in and it all comes back. Login is optional.', aBtn: 'Log in with Google', aIn: '✅ Signed in with Google', aSync: 'Record saved in the cloud ☁️', aOut: 'Log out', aOutQ: 'Log out? Your record stays safe in your Google account and comes back when you log in again.', aDone: 'Logged in ✓ record saved', aBye: 'Logged out', aErr: 'Login failed — try again', aOff: 'Login needs internet', aNo: 'Google login is not switched on yet', lbT: '🌍 Everyone\'s rank', lbS: 'Top 50 · by XP', lbLoad: 'Loading…', lbEmpty: 'Nobody yet — be the first!', lbJoin: 'Log in with Gmail to put your name on everyone\'s rank list (optional).', lbYou: '(you)', lbFail: 'Could not load — check internet',
      mPrivacy: '🔒 Your record stays on this phone and goes nowhere. In online games only your name and face are shown to the friend you are playing with. If you log in with Gmail, your record is saved to your account on Firebase (Google); everyone\'s rank shows only your app name and face, never your Gmail address.',
      dash: '—'
    },
    hinglish: {
      live: function (n) { return n + ' khel · free · bina login'; },
      player: 'Khiladi', level: 'Level', xp: 'XP', coins: 'Sikke',
      fTitle: 'Doston ke saath', fSub: 'Room banao, code bhejo — dost apne phone se jud jaayega.',
      fCreate: '🎮 Room banao', fJoin: '🔑 Code se judo', fOnlineGames: '🌐 Online wale khel', fPick: 'Khel chuno, room ban jaayega',
      fInviteT: '📲 Doston ko bulao', fInviteS: 'Desi Games ka link WhatsApp par bhejo', fInviteBtn: 'WhatsApp par bhejo',
      fInviteMsg: 'Bachpan wale desi khel — Kattam-Katti, Saanp-Seedhi, Ludo, Cricket… doston ke saath online khelo, free 🎮\n👉 https://desi-games.nextgrade.in',
      fRecent: '🕘 Jinke saath khele', fNone: 'Abhi tak koi online khel nahi. Upar se room banao aur dost ko code bhejo!',
      fAgain: 'Phir khelo', fRecord: function (w, l, d) { return 'Tum ' + w + ' · woh ' + l + (d ? ' · barabar ' + d : ''); },
      rTitle: 'Meri rank', rNext: function (n, t) { return 'Agli rank "' + t + '" — level ' + n + ' par'; }, rTop: 'Sabse oonchi rank mil gayi! 👑',
      rBest: '🏅 Mere khel', rBestS: 'Computer aur online doston se jeet-haar', rW: 'Jeet', rL: 'Haar', rD: 'Barabar', rP: 'Khele',
      rNoGames: 'Abhi koi khel nahi khela. Koi bhi khel chuno — har khel se XP milega!',
      rBadges: '🎖️ Tamge', rGot: function (a, b) { return a + '/' + b + ' mile'; },
      rHow: 'XP kaise milta hai', rHowS: 'Jeet +30 · barabar +15 · haar bhi +10 · ek phone par dost ke saath +12 · roz pehla khel +20 sikke',
      rNote: 'Bina login record isi phone mein rehta hai; Gmail login par cloud mein bhi.',
      mName: 'Tumhara naam', mNamePh: 'Naam likho', mSaved: 'Naam save ho gaya ✓', mAvatar: '🙂 Apna chehra chuno', mBuy: function (c) { return '🪙 ' + c; },
      mBought: 'Mil gaya! ✓', mNoCoins: function (c) { return 'Aur ' + c + ' sikke chahiye — khelte raho!'; },
      mStats: '📊 Mera hisaab', sPlayed: 'Khele', sWins: 'Jeet', sRate: 'Jeet %', sStreak: 'Din lagataar', sBest: 'Sabse lambi lagataar', sFav: 'Pasandeeda khel', sKinds: 'Alag-alag khel',
      mSettings: '⚙️ Setting', mLang: 'Bhasha', mSound: 'Awaaz', on: 'Chalu', off: 'Band',
      mReset: 'Record mitao', mResetQ: 'Pakka? Saare XP, sikke, tamge aur record mit jaayenge.', mResetDone: 'Record mit gaya',
      aT: '☁️ Record hamesha ke liye bachao', aS: 'Gmail se login karo — XP, sikke, tamge sab tumhare Google account mein save rahenge. Phone badlo ya app hatao, login karte hi sab wapas. Login zaroori nahi hai.', aBtn: 'Google se login karo', aIn: '✅ Google se jude ho', aSync: 'Record cloud mein save hai ☁️', aOut: 'Logout', aOutQ: 'Logout karein? Tumhara record Google account mein surakshit rahega, dobara login karte hi wapas milega.', aDone: 'Login ho gaya ✓ record save', aBye: 'Logout ho gaya', aErr: 'Login nahi hua — phir se koshish karo', aOff: 'Login ke liye internet chahiye', aNo: 'Google login abhi chalu nahi hai', lbT: '🌍 Sabki rank', lbS: 'Top 50 · XP ke hisaab se', lbLoad: 'Load ho raha hai…', lbEmpty: 'Abhi koi nahi — pehle bano!', lbJoin: 'Sabki rank mein apna naam laane ke liye Gmail se login karo (zaroori nahi).', lbYou: '(tum)', lbFail: 'Abhi load nahi hua — internet dekho',
      mPrivacy: '🔒 Tumhara record isi phone mein rehta hai, kahin nahi jaata. Online khel mein sirf tumhara naam aur chehra us dost ko dikhta hai jiske saath khel rahe ho. Gmail se login karoge to record Firebase (Google) par tumhare account mein save hoga; sabki rank mein sirf app wala naam aur chehra dikhta hai, Gmail pata kabhi nahi.',
      dash: '—'
    },
    bn: {
      live: function (n) { return n + 'টি খেলা · free · login ছাড়া'; },
      player: 'খেলোয়াড়', level: 'লেভেল', xp: 'XP', coins: 'কয়েন',
      fTitle: 'বন্ধুদের সাথে', fSub: 'রুম বানাও, কোড পাঠাও — বন্ধু নিজের ফোন থেকে যোগ দেবে।',
      fCreate: '🎮 রুম বানাও', fJoin: '🔑 কোড দিয়ে যোগ দাও', fOnlineGames: '🌐 Online খেলা', fPick: 'খেলা বাছো, রুম তৈরি হবে',
      fInviteT: '📲 বন্ধুদের ডাকো', fInviteS: 'Desi Games-এর লিংক WhatsApp-এ পাঠাও', fInviteBtn: 'WhatsApp-এ পাঠাও',
      fInviteMsg: 'ছোটবেলার দেশি খেলা — কাটাকুটি, সাপ-সিঁড়ি, লুডো, ক্রিকেট… বন্ধুদের সাথে online খেলো, free 🎮\n👉 https://desi-games.nextgrade.in',
      fRecent: '🕘 যাদের সাথে খেলেছ', fNone: 'এখনও কোনো online খেলা হয়নি। ওপরে রুম বানাও আর বন্ধুকে কোড পাঠাও!',
      fAgain: 'আবার খেলো', fRecord: function (w, l, d) { return 'তুমি ' + w + ' · সে ' + l + (d ? ' · ড্র ' + d : ''); },
      rTitle: 'আমার র‍্যাঙ্ক', rNext: function (n, t) { return 'পরের র‍্যাঙ্ক "' + t + '" — লেভেল ' + n + '-এ'; }, rTop: 'সবচেয়ে উঁচু র‍্যাঙ্ক পেয়ে গেছ! 👑',
      rBest: '🏅 আমার খেলা', rBestS: 'Computer আর online বন্ধুদের সাথে জয়-হার', rW: 'জয়', rL: 'হার', rD: 'ড্র', rP: 'খেলেছ',
      rNoGames: 'এখনও কোনো খেলা খেলোনি। যেকোনো খেলা বাছো — প্রতি খেলায় XP!',
      rBadges: '🎖️ পদক', rGot: function (a, b) { return a + '/' + b + ' পেয়েছ'; },
      rHow: 'XP কীভাবে পাবে', rHowS: 'জয় +30 · ড্র +15 · হারলেও +10 · এক ফোনে বন্ধুর সাথে +12 · দিনের প্রথম খেলা +20 কয়েন',
      rNote: 'Login ছাড়া রেকর্ড এই ফোনেই থাকে; Gmail login করলে cloud-এও।',
      mName: 'তোমার নাম', mNamePh: 'নাম লেখো', mSaved: 'নাম সেভ হয়েছে ✓', mAvatar: '🙂 নিজের মুখ বাছো', mBuy: function (c) { return '🪙 ' + c; },
      mBought: 'পেয়ে গেছ! ✓', mNoCoins: function (c) { return 'আরও ' + c + ' কয়েন লাগবে — খেলতে থাকো!'; },
      mStats: '📊 আমার হিসাব', sPlayed: 'খেলেছ', sWins: 'জয়', sRate: 'জয় %', sStreak: 'টানা দিন', sBest: 'সবচেয়ে লম্বা টানা', sFav: 'প্রিয় খেলা', sKinds: 'আলাদা খেলা',
      mSettings: '⚙️ সেটিং', mLang: 'ভাষা', mSound: 'আওয়াজ', on: 'চালু', off: 'বন্ধ',
      mReset: 'রেকর্ড মুছে দাও', mResetQ: 'নিশ্চিত? সব XP, কয়েন, পদক আর রেকর্ড মুছে যাবে।', mResetDone: 'রেকর্ড মুছে গেছে',
      aT: '☁️ রেকর্ড চিরদিনের জন্য রাখো', aS: 'Gmail দিয়ে login করো — XP, কয়েন, পদক সব তোমার Google account-এ সেভ থাকবে। ফোন বদলাও বা app মুছে দাও, login করলেই সব ফিরে আসবে। Login জরুরি নয়।', aBtn: 'Google দিয়ে login করো', aIn: '✅ Google দিয়ে যুক্ত', aSync: 'রেকর্ড cloud-এ সেভ আছে ☁️', aOut: 'Logout', aOutQ: 'Logout করবে? তোমার রেকর্ড Google account-এ নিরাপদ থাকবে, আবার login করলেই ফিরে পাবে।', aDone: 'Login হয়েছে ✓ রেকর্ড সেভ', aBye: 'Logout হয়েছে', aErr: 'Login হয়নি — আবার চেষ্টা করো', aOff: 'Login-এর জন্য internet লাগবে', aNo: 'Google login এখনও চালু হয়নি', lbT: '🌍 সবার র‍্যাঙ্ক', lbS: 'Top 50 · XP অনুযায়ী', lbLoad: 'লোড হচ্ছে…', lbEmpty: 'এখনও কেউ নেই — প্রথম হও!', lbJoin: 'সবার র‍্যাঙ্কে নিজের নাম আনতে Gmail দিয়ে login করো (জরুরি নয়)।', lbYou: '(তুমি)', lbFail: 'লোড হয়নি — internet দেখো',
      mPrivacy: '🔒 তোমার রেকর্ড এই ফোনেই থাকে, কোথাও যায় না। Online খেলায় শুধু তোমার নাম আর মুখ সেই বন্ধু দেখতে পায় যার সাথে খেলছ। Gmail দিয়ে login করলে রেকর্ড Firebase (Google)-এ তোমার account-এ সেভ হবে; সবার র‍্যাঙ্কে শুধু app-এর নাম আর মুখ দেখা যায়, Gmail ঠিকানা কখনও না।',
      dash: '—'
    }
  };
  function tx() { return TX[DG.lang] || TX.en; }

  // rank titles by level
  var TITLES = [
    [1, { hi: 'नया खिलाड़ी', en: 'New Player', hinglish: 'Naya Khiladi', bn: 'নতুন খেলোয়াড়' }, '🌱'],
    [3, { hi: 'गली का खिलाड़ी', en: 'Street Player', hinglish: 'Gali ka Khiladi', bn: 'গলির খেলোয়াড়' }, '🏃'],
    [6, { hi: 'मोहल्ले का स्टार', en: 'Neighbourhood Star', hinglish: 'Mohalle ka Star', bn: 'পাড়ার স্টার' }, '⭐'],
    [10, { hi: 'गाँव का चैंपियन', en: 'Village Champion', hinglish: 'Gaon ka Champion', bn: 'গ্রামের চ্যাম্পিয়ন' }, '🏆'],
    [15, { hi: 'शहर की शान', en: 'Pride of the City', hinglish: 'Shahar ki Shaan', bn: 'শহরের গর্ব' }, '🌟'],
    [22, { hi: 'देसी उस्ताद', en: 'Desi Ustaad', hinglish: 'Desi Ustaad', bn: 'দেশি ওস্তাদ' }, '🎖️'],
    [30, { hi: 'खेल सम्राट', en: 'Game Emperor', hinglish: 'Khel Samrat', bn: 'খেলার সম্রাট' }, '👑']
  ];

  // faces: [emoji, coin price] (0 = free)
  var FACES = [['🧑🏽', 0], ['👦🏽', 0], ['👧🏽', 0], ['🧔🏽', 0], ['👩🏽', 0], ['👴🏽', 0], ['👵🏽', 0], ['🧒🏽', 0],
    ['🐯', 60], ['🦚', 80], ['🐘', 100], ['🐒', 120], ['🦁', 150], ['🐍', 180], ['🪁', 220], ['🏏', 260], ['🪀', 300], ['👑', 500]];

  // badges: id, icon, test(s), text
  var BADGES = [
    ['first', '🥇', function (s) { return s.wins >= 1; }, { hi: 'पहली जीत', en: 'First win', hinglish: 'Pehli jeet', bn: 'প্রথম জয়' }],
    ['w10', '🔟', function (s) { return s.wins >= 10; }, { hi: '10 जीत', en: '10 wins', hinglish: '10 jeet', bn: '১০টি জয়' }],
    ['w50', '💪', function (s) { return s.wins >= 50; }, { hi: '50 जीत', en: '50 wins', hinglish: '50 jeet', bn: '৫০টি জয়' }],
    ['p25', '🎮', function (s) { return s.played >= 25; }, { hi: '25 खेल खेले', en: 'Played 25', hinglish: '25 khel khele', bn: '২৫টি খেলা' }],
    ['p100', '💯', function (s) { return s.played >= 100; }, { hi: '100 खेल खेले', en: 'Played 100', hinglish: '100 khel khele', bn: '১০০টি খেলা' }],
    ['k5', '🎪', function (s) { return kinds(s) >= 5; }, { hi: '5 अलग खेल', en: '5 different games', hinglish: '5 alag khel', bn: '৫টি আলাদা খেলা' }],
    ['k15', '🗺️', function (s) { return kinds(s) >= 15; }, { hi: '15 अलग खेल', en: '15 different games', hinglish: '15 alag khel', bn: '১৫টি আলাদা খেলা' }],
    ['all', '🌈', function (s) { return kinds(s) >= playable().length; }, { hi: 'सारे खेल खेले', en: 'Played every game', hinglish: 'Saare khel khele', bn: 'সব খেলা খেলেছ' }],
    ['beat5', '🤖', function (s) { return beatAi(s) >= 5; }, { hi: '5 खेलों में Computer को हराया', en: 'Beat the computer in 5 games', hinglish: '5 khel mein Computer ko haraya', bn: '৫টি খেলায় Computer-কে হারিয়েছ' }],
    ['online1', '🌐', function (s) { return onlineN(s) >= 1; }, { hi: 'पहला online खेल', en: 'First online game', hinglish: 'Pehla online khel', bn: 'প্রথম online খেলা' }],
    ['online10', '🤝', function (s) { return onlineN(s) >= 10; }, { hi: '10 online खेल', en: '10 online games', hinglish: '10 online khel', bn: '১০টি online খেলা' }],
    ['s3', '🔥', function (s) { return s.bestStreak >= 3; }, { hi: '3 दिन लगातार', en: '3-day streak', hinglish: '3 din lagataar', bn: 'টানা ৩ দিন' }],
    ['s7', '📅', function (s) { return s.bestStreak >= 7; }, { hi: '7 दिन लगातार', en: '7-day streak', hinglish: '7 din lagataar', bn: 'টানা ৭ দিন' }],
    ['lv10', '🏆', function (s) { return levelOf(s.xp).level >= 10; }, { hi: 'लेवल 10', en: 'Level 10', hinglish: 'Level 10', bn: 'লেভেল ১০' }]
  ];

  /* ---------- store ---------- */
  function blank() { return { v: 1, xp: 0, earned: 0, spent: 0, played: 0, wins: 0, losses: 0, draws: 0, byGame: {}, day: '', streak: 0, bestStreak: 0, faces: [], name: '', face: '🧑🏽', friends: [], uid: '' }; }
  var S;
  function load() { try { S = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = blank(); } return S; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  load();

  function kinds(s) { return Object.keys(s.byGame).filter(function (k) { return s.byGame[k].p > 0; }).length; }
  function beatAi(s) { return Object.keys(s.byGame).filter(function (k) { return (s.byGame[k].aw || 0) > 0; }).length; }
  function onlineN(s) { var n = 0; Object.keys(s.byGame).forEach(function (k) { n += s.byGame[k].op || 0; }); return n; }
  function playable() { return DG.GAMES.filter(function (g) { return g.play; }); }
  function coins() { return Math.max(0, S.earned - S.spent); }
  function levelOf(xp) { var L = 1, need = 100, left = xp; while (left >= need) { left -= need; L++; need = 100 + 50 * (L - 1); } return { level: L, into: left, need: need }; }
  function titleOf(level) { var t = TITLES[0]; TITLES.forEach(function (x) { if (level >= x[0]) t = x; }); return t; }
  function nextTitle(level) { for (var i = 0; i < TITLES.length; i++) if (TITLES[i][0] > level) return TITLES[i]; return null; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function yesterday() { var d = new Date(Date.now() - 864e5); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }

  var lastRec = 0;
  /* kind: 'win' | 'lose' | 'draw'; mode: 'ai' | 'online' | 'pass'; opp: {name, face} for online */
  function record(gameId, mode, kind, opp) {
    if (!gameId || !mode) return;
    var now = Date.now(); if (now - lastRec < 900) return; lastRec = now;
    load();
    var g = S.byGame[gameId] = S.byGame[gameId] || { p: 0, w: 0, l: 0, d: 0, aw: 0, op: 0 };
    g.p++; S.played++;
    var xp = 12, c = 3;
    if (mode !== 'pass') {
      if (kind === 'win') { g.w++; S.wins++; xp = 30; c = 10; if (mode === 'ai') g.aw = (g.aw || 0) + 1; }
      else if (kind === 'draw') { g.d++; S.draws++; xp = 15; c = 5; }
      else { g.l++; S.losses++; xp = 10; c = 2; }
      if (mode === 'online') g.op = (g.op || 0) + 1;
    }
    var td = today();
    if (S.day !== td) { c += 20; S.streak = (S.day === yesterday()) ? S.streak + 1 : 1; S.day = td; S.bestStreak = Math.max(S.bestStreak, S.streak); }
    var before = levelOf(S.xp).level;
    S.xp += xp; S.earned += c;
    if (mode === 'online' && opp && opp.name) {
      var nm = String(opp.name).slice(0, 16), f = null;
      for (var i = 0; i < S.friends.length; i++) if (S.friends[i].name === nm) { f = S.friends.splice(i, 1)[0]; break; }
      f = f || { name: nm, w: 0, l: 0, d: 0 };
      f.face = String(opp.face || '🧑🏻').slice(0, 8); f.game = gameId; f.ts = now;
      if (kind === 'win') f.w++; else if (kind === 'draw') f.d++; else f.l++;
      S.friends.unshift(f); S.friends = S.friends.slice(0, 20);
    }
    save(); cloudPush();
    var after = levelOf(S.xp).level;
    paintHud();
    return { xp: xp, coins: c, levelUp: after > before ? after : 0 };
  }

  /* ---------- cloud save (only after Gmail login) ---------- */
  function fbOn() { return !!(DG.fb && DG.fb.isGoogle()); }
  var pushT = 0;
  function cloudPush() {
    if (!fbOn()) return;
    clearTimeout(pushT);
    pushT = setTimeout(function () {
      var u = DG.fb.user(); if (!u || !fbOn()) return;
      DG.fb.db().then(function (db) {
        if (!db) return;
        load(); S.uid = u.uid; save();
        var data = JSON.parse(JSON.stringify(S)); data.ts = firebase.database.ServerValue.TIMESTAMP;
        db.ref('users/' + u.uid).set(data).catch(function (e) { console.warn('[DG] cloud save', e && e.message); });
        db.ref('lb/' + u.uid).set({ name: (S.name || tx().player).slice(0, 16), face: S.face || '🧑🏽', xp: S.xp, lv: levelOf(S.xp).level, wins: S.wins, ts: firebase.database.ServerValue.TIMESTAMP })
          .catch(function (e) { console.warn('[DG] rank save', e && e.message); });
      });
    }, 600);
  }
  function dayN(d) { if (!d) return 0; var a = d.split('-'); return new Date(+a[0], a[1] - 1, +a[2]).getTime(); }
  // add = guest progress joins an account; max = the same account on two phones
  function merge(a, b, add) {
    var o = blank(), f = add ? function (x, y) { return (x || 0) + (y || 0); } : function (x, y) { return Math.max(x || 0, y || 0); };
    ['xp', 'earned', 'spent', 'played', 'wins', 'losses', 'draws'].forEach(function (k) { o[k] = f(a[k], b[k]); });
    o.bestStreak = Math.max(a.bestStreak || 0, b.bestStreak || 0);
    var late = dayN(a.day) >= dayN(b.day) ? a : b; o.day = late.day || ''; o.streak = late.streak || 0;
    Object.keys(Object.assign({}, a.byGame || {}, b.byGame || {})).forEach(function (k) {
      var x = (a.byGame || {})[k] || {}, y = (b.byGame || {})[k] || {}, g = {};
      ['p', 'w', 'l', 'd', 'aw', 'op'].forEach(function (q) { g[q] = f(x[q], y[q]); }); o.byGame[k] = g;
    });
    o.faces = (a.faces || []).concat(b.faces || []).filter(function (v, i, arr) { return arr.indexOf(v) === i; });
    o.name = a.name || b.name || ''; o.face = a.face || b.face || '🧑🏽';
    var fr = {};
    (a.friends || []).concat(b.friends || []).forEach(function (x) {
      if (!x || !x.name) return; var y = fr[x.name];
      if (!y) { fr[x.name] = x; return; }
      var nw = x.ts > y.ts ? x : y;
      fr[x.name] = { name: x.name, face: nw.face, game: nw.game, ts: Math.max(x.ts || 0, y.ts || 0), w: f(x.w, y.w), l: f(x.l, y.l), d: f(x.d, y.d) };
    });
    o.friends = Object.keys(fr).map(function (k) { return fr[k]; }).sort(function (p, q) { return q.ts - p.ts; }).slice(0, 20);
    return o;
  }
  var pulling = null, pulledUid = '';
  function cloudPull(user) {
    if (pulling && pulledUid === user.uid) return pulling;
    pulledUid = user.uid;
    return pulling = DG.fb.db().then(function (db) {
      if (!db) return;
      return db.ref('users/' + user.uid).once('value').then(function (snap) {
        load();
        var cloud = snap.val(), local = S;
        if (!cloud) S = Object.assign(blank(), local);                              // first login: this phone's record becomes the account
        else if (!local.uid) S = merge(local, Object.assign(blank(), cloud), true);  // guest progress + account
        else if (local.uid === user.uid) S = merge(local, Object.assign(blank(), cloud), false);
        else S = Object.assign(blank(), cloud);                                     // another account's copy → take this account
        S.uid = user.uid;
        if (!S.name && user.displayName) S.name = user.displayName.split(' ')[0].replace(/[<>&"'`]/g, '').slice(0, 16);
        save(); paintHud(); cloudPush();
        window.dispatchEvent(new Event('dg-auth'));
      });
    }).catch(function (e) { console.warn('[DG] cloud load', e && e.message); }).then(function () { setTimeout(function () { pulling = null; }, 3000); });
  }
  if (DG.fb) DG.fb.onChange(function (u) {
    if (u && !u.isAnonymous && fbOn()) { window.dispatchEvent(new Event('dg-auth')); cloudPull(u); }
    else window.dispatchEvent(new Event('dg-auth'));
  });
  function signIn(api) {
    var t = tx();
    if (!DG.fb) { api.toast(t.aOff); return; }
    DG.fb.signIn().then(function () {
      var u = DG.fb.user(); api.toast(t.aDone); api.redraw();
      // fresh token so the database sees the Google login (not the old guest one)
      if (u && fbOn()) u.getIdToken(true).then(function () { cloudPull(u); }, function () { cloudPull(u); });
    }, function (e) {
      var c = e && e.code;
      if (c === 'auth/popup-closed-by-user' || c === 'auth/cancelled-popup-request') return;
      api.toast(c === 'offline' || c === 'auth/network-request-failed' ? t.aOff : (c === 'auth/operation-not-allowed' ? t.aNo : t.aErr));
      console.warn('[DG] login', c, e && e.message);
    });
  }
  function signOut(api) {
    var t = tx(); if (!confirm(t.aOutQ)) return;
    DG.fb.signOut().then(function () { S = blank(); save(); paintHud(); api.toast(t.aBye); api.redraw(); });
  }

  function me() { load(); return { name: S.name || tx().player, face: S.face || '🧑🏽' }; }

  function paintHud() {
    var c = document.getElementById('coinTxt'); if (c) c.textContent = '🪙 ' + coins();
    var l = document.getElementById('liveTxt'); if (l) l.textContent = tx().live(playable().length);
  }

  /* ---------- styles ---------- */
  if (!document.getElementById('pg-style')) {
    var st = document.createElement('style'); st.id = 'pg-style';
    st.textContent =
      '.page{padding-bottom:10px;} .page[hidden]{display:none;}' +
      '.pg-h{font-family:var(--font-d);font-weight:800;font-size:1.4rem;margin:4px 2px 2px;} .pg-s{color:var(--ink-soft);font-size:.86rem;margin:0 2px 14px;}' +
      '.pg-card{position:relative;background:linear-gradient(150deg,#1d2458,#141a40 70%);border:1px solid var(--line);border-radius:var(--radius);padding:16px;box-shadow:var(--shadow);margin-bottom:14px;}' +
      '.pg-card h3{font-family:var(--font-d);font-weight:700;font-size:1.06rem;margin:0 0 10px;} .pg-card .sm{color:var(--ink-soft);font-size:.8rem;margin:-6px 0 10px;}' +
      '.pg-row2{display:flex;gap:10px;}' +
      '.pg-games{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;}' +
      '.pg-g{border:1px solid var(--line-soft);background:var(--panel-2);border-radius:14px;padding:11px 6px;cursor:pointer;color:var(--ink);display:flex;flex-direction:column;align-items:center;gap:4px;font-family:var(--font-d);font-weight:700;font-size:.8rem;text-align:center;line-height:1.1;}' +
      '.pg-g .e{font-size:26px;} .pg-g:active{transform:scale(.96);}' +
      '.pg-list{display:flex;flex-direction:column;gap:8px;}' +
      '.pg-li{display:flex;align-items:center;gap:11px;background:var(--panel);border:1px solid var(--line-soft);border-radius:14px;padding:10px 12px;}' +
      '.pg-li .av{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-size:22px;background:var(--panel-2);box-shadow:inset 0 0 0 1px var(--line);flex:none;}' +
      '.pg-li .tx{flex:1;min-width:0;} .pg-li .nm{font-family:var(--font-d);font-weight:700;font-size:.96rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .pg-li .sb{color:var(--ink-soft);font-size:.76rem;}' +
      '.pg-mini{border:0;cursor:pointer;font-family:var(--font-d);font-weight:800;font-size:.8rem;padding:8px 12px;border-radius:11px;background:linear-gradient(135deg,var(--marigold),var(--marigold2));color:#2a1803;flex:none;}' +
      '.pg-mini.ghost{background:var(--panel-2);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);}' +
      '.pg-empty{color:var(--ink-soft);font-size:.86rem;text-align:center;padding:12px 6px;line-height:1.5;}' +
      '.pg-rank{display:flex;align-items:center;gap:14px;} .pg-rank .big{width:70px;height:70px;border-radius:50%;display:grid;place-items:center;font-size:36px;flex:none;background:radial-gradient(70% 70% at 50% 35%,var(--marigold),#0e1230);box-shadow:inset 0 0 0 2px rgba(221,180,110,.5),0 8px 18px rgba(3,5,18,.5);}' +
      '.pg-rank .t{font-family:var(--font-d);font-weight:800;font-size:1.3rem;line-height:1.1;} .pg-rank .l{color:var(--ink-soft);font-size:.84rem;font-weight:600;}' +
      '.pg-bar{height:10px;border-radius:999px;background:rgba(255,255,255,.07);overflow:hidden;margin:12px 0 6px;box-shadow:inset 0 0 0 1px var(--line-soft);} .pg-bar i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,var(--brass),var(--marigold2));}' +
      '.pg-cap{display:flex;justify-content:space-between;color:var(--ink-soft);font-size:.76rem;font-weight:600;}' +
      '.pg-tbl{width:100%;border-collapse:collapse;font-size:.84rem;} .pg-tbl th{color:var(--ink-soft);font-weight:700;font-size:.72rem;text-align:center;padding:4px 2px;} .pg-tbl th:first-child,.pg-tbl td:first-child{text-align:left;}' +
      '.pg-tbl td{padding:8px 2px;border-top:1px solid var(--line-soft);text-align:center;font-family:var(--font-d);font-weight:700;} .pg-tbl td.w{color:#6fdc9a;} .pg-tbl td.l{color:#ff8f8f;}' +
      '.pg-badges{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;}' +
      '.pg-b{display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;font-size:.68rem;font-weight:700;color:var(--ink-soft);line-height:1.15;}' +
      '.pg-b .bi{width:50px;height:50px;border-radius:50%;display:grid;place-items:center;font-size:24px;background:var(--panel-2);box-shadow:inset 0 0 0 1px var(--line);}' +
      '.pg-b.got{color:var(--ink);} .pg-b.got .bi{background:radial-gradient(70% 70% at 50% 35%,var(--marigold2),var(--brass-d));box-shadow:0 4px 12px rgba(245,165,36,.3);}' +
      '.pg-b:not(.got) .bi{filter:grayscale(1);opacity:.45;}' +
      '.pg-prof{display:flex;align-items:center;gap:14px;} .pg-prof .big{width:76px;height:76px;border-radius:50%;display:grid;place-items:center;font-size:40px;flex:none;background:linear-gradient(135deg,var(--marigold2),var(--marigold));box-shadow:inset 0 0 0 2px rgba(255,255,255,.3);}' +
      '.pg-in{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;} .pg-in label{color:var(--ink-soft);font-size:.74rem;font-weight:700;}' +
      '.pg-in input{width:100%;font-family:var(--font-d);font-weight:700;font-size:1.1rem;padding:9px 12px;border-radius:12px;border:1px solid var(--line);background:var(--panel);color:var(--ink);outline:none;} .pg-in input:focus{border-color:var(--marigold);}' +
      '.pg-chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;} .pg-chip{background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:5px 11px;font-family:var(--font-d);font-weight:700;font-size:.8rem;}' +
      '.pg-faces{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;}' +
      '.pg-f{position:relative;aspect-ratio:1;border-radius:50%;border:0;cursor:pointer;font-size:24px;background:var(--panel-2);box-shadow:inset 0 0 0 1px var(--line);display:grid;place-items:center;}' +
      '.pg-f.on{box-shadow:0 0 0 3px var(--marigold);background:rgba(245,165,36,.15);} .pg-f .pr{position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);font-size:.58rem;font-family:var(--font-d);font-weight:800;background:#0e1230;border:1px solid var(--line);border-radius:999px;padding:0 5px;white-space:nowrap;color:var(--marigold2);}' +
      '.pg-f.lock span.e{filter:grayscale(.85);opacity:.6;}' +
      '.pg-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;} .pg-st{background:var(--panel);border:1px solid var(--line-soft);border-radius:14px;padding:10px 6px;text-align:center;}' +
      '.pg-st b{display:block;font-family:var(--font-d);font-weight:800;font-size:1.25rem;line-height:1.15;} .pg-st span{color:var(--ink-soft);font-size:.7rem;font-weight:700;}' +
      '.pg-set{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px 10px;padding:9px 0;border-top:1px solid var(--line-soft);} .pg-set:first-of-type{border-top:0;} .pg-set .k{font-weight:700;}' +
      '.pg-seg{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end;} .pg-seg button{border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:10px;padding:6px 10px;font-family:var(--font-b);font-weight:700;font-size:.8rem;cursor:pointer;}' +
      '.pg-seg button.on{background:linear-gradient(135deg,var(--marigold),var(--marigold2));color:#2a1803;border-color:transparent;}' +
      '.pg-note{color:var(--ink-soft);font-size:.78rem;line-height:1.55;margin:4px 4px 0;}' +
      '.pg-google{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;border:0;cursor:pointer;background:#fff;color:#1f1f1f;border-radius:14px;padding:13px;font-family:var(--font-d);font-weight:800;font-size:1rem;margin-top:10px;box-shadow:0 6px 16px rgba(0,0,0,.3);} .pg-google:active{transform:scale(.97);}' +
      '.pg-li .av img{width:100%;height:100%;border-radius:50%;object-fit:cover;} .pg-li .pos{width:30px;text-align:center;font-family:var(--font-d);font-weight:800;color:var(--ink-soft);flex:none;}' +
      '.pg-li.mine{border-color:var(--marigold);background:rgba(245,165,36,.1);}' +
      '.pg-danger{background:none;border:1px solid rgba(230,96,74,.5);color:#ff9b8a;border-radius:12px;padding:9px 14px;font-family:var(--font-d);font-weight:700;cursor:pointer;margin-top:10px;}';
    document.head.appendChild(st);
  }

  /* ---------- helpers ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function el(tag, cls, html, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; }
  function gameById(id) { for (var i = 0; i < DG.GAMES.length; i++) if (DG.GAMES[i].id === id) return DG.GAMES[i]; return null; }
  function ago(ts) {
    var m = Math.round((Date.now() - ts) / 60000), L = DG.lang;
    var u = m < 60 ? [m, { hi: 'मिनट पहले', en: 'min ago', hinglish: 'min pehle', bn: 'মিনিট আগে' }] :
      m < 1440 ? [Math.round(m / 60), { hi: 'घंटे पहले', en: 'h ago', hinglish: 'ghante pehle', bn: 'ঘণ্টা আগে' }] :
        [Math.round(m / 1440), { hi: 'दिन पहले', en: 'days ago', hinglish: 'din pehle', bn: 'দিন আগে' }];
    return Math.max(1, u[0]) + ' ' + (u[1][L] || u[1].en);
  }

  /* ---------- tabs ---------- */
  function friends(root, api) {
    var t = tx();
    el('h2', 'pg-h', esc(t.fTitle), root); el('p', 'pg-s', esc(t.fSub), root);
    var c1 = el('div', 'pg-card', null, root);
    var row = el('div', 'pg-row2', null, c1);
    var b1 = el('button', 'hbtn hbtn-1', esc(t.fCreate), row); b1.onclick = function () { api.create(null); };
    var b2 = el('button', 'hbtn hbtn-2', esc(t.fJoin), row); b2.onclick = function () { api.join(); };

    var c2 = el('div', 'pg-card', '<h3>' + esc(t.fOnlineGames) + '</h3><p class="sm">' + esc(t.fPick) + '</p>', root);
    var gg = el('div', 'pg-games', null, c2);
    DG.GAMES.filter(function (g) { return g.online; }).forEach(function (g) {
      var b = el('button', 'pg-g', '<span class="e">' + g.ic + '</span>' + esc(DG.gname(g)), gg); b.onclick = function () { api.create(g); };
    });

    var c3 = el('div', 'pg-card', '<h3>' + esc(t.fRecent) + '</h3>', root);
    load();
    if (!S.friends.length) el('div', 'pg-empty', esc(t.fNone), c3);
    else {
      var list = el('div', 'pg-list', null, c3);
      S.friends.forEach(function (f) {
        var g = gameById(f.game);
        var li = el('div', 'pg-li', '<span class="av">' + esc(f.face) + '</span><div class="tx"><div class="nm">' + esc(f.name) + '</div><div class="sb">' +
          (g ? g.ic + ' ' + esc(DG.gname(g)) + ' · ' : '') + esc(t.fRecord(f.w, f.l, f.d)) + ' · ' + esc(ago(f.ts)) + '</div></div>', list);
        if (g && g.online) { var b = el('button', 'pg-mini', esc(t.fAgain), li); b.onclick = function () { api.create(g); }; }
      });
    }

    var c4 = el('div', 'pg-card', '<h3>' + esc(t.fInviteT) + '</h3><p class="sm">' + esc(t.fInviteS) + '</p>', root);
    var wa = el('a', 'rbtn rbtn-wa', '💬 ' + esc(t.fInviteBtn), c4);
    wa.href = 'https://wa.me/?text=' + encodeURIComponent(t.fInviteMsg); wa.target = '_blank'; wa.rel = 'noopener'; wa.style.textDecoration = 'none';
  }

  function rank(root, api) {
    var t = tx(); load();
    var lv = levelOf(S.xp), ti = titleOf(lv.level), nx = nextTitle(lv.level), L = DG.lang;
    el('h2', 'pg-h', esc(t.rTitle), root);
    var c1 = el('div', 'pg-card', null, root);
    el('div', 'pg-rank', '<span class="big">' + ti[2] + '</span><div><div class="t">' + esc(ti[1][L] || ti[1].en) + '</div><div class="l">' + esc(t.level) + ' ' + lv.level + ' · 🪙 ' + coins() + '</div></div>', c1);
    el('div', 'pg-bar', '<i style="width:' + Math.round(lv.into / lv.need * 100) + '%"></i>', c1);
    el('div', 'pg-cap', '<span>' + lv.into + ' / ' + lv.need + ' ' + t.xp + '</span><span>' + esc(t.level) + ' ' + (lv.level + 1) + '</span>', c1);
    el('p', 'pg-note', esc(nx ? t.rNext(nx[0], nx[1][L] || nx[1].en) : t.rTop), c1);
    leaderboard(root, api);

    var c2 = el('div', 'pg-card', '<h3>' + esc(t.rBest) + '</h3><p class="sm">' + esc(t.rBestS) + '</p>', root);
    var ids = Object.keys(S.byGame).filter(function (k) { return gameById(k) && S.byGame[k].p > 0; });
    if (!ids.length) el('div', 'pg-empty', esc(t.rNoGames), c2);
    else {
      ids.sort(function (a, b) { var A = S.byGame[a], B = S.byGame[b]; return (B.w - A.w) || (B.p - A.p); });
      var h = '<table class="pg-tbl"><tr><th></th><th>' + esc(t.rP) + '</th><th>' + esc(t.rW) + '</th><th>' + esc(t.rL) + '</th><th>' + esc(t.rD) + '</th></tr>';
      ids.forEach(function (k) { var g = gameById(k), r = S.byGame[k];
        h += '<tr><td>' + g.ic + ' ' + esc(DG.gname(g)) + '</td><td>' + r.p + '</td><td class="w">' + r.w + '</td><td class="l">' + r.l + '</td><td>' + r.d + '</td></tr>'; });
      el('div', null, h + '</table>', c2);
    }

    var got = BADGES.filter(function (b) { return b[2](S); }).length;
    var c3 = el('div', 'pg-card', '<h3>' + esc(t.rBadges) + ' <span style="color:var(--ink-soft);font-size:.8rem">· ' + esc(t.rGot(got, BADGES.length)) + '</span></h3>', root);
    var bg = el('div', 'pg-badges', null, c3);
    BADGES.forEach(function (b) { el('div', 'pg-b' + (b[2](S) ? ' got' : ''), '<span class="bi">' + b[1] + '</span>' + esc(b[3][L] || b[3].en), bg); });

    var c4 = el('div', 'pg-card', '<h3>' + esc(t.rHow) + '</h3>', root);
    el('p', 'pg-note', esc(t.rHowS), c4);
    var tl = el('div', 'pg-list', null, c4); tl.style.marginTop = '10px';
    TITLES.forEach(function (x) { el('div', 'pg-li', '<span class="av">' + x[2] + '</span><div class="tx"><div class="nm">' + esc(x[1][L] || x[1].en) + '</div><div class="sb">' + esc(t.level) + ' ' + x[0] + '+</div></div>' + (lv.level >= x[0] ? '<span>✅</span>' : ''), tl); });
    el('p', 'pg-note', esc(t.rNote), root);
  }

  function gBtn(parent, api) {
    var b = el('button', 'pg-google', '<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg><span>' + esc(tx().aBtn) + '</span>', parent);
    b.type = 'button'; b.onclick = function () { signIn(api); }; return b;
  }
  function accountCard(root, api) {
    var t = tx();
    if (!DG.fb) return;
    var c = el('div', 'pg-card pg-acc', null, root);
    if (fbOn()) {
      var u = DG.fb.user();
      el('h3', null, esc(t.aIn), c);
      el('div', 'pg-li', '<span class="av">' + (u.photoURL ? '<img src="' + esc(u.photoURL) + '" alt="" referrerpolicy="no-referrer">' : '☁️') + '</span><div class="tx"><div class="nm">' + esc(u.displayName || '') + '</div><div class="sb">' + esc(u.email || '') + ' · ' + esc(t.aSync) + '</div></div>', c);
      var o = el('button', 'pg-danger', esc(t.aOut), c); o.type = 'button'; o.onclick = function () { signOut(api); };
    } else {
      el('h3', null, esc(t.aT), c); el('p', 'pg-note', esc(t.aS), c); gBtn(c, api);
    }
  }
  function leaderboard(root, api) {
    var t = tx();
    if (!DG.fb) return;
    var c = el('div', 'pg-card', '<h3>' + esc(t.lbT) + '</h3><p class="sm">' + esc(t.lbS) + '</p>', root);
    var box = el('div', 'pg-list', '<div class="pg-empty">' + esc(t.lbLoad) + '</div>', c);
    if (!fbOn()) { el('p', 'pg-note', esc(t.lbJoin), c); gBtn(c, api); }
    var myUid = fbOn() ? DG.fb.user().uid : '';
    DG.fb.db().then(function (db) {
      if (!db) throw 0;
      return db.ref('lb').orderByChild('xp').limitToLast(50).once('value');
    }).then(function (snap) {
      var rows = []; snap.forEach(function (ch) { var v = ch.val() || {}; v.uid = ch.key; rows.push(v); });
      rows.sort(function (a, b) { return (b.xp || 0) - (a.xp || 0); });
      box.innerHTML = '';
      if (!rows.length) { el('div', 'pg-empty', esc(t.lbEmpty), box); return; }
      rows.forEach(function (r, i) {
        var mine = r.uid === myUid, medal = ['🥇', '🥈', '🥉'][i] || ('#' + (i + 1));
        el('div', 'pg-li' + (mine ? ' mine' : ''), '<span class="pos">' + medal + '</span><span class="av">' + esc(String(r.face || '🧑🏽').slice(0, 8)) + '</span><div class="tx"><div class="nm">' + esc(String(r.name || '').slice(0, 16)) + (mine ? ' ' + esc(t.lbYou) : '') + '</div><div class="sb">' + esc(t.level) + ' ' + (r.lv | 0) + ' · ' + (r.xp | 0) + ' XP · ' + esc(t.rW) + ' ' + (r.wins | 0) + '</div></div>', box);
      });
    }).catch(function () { box.innerHTML = '<div class="pg-empty">' + esc(t.lbFail) + '</div>'; });
  }

  function profile(root, api) {
    var t = tx(); load();
    var lv = levelOf(S.xp), ti = titleOf(lv.level), L = DG.lang;
    accountCard(root, api);
    var c1 = el('div', 'pg-card', null, root);
    var pr = el('div', 'pg-prof', null, c1);
    var big = el('span', 'big', esc(S.face), pr);
    var inw = el('div', 'pg-in', '<label for="pgName">' + esc(t.mName) + '</label>', pr);
    var inp = el('input', null, null, inw); inp.id = 'pgName'; inp.maxLength = 16; inp.placeholder = t.mNamePh; inp.value = S.name || ''; inp.autocomplete = 'nickname';
    inp.onchange = function () { load(); S.name = inp.value.replace(/[<>&"'`]/g, '').trim().slice(0, 16); save(); cloudPush(); api.toast(t.mSaved); };
    el('div', 'pg-chips', '<span class="pg-chip">' + ti[2] + ' ' + esc(ti[1][L] || ti[1].en) + '</span><span class="pg-chip">' + esc(t.level) + ' ' + lv.level + '</span><span class="pg-chip">🪙 ' + coins() + '</span>', c1);
    el('div', 'pg-bar', '<i style="width:' + Math.round(lv.into / lv.need * 100) + '%"></i>', c1);
    el('div', 'pg-cap', '<span>' + lv.into + ' / ' + lv.need + ' ' + t.xp + '</span><span>' + esc(t.level) + ' ' + (lv.level + 1) + '</span>', c1);

    var c2 = el('div', 'pg-card', '<h3>' + esc(t.mAvatar) + '</h3>', root);
    var fg = el('div', 'pg-faces', null, c2);
    FACES.forEach(function (f) {
      var owned = f[1] === 0 || S.faces.indexOf(f[0]) >= 0;
      var b = el('button', 'pg-f' + (S.face === f[0] ? ' on' : '') + (owned ? '' : ' lock'), '<span class="e">' + f[0] + '</span>' + (owned ? '' : '<span class="pr">' + esc(t.mBuy(f[1])) + '</span>'), fg);
      b.type = 'button';
      b.onclick = function () {
        load();
        if (!owned) {
          if (coins() < f[1]) { api.toast(t.mNoCoins(f[1] - coins())); return; }
          S.spent += f[1]; S.faces.push(f[0]); api.toast(t.mBought); DG.sfx && DG.sfx('bonus');
        }
        S.face = f[0]; save(); cloudPush(); paintHud(); api.redraw();
      };
    });

    var c3 = el('div', 'pg-card', '<h3>' + esc(t.mStats) + '</h3>', root);
    var fav = null, fp = 0; Object.keys(S.byGame).forEach(function (k) { if (gameById(k) && S.byGame[k].p > fp) { fp = S.byGame[k].p; fav = gameById(k); } });
    var dec = S.wins + S.losses + S.draws;
    var items = [[S.played, t.sPlayed], [S.wins, t.sWins], [dec ? Math.round(S.wins / dec * 100) + '%' : t.dash, t.sRate],
      [S.day === today() || S.day === yesterday() ? S.streak : 0, t.sStreak], [S.bestStreak, t.sBest], [kinds(S) + '/' + playable().length, t.sKinds]];
    var sg = el('div', 'pg-stats', null, c3);
    items.forEach(function (x) { el('div', 'pg-st', '<b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span>', sg); });
    if (fav) el('p', 'pg-note', esc(t.sFav) + ': ' + fav.ic + ' ' + esc(DG.gname(fav)), c3);

    var c4 = el('div', 'pg-card', '<h3>' + esc(t.mSettings) + '</h3>', root);
    var r1 = el('div', 'pg-set', '<span class="k">🌐 ' + esc(t.mLang) + '</span>', c4);
    var seg = el('div', 'pg-seg', null, r1);
    DG.ORDER.forEach(function (code) { var b = el('button', code === DG.lang ? 'on' : '', esc(DG.L[code].langName), seg); b.type = 'button'; b.onclick = function () { api.setLang(code); }; });
    var r2 = el('div', 'pg-set', '<span class="k">🔊 ' + esc(t.mSound) + '</span>', c4);
    var seg2 = el('div', 'pg-seg', null, r2);
    [[true, t.on], [false, t.off]].forEach(function (x) {
      var b = el('button', (DG.sound && DG.sound.on === x[0]) ? 'on' : '', esc(x[1]), seg2); b.type = 'button';
      b.onclick = function () { if (DG.sound && DG.sound.on !== x[0]) DG.sound.toggle(); api.redraw(); };
    });
    var rs = el('button', 'pg-danger', '🗑️ ' + esc(t.mReset), c4); rs.type = 'button';
    rs.onclick = function () { if (!confirm(t.mResetQ)) return; var keep = { name: S.name }; S = blank(); S.name = keep.name; S.uid = fbOn() ? DG.fb.user().uid : ''; save(); cloudPush(); paintHud(); api.toast(t.mResetDone); api.redraw(); };
    el('p', 'pg-note', esc(t.mPrivacy) + ' <a href="privacy.html" target="_blank" rel="noopener" style="color:var(--marigold)">Privacy Policy</a>', root);
  }

  DG.stats = { record: record, me: me, paintHud: paintHud, level: function () { return levelOf(load().xp).level; } };
  DG.pages = {
    show: function (tab, root, api) {
      root.innerHTML = '';
      if (tab === 'friends') friends(root, api);
      else if (tab === 'rank') rank(root, api);
      else if (tab === 'me') profile(root, api);
    }
  };
})();

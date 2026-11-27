# Desi Games — Progress (kitna hua)

_Updated: 2026-11-28_

**Live:** https://desi-games.nextgrade.in (GitHub Pages, repo public-for-now → baad mein private; HTTPS on)
**Repo:** github.com/Nazimkhan1/desi-games
**Local run:** `cd ~/www/nazim/desi-games && python3 -m http.server 7878` → http://localhost:7878
(Chrome port 6666 block karta hai — 7878/8080 use karo.)

---

## ✅ HO GAYA
- [x] App shell + bottom nav + mode sheet + room screen
- [x] **4 bhasha** switcher (हिंदी · English · বাংলা · Hinglish), localized brand wordmark
- [x] **Bespoke design** — "Indigo Night · Brass & Marigold" (pachisi emblem, jali pattern, unified icon chips; NOT generic AI look)
- [x] PWA (manifest + service worker, offline shell) + SVG icon
- [x] **Deploy live** on desi-games.nextgrade.in (GitHub Pages; DNS: `desi-games` CNAME `nazimkhan1.github.io` DNS-only)

### Games (8)
- [x] **कट्टम-कट्टी** (Tic-Tac-Toe) — Pass&Play + vs Computer (minimax) + **ONLINE** (Firebase)
- [x] **साँप-सीढ़ी** (Snakes & Ladders) — Pass&Play + vs Computer
- [x] **पतंग काटो** (Kite Fight) — chhat se patang, ungli se ghumao; dor se dor bhide = pench, pench mein jo tez ghumaye wo kaate ("Wo kaata!"); pehle 3; vs Computer + ek phone par 2 khiladi ek saath (multi-touch, baayan/daayan aadha) (22 Nov)
- [x] **चोर-सिपाही** (Raja-Mantri-Chor-Sipahi) — chitthi wala khel, 4 khiladi; 5/10 round; ek phone ghuma ke 4 dost (har koi chupke se chitthi dekhe) ya aap + 3 computer (chitthi khud uthao, computer suspects ke chehre — Chor aksar ghabraya 😅); galat pakda to Mantri ke 800 Chor ko (23 Nov)
- [x] **कंचे** (Marbles, ring game) — mitti par chalk ka ghera, beech mein 13 kanche (plus shape); lakeer se goli, gulel ki tarah kheench ke maaro; jo bahar nikla wo tumhara + ek aur chaal (agar goli khud ghere ke bahar ruki); jahan goli ruki wahin se agli chaal; saamne wale ki goli par seedhi goli = uska ek kancha chheeno; vs Computer + 2 khiladi (23 Nov)
- [x] **गिल्ली-डंडा** — side view maidan; pehla tap gilli uchhalo, doosra tap hawa mein maaro (girti gilli ghutne ki oonchai = sabse door; oonchi/uthti = lofted, fielder pakad sakta; neechi = zameen ke saath, pakad nahi sakta); score danda mein; har pari 6 shot / 3 jaan; vs Computer (computer chase karta hai) + 2 khiladi (23 Nov)
- [x] **कैरम** (Carrom) — 2 khiladi, Pass&Play + vs Computer; asli physics (canvas), slider se striker + gulel jaisa drag; Rani cover, striker foul, aakhri goti tabhi jab Rani dhaki ho, points; AI ghost-ball + simulation, insaani galti ke saath (22 Nov)
- [x] **बाघ-बकरी** (Bagh-Chal) — 4 bagh vs 20 bakri, Pass&Play + vs Computer (side chuno: bakri ya bagh); AI time-limited search (~0.25s/chaal), 5 khaayi = bagh jeete, koi bagh na hile = bakri jeete, 100 chaal bina khaaye = barabari (22 Nov)
- [x] **लूडो** (Ludo) — 2/3/4 khiladi, Pass&Play + vs Computer (smart AI: kaatna, ★ safe, bachna); 6 se bahar, 6/kaat/ghar = ek aur baari, teen 6 = baari gayi, exact number se ghar (22 Nov)
- [x] **क्रिकेट** — Pass&Play + vs Computer: toss, dynamic overs (default 2), bowler pace/spin + delivery, batsman sees incoming ball + picks shot, matchup+risk engine (dot/4/6/OUT, big shot = six/out), proper animated SVG ground (ball + stumps), 2 innings + chase, win by runs/wickets

### Online (Firebase) — kattam done
- [x] Firebase project `desi-games-219a5` (Realtime DB + Anonymous Auth, Spark free)
- [x] `net.js` LocalTransport (2 tabs) + `firebase-net.js` FirebaseTransport (cross-device), same room API
- [x] Authorized domain `desi-games.nextgrade.in` added in Firebase

---

## 🔊 Sound (24 Nov, branch `feat/sound`)
- `sound.js` — saari awaazein Web Audio se banti hain (koi file nahi). `DG.sfx(name, zor)`, `DG.result('win'|'lose'|'draw')`, `DG.buzz(ms)`. 🔊/🔇 button (home + game bar), localStorage `dg-sound`, default ON.

## 🆕 Naye games (24 Nov) · ✅ saare 11 bane (branch feat/sound; pehle 4 commit 0e91940, baaki 7 uncommitted) · ❌ gambling wala koi game nahi
Har game: 4 bhasha, Pass & Play + vs Computer, sound, `games/_kit.js` ke common result/style helpers.
| # | Game | Khel kaise | Computer |
|---|---|---|---|
| 1 | **अंताक्षरी** | akshar milta hai, 20 sec mein gaana gao, saamne wale ✓/✗ den; gaane ka aakhri akshar chuno → doosri team ki baari; 100 point | akele: streak mode (3 jaan) |
| 2 | **लट्टू** | gulel jaisa kheench ke lattu phenko (zor = ghumav), ghere mein takkar; ghumav khatam ya bahar = haar; 3 jhatke; best of 3 | computer phenkta + jhatke deta |
| 3 | **पिट्ठू** | 7 patthar ka dher, ball se giraao (3 mauke), phir fielder ki ball aane se pehle bade se chhote patthar jamao | computer ki baari simulate |
| 4 | **अष्टा-चम्मा** | 5×5 chaupad, 4 kauri: 4 khuli = चम्मा (4), 0 khuli = अष्टा (8) + ek aur baari; kaatna, safe ghar, andar ke ghere mein jaane se pehle ek kaat zaroori | lalchi AI (kaat > safe > aage) |
| 5 | **स्टापू** | gitti phenko (power meter) sahi khaane mein, phir lay mein kood: akela khaana = ek pair, dohra = dono; gitti wala khaana chhodo | galti ki sambhavna ke saath |
| 6 | **गुट्टे** | ek goti uchhalo, hawa mein rehte zameen se 1/2/3/4 goti uthao, phir giri goti pakdo; 4 level | computer ka score simulate |
| 7 | **चिड़िया उड़** | "तोता उड़!" par tap, "भैंस उड़!" par nahi; tez hota jaata; 2 khiladi = upar/neeche button | computer ki reflex |
| 8 | **ज़मीन-आसमान** | bulaane wala bole ज़मीन/आसमान, sahi aadha tap karo; chaalaki: ishara ulta | computer score |
| 9 | **पोशम्पा** | gaane ki lay par darwaza upar-neeche; neeche se niklo, "chor pakda" par andar mat raho | computer bachcha |
| 10 | **कबड्डी** | saans ke andar raid: defenders chhuo aur wapas aao; saans khatam ya 2 ne pakda = out; defend mein sahi waqt par "पकड़ो" | computer raid + defend |
| 11 | **खो-खो** | baithe chaser ko "खो" dekar daudne wale pakdo, 60 sec | computer runners + computer ki chase |

## 👥🏆🙂 Dost · Rank · Main + Gmail login (28 Nov)
- `pages.js`: Dost (room banao/judo, online games, jinke saath khele, WhatsApp invite), Rank (7 titles, XP bar, game table, 14 tamge, 🌍 sabki rank top 50), Main (naam, 18 chehre — sikkon se unlock, hisaab, bhasha/aawaz, record mitao)
- Stats: har game ka `DG.result` app.js mein record hota hai (localStorage `dg-stats`); XP jeet 30/barabar 15/haar 10/pass 12, roz pehla khel +20 sikke
- **Saanp-Seedhi ONLINE** (dice roller bhejta hai, dusra wahi chalta hai); online mein saamne wale ka naam dikhta hai; invite link `?join=CODE`
- **Gmail login optional** (Firebase Google provider, anonymous → linkWithPopup): record `users/{uid}`, rank `lb/{uid}`; rules FIREBASE.md §6 (published 27 Nov)
- `privacy.html` — Google branding verify ke liye (Branding page: home + privacy link + domain nextgrade.in, phir **Verify branding**)

## ⏳ BAAKI / AGLA KAAM
- [ ] **Cricket ONLINE** (alag phone) — engine ready, bas dono ke hidden picks sync karne hain
- [x] **साँप-सीढ़ी online** (28 Nov)
- [ ] Cricket: named teams / 11 players / batting order; balance tuning
- [ ] **Ludo online** (2–4 phone)
- [ ] Carrom 4 khiladi (2v2) + online
- [ ] Aur games (naye idea): पिट्ठू, स्टापू, लट्टू…
- [ ] Repo **private** karna (Pages chalta rahega, hisab jaisе)
- [ ] Android **APK** (Capacitor/TWA) + **AdMob** (kamai)

## 🔧 Notes
- `sw.js` ab **network-first** hai (22 Nov): pehle cache-first tha aur kabhi version nahi badla, isliye purane users ko naye games (Cricket, Nau-Goti) dikhte hi nahi the. Ab internet ho to hamesha naya code, offline ho to cache.

## 🧱 Code map
- `index.html` · `app.css` · `app.js` (lobby/i18n/launcher) · `i18n.js` (DG: games + strings)
- `games/<id>.js` — `DG.register(id,{mount(wrap,{mode,net,role,onExit})})`
- `net.js` + `firebase-net.js` + `firebase-config.js` — online
- Naya game: `games/<id>.js` + GAMES me `play:1` + `index.html` me script tag

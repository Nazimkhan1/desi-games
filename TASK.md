# Desi Games — Progress (kitna hua)

_Updated: 2026-11-22_

**Live:** https://desi-games.nextgrade.in (GitHub Pages, repo public-for-now → baad mein private; HTTPS on)
**Repo:** github.com/Nazimkhan1/desi-games
**Local run:** `cd ~/www/desi-games && python3 -m http.server 7878` → http://localhost:7878
(Chrome port 6666 block karta hai — 7878/8080 use karo.)

---

## ✅ HO GAYA
- [x] App shell + bottom nav + mode sheet + room screen
- [x] **4 bhasha** switcher (हिंदी · English · বাংলা · Hinglish), localized brand wordmark
- [x] **Bespoke design** — "Indigo Night · Brass & Marigold" (pachisi emblem, jali pattern, unified icon chips; NOT generic AI look)
- [x] PWA (manifest + service worker, offline shell) + SVG icon
- [x] **Deploy live** on desi-games.nextgrade.in (GitHub Pages; DNS: `desi-games` CNAME `nazimkhan1.github.io` DNS-only)

### Games (7)
- [x] **कट्टम-कट्टी** (Tic-Tac-Toe) — Pass&Play + vs Computer (minimax) + **ONLINE** (Firebase)
- [x] **साँप-सीढ़ी** (Snakes & Ladders) — Pass&Play + vs Computer
- [x] **कैरम** (Carrom) — 2 khiladi, Pass&Play + vs Computer; asli physics (canvas), slider se striker + gulel jaisa drag; Rani cover, striker foul, aakhri goti tabhi jab Rani dhaki ho, points; AI ghost-ball + simulation, insaani galti ke saath (22 Nov)
- [x] **बाघ-बकरी** (Bagh-Chal) — 4 bagh vs 20 bakri, Pass&Play + vs Computer (side chuno: bakri ya bagh); AI time-limited search (~0.25s/chaal), 5 khaayi = bagh jeete, koi bagh na hile = bakri jeete, 100 chaal bina khaaye = barabari (22 Nov)
- [x] **लूडो** (Ludo) — 2/3/4 khiladi, Pass&Play + vs Computer (smart AI: kaatna, ★ safe, bachna); 6 se bahar, 6/kaat/ghar = ek aur baari, teen 6 = baari gayi, exact number se ghar (22 Nov)
- [x] **क्रिकेट** — Pass&Play + vs Computer: toss, dynamic overs (default 2), bowler pace/spin + delivery, batsman sees incoming ball + picks shot, matchup+risk engine (dot/4/6/OUT, big shot = six/out), proper animated SVG ground (ball + stumps), 2 innings + chase, win by runs/wickets

### Online (Firebase) — kattam done
- [x] Firebase project `desi-games-219a5` (Realtime DB + Anonymous Auth, Spark free)
- [x] `net.js` LocalTransport (2 tabs) + `firebase-net.js` FirebaseTransport (cross-device), same room API
- [x] Authorized domain `desi-games.nextgrade.in` added in Firebase

---

## ⏳ BAAKI / AGLA KAAM
- [ ] **Cricket ONLINE** (alag phone) — engine ready, bas dono ke hidden picks sync karne hain
- [ ] **साँप-सीढ़ी online**
- [ ] Cricket: named teams / 11 players / batting order; balance tuning
- [ ] **Ludo online** (2–4 phone)
- [ ] Carrom 4 khiladi (2v2) + online
- [ ] Aur games: पतंग…
- [ ] Repo **private** karna (Pages chalta rahega, hisab jaisе)
- [ ] Android **APK** (Capacitor/TWA) + **AdMob** (kamai)

## 🔧 Notes
- `sw.js` ab **network-first** hai (22 Nov): pehle cache-first tha aur kabhi version nahi badla, isliye purane users ko naye games (Cricket, Nau-Goti) dikhte hi nahi the. Ab internet ho to hamesha naya code, offline ho to cache.

## 🧱 Code map
- `index.html` · `app.css` · `app.js` (lobby/i18n/launcher) · `i18n.js` (DG: games + strings)
- `games/<id>.js` — `DG.register(id,{mount(wrap,{mode,net,role,onExit})})`
- `net.js` + `firebase-net.js` + `firebase-config.js` — online
- Naya game: `games/<id>.js` + GAMES me `play:1` + `index.html` me script tag

# Desi Games — Kaam ka hisaab (TASK)

_Last updated: 2026-11-22_

Ek app jisme bachpan wale saare desi games — **online** (dost ke saath room-code se) aur **offline** (Pass & Play + vs Computer). 4 bhasha: हिंदी · English · বাংলা · Hinglish. Free, bina login. PWA → baad me Android APK.

## Run (local)
```
cd ~/www/desi-games
python3 -m http.server 7878 --bind 127.0.0.1
# browser: http://localhost:7878
```
Note: **Chrome port 6666 block karता hai** (unsafe port) — 7878 / 8080 / 5173 use karo.

---

## ✅ Ho gaya
- [x] App shell — dark game-lobby UI (home, hero, game grid, bottom nav)
- [x] 4-language switcher (localStorage me yaad rehta hai)
- [x] Mode sheet (Online / Pass & Play / vs Computer)
- [x] Room-code screen (UI preview + WhatsApp/copy share)
- [x] PWA: manifest + service worker (offline shell) + icon
- [x] **Game 1 — कट्टम-कट्टी (Tic-Tac-Toe):** Pass & Play + vs Computer (minimax AI)
- [x] **Game 2 — साँप-सीढ़ी (Snakes & Ladders):** 2-player board, snakes+ladders, dice, Pass & Play + vs Computer
- [x] GitHub pe push (private): github.com/Nazimkhan1/desi-games

## 🔧 Abhi / Agla kaam
- [ ] **Online multiplayer** — room create/join by code, turn sync
      - Architecture: transport-abstracted (abhi local, baad me Firebase)
      - Firebase (free Spark plan): Realtime DB + Anonymous Auth — `/rooms/{code}` me game state
      - **Tumhe karna hai:** ek free Firebase project banana + config dena (main code ready rakhता hoon)
- [ ] Aur games: बाघ-बकरी, नौ-गोटी, लूडो, कैरम, पतंग काटो … (same `games/<id>.js` pattern)
- [ ] Android APK (Capacitor/TWA) + Play Store + AdMob (kamai)

## 🧱 Code structure
- `index.html` — shell markup + script tags
- `app.css` — lobby + game-screen styles (dark theme tokens)
- `i18n.js` — `window.DG`: games catalogue + 4-lang strings
- `app.js` — lobby logic, i18n, game launcher
- `games/<id>.js` — har game ek module: `DG.register(id, { mount(wrap,{mode,onExit}) })`
- `manifest.webmanifest`, `sw.js`, `icons/` — PWA

### Naya game add karne ka tarीka
1. `games/<id>.js` banao → `DG.register('<id>', { mount(wrap, opts){ ... } })`
2. `i18n.js` ki GAMES me us id pe `play:1` set karo (naam pehle se hai)
3. `index.html` me `<script src="games/<id>.js">` add karo (app.js se pehle)

# Desi Games 🎮

Bachpan wale saare desi games — ek app mein. Online (dost ke saath, room-code) ya offline (Pass & Play / vs Computer). Free, bina login, 4 bhasha (हिंदी · English · বাংলা · Hinglish).

PWA (no build step) → baad mein Capacitor/TWA se Android APK.

## Run locally
```
cd desi-games
python3 -m http.server 8080
# open http://localhost:8080
```
(Service worker + manifest HTTP pe chahiye, isliye `file://` nahi — koi bhi static server chalega.)

## Structure
- `index.html` — app shell (lobby + sheets + game container)
- `app.css` — dark game-lobby styles + game screen
- `i18n.js` — games catalogue + 4-language strings (`window.DG`)
- `app.js` — lobby logic, i18n, game launcher
- `games/<id>.js` — each game: `DG.register(id, { mount(wrap,{mode,onExit}) })`
- `manifest.webmanifest`, `sw.js`, `icons/` — PWA

## Status
- ✅ Shell + 4-language switcher + mode sheet + room UI (online preview)
- ✅ **कट्टम-कट्टी (Tic-Tac-Toe)** — Pass & Play + vs Computer (minimax) working, offline
- ✅ साँप-सीढ़ी, क्रिकेट, नौ-गोटी, लूडो (2–4 players), बाघ-बकरी, कैरम, पतंग काटो, चोर-सिपाही (Raja-Mantri-Chor-Sipahi)
- ⏳ More games — same `games/<id>.js` pattern
- ⏳ Online multiplayer — Firebase (Realtime DB + anon auth), room-code sync (Phase 2, free tier)

## Roadmap
1. MVP (this): shell + first game, offline modes
2. More turn-based games (pass-play + AI)
3. Firebase online rooms (create/join by code)
4. Android APK (Capacitor/TWA) + AdMob

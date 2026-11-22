# Firebase Online Setup (free — Spark plan)

Online cross-device multiplayer (alag-alag phone pe dost ke saath) ke liye ek free Firebase project chahiye. Bina iske app **local transport** pe chalega (same browser ke 2 tab test kar sakte ho). Yeh steps ek baar karne hain:

## 1. Project banao
1. https://console.firebase.google.com → **Add project**
2. Naam: `desi-games` (ya kuch bhi) → Continue → (Analytics off chalega) → **Create project**

## 2. Realtime Database on karo
1. Left menu → **Build → Realtime Database** → **Create Database**
2. Location choose karo (koi bhi) → **Start in locked mode** → Enable
3. **Rules** tab me yeh paste karke **Publish** karo:
```json
{
  "rules": {
    "rooms": {
      "$code": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```
_(sirf logged-in — anonymous bhi — users read/write kar sakte hain; har room apne code ke andar.)_

## 3. Anonymous login on karo
1. **Build → Authentication → Get started**
2. **Sign-in method** → **Anonymous** → Enable → Save

## 4. Web app config lo
1. Project Overview (⚙️ → **Project settings**) → niche **Your apps** → **Web** icon `</>`
2. App nickname: `desi-games-web` → Register app
3. Jo `firebaseConfig = { ... }` dikhega, usko copy karo

## 5. Config paste karo
`firebase-config.js` kholo aur `null` ki jagah apna config daalo:
```js
window.DG_FIREBASE_CONFIG = {
  apiKey: "AIza...",
  authDomain: "desi-games-xxxx.firebaseapp.com",
  databaseURL: "https://desi-games-xxxx-default-rtdb.firebaseio.com",
  projectId: "desi-games-xxxx",
  appId: "1:xxxx:web:xxxx"
};
```
> ⚠️ `databaseURL` zaroori hai — agar config me na ho to Realtime Database page se copy karo.

## Bas!
Ab app online chalega: ek phone **रूम बनाओ** → code dost ko bhejो → dusre phone **कोड डालो** → saath khelो. Browser console me `[DG] Firebase online transport active` dikhega.

### Free tier limits (kaafi hain)
- 100 simultaneous connections, 1 GB storage, 10 GB/month download
- Turn-based games (कट्टम-कट्टी etc.) me data bahut kam — hazaron games easily.

### Note (security)
`firebase-config.js` ke values **public** hote hain (web app me dikhte hi hain) — yeh secret nahi, normal hai. Asli protection Database **Rules** se aati hai (step 2).

/* Firebase config for ONLINE (cross-device) multiplayer.
 * Jab tak yeh null hai, app LOCAL transport use karta hai (same browser ke 2 tab).
 * Real online ke liye: FIREBASE.md ke steps follow karke neeche apna config paste karo,
 * null ki jagah apna { apiKey:..., authDomain:..., databaseURL:..., projectId:..., ... } rakho.
 *
 * Example (apne project ka asli value daalo):
 * window.DG_FIREBASE_CONFIG = {
 *   apiKey: "AIza...",
 *   authDomain: "desi-games-xxxx.firebaseapp.com",
 *   databaseURL: "https://desi-games-xxxx-default-rtdb.firebaseio.com",
 *   projectId: "desi-games-xxxx",
 *   appId: "1:xxxx:web:xxxx"
 * };
 */
window.DG_FIREBASE_CONFIG = null;

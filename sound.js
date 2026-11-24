/* Desi Games sound: every effect is made live with Web Audio (no audio files, works offline).
   DG.sfx(name, strength0to1)  ·  DG.buzz(ms|pattern)  ·  DG.sound.on / DG.sound.toggle()
   Choice is saved in localStorage 'dg-sound' (default ON). */
(function () {
  var KEY = 'dg-sound';
  var on = true;
  try { on = localStorage.getItem(KEY) !== '0'; } catch (e) {}

  var ctx = null, master = null, noiseBuf = null;
  function ac() {
    if (ctx) { if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} } return ctx; }
    var C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    try { ctx = new C(); } catch (e) { return null; }
    master = ctx.createGain(); master.gain.value = 0.55;
    var comp = ctx.createDynamicsCompressor(); // keeps stacked sounds (carrom break, crowd) from clipping
    master.connect(comp); comp.connect(ctx.destination);
    var n = ctx.sampleRate * 1.5; noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0); for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }
  // Phones only allow audio after a touch: create/resume the context on the first one.
  function unlock() { if (on) ac(); }
  ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) { document.addEventListener(ev, unlock, { capture: true, passive: true }); });

  /* ---------- building blocks ---------- */
  function env(g, t, a, peak, dec) { // attack, peak gain, exponential decay
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  }
  function tone(o) { // {f, f2, type, at, a, v, d}
    var c = ctx, t = c.currentTime + (o.at || 0);
    var osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(o.f, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + (o.a || 0.005) + o.d);
    env(g, t, o.a || 0.005, o.v || 0.3, o.d);
    osc.connect(g); g.connect(master); osc.start(t); osc.stop(t + (o.a || 0.005) + o.d + 0.05);
    return osc;
  }
  function noise(o) { // {at, a, v, d, ft:'bandpass'|'lowpass'|'highpass', f, f2, q}
    var c = ctx, t = c.currentTime + (o.at || 0);
    var src = c.createBufferSource(); src.buffer = noiseBuf;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    var fl = c.createBiquadFilter(); fl.type = o.ft || 'bandpass'; fl.Q.value = o.q || 1;
    fl.frequency.setValueAtTime(o.f || 1500, t);
    if (o.f2) fl.frequency.exponentialRampToValueAtTime(o.f2, t + (o.a || 0.005) + o.d);
    var g = c.createGain(); env(g, t, o.a || 0.003, o.v || 0.3, o.d);
    src.connect(fl); fl.connect(g); g.connect(master);
    src.start(t, Math.random() * 0.8); src.stop(t + (o.a || 0.003) + o.d + 0.05);
    return { src: src, g: g, t: t };
  }
  function bell(f, at, v, d) { tone({ f: f, at: at, v: v || 0.22, d: d || 0.7, type: 'sine' }); tone({ f: f * 2.76, at: at, v: (v || 0.22) * 0.25, d: (d || 0.7) * 0.5 }); }
  function wood(f, at, v) { tone({ f: f, f2: f * 0.7, at: at, v: v || 0.35, d: 0.07, type: 'triangle' }); noise({ at: at, f: f * 2.2, q: 3, v: (v || 0.35) * 0.6, d: 0.03 }); }
  function vary(x) { return x * (0.94 + Math.random() * 0.12); } // tiny pitch change so repeats don't sound robotic

  /* ---------- the sounds ---------- */
  var S = {
    tap:    function () { tone({ f: vary(660), f2: 520, v: 0.12, d: 0.05, type: 'triangle' }); },
    place:  function () { wood(vary(820), 0, 0.4); },                        // ✕ / goti rakhi / bakri rakhi
    place2: function () { wood(vary(560), 0, 0.4); },                        // ◯ / second player
    slide:  function () { noise({ f: 900, f2: 1800, q: 1.5, v: 0.14, a: 0.02, d: 0.14 }); wood(vary(700), 0.13, 0.25); },
    step:   function () { tone({ f: vary(1250), f2: 1000, v: 0.12, d: 0.04, type: 'triangle' }); },
    dice:   function () { for (var i = 0; i < 6; i++) { var at = i * 0.06 + Math.random() * 0.03; wood(vary(1100 + Math.random() * 700), at, 0.18 + Math.random() * 0.1); } },
    bonus:  function () { bell(1320, 0, 0.2, 0.55); },                       // 6 aaya / ek aur baari
    ladder: function () { [523, 659, 784, 1047, 1319].forEach(function (f, i) { tone({ f: f, at: i * 0.07, v: 0.18, d: 0.16, type: 'triangle' }); }); },
    snake:  function () { noise({ ft: 'highpass', f: 4000, v: 0.16, a: 0.05, d: 0.5 }); tone({ f: 700, f2: 140, at: 0.35, v: 0.2, d: 0.35, type: 'sine' }); },
    capture:function () { noise({ f: 2400, q: 2, v: 0.5, d: 0.06 }); tone({ f: 220, f2: 90, v: 0.4, d: 0.14, type: 'sine' }); }, // khat! (kaata)
    home:   function () { bell(1047, 0, 0.18, 0.4); bell(1568, 0.1, 0.18, 0.6); },
    buzz:   function () { tone({ f: 150, v: 0.12, d: 0.28, type: 'square' }); tone({ f: 153, v: 0.08, d: 0.28, type: 'sawtooth' }); },
    mill:   function () { bell(1175, 0, 0.2, 0.4); bell(1568, 0.13, 0.22, 0.7); },
    growl:  function () { var o = tone({ f: 85, f2: 60, v: 0.3, a: 0.04, d: 0.45, type: 'sawtooth' });
                          var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 22; lg.gain.value = 18;
                          lfo.connect(lg); lg.connect(o.frequency); lfo.start(); lfo.stop(ctx.currentTime + 0.55);
                          noise({ ft: 'lowpass', f: 500, v: 0.25, a: 0.03, d: 0.4 }); capture(0.12); },
    clack:  function (s) { s = s == null ? 0.6 : s; noise({ f: vary(3200), q: 4, v: 0.08 + 0.5 * s, d: 0.025 }); tone({ f: vary(1900), v: 0.05 + 0.2 * s, d: 0.03, type: 'triangle' }); },
    thud:   function (s) { s = s == null ? 0.6 : s; tone({ f: 130, f2: 70, v: 0.1 + 0.4 * s, d: 0.12 }); noise({ ft: 'lowpass', f: 600, v: 0.06 + 0.2 * s, d: 0.06 }); },
    pocket: function () { tone({ f: 210, f2: 70, v: 0.45, d: 0.22 }); noise({ ft: 'lowpass', f: 400, v: 0.2, d: 0.12 }); },
    queen:  function () { S.pocket(); bell(1319, 0.15, 0.2, 0.5); bell(1760, 0.27, 0.2, 0.8); },
    strike: function (s) { s = s == null ? 0.7 : s; wood(vary(480), 0, 0.2 + 0.4 * s); },   // striker / goli chhodi
    pull:   function () { tone({ f: 260, f2: 420, v: 0.06, a: 0.05, d: 0.2, type: 'sine' }); },  // kheencha
    swish:  function () { noise({ f: 500, f2: 2600, q: 2, v: 0.22, a: 0.05, d: 0.22 }); },
    pench:  function () { var n = noise({ f: 2200, q: 6, v: 0.3, a: 0.02, d: 0.45 });
                          var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 28; lg.gain.value = 0.2;
                          lfo.connect(lg); lg.connect(n.g.gain); lfo.start(n.t); lfo.stop(n.t + 0.5); },
    thwack: function () { noise({ f: 1500, q: 1.2, v: 0.6, d: 0.08 }); tone({ f: 300, f2: 110, v: 0.5, d: 0.16, type: 'triangle' }); },
    bat:    function () { tone({ f: 820, f2: 600, v: 0.45, d: 0.06, type: 'triangle' }); noise({ f: 2000, q: 2, v: 0.35, d: 0.03 }); },
    drum:   function () { [0, 0.16, 0.32].forEach(function (at, i) { tone({ f: i === 2 ? 95 : 140, f2: 60, at: at, v: 0.45, d: 0.18 }); noise({ ft: 'lowpass', f: 900, at: at, v: 0.18, d: 0.05 }); }); },
    crowd:  function () { noise({ ft: 'bandpass', f: 1100, q: 0.6, v: 0.32, a: 0.25, d: 1.3 }); noise({ ft: 'bandpass', f: 2300, q: 0.8, at: 0.05, v: 0.15, a: 0.3, d: 1.1 });
                          for (var i = 0; i < 5; i++) tone({ f: 1400 + Math.random() * 900, f2: 1800 + Math.random() * 900, at: 0.15 + Math.random() * 0.6, v: 0.03, a: 0.05, d: 0.25 }); },
    wicket: function () { wood(1500, 0, 0.35); wood(1250, 0.07, 0.3); wood(980, 0.15, 0.25); },
    paper:  function () { noise({ ft: 'highpass', f: 2800, v: 0.14, a: 0.03, d: 0.18 }); noise({ ft: 'highpass', f: 3600, at: 0.12, v: 0.1, a: 0.02, d: 0.12 }); },
    tick:   function (s) { tone({ f: s ? 1760 : 1320, v: s ? 0.16 : 0.09, d: 0.03, type: 'square' }); },     // ghadi; s=1 aakhri seconds
    whistle:function () { var o = tone({ f: 2300, v: 0.16, a: 0.02, d: 0.45, type: 'sine' });
                          var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 32; lg.gain.value = 120;
                          lfo.connect(lg); lg.connect(o.frequency); lfo.start(); lfo.stop(ctx.currentTime + 0.5); },
    hop:    function () { tone({ f: vary(300), f2: 620, v: 0.18, d: 0.09, type: 'triangle' }); noise({ ft: 'lowpass', f: 700, at: 0.08, v: 0.12, d: 0.04 }); },
    toss:   function () { tone({ f: vary(500), f2: 1100, v: 0.13, a: 0.01, d: 0.16, type: 'sine' }); },
    catch:  function () { wood(vary(950), 0, 0.3); tone({ f: 1400, at: 0.03, v: 0.1, d: 0.08, type: 'triangle' }); },
    spin:   function (s) { noise({ f: 300 + 900 * (s == null ? 0.5 : s), q: 8, v: 0.06, a: 0.03, d: 0.2 }); },
    ting:   function () { bell(1568, 0, 0.22, 0.6); },
    win:    function () { [523, 659, 784, 1047].forEach(function (f, i) { tone({ f: f, at: i * 0.11, v: 0.2, d: 0.22, type: 'triangle' }); }); bell(1568, 0.46, 0.2, 0.9); bell(2093, 0.58, 0.12, 0.9); },
    lose:   function () { [392, 330, 262].forEach(function (f, i) { tone({ f: f, f2: f * 0.97, at: i * 0.2, v: 0.18, d: 0.3, type: 'triangle' }); }); tone({ f: 196, f2: 150, at: 0.62, v: 0.16, d: 0.5, type: 'triangle' }); },
    draw:   function () { tone({ f: 523, v: 0.16, d: 0.25, type: 'triangle' }); tone({ f: 523, at: 0.22, v: 0.16, d: 0.35, type: 'triangle' }); }
  };
  function capture(at) { noise({ f: 2400, q: 2, at: at, v: 0.3, d: 0.05 }); }

  var last = {};
  function sfx(name, s) {
    if (!on || !S[name]) return;
    if (!ac() || ctx.state !== 'running' && ctx.state !== 'suspended') return;
    var now = performance.now();
    var gap = (name === 'clack' || name === 'thud' || name === 'step') ? 35 : 20; // collisions can fire many times per frame
    if (last[name] && now - last[name] < gap) return; last[name] = now;
    try { S[name](s); } catch (e) {}
  }
  function buzz(p) { if (!on) return; try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} }

  /* ---------- mute button(s): any element with [data-sound-btn] ---------- */
  function paint() {
    document.querySelectorAll('[data-sound-btn]').forEach(function (b) {
      b.textContent = on ? '🔊' : '🔇'; b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.setAttribute('aria-label', on ? 'Sound on' : 'Sound off'); b.classList.toggle('off', !on);
    });
  }
  function toggle() {
    on = !on; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {}
    paint(); if (on) { ac(); sfx('tap'); }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-sound-btn]');
    if (b) { e.stopPropagation(); toggle(); return; }
    // soft tap for menu/result buttons; game pieces play their own sound
    var btn = e.target.closest && e.target.closest('button');
    if (!btn || btn.disabled) return;
    var inGame = btn.closest('#gameWrap');
    if (!inGame || /(^|\s)[a-z]+-(btn|opt)(\s|$)|seg|pick/.test(btn.className) || btn.closest('[class*="-seg"]')) sfx('tap');
  }, true);
  document.addEventListener('DOMContentLoaded', paint);

  window.DG = window.DG || {};
  DG.sfx = sfx; DG.buzz = buzz;
  DG.sound = { get on() { return on; }, toggle: toggle, paint: paint };
  // result helper: 'win' | 'lose' | 'draw'
  DG.result = function (kind) { sfx(kind); if (kind === 'win') buzz([40, 60, 40]); };
})();

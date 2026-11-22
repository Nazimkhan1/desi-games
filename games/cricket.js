/* Cricket — a bat×ball mind-duel. Bowler picks a delivery (pace or spin set), batsman picks
   a shot; the matchup + risk decide dot/runs/4/6/OUT (a big shot = SIX or OUT). Toss, custom
   overs (default 2), two innings, chase, winner. Modes: pass (2 players, hidden pass) and ai
   (vs Computer). Online reuses the same engine later. Registers into DG. */
(function () {
  if (!document.getElementById('ck-style')) {
    var st = document.createElement('style'); st.id = 'ck-style';
    st.textContent =
      '.ck{display:flex;flex-direction:column;align-items:center;gap:14px;width:min(94vw,380px);}'+
      '.ck-score{width:100%;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:13px 16px;display:flex;align-items:center;justify-content:space-between;}'+
      '.ck-score .big{font-family:var(--font-d);font-weight:800;font-size:1.5rem;} .ck-score .big small{font-size:.9rem;color:var(--ink-soft);font-weight:700;}'+
      '.ck-score .meta{text-align:right;font-size:.74rem;color:var(--ink-soft);font-weight:700;line-height:1.5;}'+
      '.ck-score .meta b{color:var(--marigold);font-family:var(--font-d);}'+
      '.ck-stage{width:100%;min-height:118px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;background:var(--panel-solid);border:1px solid var(--line);border-radius:18px;padding:16px;}'+
      '.ck-prompt{font-family:var(--font-d);font-weight:800;font-size:1.05rem;} .ck-sub{color:var(--ink-soft);font-size:.82rem;}'+
      '.ck-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px;width:100%;}'+
      '.ck-opt{border:1px solid var(--line);cursor:pointer;background:var(--panel-2);color:var(--ink);border-radius:13px;padding:11px 6px;display:flex;flex-direction:column;align-items:center;gap:4px;font-family:var(--font-d);font-weight:700;font-size:.82rem;transition:transform .07s,border-color .15s;}'+
      '.ck-opt:active{transform:scale(.95);} .ck-opt:hover{border-color:var(--marigold);} .ck-opt .e{font-size:1.5rem;}'+
      '.ck-ball{font-family:var(--font-d);font-weight:800;font-size:2.4rem;line-height:1.1;}'+
      '.ck-ball.six{color:var(--marigold);} .ck-ball.four{color:var(--jade);} .ck-ball.out{color:var(--vermilion);}'+
      '.ck-balls{display:flex;gap:5px;flex-wrap:wrap;justify-content:center;}'+
      '.ck-dot{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:.64rem;font-weight:800;font-family:var(--font-d);background:var(--panel-2);border:1px solid var(--line);color:var(--ink-soft);}'+
      '.ck-dot.r{color:var(--ink);} .ck-dot.b{background:rgba(245,165,36,.18);border-color:var(--marigold);color:var(--marigold);} .ck-dot.w{background:rgba(230,96,74,.2);border-color:var(--vermilion);color:#ff9a7a;}'+
      '.ck-btn{border:0;cursor:pointer;font-family:var(--font-d);font-weight:800;font-size:1.05rem;padding:14px 26px;border-radius:14px;color:#2a1803;background:linear-gradient(135deg,var(--marigold),var(--marigold2));transition:transform .08s;} .ck-btn:active{transform:scale(.96);} .ck-btn.ghost{background:var(--panel);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);}'+
      '.ck-step{display:flex;align-items:center;gap:14px;} .ck-step .n{width:40px;height:40px;border-radius:12px;border:1px solid var(--line);background:var(--panel);display:grid;place-items:center;font-family:var(--font-d);font-weight:800;font-size:1.2rem;cursor:pointer;color:var(--ink);} .ck-step .v{font-family:var(--font-d);font-weight:800;font-size:2.2rem;min-width:52px;}'+
      '.ck-row{display:flex;gap:10px;}'+
      '.ck-field{width:100%;max-width:270px;display:block;margin:0 auto;}'+
      '.ck-field .crease{stroke:#efe7d4;stroke-width:1.2;opacity:.6;} .ck-field .stump{stroke:#f3efe3;stroke-width:2.2;stroke-linecap:round;}'+
      '.ck-field .head{fill:#e8c6a0;} .ck-field .pad{fill:#f2ece0;} .ck-field .shadow{fill:rgba(0,0,0,.15);}'+
      '.ck-field .limb{stroke:#2e2015;stroke-width:2.2;stroke-linecap:round;fill:none;}'+
      '.ck-field .bat{fill:url(#ckBat);transform-box:fill-box;transform-origin:0% 0%;transition:transform .18s ease;} .ck-field.swing .bat{transform:rotate(-66deg);}'+
      '.ck-field #ckstumps{transform-box:fill-box;transform-origin:bottom center;transition:transform .32s ease;} .ck-field.out #ckstumps{transform:rotate(18deg);}'+
      '.ck-field .ball{fill:#e23b3b;stroke:#fff;stroke-width:.8;}'+
      '.ck-field .bowl-arm{stroke:#2e2015;stroke-width:2.2;stroke-linecap:round;transform-box:view-box;transform-origin:150px 50px;}'+
      '.ck-field .bowler{transform-box:view-box;transform-origin:150px 54px;}'+
      '.ck-field.bowl .bowler{animation:ckrun .46s ease-in;}'+
      '@keyframes ckrun{0%{transform:translateY(-40px)}25%{transform:translateY(-28px) scaleY(.95)}50%{transform:translateY(-16px) scaleY(1.03)}75%{transform:translateY(-6px) scaleY(.97)}100%{transform:translateY(0)}}'+
      '.ck-field.bowl .bowl-arm{animation:ckbowl .44s .46s ease-in;}'+
      '@keyframes ckbowl{0%{transform:rotate(155deg)}55%{transform:rotate(10deg)}100%{transform:rotate(-15deg)}}';
    document.head.appendChild(st);
  }

  // ---- labels (cricket terms kept in English — universal; chrome localized) ----
  var CL = {
    hi:{ setup:'मैच सेट करो', oversL:'कितने ओवर?', toss:'🪙 टॉस करो', tossWon:function(n){return n+' ने टॉस जीता!';}, pick:'क्या चुनोगे?', bat:'🏏 बैटिंग', bowl:'⚾ बॉलिंग', chose:function(n,c){return n+' ने '+c+' चुना';},
      overLbl:'ओवर', target:'टारगेट', need:function(r,b){return r+' चाहिए, '+b+' गेंद';}, bowlerTurn:function(n){return '⚾ '+n+' — गेंद चुनो';}, batTurn:function(n){return '🏏 '+n+' — शॉट चुनो';},
      passTo:function(n){return '📱 फ़ोन '+n+' को दो';}, ready:'तैयार ✓', bowlType:'गेंदबाज़?', pace:'🔥 तेज़', spin:'🌀 स्पिन',
      out:'OUT! 🎯', sixT:'SIX! 🚀', fourT:'FOUR! 🔥', dotT:'Dot ball', runT:function(n){return n+' रन';},
      inns1:function(n,s){return n+' ने बनाए '+s;}, chaseNow:function(n,t){return n+' को चाहिए '+t;}, allout:'All Out!',
      won:function(n,by){return '🏆 '+n+' जीता — '+by;}, byRuns:function(r){return r+' रन से';}, byWk:function(w){return w+' विकेट से';}, tie:'🤝 मैच टाई!',
      rematch:'↻ नया मैच', exit:'बाहर', inningsOver:'पहली पारी खत्म', startChase:'▶ दूसरी पारी' },
    en:{ setup:'Set up match', oversL:'How many overs?', toss:'🪙 Toss', tossWon:function(n){return n+' won the toss!';}, pick:'Choose:', bat:'🏏 Bat', bowl:'⚾ Bowl', chose:function(n,c){return n+' chose to '+c;},
      overLbl:'Over', target:'Target', need:function(r,b){return 'Need '+r+' off '+b;}, bowlerTurn:function(n){return '⚾ '+n+' — pick a delivery';}, batTurn:function(n){return '🏏 '+n+' — pick a shot';},
      passTo:function(n){return '📱 Pass the phone to '+n;}, ready:'Ready ✓', bowlType:'Bowler?', pace:'🔥 Pace', spin:'🌀 Spin',
      out:'OUT! 🎯', sixT:'SIX! 🚀', fourT:'FOUR! 🔥', dotT:'Dot ball', runT:function(n){return n+' run'+(n>1?'s':'');},
      inns1:function(n,s){return n+' scored '+s;}, chaseNow:function(n,t){return n+' need '+t;}, allout:'All Out!',
      won:function(n,by){return '🏆 '+n+' won — '+by;}, byRuns:function(r){return 'by '+r+' run'+(r>1?'s':'');}, byWk:function(w){return 'by '+w+' wicket'+(w>1?'s':'');}, tie:'🤝 Match tied!',
      rematch:'↻ New match', exit:'Exit', inningsOver:'End of 1st innings', startChase:'▶ 2nd innings' },
    hinglish:{ setup:'Match set karo', oversL:'Kitne over?', toss:'🪙 Toss karo', tossWon:function(n){return n+' ne toss jeeta!';}, pick:'Kya chunoge?', bat:'🏏 Batting', bowl:'⚾ Bowling', chose:function(n,c){return n+' ne '+c+' chuna';},
      overLbl:'Over', target:'Target', need:function(r,b){return r+' chahiye, '+b+' ball';}, bowlerTurn:function(n){return '⚾ '+n+' — ball chuno';}, batTurn:function(n){return '🏏 '+n+' — shot chuno';},
      passTo:function(n){return '📱 Phone '+n+' ko do';}, ready:'Ready ✓', bowlType:'Gendbaaz?', pace:'🔥 Tez', spin:'🌀 Spin',
      out:'OUT! 🎯', sixT:'SIX! 🚀', fourT:'FOUR! 🔥', dotT:'Dot ball', runT:function(n){return n+' run';},
      inns1:function(n,s){return n+' ne banaye '+s;}, chaseNow:function(n,t){return n+' ko chahiye '+t;}, allout:'All Out!',
      won:function(n,by){return '🏆 '+n+' jeeta — '+by;}, byRuns:function(r){return r+' run se';}, byWk:function(w){return w+' wicket se';}, tie:'🤝 Match tie!',
      rematch:'↻ Naya match', exit:'Bahar', inningsOver:'Pehli paari khatam', startChase:'▶ Doosri paari' },
    bn:{ setup:'ম্যাচ সেট করো', oversL:'কত ওভার?', toss:'🪙 টস করো', tossWon:function(n){return n+' টস জিতেছে!';}, pick:'কী বাছবে?', bat:'🏏 ব্যাটিং', bowl:'⚾ বোলিং', chose:function(n,c){return n+' '+c+' বাছল';},
      overLbl:'ওভার', target:'টার্গেট', need:function(r,b){return r+' দরকার, '+b+' বল';}, bowlerTurn:function(n){return '⚾ '+n+' — বল বাছো';}, batTurn:function(n){return '🏏 '+n+' — শট বাছো';},
      passTo:function(n){return '📱 ফোনটা '+n+'-কে দাও';}, ready:'তৈরি ✓', bowlType:'বোলার?', pace:'🔥 পেস', spin:'🌀 স্পিন',
      out:'OUT! 🎯', sixT:'SIX! 🚀', fourT:'FOUR! 🔥', dotT:'Dot ball', runT:function(n){return n+' রান';},
      inns1:function(n,s){return n+' করল '+s;}, chaseNow:function(n,t){return n+'-এর দরকার '+t;}, allout:'All Out!',
      won:function(n,by){return '🏆 '+n+' জিতল — '+by;}, byRuns:function(r){return r+' রানে';}, byWk:function(w){return w+' উইকেটে';}, tie:'🤝 ম্যাচ টাই!',
      rematch:'↻ নতুন ম্যাচ', exit:'বাইরে', inningsOver:'প্রথম ইনিংস শেষ', startChase:'▶ দ্বিতীয় ইনিংস' }
  };

  // ---- deliveries & shots (English cricket terms, universal) ----
  var PACE = [['bouncer','Bouncer','⬆️'],['yorker','Yorker','🎯'],['length','Good Len','📏'],['swing','Swing','🌀'],['slower','Slower','🐢']];
  var SPIN = [['off','Off Spin','🔄'],['leg','Leg Spin','↩️'],['arm','Arm Ball','➡️'],['flight','Flighted','🎈'],['quick','Quicker','⚡']];
  var SHOTS = [['block','Block','🛡️'],['drive','Drive','🏏'],['cut','Cut','✂️'],['sweep','Sweep','🧹'],['pull','Pull','💪'],['loft','Loft','🚀']];
  var AGGR = {block:0,drive:1,cut:1,sweep:1,pull:2,loft:3};
  var FIT = {
    bouncer:{pull:2,cut:1,block:0,loft:-1,drive:-2,sweep:-2},
    yorker:{block:1,drive:-1,cut:-1,loft:-2,pull:-2,sweep:-2},
    length:{drive:2,block:1,cut:0,pull:0,loft:0,sweep:-1},
    swing:{block:1,cut:1,drive:-1,loft:-1,pull:-1,sweep:-1},
    slower:{drive:1,pull:1,block:1,cut:0,sweep:0,loft:-1},
    off:{sweep:2,cut:1,drive:1,block:1,loft:-1,pull:-1},
    leg:{sweep:1,drive:1,block:1,cut:-1,pull:0,loft:-1},
    arm:{block:1,drive:1,cut:0,pull:0,loft:-1,sweep:-2},
    flight:{loft:1,drive:1,block:1,sweep:1,cut:0,pull:-1},
    quick:{block:1,drive:0,pull:0,cut:-1,sweep:-1,loft:-2}
  };
  function clamp(x,a,b){ return Math.max(a,Math.min(b,x)); }
  function playBall(delivery, shot){
    var aggr=AGGR[shot], fit=(FIT[delivery]||{})[shot]||0;
    var outP=clamp(0.05 + aggr*0.10 - fit*0.07, 0.02, 0.82);
    if (Math.random()<outP) return {out:true};
    var power = aggr + fit + Math.random()*1.4 - 0.3;
    var runs = power>=3.0?6 : power>=2.1?4 : power>=1.3?2 : power>=0.5?1 : 0;
    if (shot==='block') runs=Math.min(runs,1);
    if (runs===3) runs=2;
    return {out:false, runs:runs};
  }
  function aiDelivery(type){ var set=type==='spin'?SPIN:PACE; return set[Math.floor(Math.random()*set.length)][0]; }
  function aiShot(chaseHard){
    // weight: safer normally, aggressive when chasing hard
    var pool = chaseHard ? ['loft','pull','drive','loft','pull','cut'] : ['drive','block','cut','drive','sweep','pull','loft'];
    return pool[Math.floor(Math.random()*pool.length)];
  }

  // ---- cricket ground (SVG) ----
  function fieldHTML(){
    var g='';
    for (var i=0;i<12;i++){ g+='<rect x="0" y="'+(i*25)+'" width="300" height="25" fill="'+(i%2?'rgba(255,255,255,.03)':'rgba(0,0,0,.035)')+'"/>'; }
    var fs='';
    FIELDERS.forEach(function(f){ fs+='<g class="fld"><ellipse cx="'+f[0]+'" cy="'+(f[1]+4)+'" rx="4.5" ry="1.5" fill="rgba(0,0,0,.16)"/><ellipse cx="'+f[0]+'" cy="'+f[1]+'" rx="3" ry="4.2" fill="#cdd8ea"/><circle cx="'+f[0]+'" cy="'+(f[1]-5)+'" r="2.3" fill="#e8c6a0"/></g>'; });
    return '<svg class="ck-field" id="ckfield" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">'+
      '<defs>'+
        '<radialGradient id="ckGrass" cx="0.5" cy="0.3" r="0.9"><stop offset="0" stop-color="#46ac69"/><stop offset="1" stop-color="#2d8150"/></radialGradient>'+
        '<linearGradient id="ckPitch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d0b27f"/><stop offset="1" stop-color="#c29c5f"/></linearGradient>'+
        '<linearGradient id="ckRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f06d5c"/><stop offset="1" stop-color="#bd362b"/></linearGradient>'+
        '<linearGradient id="ckBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6cb2f0"/><stop offset="1" stop-color="#3b76c2"/></linearGradient>'+
        '<linearGradient id="ckBat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e7bf72"/><stop offset="1" stop-color="#b5842c"/></linearGradient>'+
      '</defs>'+
      '<rect width="300" height="300" fill="url(#ckGrass)"/>'+ g +
      '<polygon class="pit" points="134,42 166,42 198,258 102,258" fill="url(#ckPitch)"/>'+
      '<line class="crease" x1="124" y1="66" x2="176" y2="66"/><line class="crease" x1="102" y1="238" x2="198" y2="238"/>'+
      '<g><line class="stump" x1="147" y1="38" x2="147" y2="48"/><line class="stump" x1="150" y1="38" x2="150" y2="48"/><line class="stump" x1="153" y1="38" x2="153" y2="48"/></g>'+
      '<g id="ckstumps"><line class="stump" x1="145" y1="246" x2="145" y2="262"/><line class="stump" x1="150" y1="246" x2="150" y2="262"/><line class="stump" x1="155" y1="246" x2="155" y2="262"/></g>'+
      fs+
      '<g><ellipse class="shadow" cx="202" cy="70" rx="6" ry="2"/><rect x="198" y="58" width="8" height="13" rx="3" fill="#ededea"/><circle cx="202" cy="53" r="4" fill="#e8c6a0"/><rect x="197" y="48" width="10" height="3" rx="1.5" fill="#20304f"/></g>'+
      '<g class="bowler"><ellipse class="shadow" cx="150" cy="68" rx="8" ry="2.4"/><path class="limb" d="M150 56 L145 67 M150 56 L156 66"/><path class="body" d="M143 46 Q150 42 157 46 L155 58 Q150 61 145 58 Z" fill="url(#ckBlue)"/><circle class="head" cx="150" cy="41" r="4.6"/><path class="limb" d="M150 50 L143 56"/><line class="bowl-arm" x1="150" y1="50" x2="150" y2="36"/></g>'+
      '<circle class="ball" id="ckball" cx="150" cy="54" r="5"/>'+
      '<g class="batsman"><ellipse class="shadow" cx="150" cy="241" rx="17" ry="3.8"/><rect class="pad" x="143" y="216" width="7" height="24" rx="3.5"/><rect class="pad" x="151" y="216" width="7" height="24" rx="3.5"/><rect x="143" y="238" width="7.5" height="4.5" rx="1.5" fill="#222"/><rect x="150.5" y="238" width="7.5" height="4.5" rx="1.5" fill="#222"/><path class="body" d="M138 192 Q150 185 162 192 L159 216 Q150 221 141 216 Z" fill="url(#ckRed)"/><circle class="head" cx="150" cy="184" r="7"/><path d="M142 183 A8 8 0 0 1 158 183 L158 186 L142 186 Z" fill="#232a3a"/><rect x="150" y="183" width="9" height="5.5" rx="1.2" fill="#4a5262"/><path class="limb" d="M150 200 L167 206"/><circle cx="168" cy="207" r="3.2" fill="#f0f0f0"/><polygon class="bat" points="166,205 170,205 174,224 176,240 168,241 165,224"/></g>'+
      '<g><ellipse class="shadow" cx="150" cy="288" rx="11" ry="3"/><path class="limb" d="M150 280 L146 288 M150 280 L154 288"/><path class="body" d="M144 266 Q150 263 156 266 L155 280 Q150 283 145 280 Z" fill="url(#ckBlue)"/><circle class="head" cx="150" cy="259" r="5"/><path d="M144.5 258 A5.5 5.5 0 0 1 155.5 258 L155.5 260 L144.5 260 Z" fill="#232a3a"/><circle cx="143" cy="270" r="3" fill="#f0f0f0"/><circle cx="157" cy="270" r="3" fill="#f0f0f0"/></g>'+
      '</svg>';
  }
  var FIELDERS = [[56,122],[244,122],[36,190],[264,190],[92,270],[208,270]];
  var BOUNDARY = [[10,150],[290,150],[150,296],[28,250],[272,250],[40,34],[260,34]];
  function mv(ball, tx, ty, dur, ease){ ball.style.transition='transform '+dur+'s '+(ease||'ease-out'); ball.style.transform='translate('+(tx-150)+'px,'+(ty-54)+'px)'; }
  function pulse(fl, s){ if(!fl) return; fl.style.transformBox='fill-box'; fl.style.transformOrigin='center'; fl.style.transition='transform .18s ease-out'; setTimeout(function(){ fl.style.transform='scale('+s+')'; }, 430); setTimeout(function(){ fl.style.transform='scale(1)'; }, 1000); }
  function animateBall(result, cb){
    var field=document.getElementById('ckfield'), ball=document.getElementById('ckball');
    if (!field || !ball){ return cb && cb(); }
    var flds = field.querySelectorAll('.fld');
    field.classList.remove('swing','out','bowl');
    ball.style.transition='none'; ball.style.transform='translate(0,-40px)';   // ball in hand, start of run-up
    void field.offsetWidth;
    field.classList.add('bowl');                 // 1) bowler runs up (carrying the ball) to the crease
    ball.style.transition='transform .46s ease-in'; ball.style.transform='translate(0,0)';   // ball moves WITH the bowler
    setTimeout(function(){                         // 2) release from the crease: ball speeds down the pitch
      ball.style.transition='transform .5s linear'; ball.style.transform='translate(0px,162px)';
    }, 820);
    setTimeout(function(){                          // 3) ball reaches the batsman
      field.classList.add('swing');                // 4) batsman swings and hits
      setTimeout(function(){                         // 5) ball goes where the shot sent it
        if (result.out){
          if (Math.random() < 0.4){ field.classList.add('out'); mv(ball, 156, 230, .34); }  // bowled
          else { var fi=Math.floor(Math.random()*FIELDERS.length), f=FIELDERS[fi]; mv(ball, f[0], f[1], .5); pulse(flds[fi], 1.9); }  // caught
        }
        else if (result.runs===6){ ball.style.transition='transform .72s cubic-bezier(.2,.7,.3,1)'; ball.style.transform='translate(70px,-175px)'; }  // over the top
        else if (result.runs===4){ var bp=BOUNDARY[Math.floor(Math.random()*BOUNDARY.length)]; mv(ball, bp[0], bp[1], .62); }  // races to the boundary
        else if (result.runs>0){ var gi=Math.floor(Math.random()*FIELDERS.length), g=FIELDERS[gi]; mv(ball, g[0], g[1], .5); pulse(flds[gi], 1.5); }  // fielded
        else { mv(ball, 156, 218, .3); }  // defended, stays
        setTimeout(function(){ cb && cb(); }, 700);
      }, 170);
    }, 820+500);
  }

  DG.register('cricket', {
    mount: function (wrap, opts) {
      var mode = opts.mode;               // 'pass' | 'ai'
      var S = null;
      function L(){ return CL[DG.lang]||CL.en; }
      function pname(side){ var t=DG.t(); if(mode==='ai') return side===0?t.you:t.computer; return side===0?t.p1:t.p2; }
      function human(side){ return mode==='pass' ? true : side===0; } // in ai, only side 0 is human

      function screen(node){ wrap.innerHTML=''; var box=document.createElement('div'); box.className='ck'; box.appendChild(node); wrap.appendChild(box); }
      function el(tag,cls,html){ var e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }

      // ---------- setup: overs + toss ----------
      function setup(){
        var overs=2;
        var n=el('div','ck-stage');
        n.appendChild(el('div','ck-prompt','🏏 '+L().setup));
        n.appendChild(el('div','ck-sub',L().oversL));
        var step=el('div','ck-step');
        var minus=el('button','n','−'), val=el('div','v','2'), plus=el('button','n','+');
        step.appendChild(minus); step.appendChild(val); step.appendChild(plus); n.appendChild(step);
        minus.onclick=function(){ overs=Math.max(1,overs-1); val.textContent=overs; };
        plus.onclick=function(){ overs=Math.min(10,overs+1); val.textContent=overs; };
        var toss=el('button','ck-btn',L().toss); toss.style.marginTop='4px'; n.appendChild(toss);
        toss.onclick=function(){ doToss(overs); };
        screen(n);
      }

      // ---------- toss ----------
      function doToss(overs){
        var winner=Math.floor(Math.random()*2);
        var maxWk=Math.max(3, Math.ceil(overs*1.2));
        S={overs:overs, maxWk:maxWk, innings:1, score:[0,0], wk:[0,0], balls:[0,0], log:[[],[]], tossWinner:winner, bat:null, target:null, bowlType:null};
        var n=el('div','ck-stage');
        n.appendChild(el('div','ck-ball','🪙'));
        n.appendChild(el('div','ck-prompt',L().tossWon(pname(winner))));
        screen(n);
        setTimeout(function(){ chooseBB(winner); }, 1100);
      }
      function chooseBB(winner){
        if (!human(winner)){ // AI won toss → AI bats first
          startInnings(winner); return;
        }
        var n=el('div','ck-stage');
        n.appendChild(el('div','ck-prompt',L().pick));
        var row=el('div','ck-row');
        var b1=el('button','ck-btn',L().bat), b2=el('button','ck-btn ghost',L().bowl);
        row.appendChild(b1); row.appendChild(b2); n.appendChild(row);
        b1.onclick=function(){ startInnings(winner); };
        b2.onclick=function(){ startInnings(winner===0?1:0); };
        screen(n);
      }

      // ---------- innings ----------
      function startInnings(battingSide){
        S.bat=battingSide; S.bowlType=null;
        ballFlow();
      }
      function totalBalls(){ return S.overs*6; }
      function inningsEnded(){
        var b=S.bat;
        if (S.wk[b]>=S.maxWk) return true;
        if (S.balls[b]>=totalBalls()) return true;
        if (S.innings===2 && S.target!=null && S.score[b]>=S.target) return true;
        return false;
      }

      function scoreBoard(){
        var b=S.bat, bowl=b===0?1:0, t=DG.t();
        var sb=el('div','ck-score');
        var left=el('div','');
        left.innerHTML='<div class="big">'+S.score[b]+' <small>/ '+S.wk[b]+'</small></div><div style="font-size:.72rem;color:var(--ink-soft);font-weight:700">'+pname(b)+' 🏏</div>';
        var oversDone=Math.floor(S.balls[b]/6)+'.'+(S.balls[b]%6);
        var meta='<div class="meta">'+L().overLbl+' <b>'+oversDone+'</b>/'+S.overs;
        if (S.innings===2 && S.target!=null){ var need=S.target-S.score[b], bl=totalBalls()-S.balls[b]; meta+='<br>'+L().need(Math.max(0,need),bl); }
        meta+='</div>';
        sb.appendChild(left); sb.insertAdjacentHTML('beforeend',meta);
        return sb;
      }
      function ballStrip(){
        var strip=el('div','ck-balls'); var log=S.log[S.bat].slice(-6);
        log.forEach(function(x){ var d=el('div','ck-dot'+(x==='W'?' w':(x==='4'||x==='6'?' b':(x!=='0'?' r':'')))); d.textContent=x; strip.appendChild(d); });
        return strip;
      }

      // one ball: pick delivery (bowler) then shot (batsman), reveal
      function ballFlow(){
        if (inningsEnded()) return endInnings();
        // new over → choose bowler type
        if (S.balls[S.bat]%6===0){ S.bowlType=null; }
        if (!S.bowlType){ return pickBowlerType(); }
        pickDelivery();
      }
      function stageWrap(inner){
        var n=el('div',''); n.appendChild(scoreBoard());
        var fw=el('div',''); fw.innerHTML=fieldHTML(); n.appendChild(fw);
        var stage=el('div','ck-stage'); inner.forEach(function(x){stage.appendChild(x);}); n.appendChild(stage); n.appendChild(ballStrip()); return n;
      }
      function optionGrid(list, cb){
        var g=el('div','ck-grid');
        list.forEach(function(o){ var btn=el('button','ck-opt','<span class="e">'+o[2]+'</span>'+o[1]); btn.onclick=function(){ cb(o[0]); }; g.appendChild(btn); });
        return g;
      }

      function pickBowlerType(){
        var bowl=S.bat===0?1:0;
        if (!human(bowl)){ S.bowlType=Math.random()<0.5?'spin':'pace'; return pickDelivery(); }
        var n=el('div',''); n.appendChild(scoreBoard());
        var fw=el('div',''); fw.innerHTML=fieldHTML(); n.appendChild(fw);
        var stage=el('div','ck-stage');
        stage.appendChild(el('div','ck-prompt','⚾ '+pname(bowl)));
        stage.appendChild(el('div','ck-sub',L().bowlType));
        var row=el('div','ck-row');
        var p=el('button','ck-btn',L().pace), s=el('button','ck-btn ghost',L().spin);
        row.appendChild(p); row.appendChild(s); stage.appendChild(row);
        p.onclick=function(){ S.bowlType='pace'; pickDelivery(); };
        s.onclick=function(){ S.bowlType='spin'; pickDelivery(); };
        n.appendChild(stage); wrap.innerHTML=''; var b=el('div','ck'); b.appendChild(n); wrap.appendChild(b);
      }

      function pickDelivery(){
        var bowl=S.bat===0?1:0;
        var set=S.bowlType==='spin'?SPIN:PACE;
        if (!human(bowl)){ var d=aiDelivery(S.bowlType); return pickShot(d); }
        var n=stageWrap([ el('div','ck-prompt',L().bowlerTurn(pname(bowl))), optionGrid(set, function(d){ afterBowl(d); }) ]);
        wrap.innerHTML=''; var b=el('div','ck'); b.appendChild(n); wrap.appendChild(b);
      }
      function afterBowl(delivery){
        // pass-play: hide bowler's pick before batsman chooses
        if (mode==='pass'){ passScreen(pname(S.bat), function(){ pickShot(delivery); }); }
        else { pickShot(delivery); }
      }
      function passScreen(toName, cb){
        var n=el('div','ck-stage');
        n.appendChild(el('div','ck-ball','📱'));
        n.appendChild(el('div','ck-prompt',L().passTo(toName)));
        var ok=el('button','ck-btn',L().ready); n.appendChild(ok); ok.onclick=cb;
        screen(n);
      }
      function pickShot(delivery){
        var b=S.bat;
        if (!human(b)){
          var chaseHard=false;
          if (S.innings===2 && S.target!=null){ var need=S.target-S.score[b], bl=totalBalls()-S.balls[b]; chaseHard = need > bl*1.3; }
          return reveal(delivery, aiShot(chaseHard));
        }
        var dInfo = PACE.concat(SPIN).filter(function(x){return x[0]===delivery;})[0]||['','',''];
        var n=stageWrap([
          el('div','ck-prompt','<span style="font-size:1.5rem">'+dInfo[2]+'</span> '+dInfo[1]+'!'),
          el('div','ck-sub',L().batTurn(pname(b))),
          optionGrid(SHOTS, function(s){ reveal(delivery, s); })
        ]);
        wrap.innerHTML=''; var bx=el('div','ck'); bx.appendChild(n); wrap.appendChild(bx);
      }

      function reveal(delivery, shot){
        var b=S.bat, res=playBall(delivery, shot);
        S.balls[b]++;
        var cls='', txt='';
        if (res.out){ S.wk[b]++; S.log[b].push('W'); cls='out'; txt=L().out; }
        else { S.score[b]+=res.runs; S.log[b].push(''+res.runs);
          if (res.runs===6){cls='six';txt=L().sixT;} else if(res.runs===4){cls='four';txt=L().fourT;}
          else if(res.runs===0){txt=L().dotT;} else {txt=L().runT(res.runs);} }
        var dName=(PACE.concat(SPIN).filter(function(x){return x[0]===delivery;})[0]||['','',''])[1];
        var sName=(SHOTS.filter(function(x){return x[0]===shot;})[0]||['','',''])[1];
        var n=el('div',''); n.appendChild(scoreBoard());
        var fw=el('div',''); fw.innerHTML=fieldHTML(); n.appendChild(fw);
        var stage=el('div','ck-stage');
        var big=el('div','ck-ball '+cls, '');
        stage.appendChild(big);
        stage.appendChild(el('div','ck-sub','⚾ '+dName+'  ·  🏏 '+sName));
        n.appendChild(stage); n.appendChild(ballStrip());
        wrap.innerHTML=''; var bx=el('div','ck'); bx.appendChild(n); wrap.appendChild(bx);
        animateBall(res, function(){ big.textContent=txt; setTimeout(ballFlow, 1050); });
      }

      // ---------- innings / match end ----------
      function endInnings(){
        var b=S.bat;
        if (S.innings===1){
          S.target=S.score[b]+1;
          var n=el('div','ck-stage');
          n.appendChild(el('div','ck-prompt',L().inns1(pname(b), S.score[b]+'/'+S.wk[b])));
          n.appendChild(el('div','ck-sub',L().inningsOver));
          var go=el('button','ck-btn',L().startChase); n.appendChild(go);
          go.onclick=function(){ S.innings=2; startInnings(b===0?1:0); };
          screen(n);
        } else {
          matchResult();
        }
      }
      function matchResult(){
        var first=S.bat===0?1:0, chaser=S.bat;  // chaser batted 2nd
        var sc1=S.score[first], sc2=S.score[chaser];
        var t=DG.t(), txt, by;
        if (sc2>=S.target){ by=L().byWk(S.maxWk-S.wk[chaser]); txt=L().won(pname(chaser),by); }
        else if (sc2===sc1){ txt=L().tie; }
        else { by=L().byRuns(sc1-sc2); txt=L().won(pname(first),by); }
        var n=el('div','ck-stage');
        n.appendChild(el('div','ck-ball six','🏆'));
        n.appendChild(el('div','ck-prompt',txt));
        n.appendChild(el('div','ck-sub',pname(first)+' '+sc1+'/'+S.wk[first]+'   •   '+pname(chaser)+' '+sc2+'/'+S.wk[chaser]));
        var row=el('div','ck-row');
        var again=el('button','ck-btn',L().rematch), exit=el('button','ck-btn ghost',L().exit);
        row.appendChild(again); row.appendChild(exit); n.appendChild(row);
        again.onclick=setup; exit.onclick=function(){ opts.onExit&&opts.onExit(); };
        screen(n);
      }

      setup();
      return { destroy:function(){ wrap.innerHTML=''; } };
    }
  });
})();

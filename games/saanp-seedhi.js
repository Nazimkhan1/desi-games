/* Saanp-Seedhi (Snakes & Ladders). 2 players. Modes: pass (both human) / ai (P2 = computer).
   Simplified kids' rules: start at 1, roll 1-6, land exactly on 100 to win (overshoot stays),
   a 6 gives an extra turn. Registers into DG. */
(function () {
  if (!document.getElementById('ss-style')) {
    var st = document.createElement('style'); st.id = 'ss-style';
    st.textContent =
      '.ss-board{display:grid;grid-template-columns:repeat(10,1fr);width:min(94vw,380px);aspect-ratio:1;border-radius:14px;overflow:hidden;box-shadow:var(--shadow);border:2px solid var(--line);}'+
      '.ss-c{position:relative;display:flex;align-items:flex-start;justify-content:flex-start;font-size:.52rem;font-weight:700;color:rgba(255,255,255,.72);padding:2px;line-height:1;}'+
      '.ss-c .mv{position:absolute;right:1px;bottom:0;font-size:.72rem;}'+
      '.ss-c.lad{background:rgba(75,210,106,.30);} .ss-c.sn{background:rgba(255,63,134,.28);}'+
      '.ss-c .toks{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:2px;}'+
      '.ss-c .tok{width:13px;height:13px;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,.5),inset 0 0 0 2px rgba(255,255,255,.5);}'+
      '.ss-wrap{display:flex;flex-direction:column;align-items:center;gap:14px;}'+
      '.ss-dice{width:66px;height:66px;border-radius:18px;border:0;cursor:pointer;background:linear-gradient(135deg,#fff,#ffe6c7);color:#2a1030;font-family:var(--font-d);font-weight:800;font-size:2rem;box-shadow:0 8px 18px rgba(0,0,0,.4);display:grid;place-items:center;transition:transform .1s;}'+
      '.ss-dice:active{transform:scale(.92) rotate(-6deg);} .ss-dice:disabled{opacity:.5;cursor:default;}'+
      '.ss-dice.roll{animation:ssr .5s ease;} @keyframes ssr{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}'+
      '.ss-pips{display:grid;grid-template-columns:repeat(3,10px);grid-template-rows:repeat(3,10px);gap:4px;}'+
      '.ss-pips span{width:10px;height:10px;display:block;}'+
      '.ss-pips span.ss-pip{background:#2a1030;border-radius:50%;box-shadow:inset 0 -1px 1px rgba(255,255,255,.25);}'+
      '.ss-players{display:flex;gap:10px;} .ss-pcard{display:flex;align-items:center;gap:7px;background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:5px 12px;font-family:var(--font-d);font-weight:700;font-size:.82rem;}'+
      '.ss-pcard .d{width:12px;height:12px;border-radius:50%;} .ss-pcard.turn{box-shadow:0 0 0 2px var(--brand);}'+
      '.kk-result{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;} .kk-result .rt{font-family:var(--font-d);font-weight:800;font-size:1.7rem;}'+
      '.kk-actions{display:flex;gap:10px;} .kk-btn{border:0;cursor:pointer;font-family:var(--font-d);font-weight:800;font-size:1rem;padding:13px 22px;border-radius:14px;color:#fff;background:linear-gradient(135deg,var(--brand2),var(--brand));} .kk-btn.ghost{background:var(--panel);color:var(--ink);box-shadow:inset 0 0 0 1.5px var(--line);}';
    document.head.appendChild(st);
  }

  var LAD = {1:38,4:14,9:31,21:42,28:84,36:44,51:67,71:91,80:100};
  var SNK = {16:6,47:26,49:11,56:53,62:19,64:60,87:24,93:73,95:75,98:78};
  var COL = ['#ff3f86','#45b1ff'];
  var PIPS = {1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
  function diceFace(n){ var set=PIPS[n]||[]; var s='<span class="ss-pips">'; for(var i=0;i<9;i++){ s+='<span'+(set.indexOf(i)>=0?' class="ss-pip"':'')+'></span>'; } return s+'</span>'; }

  function numAt(r, c){ // display row r (0 top .. 9 bottom), col c (0..9) -> cell number
    var rb = 9 - r; return (rb % 2 === 0) ? rb*10 + c + 1 : rb*10 + (10 - c);
  }

  DG.register('saanp', {
    mount: function (wrap, opts) {
      var mode = opts.mode, pos = [1,1], turn = 0, over = false, rolling = false;
      var cellByNum = {};

      var pcards = document.createElement('div'); pcards.className = 'ss-players';
      var boardEl = document.createElement('div'); boardEl.className = 'ss-board';
      var dice = document.createElement('button'); dice.className = 'ss-dice'; dice.textContent = '🎲';
      var area = document.createElement('div'); area.className = 'ss-wrap';
      wrap.appendChild(area); area.appendChild(pcards); area.appendChild(boardEl); area.appendChild(dice);

      function pname(i){ var t=DG.t(); if(mode==='ai') return i===0? t.you : t.computer; return i===0? t.p1 : t.p2; }

      function buildBoard(){
        boardEl.innerHTML=''; cellByNum={};
        for (var r=0;r<10;r++) for (var c=0;c<10;c++){
          var n=numAt(r,c); var cell=document.createElement('div'); cell.className='ss-c';
          if (LAD[n]) cell.className+=' lad'; if (SNK[n]) cell.className+=' sn';
          cell.innerHTML='<span>'+n+'</span>'+(LAD[n]?'<span class="mv">🪜</span>':(SNK[n]?'<span class="mv">🐍</span>':''))+'<span class="toks"></span>';
          boardEl.appendChild(cell); cellByNum[n]=cell;
        }
      }
      function renderTokens(){
        for (var n in cellByNum){ cellByNum[n].querySelector('.toks').innerHTML=''; }
        for (var i=0;i<2;i++){ var d=document.createElement('span'); d.className='tok'; d.style.background=COL[i]; cellByNum[pos[i]].querySelector('.toks').appendChild(d); }
      }
      function renderCards(){
        pcards.innerHTML='';
        for (var i=0;i<2;i++){ var el=document.createElement('div'); el.className='ss-pcard'+(turn===i?' turn':'');
          el.innerHTML='<span class="d" style="background:'+COL[i]+'"></span>'+pname(i); pcards.appendChild(el); }
        dice.disabled = over || rolling || (mode==='ai' && turn===1);
      }

      function finish(){
        over=true; DG.result(mode==='ai' && turn===1 ? 'lose' : 'win'); var t=DG.t(); var txt = (mode==='ai') ? (turn===0? t.youWin : t.youLose) : t.wins(pname(turn));
        var r=document.createElement('div'); r.className='kk-result'; r.innerHTML='<div class="rt">'+txt+'</div>';
        var acts=document.createElement('div'); acts.className='kk-actions';
        var again=document.createElement('button'); again.className='kk-btn'; again.textContent=t.rematch; again.onclick=start;
        var exit=document.createElement('button'); exit.className='kk-btn ghost'; exit.textContent=t.exitGame; exit.onclick=function(){ opts.onExit&&opts.onExit(); };
        acts.appendChild(again); acts.appendChild(exit); r.appendChild(acts);
        area.innerHTML=''; area.appendChild(r);
      }

      function step(d){
        var np = pos[turn] + d;
        if (np > 100){ renderCards(); nextIfNeeded(d); return; } // overshoot: stay
        pos[turn] = np; renderTokens(); DG.sfx('step');
        setTimeout(function(){
          if (LAD[pos[turn]]){ pos[turn]=LAD[pos[turn]]; renderTokens(); DG.sfx('ladder'); }
          else if (SNK[pos[turn]]){ pos[turn]=SNK[pos[turn]]; renderTokens(); DG.sfx('snake'); DG.buzz(80); }
          if (pos[turn] === 100){ return finish(); }
          nextIfNeeded(d);
        }, 260);
      }
      function nextIfNeeded(d){
        if (d !== 6){ turn = turn===0?1:0; }
        renderCards();
        if (mode==='ai' && turn===1 && !over){ setTimeout(roll, 600); }
      }

      function roll(){
        if (over || rolling) return;
        rolling=true; dice.classList.add('roll'); renderCards(); DG.sfx('dice');
        var d = 1 + Math.floor(Math.random()*6);
        setTimeout(function(){
          dice.classList.remove('roll'); dice.innerHTML = diceFace(d);
          rolling=false; if (d===6) DG.sfx('bonus'); step(d);
        }, 450);
      }
      dice.onclick = function(){ if (!(mode==='ai' && turn===1)) roll(); };

      function start(){
        pos=[1,1]; turn=0; over=false; rolling=false;
        area.innerHTML=''; area.appendChild(pcards); area.appendChild(boardEl); area.appendChild(dice);
        dice.textContent='🎲'; buildBoard(); renderTokens(); renderCards();
      }
      start();
      return { destroy:function(){ wrap.innerHTML=''; } };
    }
  });
})();

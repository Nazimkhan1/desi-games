/* Kattam-Katti (Tic-Tac-Toe). Modes: pass (2 players, same device) and ai (vs computer, minimax).
   Registers into DG. app.js calls mount(wrap, {mode, onExit}). */
(function () {
  // one-time styles
  if (!document.getElementById('kk-style')) {
    var s = document.createElement('style'); s.id = 'kk-style';
    s.textContent =
      '.kk-board{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:min(78vw,300px);}'+
      '.kk-line{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:5;}'+
      '.kk-line line{stroke:#3a1d08;stroke-width:2.6;stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:100;animation:kkdraw .42s .12s ease forwards;}'+
      '@keyframes kkdraw{to{stroke-dashoffset:0;}}'+
      '.kk-cell{aspect-ratio:1;border:0;cursor:pointer;background:var(--panel);box-shadow:inset 0 0 0 1.5px var(--line);border-radius:18px;display:grid;place-items:center;font-size:clamp(2.4rem,13vw,3.4rem);font-family:var(--font-d);font-weight:800;color:var(--ink-soft);transition:transform .08s,background .15s;}'+
      '.kk-cell:active{transform:scale(.95);} .kk-cell.x{color:var(--brand2);} .kk-cell.o{color:var(--cyan);}'+
      '.kk-cell.win{background:linear-gradient(135deg,var(--brand),var(--gold));color:#2a1030;box-shadow:none;}'+
      '.kk-cell.dis{cursor:default;} '+
      '.kk-result{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;}'+
      '.kk-result .rt{font-family:var(--font-d);font-weight:800;font-size:1.7rem;}'+
      '.kk-actions{display:flex;gap:10px;} .kk-btn{border:0;cursor:pointer;font-family:var(--font-d);font-weight:800;font-size:1rem;padding:13px 22px;border-radius:14px;color:#fff;background:linear-gradient(135deg,var(--brand2),var(--brand));transition:transform .08s;} .kk-btn:active{transform:scale(.96);} .kk-btn.ghost{background:var(--panel);color:var(--ink);box-shadow:inset 0 0 0 1.5px var(--line);}';
    document.head.appendChild(s);
  }

  var LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  function winner(b){ for (var i=0;i<LINES.length;i++){ var l=LINES[i]; if (b[l[0]] && b[l[0]]===b[l[1]] && b[l[1]]===b[l[2]]) return {mark:b[l[0]], line:l}; } return null; }
  function full(b){ return b.every(function(c){ return c; }); }

  function minimax(b, depth, isMax){
    var w = winner(b); if (w) return w.mark==='O' ? 10-depth : depth-10;
    if (full(b)) return 0;
    var best = isMax ? -Infinity : Infinity;
    for (var i=0;i<9;i++){ if(!b[i]){ b[i]=isMax?'O':'X'; var sc=minimax(b,depth+1,!isMax); b[i]=''; best = isMax?Math.max(best,sc):Math.min(best,sc); } }
    return best;
  }
  function bestMove(b){
    // 18% of the time play a random move, so the computer is beatable (fun, not perfect)
    var empty=[]; for(var i=0;i<9;i++) if(!b[i]) empty.push(i);
    if (Math.random() < 0.18) return empty[Math.floor(Math.random()*empty.length)];
    var bi=empty[0], bs=-Infinity;
    for (var k=0;k<empty.length;k++){ var j=empty[k]; b[j]='O'; var sc=minimax(b,0,false); b[j]=''; if(sc>bs){ bs=sc; bi=j; } }
    return bi;
  }

  DG.register('kattam', {
    mount: function (wrap, opts) {
      var mode = opts.mode;                 // 'pass' | 'ai' | 'online'
      var net = opts.net || null;
      var myMark = (mode==='online') ? (opts.role==='host' ? 'X' : 'O') : null;
      var board, turn, over, cells = [];
      var chip = document.createElement('div'); chip.className = 'turn-chip';
      var boardEl = document.createElement('div'); boardEl.className = 'kk-board';
      var area = document.createElement('div');
      area.style.display='flex'; area.style.flexDirection='column'; area.style.alignItems='center'; area.style.gap='18px';
      wrap.appendChild(chip); wrap.appendChild(area); area.appendChild(boardEl);

      function markGlyph(m){ return m==='X' ? '✕' : '◯'; }
      function label(m){ var t=DG.t();
        if (mode==='online') return m===myMark ? t.you : t.navFriends;
        if (mode==='ai') return m==='X' ? t.you : t.computer;
        return m==='X' ? t.p1 : t.p2;
      }
      function myTurnNow(){ return mode==='online' ? (turn===myMark) : (mode==='ai' ? turn==='X' : true); }

      function paintTurn(){
        var t=DG.t(); var col = turn==='X' ? 'var(--brand2)' : 'var(--cyan)';
        var mine = (mode==='ai' && turn==='X') || (mode==='online' && turn===myMark);
        chip.innerHTML = '<span class="mk" style="background:'+col+'"></span>'+
          (mine ? t.yourTurn(markGlyph(turn)) : t.turnOf(label(turn), markGlyph(turn)));
      }

      function reset(){
        board = ['','','','','','','','','']; turn='X'; over=false;
        area.innerHTML=''; area.appendChild(boardEl); boardEl.innerHTML=''; cells=[];
        for (var i=0;i<9;i++){ (function(i){
          var c=document.createElement('button'); c.className='kk-cell'; c.setAttribute('aria-label','cell '+(i+1));
          c.onclick=function(){ play(i); }; boardEl.appendChild(c); cells.push(c);
        })(i); }
        paintTurn();
      }
      function requestReset(){ if (mode==='online' && net) net.send('reset', {}); reset(); }

      function render(){
        for (var i=0;i<9;i++){ var c=cells[i]; c.textContent = board[i]?markGlyph(board[i]):''; c.className='kk-cell'+(board[i]?(' '+board[i].toLowerCase()+' dis'):''); }
      }

      function finish(w){
        over=true;
        var t=DG.t(), txt;
        if (!w) txt = t.drawRes;
        else if (mode==='ai') txt = (w.mark==='X') ? t.youWin : t.youLose;
        else if (mode==='online') txt = (w.mark===myMark) ? t.youWin : t.youLose;
        else txt = t.wins(label(w.mark));
        DG.result(!w ? 'draw' : ((mode==='pass') ? 'win' : ((w.mark===(mode==='ai'?'X':myMark)) ? 'win' : 'lose')));
        if (w){
          setTimeout(function(){ DG.sfx('swish'); }, 120);
          w.line.forEach(function(idx){ cells[idx].classList.add('win'); });
          var cx=function(i){return (i%3)*33.333+16.666;}, cy=function(i){return Math.floor(i/3)*33.333+16.666;};
          var a=w.line[0], c=w.line[2], x1=cx(a),y1=cy(a),x2=cx(c),y2=cy(c);
          var dx=x2-x1,dy=y2-y1,ln=Math.sqrt(dx*dx+dy*dy)||1,ex=dx/ln*11,ey=dy/ln*11;
          var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
          svg.setAttribute('class','kk-line'); svg.setAttribute('viewBox','0 0 100 100'); svg.setAttribute('preserveAspectRatio','none');
          svg.innerHTML='<line x1="'+(x1-ex)+'" y1="'+(y1-ey)+'" x2="'+(x2+ex)+'" y2="'+(y2+ey)+'" pathLength="100"/>';
          boardEl.appendChild(svg);
        }
        setTimeout(function(){
          var r=document.createElement('div'); r.className='kk-result';
          r.innerHTML='<div class="rt">'+txt+'</div>';
          var acts=document.createElement('div'); acts.className='kk-actions';
          var again=document.createElement('button'); again.className='kk-btn'; again.textContent=t.rematch; again.onclick=requestReset;
          var exit=document.createElement('button'); exit.className='kk-btn ghost'; exit.textContent=t.exitGame; exit.onclick=function(){ opts.onExit && opts.onExit(); };
          acts.appendChild(again); acts.appendChild(exit); r.appendChild(acts);
          area.appendChild(r);
          chip.innerHTML='';
        }, w?650:250);
      }

      function place(i, fromRemote){
        board[i]=turn; render(); DG.sfx(turn==='X' ? 'place' : 'place2');
        if (mode==='online' && !fromRemote && net) net.send('move', {i:i});
        var w=winner(board); if (w || full(board)) return finish(w);
        turn = turn==='X' ? 'O' : 'X'; paintTurn();
        if (mode==='ai' && turn==='O'){ aiTurn(); }
      }
      function play(i){
        if (over || board[i]) return;
        if (!myTurnNow()) return;
        place(i, false);
      }

      function aiTurn(){
        var t=DG.t(); chip.innerHTML='<span class="mk" style="background:var(--cyan)"></span>'+t.aiThinking;
        cells.forEach(function(c){ c.classList.add('dis'); });
        setTimeout(function(){
          var i=bestMove(board.slice()); board[i]='O'; render(); DG.sfx('place2');
          var w=winner(board); if (w || full(board)) return finish(w);
          turn='X'; paintTurn();
        }, 480);
      }

      if (mode==='online' && net){
        net.on('move', function(m){ if (over || board[m.i]) return; place(m.i, true); });
        net.on('reset', function(){ reset(); });
      }

      reset();
      return { destroy:function(){ wrap.innerHTML=''; } };
    }
  });
})();

/* Kattam-Katti (Tic-Tac-Toe). Modes: pass (2 players, same device) and ai (vs computer, minimax).
   Registers into DG. app.js calls mount(wrap, {mode, onExit}). */
(function () {
  // one-time styles
  if (!document.getElementById('kk-style')) {
    var s = document.createElement('style'); s.id = 'kk-style';
    s.textContent =
      '.kk-board{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:min(78vw,300px);}'+
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
      var mode = opts.mode; // 'pass' | 'ai'
      var board, turn, over, cells = [];
      var chip = document.createElement('div'); chip.className = 'turn-chip';
      var boardEl = document.createElement('div'); boardEl.className = 'kk-board';
      var area = document.createElement('div'); // holds board or result
      area.style.display='flex'; area.style.flexDirection='column'; area.style.alignItems='center'; area.style.gap='18px';
      wrap.appendChild(chip); wrap.appendChild(area); area.appendChild(boardEl);

      function markGlyph(m){ return m==='X' ? '✕' : '◯'; }
      function label(m){ var t=DG.t(); if(mode==='ai'){ return m==='X' ? t.you : t.computer; } return m==='X' ? t.p1 : t.p2; }

      function paintTurn(){
        var t=DG.t(); var col = turn==='X' ? 'var(--brand2)' : 'var(--cyan)';
        chip.innerHTML = '<span class="mk" style="background:'+col+'"></span>'+
          (mode==='ai' && turn==='X' ? t.yourTurn(markGlyph('X')) : t.turnOf(label(turn), markGlyph(turn)));
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

      function render(){
        for (var i=0;i<9;i++){ var c=cells[i]; c.textContent = board[i]?markGlyph(board[i]):''; c.className='kk-cell'+(board[i]?(' '+board[i].toLowerCase()+' dis'):''); }
      }

      function finish(w){
        over=true;
        var t=DG.t(), txt;
        if (!w) txt = t.drawRes;
        else if (mode==='ai') txt = (w.mark==='X') ? t.youWin : t.youLose;
        else txt = t.wins(label(w.mark));
        if (w){ w.line.forEach(function(idx){ cells[idx].classList.add('win'); }); }
        setTimeout(function(){
          var r=document.createElement('div'); r.className='kk-result';
          r.innerHTML='<div class="rt">'+txt+'</div>';
          var acts=document.createElement('div'); acts.className='kk-actions';
          var again=document.createElement('button'); again.className='kk-btn'; again.textContent=t.rematch; again.onclick=reset;
          var exit=document.createElement('button'); exit.className='kk-btn ghost'; exit.textContent=t.exitGame; exit.onclick=function(){ opts.onExit && opts.onExit(); };
          acts.appendChild(again); acts.appendChild(exit); r.appendChild(acts);
          area.innerHTML=''; area.appendChild(boardEl); area.appendChild(r);
          chip.innerHTML='';
        }, w?650:250);
      }

      function play(i){
        if (over || board[i]) return;
        if (mode==='ai' && turn!=='X') return; // only human taps in ai mode
        board[i]=turn; render();
        var w=winner(board); if (w || full(board)) return finish(w);
        turn = turn==='X' ? 'O' : 'X'; paintTurn();
        if (mode==='ai' && turn==='O'){ aiTurn(); }
      }

      function aiTurn(){
        var t=DG.t(); chip.innerHTML='<span class="mk" style="background:var(--cyan)"></span>'+t.aiThinking;
        cells.forEach(function(c){ c.classList.add('dis'); });
        setTimeout(function(){
          var i=bestMove(board.slice()); board[i]='O'; render();
          var w=winner(board); if (w || full(board)) return finish(w);
          turn='X'; paintTurn();
        }, 480);
      }

      reset();
      return { destroy:function(){ wrap.innerHTML=''; } };
    }
  });
})();

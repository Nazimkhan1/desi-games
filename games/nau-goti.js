/* Nau-Goti (Nine Men's Morris / नौ-गोटी). 2 players. Phases: place 9 each → slide to an
   adjacent point → "fly" anywhere when down to 3. Form a line of 3 (mill) to remove an
   opponent's piece; reduce them below 3 (or no move) to win. Modes: pass + ai. */
(function () {
  if (!document.getElementById('ng-style')) {
    var st = document.createElement('style'); st.id = 'ng-style';
    st.textContent =
      '.ng{display:flex;flex-direction:column;align-items:center;gap:14px;}'+
      '.ng-chip{font-family:var(--font-d);font-weight:800;font-size:1.02rem;padding:8px 16px;border-radius:999px;background:var(--panel);border:1px solid var(--line);display:flex;align-items:center;gap:9px;}'+
      '.ng-chip .mk{width:14px;height:14px;border-radius:50%;}'+
      '.ng-hands{display:flex;gap:18px;font-family:var(--font-d);font-weight:700;font-size:.8rem;color:var(--ink-soft);}'+
      '.ng-hands span{display:flex;align-items:center;gap:6px;} .ng-hands i{width:11px;height:11px;border-radius:50%;display:inline-block;}'+
      '.ng-board{width:min(92vw,330px);height:auto;display:block;touch-action:manipulation;}'+
      '.ng-sq{fill:none;stroke:var(--line);stroke-width:2;} .ng-spoke{stroke:var(--line);stroke-width:2;} .ng-spot{fill:var(--ink-soft);opacity:.5;}'+
      '.ng-tap{fill:transparent;cursor:pointer;} '+
      '.ng-dest{fill:none;stroke:var(--marigold);stroke-width:2;stroke-dasharray:3 3;opacity:.9;}'+
      '.ng-pc{stroke:rgba(0,0,0,.25);stroke-width:1;} .ng-sel{fill:none;stroke:var(--gold);stroke-width:3;}'+
      '.ng-rm{fill:none;stroke:var(--vermilion,#e6604a);stroke-width:3;animation:ngpulse 1s ease-in-out infinite;}'+
      '@keyframes ngpulse{0%,100%{opacity:.4}50%{opacity:1}}'+
      '.ng-result{display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;} .ng-result .rt{font-family:var(--font-d);font-weight:800;font-size:1.6rem;}'+
      '.ng-acts{display:flex;gap:10px;} .ng-btn{border:0;cursor:pointer;font-family:var(--font-d);font-weight:800;font-size:1rem;padding:13px 22px;border-radius:14px;color:#2a1803;background:linear-gradient(135deg,var(--marigold,#f5a524),var(--marigold2,#ffd36b));} .ng-btn.ghost{background:var(--panel);color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);}';
    document.head.appendChild(st);
  }

  var NL = {
    hi:{ place:'गोटी रखो', move:'चाल चलो', remove:'दुश्मन की गोटी हटाओ', fly:' (उड़ान)', left:'हाथ में' },
    en:{ place:'place a piece', move:'make a move', remove:"remove opponent's piece", fly:' (flying)', left:'in hand' },
    hinglish:{ place:'goti rakho', move:'chaal chalo', remove:'dushman ki goti hatao', fly:' (udaan)', left:'haath mein' },
    bn:{ place:'গুটি রাখো', move:'চাল দাও', remove:'প্রতিপক্ষের গুটি সরাও', fly:' (উড়ান)', left:'হাতে' }
  };

  var P = [[0,0],[3,0],[6,0],[0,3],[6,3],[0,6],[3,6],[6,6],[1,1],[3,1],[5,1],[1,3],[5,3],[1,5],[3,5],[5,5],[2,2],[3,2],[4,2],[2,3],[4,3],[2,4],[3,4],[4,4]];
  var ADJ = [[1,3],[0,2,9],[1,4],[0,5,11],[2,7,12],[3,6],[5,7,14],[4,6],[9,11],[1,8,10,17],[9,12],[3,8,13,19],[4,10,15,20],[11,14],[6,13,15,22],[12,14],[17,19],[9,16,18],[17,20],[11,16,21],[12,18,23],[19,22],[14,21,23],[20,22]];
  var MILLS = [[0,1,2],[5,6,7],[0,3,5],[2,4,7],[8,9,10],[13,14,15],[8,11,13],[10,12,15],[16,17,18],[21,22,23],[16,19,21],[18,20,23],[1,9,17],[3,11,19],[4,12,20],[6,14,22]];
  var COL = ['', '#fb7185', '#2dd4bf'];
  var U = 42, O = 24;
  function gx(g){ return O + g * U; }
  function other(p){ return p === 1 ? 2 : 1; }

  function formsMill(b, idx, who){ for (var k=0;k<MILLS.length;k++){ var m=MILLS[k]; if (m.indexOf(idx)>=0 && b[m[0]]===who && b[m[1]]===who && b[m[2]]===who) return true; } return false; }
  function inMill(b, idx){ var who=b[idx]; if(!who) return false; for (var k=0;k<MILLS.length;k++){ var m=MILLS[k]; if (m.indexOf(idx)>=0 && b[m[0]]===who && b[m[1]]===who && b[m[2]]===who) return true; } return false; }
  function pieces(b, who){ var r=[]; for (var i=0;i<24;i++) if (b[i]===who) r.push(i); return r; }
  function empties(b){ var r=[]; for (var i=0;i<24;i++) if (!b[i]) r.push(i); return r; }
  function removable(b, opp){ var all=[],free=[]; for (var i=0;i<24;i++){ if (b[i]===opp){ all.push(i); if(!inMill(b,i)) free.push(i); } } return free.length?free:all; }
  function movesFor(b, who, flying){ var r=[]; var ps=pieces(b,who); for (var j=0;j<ps.length;j++){ var i=ps[j]; var dest = flying?empties(b):ADJ[i].filter(function(d){return !b[d];}); for (var t=0;t<dest.length;t++) r.push([i,dest[t]]); } return r; }

  DG.register('nau', {
    mount: function (wrap, opts) {
      var mode = opts.mode;                 // 'pass' | 'ai'
      var board, turn, placed, selected, removal, over;
      function t(){ return DG.t(); }
      function L(){ return NL[DG.lang] || NL.en; }
      function pname(p){ var x=t(); if(mode==='ai') return p===1? x.you : x.computer; return p===1? x.p1 : x.p2; }
      function isHuman(p){ return mode==='pass' ? true : p===1; }
      function onBoard(p){ return pieces(board,p).length; }
      function flying(p){ return placed[p]>=9 && onBoard(p)===3; }
      function inPlacing(p){ return placed[p] < 9; }

      var chip = document.createElement('div'); chip.className='ng-chip';
      var hands = document.createElement('div'); hands.className='ng-hands';
      var boardWrap = document.createElement('div');
      var area = document.createElement('div'); area.className='ng'; // holds all
      area.appendChild(chip); area.appendChild(hands); area.appendChild(boardWrap);
      wrap.appendChild(area);

      function reset(){
        board = new Array(24).fill(0); turn=1; placed={1:0,2:0}; selected=null; removal=0; over=false;
        area.innerHTML=''; area.appendChild(chip); area.appendChild(hands); area.appendChild(boardWrap);
        render();
      }

      function statusText(){
        var x=L(), who=pname(turn);
        if (removal) return who+' — '+x.remove;
        if (inPlacing(turn)) return who+' — '+x.place;
        return who+' — '+x.move + (flying(turn)?x.fly:'');
      }
      function renderChip(){
        var col = COL[turn];
        chip.innerHTML = '<span class="mk" style="background:'+col+'"></span>'+statusText();
        var x=L();
        hands.innerHTML = '<span><i style="background:'+COL[1]+'"></i>'+pname(1)+': '+Math.max(0,9-placed[1])+' '+x.left+'</span>'+
                          '<span><i style="background:'+COL[2]+'"></i>'+pname(2)+': '+Math.max(0,9-placed[2])+' '+x.left+'</span>';
      }

      function validDests(){
        if (removal || inPlacing(turn) || selected==null) return [];
        return flying(turn) ? empties(board) : ADJ[selected].filter(function(d){return !board[d];});
      }
      function render(){
        renderChip();
        var dests = validDests();
        var rm = removal ? removable(board, other(turn)) : [];
        var s='<svg class="ng-board" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">';
        s+='<rect class="ng-sq" x="'+gx(0)+'" y="'+gx(0)+'" width="'+(6*U)+'" height="'+(6*U)+'" rx="4"/>';
        s+='<rect class="ng-sq" x="'+gx(1)+'" y="'+gx(1)+'" width="'+(4*U)+'" height="'+(4*U)+'" rx="4"/>';
        s+='<rect class="ng-sq" x="'+gx(2)+'" y="'+gx(2)+'" width="'+(2*U)+'" height="'+(2*U)+'" rx="4"/>';
        s+='<line class="ng-spoke" x1="'+gx(3)+'" y1="'+gx(0)+'" x2="'+gx(3)+'" y2="'+gx(2)+'"/>';
        s+='<line class="ng-spoke" x1="'+gx(3)+'" y1="'+gx(4)+'" x2="'+gx(3)+'" y2="'+gx(6)+'"/>';
        s+='<line class="ng-spoke" x1="'+gx(0)+'" y1="'+gx(3)+'" x2="'+gx(2)+'" y2="'+gx(3)+'"/>';
        s+='<line class="ng-spoke" x1="'+gx(4)+'" y1="'+gx(3)+'" x2="'+gx(6)+'" y2="'+gx(3)+'"/>';
        for (var i=0;i<24;i++){
          var x=gx(P[i][0]), y=gx(P[i][1]);
          s+='<circle class="ng-spot" cx="'+x+'" cy="'+y+'" r="3.5"/>';
          if (dests.indexOf(i)>=0) s+='<circle class="ng-dest" cx="'+x+'" cy="'+y+'" r="13"/>';
          if (board[i]){ s+='<circle class="ng-pc" cx="'+x+'" cy="'+y+'" r="12" fill="'+COL[board[i]]+'"/>'; }
          if (selected===i) s+='<circle class="ng-sel" cx="'+x+'" cy="'+y+'" r="14"/>';
          if (rm.indexOf(i)>=0) s+='<circle class="ng-rm" cx="'+x+'" cy="'+y+'" r="15"/>';
          s+='<circle class="ng-tap" data-i="'+i+'" cx="'+x+'" cy="'+y+'" r="16"/>';
        }
        s+='</svg>';
        boardWrap.innerHTML=s;
        boardWrap.querySelector('.ng-board').addEventListener('click', function(e){
          var el=e.target; if(el && el.classList.contains('ng-tap')) onPoint(+el.getAttribute('data-i'));
        });
      }

      function onPoint(i){
        if (over) return;
        if (!isHuman(turn)) return;
        if (removal){
          if (removable(board, other(turn)).indexOf(i)>=0) doRemove(i);
          return;
        }
        if (inPlacing(turn)){
          if (!board[i]){ doPlace(i); }
          return;
        }
        // moving / flying
        if (board[i]===turn){ selected = (selected===i?null:i); DG.sfx('tap'); render(); return; }
        if (selected!=null && !board[i] && validDests().indexOf(i)>=0){ doMove(selected, i); }
      }

      function doPlace(i){ board[i]=turn; placed[turn]++; DG.sfx(turn===1?'place':'place2'); afterAction(i); }
      function doMove(from, to){ board[from]=0; board[to]=turn; selected=null; DG.sfx('slide'); afterAction(to); }
      function afterAction(i){
        if (formsMill(board, i, turn)){
          if (removable(board, other(turn)).length===0){ nextTurn(); return; }
          removal = turn; render(); setTimeout(function(){ DG.sfx('mill'); }, 120);
          if (!isHuman(turn)) setTimeout(aiRemove, 650);
          return;
        }
        nextTurn();
      }
      function doRemove(i){ board[i]=0; removal=0; DG.sfx('capture'); DG.buzz(50); nextTurn(); }

      function nextTurn(){
        turn = other(turn); selected=null;
        // loss check for the player to move (only once their placing is done)
        if (placed[turn]>=9){
          if (onBoard(turn) < 3 || movesFor(board, turn, flying(turn)).length===0){ return finish(other(turn)); }
        }
        render();
        if (mode==='ai' && turn===2 && !over) setTimeout(aiMove, 620);
      }

      /* ---------- AI ---------- */
      function scorePlace(b, i, who){
        var s=0; b[i]=who;
        if (formsMill(b,i,who)) s+=100;
        b[i]=0;
        var opp=other(who); b[i]=opp; if (formsMill(b,i,opp)) s+=60; b[i]=0; // block
        s += ADJ[i].length * 2;                 // central/connected points
        for (var k=0;k<ADJ[i].length;k++) if (b[ADJ[i][k]]===who) s+=3;
        return s + Math.random()*2;
      }
      function scoreMove(b, mv, who){
        var from=mv[0], to=mv[1], s=0, opp=other(who);
        b[from]=0; b[to]=who;
        if (formsMill(b,to,who)) s+=100;
        // does it open a mill we can re-close? small bonus
        b[to]=0; b[from]=who;
        // block: would opponent mill at 'to' next?
        b[to]=opp; if (formsMill(b,to,opp)) s+=50; b[to]=0;
        s += ADJ[to].length*2; for (var k=0;k<ADJ[to].length;k++) if (b[ADJ[to][k]]===who) s+=2;
        return s + Math.random()*2;
      }
      function aiMove(){
        if (over || turn!==2) return;
        if (inPlacing(2)){
          var es=empties(board), best=es[0], bs=-1e9;
          for (var j=0;j<es.length;j++){ var sc=scorePlace(board, es[j], 2); if (sc>bs){bs=sc;best=es[j];} }
          doPlace(best); return;
        }
        var mvs=movesFor(board, 2, flying(2));
        if (!mvs.length) return finish(1);
        var bm=mvs[0], bb=-1e9;
        for (var m=0;m<mvs.length;m++){ var s2=scoreMove(board, mvs[m], 2); if (s2>bb){bb=s2;bm=mvs[m];} }
        doMove(bm[0], bm[1]);
      }
      function aiRemove(){
        var rm = removable(board, 1); if (!rm.length){ removal=0; return nextTurn(); }
        // prefer removing a piece that is part of opponent's near-mill (2 of 3)
        var best=rm[0], bs=-1;
        for (var j=0;j<rm.length;j++){ var i=rm[j], sc=ADJ[i].length;
          for (var k=0;k<MILLS.length;k++){ var m=MILLS[k]; if (m.indexOf(i)>=0){ var c=0,e=0; for(var z=0;z<3;z++){ if(board[m[z]]===1)c++; else if(!board[m[z]])e++; } if(c===2&&e===1) sc+=20; } }
          if (sc>bs){bs=sc;best=i;}
        }
        doRemove(best);
      }

      function finish(winner){
        over=true; DG.result(mode==='ai' && winner!==1 ? 'lose' : 'win');
        var x=t(), txt;
        if (mode==='ai') txt = winner===1 ? x.youWin : x.youLose;
        else txt = x.wins(pname(winner));
        var r=document.createElement('div'); r.className='ng-result';
        r.innerHTML='<div class="rt">'+txt+'</div>';
        var acts=document.createElement('div'); acts.className='ng-acts';
        var again=document.createElement('button'); again.className='ng-btn'; again.textContent=x.rematch; again.onclick=reset;
        var exit=document.createElement('button'); exit.className='ng-btn ghost'; exit.textContent=x.exitGame; exit.onclick=function(){ opts.onExit&&opts.onExit(); };
        acts.appendChild(again); acts.appendChild(exit); r.appendChild(acts);
        area.innerHTML=''; area.appendChild(r);
      }

      reset();
      return { destroy:function(){ wrap.innerHTML=''; } };
    }
  });
})();

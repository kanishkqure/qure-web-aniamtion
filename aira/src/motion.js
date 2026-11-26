/* ======================================================================
   Aira motion helpers — copied from the live qTrack film
   (aira/reference/qtrack-film-final.html = motion-preview-standalone.html @ 12874cc).
   Bodies are unchanged unless marked [AIRA]. Helpers are bound to one stage
   (AiraMotion.bind(stage, opts)) because the storyboard builds 12 stages.
   ====================================================================== */
(function(){
'use strict';
gsap.registerPlugin(CustomEase, TextPlugin, DrawSVGPlugin, MotionPathPlugin);
CustomEase.create('emph',  '0.2,0,0,1');      // entrances
CustomEase.create('glide', '0.45,0,0.15,1');  // camera moves and morphs

function bind(stage, opts){
  const O = Object.assign({W:1600, H:923, curFrom:{x:1660, y:980}}, opts||{});
  const $ = s => stage.querySelector(s);
  const M = {};

  /* offset of el inside the stage, ignoring transforms (qTrack pos) */
  M.pos = el => { let x=0,y=0,n=el; while(n && n!==stage){ x+=n.offsetLeft; y+=n.offsetTop; n=n.offsetParent; } return {x,y,w:el.offsetWidth,h:el.offsetHeight}; };

  M.countUp = (tl, el, from, to, at, dur) =>
    tl.fromTo(el, {textContent:from}, {textContent:to, snap:{textContent:1}, duration:dur, ease:'power2.out'}, at);

  /* qTrack typeIn. [AIRA] returns {end, at(i)}: the time at which character i has been typed,
     so other beats (chips, sweeps) can land on the word that triggers them. */
  M.typeIn = (tl, el, text, at, cps) => {
    const CPS = cps||28; let t = at, acc = ''; const marks = [];
    text.split(/(?<=[.,?])/).forEach(chunk=>{
      const t0 = t; acc += chunk; const d = chunk.length / CPS;
      tl.to(el, {text:{value:acc, delimiter:''}, duration:d, ease:'none'}, t);
      marks.push([acc.length - chunk.length, t0, CPS]);
      t += d;
      if(acc.length < text.length) t += (/[.?]\s*$/.test(chunk) ? .22 : /,\s*$/.test(chunk) ? .12 : 0);
    });
    const atIdx = i => { let m = marks[0]; for(const k of marks) if(k[0] <= i) m = k; return m[1] + (i - m[0] + 1)/m[2]; };
    return {end:t, at:atIdx};
  };

  M.pop = (tl, el, at) => tl.fromTo(el, {scale:0}, {scale:1, duration:.22, ease:'emph'}, at);
  M.swapTo = (tl, from, to, at) => { tl.to(from, {opacity:0, y:-4, duration:.18, ease:'power2.in'}, at); tl.fromTo(to, {opacity:0, y:4}, {opacity:1, y:0, duration:.22, ease:'emph'}, at+.16); };
  M.sweep = (tl, m, at) => tl.to(m, {backgroundSize:'100% 100%, 100% 2px', duration:.45, ease:'power2.inOut'}, at);

  /* cursor glide (MotionPath) + click dip; target responds 0.96 -> 1. [AIRA] start point fits the 923-high stage */
  M.cursorTo = (tl, cur, x, y, at, dur) => {
    const f = O.curFrom;
    tl.set(cur, {x:f.x, y:f.y, scale:1}, at);
    tl.to(cur, {opacity:1, duration:.2, ease:'none'}, at);
    tl.to(cur, {duration:dur||.85, ease:'glide', motionPath:{path:[{x:f.x,y:f.y},{x:(x+f.x)/2+80,y:Math.max(y,O.H*.7)},{x,y}], curviness:1.2}}, at);
  };
  M.click = (tl, cur, at, target) => {
    tl.to(cur, {scale:.96, duration:.1, ease:'power2.out', transformOrigin:'0 0'}, at);
    tl.to(cur, {scale:1, duration:.18, ease:'emph'}, at+.1);
    if(target){ tl.fromTo(target, {scale:1}, {scale:.96, duration:.1, ease:'power2.out', immediateRender:false}, at); tl.to(target, {scale:1, duration:.2, ease:'emph'}, at+.1); }
  };
  M.cursorOut = (tl, cur, at) => tl.to(cur, {opacity:0, x:'+=40', y:'+=60', duration:.4, ease:'glide'}, at);

  /* lift-out clone of a device component (identical pixels, then lifts) — qTrack liftClone */
  M.liftClone = (src, holder) => {
    holder.querySelectorAll(':scope > :not(.lift-shadow)').forEach(n=>n.remove());
    const r = M.pos(src), c = src.cloneNode(true);
    c.style.width = r.w + 'px'; c.style.margin = 0;
    c.style.position = 'relative'; c.style.left = c.style.top = '0px';   // [AIRA] sources may be absolutely placed
    holder.appendChild(c);
    Object.assign(holder.style, {left:r.x+'px', top:r.y+'px', width:r.w+'px', height:r.h+'px'});
    return c;
  };
  /* lift-out (approved): component scales up with a growing shadow; the shell recedes to a
     pre-blurred layer at 35% — qTrack liftOut, unchanged */
  M.liftOut = (tl, holder, src, blur, at, to) => {
    const dev = $('.device');
    tl.set(holder, {visibility:'visible'}, at).set(src, {opacity:0}, at);
    tl.fromTo(holder, {scale:1, y:0, x:0}, Object.assign({scale:1.15, y:-24, x:0, duration:.8, ease:'glide'}, to||{}), at);
    const sh = holder.querySelector('.lift-shadow'); if(sh) tl.fromTo(sh, {opacity:0}, {opacity:1, duration:.8, ease:'glide'}, at);
    tl.to(dev, {opacity:0, scale:.98, duration:.6, ease:'glide'}, at);
    tl.fromTo(blur, {opacity:0, scale:.98}, {opacity:.35, duration:.6, ease:'glide', immediateRender:false}, at);
  };
  /* [AIRA] the reverse: the lifted component settles back into a sharp shell (used CH1 -> CH2,
     where both chapters share the visit view). Same eases and durations as liftOut. */
  M.liftBack = (tl, holder, src, blur, at) => {
    const dev = $('.device');
    tl.to(holder, {scale:1, x:0, y:0, duration:.7, ease:'glide'}, at);
    const sh = holder.querySelector('.lift-shadow'); if(sh) tl.to(sh, {opacity:0, duration:.6, ease:'glide'}, at);
    tl.to(dev, {opacity:1, scale:1, duration:.6, ease:'glide'}, at+.1);
    tl.to(blur, {opacity:0, duration:.5, ease:'glide'}, at+.1);
    tl.set(src, {opacity:1}, at+.7).set(holder, {visibility:'hidden'}, at+.7);
  };
  /* the shell comes back sharp on a new view — qTrack shellIn */
  M.shellIn = (tl, view, at) => {
    const dev = $('.device');
    stage.querySelectorAll('.v').forEach(v=>{ if(v!==view) tl.set(v, {autoAlpha:0}, at); });
    tl.set(view, {autoAlpha:1}, at);
    tl.fromTo(dev, {opacity:0, scale:.98, y:24}, {opacity:1, scale:1, y:0, duration:.7, ease:'emph', immediateRender:false}, at+.05);
  };
  /* qTrack beat exit for a lifted holder: up and out */
  M.liftExit = (tl, els, blur, at) => {
    tl.to(els, {y:'-=46', opacity:0, duration:.5, ease:'glide'}, at);
    if(blur) tl.to(blur, {opacity:0, duration:.5, ease:'glide'}, at);
  };
  /* card entrance — qTrack (.resq / .emr pattern) */
  M.cardIn = (tl, el, at, x, y) => tl.fromTo(el, {opacity:0, x, y:y+20, scale:.98}, {opacity:1, x, y, scale:1, duration:.55, ease:'emph'}, at);
  /* micro-label (site pill) — qTrack .upc entrance */
  M.pillIn = (tl, el, at, x, y) => tl.fromTo(el, {opacity:0, x, y:y+8}, {opacity:1, x, y, duration:.4, ease:'emph'}, at);
  return M;
}
window.AiraMotion = {bind};
})();

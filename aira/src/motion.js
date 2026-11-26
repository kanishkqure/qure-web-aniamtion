/* ======================================================================
   Aira motion helpers — copied from the qTrack film
   (motion-preview.html @ 41b23c5, branch claude/quirky-babbage-3ygcjw).
   Originals are untouched. Changes for Aira are marked  [AIRA].
   Requires GSAP 3.13.0 + CustomEase, TextPlugin, DrawSVGPlugin, MotionPathPlugin.
   ====================================================================== */
(function(){
'use strict';
gsap.registerPlugin(CustomEase, TextPlugin, DrawSVGPlugin, MotionPathPlugin);
CustomEase.create('emph',  '0.2,0,0,1');      // entrances            (qTrack)
CustomEase.create('glide', '0.45,0,0.15,1');  // camera moves, morphs (qTrack)

const M = {};

/* card entrance — qTrack cardIn (underline part dropped: Aira cards have no .lbl .ul)  [AIRA] */
M.cardIn = (tl, el, at, from) => tl.fromTo(el, Object.assign({y:24, opacity:0, scale:.98}, from||{}), {y:0, x:0, opacity:1, scale:1, duration:.55, ease:'emph'}, at);

/* pop — qTrack */
M.pop = (tl, el, at) => tl.fromTo(el, {scale:0}, {scale:1, duration:.24, ease:'emph'}, at);

/* highlight sweep — qTrack sweepIn / sweepOut (two layers: tint + 2 px Peach underline) */
M.sweepIn = (tl, el, at, d) => { tl.set(el, {backgroundPosition:'0% 0%, 0% 100%'}, at);
  tl.fromTo(el, {backgroundSize:'0% 100%, 0% 2px'}, {backgroundSize:'100% 100%, 100% 2px', duration:d||.6, ease:'power2.inOut', immediateRender:false}, at); };
M.sweepOut = (tl, el, at) => { tl.set(el, {backgroundPosition:'100% 0%, 100% 100%'}, at);
  tl.to(el, {backgroundSize:'0% 100%, 0% 2px', duration:.4, ease:'power2.inOut'}, at); };

/* label swap — qTrack swapTo */
M.swapTo = (tl, from, to, at) => { tl.to(from, {opacity:0, y:-4, duration:.18, ease:'power2.in'}, at); tl.fromTo(to, {opacity:0, y:4}, {opacity:1, y:0, duration:.22, ease:'emph'}, at+.16); };

/* typing with natural pauses — qTrack typeIn. [AIRA] optional caret element kept visible while typing; returns end time */
M.typeIn = (tl, el, text, at, cps, caret) => {
  const CPS = cps||28; let t = at, acc = '';
  if(caret) tl.set(caret, {opacity:1}, at);
  text.split(/(?<=[.,?])/).forEach(chunk=>{ acc += chunk; const d = chunk.length / CPS;
    tl.to(el, {text:{value:acc, delimiter:''}, duration:d, ease:'none'}, t); t += d;
    if(acc.length < text.length) t += (/[.?]\s*$/.test(chunk) ? .2 : /,\s*$/.test(chunk) ? .1 : 0); });
  return t;
};

/* pointer press — qTrack click (0.96 -> 1 on pointer and target) */
M.click = (tl, cur, at, target) => { tl.to(cur, {scale:.96, duration:.1, ease:'power2.out', transformOrigin:'0 0'}, at); tl.to(cur, {scale:1, duration:.18}, at+.1);
  if(target){ tl.fromTo(target, {scale:1}, {scale:.96, duration:.1, ease:'power2.out', immediateRender:false}, at); tl.to(target, {scale:1, duration:.2}, at+.1); } };

/* pointer glide — qTrack inline motionPath pattern, made a helper [AIRA] */
M.pointerTo = (tl, cur, at, from, to, d) => { tl.set(cur, {opacity:1, x:from.x, y:from.y}, at);
  tl.to(cur, {duration:d||.8, ease:'glide', motionPath:{path:[from, {x:(from.x+to.x)/2+40, y:(from.y+to.y)/2+60}, to], curviness:1.1}}, at); };
M.pointerOut = (tl, cur, at) => tl.to(cur, {opacity:0, x:'+=30', y:'+=40', duration:.35, ease:'glide'}, at);

/* lift-out — qTrack inline pattern (focus rises + scales, the rest dims to ~35%), made a helper [AIRA] */
M.liftOut = (tl, focus, rest, at, opts) => { const o = Object.assign({dim:.35, blur:0, y:24}, opts||{});
  tl.to(rest, Object.assign({opacity:o.dim, duration:.5, ease:'glide'}, o.blur ? {filter:`blur(${o.blur}px)`} : {}), at);
  tl.fromTo(focus, {autoAlpha:0, y:o.y, scale:.98}, {autoAlpha:1, y:0, scale:1, duration:.55, ease:'emph'}, at+.15); };

/* count-up — qTrack "growth" pattern made generic [AIRA] (integers, or a formatter) */
M.countUp = (tl, el, from, to, at, d, fmt) => { const o = {v:from}; const f = fmt || (v=>String(Math.round(v)));
  tl.to(o, {v:to, duration:d||.8, ease:'glide', onUpdate:()=>{ el.textContent = f(o.v); }}, at); };

/* ring draw — qTrack drawSVG pattern (circle/path drawn on) */
M.ringDraw = (tl, el, at, d) => tl.fromTo(el, {drawSVG:'0%'}, {drawSVG:'100%', duration:d||.6, ease:'glide'}, at);

/* beat exit — qTrack beatOut */
M.beatOut = (tl, beat, at) => tl.to(beat, {autoAlpha:0, y:-16, duration:.4, ease:'glide'}, at);

window.AiraMotion = M;
})();

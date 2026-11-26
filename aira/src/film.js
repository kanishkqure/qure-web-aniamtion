/* ======================================================================
   Aira film — runtime (same lifecycle as the qTrack film):
   fit to container · one master timeline (labels ch1 · ch2 · ch3 · ch4 · end) ·
   window event "aira:chapter" (detail 1–4) on each chapter start ·
   data-start / data-end segment playback · autoplay in view, loop, pause off-screen ·
   prefers-reduced-motion: the CH2 "accepted" frame, static.
   API: window.airaFilm = {ready, timeline, labels, duration, keyframes, segment}
   ====================================================================== */
(function(){
'use strict';
const film = document.getElementById('aira-film');
const stage = AiraStage.build(film);
function fit(){ stage.style.transform = 'scale(' + (film.clientWidth / 1600) + ')'; }
new ResizeObserver(fit).observe(film); fit();

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]rm=1/.test(location.search);
const api = window.airaFilm = {ready:false, timeline:null, labels:null, duration:0, keyframes:null, segment:null};

function playSegment(master, T){
  const s = film.dataset.start, e = film.dataset.end;
  if(!s || !(s in T)) return false;
  const order = ['ch1','ch2','ch3','ch4','end'], next = order[order.indexOf(s)+1];
  const end = (e && e in T) ? e : (next === 'end' || !next ? master.duration() : next);
  master.pause();
  api.segment = gsap.timeline({repeat:-1}).add(master.tweenFromTo(s, end, {ease:'none'}));
  return true;
}

Promise.all([document.fonts.ready,
  document.fonts.load('400 13px "IBM Plex Sans"'), document.fonts.load('600 13px "IBM Plex Sans"'), document.fonts.load('700 12px "IBM Plex Sans"'),
  document.fonts.load('500 11px "IBM Plex Mono"'), document.fonts.load('300 22px "Aether Neue"'), document.fonts.load('500 12px "DM Mono"')])
.then(()=>new Promise(r=>{ const w = ()=>document.fonts.status === 'loaded' ? r() : setTimeout(w, 30); w(); }))
.then(()=>{
  fit();
  const {tl, KF, T, TOTAL} = AiraStage.timeline(stage);
  // chapter events (fire on play and on every loop; suppressed while scrubbing with seek)
  [1,2,3,4].forEach(n=>tl.call(()=>window.dispatchEvent(new CustomEvent('aira:chapter', {detail:n})), null, n === 1 ? .001 : T['ch'+n]));
  Object.assign(api, {ready:true, timeline:tl, labels:T, duration:TOTAL, keyframes:KF});
  if(reduce){ tl.seek(KF['02b']); tl.pause(); gsap.set(stage.querySelector('.cursor'), {opacity:0}); }
  else if(!playSegment(tl, T) && !film.hasAttribute('data-manual')) tl.play(0);
  if(!reduce){
    const active = () => api.segment || tl;
    const inView = {v:true};
    const sync = () => { if(film.hasAttribute('data-manual')) return; const go = inView.v && !document.hidden && film.dataset.userPaused !== '1'; go ? active().play() : active().pause(); };
    if('IntersectionObserver' in window)
      new IntersectionObserver(es=>es.forEach(e=>{ inView.v = e.isIntersecting; sync(); }), {threshold:.15}).observe(film);
    document.addEventListener('visibilitychange', sync);
  }
  film.dispatchEvent(new CustomEvent('aira:ready', {detail:{timeline:tl}}));
});
})();

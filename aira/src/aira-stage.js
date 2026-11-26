/* ======================================================================
   Aira film — reduced UI on the qTrack shell, one master timeline.
     AiraStage.build(filmEl)  -> {stage, tl, KF, labels, total}
   Story and content come from aira/assets/screens/*.png; the look and motion come
   from aira/reference/qtrack-film-final.html. Stage: 1600 x 923 (= 1040:600).
   ====================================================================== */
(function(){
'use strict';

/* ---------------- copy (from the screens, plus the two micro-labels from the card copy) ---------------- */
const COPY = {
  product:'Aira', person:'John Doe · 64M', district:'Mocuba district',
  visit:'Fever visit', calls:'Follow-up calls', signals:'District signals',
  listening:'Aira is listening', capturing:'Capturing the consultation',
  symptomsLbl:'Presenting symptoms', writing:'Aira writing', captured:'Captured by Aira',
  clause:'Fever since 3 days, cyclic, with chills and sweating at night.', rest:' Headache, body ache and poor appetite. Does not sleep under a bed net',
  chips:[['Fever · 3 days','3 days'],['Cyclic','cyclic'],['Chills','chills'],['Headache','Headache'],['Body ache','body ache']],
  recOvl:'Aira · Recommendation', recTitle:'Malaria test recommended',
  recBody:'Cyclic fever with chills for 3 days. The national malaria guideline asks for a test before treating.',
  accept:'Accept', dismiss:'Dismiss', accepted:'Recommendation accepted', treatLbl:'Treatment plan', rdt:'Malaria RDT',
  reached:'Reached', pending:'Pending', live:'LIVE', timer0:102, followup:'Follow-up call',
  aira:'Aira', patient:'Patient', listeningSt:'listening', speakingSt:'speaking',
  question:'Has anyone else at home had a fever in the last two weeks?',
  answer:[['Yes, ',0],['my son',1],['. He is ',0],['6',1],[' and has had ',0],['fever since yesterday',1],['.',0]],
  xchips:[['Contact:','son, 6 yrs'],['Fever:','1 day'],['Flagged for malaria test',null]],
  casesLbl:'Cases by district', casesA:96, casesB:214, mocuba:'Mocuba',
  malaria:'Malaria', disease:'Disease', wowA:4, wowB:42,
  chartTitle:'Malaria · Mocuba district', chartSub:'Weekly confirmed cases', threshold:'Alert threshold',
  jump:['+42%','in 2 weeks'], signal:'Signal',
  notifT:'District team alerted', notifS:'Malaria above threshold for 2 weeks in Mocuba', now:'Now',
  label1:'Saved to national EMR · coded', label2:'Validated by the health worker', label4:'Data stays in-country',
};
/* weekly confirmed cases, read off the 04b chart (0–90 axis); threshold drawn at 58 */
const WEEKS = [38,41.8,40,44.9,40.9,43.8,46.9,42.9,46,51.8,62.8,73.7], THR = 58;
/* listening waveform heights, traced from 01a (CSS px at the screen's scale) */
const WAVE_H = [5.5,9.5,5,8,11,18.5,18.5,5,12,16,31.5,16,5,13,27.5,23.5,40.5,5,19.5,25,30,44,4.5,26,15,37.5,20,4.5,19,16.5,24.5,28.5,4.5,17,10,12,25,5,17,6.5,9];
const CWAVE_H = [3,13,5,3,6,3,15,10,5,3,3,10,11,7,11,3,3,7,5,16,4,6];

/* ---------------- DOM helpers ---------------- */
let UID = 0;
function h(tag, cls, html, style){ const e = document.createElement(tag); if(cls) e.className = cls; if(html!=null) e.innerHTML = html; if(style) e.setAttribute('style', style); return e; }
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const CK = w => `<svg width="${w||10}" height="${w||10}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg>`;
const I = {
  search:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/></svg>',
  circle:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="7"/></svg>',
  minus:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>',
  square:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="5" width="14" height="14" rx="3"/></svg>',
  tri:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18 12 6l6 12z"/></svg>',
  mic:'<svg width="16" height="18" viewBox="0 0 22 26" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><rect x="7" y="2" width="8" height="13.5" rx="4"/><path d="M3.2 11.6a7.8 7.8 0 0 0 15.6 0M11 19.6V24"/></svg>',
  phone:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  call:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/><path d="M15 3.5a6 6 0 0 1 5.5 5.5M15 7a2.6 2.6 0 0 1 2 2"/></svg>',
  flag:'<svg width="9" height="10" viewBox="0 0 10 11"><path d="M2 1v9M2 1.4h5.6v4.2H2" fill="#fff" stroke="#fff" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>',
  bell:'<svg width="18" height="18" viewBox="0 0 24 26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 9A6 6 0 0 0 6 9c0 7-3 9-3 9h18s-3-2-3-9M13.7 22a2 2 0 0 1-3.4 0"/></svg>',
  trend:'<svg width="12" height="10" viewBox="0 0 17 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 10.5 6.2 5.3l3.4 3.4L15.6 2.6M11 2.4h4.8v4.8"/></svg>',
  up:'<svg width="9" height="8" viewBox="0 0 10 9"><path d="M5 .5 9.6 8.5H.4z" fill="currentColor"/></svg>',
  cursor:'<svg class="cursor" viewBox="0 0 26 32" width="26" height="32" aria-hidden="true"><path d="M2 2 L2 25 L8.2 19.3 L12.6 29 L16.6 27.2 L12.3 17.8 L20.5 17.8 Z" fill="#fff" stroke="#303030" stroke-width="1.3" stroke-linejoin="round"/></svg>',
};
/* Aira mark: hand-traced asymmetric infinity (to be replaced by the official SVG). No gradient. */
const mark = (w, stroke, sw) => `<svg class="mark" width="${w}" height="${(w*.75).toFixed(1)}" viewBox="0 0 32 24" aria-hidden="true"><path d="M15.2 13.4C13.6 8.6 12 3 8.6 3 5.4 3 3.6 7.2 3.6 12.1 3.6 17.4 5.9 21 9 21c3 0 4.7-3.6 6.2-7.6 1.4-3.6 3.1-6 5.9-6 2.9 0 4.9 2.4 4.9 5.4 0 3.1-2 5.5-4.9 5.5-2.7 0-4.4-2-5.9-3.9" stroke="${stroke}" stroke-width="${sw}"/></svg>`;
const skel = (ws) => ws.map(w=>`<div class="ph l" style="width:${w}%;height:10px"></div>`).join('');

/* ---------------- chart geometry (inside the chart card) ---------------- */
const PW = 518, PH = 170;
const px = i => 12 + i*(PW-24)/11, py = v => PH - 10 - v*(PH-20)/90;
const lineD = (from, to) => 'M' + WEEKS.slice(from, to+1).map((v,i)=>px(from+i).toFixed(1)+' '+py(v).toFixed(1)).join(' L');
const sparkD = (n) => 'M' + WEEKS.slice(0, n).map((v,i)=>(4 + i*10.4).toFixed(1)+' '+(44 - (v-36)*1.0).toFixed(1)).join(' L');

/* ======================================================================
   BUILD
   ====================================================================== */
function build(film){
  const stage = h('div', 'stage'); film.appendChild(stage);
  stage.setAttribute('role','img');
  stage.setAttribute('aria-label','Aira: captures the consultation by voice as coded symptoms; recommends a malaria test that the health worker accepts; calls the patient after the visit and flags a household contact; and alerts the district team when malaria cases rise in Mocuba.');

  /* ---------- device (generic app shell, qTrack) ---------- */
  const wrap = h('div', 'device-wrap'); stage.appendChild(wrap);
  const BLUR = {visit:'assets/blur/blur-visit.webp', rec:'assets/blur/blur-rec.webp', calls:'assets/blur/blur-calls.webp', dash:'assets/blur/blur-dash.webp'};
  Object.entries(BLUR).forEach(([n,src])=>wrap.appendChild(h('div', 'device-blur db-'+n, `<img alt="" src="${src}">`)));
  const dev = h('div', 'device'); wrap.appendChild(dev);
  dev.innerHTML = `<div class="dbody"><div class="dface"></div>
    <div class="titlebar"><span class="tb-bg"></span><span class="tb-url"></span><span class="tb-dots"><i></i><i></i><i></i></span></div>
    <div class="viewport p">
      <header class="gbar"><b class="g-person">${esc(COPY.person)}</b><span class="sp"></span><span class="gi">${I.search}</span><span class="gi">${I.circle}</span><span class="gi">${I.minus}</span></header>
      <nav class="grail" aria-hidden="true"><span class="gi on">${I.square}</span><span class="gi">${I.circle}</span><span class="gi">${I.tri}</span></nav>
      <div class="cam"><div class="views"></div></div>
    </div></div>
    <span class="wm tb-wm">${mark(26,'#FF7869',2.4)}<span class="wm-q">${esc(COPY.product)}</span></span>`;
  const views = dev.querySelector('.views');
  const view = (name, title) => { const v = h('section', 'v v-'+name, `<div class="v-head"><span class="gi"></span><h2>${esc(title)}</h2></div><div class="v-body"></div>`); views.appendChild(v); return v.querySelector('.v-body'); };

  /* ---------- view: visit (CH1, CH2) ---------- */
  const vb = view('visit', COPY.visit);
  vb.innerHTML = `
    <div class="pcard capture" style="position:absolute;left:16px;top:16px">
      <div class="listen"><span class="ava">${mark(24,'#FF7869',2.6)}</span>
        <div class="t"><b>${esc(COPY.listening)}</b><span>${esc(COPY.capturing)}</span></div>
        <div class="wave">${WAVE_H.slice(0,20).map((v,i)=>`<i style="left:${(i*7.4).toFixed(1)}px" data-h="${(v*.8).toFixed(1)}"></i>`).join('')}</div>
        <span class="mic">${I.mic}</span></div>
      <div class="row"><span class="sec-lbl">${esc(COPY.symptomsLbl)}</span><span class="sp"></span>
        <span class="swap"><span class="badge done t-w"><i class="dot"></i>${esc(COPY.writing)}</span><span class="badge brand t-c" style="opacity:0">${CK(11)}${esc(COPY.captured)}</span></span></div>
      <div class="field focus"><span class="typed"></span><span class="caret"></span><span class="rest">${esc(COPY.rest)}</span></div>
      <div class="chips">${COPY.chips.map(([c],i)=>`<span class="chip c${i}"><i class="cbg"></i><span>${esc(c)}</span></span>`).join('')}</div>
    </div>
    <div class="ph-card" style="position:absolute;left:16px;top:290px;width:233px;height:72px">${skel([46,30])}</div>
    <div class="ph-card" style="position:absolute;left:263px;top:290px;width:233px;height:72px">${skel([38,24])}</div>
    <div class="ph-card ph-a" style="position:absolute;left:510px;top:16px;width:370px;height:196px">${skel([52,86,70,40])}</div>
    <div class="ph-card ph-b" style="position:absolute;left:510px;top:226px;width:370px;height:110px">${skel([34,60])}</div>
    <div class="pcard rec" style="position:absolute;left:510px;top:16px;opacity:0">
      <div class="hd"><span class="ava">${mark(16,'#FF7869',2.8)}</span><span class="mono">${esc(COPY.recOvl)}</span></div>
      <h3>${esc(COPY.recTitle)}</h3><p>${esc(COPY.recBody)}</p>
      <div class="acts"><span class="btn pri acc">${esc(COPY.accept)}</span><span class="btn sec dis">${esc(COPY.dismiss)}</span>
        <div class="acc-m"><div class="m-old">${esc(COPY.accept)}</div><div class="m-new"><span class="chk">${CK(10)}</span>${esc(COPY.accepted)}</div></div></div>
    </div>
    <div class="treat" style="position:absolute;left:510px;top:240px;width:370px;opacity:0;display:flex;flex-direction:column;gap:10px">
      <span class="sec-lbl">${esc(COPY.treatLbl)}</span>
      <div class="slot av t-slot"><span class="bar" style="width:120px"></span><span class="ring2"></span>
        <div class="fill"><i class="dot"></i><b>${esc(COPY.rdt)}</b><span class="sp"></span><span class="badge brand">${CK(11)}${esc(COPY.accepted)}</span></div></div>
    </div>`;
  // the capture card in the shell is the finished state; the lifted clone plays the chapter
  const cap = vb.querySelector('.capture');
  cap.querySelector('.typed').textContent = COPY.clause;
  cap.querySelector('.caret').style.opacity = 0; cap.querySelector('.field').classList.remove('focus');
  cap.querySelectorAll('.chip').forEach(c=>{ c.querySelector('.cbg').style.opacity = 1; c.style.color = '#fff'; c.style.borderColor = 'transparent'; });
  cap.querySelector('.t-w').style.opacity = 0; cap.querySelector('.t-c').style.opacity = 1;

  /* ---------- view: calls (CH3) ---------- */
  const cb = view('calls', COPY.calls);
  cb.innerHTML = `
    <div class="pcard calls" style="position:absolute;left:16px;top:16px">
      <div class="crow r1"><span class="swap" style="justify-items:start"><span class="pi p-p" style="justify-self:start">${I.phone}</span><span class="pi ok p-r" style="justify-self:start;opacity:0">${I.phone}</span></span>
        <span class="bar" style="width:150px"></span><span class="sp"></span>
        <span class="swap"><span class="badge done s-p">${esc(COPY.pending)}</span><span class="badge ok s-r" style="opacity:0">${CK(11)}${esc(COPY.reached)}</span></span></div>
      <div class="crow live"><span class="callic"><i class="wv"></i>${I.call}</span>
        <div style="display:flex;flex-direction:column;gap:6px"><div class="row" style="gap:8px"><span class="livep"><i></i>${esc(COPY.live)}</span><span class="timer">01:<span class="ss">42</span></span></div><b>${esc(COPY.followup)}</b></div>
        <span class="sp"></span><div class="mwave">${CWAVE_H.map((v,i)=>`<i style="left:${(i*5.4).toFixed(1)}px" data-h="${v}"></i>`).join('')}</div></div>
      <div class="crow r3"><span class="pi">${I.phone}</span><span class="bar" style="width:120px"></span><span class="sp"></span><span class="badge done">${esc(COPY.pending)}</span></div>
    </div>
    <div class="ph-card" style="position:absolute;left:470px;top:16px;width:410px;height:236px">${skel([40,76,62,30,54])}</div>
    <div class="ph-card" style="position:absolute;left:16px;top:266px;width:440px;height:96px">${skel([30,58,44])}</div>`;

  /* ---------- view: dashboard (CH4) ---------- */
  const db = view('dash', COPY.signals);
  const M = window.AIRA_MAP, MS = 1.35;
  db.innerHTML = `
    <div class="pcard mapc" style="position:absolute;left:16px;top:16px"><span class="sec-lbl">${esc(COPY.casesLbl)}</span>
      <svg class="mapsvg" width="${(M.w*MS).toFixed(0)}" height="${(M.h*MS).toFixed(0)}" viewBox="0 0 ${M.w} ${M.h}">${M.districts.map(d=>`<path d="${d.d}"${d.id?' class="mocuba"':''}/>`).join('')}</svg>
      <div class="mloc"><b>${esc(COPY.mocuba)}</b> · <span class="n">${COPY.casesA}</span> cases</div></div>
    <div class="pcard tcard" style="position:absolute;left:330px;top:16px;opacity:0">
      <div class="row" style="gap:8px"><b style="font-size:14px;font-weight:600">${esc(COPY.malaria)}</b><span class="tag">${esc(COPY.disease.toUpperCase())}</span></div>
      <div class="wow">${I.up}<span><span class="n">${COPY.wowA}</span>% WoW</span></div>
      <svg class="spark" width="124" height="52"><path class="sp-a" d="${sparkD(10)}" fill="none" stroke="#A9A8E8" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
        <path class="sp-b" d="M${(4+9*10.4).toFixed(1)} ${(44-(WEEKS[9]-36)).toFixed(1)} L${(4+10*10.4).toFixed(1)} ${(44-(WEEKS[10]-36)).toFixed(1)} L${(4+11*10.4).toFixed(1)} ${(44-(WEEKS[11]-36)).toFixed(1)}" fill="none" stroke="#FF7869" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>
      <span class="ring2"></span></div>
    <div class="ph-card ph-t1" style="position:absolute;left:594px;top:16px;width:136px;height:118px;opacity:0">${skel([50,30,70])}</div>
    <div class="ph-card ph-t2" style="position:absolute;left:744px;top:16px;width:136px;height:118px;opacity:0">${skel([44,30,64])}</div>
    <div class="pcard chart" style="position:absolute;left:330px;top:148px">
      <div class="row"><span class="sec-lbl">${esc(COPY.chartTitle)}</span><span class="sp"></span><span class="badge peach sig" style="opacity:0">${I.trend}${esc(COPY.signal)}</span></div>
      <div class="sub">${esc(COPY.chartSub)}</div>
      <svg class="plot" width="${PW}" height="${PH}">
        <path d="M${px(0)} ${py(0)} L${px(11)} ${py(0)}" stroke="#eceef0" stroke-width="1"/>
        <path class="area" d="${lineD(0,9)} L${px(9)} ${py(0)} L${px(0)} ${py(0)} Z" fill="#F5F5FF"/>
        <path d="M${px(0)} ${py(THR)} L${px(11)+6} ${py(THR)}" stroke="#6b7280" stroke-width="1.2" stroke-dasharray="5 4"/>
        <text class="thr-l" x="${px(0)}" y="${py(THR)-8}">${esc(COPY.threshold)}</text>
        <path class="l-a" d="${lineD(0,9)}" fill="none" stroke="#A9A8E8" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
        <path class="l-b" d="${lineD(9,11)}" fill="none" stroke="#FF7869" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
        ${WEEKS.map((v,i)=>`<circle class="pt pt${i}" cx="${px(i).toFixed(1)}" cy="${py(v).toFixed(1)}" r="${i>9?4.5:3.6}" fill="${i>9?'#FF7869':'#fff'}" stroke="${i>9?'#fff':'#A9A8E8'}" stroke-width="${i>9?1.4:2}"/>`).join('')}
        <circle class="ring pk" cx="${px(11).toFixed(1)}" cy="${py(WEEKS[11]).toFixed(1)}" r="15"/>
      </svg>
      <span class="clabel jl" style="left:${(16+px(11)-238).toFixed(0)}px;top:${(66+py(WEEKS[11])-13).toFixed(0)}px"><em>${esc(COPY.jump[0])}</em>${esc(COPY.jump[1])}</span>
    </div>
    <div class="ph-card" style="position:absolute;left:330px;top:422px;width:550px;height:74px">${skel([36,70])}</div>`;

  /* ---------- lifted layer + free components (qTrack .lift) ---------- */
  const lift = h('div', 'lift p'); stage.appendChild(lift);
  ['cap','rec','live','chart'].forEach(n=>lift.appendChild(h('div', 'lifted lift-'+n, '<div class="lift-shadow"></div>')));
  lift.appendChild(h('div', 'pcard conv', `
    <div class="who">${mark(16,'#FF7869',2.8)}${esc(COPY.aira)}</div>
    <div class="bub a"><span class="q-t">${esc(COPY.question)}</span></div>
    <div class="who r"><i class="dot"></i><span>${esc(COPY.patient)} · <span class="swap" style="justify-items:start;vertical-align:top"><span class="st-l" style="justify-self:start">${esc(COPY.listeningSt)}</span><span class="st-s" style="justify-self:start;opacity:0">${esc(COPY.speakingSt)}</span></span></span></div>
    <div class="bub p"><span class="dots"><i></i><i></i><i></i></span><span class="a-t">${COPY.answer.map(([t,hl],i)=>`<span class="seg${hl?' hl':''}" data-t="${esc(t)}"></span>`).join('')}<span class="caret a-c" style="opacity:0"></span></span></div>
    <div class="xchips">${COPY.xchips.map(([a,b],i)=>b?`<span class="xchip x${i}"><span class="chk">${CK(9)}</span>${esc(a)}&nbsp;<b>${esc(b)}</b></span>`:`<span class="xchip alert x${i}"><span class="chk">${I.flag}</span>${esc(a)}</span>`).join('')}</div>`));
  lift.appendChild(h('div', 'pcard notif', `<span class="pulse"></span><span class="bell">${I.bell}</span><div><b>${esc(COPY.notifT)}</b><span>${esc(COPY.notifS)}</span></div><span class="now">${esc(COPY.now)}</span>`));
  lift.appendChild(h('span', 'upc u1', esc(COPY.label1)));
  lift.appendChild(h('span', 'upc u2', esc(COPY.label2)));
  lift.appendChild(h('span', 'upc u4', esc(COPY.label4)));
  stage.insertAdjacentHTML('beforeend', I.cursor);

  return stage;
}

/* ======================================================================
   MASTER TIMELINE  (labels ch1 · ch2 · ch3 · ch4 · end)
   Pacing (Phase 2): every entrance, lift-out, morph and camera move keeps its qTrack
   duration and ease; only waiting is cut. End-of-chapter hold 0.4 s; each chapter's exit
   overlaps the next chapter's entrance by 0.35 s; no other idle gap is over 0.3 s.
   t = 0 opens on the sharp visit shell: CH1's entrance runs under CH4's exit at the loop seam.
   ====================================================================== */
const T = {ch1:0, ch2:0, ch3:0, ch4:0, end:0};
const HOLD = .4, OVERLAP = .35;
let TOTAL = 0;
const TYPE_CPS = 38, ANSWER_CPS = 34;

function timeline(stage){
  const A = AiraMotion.bind(stage);
  const $ = s => stage.querySelector(s), $$ = s => [...stage.querySelectorAll(s)];
  const tl = gsap.timeline({paused:true, repeat:-1, defaults:{ease:'emph'}});
  const dev = $('.device'), cur = $('.cursor'), cam = $('.cam'), person = $('.g-person');
  const V = n => $('.v-'+n), B = n => $('.db-'+n);
  const KF = {}, SHELL = {};
  const r2 = v => +v.toFixed(3);

  /* ---------- initial state = the loop's last frame: sharp visit shell, empty capture card ---------- */
  gsap.set($$('.v'), {autoAlpha:0}); gsap.set(V('visit'), {autoAlpha:1});
  gsap.set($$('.device-blur'), {opacity:0, scale:.98});
  gsap.set(dev, {opacity:1, scale:1, y:0});
  gsap.set(cur, {x:1660, y:980, opacity:0});
  gsap.set($$('.upc, .conv, .notif'), {opacity:0});

  /* ambient waveform: deterministic, so every seek shows the same frame */
  function waveLoop(bars, from, to, step){
    const n = Math.max(1, Math.round((to-from)/step));
    const hh = (i,el,k) => { const b = +el.dataset.h; const s = Math.abs(Math.sin(i*1.73 + k*2.41)) * .75 + .25; return Math.max(3, b*(k===n?1:s)); };
    for(let k=0;k<=n;k++) tl.to(bars, {height:(i,el)=>hh(i,el,k), marginTop:(i,el)=>-hh(i,el,k)/2, duration:step, ease:'sine.inOut'}, from + k*step);
  }
  $$('.wave i, .mwave i').forEach(b=>{ const v = Math.max(+b.dataset.h, 2); b.style.height = v+'px'; b.style.marginTop = (-v/2)+'px'; });

  /* ======================= CH1 · during the visit ======================= */
  let t = T.ch1 = 0;
  const vv = V('visit'), capSrc = vv.querySelector('.capture'), capH = $('.lift-cap');
  const cap = A.liftClone(capSrc, capH);
  const typed = cap.querySelector('.typed'), rest = cap.querySelector('.rest'), caret = cap.querySelector('.caret'), field = cap.querySelector('.field');
  const chips = [...cap.querySelectorAll('.chip')], tagW = cap.querySelector('.t-w'), tagC = cap.querySelector('.t-c');
  function capReset(){ // the clone's "before" state (also re-applied at the loop seam)
    typed.textContent = ''; gsap.set(rest, {opacity:0}); gsap.set(caret, {opacity:1}); field.className = 'field focus';
    gsap.set(tagW, {opacity:1, y:0}); gsap.set(tagC, {opacity:0, y:0});
    gsap.set(chips, {opacity:0, scale:.9, color:'#0c1723', borderColor:'#bbbfc2'}); gsap.set(cap.querySelectorAll('.cbg'), {opacity:0});
  }
  capReset();
  gsap.set(capH, {visibility:'visible', opacity:1}); gsap.set(capSrc, {opacity:0});
  const L1 = t + .3, C1Y = 30;
  A.liftOut(tl, capH, capSrc, B('visit'), L1, {scale:1.1, x:148, y:C1Y});
  const ty = A.typeIn(tl, typed, COPY.clause, L1 + .6, TYPE_CPS);
  tl.set(caret, {opacity:0}, ty.end);
  tl.to(rest, {opacity:1, duration:.3, ease:'none'}, ty.end);                         // the rest of the note fades in
  const full = COPY.clause + COPY.rest;
  COPY.chips.forEach(([,word],i)=>{ const idx = full.indexOf(word) + word.length - 1;
    const at = idx < COPY.clause.length ? ty.at(idx) + .08 : ty.end + .05 + (i-3)*.08;   // chips land with their words
    tl.fromTo(chips[i], {opacity:0, scale:.9}, {opacity:1, scale:1, duration:.22, ease:'emph', immediateRender:false}, at); });
  KF['01a'] = r2(ty.at(COPY.clause.indexOf('with chills') + 10) + .05);
  const C1 = ty.end + .3 + .25;
  KF['01b'] = r2(C1 - .02);
  tl.set(field, {className:'field'}, C1);
  A.swapTo(tl, tagW, tagC, C1);
  chips.forEach((c,i)=>{ const a = C1 + .2 + i*.08;                                     // fills, 80 ms stagger
    tl.to(c.querySelector('.cbg'), {opacity:1, duration:.25, ease:'none'}, a);
    tl.to(c, {color:'#ffffff', borderColor:'rgba(0,0,0,0)', duration:.25, ease:'none'}, a); });
  const capR = A.pos(capSrc), u1 = $('.u1');
  A.pillIn(tl, u1, C1 + .45, capR.x + capR.w/2 + 148 - u1.offsetWidth/2, capR.y + capR.h/2 + C1Y + capR.h*1.1/2 + 22);
  KF['01c'] = r2(C1 + .95);
  const E1 = C1 + .85 + HOLD;
  tl.to(capH, {scale:1.1*1.015, duration:E1 - (L1+.85), ease:'none'}, L1 + .85);      // camera drift +1.5%
  waveLoop([...cap.querySelectorAll('.wave i')], t, E1 + .3, .16);
  SHELL.visit = KF['01c'];

  /* ======================= CH2 · in real time ======================= */
  t = T.ch2 = r2(E1);
  tl.to(u1, {opacity:0, duration:.3, ease:'glide'}, t);
  A.liftBack(tl, capH, capSrc, B('visit'), t);
  const rec = vv.querySelector('.rec'), treat = vv.querySelector('.treat'), phs = vv.querySelectorAll('.ph-a, .ph-b');
  const IN2 = t + OVERLAP;
  tl.to(phs, {opacity:0, duration:.3, ease:'glide'}, IN2);
  tl.fromTo(rec, {opacity:0, y:20, scale:.98}, {opacity:1, y:0, scale:1, duration:.55, ease:'emph', immediateRender:false}, IN2);
  tl.fromTo(treat, {opacity:0, y:12}, {opacity:1, y:0, duration:.5, ease:'emph', immediateRender:false}, IN2 + .08);
  gsap.set([rec, treat], {opacity:0});
  const recH = $('.lift-rec'), recC = A.liftClone(rec, recH); recC.style.opacity = 1; recC.style.transform = 'none';
  const L2 = IN2 + .55 + .2, RS = 1.15, RX = -190, RY = 50;
  SHELL.rec = r2(L2 - .02);
  A.liftOut(tl, recH, rec, B('rec'), L2, {scale:RS, x:RX, y:RY});
  const rr = A.pos(rec), ar = A.pos(rec.querySelector('.acc')), ocx = rr.x + rr.w/2, ocy = rr.y + rr.h/2;
  const ax = ocx + (ar.x + ar.w*.5 - ocx)*RS + RX, ay = ocy + (ar.y + ar.h*.62 - ocy)*RS + RY;
  A.cursorTo(tl, cur, ax, ay, L2 + .4);
  const CL = L2 + 1.3;
  const acc = recC.querySelector('.acc'), dis = recC.querySelector('.dis'), am = recC.querySelector('.acc-m');
  A.click(tl, cur, CL, acc);
  KF['02a'] = r2(CL - .12);
  A.cursorOut(tl, cur, CL + .35);
  const M2 = CL + .25, MD = .8;                                                        // morph (qTrack timing)
  gsap.set(am, {width:acc.offsetWidth || 165});
  tl.set(am, {visibility:'visible'}, M2).set(acc, {opacity:0}, M2);
  tl.to(dis, {opacity:0, scale:.96, duration:.2, ease:'power2.in'}, M2);
  tl.to(am, {width:recC.querySelector('.acts').offsetWidth || 338, backgroundColor:'#e0f0ef', duration:MD, ease:'glide'}, M2);
  tl.to(am.querySelector('.m-old'), {opacity:0, duration:MD*.09, ease:'none'}, M2);
  tl.fromTo(am.querySelector('.m-new'), {opacity:0}, {opacity:1, duration:MD*.3, ease:'none'}, M2 + MD*.7);
  A.pop(tl, am.querySelector('.chk'), M2 + MD*.75);
  KF['02b'] = r2(M2 + MD + .2);
  const slot = vv.querySelector('.t-slot'), sr = A.pos(slot);
  const G = M2 + MD + .3;                                                              // the card settles into the row
  tl.to(recH, {x:(sr.x + sr.w/2) - ocx, y:(sr.y + sr.h/2) - ocy, scale:.94, duration:.9, ease:'glide'}, G);
  tl.to(recH.querySelector('.lift-shadow'), {opacity:0, duration:.7, ease:'glide'}, G + .2);
  tl.to(dev, {opacity:1, scale:1, duration:.6, ease:'glide'}, G + .3);
  tl.to(B('rec'), {opacity:0, duration:.5, ease:'glide'}, G + .3);
  tl.to(recH, {opacity:0, duration:.25, ease:'none'}, G + .75);
  tl.set(recH, {visibility:'hidden'}, G + 1.0);
  tl.set(rec, {opacity:0}, G + .75);
  tl.to(slot.querySelector('.bar'), {opacity:0, duration:.15}, G + .75);
  tl.to(slot, {borderStyle:'solid', backgroundColor:'#ffffff', duration:.01}, G + .8);
  tl.fromTo(slot.querySelector('.fill'), {opacity:0, x:8}, {opacity:1, x:0, duration:.35, immediateRender:false}, G + .8);
  tl.to(slot.querySelector('.ring2'), {opacity:1, duration:.2}, G + .8);
  tl.to(slot.querySelector('.ring2'), {opacity:0, duration:.45}, G + 1.25);
  const u2 = $('.u2');
  A.pillIn(tl, u2, G + .85, sr.x + sr.w/2 - u2.offsetWidth/2, sr.y + sr.h + 16);       // "Validated by the health worker"
  KF['02c'] = r2(G + 1.32);
  const E2 = G + 1.25 + HOLD;
  tl.to(cam, {scale:1.015, duration:E2 - (G + .8) + .4, ease:'none'}, G + .8);          // camera drift on the sharp shell

  /* ======================= CH3 · after the visit ======================= */
  t = T.ch3 = r2(E2);
  tl.to(u2, {opacity:0, duration:.3, ease:'glide'}, t);
  A.viewSwap(tl, vv, V('calls'), t);
  tl.set(cam, {scale:1}, t + .75);
  const vc = V('calls'), r1 = vc.querySelector('.r1');
  A.swapTo(tl, r1.querySelector('.s-p'), r1.querySelector('.s-r'), t + .4);           // the row above ticks to Reached
  A.swapTo(tl, r1.querySelector('.p-p'), r1.querySelector('.p-r'), t + .48);
  const liveSrc = vc.querySelector('.live'), liveH = $('.lift-live');
  const live = A.liftClone(liveSrc, liveH);
  const L3 = t + .75, LX = -165, LY = 40;
  SHELL.calls = r2(L3 - .02);
  A.liftOut(tl, liveH, liveSrc, B('calls'), L3, {scale:1.15, x:LX, y:LY});
  tl.fromTo(live.querySelector('.wv'), {opacity:.7, scale:1}, {opacity:0, scale:1.5, duration:.7, repeat:1, ease:'emph', immediateRender:false}, L3 + .4);
  const lr = A.pos(liveSrc), conv = $('.conv');
  const CVX = lr.x + lr.w/2 + LX + lr.w*1.15/2 + 44, CVY = lr.y + lr.h/2 + LY - 140;
  A.cardIn(tl, conv, L3 + .45, CVX, CVY);
  const qb = conv.querySelector('.bub.a');
  tl.fromTo(qb, {opacity:0}, {opacity:1, duration:.3, ease:'none', immediateRender:false}, L3 + .6);   // the question appears whole
  gsap.set(qb, {opacity:0});
  const P3 = L3 + 1.2;
  A.swapTo(tl, conv.querySelector('.st-l'), conv.querySelector('.st-s'), P3);
  tl.to(conv.querySelector('.dots'), {opacity:0, duration:.2, ease:'none'}, P3 + .1);
  KF['03a'] = r2(P3 - .05);
  const ac = conv.querySelector('.a-c'); tl.set(ac, {opacity:1}, P3 + .2);
  let at = P3 + .3, sweepEnd = 0;
  conv.querySelectorAll('.seg').forEach((s,i)=>{
    s.textContent = '';
    const r = A.typeIn(tl, s, s.dataset.t, at, ANSWER_CPS); at = r.end;
    if(s.classList.contains('hl')){ A.sweep(tl, s, at + .02); sweepEnd = at + .47; }
    if(i===4) KF['03b'] = r2(at + .1);
  });
  tl.set(ac, {opacity:0}, at + .15);
  const X3 = at + .2;
  conv.querySelectorAll('.xchip').forEach((c,i)=>tl.fromTo(c, {opacity:0, scale:.9}, {opacity:1, scale:1, duration:.22, ease:'emph', immediateRender:false}, X3 + i*.08));
  gsap.set(conv.querySelectorAll('.xchip'), {opacity:0});
  const end3 = Math.max(X3 + .38, sweepEnd);
  KF['03c'] = r2(end3 + .05);
  const E3 = end3 + HOLD;
  tl.to(liveH, {scale:1.15*1.015, duration:E3 - (L3 + .85), ease:'none'}, L3 + .85); // camera drift
  waveLoop([...live.querySelectorAll('.mwave i')], L3, E3 + .5, .16);
  // timer 01:42 -> counts under the other motion (a property tween, so it also scrubs; no minute rollover in 6 s)
  const RUN = E3 + .5 - L3;
  tl.fromTo(live.querySelector('.timer .ss'), {textContent:42}, {textContent:42 + Math.floor(RUN), snap:{textContent:1}, duration:RUN, ease:'none', immediateRender:false}, L3);

  /* ======================= CH4 · across facilities ======================= */
  t = T.ch4 = r2(E3);
  A.liftExit(tl, [liveH, conv], B('calls'), t);
  tl.set(person, {text:COPY.district}, t + .1);
  // the visit view is hidden from here on: put it back to its loop-start state
  tl.set(phs, {opacity:1}, t + .1).set(treat, {opacity:0}, t + .1).set(slot.querySelector('.bar'), {opacity:1}, t + .1)
    .set(slot, {borderStyle:'dashed', backgroundColor:'#fbfbfc'}, t + .1).set(slot.querySelector('.fill'), {opacity:0}, t + .1)
    .set(am, {visibility:'hidden'}, t + .1).set(acc, {opacity:1}, t + .1);
  const IN4 = t + .5 - OVERLAP;
  A.shellIn(tl, V('dash'), IN4);
  const vd = V('dash'), tc = vd.querySelector('.tcard');
  [tc, vd.querySelector('.ph-t1'), vd.querySelector('.ph-t2')].forEach((c,i)=>
    tl.fromTo(c, {opacity:0, y:20, scale:.98}, {opacity:1, y:0, scale:1, duration:.55, ease:'emph', immediateRender:false}, IN4 + .35 + i*.08));
  tl.to(tc.querySelector('.ring2'), {opacity:1, duration:.25}, IN4 + .85);
  const chSrc = vd.querySelector('.chart'), chH = $('.lift-chart'), ch = A.liftClone(chSrc, chH);
  gsap.set(ch.querySelector('.l-b'), {drawSVG:'0%'}); gsap.set(ch.querySelectorAll('.pt10, .pt11'), {scale:0, transformOrigin:'50% 50%'});
  gsap.set(ch.querySelector('.pk'), {drawSVG:'0%'}); gsap.set(ch.querySelectorAll('.jl, .sig'), {opacity:0});
  gsap.set(chSrc.querySelectorAll('.l-b, .pt10, .pt11, .pk'), {opacity:0});
  const L4 = IN4 + 1.05 + .2, CX = -185, CY = -150, CS = 1.1;
  A.liftOut(tl, chH, chSrc, B('dash'), L4, {scale:CS, x:CX, y:CY});
  // the map highlight and the count-ups run WITH the lift, not before it
  tl.to(vd.querySelector('.mocuba'), {fill:'#FF7869', duration:.8, ease:'glide'}, L4);
  A.countUp(tl, tc.querySelector('.n'), COPY.wowA, COPY.wowB, L4, 1.0);
  A.countUp(tl, vd.querySelector('.mloc .n'), COPY.casesA, COPY.casesB, L4, 1.0);
  tl.fromTo(tc.querySelector('.sp-b'), {drawSVG:'0%'}, {drawSVG:'100%', duration:.6, ease:'glide', immediateRender:false}, L4 + .2);
  gsap.set(tc.querySelector('.sp-b'), {drawSVG:'0%'});
  SHELL.dash = r2(L4 + 1.0);
  KF['04a'] = r2(L4 - .05);
  tl.fromTo(ch.querySelector('.l-b'), {drawSVG:'0%'}, {drawSVG:'100%', duration:.8, ease:'glide', immediateRender:false}, L4 + .7);
  A.pop(tl, ch.querySelector('.pt10'), L4 + 1.05);
  A.pop(tl, ch.querySelector('.pt11'), L4 + 1.45);
  tl.fromTo(ch.querySelector('.pk'), {drawSVG:'0%'}, {drawSVG:'100%', duration:.45, ease:'power2.inOut', immediateRender:false}, L4 + 1.55);
  tl.fromTo(ch.querySelector('.jl'), {opacity:0, x:-8}, {opacity:1, x:0, duration:.35, immediateRender:false}, L4 + 1.8);
  tl.fromTo(ch.querySelector('.sig'), {opacity:0, scale:.8}, {opacity:1, scale:1, duration:.22, ease:'emph', immediateRender:false}, L4 + 2.0);
  const N4 = L4 + 2.15;                                                                // as "+42%" lands
  KF['04b'] = r2(N4 - .02);
  const cr = A.pos(chSrc), nt = $('.notif');
  const NX = cr.x + cr.w/2 + CX - 290, NY = cr.y + cr.h/2 + CY + cr.h*CS/2 + 24;
  A.cardIn(tl, nt, N4, NX, NY);
  tl.fromTo(nt.querySelector('.pulse'), {scale:1, opacity:.7}, {scale:1.06, opacity:0, duration:.7, ease:'emph', immediateRender:false}, N4 + .45);
  const u4 = $('.u4');
  A.pillIn(tl, u4, N4 + .35, NX + 290 - u4.offsetWidth/2, NY + 102);
  KF['04c'] = r2(N4 + .8);
  const E4 = N4 + 1.15 + HOLD;
  tl.to(chH, {scale:CS*1.015, duration:E4 - (L4 + .85), ease:'none'}, L4 + .85);

  /* ======================= END · seam back to CH1 ======================= */
  t = T.end = r2(E4);
  A.liftExit(tl, [chH, nt, u4], B('dash'), t);
  tl.set(person, {text:COPY.person}, t + .1);
  tl.set(vd.querySelector('.mocuba'), {fill:'#D9D9FF'}, t + .1);
  tl.set(tc.querySelector('.ring2'), {opacity:0}, t + .1);
  // CH1's entrance: the visit shell and the empty capture card rise together under the exit
  const capSet = {};
  tl.set(typed, {text:''}, t + .1).set(rest, {opacity:0}, t + .1).set(caret, {opacity:1}, t + .1).set(field, {className:'field focus'}, t + .1)
    .set(tagW, {opacity:1, y:0}, t + .1).set(tagC, {opacity:0}, t + .1)
    .set(chips, {opacity:0, scale:.9, color:'#0c1723', borderColor:'#bbbfc2'}, t + .1).set(cap.querySelectorAll('.cbg'), {opacity:0}, t + .1)
    .set(capH, {visibility:'visible', opacity:0, scale:1, x:0, y:0}, t + .1).set(capH.querySelector('.lift-shadow'), {opacity:0}, t + .1)
    .set(capSrc, {opacity:0}, t + .1);
  const IN1 = t + .5 - OVERLAP;
  A.shellIn(tl, vv, IN1);
  tl.fromTo(capH, {opacity:0, y:24}, {opacity:1, y:0, duration:.7, ease:'emph', immediateRender:false}, IN1 + .05);
  TOTAL = r2(IN1 + .75);
  tl.set({}, {}, TOTAL);
  Object.entries(T).forEach(([k,v])=>tl.addLabel(k, v));
  window.AiraStage.TOTAL = TOTAL;
  return {tl, KF, T, TOTAL, SHELL};
}

/* matching qTrack moments (live film time, seconds) for the storyboard */
const QT_MATCH = {
  '01a':[26.2,'b2c · letter types in with a caret'],
  '01b':[9.4,'b1b · chips pop in under the report'],
  '01c':[5.1,'b1a · badge swaps Missed → Routed, tick pops'],
  '02a':[16.7,'b2a · list lifted, pointer on Book'],
  '02b':[25.2,'b2c · Send letter morphs into the letter card'],
  '02c':[17.5,'b2a · slot filled after the click'],
  '03a':[30.0,'b2c · phone card: Calling…'],
  '03b':[8.4,'b1b · Peach highlight sweeps'],
  '03c':[38.9,'b4 · fields fly in and tick'],
  '04a':[14.95,'b2a · sharp shell before the lift'],
  '04b':[12.0,'b1b · priors: Peach rings, 4 → 8 mm count-up'],
  '04c':[20.9,'b2b · No-show pulse, reschedule card slides in'],
};
const KEYFRAMES = [
  ['01a',1,'Aira is listening','Opens on the sharp visit shell (its entrance runs under CH4\'s exit at the loop seam). The capture card lifts out (×1.1, 0.8 s glide) over a pre-blurred shell at 35%; the Peach waveform runs; the first clause types at ~38 cps.'],
  ['01b',1,'Symptoms in','Chips pop in as outlines as their words land; the rest of the note fades in (0.3 s) and the last two chips follow 80 ms apart.'],
  ['01c',1,'Captured by Aira','Tag swaps to "✓ Captured by Aira"; all five chips fill teal 80 ms apart; the DM Mono micro-label rises in; 0.4 s hold.'],
  ['02a',2,'Recommendation lifts out','The capture card settles back (0.7 s glide) while the recommendation card enters 0.35 s later, then lifts out (×1.15). The qTrack pointer glides to Accept during the lift.'],
  ['02b',2,'Accepted (morph)','Click dips pointer and button 0.96 → 1; Dismiss folds away; Accept grows into one "Recommendation accepted" bar (0.8 s glide, label at 70%). Reduced-motion frame.'],
  ['02c',2,'Into the treatment plan','The card glides onto the treatment-plan slot (0.9 s) as the shell sharpens; the row fills with a teal ring flash and "Validated by the health worker" rises in.'],
  ['03a',3,'Follow-up call','The view swaps to the call list (0.35 s overlap); the row above ticks to Reached; the LIVE row lifts out, its timer counting from 01:42; Aira\'s question fades in whole (0.3 s).'],
  ['03b',3,'Patient speaking','Status swaps to speaking; only the answer types (~34 cps), each key phrase swept in Peach as it lands.'],
  ['03c',3,'Extracted and flagged','Three chips pop in 80 ms apart, the last in the alert style; 0.4 s hold while the timer keeps counting.'],
  ['04a',4,'District signals','Shell re-enters on the dashboard under CH3\'s exit; the Malaria card and two placeholders stagger in 80 ms apart; Malaria is selected.'],
  ['04b',4,'Signal','The chart lifts out WHILE Mocuba turns Peach and the counts run (4 → 42 %, 96 → 214); the line draws past the threshold, the Peach ring draws, "+42% in 2 weeks" lands, Signal pops.'],
  ['04c',4,'District team alerted','The notification starts as "+42%" lands (0.55 s emph) with one Peach pulse; micro-label; 0.4 s hold; everything lifts out as CH1\'s shell rises (loop seam).'],
];

window.AiraStage = {build, timeline, COPY, T, TOTAL, QT_MATCH, KEYFRAMES};
})();

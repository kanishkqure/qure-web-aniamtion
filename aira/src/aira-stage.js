/* ======================================================================
   Aira film — stage builder + keyframe states.
   AiraStage.build(filmEl)        -> builds the 1040x600 stage inside .aira-film
   AiraStage.KEYFRAMES            -> the 12 storyboard keyframes (one per source screen)
   AiraStage.apply(stage, id)     -> puts a freshly built stage into a keyframe state
   All copy and data below come from aira/assets/screens/*.png, except the
   optional card labels (CARD_LABELS), which come from the Aira card copy.
   ====================================================================== */
(function(){
'use strict';

/* ---------------- copy (from the screens) ---------------- */
const COPY = {
  visitTitle:'Fever visit',
  listening:'Aira is listening', capturing:'Capturing the consultation',
  symptomsLbl:'Presenting symptoms', writing:'Aira writing', captured:'Captured by Aira',
  symptoms:'Fever since 3 days, cyclic, with chills and sweating at night. Headache, body ache and poor appetite. Does not sleep under a bed net',
  chips:['Fever · 3 days','Cyclic','Chills','Headache','Body ache'],
  vitalsLbl:'Vitals',
  vitals:[['Temperature','38.7','°C'],['Pulse','104','bpm'],['Blood pressure','112/74',''],['SpO₂','97','%']],
  treatLbl:'Treatment plan',
  recOvl:'Aira · Recommendation', recTitle:'Malaria test recommended',
  recBody:'Cyclic fever with chills for 3 days. The national malaria guideline asks for a test before treating.',
  accept:'Accept', dismiss:'Dismiss', accepted:'Recommendation accepted', added:'Added to treatment plan',
  rdt:'Malaria RDT', rdtDesc:'Test before treating · national malaria guideline',
  live:'LIVE', timer:'01:42', followup:'Follow-up call', reached:'Reached', pending:'Pending', aira:'Aira',
  question:'Has anyone else at home had a fever in the last two weeks?',
  patient:'Patient', listeningSt:'listening', speakingSt:'speaking',
  answer:[['Yes, ',0],['my son',1],['. He is ',0],['6',1],[' and has had ',0],['fever since yesterday',1],['.',0]],
  xchips:[['Contact:','son, 6 yrs'],['Fever:','1 day'],['Flagged for malaria test']],
  dash:'District signals', district:'Mocuba district', window:'Last 12 weeks', trends:'Trends by symptom & disease',
  cases:'Cases by district', casesSub:'Malaria, last 2 weeks', high:'High', low:'Low', mocuba:'Mocuba', casesA:96, casesB:214,
  chart:'Malaria', chartSub:'Fever visits lead, confirmed cases follow', legend:['Fever visits','Confirmed malaria','Alert threshold'],
  early:'early signal',
  zTitle:'Malaria · Mocuba district', zSub:'Weekly confirmed cases', signal:'Signal', jump:'+42% in 2 weeks', threshold:'Alert threshold',
  notifT:'District team alerted', notifS:'Malaria above threshold for 2 weeks in Mocuba', now:'Now',
};
/* trend cards: name, tag, tag class, [dir, % in 04a], [dir, % in 04b] */
const TRENDS = [
  ['Fever','Symptom','sym',['up',9],['up',26]],
  ['Malaria','Disease','dis',['up',4],['up',42]],
  ['Diarrhoea','Syndrome','sym',['dn',8],['dn',8]],
  ['Cough','Symptom','sym',['dn',13],['dn',13]],
  ['Headache','Symptom','sym',['up',4],['up',4]],
];
/* optional labels, one per chapter, from the Aira card copy (CH3 has none in the brief) */
const CARD_LABELS = {1:'Saved to national EMR · coded', 2:'Validated by the health worker', 4:'Data stays in-country'};

/* ---------------- traced geometry (CSS px, see README) ---------------- */
const WAVE = {x0:413.5, step:11.5, h:[5.5,9.5,5,8,11,18.5,18.5,5,12,16,31.5,16,5,13,27.5,23.5,40.5,5,19.5,25,30,44,4.5,26,15,37.5,20,4.5,19,16.5,24.5,28.5,4.5,17,10,12,25,5,17,6.5,9,8,5,5.5]};
const CWAVE = {x0:163.5, step:5.5, h:[3,13,5,3,6,3,15,10,5,3,3,10,11,7,11,3,3,7,5,16,4,6]};
const WAVE_STOPS = [[0,[242,122,110]],[.5,[197,149,164]],[1,[154,176,219]]];
/* dashboard in 04a space. 04b = scale DS about the origin + (DTX, DTY) */
const DS = 0.6247, DTX = -30.8, DTY = 89.75;
const TC_X = [[110.8,261],[274,424.3],[437.3,597],[610,760],[773,929]];
const SPARK_A = [
  '124.5,204.5 138.5,196 152.5,204.5 167.5,187.5 181,195.8 195.5,187.5 208,195 211,195.5 252.5,170.5',
  '287.5,204.5 301.5,187.8 316,204.2 330,187.8 345,186.8 359,170.5 373,186.8 387.5,170.5 401,186.5 416,170.5',
  '451,177.2 464.5,183.8 479.5,170.2 493.5,177 508,190.5 522,184 536.5,197.5 551,191 579,204.5',
  '623.5,183.8 637.5,170.5 652,190.2 666.5,177 680,183.5 695,197.5 709,184 723.5,197.5 737.5,191 752,204.5',
  '787,192.8 800.5,182 814,202.8 826.5,186.2 830,182 844,193 857.5,182 872,192.8 886,171 901.5,181.8 915,181.8'];
/* 04b sparklines for Fever / Malaria, in 04b stage px (converted below) */
const SPARK_B_RAW = {
  0:'47,217.5 55,215.5 64.5,217.5 73.5,213.8 82.5,215.5 91.5,211.5 99.5,210 105.5,207.5 110.5,205 117.5,200 126.5,196',
  1:'149,217.5 156.5,215.5 167,217.5 175.5,215.2 185,215.2 193,213.2 202,215.2 228.5,196.2'};
const b2a = (x,y)=>[(x-DTX)/DS,(y-DTY)/DS];
/* main chart, 04a space: 12 weekly points; 04a shows W1-W10, 04b all 12 */
const CH = {x0:433.5, dx:44.9, base:498, grid:[308.4,371.8,435.2,498], thr:425.4,
  feverA:[409.8,404.8,407.2,399.8,403.2,397.2,391.8,389.8,381.8,376.8],
  malA:[450,445.5,447.8,441.5,446.5,442.6,439,444,440,437.5],
  feverB:[409.4,404.6,407,399.8,403.5,397.4,391.8,389.7,377.4,362.2,344.6,328.9],
  malB:[450.2,445.4,447.8,441.4,446.7,442.6,439,443.8,440.6,432.6,418.9,404.6],
  box:[851,295,934.2,507.8], early:{x:792.7,y0:309.6,y1:497.3,ly:302.9}};
/* zoom chart (stage px). values read off the screen's 0-90 axis */
const Z = {x0:659.9, dx:29.43, y0:395.2, k:2.329, thrY:260, vals:[38,41.8,40,44.9,40.9,43.8,46.9,42.9,46,51.8,62.8,73.7]};
const zy = v => Z.y0 - v*Z.k, zx = i => Z.x0 + i*Z.dx;

/* ---------------- tiny DOM helpers ---------------- */
let UID = 0;
function h(tag, cls, style, html){ const e = document.createElement(tag); if(cls) e.className = cls; if(style) e.setAttribute('style', style); if(html!=null) e.innerHTML = html; return e; }
function abs(cls, style, html){ return h('div', 'abs ' + cls, style, html); }
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
function mix(stops, t){ for(let i=1;i<stops.length;i++){ if(t<=stops[i][0]){ const a=stops[i-1], b=stops[i], u=(t-a[0])/(b[0]-a[0]); return 'rgb('+a[1].map((c,j)=>Math.round(c+(b[1][j]-c)*u)).join(',')+')'; } } return 'rgb('+stops[stops.length-1][1].join(',')+')'; }
function pts(s){ return s.trim().split(/\s+/).map(p=>p.split(',').map(Number)); }
function resample(poly, n){ // n points evenly spaced in x along a polyline
  const x0 = poly[0][0], x1 = poly[poly.length-1][0], out = [];
  for(let k=0;k<n;k++){ const x = x0 + (x1-x0)*k/(n-1); let j=1; while(j<poly.length-1 && poly[j][0]<x) j++;
    const a=poly[j-1], b=poly[j], u=(b[0]-a[0])? (x-a[0])/(b[0]-a[0]) : 0; out.push([x, a[1]+(b[1]-a[1])*u]); }
  return out;
}
const dPath = P => 'M' + P.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L');
const series = ys => ys.map((y,i)=>[CH.x0 + i*CH.dx, y]);
const area = (P, base) => dPath(P) + ` L${P[P.length-1][0].toFixed(1)} ${base} L${P[0][0].toFixed(1)} ${base} Z`;

/* ---------------- icons ---------------- */
function airaMark(w, stroke, sw){ // asymmetric infinity, traced from the avatar (approximation, see README)
  const id = 'am' + (++UID);
  const paint = stroke === 'grad' ? `url(#${id})` : stroke;
  return `<svg class="mark" width="${w}" height="${w*0.75}" viewBox="0 0 32 24" aria-hidden="true">${stroke==='grad'?`<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9aaedc"/><stop offset=".38" stop-color="#f3776a"/><stop offset="1" stop-color="#f3776a"/></linearGradient></defs>`:''}
    <path d="M15.2 13.4C13.6 8.6 12 3 8.6 3 5.4 3 3.6 7.2 3.6 12.1 3.6 17.4 5.9 21 9 21c3 0 4.7-3.6 6.2-7.6 1.4-3.6 3.1-6 5.9-6 2.9 0 4.9 2.4 4.9 5.4 0 3.1-2 5.5-4.9 5.5-2.7 0-4.4-2-5.9-3.9" stroke="${paint}" stroke-width="${sw}"/></svg>`;
}
const I = {
  back:'<svg width="12" height="18" viewBox="0 0 12 18"><path d="M9.5 2 2.6 9l6.9 7" fill="none" stroke="#2b333d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  mic:'<svg width="22" height="26" viewBox="0 0 22 26" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><rect x="7" y="2" width="8" height="13.5" rx="4"/><path d="M3.2 11.6a7.8 7.8 0 0 0 15.6 0M11 19.6V24"/></svg>',
  check:(c,w)=>`<svg width="${w||14}" height="${w||14}" viewBox="0 0 24 24" fill="none" stroke="${c||'#fff'}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.6 4.6L19 7.6"/></svg>`,
  phone:c=>`<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 1.6 4.2 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.6 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>`,
  phoneCall:'<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 1.6 4.2 2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.6 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/><path d="M15 5.2A5 5 0 0 1 18.8 9M15 1.4A8.8 8.8 0 0 1 22.6 9"/></svg>',
  flag:'<svg width="10" height="11" viewBox="0 0 10 11"><path d="M2 1v9M2 1.4h5.6v4.2H2" fill="#fff" stroke="#fff" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>',
  bell:'<svg width="24" height="26" viewBox="0 0 24 26" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 9A6 6 0 0 0 6 9c0 7-3 9-3 9h18s-3-2-3-9M13.7 22a2 2 0 0 1-3.4 0"/></svg>',
  trend:'<svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 10.5 6.2 5.3l3.4 3.4L15.6 2.6M11 2.4h4.8v4.8"/></svg>',
  up:'<svg width="10" height="9" viewBox="0 0 10 9"><path d="M5 .5 9.6 8.5H.4z" fill="currentColor"/></svg>',
  dn:'<svg width="10" height="9" viewBox="0 0 10 9"><path d="M5 8.5 9.6.5H.4z" fill="currentColor"/></svg>',
  pointer:'<svg class="pointer" viewBox="0 0 26 32" width="26" height="32" aria-hidden="true"><path d="M2 2 L2 25 L8.2 19.3 L12.6 29 L16.6 27.2 L12.3 17.8 L20.5 17.8 Z" fill="#fff" stroke="#303030" stroke-width="1.3" stroke-linejoin="round"/></svg>',
};

/* ======================================================================
   BUILD
   ====================================================================== */
function build(film){
  const stage = h('div', 'stage'); stage.setAttribute('role','img');
  stage.setAttribute('aria-label','Aira: listens during the visit and captures coded symptoms; recommends a malaria test in real time that the health worker accepts; follows up by phone after the visit and flags a household contact; and surfaces a district malaria signal across facilities.');
  film.appendChild(stage);

  /* ---------- SCENE 1 · VISIT ---------- */
  const V = h('div', 'scene sc-visit'); stage.appendChild(V);
  V.appendChild(abs('v-win'));
  const rest = h('div', 'v-rest'); V.appendChild(rest);
  rest.appendChild(abs('v-back', '', I.back));
  rest.appendChild(abs('v-title', '', esc(COPY.visitTitle)));
  rest.appendChild(abs('v-skel', 'left:784px;width:116.5px'));
  rest.appendChild(abs('v-skel', 'left:916px;width:78px'));
  rest.appendChild(abs('v-hdiv'));
  const bar = abs('v-bar'); rest.appendChild(bar);
  rest.appendChild(abs('v-ava', '', airaMark(40, '#fff', 2.3)));
  rest.appendChild(abs('v-listen', '', esc(COPY.listening)));
  rest.appendChild(abs('v-capt', '', esc(COPY.capturing)));
  const wave = abs('v-wave'); rest.appendChild(wave);
  WAVE.h.forEach((hh,i)=>{ const x = WAVE.x0 + i*WAVE.step - 405; const b = h('i', '', `left:${(x-1.85).toFixed(1)}px;height:${Math.max(hh,3.7)}px;background:${mix(WAVE_STOPS, i/(WAVE.h.length-1))}`); b.dataset.h = hh; wave.appendChild(b); });
  rest.appendChild(abs('v-mic', '', '<i class="h1"></i><i class="h2"></i><span class="core">'+I.mic+'</span>'));

  const sym = h('div', 'v-sym'); rest.appendChild(sym);
  sym.appendChild(abs('v-symlbl', '', esc(COPY.symptomsLbl)));
  sym.appendChild(abs('v-tag', '', `<span class="swap"><span class="t-w"><i class="dot"></i>${esc(COPY.writing)}</span><span class="t-c" style="opacity:0">${I.check('#008280',15)}${esc(COPY.captured)}</span></span>`));
  sym.appendChild(abs('v-box', '', `<i class="fill-w"></i><div class="txt"><span class="typed"></span><i class="caret"></i></div>`));
  const chipX = [106,267.3,366,460.7,592.3];
  COPY.chips.forEach((c,i)=>{
    const gid = 'cg' + (++UID);
    sym.appendChild(abs('v-chip c'+i, `left:${chipX[i]}px`, `<svg preserveAspectRatio="none"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f08a80"/><stop offset="1" stop-color="#a7b6e0"/></linearGradient></defs><rect x=".75" y=".75" style="width:calc(100% - 1.5px);height:calc(100% - 1.5px)" rx="18" fill="#fff" stroke="url(#${gid})" stroke-width="1.5" stroke-dasharray="4.5 3.2"/></svg><i class="bg"></i><span>${esc(c)}</span>`));
  });
  const vit = h('div', 'v-vits'); rest.appendChild(vit);
  vit.appendChild(abs('v-vitlbl', '', esc(COPY.vitalsLbl)));
  [[106,315],[329.7,537],[551.7,760.8],[775.3,982.8]].forEach(([a,b],i)=>{
    const [k,v,u] = COPY.vitals[i];
    vit.appendChild(abs('v-vit', `left:${a}px;width:${b-a}px`, `<div class="k">${esc(k)}</div><div class="v">${esc(v)}${u?`<small class="${u==='%'?'ss':''}">${esc(u)}</small>`:''}</div>`));
  });
  rest.appendChild(abs('v-trlbl', '', esc(COPY.treatLbl)));

  // recommendation card (lift-out) + treatment row
  V.appendChild(abs('v-trow', '', `<i class="dot"></i><b>${esc(COPY.rdt)}</b><span class="d">${esc(COPY.rdtDesc)}</span><span class="pill">${I.check('#036869',16)}${esc(COPY.accepted)}</span>`));
  V.appendChild(abs('v-rec', '', `<div class="hd"><span class="ava">${airaMark(19,'#fff',2.6)}</span><span class="ovl">${esc(COPY.recOvl)}</span></div>
    <h4>${esc(COPY.recTitle)}</h4><p>${esc(COPY.recBody)}</p>
    <div class="acts"><span class="v-btn acc">${esc(COPY.accept)}</span><span class="v-btn dis">${esc(COPY.dismiss)}</span>
      <div class="v-accd"><span class="ck">${I.check('#fff',16)}</span><b>${esc(COPY.accepted)}</b><span>${esc(COPY.added)}</span></div></div>`));

  /* ---------- SCENE 2 · CALL ---------- */
  const C = h('div', 'scene sc-call'); stage.appendChild(C);
  // [top, skeleton widths, state, opacity]
  const ROWS = [[-19.4,[98.8,64],'ok0',.5],[66.6,[80,49.4],'ok',1],[152.4,[92,46.8],'ok',1],[383.2,[97.8,60.8],'pend',1],[469,[87.4,51.5],'pend',.55]];
  ROWS.forEach(([top,[w1,w2],st,op],i)=>{
    const teal = st!=='pend';
    const pill = st==='ok0' ? `<span class="st ok" style="color:#7fb6b3">${esc(COPY.reached)}</span>`
      : st==='ok' ? `<span class="swap"><span class="st pend s-p" style="opacity:0">${esc(COPY.pending)}</span><span class="st ok s-r">${I.check('#2c8a86',13)}${esc(COPY.reached)}</span></span>`
      : `<span class="st pend">${esc(COPY.pending)}</span>`;
    C.appendChild(abs('c-row r'+i, `top:${top}px;opacity:${op}`, `<span class="ph" style="${teal?'':'background:#f3f4f4'}">${I.phone(teal?(st==='ok0'?'#7fb6b3':'#2c8a86'):'#8e9399')}</span><i class="s1" style="width:${w1}px"></i><i class="s2" style="width:${w2}px"></i>${pill}`));
  });
  const live = abs('c-live', '', `<div class="c-call"><i class="r3"></i><i class="r2"></i><i class="r1">${I.phoneCall}</i></div>
    <span class="c-livep"><i class="rec"></i>${esc(COPY.live)}</span><span class="c-time">${esc(COPY.timer)}</span>
    <span class="c-ftitle">${esc(COPY.followup)}</span><div class="c-wave"></div>`);
  C.appendChild(live);
  const cw = live.querySelector('.c-wave');
  CWAVE.h.forEach((hh,i)=>{ const x = CWAVE.x0 + i*CWAVE.step - 40.6 - 2 - 119; const b = h('i', '', `left:${(x-.8).toFixed(1)}px;height:${hh}px;background:${mix(WAVE_STOPS, i/(CWAVE.h.length-1))}`); b.dataset.h = hh; cw.appendChild(b); });
  C.appendChild(abs('c-aira', '', airaMark(18,'grad',2.4) + esc(COPY.aira)));
  C.appendChild(abs('c-q', '', `<span class="typed"></span><i class="caret" style="opacity:0"></i>`));
  C.appendChild(abs('c-stat', '', `<i class="dot"></i><span>${esc(COPY.patient)} · <span class="swap"><span class="s-l">${esc(COPY.listeningSt)}</span><span class="s-s" style="opacity:0">${esc(COPY.speakingSt)}</span></span></span>`));
  C.appendChild(abs('c-ans', '', `<i class="bd"></i><div class="c-dots"><i style="background:#f3776a"></i><i style="background:#b89bb2"></i><i style="background:#c1cfe9"></i></div>
    <div class="c-atxt">${COPY.answer.map(([t,hl],i)=>`<span class="seg${hl?' hl':''}" data-i="${i}">${esc(t)}</span>`).join('')}<i class="caret"></i></div>`));
  const XC = [[443,null],[636.5,null],[784,'flag']];
  COPY.xchips.forEach((c,i)=>{
    const [x,f] = XC[i];
    C.appendChild(abs('c-chip x'+i+(f?' flag':''), `left:${x}px`, f ? `<span class="ck">${I.flag}</span>${esc(c[0])}` : `<span class="ck">${I.check('#fff',12)}</span><span>${esc(c[0])} <b>${esc(c[1])}</b></span>`));
  });

  /* ---------- SCENE 3 · DASHBOARD ---------- */
  const D = h('div', 'scene sc-dash'); stage.appendChild(D);
  const dash = abs('d-dash'); D.appendChild(dash);
  const win = abs('d-win', '', '<div class="d-hdr"></div>'); dash.appendChild(win);
  dash.appendChild(abs('d-logo', 'transform:translateY(-50%)', airaMark(24,'grad',2.2)));
  dash.appendChild(abs('d-title', 'transform:translateY(-50%)', esc(COPY.dash)));
  dash.appendChild(abs('d-fchip', 'left:701px', esc(COPY.district)));
  dash.appendChild(abs('d-fchip', 'left:825.8px', esc(COPY.window)));
  dash.appendChild(abs('d-ovl', '', esc(COPY.trends.toUpperCase())));
  TRENDS.forEach(([nm,tag,tc,a],i)=>{
    const [x0,x1] = TC_X[i];
    dash.appendChild(abs('d-card d-tc t'+i, `left:${x0}px;width:${x1-x0}px`,
      `<div class="nm">${esc(nm)}<span class="d-tag ${tc}">${esc(tag.toUpperCase())}</span></div>
       <div class="d-wow ${a[0]}">${I[a[0]]}<span><span class="n">${a[1]}</span>% WoW</span></div><i class="d-sel"></i>`));
  });
  // sparklines (one svg, 04a space)
  const sp = svgEl('svg', {class:'d-spark', width:1040, height:600}); dash.appendChild(sp);
  SPARK_A.forEach((s,i)=>{ const p = svgEl('path', {class:'sp'+i, d:dPath(resample(pts(s), 10))}); sp.appendChild(p); });
  // map card
  dash.appendChild(abs('d-card d-map', '', `<div class="d-ct">${esc(COPY.cases)}</div><div class="d-cs">${esc(COPY.casesSub)}</div>`));
  const M = window.AIRA_MAP;
  const map = svgEl('svg', {class:'d-mapsvg', width:M.w, height:M.h, viewBox:`0 0 ${M.w} ${M.h}`, style:'position:absolute;left:120px;top:280px'});
  M.districts.forEach(d=>{ const p = svgEl('path', {d:d.d, fill:d.a, stroke:'#fff', 'stroke-width':.7, 'stroke-linejoin':'round'}); p.dataset.a = d.a; p.dataset.b = d.b; if(d.id) p.dataset.id = d.id; map.appendChild(p); });
  const ring = svgEl('circle', {class:'d-ring', cx:M.mocuba[0], cy:M.mocuba[1], r:9.6, fill:'none', stroke:'#0c1723', 'stroke-width':2.4}); map.appendChild(ring);
  dash.appendChild(map);
  dash.appendChild(abs('d-leg', 'left:293.8px;top:293.6px', esc(COPY.high)));
  M.legend.forEach((c,i)=>dash.appendChild(abs('d-sw', `left:293.8px;top:${[315,329.7,344.2,358.8,373.4,387.4][i]-5.5}px;width:14.5px;height:11px;background:${c}`)));
  dash.appendChild(abs('d-leg', 'left:293.8px;top:396px', esc(COPY.low)));
  dash.appendChild(abs('d-mloc', 'left:293.8px;top:425.6px', `<b>${esc(COPY.mocuba)}</b><span class="n">${COPY.casesA}</span> cases`));
  // chart card
  dash.appendChild(abs('d-card d-chart', '', `<div class="d-ct">${esc(COPY.chart)}</div><div class="d-cs">${esc(COPY.chartSub)}</div>`));
  const pl = svgEl('svg', {class:'d-plot', width:1040, height:600}); dash.appendChild(pl);
  pl.innerHTML = `<defs>
      <linearGradient id="fvA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe5f6"/><stop offset="1" stop-color="#eef1f9"/></linearGradient>
      <linearGradient id="mlA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f9dcdc"/><stop offset="1" stop-color="#eef1f9" stop-opacity="0"/></linearGradient>
      <clipPath id="ccl"><rect class="cclip" x="${CH.x0-2}" y="290" width="${9*CH.dx+4}" height="220"/></clipPath></defs>
    ${CH.grid.map(y=>`<line x1="433" x2="926.6" y1="${y}" y2="${y}" stroke="#eef0f2" stroke-width="1"/>`).join('')}
    <g clip-path="url(#ccl)">
      <path class="fa" fill="url(#fvA)" d="${area(series(CH.feverB.slice(0,10).map((y,i)=>CH.feverA[i])),CH.base)}"/>
      <path class="ma" fill="url(#mlA)" d="${area(series(CH.malA),CH.base)}"/>
      <path class="fl" fill="none" stroke="#93a6d6" stroke-width="2" stroke-linejoin="round" d="${dPath(series(CH.feverA))}"/>
      <path class="ml" fill="none" stroke="#f3776a" stroke-width="2" stroke-linejoin="round" d="${dPath(series(CH.malA))}"/>
    </g>
    <line x1="433" x2="926.6" y1="${CH.thr}" y2="${CH.thr}" stroke="#6b7280" stroke-width="1.2" stroke-dasharray="5 4"/>
    <g class="early" opacity="0"><line x1="${CH.early.x}" x2="${CH.early.x}" y1="${CH.early.y0}" y2="${CH.early.y1}" stroke="#9aaedc" stroke-width="1.3" stroke-dasharray="2 3"/>
      <text x="${CH.early.x}" y="${CH.early.ly+3.5}" text-anchor="middle" font-size="10.5" font-weight="500" fill="#6f86c6" font-family="IBM Plex Sans">▲ ${esc(COPY.early)}</text></g>
    <rect class="wbox" x="${CH.box[0]}" y="${CH.box[1]}" width="${CH.box[2]-CH.box[0]}" height="${CH.box[3]-CH.box[1]}" rx="6.4" fill="rgba(243,119,106,.06)" stroke="#f3776a" stroke-width="3.2" opacity="0"/>
    <line x1="426" x2="439.4" y1="539" y2="539" stroke="#93a6d6" stroke-width="3" stroke-linecap="round"/>
    <line x1="513.2" x2="526.8" y1="539" y2="539" stroke="#f3776a" stroke-width="3" stroke-linecap="round"/>
    <line x1="636.5" x2="647" y1="539" y2="539" stroke="#6b7280" stroke-width="2.4" stroke-dasharray="3.4 3.2"/>`;
  [[444,0],[531.4,1],[654,2]].forEach(([x,i])=>dash.appendChild(abs('d-leg', `left:${x}px;top:532px`, esc(COPY.legend[i]))));

  // zoom card (lift-out), stage space
  const zc = h('div', 'z-wrap'); D.appendChild(zc);
  const conn = svgEl('svg', {class:'abs z-conn', width:1040, height:600}); zc.appendChild(conn);
  conn.innerHTML = `<path class="cn1" d="M555.4 272 L603.2 166.4" stroke="#f3776a" stroke-width="1.6" stroke-dasharray="4.5 4" fill="none"/><path class="cn2" d="M555.4 407.2 L603.2 373.4" stroke="#f3776a" stroke-width="1.6" stroke-dasharray="4.5 4" fill="none"/>`;
  const zcard = abs('z-card'); zc.appendChild(zcard);
  zc.appendChild(abs('z-title', '', esc(COPY.zTitle)));
  zc.appendChild(abs('z-sub', '', esc(COPY.zSub)));
  zc.appendChild(abs('z-sig', '', I.trend + esc(COPY.signal)));
  const zp = svgEl('svg', {class:'abs z-plot', width:1040, height:600}); zc.appendChild(zp);
  const ZP = Z.vals.map((v,i)=>[zx(i), zy(v)]);
  zp.innerHTML = `<defs>
      <linearGradient id="zl" gradientUnits="userSpaceOnUse" x1="${zx(0)}" x2="${zx(11)}" y1="0" y2="0"><stop offset="0" stop-color="#9aaedc"/><stop offset=".55" stop-color="#c49aae"/><stop offset=".8" stop-color="#e88a83"/><stop offset="1" stop-color="#f3776a"/></linearGradient>
      <linearGradient id="za" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe9ec"/><stop offset="1" stop-color="#fdf6f8" stop-opacity=".3"/></linearGradient></defs>
    <rect class="zband" x="940" y="185.6" width="48" height="209.6" fill="#fdeceb" opacity=".75"/>
    ${[90,30,0].map(v=>`<line x1="660" x2="988" y1="${zy(v)}" y2="${zy(v)}" stroke="#eceef0" stroke-width="1"/>`).join('')}
    ${[90,60,30,0].map(v=>`<text class="z-axis" x="650" y="${zy(v)+4.2}" text-anchor="end">${v}</text>`).join('')}
    ${[[0,'W1'],[3,'W4'],[7,'W8'],[11,'W12']].map(([i,t])=>`<text class="z-axis" x="${zx(i)}" y="${416}" text-anchor="middle">${t}</text>`).join('')}
    <path class="zarea" fill="url(#za)" d="${area(ZP, Z.y0)}"/>
    <line x1="660" x2="988" y1="${Z.thrY}" y2="${Z.thrY}" stroke="#6b7280" stroke-width="1.3" stroke-dasharray="6 4.5"/>
    <text x="664" y="${248+4.6}" font-size="13" fill="#6b7280" font-family="IBM Plex Sans">${esc(COPY.threshold)}</text>
    <path class="zline" fill="none" stroke="url(#zl)" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round" d="${dPath(ZP)}"/>
    ${ZP.map(([x,y],i)=>i<10?`<circle class="zd zd${i}" cx="${x}" cy="${y}" r="4.1" fill="#fff" stroke="${mix([[0,[154,174,220]],[.55,[196,154,174]],[1,[243,119,106]]], i/11)}" stroke-width="2"/>`:'').join('')}
    <circle class="zr2" cx="${ZP[11][0]}" cy="${ZP[11][1]}" r="23" fill="none" stroke="#fbd5d0" stroke-width="1.6"/>
    <circle class="zr1" cx="${ZP[11][0]}" cy="${ZP[11][1]}" r="13.5" fill="rgba(243,119,106,.07)" stroke="#f6a197" stroke-width="2"/>
    <circle class="zd zd10" cx="${ZP[10][0]}" cy="${ZP[10][1]}" r="4.7" fill="#f3776a" stroke="#fff" stroke-width="1.2"/>
    <circle class="zd zd11" cx="${ZP[11][0]}" cy="${ZP[11][1]}" r="5" fill="#f3776a" stroke="#fff" stroke-width="1.2"/>
    <path class="zlead" d="M926 229 L958 222.5" stroke="#0c1723" stroke-width="1.6" fill="none"/>`;
  zc.appendChild(abs('z-call', '', esc(COPY.jump) + '<i class="tri"></i>'));
  // notification
  D.appendChild(abs('n-card', '', `<i class="n-pulse"></i><span class="n-bell"><i>${I.bell}</i></span><span class="n-t">${esc(COPY.notifT)}</span><span class="n-s">${esc(COPY.notifS)}</span><span class="n-now">${esc(COPY.now)}</span>`));

  /* ---------- shared ---------- */
  stage.appendChild(h('div', 'abs cursor-wrap', 'left:0;top:0;opacity:0;z-index:50', I.pointer));
  const lbl = h('div', 'cardlabel abs', 'opacity:0'); stage.appendChild(lbl);
  return stage;
}
function svgEl(tag, attrs){ const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for(const k in attrs) e.setAttribute(k, attrs[k]); return e; }

/* ======================================================================
   KEYFRAMES (static states; Phase 2 tweens between them)
   ====================================================================== */
const S = (stage, sel, props) => { const els = typeof sel === 'string' ? stage.querySelectorAll(sel) : sel; gsap.set(els, props); };
function only(stage, scene){ ['.sc-visit','.sc-call','.sc-dash'].forEach(s=>S(stage, s, {autoAlpha: s===scene?1:0})); S(stage, '.v-rec,.v-trow,.z-wrap,.n-card', {autoAlpha:0}); }
function label(stage, ch, css){ const l = stage.querySelector('.cardlabel'); l.textContent = CARD_LABELS[ch]; l.removeAttribute('style'); l.setAttribute('style', css); }
function typed(stage, sel, text){ stage.querySelector(sel + ' .typed').textContent = text; }
const cut = (s, upto) => s.slice(0, s.indexOf(upto) + upto.length);

/* visit layouts */
function visitTyping(stage, text, lines){
  only(stage, '.sc-visit');
  typed(stage, '.v-box', text);
  S(stage, '.v-box', {height: lines===2 ? 104.5 : 71.8});
  S(stage, '.v-chip', {autoAlpha:0});
  S(stage, '.v-trlbl', {autoAlpha: lines===2 ? 0 : 1});
  if(lines===2) S(stage, '.v-vits', {y:32.3});
}
function chipsOn(stage, filled){
  S(stage, '.v-chip', {autoAlpha:1});
  for(let i=0;i<filled;i++){ S(stage, `.v-chip.c${i} .bg`, {opacity:1}); S(stage, `.v-chip.c${i} span`, {color:'#fff'}); S(stage, `.v-chip.c${i} svg`, {opacity:0}); }
}
function captured(stage){
  S(stage, '.v-tag .t-w', {opacity:0}); S(stage, '.v-tag .t-c', {opacity:1}); S(stage, '.v-tag', {width:159.5});
  S(stage, '.v-box .fill-w', {opacity:1}); S(stage, '.v-box', {borderColor:'#efd5df', boxShadow:'0 10px 24px -14px rgba(170,140,220,.30)'});
  S(stage, '.v-box .caret', {opacity:0});
  S(stage, '.v-vitlbl', {color:'#39414c'}); S(stage, '.v-vit .k', {color:'#565d66'}); S(stage, '.v-vit .v', {color:'#39414c'}); S(stage, '.v-vit .v small', {color:'#565d66'});
}
function recState(stage, accepted){
  visitTyping(stage, COPY.symptoms, 2); chipsOn(stage, 3); captured(stage);
  S(stage, '.v-rest', {opacity:.35, filter:'blur(3px)'});          // lift-out: the rest dims (qTrack) + blur (screen)
  S(stage, '.v-rec', {autoAlpha:1});
  if(accepted){ S(stage, '.v-btn', {opacity:0}); S(stage, '.v-accd', {opacity:1}); }
}

const KEYFRAMES = [
 {id:'01a', ch:1, t:1.9,  png:'01a-visit-listening-typing.png', title:'Aira is listening',
  note:'Waveform loops; symptoms type in at ~34 cps with a teal caret; vitals and treatment plan stay greyed (not needed yet).',
  apply:s=>{ visitTyping(s, cut(COPY.symptoms,'with chills'), 1); }},
 {id:'01b', ch:1, t:5.0,  png:'01b-visit-symptoms-typed.png', title:'Symptoms typed, chips appear',
  note:'Typing ends; the box grows to two lines (glide) and five dashed chips pop in as outlines, staggered 60 ms; vitals slide down.',
  apply:s=>{ visitTyping(s, COPY.symptoms, 2); chipsOn(s, 0); }},
 {id:'01c', ch:1, t:7.4,  png:'01c-visit-captured-by-aira.png', title:'Captured by Aira',
  note:'Tag morphs "Aira writing" → "✓ Captured by Aira"; chips fill teal one by one (150 ms apart); box settles to white; vitals un-grey. Label slides in; hold 0.8 s.',
  apply:s=>{ visitTyping(s, COPY.symptoms, 2); chipsOn(s, 3); captured(s); label(s, 1, 'left:732px;top:399.4px;right:auto;bottom:auto'); }},
 {id:'02a', ch:2, t:10.2, png:'02a-realtime-recommendation-accept.png', title:'Recommendation lifts out',
  note:'Visit dims to 35% (+3 px blur, as in the screen); the Aira · Recommendation card rises 24 px (emph); pointer glides in to Accept.',
  apply:s=>{ recState(s, false); S(s, '.cursor-wrap', {opacity:1, x:400, y:396}); }},
 {id:'02b', ch:2, t:11.3, png:'02b-realtime-recommendation-accepted.png', title:'Accepted',
  note:'Click: pointer and button press 0.96 → 1; the two buttons morph (glide) into one "Recommendation accepted · Added to treatment plan" bar; check pops.',
  apply:s=>{ recState(s, true); }},
 {id:'02c', ch:2, t:13.6, png:'02c-realtime-treatment-plan.png', title:'Settles into the treatment plan',
  note:'Card shrinks and glides into the Treatment plan row (FLIP); chips and vitals fold away; symptoms text greys; label slides in; hold 0.8 s.',
  apply:s=>{ visitTyping(s, COPY.symptoms, 2);
    S(s, '.v-chip,.v-vits,.v-tag', {autoAlpha:0});
    S(s, '.v-symlbl', {y:-12}); S(s, '.v-box', {y:-13, height:100.5}); S(s, '.v-box .fill-w', {opacity:1}); S(s, '.v-box', {borderColor:'#f5e4ec', boxShadow:'none'});
    S(s, '.v-box .txt', {color:'#7c838b'}); S(s, '.v-box .caret', {opacity:0});
    S(s, '.v-trlbl', {autoAlpha:1, top:406, color:'#0c1723'});
    S(s, '.v-trow', {autoAlpha:1});
    label(s, 2, 'right:auto;bottom:auto;left:706px;top:405px'); }},
 {id:'03a', ch:3, t:17.7, png:'03a-after-call-patient-listening.png', title:'Follow-up call: Aira asks',
  note:'Camera glide + crossfade in; earlier rows tick to "Reached"; LIVE row lifts out with teal ring; timer counts; question types in; patient bubble shows listening dots.',
  apply:s=>{ only(s, '.sc-call'); typed(s, '.c-q', COPY.question); S(s, '.c-chip', {autoAlpha:0}); }},
 {id:'03b', ch:3, t:19.6, png:'03b-after-call-patient-speaking.png', title:'Patient speaking',
  note:'Status swaps listening → speaking; dots fade; bubble widens as the answer types; "my son" and "6" get the Peach sweep as they land.',
  apply:s=>{ only(s, '.sc-call'); typed(s, '.c-q', COPY.question); answerTo(s, 5); S(s, '.c-chip', {autoAlpha:0}); }},
 {id:'03c', ch:3, t:22.2, png:'03c-after-call-extracted-flags.png', title:'Extracted and flagged',
  note:'"fever since yesterday" swept; bubble wraps to two lines; chips pop in 120 ms apart, the last in alert style; hold 0.8 s.',
  apply:s=>{ only(s, '.sc-call'); typed(s, '.c-q', COPY.question); answerTo(s, 7); }},
 {id:'04a', ch:4, t:25.4, png:'04a-facilities-district-signals.png', title:'District signals',
  note:'Glide + crossfade into the dashboard; trend cards stagger in (60 ms); sparklines and chart lines draw (glide).',
  apply:s=>{ only(s, '.sc-dash'); }},
 {id:'04b', ch:4, t:30.0, png:'04b-facilities-malaria-signal.png', title:'Malaria signal lifts out',
  note:'Malaria selected; dashboard glides to 62%; counts tick up (9→26, 4→42, 96→214); Mocuba colours + ring; last-2-weeks box draws; chart lifts out: line draws to the peak, Peach ring, "+42%" slides in, Signal pops.',
  apply:s=>{ only(s, '.sc-dash'); dashB(s); S(s, '.z-wrap', {autoAlpha:1}); }},
 {id:'04c', ch:4, t:31.4, png:'04c-facilities-district-team-alerted.png', title:'District team alerted',
  note:'Notification slides up 24 px (emph) with one red pulse; label slides in; hold 0.8 s, then crossfade back to CH1.',
  apply:s=>{ only(s, '.sc-dash'); dashB(s); S(s, '.z-wrap,.n-card', {autoAlpha:1}); label(s, 4, 'right:auto;bottom:auto;left:40px;top:548px'); }},
];
function answerTo(stage, n){ // reveal answer segments [0, n)
  const segs = stage.querySelectorAll('.c-atxt .seg');
  segs.forEach((e,i)=>{ e.style.display = i<n ? '' : 'none'; if(e.classList.contains('hl') && i<n) e.style.backgroundSize = '100% 100%, 100% 2px'; });
  S(stage, '.c-stat .s-l', {opacity:0}); S(stage, '.c-stat .s-s', {opacity:1});
  S(stage, '.c-dots', {opacity:0}); S(stage, '.c-atxt', {opacity:1});
  const done = n >= segs.length;
  S(stage, '.c-ans', done ? {width:559, height:93.6} : {width:358.4, height:62.4});
}
function dashB(stage){
  S(stage, '.d-dash', {scale:DS, x:DTX, y:DTY});
  // data that changes between 04a and 04b
  TRENDS.forEach((t,i)=>{ stage.querySelector(`.d-tc.t${i} .n`).textContent = t[4][1]; });
  stage.querySelector('.d-mloc .n').textContent = COPY.casesB;
  S(stage, '.d-tc.t1 .d-sel', {opacity:1});
  Object.entries(SPARK_B_RAW).forEach(([i,s])=>{ const p = stage.querySelector('.sp'+i); p.setAttribute('d', dPath(resample(pts(s).map(q=>b2a(...q)), 10))); if(+i===1) p.style.stroke = '#f3776a'; });
  stage.querySelectorAll('.d-mapsvg path').forEach(p=>p.setAttribute('fill', p.dataset.b));
  S(stage, '.d-ring', {opacity:1});
  S(stage, '.cclip', {attr:{width:11*CH.dx+4}});
  S(stage, '.fl', {attr:{d:dPath(series(CH.feverB))}}); S(stage, '.ml', {attr:{d:dPath(series(CH.malB))}});
  S(stage, '.fa', {attr:{d:area(series(CH.feverB),CH.base)}}); S(stage, '.ma', {attr:{d:area(series(CH.malB),CH.base)}});
  S(stage, '.early,.wbox', {opacity:1});
}

function apply(stage, id){
  // base state: things that are hidden until a keyframe asks for them
  S(stage, '.d-ring', {opacity:0});
  const k = KEYFRAMES.find(k=>k.id===id); k.apply(stage);
}

window.AiraStage = {build, apply, KEYFRAMES, COPY, CARD_LABELS, TRENDS, geometry:{WAVE,CWAVE,DS,DTX,DTY,CH,Z,SPARK_A,SPARK_B_RAW}, helpers:{resample,pts,dPath,series,area,b2a,mix,WAVE_STOPS}};
})();

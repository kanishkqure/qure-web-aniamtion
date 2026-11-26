#!/usr/bin/env node
/* Aira film QA — writes aira/review/qa-report.md
     node aira/tools/qa.js
   1. anonymisation search   2. forbidden terms (qFlow, EMR vendors) + gradients
   3. console from a fresh empty folder (both files)   4. events / segments / reduced motion
   5. frame rate at 1440 wide (+ renderer)   6. file sizes
   Needs Playwright + Chromium (network for the pinned GSAP on jsDelivr). */
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path'), os = require('os');
const root = path.resolve(__dirname, '..');
const FILM = path.join(root, 'aira-film.html'), PREV = path.join(root, 'motion-preview-standalone.html');
const out = [], fail = [];
const log = s => { out.push(s); console.log(s); };
const ok = (cond, msg) => { if(!cond) fail.push(msg); return cond ? 'PASS' : 'FAIL'; };

// dummy data that is allowed to appear, and words that are allowed to be capitalised
const DUMMY = ['John Doe · 64M', 'Mocuba district'];
const ALLOW = new Set(('Aira The John Doe Mocuba Fever Cyclic Chills Headache Body Malaria RDT EMR LIVE Has Yes He Contact Flagged District Data Saved '
  + 'Validated Recommendation Accept Dismiss Accepted Treatment Presenting Capturing Captured Writing Listening Speaking Patient Pending Reached Follow '
  + 'Follow-up Cases Disease Weekly Alert Signal Now Wk WoW AIRA RECOMMENDATION PRESENTING SYMPTOMS TREATMENT PLAN CASES BY DISTRICT MALARIA MOCUBA '
  + 'DISTRICT ALERT THRESHOLD DISEASE IN WEEKS SAVED TO NATIONAL CODED VALIDATED THE HEALTH WORKER DATA STAYS COUNTRY Cyclic Does M Visit Calls Signals Visit').split(/\s+/));
const VENDORS = ['qFlow','Epic','Cerner','Oracle Health','Meditech','MEDITECH','Allscripts','athenahealth','eClinicalWorks','NextGen','Veradigm','OpenMRS',
  'OpenEMR','Bahmni','DHIS2','DHIS 2','SESP','SIS-MA','eSIS','Medic Mobile','CommCare','iSantePlus','Greenway','Practice Fusion','Kareo'];

function stripData(html){ return html.replace(/data:[a-z]+\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/gi, 'data:…'); }
function gradients(html){
  const src = stripData(html), found = [];
  const re = /(linear|radial|conic)-gradient\(/g; let m;
  while((m = re.exec(src))){                                   // balanced-parenthesis scan
    let i = re.lastIndex, depth = 1; while(i < src.length && depth){ if(src[i] === '(') depth++; else if(src[i] === ')') depth--; i++; }
    const body = src.slice(re.lastIndex, i-1);
    const stops = (body.match(/(#[0-9a-f]{3,8}|rgba?\([^)]*\)|var\([^)]*\))/gi) || []).map(s=>s.replace(/\s+/g,'').toLowerCase());
    found.push({kind:m[1], flat: stops.length > 0 && stops.every(s=>s === stops[0]), text:(m[0] + body + ')').slice(0, 100)});
  }
  const svg = (src.match(/<(linear|radial)Gradient/g) || []).length;
  return {css:found, svg};
}

(async()=>{
  const b = await chromium.launch();
  log('# Aira film — QA report');
  log('');
  log('Run: ' + new Date().toISOString() + ' · Chromium ' + b.version());

  /* ---------- 1. anonymisation ---------- */
  {
    const p = await b.newPage({viewport:{width:1440, height:900}});
    await p.goto('file://' + FILM); await p.waitForFunction(()=>window.airaFilm && window.airaFilm.ready);
    const texts = await p.evaluate(()=>{ const tl = airaFilm.timeline; tl.pause(); const st = document.querySelector('.stage'); const set = new Set();
      const words = () => { const w = document.createTreeWalker(st, NodeFilter.SHOW_TEXT), a = []; while(w.nextNode()) a.push(w.currentNode.nodeValue); return a.join(' '); };
      Object.values(airaFilm.keyframes).concat([0, airaFilm.duration - .01]).forEach(t=>{ tl.seek(t); set.add(words()); });
      return [...set].join('\n') + '\n' + JSON.stringify(AiraStage.COPY); });
    await p.close();
    const emails = texts.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || [];
    const phones = (texts.match(/\+?\d[\d\s().-]{7,}\d/g) || []).filter(s=>s.replace(/\D/g,'').length >= 8);
    const urls = texts.match(/https?:\/\/\S+|www\.\S+/g) || [];
    const caps = [...new Set((texts.match(/\b[A-Z][A-Za-z-]*\b/g) || []))].sort();
    const unknown = caps.filter(w=>!ALLOW.has(w));
    log(''); log('## 1. Anonymisation');
    log('- E-mail addresses: ' + emails.length + ' · phone numbers: ' + phones.length + ' · URLs: ' + urls.length + ' → ' + ok(!emails.length && !phones.length && !urls.length, 'contact details found'));
    log('- Capitalised words in the film (all text, all states): ' + caps.join(', '));
    log('- Not on the allow-list: ' + (unknown.length ? unknown.join(', ') : 'none') + ' → ' + ok(!unknown.length, 'unknown capitalised words: ' + unknown.join(', ')));
    log('- Person / place data present: ' + DUMMY.map(d=>'"' + d + '" ' + (texts.includes(d) ? '(dummy, as approved)' : '(absent)')).join(' · '));
  }

  /* ---------- 2. forbidden terms + gradients ---------- */
  log(''); log('## 2. Forbidden terms and gradients');
  for(const f of [FILM, PREV]){
    const html = fs.readFileSync(f, 'utf8'), src = stripData(html);
    const hits = VENDORS.filter(v=>new RegExp('\\b' + v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\b', v === 'Epic' ? '' : 'i').test(src));
    const g = gradients(html), nonflat = g.css.filter(x=>!x.flat);
    log('- `' + path.basename(f) + '`: qFlow / EMR vendor names: ' + (hits.length ? hits.join(', ') : 'none') + ' → ' + ok(!hits.length, path.basename(f) + ': ' + hits.join(',')));
    log('  - CSS gradients: ' + g.css.length + ' (' + (g.css.length - nonflat.length) + ' single-colour layers used by the qTrack highlight sweep), multi-colour: ' + nonflat.length + ', SVG gradient elements: ' + g.svg + ' → ' + ok(!nonflat.length && !g.svg, path.basename(f) + ': gradient'));
    nonflat.forEach(x=>log('    - ' + x.text));
  }

  /* ---------- 3. console from a fresh empty folder ---------- */
  log(''); log('## 3. Console, opened from a fresh empty folder');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aira-qa-'));
  for(const f of [FILM, PREV]){
    const dst = path.join(tmp, path.basename(f)); fs.copyFileSync(f, dst);
    const p = await b.newPage({viewport:{width:1440, height:900}}); const msgs = [];
    p.on('console', m=>{ if(['error','warning'].includes(m.type())) msgs.push(m.type() + ': ' + m.text()); });
    p.on('pageerror', e=>msgs.push('pageerror: ' + e.message));
    p.on('requestfailed', r=>msgs.push('failed: ' + r.url().slice(0, 90)));
    await p.goto('file://' + dst); await p.waitForFunction(()=>window.airaFilm && window.airaFilm.ready, null, {timeout:20000});
    await p.waitForTimeout(3000);
    const files = fs.readdirSync(tmp);
    log('- `' + path.basename(f) + '` (folder holds only: ' + files.join(', ') + '): ' + (msgs.length ? msgs.join(' | ') : 'no errors, no warnings, no failed requests') + ' → ' + ok(!msgs.length, path.basename(f) + ' console'));
    await p.close(); fs.rmSync(dst);
  }
  fs.rmSync(tmp, {recursive:true});

  /* ---------- 4. integration hooks ---------- */
  log(''); log('## 4. Integration hooks');
  {
    const p = await b.newPage({viewport:{width:1440, height:900}});
    await p.goto('file://' + FILM); await p.waitForFunction(()=>window.airaFilm && window.airaFilm.ready);
    const r = await p.evaluate(async()=>{ const tl = airaFilm.timeline, ev = [];
      window.addEventListener('aira:chapter', e=>ev.push([e.detail, +tl.time().toFixed(2)]));
      tl.pause(); tl.seek(0); tl.timeScale(10); tl.play(0);
      await new Promise(r=>setTimeout(r, (airaFilm.duration*1.15/10)*1000));
      tl.pause(); return {ev, labels:airaFilm.labels, total:airaFilm.duration, repeat:tl.repeat(), paused:tl.paused()}; });
    const order = r.ev.map(e=>e[0]).slice(0, 5).join(',');
    log('- Labels: ' + Object.entries(r.labels).map(([k,v])=>k + ' ' + v.toFixed(2) + ' s').join(' · ') + ' · loop ' + r.total.toFixed(2) + ' s · repeat ' + r.repeat);
    log('- `aira:chapter` events over one loop (+ wrap): ' + r.ev.map(e=>e[0] + '@' + e[1] + 's').join(', ') + ' → ' + ok(order.startsWith('1,2,3,4,1'), 'chapter events'));
    await p.close();
    // segment playback
    const s = await b.newPage({viewport:{width:1440, height:900}});
    await s.addInitScript(()=>{ const mo = new MutationObserver(()=>{ const f = document.getElementById('aira-film'); if(f){ f.dataset.start = 'ch3'; f.dataset.end = 'ch4'; mo.disconnect(); } });
      mo.observe(document, {childList:true, subtree:true}); });
    await s.goto('file://' + FILM); await s.waitForFunction(()=>!!(window.airaFilm && window.airaFilm.segment), null, {polling:100});
    await s.waitForTimeout(1500);
    const seg = await s.evaluate(()=>({t:airaFilm.timeline.time(), a:airaFilm.labels.ch3, b:airaFilm.labels.ch4, masterPaused:airaFilm.timeline.paused()}));
    log('- `data-start="ch3" data-end="ch4"`: master at ' + seg.t.toFixed(2) + ' s, inside [' + seg.a + ', ' + seg.b + '] → ' + ok(seg.t >= seg.a && seg.t <= seg.b, 'segment playback'));
    await s.close();
    // reduced motion
    const m = await b.newPage({viewport:{width:1440, height:900}, reducedMotion:'reduce'});
    await m.goto('file://' + FILM); await m.waitForFunction(()=>window.airaFilm && window.airaFilm.ready); await m.waitForTimeout(800);
    const rm = await m.evaluate(()=>({t:airaFilm.timeline.time(), kf:airaFilm.keyframes['02b'], paused:airaFilm.timeline.paused()}));
    log('- Reduced motion: paused ' + rm.paused + ' at ' + rm.t.toFixed(2) + ' s (CH2 "accepted" frame = ' + rm.kf + ' s) → ' + ok(rm.paused && Math.abs(rm.t - rm.kf) < .01, 'reduced motion'));
    await m.close();
    // off-screen pause
    const o = await b.newPage({viewport:{width:1440, height:900}});
    await o.goto('file://' + FILM); await o.waitForFunction(()=>window.airaFilm && window.airaFilm.ready);
    const off = await o.evaluate(async()=>{ document.body.style.paddingTop = '3000px'; window.scrollTo(0, 0); await new Promise(r=>setTimeout(r, 600)); return airaFilm.timeline.paused(); });
    log('- Pauses when scrolled out of view: ' + off + ' → ' + ok(off, 'off-screen pause'));
    await o.close();
  }

  /* ---------- 5. frame rate ---------- */
  log(''); log('## 5. Frame rate (1440 wide, one full loop in real time)');
  {
    const p = await b.newPage({viewport:{width:1440, height:900}});
    await p.goto('file://' + FILM); await p.waitForFunction(()=>window.airaFilm && window.airaFilm.ready);
    const renderer = await p.evaluate(()=>{ const c = document.createElement('canvas').getContext('webgl'); if(!c) return 'no WebGL';
      const d = c.getExtension('WEBGL_debug_renderer_info'); return d ? c.getParameter(d.UNMASKED_RENDERER_WEBGL) : c.getParameter(c.RENDERER); });
    const f = await p.evaluate(async()=>{ const tl = airaFilm.timeline; tl.play(0); const ts = [];
      await new Promise(r=>{ const t0 = performance.now(); const step = t=>{ ts.push(t); if(t - t0 < airaFilm.duration*1000) requestAnimationFrame(step); else r(); }; requestAnimationFrame(step); });
      const d = ts.slice(1).map((t,i)=>t - ts[i]); const sorted = [...d].sort((a,b)=>a-b);
      return {frames:d.length, avg:1000/(d.reduce((a,b)=>a+b,0)/d.length), p95ms:sorted[Math.floor(d.length*.95)], long:d.filter(x=>x > 34).length, worst:sorted[sorted.length-1]}; });
    const soft = /swiftshader|llvmpipe|software/i.test(renderer);
    log('- Renderer: ' + renderer + (soft ? ' — **software renderer (no GPU in this container)**' : ''));
    log('- ' + f.frames + ' frames · average ' + f.avg.toFixed(1) + ' fps · 95th percentile frame ' + f.p95ms.toFixed(1) + ' ms · frames over 34 ms: ' + f.long + ' · worst ' + f.worst.toFixed(1) + ' ms');
    await p.close();
  }

  /* ---------- 6. sizes ---------- */
  log(''); log('## 6. File sizes');
  const kb = f => (fs.statSync(f).size/1024).toFixed(1) + ' KB';
  [FILM, PREV, path.join(root, 'review/aira-loop.mp4')].forEach(f=>{ if(fs.existsSync(f)) log('- `' + path.relative(root, f) + '`: ' + kb(f)); });
  log('- GSAP 3.13.0 (core + CustomEase, TextPlugin, DrawSVGPlugin, MotionPathPlugin) loads from jsDelivr, pinned; not counted above');
  log(''); log(fail.length ? '**FAILED:** ' + fail.join(' · ') : '**All checks passed.**');
  await b.close();
  fs.mkdirSync(path.join(root, 'review'), {recursive:true});
  fs.writeFileSync(path.join(root, 'review/qa-report.md'), out.join('\n') + '\n');
  process.exitCode = fail.length ? 1 : 0;
})();

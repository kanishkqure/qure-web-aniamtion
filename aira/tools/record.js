#!/usr/bin/env node
/* One loop of aira-film.html as an MP4 (1280x740, 30 fps), frame-accurate: the master timeline is
   seeked frame by frame and each frame screenshotted, then encoded with ffmpeg (H.264, yuv420p).
     node aira/tools/record.js            -> aira/review/aira-loop.mp4 */
const {chromium} = require('playwright');
const {execFileSync} = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const root = path.resolve(__dirname, '..'), W = 1280, H = 740, FPS = 30;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aira-rec-'));
(async()=>{
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:W, height:H}, deviceScaleFactor:1});
  await p.addInitScript(()=>{ const mo = new MutationObserver(()=>{ const f = document.getElementById('aira-film'); if(f){ f.setAttribute('data-manual',''); mo.disconnect(); } });
    mo.observe(document, {childList:true, subtree:true}); });
  await p.goto('file://' + path.join(root, 'aira-film.html'));
  await p.waitForFunction(()=>!!(window.airaFilm && window.airaFilm.ready), null, {polling:100});
  // fill the 1280x740 frame (the film's 1040:600 box is 738.5 high at this width)
  await p.addStyleTag({content:'html,body{margin:0;overflow:hidden;background:#fff}.aira-film{width:1280px;aspect-ratio:auto;height:740px}'});
  const total = await p.evaluate(()=>{ airaFilm.timeline.pause(); return airaFilm.duration; });
  const n = Math.round(total*FPS);
  for(let i=0;i<n;i++){
    await p.evaluate(t=>{ airaFilm.timeline.seek(t); return 0; }, i/FPS);
    await p.screenshot({path:path.join(tmp, String(i).padStart(5,'0') + '.png'), clip:{x:0, y:0, width:W, height:H}});
  }
  await b.close();
  fs.mkdirSync(path.join(root, 'review'), {recursive:true});
  const out = path.join(root, 'review/aira-loop.mp4');
  execFileSync('ffmpeg', ['-y','-loglevel','error','-framerate',String(FPS),'-i',path.join(tmp,'%05d.png'),'-c:v','libx264','-preset','slow','-crf','18',
    '-pix_fmt','yuv420p','-movflags','+faststart',out], {stdio:'inherit'});
  fs.rmSync(tmp, {recursive:true});
  console.log(out, n + ' frames', (fs.statSync(out).size/1024).toFixed(0) + ' KB');
})();

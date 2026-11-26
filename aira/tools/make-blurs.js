#!/usr/bin/env node
/* Pre-blurred shell layers for the lift-outs (same recipe as the qTrack blur-*.webp files:
   the device rendered sharp, reduced to 1/3, blurred, saved as a tiny WebP).
     node aira/tools/make-blurs.js            (run from the repo root or aira/)
   Needs Playwright + Chromium and python3 with Pillow. */
const {chromium} = require('playwright');
const {execFileSync} = require('child_process');
const path = require('path'), fs = require('fs'), os = require('os');
const root = path.resolve(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aira-blur-'));
(async()=>{
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1600, height:923}});
  for(const n of ['visit','rec','calls','dash']){
    await p.goto('file://' + root + '/aira-storyboard.html?shell=' + n);
    await p.waitForSelector('body[data-ready="1"]'); await p.waitForTimeout(150);
    await p.screenshot({path:path.join(tmp, n + '.png'), clip:{x:240, y:64, width:1120, height:796}});
  }
  await b.close();
  execFileSync('python3', ['-c', `
import sys
from PIL import Image, ImageFilter
for n in ['visit','rec','calls','dash']:
    im = Image.open(sys.argv[1] + '/' + n + '.png').convert('RGB')
    im = im.resize((im.width//3, im.height//3), Image.LANCZOS).filter(ImageFilter.GaussianBlur(2.2))
    im.save(sys.argv[2] + '/blur-' + n + '.webp', 'WEBP', quality=72)
`, tmp, path.join(root, 'assets/blur')], {stdio:'inherit'});
  fs.rmSync(tmp, {recursive:true});
  console.log('wrote', fs.readdirSync(path.join(root, 'assets/blur')).map(f=>f+' '+fs.statSync(path.join(root,'assets/blur',f)).size+'B').join(', '));
})();

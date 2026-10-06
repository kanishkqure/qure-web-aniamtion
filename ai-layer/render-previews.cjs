// Renders review PNGs of every SVG in ../output on its intended background.
// Usage: node ai-layer/render-previews.cjs [--scale=0.25 --out=dir]
// Needs playwright (npm i -D playwright, or a global install + NODE_PATH).
const { chromium } = require('playwright');
const { readFileSync, readdirSync, mkdirSync } = require('node:fs');
const { join } = require('node:path');

const here = __dirname;
const outputDir = join(here, '..', 'output');
const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').split('=')[1] || d;
const scale = parseFloat(arg('scale', '1'));
const pngDir = arg('out', outputDir);
mkdirSync(pngDir, { recursive: true });

const BG = { light: '#FFFFFF', dark: '#2A288C' };
const W = 1600 * scale, H = 1000 * scale;

(async () => {
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Math.round(W), height: Math.round(H) } });
for (const f of readdirSync(outputDir).filter((f) => f.endsWith('.svg'))) {
  const variant = f.includes('dark') ? 'dark' : 'light';
  const suffix = f.includes('-alt') ? '-alt' : '';
  const svg = readFileSync(join(outputDir, f), 'utf8');
  const src = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
  await page.setContent(
    `<html><body style="margin:0;background:${BG[variant]}"><img src="${src}" style="display:block;width:${W}px;height:${H}px"></body></html>`
  );
  await page.waitForLoadState('load');
  const name = scale === 1 ? `preview-${variant}${suffix}.png` : `preview-${variant}${suffix}@${scale}.png`;
  await page.screenshot({ path: join(pngDir, name) });
  console.log('wrote', join(pngDir, name));
}
await browser.close();
})();

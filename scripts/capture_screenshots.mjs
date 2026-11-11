import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const screensDir = path.join(rootDir, 'docs/screens');

if (!fs.existsSync(screensDir)) {
  fs.mkdirSync(screensDir, { recursive: true });
}

// 1. Read dynamic IDs from e2e_summary.json
const summaryPath = path.join(rootDir, 'docs/evidence/e2e_summary.json');
let roadmapId = '16';
let grantId = '3';
if (fs.existsSync(summaryPath)) {
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  if (summary.dynamicIds) {
    roadmapId = summary.dynamicIds.roadmapIdA || roadmapId;
    grantId = summary.dynamicIds.grantId || grantId;
  }
}

console.log(`Using dynamic IDs: roadmapId=${roadmapId}, grantId=${grantId}`);

const ROUTES = [
  { name: 'landing', path: '/#/' },
  { name: 'create_roadmap', path: '/#/roadmaps/new' },
  { name: 'roadmap_detail', path: `/#/roadmaps/${roadmapId}` },
  { name: 'create_grant', path: '/#/grants/new' },
  { name: 'grant_detail', path: `/#/grants/${grantId}` },
  { name: 'evidence', path: '/#/evidence' },
  { name: 'limits', path: '/#/limits' },
  { name: 'not_found', path: '/#/404' },
];

const VIEWPORTS = [
  { prefix: 'desktop', width: 1280, height: 800 },
  { prefix: 'mobile', width: 360, height: 640 },
];

const THEMES = ['light', 'dark'];

function createStaticServer(port = 4173) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
  };

  const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl.startsWith('/roadmap-receipts-app')) {
      reqUrl = reqUrl.slice('/roadmap-receipts-app'.length) || '/';
    }

    let filePath = path.join(distDir, reqUrl === '/' ? 'index.html' : reqUrl);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, 'index.html');
    }

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading ' + reqUrl);
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

async function main() {
  const server = await createStaticServer(4173);
  console.log('Static server started at http://localhost:4173/roadmap-receipts-app/');

  const browser = await chromium.launch({ headless: true });
  let count = 0;

  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      for (const route of ROUTES) {
        const url = `http://localhost:4173/roadmap-receipts-app${route.path}`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);

        for (const theme of THEMES) {
          if (theme === 'dark') {
            await page.evaluate(() => document.documentElement.classList.add('dark'));
          } else {
            await page.evaluate(() => document.documentElement.classList.remove('dark'));
          }
          await page.waitForTimeout(400);

          const fileName = `${vp.prefix}_${theme}_${route.name}.png`;
          const filePath = path.join(screensDir, fileName);
          await page.screenshot({ path: filePath, fullPage: false });
          console.log(`[${++count}/32] Saved: ${fileName} (${vp.width}x${vp.height}, ${theme})`);
        }
      }
      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
    console.log('Capture completed.');
  }
}

main().catch((err) => {
  console.error('Fatal screenshot capture error:', err);
  process.exit(1);
});

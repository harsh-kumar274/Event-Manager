const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function capture(url, outPath) {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForTimeout(500); // let animations settle
    await page.screenshot({ path: outPath, fullPage: true });
    console.log('Saved', outPath);
  } finally {
    await browser.close();
  }
}

async function main() {
  const targetDir = path.resolve(__dirname, '..', 'docs', 'screenshots');
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  const host = process.env.SCREENSHOT_HOST || 'http://localhost:5173';
  const pages = [
    { url: `${host}/`, file: 'home.png' },
    { url: `${host}/events`, file: 'event-list.png' },
    { url: `${host}/events/1`, file: 'event-details.png' },
  ];

  for (const p of pages) {
    const out = path.join(targetDir, p.file);
    await capture(p.url, out);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

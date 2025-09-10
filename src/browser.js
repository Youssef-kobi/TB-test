import { chromium } from 'playwright';
import sharp from 'sharp';

export async function launchBrowser(config) {
  const browser = await chromium.launch({
    headless: false,
    args: ['--use-gl=swiftshader', '--disable-dev-shm-usage', '--no-sandbox']
  });
  const context = await browser.newContext({
    viewport: { width: config.viewport.width, height: config.viewport.height },
    deviceScaleFactor: config.viewport.deviceScaleFactor
  });
  const page = await context.newPage();
  return { browser, context, page };
}

export async function ensureCanvasIsRendering(page) {
  const vp = page.viewportSize();
  const buf = await page.screenshot({
    clip: { x: vp.width / 2 - 150, y: vp.height / 2 - 150, width: 300, height: 300 }
  });
  const { data } = await sharp(buf).resize(1, 1).raw().toBuffer({ resolveWithObject: true });
  const avg = data[0];
  return avg !== 0 && avg !== 255;
}

export async function safeClick(page, target) {
  if (typeof target === 'string') {
    const el = await page.$(target);
    if (el) return el.click();
  } else if (target && typeof target === 'object') {
    return page.mouse.click(target.x, target.y);
  }
}

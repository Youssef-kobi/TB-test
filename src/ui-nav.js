import config from './config.js';
import { safeClick } from './browser.js';
import { hashFrame } from './capture.js';

export async function login(page, email, password) {
  await page.goto(config.baseUrl);
  await page.waitForLoadState('networkidle');
}

export async function dismissPopups(page) {
  const selectors = ['.close', '.popup-close', '.modal__close', '[data-role=close]'];
  for (let i = 0; i < 5; i++) {
    let acted = false;
    for (const sel of selectors) {
      const el = await page.$(sel);
      if (el) { await el.click(); acted = true; }
    }
    if (!acted) break;
    await page.waitForTimeout(500);
  }
}

export async function gotoGifts(page) {
  await safeClick(page, 'text=Clan');
  await page.waitForTimeout(1000);
  await safeClick(page, 'text=Gifts');
  await page.waitForTimeout(2000);
}

export async function waitForStable(page) {
  while (true) {
    let prev;
    let stable = true;
    for (let i = 0; i < config.stableFrames; i++) {
      const h = await hashFrame(page);
      if (prev && prev !== h) { stable = false; break; }
      prev = h;
      await page.waitForTimeout(config.stableDelay);
    }
    if (stable) return;
  }
}

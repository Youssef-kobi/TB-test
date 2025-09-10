import config from './config.js';
import { launchBrowser } from './browser.js';
import { login, dismissPopups, gotoGifts, waitForStable } from './ui-nav.js';
import { loadROIs, captureRows } from './capture.js';
import { parseRow } from './ocr.js';
import { makeKey, CsvIndex } from './dedupe.js';
import { ensureCsv, appendRows } from './storage-csv.js';
import { setTimeout as delay } from 'timers/promises';

const once = process.argv.includes('--once');

async function main() {
  ensureCsv(config.csvPath);
  const index = new CsvIndex(config.csvPath);
  await index.init();

  const { browser, page } = await launchBrowser(config);
  try {
    await login(page, config.email, config.password);
    if (!config.baseUrl.includes('totalbattle')) {
      await delay(5000);
      return;
    }
    await dismissPopups(page);
    await gotoGifts(page);
    const rois = await loadROIs();

    while (true) {
      await waitForStable(page);
      const caps = await captureRows(page, rois);
      const rows = [];
      for (const cap of caps) {
        const data = await parseRow(cap);
        const key = makeKey(data);
        if (!index.has(key)) {
          index.add(key);
          rows.push(data);
        }
      }
      if (rows.length) appendRows(config.csvPath, rows);
      if (once) break;
      await delay(config.intervalMs);
    }
  } finally {
    await browser.close();
  }
}

main();

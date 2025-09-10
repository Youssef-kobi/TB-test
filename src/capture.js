import fs from 'fs/promises';
import { imageHash } from 'image-hash';

export async function loadROIs(path = './data/rois/default.json') {
  const txt = await fs.readFile(path, 'utf8');
  return JSON.parse(txt);
}

export async function hashFrame(page) {
  const buf = await page.screenshot({ type: 'png' });
  return await new Promise((resolve, reject) =>
    imageHash({ data: buf }, 16, true, (err, data) => (err ? reject(err) : resolve(data)))
  );
}

export async function captureRows(page, rois) {
  const rows = [];
  const vp = page.viewportSize();
  for (let i = 0; i < rois.row.count; i++) {
    const offset = i * (rois.row.height + rois.row.gap);
    const rowClip = { x: 0, y: rois.row.startY + offset, width: vp.width, height: rois.row.height };
    const rowBuffer = await page.screenshot({ clip: rowClip });
    const parts = {};
    for (const key of ['sender', 'type', 'level', 'expires']) {
      const r = rois[key];
      const clip = { x: r.x, y: r.y + offset, width: r.width, height: r.height };
      parts[key] = await page.screenshot({ clip });
    }
    rows.push({ buffers: parts, rowBuffer, bbox: rowClip });
  }
  return rows;
}

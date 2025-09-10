import fs from 'fs';
import path from 'path';
import { format, parse } from 'fast-csv';

const header = 'observed_at,sender_name_raw,sender_name,chest_type_raw,chest_type,chest_level_raw,chest_level,expires_in_hint,row_hash,frame_id,source_bbox,notes\n';

export function ensureCsv(csvPath) {
  if (!fs.existsSync(csvPath)) {
    fs.mkdirSync(path.dirname(csvPath), { recursive: true });
    fs.writeFileSync(csvPath, header);
  }
}

export function appendRows(csvPath, rows) {
  const stream = fs.createWriteStream(csvPath, { flags: 'a' });
  const csvStream = format({ headers: false });
  csvStream.pipe(stream);
  rows.forEach(r => csvStream.write(r));
  csvStream.end();
}

export function readAll(csvPath) {
  return new Promise(resolve => {
    const out = [];
    fs.createReadStream(csvPath)
      .pipe(parse({ headers: true }))
      .on('data', row => out.push(row))
      .on('end', () => resolve(out));
  });
}

export async function updateWhere(csvPath, predicate, updater) {
  const rows = await readAll(csvPath);
  let changed = false;
  rows.forEach(r => { if (predicate(r)) { updater(r); changed = true; } });
  if (!changed) return;
  fs.writeFileSync(csvPath, header);
  appendRows(csvPath, rows);
}

import fs from 'fs';
import { parse } from 'fast-csv';

export function makeKey(row) {
  const minute = row.observed_at.slice(0, 16);
  return `${minute}|${row.sender_name}|${row.chest_type}|${row.row_hash}`;
}

export class CsvIndex {
  constructor(path) {
    this.path = path;
    this.keys = new Set();
  }
  async init() {
    if (!fs.existsSync(this.path)) return;
    await new Promise(resolve => {
      fs.createReadStream(this.path)
        .pipe(parse({ headers: true }))
        .on('data', row => this.keys.add(makeKey(row)))
        .on('end', resolve);
    });
  }
  has(key) {
    return this.keys.has(key);
  }
  add(key) {
    this.keys.add(key);
  }
}

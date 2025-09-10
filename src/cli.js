import { spawn } from 'child_process';
import config from './config.js';
import { ensureCsv, readAll, updateWhere } from './storage-csv.js';

const cmd = process.argv[2];

if (cmd === 'scan-now') {
  spawn(process.execPath, ['src/index.js', '--once'], { stdio: 'inherit' });
} else if (cmd === 'list') {
  ensureCsv(config.csvPath);
  readAll(config.csvPath).then(rows => {
    const args = process.argv.slice(3);
    let since, sender;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--since') since = new Date(args[++i]);
      if (args[i] === '--sender') sender = args[++i];
    }
    rows
      .filter(r => (!since || new Date(r.observed_at) >= since) && (!sender || r.sender_name === sender))
      .forEach(r => console.log(Object.values(r).join('\t')));
  });
} else if (cmd === 'fix') {
  const args = process.argv.slice(3);
  let match, field, value;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--match') match = args[++i];
    if (args[i] === '--field') field = args[++i];
    if (args[i] === '--value') value = args[++i];
  }
  updateWhere(
    config.csvPath,
    r => Object.values(r).some(v => String(v).includes(match)),
    r => { r[field] = value; }
  ).then(() => {});
} else {
  console.log('usage: node src/cli.js <scan-now|list|fix>');
}

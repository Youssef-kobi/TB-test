# Total Battle Chest Tracker

Automates capturing clan gift chests via Playwright and OCR, storing results in CSV.

## Prerequisites
- Node 18+
- `xvfb-run` on Linux

## Install
```bash
npm i
```

## Setup
Copy `.env.sample` to `.env` and provide account credentials. Adjust `BASE_URL` if you need to test against an alternate site.

## Run
Continuous loop:
```bash
xvfb-run -a npm run dev
```
Single pass:
```bash
xvfb-run -a npm run scan
```

CLI examples:
```bash
node src/cli.js list --since "2025-09-01"
node src/cli.js fix --match "A1ice" --field sender_name --value "Alice"
```

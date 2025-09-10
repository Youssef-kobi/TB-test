import dotenv from 'dotenv';

dotenv.config();

const config = {
  email: process.env.TOTAL_BATTLE_EMAIL || '',
  password: process.env.TOTAL_BATTLE_PASSWORD || '',
  viewport: {
    width: Number(process.env.VIEWPORT_WIDTH) || 1600,
    height: Number(process.env.VIEWPORT_HEIGHT) || 900,
    deviceScaleFactor: Number(process.env.DEVICE_SCALE) || 2
  },
  intervalMs: Number(process.env.CAPTURE_INTERVAL_MS) || 120000,
  csvPath: process.env.CSV_PATH || './data/output/chests.csv',
  baseUrl: process.env.BASE_URL || 'https://google.com',
  stableFrames: 3,
  stableDelay: 300,
  navTimeout: 30000
};

export default config;

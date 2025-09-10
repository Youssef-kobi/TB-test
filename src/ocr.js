import sharp from 'sharp';
import Tesseract from 'tesseract.js';
import { imageHash } from 'image-hash';

export async function preprocess(buffer) {
  return sharp(buffer)
    .grayscale()
    .resize({ height: 40 })
    .threshold(150)
    .toBuffer();
}

export async function ocr(buffer) {
  const { data } = await Tesseract.recognize(buffer, 'eng', {
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#:+- '
  });
  return { text: data.text.trim(), confidence: data.confidence };
}

async function hash(buf) {
  return await new Promise((resolve, reject) =>
    imageHash({ data: buf }, 8, true, (err, data) => (err ? reject(err) : resolve(data)))
  );
}

export async function parseRow(row) {
  const sender = await ocr(await preprocess(row.buffers.sender));
  const type = await ocr(await preprocess(row.buffers.type));
  const level = await ocr(await preprocess(row.buffers.level));
  const expires = await ocr(await preprocess(row.buffers.expires));
  const observed_at = new Date().toISOString();
  const row_hash = await hash(row.rowBuffer);
  return {
    observed_at,
    sender_name_raw: sender.text,
    sender_name: sender.text.replace(/\s+/g, ' '),
    chest_type_raw: type.text,
    chest_type: type.text.toLowerCase(),
    chest_level_raw: level.text,
    chest_level: parseInt(level.text.replace(/[^0-9]/g, '')) || '',
    expires_in_hint: expires.text,
    row_hash,
    frame_id: Date.now().toString(),
    source_bbox: JSON.stringify(row.bbox),
    notes: ''
  };
}

// Cuts a portrait out of a light studio background: flood-fills the backdrop in from the top and side
// edges (so light areas enclosed by the subject, like a white collar, are kept), then feathers the edge.
// usage: node scripts/cutout.mjs in.jpg out.png
import sharp from 'sharp';
const [src, out] = process.argv.slice(2);
const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const px = (x, y) => (y * w + x) * 3;

// The backdrop shades gradually (a vignette), so the fill follows small steps between neighbours
// rather than matching one colour, and only ever spreads through light, near-grey pixels.
const lum = (i) => 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
const greyish = (i) => Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]) < 28;
const isBackdrop = (i) => lum(i) > 135 && greyish(i);
const step = (a, b) => Math.hypot(data[a] - data[b], data[a + 1] - data[b + 1], data[a + 2] - data[b + 2]);
const STEP = 16;

// seeds: top row, plus the left/right columns
const keep = new Uint8Array(w * h).fill(1);
const queue = [];
const visit = (x, y, from) => {
  const k = y * w + x, i = px(x, y);
  if (!keep[k] || !isBackdrop(i) || (from !== undefined && step(i, from) > STEP)) return;
  keep[k] = 0; queue.push(x, y);
};
for (let x = 0; x < w; x++) visit(x, 0);
for (let y = 0; y < h; y++) { visit(0, y); visit(w - 1, y); }
while (queue.length) {
  const y = queue.pop(), x = queue.pop(), i = px(x, y);
  if (x > 0) visit(x - 1, y, i);
  if (x < w - 1) visit(x + 1, y, i);
  if (y > 0) visit(x, y - 1, i);
  if (y < h - 1) visit(x, y + 1, i);
}

const mask = Buffer.from(keep.map((k) => k * 255));
// feather: a light blur softens the stair-stepped edge
const alpha = await sharp(mask, { raw: { width: w, height: h, channels: 1 } }).blur(0.8).extractChannel(0).raw().toBuffer();
const rgba = Buffer.alloc(w * h * 4);
for (let i = 0; i < w * h; i++) {
  rgba[i * 4] = data[i * 3]; rgba[i * 4 + 1] = data[i * 3 + 1]; rgba[i * 4 + 2] = data[i * 3 + 2];
  rgba[i * 4 + 3] = alpha[i];
}
await sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).png().toFile(out);
console.log('ok');

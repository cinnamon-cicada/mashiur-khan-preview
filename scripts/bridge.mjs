// Keys the red bridge out of the source illustration and recolors it orange-gold on transparency.
import sharp from 'sharp';
const [src, out] = process.argv.slice(2);
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
  const redness = r - Math.max(g, b);
  const a = Math.max(0, Math.min(255, (redness - 60) * 2.2));
  const shade = Math.min(1, r / 230); // darker reds become deeper gold
  data[i] = 232 * shade + 20; data[i + 1] = 160 * shade + 20; data[i + 2] = 60 * shade + 10;
  data[i + 3] = a;
}
await sharp(data, { raw: info }).trim().png().toFile(out);
console.log('ok');

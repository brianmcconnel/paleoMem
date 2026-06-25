const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch {
  console.error('sharp is required — run: npm install --save-dev sharp');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const SVG_PATH = path.join(ROOT, 'app/icon.svg');
const OUT_DIR = path.join(ROOT, 'public/icons');

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const svg = fs.readFileSync(SVG_PATH);

  await sharp(svg).resize(192, 192).png().toFile(path.join(OUT_DIR, 'icon-192.png'));
  await sharp(svg).resize(512, 512).png().toFile(path.join(OUT_DIR, 'icon-512.png'));

  // Maskable: same artwork centered on a solid background with safe-zone padding
  const maskableSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <rect width="512" height="512" fill="#c5a46e"/>
      <text x="256" y="390" text-anchor="middle" font-size="400" font-weight="700" fill="#0b1118"
        font-family="'Noto Sans Hebrew', 'Segoe UI Historic', serif">מ</text>
    </svg>
  `;

  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(OUT_DIR, 'icon-maskable-512.png'));

  console.log('Generated PWA icons in public/icons/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
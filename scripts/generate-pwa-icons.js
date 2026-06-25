const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

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
const PALEO_ICON_SCRIPT = path.join(__dirname, 'generate-paleo-icon.py');

function ensurePaleoIconSvg() {
  if (fs.existsSync(SVG_PATH) && !process.argv.includes('--regenerate')) {
    return;
  }

  try {
    execFileSync('python3', [PALEO_ICON_SCRIPT], { stdio: 'inherit' });
  } catch (err) {
    if (!fs.existsSync(SVG_PATH)) {
      console.error(
        'app/icon.svg missing — install fonttools (pip install fonttools) and run: npm run icons:regenerate',
      );
      process.exit(1);
    }
    console.warn('Could not regenerate icon from font; using existing app/icon.svg');
  }
}

async function main() {
  ensurePaleoIconSvg();

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const svg = fs.readFileSync(SVG_PATH);
  const inner = svg
    .toString('utf8')
    .replace(/<\?xml[^>]*>\s*/i, '')
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '');

  await sharp(svg).resize(192, 192).png().toFile(path.join(OUT_DIR, 'icon-192.png'));
  await sharp(svg).resize(512, 512).png().toFile(path.join(OUT_DIR, 'icon-512.png'));

  const maskableSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <rect width="512" height="512" fill="#c5a46e"/>
      <svg x="80" y="80" width="352" height="352" viewBox="0 0 32 32">
        ${inner}
      </svg>
    </svg>
  `;

  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(OUT_DIR, 'icon-maskable-512.png'));

  fs.copyFileSync(SVG_PATH, path.join(ROOT, 'public/icon.svg'));

  console.log('Generated Paleo-Hebrew mem PWA icons from app/icon.svg');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
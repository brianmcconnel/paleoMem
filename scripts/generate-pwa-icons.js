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
const MASKABLE_SVG_PATH = path.join(ROOT, 'app/icon-maskable.svg');
const OUT_DIR = path.join(ROOT, 'public/icons');
const PALEO_ICON_SCRIPT = path.join(__dirname, 'generate-paleo-icon.py');

function ensurePaleoIconSvgs() {
  if (
    fs.existsSync(SVG_PATH) &&
    fs.existsSync(MASKABLE_SVG_PATH) &&
    !process.argv.includes('--regenerate')
  ) {
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

async function writePng(svgPath, size, outPath) {
  await sharp(svgPath).resize(size, size).png().toFile(outPath);
}

async function main() {
  ensurePaleoIconSvgs();

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const maskableSvg = fs.existsSync(MASKABLE_SVG_PATH)
    ? MASKABLE_SVG_PATH
    : SVG_PATH;

  await writePng(SVG_PATH, 180, path.join(OUT_DIR, 'apple-touch-icon.png'));
  await writePng(SVG_PATH, 192, path.join(OUT_DIR, 'icon-192.png'));
  await writePng(SVG_PATH, 512, path.join(OUT_DIR, 'icon-512.png'));
  await writePng(maskableSvg, 192, path.join(OUT_DIR, 'icon-maskable-192.png'));
  await writePng(maskableSvg, 512, path.join(OUT_DIR, 'icon-maskable-512.png'));

  fs.copyFileSync(SVG_PATH, path.join(ROOT, 'public/icon.svg'));
  fs.copyFileSync(path.join(OUT_DIR, 'apple-touch-icon.png'), path.join(ROOT, 'public/apple-touch-icon.png'));
  fs.copyFileSync(path.join(OUT_DIR, 'apple-touch-icon.png'), path.join(ROOT, 'app/apple-icon.png'));

  console.log('Generated Paleo-Hebrew mem PWA icons from Robo-PaleoHeb');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
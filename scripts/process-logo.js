const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceJpg = 'C:\\Users\\mictr\\.gemini\\antigravity-ide\\brain\\bfdd456f-6c54-4b2b-a5f3-f4c8a6609cd5\\nemicapital_bank_logo_official_1789906008092.jpg';
const destIcons = path.join(__dirname, '..', 'src', 'assets', 'icons');
const destPublic = path.join(__dirname, '..', 'public');

async function processLogo() {
  if (!fs.existsSync(destIcons)) {
    fs.mkdirSync(destIcons, { recursive: true });
  }

  // 1. Save high-res PNG (with pure white clipped to transparent)
  const img = sharp(sourceJpg);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  // Make near-white background transparent
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];

    rgba[i * 4] = r;
    rgba[i * 4 + 1] = g;
    rgba[i * 4 + 2] = b;

    // Detect white/light background
    const brightness = (r + g + b) / 3;
    const isNeutral = Math.abs(r - g) < 15 && Math.abs(g - b) < 15;

    if (brightness > 248 && isNeutral) {
      rgba[i * 4 + 3] = 0; // 100% transparent
    } else if (brightness > 235 && isNeutral) {
      // Soft antialiased edge
      const alpha = Math.round((1 - (brightness - 235) / 13) * 255);
      rgba[i * 4 + 3] = Math.max(0, Math.min(255, alpha));
    } else {
      rgba[i * 4 + 3] = 255;
    }
  }

  const pngTransparent = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toBuffer();

  // Save to icons
  fs.writeFileSync(path.join(destIcons, 'nemicapital-logo.png'), pngTransparent);
  // Also save a non-transparent white badge version
  await sharp(sourceJpg).png().toFile(path.join(destIcons, 'nemicapital-logo-white-bg.png'));

  // Also save favicon / app icons in public
  if (!fs.existsSync(destPublic)) {
    fs.mkdirSync(destPublic, { recursive: true });
  }
  await sharp(pngTransparent).resize(64, 64).toFile(path.join(destPublic, 'favicon.png'));
  await sharp(pngTransparent).resize(192, 192).toFile(path.join(destPublic, 'logo192.png'));

  console.log('Successfully processed and generated transparent PNG logo & favicons!');
}

processLogo().catch(console.error);

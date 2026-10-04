const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceLogo = path.join(__dirname, '..', 'src', 'assets', 'icons', 'nemicapital-logo.png');
const appDir = path.join(__dirname, '..', 'src', 'app');
const publicDir = path.join(__dirname, '..', 'public');

/**
 * Creates a valid multi-resolution Windows / Web ICO buffer from PNG buffers.
 * Supported by all modern browsers (Chrome, Firefox, Safari, Edge).
 */
function createIco(pngBuffers, sizes) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type = 1
  header.writeUInt16LE(count, 4); // count

  const dirEntries = [];
  for (let i = 0; i < count; i++) {
    const size = sizes[i];
    const buf = pngBuffers[i];
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height (0 = 256)
    entry.writeUInt8(0, 2); // color palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buf.length, 8); // size of image in bytes
    entry.writeUInt32LE(offset, 12); // offset of image data
    dirEntries.push(entry);
    offset += buf.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers]);
}

async function generateFavicons() {
  if (!fs.existsSync(sourceLogo)) {
    throw new Error('Source logo not found at: ' + sourceLogo);
  }

  console.log('Generating NemiCapital icons from:', sourceLogo);

  const sizes = [16, 32, 48, 64, 128, 256];
  const pngBuffers = [];

  for (const s of sizes) {
    const buf = await sharp(sourceLogo)
      .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    pngBuffers.push(buf);
  }

  const icoBuffer = createIco(pngBuffers, sizes);

  // 1. Overwrite src/app/favicon.ico
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  console.log('Updated src/app/favicon.ico');

  // 2. Overwrite public/favicon.ico
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Updated public/favicon.ico');

  // 3. Write App Router icon.png (32x32) and apple-icon.png (180x180)
  const icon32 = await sharp(sourceLogo).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(appDir, 'icon.png'), icon32);
  console.log('Created src/app/icon.png');

  const appleIcon = await sharp(sourceLogo).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), appleIcon);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);
  console.log('Created apple-icon.png in src/app and public');

  // 4. Write public/favicon.png and public/icon.png
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), await sharp(sourceLogo).resize(64, 64).png().toBuffer());
  fs.writeFileSync(path.join(publicDir, 'icon.png'), icon32);
  fs.writeFileSync(path.join(publicDir, 'logo192.png'), await sharp(sourceLogo).resize(192, 192).png().toBuffer());
  fs.writeFileSync(path.join(publicDir, 'logo512.png'), await sharp(sourceLogo).resize(512, 512).png().toBuffer());
  console.log('Updated public favicons and web app logos');

  // 5. Replace public/next.svg and public/vercel.svg with NemiCapital branding or remove
  // Replace vercel.svg with NemiCapital icon SVG
  const nemiSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <circle cx="50" cy="50" r="48" fill="#151214" stroke="#B81446" stroke-width="4"/>
  <text x="50" y="62" font-family="'Poppins', 'Arial', sans-serif" font-size="38" font-weight="900" fill="#B81446" text-anchor="middle">N</text>
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'vercel.svg'), nemiSvg);
  fs.writeFileSync(path.join(publicDir, 'next.svg'), nemiSvg);
  console.log('Replaced public/next.svg and public/vercel.svg with NemiCapital SVG');

  console.log('ALL NEXTJS ICONS COMPLETELY REPLACED WITH NEMICAPITAL ICONS!');
}

generateFavicons().catch(err => {
  console.error(err);
  process.exit(1);
});

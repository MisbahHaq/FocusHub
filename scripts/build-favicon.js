const sharp = require('sharp');
const { imagesToIco } = require('png-to-ico');
const fs = require('fs');

async function main() {
  const sizes = [256, 128, 48, 32, 16];
  const buffers = [];
  for (const size of sizes) {
    const buf = await sharp('frontend/fav.png').resize(size, size).png().toBuffer();
    buffers.push(buf);
  }
  const ico = await imagesToIco(buffers);
  fs.writeFileSync('src-tauri/icons/favicon.ico', ico);
  console.log('Created favicon.ico, size:', ico.length, 'bytes');
}

main().catch(e => console.error(e));

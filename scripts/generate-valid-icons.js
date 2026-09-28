const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 'ascii');
  data.copy(buf, 8);
  
  const crcBuf = buf.slice(4, 8 + len);
  const calcCrc = crc32(crcBuf);
  buf.writeUInt32BE(calcCrc, 8 + len);
  return buf;
}

function generatePng(width, height) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);  // 8-bit
  ihdrData.writeUInt8(6, 9);  // RGBA
  ihdrData.writeUInt8(0, 10); // compression 0
  ihdrData.writeUInt8(0, 11); // filter 0
  ihdrData.writeUInt8(0, 12); // interlace 0
  const ihdr = makeChunk('IHDR', ihdrData);

  const rowSize = 1 + width * 4;
  const rawPixels = Buffer.alloc(height * rowSize);
  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawPixels[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const offset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Icon Design: Dark background (#14231C) with a crisp Sprout green icon (#2F9E5C)
      const isCenterSprout = (Math.abs(dx) < width * 0.04 && dy > -height * 0.25 && dy < height * 0.25) ||
                             (dx < 0 && Math.abs(dy - (dx * 0.6)) < height * 0.08 && Math.abs(dx) < width * 0.25) ||
                             (dx > 0 && Math.abs(dy + (dx * 0.6)) < height * 0.08 && Math.abs(dx) < width * 0.25);

      if (isCenterSprout) {
        rawPixels[offset] = 245;     // R #F5F4F0
        rawPixels[offset + 1] = 244; // G
        rawPixels[offset + 2] = 240; // B
        rawPixels[offset + 3] = 255; // A
      } else {
        rawPixels[offset] = 20;      // R #14231C
        rawPixels[offset + 1] = 35;  // G
        rawPixels[offset + 2] = 28;  // B
        rawPixels[offset + 3] = 255; // A
      }
    }
  }

  const compressedData = zlib.deflateSync(rawPixels);
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), generatePng(192, 192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), generatePng(512, 512));
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-192.png'), generatePng(192, 192));
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512.png'), generatePng(512, 512));
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), generatePng(180, 180));

console.log('Valid PNG icons created successfully with valid CRC32!');

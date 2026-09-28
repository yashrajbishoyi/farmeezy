const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPngBuffer(width, height, r, g, b) {
  // Simple uncompressed/deflated RGBA PNG generator
  const signature = Buffer.from([139, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8 bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  
  const ihdrChunk = createChunk('IHDR', ihdr);
  
  // IDAT chunk (pixel rows with 0 filter byte)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);
  
  // Draw solid background color with a centered leaf pattern in green/white
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width * 0.35;
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[y * rowSize] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      // Rounded rect check
      const dx = Math.max(0, Math.abs(x - centerX) - (width * 0.38));
      const dy = Math.max(0, Math.abs(y - centerY) - (height * 0.38));
      const isCorner = (dx * dx + dy * dy) > (width * 0.1) * (width * 0.1);
      
      // Sprout icon drawing (vertical stem + 2 curved leaves)
      const distStem = Math.abs(x - centerX);
      const isStem = distStem < width * 0.04 && y > height * 0.25 && y < height * 0.75;
      const isLeftLeaf = (x < centerX) && (Math.abs(y - (centerY - (centerX - x))) < width * 0.08) && (centerX - x < width * 0.25) && y < centerY;
      const isRightLeaf = (x > centerX) && (Math.abs(y - (centerY - (x - centerX))) < width * 0.08) && (x - centerX < width * 0.25) && y < centerY;
      
      if (isStem || isLeftLeaf || isRightLeaf) {
        rawData[pxOffset] = 245;     // Red
        rawData[pxOffset + 1] = 244; // Green
        rawData[pxOffset + 2] = 240; // Blue
        rawData[pxOffset + 3] = 255; // Alpha
      } else {
        rawData[pxOffset] = r;     // Dark Green #14231C
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
        rawData[pxOffset + 3] = 255;
      }
    }
  }
  
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4);
  data.copy(buf, 8);
  
  const crc = crc32(buf.slice(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      if ((crc ^ byte) & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
      byte = byte >>> 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Write PNG files (#14231C => RGB: 20, 35, 28)
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createPngBuffer(192, 192, 20, 35, 28));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createPngBuffer(512, 512, 20, 35, 28));
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-192.png'), createPngBuffer(192, 192, 20, 35, 28));
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512.png'), createPngBuffer(512, 512, 20, 35, 28));
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), createPngBuffer(180, 180, 20, 35, 28));

console.log('PNG PWA Icons generated successfully!');

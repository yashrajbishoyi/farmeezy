const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG string representing Farmeezy Sprout Logo
function createSproutSvg(size, maskable = false) {
  const bg = maskable ? '#14231C' : '#14231C';
  const radius = maskable ? 0 : size * 0.2;
  const padding = size * 0.22;
  const iconSize = size - padding * 2;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${radius}" fill="${bg}" />
    <g transform="translate(${padding}, ${padding}) scale(${iconSize / 24})">
      <path d="M7 20h10" stroke="#F5F4F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M10 20c0-4.4 3.6-8 8-8" stroke="#F5F4F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M4 12c4.4 0 8 3.6 8 8" stroke="#F5F4F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M12 20V4" stroke="#F5F4F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M12 4L8 8" stroke="#F5F4F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M12 4l4 4" stroke="#F5F4F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </g>
  </svg>`;
}

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), createSproutSvg(512));
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), createSproutSvg(180));
console.log('SVG icons generated in public/icons');

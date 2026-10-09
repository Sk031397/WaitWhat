// Generates a 512x512 PNG app icon with zero dependencies (raw pixels + zlib).
// A dark rounded-square backdrop with a cyan "speech dot" motif for SideKick.
// Run: node scripts/make-icon.js
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const SIZE = 512;

// Colors (RGBA)
const BG = [10, 12, 18, 255]; // near-black
const PANEL = [16, 18, 27, 255]; // surface
const CYAN = [0, 194, 255, 255]; // SideKick accent
const GREEN = [156, 255, 87, 255]; // sports accent

function rounded(x, y, cx, cy, halfW, halfH, r) {
  const dx = Math.abs(x - cx);
  const dy = Math.abs(y - cy);
  if (dx > halfW || dy > halfH) return false;
  if (dx <= halfW - r || dy <= halfH - r) return true;
  const ddx = dx - (halfW - r);
  const ddy = dy - (halfH - r);
  return ddx * ddx + ddy * ddy <= r * r;
}

function inCircle(x, y, cx, cy, rad) {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= rad * rad;
}

const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1));
let p = 0;
for (let y = 0; y < SIZE; y++) {
  raw[p++] = 0; // PNG filter byte per row
  for (let x = 0; x < SIZE; x++) {
    let c = BG;
    // Rounded panel
    if (rounded(x, y, 256, 256, 210, 210, 60)) c = PANEL;
    // Three "chat" dots rising diagonally: cyan, cyan, green
    if (inCircle(x, y, 190, 320, 46)) c = CYAN;
    if (inCircle(x, y, 300, 300, 46)) c = CYAN;
    if (inCircle(x, y, 330, 196, 46)) c = GREEN;
    raw[p++] = c[0];
    raw[p++] = c[1];
    raw[p++] = c[2];
    raw[p++] = c[3];
  }
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0, 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

// CRC32
const crcTable = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}

const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // color type RGBA
const idat = zlib.deflateSync(raw);
const png = Buffer.concat([
  sig,
  chunk('IHDR', ihdr),
  chunk('IDAT', idat),
  chunk('IEND', Buffer.alloc(0)),
]);

const out = path.join(__dirname, '..', 'assets', 'image', 'app_icon.png');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, png);
console.log('Wrote', out, png.length, 'bytes');

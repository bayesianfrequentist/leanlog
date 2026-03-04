// Generates simple PNG icons using pure Node.js (no canvas dependency).
// Creates a minimal valid PNG with a dark background and "LL" text (encoded as colored blocks).

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Minimal PNG generator — creates a solid-color PNG
function makeSolidPNG(width, height, r, g, b) {
  function crc32(buf) {
    let crc = 0xffffffff;
    const table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const typeBytes = Buffer.from(type, 'ascii');
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const crcData = Buffer.concat([typeBytes, data]);
    const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(crcData));
    return Buffer.concat([len, typeBytes, data, crcBuf]);
  }

  function adler32(buf) {
    let a = 1, b = 0;
    for (let i = 0; i < buf.length; i++) { a = (a + buf[i]) % 65521; b = (b + a) % 65521; }
    return (b << 16) | a;
  }

  function deflateRaw(data) {
    // Uncompressed deflate blocks
    const BSIZE = 65535;
    const blocks = [];
    for (let i = 0; i < data.length; i += BSIZE) {
      const block = data.slice(i, i + BSIZE);
      const last = i + BSIZE >= data.length ? 1 : 0;
      const header = Buffer.alloc(5);
      header[0] = last;
      header.writeUInt16LE(block.length, 1);
      header.writeUInt16LE(~block.length & 0xffff, 3);
      blocks.push(header, block);
    }
    const combined = Buffer.concat(blocks);
    const wrapper = Buffer.alloc(6 + combined.length);
    wrapper[0] = 0x78; wrapper[1] = 0x01;
    combined.copy(wrapper, 2);
    const adler = adler32(data);
    wrapper.writeUInt32BE(adler, 2 + combined.length);
    return wrapper;
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Draw: dark background with a centered lighter rectangle for "LL" visual
  const rawRows = [];
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);
  const bw = Math.floor(width * 0.55);
  const bh = Math.floor(height * 0.35);

  for (let y = 0; y < height; y++) {
    const row = [0]; // filter byte
    for (let x = 0; x < width; x++) {
      const inBox = Math.abs(x - cx) < bw / 2 && Math.abs(y - cy) < bh / 2;
      row.push(inBox ? r : 0x1a, inBox ? g : 0x1a, inBox ? b : 0x2e);
    }
    rawRows.push(Buffer.from(row));
  }

  const raw = Buffer.concat(rawRows);
  const idat = deflateRaw(raw);

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const configs = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const { name, size } of configs) {
  // Accent green: #4ecca3 → 78, 204, 163
  const png = makeSolidPNG(size, size, 78, 204, 163);
  writeFileSync(join(publicDir, name), png);
  console.log(`Generated ${name} (${size}x${size})`);
}

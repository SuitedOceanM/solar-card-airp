/* 联邦旗 → 左栏收起态的徽记
   发现：Federation.png 是 256×256 的 **灰度+alpha**（colorType 4），
        内容是"透明的白色徽记"（61.85% 完全透明，26.86% 不透明白）。
   做法：① 按 alpha 裁到徽记包围盒；② 缩到 64×64（盒式滤波）；
        ③ 输出灰度+alpha 的 PNG（灰置 255、保留 alpha）→ 当 CSS mask 用；
        ④ 颜色交给 CSS（浅色左栏 = 近黑 = 视觉上的"反色"）。
   好处：不写死颜色，深色场景直接换 CSS 颜色即可，不用重做图。
*/
import fs from 'node:fs';
import zlib from 'node:zlib';

function decodePng(file) {
  const buf = fs.readFileSync(file);
  let pos = 8, width = 0, height = 0, colorType = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); colorType = data[9]; }
    else if (type === 'IDAT') idat.push(Buffer.from(data));
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (colorType !== 4) throw new Error('期望灰度+alpha（colorType 4），实际 ' + colorType);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const ch = 2, stride = width * ch;
  const out = Buffer.alloc(height * stride);
  let rp = 0;
  for (let y = 0; y < height; y++) {
    const f = raw[rp++];
    const line = raw.subarray(rp, rp + stride); rp += stride;
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? cur[x - ch] : 0, b = prev[x], c = x >= ch ? prev[x - ch] : 0, v = line[x];
      let val;
      switch (f) {
        case 0: val = v; break;
        case 1: val = v + a; break;
        case 2: val = v + b; break;
        case 3: val = v + ((a + b) >> 1); break;
        default: { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          val = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); }
      }
      cur[x] = val & 255;
    }
  }
  return { width, height, data: out };
}

// ---- PNG 编码（灰度+alpha） ----
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; }
  return t;
})();
const crc32 = (buf) => { let c = -1; for (const b of buf) c = CRC_TABLE[(c ^ b) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodeGrayAlpha(width, height, gray, alpha) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 4; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc(height * (1 + width * 2));
  for (let y = 0; y < height; y++) {
    const off = y * (1 + width * 2);
    raw[off] = 0;
    for (let x = 0; x < width; x++) { raw[off + 1 + x * 2] = gray[y * width + x]; raw[off + 2 + x * 2] = alpha[y * width + x]; }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const img = decodePng(process.argv[2] ?? 'C:/Users/lcy/Pictures/Federation.png');
const { width, height, data } = img;
const grayAt = (x, y) => data[(y * width + x) * 2];
const alphaAt = (x, y) => data[(y * width + x) * 2 + 1];

// ① 按 alpha 裁包围盒
let x0 = width, y0 = height, x1 = -1, y1 = -1;
for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
  if (alphaAt(x, y) > 8) {
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
}
const cw = x1 - x0 + 1, chh = y1 - y0 + 1;
console.log(`原图 ${width}×${height}｜徽记包围盒 x ${x0}–${x1} y ${y0}–${y1} → ${cw}×${chh}`);

// ② 盒式缩放到 64×64（只取 alpha，灰置满）
const N = 64;
const alpha = Buffer.alloc(N * N);
for (let ty = 0; ty < N; ty++) for (let tx = 0; tx < N; tx++) {
  const sx0 = x0 + Math.floor(tx * cw / N), sx1 = Math.max(sx0 + 1, x0 + Math.floor((tx + 1) * cw / N));
  const sy0 = y0 + Math.floor(ty * chh / N), sy1 = Math.max(sy0 + 1, y0 + Math.floor((ty + 1) * chh / N));
  let sum = 0, n = 0;
  for (let y = sy0; y < sy1; y++) for (let x = sx0; x < sx1; x++) { sum += alphaAt(x, y); n++; }
  alpha[ty * N + tx] = Math.round(sum / Math.max(1, n));
}
const gray = Buffer.alloc(N * N, 255);
const png = encodeGrayAlpha(N, N, gray, alpha);
const b64 = png.toString('base64');
const OUT = 'C:/Users/lcy/Documents/Codex/2026-09-29/b-k/outputs/solar-card/design';
const PROJ = 'C:/Users/lcy/Documents/Codex/2026-09-29/b-k/work/solar-card/project/src/solaria/界面/状态栏';
fs.writeFileSync(`${OUT}/federation-mark.png`, png);
fs.writeFileSync('C:/Users/lcy/Documents/Codex/2026-09-29/b-k/work/solar-card/brand-mark.txt', `data:image/png;base64,${b64}`);
// 另存一份"黑色剪影"预览（= 左栏收起态实际看到的样子，方便肉眼核对形状）
fs.writeFileSync(
  `${OUT}/federation-mark-preview.png`,
  encodeGrayAlpha(N, N, Buffer.alloc(N * N, 0), alpha),
);

// 直接生成 TS 模块（4.5 KB base64，手抄必错，所以由脚本写）
fs.writeFileSync(`${PROJ}/brand.ts`, `/**
 * 星宿联邦徽记（左栏收起态的品牌位）—— 本文件由 work/solar-card/make-brand-mark.mjs 生成，勿手改。
 *
 * 源：用户提供的 Federation.png（256×256，**灰度 + alpha**，内容是"透明的白色徽记"，不是白底白图）。
 * 处理：按 alpha 裁到徽记包围盒（250×244）→ 盒式缩放到 64×64 → 灰度置满、保留 alpha。
 * 用法：当 **CSS mask** 用，颜色交给 CSS ——
 *   · 浅色左栏里 background 取 --so-ink（近黑）→ 就是用户要的"反色"效果；
 *   · 将来换成深色场景，只要改 CSS 颜色，不用重做图。
 */
export const BRAND_MARK = 'data:image/png;base64,${b64}';

export const BRAND_NOTE = '星宿联邦·星穗徽（反色后用于收起态）';
`);
console.log(`\n输出 ${N}×${N} 灰度+alpha PNG：${png.length} B ｜ base64 ${b64.length} B`);
console.log('已写 design/federation-mark.png（遮罩源）、design/federation-mark-preview.png（黑剪影视图）');
console.log('已写 src/solaria/界面/状态栏/brand.ts（供左栏直接 import）');

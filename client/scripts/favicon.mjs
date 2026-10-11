/**
 * Generates the ClassMate favicon set from one piece of geometry.
 *
 *   node scripts/favicon.mjs
 *
 * The mark: a C drawn as a thick ring with a wedge cut out of its right side
 * and flat, square-cut terminals. Constructed from arcs on an exact grid
 * rather than typed as a letter, so it stays a solid, readable shape at 16px
 * instead of collapsing into mush the way a shrunken glyph does.
 */
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const PUBLIC = path.resolve(import.meta.dirname, "..", "public");

const INK = "#0e0f10"; // --color-canvas
const FACE = "#f2fff0"; // --color-ink

/**
 * @param {number} size      viewBox size
 * @param {boolean} rounded  draw the tile background (false = bare glyph)
 */
const svg = (size, { tile = true, radius = 0.22 } = {}) => {
  const S = 100;
  const cx = S / 2;
  const cy = S / 2;
  const r = 29; // ring centreline radius
  const w = 15; // stroke width

  // Wedge opening on the right, symmetric about the x-axis.
  const open = 52; // degrees of opening
  const a0 = (open / 2) * (Math.PI / 180);
  const a1 = -a0;

  const pt = (a) => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
  const [x0, y0] = pt(a0);
  const [x1, y1] = pt(a1);

  // Sweep the long way round (counter-clockwise through the left side).
  const arc = `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 1 0 ${x1.toFixed(2)} ${y1.toFixed(2)}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${S} ${S}">
  ${tile ? `<rect width="${S}" height="${S}" rx="${(S * radius).toFixed(1)}" fill="${FACE}"/>` : ""}
  <path d="${arc}" fill="none" stroke="${tile ? INK : FACE}" stroke-width="${w}" stroke-linecap="butt"/>
</svg>`;
};

const targets = [
  { file: "favicon.svg", size: 512, tile: true, raster: false },
  { file: "favicon.png", size: 32, tile: true, raster: true },
  { file: "favicon-16.png", size: 16, tile: true, raster: true },
  { file: "favicon-32.png", size: 32, tile: true, raster: true },
  { file: "favicon-48.png", size: 48, tile: true, raster: true },
  { file: "apple-touch-icon.png", size: 180, tile: true, raster: true },
  { file: "icon-512.png", size: 512, tile: true, raster: true },
];

const browser = await chromium.launch();
const page = await browser.newPage();

for (const t of targets) {
  const markup = svg(t.size, { tile: t.tile });

  if (!t.raster) {
    await writeFile(path.join(PUBLIC, t.file), markup, "utf8");
    console.log(`  ${t.file}  (vector)`);
    continue;
  }

  await page.setViewportSize({ width: t.size, height: t.size });
  await page.setContent(
    `<body style="margin:0;background:transparent">${markup}</body>`
  );
  await page.screenshot({
    path: path.join(PUBLIC, t.file),
    omitBackground: true,
  });
  console.log(`  ${t.file}  ${t.size}x${t.size}`);
}

await browser.close();
console.log("\nfavicon set written to public/");

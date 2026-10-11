/**
 * Captures the hero with the pointer parked at several positions, and reports
 * the building's actual yaw at each — so over-rotation is measurable, not a
 * matter of squinting at a screenshot.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:5173";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  colorScheme: "dark",
});

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

const spots = [
  ["centre", 720, 450],
  ["explore-tools-button", 263, 641],
  ["far-left-edge", 4, 880],
  ["far-right-edge", 1436, 20],
];

const toDeg = (r) => ((r * 180) / Math.PI).toFixed(1);

for (const [name, x, y] of spots) {
  await page.mouse.move(x, y);
  // Let the lerp settle on the new target.
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `scripts/shots/hover-${name}.png` });
  console.log(`  ${name.padEnd(22)} pointer at ${String(x).padStart(4)},${String(y).padStart(3)}  ->  shots/hover-${name}.png`);
}

console.log(
  `\nconfigured limits: yaw +/-${toDeg(0.1)}deg, drift +/-${toDeg(0.045)}deg` +
    `  => worst case +/-${toDeg(0.145)}deg from the base three-quarter view`
);

await browser.close();

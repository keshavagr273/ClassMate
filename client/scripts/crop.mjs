/** Capture one viewport at a given scroll offset: node scripts/crop.mjs <route> <y> */
import { chromium } from "playwright";
const route = process.argv[2] || "/";
const y = Number(process.argv[3] || 0);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://localhost:5173" + route, { waitUntil: "networkidle" });
await p.waitForTimeout(2000);
await p.evaluate(async () => {
  const step = window.innerHeight * 0.8;
  for (let yy = 0; yy < document.body.scrollHeight; yy += step) {
    window.scrollTo({ top: yy, behavior: "instant" }); await new Promise((r) => setTimeout(r, 120));
  }
});
await p.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
await p.waitForTimeout(700);
await p.screenshot({ path: "scripts/shots/crop.png" });
await b.close();
console.log(`captured ${route} at y=${y} -> scripts/shots/crop.png`);

/** Measures the actual scroll-through on real hardware — the thing the user sees. */
import { chromium } from "playwright";
const BASE = process.env.BASE_URL || "http://localhost:5173";
const browser = await chromium.launch({ headless: false, args: ["--window-position=-2400,0"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });

await page.goto(BASE, { waitUntil: "domcontentloaded" });
const r = await page.evaluate(async () => {
  const tasks = []; const gaps = [];
  new PerformanceObserver((l) => { for (const e of l.getEntries()) tasks.push(Math.round(e.duration)); })
    .observe({ type: "longtask", buffered: true });

  let last = performance.now();
  let running = true;
  const tick = () => { const n = performance.now(); gaps.push(n - last); last = n; if (running) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);

  await new Promise((r) => setTimeout(r, 2500));
  const step = window.innerHeight * 0.5;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo({ top: y, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 260));
  }
  await new Promise((r) => setTimeout(r, 600));
  running = false;

  const dropped = gaps.filter((g) => g > 50).length;
  return { tasks, worst: Math.max(0, ...tasks), dropped, frames: gaps.length };
});

console.log(`long tasks        : ${r.tasks.length}`);
console.log(`worst long task   : ${r.worst}ms`);
console.log(`frames over 50ms  : ${r.dropped} of ${r.frames}`);
console.log(r.tasks.length ? `all tasks         : ${r.tasks.join(", ")}ms` : "");
await browser.close();

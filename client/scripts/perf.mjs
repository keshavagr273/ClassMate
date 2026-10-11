/**
 * Diagnoses load/scroll jank on the landing page.
 *
 * Reports cumulative layout shift (with the offending elements), long frames
 * during a scripted scroll, and any image that renders without reserved
 * space — the three things that read to a user as "it loads with a glitch".
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:5173";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  colorScheme: "dark",
});

await page.addInitScript(() => {
  window.__shifts = [];
  window.__longTasks = [];
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.hadRecentInput) continue;
      window.__shifts.push({
        value: entry.value,
        sources: (entry.sources || []).map((s) => {
          const n = s.node;
          if (!n) return "(detached)";
          const tag = n.tagName?.toLowerCase() || "?";
          const cls = (n.className || "").toString().slice(0, 60);
          return `${tag}.${cls}`;
        }),
      });
    }
  }).observe({ type: "layout-shift", buffered: true });

  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      window.__longTasks.push(Math.round(entry.duration));
    }
  }).observe({ type: "longtask", buffered: true });
});

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

// Scripted scroll through the page, the way a reader would.
await page.evaluate(async () => {
  const step = window.innerHeight * 0.6;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo({ top: y, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 220));
  }
});
await page.waitForTimeout(800);

const { shifts, longTasks } = await page.evaluate(() => ({
  shifts: window.__shifts,
  longTasks: window.__longTasks,
}));

const cls = shifts.reduce((a, s) => a + s.value, 0);
console.log(`Cumulative layout shift: ${cls.toFixed(4)}  (good < 0.1)`);
if (shifts.length) {
  console.log("  worst contributors:");
  for (const s of shifts.sort((a, b) => b.value - a.value).slice(0, 6)) {
    console.log(`    ${s.value.toFixed(4)}  ${s.sources.join(" | ") || "(unknown)"}`);
  }
}

console.log(
  `\nLong tasks (>50ms): ${longTasks.length}` +
    (longTasks.length ? `  [${longTasks.join(", ")}] ms` : "")
);

// Images rendering without reserved space are the classic cause of the jump.
const imgs = await page.evaluate(() =>
  [...document.querySelectorAll("img")].map((im) => ({
    src: im.currentSrc.split("/").pop().slice(0, 42),
    hasAttrs: im.hasAttribute("width") && im.hasAttribute("height"),
    lazy: im.loading === "lazy",
    ratioBox: !!im.closest("[class*='aspect-']"),
    natural: `${im.naturalWidth}x${im.naturalHeight}`,
  }))
);
console.log(`\nImages: ${imgs.length}`);
for (const i of imgs) {
  const risk = !i.hasAttrs && !i.ratioBox ? "  <-- NO RESERVED SPACE" : "";
  console.log(
    `  ${i.src.padEnd(44)} attrs:${i.hasAttrs ? "y" : "n"} ratioBox:${i.ratioBox ? "y" : "n"} lazy:${i.lazy ? "y" : "n"} ${i.natural}${risk}`
  );
}

// Compositing pressure: blend modes and backdrop filters on big fixed layers.
const heavy = await page.evaluate(() =>
  [...document.querySelectorAll("*")]
    .map((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        cls: (el.className || "").toString().slice(0, 40),
        blend: s.mixBlendMode,
        filter: s.backdropFilter,
        pos: s.position,
        area: Math.round(r.width * r.height),
      };
    })
    .filter(
      (x) =>
        (x.blend !== "normal" || (x.filter && x.filter !== "none")) &&
        x.area > 200000
    )
);
console.log(`\nLarge composited layers: ${heavy.length}`);
for (const h of heavy) {
  console.log(
    `  ${h.tag}.${h.cls}  blend:${h.blend} backdrop:${h.filter} pos:${h.pos} area:${h.area}`
  );
}

await browser.close();

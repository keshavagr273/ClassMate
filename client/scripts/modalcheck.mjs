/**
 * Opens a modal on every page that has one and confirms it actually renders.
 *
 *   MODAL_EMAIL=... MODAL_PASSWORD=... node scripts/modalcheck.mjs
 *
 * Worth keeping: the shared Modal primitive was shipped in a state where
 * Headless UI threw and no modal in the app could open, and nothing caught it
 * because every modal sits behind a login.
 */
import { chromium } from "playwright";

const EMAIL = process.env.MODAL_EMAIL || "modalcheck.20249997@iiitsonepat.ac.in";
const PASS = process.env.MODAL_PASSWORD || "ClassMateTest!2026";
const BASE = process.env.BASE_URL || "http://localhost:5173";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "dark",
});

const errors = [];
ctx.on("page", (pg) =>
  pg.on("pageerror", (e) => errors.push(e.message.split("\n")[0]))
);

const page = await ctx.newPage();
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.fill('input[name="email"]', EMAIL);
await page.fill('input[name="password"]', PASS);
await page.click('button[type="submit"]');
await page.waitForTimeout(3500);

const signedIn = (await ctx.cookies()).some((c) => c.name === "token");
console.log(`signed in: ${signedIn}\n`);

const cases = [
  ["/marketplace", "Sell something", "sell"],
  ["/lost-found", "Report an item", "report"],
  ["/rides", "Offer a ride", "offer"],
  ["/attendance", "Enroll in subjects", "enroll"],
];

let failures = 0;

for (const [route, trigger, expect] of cases) {
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);

  try {
    await page.locator(`button:has-text("${trigger}")`).first().click();
    await page.waitForTimeout(1000);

    /* The Dialog root has no bounding box — its children are `fixed` — so
       isVisible() on it is always false. Assert on the rendered panel. */
    const dialog = page.locator('[role="dialog"]');
    const mounted = (await dialog.count()) > 0;
    const heading = mounted
      ? (await dialog.innerText()).split("\n")[0].trim()
      : "";
    const ok = mounted && heading.toLowerCase().includes(expect);

    if (!ok) failures++;
    console.log(
      `  ${ok ? "PASS" : "FAIL"}  ${route} -> "${trigger}"` +
        (mounted ? `  [${heading}]` : "  (no dialog mounted)")
    );

    if (mounted) {
      await page.screenshot({
        path: `scripts/shots/modal${route.replace(/\//g, "-")}.png`,
      });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(600);
      const closed = (await dialog.count()) === 0;
      if (!closed) failures++;
      console.log(`        ${closed ? "PASS" : "FAIL"}  Escape closes it`);
    }
  } catch (err) {
    failures++;
    console.log(`  FAIL  ${route}  (${err.message.split("\n")[0]})`);
  }
}

console.log(
  errors.length
    ? `\nPAGE ERRORS:\n  ${[...new Set(errors)].join("\n  ")}`
    : "\nno page errors"
);

await browser.close();
if (failures) process.exit(1);

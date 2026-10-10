/**
 * Visual check harness.
 *
 *   node scripts/shoot.mjs                     # all routes, desktop
 *   node scripts/shoot.mjs / /login            # specific routes
 *   node scripts/shoot.mjs --mobile /          # 390px viewport
 *   node scripts/shoot.mjs --full /            # full-page capture
 *
 * Writes PNGs to scripts/shots/ and prints any console errors, page errors
 * and failed requests per route — so a silent render failure can't hide.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:5173";
const OUT = path.join(import.meta.dirname, "shots");

const argv = process.argv.slice(2);
const mobile = argv.includes("--mobile");
const fullPage = argv.includes("--full");
const routes = argv.filter((a) => !a.startsWith("--"));

const ALL = [
  "/",
  "/login",
  "/404",
  "/500",
  "/job-connect",
  "/attendance",
  "/marketplace",
  "/lost-found",
  "/rides",
  "/skill-exchange",
  "/profile",
  "/admin",
];

const targets = routes.length ? routes : ALL;
const viewport = mobile
  ? { width: 390, height: 844 }
  : { width: 1440, height: 900 };

// Files are overwritten per route rather than wiping the directory, so a
// run for one route does not delete captures from another.
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport,
  deviceScaleFactor: mobile ? 2 : 1,
  colorScheme: "dark",
});

let anyProblem = false;

for (const route of targets) {
  const page = await ctx.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failed = [];

  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("requestfailed", (r) => {
    const u = r.url();
    if (!u.startsWith("data:")) failed.push(`${r.failure()?.errorText} ${u}`);
  });

  const label = route === "/" ? "home" : route.replace(/\//g, "-").slice(1);
  const name = `${label}${mobile ? ".mobile" : ""}.png`;

  try {
    await page.goto(BASE + route, {
      waitUntil: "networkidle",
      timeout: 45000,
    });
    // Let the boot gate, fonts and any WebGL frame settle.
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(OUT, name), fullPage });
  } catch (err) {
    pageErrors.push(`NAVIGATION: ${err.message}`);
  }

  const problems = consoleErrors.length + pageErrors.length + failed.length;
  if (problems) anyProblem = true;

  console.log(`\n${route}  ->  shots/${name}`);
  for (const e of pageErrors) console.log(`   PAGE ERROR   ${e}`);
  for (const e of consoleErrors) console.log(`   CONSOLE      ${e.slice(0, 160)}`);
  for (const e of failed) console.log(`   REQ FAILED   ${e.slice(0, 160)}`);
  if (!problems) console.log("   clean");

  await page.close();
}

await browser.close();
console.log(
  `\n${anyProblem ? "PROBLEMS FOUND (see above)" : "All routes clean."}`
);

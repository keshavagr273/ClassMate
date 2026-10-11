/** Interaction checks: cursor feedback, hover states, command palette. */
import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));

await p.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await p.waitForTimeout(2000);

const check = (n, ok, d = "") => console.log(`  ${ok ? "PASS" : "FAIL"}  ${n}${d ? `  (${d})` : ""}`);

console.log("Cursor feedback");
const cursorOf = (sel) => p.locator(sel).first().evaluate((el) => getComputedStyle(el).cursor);
check("primary button is pointer", (await cursorOf("button:has-text('Explore tools')")) === "pointer");
check("nav search is pointer", (await cursorOf("button[aria-label='Search ClassMate']")) === "pointer");
check("tool pill link is pointer", (await cursorOf("a[href='/attendance']")) === "pointer");

console.log("\nHover feedback");
const btn = p.locator("button:has-text('Explore tools')").first();
const before = await btn.evaluate((el) => getComputedStyle(el).backgroundColor + "|" + getComputedStyle(el).transform);
await btn.hover();
await p.waitForTimeout(350);
const after = await btn.evaluate((el) => getComputedStyle(el).backgroundColor + "|" + getComputedStyle(el).transform);
check("button visibly changes on hover", before !== after, `${before} -> ${after}`);

console.log("\nCommand palette");
await p.keyboard.press("Control+k");
await p.waitForTimeout(500);
check("opens on Ctrl+K", await p.locator("input[aria-label='Search ClassMate']").isVisible());
await p.keyboard.type("ride");
await p.waitForTimeout(350);
const n = await p.locator("[data-index]").count();
check("filters as you type", n > 0 && n < 11, `${n} results for "ride"`);
await p.keyboard.press("Enter");
await p.waitForTimeout(1200);
check("Enter navigates", p.url().includes("/rides") || p.url().includes("/login"), p.url());

await p.goto("http://localhost:5173/", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
await p.keyboard.press("/");
await p.waitForTimeout(500);
check("opens on /", await p.locator("input[aria-label='Search ClassMate']").isVisible());
await p.keyboard.press("Escape");
await p.waitForTimeout(400);
check("closes on Escape", !(await p.locator("input[aria-label='Search ClassMate']").isVisible()));

console.log(`\n${errs.length ? "CONSOLE ERRORS:\n  " + errs.join("\n  ") : "no console errors"}`);
await b.close();

/**
 * Walks the real import graph from each app's entry points and reports every
 * source file that is never reached.
 *
 *   node scripts/deadcode.mjs
 *
 * Reports only. Nothing is deleted.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".vite",
]);

const CODE = /\.(jsx?|mjs|cjs|ts|tsx)$/;

/** Every file under a directory, recursively. */
async function walk(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      await walk(path.join(dir, e.name), out);
    } else {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

/** Pull every import/require/dynamic-import specifier out of a source file. */
const specifiersOf = (src) => {
  const out = [];
  const patterns = [
    /\bimport\s+[^'"]*?from\s*['"]([^'"]+)['"]/g,
    /\bimport\s*['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\bexport\s+[^'"]*?from\s*['"]([^'"]+)['"]/g,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(src))) out.push(m[1]);
  }
  return out;
};

/** Resolve a relative specifier to a real file, trying the usual suffixes. */
async function resolveLocal(fromFile, spec) {
  if (!spec.startsWith(".") && !spec.startsWith("/")) return null;
  const base = spec.startsWith("/")
    ? path.join(ROOT, spec)
    : path.resolve(path.dirname(fromFile), spec);

  const candidates = [
    base,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.mjs`,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, "index.js"),
    path.join(base, "index.jsx"),
    path.join(base, "index.mjs"),
    path.join(base, "index.ts"),
  ];
  for (const c of candidates) {
    try {
      const s = await stat(c);
      if (s.isFile()) return c;
    } catch {
      /* keep trying */
    }
  }
  return null;
}

/** Breadth-first reachability from a set of entry files. */
async function reachable(entries) {
  const seen = new Set();
  const missing = [];
  const queue = [...entries];

  while (queue.length) {
    const file = queue.shift();
    if (!file || seen.has(file)) continue;
    seen.add(file);
    if (!CODE.test(file)) continue;

    let src;
    try {
      src = await readFile(file, "utf8");
    } catch {
      continue;
    }

    for (const spec of specifiersOf(src)) {
      if (!spec.startsWith(".") && !spec.startsWith("/")) continue;
      const target = await resolveLocal(file, spec);
      if (target) queue.push(target);
      else missing.push({ from: file, spec });
    }
  }
  return { seen, missing };
}

const rel = (p) => path.relative(ROOT, p).replace(/\\/g, "/");

async function analyse(label, srcDir, entryFiles) {
  const all = (await walk(srcDir)).filter((f) => CODE.test(f));
  const { seen, missing } = await reachable(entryFiles);
  const dead = all.filter((f) => !seen.has(f)).sort();

  console.log(`\n${"=".repeat(68)}\n${label}\n${"=".repeat(68)}`);
  console.log(`${all.length} source files, ${all.length - dead.length} reachable, ${dead.length} unreachable\n`);

  if (dead.length) {
    for (const f of dead) {
      const lines = (await readFile(f, "utf8")).split("\n").length;
      console.log(`  UNREACHABLE  ${rel(f).padEnd(58)} ${String(lines).padStart(4)} lines`);
    }
  } else {
    console.log("  (none)");
  }

  if (missing.length) {
    console.log("\n  Imports that do not resolve:");
    for (const m of missing) {
      console.log(`    ${rel(m.from)}  ->  ${m.spec}`);
    }
  }
  return dead;
}

/* ------------------------------------------------------------------ run -- */

await analyse("CLIENT (entry: src/main.jsx)", path.join(ROOT, "client/src"), [
  path.join(ROOT, "client/src/main.jsx"),
]);

await analyse("SERVER (entry: server.js)", path.join(ROOT, "server/src"), [
  path.join(ROOT, "server/server.js"),
]);

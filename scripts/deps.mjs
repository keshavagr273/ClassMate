/**
 * Reports declared dependencies that no source file imports.
 *
 *   node scripts/deps.mjs
 *
 * Reports only. Nothing is uninstalled.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const IGNORE = new Set(["node_modules", ".git", "dist", "build", ".vite"]);
const CODE = /\.(jsx?|mjs|cjs|ts|tsx)$/;

async function walk(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!IGNORE.has(e.name)) await walk(full, out);
    } else if (CODE.test(e.name) || e.name.endsWith(".html") || e.name.endsWith(".css")) {
      out.push(full);
    }
  }
  return out;
}

/** The bare package a specifier refers to, e.g. "@scope/pkg/sub" -> "@scope/pkg". */
const packageOf = (spec) => {
  if (spec.startsWith(".") || spec.startsWith("/")) return null;
  const parts = spec.split("/");
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
};

async function audit(label, pkgDir, scanDirs, extraFiles = []) {
  const pkg = JSON.parse(
    await readFile(path.join(pkgDir, "package.json"), "utf8")
  );

  const files = [];
  for (const d of scanDirs) files.push(...(await walk(path.join(pkgDir, d))));
  for (const f of extraFiles) files.push(path.join(pkgDir, f));

  const used = new Set();
  for (const f of files) {
    let src;
    try {
      src = await readFile(f, "utf8");
    } catch {
      continue;
    }
    const patterns = [
      /\bfrom\s*['"]([^'"]+)['"]/g,
      /\bimport\s*['"]([^'"]+)['"]/g,
      /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      /@plugin\s+['"]([^'"]+)['"]/g,
    ];
    for (const re of patterns) {
      let m;
      while ((m = re.exec(src))) {
        const p = packageOf(m[1]);
        if (p) used.add(p);
      }
    }
  }

  const report = (title, deps) => {
    const unused = Object.keys(deps || {})
      .filter((d) => !used.has(d))
      .sort();
    console.log(`\n  ${title}: ${unused.length} unreferenced of ${Object.keys(deps || {}).length}`);
    for (const u of unused) console.log(`    ${u.padEnd(34)} ${deps[u]}`);
    return unused;
  };

  console.log(`\n${"=".repeat(68)}\n${label}\n${"=".repeat(68)}`);
  console.log(`  scanned ${files.length} files`);
  report("dependencies", pkg.dependencies);
  report("devDependencies", pkg.devDependencies);
}

await audit("CLIENT", path.join(ROOT, "client"), ["src", "scripts"], [
  "index.html",
  "vite.config.js",
  "eslint.config.js",
]);

await audit("SERVER", path.join(ROOT, "server"), ["src", "scripts"], [
  "server.js",
]);

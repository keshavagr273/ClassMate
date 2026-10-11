/**
 * Sets graduation_year to a single value for every account.
 *
 *   node scripts/set-gradyear.mjs            # dry run, shows what would change
 *   node scripts/set-gradyear.mjs --apply    # writes
 *
 * Before writing it snapshots the current values to
 * scripts/gradyear-backup-<timestamp>.json, so the change can be undone.
 */
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { writeFile } from "node:fs/promises";
import path from "node:path";
import sequelize from "../src/db/db.js";
import User from "../src/models/user.model.js";

const TARGET = Number(process.env.GRAD_YEAR || 2027);
const apply = process.argv.includes("--apply");

const rows = await User.findAll({
  attributes: ["id", "email", "registration_number", "graduation_year"],
  order: [["id", "ASC"]],
  raw: true,
});

const changing = rows.filter((r) => r.graduation_year !== TARGET);

console.log(
  `${rows.length} accounts, ${changing.length} not already ${TARGET}\n`
);
console.log("  id   roll         current -> new");
console.log("  ---- ------------ ----------------");
for (const r of rows) {
  const mark = r.graduation_year === TARGET ? " (unchanged)" : "";
  console.log(
    `  ${String(r.id).padEnd(4)} ${String(r.registration_number ?? "").padEnd(12)} ` +
      `${String(r.graduation_year).padEnd(7)} -> ${TARGET}${mark}`
  );
}

if (!apply) {
  console.log("\nDry run. Re-run with --apply to write.");
  await sequelize.close();
  process.exit(0);
}

if (!changing.length) {
  console.log("\nNothing to do.");
  await sequelize.close();
  process.exit(0);
}

const backup = path.join(
  import.meta.dirname,
  `gradyear-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
);
await writeFile(
  backup,
  JSON.stringify(
    rows.map(({ id, email, graduation_year }) => ({ id, email, graduation_year })),
    null,
    2
  ),
  "utf8"
);
console.log(`\nPrevious values saved to ${path.basename(backup)}`);

const t = await sequelize.transaction();
try {
  const [count] = await User.update(
    { graduation_year: TARGET },
    { where: {}, transaction: t }
  );
  await t.commit();
  console.log(`Updated ${count} accounts to ${TARGET}.`);
} catch (err) {
  await t.rollback();
  console.error("Rolled back:", err.message);
  process.exitCode = 1;
}

await sequelize.close();

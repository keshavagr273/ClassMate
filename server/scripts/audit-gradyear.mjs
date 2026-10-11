/** READ-ONLY. Reports accounts whose stored graduation_year looks implausible. */
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import sequelize from "../src/db/db.js";
import User from "../src/models/user.model.js";

const thisYear = new Date().getFullYear();
// Use the model rather than raw SQL so the real table name is used.
const rows = (
  await User.findAll({
    attributes: ["id", "email", "registration_number", "graduation_year"],
    order: [["id", "ASC"]],
    raw: true,
  })
).map((r) => r);

const plausible = (y) => y != null && y >= 2004 && y <= thisYear + 8;
const bad = rows.filter((r) => !plausible(r.graduation_year));

console.log(`${rows.length} accounts total, ${bad.length} with an implausible graduation_year\n`);
if (bad.length) {
  console.log("  id   roll        stored   would recompute to");
  console.log("  ---- ----------- -------- ------------------");
  for (const r of bad) {
    const roll = String(r.registration_number ?? "");
    const lead = parseInt(roll.slice(0, 4), 10);
    const trail = parseInt(roll.slice(4), 10);
    const ok = (y) => y >= 2000 && y <= thisYear + 1;
    const admission = ok(lead) ? lead : ok(trail) ? trail : null;
    console.log(
      `  ${String(r.id).padEnd(4)} ${roll.padEnd(11)} ${String(r.graduation_year).padEnd(8)} ${admission ? admission + 4 : "null (underivable)"}`
    );
  }
  console.log("\nNo rows were modified.");
}
await sequelize.close();

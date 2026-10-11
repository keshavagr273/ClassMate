/**
 * End-to-end API smoke suite.
 *
 *   node scripts/smoke.mjs
 *
 * Signs in as two throwaway accounts and exercises every flow the UI depends
 * on, plus the access-control boundaries between the two users. Prints a
 * pass/fail line per assertion and exits non-zero if anything regressed.
 *
 * Credentials come from SMOKE_EMAIL / SMOKE_EMAIL_2 (with SMOKE_PASSWORD), so
 * nothing is hardcoded. Both accounts must exist first — sign them up via
 * POST /api/users/signup, then remove them afterwards with
 * CLEANUP_EMAILS=... node scripts/cleanup-test-users.mjs
 */
const BASE = process.env.API_BASE || "http://localhost:5000/api";
const PASSWORD = process.env.SMOKE_PASSWORD || "ClassMateTest!2026";
const EMAIL_A = process.env.SMOKE_EMAIL || "test.20249999@iiitsonepat.ac.in";
const EMAIL_B = process.env.SMOKE_EMAIL_2 || "test2.20249998@iiitsonepat.ac.in";

let pass = 0;
let fail = 0;
const failures = [];

const check = (name, ok, detail = "") => {
  if (ok) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`  FAIL  ${name}${detail ? `  (${detail})` : ""}`);
  }
};

const section = (title) => console.log(`\n${title}`);

/** Minimal cookie jar: these endpoints set exactly one httpOnly token cookie. */
const makeClient = () => {
  let cookie = "";
  return {
    get cookie() {
      return cookie;
    },
    async req(method, path, body) {
      const res = await fetch(BASE + path, {
        method,
        headers: {
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const setCookie = res.headers.getSetCookie?.() || [];
      for (const c of setCookie) {
        if (c.startsWith("token=")) cookie = c.split(";")[0];
      }
      let json = null;
      try {
        json = await res.json();
      } catch {
        /* some responses have no body */
      }
      return { status: res.status, json };
    },
  };
};

const a = makeClient();
const b = makeClient();

/* ------------------------------------------------------------------ auth -- */

section("Auth");
{
  const r = await a.req("POST", "/users/login", {
    email: EMAIL_A,
    password: PASSWORD,
  });
  check("user A signs in", r.status === 200, `got ${r.status}`);
}
{
  const r = await b.req("POST", "/users/login", {
    email: EMAIL_B,
    password: PASSWORD,
  });
  check("user B signs in", r.status === 200, `got ${r.status}`);
}
const me = await a.req("GET", "/users/current");
const ID_A = me.json?.data?.user?.id;
const meB = await b.req("GET", "/users/current");
const ID_B = meB.json?.data?.user?.id;
check("A has an id", Number.isInteger(ID_A), String(ID_A));
check("B has an id", Number.isInteger(ID_B), String(ID_B));
// Fixed for the cohort, not derived from the roll number — see
// GRADUATION_YEAR in controllers/user.controller.js.
check(
  "graduation year is the cohort constant",
  me.json?.data?.user?.graduation_year === 2027,
  String(me.json?.data?.user?.graduation_year)
);

{
  const r = await a.req("POST", "/users/login", { email: EMAIL_A });
  check("login without password is rejected", r.status === 400, `got ${r.status}`);
}
{
  const r = await a.req("POST", "/users/signup", {
    email: "x.20249990@iiitsonepat.ac.in",
    password: "short",
  });
  check("short password is rejected", r.status === 400, `got ${r.status}`);
}
{
  const r = await a.req("POST", "/users/signup", {
    email: "someone@gmail.com",
    password: "longenoughpassword",
  });
  check("non-institute email is rejected", r.status === 403, `got ${r.status}`);
}

/* -------------------------------------------------------- access control -- */

section("Access control (B must not reach A's data)");
for (const [name, path] of [
  ["attendance records", `/attendance?userId=${ID_A}`],
  ["attendance overall", `/attendance/percentage/overall?userId=${ID_A}`],
  ["attendance subject-wise", `/attendance/percentage/subject-wise?userId=${ID_A}`],
  ["enrolments", `/enrollments/users/${ID_A}/enrollments`],
  ["rides", `/rides/user/${ID_A}/rides`],
  ["listings", `/buy-and-sell/user/${ID_A}/items`],
]) {
  const r = await b.req("GET", path);
  check(`${name} -> 403`, r.status === 403, `got ${r.status}`);
}
{
  const r = await b.req("DELETE", "/enrollments", {
    userId: ID_A,
    subjectId: 4,
  });
  check("cannot unenroll another user (destroys attendance)", r.status === 403, `got ${r.status}`);
}
{
  const r = await b.req("POST", "/notification", { userId: ID_A, message: "x" });
  check("non-admin cannot send notifications", r.status === 403, `got ${r.status}`);
}
{
  const r = await b.req("POST", "/notification/broadcast", { message: "x" });
  check("non-admin cannot broadcast", r.status === 403, `got ${r.status}`);
}
{
  const r = await b.req("GET", "/users/admin/all");
  check("non-admin cannot list users", r.status === 403, `got ${r.status}`);
}

/* ------------------------------------------------------------ attendance -- */

section("Attendance");
{
  const r = await a.req("GET", "/attendance/percentage/overall");
  check("own overall readable", r.status === 200, `got ${r.status}`);
  const d = r.json?.data;
  if (d) {
    check(
      "absent = total - present",
      d.absentDays === d.totalDays - d.presentDays,
      `${d.totalDays}/${d.presentDays}/${d.absentDays}`
    );
    const expected =
      d.totalDays > 0
        ? Math.round((d.presentDays / d.totalDays) * 10000) / 100
        : 0;
    check(
      "percentage matches present/total",
      Math.abs(d.percentage - expected) < 0.01,
      `${d.percentage} vs ${expected}`
    );
  }
}
{
  const r = await a.req("POST", "/attendance", {
    subjectId: 4,
    date: "2030-01-01",
    status: "Present",
  });
  check("future date rejected", r.status === 400, `got ${r.status}`);
}
{
  const r = await a.req("POST", "/attendance", {
    subjectId: 4,
    date: "01-01-2026",
    status: "Present",
  });
  check("bad date format rejected", r.status === 400, `got ${r.status}`);
}
{
  const r = await a.req("POST", "/attendance", {
    subjectId: 4,
    date: "2026-10-01",
    status: "Maybe",
  });
  check("invalid status rejected", r.status === 400, `got ${r.status}`);
}
{
  const r = await a.req("POST", "/attendance", {
    subjectId: 99999,
    date: "2026-10-01",
    status: "Present",
  });
  check("marking an unenrolled subject rejected", r.status === 403, `got ${r.status}`);
}

/* ----------------------------------------------------------------- rides -- */

section("Rides");
let rideId;
{
  const r = await a.req("POST", "/rides", {
    pickupLocation: "SMOKE Gate",
    dropLocation: "SMOKE Station",
    departureDateTime: new Date(Date.now() + 7 * 864e5).toISOString(),
    totalSeats: 1,
    estimatedCost: 100,
    phoneNumber: "9876543210",
    description: "smoke test",
  });
  rideId = r.json?.data?.id;
  check("A creates a ride", r.status === 201 && !!rideId, `got ${r.status}`);
}
{
  const r = await a.req("POST", "/rides", {
    pickupLocation: "A",
    dropLocation: "B",
    departureDateTime: "2020-01-01T00:00:00.000Z",
    totalSeats: 2,
    phoneNumber: "9876543210",
  });
  check("past departure rejected", r.status === 400, `got ${r.status}`);
}
{
  const r = await a.req("POST", "/rides", {
    pickupLocation: "A",
    dropLocation: "B",
    departureDateTime: new Date(Date.now() + 864e5).toISOString(),
    totalSeats: 99,
    phoneNumber: "9876543210",
  });
  check("seat count above max rejected", r.status === 400, `got ${r.status}`);
}
if (rideId) {
  check("A cannot join own ride", (await a.req("POST", `/rides/${rideId}/join`)).status === 400);
  check("B joins", (await b.req("POST", `/rides/${rideId}/join`)).status === 200);
  check("B cannot join twice", (await b.req("POST", `/rides/${rideId}/join`)).status === 400);

  let r = await a.req("GET", `/rides/${rideId}`);
  check("ride is FULL at 0 seats", r.json?.data?.status === "FULL", r.json?.data?.status);

  await a.req("PUT", `/rides/${rideId}`, { totalSeats: 4 });
  r = await a.req("GET", `/rides/${rideId}`);
  check(
    "raising seats reopens a FULL ride",
    r.json?.data?.status === "OPEN" && r.json?.data?.availableSeats === 3,
    `${r.json?.data?.status}/${r.json?.data?.availableSeats}`
  );

  check("B unjoins", (await b.req("DELETE", `/rides/${rideId}/join`)).status === 200);
  await b.req("DELETE", `/rides/${rideId}/join`);
  r = await a.req("GET", `/rides/${rideId}`);
  check(
    "seats never exceed total",
    r.json?.data?.availableSeats <= r.json?.data?.totalSeats,
    `${r.json?.data?.availableSeats}/${r.json?.data?.totalSeats}`
  );

  check("B cannot delete A's ride", (await b.req("DELETE", `/rides/${rideId}`)).status === 403);
  check("A deletes own ride", (await a.req("DELETE", `/rides/${rideId}`)).status === 200);
}

/* --------------------------------------------------------- skill exchange -- */

section("Skill exchange");
{
  const r = await a.req("POST", "/skill-exchange/add-skill", {
    skillName: "SmokeTestSkill",
    type: "teach",
  });
  check("A adds a teach skill", r.status === 200 || r.status === 201, `got ${r.status}`);
}
{
  const r = await a.req("GET", "/skill-exchange/my-skills");
  check("A reads own skills", r.status === 200, `got ${r.status}`);
  const teach = r.json?.data?.teach || r.json?.teach || [];
  const found = teach.find(
    (s) => (s.Skill?.name || s.name) === "SmokeTestSkill"
  );
  check("added skill is present", !!found);
  if (found?.id) {
    const d = await a.req("DELETE", `/skill-exchange/user-skill/${found.id}`);
    check("A deletes own skill", d.status === 200, `got ${d.status}`);
  }
}

/* ----------------------------------------------------------------- done -- */

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) {
  console.log("\nFailures:");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}

# Interview Prep: ClassMate

## Quick Project Summary

ClassMate is a full-stack campus management platform I built for IIIT Sonepat students. It combines six features in one app: attendance tracking with subject-wise analytics, a peer-to-peer marketplace for buying and selling goods, lost-and-found reporting, ride-sharing with seat management, skill exchange matching, and internship listings. The backend is an Express.js REST API with Sequelize ORM on PostgreSQL, deployed on Render. The frontend is a React 18 SPA using Redux Toolkit, deployed on Vercel. Authentication is entirely JWT-cookie based with institutional email enforcement.

---

## Q1. Walk me through the hardest engineering problem you solved in this project.

**Answer:**
The hardest problem was the ride-sharing seat race condition. When multiple users try to join the same ride simultaneously, you have a classic TOCTOU problem: both requests read `availableSeats = 1`, both pass the "seats available" check, and both write a participant record — resulting in a ride with 0 seats that has admitted 2 passengers.

My first instinct was to just use `findOrCreate` on the participant record and check seats. That handles the uniqueness, but doesn't protect `availableSeats` — two requests can both read `availableSeats = 1` before either writes. The fix was in `ride.controller.js:288-319`: I wrapped the entire `joinRide` flow in a `sequelize.transaction()` with `{ lock: t.LOCK.UPDATE }` on the ride row itself. This is a PostgreSQL `SELECT ... FOR UPDATE` — it holds an exclusive row lock for the duration of the transaction, so the second concurrent request physically blocks until the first commits or rolls back. Only then does it re-read `availableSeats`, which is now 0, and correctly rejects with "Ride is already full."

The `unjoinRide` path uses the same pattern in reverse — it restores `availableSeats` and flips status back from FULL to OPEN atomically.

If I were scaling this to thousands of concurrent rides, I'd look at using Redis atomic operations (`DECR` with a guard) as an in-memory seat counter to avoid hitting the DB at all, only syncing to PostgreSQL for durability. But for the current scale of a single campus, the DB-level lock is correct and sufficient.

---

## Q2. Your `attendance_record` model has a unique compound index on `[userId, subjectId, date]`, but you ALSO use `findOrCreate` in the controller. Why both?

**Answer:**
Both layers serve different purposes. `findOrCreate` in `markAttendance` (attendance.controller.js:74-85) is the optimistic path — it wraps a `SELECT` + conditional `INSERT` in a single ORM call, which handles the 99% case cleanly and avoids redundant database round-trips.

But `findOrCreate` is not atomic at the PostgreSQL level unless the underlying table has a unique constraint. Without the DB constraint, two concurrent requests could both execute the `SELECT` (both finding nothing), then both execute the `INSERT`, and both succeed — resulting in two attendance records for the same student/subject/day, breaking percentage calculations.

The unique constraint in `attendance_record.model.js:50-53` (`user_subject_date_unique_attendance`) is the actual guarantee. The `SequelizeUniqueConstraintError` catch block at line 99 is the cleanup handler: when two requests race past `findOrCreate` simultaneously, only one INSERT wins at the DB level, and the loser gets a constraint violation that I convert into a clean 409 with the message "Attendance already recorded (concurrent request issue)."

This is a classic "defense in depth" strategy for data integrity: app-level check first for performance, DB-level constraint as the authoritative guard. I learned this pattern from studying how Rails handles `find_or_create_by` with unique constraints.

---

## Q3. You use `sequelize.sync({ alter: true })` in development but only `sequelize.authenticate()` in production. What are the risks of this setup?

**Answer:**
In `server.js:122-128`, development runs `sync({ alter: true })` which compares the current ORM model definitions to the live schema and alters the tables to match. This is convenient for rapid iteration — add a column in the model, restart the server, and it appears in the DB automatically.

The risk is that `alter: true` can be destructive in subtle ways. It can drop columns that no longer exist in the model, change ENUM values (which PostgreSQL implements as a separate type, so renaming them requires a migration), or change column types in ways that truncate data. If someone accidentally removes a field from a Sequelize model in dev, `alter: true` would drop that column and its data on the next restart.

In production, `sequelize.authenticate()` just tests the connection — it never touches the schema. This is the safe choice: production schema changes must be done manually or through proper migration tooling. However, this also means that when I deploy new model fields (say, adding a `bio` field to `users`), the column doesn't exist in production until I manually run an ALTER TABLE. Currently there are no migration files in this codebase, so that's a gap I'd address by adopting Sequelize migrations (`sequelize-cli`) and running them as part of the deployment pipeline.

---

## Q4. How does your authentication flow work end-to-end, and where are its security boundaries?

**Answer:**
The flow has three layers. At registration (`POST /api/users/signup`), the `emailMiddleware` in `email.middleware.js:17` rejects any email not ending in `@iiitsonepat.ac.in` with a 403 — this is the institutional gate. Passwords are hashed with `bcrypt.hash(password, 10)` (10 rounds) before storage.

At login (`POST /api/users/login` in `user.controller.js:90-123`), I verify the password with `bcrypt.compare`, then generate a JWT signed with `process.env.JWT_SECRET` containing `{ id, email, isAdmin }`, with a 1-hour expiry. The token is set as an HTTP-only cookie with `secure: true` and `sameSite: "none"` in production. HTTP-only means JavaScript on the page cannot read it, which prevents XSS token theft. `sameSite: "none"` with `secure` is required for cross-origin cookies (Vercel frontend to Render backend).

On every protected request, `auth.middleware.js` reads `req.cookies.token`, verifies the JWT signature and expiry, and populates `req.user`. No database lookup — the token is self-contained.

The security weak points I'd address with more time: there's no token refresh mechanism (users must re-login every hour), no rate limiting on the login endpoint (brute-force risk), and the admin access on the frontend relies on a hardcoded email string in `ProtectedRoute.jsx:6` (`ADMIN_EMAIL = "keshav.bit12312015@iiitsonepat.ac.in"`). This frontend-only check is not sufficient — a savvy user could bypass React Router and hit admin API endpoints directly. The backend correctly validates `isAdmin` from the JWT, so the API itself is safe, but the frontend logic should derive admin status from the JWT payload rather than hardcoding an email.

---

## Q5. Your `broadcastNotification` endpoint fetches all users and inserts a notification for each. What happens when you have 10,000 users?

**Answer:**
In `notification.controller.js:275-292`, the broadcast fetches all user IDs into memory with `User.findAll({ attributes: ["id"] })`, maps them to notification objects in an in-process array, then bulk-inserts in chunks of 500 via `Notification.bulkCreate`. This is the current implementation and works fine at small scale.

At 10,000 users, this creates two problems. First, the `findAll` fetches 10,000 rows into Node.js memory simultaneously. Second, even with chunks of 500, you're still doing 20 sequential bulk inserts inside a single HTTP request — this could hold the request open for 5-10 seconds, timing out on some clients and leaving the DB connection pool saturated.

The proper fix at scale would be to make the broadcast asynchronous: accept the request immediately with a 202 Accepted response, enqueue a job (via BullMQ or a simple DB-backed queue), and process the notifications in the background in batches. The UI could poll a job status endpoint. For even larger scale, I'd look at fan-out architectures: store one "broadcast notification" row and a list of recipients, then only materialise per-user rows on first read (lazy fan-out), so a 10,000-user broadcast writes 1 row instead of 10,000.

For the current campus (a few hundred students), the chunk approach is fine and the 500-per-insert guard shows awareness of DB connection pool limits.

---

## Q6. Walk me through the unenrollment transaction. Why is it critical that it be atomic?

**Answer:**
In `user_subject.controller.js:115-149`, unenrolling a user from a subject does two things: deletes the `UserSubject` row (the enrollment record) and deletes all `AttendanceRecord` rows for that `userId`/`subjectId` combination. Both happen inside `await sequelize.transaction()`.

The atomicity is critical because these two tables are semantically coupled. Attendance records are only meaningful in the context of enrollment. If the enrollment deletion succeeds but the attendance deletion fails (say, due to a transient DB error), you'd have attendance data for a subject the user is no longer enrolled in. Now `getSubjectWisePercentages` in `attendance.controller.js:385-460` would either ignore those records (because it fetches enrolled subjects first) or, worse, if the query logic ever changed to join directly, surface orphaned data.

Conversely, if attendance is deleted first and enrollment deletion fails, the user loses their historical attendance data but remains enrolled — also wrong.

The transaction with rollback (`await transaction.rollback()` in the catch block) ensures both-or-neither semantics. Sequelize's transaction API passes the `transaction` object to each ORM call, so they all run on the same DB connection within the same transaction scope.

If I were to add a feature like "archive attendance on unenrollment" instead of deleting it, I'd change the delete to a soft-delete or archive operation, but the transaction boundary would remain the same.

---

## Q7. Your attendance percentage calculation uses SQL aggregation — why not just fetch all records and calculate in JavaScript?

**Answer:**
The `getAttendancePercentage` in `attendance.controller.js:264-278` uses:
```js
sequelize.fn("COUNT", sequelize.col("id"))
sequelize.literal("CASE WHEN status = 'Present' THEN 1 ELSE 0 END")
```
This computes both the total count and the present count in a **single SQL query**, returning two scalar values. The alternative — `AttendanceRecord.findAll({ where: { userId, subjectId } })` — would fetch every record row including all columns, deserialize them into JavaScript objects, then iterate to count.

The SQL aggregate approach wins on three dimensions. First, **data transfer**: instead of sending N rows over the wire, we send 2 numbers. For a student with 200 class days across 6 subjects, that's 1200 rows vs 12 scalars. Second, **memory**: Sequelize doesn't need to instantiate 1200 model objects. Third, **computation**: PostgreSQL's aggregation runs in a single scan of the B-tree index on `[userId, subjectId]`, which is much faster than deserializing objects in Node.

`getSubjectWisePercentages` extends this with `group: ["subjectId"]` — one query returns stats for all subjects instead of one query per subject (which would be an N+1 problem at the API level).

The trade-off: SQL aggregation is less flexible in JavaScript. If I needed to add time-weighted attendance or exclude certain date ranges dynamically, I'd need to push that logic into SQL rather than JavaScript. For the current requirements (simple percentage), the aggregation approach is clearly correct.

---

## Q8. What are the security implications of the Jooble API key being hardcoded in `internship.controller.js`?

**Answer:**
In `internship.controller.js:15`, the API key is: `process.env.JOOBLE_API_KEY || "aa343263-45dc-41b6-ae9b-daca2467e5d7"`. This is a hardcoded fallback that will be included in any git repository, any Docker image, any deploy artifact, and accessible to anyone with read access to the repo or container.

The immediate risk is credential exposure. Anyone who finds this key can make Jooble API requests under this project's account, potentially exhausting the monthly quota (costing money or blocking users) or violating the API's terms of service.

The correct fix is straightforward: remove the hardcoded fallback and fail loudly if `JOOBLE_API_KEY` is not set (`if (!apiKey) throw new Error("JOOBLE_API_KEY not configured")`). Then set the key properly in the production environment variables on Render, and in a `.env` file (git-ignored) locally.

Beyond this specific issue, the fact that the mock fallback returns fake Google/Microsoft listings is also a UX concern — a user seeing "Software Engineering Intern at Google" with `apply_link: "https://internshala.com"` is misleading. A better fallback would be to return an explicit error telling the user the service is temporarily unavailable, rather than silently showing fabricated data.

---

## Q9. How would you add proper database migrations to this project?

**Answer:**
Currently the project uses `sequelize.sync({ alter: true })` in development and no migration tooling at all. The first step is adding `sequelize-cli` as a dev dependency and creating a `config/database.js` that reads from the same env vars as `db.js`.

Migration files live in a `migrations/` directory and are timestamped. Each file exports an `up` function (apply the change) and a `down` function (revert it). For example, adding the `bio` column to users would be:
```js
up: async (qi, Sequelize) => qi.addColumn('users', 'bio', { type: Sequelize.TEXT, allowNull: true })
down: async (qi) => qi.removeColumn('users', 'bio')
```

The `sequelize db:migrate` command (run as part of the deployment pipeline on Render) applies any unapplied migrations in order. Sequelize tracks applied migrations in a `SequelizeMeta` table.

The trickiest part in this codebase would be migrating existing schema to migration files — you'd need to generate an initial migration from the current live schema (using `sequelize db:migrate:status` + manual snapshot) rather than using `sync`. I'd also add a `db:migrate:undo` step to the rollback plan so we can revert a bad deploy.

At this scale, `sequelize-cli` migrations are sufficient. At higher scale I'd move to Flyway or Liquibase for stronger ordering guarantees and multi-DB support.

---

## Q10. Why is there no Redux Persist in the store, and what happens when a user refreshes the page?

**Answer:**
In `store.js`, the `rootReducer` is plain `combineReducers` with no persistence layer. When a user refreshes, all Redux state is lost. This is intentional for the auth slice: rather than persisting the user object to localStorage (which is readable by JavaScript and therefore vulnerable to XSS), the app re-hydrates auth state by calling `GET /api/users/current` on every load, as dispatched from `main.jsx` (or the App level).

The `/current` endpoint reads the HTTP-only cookie (which the browser automatically sends on page reload) and returns the user object if the JWT is still valid. This is the correct pattern for cookie-based auth — the cookie is the source of truth, not localStorage.

The downside is a brief loading flash on every page load while the auth check resolves. That's why `App.jsx:125` shows `<LoadingScreen>` until `authLoading` is false — the UX is a loading spinner rather than a flash of unauthenticated content.

For non-auth state (rides, notifications, etc.), re-fetching from the API on mount is fine for this scale. If performance were a concern at high scale, I'd add `sessionStorage`-based caching for read-heavy data like the rides list, invalidated on mutations.

---

## Q11. The `email.middleware.js` enforces the IIIT Sonepat domain, but what stops someone from creating a fake `@iiitsonepat.ac.in` email?

**Answer:**
Honestly, right now the middleware at `email.middleware.js:17` only checks that the email ends with `@iiitsonepat.ac.in`. It doesn't verify that the email address actually exists or belongs to a real student. A user could register with `notarealstudent123456789@iiitsonepat.ac.in` and the system would accept it.

The right fix is email verification: after registration, send a verification email to the address using Nodemailer (which is already installed as a dependency in `package.json`). Include a one-time token in the link. Only mark the user as `verified` after they click it. Until then, block login with a 403 "Please verify your email."

The `user.model.js` doesn't currently have a `isVerified` field or a verification token field — those would need to be added as a migration. The README mentions "Email verification via Nodemailer" as a feature, but it's not implemented in the current codebase.

A secondary check would be to validate the registration number parsed from the email (in `extractRegistrationDetails`) against a list of enrolled student registration numbers — but that would require maintaining a separate authorized users list, which adds operational complexity.

---

## Q12. If ClassMate needed to support 100x its current traffic, what breaks first and how would you fix it?

**Answer:**
At 100x traffic, I'd expect failures in roughly this order:

**First to break: the single Express process.** Node.js is single-threaded. With enough concurrent requests, even async I/O can saturate the event loop, especially for the DB-heavy attendance and rides endpoints. Fix: horizontal scaling with PM2 cluster mode (multiple processes on the same box) or containerization with multiple Render instances behind a load balancer. Stateless JWT auth makes this straightforward — no sticky sessions needed.

**Second: the PostgreSQL connection pool.** Current config: `max: 10`. At 100x traffic with ~100 connections per Render instance times N instances, you'll hit Postgres's connection limit. Fix: add PgBouncer as a connection pooler between the app and Postgres. Supabase (which seems to be the likely DB host given the SSL config) includes this.

**Third: the N+1 query patterns.** `getSkillMatches` makes multiple sequential queries. `broadcastNotification` is O(N) DB inserts. Under load, these become bottlenecks. Fix: eager loading with `include` (already done in rides/attendance), and async job queues for broadcast.

**Fourth: Cloudinary upload latency on mutations.** Uploading to Cloudinary synchronously inside an HTTP request blocks the response. At high concurrency, this means many connections held open waiting for a third-party API. Fix: accept the upload, return immediately with a presigned Cloudinary URL and let the client upload directly (client-side upload), or process uploads asynchronously.

The attendance aggregation queries are already well-designed with SQL aggregation and indexes, so those should scale well.

---

## Q13. What design trade-off did you make with your Redux architecture, and what would you change?

**Answer:**
The biggest trade-off is having **multiple Axios instance declarations** spread across 8+ slice files, each creating `axios.create({ baseURL, withCredentials: true })`. This means if I need to change the API URL logic or add a global interceptor (say, a request ID header for tracing), I have to update 8 files. I chose this pattern for simplicity — it's easy to read a single slice file — but it creates duplication.

What I'd change: extract a single `api.js` utility file that exports one configured Axios instance, and import it in every slice. That's the more standard pattern in large Redux Toolkit codebases.

The second trade-off is co-locating async thunks in slice files rather than separating them into dedicated query/mutation files (like RTK Query). RTK Query would give me automatic loading/error state, request deduplication, and cache invalidation for free. For example, the attendance slice dispatches multiple re-fetch thunks after `updateAttendance` to keep all the derived stats in sync — RTK Query would handle this automatically via cache tags. I'd adopt RTK Query for a v2 of this codebase.

The third trade-off is no Redux Persist. I chose simplicity and security (no sensitive data in localStorage). The cost is re-fetching state on every page load. Given that the auth cookie is the source of truth and the data sets are small, this is the right call for this project.

---

## Q14. What would you build next for ClassMate?

**Answer:**
Three things, in priority order.

First, **real-time notifications via WebSockets**. Socket.io is already installed in `package.json`. Currently notifications require a page refresh or manual polling. Adding a persistent WebSocket connection would let admins broadcast and have all connected students see the notification immediately — especially valuable for urgent campus announcements. The `broadcastNotification` endpoint already does the hard work; the gap is just the real-time push channel.

Second, **proper database migrations with Sequelize CLI**. The `sync({ alter: true })` approach in development is a maintenance liability. I need timestamped migration files, a `db:migrate` step in the Render deploy pipeline, and a `db:migrate:undo` for rollbacks.

Third, **email verification on registration**. Right now anyone can register with a fake `@iiitsonepat.ac.in` email. Adding Nodemailer-based email verification (the library is installed) and an `isVerified` flag on the user model would close this gap. This is also a prerequisite before adding password reset functionality, which students will inevitably need.

Beyond those, I'd add full-text search (PostgreSQL `tsvector`) on the marketplace and lost-and-found listings, which currently have no search — users must scroll through all items.

---

## Q15. There's a subtle bug in the attendance percentage calculation for students who unenroll from a subject after having attendance records. Describe it and how you'd fix it.

**Answer:**
This is actually the exact scenario that the transactional unenrollment in `user_subject.controller.js:115-149` was designed to handle: when a user unenrolls, all their `AttendanceRecord` rows for that subject are deleted atomically in the same transaction.

But consider a slightly different edge case: what if the `getOverallAttendancePercentage` endpoint in `attendance.controller.js:304-382` is called **while** the unenrollment transaction is in progress? The endpoint first fetches enrolled subject IDs: `UserSubject.findAll({ where: { userId } })`. Then it queries `AttendanceRecord` with `subjectId: { [Op.in]: enrolledSubjectIds }`. If the unenrollment transaction has committed `UserSubject.destroy` but not yet `AttendanceRecord.destroy`, the subject disappears from `enrolledSubjectIds`, so the attendance query won't include those records — percentage is correct. But if the read happens after the transaction commits both, there are no orphaned records — also correct.

The actual bug that could occur in practice: if a developer removes the transaction from `unenrollUserFromSubject` (say, by accident or under the mistaken belief it's unnecessary), the window between `UserSubject.destroy` succeeding and `AttendanceRecord.destroy` being called could be observed by concurrent reads. During that window, `getOverallAttendancePercentage` would exclude the subject (correct enrollment state) but there would be orphaned attendance records that contribute to totals if the query logic ever changed.

The fix is exactly what's already in place: the transaction. But to make it more robust, I'd also add a database-level `ON DELETE CASCADE` on `AttendanceRecord.subjectId` pointing to `UserSubject` rather than to `Subject`, so even without the explicit `AttendanceRecord.destroy` call, unenrolling would cascade-delete attendance. Currently `ON DELETE CASCADE` is set to `Subject` deletion only, not `UserSubject` deletion.

---

## Q16. Why did you choose this tech stack?

**Answer:**
Every choice was driven by a concrete reason, not just familiarity.

**PostgreSQL + Sequelize** was the right call because ClassMate's data is fundamentally relational. Attendance records belong to a user AND a subject. Ride seats involve users, rides, and a join table. A document database like MongoDB would've made these multi-table joins awkward or pushed join logic into the application layer. Sequelize gave me declarative associations and ORM-level safety without raw SQL for every query — and the `findOrCreate` pattern was critical for safe attendance marking.

**Express.js** was chosen for its composability. The middleware chain — CORS → auth → email-domain check → profanity filter → multer — reads sequentially and is easy to reason about. A framework like NestJS would've added abstraction overhead for a project of this scale.

**React 18 + Redux Toolkit** for the frontend. The app has 8+ independent feature areas (rides, attendance, marketplace, etc.), each with their own async state (loading, error, data). Redux Toolkit's slice pattern kept each feature self-contained: `ridesSlice.js` owns everything about rides, `attendanceSlice.js` owns everything about attendance. Context API would've become messy with this many independent async flows. RTK's `createAsyncThunk` handled the loading/error states that would otherwise require boilerplate.

**Vite** over Create React App for its cold-start speed — HMR that stays fast even as the project grew to 50+ components.

**JWT in HTTP-only cookies** rather than localStorage. Once I understood that localStorage-stored tokens are readable by any JavaScript (including injected scripts), the cookie approach was non-negotiable. The `sameSite: "none"` + `secure` configuration for cross-origin (Vercel → Render) is the correct production setting.

**Cloudinary** for media storage because running a file server on a managed platform like Render is unreliable — containers restart and ephemeral disk is wiped. Cloudinary's CDN also means images load fast globally without me managing caching headers.

The one stack choice I'd reconsider: using `sequelize.sync({ alter: true })` in development instead of proper migration files. It was fast to start with but creates operational risk as the project grows.

---

## Q17. What challenges did you face, and how did you solve them?

**Answer:**
Three challenges stand out — each one taught me something concrete.

**Challenge 1: The ride-sharing race condition.**
When I first built the join-ride feature, I didn't think about concurrency. Testing alone never revealed it because manual testing is sequential. The bug was that two users joining the last seat simultaneously would both succeed. The solution was `sequelize.transaction()` with `{ lock: t.LOCK.UPDATE }` in `ride.controller.js:288-319` — a PostgreSQL row-level lock that serialises concurrent joins. This was my first time deliberately using pessimistic locking and it changed how I think about any state-mutation endpoint with shared resources.

**Challenge 2: Cross-origin cookie authentication.**
The frontend on Vercel and the backend on Render are different domains. My cookies simply weren't being sent. After debugging, I found three settings all had to be correct simultaneously: the Express `cors()` config needed `credentials: true` and the exact origin (not a wildcard), the Axios client needed `withCredentials: true`, and the cookie itself needed `sameSite: "none"` with `secure: true`. Missing any one of those three broke it silently — the request would go through but without the cookie, appearing as an authentication failure. I also hit the issue of the 401 on `/current` breaking the initial load — that led to the special-casing in `auth.middleware.js:10-16` that returns 200 with `{ user: null }` for unauthenticated visits to `/current`.

**Challenge 3: Attendance consistency on unenrollment.**
When a user unenrolls from a subject, there are two things to delete: the `UserSubject` enrollment record and all `AttendanceRecord` rows for that subject. I initially wrote them as sequential `await` calls without a transaction. I realised that if the second delete failed (say, a DB timeout), the user would be unenrolled but their attendance history would remain, making `getSubjectWisePercentages` produce incorrect results. Wrapping both in `sequelize.transaction()` in `user_subject.controller.js:115-149` with a rollback on failure gave both-or-neither semantics. This is where I internalised when transactions are truly necessary.

---

## Q18. Explain the architecture or workflow of your project.

**Answer:**
ClassMate is a **layered monorepo** — a single repository with two independent applications: `client/` (React SPA) and `server/` (Express REST API).

**Request lifecycle on the backend:**

1. A request arrives at Express (`server.js`).
2. Global middleware runs first: CORS validation, JSON parsing, cookie parsing, performance timing (monkey-patches `res.end` to record duration).
3. The request is matched to a route group (e.g., `POST /api/rides` → `ride.routes.js`).
4. Route-level middleware runs in sequence — for ride creation: `authMiddleware` (verifies JWT cookie, populates `req.user`) → `filterInputMiddleware` (profanity check on text fields).
5. The controller function runs (`createRide` in `ride.controller.js`). It validates input, interacts with Sequelize models, calls external services (Cloudinary if an image is uploaded), and constructs the response using `ApiResponse`.
6. If the controller throws, `asyncHandler` catches the rejected promise and passes it to `next(err)`. The global error handler in `server.js:88-109` formats the error response (suppressing stack traces in production, and suppressing the message entirely for 401s).

**State management on the frontend:**

Every feature has a Redux slice (`attendanceSlice.js`, `ridesSlice.js`, etc.). Each slice owns its async thunks (API calls via Axios) and its reducer (loading/error/data state). Components use `useSelector` to read state and `useDispatch` to trigger thunks.

On initial app load, `App.jsx` runs a DB health check (`GET /api/users/health`) and dispatches `checkAuthStatus` (`GET /api/users/current`). Only after both resolve does the loading screen give way to the actual app — ensuring users never see a half-loaded state.

**Auth flow:**
Register (email validated server-side for `@iiitsonepat.ac.in`) → Login (bcrypt comparison, JWT set as HTTP-only cookie) → every subsequent request sends the cookie automatically → `auth.middleware.js` verifies JWT, populates `req.user` → protected routes proceed, or 401 is thrown.

**Deployment:**
Frontend on Vercel with a `vercel.json` rewrite rule so React Router's client-side routes return `index.html`. Backend on Render with `NODE_ENV=production` (disables `sync({ alter: true })`, enables `sameSite: "none"` cookies). Both read secrets from environment variables. PostgreSQL hosted externally, accessed via `DATABASE_URL`.

---

## Q19. If you had to build this project again, what would you improve?

**Answer:**
Five things, in priority order.

**1. Proper database migrations from day one.**
Using `sequelize.sync({ alter: true })` in development was a shortcut I'd never take again. It makes a reliable, repeatable deployment process impossible. I'd set up `sequelize-cli` migrations on day one — each schema change as a timestamped migration file — and run `db:migrate` as part of the Render deploy pipeline. This is the single biggest operational liability in the current codebase.

**2. RTK Query instead of hand-rolled thunks.**
Every slice has nearly identical `pending/fulfilled/rejected` boilerplate. RTK Query would eliminate that entirely, give me automatic caching with tag-based invalidation, request deduplication, and optimistic updates out of the box. The attendance slice currently dispatches 4 re-fetch thunks after every update to keep derived state in sync — RTK Query's cache invalidation system would handle this declaratively.

**3. Email verification on registration.**
Right now the `@iiitsonepat.ac.in` domain check is the only gate. Anyone who knows the domain can register with a fake address. Adding Nodemailer-based email verification (the library is already installed in `package.json`) would close this gap — and is a prerequisite for any password reset flow.

**4. Token refresh + longer session lifetime.**
The 1-hour JWT expiry with no refresh token means users get logged out mid-session. The proper fix is a short-lived access token (15 min) in an HTTP-only cookie, plus a long-lived refresh token (7 days) in a separate HTTP-only cookie. On access token expiry, a silent `POST /api/auth/refresh` call issues a new access token without requiring re-login. This is a standard pattern I'd implement from the start.

**5. Remove the hardcoded admin email from `ProtectedRoute.jsx`.**
`ADMIN_EMAIL = "keshav.bit12312015@iiitsonepat.ac.in"` is a single-admin, hardcoded frontend check. I'd replace it with `user.isAdmin` derived from the JWT payload — already present in the backend token, just not properly surfaced to the frontend router. This would also allow multiple admins without a code deploy.


# PROJECT_BREAKDOWN.md — ClassMate

---

## Project Overview

ClassMate is a comprehensive, full-stack campus management web platform built exclusively for students and administrators of **IIIT Sonepat**. It consolidates six distinct student-life utilities — attendance tracking, a peer marketplace, lost-and-found reporting, carpooling, skill exchange, and internship listings — into a single cohesive product. The system enforces strict institutional access control (only `@iiitsonepat.ac.in` email addresses can register) and uses JWT cookies for stateless, secure sessions. It is deployed with the frontend on **Vercel** and the backend on **Render**, using a cloud-hosted **PostgreSQL** database.

---

## Tech Stack Summary

| Layer | Technology | Likely reason |
|---|---|---|
| Frontend framework | React 18 + Vite | Fast HMR, modern component model |
| State management | Redux Toolkit | Predictable global state across many feature slices |
| Routing | React Router v7 | Nested, protected routes, redirect-on-auth |
| Styling | Tailwind CSS v4 | Utility-first, dark theme design |
| Animation | Framer Motion | Micro-animations for premium feel |
| HTTP client | Axios (per-slice instances) | Cookie credentials, interceptor support |
| Backend framework | Express.js (Node 18, ESM) | Lightweight, composable middleware chain |
| ORM | Sequelize v6 | Declarative associations, PostgreSQL dialect |
| Database | PostgreSQL (via pg/pg-hstore) | Relational data, ACID compliance |
| Auth | JWT + HTTP-only cookies | Stateless, XSS-resistant session tokens |
| File/media uploads | Multer then Cloudinary | Temporary local then cloud persistence |
| Profanity filter | leo-profanity | User-generated-content moderation |
| Performance monitoring | Custom in-memory PerformanceMetrics class | Lightweight observability |
| Internship API | Jooble REST API (with mock fallback) | Third-party job aggregator |
| Dev tooling | Nodemon, ESLint, Prettier | Hot reload, linting, formatting |
| Deployment (frontend) | Vercel (vercel.json present) | Zero-config React hosting |
| Deployment (backend) | Render (CORS allows onrender.com) | Managed Node hosting |

---

## Directory Structure

```
ClassMate/
├── README.md
├── client/                         # Vite + React frontend
│   ├── src/
│   │   ├── main.jsx                # React root / Redux Provider
│   │   ├── App.jsx                 # Router, DB health check, loading gate
│   │   ├── store.js                # Redux store (combineReducers)
│   │   ├── slices/                 # Redux slices (one per feature)
│   │   │   ├── authSlice.js
│   │   │   ├── attendanceSlice.js
│   │   │   ├── buyandsellSlice.js
│   │   │   ├── enrollmentSlice.js
│   │   │   ├── lostAndFoundSlice.js
│   │   │   ├── notificationSlice.js
│   │   │   ├── profileSlice.js
│   │   │   └── ridesSlice.js
│   │   ├── features/
│   │   │   ├── resource/
│   │   │   └── skillExchange/
│   │   ├── components/
│   │   │   ├── common/layout/
│   │   │   │   ├── NavBar.jsx
│   │   │   │   └── ScrollToTop.jsx
│   │   │   ├── Attendance/         # 10 sub-components
│   │   │   ├── Graphs/
│   │   │   ├── HomePage/
│   │   │   ├── Modals/
│   │   │   ├── rides/              # 7 components
│   │   │   └── features/auth/
│   │   │       ├── ProtectedRoute.jsx
│   │   │       └── PublicRoute.jsx
│   │   └── pages/
│   │       ├── HomePage.jsx
│   │       ├── JobConnect.jsx
│   │       ├── auth/LoginPage.jsx
│   │       ├── user/ProfilePage.jsx
│   │       ├── admin/AdminPanel.jsx
│   │       ├── attendance/AttendancePage.jsx
│   │       ├── marketplace/BuyAndSellPage.jsx
│   │       ├── services/LostAndFound.jsx
│   │       ├── services/RideShare.jsx
│   │       ├── skill-exchange/SkillExchangeDashboard.jsx
│   │       └── utility/ (404.jsx, 500.jsx)
└── server/
    ├── server.js                   # Entry point
    ├── load-test.ps1               # PowerShell performance test
    └── src/
        ├── db/db.js
        ├── models/
        │   ├── association.js      # All Sequelize relationships
        │   ├── user.model.js
        │   ├── attendance_record.model.js
        │   ├── buyandsell.model.js
        │   ├── lostandfound.model.js
        │   ├── notification.model.js
        │   ├── ride.model.js
        │   ├── rideParticipant.model.js
        │   ├── skill.model.js
        │   ├── skillRequest.model.js
        │   ├── subject.model.js
        │   ├── user_subject.model.js
        │   └── userSkill.model.js
        ├── controllers/ (9 files)
        ├── routes/ (9 files)
        ├── middlewares/ (6 files)
        └── utils/ (5 files)
```

---

## File-by-File Breakdown

### `/server/server.js`
**Purpose:** Express application entry point.

- Configures CORS for three allowed origins with `credentials: true`.
- Sets `X-Content-Type-Options: nosniff` globally.
- Applies `performanceMiddleware` globally to time every request.
- Sets `Cache-Control: no-store` on all `/api` routes.
- Protects `/api/metrics` with `authMiddleware + requireAdmin`.
- Custom global error handler: suppresses stack traces on 401 errors (security-conscious).
- In dev: `sequelize.sync({ alter: true })`; in prod: `sequelize.authenticate()` only.
- `uncaughtException` + `unhandledRejection` handlers — exits in prod on unhandled rejection.

### `/server/src/db/db.js`
**Purpose:** Creates the Sequelize instance with dual configuration mode.

- If `DATABASE_URL` exists, uses it with SSL. Otherwise uses individual `DB_*` env vars.
- Connection pool: `max: 10, min: 1, acquire: 30000, idle: 10000`.
- `family: 4` forces IPv4 (avoids IPv6 issues on some hosts).
- Exports `connectDb()` which calls `sequelize.authenticate()` and throws on failure.

### `/server/src/models/association.js`
**Purpose:** Declares all Sequelize ORM relationships via `initializeAssociations()`.

- `User` one-to-many: `LostAndFound`, `BuyAndSell`, `Rides` (as creator), `Notification`, `AttendanceRecord`.
- `User` many-to-many `Subject` through `UserSubject` join table.
- `User` many-to-many `Skill` through `UserSkill`.
- `SkillRequest` belongs to two Users (requester/recipient) and one Skill.
- `Rides` has-many `RideParticipant`.
- Note: `Notification.belongsTo(User)` also declared in notification.model.js — minor duplication.

### `/server/src/models/user.model.js`
**Purpose:** Defines the `users` table.

- Fields: id, name, registration_number (unique), email (unique), password, semester (ENUM 8 values), branch (ENUM 10 engineering branches), hostel, graduation_year, isAdmin (default false).
- Most profile fields `allowNull: true` — filled after registration.

### `/server/src/models/ride.model.js`
**Purpose:** Defines the `rides` table.

- Status ENUM: OPEN / FULL / CANCELLED / COMPLETED.
- Compound indexes: `[creatorId, departureDateTime]`, `[status, departureDateTime]`, `[pickupLocation, dropLocation]`.

### `/server/src/models/attendance_record.model.js`
**Purpose:** Defines attendance records.

- DATEONLY date field (no time component).
- **Unique compound index** `user_subject_date_unique_attendance` on `[userId, subjectId, date]` — DB-level duplicate prevention.
- Additional indexes on `[userId, subjectId]` and `[date]`.

### `/server/src/models/notification.model.js`
**Purpose:** Defines notifications.

- Fields include `is_read`, `read_at`, `entityType`, `entityId`, `actionUrl`, `metadata` (JSON), `file_url`.
- Indexes on `[user_id]` and `[is_read]` for fast unread count queries.

### `/server/src/middlewares/auth.middleware.js`
**Purpose:** JWT cookie verification.

- Reads `req.cookies.token` — no Authorization header.
- **Special case for `/current` path:** returns HTTP 200 with `{ user: null }` instead of 401. This prevents the app from entering an error state on initial load for unauthenticated visitors.
- `TokenExpiredError` and `JsonWebTokenError` both clear the cookie and throw 401.

### `/server/src/middlewares/email.middleware.js`
**Purpose:** Institutional access gate.

- **Enforces `@iiitsonepat.ac.in` domain** — throws 403 for any other email. This is the primary user filter for the entire platform.
- Stores `email.toLowerCase()` on `req.validatedEmail`.

### `/server/src/middlewares/requireAdmin.middleware.js`
**Purpose:** Authorization gate — checks `req.user?.isAdmin === true`. Throws 403 otherwise.

### `/server/src/middlewares/filter.middleware.js`
**Purpose:** Profanity filter on UGC.

- Checks `leo-profanity` against 20 text fields in `req.body` (question, text, name, bio, description, etc.).
- Returns 400 naming the specific offending field.

### `/server/src/middlewares/multer.middleware.js`
**Purpose:** File upload handler.

- Temp storage to `./public/temp/`. Unique filenames: `Date.now() + random`.
- MIME whitelist: jpeg, png, webp, gif. Max 5 MB.

### `/server/src/middlewares/performance.middleware.js`
**Purpose:** Request timing via `res.end` monkey-patch.

- Captures `Date.now()` at request entry. On `res.end`, records duration to `metrics`. Logs warning for requests > 500ms.

### `/server/src/utils/metrics.js`
**Purpose:** In-memory request metrics singleton.

- Rolling buffer of last 1000 requests. Per-endpoint Map of count/totalTime/minTime/maxTime/errors.
- `getStats()`: uptime, avg response time, req/min, top 10 endpoints, last 20 requests.
- Exported as singleton: `export default new PerformanceMetrics()`.

### `/server/src/utils/cloudinary.js`
**Purpose:** Upload/delete utilities for Cloudinary.

- `uploadImageToCloudinary`: < 95 MB → standard upload; >= 95 MB → chunked `upload_large`. Always deletes the local temp file after upload, even on failure.
- `deleteImageFromCloudinary`: parses public ID from CDN URL by finding `/upload/` marker, stripping version prefix `v123/`, removing extension. Returns `true` for "not found" (idempotent).
- `extractCloudinaryPublicId`: pure URL parser used before deletion.

### `/server/src/utils/asyncHandler.js`
**Purpose:** Wraps async route handlers to forward rejected promises to `next(err)`. One-liner implementation.

### `/server/src/controllers/user.controller.js`
**Purpose:** Auth lifecycle + admin user management.

- `extractRegistrationDetails(email)`: parses 8-digit roll number via regex, computes `graduationYear = parseInt(first4digits) + 4`. Auto-derived from email format.
- `registerUser`: duplicate email check, duplicate registration number check (two queries), creates user, **auto-enrolls in 4 default subjects** via `Subject.findOrCreate` + `UserSubject.findOrCreate`.
- `loginUser`: JWT with `{ id, email, isAdmin }`, 1-hour expiry. Cookie: `httpOnly`, `secure` in prod, `sameSite: "none"` in prod / `"lax"` in dev.
- `checkDatabaseHealth`: calls `sequelize.authenticate()`, returns 200/503. Frontend health-check target.

### `/server/src/controllers/attendance.controller.js`
**Purpose:** Attendance CRUD + SQL aggregation.

- `markAttendance`: validates date (regex + Date roundtrip). Verifies enrollment. Uses `findOrCreate` (app-level) + catches `SequelizeUniqueConstraintError` (DB-level) for dual-layer duplicate prevention.
- `updateAttendance`: no-ops if status unchanged.
- `getAttendanceRecords`: flexible filter — exact date, date range (Op.gte/lte), subjectId.
- `getAttendancePercentage` / `getOverallAttendancePercentage`: single aggregation query using `sequelize.fn("COUNT")` + `sequelize.literal("CASE WHEN status = 'Present' THEN 1 ELSE 0 END")`. Overall percentage scoped to enrolled subjects only.
- `getSubjectWisePercentages`: grouped aggregate with `group: ["subjectId"]`, merged with enrolled subjects list (subjects with no records get 0%).
- `handleError`: hides stack traces in production (500s become "Internal Server Error").

### `/server/src/controllers/ride.controller.js`
**Purpose:** Ride-sharing CRUD with transactional concurrency control.

- `updateRide`: ownership check. Guards `totalSeats` reduction: `if (totalSeats < ride.totalSeats - ride.availableSeats)` throws 400.
- `joinRide`: **pessimistic row lock via `sequelize.transaction({ lock: t.LOCK.UPDATE })`**. Prevents two concurrent users from claiming the last seat. Auto-flips status to FULL when `availableSeats` hits 0.
- `unjoinRide`: same transaction pattern. Re-opens status to OPEN if was FULL.
- `getAllRides`: only OPEN rides with `departureDateTime > now()`, limited to 50.

### `/server/src/controllers/notification.controller.js`
**Purpose:** Notification CRUD + admin broadcast.

- `broadcastNotification`: admin-only. Fetches all user IDs, maps notifications, **bulk-inserts in chunks of 500** to avoid overwhelming the DB pool.
- `markAllNotificationsAsRead`: single SQL `UPDATE` for all unread notifications.
- `getUserNotifications`: paginated with `page`/`limit` query params.

### `/server/src/controllers/buyandsell.controller.js`
**Purpose:** Marketplace CRUD with Cloudinary image lifecycle.

- On update: extracts old public ID, deletes from Cloudinary (non-blocking on failure), uploads new.
- `getAllBuyAndSellItems`: clamps `limit = Math.min(50, ...)` and `page = Math.max(1, ...)`.
- `ITEM_CONDITIONS` constant validated on create and update.

### `/server/src/controllers/lostandfound.controller.js`
**Purpose:** Lost-and-found CRUD, same Cloudinary pattern as buy-and-sell.

### `/server/src/controllers/skillExchange.controller.js`
**Purpose:** Skill matching and peer request flow.

- `addUserSkill`: `Skill.findOrCreate` by name, `UserSkill.findOrCreate` with type. Returns 409 with `code: "SKILL_ALREADY_EXISTS"`.
- `getSkillMatches`: finds learn-skills, queries other users' teach-skills, enriches each match with existing SkillRequest status.
- `sendSkillRequest`: creates request + immediately creates notification for recipient.

### `/server/src/controllers/internship.controller.js`
**Purpose:** Jooble API proxy with hardcoded mock fallback.

- Posts to `https://jooble.org/api/{KEY}` with keywords and filters.
- **On any error, returns 4 hardcoded "Google/Microsoft/Amazon/Netflix" mock listings** — users always see content.
- **Security issue:** API key hardcoded as fallback: `process.env.JOOBLE_API_KEY || "aa343263-..."`.

### `/server/src/controllers/user_subject.controller.js`
**Purpose:** Subject enrollment management.

- `enrollUserInSubject`: bulk create with `ignoreDuplicates: true` — safe for re-enrollment.
- `unenrollUserFromSubject`: **wraps `UserSubject.destroy` + `AttendanceRecord.destroy` in a single transaction** — atomic operation prevents orphaned attendance records.

### `/client/src/App.jsx`
**Purpose:** Root component with health-check gate and routing.

- First load (sessionStorage flag): pings `/api/users/health` with 3s timeout, 3 retries. Falls back to proceeding after 10s.
- Shows `LoadingScreen` until `dbConnected` AND Redux `authLoading` resolve.
- `/job-connect` is outside `ProtectedRoute` — accessible unauthenticated.

### `/client/src/store.js`
**Purpose:** Redux store with 10 combined reducers. No Redux Persist — auth re-hydrated from `/current` on each load.

### `/client/src/slices/authSlice.js`
**Purpose:** Auth lifecycle thunks and state.

- `checkAuthStatus`: GET `/users/current` with 3s AbortController timeout. Returns null on any error (never rejects).
- `handleSignIn`/`handleSignUp`: maps HTTP status codes to user-friendly messages.
- `handleLogout`: clears client state regardless of server response.
- State: `{ user, roles, isAuthenticated, loading, error, lastChecked, allUsers, loadingUsers, usersError }`.

### `/client/src/slices/ridesSlice.js`
**Purpose:** Rides async thunks — all check `getState().auth.isAuthenticated` before calling API.

### `/client/src/components/features/auth/ProtectedRoute.jsx`
**Purpose:** Route guard.

- Hardcodes admin access: `ADMIN_EMAIL = "keshav.bit12312015@iiitsonepat.ac.in"`. Frontend restricts `/admin` to this email. (Backend enforces `isAdmin` flag from JWT independently.)
- Redirects unauthenticated users to `/login` with `state: { from: location }` for post-login redirect.

### `/client/src/components/common/layout/NavBar.jsx`
**Purpose:** Global nav with animated notification bell.

- Fetches notifications when `isAuthenticated` changes.
- Click-outside detection via `useRef` + `mousedown` listener.
- Red dot badge when `unreadCount > 0`. "Mark all as read" dispatches `markAllNotificationsAsRead`.

---

## Architecture

**Pattern:** Layered monorepo (not microservices). Client is a pure SPA. Server is a traditional REST API with distinct layers: Routes → Middleware chain → Controllers → ORM (Sequelize) → PostgreSQL.

**Frontend:** React 18 SPA + Redux Toolkit (feature slices) + React Router v7. State is entirely ephemeral in memory; auth is re-hydrated from the cookie/API on each load.

**Backend:** Express.js with ESM modules. 9 route groups, each passing through relevant middleware before hitting controllers. Global middleware: CORS, JSON parser, cookie parser, performance timing. Per-route middleware: auth (JWT), admin check, email domain gate, profanity filter, multer.

**Auth:** JWT stored as HTTP-only cookie. 1-hour expiry. `sameSite: none` in production (needed for cross-origin cookie from Vercel → Render). Token payload: `{ id, email, isAdmin }`. No refresh token — users must re-login after 1 hour.

**DB:** PostgreSQL via Sequelize v6. 13 models with explicit associations. Dev uses `sync({ alter: true })`; production uses `authenticate()` only (no auto-migration).

**External services:** Cloudinary (media), Jooble (jobs/internships).

**Deployment:** Frontend on Vercel (SPA rewrite rule in `vercel.json`). Backend on Render. CORS explicitly lists both production domains.

---

## Notable Engineering Decisions

### 1. Pessimistic Row-Locking for Ride Seat Management
In `ride.controller.js:288-319`, `joinRide` uses `sequelize.transaction()` with `{ lock: t.LOCK.UPDATE }` on the `Rides` row. This is a pessimistic lock — any concurrent `joinRide` request must wait. This correctly handles the TOCTOU race condition where two users simultaneously check `availableSeats > 0` and both decrement. Without the lock, a ride with 1 seat could admit 2 passengers.

### 2. Dual-Layer Attendance Duplicate Prevention
`markAttendance` uses `AttendanceRecord.findOrCreate` (app-level) + a database unique constraint `user_subject_date_unique_attendance` on `[userId, subjectId, date]` (DB-level). The `SequelizeUniqueConstraintError` catch is the safety net for concurrent requests that race past `findOrCreate` — converting the constraint violation into a clean 409 instead of a 500.

### 3. Transactional Unenrollment with Cascading Attendance Deletion
In `user_subject.controller.js:115-149`, unenrollment wraps `UserSubject.destroy` + `AttendanceRecord.destroy` in a single transaction. Without this, a partial failure would leave orphaned attendance records for a subject the user no longer takes, breaking aggregate percentage calculations.

### 4. Graceful `/current` Endpoint — 200 Instead of 401
`auth.middleware.js:10-34` returns `HTTP 200 { user: null }` for the `/current` path when no token exists or it's expired. This prevents 401-on-load from triggering error toasts or redirect loops in the React app. `authSlice.js` treats `null` as "unauthenticated" gracefully.

### 5. In-Memory Performance Monitoring with Admin-Gated Metrics
The `PerformanceMetrics` class (singleton) tracks rolling 1000 requests with per-endpoint stats, exposed only at `GET /api/metrics` behind auth + admin. A PowerShell load-test script (`load-test.ps1`) hits 50 requests and reads the metrics endpoint — deliberate observability tooling without external APM dependencies.

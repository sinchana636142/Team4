# 🎬 StreamHub — OTT Video Streaming Website

## 🌟 Overview

**StreamHub** is a web-based **Over-The-Top (OTT) video streaming platform** that allows registered users to discover, stream, personalize, and subscribe to video content through a responsive website.

The system supports two primary roles:

- 👤 **Viewer** — registration, OTP verification, login, browsing, search, playback, resume, watch history, watchlist, ratings, and subscriptions.
- 🛠️ **Content Administrator** — upload/manage titles, publish/unpublish content, and view registered users and subscription status.

The project is intentionally scoped as a **single responsive website** suitable for an academic implementation.

> 🚀 **New here?** Jump to **Section 18 (Getting Started)** to run the project. Sprint progress is in **Section 19**, the code layout in **Section 20**, the working API in **Section 21**, the team's Git rules in **Section 22**, and known limitations in **Section 23**.

---

## 📚 Documentation at a Glance

| Document | Answers |
|---|---|
| 📘 **SRS — Software Requirements Specification** | **WHAT** must the system do? |
| 🏗️ **SAD — Software Architecture & Design Specification** | **HOW** will the system be structured and designed? |
| 🧪 **STP — Software Test Plan** | **HOW** will the system be verified? |

```text
                    ┌────────────────────┐
                    │       SRS          │
                    │    WHAT to build   │
                    └─────────┬──────────┘
                              ▼
                    ┌────────────────────┐
                    │       SAD          │
                    │    HOW to build    │
                    └─────────┬──────────┘
                              ▼
                    ┌────────────────────┐
                    │       STP          │
                    │   HOW to verify    │
                    └────────────────────┘
```

---

# 🎯 1. Project Objectives

StreamHub brings together:

- 🔐 Secure registration and authentication
- 🔎 Catalog browsing and title search
- ▶️ Browser-based video playback
- ⏯️ Resume playback and watch history
- ❤️ Personal watchlist
- ⭐ 1–5 star ratings
- 💳 Subscription plans and hosted payment checkout
- 🛠️ Content upload and publishing
- 👥 Basic user/subscription administration
- 📱 Responsive desktop/tablet usability
- 🛡️ Security-focused API and payment handling

---

# 👥 2. User Roles & Journeys

### 👤 Viewer

```text
Register → Verify OTP → Login
                     ↓
             Browse / Search
                     ↓
              Title Details
                     ↓
              Check Access
                ↙       ↘
        Watch Video    Subscribe
             ↓             ↓
       Resume/History   Hosted Payment
             ↘             ↙
          Watchlist + Rating
```

### 🛠️ Administrator

```text
Admin
  ↓
Upload Title + Metadata
  ↓
Publish / Unpublish
  ↓
Manage Catalog
  ↓
View Users & Subscription Status
```

---

# 🧩 3. Functional Modules

| Module | Capabilities |
|---|---|
| 🔐 Account, Authentication & Profile | Register + OTP, login, password reset, profile |
| 🔎 Catalog, Browse & Search | Genre browsing, search, title details |
| ▶️ Playback | Video playback, resume position, watch history |
| ❤️ Personalisation | Watchlist, 1–5 star rating |
| 💳 Subscription & Payment | Plans, hosted checkout, subscription status |
| 🛠️ Content Administration | Upload, publish/unpublish, user/subscription view |

---

# 🏗️ 4. Architecture

StreamHub uses a **layered 3-tier client–server architecture** implemented as a **modular monolith**.

```text
┌───────────────────────────────────────────────┐
│                    CLIENT                     │
│             React Single Page App             │
│ Browse | Search | Player | Watchlist | Admin │
└───────────────────────┬───────────────────────┘
                        │ REST / JSON
                        │ HTTPS / TLS 1.2+
                        ▼
┌───────────────────────────────────────────────┐
│                   BACKEND                     │
│                 FastAPI API                   │
│                                               │
│ Auth | Catalog | Playback | Subscription     │
│                     | Admin                   │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
               ┌─────────────────┐
               │   PostgreSQL    │
               └─────────────────┘
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
┌──────────────────┐       ┌────────────────────┐
│ Cloud / Static   │       │ External Services  │
│ Video + Images   │       │ Payment + Email    │
└──────────────────┘       └────────────────────┘
```

### Why this architecture?

The SAD chooses modular 3-tier architecture instead of microservices because the project is intended for a **single-team academic build at modest scale**. FastAPI modules provide separation of concerns without the complexity of service discovery, distributed transactions, and inter-service networking.

---

# 🛠️ 5. Technology Stack

| Layer | Technology |
|---|---|
| 🎨 Frontend | React SPA |
| ⚙️ Backend | FastAPI / Python |
| 🗄️ Database | PostgreSQL |
| 📦 Validation | Pydantic |
| 🔑 Authentication | Short-lived JWT |
| 🔒 Password Storage | Salted bcrypt |
| 🌐 Communication | REST / JSON over HTTPS |
| 🎥 Storage | Cloud / Static Storage |
| 💳 Payment | External hosted payment gateway |
| ✉️ Email | SMTP / Transactional Email |
| 📐 UML | draw.io |
| 📡 API Documentation | Swagger / OpenAPI |
| 🧪 UI/API Testing | Playwright / Selenium / Postman |
| ⚡ Performance | JMeter / Locust |
| 🐛 Defects | GitHub Issues / Jira |

---

# 🔐 6. Security Architecture

Security is built into the system design.

| Threat / Requirement | Protection |
|---|---|
| 🔑 Spoofing | JWT sessions + bcrypt passwords |
| 📝 Tampering | Pydantic validation + HTTPS |
| 🧾 Repudiation | Server-side transaction/payment-status logging |
| 👁️ Information Disclosure | TLS + no sensitive payment/password logging |
| 🚫 DoS | Authentication endpoint rate limiting |
| 👮 Privilege Escalation | Admin role checks |

### Critical payment rule

**Card/payment data never passes through or persists on the StreamHub server.**

The payment flow uses an external hosted checkout and a payment-status callback.

```text
Viewer
  ↓
Select Plan
  ↓
Subscription Service
  ↓
External Payment Gateway
  ↓
Payment Completed
  ↓
Callback
  ↓
Subscription Updated
  ↓
PostgreSQL
```

---

# ⚡ 7. Quality & Performance Targets

| ID | Target |
|---|---|
| ⚡ OTT-NF-001 | 95% of API requests respond within **2 seconds** |
| ▶️ OTT-NF-002 | Video starts within **5 seconds** on standard broadband |
| 📱 OTT-NF-003 | Responsive on desktop and tablet widths |
| 👥 OTT-NF-004 | At least **50 concurrent simulated users** without errors |
| 🧱 OTT-NF-005 | Clearly separated backend modules |
| 🟢 OTT-NF-006 | Available during scheduled demo/test windows |

---

# 📋 8. Functional Requirements

### Authentication
`OTT-F-001` Register + OTP  
`OTT-F-002` Login + JWT  
`OTT-F-003` Password reset  
`OTT-F-004` Profile management

### Catalog
`OTT-F-010` Browse by genre  
`OTT-F-011` Search titles  
`OTT-F-012` Title-detail page

### Playback
`OTT-F-020` HTML5 video playback  
`OTT-F-021` Resume last position  
`OTT-F-022` Watch history

### Personalisation
`OTT-F-030` Watchlist  
`OTT-F-031` 1–5 star rating

### Subscription
`OTT-F-040` At least two plans  
`OTT-F-041` Hosted payment checkout  
`OTT-F-042` Plan + renewal/expiry status

### Administration
`OTT-F-050` Upload title + metadata  
`OTT-F-051` Publish/unpublish  
`OTT-F-052` View users + subscription status

---

# 🧪 9. Test Strategy

The STP defines four testing levels:

```text
Unit Tests
    ↓
Integration Tests
    ↓
System / End-to-End Tests
    ↓
Acceptance / UAT
```

### Test Types

- ✅ Functional
- 🔄 Regression
- ⚡ Performance
- 🖥️ Usability
- 🔐 Security

### Test Environment

**Browsers:** Chrome, Edge, Firefox, Safari  
**Devices:** Desktop and tablet-width environments  
**Backend:** FastAPI  
**Database:** PostgreSQL  
**External services:** Payment sandbox + SMTP test account

### Test Tools

- Playwright / Selenium
- Postman
- JMeter / Locust
- GitHub Issues / Jira

---

# 🔗 10. Requirements Traceability

The three documents connect requirements, architecture, and testing.

| Requirement | Test Case |
|---|---|
| `OTT-F-001` Register with OTP | `TC-Auth-01` |
| `OTT-F-002` Login | `TC-Auth-02` |
| `OTT-F-020` Play Video | `TC-Play-01` |
| `OTT-F-021` Resume Playback | `TC-Play-02` |
| `OTT-F-041` Payment Checkout | `TC-Sub-02` |
| `OTT-NF-001` Response ≤ 2s | `TC-Perf-01` |

The SRS RTM currently records the listed requirements as **Not Started**, establishing the implementation/testing baseline.

### ✅ Implementation & test evidence (Sprint 1)

| Requirement | Test Case | Unit-test file (`backend/tests/playback_features/`) |
|---|---|---|
| `OTT-F-020` Play Video | `TC-Play-01` | `test_play_video.py` |
| `OTT-F-021` Resume Playback | `TC-Play-02` | `test_resume_playback.py` |
| `OTT-F-022` Watch History | `TC-Play-03` | `test_watch_history.py` |
| `OTT-F-030` Watchlist | `TC-Personal-01` | `test_watchlist.py` |
| `OTT-F-042` Subscription status | `TC-Sub-03` | `test_subscription_status.py` |

Module-level unit tests are written by the developer of each module. Integration, system, regression, performance and security testing are coordinated by the testing member.

---

# 🔌 11. Key API Interfaces

### Login

```http
POST /api/auth/login
```

```json
{
  "email": "...",
  "password": "..."
}
```

Response:

```json
{
  "token": "...",
  "expiresIn": "..."
}
```

### Subscription Checkout

```http
POST /api/subscription/checkout
```

```json
{
  "userId": "...",
  "planId": "..."
}
```

### Resume Playback

```http
GET /api/playback/{titleId}/resume
```

```json
{
  "positionSeconds": 0
}
```

> ℹ️ **Contract vs. implementation.** The block above is the interface defined in the SAD. The running backend differs slightly: it serves routes **without** the `/api` prefix (for example `/auth/login`), and field names use `snake_case` (for example `access_token`, `position_seconds`). The endpoints that actually exist today are listed in **Section 21**.

---

# 📐 12. Design Highlights

The architecture/design documentation contains:

- 🧩 Component architecture
- 🔄 UML sequence diagrams
- 👤 Register & Verify OTP sequence
- 💳 Subscribe & Pay sequence
- 🔌 API definitions
- 🛡️ STRIDE threat model
- 🎨 UX considerations
- 🔗 Requirement-to-component traceability

The SRS also includes a use-case overview connecting Viewer, Email Service, Payment Gateway, and Content Administrator.

---

# 🚧 13. Explicit Scope Boundaries

The following are **out of scope for this version**:

- ❌ Native mobile application
- ❌ Smart-TV application
- ❌ DRM-protected playback
- ❌ Full adaptive-bitrate transcoding pipeline
- ❌ Offline downloads
- ❌ Live linear TV
- ❌ Dedicated CDN
- ❌ Multi-region infrastructure
- ❌ Storing/processing card data on StreamHub's server

This keeps the system focused on a complete and testable **web-based OTT platform**.

---

# ⚠️ 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| 💳 Payment callback failure | Idempotent callback + reconciliation |
| 🎥 Storage/bandwidth limits | Fixed-quality progressive streams |
| 🗄️ Database bottleneck | Connection pooling + indexed queries |
| 🧪 Payment sandbox instability | Documented test cards + mock non-payment responses |
| ⏳ Tight academic timeline | Prioritize High-priority requirements |
| 🖥️ Backend/DB downtime | Backup environment on cloud VM |

---

# 📦 15. Project Deliverables

- 📘 Software Requirements Specification
- 🏗️ Software Architecture & Design Specification
- 🧪 Software Test Plan
- 📝 Test cases
- 💻 Test scripts
- 🗃️ Test data
- 📊 Execution logs
- 🐛 Defect reports
- 📑 Final Test Summary Report

---

# 🏁 16. Definition of Done

```text
High-priority requirements implemented
              +
Planned test cases executed
              +
Zero critical defects open
              +
RTM fully updated
              +
Acceptance / UAT completed
              ↓
        ✅ READY FOR SUBMISSION
```

---

# 🗺️ 17. Documentation Relationship

```text
                 ┌─────────────────┐
                 │      SRS        │
                 │ Requirements    │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │      SAD        │
                 │ Architecture   │
                 │ & Design        │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │      STP        │
                 │ Testing & QA    │
                 └────────┬────────┘
                          │
                          ▼
                    StreamHub
                    Deliverable
```

# 🚀 18. Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Python | 3.11 or newer (tested with 3.13) |
| Node.js | 20.19 or newer, or 22.12 or newer (required by Vite 8) |
| PostgreSQL | A recent version (tested with 16), with a database named `streamhub` |
| Git | any recent version |

### 1️⃣ Clone the repository

```bash
git clone https://github.com/sinchana636142/Team4.git
cd Team4
```

### 2️⃣ Backend setup

```bash
cd backend
python -m venv .venv

# activate it (pick the line for your system):
#   Windows Command Prompt:  .venv\Scripts\activate
#   Windows Git Bash:        source .venv/Scripts/activate
#   Mac / Linux:             source .venv/bin/activate

pip install -r requirements.txt
```

Create a file named **`backend/.env`**. It is git-ignored, so never commit it:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/streamhub
JWT_SECRET_KEY=replace-with-a-long-random-text-of-at-least-32-characters
OTP_DELIVERY_MODE=console
# Optional: set to false to let any logged-in user play videos without a subscription (demos only)
# REQUIRE_SUBSCRIPTION=false
```

| Variable | Meaning |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Secret used to sign login tokens. **Required**: login fails without it |
| `OTP_DELIVERY_MODE` | `console` prints OTP codes in the backend terminal (development only). Real email delivery is not configured yet |
| `REQUIRE_SUBSCRIPTION` | `true` (default) requires an active subscription to play a video |

Create the tables and start the API:

```bash
python -m app.init_db
uvicorn app.main:app --port 8001 --reload
```

- API: http://127.0.0.1:8001
- Interactive docs (Swagger): http://127.0.0.1:8001/docs
- Health check: http://127.0.0.1:8001/health

### 3️⃣ Frontend setup (second terminal)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The frontend talks to the backend at `http://127.0.0.1:8001`, and CORS allows only `localhost:5173` and `127.0.0.1:5173`.

### 4️⃣ Try it out

1. Click **Sign Up**, register, and read the **OTP code in the backend terminal** (console mode).
2. Log in. Once the Sprint 1 playback pull requests are merged, the navbar shows **Watchlist, History, My Subscription** and **Logout**.
3. Click ▶ on a movie to open the player.

> Playback needs a row in the `titles` table with a `video_url`, and an **active subscription** for the user. Until the catalog (upload) and payment features are merged, use the optional demo seed script below.

### 5️⃣ Demo data (optional, development only)

If `backend/seed_dev.py` is present:

```bash
cd backend
python seed_dev.py
```

It creates a verified demo user (`demo@example.com` / `Demo@12345`), the 14 homepage titles with a sample video, two plans, and an active subscription.

### 6️⃣ Run the tests

Unit tests use an in-memory database, so **PostgreSQL is not needed**:

```bash
cd backend
pip install pytest httpx
python -m pytest tests/playback_features
```

Expected result with all Sprint 1 playback and personalisation features merged: **32 passed**.

Performance (OTT-NF-001) load test with Locust:

```bash
cd backend
pip install locust
locust -f locustfile.py --host http://127.0.0.1:8001
```

### 7️⃣ Frontend checks

```bash
cd frontend
npm run lint
npm run build
```

---

# 📊 19. Sprint 1 Status & Work Distribution

### Work distribution

| Team member | Assigned issues | No. of issues | Story points |
|---|---|---|---|
| Member 1 — Frontend | #1, #2, #12, #20, #6, #11 | 6 | 16 |
| Member 2 — Backend | #4, #5, #7, #18, #22, #23 | 6 | 19 |
| Member 3 — Playback & Features | #3, #8, #9, #10, #14 | 5 | 17 |
| Member 4 — Testing & Integration | #13, #15, #16, #17, #19, #21 | 6 | 22 |

### Feature status

Legend: ✅ on `main` · 🟡 implemented on a feature branch, merge pending · ⬜ not on `main` yet

| Issue | Requirement | Feature | Status |
|---|---|---|---|
| #4 | `OTT-F-001` | Register with OTP verification | ✅ |
| #5 | `OTT-F-002` | Login with JWT | ✅ |
| — | `OTT-F-003` | Password reset with OTP | ✅ |
| #7 | `OTT-F-004` | Manage viewer profile | ✅ |
| #22 | `OTT-NF-005` | Modular backend structure | ✅ |
| #18 | `OTT-NF-001` | API response-time target | 🟡 Locust login load test on `main`; full run pending |
| #3 | `OTT-F-020` | Play videos | 🟡 `feature/issue-3-play-video` |
| #8 | `OTT-F-021` | Resume from last position | 🟡 `feature/issue-8-resume-playback` |
| #9 | `OTT-F-022` | Watch history | 🟡 `feature/issue-9-watch-history` |
| #10 | `OTT-F-030` | Watchlist | 🟡 `feature/issue-10-watchlist` |
| #14 | `OTT-F-042` | Subscription and expiry status | 🟡 `feature/issue-14-subscription-status` |
| #11 | `OTT-F-031` | 1–5 star ratings | ⬜ |
| #12 | `OTT-F-040` | Subscription plans | ⬜ |
| #13 | `OTT-F-041` | Hosted payment checkout | ⬜ |
| #15 | `OTT-F-050` | Upload titles and metadata | ⬜ |
| #16 | `OTT-F-051` | Publish / unpublish titles | ⬜ |
| #17 | `OTT-F-052` | View users and subscription status | ⬜ |
| #19 | `OTT-NF-002` | Video start-up time ≤ 5 s | ⬜ |
| #20 | `OTT-NF-003` | Desktop and tablet layouts | ⬜ |
| #21 | `OTT-NF-004` | 50 concurrent users | ⬜ |
| #23 | `OTT-NF-006` | Availability in demo/test windows | ⬜ |

> 📝 **Keep this table current.** When a pull request is merged, change its status to ✅. Issues #1, #2 and #6 are tracked on GitHub Issues and are not listed here.

---

# 🗂️ 20. Repository Structure

```text
Team4/
├── README.md
├── StreamHub_SRS.pdf               Requirements
├── StreamHub_SAD.pdf               Architecture & design
├── StreamHub_Test_Plan.pdf         Test plan
├── .github/workflows/blank.yml     CI: checks that README and the 3 documents exist
│
├── backend/                        FastAPI + SQLAlchemy + PostgreSQL
│   ├── requirements.txt
│   ├── locustfile.py               Load test (OTT-NF-001)
│   ├── seed_dev.py                 Optional demo data (development only)
│   ├── app/
│   │   ├── main.py                 App creation, CORS, router registration
│   │   ├── database.py             Engine, session, Base, get_db
│   │   ├── init_db.py              Creates all tables
│   │   ├── core/                   config.py (env settings), security.py (bcrypt, JWT)
│   │   ├── models/                 user, title, subscription (Plan, Subscription),
│   │   │                           playback (PlaybackProgress, WatchHistory), watchlist
│   │   ├── schemas/                Pydantic request/response models
│   │   ├── services/               Business logic (auth, otp, email, subscription,
│   │   │                           playback, resume, history)
│   │   └── routers/                auth, profile, catalog, playback,
│   │                               subscription, admin, watchlist
│   └── tests/
│       └── playback_features/      Unit tests (TC-Play-01..03, TC-Personal-01, TC-Sub-03)
│
└── frontend/                       React + Vite
    └── src/
        ├── App.jsx                 Home page and screen switching
        ├── Auth.jsx, Login.jsx, ForgotPassword.jsx
        └── features/
            ├── api.js              Shared fetch helper (adds the login token)
            ├── playback/           Player, resume, watch history
            ├── watchlist/          Watchlist button and screen
            └── subscription/       "My Subscription" screen
```

**How a request flows:** `router` (HTTP and validation) → `service` (business rules) → `model` (database tables). Keep new code in the same layers, and do not call the database directly from a router if a service exists.

---

# 🔌 21. Implemented API Endpoints

The backend currently has **no `/api` prefix**. Routes that need login expect the header `Authorization: Bearer <access_token>` and return `401` without it.

### Authentication & profile

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/auth/register` | Register and send an OTP |
| `POST` | `/auth/verify-otp` | Verify the registration OTP |
| `POST` | `/auth/login` | Returns `{access_token, token_type, user}` |
| `POST` | `/auth/forgot-password` | Start password reset |
| `POST` | `/auth/verify-reset-otp` | Verify the reset OTP |
| `POST` | `/auth/reset-password` | Set a new password |
| `GET` | `/auth/me` · `/profile/me` | Current user |
| `PATCH` | `/profile/me` | Update name / avatar |

### Playback, watchlist and subscription 🔒

| Method | Path | Purpose | Issue |
|---|---|---|---|
| `GET` | `/subscription/status` | Plan, price, status, expiry date | #14 |
| `GET` | `/playback/{title_id}` | Returns `{title_id, title, video_url}`; needs an active subscription (`403` otherwise) | #3 |
| `GET` | `/playback/{title_id}/resume` | `{position_seconds}` (0 if never watched) | #8 |
| `PUT` | `/playback/{title_id}/resume` | Save `{position_seconds}` (must be ≥ 0) | #8 |
| `POST` | `/playback/{title_id}/history` | Record a viewing session | #9 |
| `GET` | `/playback/history` | The user's history, newest first | #9 |
| `GET` | `/watchlist` | The user's watchlist | #10 |
| `POST` | `/watchlist/{title_id}` | Add a title (adding twice is harmless) | #10 |
| `DELETE` | `/watchlist/{title_id}` | Remove a title | #10 |

### Not implemented yet

`/catalog` and `/admin` are placeholders that only return a status message. Ratings, plans, payment checkout and admin upload are still to be built.

### Error format

Errors are JSON, for example `{"detail": "Title not found"}` with status `404`. Typical codes: `401` not logged in, `403` no active subscription, `404` not found, `422` invalid input.

### Data rules

- Every query for history, watchlist, resume position and subscription is **filtered by the logged-in user**, so users cannot see each other's data.
- Timestamps (such as `watched_at`) are stored in UTC and returned as ISO text ending in `Z`.
- Payment card data is never handled by StreamHub (see Section 6).

---

# 🤝 22. Team Git Workflow

1. **One branch per issue**, named `feature/issue-<number>-<short-name>`, for example `feature/issue-3-play-video`.
2. **Commit messages** follow `type(scope): what changed #issue`.
   - Types: `feat`, `test`, `fix`, `docs`, `chore`
   - Example: `feat(playback): record and list watch history (OTT-F-022) #9`
3. **Open a Pull Request into `main`.** The title ends with `(closes #<issue>)` so the issue closes when it merges.
4. **Every PR needs at least one review** before merging. Ask the owner of the affected area:
   - backend files (`models`, `routers`, `services`) → the Backend member
   - screens or `App.jsx` → the Frontend member
   - anything touching shared tables → also the Testing & Integration member
5. **Merge in dependency order.** Do not merge a PR that builds on another until the earlier one is merged. Prefer **"Create a merge commit"** over squash for stacked branches.
6. **Stacked branches:** if your issue depends on an unmerged one, branch from that issue's branch, otherwise branch from an up-to-date `main`.
7. **Conflicts in `App.jsx` and `models/__init__.py`** are expected, because several people add to them. Keep **both** sides.
8. **Shared tables:** `users`, `titles`, `plans`, `subscriptions` are shared. Extend the existing model, **never create a second table** for the same thing. Agree API contracts and table changes in the team chat first.
9. **Never commit** `.env`, passwords, tokens, `node_modules` or `__pycache__`.
10. **Before opening a PR:** the backend tests pass and `npm run build` succeeds.

---

# 🧭 23. Known Limitations & Next Steps

| Area | Current state | Next step |
|---|---|---|
| Catalog | The homepage shows 14 hard-coded movies in `App.jsx` | Build catalog endpoints and load titles from the database (`titles` table) |
| Titles | The `titles` table exists, but nothing uploads titles yet | Admin upload and publish/unpublish (#15, #16); extend `Title`, do not recreate it |
| Subscriptions | Nothing marks a subscription as `active` yet | Payment callback (#13) must set `status="active"`, `start_date`, `expiry_date` after a **verified** payment |
| Playback | Requires an active subscription (SRS use-case diagram: *Play Video includes Check Active Subscription*) | Until payment works, use `REQUIRE_SUBSCRIPTION=false` or the demo seed |
| Video | The backend returns a stored URL and the browser's HTML5 player streams it | Point `video_url` at cloud/static storage |
| OTP email | Console mode only | Configure real email delivery for production |
| API prefix | Routes have no `/api` prefix, unlike the SAD | Agree one convention in the team and update `app/main.py` and `frontend/src/features/api.js` |
| Frontend | Screen switching is state-based in `App.jsx`, with no router library | Consider React Router if the number of screens grows |
| Security | HTTPS and login rate limiting (SRS §6) are not set up in code | Configure at deployment and add rate limiting |

---

# ⭐ StreamHub in One Sentence

> **StreamHub is a secure, responsive, modular web-based OTT platform connecting content discovery, video playback, personalization, subscriptions, payment integration, and administration into one academically scoped and testable system.**

---

## 📖 Source Documents

This README consolidates the project's:

1. **Software Requirements Specification (SRS) v1.0**
2. **Software Architecture and Design Specification (SAD) v1.0**
3. **Software Test Plan (STP) v1.0**

> This README preserves the scope, terminology, architecture, requirements, and testing approach defined by those documents and does not assume implementation details that they do not specify.

---

### 🎬 StreamHub
**Discover. Watch. Personalize. Subscribe.**

**TEAM-04 · PES University · UE24CS341A Software Engineering**

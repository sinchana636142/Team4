# StreamHub OTT — Integration Test Report

**Document ID:** PES-UE24CS341A-ITR-001  
**Project:** StreamHub – Academic OTT Video Streaming Platform  
**University:** PES University · Department of Computer Science and Engineering  
**Course:** Software Engineering – UE24CS341A  
**Team:** TEAM-04  
**Role:** Member 4 – Testing & Integration (`vinu9686` / `pes1202503166@stu.pes.edu`)  
**Execution Date:** November 9, 2026  
**Status:** **INTEGRATION VERIFIED & PASSING**

---

## 1. Objective & Scope

Integration testing verifies that separate architectural modules and subsystem boundaries interoperate correctly according to the system specification.

This report evaluates four major integration boundaries:
1. **Frontend (React 19 / Vite) ↔ Backend (FastAPI)**
2. **Backend (FastAPI / SQLAlchemy 2.0) ↔ Database (PostgreSQL / SQLite)**
3. **Backend ↔ Razorpay Hosted Payment Gateway (Sandbox API & Webhook)**
4. **Backend ↔ OTP / SMTP Email Dispatch Service**

---

## 2. Integration Boundary Evaluation

### 2.1 Frontend ↔ Backend Integration
- **Protocol:** HTTP/1.1 REST JSON over localhost
- **Authentication Handshake:** JWT Bearer Token in `Authorization` header (`Bearer <access_token>`).
- **CORS Configuration:** `FastAPI CORSMiddleware` configured to allow `http://localhost:5173` and `http://127.0.0.1:5173`.
- **API Client:** Shared API helper in `frontend/src/features/api.js` automatically injects stored JWT tokens into outbound requests.
- **Verification Outcomes:**
  - `POST /auth/login` returns `{access_token, token_type, user}`; frontend stores token in `localStorage`.
  - Protected endpoints (`/subscription/status`, `/playback/{id}`, `/watchlist`, `/profile/me`) accept token and return authorized payload.
  - Expired or missing tokens trigger automatic HTTP 401 response and redirect to login.

### 2.2 Backend ↔ PostgreSQL Database Integration
- **Driver:** `psycopg` (v3 binary) via SQLAlchemy 2.0 ORM.
- **Connection Management:** Scoped sessions via `get_db` FastAPI dependency with automatic commit/rollback and connection closing.
- **Schema Initialization:** `backend/app/init_db.py` creates tables (`users`, `titles`, `plans`, `subscriptions`, `payments`, `webhook_events`, `user_devices`, `playback_progress`, `watch_history`, `watchlist`, `ratings`).
- **Verification Outcomes:**
  - Automated database migration script `backend/migrate_db.py` executes without errors.
  - Foreign key constraints properly cascade or protect relationships (e.g., `user_id` on subscriptions, payments, and history).
  - Transaction isolation ensures pending payments do not prematurely grant viewer access until verified.

### 2.3 Backend ↔ Razorpay Sandbox Gateway Integration
- **Integration Mode:** Razorpay Standard Hosted Checkout (Sandbox mode `rzp_test_*`).
- **Checkout Flow:**
  1. Frontend calls `POST /subscription/checkout` with `plan_id`.
  2. Backend validates plan price from DB (Basic ₹199, Premium ₹499) and invokes Razorpay Orders API (`client.order.create`).
  3. Razorpay returns signed `order_id` (e.g. `order_TwASe0s475uIUh`).
  4. Backend creates `Subscription` (`status="pending"`) and `Payment` (`status="pending"`).
  5. Frontend opens Razorpay Checkout modal; upon successful user transaction, returns `razorpay_payment_id` and `razorpay_signature`.
  6. Frontend submits details to `POST /subscription/verify-payment`.
  7. Backend computes expected HMAC-SHA256 signature using `RAZORPAY_KEY_SECRET` and verifies with `hmac.compare_digest`.
  8. Upon match, subscription is activated for 30 days and payment record marked `captured`.
- **Webhook Integration:**
  - Asynchronous webhook endpoint `POST /subscription/webhook` verifies `X-Razorpay-Signature`.
  - Idempotency is enforced using `WebhookEvent` table (`event_id` unique constraint); repeated deliveries return HTTP 200 `already_processed` without double-extending subscriptions.

### 2.4 Backend ↔ OTP / SMTP Email Dispatch Service
- **Modes Supported:**
  - `console`: Prints OTP to backend stdout (used in local development and test automation).
  - `smtp`: Configured for real SMTP transmission when `SMTP_SERVER` is provided.
- **Verification Outcomes:**
  - Test suite exercises OTP generation, expiration (10 minutes), single-use invalidation, and resend rate limiting.
  - No external SMTP failure can block local development when running in `console` delivery mode.

---

## 3. Mocked vs Live Gateway Integrations

| Subsystem | Test Mode | Real Gateway Available? | Verification Method |
|---|---|---|---|
| **Database** | Live PostgreSQL in Dev / In-Memory in Pytest | Yes (PostgreSQL running on 5432) | Pytest automated test suite + migration script |
| **Razorpay Checkout** | Live Sandbox Keys + Mock Fallback for CI | Yes (`rzp_test_Tt0LPqtqv1nvqa`) | Pytest integration tests + sandbox order validation |
| **Razorpay Webhooks** | Simulated HMAC Signatures | N/A (local dev requires tunnel) | Cryptographic signature verification tests |
| **SMTP Service** | Console Mode | No external provider configured | Console log verification & unit tests |

---

## 4. Conclusion

All four major subsystem integration boundaries function reliably. Cross-layer data contracts between React, FastAPI, SQLAlchemy, and Razorpay are strictly validated and protected by automated regression suites.

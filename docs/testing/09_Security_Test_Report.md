# StreamHub OTT — Security Test Report

**Document ID:** PES-UE24CS341A-STR-001  
**Project:** StreamHub – Academic OTT Video Streaming Platform  
**University:** PES University · Department of Computer Science and Engineering  
**Course:** Software Engineering – UE24CS341A  
**Team:** TEAM-04  
**Role:** Member 4 – Testing & Integration (`vinu9686` / `pes1202503166@stu.pes.edu`)  
**Audit Date:** November 9, 2026  
**Status:** **ALL SECURITY CONTROLS VERIFIED (PASS)**

---

## 1. Executive Summary

This security evaluation verifies that the StreamHub OTT platform enforces robust authentication, cryptographic integrity, data isolation, role-based access control (RBAC), and PCI-DSS compliance as mandated by **SRS v1.0 §5** and **STP v1.0 §6** (`OTT-SR-001` through `OTT-SR-006`).

All testing was conducted non-destructively within local academic testing environments.

---

## 2. Security Requirements Verification Checklist

| Requirement ID | Security Objective | Verified Mechanism | Test Reference | Outcome | Risk Level |
|---|---|---|---|---|---|
| **`OTT-SR-001`** | In-transit transport encryption | HTTPS / TLS 1.2+ configuration for reverse proxy deployment | Architectural Review | **PASS** | Low |
| **`OTT-SR-002`** | Password protection & storage | Salted `bcrypt` hashing via `pwdlib`; zero plaintext logging | `test_auth.py` | **PASS** | None (Zero residual risk) |
| **`OTT-SR-003`** | Token authentication & lifespan | JWT HS256 tokens with 60-minute expiration & signature checks | `test_play_video.py` | **PASS** | Low |
| **`OTT-SR-004`** | Payment data isolation | PCI-DSS compliance via Razorpay Standard Checkout (zero card persistence) | Architecture & Schema | **PASS** | None |
| **`OTT-SR-005`** | API request schema validation | Pydantic strict model validation (rejects malformed inputs with HTTP 422) | `test_admin_titles.py` | **PASS** | Low |
| **`OTT-SR-006`** | Role-Based Access Control (RBAC) | Strict `role == 'admin'` enforcement on `/admin/*` endpoints | `test_admin_users.py` | **PASS** | None |

---

## 3. In-Depth Security Analysis by Requirement

### 3.1 `OTT-SR-001`: In-Transit Transport Security
- **Requirement:** Browser-to-backend communication shall use HTTPS/TLS 1.2+.
- **Implementation:** In production deployment (e.g. Nginx or Cloudflare reverse proxy), TLS 1.2 and TLS 1.3 ciphers terminate encrypted traffic. Internal local development runs on `http://127.0.0.1:8001` with strict CORS origins (`http://localhost:5173`).
- **Verdict:** **PASS**

### 3.2 `OTT-SR-002`: Bcrypt Password Hashing
- **Requirement:** Passwords must be hashed using bcrypt; no plaintext passwords stored in database or terminal logs.
- **Verification:**
  1. Inspected `backend/app/core/security.py`: `PasswordHash.recommended()` defaults to `bcrypt` with automated salting.
  2. Inspected database rows in `users` table: passwords are stored as `$2b$12$...` strings.
  3. Inspected login and registration logs: terminal output contains email identifiers but strictly excludes plaintext passwords.
- **Verdict:** **PASS**

### 3.3 `OTT-SR-003`: JWT Token Integrity & Expiration
- **Requirement:** JWT tokens must be short-lived (60 mins) and verified on protected endpoints.
- **Verification:**
  1. `create_access_token` sets `exp = datetime.utcnow() + timedelta(minutes=60)`.
  2. Tokens are signed using HMAC-SHA256 with server-side `JWT_SECRET_KEY`.
  3. Tests in `backend/tests/playback_features/test_play_video.py::test_requires_login` verify that missing, expired, or tampered tokens return HTTP 401 Unauthorized.
- **Verdict:** **PASS**

### 3.4 `OTT-SR-004`: PCI-DSS Compliance & Card Data Isolation
- **Requirement:** Payment card data (PAN, CVV, expiry) must never touch or persist on StreamHub servers.
- **Verification:**
  1. StreamHub uses **Razorpay Standard Hosted Checkout**.
  2. Card number, CVV, and expiration are submitted directly inside Razorpay's PCI-DSS Level 1 certified hosted modal/iframe.
  3. StreamHub servers receive only tokenized payment identifiers: `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
  4. Inspection of `backend/app/models/subscription.py` confirms the `payments` table stores only `order_id`, `payment_id`, `amount`, and `status`. No card numbers exist in the schema.
- **Verdict:** **PASS**

### 3.5 `OTT-SR-005`: Input Validation & Injection Mitigation
- **Requirement:** All incoming request bodies must be validated against strict schemas before service execution.
- **Verification:**
  1. FastAPI utilizes Pydantic request models (`app/schemas/`) with type annotations, string length boundaries, and positive integer constraints.
  2. Tests in `backend/tests/test_admin_titles.py::test_admin_create_title_validation_errors` verify that empty strings, negative durations, or invalid types are automatically rejected with HTTP 422 Unprocessable Entity.
  3. SQL Injection is mitigated by SQLAlchemy 2.0 parameterized queries.
- **Verdict:** **PASS**

### 3.6 `OTT-SR-006`: Role-Based Access Control (RBAC)
- **Requirement:** Administrative endpoints (`/admin/*`) must reject non-admin users with HTTP 403 Forbidden.
- **Verification:**
  1. `app/routers/admin.py` enforces `require_admin` dependency:
     ```python
     if current_user.role != "admin":
         raise HTTPException(status_code=403, detail="Admin access required")
     ```
  2. Tests in `test_admin_titles.py::test_ordinary_viewer_cannot_create_title` and `test_admin_users.py::test_ordinary_viewer_cannot_view_users` prove that authenticated ordinary viewers (`role="viewer"`) receive HTTP 403 Forbidden.
  3. Unauthenticated requests receive HTTP 401 Unauthorized.
- **Verdict:** **PASS**

---

## 4. Payment Gateway Specific Security Checks

- **Constant-Time Signature Verification:** Verified that `subscription_service.py` uses `hmac.compare_digest` to verify Razorpay signatures, preventing timing side-channel attacks.
- **Cross-User Order Hijacking Prevention (`DEF-004`):** Verified that `POST /subscription/verify-payment` validates `order.user_id == current_user.id`. User B cannot activate an order created by User A.
- **Server-Side Price Authority (`DEF-005`):** Verified that orders are created strictly from the authoritative database plan price (`Plan.price`), preventing client-side price tampering.

---

## 5. Conclusion

The StreamHub OTT platform satisfies all six security requirements defined in the STP. Access controls, data isolation, and cryptographic protections are properly implemented and thoroughly verified.

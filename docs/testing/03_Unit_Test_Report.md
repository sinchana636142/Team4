# StreamHub OTT — Unit Test Execution Report

**Document ID:** PES-UE24CS341A-UTR-001  
**Project:** StreamHub – Academic OTT Video Streaming Platform  
**University:** PES University · Department of Computer Science and Engineering  
**Course:** Software Engineering – UE24CS341A  
**Team:** TEAM-04  
**Role:** Member 4 – Testing & Integration (`vinu9686` / `pes1202503166@stu.pes.edu`)  
**Execution Date:** November 9, 2026  
**Status:** **100% PASSED (80/80 PASSED, 0 FAILED)**

---

## 1. Test Objectives & Scope

The primary objective of the unit testing phase is to verify the correctness, error handling, boundary validation, and security isolation of isolated software components across the StreamHub FastAPI backend. 

Unit tests utilize an isolated, in-memory SQLite database (`sqlite://`) with an independent connection pool (`StaticPool`), ensuring zero dependencies on external network services or a persistent PostgreSQL instance.

---

## 2. Test Environment

| Component | Specification |
|---|---|
| **Operating System** | Windows 11 Enterprise (win32) |
| **Python Environment** | Python 3.11.9 (64-bit) |
| **Test Framework** | Pytest 9.2.0 |
| **Plugins** | `pytest-cov 7.1.0`, `pytest-html 4.2.0`, `pytest-metadata 3.1.1`, `anyio 4.16.0` |
| **Database** | SQLite In-Memory (`sqlite://`) via SQLAlchemy 2.0 ORM |
| **HTTP Test Client** | Starlette / FastAPI `TestClient` (based on `httpx`) |

---

## 3. Test Execution Command

```bash
cd backend
python -m pytest tests -v --cov=app --cov-branch --cov-report=term-missing --cov-report=html:../docs/testing/06_Code_Coverage_Report --cov-report=json:../docs/testing/06_Code_Coverage_Report/coverage.json --html=../docs/testing/evidence/pytest-report.html --self-contained-html --junitxml=../docs/testing/evidence/junit-results.xml
```

---

## 4. Test Execution Summary

| Module Under Test | Test Suite File | Test Count | Passed | Failed | Skipped | Pass Rate |
|---|---|---|---|---|---|---|
| **Video Playback Access** | `tests/playback_features/test_play_video.py` | 6 | 6 | 0 | 0 | 100% |
| **Resume Position** | `tests/playback_features/test_resume_playback.py` | 7 | 7 | 0 | 0 | 100% |
| **Subscription Status** | `tests/playback_features/test_subscription_status.py` | 6 | 6 | 0 | 0 | 100% |
| **Watch History** | `tests/playback_features/test_watch_history.py` | 9 | 9 | 0 | 0 | 100% |
| **Personal Watchlist** | `tests/playback_features/test_watchlist.py` | 7 | 7 | 0 | 0 | 100% |
| **Admin Titles** | `tests/test_admin_titles.py` | 8 | 8 | 0 | 0 | 100% |
| **Admin Users** | `tests/test_admin_users.py` | 5 | 5 | 0 | 0 | 100% |
| **Authentication & OTP** | `tests/test_auth.py` | 11 | 11 | 0 | 0 | 100% |
| **Razorpay Checkout** | `tests/test_payment_checkout.py` | 9 | 9 | 0 | 0 | 100% |
| **Subscription Lifecycle** | `tests/test_subscription_lifecycle.py` | 12 | 12 | 0 | 0 | 100% |
| **TOTAL** | **10 Test Suites** | **80** | **80** | **0** | **0** | **100%** |

**Execution Duration:** 8.76 seconds  
**Total Failures:** 0  
**Total Errors:** 0  

---

## 5. Detailed Test Suite Breakdown

### 5.1 Authentication Suite (`test_auth.py`)
- `test_registration_creates_unverified_user`: Confirms new user row is created with `is_verified=False` and OTP code is dispatched.
- `test_duplicate_verified_email_registration_rejected`: Confirms attempt to register already verified email returns HTTP 400.
- `test_duplicate_unverified_email_registration_refreshes_otp`: Confirms re-registration of unverified email refreshes OTP without creating duplicate DB records.
- `test_verify_otp_success`: Confirms valid OTP verifies account and activates user.
- `test_verify_otp_invalid_code_rejected`: Confirms incorrect 6-digit OTP returns HTTP 400.
- `test_verify_otp_expired_code_rejected`: Confirms expired OTP codes are strictly rejected.
- `test_resend_otp_success`: Confirms OTP resend works and updates expiration window.
- `test_resend_otp_for_verified_user_rejected`: Confirms already verified users cannot request new registration OTPs.
- `test_login_blocked_before_verification`: Confirms unverified accounts cannot receive JWT login tokens (HTTP 400).
- `test_login_succeeds_after_verification`: Confirms verified accounts receive valid JWT token with user details.

### 5.2 Playback & Personalisation Suite (`playback_features/`)
- `test_play_video.py` (6 tests): Validates active subscribers receive stream URL, non-subscribers receive HTTP 403, unpublished titles return HTTP 404, and unauthenticated requests return HTTP 401.
- `test_resume_playback.py` (7 tests): Validates resume position starts at 0s, updates correctly, isolates per-user positions, and rejects negative values.
- `test_watch_history.py` (9 tests): Validates viewing session logging, newest-first ordering, single-entry deletion, clear history, and user isolation.
- `test_watchlist.py` (7 tests): Validates addition, duplicate suppression, removal, user isolation, and unknown title rejection.

### 5.3 Administration Suite (`test_admin_titles.py` & `test_admin_users.py`)
- Admin title creation with metadata, validation error rejection, RBAC viewer blocking, publish/unpublish toggle, and public catalog exclusion.
- Admin user listing with subscription status, credential masking (`password_hash` omitted), search filtering, and pagination.

### 5.4 Razorpay & Subscription Lifecycle (`test_payment_checkout.py` & `test_subscription_lifecycle.py`)
- Pricing consistency (Basic ₹199, Premium ₹499), order amount calculation in paise, signature verification via constant-time HMAC-SHA256, cross-user hijacking prevention, webhook idempotency, Free 2-minute preview, Basic 1080p single device limit, and Premium 4K support.

---

## 6. Evidence References

- **Full Pytest Execution Log:** [`docs/testing/evidence/pytest.log`](evidence/pytest.log)
- **Interactive HTML Test Report:** [`docs/testing/evidence/pytest-report.html`](evidence/pytest-report.html)
- **JUnit XML Test Results:** [`docs/testing/evidence/junit-results.xml`](evidence/junit-results.xml)
- **Coverage JSON:** [`docs/testing/06_Code_Coverage_Report/coverage.json`](06_Code_Coverage_Report/coverage.json)

---

## 7. Conclusion

All 80 unit test cases executed cleanly with zero failures or errors. Component-level behavior, input validation, and security boundaries meet the requirements of the Software Test Plan.

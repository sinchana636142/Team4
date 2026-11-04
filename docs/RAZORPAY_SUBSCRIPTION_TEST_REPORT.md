# StreamHub OTT – Razorpay Subscription & Access Control Test Report

**Date of Execution:** November 4, 2026  
**Environment:** Razorpay Test Mode (Sandbox)  
**Database:** PostgreSQL (`streamhub`)  
**Backend:** FastAPI / SQLAlchemy 2.0 / Uvicorn (Port 8001)  
**Frontend:** React 18 / Vite (Port 5173)  
**Test Suite:** Pytest (80/80 tests passing, 100% pass rate)

---

## 1. Executive Summary

This test report documents the validation and verification of the complete subscription, payment, webhook idempotency, and video access control system for StreamHub OTT.

All three subscription tiers are strictly enforced:
- **Free Viewer (₹0):** Trailer access and 2-minute (120-second) preview access across all titles. Full movie/web-series streaming blocked by backend authorization (HTTP 403).
- **Basic Member (₹199 / 19900 paise per month):** Full movie/series streaming up to 1080p Full HD, strictly enforced 1 registered device limit. 4K streaming requests rejected by backend authorization (HTTP 403).
- **Premium Member (₹499 / 49900 paise per month):** Full movie/series streaming up to 4K Ultra HD where supported, honest fallback to 1080p if the title only supports 1080p, up to 4 registered devices, ad-free viewing.
- **Administrator Role:** Independent of subscription status. Receives unrestricted 4K access and full administration rights.

---

## 2. Test Execution Matrix

| # | Test Scenario | Category | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-01** | Basic Plan Pricing & Order Creation | Order Creation | Razorpay order for ₹199 (19900 paise), currency INR, associated with user & plan | Created order `order_TwASe0s475uIUh` with amount 19900 paise | **PASS** |
| **TC-02** | Premium Plan Pricing & Order Creation | Order Creation | Razorpay order for ₹499 (49900 paise), currency INR, associated with user & plan | Created order `order_TwASqsQzCrccYJ` with amount 49900 paise | **PASS** |
| **TC-03** | Invalid Plan Rejection | Order Creation | Requesting non-existent plan ID returns HTTP 400/404 | Returned HTTP 404 "Plan not found" | **PASS** |
| **TC-04** | Valid Payment Signature Verification | Signature Validation | Constant-time HMAC-SHA256 signature verification succeeds, activates subscription for 30 days | Verified successfully, subscription activated, `verified_at` recorded | **PASS** |
| **TC-05** | Invalid Payment Signature Rejection | Signature Validation | Tampered or fake signature rejected with HTTP 400 | Returned HTTP 400 "Invalid payment signature" | **PASS** |
| **TC-06** | Cross-User Order Tampering Protection | Security & Ownership | User B cannot verify or activate an order created by User A | Returned HTTP 403 "Order does not belong to the current user" | **PASS** |
| **TC-07** | Database Payment History Tracking | Data Persistence | Payment record persisted in `payments` table with correct amount, currency, status, order_id | `Payment` record stored with status `captured`, amount in paise | **PASS** |
| **TC-08** | Webhook `payment.captured` Activation | Webhook Processing | Webhook HMAC signature verified; activates pending subscription, sets 30-day expiry | Subscription activated, status set to `active`, expiry set +30 days | **PASS** |
| **TC-09** | Webhook Idempotency (Duplicate Prevention) | Idempotency | Duplicate event with same `X-Razorpay-Event-Id` returns already processed without double-extending | Returned `already_processed`, expiry unchanged, no duplicate payment rows | **PASS** |
| **TC-10** | Webhook `payment.failed` Handling | Webhook Processing | Stores failed payment record with failure reason; subscription remains non-active | Payment status set to `failed`, user remains on Free tier | **PASS** |
| **TC-11** | Free Viewer Trailer Playback | Access Control | Free viewer can stream complete HD trailer | Returned trailer URL with `access_level: "free"` | **PASS** |
| **TC-12** | Free Viewer 2-Minute Preview Playback | Access Control | Free viewer receives preview URL capped at 120s (`preview_duration: 120`) | Preview URL delivered with `is_preview: true`, `preview_duration: 120` | **PASS** |
| **TC-13** | Free Viewer Full Movie Block | Access Control | Free viewer requesting full movie URL receives HTTP 403 | Returned HTTP 403 "Active subscription required" | **PASS** |
| **TC-14** | Basic Member 1080p Playback | Quality Enforcement | Basic member streams full movie at 1080p | Returned 1080p stream URL with HTTP 200 | **PASS** |
| **TC-15** | Basic Member 4K Rejection | Quality Enforcement | Basic member requesting 4K quality receives HTTP 403 | Returned HTTP 403 "4K Ultra HD streaming requires a Premium subscription" | **PASS** |
| **TC-16** | Basic Member 1-Device Limit | Device Limiting | Registering 2nd active device on Basic tier returns HTTP 403 | 1st device allowed; 2nd device rejected with HTTP 403 "Device limit exceeded" | **PASS** |
| **TC-17** | Premium Member 4K Streaming | Quality Enforcement | Premium member receives 4K stream on titles supporting 4K | Returned 4K video stream URL with `actual_quality: "4k"` | **PASS** |
| **TC-18** | Premium Member Honest 1080p Fallback | Quality Enforcement | Premium member on 1080p-only title receives honest 1080p fallback | Returned 1080p stream URL with `actual_quality: "1080p"` (no false 4K) | **PASS** |
| **TC-19** | Expired Subscription Enforcement | Expiry Enforcement | User with past expiry date cannot stream full movie; preview remains available | Full stream returns HTTP 403; trailer/preview return HTTP 200 | **PASS** |
| **TC-20** | Admin Dashboard Subscription View | Admin Management | Admin user can inspect users, membership tier, payment amount, and status | Users table displays `Role`, `Membership`, `Status`, `Last Payment` | **PASS** |

---

## 3. Detailed Test Scenarios & Evidence

### Test Scenario 1: Razorpay Order Creation via Sandbox API
- **Endpoint:** `POST /subscription/checkout`
- **Request Body:**
  ```json
  { "plan_id": 1 }
  ```
- **Live Razorpay Response:**
  ```json
  {
    "order_id": "order_TwASe0s475uIUh",
    "amount": 19900,
    "currency": "INR",
    "key_id": "rzp_test_Tt0LPqtqv1nvqa",
    "plan_name": "Basic",
    "plan_id": 1
  }
  ```
- **Database Verification:**
  - `subscriptions` table row created with `status="pending"`, `razorpay_order_id="order_TwASe0s475uIUh"`.
  - `payments` table row created with `amount=19900`, `currency="INR"`, `status="pending"`.
- **Verdict:** **PASS**

---

### Test Scenario 2: Signature Validation & Constant-Time Verification
- **Input:**
  - `order_id`: `order_TwASe0s475uIUh`
  - `payment_id`: `pay_test_succ_123`
  - Expected HMAC: `hmac.new(key_secret, "order_TwASe0s475uIUh|pay_test_succ_123", sha256).hexdigest()`
- **Valid Signature:** Matches constant-time comparison `hmac.compare_digest`.
- **Tampered Signature:** Any altered character triggers immediate HTTP 400 rejection:
  ```json
  { "detail": "Invalid payment signature." }
  ```
- **Verdict:** **PASS**

---

### Test Scenario 3: Webhook Idempotency & Duplicate Event Prevention
- **Event ID:** `evt_premium_capture_1001`
- **First Delivery:**
  - HTTP 200 returned: `{"status": "processed", "processed": true}`
  - Subscription status updated to `active`
  - Expiry set to `today + 30 days`
  - `webhook_events` record inserted with `processing_status="processed"`
- **Duplicate Delivery:**
  - HTTP 200 returned: `{"status": "already_processed", "processed": true}`
  - Expiry date remained exactly the same (no double extension)
  - `payments` table contains exactly 1 captured record
- **Verdict:** **PASS**

---

### Test Scenario 4: Video Access Control (Free vs. Basic vs. Premium)
1. **Free Viewer (`can_watch_full: false`):**
   - Full Video: `GET /playback/1` -> `HTTP 403 Forbidden` (`{"detail": "Active subscription required"}`)
   - Trailer: `GET /playback/1/trailer` -> `HTTP 200 OK` (Streams full HD trailer)
   - 2-Min Preview: `GET /playback/1/preview` -> `HTTP 200 OK` (`is_preview: true`, `preview_duration: 120`)
2. **Basic Member (`can_watch_full: true`, `max_quality: "1080p"`, `device_limit: 1`):**
   - 1080p Video: `GET /playback/1?quality=1080p` -> `HTTP 200 OK`
   - 4K Video: `GET /playback/1?quality=4k` -> `HTTP 403 Forbidden` (`{"detail": "4K Ultra HD streaming requires a Premium subscription (₹499/month). Your Basic plan supports up to 1080p Full HD."}`)
   - Device Limit: Device 1 allowed (`HTTP 200`); Device 2 rejected (`HTTP 403 "Device limit exceeded"`)
3. **Premium Member (`can_watch_full: true`, `max_quality: "4k"`, `device_limit: 4`):**
   - 4K Video on 4K Title: `GET /playback/1?quality=4k` -> `HTTP 200 OK` (`actual_quality: "4k"`)
   - 4K Video on 1080p Title: `GET /playback/2?quality=4k` -> `HTTP 200 OK` (`actual_quality: "1080p"` honest fallback)
   - Device Limit: Devices 1 to 4 allowed; Device 5 rejected (`HTTP 403`)
- **Verdict:** **PASS**

---

## 4. Test Suite Execution Output

```text
============================= test session starts =============================
platform win32 -- Python 3.11.9, pytest-9.2.0, pluggy-1.7.0
rootdir: C:\Users\vinod\OneDrive\Desktop\monohar'\sekofedshufcjw
plugins: anyio-4.16.0
collected 80 items

backend\tests\playback_features\test_play_video.py ......                [  7%]
backend\tests\playback_features\test_resume_playback.py .......          [ 16%]
backend\tests\playback_features\test_subscription_status.py ......       [ 23%]
backend\tests\playback_features\test_watch_history.py .........          [ 35%]
backend\tests\playback_features\test_watchlist.py .......                [ 43%]
backend\tests\test_admin_titles.py ........                              [ 53%]
backend\tests\test_admin_users.py .....                                  [ 60%]
backend\tests\test_auth.py ...........                                   [ 73%]
backend\tests\test_payment_checkout.py .........                         [ 85%]
backend\tests\test_subscription_lifecycle.py ............                [100%]

======================== 80 passed, 1 warning in 6.49s ========================
```

---

## 5. Frontend Build & Linter Verification

```text
> frontend@0.0.0 build
> vite build
✓ 72 modules transformed.
dist/index.html                   0.47 kB │ gzip:  0.30 kB
dist/assets/index-fejSuuxQ.css   69.36 kB │ gzip: 13.44 kB
dist/assets/index-BQywepOA.js   340.73 kB │ gzip: 99.70 kB
✓ built in 197ms
```

**Linter Status:** 0 errors, 1 pre-existing warning (`selectedProfile` in `App.jsx`).

---

## 6. Conclusion

The StreamHub subscription, Razorpay payment verification, webhook idempotency, and tier-based video access control mechanisms meet all functional and security requirements.


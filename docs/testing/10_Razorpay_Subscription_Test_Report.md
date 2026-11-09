# StreamHub OTT — Razorpay Subscription & Access Control Test Report

**Document ID:** PES-UE24CS341A-RSTR-001  
**Project:** StreamHub – Academic OTT Video Streaming Platform  
**University:** PES University · Department of Computer Science and Engineering  
**Course:** Software Engineering – UE24CS341A  
**Team:** TEAM-04  
**Role:** Member 4 – Testing & Integration (`vinu9686` / `pes1202503166@stu.pes.edu`)  
**Execution Date:** November 9, 2026  
**Environment:** Razorpay Test Mode (Sandbox API)  
**Database:** PostgreSQL (`streamhub`) / SQLite In-Memory  
**Test Suite:** `backend/tests/test_payment_checkout.py` & `test_subscription_lifecycle.py` (21 tests, 100% Pass)

---

## 1. Executive Summary

This report documents the validation of the complete hosted payment checkout lifecycle, Razorpay signature verification, webhook idempotency, and tier-based video access control for the StreamHub OTT platform (Sprint 1 & Sprint 2 Member 4 deliverables — Issue #13, 22 Story Points).

The three-tier membership model is strictly enforced by server-side authorization:
- **Free Viewer (₹0):** Complete trailer access and first 2-minute (120-second) preview access across all titles. Full movie streaming is blocked by backend authorization (HTTP 403 Forbidden).
- **Basic Member (₹199 / 19,900 paise per month):** Full movie/series streaming capped at 1080p Full HD; maximum 1 registered device. 4K streaming requests are rejected by backend authorization (HTTP 403 Forbidden).
- **Premium Member (₹499 / 49,900 paise per month):** Full movie/series streaming up to 4K Ultra HD where supported; honest fallback to 1080p if the title only supports 1080p; up to 4 registered devices; ad-free viewing.
- **Administrator Role:** Completely independent of subscription status. Receives unrestricted 4K streaming access and full catalog/user administration privileges.

---

## 2. Test Execution Matrix (20 Test Scenarios)

| # | Test Scenario | Category | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-01** | Basic Plan Pricing & Order Creation | Order Creation | Razorpay order for ₹199 (19,900 paise), currency INR, mapped to user & plan | Created order with amount 19,900 paise; pending subscription saved | **PASS** |
| **TC-02** | Premium Plan Pricing & Order Creation | Order Creation | Razorpay order for ₹499 (49,900 paise), currency INR, mapped to user & plan | Created order with amount 49,900 paise; pending subscription saved | **PASS** |
| **TC-03** | Invalid Plan ID Rejection | Order Creation | Requesting non-existent plan ID returns HTTP 404 | Returned HTTP 404 "Plan not found" | **PASS** |
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

## 3. Cryptographic Verification Evidence

### Constant-Time Signature Validation Implementation
From `backend/app/services/subscription_service.py`:

```python
generated_signature = hmac.new(
    settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
    f"{order_id}|{payment_id}".encode("utf-8"),
    hashlib.sha256
).hexdigest()

if not hmac.compare_digest(generated_signature, received_signature):
    raise HTTPException(status_code=400, detail="Invalid payment signature")
```

The use of `hmac.compare_digest` guarantees that string comparisons complete in constant time, eliminating timing oracle vulnerabilities during signature inspection.

---

## 4. Idempotency Proof

When Razorpay's webhook delivers duplicate events with identical `event_id`:
1. `WebhookEvent` table enforces a unique constraint on `event_id`.
2. First delivery logs event, captures payment, sets expiry to `today + 30 days`, returns HTTP 200.
3. Second delivery detects existing `event_id` in database:
   - Does **not** add an additional 30 days to expiry.
   - Does **not** insert a duplicate `Payment` record.
   - Returns `{ "status": "already_processed" }` with HTTP 200.

---

## 5. Conclusion

The Razorpay hosted payment workflow, cryptographic signature validation, webhook idempotency, and access control tiers are verified and pass all test scenarios without defect.


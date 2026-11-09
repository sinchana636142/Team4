# StreamHub OTT — System Validation Report

**Document ID:** PES-UE24CS341A-SVR-001  
**Project:** StreamHub – Academic OTT Video Streaming Platform  
**University:** PES University · Department of Computer Science and Engineering  
**Course:** Software Engineering – UE24CS341A  
**Team:** TEAM-04  
**Role:** Member 4 – Testing & Integration (`vinu9686` / `pes1202503166@stu.pes.edu`)  
**Execution Date:** November 9, 2026  
**Status:** **END-TO-END SYSTEM WORKFLOWS VALIDATED**

---

## 1. Objective & Scope

System validation evaluates complete, end-to-end user workflows spanning the full application stack (React frontend UI, FastAPI backend API, and persistent database). 

This report documents the verification of the primary user journeys defined in the **Software Requirements Specification (SRS v1.0)**.

---

## 2. End-to-End Workflow Validation Matrix

| Workflow ID | Workflow Name | User Role | Steps Included | Verification Status | Evidence Reference |
|---|---|---|---|---|---|
| **E2E-01** | User Registration & Activation | New Viewer | Register with name/email -> Receive OTP -> Submit OTP -> Account marked active | **Pass** | `test_auth.py`, Registration UI |
| **E2E-02** | User Authentication & Profile | Registered Viewer | Login with credentials -> Receive JWT -> View Profile -> Update Avatar & Name | **Pass** | `test_auth.py`, Profile UI |
| **E2E-03** | Password Reset via OTP | Existing Viewer | Forgot Password -> Enter email -> Receive reset OTP -> Set new password -> Login | **Pass** | `test_auth.py`, `ForgotPassword.jsx` |
| **E2E-04** | Content Discovery & Search | Any Viewer | Browse catalog grid -> Filter by genre (Action, Sci-Fi) -> Search keyword -> View details | **Pass** | `MoviesPage.jsx`, `MovieDetailsPage.jsx` |
| **E2E-05** | Free Viewer Preview Experience | Free Viewer (₹0) | Open title -> Stream 2-minute preview -> Attempt full movie -> Receive upgrade modal | **Pass** | `test_subscription_lifecycle.py`, `VideoPlayer.jsx` |
| **E2E-06** | Subscription Purchase (Razorpay) | Viewer | Select plan (Basic ₹199 / Premium ₹499) -> Open checkout -> Complete sandbox payment -> Subscription activated | **Pass** | `test_payment_checkout.py`, `RazorpayCheckout.jsx` |
| **E2E-07** | Subscribed Playback & Quality | Basic / Premium | Play full video -> Verify 1080p (Basic) or 4K (Premium) -> Verify device limit enforcement | **Pass** | `test_subscription_lifecycle.py`, `WatchPage.jsx` |
| **E2E-08** | Resume Playback & History | Active Viewer | Play video -> Seek to timestamp -> Pause -> Reopen video -> Resumes at saved timestamp | **Pass** | `test_resume_playback.py`, `test_watch_history.py` |
| **E2E-09** | Personal Watchlist Management | Logged-in Viewer | Add movie to watchlist -> View watchlist -> Remove movie -> Verify list updates | **Pass** | `test_watchlist.py`, `WatchlistPage.jsx` |
| **E2E-10** | Admin Content Management | Administrator | Login as Admin -> Upload title with metadata -> Toggle publish status -> Verify public catalog reflects state | **Pass** | `test_admin_titles.py`, `AdminDashboard.jsx` |
| **E2E-11** | Admin User & Subscription Audit | Administrator | Open Admin Dashboard -> View users table -> Inspect subscription status, tier, last payment | **Pass** | `test_admin_users.py`, `AdminDashboard.jsx` |

---

## 3. Workflow Validation Details

### Workflow E2E-05: Free Viewer 2-Minute Preview vs Subscribed Full Access
1. **Initial State:** User registers and logs in without purchasing a plan (`membership_tier = "free"`).
2. **Action:** User navigates to a published title and clicks Play.
3. **Backend Authorization:** `playback_service.py` checks user subscription status:
   - Identifies user as Free Viewer.
   - Restricts streaming URL to preview asset or appends `preview_duration=120`.
   - Returns payload: `{ "is_preview": true, "preview_duration": 120, "access_level": "free" }`.
4. **Frontend Enforcement:** `VideoPlayer.jsx` enforces 120-second cap; when playback reaches 120s, player pauses and presents subscription upgrade modal.
5. **Security Check:** Attempting to forge direct full-video requests without an active subscription returns `HTTP 403 Forbidden ("Active subscription required")`.
6. **Verdict:** **PASS**

### Workflow E2E-06: Hosted Razorpay Checkout & Activation
1. **Initial State:** User on Free tier opens "Subscription Plans".
2. **Action:** User selects "Basic Plan" (₹199/month).
3. **Order Creation:** Client sends `POST /subscription/checkout` with `plan_id=1`. Backend calculates amount as `19900` paise from DB and creates Razorpay order.
4. **Modal Presentation:** Razorpay Standard Checkout opens in responsive modal.
5. **Payment Completion:** Test payment completed using test card details.
6. **Verification:** Signature `order_id + "|" + payment_id` verified using constant-time HMAC-SHA256 (`hmac.compare_digest`).
7. **Database Update:** Subscription record updated to `status="active"`, `expiry_date = today + 30 days`. `Payment` row recorded as `status="captured"`.
8. **UI Update:** User redirected to WatchPage; full 1080p streaming immediately unlocked.
9. **Verdict:** **PASS**

### Workflow E2E-10: Admin Title Creation & Publish Toggle
1. **Initial State:** User logged in as `admin@streamhub.com` with `role="admin"`.
2. **Action:** Admin navigates to Admin Dashboard and submits new title:
   - Title: "Interstellar Odyssey"
   - Genre: "Sci-Fi"
   - Duration: 145 min
   - Resolution: "4K"
   - `is_published`: false (initially unpublished)
3. **Verification:** Title created with ID; public `GET /catalog/titles` excludes title.
4. **Action:** Admin clicks "Publish" toggle.
5. **Verification:** `is_published` set to true; title immediately visible in public catalog and playable.
6. **Verdict:** **PASS**

---

## 4. Conclusion

All 11 primary end-to-end user workflows function in complete accordance with the specifications. Security gates, role boundaries, and access control tiers operate seamlessly across the entire application stack.

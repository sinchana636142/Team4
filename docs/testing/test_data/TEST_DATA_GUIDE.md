# StreamHub OTT — Test Data & Configuration Guide

**Document ID:** PES-UE24CS341A-TDG-001  
**Project:** StreamHub – Academic OTT Video Streaming Platform  
**University:** PES University · Department of Computer Science and Engineering  
**Course:** Software Engineering – UE24CS341A  
**Team:** TEAM-04  
**Author:** Member 4 – Testing & Integration (`vinu9686` / `pes1202503166@stu.pes.edu`)  

---

## 1. Purpose

This document provides standardized, safe, reproducible test data for testing StreamHub without using real credit cards, production passwords, or sensitive personal data.

---

## 2. Standard Test User Accounts

| Role | Email | Password | Is Verified? | Membership Tier | Purpose |
|---|---|---|---|---|---|
| **Administrator** | `admin@streamhub.com` | `Admin@12345` | `True` | Admin (Unrestricted) | Testing Admin Dashboard, title upload, publishing, user management |
| **Verified Viewer (Demo)** | `demo@example.com` | `Demo@12345` | `True` | Basic / Active | Testing browsing, playback, resume, watchlist, history |
| **Free Viewer** | `free.viewer@example.com` | `Free@12345` | `True` | Free (₹0) | Testing 2-minute preview, trailer playback, full movie blocking (HTTP 403) |
| **Premium Member** | `premium.viewer@example.com` | `Premium@12345` | `True` | Premium (₹499) | Testing 4K streaming, multi-device access (up to 4 devices) |
| **Unverified User** | `unverified@example.com` | `Unverified@12345` | `False` | Free | Testing OTP verification gate and login blocking |
| **Expired Subscriber** | `expired@example.com` | `Expired@12345` | `True` | Expired | Testing subscription expiry enforcement and upgrade prompts |

> ⚠️ **Security Notice:** The above accounts are strictly for local academic development and sandbox testing. Plaintext passwords must never be used in production.

---

## 3. Subscription Plan Test Matrix

| Plan Name | Authoritative Price (₹) | Amount in Paise | Resolution Limit | Device Limit | Purpose |
|---|---|---|---|---|---|
| **Free Viewer** | ₹0 | 0 paise | Trailer / 120s Preview | 1 Device | Default registration tier |
| **Basic** | ₹199 / month | 19,900 paise | Full HD 1080p | 1 Device | Budget tier test |
| **Premium** | ₹499 / month | 49,900 paise | Ultra HD 4K | 4 Devices | Highest quality tier test |

---

## 4. Razorpay Sandbox Test Data

When testing the hosted payment checkout in sandbox mode (`RAZORPAY_KEY_ID=rzp_test_*`):

- **Payment Mode:** Card
- **Test Card Number:** `4111 1111 1111 1111` (or any valid test card supported by Razorpay Sandbox)
- **Expiry Date:** Any future date (e.g., `12/28`)
- **CVV:** `123`
- **OTP:** Any 4 or 6-digit number (e.g., `1234` or `123456` in Sandbox test mode)
- **Expected Webhook Event:** `payment.captured`
- **Simulated Event ID:** `evt_test_` + random 14-character alphanumeric string

---

## 5. Sample Video & Media Assets

For progressive streaming and startup-time benchmarking without heavy local storage:

- **Progressive Test MP4 Stream:**  
  `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4`
- **Big Buck Bunny Sample:**  
  `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
- **Local Video Storage Path:**  
  `backend/app/static/uploads/videos/` (served at `http://127.0.0.1:8001/static/uploads/videos/`)
- **Local Poster Storage Path:**  
  `backend/app/static/uploads/posters/`

---

## 6. Boundary & Negative Test Data

| Field | Valid Boundary | Invalid Test Inputs | Expected Validation Error |
|---|---|---|---|
| `email` | `user@domain.com` | `missing_at_symbol`, `@domain.com`, `user@` | `422 Unprocessable Entity` |
| `password` | 6–128 characters | `""` (empty), `"123"` (< 6 chars) | `422 Unprocessable Entity` |
| `otp` | 6 digits (`"123456"`) | `"12"`, `"abc"`, `"1234567"`, `""` | `400 Invalid OTP code` |
| `plan_id` | `1`, `2` | `0`, `-1`, `999`, `"two"` | `404 Plan not found` |
| `position_seconds` | `>= 0` | `-1`, `-100`, `"abc"` | `422 Position must be >= 0` |
| `watched_seconds` | `>= 0` | `-5` | `422 Watched seconds >= 0` |
| `rating` | `1` to `5` | `0`, `6`, `-1`, `10` | `422 Rating must be between 1 and 5` |
| `release_year` | `1888` to `2100` | `1800`, `2200`, `"year"` | `422 Invalid release year` |


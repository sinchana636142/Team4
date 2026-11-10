# StreamHub OTT — Configuration & Environment Guide

**Document ID:** PES-UE24CS341A-CONF-001  
**Project:** StreamHub – Academic OTT Video Streaming Platform  
**University:** PES University · Department of Computer Science and Engineering  
**Course:** Software Engineering – UE24CS341A  
**Team:** TEAM-04  
**Date:** November 9, 2026  

---

## 1. Environment Variable Architecture

StreamHub uses `pydantic-settings` (`app/core/config.py`) to parse, validate, and inject configuration parameters from the environment and `.env` files.

---

## 2. Environment Variables Catalog

| Variable Name | Required? | Default Value | Used By | Description |
|---|---|---|---|---|
| `DATABASE_URL` | **Yes** | `postgresql+psycopg://postgres:postgres@localhost:5432/streamhub` | `app/database.py` | Connection string for PostgreSQL database. Uses `psycopg` v3 binary driver. |
| `JWT_SECRET_KEY` | **Yes** | None (Must be configured) | `app/core/security.py` | Minimum 32-character random string used to sign and verify HS256 JWT login tokens. |
| `JWT_ALGORITHM` | No | `HS256` | `app/core/security.py` | Cryptographic algorithm for signing access tokens. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `60` | `app/core/security.py` | JWT token validity lifespan. |
| `OTP_DELIVERY_MODE` | No | `console` | `app/services/email_service.py` | `console`: Prints OTP to backend terminal (recommended for local testing). `smtp`: Sends real emails. |
| `OTP_EXPIRE_MINUTES` | No | `10` | `app/services/otp_service.py` | Registration and password reset OTP validity window. |
| `REQUIRE_SUBSCRIPTION` | No | `true` | `app/services/playback_service.py` | `true`: Enforces active subscription check for full playback. `false`: Demo bypass. |
| `RAZORPAY_KEY_ID` | Optional (Sandbox) | `None` | `app/services/subscription_service.py` | Razorpay public key identifier (e.g., `rzp_test_*`). |
| `RAZORPAY_KEY_SECRET` | Optional (Sandbox) | `None` | `app/services/subscription_service.py` | Razorpay merchant secret used to compute and verify HMAC-SHA256 signatures. |
| `RAZORPAY_WEBHOOK_SECRET` | Optional (Sandbox) | `None` | `app/services/subscription_service.py` | Secret used to verify incoming `X-Razorpay-Signature` webhooks. |
| `SMTP_HOST` | Conditional | `smtp.gmail.com` | `app/services/email_service.py` | Outgoing SMTP mail server host (required only if `OTP_DELIVERY_MODE=smtp`). |
| `SMTP_PORT` | Conditional | `587` | `app/services/email_service.py` | SMTP port (STARTTLS). |
| `SMTP_EMAIL` | Conditional | `""` | `app/services/email_service.py` | Gmail sender address. |
| `SMTP_PASSWORD` | Conditional | `""` | `app/services/email_service.py` | Google Account App Password. |

---

## 3. Safe Configuration for Development & Evaluation

To start the application for grading and evaluation:
1. Copy `.env.example` to `backend/.env`:
   ```powershell
   Copy-Item .env.example backend/.env
   ```
2. Set your local PostgreSQL password in `DATABASE_URL`.
3. Set `JWT_SECRET_KEY` to any secure random string:
   ```powershell
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
4. Keep `OTP_DELIVERY_MODE=console` to review OTP codes directly in the terminal without configuring SMTP credentials.

---

## 4. Git Security & Ignore Rules

To prevent accidental credential leakage:
- `.env`, `.env.*` (except `.env.example`) are registered in `.gitignore`.
- Binary coverage databases (`.coverage`, `.coverage.*`) and runtime log files (`*.log`) are ignored.
- Media upload assets (`backend/app/static/uploads/`) are ignored to avoid repository bloat.


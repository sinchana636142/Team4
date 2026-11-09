# StreamHub OTT — Database Architecture & Entity Relationship Specification

**Document ID:** PES-UE24CS341A-DB-001  
**Project:** StreamHub – Academic OTT Video Streaming Platform  
**University:** PES University · Department of Computer Science and Engineering  
**Course:** Software Engineering – UE24CS341A  
**Team:** TEAM-04  
**Date:** November 9, 2026  

---

## 1. Overview & Technology Stack

The StreamHub database architecture uses **PostgreSQL** in production and local development, mapped through **SQLAlchemy 2.0 ORM** with asynchronous-capable `Mapped` and `mapped_column` type annotations.

- **DBMS:** PostgreSQL 16+ / SQLite (isolated in-memory test runner)
- **Database Driver:** `psycopg` (binary v3)
- **ORM:** SQLAlchemy 2.0.x
- **Schema Management:** Automated table bootstrap via `app/init_db.py` and programmatic migrations via `migrate_db.py`

---

## 2. Entity-Relationship (ER) Diagram

The following Mermaid diagram visualizes the table schemas, primary keys, foreign keys, and cardinalities:

```mermaid
erDiagram
    USERS ||--o{ SUBSCRIPTIONS : "has"
    USERS ||--o{ PAYMENTS : "makes"
    USERS ||--o{ USER_DEVICES : "registers"
    USERS ||--o{ WATCH_HISTORY : "records"
    USERS ||--o{ PLAYBACK_PROGRESS : "tracks"
    USERS ||--o{ WATCHLIST : "saves"
    USERS ||--o{ RATINGS : "submits"

    PLANS ||--o{ SUBSCRIPTIONS : "defines"
    PLANS ||--o{ PAYMENTS : "priced_by"

    SUBSCRIPTIONS ||--o{ PAYMENTS : "associated_with"

    TITLES ||--o{ WATCH_HISTORY : "viewed_in"
    TITLES ||--o{ PLAYBACK_PROGRESS : "progress_of"
    TITLES ||--o{ WATCHLIST : "bookmarked_in"
    TITLES ||--o{ RATINGS : "rated_by"

    USERS {
        int id PK
        string full_name
        string email UK
        string password_hash
        boolean is_verified
        string role
        boolean is_admin
        string avatar_url
        datetime created_at
        string otp_hash
        datetime otp_expires_at
        int otp_attempts
        datetime otp_last_sent_at
        string reset_otp_hash
        datetime reset_otp_expires_at
        int reset_otp_attempts
        datetime reset_otp_verified_until
    }

    PLANS {
        int id PK
        string name
        int price
        string max_quality
        int device_limit
        string description
    }

    SUBSCRIPTIONS {
        int id PK
        int user_id FK
        int plan_id FK
        string status
        date start_date
        date expiry_date
        string razorpay_order_id
        string razorpay_payment_id
        string razorpay_signature
    }

    PAYMENTS {
        int id PK
        int user_id FK
        int subscription_id FK
        int plan_id FK
        string razorpay_order_id
        string razorpay_payment_id
        int amount
        string currency
        string status
        string failure_reason
        datetime created_at
        datetime updated_at
        datetime verified_at
    }

    WEBHOOK_EVENTS {
        int id PK
        string razorpay_event_id UK
        string event_type
        string payment_id
        string order_id
        string processing_status
        datetime received_at
        datetime processed_at
    }

    USER_DEVICES {
        int id PK
        int user_id FK
        string device_id
        string device_name
        datetime last_active
    }

    TITLES {
        int id PK
        string title
        string genre
        int year
        text synopsis
        string poster_url
        string video_url
        string trailer_url
        string preview_url
        string video_url_4k
        string max_quality
        boolean is_published
    }

    WATCH_HISTORY {
        int id PK
        int user_id FK
        int title_id FK
        datetime watched_at
    }

    PLAYBACK_PROGRESS {
        int id PK
        int user_id FK
        int title_id FK
        int position_seconds
        datetime updated_at
    }

    WATCHLIST {
        int id PK
        int user_id FK
        int title_id FK
    }

    RATINGS {
        int id PK
        int user_id FK
        int title_id FK
        int score
        datetime created_at
        datetime updated_at
    }
```

---

## 3. Table Specifications & Constraints

### 3.1 `users` Table
- Stores viewer accounts, admin role flags, and multi-step OTP authentication states.
- **Constraints:**
  - `email`: `VARCHAR(255) UNIQUE NOT NULL`
  - `password_hash`: Salted bcrypt string
  - `role`: Default `"viewer"`, administrative accounts assigned `"admin"`

### 3.2 `plans` Table
- Authoritative definition of subscription packages and streaming capabilities.
- **Seeded Records:**
  - `Plan ID 1`: Basic — ₹199 / month (19,900 paise), 1080p Full HD, 1 device.
  - `Plan ID 2`: Premium — ₹499 / month (49,900 paise), 4K Ultra HD, 4 devices.

### 3.3 `subscriptions` Table
- Tracks viewer subscription validity.
- **Foreign Keys:**
  - `user_id` -> `users(id)`
  - `plan_id` -> `plans(id)`
- **Lifecycle States:** `pending` -> `active` -> `expired` / `cancelled`.

### 3.4 `payments` Table
- Permanent audit log of every Razorpay transaction attempt.
- **Foreign Keys:** `user_id`, `subscription_id`, `plan_id`.
- **Amount:** Stored in **paise** (`amount = 19900` for ₹199) to prevent floating-point precision loss.
- **PCI-DSS Compliance:** Card numbers, expiry dates, and CVVs are strictly prohibited from this table.

### 3.5 `webhook_events` Table
- Enforces Razorpay webhook idempotency.
- **Constraint:** `razorpay_event_id VARCHAR(100) UNIQUE NOT NULL`.
- Duplicate deliveries of the same event ID are detected and safely skipped without double-charging or extending expiration windows.

### 3.6 `user_devices` Table
- Enforces device concurrency limits based on plan tier (1 device for Basic, 4 for Premium).
- **Index:** `(user_id, device_id)` composite lookup.

### 3.7 `titles` Table
- Primary catalog table for movies and web series.
- **Attributes:** `is_published` boolean flag controls catalog visibility and playback authorization. Separate asset URLs for 1080p, 4K, trailer, and 2-minute preview.

### 3.8 `playback_progress` & `watch_history` Tables
- `playback_progress`: Single row per user and title with `UNIQUE(user_id, title_id)`. Tracks current `position_seconds`.
- `watch_history`: Append-only log of viewing sessions with UTC timestamps (`watched_at`).

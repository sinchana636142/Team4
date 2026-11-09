# StreamHub OTT — System Architecture & Request Flows

**Document ID:** PES-UE24CS341A-ARCH-002  
**Project:** StreamHub – Academic OTT Video Streaming Platform  
**University:** PES University · Department of Computer Science and Engineering  
**Course:** Software Engineering – UE24CS341A  
**Team:** TEAM-04  
**Date:** November 9, 2026  

---

## 1. System Architecture Diagram

The following architecture diagram illustrates the end-to-end communication topology of StreamHub, highlighting the separation of concerns across presentation, routing, business logic, persistence, and external integrations:

```mermaid
flowchart TD
    subgraph Client ["Client Presentation Tier (React 19 / Vite)"]
        User(["👤 End User / Viewer / Admin"])
        SPA["StreamHub React SPA (Port 5173)"]
        Player["HTML5 Video Player (Custom Controls)"]
        CheckoutModal["Razorpay Hosted Modal"]
        User -->|Interacts| SPA
        SPA -->|Renders| Player
        SPA -->|Invokes| CheckoutModal
    end

    subgraph BackendGateway ["API Gateway & Routing Tier (FastAPI - Port 8001)"]
        CORS["CORS Middleware"]
        AuthRouter["Auth Router (/auth/*)"]
        CatalogRouter["Catalog Router (/catalog/*)"]
        PlaybackRouter["Playback Router (/playback/*)"]
        SubRouter["Subscription Router (/subscription/*)"]
        AdminRouter["Admin Router (/admin/*)"]
        WatchlistRouter["Watchlist Router (/watchlist/*)"]
        SPA -->|HTTP / JSON REST API| CORS
        CORS --> AuthRouter
        CORS --> CatalogRouter
        CORS --> PlaybackRouter
        CORS --> SubRouter
        CORS --> AdminRouter
        CORS --> WatchlistRouter
    end

    subgraph ServiceLayer ["Business Logic & Security Services"]
        AuthService["AuthService (Bcrypt / JWT / OTP)"]
        PlaybackService["PlaybackService (Preview / 1080p / 4K / Devices)"]
        SubService["SubscriptionService (Orders / HMAC / Webhooks)"]
        AdminService["AdminService (Catalog & RBAC)"]
        HistoryService["HistoryService & ResumeService"]

        AuthRouter --> AuthService
        CatalogRouter --> AdminService
        PlaybackRouter --> PlaybackService
        SubRouter --> SubService
        AdminRouter --> AdminService
        WatchlistRouter --> AdminService
        PlaybackRouter --> HistoryService
    end

    subgraph PersistenceLayer ["Data Persistence Tier (SQLAlchemy 2.0 ORM)"]
        PG[("🐘 PostgreSQL / SQLite (Port 5432)")]
        UsersTable[("users")]
        TitlesTable[("titles")]
        PlansTable[("plans")]
        SubsTable[("subscriptions")]
        PaymentsTable[("payments")]
        EventsTable[("webhook_events")]
        DevicesTable[("user_devices")]
        HistoryTable[("watch_history & playback_progress")]

        AuthService --> UsersTable
        PlaybackService --> TitlesTable
        PlaybackService --> SubsTable
        PlaybackService --> DevicesTable
        SubService --> PlansTable
        SubService --> SubsTable
        SubService --> PaymentsTable
        SubService --> EventsTable
        AdminService --> TitlesTable
        AdminService --> UsersTable
        HistoryService --> HistoryTable
        UsersTable --- PG
        TitlesTable --- PG
        PlansTable --- PG
        SubsTable --- PG
        PaymentsTable --- PG
        EventsTable --- PG
        DevicesTable --- PG
        HistoryTable --- PG
    end

    subgraph ExternalServices ["External Services & Third-Party Integrations"]
        RazorpayGateway["💳 Razorpay API (Sandbox Gateway)"]
        MailService["📧 OTP Delivery (Console / SMTP)"]
        MediaStorage["🎬 Static / Progressive MP4 Storage"]

        CheckoutModal -.->|Card Transaction| RazorpayGateway
        SubService -->|Create Order & Verify Signature| RazorpayGateway
        RazorpayGateway -.->|Webhook Events| SubRouter
        AuthService -->|Dispatch Verification Code| MailService
        Player -->|HTTP Range Requests| MediaStorage
    end
```

---

## 2. Detailed End-to-End Request Flows

### 2.1 User Login Request Flow
```mermaid
sequenceDiagram
    autonumber
    actor User as Viewer
    participant UI as React UI (Login.jsx)
    participant API as Auth Router (auth.py)
    participant SVC as AuthService
    participant DB as PostgreSQL (users)

    User->>UI: Submits email & password
    UI->>API: POST /auth/login {email, password}
    API->>SVC: authenticate_user(email, password)
    SVC->>DB: SELECT * FROM users WHERE email = :email
    DB-->>SVC: User record (with password_hash, is_verified)
    alt Account Not Verified
        SVC-->>API: HTTPException(400, "Email not verified")
        API-->>UI: 400 Bad Request
        UI-->>User: Show OTP verification prompt
    else Password Invalid
        SVC-->>API: HTTPException(401, "Invalid credentials")
        API-->>UI: 401 Unauthorized
        UI-->>User: Show "Incorrect email or password"
    else Authentication Successful
        SVC->>SVC: verify_password(plain, password_hash) -> True
        SVC->>SVC: create_access_token(user.id, exp=60m)
        SVC-->>API: {access_token, token_type: "bearer", user}
        API-->>UI: 200 OK
        UI->>UI: Save token in localStorage
        UI-->>User: Redirect to Home / Watchlist
    end
```

---

### 2.2 Video Playback Authorization & Quality Delivery Flow
```mermaid
sequenceDiagram
    autonumber
    actor User as Viewer
    participant UI as VideoPlayer.jsx
    participant API as Playback Router (playback.py)
    participant SVC as PlaybackService
    participant DB as PostgreSQL
    participant Media as Video Asset Storage

    User->>UI: Clicks Play on Movie
    UI->>API: GET /playback/{title_id} (Bearer Token, Device ID)
    API->>SVC: get_playback_url(user_id, title_id, device_id)
    SVC->>DB: Query User, Subscription, Title, UserDevice
    DB-->>SVC: Title (1080p/4K), Active Subscription / Plan

    alt User has No Active Subscription (Free Viewer)
        SVC-->>API: Deliver 2-Min Preview URL (is_preview: true, preview_duration: 120)
        API-->>UI: 200 OK {video_url: preview_url, preview_duration: 120}
        UI->>Media: Stream first 120 seconds
        UI-->>User: After 120s, pause & display Subscription Upgrade Modal
    else User is Basic Member (₹199)
        alt Requested Quality is 4K
            SVC-->>API: HTTPException(403, "4K requires Premium")
            API-->>UI: 403 Forbidden
        else Registered Devices > 1
            SVC-->>API: HTTPException(403, "Device limit exceeded (Max 1)")
            API-->>UI: 403 Forbidden
        else Valid 1080p Request
            SVC-->>API: Deliver Full 1080p URL (access_level: "basic")
            API-->>UI: 200 OK {video_url, quality: "1080p"}
            UI->>Media: Stream full movie in 1080p
        end
    else User is Premium Member (₹499)
        alt Title supports 4K
            SVC-->>API: Deliver 4K Stream URL (actual_quality: "4k")
        else Title only supports 1080p
            SVC-->>API: Deliver 1080p Stream URL (honest fallback)
        end
        API-->>UI: 200 OK {video_url, actual_quality}
        UI->>Media: Stream full movie
    end
```

---

### 2.3 Subscription Checkout & Razorpay Activation Flow
```mermaid
sequenceDiagram
    autonumber
    actor User as Viewer
    participant UI as RazorpayCheckout.jsx
    participant API as Subscription Router
    participant SVC as SubscriptionService
    participant RZP as Razorpay Gateway
    participant DB as PostgreSQL

    User->>UI: Selects Basic Plan (₹199)
    UI->>API: POST /subscription/checkout {plan_id: 1}
    API->>SVC: create_checkout_order(user_id, plan_id)
    SVC->>DB: SELECT * FROM plans WHERE id = 1 -> Price: 19900 paise
    SVC->>RZP: client.order.create(amount=19900, currency="INR")
    RZP-->>SVC: {order_id: "order_12345", amount: 19900}
    SVC->>DB: INSERT INTO subscriptions (status='pending') & payments
    SVC-->>API: {order_id, amount: 19900, key_id}
    API-->>UI: 200 OK

    UI->>RZP: Opens Razorpay Modal with order_id
    User->>RZP: Enters test card & submits OTP
    RZP-->>UI: Returns {payment_id, signature}

    UI->>API: POST /subscription/verify-payment {order_id, payment_id, signature}
    API->>SVC: verify_payment(order_id, payment_id, signature)
    SVC->>SVC: Constant-time HMAC-SHA256 signature verification
    alt Signature Valid & User Verified
        SVC->>DB: UPDATE subscriptions SET status='active', expiry=today+30d
        SVC->>DB: UPDATE payments SET status='captured'
        SVC-->>API: {status: "active", plan: "Basic", expiry_date}
        API-->>UI: 200 OK
        UI-->>User: Display "Subscription Activated! Enjoy Full HD"
    else Signature Invalid / Tampered
        SVC-->>API: HTTPException(400, "Invalid payment signature")
        API-->>UI: 400 Bad Request
        UI-->>User: Display "Payment Verification Failed"
    end
```

---

### 2.4 Admin Publishing a Title Flow
```mermaid
sequenceDiagram
    autonumber
    actor Admin as Administrator
    participant UI as AdminDashboard.jsx
    participant API as Admin Router (admin.py)
    participant SVC as AdminService
    participant DB as PostgreSQL (titles)

    Admin->>UI: Clicks "Publish" Toggle on Movie ID 5
    UI->>API: PATCH /admin/titles/5/publish (Bearer Admin Token)
    API->>API: Verify current_user.role == "admin"
    alt User is Not Admin
        API-->>UI: 403 Forbidden "Admin access required"
    else User is Admin
        API->>SVC: toggle_title_publish_status(title_id=5)
        SVC->>DB: SELECT * FROM titles WHERE id = 5
        DB-->>SVC: Title record (is_published = False)
        SVC->>DB: UPDATE titles SET is_published = True WHERE id = 5
        DB-->>SVC: Updated title record
        SVC-->>API: TitleSchema(id=5, is_published=True)
        API-->>UI: 200 OK {id: 5, is_published: true}
        UI-->>Admin: Update toggle state to "Published" (Green badge)
    end
```


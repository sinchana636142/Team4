# 🎬 StreamHub — OTT Video Streaming Website

## 🌟 Overview

**StreamHub** is a web-based **Over-The-Top (OTT) video streaming platform** that allows registered users to discover, stream, personalize, and subscribe to video content through a responsive website.

The system supports two primary roles:

- 👤 **Viewer** — registration, OTP verification, login, browsing, search, playback, resume, watch history, watchlist, ratings, and subscriptions.
- 🛠️ **Content Administrator** — upload/manage titles, publish/unpublish content, and view registered users and subscription status.

The project is intentionally scoped as a **single responsive website** suitable for an academic implementation.

---

## 📚 Documentation at a Glance

| Document | Answers |
|---|---|
| 📘 **SRS — Software Requirements Specification** | **WHAT** must the system do? |
| 🏗️ **SAD — Software Architecture & Design Specification** | **HOW** will the system be structured and designed? |
| 🧪 **STP — Software Test Plan** | **HOW** will the system be verified? |

```text
                    ┌────────────────────┐
                    │       SRS          │
                    │    WHAT to build   │
                    └─────────┬──────────┘
                              ▼
                    ┌────────────────────┐
                    │       SAD          │
                    │    HOW to build    │
                    └─────────┬──────────┘
                              ▼
                    ┌────────────────────┐
                    │       STP          │
                    │   HOW to verify    │
                    └────────────────────┘
```

---

# 🎯 1. Project Objectives

StreamHub brings together:

- 🔐 Secure registration and authentication
- 🔎 Catalog browsing and title search
- ▶️ Browser-based video playback
- ⏯️ Resume playback and watch history
- ❤️ Personal watchlist
- ⭐ 1–5 star ratings
- 💳 Subscription plans and hosted payment checkout
- 🛠️ Content upload and publishing
- 👥 Basic user/subscription administration
- 📱 Responsive desktop/tablet usability
- 🛡️ Security-focused API and payment handling

---

# 👥 2. User Roles & Journeys

### 👤 Viewer

```text
Register → Verify OTP → Login
                     ↓
             Browse / Search
                     ↓
              Title Details
                     ↓
              Check Access
                ↙       ↘
        Watch Video    Subscribe
             ↓             ↓
       Resume/History   Hosted Payment
             ↘             ↙
          Watchlist + Rating
```

### 🛠️ Administrator

```text
Admin
  ↓
Upload Title + Metadata
  ↓
Publish / Unpublish
  ↓
Manage Catalog
  ↓
View Users & Subscription Status
```

---

# 🧩 3. Functional Modules

| Module | Capabilities |
|---|---|
| 🔐 Account, Authentication & Profile | Register + OTP, login, password reset, profile |
| 🔎 Catalog, Browse & Search | Genre browsing, search, title details |
| ▶️ Playback | Video playback, resume position, watch history |
| ❤️ Personalisation | Watchlist, 1–5 star rating |
| 💳 Subscription & Payment | Plans, hosted checkout, subscription status |
| 🛠️ Content Administration | Upload, publish/unpublish, user/subscription view |

---

# 🏗️ 4. Architecture

StreamHub uses a **layered 3-tier client–server architecture** implemented as a **modular monolith**.

```text
┌───────────────────────────────────────────────┐
│                    CLIENT                     │
│             React Single Page App             │
│ Browse | Search | Player | Watchlist | Admin │
└───────────────────────┬───────────────────────┘
                        │ REST / JSON
                        │ HTTPS / TLS 1.2+
                        ▼
┌───────────────────────────────────────────────┐
│                   BACKEND                     │
│                 FastAPI API                   │
│                                               │
│ Auth | Catalog | Playback | Subscription     │
│                     | Admin                   │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
               ┌─────────────────┐
               │   PostgreSQL    │
               └─────────────────┘
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
┌──────────────────┐       ┌────────────────────┐
│ Cloud / Static   │       │ External Services  │
│ Video + Images   │       │ Payment + Email    │
└──────────────────┘       └────────────────────┘
```

### Why this architecture?

The SAD chooses modular 3-tier architecture instead of microservices because the project is intended for a **single-team academic build at modest scale**. FastAPI modules provide separation of concerns without the complexity of service discovery, distributed transactions, and inter-service networking.

---

# 🛠️ 5. Technology Stack

| Layer | Technology |
|---|---|
| 🎨 Frontend | React SPA |
| ⚙️ Backend | FastAPI / Python |
| 🗄️ Database | PostgreSQL |
| 📦 Validation | Pydantic |
| 🔑 Authentication | Short-lived JWT |
| 🔒 Password Storage | Salted bcrypt |
| 🌐 Communication | REST / JSON over HTTPS |
| 🎥 Storage | Cloud / Static Storage |
| 💳 Payment | External hosted payment gateway |
| ✉️ Email | SMTP / Transactional Email |
| 📐 UML | draw.io |
| 📡 API Documentation | Swagger / OpenAPI |
| 🧪 UI/API Testing | Playwright / Selenium / Postman |
| ⚡ Performance | JMeter / Locust |
| 🐛 Defects | GitHub Issues / Jira |

---

# 🔐 6. Security Architecture

Security is built into the system design.

| Threat / Requirement | Protection |
|---|---|
| 🔑 Spoofing | JWT sessions + bcrypt passwords |
| 📝 Tampering | Pydantic validation + HTTPS |
| 🧾 Repudiation | Server-side transaction/payment-status logging |
| 👁️ Information Disclosure | TLS + no sensitive payment/password logging |
| 🚫 DoS | Authentication endpoint rate limiting |
| 👮 Privilege Escalation | Admin role checks |

### Critical payment rule

**Card/payment data never passes through or persists on the StreamHub server.**

The payment flow uses an external hosted checkout and a payment-status callback.

```text
Viewer
  ↓
Select Plan
  ↓
Subscription Service
  ↓
External Payment Gateway
  ↓
Payment Completed
  ↓
Callback
  ↓
Subscription Updated
  ↓
PostgreSQL
```

---

# ⚡ 7. Quality & Performance Targets

| ID | Target |
|---|---|
| ⚡ OTT-NF-001 | 95% of API requests respond within **2 seconds** |
| ▶️ OTT-NF-002 | Video starts within **5 seconds** on standard broadband |
| 📱 OTT-NF-003 | Responsive on desktop and tablet widths |
| 👥 OTT-NF-004 | At least **50 concurrent simulated users** without errors |
| 🧱 OTT-NF-005 | Clearly separated backend modules |
| 🟢 OTT-NF-006 | Available during scheduled demo/test windows |

---

# 📋 8. Functional Requirements

### Authentication
`OTT-F-001` Register + OTP  
`OTT-F-002` Login + JWT  
`OTT-F-003` Password reset  
`OTT-F-004` Profile management

### Catalog
`OTT-F-010` Browse by genre  
`OTT-F-011` Search titles  
`OTT-F-012` Title-detail page

### Playback
`OTT-F-020` HTML5 video playback  
`OTT-F-021` Resume last position  
`OTT-F-022` Watch history

### Personalisation
`OTT-F-030` Watchlist  
`OTT-F-031` 1–5 star rating

### Subscription
`OTT-F-040` At least two plans  
`OTT-F-041` Hosted payment checkout  
`OTT-F-042` Plan + renewal/expiry status

### Administration
`OTT-F-050` Upload title + metadata  
`OTT-F-051` Publish/unpublish  
`OTT-F-052` View users + subscription status

---

# 🧪 9. Test Strategy

The STP defines four testing levels:

```text
Unit Tests
    ↓
Integration Tests
    ↓
System / End-to-End Tests
    ↓
Acceptance / UAT
```

### Test Types

- ✅ Functional
- 🔄 Regression
- ⚡ Performance
- 🖥️ Usability
- 🔐 Security

### Test Environment

**Browsers:** Chrome, Edge, Firefox, Safari  
**Devices:** Desktop and tablet-width environments  
**Backend:** FastAPI  
**Database:** PostgreSQL  
**External services:** Payment sandbox + SMTP test account

### Test Tools

- Playwright / Selenium
- Postman
- JMeter / Locust
- GitHub Issues / Jira

---

# 🔗 10. Requirements Traceability

The three documents connect requirements, architecture, and testing.

| Requirement | Test Case |
|---|---|
| `OTT-F-001` Register with OTP | `TC-Auth-01` |
| `OTT-F-002` Login | `TC-Auth-02` |
| `OTT-F-020` Play Video | `TC-Play-01` |
| `OTT-F-021` Resume Playback | `TC-Play-02` |
| `OTT-F-041` Payment Checkout | `TC-Sub-02` |
| `OTT-NF-001` Response ≤ 2s | `TC-Perf-01` |

The SRS RTM currently records the listed requirements as **Not Started**, establishing the implementation/testing baseline.

---

# 🔌 11. Key API Interfaces

### Login

```http
POST /api/auth/login
```

```json
{
  "email": "...",
  "password": "..."
}
```

Response:

```json
{
  "token": "...",
  "expiresIn": "..."
}
```

### Subscription Checkout

```http
POST /api/subscription/checkout
```

```json
{
  "userId": "...",
  "planId": "..."
}
```

### Resume Playback

```http
GET /api/playback/{titleId}/resume
```

```json
{
  "positionSeconds": 0
}
```

---

# 📐 12. Design Highlights

The architecture/design documentation contains:

- 🧩 Component architecture
- 🔄 UML sequence diagrams
- 👤 Register & Verify OTP sequence
- 💳 Subscribe & Pay sequence
- 🔌 API definitions
- 🛡️ STRIDE threat model
- 🎨 UX considerations
- 🔗 Requirement-to-component traceability

The SRS also includes a use-case overview connecting Viewer, Email Service, Payment Gateway, and Content Administrator.

---

# 🚧 13. Explicit Scope Boundaries

The following are **out of scope for this version**:

- ❌ Native mobile application
- ❌ Smart-TV application
- ❌ DRM-protected playback
- ❌ Full adaptive-bitrate transcoding pipeline
- ❌ Offline downloads
- ❌ Live linear TV
- ❌ Dedicated CDN
- ❌ Multi-region infrastructure
- ❌ Storing/processing card data on StreamHub's server

This keeps the system focused on a complete and testable **web-based OTT platform**.

---

# ⚠️ 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| 💳 Payment callback failure | Idempotent callback + reconciliation |
| 🎥 Storage/bandwidth limits | Fixed-quality progressive streams |
| 🗄️ Database bottleneck | Connection pooling + indexed queries |
| 🧪 Payment sandbox instability | Documented test cards + mock non-payment responses |
| ⏳ Tight academic timeline | Prioritize High-priority requirements |
| 🖥️ Backend/DB downtime | Backup environment on cloud VM |

---

# 📦 15. Project Deliverables

- 📘 Software Requirements Specification
- 🏗️ Software Architecture & Design Specification
- 🧪 Software Test Plan
- 📝 Test cases
- 💻 Test scripts
- 🗃️ Test data
- 📊 Execution logs
- 🐛 Defect reports
- 📑 Final Test Summary Report

---

# 🏁 16. Definition of Done

```text
High-priority requirements implemented
              +
Planned test cases executed
              +
Zero critical defects open
              +
RTM fully updated
              +
Acceptance / UAT completed
              ↓
        ✅ READY FOR SUBMISSION
```

---

# 🗺️ 17. Documentation Relationship

```text
                 ┌─────────────────┐
                 │      SRS        │
                 │ Requirements    │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │      SAD        │
                 │ Architecture   │
                 │ & Design        │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │      STP        │
                 │ Testing & QA    │
                 └────────┬────────┘
                          │
                          ▼
                    StreamHub
                    Deliverable
```

---

# ⭐ StreamHub in One Sentence

> **StreamHub is a secure, responsive, modular web-based OTT platform connecting content discovery, video playback, personalization, subscriptions, payment integration, and administration into one academically scoped and testable system.**

---

## 📖 Source Documents

This README consolidates the project's:

1. **Software Requirements Specification (SRS) v1.0**
2. **Software Architecture and Design Specification (SAD) v1.0**
3. **Software Test Plan (STP) v1.0**

> This README preserves the scope, terminology, architecture, requirements, and testing approach defined by those documents and does not assume implementation details that they do not specify.

---

### 🎬 StreamHub
**Discover. Watch. Personalize. Subscribe.**

**TEAM-04 · PES University · UE24CS341A Software Engineering**

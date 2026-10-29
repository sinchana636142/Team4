# ≡ƒÄ¼ StreamHub ΓÇö OTT Video Streaming Website

## ≡ƒîƒ Overview

**StreamHub** is a web-based **Over-The-Top (OTT) video streaming platform** that allows registered users to discover, stream, personalize, and subscribe to video content through a responsive website.

The system supports two primary roles:

- ≡ƒæñ **Viewer** ΓÇö registration, OTP verification, login, browsing, search, playback, resume, watch history, watchlist, ratings, and subscriptions.
- ≡ƒ¢á∩╕Å **Content Administrator** ΓÇö upload/manage titles, publish/unpublish content, and view registered users and subscription status.

The project is intentionally scoped as a **single responsive website** suitable for an academic implementation.

> ≡ƒÜÇ **New here?** Jump to **Section 18 (Getting Started)** to run the project. Sprint progress is in **Section 19**, the code layout in **Section 20**, the working API in **Section 21**, the team's Git rules in **Section 22**, and known limitations in **Section 23**.

---

## ≡ƒôÜ Documentation at a Glance

| Document | Answers |
|---|---|
| ≡ƒôÿ **SRS ΓÇö Software Requirements Specification** | **WHAT** must the system do? |
| ≡ƒÅù∩╕Å **SAD ΓÇö Software Architecture & Design Specification** | **HOW** will the system be structured and designed? |
| ≡ƒº¬ **STP ΓÇö Software Test Plan** | **HOW** will the system be verified? |

```text
                    ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
                    Γöé       SRS          Γöé
                    Γöé    WHAT to build   Γöé
                    ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö¼ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
                              Γû╝
                    ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
                    Γöé       SAD          Γöé
                    Γöé    HOW to build    Γöé
                    ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö¼ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
                              Γû╝
                    ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
                    Γöé       STP          Γöé
                    Γöé   HOW to verify    Γöé
                    ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
```

---

# ≡ƒÄ» 1. Project Objectives

StreamHub brings together:

- ≡ƒöÉ Secure registration and authentication
- ≡ƒöÄ Catalog browsing and title search
- Γû╢∩╕Å Browser-based video playback
- ΓÅ»∩╕Å Resume playback and watch history
- Γ¥ñ∩╕Å Personal watchlist
- Γ¡É 1ΓÇô5 star ratings
- ≡ƒÆ│ Subscription plans and hosted payment checkout
- ≡ƒ¢á∩╕Å Content upload and publishing
- ≡ƒæÑ Basic user/subscription administration
- ≡ƒô▒ Responsive desktop/tablet usability
- ≡ƒ¢í∩╕Å Security-focused API and payment handling

---

# ≡ƒæÑ 2. User Roles & Journeys

### ≡ƒæñ Viewer

```text
Register ΓåÆ Verify OTP ΓåÆ Login
                     Γåô
             Browse / Search
                     Γåô
              Title Details
                     Γåô
              Check Access
                ΓåÖ       Γåÿ
        Watch Video    Subscribe
             Γåô             Γåô
       Resume/History   Hosted Payment
             Γåÿ             ΓåÖ
          Watchlist + Rating
```

### ≡ƒ¢á∩╕Å Administrator

```text
Admin
  Γåô
Upload Title + Metadata
  Γåô
Publish / Unpublish
  Γåô
Manage Catalog
  Γåô
View Users & Subscription Status
```

---

# ≡ƒº⌐ 3. Functional Modules

| Module | Capabilities |
|---|---|
| ≡ƒöÉ Account, Authentication & Profile | Register + OTP, login, password reset, profile |
| ≡ƒöÄ Catalog, Browse & Search | Genre browsing, search, title details |
| Γû╢∩╕Å Playback | Video playback, resume position, watch history |
| Γ¥ñ∩╕Å Personalisation | Watchlist, 1ΓÇô5 star rating |
| ≡ƒÆ│ Subscription & Payment | Plans, hosted checkout, subscription status |
| ≡ƒ¢á∩╕Å Content Administration | Upload, publish/unpublish, user/subscription view |

---

# ≡ƒÅù∩╕Å 4. Architecture

StreamHub uses a **layered 3-tier clientΓÇôserver architecture** implemented as a **modular monolith**.

```text
ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
Γöé                    CLIENT                     Γöé
Γöé             React Single Page App             Γöé
Γöé Browse | Search | Player | Watchlist | Admin Γöé
ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö¼ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
                        Γöé REST / JSON
                        Γöé HTTPS / TLS 1.2+
                        Γû╝
ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
Γöé                   BACKEND                     Γöé
Γöé                 FastAPI API                   Γöé
Γöé                                               Γöé
Γöé Auth | Catalog | Playback | Subscription     Γöé
Γöé                     | Admin                   Γöé
ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö¼ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
                        Γöé
                        Γû╝
               ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
               Γöé   PostgreSQL    Γöé
               ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
                        Γöé
          ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö┤ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
          Γû╝                           Γû╝
ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ       ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
Γöé Cloud / Static   Γöé       Γöé External Services  Γöé
Γöé Video + Images   Γöé       Γöé Payment + Email    Γöé
ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ       ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
```

### Why this architecture?

The SAD chooses modular 3-tier architecture instead of microservices because the project is intended for a **single-team academic build at modest scale**. FastAPI modules provide separation of concerns without the complexity of service discovery, distributed transactions, and inter-service networking.

---

# ≡ƒ¢á∩╕Å 5. Technology Stack

| Layer | Technology |
|---|---|
| ≡ƒÄ¿ Frontend | React SPA |
| ΓÜÖ∩╕Å Backend | FastAPI / Python |
| ≡ƒùä∩╕Å Database | PostgreSQL |
| ≡ƒôª Validation | Pydantic |
| ≡ƒöæ Authentication | Short-lived JWT |
| ≡ƒöÆ Password Storage | Salted bcrypt |
| ≡ƒîÉ Communication | REST / JSON over HTTPS |
| ≡ƒÄÑ Storage | Cloud / Static Storage |
| ≡ƒÆ│ Payment | External hosted payment gateway |
| Γ£ë∩╕Å Email | SMTP / Transactional Email |
| ≡ƒôÉ UML | draw.io |
| ≡ƒôí API Documentation | Swagger / OpenAPI |
| ≡ƒº¬ UI/API Testing | Playwright / Selenium / Postman |
| ΓÜí Performance | JMeter / Locust |
| ≡ƒÉ¢ Defects | GitHub Issues / Jira |

---

# ≡ƒöÉ 6. Security Architecture

Security is built into the system design.

| Threat / Requirement | Protection |
|---|---|
| ≡ƒöæ Spoofing | JWT sessions + bcrypt passwords |
| ≡ƒô¥ Tampering | Pydantic validation + HTTPS |
| ≡ƒº╛ Repudiation | Server-side transaction/payment-status logging |
| ≡ƒæü∩╕Å Information Disclosure | TLS + no sensitive payment/password logging |
| ≡ƒÜ½ DoS | Authentication endpoint rate limiting |
| ≡ƒæ« Privilege Escalation | Admin role checks |

### Critical payment rule

**Card/payment data never passes through or persists on the StreamHub server.**

The payment flow uses an external hosted checkout and a payment-status callback.

```text
Viewer
  Γåô
Select Plan
  Γåô
Subscription Service
  Γåô
External Payment Gateway
  Γåô
Payment Completed
  Γåô
Callback
  Γåô
Subscription Updated
  Γåô
PostgreSQL
```

---

# ΓÜí 7. Quality & Performance Targets

| ID | Target |
|---|---|
| ΓÜí OTT-NF-001 | 95% of API requests respond within **2 seconds** |
| Γû╢∩╕Å OTT-NF-002 | Video starts within **5 seconds** on standard broadband |
| ≡ƒô▒ OTT-NF-003 | Responsive on desktop and tablet widths |
| ≡ƒæÑ OTT-NF-004 | At least **50 concurrent simulated users** without errors |
| ≡ƒº▒ OTT-NF-005 | Clearly separated backend modules |
| ≡ƒƒó OTT-NF-006 | Available during scheduled demo/test windows |

---

# ≡ƒôï 8. Functional Requirements

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
`OTT-F-031` 1ΓÇô5 star rating

### Subscription
`OTT-F-040` At least two plans  
`OTT-F-041` Hosted payment checkout  
`OTT-F-042` Plan + renewal/expiry status

### Administration
`OTT-F-050` Upload title + metadata  
`OTT-F-051` Publish/unpublish  
`OTT-F-052` View users + subscription status

---

# ≡ƒº¬ 9. Test Strategy

The STP defines four testing levels:

```text
Unit Tests
    Γåô
Integration Tests
    Γåô
System / End-to-End Tests
    Γåô
Acceptance / UAT
```

### Test Types

- Γ£à Functional
- ≡ƒöä Regression
- ΓÜí Performance
- ≡ƒûÑ∩╕Å Usability
- ≡ƒöÉ Security

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

# ≡ƒöù 10. Requirements Traceability

The three documents connect requirements, architecture, and testing.

| Requirement | Test Case |
|---|---|
| `OTT-F-001` Register with OTP | `TC-Auth-01` |
| `OTT-F-002` Login | `TC-Auth-02` |
| `OTT-F-020` Play Video | `TC-Play-01` |
| `OTT-F-021` Resume Playback | `TC-Play-02` |
| `OTT-F-041` Payment Checkout | `TC-Sub-02` |
| `OTT-NF-001` Response Γëñ 2s | `TC-Perf-01` |

The SRS RTM currently records the listed requirements as **Not Started**, establishing the implementation/testing baseline.

### Γ£à Implementation & test evidence (Sprint 1)

| Requirement | Test Case | Unit-test file (`backend/tests/playback_features/`) |
|---|---|---|
| `OTT-F-020` Play Video | `TC-Play-01` | `test_play_video.py` |
| `OTT-F-021` Resume Playback | `TC-Play-02` | `test_resume_playback.py` |
| `OTT-F-022` Watch History | `TC-Play-03` | `test_watch_history.py` |
| `OTT-F-030` Watchlist | `TC-Personal-01` | `test_watchlist.py` |
| `OTT-F-042` Subscription status | `TC-Sub-03` | `test_subscription_status.py` |

Module-level unit tests are written by the developer of each module. Integration, system, regression, performance and security testing are coordinated by the testing member.

---

# ≡ƒöî 11. Key API Interfaces

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

> Γä╣∩╕Å **Contract vs. implementation.** The block above is the interface defined in the SAD. The running backend differs slightly: it serves routes **without** the `/api` prefix (for example `/auth/login`), and field names use `snake_case` (for example `access_token`, `position_seconds`). The endpoints that actually exist today are listed in **Section 21**.

---

# ≡ƒôÉ 12. Design Highlights

The architecture/design documentation contains:

- ≡ƒº⌐ Component architecture
- ≡ƒöä UML sequence diagrams
- ≡ƒæñ Register & Verify OTP sequence
- ≡ƒÆ│ Subscribe & Pay sequence
- ≡ƒöî API definitions
- ≡ƒ¢í∩╕Å STRIDE threat model
- ≡ƒÄ¿ UX considerations
- ≡ƒöù Requirement-to-component traceability

The SRS also includes a use-case overview connecting Viewer, Email Service, Payment Gateway, and Content Administrator.

---

# ≡ƒÜº 13. Explicit Scope Boundaries

The following are **out of scope for this version**:

- Γ¥î Native mobile application
- Γ¥î Smart-TV application
- Γ¥î DRM-protected playback
- Γ¥î Full adaptive-bitrate transcoding pipeline
- Γ¥î Offline downloads
- Γ¥î Live linear TV
- Γ¥î Dedicated CDN
- Γ¥î Multi-region infrastructure
- Γ¥î Storing/processing card data on StreamHub's server

This keeps the system focused on a complete and testable **web-based OTT platform**.

---

# ΓÜá∩╕Å 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| ≡ƒÆ│ Payment callback failure | Idempotent callback + reconciliation |
| ≡ƒÄÑ Storage/bandwidth limits | Fixed-quality progressive streams |
| ≡ƒùä∩╕Å Database bottleneck | Connection pooling + indexed queries |
| ≡ƒº¬ Payment sandbox instability | Documented test cards + mock non-payment responses |
| ΓÅ│ Tight academic timeline | Prioritize High-priority requirements |
| ≡ƒûÑ∩╕Å Backend/DB downtime | Backup environment on cloud VM |

---

# ≡ƒôª 15. Project Deliverables

- ≡ƒôÿ Software Requirements Specification
- ≡ƒÅù∩╕Å Software Architecture & Design Specification
- ≡ƒº¬ Software Test Plan
- ≡ƒô¥ Test cases
- ≡ƒÆ╗ Test scripts
- ≡ƒùâ∩╕Å Test data
- ≡ƒôè Execution logs
- ≡ƒÉ¢ Defect reports
- ≡ƒôæ Final Test Summary Report

---

# ≡ƒÅü 16. Definition of Done

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
              Γåô
        Γ£à READY FOR SUBMISSION
```

---

# ≡ƒù║∩╕Å 17. Documentation Relationship

```text
                 ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
                 Γöé      SRS        Γöé
                 Γöé Requirements    Γöé
                 ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö¼ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
                          Γöé
                          Γû╝
                 ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
                 Γöé      SAD        Γöé
                 Γöé Architecture   Γöé
                 Γöé & Design        Γöé
                 ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö¼ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
                          Γöé
                          Γû╝
                 ΓöîΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÉ
                 Γöé      STP        Γöé
                 Γöé Testing & QA    Γöé
                 ΓööΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓö¼ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÿ
                          Γöé
                          Γû╝
                    StreamHub
                    Deliverable
```

# ≡ƒÜÇ 18. Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Python | 3.11 or newer (tested with 3.13) |
| Node.js | 20.19 or newer, or 22.12 or newer (required by Vite 8) |
| PostgreSQL | A recent version (tested with 16), with a database named `streamhub` |
| Git | any recent version |

### 1∩╕ÅΓâú Clone the repository

```bash
git clone https://github.com/sinchana636142/Team4.git
cd Team4
```

### 2∩╕ÅΓâú Backend setup

```bash
cd backend
python -m venv .venv

# activate it (pick the line for your system):
#   Windows Command Prompt:  .venv\Scripts\activate
#   Windows Git Bash:        source .venv/Scripts/activate
#   Mac / Linux:             source .venv/bin/activate

pip install -r requirements.txt
```

Create a file named **`backend/.env`**. It is git-ignored, so never commit it:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/streamhub
JWT_SECRET_KEY=replace-with-a-long-random-text-of-at-least-32-characters

# Email / OTP Delivery
OTP_DELIVERY_MODE=console
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=
SMTP_PASSWORD=

# Subscription & Playback
REQUIRE_SUBSCRIPTION=true

# Razorpay Payment Gateway (Test Mode)
RAZORPAY_KEY_ID=rzp_test_placeholder_key_id
RAZORPAY_KEY_SECRET=placeholder_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=placeholder_webhook_secret
```

| Variable | Meaning |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Secret used to sign login tokens. **Required**: login fails without it |
| `OTP_DELIVERY_MODE` | `console` prints OTP codes in the backend terminal (development only). Real email delivery is not configured yet |
| `REQUIRE_SUBSCRIPTION` | `true` (default) requires an active subscription to play a video |

Create the tables and start the API:

```bash
python -m app.init_db
uvicorn app.main:app --port 8001 --reload
```

- API: http://127.0.0.1:8001
- Interactive docs (Swagger): http://127.0.0.1:8001/docs
- Health check: http://127.0.0.1:8001/health

### 3∩╕ÅΓâú Frontend setup (second terminal)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The frontend talks to the backend at `http://127.0.0.1:8001`, and CORS allows only `localhost:5173` and `127.0.0.1:5173`.

### 4∩╕ÅΓâú Try it out

1. Click **Sign Up**, register, and read the **OTP code in the backend terminal** (console mode).
2. Log in. Once the Sprint 1 playback pull requests are merged, the navbar shows **Watchlist, History, My Subscription** and **Logout**.
3. Click Γû╢ on a movie to open the player.

> Playback needs a row in the `titles` table with a `video_url`, and an **active subscription** for the user. Until the catalog (upload) and payment features are merged, use the optional demo seed script below.

### 5∩╕ÅΓâú Demo data (optional, development only)

If `backend/seed_dev.py` is present:

```bash
cd backend
python seed_dev.py
```

It creates a verified demo user (`demo@example.com` / `Demo@12345`), the 14 homepage titles with a sample video, two plans, and an active subscription.

### 6∩╕ÅΓâú Run the tests

Unit tests use an in-memory database, so **PostgreSQL is not needed**:

```bash
cd backend
pip install pytest httpx
python -m pytest
```

Expected result with all playback, personalisation, Razorpay hosted checkout, and content administration features merged: **53 passed** (32 playback/personalisation + 8 Razorpay checkout + 13 admin & catalog).


Performance (OTT-NF-001) load test with Locust:

```bash
cd backend
pip install locust
locust -f locustfile.py --host http://127.0.0.1:8001
```

### 7∩╕ÅΓâú Frontend checks

```bash
cd frontend
npm run lint
npm run build
```

---

# ≡ƒôè 19. Sprint 1 Status & Work Distribution

### Work distribution

| Team member | Assigned issues | No. of issues | Story points |
|---|---|---|---|
| Member 1 ΓÇö Frontend | #1, #2, #12, #20, #6, #11 | 6 | 16 |
| Member 2 ΓÇö Backend | #4, #5, #7, #18, #22, #23 | 6 | 19 |
| Member 3 ΓÇö Playback & Features | #3, #8, #9, #10, #14 | 5 | 17 |
| Member 4 ΓÇö Testing & Integration | #13, #15, #16, #17, #19, #21 | 6 | 22 |

### Feature status

Legend: Γ£à on `main` ┬╖ ≡ƒƒí implemented on a feature branch, merge pending ┬╖ Γ¼£ not on `main` yet

| Issue | Requirement | Feature | Status |
|---|---|---|---|
| #4 | `OTT-F-001` | Register with OTP verification | Γ£à |
| #5 | `OTT-F-002` | Login with JWT | Γ£à |
| ΓÇö | `OTT-F-003` | Password reset with OTP | Γ£à |
| #7 | `OTT-F-004` | Manage viewer profile | Γ£à |
| #22 | `OTT-NF-005` | Modular backend structure | Γ£à |
| #18 | `OTT-NF-001` | API response-time target | ≡ƒƒí Locust login load test on `main`; full run pending |
| #3 | `OTT-F-020` | Play videos | ≡ƒƒí `feature/issue-3-play-video` |
| #8 | `OTT-F-021` | Resume from last position | ≡ƒƒí `feature/issue-8-resume-playback` |
| #9 | `OTT-F-022` | Watch history | ≡ƒƒí `feature/issue-9-watch-history` |
| #10 | `OTT-F-030` | Watchlist | ≡ƒƒí `feature/issue-10-watchlist` |
| #14 | `OTT-F-042` | Subscription and expiry status | ≡ƒƒí `feature/issue-14-subscription-status` |
| #11 | `OTT-F-031` | 1ΓÇô5 star ratings | Γ¼£ |
| #12 | `OTT-F-040` | Subscription plans | ≡ƒƒí `member4/testing-integration` |
| #13 | `OTT-F-041` | Hosted payment checkout | ≡ƒƒí `member4/testing-integration` |
| #15 | `OTT-F-050` | Upload titles and metadata | ≡ƒƒí `member4/testing-integration` |
| #16 | `OTT-F-051` | Publish / unpublish titles | ≡ƒƒí `member4/testing-integration` |
| #17 | `OTT-F-052` | View users and subscription status | ≡ƒƒí `member4/testing-integration` |
| #19 | `OTT-NF-002` | Video start-up time Γëñ 5 s | ≡ƒƒí `member4/testing-integration` |
| #20 | `OTT-NF-003` | Desktop and tablet layouts | Γ¼£ |
| #21 | `OTT-NF-004` | 50 concurrent users | ≡ƒƒí `member4/testing-integration` |
| #23 | `OTT-NF-006` | Availability in demo/test windows | Γ¼£ |


> ≡ƒô¥ **Keep this table current.** When a pull request is merged, change its status to Γ£à. Issues #1, #2 and #6 are tracked on GitHub Issues and are not listed here.

---

# ≡ƒùé∩╕Å 20. Repository Structure

```text
Team4/
Γö£ΓöÇΓöÇ README.md
Γö£ΓöÇΓöÇ StreamHub_SRS.pdf               Requirements
Γö£ΓöÇΓöÇ StreamHub_SAD.pdf               Architecture & design
Γö£ΓöÇΓöÇ StreamHub_Test_Plan.pdf         Test plan
Γö£ΓöÇΓöÇ .github/workflows/blank.yml     CI: checks that README and the 3 documents exist
Γöé
Γö£ΓöÇΓöÇ backend/                        FastAPI + SQLAlchemy + PostgreSQL
Γöé   Γö£ΓöÇΓöÇ requirements.txt
Γöé   Γö£ΓöÇΓöÇ locustfile.py               Load test (OTT-NF-001)
Γöé   Γö£ΓöÇΓöÇ seed_dev.py                 Optional demo data (development only)
Γöé   Γö£ΓöÇΓöÇ app/
Γöé   Γöé   Γö£ΓöÇΓöÇ main.py                 App creation, CORS, router registration
Γöé   Γöé   Γö£ΓöÇΓöÇ database.py             Engine, session, Base, get_db
Γöé   Γöé   Γö£ΓöÇΓöÇ init_db.py              Creates all tables
Γöé   Γöé   Γö£ΓöÇΓöÇ core/                   config.py (env settings), security.py (bcrypt, JWT)
Γöé   Γöé   Γö£ΓöÇΓöÇ models/                 user, title, subscription (Plan, Subscription),
Γöé   Γöé   Γöé                           playback (PlaybackProgress, WatchHistory), watchlist
Γöé   Γöé   Γö£ΓöÇΓöÇ schemas/                Pydantic request/response models
Γöé   Γöé   Γö£ΓöÇΓöÇ services/               Business logic (auth, otp, email, subscription,
Γöé   Γöé   Γöé                           playback, resume, history)
Γöé   Γöé   ΓööΓöÇΓöÇ routers/                auth, profile, catalog, playback,
Γöé   Γöé                               subscription, admin, watchlist
Γöé   ΓööΓöÇΓöÇ tests/
Γöé       ΓööΓöÇΓöÇ playback_features/      Unit tests (TC-Play-01..03, TC-Personal-01, TC-Sub-03)
Γöé
ΓööΓöÇΓöÇ frontend/                       React + Vite
    ΓööΓöÇΓöÇ src/
        Γö£ΓöÇΓöÇ App.jsx                 Home page and screen switching
        Γö£ΓöÇΓöÇ Auth.jsx, Login.jsx, ForgotPassword.jsx
        ΓööΓöÇΓöÇ features/
            Γö£ΓöÇΓöÇ api.js              Shared fetch helper (adds the login token)
            Γö£ΓöÇΓöÇ playback/           Player, resume, watch history
            Γö£ΓöÇΓöÇ watchlist/          Watchlist button and screen
            ΓööΓöÇΓöÇ subscription/       "My Subscription" screen
```

**How a request flows:** `router` (HTTP and validation) ΓåÆ `service` (business rules) ΓåÆ `model` (database tables). Keep new code in the same layers, and do not call the database directly from a router if a service exists.

---

# ≡ƒöî 21. Implemented API Endpoints

The backend currently has **no `/api` prefix**. Routes that need login expect the header `Authorization: Bearer <access_token>` and return `401` without it.

### Authentication & profile

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/auth/register` | Register and send an OTP |
| `POST` | `/auth/verify-otp` | Verify the registration OTP |
| `POST` | `/auth/login` | Returns `{access_token, token_type, user}` |
| `POST` | `/auth/forgot-password` | Start password reset |
| `POST` | `/auth/verify-reset-otp` | Verify the reset OTP |
| `POST` | `/auth/reset-password` | Set a new password |
| `GET` | `/auth/me` ┬╖ `/profile/me` | Current user |
| `PATCH` | `/profile/me` | Update name / avatar |

### Playback, watchlist and subscription ≡ƒöÆ

| Method | Path | Purpose | Issue |
|---|---|---|---|
| `GET` | `/subscription/status` | Plan, price, status, expiry date | #14 |
| `GET` | `/playback/{title_id}` | Returns `{title_id, title, video_url}`; needs an active subscription (`403` otherwise) | #3 |
| `GET` | `/playback/{title_id}/resume` | `{position_seconds}` (0 if never watched) | #8 |
| `PUT` | `/playback/{title_id}/resume` | Save `{position_seconds}` (must be ΓëÑ 0) | #8 |
| `POST` | `/playback/{title_id}/history` | Record a viewing session | #9 |
| `GET` | `/playback/history` | The user's history, newest first | #9 |
| `GET` | `/watchlist` | The user's watchlist | #10 |
| `POST` | `/watchlist/{title_id}` | Add a title (adding twice is harmless) | #10 |
| `DELETE` | `/watchlist/{title_id}` | Remove a title | #10 |


### Subscription & Payment (OTT-F-040, OTT-F-041)

| Method | Path | Purpose | Issue |
|---|---|---|---|
| GET | /subscription/plans | List available subscription plans (Basic ₹199, Premium ₹499) | #12 |
| POST | /subscription/checkout | Create Razorpay order with server-validated amount | #13 |
| POST | /subscription/verify | Verify Razorpay payment signature & activate subscription | #13 |
| POST | /subscription/webhook | Process payment gateway webhook event | #13 |

### Content Administration (OTT-F-050, OTT-F-051, OTT-F-052) 🔒

| Method | Path | Purpose | Issue |
|---|---|---|---|
| POST | /admin/titles | Upload title metadata and media files | #15 |
| PATCH | /admin/titles/{title_id}/publish | Publish or unpublish a title | #16 |
| GET | /admin/users | View registered users and subscription status | #17 |

### Not implemented yet

`/catalog` and `/admin` are placeholders that only return a status message. Ratings, plans, payment checkout and admin upload are still to be built.

### Error format

Errors are JSON, for example `{"detail": "Title not found"}` with status `404`. Typical codes: `401` not logged in, `403` no active subscription, `404` not found, `422` invalid input.

### Data rules

- Every query for history, watchlist, resume position and subscription is **filtered by the logged-in user**, so users cannot see each other's data.
- Timestamps (such as `watched_at`) are stored in UTC and returned as ISO text ending in `Z`.
- Payment card data is never handled by StreamHub (see Section 6).

---

# ≡ƒñ¥ 22. Team Git Workflow

1. **One branch per issue**, named `feature/issue-<number>-<short-name>`, for example `feature/issue-3-play-video`.
2. **Commit messages** follow `type(scope): what changed #issue`.
   - Types: `feat`, `test`, `fix`, `docs`, `chore`
   - Example: `feat(playback): record and list watch history (OTT-F-022) #9`
3. **Open a Pull Request into `main`.** The title ends with `(closes #<issue>)` so the issue closes when it merges.
4. **Every PR needs at least one review** before merging. Ask the owner of the affected area:
   - backend files (`models`, `routers`, `services`) ΓåÆ the Backend member
   - screens or `App.jsx` ΓåÆ the Frontend member
   - anything touching shared tables ΓåÆ also the Testing & Integration member
5. **Merge in dependency order.** Do not merge a PR that builds on another until the earlier one is merged. Prefer **"Create a merge commit"** over squash for stacked branches.
6. **Stacked branches:** if your issue depends on an unmerged one, branch from that issue's branch, otherwise branch from an up-to-date `main`.
7. **Conflicts in `App.jsx` and `models/__init__.py`** are expected, because several people add to them. Keep **both** sides.
8. **Shared tables:** `users`, `titles`, `plans`, `subscriptions` are shared. Extend the existing model, **never create a second table** for the same thing. Agree API contracts and table changes in the team chat first.
9. **Never commit** `.env`, passwords, tokens, `node_modules` or `__pycache__`.
10. **Before opening a PR:** the backend tests pass and `npm run build` succeeds.

---

# ≡ƒº¡ 23. Known Limitations & Next Steps

| Area | Current state | Next step |
|---|---|---|
| Catalog | The homepage shows 14 hard-coded movies in `App.jsx` | Build catalog endpoints and load titles from the database (`titles` table) |
| Titles | The `titles` table exists, but nothing uploads titles yet | Admin upload and publish/unpublish (#15, #16); extend `Title`, do not recreate it |
| Subscriptions | Nothing marks a subscription as `active` yet | Payment callback (#13) must set `status="active"`, `start_date`, `expiry_date` after a **verified** payment |
| Playback | Requires an active subscription (SRS use-case diagram: *Play Video includes Check Active Subscription*) | Until payment works, use `REQUIRE_SUBSCRIPTION=false` or the demo seed |
| Video | The backend returns a stored URL and the browser's HTML5 player streams it | Point `video_url` at cloud/static storage |
| OTP email | Console mode only | Configure real email delivery for production |
| API prefix | Routes have no `/api` prefix, unlike the SAD | Agree one convention in the team and update `app/main.py` and `frontend/src/features/api.js` |
| Frontend | Screen switching is state-based in `App.jsx`, with no router library | Consider React Router if the number of screens grows |
| Security | HTTPS and login rate limiting (SRS ┬º6) are not set up in code | Configure at deployment and add rate limiting |

---

# Γ¡É StreamHub in One Sentence

> **StreamHub is a secure, responsive, modular web-based OTT platform connecting content discovery, video playback, personalization, subscriptions, payment integration, and administration into one academically scoped and testable system.**

---

## ≡ƒôû Source Documents

This README consolidates the project's:

1. **Software Requirements Specification (SRS) v1.0**
2. **Software Architecture and Design Specification (SAD) v1.0**
3. **Software Test Plan (STP) v1.0**

> This README preserves the scope, terminology, architecture, requirements, and testing approach defined by those documents and does not assume implementation details that they do not specify.

---

### ≡ƒÄ¼ StreamHub
**Discover. Watch. Personalize. Subscribe.**

**TEAM-04 ┬╖ PES University ┬╖ UE24CS341A Software Engineering**

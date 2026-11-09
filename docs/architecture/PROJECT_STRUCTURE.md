# StreamHub OTT — Comprehensive Project Structure & Module Organization

**Document ID:** PES-UE24CS341A-ARCH-001  
**Project:** StreamHub – Academic OTT Video Streaming Platform  
**University:** PES University · Department of Computer Science and Engineering  
**Course:** Software Engineering – UE24CS341A  
**Team:** TEAM-04  
**Date:** November 9, 2026  

---

## 1. High-Level Repository Layout

StreamHub is designed around a decoupled, 3-tier modular architecture separating the user interface, business logic API, persistent data storage, and testing frameworks:

```text
Team4/
├── README.md                           # Master Project Overview & Setup Instructions
├── StreamHub_SRS.pdf                   # Software Requirements Specification (Authority)
├── StreamHub_SAD.pdf                   # Software Architecture & Design Specification
├── StreamHub_Test_Plan.pdf             # Software Test Plan (Authority)
├── sprint-02_demo.mp4                  # Sprint 2 Video Demo Walkthrough
├── sprint1_demo.mp4                    # Sprint 1 Video Demo Walkthrough
│
├── frontend/                           # React 19 + Vite Single Page Application (SPA)
│   ├── index.html                      # HTML5 Root Template
│   ├── package.json                    # Node dependencies & scripts
│   ├── vite.config.js                  # Vite configuration & proxy definitions
│   ├── public/                         # Public static assets (intro video, favicon)
│   └── src/                            # Application source code
│       ├── main.jsx                    # React entry point
│       ├── App.jsx                     # Root router & screen state manager
│       ├── components/                 # Reusable UI components (Navbar, HeroSlider, etc.)
│       ├── features/                   # Domain feature modules (playback, auth, admin, etc.)
│       ├── profiles/                   # Multi-profile & Kids experience
│       └── data/                       # Client catalog seeds & series metadata
│
├── backend/                            # FastAPI + SQLAlchemy 2.0 Backend Service
│   ├── requirements.txt                # Python dependencies
│   ├── locustfile.py                   # Locust load testing suite (OTT-NF-004)
│   ├── measure_startup_time.py         # Video start-up time benchmark (OTT-NF-002)
│   ├── migrate_db.py                   # Automated DB migration helper
│   ├── seed_dev.py                     # Development seed data
│   │
│   ├── app/                            # Application Core Package
│   │   ├── main.py                     # FastAPI application factory, CORS & routers
│   │   ├── database.py                 # SQLAlchemy engine, sessionmaker & get_db
│   │   ├── init_db.py                  # Table creation & initial plan seeding
│   │   ├── core/                       # Configuration, security & JWT utilities
│   │   ├── models/                     # SQLAlchemy ORM database models
│   │   ├── schemas/                    # Pydantic request/response validation models
│   │   ├── routers/                    # FastAPI route handlers (HTTP layer)
│   │   ├── services/                   # Business logic layer (isolated from HTTP)
│   │   └── static/uploads/             # Local video and poster uploads storage
│   │
│   └── tests/                          # Automated Pytest Test Suites
│       ├── conftest.py                 # Global test fixtures (in-memory DB, client)
│       ├── test_auth.py                # Authentication, OTP & JWT tests
│       ├── test_admin_titles.py        # Admin title management & RBAC tests
│       ├── test_admin_users.py         # Admin user & subscription monitoring tests
│       ├── test_payment_checkout.py    # Razorpay checkout & signature tests
│       ├── test_subscription_lifecycle.py # End-to-end subscription & tier tests
│       └── playback_features/          # Playback, resume, history & watchlist tests
│
└── docs/                               # Project Documentation & Quality Assurance
    ├── architecture/                   # Architectural blueprints & design specifications
    │   ├── PROJECT_STRUCTURE.md        # This structural blueprint
    │   ├── STREAMHUB_ARCHITECTURE.md   # System architecture diagram & flow walk-throughs
    │   ├── DATABASE_STRUCTURE.md       # Database ER diagram & schema documentation
    │   ├── API_MAPPING.md              # Frontend-to-Backend endpoint mapping
    │   ├── CONFIGURATION_GUIDE.md      # Environment variables & security setup
    │   ├── CODE_QUALITY_AUDIT.md       # Code quality, dependency & static analysis
    │   └── STRUCTURE_AUDIT_REPORT.md   # File integrity & path verification report
    │
    └── testing/                        # Software Testing & Quality Assurance Deliverables
        ├── 00_EXISTING_TEST_AUDIT.md   # Baseline test implementation audit
        ├── 01_Test_Cases.xlsx          # Multi-sheet Excel workbook (8 modules)
        ├── 02_Requirement_Traceability_Matrix.xlsx # Full RTM Excel workbook
        ├── 03_Unit_Test_Report.md      # Unit test execution report (80/80 passed)
        ├── 04_Integration_Test_Report.md # Subsystem integration report
        ├── 05_System_Validation_Report.md # End-to-end workflow validation
        ├── 06_Code_Coverage_Report/    # Statement & branch coverage report + JSON
        ├── 07_Branch_Coverage_Report.md # Branch coverage breakdown & analysis
        ├── 08_Performance_Test_Report.md # Performance latency & load report
        ├── 09_Security_Test_Report.md  # Security controls evaluation report
        ├── 10_Razorpay_Subscription_Test_Report.md # Payment gateway & access audit
        ├── 11_Defect_and_Retest_Report.xlsx # Defect tracking & retest log
        ├── 12_Final_Test_Summary_Report.md # Final STSR evaluation report
        ├── test_data/                  # Test data catalog & guide
        ├── test_scripts/               # Automation scripts & instructions
        └── evidence/                   # Logs, JUnit XML, Pytest HTML & Locust reports
```

---

## 2. Detailed Component Responsibilities

| Directory / File | Layer | Primary Responsibility | Important Files | Connected To |
|---|---|---|---|---|
| `frontend/src/` | Presentation | Single-page interactive user interface | `App.jsx`, `main.jsx` | FastAPI backend via HTTP/REST |
| `frontend/src/features/` | Feature UI | Modular screen components | `VideoPlayer.jsx`, `RazorpayCheckout.jsx`, `AdminDashboard.jsx` | Shared `api.js` client |
| `frontend/src/components/` | Reusable UI | Layout, navigation, banners | `Navbar.jsx`, `HeroSlider.jsx` | `App.jsx` state |
| `backend/app/main.py` | API Entrypoint | FastAPI bootstrap, CORS, router registration | `main.py` | Routers, Middlewares |
| `backend/app/core/` | Infrastructure | Configuration settings & cryptography | `config.py`, `security.py` | Services, Routers |
| `backend/app/routers/` | HTTP Interface | Route dispatch, validation, HTTP response codes | `auth.py`, `playback.py`, `subscription.py`, `admin.py` | Services, Schemas |
| `backend/app/services/` | Business Logic | Domain rules, external APIs, access control | `subscription_service.py`, `playback_service.py`, `auth_service.py` | Models, Database |
| `backend/app/models/` | Data Access | SQLAlchemy 2.0 ORM database schema definitions | `user.py`, `title.py`, `subscription.py`, `playback.py` | PostgreSQL / SQLite |
| `backend/app/schemas/` | Validation | Pydantic request/response serialization | `subscription.py`, `admin.py`, `user.py` | Routers, OpenAPI Docs |
| `backend/tests/` | QA & Testing | Automated test suites (80 tests) | `conftest.py`, `test_subscription_lifecycle.py` | Backend application |
| `docs/testing/` | QA Deliverables | Formal PES University STP deliverables | Workbooks, Test reports, Evidence | Academic evaluators |

---

## 3. Strict Layering Architecture

StreamHub strictly enforces the **3-Tier Architecture Pattern**:

$$\text{HTTP Request} \longrightarrow \mathbf{Router} \xrightarrow{\text{Pydantic Schema}} \mathbf{Service} \xrightarrow{\text{SQLAlchemy ORM}} \mathbf{Model} \longrightarrow \text{Database}$$

- **Rule 1:** Routers do not perform direct database queries; they delegate all database interactions to dedicated service classes.
- **Rule 2:** Services do not manipulate HTTP request/response objects directly; they accept clean Python types and return domain models.
- **Rule 3:** Models represent pure database table structures and relationships; they do not contain business logic or HTTP awareness.

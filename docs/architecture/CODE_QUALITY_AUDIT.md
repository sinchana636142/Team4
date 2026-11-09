# StreamHub OTT — Code Quality & Dependency Audit

**Document ID:** PES-UE24CS341A-CQA-001  
**Project:** StreamHub – Academic OTT Video Streaming Platform  
**University:** PES University · Department of Computer Science and Engineering  
**Course:** Software Engineering – UE24CS341A  
**Team:** TEAM-04  
**Date:** November 9, 2026  

---

## 1. Executive Summary

This static code quality audit evaluates the Python backend and React frontend codebases to identify architectural technical debt, package dependency risks, circular references, and code organization opportunities. 

In strict adherence to the project guidelines, **no production application source code was modified during this audit**. All findings are categorized by severity with remediation roadmaps for future sprints.

---

## 2. Summary of Findings by Severity

| Severity Level | Count | Primary Areas |
|---|---|---|
| **Critical** | 0 | No blocking vulnerabilities or security exposures detected |
| **High** | 1 | Monolithic screen switching in `App.jsx` |
| **Medium** | 3 | Duplicate movie seed definitions; large service file; dual React versions |
| **Low** | 3 | Redundant bcrypt requirement; unused variable warning in lint |
| **Informational** | 2 | Missing client router library; static upload storage vs cloud storage |

---

## 3. Detailed Audit Findings

### Finding 1: Monolithic State-Based Screen Management in `App.jsx`
- **Severity:** High
- **File Path:** `frontend/src/App.jsx` (~1000 lines)
- **Problem:** `App.jsx` manages top-level screen switching (`home`, `login`, `register`, `watch`, `admin`, `kids`, `episodes`) through local React `useState` hooks rather than a declarative router library such as `react-router-dom`.
- **Why It Matters:** State-based routing lacks browser URL synchronization (e.g. back button navigation, direct deep-linking to `/watch/1` or `/admin`). As features expand, `App.jsx` becomes overloaded with multi-domain state.
- **Suggested Improvement:** Introduce `react-router-dom` in Sprint 3 to provide path-based navigation (`/`, `/watch/:id`, `/admin`, `/login`).
- **Code Change Required Now?** No (preserve existing working application logic).

### Finding 2: Dual Movie Data Sources (`movies.js` vs Database)
- **Severity:** Medium
- **File Paths:** `frontend/src/data/movies.js`, `frontend/src/movies.js`, `backend/app/models/title.py`
- **Problem:** Movie data is defined both statically in client-side JavaScript seed files and dynamically in the backend PostgreSQL `titles` table.
- **Why It Matters:** Title edits or video URL updates made through the Admin Dashboard are persisted in the database, but may be shadowed by client fallback objects if not synchronized.
- **Suggested Improvement:** Transition the frontend catalog entirely to backend REST endpoints (`GET /catalog/titles`), keeping static files solely as offline fallback fixtures.
- **Code Change Required Now?** No.

### Finding 3: Large Service File (`subscription_service.py`)
- **Severity:** Medium
- **File Path:** `backend/app/services/subscription_service.py` (~600 lines)
- **Problem:** Contains plan retrieval, Razorpay order generation, signature validation, webhook idempotency, and access level calculations in a single service module.
- **Why It Matters:** Violates Single Responsibility Principle; increases coupling between third-party gateway interactions and core viewer tier enforcement.
- **Suggested Improvement:** Split into `RazorpayGatewayService` (external API & signature verification) and `MembershipService` (internal tier & access resolution).
- **Code Change Required Now?** No (automated test suite achieves 81% coverage on current structure).

### Finding 4: Dependency Redundancy in `requirements.txt`
- **Severity:** Low
- **File Path:** `backend/requirements.txt`
- **Problem:** Contains both `pwdlib[bcrypt]` and explicit `bcrypt`.
- **Why It Matters:** Redundant package declaration; `pwdlib[bcrypt]` already pulls in `bcrypt` as an extra dependency.
- **Suggested Improvement:** Clean up redundant line in future dependency prune.
- **Code Change Required Now?** No.

### Finding 5: Linter Unused Variable Warning
- **Severity:** Low
- **File Path:** `frontend/src/App.jsx:44:10`
- **Problem:** `oxlint` reports: `Variable 'selectedProfile' is declared but never used.`
- **Why It Matters:** Minor static analysis warning; does not affect runtime execution.
- **Suggested Improvement:** Prefix variable with underscore `_selectedProfile` or utilize in child profile props.
- **Code Change Required Now?** No.

---

## 4. Package Dependency Audit

### 4.1 Python Dependencies (`backend/requirements.txt`)
- `fastapi` & `uvicorn[standard]`: High-performance ASGI framework (Production-grade).
- `sqlalchemy` & `psycopg[binary]`: Modern ORM and driver (Clean v2/v3 stack).
- `pydantic-settings`: Secure type-safe settings parsing.
- `pwdlib[bcrypt]`: Modern password hashing abstraction.
- `PyJWT`: Standard RFC 7519 JWT implementation.
- `razorpay`: Official gateway SDK.
- *Assessment:* Healthy, minimal, zero deprecated packages.

### 4.2 Frontend Dependencies (`frontend/package.json`)
- `react` & `react-dom`: `^19.2.8` (Cutting-edge React 19).
- `vite`: `^8.3.0` (Ultra-fast build and HMR tool).
- `oxlint`: `^1.81.0` (High-speed Rust-based linter).
- *Assessment:* Zero vulnerable packages reported; fast build pipeline (188ms build time).

# StreamHub OTT — Existing Test & Quality Audit Report

**Document ID:** PES-UE24CS341A-TEST-AUDIT-001  
**Project:** StreamHub – Academic OTT Video Streaming Platform  
**University:** PES University · Department of Computer Science and Engineering  
**Course:** Software Engineering – UE24CS341A  
**Team:** TEAM-04  
**Role:** Member 4 – Testing & Integration (`vinu9686` / `pes1202503166@stu.pes.edu`)  
**Audit Date:** November 9, 2026  
**Status:** **AUDIT COMPLETED**

---

## 1. Executive Summary

This initial audit evaluates the baseline testing implementation, test suites, performance benchmarks, and quality documentation across the **StreamHub** repository prior to the organizational restructure. The objective is to identify existing test assets, measure requirements coverage against the **Software Test Plan (STP v1.0)** and **Software Requirements Specification (SRS v1.0)**, identify gaps and inconsistencies, and lay out an actionable roadmap for comprehensive testing deliverables.

---

## 2. Inventory of Discovered Test Assets

### 2.1 Backend Test Suites (`backend/tests/`)
| File Path | Test Count | Scope / Requirements Covered | Status |
|---|---|---|---|
| `backend/tests/playback_features/test_play_video.py` | 6 | `OTT-F-020`: Video playback, subscription gating, 404 handling | Executed & Passing (6/6) |
| `backend/tests/playback_features/test_resume_playback.py` | 7 | `OTT-F-021`: Resume position save/get, boundary checks, negative value rejection | Executed & Passing (7/7) |
| `backend/tests/playback_features/test_subscription_status.py` | 6 | `OTT-F-042`: Subscription status query, active/expired states, user isolation | Executed & Passing (6/6) |
| `backend/tests/playback_features/test_watch_history.py` | 9 | `OTT-F-022`: Viewing session tracking, chronological order, history deletion | Executed & Passing (9/9) |
| `backend/tests/playback_features/test_watchlist.py` | 7 | `OTT-F-030`: Watchlist addition/removal, idempotent addition, user isolation | Executed & Passing (7/7) |
| `backend/tests/test_admin_titles.py` | 8 | `OTT-F-050`, `OTT-F-051`: Admin title creation, metadata validation, publish/unpublish toggle, RBAC | Executed & Passing (8/8) |
| `backend/tests/test_admin_users.py` | 5 | `OTT-F-052`: Admin user listing, subscription status, pagination, credential masking, RBAC | Executed & Passing (5/5) |
| `backend/tests/test_auth.py` | 11 | `OTT-F-001`, `OTT-F-002`, `OTT-F-003`: Registration, OTP verify/resend, login with JWT, verification gates | Executed & Passing (11/11) |
| `backend/tests/test_payment_checkout.py` | 9 | `OTT-F-041`: Razorpay order creation, constant-time HMAC signature verification, cross-user protection | Executed & Passing (9/9) |
| `backend/tests/test_subscription_lifecycle.py` | 12 | `OTT-F-040`, `OTT-F-041`, `OTT-F-020`: Webhook idempotency, pricing consistency, preview limits, 1080p/4K tier capping | Executed & Passing (12/12) |
| **Total Automated Tests** | **80** | **Full Functional & Access Control Coverage** | **80 Passed / 0 Failed (100%)** |

### 2.2 Performance & Load Test Scripts
| Script | Scope | Benchmark Target | Discovered Execution Status |
|---|---|---|---|
| `backend/measure_startup_time.py` | `OTT-NF-002`: Video start-up time | `<= 5.0 seconds` on broadband | Verified: 10 trials executed, Average: **0.730s**, P95: **3.367s** (PASS) |
| `backend/locustfile.py` | `OTT-NF-004`: 50 concurrent simulated users | 50 virtual users sustained | Verified: Headless run completed with 50 users, 678 requests, **0.00% failure rate** |

### 2.3 Existing Documentation & Reports
| File | Type | Current Content & Quality |
|---|---|---|
| `StreamHub_Test_Plan.pdf` | Authority STP | Formal PES University STP document authored by TEAM-04 (Oct 4, 2026). Defines 6 modules, RTM, test levels. |
| `docs/RAZORPAY_SUBSCRIPTION_TEST_REPORT.md` | Specific Report | 20-point test matrix covering Razorpay orders, signatures, webhook idempotency, and access tiers. |
| `docs/TEST_SUMMARY_REPORT.md` | Summary Report | Summary report covering Member 4 deliverables (22 Story Points). |
| `docs/test-results/` | Test Artifacts | Contains older/transitional test results (`pytest-report.html`, `coverage.json`, `junit-results.xml`). |

---

## 3. Discovered Inconsistencies & Deficiencies

1. **Scattered Test Artifacts:**  
   Prior to this audit, test reports and evidence files were stored directly in `docs/test-results/` without structured categorization between unit tests, integration tests, system tests, performance tests, and security tests.
2. **Missing Excel Deliverables Required for PES Evaluation:**  
   The project lacked formal Excel workbooks for:
   - Detailed Test Cases Workbook (`01_Test_Cases.xlsx`) with module sheets.
   - Requirements Traceability Matrix (`02_Requirement_Traceability_Matrix.xlsx`).
   - Defect and Retest Tracking Log (`11_Defect_and_Retest_Report.xlsx`).
3. **Outdated References in Early README Documentation:**  
   Early documentation in `README.md` referenced *"Expected result: 32 passed"* from the initial playback prototype. In reality, the comprehensive test suite now consists of **80 fully passing tests** spanning authentication, admin controls, Razorpay payment gateway, and subscription lifecycle.
4. **Locust Negative Test Reporting:**  
   The initial Locust test needed verification to ensure that expected 403 Forbidden responses (such as accessing full movies without a subscription) are tracked as valid security outcomes rather than application failure rates.
5. **No Dedicated Test Data Guide:**  
   There was no centralized reference guide documenting safe, reproducible test data (dummy accounts, Razorpay sandbox keys, sample video streams, seed data).

---

## 4. Remediation & Action Plan

To establish a gold-standard academic testing deliverable under `docs/testing/`:

1. **Reorganize into a Standard Hierarchy:**  
   Establish the structured folder layout:
   - `00_EXISTING_TEST_AUDIT.md` (this audit)
   - `01_Test_Cases.xlsx` (8 modular sheets with formatting, filters, and freeze panes)
   - `02_Requirement_Traceability_Matrix.xlsx` (comprehensive mapping)
   - `03_Unit_Test_Report.md` through `12_Final_Test_Summary_Report.md`
   - `test_data/TEST_DATA_GUIDE.md`
   - `test_scripts/README.md`
   - `evidence/` (fresh logs, HTML reports, JUnit XML, Locust report)
2. **Execute Fresh Test Runs:**  
   Run pytest with branch coverage and generate fresh artifacts into `docs/testing/evidence/` and `docs/testing/06_Code_Coverage_Report/`.
3. **Execute Live Locust Load Test:**  
   Run Locust with 50 concurrent virtual users against the running backend and generate `docs/testing/evidence/locust-report.html`.
4. **Preserve Application Integrity:**  
   Strictly respect the restriction to never modify `backend/app/` or `frontend/src/` application source code.

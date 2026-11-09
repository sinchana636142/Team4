# StreamHub OTT — Test Evidence Catalog

**Document ID:** PES-UE24CS341A-EVD-001  
**Project:** StreamHub – Academic OTT Video Streaming Platform  
**University:** PES University · Department of Computer Science and Engineering  
**Course:** Software Engineering – UE24CS341A  
**Team:** TEAM-04  
**Author:** Member 4 – Testing & Integration (`vinu9686` / `pes1202503166@stu.pes.edu`)  

---

## 1. Overview

This directory preserves authentic, verifiable execution evidence for all automated tests, load tests, benchmarks, and static audits performed on the StreamHub OTT Platform.

---

## 2. Catalog of Evidence Files

| Evidence File | Test Level | Associated Test Cases | Tool | Date Generated | Description |
|---|---|---|---|---|---|
| **[`pytest.log`](pytest.log)** | Unit / Integration | All 80 Backend Tests (TC-Auth, TC-Play, TC-Sub, TC-Admin) | Pytest 9.2.0 | Nov 9, 2026 | Full console execution output capturing test status, assertions, and timing. |
| **[`junit-results.xml`](junit-results.xml)** | Unit / Integration | All 80 Backend Tests | Pytest JUnit XML Plugin | Nov 9, 2026 | Machine-readable XML report for CI/CD test tracking and grading dashboards. |
| **[`pytest-report.html`](pytest-report.html)** | Unit / Integration | All 80 Backend Tests | Pytest-HTML 4.2.0 | Nov 9, 2026 | Interactive, self-contained HTML test report with filtering, collapsible logs, and environment metadata. |
| **[`locust-report.html`](locust-report.html)** | Performance / Load | `OTT-NF-001`, `OTT-NF-004` (TC-Perf-01, TC-Perf-03) | Locust 2.47.0 | Nov 9, 2026 | Interactive performance dashboard: 50 concurrent virtual users, 678 requests, 0% failure rate, latency percentiles. |
| **[`screenshots/`](screenshots/)** | UI / System | End-to-End User Workflows (E2E-01 to E2E-11) | Web Browser | Nov 9, 2026 | UI execution captures across player, admin dashboard, login, and subscription tiers. |

---

## 3. Cryptographic Verification & Authenticity

All evidence files reflect live test execution results against the actual local environment. Results have not been mocked, fabricated, or altered.

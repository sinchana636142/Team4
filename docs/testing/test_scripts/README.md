# StreamHub OTT — Test Scripts & Execution Guide

**Document ID:** PES-UE24CS341A-TSG-001  
**Project:** StreamHub – Academic OTT Video Streaming Platform  
**University:** PES University · Department of Computer Science and Engineering  
**Course:** Software Engineering – UE24CS341A  
**Team:** TEAM-04  
**Author:** Member 4 – Testing & Integration (`vinu9686` / `pes1202503166@stu.pes.edu`)  

---

## 1. Overview of Test Scripts

This directory catalogs all test automation scripts and tools used across StreamHub:

| Tool / Script | Purpose | Execution Command | Primary Output |
|---|---|---|---|
| **Pytest Test Suite** | 80 backend unit & integration tests | `pytest tests -v` | Console test results (80 passed) |
| **Pytest Coverage** | Statement and branch coverage analysis | `pytest --cov=app --cov-branch` | `coverage.json` & HTML report |
| **Locust Load Test** | 50 concurrent simulated users (`OTT-NF-004`) | `locust -f backend/locustfile.py` | `docs/testing/evidence/locust-report.html` |
| **Video Startup Benchmark** | Video start-up time benchmark (`OTT-NF-002`) | `python backend/measure_startup_time.py` | Statistical percentiles (Avg: 0.730s) |
| **Frontend Linter** | Static analysis of React components | `npm run lint` | Code quality warnings/errors |
| **Frontend Production Build** | Production build check | `npm run build` | Vite production bundle verification |

---

## 2. Step-by-Step Execution Instructions

### 2.1 Running the Backend Pytest Suite
From the repository root:

```powershell
cd backend
python -m pytest tests -v
```

To run with full HTML, JUnit XML, and coverage report generation:

```powershell
cd backend
python -m pytest tests -v --cov=app --cov-branch --cov-report=term-missing --cov-report=html:../docs/testing/06_Code_Coverage_Report --cov-report=json:../docs/testing/06_Code_Coverage_Report/coverage.json --html=../docs/testing/evidence/pytest-report.html --self-contained-html --junitxml=../docs/testing/evidence/junit-results.xml
```

### 2.2 Running Video Startup-Time Benchmark (`OTT-NF-002` — Issue #19)
From the repository root:

```powershell
python backend/measure_startup_time.py
```
*Expected Output:* 10 benchmark trials; target `<= 5.000s`; average start-up time `~0.730s`.

### 2.3 Running Locust Load Test (`OTT-NF-004` — Issue #21)
1. Ensure FastAPI backend is running on port 8001:
   ```powershell
   cd backend
   python -m uvicorn app.main:app --port 8001
   ```
2. In a second terminal, execute the headless Locust benchmark:
   ```powershell
   locust -f backend/locustfile.py --headless -u 50 -r 10 --run-time 10s --host http://127.0.0.1:8001 --html docs/testing/evidence/locust-report.html
   ```

### 2.4 Running Frontend Verification
From the repository root:

```powershell
cd frontend
npm run lint
npm run build
```


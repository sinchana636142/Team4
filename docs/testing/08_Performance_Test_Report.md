# StreamHub OTT — Performance Test Report

**Document ID:** PES-UE24CS341A-PTR-001  
**Project:** StreamHub – Academic OTT Video Streaming Platform  
**University:** PES University · Department of Computer Science and Engineering  
**Course:** Software Engineering – UE24CS341A  
**Team:** TEAM-04  
**Role:** Member 4 – Testing & Integration (`vinu9686` / `pes1202503166@stu.pes.edu`)  
**Execution Date:** November 9, 2026  
**Tools:** Locust 2.47.0, Python `perf_counter` Benchmark Suite  
**Status:** **ALL PERFORMANCE TARGETS MET (PASS)**

---

## 1. Executive Summary

This report evaluates the performance, latency, and scalability characteristics of the StreamHub platform against the formal non-functional requirements specified in the **Software Requirements Specification (SRS v1.0 §4)** and **Software Test Plan (STP v1.0 §5)**:

1. **`OTT-NF-001` (TC-Perf-01):** API response latency shall be `<= 2.0 seconds` under normal operating load.
2. **`OTT-NF-002` (TC-Perf-02 — Member 4 Issue #19):** Video playback shall start within **5.0 seconds** on a standard broadband connection.
3. **`OTT-NF-004` (TC-Perf-03 — Member 4 Issue #21):** System shall sustain at least **50 concurrent simulated users** without operational errors.

---

## 2. Benchmark 1: Video Start-up Time (`OTT-NF-002` / `TC-Perf-02` — Issue #19)

### 2.1 Test Methodology
- **Script:** `backend/measure_startup_time.py`
- **Methodology:** 
  1. Authenticated client issues `GET /playback/{title_id}` to retrieve authorized playback metadata (API Latency).
  2. Client parses streaming `video_url` and issues HTTP range request (`bytes=0-262143`) for the initial 256KB progressive video segment.
  3. Client measures time until initial audio/video frames are fully buffered.
  4. Total Start-up Time = API Authorization Latency + Network Stream TTFB + Initial Buffer Time.
  5. 10 consecutive trials executed to compute statistical percentiles.

### 2.2 Execution Results
| Trial # | API Latency (ms) | Initial Buffer Latency (ms) | Total Start-up Time (s) | Verdict |
|---|---|---|---|---|
| **Trial 1** | 34.5 ms | 3,330.6 ms | 3.367 s | **PASS** |
| **Trial 2** | 16.0 ms | 475.0 ms | 0.492 s | **PASS** |
| **Trial 3** | 12.3 ms | 402.6 ms | 0.416 s | **PASS** |
| **Trial 4** | 18.0 ms | 417.4 ms | 0.437 s | **PASS** |
| **Trial 5** | 16.8 ms | 448.7 ms | 0.467 s | **PASS** |
| **Trial 6** | 15.6 ms | 399.8 ms | 0.416 s | **PASS** |
| **Trial 7** | 8.4 ms | 387.6 ms | 0.397 s | **PASS** |
| **Trial 8** | 7.6 ms | 407.4 ms | 0.416 s | **PASS** |
| **Trial 9** | 9.1 ms | 415.4 ms | 0.426 s | **PASS** |
| **Trial 10** | 11.5 ms | 451.7 ms | 0.464 s | **PASS** |

### 2.3 Statistical Summary
| Metric | Measured Value | Acceptance Threshold | Compliance |
|---|---|---|---|
| **Target Threshold** | `<= 5.000 s` | `<= 5.000 s` | **MET** |
| **Average Start-up Time** | **0.730 seconds** | `<= 5.000 s` | **EXCEEDED (6.8x faster)** |
| **Median Start-up Time** | **0.431 seconds** | `<= 5.000 s` | **EXCEEDED** |
| **95th Percentile (P95)** | **3.367 seconds** | `<= 5.000 s` | **MET** |
| **Average API Latency** | **15.0 ms** | `<= 2,000 ms` | **EXCEEDED** |
| **Overall Pass Rate** | **100.0% (10/10)** | 100% | **MET** |

---

## 3. Benchmark 2: 50 Concurrent Simulated Users (`OTT-NF-004` / `TC-Perf-03` — Issue #21)

### 3.1 Test Configuration
- **Tool:** Locust 2.47.0 (Headless Mode)
- **Workload Script:** `backend/locustfile.py`
- **Target Host:** `http://127.0.0.1:8001`
- **Virtual Users:** **50 concurrent users**
- **Ramp-up Spawn Rate:** **10 users / second**
- **Run Duration:** 10 seconds sustained at peak load
- **Simulated Viewer Workflow:**
  1. User authentication (`POST /auth/login`) with JWT token capture.
  2. Catalog browse (`GET /catalog/titles`).
  3. Genre filtering (`GET /catalog/titles?genre=...`).
  4. Title details inspection (`GET /catalog/titles/{id}`).
  5. Subscription status check (`GET /subscription/status`).
  6. Subscription plans list (`GET /subscription/plans`).
  7. Resume playback query (`GET /playback/{id}/resume`).
  8. Watchlist retrieval (`GET /watchlist`).
  9. Profile query (`GET /profile/me`).
  10. System healthcheck (`GET /health`).

### 3.2 Locust Load Test Results
| Endpoint | Requests | Failures | Failure % | Avg Latency | Min | Max | Median | P95 | Req/s |
|---|---|---|---|---|---|---|---|---|---|
| `POST /auth/login` | 50 | 0 | **0.0%** | 288 ms | 234 ms | 469 ms | 280 ms | 360 ms | 5.84 |
| `GET /catalog/titles` | 136 | 0 | **0.0%** | 12 ms | 2 ms | 142 ms | 9 ms | 26 ms | 15.88 |
| `GET /catalog/titles/[id]` | 72 | 0 | **0.0%** | 15 ms | 2 ms | 149 ms | 9 ms | 71 ms | 8.41 |
| `GET /catalog/titles?genre=[genre]` | 76 | 0 | **0.0%** | 15 ms | 2 ms | 155 ms | 9 ms | 55 ms | 8.87 |
| `GET /catalog/genres` | 46 | 0 | **0.0%** | 13 ms | 2 ms | 149 ms | 7 ms | 56 ms | 5.37 |
| `GET /playback/[id]/resume` | 76 | 0 | **0.0%** | 14 ms | 3 ms | 92 ms | 12 ms | 33 ms | 8.87 |
| `GET /profile/me` | 49 | 0 | **0.0%** | 10 ms | 3 ms | 53 ms | 8 ms | 26 ms | 5.72 |
| `GET /subscription/plans` | 52 | 0 | **0.0%** | 16 ms | 3 ms | 152 ms | 14 ms | 31 ms | 6.07 |
| `GET /subscription/status` | 67 | 0 | **0.0%** | 15 ms | 3 ms | 116 ms | 12 ms | 30 ms | 7.82 |
| `GET /watchlist` | 42 | 0 | **0.0%** | 10 ms | 3 ms | 20 ms | 11 ms | 18 ms | 4.90 |
| `GET /health` | 12 | 0 | **0.0%** | 4 ms | 1 ms | 11 ms | 4 ms | 11 ms | 1.40 |
| **AGGREGATED TOTAL** | **678** | **0** | **0.00%** | **34 ms** | **1 ms** | **469 ms** | **10 ms** | **260 ms** | **79.15 req/s** |

---

## 4. Requirement Verification Matrix

| Requirement | STP Acceptance Criteria | Actual Measured Result | Verdict |
|---|---|---|---|
| **`OTT-NF-001` (TC-Perf-01)** | 95% of API requests completed in `<= 2.0 seconds` | **P95 Latency: 260 ms** (7.7x faster than threshold) | **PASS** |
| **`OTT-NF-002` (TC-Perf-02)** | Video start-up time `<= 5.0 seconds` | **Average: 0.730s** (Max: 3.367s) | **PASS** |
| **`OTT-NF-004` (TC-Perf-03)** | Sustain 50 concurrent simulated users without errors | **50 virtual users sustained, 0% failure rate (678 requests)** | **PASS** |

---

## 5. Evidence Reference

The complete interactive Locust load testing HTML report is archived at:  
[`docs/testing/evidence/locust-report.html`](evidence/locust-report.html)

# StreamHub OTT — UI & Execution Screenshots Catalog

**Document ID:** PES-UE24CS341A-SCR-001  
**Project:** StreamHub – Academic OTT Video Streaming Platform  
**University:** PES University · Department of Computer Science and Engineering  
**Course:** Software Engineering – UE24CS341A  
**Team:** TEAM-04  
**Author:** Member 4 – Testing & Integration (`vinu9686` / `pes1202503166@stu.pes.edu`)  

---

## 1. Overview

This directory catalogs UI execution screenshots and screen captures demonstrating verified features of the StreamHub web application.

---

## 2. Screenshot Manifest

| Screenshot Identifier | Feature / Screen | Test Case Reference | Description |
|---|---|---|---|
| **`SCR-01_Homepage_Browse`** | Homepage & Hero Slider | `TC-CAT-001`, `TC-CAT-002` | Catalog browsing showing responsive movie rows, genre filtering, and hero banner. |
| **`SCR-02_VideoPlayer_Preview`** | Video Player 2-Min Preview | `TC-PLAY-002`, `OTT-F-020` | HTML5 custom video player showing 2-minute preview cap and upgrade prompt modal for Free Viewers. |
| **`SCR-03_Subscription_Plans`** | Subscription Pricing Screen | `TC-SUB-001`, `OTT-F-040` | Plan comparison showing Free (₹0), Basic (₹199), and Premium (₹499) cards. |
| **`SCR-04_Razorpay_Modal`** | Razorpay Hosted Checkout | `TC-SUB-002`, `OTT-F-041` | Razorpay standard checkout popup displaying authenticated test transaction. |
| **`SCR-05_Admin_Dashboard`** | Admin Dashboard Management | `TC-ADMIN-001`, `TC-ADMIN-006` | Administrative interface showing Title Upload, Publish Toggle, and Users table with subscription status. |
| **`SCR-06_Locust_Dashboard`** | Locust Performance Dashboard | `TC-PERF-003`, `OTT-NF-004` | Real-time Locust graphical dashboard showing 50 virtual users and 0% errors. |

---

## 3. Preservation Notice

Screenshots are captured from the active React SPA (`http://localhost:5173`) interacting with the live FastAPI backend (`http://127.0.0.1:8001`). Video walkthrough demos are archived at `sprint-02_demo.mp4` and `sprint1_demo.mp4`.

# StreamHub OTT — Frontend to Backend API Mapping Specification

**Document ID:** PES-UE24CS341A-API-001  
**Project:** StreamHub – Academic OTT Video Streaming Platform  
**University:** PES University · Department of Computer Science and Engineering  
**Course:** Software Engineering – UE24CS341A  
**Team:** TEAM-04  
**Date:** November 9, 2026  

---

## 1. Master API Route Mapping Table

The following table maps every user-facing feature and React component to its underlying FastAPI endpoint, HTTP method, service layer handler, and database model:

| Feature / Domain | Frontend Component / Page | API Endpoint | Method | Backend Router | Business Service | Database Model | Auth Required? |
|---|---|---|---|---|---|---|---|
| **Registration** | `frontend/src/Auth.jsx` | `/auth/register` | `POST` | `routers/auth.py` | `AuthService.register_user` | `User` | No |
| **Verify Registration OTP** | `frontend/src/Auth.jsx` | `/auth/verify-otp` | `POST` | `routers/auth.py` | `AuthService.verify_otp` | `User` | No |
| **Resend Registration OTP** | `frontend/src/Auth.jsx` | `/auth/resend-otp` | `POST` | `routers/auth.py` | `AuthService.resend_otp` | `User` | No |
| **User Login** | `frontend/src/Login.jsx` | `/auth/login` | `POST` | `routers/auth.py` | `AuthService.authenticate_user` | `User` | No |
| **Forgot Password Request** | `frontend/src/ForgotPassword.jsx` | `/auth/forgot-password` | `POST` | `routers/auth.py` | `AuthService.forgot_password` | `User` | No |
| **Verify Reset OTP** | `frontend/src/ForgotPassword.jsx` | `/auth/verify-reset-otp` | `POST` | `routers/auth.py` | `AuthService.verify_reset_otp` | `User` | No |
| **Set New Password** | `frontend/src/ForgotPassword.jsx` | `/auth/reset-password` | `POST` | `routers/auth.py` | `AuthService.reset_password` | `User` | No |
| **Current User Info** | `frontend/src/App.jsx` | `/auth/me` | `GET` | `routers/auth.py` | `AuthService.get_current_user` | `User` | Yes (Bearer) |
| **Viewer Profile** | `frontend/src/features/profile/ProfilePage.jsx` | `/profile/me` | `GET` | `routers/profile.py` | `AuthService.get_user_profile` | `User` | Yes (Bearer) |
| **Update Profile Avatar/Name** | `frontend/src/features/profile/ProfilePage.jsx` | `/profile/me` | `PATCH` | `routers/profile.py` | `AuthService.update_profile` | `User` | Yes (Bearer) |
| **Browse Catalog** | `frontend/src/features/movies/MoviesPage.jsx` | `/catalog/titles` | `GET` | `routers/catalog.py` | `AdminService.get_published_titles` | `Title` | No |
| **Browse by Genre** | `frontend/src/components/WebSeries.jsx` | `/catalog/titles?genre={g}` | `GET` | `routers/catalog.py` | `AdminService.filter_by_genre` | `Title` | No |
| **Title Details** | `frontend/src/MovieDetailsPage.jsx` | `/catalog/titles/{id}` | `GET` | `routers/catalog.py` | `AdminService.get_title_by_id` | `Title` | No |
| **Catalog Genres List** | `frontend/src/components/HeroSlider.jsx` | `/catalog/genres` | `GET` | `routers/catalog.py` | `AdminService.list_genres` | `Title` | No |
| **Authorized Playback URL** | `frontend/src/features/playback/WatchPage.jsx` | `/playback/{title_id}` | `GET` | `routers/playback.py` | `PlaybackService.get_playback_url` | `Title`, `Subscription` | Yes (Bearer) |
| **Get Resume Position** | `frontend/src/features/playback/VideoPlayer.jsx` | `/playback/{title_id}/resume` | `GET` | `routers/playback.py` | `ResumeService.get_position` | `PlaybackProgress` | Yes (Bearer) |
| **Save Resume Position** | `frontend/src/features/playback/VideoPlayer.jsx` | `/playback/{title_id}/resume` | `PUT` | `routers/playback.py` | `ResumeService.save_position` | `PlaybackProgress` | Yes (Bearer) |
| **Log Viewing Session** | `frontend/src/features/playback/VideoPlayer.jsx` | `/playback/{title_id}/history` | `POST` | `routers/playback.py` | `HistoryService.record_session` | `WatchHistory` | Yes (Bearer) |
| **Get Watch History** | `frontend/src/features/playback/HistoryPage.jsx` | `/playback/history` | `GET` | `routers/playback.py` | `HistoryService.get_user_history` | `WatchHistory`, `Title` | Yes (Bearer) |
| **Clear All History** | `frontend/src/features/playback/HistoryPage.jsx` | `/playback/history` | `DELETE` | `routers/playback.py` | `HistoryService.clear_history` | `WatchHistory` | Yes (Bearer) |
| **Delete History Item** | `frontend/src/features/playback/HistoryPage.jsx` | `/playback/history/{id}` | `DELETE` | `routers/playback.py` | `HistoryService.delete_entry` | `WatchHistory` | Yes (Bearer) |
| **Get User Watchlist** | `frontend/src/features/watchlist/WatchlistPage.jsx` | `/watchlist` | `GET` | `routers/watchlist.py` | `AdminService.get_user_watchlist` | `WatchlistItem`, `Title` | Yes (Bearer) |
| **Add to Watchlist** | `frontend/src/features/watchlist/WatchlistButton.jsx` | `/watchlist/{title_id}` | `POST` | `routers/watchlist.py` | `AdminService.add_to_watchlist` | `WatchlistItem` | Yes (Bearer) |
| **Remove from Watchlist** | `frontend/src/features/watchlist/WatchlistButton.jsx` | `/watchlist/{title_id}` | `DELETE` | `routers/watchlist.py` | `AdminService.remove_from_watchlist` | `WatchlistItem` | Yes (Bearer) |
| **List Subscription Plans** | `frontend/src/SubscriptionPlans.jsx` | `/subscription/plans` | `GET` | `routers/subscription.py` | `SubscriptionService.get_plans` | `Plan` | No |
| **Get Current Subscription** | `frontend/src/features/subscription/SubscriptionStatus.jsx` | `/subscription/status` | `GET` | `routers/subscription.py` | `SubscriptionService.get_status` | `Subscription`, `Plan` | Yes (Bearer) |
| **Create Checkout Order** | `frontend/src/features/subscription/RazorpayCheckout.jsx` | `/subscription/checkout` | `POST` | `routers/subscription.py` | `SubscriptionService.create_order` | `Subscription`, `Payment` | Yes (Bearer) |
| **Verify Payment Signature** | `frontend/src/features/subscription/RazorpayCheckout.jsx` | `/subscription/verify-payment` | `POST` | `routers/subscription.py` | `SubscriptionService.verify_payment` | `Subscription`, `Payment` | Yes (Bearer) |
| **Razorpay Webhook Listener** | Razorpay Cloud Service | `/subscription/webhook` | `POST` | `routers/subscription.py` | `SubscriptionService.handle_webhook` | `WebhookEvent`, `Payment` | Signature Verified |
| **Admin Create Title** | `frontend/src/features/admin/AdminDashboard.jsx` | `/admin/titles` | `POST` | `routers/admin.py` | `AdminService.create_title` | `Title` | Yes (Admin) |
| **Admin List All Titles** | `frontend/src/features/admin/AdminDashboard.jsx` | `/admin/titles` | `GET` | `routers/admin.py` | `AdminService.list_all_titles` | `Title` | Yes (Admin) |
| **Admin Toggle Publish** | `frontend/src/features/admin/AdminDashboard.jsx` | `/admin/titles/{id}/publish` | `PATCH` | `routers/admin.py` | `AdminService.toggle_publish` | `Title` | Yes (Admin) |
| **Admin View Users Table** | `frontend/src/features/admin/AdminDashboard.jsx` | `/admin/users` | `GET` | `routers/admin.py` | `AdminService.list_users_with_sub` | `User`, `Subscription` | Yes (Admin) |
| **Admin Upload Poster** | `frontend/src/features/admin/AdminDashboard.jsx` | `/admin/upload/poster` | `POST` | `routers/admin.py` | `AdminService.save_poster_file` | File System | Yes (Admin) |
| **Admin Upload Video** | `frontend/src/features/admin/AdminDashboard.jsx` | `/admin/upload/video` | `POST` | `routers/admin.py` | `AdminService.save_video_file` | File System | Yes (Admin) |
| **System Health Check** | Monitoring & CI | `/health` | `GET` | `main.py` | Direct | None | No |

---

## 2. API Architectural Observations

### 2.1 Backend Endpoints Without Full Frontend Integration
- **`/admin/titles/{id}` (`PUT` / `DELETE`):**  
  Full update and hard deletion endpoints are fully implemented and tested in `backend/app/routers/admin.py`, but the frontend UI primarily uses the toggle publishing endpoint (`PATCH /admin/titles/{id}/publish`) to hide/unhide titles.
- **`/playback/history/{id}` (`DELETE`):**  
  Single-session removal is supported on the backend; the UI currently features "Clear All History".

### 2.2 Client-Side Data Handling
- **Web Series Episode Configuration:**  
  Movie records are dynamically served from the database (`titles` table). Web series episodes currently leverage metadata definitions in `frontend/src/data/series.js` with playback URLs dynamically routed through `/playback/{title_id}`.


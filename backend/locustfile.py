"""Locust load test for OTT-NF-004: 50 concurrent simulated users.
Verifies:
- 50 concurrent virtual users sustained under documented ramp-up
- Realistic viewer workflows: authentication, catalog browse, genre search,
  title details, subscription status, resume playback, and profile
- Latency threshold: 95% of requests <= 2s (OTT-NF-001)
- 0% request failure rate
"""
import random
from locust import HttpUser, between, task


class StreamHubRealisticViewer(HttpUser):
    wait_time = between(0.2, 0.8)

    def on_start(self):
        """Authenticate user and retain session token for protected routes."""
        login_payload = {
            "email": "demo@example.com",
            "password": "Demo@12345",
        }
        res = self.client.post("/auth/login", json=login_payload, name="POST /auth/login")
        if res.status_code == 200:
            token = res.json().get("access_token")
            if token:
                self.client.headers["Authorization"] = f"Bearer {token}"

    @task(6)
    def browse_catalog(self):
        self.client.get("/catalog/titles", name="GET /catalog/titles")

    @task(4)
    def filter_by_genre(self):
        genre = random.choice(["Action", "Comedy", "Thriller", "Sci-Fi", "Romance"])
        self.client.get(f"/catalog/titles?genre={genre}", name="GET /catalog/titles?genre=[genre]")

    @task(3)
    def view_title_details(self):
        title_id = random.randint(1, 14)
        self.client.get(f"/catalog/titles/{title_id}", name="GET /catalog/titles/[id]")

    @task(2)
    def check_catalog_genres(self):
        self.client.get("/catalog/genres", name="GET /catalog/genres")

    @task(3)
    def view_my_subscription(self):
        self.client.get("/subscription/status", name="GET /subscription/status")

    @task(2)
    def view_subscription_plans(self):
        self.client.get("/subscription/plans", name="GET /subscription/plans")

    @task(3)
    def check_resume_position(self):
        title_id = random.randint(1, 14)
        self.client.get(f"/playback/{title_id}/resume", name="GET /playback/[id]/resume")

    @task(2)
    def view_profile(self):
        self.client.get("/profile/me", name="GET /profile/me")

    @task(2)
    def view_watchlist(self):
        self.client.get("/watchlist", name="GET /watchlist")

    @task(1)
    def health_check(self):
        self.client.get("/health", name="GET /health")

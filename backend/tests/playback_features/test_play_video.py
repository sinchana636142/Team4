"""TC-Play-01 (OTT-F-020): play a video in the browser."""
from datetime import date, timedelta

from app.models.subscription import Plan, Subscription
from app.routers.playback import router


def give_active_subscription(db, user_id=1):
    db.add(Plan(id=1, name="Basic", price=199))
    db.add(Subscription(user_id=user_id, plan_id=1, status="active",
                        expiry_date=date.today() + timedelta(days=30)))
    db.commit()


def test_subscribed_user_gets_video_url(make_client, db):
    give_active_subscription(db)
    response = make_client(router).get("/playback/1")
    assert response.status_code == 200
    assert response.json() == {"title_id": 1, "title": "Movie One", "video_url": "http://cdn/1.mp4"}


def test_user_without_subscription_is_blocked(make_client):
    response = make_client(router).get("/playback/1")
    assert response.status_code == 403
    assert response.json()["detail"] == "Active subscription required"


def test_subscription_check_can_be_switched_off(make_client, monkeypatch):
    monkeypatch.setenv("REQUIRE_SUBSCRIPTION", "false")
    assert make_client(router).get("/playback/1").status_code == 200


def test_unknown_title_returns_404(make_client, db):
    give_active_subscription(db)
    assert make_client(router).get("/playback/999").status_code == 404


def test_unpublished_title_returns_404(make_client, db):
    give_active_subscription(db)
    assert make_client(router).get("/playback/3").status_code == 404


def test_requires_login(make_client):
    assert make_client(router, user_id=None).get("/playback/1").status_code == 401

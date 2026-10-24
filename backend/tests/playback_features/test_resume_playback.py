"""TC-Play-02 (OTT-F-021): resume playback from the last watched position."""
from app.models.playback import PlaybackProgress
from app.routers.playback import router


def test_never_watched_starts_at_zero(make_client):
    response = make_client(router).get("/playback/1/resume")
    assert response.status_code == 200
    assert response.json() == {"position_seconds": 0}


def test_saved_position_is_returned(make_client):
    client = make_client(router)
    assert client.put("/playback/1/resume", json={"position_seconds": 125}).status_code == 200
    assert client.get("/playback/1/resume").json() == {"position_seconds": 125}


def test_saving_again_updates_the_same_row(make_client, db):
    client = make_client(router)
    client.put("/playback/1/resume", json={"position_seconds": 10})
    client.put("/playback/1/resume", json={"position_seconds": 99})
    assert db.query(PlaybackProgress).count() == 1
    assert client.get("/playback/1/resume").json()["position_seconds"] == 99


def test_positions_are_separate_per_user_and_title(make_client):
    make_client(router, user_id=1).put("/playback/1/resume", json={"position_seconds": 50})
    assert make_client(router, user_id=2).get("/playback/1/resume").json()["position_seconds"] == 0
    assert make_client(router, user_id=1).get("/playback/2/resume").json()["position_seconds"] == 0


def test_negative_position_is_rejected(make_client):
    response = make_client(router).put("/playback/1/resume", json={"position_seconds": -5})
    assert response.status_code == 422


def test_unknown_title_returns_404(make_client):
    client = make_client(router)
    assert client.get("/playback/999/resume").status_code == 404
    assert client.put("/playback/999/resume", json={"position_seconds": 5}).status_code == 404


def test_requires_login(make_client):
    assert make_client(router, user_id=None).get("/playback/1/resume").status_code == 401

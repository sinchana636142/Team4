"""TC-Play-03 (OTT-F-022): record each viewing session in the watch history."""
from app.routers.playback import router


def test_viewing_session_is_recorded(make_client):
    client = make_client(router)
    response = client.post("/playback/1/history")
    assert response.status_code == 201
    assert response.json()["title_id"] == 1

    history = client.get("/playback/history").json()
    assert len(history) == 1
    assert history[0]["title"] == "Movie One"
    assert history[0]["watched_at"].endswith("Z")


def test_each_session_is_a_new_entry_newest_first(make_client):
    client = make_client(router)
    client.post("/playback/1/history")
    client.post("/playback/2/history")
    client.post("/playback/1/history")

    names = [item["title"] for item in client.get("/playback/history").json()]
    assert names == ["Movie One", "Movie Two", "Movie One"]


def test_history_is_private_to_each_user(make_client):
    make_client(router, user_id=1).post("/playback/1/history")
    assert make_client(router, user_id=2).get("/playback/history").json() == []


def test_empty_history_is_an_empty_list(make_client):
    assert make_client(router).get("/playback/history").json() == []


def test_unknown_title_returns_404(make_client):
    assert make_client(router).post("/playback/999/history").status_code == 404


def test_requires_login(make_client):
    client = make_client(router, user_id=None)
    assert client.get("/playback/history").status_code == 401
    assert client.post("/playback/1/history").status_code == 401

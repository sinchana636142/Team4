import { apiFetch } from "../api";

export function recordView(titleId) {
  return apiFetch(`/playback/${titleId}/history`, { method: "POST" });
}

// returns [{ id, title_id, title, poster_url, watched_at }]
export function getHistory() {
  return apiFetch("/playback/history");
}

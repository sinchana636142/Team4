import { apiFetch } from "../api";

export function recordView(titleId) {
  return apiFetch(`/playback/${titleId}/history`, { method: "POST" });
}

// returns [{ id, title_id, title, poster_url, watched_at }]
export function getHistory() {
  return apiFetch("/playback/history");
}

export function deleteHistoryEntry(historyId) {
  return apiFetch(`/playback/history/${historyId}`, { method: "DELETE" });
}

export function clearHistory() {
  return apiFetch("/playback/history", { method: "DELETE" });
}

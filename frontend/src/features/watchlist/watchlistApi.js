import { apiFetch } from "../api";

// returns [{ title_id, title, poster_url }]
export function getWatchlist() {
  return apiFetch("/watchlist");
}

export function addToWatchlist(titleId) {
  return apiFetch(`/watchlist/${titleId}`, { method: "POST" });
}

export function removeFromWatchlist(titleId) {
  return apiFetch(`/watchlist/${titleId}`, { method: "DELETE" });
}

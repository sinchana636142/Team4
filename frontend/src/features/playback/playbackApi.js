import { apiFetch } from "../api";

// returns { title_id, title, video_url }
export function getPlayback(titleId) {
  return apiFetch(`/playback/${titleId}`);
}

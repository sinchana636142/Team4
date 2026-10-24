import { apiFetch } from "../api";

// returns { position_seconds }
export function getResume(titleId) {
  return apiFetch(`/playback/${titleId}/resume`);
}

export function saveResume(titleId, positionSeconds) {
  return apiFetch(`/playback/${titleId}/resume`, {
    method: "PUT",
    body: JSON.stringify({ position_seconds: positionSeconds }),
  });
}

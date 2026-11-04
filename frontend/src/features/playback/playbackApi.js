import { apiFetch } from "../api";

// Returns basic playback info { title_id, title, video_url }
export function getPlayback(titleId) {
  return apiFetch(`/playback/${titleId}`);
}

// Check title access permissions and available qualities for current user
export function getPlaybackAccess(titleId) {
  return apiFetch(`/playback/${titleId}/access`);
}

// 2-minute preview playback for Free Viewers
export function getPlaybackPreview(titleId) {
  return apiFetch(`/playback/${titleId}/preview`);
}

// Official trailer playback
export function getPlaybackTrailer(titleId) {
  return apiFetch(`/playback/${titleId}/trailer`);
}

// Detailed playback stream request with quality, deviceId, and kind
export function getPlaybackStream(titleId, { kind = "full", quality = "1080p", deviceId } = {}) {
  const params = new URLSearchParams();
  if (kind) params.set("kind", kind);
  if (quality) params.set("quality", quality);
  if (deviceId) params.set("device_id", deviceId);
  params.set("details", "true");
  return apiFetch(`/playback/${titleId}?${params.toString()}`);
}

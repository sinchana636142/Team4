// Small fetch helper for the playback / watchlist / subscription features.
// Uses the same backend address and saved login token as Login.jsx.
export const API_URL = "http://127.0.0.1:8001";

export async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  const token = sessionStorage.getItem("streamhub_access_token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error("Cannot connect to the backend. Check that it is running on port 8001.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof data.detail === "string" ? data.detail : "Request failed");
  }
  return data;
}

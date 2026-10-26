import { API_URL, apiFetch } from "../api";

export function fetchAdminTitles(skip = 0, limit = 100, genre = "") {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  if (genre && genre !== "All") params.append("genre", genre);
  return apiFetch(`/admin/titles?${params.toString()}`);
}

export function createAdminTitle(payload) {
  return apiFetch("/admin/titles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminTitle(titleId, payload) {
  return apiFetch(`/admin/titles/${titleId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function publishTitle(titleId) {
  return apiFetch(`/admin/titles/${titleId}/publish`, {
    method: "PATCH",
  });
}

export function unpublishTitle(titleId) {
  return apiFetch(`/admin/titles/${titleId}/unpublish`, {
    method: "PATCH",
  });
}

export async function uploadMediaFile(endpoint, file) {
  const formData = new FormData();
  formData.append("file", file);

  const token = sessionStorage.getItem("streamhub_access_token");
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/admin/upload/${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof data.detail === "string" ? data.detail : "File upload failed");
  }
  return data;
}

export function fetchAdminUsers(skip = 0, limit = 20, search = "") {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
  if (search) params.append("search", search);
  return apiFetch(`/admin/users?${params.toString()}`);
}

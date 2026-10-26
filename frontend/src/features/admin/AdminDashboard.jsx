import { useEffect, useState } from "react";
import "../features.css";
import {
  createAdminTitle,
  fetchAdminTitles,
  fetchAdminUsers,
  publishTitle,
  unpublishTitle,
  uploadMediaFile,
} from "./adminApi";

export default function AdminDashboard({ onBack }) {
  const [activeTab, setActiveTab] = useState("titles"); // "titles" or "users"

  // Current logged in user
  const currentUser = (() => {
    try {
      const saved = sessionStorage.getItem("streamhub_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const isAdmin = Boolean(currentUser?.is_admin || currentUser?.role === "admin");

  // --- Title Management State (OTT-F-050 & OTT-F-051) ---
  const [titles, setTitles] = useState([]);
  const [titlesLoading, setTitlesLoading] = useState(false);
  const [titlesError, setTitlesError] = useState("");
  const [titlesSuccess, setTitlesSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    genre: "Action",
    year: new Date().getFullYear(),
    synopsis: "",
    poster_url: "",
    video_url: "",
    is_published: true,
  });
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [submittingTitle, setSubmittingTitle] = useState(false);

  // --- Users & Subscription State (OTT-F-052) ---
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === "titles") {
        loadTitles();
      } else if (activeTab === "users") {
        loadUsers();
      }
    }
  }, [isAdmin, activeTab, page]);

  function loadTitles() {
    setTitlesLoading(true);
    setTitlesError("");
    fetchAdminTitles()
      .then(setTitles)
      .catch((err) => setTitlesError(err.message))
      .finally(() => setTitlesLoading(false));
  }

  function loadUsers() {
    setUsersLoading(true);
    setUsersError("");
    fetchAdminUsers(page * pageSize, pageSize, searchQuery)
      .then((data) => {
        setUsers(data.items || []);
        setTotalUsers(data.total || 0);
      })
      .catch((err) => setUsersError(err.message))
      .finally(() => setUsersLoading(false));
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(0);
    loadUsers();
  }

  async function handleTitleSubmit(e) {
    e.preventDefault();
    if (!formData.title.trim()) {
      setTitlesError("Title name is required.");
      return;
    }

    setSubmittingTitle(true);
    setTitlesError("");
    setTitlesSuccess("");

    try {
      const payload = {
        title: formData.title.trim(),
        genre: formData.genre,
        year: formData.year ? Number(formData.year) : null,
        synopsis: formData.synopsis.trim() || null,
        poster_url: formData.poster_url.trim() || null,
        video_url: formData.video_url.trim() || null,
        is_published: Boolean(formData.is_published),
      };

      const newTitle = await createAdminTitle(payload);
      setTitlesSuccess(`Title "${newTitle.title}" uploaded successfully!`);
      setFormData({
        title: "",
        genre: "Action",
        year: new Date().getFullYear(),
        synopsis: "",
        poster_url: "",
        video_url: "",
        is_published: true,
      });
      loadTitles();
    } catch (err) {
      setTitlesError("Upload failed: " + err.message);
    } finally {
      setSubmittingTitle(false);
    }
  }

  async function handlePosterFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPoster(true);
    setTitlesError("");
    try {
      const res = await uploadMediaFile("poster", file);
      setFormData((prev) => ({ ...prev, poster_url: res.url }));
      setTitlesSuccess(`Poster uploaded: ${res.filename}`);
    } catch (err) {
      setTitlesError("Poster upload failed: " + err.message);
    } finally {
      setUploadingPoster(false);
    }
  }

  async function handleVideoFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    setTitlesError("");
    try {
      const res = await uploadMediaFile("video", file);
      setFormData((prev) => ({ ...prev, video_url: res.url }));
      setTitlesSuccess(`Video uploaded: ${res.filename}`);
    } catch (err) {
      setTitlesError("Video upload failed: " + err.message);
    } finally {
      setUploadingVideo(false);
    }
  }

  async function handleTogglePublish(titleId, currentlyPublished) {
    setTitlesError("");
    try {
      if (currentlyPublished) {
        await unpublishTitle(titleId);
      } else {
        await publishTitle(titleId);
      }
      loadTitles();
    } catch (err) {
      setTitlesError("Failed to update publication status: " + err.message);
    }
  }

  if (!currentUser || !isAdmin) {
    return (
      <div className="feature-page" style={{ maxWidth: "600px", margin: "2rem auto", textAlign: "center" }}>
        <button type="button" onClick={onBack} style={{ marginBottom: "1rem" }}>← Back</button>
        <div role="alert" className="feature-error" style={{ padding: "1.5rem", borderRadius: "8px" }}>
          <h2>Access Denied (403)</h2>
          <p>Administrator privileges are required to access Content and User Administration (OTT-SR-006).</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feature-page" style={{ maxWidth: "1100px", margin: "1rem auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <button type="button" onClick={onBack} style={{ marginRight: "1rem" }}>← Back to StreamHub</button>
          <span style={{ fontSize: "1.3rem", fontWeight: "bold" }}>🛠️ StreamHub Admin Portal</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => setActiveTab("titles")}
            style={{
              background: activeTab === "titles" ? "#e50914" : "#333",
              color: "#fff",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Titles & Content (OTT-F-050 / 051)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            style={{
              background: activeTab === "users" ? "#e50914" : "#333",
              color: "#fff",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Users & Subscriptions (OTT-F-052)
          </button>
        </div>
      </div>

      {activeTab === "titles" && (
        <section>
          <h3>Upload New Title & Metadata (OTT-F-050)</h3>
          {titlesError && <div role="alert" className="feature-error" style={{ marginBottom: "1rem" }}>{titlesError}</div>}
          {titlesSuccess && <div role="status" style={{ background: "#103d15", border: "1px solid #2ecc71", padding: "0.75rem", borderRadius: "4px", marginBottom: "1rem" }}>✅ {titlesSuccess}</div>}

          <form onSubmit={handleTitleSubmit} style={{ background: "#1c1c1c", padding: "1.5rem", borderRadius: "8px", marginBottom: "2rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}>Title Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inception"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem", background: "#2a2a2a", border: "1px solid #444", color: "#fff", borderRadius: "4px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}>Genre</label>
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem", background: "#2a2a2a", border: "1px solid #444", color: "#fff", borderRadius: "4px" }}
                >
                  {["Action", "Comedy", "Thriller", "Sci-Fi", "Romance", "Horror", "Drama"].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}>Release Year</label>
                <input
                  type="number"
                  min="1888"
                  max="2100"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem", background: "#2a2a2a", border: "1px solid #444", color: "#fff", borderRadius: "4px" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}>Synopsis</label>
              <textarea
                rows="3"
                placeholder="Brief plot synopsis..."
                value={formData.synopsis}
                onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                style={{ width: "100%", padding: "0.6rem", background: "#2a2a2a", border: "1px solid #444", color: "#fff", borderRadius: "4px" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}>Poster Image URL / File</label>
                <input
                  type="text"
                  placeholder="https://... or upload file"
                  value={formData.poster_url}
                  onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem", background: "#2a2a2a", border: "1px solid #444", color: "#fff", borderRadius: "4px", marginBottom: "0.5rem" }}
                />
                <input type="file" accept="image/*" onChange={handlePosterFile} disabled={uploadingPoster} style={{ fontSize: "0.85rem" }} />
                {uploadingPoster && <span style={{ fontSize: "0.85rem", color: "#f39c12", marginLeft: "0.5rem" }}>Uploading poster...</span>}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.9rem" }}>Video Stream URL / File</label>
                <input
                  type="text"
                  placeholder="https://... (mp4/m3u8) or upload file"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  style={{ width: "100%", padding: "0.6rem", background: "#2a2a2a", border: "1px solid #444", color: "#fff", borderRadius: "4px", marginBottom: "0.5rem" }}
                />
                <input type="file" accept="video/*" onChange={handleVideoFile} disabled={uploadingVideo} style={{ fontSize: "0.85rem" }} />
                {uploadingVideo && <span style={{ fontSize: "0.85rem", color: "#f39c12", marginLeft: "0.5rem" }}>Uploading video...</span>}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                />
                <span>Publish immediately to catalog (OTT-F-051)</span>
              </label>

              <button
                type="submit"
                disabled={submittingTitle}
                style={{
                  background: "#e50914",
                  color: "#fff",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  fontWeight: "bold",
                  borderRadius: "4px",
                  cursor: submittingTitle ? "not-allowed" : "pointer",
                }}
              >
                {submittingTitle ? "Saving Title..." : "Upload Title"}
              </button>
            </div>
          </form>

          <h3>Catalog Titles & Publication Status (OTT-F-051)</h3>
          {titlesLoading ? (
            <p>Loading catalog titles...</p>
          ) : titles.length === 0 ? (
            <p>No titles found in catalog.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
                <thead>
                  <tr style={{ background: "#2a2a2a", textAlign: "left" }}>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid #444" }}>ID</th>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid #444" }}>Poster</th>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid #444" }}>Title</th>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid #444" }}>Genre</th>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid #444" }}>Year</th>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid #444" }}>Status</th>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid #444" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {titles.map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid #333" }}>
                      <td style={{ padding: "0.75rem" }}>{t.id}</td>
                      <td style={{ padding: "0.75rem" }}>
                        {t.poster_url ? (
                          <img src={t.poster_url} alt={t.title} style={{ width: "40px", height: "60px", objectFit: "cover", borderRadius: "3px" }} />
                        ) : (
                          <div style={{ width: "40px", height: "60px", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "#888" }}>No poster</div>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem", fontWeight: "bold" }}>{t.title}</td>
                      <td style={{ padding: "0.75rem" }}>{t.genre || "—"}</td>
                      <td style={{ padding: "0.75rem" }}>{t.year || "—"}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <span style={{
                          padding: "0.25rem 0.6rem",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          background: t.is_published ? "#103d15" : "#3d1010",
                          color: t.is_published ? "#2ecc71" : "#e74c3c",
                        }}>
                          {t.is_published ? "PUBLISHED" : "UNPUBLISHED"}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(t.id, t.is_published)}
                          style={{
                            padding: "0.4rem 0.8rem",
                            borderRadius: "4px",
                            border: "none",
                            cursor: "pointer",
                            background: t.is_published ? "#555" : "#2ecc71",
                            color: "#fff",
                            fontSize: "0.85rem",
                          }}
                        >
                          {t.is_published ? "Unpublish" : "Publish"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === "users" && (
        <section>
          <h3>Registered Users & Subscription Status (OTT-F-052)</h3>
          <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
            Content Administrator view showing registered users and active/expired subscriptions. Passwords, OTP hashes, and tokens are protected and never displayed.
          </p>

          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: "1", padding: "0.6rem", background: "#2a2a2a", border: "1px solid #444", color: "#fff", borderRadius: "4px" }}
            />
            <button
              type="submit"
              style={{ background: "#e50914", color: "#fff", border: "none", padding: "0.6rem 1.25rem", borderRadius: "4px", cursor: "pointer" }}
            >
              Search
            </button>
          </form>

          {usersError && <div role="alert" className="feature-error">{usersError}</div>}
          {usersLoading ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <p>No registered users found.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
                <thead>
                  <tr style={{ background: "#2a2a2a", textAlign: "left" }}>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid #444" }}>ID</th>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid #444" }}>Full Name</th>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid #444" }}>Email</th>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid #444" }}>Role</th>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid #444" }}>Verified</th>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid #444" }}>Subscription</th>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid #444" }}>Plan</th>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid #444" }}>Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    let badgeColor = "#777";
                    let badgeBg = "#222";
                    if (u.subscription_status === "active") {
                      badgeColor = "#2ecc71";
                      badgeBg = "#103d15";
                    } else if (u.subscription_status === "expired") {
                      badgeColor = "#e74c3c";
                      badgeBg = "#3d1010";
                    } else if (u.subscription_status === "pending") {
                      badgeColor = "#f39c12";
                      badgeBg = "#3d2d10";
                    }

                    return (
                      <tr key={u.id} style={{ borderBottom: "1px solid #333" }}>
                        <td style={{ padding: "0.75rem" }}>{u.id}</td>
                        <td style={{ padding: "0.75rem", fontWeight: "bold" }}>{u.full_name}</td>
                        <td style={{ padding: "0.75rem" }}>{u.email}</td>
                        <td style={{ padding: "0.75rem" }}>
                          <span style={{ fontSize: "0.85rem", color: u.is_admin ? "#f39c12" : "#aaa" }}>
                            {u.is_admin ? "Admin" : u.role || "Viewer"}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem" }}>
                          {u.is_verified ? "✅ Yes" : "⏳ Pending"}
                        </td>
                        <td style={{ padding: "0.75rem" }}>
                          <span style={{
                            padding: "0.25rem 0.6rem",
                            borderRadius: "12px",
                            fontSize: "0.8rem",
                            fontWeight: "bold",
                            background: badgeBg,
                            color: badgeColor,
                          }}>
                            {u.subscription_status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem" }}>{u.plan_name || "—"}</td>
                        <td style={{ padding: "0.75rem" }}>{u.expiry_date || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                <span>Showing {users.length} of {totalUsers} users</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    style={{ padding: "0.4rem 0.8rem", borderRadius: "4px", border: "1px solid #444", background: "#222", color: "#fff", cursor: page === 0 ? "not-allowed" : "pointer" }}
                  >
                    Previous
                  </button>
                  <span style={{ padding: "0.4rem 0.8rem" }}>Page {page + 1}</span>
                  <button
                    type="button"
                    disabled={(page + 1) * pageSize >= totalUsers}
                    onClick={() => setPage((p) => p + 1)}
                    style={{ padding: "0.4rem 0.8rem", borderRadius: "4px", border: "1px solid #444", background: "#222", color: "#fff", cursor: (page + 1) * pageSize >= totalUsers ? "not-allowed" : "pointer" }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import "../features.css";
import RazorpayCheckout from "./RazorpayCheckout";
import { getSubscriptionStatus } from "./subscriptionApi";

export default function SubscriptionStatus({ onBack }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  function refreshStatus() {
    getSubscriptionStatus()
      .then((data) => {
        setStatus(data);
        if (!data.active && data.membership === "free") {
          setShowCheckout(true);
        }
      })
      .catch((e) => setError(e.message));
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  let content;
  if (error) {
    content = <p role="alert" className="feature-error">{error}</p>;
  } else if (!status) {
    content = <p>Loading membership details...</p>;
  } else {
    const isFree = status.membership === "free" || (!status.active && status.status === "none");
    const isExpired = status.status === "expired" || (!status.active && status.status !== "none");
    const isAdmin = Boolean(status.is_admin || status.membership === "admin");
    const isBasic = status.membership === "basic";
    const isPremium = status.membership === "premium";

    let badgeLabel = "FREE VIEWER";
    let badgeColor = "#aaa";
    let badgeBg = "#222";

    if (isAdmin) {
      badgeLabel = "ADMINISTRATOR";
      badgeColor = "#f39c12";
      badgeBg = "#3d2d10";
    } else if (isPremium && status.active) {
      badgeLabel = "PREMIUM MEMBER";
      badgeColor = "#2ecc71";
      badgeBg = "#103d15";
    } else if (isBasic && status.active) {
      badgeLabel = "BASIC MEMBER";
      badgeColor = "#3498db";
      badgeBg = "#0e2a47";
    } else if (isExpired) {
      badgeLabel = "EXPIRED SUBSCRIPTION";
      badgeColor = "#e74c3c";
      badgeBg = "#3d1010";
    }

    content = (
      <section>
        <div style={{ background: "#222", padding: "1.5rem", borderRadius: "8px", marginBottom: "1.25rem", border: "1px solid #333" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <span
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: "bold",
                background: badgeBg,
                color: badgeColor,
                letterSpacing: "0.5px",
              }}
            >
              {badgeLabel}
            </span>
            {status.price !== null && status.price > 0 && (
              <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>
                ₹{status.price} / month
              </span>
            )}
          </div>

          <p><strong>Plan Name:</strong> {status.plan_name || (isFree ? "Free Tier" : "None")}</p>
          <p><strong>Streaming Quality:</strong> {status.max_quality === "4k" ? "Up to 4K Ultra HD" : "Full HD 1080p"}</p>
          <p><strong>Device Limit:</strong> {status.device_limit} active {status.device_limit === 1 ? "device" : "devices"}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span style={{ color: status.active ? "#2ecc71" : isExpired ? "#e74c3c" : "#888", fontWeight: "bold" }}>
              {status.active ? "ACTIVE" : isExpired ? "EXPIRED" : "FREE ACCESS"}
            </span>
          </p>

          {status.expiry_date && (
            <p>
              {status.active ? "Renews / expires on" : "Expired on"}: <strong>{status.expiry_date}</strong>
            </p>
          )}

          {isFree && (
            <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#1c192b", borderRadius: "6px", border: "1px solid #4a3e72" }}>
              <p style={{ margin: 0, color: "#d1c4e9", fontSize: "0.9rem" }}>
                ℹ️ Free Viewers can watch complete trailers and the first 2 minutes of all movie & series previews. Upgrade to Basic (₹199) or Premium (₹499) to watch full titles.
              </p>
            </div>
          )}

          {isExpired && (
            <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#3d1010", borderRadius: "6px", border: "1px solid #e74c3c" }}>
              <p style={{ margin: 0, color: "#ffb4b4", fontSize: "0.9rem" }}>
                ⚠️ Your subscription has expired. Streaming is currently limited to Free Viewer previews. Please renew to resume uninterrupted playback.
              </p>
            </div>
          )}
        </div>

        {/* Upgrade / Checkout Options */}
        {!isAdmin && (
          <div>
            {!showCheckout && (
              <button
                type="button"
                onClick={() => setShowCheckout(true)}
                style={{
                  background: "#e50914",
                  color: "#fff",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {status.active ? "Change or Upgrade Plan" : "Upgrade to Basic or Premium"}
              </button>
            )}

            {showCheckout && (
              <div>
                {status.active && (
                  <button
                    type="button"
                    onClick={() => setShowCheckout(false)}
                    style={{
                      background: "#333",
                      color: "#ccc",
                      border: "none",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      marginBottom: "1rem",
                    }}
                  >
                    Hide Plans
                  </button>
                )}
                <RazorpayCheckout onSubscriptionUpdated={refreshStatus} />
              </div>
            )}
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="feature-page">
      <button type="button" onClick={onBack}>← Back</button>
      <h2>My Subscription & Access Level</h2>
      {content}
    </div>
  );
}

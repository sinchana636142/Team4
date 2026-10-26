import { useEffect, useState } from "react";
import "../features.css";
import RazorpayCheckout from "./RazorpayCheckout";
import { getSubscriptionStatus } from "./subscriptionApi";

// Shows current plan and expiry date (OTT-F-042) and offers Razorpay hosted checkout (OTT-F-041).
export default function SubscriptionStatus({ onBack }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  function refreshStatus() {
    getSubscriptionStatus()
      .then((data) => {
        setStatus(data);
        if (!data.active) {
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
    content = <p>Loading...</p>;
  } else if (status.status === "none") {
    content = (
      <div>
        <p>You do not have an active subscription yet.</p>
        <RazorpayCheckout onSubscriptionUpdated={refreshStatus} />
      </div>
    );
  } else {
    content = (
      <section>
        <div style={{ background: "#222", padding: "1.25rem", borderRadius: "8px", marginBottom: "1rem" }}>
          <p><strong>Plan:</strong> {status.plan_name}</p>
          {status.price !== null && <p><strong>Price:</strong> ₹{status.price}</p>}
          <p>
            <strong>Status:</strong>{" "}
            <span style={{ color: status.active ? "#2ecc71" : "#e74c3c", fontWeight: "bold" }}>
              {status.status.toUpperCase()}
            </span>
          </p>
          {status.expiry_date && (
            <p>
              {status.active ? "Renews / expires on" : "Expired on"}: <strong>{status.expiry_date}</strong>
            </p>
          )}
        </div>

        {!status.active && (
          <div style={{ marginTop: "1rem" }}>
            <p style={{ color: "#f39c12" }}>Your subscription has expired. Please renew below to continue streaming.</p>
            <RazorpayCheckout onSubscriptionUpdated={refreshStatus} />
          </div>
        )}

        {status.active && !showCheckout && (
          <button
            type="button"
            onClick={() => setShowCheckout(true)}
            style={{
              background: "#333",
              color: "#fff",
              border: "1px solid #555",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Upgrade or Extend Subscription
          </button>
        )}

        {status.active && showCheckout && (
          <div>
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
            <RazorpayCheckout onSubscriptionUpdated={refreshStatus} />
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="feature-page">
      <button type="button" onClick={onBack}>← Back</button>
      <h2>My subscription</h2>
      {content}
    </div>
  );
}

import { useEffect, useState } from "react";
import "../features.css";
import { getSubscriptionStatus } from "./subscriptionApi";

// Shows the current plan and expiry date (OTT-F-042).
export default function SubscriptionStatus({ onBack }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getSubscriptionStatus()
      .then(setStatus)
      .catch((e) => setError(e.message));
  }, []);

  let content;
  if (error) {
    content = <p role="alert" className="feature-error">{error}</p>;
  } else if (!status) {
    content = <p>Loading...</p>;
  } else if (status.status === "none") {
    content = <p>You do not have a subscription yet.</p>;
  } else {
    content = (
      <section>
        <p>Plan: {status.plan_name}</p>
        {status.price !== null && <p>Price: ₹{status.price}</p>}
        <p>Status: {status.status}</p>
        {status.expiry_date && (
          <p>
            {status.active ? "Renews / expires on" : "Expired on"}: {status.expiry_date}
          </p>
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

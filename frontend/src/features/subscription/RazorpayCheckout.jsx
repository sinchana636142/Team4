import { useEffect, useState } from "react";
import {
  createCheckoutOrder,
  getSubscriptionPlans,
  verifyPayment,
} from "./subscriptionApi";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpayCheckout({ onSubscriptionUpdated }) {
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const currentUser = (() => {
    try {
      const saved = sessionStorage.getItem("streamhub_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    getSubscriptionPlans()
      .then((data) => {
        setPlans(data);
        if (data.length > 0) {
          let initialPlanId = data[0].id;
          try {
            const savedPlan = sessionStorage.getItem("streamhub_selected_plan");
            if (savedPlan) {
              const parsed = JSON.parse(savedPlan);
              const matched = data.find(
                (p) =>
                  p.id === parsed.id ||
                  p.name.toLowerCase() === (parsed.name || "").toLowerCase()
              );
              if (matched) {
                initialPlanId = matched.id;
              }
            }
          } catch {
            // Ignore parse errors and fallback to first plan
          }
          setSelectedPlanId(initialPlanId);
        }
      })
      .catch((err) => {
        setErrorMessage("Failed to load subscription plans: " + err.message);
      });
  }, []);

  async function handleCheckout() {
    if (!selectedPlanId) return;

    setLoading(true);
    setLoadingText("Initiating Razorpay checkout order...");
    setErrorMessage("");
    setSuccessMessage("");
    setInfoMessage("");

    try {
      const order = await createCheckoutOrder(selectedPlanId);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        setErrorMessage(
          "Razorpay checkout script could not be loaded. Please check your internet connection and reload."
        );
        setLoading(false);
        return;
      }

      setLoadingText("Opening Razorpay Secure Checkout...");

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "StreamHub OTT",
        description: `${order.plan_name} Membership (${order.amount / 100} INR)`,
        order_id: order.order_id,
        handler: async function (response) {
          if (!response.razorpay_payment_id || !response.razorpay_signature) {
            setErrorMessage("Checkout completed without payment credentials. Verification cannot proceed.");
            setLoading(false);
            return;
          }

          setLoading(true);
          setLoadingText("Verifying payment signature with StreamHub server...");

          try {
            const result = await verifyPayment({
              orderId: response.razorpay_order_id || order.order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            setSuccessMessage("Payment verified successfully! Your subscription is now active.");
                    if (onSubscriptionUpdated) {
              onSubscriptionUpdated(result.subscription);
            }
          } catch (err) {
            setErrorMessage("Payment verification failed: " + err.message);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setInfoMessage("Checkout was closed. You can retry payment whenever you are ready.");
          },
        },
        prefill: {
          name: currentUser?.full_name || currentUser?.name || "Viewer",
          email: currentUser?.email || "viewer@streamhub.com",
        },
        theme: {
          color: "#e50914",
        },
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (resp) {
          const reason = resp.error?.description || resp.error?.reason || "Transaction was declined by provider.";
          setErrorMessage(`Payment failed: ${reason}`);
          setLoading(false);
        });
        rzp.open();
        setLoading(false);
      } catch (err) {
        setErrorMessage("Could not launch Razorpay modal: " + err.message);
        setLoading(false);
      }
    } catch (err) {
      setErrorMessage("Checkout order creation failed: " + err.message);
      setLoading(false);
    }
  }

  return (
    <div className="checkout-container" style={{ marginTop: "1.5rem" }}>
      <h3 style={{ marginBottom: "1rem" }}>Select Membership Plan</h3>

      {errorMessage && (
        <div role="alert" className="feature-error" style={{ marginBottom: "1rem", padding: "0.75rem", background: "#3d1010", border: "1px solid #e50914", borderRadius: "4px" }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {infoMessage && (
        <div role="status" style={{ marginBottom: "1rem", padding: "0.75rem", background: "#1a2a3a", border: "1px solid #00a8ff", borderRadius: "4px" }}>
          ℹ️ {infoMessage}
        </div>
      )}

      {successMessage && (
        <div role="status" style={{ marginBottom: "1rem", padding: "0.75rem", background: "#103d15", border: "1px solid #2ecc71", borderRadius: "4px" }}>
          ✅ {successMessage}
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {plans.map((p) => {
          const isSelected = selectedPlanId === p.id;
          const isPremium = (p.name || "").toLowerCase().includes("premium");
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPlanId(p.id)}
              style={{
                flex: "1 1 220px",
                padding: "1.25rem",
                borderRadius: "8px",
                border: isSelected ? "2px solid #e50914" : "1px solid #444",
                background: isSelected ? "#2a1515" : "#1e1e1e",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <h4 style={{ margin: 0, color: isSelected ? "#e50914" : "#fff", fontSize: "1.2rem" }}>
                  {p.name}
                </h4>
                {isPremium && (
                  <span style={{ fontSize: "0.7rem", background: "#e50914", color: "#fff", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                    POPULAR
                  </span>
                )}
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                ₹{p.price}
                <span style={{ fontSize: "0.85rem", color: "#aaa" }}> / 30 days</span>
              </div>
              <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0", fontSize: "0.9rem", color: "#ccc", lineHeight: "1.6" }}>
                {isPremium ? (
                  <>
                    <li><strong>4K Ultra HD</strong> streaming (where available)</li>
                    <li>Watch on up to <strong>4 registered devices</strong></li>
                    <li>Full movies & series catalogue</li>
                    <li>Ad-free experience & priority releases</li>
                    <li>No preview limits</li>
                  </>
                ) : (
                  <>
                    <li><strong>Full HD 1080p</strong> streaming</li>
                    <li>Watch on <strong>1 registered device</strong></li>
                    <li>Full movies & series catalogue</li>
                    <li>Standard playback</li>
                    <li>No preview limits</li>
                  </>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading || plans.length === 0}
          style={{
            background: "#e50914",
            color: "#fff",
            border: "none",
            padding: "0.85rem 1.75rem",
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? loadingText : `Pay with Razorpay (₹${plans.find((p) => p.id === selectedPlanId)?.price || "—"})`}
        </button>
      </div>

      <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "1rem" }}>
        🔒 Payments are securely hosted and verified by Razorpay. Card and UPI details are never processed or stored on StreamHub servers.
      </p>
    </div>
  );
}

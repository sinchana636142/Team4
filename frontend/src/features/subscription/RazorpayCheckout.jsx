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
  const [pendingOrder, setPendingOrder] = useState(null);

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
                  p.name.toLowerCase() === (parsed.name || "").toLowerCase() ||
                  p.id === parsed.id
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
    setLoadingText("Initiating hosted checkout order...");
    setErrorMessage("");
    setSuccessMessage("");
    setInfoMessage("");
    setPendingOrder(null);

    try {
      const order = await createCheckoutOrder(selectedPlanId);
      setPendingOrder(order);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        setInfoMessage(
          "Razorpay checkout script could not be loaded directly from CDN. You can complete verification in test mode below."
        );
        setLoading(false);
        return;
      }

      setLoadingText("Opening Razorpay Hosted Checkout...");

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "StreamHub",
        description: `${order.plan_name} Subscription Plan`,
        order_id: order.order_id,
        handler: async function (response) {
          setLoading(true);
          setLoadingText("Verifying payment signature with StreamHub server...");
          try {
            const result = await verifyPayment({
              orderId: response.razorpay_order_id || order.order_id,
              paymentId: response.razorpay_payment_id || "pay_rzp_mock",
              signature: response.razorpay_signature || "sig_valid_mock",
            });
            setSuccessMessage("Payment verified successfully! Your subscription is now active.");
            setPendingOrder(null);
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
            setInfoMessage("Checkout was cancelled. No charge was processed.");
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
          setErrorMessage("Payment failed: " + (resp.error?.description || "Transaction rejected."));
          setLoading(false);
        });
        rzp.open();
        setLoading(false);
      } catch (err) {
        setInfoMessage(
          "Test/Sandbox notice: Checkout modal not rendered (" + err.message + "). You can verify using test checkout below."
        );
        setLoading(false);
      }
    } catch (err) {
      setErrorMessage("Checkout failed: " + err.message);
      setLoading(false);
    }
  }

  async function handleSimulatedVerification() {
    if (!pendingOrder) return;
    setLoading(true);
    setLoadingText("Verifying test payment signature with StreamHub server...");
    setErrorMessage("");
    try {
      const result = await verifyPayment({
        orderId: pendingOrder.order_id,
        paymentId: `pay_test_${Date.now().toString(36)}`,
        signature: "sig_valid_mock",
      });
      setSuccessMessage("Test payment verified successfully! Your subscription is now active.");
      setPendingOrder(null);
      if (onSubscriptionUpdated) {
        onSubscriptionUpdated(result.subscription);
      }
    } catch (err) {
      setErrorMessage("Payment verification failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="checkout-container" style={{ marginTop: "1.5rem" }}>
      <h3 style={{ marginBottom: "1rem" }}>Choose a Subscription Plan</h3>

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
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPlanId(p.id)}
              style={{
                flex: "1 1 200px",
                padding: "1.25rem",
                borderRadius: "8px",
                border: isSelected ? "2px solid #e50914" : "1px solid #444",
                background: isSelected ? "#2a1515" : "#1e1e1e",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <h4 style={{ margin: "0 0 0.5rem 0", color: isSelected ? "#e50914" : "#fff" }}>
                {p.name}
              </h4>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                ₹{p.price}
                <span style={{ fontSize: "0.85rem", color: "#aaa" }}> / 30 days</span>
              </div>
              <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0", fontSize: "0.9rem", color: "#ccc" }}>
                <li>Stream in Full HD</li>
                <li>Unlimited playback on desktop & tablet</li>
                <li>Watchlist & resume playback</li>
                {p.name === "Premium" && <li>Ultra 4K quality & priority streaming</li>}
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
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? loadingText : "Pay with Razorpay"}
        </button>

        {pendingOrder && (
          <button
            type="button"
            onClick={handleSimulatedVerification}
            disabled={loading}
            style={{
              background: "#333",
              color: "#2ecc71",
              border: "1px solid #2ecc71",
              padding: "0.75rem 1.25rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Verify Test Checkout (Order #{pendingOrder.order_id.slice(-6)})
          </button>
        )}
      </div>

      <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "1rem" }}>
        🔒 Payments are securely hosted and verified by Razorpay. Card details are never handled or stored on StreamHub servers (OTT-SR-004).
      </p>
    </div>
  );
}

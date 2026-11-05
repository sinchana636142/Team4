import React, { useState } from "react";
import "./SubscriptionPlans.css";
import PremiumCodeRedeemer from "./components/PremiumCodeRedeemer";

const plans = [
  {
    id: 0,
    name: "Free Viewer",
    price: 0,
    period: "forever",
    description: "Included with every registered StreamHub account.",
    features: [
      "Browse complete movies & web series catalog",
      "Watch full trailers in HD",
      "2-minute preview of all movies & episodes",
      "Personalized watchlist & watch history",
      "Upgrade to Basic or Premium anytime",
    ],
  },
  {
    id: 1,
    name: "Basic",
    price: 199,
    period: "month",
    description: "Full streaming on your personal screen.",
    features: [
      "Full movies & web series access (no preview limit)",
      "Maximum streaming quality: Full HD 1080p",
      "Watch on 1 registered device",
      "Standard playback & full catalog access",
      "Cancel anytime",
    ],
  },
  {
    id: 2,
    name: "Premium",
    price: 499,
    period: "month",
    description: "The ultimate 4K entertainment experience.",
    badge: "POPULAR",
    features: [
      "Full movies & web series access (no preview limit)",
      "Up to 4K Ultra HD streaming (where supported)",
      "Watch on up to 4 registered devices",
      "Ad-free viewing experience",
      "Priority access to new releases",
      "Cancel anytime",
    ],
  },
];

export default function SubscriptionPlans({
  onBack,
  onSelectPlan,
  currentPlan,
}) {
  const [selectedPlan, setSelectedPlan] = useState(
    currentPlan || 1
  );

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan.id);

    if (onSelectPlan) {
      onSelectPlan(plan);
    }
  };

  return (
    <main className="plans-page">
      <header className="plans-header">
        {onBack && (
          <button
            className="plans-back-button"
            onClick={onBack}
            type="button"
          >
            ← Back
          </button>
        )}

        <p className="plans-eyebrow">STREAMHUB MEMBERSHIP</p>

        <h1>Choose Your Plan</h1>

        <p className="plans-subtitle">
          Great entertainment starts with the plan that suits you. Upgrade anytime to unlock Full HD or 4K.
        </p>
      </header>

      <section
        className="plans-grid"
        aria-label="Available subscription plans"
      >
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const isFree = plan.id === 0;

          return (
            <article
              className={`plan-card ${
                isSelected ? "plan-selected" : ""
              }`}
              key={plan.id}
            >
              {plan.badge && (
                <span className="plan-badge">{plan.badge}</span>
              )}

              <h2>{plan.name}</h2>

              <p className="plan-description">
                {plan.description}
              </p>

              <div className="plan-price">
                <span className="plan-currency">₹</span>
                <span className="plan-amount">
                  {plan.price}
                </span>
                <span className="plan-period">
                  /{plan.period}
                </span>
              </div>

              <ul className="plan-features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <span aria-hidden="true">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`plan-button ${
                  isSelected ? "plan-button-selected" : ""
                }`}
                type="button"
                onClick={() => handleSelectPlan(plan)}
                aria-pressed={isSelected}
              >
                {isFree
                  ? "Included / Free Access"
                  : isSelected
                  ? "Selected"
                  : `Choose ${plan.name}`}
              </button>
            </article>
          );
        })}
      </section>

      {/* Special Premium Access Code Section */}
      <PremiumCodeRedeemer />

      <p className="plans-footer">
        🔒 All payments are processed securely in INR via Razorpay. Cancel anytime.
      </p>
    </main>
  );
}

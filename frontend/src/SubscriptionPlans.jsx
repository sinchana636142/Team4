import React, { useState } from "react";
import "./SubscriptionPlans.css";

const plans = [
{
id: "basic",
name: "Basic",
price: 149,
period: "month",
description: "Perfect for casual viewers.",
features: [
"HD streaming",
"Watch on 1 device",
"Movies and TV shows",
"Cancel anytime",
],
},
{
id: "standard",
name: "Standard",
price: 299,
period: "month",
description: "More entertainment for everyone.",
features: [
"Full HD streaming",
"Watch on 2 devices",
"Movies and TV shows",
"Ad-free experience",
"Cancel anytime",
],
},
{
id: "premium",
name: "Premium",
price: 499,
period: "month",
description: "The ultimate streaming experience.",
features: [
"4K Ultra HD streaming",
"Watch on 4 devices",
"Movies and TV shows",
"Ad-free experience",
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
currentPlan || "standard"
);

const handleSelectPlan = (plan) => {
setSelectedPlan(plan.id);

if (onSelectPlan) {
  onSelectPlan(plan);
}

};

return ( <main className="plans-page"> <header className="plans-header">
{onBack && ( <button
         className="plans-back-button"
         onClick={onBack}
         type="button"
       >
← Back </button>
)}

    <p className="plans-eyebrow">STREAMHUB MEMBERSHIP</p>

    <h1>Choose Your Plan</h1>

    <p className="plans-subtitle">
      Great entertainment starts with the plan that suits you.
    </p>
  </header>

  <section className="plans-grid" aria-label="Available subscription plans">
    {plans.map((plan) => {
      const isSelected = selectedPlan === plan.id;

      return (
        <article
          className={`plan-card ${isSelected ? "plan-selected" : ""}`}
          key={plan.id}
        >
          {plan.id === "standard" && (
            <span className="plan-badge">POPULAR</span>
          )}

          <h2>{plan.name}</h2>

          <p className="plan-description">{plan.description}</p>

          <div className="plan-price">
            <span className="plan-currency">₹</span>
            <span className="plan-amount">{plan.price}</span>
            <span className="plan-period">/{plan.period}</span>
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
            className={`plan-button ${isSelected ? "plan-button-selected" : ""}`}
            type="button"
            onClick={() => handleSelectPlan(plan)}
            aria-pressed={isSelected}
          >
            {isSelected ? "Selected" : `Choose ${plan.name}`}
          </button>
        </article>
      );
    })}
  </section>

  <p className="plans-footer">
    Select a plan to continue. Prices shown are demonstration prices.
    Payment processing is not included in this component.
  </p>
</main>


);
}

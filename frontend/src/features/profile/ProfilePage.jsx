import "./ProfilePage.css";

export default function ProfilePage({ user, onNavigate, onLogout }) {
  const displayName =
    user?.full_name || user?.name || user?.username || "StreamHub Viewer";
  const email = user?.email || "";
  const initial = displayName.trim().charAt(0).toUpperCase() || "V";
  const isAdmin = Boolean(user?.is_admin || user?.role === "admin");

  const actions = [
    {
      title: "My Watchlist",
      description: "Find the movies and shows you saved.",
      icon: "♡",
      screen: "watchlist",
    },
    {
      title: "Watch History",
      description: "Continue watching titles you recently played.",
      icon: "◷",
      screen: "history",
    },
    {
      title: "My Subscription",
      description: "View your current subscription status.",
      icon: "✦",
      screen: "account",
    },
    {
      title: "View Plans",
      description: "Explore available StreamHub plans.",
      icon: "▤",
      screen: "plans",
    },
    {
      title: "Change Password",
      description: "Reset your account password.",
      icon: "⌑",
      screen: "forgot",
    },
  ];

  if (isAdmin) {
    actions.push({
      title: "Admin Panel",
      description: "Manage titles and view registered users.",
      icon: "⚙",
      screen: "admin",
    });
  }

  return (
    <main className="profile-page">
      <header className="profile-page-heading">
        <p className="profile-page-eyebrow">YOUR ACCOUNT</p>
        <h1>Profile</h1>
        <p>Manage your StreamHub account and viewing activity.</p>
      </header>

      <section className="profile-summary" aria-label="Account details">
        <div className="profile-avatar" aria-hidden="true">{initial}</div>
        <div className="profile-identity">
          <h2>{displayName}</h2>
          {email && <p>{email}</p>}
          {isAdmin && <span className="profile-role">Administrator</span>}
        </div>
      </section>

      <section className="profile-options" aria-label="Account options">
        <h2>Account options</h2>
        <div className="profile-options-grid">
          {actions.map((action) => (
            <button
              className="profile-option"
              key={action.screen}
              type="button"
              onClick={() => onNavigate(action.screen)}
            >
              <span className="profile-option-icon" aria-hidden="true">
                {action.icon}
              </span>
              <span className="profile-option-copy">
                <strong>{action.title}</strong>
                <small>{action.description}</small>
              </span>
              <span className="profile-option-arrow" aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      </section>

      <button className="profile-logout" type="button" onClick={onLogout}>
        Log out
      </button>
    </main>
  );
}

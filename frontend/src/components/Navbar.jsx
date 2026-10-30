import "./Navbar.css";

export default function Navbar({
  currentUser,
  onHome,
  onScreenChange,
  onLogout,
}) {
  return (
    <header className="navbar">
      <a className="brand" href="#home" onClick={onHome}>
        <span className="brand-icon">▶</span> StreamHub
      </a>

      <nav>
  <a href="#home" onClick={onHome}>Home</a>
  <a href="#movies" onClick={onHome}>Movies</a>
  <a
    href="#series"
    onClick={(e) => {
      e.preventDefault();
      onScreenChange("series");
    }}
  >
    Web Series
  </a>
  <a href="#genres" onClick={onHome}>Genres</a>
</nav>


      {currentUser ? (
        <div className="profile-actions">
          <span className="profile">
            {currentUser.name || currentUser.username || currentUser.email || "Viewer"}
          </span>
          <button type="button" onClick={() => onScreenChange("watchlist")}>Watchlist</button>
          <button type="button" onClick={() => onScreenChange("history")}>History</button>
          <button type="button" onClick={() => onScreenChange("account")}>My Subscription</button>
          {Boolean(currentUser.is_admin || currentUser.role === "admin") && (
            <button
              type="button"
              onClick={() => onScreenChange("admin")}
              className="admin-nav-button"
            >
              🛠️ Admin Panel
            </button>
          )}
          <button type="button" onClick={() => onScreenChange("plans")}>View Plans</button>
          <button type="button" onClick={onLogout}>Logout</button>
          <button type="button" onClick={() => onScreenChange("forgot")}>Forgot Password?</button>
        </div>
      ) : (
        <div className="profile-actions">
          <button type="button" onClick={() => onScreenChange("login")}>Log In</button>
          <button type="button" onClick={() => onScreenChange("signup")}>Sign Up</button>
          <button type="button" onClick={() => onScreenChange("plans")}>Subscription Plans</button>
          <button type="button" onClick={() => onScreenChange("forgot")}>Forgot Password?</button>
        </div>
      )}
    </header>
  );
}

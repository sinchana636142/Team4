import "./Navbar.css";

export default function Navbar({
  currentUser,
  onHome,
  onScreenChange,
}) {
  return (
    <header className="navbar">
      <a className="brand" href="#home" onClick={onHome}>
        <span className="brand-icon">▶</span> StreamHub
      </a>

<nav>
  <a href="#home" onClick={onHome}>
    Home
  </a>

  <a
    href="#movies"
    onClick={(e) => {
      e.preventDefault();
      onScreenChange("movies");
    }}
  >
    Movies
  </a>

  <a
    href="#series"
    onClick={(e) => {
      e.preventDefault();
      onScreenChange("series");
    }}
  >
    Web Series
  </a>

  <a
    href="#genres"
    onClick={(e) => {
      e.preventDefault();
      onScreenChange("genres");
    }}
  >
    Genres
  </a>
</nav>

      {currentUser ? (
        <div className="profile-actions">
          <button
            type="button"
            className="profile-icon-button"
            onClick={() => onScreenChange("profile")}
            aria-label="Open profile"
            title={currentUser.full_name || currentUser.name || currentUser.email || "Profile"}
          >
            <span aria-hidden="true">♙</span>
          </button>
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

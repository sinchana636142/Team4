import "./KidsPage.css";

export default function KidsPage({ profile, movie, onSwitchProfile, onWatchMovie }) {
  return (
    <div className="kids-page">
      <header className="kids-header">
        <a className="kids-brand" href="#kids" aria-label="StreamHub Kids">
          <span aria-hidden="true">▶</span> StreamHub <strong>KIDS</strong>
        </a>
        <div className="kids-header-actions">
          <span>{profile?.name || "Kids"}</span>
          <button type="button" onClick={onSwitchProfile}>Switch profile</button>
        </div>
      </header>

      <main className="kids-content">
        <section className="kids-welcome">
          <p className="kids-eyebrow">A STREAMHUB KIDS PROFILE</p>
          <h1>Big fun for little viewers.</h1>
          <p>Explore a family pick chosen for this kids experience.</p>
        </section>

        {movie ? (
          <section className="kids-feature" aria-labelledby="kids-feature-title">
            <img src={movie.poster} alt="" className="kids-feature-poster" />
            <div className="kids-feature-copy">
              <span className="kids-feature-label">FAMILY PICK</span>
              <h2 id="kids-feature-title">{movie.title}</h2>
              <p>{movie.year} · Family comedy</p>
              <p>
                A young boy is accidentally left home for the holidays and comes
                up with clever ways to protect his house.
              </p>
              <button type="button" onClick={() => onWatchMovie(movie)}>
                ▶ Watch
              </button>
            </div>
          </section>
        ) : (
          <section className="kids-empty">
            <span aria-hidden="true">✨</span>
            <h2>More family picks are on the way</h2>
            <p>There aren&apos;t any titles in this kids collection yet.</p>
          </section>
        )}

        <p className="kids-parent-note">
          Kids profiles only show titles selected for this page. Ask a parent or
          guardian before switching profiles.
        </p>
      </main>
    </div>
  );
}

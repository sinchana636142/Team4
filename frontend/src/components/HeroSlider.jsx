import { useEffect, useState } from "react";
import "./HeroSlider.css";

export default function HeroSlider({
  movies = [],
  onWatchMovie,
  onSelectSeries,
}) {
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (movies.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % movies.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [movies.length]);

  useEffect(() => {
    if (heroIndex >= movies.length) setHeroIndex(0);
  }, [heroIndex, movies.length]);

  if (!movies.length) return null;

  const featuredMovie = movies[heroIndex] || movies[0];

  const showPrevious = () => {
    setHeroIndex((current) => current === 0 ? movies.length - 1 : current - 1);
  };

  const showNext = () => {
    setHeroIndex((current) => (current + 1) % movies.length);
  };

  return (
    <section className="hero-slider" id="home" aria-label="Featured titles">
      <div className="hero-slide-backdrop" aria-hidden="true" />
      <img
        className="hero-featured-art"
        key={`poster-${featuredMovie.id}`}
        src={featuredMovie.poster}
        alt={`${featuredMovie.title} poster`}
        onError={(event) => { event.currentTarget.style.visibility = "hidden"; }}
      />

      <div className="hero-slide-content" key={`content-${featuredMovie.id}`}>
        <p className="eyebrow">FEATURED ON STREAMHUB</p>
        <p className="hero-slide-kicker">
          {featuredMovie.type === "series" ? "WEB SERIES" : featuredMovie.genre || "MOVIES"}
          {featuredMovie.year ? ` • ${featuredMovie.year}` : ""}
        </p>
        <h1>{featuredMovie.title}</h1>
        <p className="hero-description">
          Discover your next favorite. Stream stories worth watching.
        </p>
        <div className="hero-slide-actions">
          <button
            type="button"
            className="explore-button"
            onClick={() => {
              if (featuredMovie.type === "series") {
                onSelectSeries(featuredMovie);
              } else {
                onWatchMovie(featuredMovie);
              }
            }}
          >
            {featuredMovie.type === "series" ? "View Series" : "▶ Watch Now"}
          </button>
          <a
            className="hero-secondary-button"
            href={featuredMovie.type === "series" ? "#web-series" : "#genres"}
          >
            {featuredMovie.type === "series"
              ? "Explore Web Series ↓"
              : "Explore Movies ↓"}
          </a>
        </div>
      </div>

      {movies.length > 1 && (
        <>
          <button type="button" className="hero-arrow hero-arrow-prev" onClick={showPrevious} aria-label="Previous featured movie">‹</button>
          <button type="button" className="hero-arrow hero-arrow-next" onClick={showNext} aria-label="Next featured movie">›</button>
          <div className="hero-dots" aria-label="Choose featured movie">
            {movies.map((movie, index) => (
              <button
                type="button"
                key={movie.id}
                className={`hero-dot ${index === heroIndex ? "active" : ""}`}
                onClick={() => setHeroIndex(index)}
                aria-label={`Show ${movie.title}`}
                aria-current={index === heroIndex ? "true" : undefined}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

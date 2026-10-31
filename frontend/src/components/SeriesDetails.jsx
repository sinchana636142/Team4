
import React, { useState } from "react";
import "./SeriesDetails.css";
import SeriesWatchlistButton from "../features/watchlist/SeriesWatchlistButton";

export default function SeriesDetails({
  series,
  onClose,
  onWatchEpisode,
  onWatchTrailer,
  user,
}) {
  const [selectedEpisode, setSelectedEpisode] = useState(
    series.episodes?.[0] || null
  );

  if (!series) return null;

  const episodes = series.episodes || [];

  const handleWatchEpisode = () => {
    if (!selectedEpisode) return;

    onWatchEpisode?.({
      series,
      episode: selectedEpisode,
    });
  };

  return (
    <div className="series-details-overlay">
      <section
        className="series-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="series-title"
      >
        <button
          className="series-close-button"
          onClick={onClose}
          aria-label="Close series details"
        >
          ×
        </button>

        <div className="series-details-layout">
          <div className="series-poster-container">
            <img
              className="series-details-poster"
              src={series.poster}
              alt={`${series.title} poster`}
            />
          </div>

          <div className="series-details-content">
            <span className="series-original-label">
              STREAMHUB SERIES
            </span>

            <h1 id="series-title">{series.title}</h1>

            <p className="series-metadata">
              📅 {series.year} &nbsp; 🎭 {series.genre}
            </p>

            <h2>About this series</h2>

            <p className="series-description">
              {series.description}
            </p>

            <div className="series-tags">
              <span>{series.genre}</span>
              <span>HD</span>
              <span>StreamHub</span>
            </div>

            <div className="series-action-buttons">
              <button
                className="series-watch-button"
                onClick={handleWatchEpisode}
                disabled={!selectedEpisode}
              >
                ▶ Watch Episode
              </button>

              <button
                className="series-trailer-button"
                onClick={() => onWatchTrailer?.(series)}
                disabled={!series.trailerUrl}
              >
                ▷ Watch Trailer
              </button>
              <SeriesWatchlistButton series={series} user={user} />
            </div>

            <h2 className="episodes-heading">
              Episodes ({episodes.length})
            </h2>

            <div className="series-episode-list">
              {episodes.map((episode) => (
                <button
                  key={episode.id}
                  className={`series-episode ${
                    selectedEpisode?.id === episode.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => setSelectedEpisode(episode)}
                >
                  <span className="episode-number">
                    {String(episode.id).padStart(2, "0")}
                  </span>

                  <span className="episode-information">
                    <strong>{episode.title}</strong>
                    <small>{episode.duration || "Episode"}</small>
                  </span>

                  <span className="episode-play-icon">▶</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

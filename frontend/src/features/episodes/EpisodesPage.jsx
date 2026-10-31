import "./EpisodesPage.css";

export default function EpisodesPage({ seriesPlayer, onClose, onSelectEpisode }) {
  if (!seriesPlayer) return null;

  const series = seriesPlayer.series || {};
  const isTrailer = seriesPlayer.kind === "trailer";
  const selectedEpisode = seriesPlayer.episode || null;
  const episodes = Array.isArray(series.episodes) ? series.episodes : [];

  return (
    <div className="episodes-overlay" role="dialog" aria-modal="true" aria-label={isTrailer ? "Series trailer" : "Episode player"}>
      <div className="episodes-modal">
        <div className="episodes-header">
          <div>
            <p className="episodes-badge">{isTrailer ? "Trailer" : "Watch"}</p>
            <h2>{isTrailer ? `${series.title} — Trailer` : `${series.title} — ${selectedEpisode?.title || "Episode"}`}</h2>
          </div>
          <button type="button" className="episodes-close" onClick={onClose} aria-label="Close episode player">
            ✕ Close
          </button>
        </div>

        <div className="episodes-layout">
          <div className="episodes-video-panel">
            {isTrailer && series.trailerUrl ? (
              <iframe
                className="episodes-video"
                title={`${series.title} trailer`}
                src={series.trailerUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : selectedEpisode?.videoUrl ? (
              <video className="episodes-video" controls autoPlay src={selectedEpisode.videoUrl} />
            ) : (
              <div className="episodes-empty-state">
                <h3>No video available</h3>
                <p>
                  Add a valid video URL for this episode in your series data to enable playback.
                </p>
              </div>
            )}
          </div>

          <aside className="episodes-sidebar">
            <div className="episodes-sidebar-header">
              <h3>Episodes</h3>
              <span>{episodes.length}</span>
            </div>

            <div className="episodes-list">
              {episodes.length > 0 ? (
                episodes.map((episode) => (
                  <button
                    key={episode.id}
                    type="button"
                    className={`episode-item ${selectedEpisode?.id === episode.id ? "active" : ""}`}
                    onClick={() => onSelectEpisode?.(episode)}
                  >
                    <span className="episode-number">{String(episode.id).padStart(2, "0")}</span>
                    <span className="episode-info">
                      <strong>{episode.title}</strong>
                      <small>{episode.duration || "Episode"}</small>
                    </span>
                    <span className="episode-play">▶</span>
                  </button>
                ))
              ) : (
                <div className="episode-placeholder">
                  <p>No episode list is available for this title yet.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

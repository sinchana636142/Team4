import { useEffect, useRef, useState } from "react";
import "../features.css";
import WatchlistButton from "../watchlist/WatchlistButton";
import { getPlayback } from "./playbackApi";
import useResume from "./useResume";
import { recordView } from "./historyApi";
import VideoPlayer from "./VideoPlayer";
import "./WatchPage.css";

export default function WatchPage({ titleId, movie, onBack }) {
  const videoRef = useRef(null);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [startupTimeMs, setStartupTimeMs] = useState(null);
  const startTimeRef = useRef(performance.now());
  const recordedTitleRef = useRef(null);

  useEffect(() => {
    let active = true;
    startTimeRef.current = performance.now();
    setStartupTimeMs(null);
    setInfo(null);
    setError("");
    setHistoryError("");
    getPlayback(titleId)
      .then((playbackInfo) => {
        if (!active) return;
        setInfo(playbackInfo);

        if (recordedTitleRef.current !== titleId) {
          recordedTitleRef.current = titleId;
          recordView(titleId).catch((historyFailure) => {
            if (active) setHistoryError(historyFailure.message);
          });
        }
      })
      .catch((playbackFailure) => {
        if (active) setError(playbackFailure.message);
      });

    return () => {
      active = false;
    };
  }, [titleId]);

  useResume(titleId, videoRef, info !== null);

  function handleStartupMeasured() {
    if (startupTimeMs === null) {
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      setStartupTimeMs(elapsed);
    }
  }

  let playerContent;
  if (error) {
    playerContent = <p role="alert" className="feature-error">{error}</p>;
  } else if (!info) {
    playerContent = <p className="movie-player-message">Loading video details...</p>;
  } else {
    playerContent = (
      <>
        <VideoPlayer
          src={info.video_url}
          videoRef={videoRef}
          onStartupMeasured={handleStartupMeasured}
        />
      </>
    );
  }

  return (
    <div
      className="movie-player-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${info?.title || movie?.title || "Movie"} player`}
      onClick={onBack}
    >
      <section className="movie-player-modal" onClick={(event) => event.stopPropagation()}>
        <header className="movie-player-header">
          <div>
            <p className="movie-player-eyebrow">NOW PLAYING</p>
            <h1>{info?.title || movie?.title || "Movie"}</h1>
          </div>
          <button type="button" className="movie-player-close" onClick={onBack}>
            × Close
          </button>
        </header>

        <div className="movie-player-layout">
          <div className="movie-player-video-panel">
            {playerContent}
            {historyError && (
              <p role="alert" className="feature-error movie-player-history-error">
                Playback started, but watch history could not be saved: {historyError}
              </p>
            )}
          </div>

          <aside className="movie-player-sidebar">
            {movie?.poster && (
              <img
                className="movie-player-poster"
                src={movie.poster}
                alt={`${movie.title} poster`}
              />
            )}
            <div className="movie-player-metadata">
              <h2>{info?.title || movie?.title || "Movie"}</h2>
              <p>{[movie?.year, movie?.genre].filter(Boolean).join(" · ") || "StreamHub movie"}</p>
              {movie?.description && <p className="movie-player-description">{movie.description}</p>}
            </div>
            <WatchlistButton titleId={titleId} className="movie-player-watchlist-button" />
            {startupTimeMs !== null && (
              <span className={`movie-player-startup ${startupTimeMs <= 5000 ? "good" : "slow"}`}>
                ⚡ Startup: {(startupTimeMs / 1000).toFixed(2)}s (target ≤ 5.0s)
              </span>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}

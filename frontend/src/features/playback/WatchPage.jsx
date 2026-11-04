import { useEffect, useRef, useState } from "react";
import "../features.css";
import WatchlistButton from "../watchlist/WatchlistButton";
import {
  getPlayback,
  getPlaybackAccess,
  getPlaybackPreview,
  getPlaybackTrailer,
  getPlaybackStream,
} from "./playbackApi";
import useResume from "./useResume";
import { recordView } from "./historyApi";
import VideoPlayer from "./VideoPlayer";
import { resolveMediaUrl } from "../api";
import "./WatchPage.css";

export default function WatchPage({ titleId, movie, onBack, onNavigatePlans }) {
  const videoRef = useRef(null);
  const [access, setAccess] = useState(null);
  const [playbackStream, setPlaybackStream] = useState(null);
  const [activeKind, setActiveKind] = useState("auto"); // "auto", "full", "preview", "trailer"
  const [selectedQuality, setSelectedQuality] = useState("1080p");
  const [qualityNotice, setQualityNotice] = useState("");
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [startupTimeMs, setStartupTimeMs] = useState(null);
  const startTimeRef = useRef(performance.now());
  const recordedTitleRef = useRef(null);

  // 1. Initial Access Check
  useEffect(() => {
    let active = true;
    startTimeRef.current = performance.now();
    setStartupTimeMs(null);
    setError("");
    setHistoryError("");

    getPlaybackAccess(titleId)
      .then((accessData) => {
        if (!active) return;
        setAccess(accessData);

        // If user has full access, play full movie; otherwise automatically play preview
        if (accessData.can_watch_full) {
          return getPlaybackStream(titleId, { kind: "full", quality: selectedQuality })
            .catch(() => getPlayback(titleId));
        } else {
          return getPlaybackPreview(titleId);
        }
      })
      .then((stream) => {
        if (!active || !stream) return;
        setPlaybackStream(stream);

        // Record viewing session once
        if (recordedTitleRef.current !== titleId) {
          recordedTitleRef.current = titleId;
          recordView(titleId).catch((historyFailure) => {
            if (active) setHistoryError(historyFailure.message);
          });
        }
      })
      .catch((err) => {
        if (!active) return;
        // Fallback: try preview if full video failed with 403
        if (err.message && err.message.includes("subscription")) {
          getPlaybackPreview(titleId)
            .then((previewStream) => {
              if (active) setPlaybackStream(previewStream);
            })
            .catch((previewErr) => {
              if (active) setError(previewErr.message);
            });
        } else {
          setError(err.message);
        }
      });

    return () => {
      active = false;
    };
  }, [titleId]);

  useResume(titleId, videoRef, playbackStream !== null && !playbackStream.is_preview);

  function handleStartupMeasured() {
    if (startupTimeMs === null) {
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      setStartupTimeMs(elapsed);
    }
  }

  function handlePlayTrailer() {
    setError("");
    getPlaybackTrailer(titleId)
      .then((stream) => {
        setActiveKind("trailer");
        setPlaybackStream(stream);
      })
      .catch((err) => setError(err.message));
  }

  function handlePlayPreview() {
    setError("");
    getPlaybackPreview(titleId)
      .then((stream) => {
        setActiveKind("preview");
        setPlaybackStream(stream);
      })
      .catch((err) => setError(err.message));
  }

  function handleQualityChange(targetQuality) {
    if (!access) return;

    if (targetQuality === "4k") {
      if (access.membership === "basic") {
        setQualityNotice("⚠️ 4K Ultra HD requires Premium (₹499/mo). Playing in 1080p Full HD.");
        setTimeout(() => setQualityNotice(""), 4500);
        return;
      }
      if (!access.is_4k_available) {
        setQualityNotice("ℹ️ 4K not available for this title. Streaming in highest source resolution (1080p).");
        setTimeout(() => setQualityNotice(""), 4500);
      }
    }

    setSelectedQuality(targetQuality);
    if (access.can_watch_full) {
      getPlaybackStream(titleId, { kind: "full", quality: targetQuality })
        .then((stream) => setPlaybackStream(stream))
        .catch((err) => setError(err.message));
    }
  }

  const isFreeViewer = access && !access.can_watch_full;
  const isPreviewStream = playbackStream?.is_preview || (isFreeViewer && activeKind !== "trailer");

  let playerContent;
  if (error) {
    playerContent = (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p role="alert" className="feature-error">{error}</p>
        {isFreeViewer && (
          <div style={{ marginTop: "1rem" }}>
            <button
              type="button"
              onClick={handlePlayTrailer}
              style={{
                background: "#24232f",
                color: "#fff",
                border: "1px solid #555",
                padding: "0.6rem 1.25rem",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "0.5rem",
              }}
            >
              Watch Trailer
            </button>
            <button
              type="button"
              onClick={onNavigatePlans}
              style={{
                background: "#e50914",
                color: "#fff",
                border: "none",
                padding: "0.6rem 1.25rem",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              View Plans
            </button>
          </div>
        )}
      </div>
    );
  } else if (!playbackStream) {
    playerContent = <p className="movie-player-message">Loading video details...</p>;
  } else {
    playerContent = (
      <VideoPlayer
        src={resolveMediaUrl(playbackStream.video_url || movie?.videoUrl)}
        videoRef={videoRef}
        onStartupMeasured={handleStartupMeasured}
        title={playbackStream.title || movie?.title || "StreamHub video"}
        poster={movie?.poster}
        isPreview={isPreviewStream}
        maxPreviewSeconds={playbackStream.preview_duration || 120}
        onUpgradeClick={onNavigatePlans}
        onPlayTrailer={handlePlayTrailer}
        qualityBadge={playbackStream.actual_quality || playbackStream.quality || selectedQuality}
        qualityNotice={qualityNotice}
      />
    );
  }

  return (
    <div
      className="movie-player-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${playbackStream?.title || movie?.title || "Movie"} player`}
      onClick={onBack}
    >
      <section className="movie-player-modal" onClick={(event) => event.stopPropagation()}>
        <header className="movie-player-header">
          <div>
            <p className="movie-player-eyebrow">
              {isPreviewStream
                ? "FREE PREVIEW (2 MINUTES)"
                : activeKind === "trailer"
                ? "OFFICIAL TRAILER"
                : "NOW PLAYING"}
            </p>
            <h1>{playbackStream?.title || movie?.title || "Movie"}</h1>
          </div>
          <button type="button" className="movie-player-close" onClick={onBack}>
            × Close
          </button>
        </header>

        {/* Free Viewer Notice Bar */}
        {isFreeViewer && (
          <div
            style={{
              background: "#1e1b2e",
              borderBottom: "1px solid #3c325c",
              padding: "0.6rem 1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.85rem",
              color: "#d1c4e9",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <span>
              ⭐ <strong>Free Viewer Mode:</strong> Watching first 2 minutes preview. Unlock complete movies with Basic (₹199) or Premium (₹499).
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={handlePlayTrailer}
                style={{
                  background: "#2a273c",
                  color: "#fff",
                  border: "1px solid #5a547a",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Trailer
              </button>
              <button
                type="button"
                onClick={handlePlayPreview}
                style={{
                  background: "#2a273c",
                  color: "#fff",
                  border: "1px solid #5a547a",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                2-Min Preview
              </button>
              {onNavigatePlans && (
                <button
                  type="button"
                  onClick={onNavigatePlans}
                  style={{
                    background: "#e50914",
                    color: "#fff",
                    border: "none",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quality Controls for Subscribed Users */}
        {access?.can_watch_full && (
          <div
            style={{
              background: "#181818",
              borderBottom: "1px solid #282828",
              padding: "0.4rem 1.5rem",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: "0.85rem",
            }}
          >
            <span style={{ color: "#aaa" }}>Streaming Quality:</span>
            <button
              type="button"
              onClick={() => handleQualityChange("1080p")}
              style={{
                background: selectedQuality === "1080p" ? "#3498db" : "#282828",
                color: "#fff",
                border: "none",
                padding: "0.25rem 0.6rem",
                borderRadius: "3px",
                cursor: "pointer",
                fontWeight: selectedQuality === "1080p" ? "bold" : "normal",
              }}
            >
              1080p Full HD
            </button>
            <button
              type="button"
              onClick={() => handleQualityChange("4k")}
              style={{
                background: selectedQuality === "4k" ? "#f39c12" : "#282828",
                color: selectedQuality === "4k" ? "#000" : access.membership === "basic" ? "#777" : "#fff",
                border: "none",
                padding: "0.25rem 0.6rem",
                borderRadius: "3px",
                cursor: "pointer",
                fontWeight: selectedQuality === "4k" ? "bold" : "normal",
              }}
              title={access.membership === "basic" ? "Requires Premium" : "4K Ultra HD"}
            >
              4K Ultra HD {access.membership === "basic" ? "🔒" : ""}
            </button>
          </div>
        )}

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
              <h2>{playbackStream?.title || movie?.title || "Movie"}</h2>
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

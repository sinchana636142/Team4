import { useCallback, useEffect, useRef, useState } from "react";
import "./VideoPlayer.css";

const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function getYouTubeId(url) {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname === "youtu.be") {
      return parsedUrl.pathname.slice(1);
    }

    if (
      ["www.youtube.com", "youtube.com", "m.youtube.com"].includes(
        parsedUrl.hostname
      )
    ) {
      if (parsedUrl.pathname === "/watch") {
        return parsedUrl.searchParams.get("v");
      }

      if (
        parsedUrl.pathname.startsWith("/embed/") ||
        parsedUrl.pathname.startsWith("/shorts/")
      ) {
        return parsedUrl.pathname.split("/")[2];
      }
    }
  } catch {
    return null;
  }

  return null;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function PlayerIcon({ name, size = 22 }) {
  const sharedProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (name) {
    case "pause":
      return (
        <svg {...sharedProps}>
          <path d="M9 5v14M15 5v14" />
        </svg>
      );
    case "back":
      return (
        <svg {...sharedProps}>
          <path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" />
          <path d="M3 3v5h5M12 8v4l2.5 1.5" />
        </svg>
      );
    case "forward":
      return (
        <svg {...sharedProps}>
          <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" />
          <path d="M21 3v5h-5M12 8v4l-2.5 1.5" />
        </svg>
      );
    case "volume":
      return (
        <svg {...sharedProps}>
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
      );
    case "muted":
      return (
        <svg {...sharedProps}>
          <path d="M11 5 6 9H3v6h3l5 4V5ZM16 9l5 6M21 9l-5 6" />
        </svg>
      );
    case "fullscreen":
      return (
        <svg {...sharedProps}>
          <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
        </svg>
      );
    case "exitFullscreen":
      return (
        <svg {...sharedProps}>
          <path d="M4 14h6v6M20 14h-6v6M4 10h6V4M20 10h-6V4" />
        </svg>
      );
    case "settings":
      return (
        <svg {...sharedProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </svg>
      );
    default:
      return (
        <svg {...sharedProps}>
          <path d="m9 6 10 6-10 6V6Z" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

export default function VideoPlayer({
  src,
  videoRef,
  onStartupMeasured,
  title = "StreamHub video",
  poster,
  isPreview = false,
  maxPreviewSeconds = 120,
  onPreviewEnd,
  onUpgradeClick,
  onPlayTrailer,
  qualityBadge = "1080p",
  qualityNotice = "",
}) {
  const youtubeId = getYouTubeId(src);
  const playerRef = useRef(null);
  const internalVideoRef = useRef(null);
  const hideControlsTimer = useRef(null);
  const feedbackTimer = useRef(null);
  const feedbackId = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState("");
  const [centerFeedback, setCenterFeedback] = useState(null);
  const [previewEnded, setPreviewEnded] = useState(false);

  const setVideoElement = useCallback(
    (video) => {
      internalVideoRef.current = video;
      if (videoRef) videoRef.current = video;
    },
    [videoRef]
  );

  useEffect(() => {
    setIsPlaying(false);
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);
    setBuffered(0);
    setError("");
    setPlaybackRate(1);
    setPreviewEnded(false);
  }, [src]);

  useEffect(() => {
    function syncFullscreen() {
      setIsFullscreen(document.fullscreenElement === playerRef.current);
    }

    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const updateBuffered = useCallback((event) => {
    const video = event.currentTarget;
    if (!video.buffered || video.buffered.length === 0 || !Number.isFinite(video.duration)) {
      setBuffered(0);
      return;
    }
    const end = video.buffered.end(video.buffered.length - 1);
    setBuffered(Math.min(100, Math.max(0, (end / video.duration) * 100)));
  }, []);

  const showCenterFeedback = useCallback((type) => {
    feedbackId.current += 1;
    setCenterFeedback({ id: feedbackId.current, type });
    window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => {
      setCenterFeedback(null);
    }, 850);
  }, []);

  const togglePlayback = useCallback(() => {
    if (previewEnded) return;
    const video = internalVideoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      showCenterFeedback("play");
      video.play().catch(() => setIsPlaying(false));
    } else {
      showCenterFeedback("pause");
      video.pause();
    }
  }, [showCenterFeedback, previewEnded]);

  const seekBy = useCallback((amount) => {
    const video = internalVideoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    const maxAllowed = isPreview ? maxPreviewSeconds : video.duration;
    const nextTime = Math.min(
      maxAllowed,
      Math.max(0, video.currentTime + amount)
    );
    video.currentTime = nextTime;
    showCenterFeedback(amount < 0 ? `rewind-${Math.abs(amount)}` : `forward-${amount}`);
  }, [showCenterFeedback, isPreview, maxPreviewSeconds]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    playerRef.current?.requestFullscreen?.();
  }, []);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    window.clearTimeout(hideControlsTimer.current);
    if (internalVideoRef.current && !internalVideoRef.current.paused) {
      hideControlsTimer.current = window.setTimeout(
        () => setControlsVisible(false),
        2800
      );
    }
  }, []);

  function handleKeyDown(event) {
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (
      target &&
      (["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName) ||
        target.isContentEditable ||
        (target.tagName === "BUTTON" && event.key === " "))
    ) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case " ":
      case "k":
        event.preventDefault();
        togglePlayback();
        break;
      case "f":
        event.preventDefault();
        toggleFullscreen();
        break;
      case "arrowleft":
        event.preventDefault();
        seekBy(-10);
        break;
      case "arrowright":
        event.preventDefault();
        seekBy(10);
        break;
      case "m":
        event.preventDefault();
        if (internalVideoRef.current) {
          internalVideoRef.current.muted = !internalVideoRef.current.muted;
        }
        break;
      default:
        break;
    }
  }

  function handleVolumeChange(event) {
    const nextVolume = Number(event.target.value);
    const video = internalVideoRef.current;
    if (!video) return;
    video.volume = nextVolume;
    video.muted = nextVolume === 0;
  }

  function handleSeek(event) {
    const video = internalVideoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    const maxAllowed = isPreview ? maxPreviewSeconds : video.duration;
    const nextTime = Math.min(maxAllowed, Number(event.target.value));
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
    if (previewEnded && nextTime < maxPreviewSeconds) {
      setPreviewEnded(false);
    }
  }

  function changePlaybackRate(rate) {
    const video = internalVideoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setSettingsOpen(false);
  }

  if (youtubeId) {
    const embedUrl = new URL(`https://www.youtube.com/embed/${youtubeId}`);
    embedUrl.searchParams.set("autoplay", "1");
    embedUrl.searchParams.set("controls", "1");

    return (
      <iframe
        className="stream-player-embed"
        src={embedUrl.toString()}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={() => onStartupMeasured?.()}
      />
    );
  }

  const effectiveDuration = isPreview
    ? Math.min(duration || maxPreviewSeconds, maxPreviewSeconds)
    : duration;
  const progressPercent = effectiveDuration > 0
    ? Math.min(100, (currentTime / effectiveDuration) * 100)
    : 0;

  return (
    <div
      ref={playerRef}
      className={`stream-player${controlsVisible ? " controls-visible" : ""}`}
      onMouseMove={showControls}
      onMouseLeave={() => {
        if (internalVideoRef.current && !internalVideoRef.current.paused) {
          setControlsVisible(false);
        }
      }}
      onTouchStart={showControls}
      onKeyDown={handleKeyDown}
      onClick={showControls}
      tabIndex={0}
      aria-label={`${title} video player`}
    >
      <video
        ref={setVideoElement}
        className="stream-player-video"
        src={src}
        poster={poster}
        autoPlay
        preload="auto"
        playsInline
        onClick={(event) => {
          event.stopPropagation();
          togglePlayback();
        }}
        onCanPlay={() => {
          setIsLoading(false);
          onStartupMeasured?.();
        }}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsPlaying(true);
          setIsLoading(false);
          showControls();
        }}
        onPause={() => {
          setIsPlaying(false);
          setControlsVisible(true);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setControlsVisible(true);
        }}
        onTimeUpdate={(event) => {
          const t = event.currentTarget.currentTime;
          setCurrentTime(t);
          if (isPreview && t >= maxPreviewSeconds) {
            event.currentTarget.pause();
            event.currentTarget.currentTime = maxPreviewSeconds;
            setIsPlaying(false);
            setPreviewEnded(true);
            setControlsVisible(true);
            if (onPreviewEnd) onPreviewEnd();
          }
        }}
        onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
        onProgress={updateBuffered}
        onVolumeChange={(event) => {
          setVolume(event.currentTarget.volume);
          setIsMuted(event.currentTarget.muted);
        }}
        onError={() => {
          setError("This video could not be played. Check the video URL and try again.");
          setIsLoading(false);
        }}
      />

      {/* Free 2-Minute Preview Indicator Badge */}
      {isPreview && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: "16px",
            zIndex: 10,
            background: "rgba(15, 15, 25, 0.85)",
            border: "1px solid #e50914",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "bold",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backdropFilter: "blur(4px)",
          }}
        >
          <span style={{ color: "#e50914" }}>⏱</span> Free Preview: {formatTime(currentTime)} / {formatTime(maxPreviewSeconds)}
        </div>
      )}

      {/* Quality Badge */}
      {qualityBadge && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            zIndex: 10,
            background: "rgba(0, 0, 0, 0.7)",
            border: "1px solid #444",
            padding: "4px 10px",
            borderRadius: "14px",
            fontSize: "12px",
            fontWeight: "bold",
            color: qualityBadge.toUpperCase() === "4K" ? "#f39c12" : "#3498db",
          }}
        >
          {qualityBadge.toUpperCase()}
        </div>
      )}

      {/* Quality Notice Banner */}
      {qualityNotice && (
        <div
          style={{
            position: "absolute",
            top: "54px",
            right: "16px",
            zIndex: 10,
            background: "rgba(20, 20, 30, 0.9)",
            border: "1px solid #f39c12",
            color: "#ffc107",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            maxWidth: "320px",
          }}
        >
          {qualityNotice}
        </div>
      )}

      {isLoading && !error && (
        <div className="stream-player-loading" role="status" aria-label="Loading video">
          <span />
        </div>
      )}

      {error && (
        <div className="stream-player-error" role="alert">
          <strong>Playback unavailable</strong>
          <span>{error}</span>
        </div>
      )}

      {/* 2-Minute Preview Ended Overlay Modal */}
      {previewEnded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(10, 10, 18, 0.95)",
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <span style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🎬</span>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem", color: "#fff" }}>
            2-Minute Preview Completed
          </h2>
          <p style={{ color: "#aaa", maxWidth: "480px", marginBottom: "1.5rem", lineHeight: "1.6", fontSize: "0.95rem" }}>
            You have reached the end of the free 2-minute preview for <strong>{title}</strong>. Upgrade to <strong>Basic (₹199/month)</strong> or <strong>Premium (₹499/month)</strong> to watch the full movie in Full HD or 4K.
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            {onUpgradeClick && (
              <button
                type="button"
                onClick={onUpgradeClick}
                style={{
                  background: "#e50914",
                  color: "#fff",
                  border: "none",
                  padding: "0.85rem 1.75rem",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                View Subscription Plans
              </button>
            )}
            {onPlayTrailer && (
              <button
                type="button"
                onClick={onPlayTrailer}
                style={{
                  background: "#24232f",
                  color: "#fff",
                  border: "1px solid #555",
                  padding: "0.85rem 1.5rem",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Watch Full Trailer
              </button>
            )}
          </div>
        </div>
      )}

      {!isPlaying && !isLoading && !error && !previewEnded && (
        <button
          type="button"
          className="stream-player-center-play"
          aria-label="Play video"
          onClick={togglePlayback}
        >
          <PlayerIcon name="play" size={30} />
        </button>
      )}

      {centerFeedback && (
        <div
          key={centerFeedback.id}
          className={`stream-player-feedback${centerFeedback.type.startsWith("rewind") ? " seek-feedback rewind-feedback" : ""}${centerFeedback.type.startsWith("forward") ? " seek-feedback forward-feedback" : ""}`}
          aria-hidden="true"
        >
          <PlayerIcon
            name={
              centerFeedback.type === "play"
                ? "play"
                : centerFeedback.type === "pause"
                ? "pause"
                : centerFeedback.type.startsWith("rewind")
                ? "back"
                : "forward"
            }
            size={36}
          />
        </div>
      )}

      <div className="stream-player-controls" onClick={(event) => event.stopPropagation()}>
        <div className="stream-player-progress-container">
          <input
            type="range"
            min="0"
            max={effectiveDuration || 0}
            step="0.1"
            value={Math.min(currentTime, effectiveDuration || 0)}
            onChange={handleSeek}
            className="stream-player-progress"
            aria-label="Seek slider"
            style={{
              "--progress-percent": `${progressPercent}%`,
              "--buffered-percent": `${buffered}%`,
            }}
          />
        </div>

        <div className="stream-player-bar">
          <div className="stream-player-control-group">
            <button
              type="button"
              className="stream-player-button"
              onClick={togglePlayback}
              aria-label={isPlaying ? "Pause video" : "Play video"}
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              <PlayerIcon name={isPlaying ? "pause" : "play"} />
            </button>
            <button
              type="button"
              className="stream-player-button"
              onClick={() => seekBy(-10)}
              aria-label="Rewind 10 seconds"
              title="Rewind 10s (Left Arrow)"
            >
              <PlayerIcon name="back" />
              <span>10</span>
            </button>
            <button
              type="button"
              className="stream-player-button"
              onClick={() => seekBy(10)}
              aria-label="Fast forward 10 seconds"
              title="Fast forward 10s (Right Arrow)"
            >
              <PlayerIcon name="forward" />
              <span>10</span>
            </button>
            <div className="stream-player-volume">
              <button
                type="button"
                className="stream-player-button"
                onClick={() => {
                  const video = internalVideoRef.current;
                  if (video) video.muted = !video.muted;
                }}
                aria-label={isMuted || volume === 0 ? "Unmute video" : "Mute video"}
                title="Mute (M)"
              >
                <PlayerIcon name={isMuted || volume === 0 ? "muted" : "volume"} />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Volume"
                className="stream-player-volume-range"
                style={{ "--volume-level": `${(isMuted ? 0 : volume) * 100}%` }}
              />
            </div>
            <span className="stream-player-time">
              {formatTime(currentTime)} <span>/</span> {formatTime(effectiveDuration)}
            </span>
          </div>

          <div className="stream-player-control-group">
            <div className="stream-player-settings">
              <button
                type="button"
                className="stream-player-button settings-button"
                onClick={() => setSettingsOpen((open) => !open)}
                aria-label="Playback settings"
                aria-expanded={settingsOpen}
                title="Playback speed"
              >
                <PlayerIcon name="settings" />
                <span className="stream-player-speed-label">{playbackRate}×</span>
              </button>
              {settingsOpen && (
                <div className="stream-player-speed-menu" role="group" aria-label="Playback speed">
                  <strong>Playback speed</strong>
                  {playbackRates.map((rate) => (
                    <button
                      type="button"
                      key={rate}
                      className={rate === playbackRate ? "selected" : ""}
                      onClick={() => changePlaybackRate(rate)}
                      aria-pressed={rate === playbackRate}
                    >
                      {rate === 1 ? "Normal" : `${rate}×`}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              className="stream-player-button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title="Fullscreen (F)"
            >
              <PlayerIcon name={isFullscreen ? "exitFullscreen" : "fullscreen"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

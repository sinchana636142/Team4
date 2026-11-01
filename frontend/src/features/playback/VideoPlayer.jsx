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
          <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      );
    case "exitFullscreen":
      return (
        <svg {...sharedProps}>
          <path d="M8 3v5H3M16 3v5h5M3 16h5v5M21 16h-5v5" />
        </svg>
      );
    case "settings":
      return (
        <svg {...sharedProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z" />
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
  }, [src]);

  useEffect(() => {
    function syncFullscreen() {
      setIsFullscreen(document.fullscreenElement === playerRef.current);
    }

    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(hideControlsTimer.current);
      window.clearTimeout(feedbackTimer.current);
      if (videoRef) videoRef.current = null;
    },
    [videoRef]
  );

  const showCenterFeedback = useCallback((feedback) => {
    window.clearTimeout(feedbackTimer.current);
    setCenterFeedback({ type: feedback, id: feedbackId.current + 1 });
    feedbackId.current += 1;
    feedbackTimer.current = window.setTimeout(() => {
      setCenterFeedback(null);
    }, 850);
  }, []);

  const togglePlayback = useCallback(() => {
    const video = internalVideoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      showCenterFeedback("play");
      video.play().catch(() => setIsPlaying(false));
    } else {
      showCenterFeedback("pause");
      video.pause();
    }
  }, [showCenterFeedback]);

  const seekBy = useCallback((amount) => {
    const video = internalVideoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.min(
      video.duration,
      Math.max(0, video.currentTime + amount)
    );
    showCenterFeedback(amount < 0 ? `rewind-${Math.abs(amount)}` : `forward-${amount}`);
  }, [showCenterFeedback]);

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
      case "arrowleft":
        event.preventDefault();
        seekBy(-5);
        break;
      case "arrowright":
        event.preventDefault();
        seekBy(5);
        break;
      case "m": {
        const video = internalVideoRef.current;
        if (video) video.muted = !video.muted;
        break;
      }
      case "f":
        toggleFullscreen();
        break;
      default:
        break;
    }
  }

  function updateBuffered() {
    const video = internalVideoRef.current;
    if (!video || !video.duration || video.buffered.length === 0) {
      setBuffered(0);
      return;
    }

    setBuffered(
      Math.min(100, (video.buffered.end(video.buffered.length - 1) / video.duration) * 100)
    );
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
    const nextTime = Number(event.target.value);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
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
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
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

      {!isPlaying && !isLoading && !error && (
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
            size={28}
          />
          {centerFeedback.type.startsWith("rewind") && (
            <span>{centerFeedback.type.slice("rewind-".length)} sec</span>
          )}
          {centerFeedback.type.startsWith("forward") && (
            <span>{centerFeedback.type.slice("forward-".length)} sec</span>
          )}
        </div>
      )}

      <div className={`stream-player-controls${controlsVisible ? " visible" : ""}`}>
        <div className="stream-player-progress">
          <div className="stream-player-track">
            <span className="stream-player-buffered" style={{ width: `${buffered}%` }} />
            <span
              className="stream-player-progress-fill"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            onChange={handleSeek}
            aria-label="Seek video"
            className="stream-player-seek"
            style={{
              "--seek-progress": `${duration ? (currentTime / duration) * 100 : 0}%`,
            }}
          />
        </div>

        <div className="stream-player-toolbar">
          <div className="stream-player-control-group">
            <button
              type="button"
              className="stream-player-button primary"
              onClick={togglePlayback}
              aria-label={isPlaying ? "Pause video" : "Play video"}
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              <PlayerIcon name={isPlaying ? "pause" : "play"} />
            </button>
            <button
              type="button"
              className="stream-player-button skip-button"
              onClick={() => seekBy(-5)}
              aria-label="Rewind 5 seconds"
              title="Rewind 5 seconds (←)"
            >
              <PlayerIcon name="back" />
              <span>5</span>
            </button>
            <button
              type="button"
              className="stream-player-button skip-button"
              onClick={() => seekBy(5)}
              aria-label="Forward 5 seconds"
              title="Forward 5 seconds (→)"
            >
              <PlayerIcon name="forward" />
              <span>5</span>
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
              {formatTime(currentTime)} <span>/</span> {formatTime(duration)}
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

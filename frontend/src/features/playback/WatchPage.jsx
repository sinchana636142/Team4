import { useEffect, useRef, useState } from "react";
import "../features.css";
import WatchlistButton from "../watchlist/WatchlistButton";
import { getPlayback } from "./playbackApi";
import useResume from "./useResume";
import useWatchHistory from "./useWatchHistory";
import VideoPlayer from "./VideoPlayer";

export default function WatchPage({ titleId, onBack }) {
  const videoRef = useRef(null);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [startupTimeMs, setStartupTimeMs] = useState(null);
  const startTimeRef = useRef(performance.now());

  useEffect(() => {
    startTimeRef.current = performance.now();
    setStartupTimeMs(null);
    setInfo(null);
    setError("");
    getPlayback(titleId)
      .then(setInfo)
      .catch((e) => setError(e.message));
  }, [titleId]);

  useResume(titleId, videoRef, info !== null);
  useWatchHistory(titleId, videoRef, info !== null);

  function handleStartupMeasured() {
    if (startupTimeMs === null) {
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      setStartupTimeMs(elapsed);
    }
  }

  let content;
  if (error) {
    content = <p role="alert" className="feature-error">{error}</p>;
  } else if (!info) {
    content = <p>Loading video details...</p>;
  } else {
    content = (
      <div>
        <h2>{info.title}</h2>
        <VideoPlayer
          src={info.video_url}
          videoRef={videoRef}
          onStartupMeasured={handleStartupMeasured}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
          <WatchlistButton titleId={titleId} />
          {startupTimeMs !== null && (
            <span style={{ fontSize: "0.85rem", color: startupTimeMs <= 5000 ? "#2ecc71" : "#e74c3c" }}>
              ⚡ Startup time: {(startupTimeMs / 1000).toFixed(2)}s (OTT-NF-002 target: ≤ 5.0s)
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="feature-page">
      <button type="button" onClick={onBack}>← Back</button>
      {content}
    </div>
  );
}

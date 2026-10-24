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

  useEffect(() => {
    setInfo(null);
    setError("");
    getPlayback(titleId)
      .then(setInfo)
      .catch((e) => setError(e.message));
  }, [titleId]);

  useResume(titleId, videoRef, info !== null);
  useWatchHistory(titleId, videoRef, info !== null);

  let content;
  if (error) {
    content = <p role="alert" className="feature-error">{error}</p>;
  } else if (!info) {
    content = <p>Loading...</p>;
  } else {
    content = (
      <div>
        <h2>{info.title}</h2>
        <VideoPlayer src={info.video_url} videoRef={videoRef} />
        <p>
          <WatchlistButton titleId={titleId} />
        </p>
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

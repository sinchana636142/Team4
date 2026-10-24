import { useEffect } from "react";
import { recordView } from "./historyApi";

// Records one history entry the first time the viewer presses play on this page.
export default function useWatchHistory(titleId, videoRef, ready) {
  useEffect(() => {
    const video = videoRef.current;
    if (!ready || !video) return undefined;

    function onPlay() {
      recordView(titleId).catch(() => {});
    }
    video.addEventListener("play", onPlay, { once: true });

    return () => video.removeEventListener("play", onPlay);
  }, [titleId, ready, videoRef]);
}

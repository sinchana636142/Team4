import { useEffect } from "react";
import { getResume, saveResume } from "./resumeApi";

// Jumps the video to the saved position, then saves the position every 5 seconds,
// when paused, and when leaving the page. `ready` = the <video> element is on screen.
export default function useResume(titleId, videoRef, ready) {
  useEffect(() => {
    const video = videoRef.current;
    if (!ready || !video) return undefined;

    function save() {
      if (video.currentTime > 0) {
        saveResume(titleId, Math.floor(video.currentTime)).catch(() => {});
      }
    }

    getResume(titleId)
      .then((data) => {
        function jump() {
          video.currentTime = data.position_seconds;
        }
        if (video.readyState >= 1) {
          jump();
        } else {
          video.addEventListener("loadedmetadata", jump, { once: true });
        }
      })
      .catch(() => {});

    const timer = setInterval(() => {
      if (!video.paused) save();
    }, 5000);
    video.addEventListener("pause", save);

    return () => {
      clearInterval(timer);
      video.removeEventListener("pause", save);
      save();
    };
  }, [titleId, ready, videoRef]);
}

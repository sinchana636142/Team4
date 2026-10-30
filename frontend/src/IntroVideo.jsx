
import React, { useEffect, useRef } from "react";
import "./IntroVideo.css";

export default function IntroVideo({ onComplete }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.currentTime = 0;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.error("Intro video autoplay failed:", error);
      }
    };

    playVideo();
  }, []);

  const handleVideoEnd = () => {
    if (onComplete) {
      onComplete();
    }
  };

  const handleVideoError = () => {
    console.error(
      "Could not load /intro.mp4. Check the filename in the public folder."
    );
  };

  return (
    <div className="intro-video-screen">
      <video
        ref={videoRef}
        className="intro-video"
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleVideoEnd}
        onError={handleVideoError}
      />

    
    </div>
  );
}

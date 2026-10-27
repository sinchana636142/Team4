// HTML5 video player with optimized preloading for fast startup (OTT-NF-002)
export default function VideoPlayer({ src, videoRef, onStartupMeasured }) {
  return (
    <video
      ref={videoRef}
      src={src}
      controls
      preload="auto"
      playsInline
      onCanPlay={() => {
        if (onStartupMeasured) onStartupMeasured();
      }}
      style={{ width: "100%", maxHeight: "500px", borderRadius: "8px", background: "#000" }}
    />
  );
}

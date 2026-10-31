
// Supports YouTube videos and normal MP4 videos
export default function VideoPlayer({ src, videoRef, onStartupMeasured }) {
  const getYouTubeId = (url) => {
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

        if (parsedUrl.pathname.startsWith("/embed/")) {
          return parsedUrl.pathname.split("/")[2];
        }

        if (parsedUrl.pathname.startsWith("/shorts/")) {
          return parsedUrl.pathname.split("/")[2];
        }
      }
    } catch {
      return null;
    }

    return null;
  };

  const youtubeId = getYouTubeId(src);

  if (youtubeId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title="StreamHub Video Player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={() => onStartupMeasured?.()}
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          border: "none",
          borderRadius: "8px",
          background: "#000",
        }}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      preload="auto"
      playsInline
      onCanPlay={() => onStartupMeasured?.()}
      style={{
        width: "100%",
        maxHeight: "500px",
        borderRadius: "8px",
        background: "#000",
      }}
    />
  );
}

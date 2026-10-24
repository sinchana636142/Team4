// Plain HTML5 video player. videoRef lets the page add resume / history behaviour later.
export default function VideoPlayer({ src, videoRef }) {
  return <video ref={videoRef} src={src} controls preload="metadata" />;
}

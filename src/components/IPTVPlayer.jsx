import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function IPTVPlayer({ url }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    let hls;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
    } else {
      videoRef.current.src = url;
    }

    return () => hls && hls.destroy();
  }, [url]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      style={{
        width: "100%",
        height: "100%",
        background: "black",
      }}
    />
  );
}

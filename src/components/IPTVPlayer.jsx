"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function IPTVPlayer({ url }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

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

  if (error) {
    return (
      <div className="w-full h-full bg-black text-white flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      playsInline
      className="w-full h-full bg-black"
    />
  );
}

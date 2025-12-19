"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

const isBrowserPlayable = (url) => {
  if (!url) return false;

  const u = url.toLowerCase();

  // ❌ VLC-only / unsupported
  if (
    u.endsWith(".ts") ||
    u.includes("/play/") ||
    u.startsWith("rtsp://") ||
    u.startsWith("udp://")
  ) {
    return false;
  }

  // ✅ Browser supported
  return u.endsWith(".m3u8") || u.endsWith(".mp4") || u.endsWith(".webm");
};

export default function IPTVPlayer({ url, onUnsupported }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!url || !videoRef.current) return;

    // 🚫 Block unsupported channels
    if (!isBrowserPlayable(url)) {
      onUnsupported?.(url);
      return;
    }

    let hls;

    const proxiedUrl = `/api/stream?url=${encodeURIComponent(url)}`;

    if (Hls.isSupported() && url.endsWith(".m3u8")) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(proxiedUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          hls.destroy();
          onUnsupported?.(url);
        }
      });
    } else {
      videoRef.current.src = proxiedUrl;
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [url]);

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

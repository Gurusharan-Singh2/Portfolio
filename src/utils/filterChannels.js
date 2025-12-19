export const isBrowserPlayable = (url) => {
  if (!url) return false;

  const lower = url.toLowerCase();

  // ❌ Block VLC-only formats
  if (
    lower.endsWith(".ts") ||
    lower.includes("/play/") ||
    lower.startsWith("rtsp://") ||
    lower.startsWith("udp://")
  ) {
    return false;
  }

  // ✅ Allow browser formats
  return (
    lower.endsWith(".m3u8") ||
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm")
  );
};

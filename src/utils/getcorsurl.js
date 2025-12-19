const CORS_PROXY = "https://corsproxy.io/?"; // Alternative: https://api.allorigins.win/raw?url=

export function getProxyUrl(url) {
  if (!url) return url;
  // Encode the original URL
  return CORS_PROXY + encodeURIComponent(url);
} 
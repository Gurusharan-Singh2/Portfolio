import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const res = await fetch(targetUrl, {
   headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": "https://google.com",
    "Referer": "https://google.com/",
    "Connection": "keep-alive",
  },
  });

  const contentType = res.headers.get("content-type") || "";

  // 🔹 Pass-through for non-m3u8 files
  if (!contentType.includes("application/vnd.apple.mpegurl")) {
    return new NextResponse(res.body, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  let playlist = await res.text();
  const urlObj = new URL(targetUrl);
  const origin = urlObj.origin;
  const basePath = targetUrl.substring(0, targetUrl.lastIndexOf("/") + 1);

  playlist = playlist.replace(/^(?!#)(.+)$/gm, (line) => {
    line = line.trim();
    if (!line) return line;

    let resolvedUrl;

    // ✅ Absolute path (/manifest/...)
    if (line.startsWith("/")) {
      resolvedUrl = origin + line;
    }
    // ✅ Full URL
    else if (line.startsWith("http")) {
      resolvedUrl = line;
    }
    // ✅ Relative path
    else {
      resolvedUrl = basePath + line;
    }

    return `/api/hls?url=${encodeURIComponent(resolvedUrl)}`;
  });

  return new NextResponse(playlist, {
    headers: {
      "Content-Type": "application/vnd.apple.mpegurl",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    },
  });
}

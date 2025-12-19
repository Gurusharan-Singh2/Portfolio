import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": targetUrl,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Stream fetch failed" }, { status: 500 });
    }

    const contentType = res.headers.get("content-type") || "";

    // If NOT an m3u8 file → just pipe it
    if (!contentType.includes("application/vnd.apple.mpegurl")) {
      return new NextResponse(res.body, {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Rewrite m3u8 file
    let text = await res.text();

    const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf("/") + 1);

    text = text.replace(/^(?!#)(.+)$/gm, (line) => {
      if (line.startsWith("http")) {
        return `/api/stream?url=${encodeURIComponent(line)}`;
      }
      return `/api/stream?url=${encodeURIComponent(baseUrl + line)}`;
    });

    return new NextResponse(text, {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}

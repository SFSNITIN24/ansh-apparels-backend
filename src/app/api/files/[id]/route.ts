import { NextResponse } from "next/server";
import { Readable } from "stream";

import { getGridFSFileInfo, openGridFSDownloadStream } from "@/lib/gridfs";

// CORS headers for image files - allow from anywhere
function getImageHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: getImageHeaders(),
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = new Headers(getImageHeaders());

  try {
    const { id } = await params;
    const info = await getGridFSFileInfo(id);
    if (!info) {
      return NextResponse.json({ message: "Not found" }, { status: 404, headers });
    }
    const nodeStream = await openGridFSDownloadStream(id);

    headers.set("Content-Type", info.contentType || "application/octet-stream");
    if (info.filename) {
      headers.set("Content-Disposition", `inline; filename="${info.filename}"`);
    }
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    // Convert Node Readable to Web ReadableStream for NextResponse (Node 18+)
    const webStream = Readable.toWeb(nodeStream as unknown as Readable) as ReadableStream;
    return new NextResponse(webStream, { status: 200, headers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Not found";
    return NextResponse.json({ message: msg }, { status: 404, headers });
  }
}

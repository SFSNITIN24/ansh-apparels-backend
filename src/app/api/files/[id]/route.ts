import { NextResponse } from "next/server";
import { Readable } from "stream";

import { getCorsHeaders } from "@/lib/cors";
import { getGridFSFileInfo, openGridFSDownloadStream } from "@/lib/gridfs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get("origin");
  const headers = new Headers(getCorsHeaders(origin));

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
    const webStream = Readable.toWeb(nodeStream as any) as any;
    return new NextResponse(webStream, { status: 200, headers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Not found";
    return NextResponse.json({ message: msg }, { status: 404, headers });
  }
}



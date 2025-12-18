import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    message: "Ansh Apparels Backend is running. Try /api/health",
  });
}




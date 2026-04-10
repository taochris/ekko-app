import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "";
  return NextResponse.json({
    length: key.length,
    starts: key.substring(0, 40),
    hasLiteralBackslashN: key.includes("\\n"),
    hasRealNewline: key.includes("\n"),
  });
}

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.redirect(new URL(`/capsule/${id}`, req.url));
}

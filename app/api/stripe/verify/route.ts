import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-03-25.dahlia",
  });
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ paid: false }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("[stripe/verify] payment_status:", session.payment_status);
    const paid = session.payment_status === "paid";
    return NextResponse.json({ paid });
  } catch (err) {
    console.error("[stripe/verify]", err);
    return NextResponse.json({ paid: false }, { status: 500 });
  }
}

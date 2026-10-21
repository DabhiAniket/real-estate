import { NextResponse } from "next/server";
import { validateEnquiry, type Enquiry } from "@/lib/enquiry";

/**
 * Receives consultation enquiries. Validates on the server, then forwards the
 * enquiry as JSON to ENQUIRY_WEBHOOK_URL (e.g. a CRM, Zapier/Make hook or an
 * email service endpoint). Without that variable the route reports that
 * delivery is not configured instead of pretending to succeed.
 */
export async function POST(request: Request) {
  let body: Partial<Enquiry>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const enquiry: Enquiry = {
    name: String(body.name ?? "").slice(0, 120),
    email: String(body.email ?? "").slice(0, 200),
    phone: String(body.phone ?? "").slice(0, 30),
    interest: String(body.interest ?? "").slice(0, 60),
    message: String(body.message ?? "").slice(0, 2000),
    property: body.property ? String(body.property).slice(0, 120) : undefined,
  };
  const errors = validateEnquiry(enquiry);
  if (Object.keys(errors).length) return NextResponse.json({ error: "validation", errors }, { status: 422 });

  const hook = process.env.ENQUIRY_WEBHOOK_URL;
  if (!hook) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  try {
    const res = await fetch(hook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...enquiry, receivedAt: new Date().toISOString(), source: "website" }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  } catch {
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

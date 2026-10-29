import { NextResponse } from "next/server";
import { readDb, writeDb, type Availability } from "@/lib/db";

// One host with their meeting types: /api/host?slug=casey-example
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug");
  const db = await readDb();
  const host = db.hosts.find((h) => h.slug === slug);
  if (!host) return NextResponse.json({ error: "No such host." }, { status: 404 });
  return NextResponse.json({ host, meetingTypes: db.meetingTypes.filter((t) => t.hostSlug === slug) });
}

// Save weekly availability and buffer time. Body: { slug, availability, bufferMinutes }
// ZOMBIE: no host login. Anyone who knows (or guesses) a slug can change that host's availability.
// Add sign-in and check the signed-in user owns this host.
export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}));
  const db = await readDb();
  const host = db.hosts.find((h) => h.slug === body.slug);
  if (!host) return NextResponse.json({ error: "No such host." }, { status: 404 });

  if (Array.isArray(body.availability)) {
    host.availability = (body.availability as Availability[]).map((a) => ({
      day: Number(a.day), start: String(a.start), end: String(a.end),
    }));
  }
  if (body.bufferMinutes !== undefined) host.bufferMinutes = Number(body.bufferMinutes) || 0;
  await writeDb(db);
  return NextResponse.json(host);
}

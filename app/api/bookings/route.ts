import { NextResponse } from "next/server";
import { newId, readDb, writeDb, type Booking } from "@/lib/db";
import { toLocalString } from "@/lib/time";

// The host's upcoming bookings: /api/bookings?host=casey-example
// ZOMBIE: no host login. Anyone can list any host's bookings, with guest names and emails.
export async function GET(req: Request) {
  const host = new URL(req.url).searchParams.get("host");
  const db = await readDb();
  const now = toLocalString(new Date());
  const upcoming = db.bookings
    .filter((b) => b.hostSlug === host && b.start >= now)
    .sort((a, b) => a.start.localeCompare(b.start));
  return NextResponse.json(upcoming);
}

// A guest books a slot. Body: { hostSlug, typeId, start, guestName, guestEmail, answers }
// answers is a list of strings, one per question on the meeting type.
export async function POST(req: Request) {
  // ZOMBIE: no rate limit. A bot can send this request thousands of times and fill the whole
  // calendar. Add a rate limit per IP and a bot check (CAPTCHA or email confirmation).
  const body = await req.json().catch(() => ({}));
  const guestName = String(body.guestName ?? "").trim();
  const guestEmail = String(body.guestEmail ?? "").trim();
  if (!guestName || !guestEmail.includes("@")) {
    return NextResponse.json({ error: "Need a name and a valid email." }, { status: 400 });
  }
  const db = await readDb();
  const type = db.meetingTypes.find((t) => t.id === body.typeId && t.hostSlug === body.hostSlug);
  if (!type) return NextResponse.json({ error: "No such meeting type." }, { status: 404 });
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(String(body.start))) {
    return NextResponse.json({ error: "Bad start time." }, { status: 400 });
  }

  // ZOMBIE: BUG. No double-booking check. We never look at db.bookings before saving, so two
  // guests can book the same time. Reject the booking if it overlaps an existing one.
  const booking: Booking = {
    id: newId(),
    hostSlug: type.hostSlug,
    typeId: type.id,
    start: String(body.start),
    minutes: type.minutes,
    guestName,
    guestEmail,
    createdAt: new Date().toISOString(),
    answers: (type.questions ?? []).map((question, i) => ({
      question,
      answer: String(Array.isArray(body.answers) ? body.answers[i] ?? "" : "").slice(0, 500),
    })),
  };
  db.bookings.push(booking);
  await writeDb(db);

  // ZOMBIE: not built yet: confirmation and reminder emails. Nothing is sent to the guest or host.
  // ZOMBIE: not built yet: Google / Outlook calendar sync. The event is not added to anyone's calendar.
  return NextResponse.json(booking, { status: 201 });
}

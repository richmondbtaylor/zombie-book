import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

// One booking with its host and meeting type. The confirmation page (/booked/[id]) uses this.
// ZOMBIE: SECURITY HOLE. The booking id is the only "key". Anyone who has or guesses an id can read the
// guest's name, email and answers, and open the reschedule and cancel links. Fix: give each booking a
// secret random token, put it in the link, and check it here.
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  const booking = db.bookings.find((b) => b.id === id);
  if (!booking) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const host = db.hosts.find((h) => h.slug === booking.hostSlug);
  const type = db.meetingTypes.find((t) => t.id === booking.typeId);
  return NextResponse.json({ booking, host: host ? { slug: host.slug, name: host.name } : null, type: type ?? null });
}

// Cancel a booking.
// ZOMBIE: SECURITY HOLE. Anyone can cancel any booking if they know the id. We do not check that
// the caller is the host or the guest who made it. Fix: give each booking a secret cancel link
// (random token sent by email) and check the host's sign-in for host cancels.
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  const before = db.bookings.length;
  db.bookings = db.bookings.filter((b) => b.id !== id);
  if (db.bookings.length === before) return NextResponse.json({ error: "Not found." }, { status: 404 });
  await writeDb(db);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { newId, readDb, writeDb, type Booking } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

// A guest moves a booking to a new time. Body: { start: "2026-11-05T10:00" }
// Returns the NEW booking. The guest then lands on /booked/<new id>.
// ZOMBIE: BUG. The old booking is never removed or marked as moved. The host dashboard shows BOTH
// the old time and the new time as upcoming. Fix: change the existing booking's start (or delete the
// old one) in the same write.
// ZOMBIE: SECURITY HOLE. Anyone with the booking id can reschedule it. No secret token, no sign-in.
// ZOMBIE: the new time is not checked against open slots or other bookings (same double-booking bug).
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(String(body.start))) {
    return NextResponse.json({ error: "Bad start time." }, { status: 400 });
  }
  const db = await readDb();
  const old = db.bookings.find((b) => b.id === id);
  if (!old) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const moved: Booking = { ...old, id: newId(), start: String(body.start), rescheduledFrom: old.id };
  db.bookings.push(moved);
  await writeDb(db);
  return NextResponse.json(moved, { status: 201 });
}

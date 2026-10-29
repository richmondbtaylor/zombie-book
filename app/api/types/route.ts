import { NextResponse } from "next/server";
import { newId, readDb, writeDb } from "@/lib/db";

// Add a meeting type. Body: { hostSlug, name, minutes, questions }
// questions is a list of 0 to 2 strings the guest answers when booking.
// ZOMBIE: no host login, so anyone can add meeting types to any host.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const minutes = Number(body.minutes);
  if (!name || !minutes || minutes < 5) {
    return NextResponse.json({ error: "Need a name and minutes (5 or more)." }, { status: 400 });
  }
  const db = await readDb();
  if (!db.hosts.some((h) => h.slug === body.hostSlug)) {
    return NextResponse.json({ error: "No such host." }, { status: 404 });
  }
  const questions = (Array.isArray(body.questions) ? body.questions : [])
    .map((q: unknown) => String(q).trim().slice(0, 120))
    .filter(Boolean)
    .slice(0, 2);
  const type = { id: newId(), hostSlug: String(body.hostSlug), name, minutes, questions };
  db.meetingTypes.push(type);
  await writeDb(db);
  return NextResponse.json(type, { status: 201 });
}

// Delete a meeting type: DELETE /api/types?id=...
// ZOMBIE: no host login here either.
export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  const db = await readDb();
  const before = db.meetingTypes.length;
  db.meetingTypes = db.meetingTypes.filter((t) => t.id !== id);
  if (db.meetingTypes.length === before) return NextResponse.json({ error: "Not found." }, { status: 404 });
  await writeDb(db);
  return NextResponse.json({ ok: true });
}

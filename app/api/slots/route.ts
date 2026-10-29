import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { openSlots } from "@/lib/slots";

// Open slots for the next 7 days: /api/slots?host=casey-example&type=t2
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const db = await readDb();
  const type = db.meetingTypes.find((t) => t.id === q.get("type") && t.hostSlug === q.get("host"));
  if (!type) return NextResponse.json({ error: "No such meeting type." }, { status: 404 });
  return NextResponse.json(openSlots(db, type.hostSlug, type.minutes));
}

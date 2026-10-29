import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

// List all hosts (name and slug only).
export async function GET() {
  const db = await readDb();
  return NextResponse.json(db.hosts.map((h) => ({ slug: h.slug, name: h.name })));
}

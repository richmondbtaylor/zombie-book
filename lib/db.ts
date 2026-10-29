// ZOMBIE: this "database" is a JSON file on disk. It works on your laptop and
// dies on any real host (Vercel's disk is read-only and wiped on every deploy).
// Replace it with a real database (Supabase, Neon, Postgres...) before you ship.
import { promises as fs } from "fs";
import path from "path";
import seed from "@/data/seed.json";

export type Availability = { day: number; start: string; end: string }; // day: 0 = Sunday ... 6 = Saturday
export type Host = {
  slug: string; name: string; email: string; bufferMinutes: number; availability: Availability[];
};
export type MeetingType = { id: string; hostSlug: string; name: string; minutes: number; questions?: string[] }; // 0 to 2 questions the guest answers
export type Booking = {
  id: string; hostSlug: string; typeId: string; start: string; minutes: number;
  guestName: string; guestEmail: string; createdAt: string;
  answers?: { question: string; answer: string }[];
  rescheduledFrom?: string; // id of the booking this one replaced
};
export type Db = { hosts: Host[]; meetingTypes: MeetingType[]; bookings: Booking[] };

// ZOMBIE: the live site (Vercel) can't write to the app folder, so it writes to /tmp instead.
// /tmp is wiped whenever the server restarts, and each server copy keeps its own. Use a real database.
const DB_PATH = process.env.VERCEL
  ? path.join("/tmp", "db.json")
  : path.join(process.cwd(), "data", "db.json");

export async function readDb(): Promise<Db> {
  try {
    return JSON.parse(await fs.readFile(DB_PATH, "utf8")) as Db;
  } catch {
    const fresh = structuredClone(seed) as Db;
    await writeDb(fresh);
    return fresh;
  }
}

export async function writeDb(db: Db): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

export function newId(): string {
  // ZOMBIE: guessable ids. Anyone can walk the list by trying id+1.
  return String(Date.now());
}

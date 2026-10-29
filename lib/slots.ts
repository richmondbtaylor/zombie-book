import type { Db } from "@/lib/db";
import { label, toLocalString } from "@/lib/time";

export type Slot = { start: string; label: string };

// Open slots for the next 7 days for one host and one meeting length.
export function openSlots(db: Db, hostSlug: string, minutes: number): Slot[] {
  const host = db.hosts.find((h) => h.slug === hostSlug);
  if (!host) return [];
  const now = toLocalString(new Date());
  const slots: Slot[] = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date();
    day.setDate(day.getDate() + i);
    day.setHours(0, 0, 0, 0);

    for (const a of host.availability.filter((x) => x.day === day.getDay())) {
      const [sh, sm] = a.start.split(":").map(Number);
      const [eh, em] = a.end.split(":").map(Number);
      for (let t = sh * 60 + sm; t + minutes <= eh * 60 + em; t += minutes) {
        const d = new Date(day);
        d.setHours(0, t, 0, 0);
        const start = toLocalString(d);
        if (start <= now) continue; // already in the past

        // ZOMBIE: BUG. Double booking. We never remove slots that are already booked, so a taken
        // time still shows as open. Fix: skip any slot that overlaps a booking in db.bookings.
        // ZOMBIE: host.bufferMinutes is saved but ignored here. Leave a gap of that many
        // minutes before and after each booking.
        slots.push({ start, label: label(start) });
      }
    }
  }
  return slots;
}

// ZOMBIE: timezones are ignored. Every time is a plain "YYYY-MM-DDTHH:MM" string in the SERVER's
// clock. A guest in Tokyo sees the host's hours as if they were local. To do: store times in UTC,
// save the host's timezone, and show each guest their own timezone.

const pad = (n: number) => String(n).padStart(2, "0");

// Date -> "2026-10-30T10:00" (server local time)
export function toLocalString(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// "2026-10-30T10:00" -> "Fri, Oct 30, 10:00 AM"
export function label(s: string): string {
  const [date, time] = s.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const day = new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const ampm = hh >= 12 ? "PM" : "AM";
  return `${day}, ${hh % 12 || 12}:${pad(mm)} ${ampm}`;
}

// "2026-10-30T10:00" -> "Fri, Oct 30"
export function dayLabel(s: string): string {
  const [y, m, d] = s.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// "2026-10-30T14:05" -> "2:05 PM"
export function timeLabel(s: string): string {
  const [hh, mm] = s.split("T")[1].split(":").map(Number);
  return `${hh % 12 || 12}:${pad(mm)} ${hh >= 12 ? "PM" : "AM"}`;
}

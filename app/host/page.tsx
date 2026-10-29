"use client";
// Host dashboard: upcoming bookings, meeting types, availability.
// ZOMBIE: no host login. This page is open to everyone. Pick any host from the list and edit them.
import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { dayLabel, timeLabel, toLocalString } from "@/lib/time";
import type { Availability, Booking, Host, MeetingType } from "@/lib/db";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const NEW_TYPE = { name: "", minutes: "30", q1: "", q2: "" };

// The start of this week (Sunday) as a "YYYY-MM-DDTHH:MM" string, plus 7 and 14 days later.
function weekEdges() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  const start = toLocalString(d);
  d.setDate(d.getDate() + 7);
  const next = toLocalString(d);
  d.setDate(d.getDate() + 7);
  return { start, next, after: toLocalString(d) };
}

function Dashboard() {
  const params = useSearchParams();
  const [hosts, setHosts] = useState<{ slug: string; name: string }[]>([]);
  const [slug, setSlug] = useState(params.get("slug") ?? "");
  const [host, setHost] = useState<Host | null>(null);
  const [types, setTypes] = useState<MeetingType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rows, setRows] = useState<Availability[]>([]);
  const [buffer, setBuffer] = useState(0);
  const [newType, setNewType] = useState(NEW_TYPE);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    fetch("/api/hosts").then((r) => r.json()).then((list) => {
      setHosts(list);
      if (!slug && list[0]) setSlug(list[0].slug);
    });
  }, [slug]);

  const load = useCallback(async () => {
    if (!slug) return;
    const h = await (await fetch(`/api/host?slug=${slug}`)).json();
    setHost(h.host);
    setTypes(h.meetingTypes);
    setRows(h.host.availability);
    setBuffer(h.host.bufferMinutes);
    setBookings(await (await fetch(`/api/bookings?host=${slug}`)).json());
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  function rowFor(day: number) {
    return rows.find((r) => r.day === day);
  }

  function toggleDay(day: number, on: boolean) {
    setRows(on ? [...rows, { day, start: "09:00", end: "17:00" }] : rows.filter((r) => r.day !== day));
  }

  function setTime(day: number, key: "start" | "end", value: string) {
    setRows(rows.map((r) => (r.day === day ? { ...r, [key]: value } : r)));
  }

  async function saveAvailability() {
    const res = await fetch("/api/host", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, availability: rows, bufferMinutes: buffer }),
    });
    setMsg(res.ok ? "Saved." : "Could not save.");
  }

  async function addType() {
    const res = await fetch("/api/types", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hostSlug: slug, name: newType.name, minutes: Number(newType.minutes),
        questions: [newType.q1, newType.q2].filter((q) => q.trim()),
      }),
    });
    if (!res.ok) return setMsg((await res.json()).error);
    setMsg("");
    setNewType(NEW_TYPE);
    load();
  }

  async function cancel(id: string) {
    await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    load();
  }

  async function copyLink(typeId: string) {
    const link = `${window.location.origin}/book/${slug}?type=${typeId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(typeId);
    } catch {
      setMsg(`Copy this link: ${link}`);
    }
    setTimeout(() => setCopied(""), 2000);
  }

  // Numbers for the stat cards.
  const edges = weekEdges();
  const thisWeek = bookings.filter((b) => b.start >= edges.start && b.start < edges.next).length;
  const nextWeek = bookings.filter((b) => b.start >= edges.next && b.start < edges.after).length;

  // Group bookings by day (they come sorted by time).
  const byDay: { day: string; items: Booking[] }[] = [];
  for (const b of bookings) {
    const day = b.start.slice(0, 10);
    const last = byDay[byDay.length - 1];
    if (last && last.day === day) last.items.push(b);
    else byDay.push({ day, items: [b] });
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Host dashboard</h1>
          <p className="sub">Set your hours and meeting types, and see who booked.</p>
        </div>
        <label style={{ minWidth: 220 }}>Host
          <select value={slug} onChange={(e) => setSlug(e.target.value)}>
            {hosts.map((h) => <option key={h.slug} value={h.slug}>{h.name}</option>)}
          </select>
        </label>
      </div>

      {host && (
        <>
          <div className="stats">
            <div className="stat"><span className="stat-num">{thisWeek}</span><span className="stat-label">This week</span></div>
            <div className="stat"><span className="stat-num">{nextWeek}</span><span className="stat-label">Next week</span></div>
            <div className="stat"><span className="stat-num">{bookings.length}</span><span className="stat-label">All upcoming</span></div>
            <div className="stat"><span className="stat-num">{types.length}</span><span className="stat-label">Meeting types</span></div>
          </div>
          <p>Public page: <Link href={`/book/${host.slug}`}>/book/{host.slug}</Link></p>

          <h2>Upcoming bookings</h2>
          {bookings.length === 0 && (
            <div className="card empty">
              <strong>No upcoming bookings</strong>
              <span className="muted">Share a booking link from a meeting type below.</span>
            </div>
          )}
          {byDay.map((g) => (
            <div key={g.day} className="day-group">
              <div className="day-title">{dayLabel(g.day + "T00:00")}</div>
              <div className="list">
                {g.items.map((b) => {
                  const t = types.find((x) => x.id === b.typeId);
                  return (
                    <div key={b.id} className="card booking-row">
                      <div className="booking-time">{timeLabel(b.start)}</div>
                      <div className="booking-main">
                        <div>
                          <strong>{b.guestName}</strong> <span className="muted">({b.guestEmail})</span>
                        </div>
                        <div className="muted">
                          {t?.name ?? "Meeting"}, {b.minutes} min
                          {b.rescheduledFrom && <> <span className="pill">Rescheduled</span></>}
                        </div>
                        {(b.answers ?? []).filter((a) => a.answer).map((a) => (
                          <div key={a.question} className="answer"><span className="muted">{a.question}</span> {a.answer}</div>
                        ))}
                      </div>
                      <div className="booking-actions">
                        <Link className="btn ghost small-btn" href={`/booked/${b.id}`}>Open</Link>
                        <button className="ghost small-btn" onClick={() => cancel(b.id)}>Cancel</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <h2>Meeting types</h2>
          <div className="grid">
            {types.map((t) => (
              <div key={t.id} className="card stack">
                <div>
                  <strong>{t.name}</strong>
                  <div className="muted">{t.minutes} min</div>
                </div>
                <div className="muted">
                  {(t.questions ?? []).length === 0
                    ? "No questions"
                    : (t.questions ?? []).map((q) => <div key={q}>Q: {q}</div>)}
                </div>
                <button className="ghost" onClick={() => copyLink(t.id)}>
                  {copied === t.id ? "Copied" : "Copy booking link"}
                </button>
              </div>
            ))}
          </div>
          <div className="card stack" style={{ marginTop: 14 }}>
            <strong>Add a meeting type</strong>
            <div className="form-grid">
              <label>Name<input placeholder="e.g. Coffee chat" value={newType.name} onChange={(e) => setNewType({ ...newType, name: e.target.value })} /></label>
              <label>Minutes<input type="number" value={newType.minutes} onChange={(e) => setNewType({ ...newType, minutes: e.target.value })} /></label>
              <label>Question 1 (optional)<input value={newType.q1} onChange={(e) => setNewType({ ...newType, q1: e.target.value })} /></label>
              <label>Question 2 (optional)<input value={newType.q2} onChange={(e) => setNewType({ ...newType, q2: e.target.value })} /></label>
            </div>
            <div><button onClick={addType}>Add meeting type</button></div>
          </div>

          <h2>Weekly availability</h2>
          <div className="card stack">
            {DAYS.map((name, day) => {
              const r = rowFor(day);
              return (
                <div key={day} className="row">
                  <label style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, width: 150 }}>
                    <input type="checkbox" style={{ width: "auto" }} checked={Boolean(r)} onChange={(e) => toggleDay(day, e.target.checked)} />
                    {name}
                  </label>
                  {r && (
                    <>
                      <input type="time" style={{ width: 130 }} value={r.start} onChange={(e) => setTime(day, "start", e.target.value)} />
                      to
                      <input type="time" style={{ width: 130 }} value={r.end} onChange={(e) => setTime(day, "end", e.target.value)} />
                    </>
                  )}
                </div>
              );
            })}
            {/* ZOMBIE: the buffer is saved but the booking page ignores it. See lib/slots.ts. */}
            <label style={{ maxWidth: 220 }}>Buffer between meetings (minutes)
              <input type="number" value={buffer} onChange={(e) => setBuffer(Number(e.target.value))} />
            </label>
            <div className="row">
              <button onClick={saveAvailability}>Save availability</button>
            </div>
          </div>

          <h2>Calendar sync</h2>
          <div className="card row">
            {/* ZOMBIE: not built yet: Google / Outlook calendar sync. */}
            <button className="ghost" onClick={() => setMsg("Calendar sync: not built yet, see ZOMBIE.md")}>Connect Google Calendar</button>
            <button className="ghost" onClick={() => setMsg("Calendar sync: not built yet, see ZOMBIE.md")}>Connect Outlook</button>
          </div>
          {msg && <p className="note">{msg}</p>}
        </>
      )}
    </>
  );
}

export default function HostPage() {
  return <Suspense fallback={<p className="muted">Loading...</p>}><Dashboard /></Suspense>;
}

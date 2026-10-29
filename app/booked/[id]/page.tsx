"use client";
// The page a guest lands on after booking. Shows the details and lets them reschedule or cancel.
// ZOMBIE: this page is open to anyone who has the booking id. See app/api/bookings/[id]/route.ts.
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dayLabel, timeLabel } from "@/lib/time";
import type { Booking, MeetingType } from "@/lib/db";

type Slot = { start: string; label: string };
type Info = { booking: Booking; host: { slug: string; name: string } | null; type: MeetingType | null };

export default function BookedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [info, setInfo] = useState<Info | null>(null);
  const [missing, setMissing] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [picking, setPicking] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slot, setSlot] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    setInfo(null);
    setMissing(false);
    const res = await fetch(`/api/bookings/${id}`);
    if (!res.ok) return setMissing(true);
    setInfo(await res.json());
  }, [id]);

  useEffect(() => { load(); setPicking(false); setSlot(""); setCancelled(false); }, [load]);

  async function startReschedule() {
    if (!info?.type) return;
    setPicking(true);
    const res = await fetch(`/api/slots?host=${info.booking.hostSlug}&type=${info.type.id}`);
    setSlots(await res.json());
  }

  async function reschedule() {
    const res = await fetch(`/api/bookings/${id}/reschedule`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ start: slot }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.error);
    setMsg("");
    router.push(`/booked/${data.id}`);
  }

  async function cancel() {
    if (!window.confirm("Cancel this booking?")) return;
    await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    setCancelled(true);
  }

  if (missing) {
    return (
      <div className="card empty">
        <strong>We could not find this booking</strong>
        <span className="muted">It may have been cancelled.</span>
        <Link href="/" className="btn">Back to home</Link>
      </div>
    );
  }
  if (cancelled) {
    return (
      <div className="card empty">
        <strong>This booking is cancelled</strong>
        <span className="muted">The time is free again.</span>
        <Link href="/" className="btn">Back to home</Link>
      </div>
    );
  }
  if (!info) return <p className="muted">Loading...</p>;

  const { booking: b, host, type } = info;
  const days = [...new Set(slots.map((s) => s.start.slice(0, 10)))];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>You are booked</h1>
          <p className="sub">
            {b.rescheduledFrom ? "Your time was moved. Here are the new details." : "Here are the details of your meeting."}
          </p>
        </div>
      </div>

      <div className="card stack" style={{ maxWidth: 520 }}>
        <div className="detail"><span className="muted">When</span><strong>{dayLabel(b.start)} at {timeLabel(b.start)}</strong></div>
        <div className="detail"><span className="muted">Meeting</span><strong>{type?.name ?? "Meeting"} ({b.minutes} min)</strong></div>
        <div className="detail"><span className="muted">With</span><strong>{host?.name ?? b.hostSlug}</strong></div>
        <div className="detail"><span className="muted">Booked by</span><strong>{b.guestName} ({b.guestEmail})</strong></div>
        {(b.answers ?? []).map((a) => (
          <div key={a.question} className="detail"><span className="muted">{a.question}</span><strong>{a.answer || "No answer"}</strong></div>
        ))}
        {/* ZOMBIE: not built yet: confirmation and reminder emails. */}
        <p className="muted" style={{ margin: 0 }}>Reminder emails: not built yet, see ZOMBIE.md</p>
        <div className="row">
          {/* ZOMBIE: not built yet: "Add to calendar" (.ics file, Google and Outlook links). */}
          <button className="ghost" onClick={() => setMsg("Add to calendar: Not built yet")}>Add to calendar</button>
          <button className="ghost" onClick={startReschedule}>Reschedule</button>
          <button className="ghost danger" onClick={cancel}>Cancel booking</button>
        </div>
        {msg && <p className="note">{msg}</p>}
      </div>

      {picking && (
        <div className="card stack" style={{ maxWidth: 520, marginTop: 16 }}>
          <strong>Pick a new time</strong>
          {slots.length === 0 && <span className="muted">No open times in the next 7 days.</span>}
          {days.map((day) => (
            <div key={day}>
              <div className="muted">{dayLabel(day + "T00:00")}</div>
              <div className="row" style={{ marginTop: 6 }}>
                {slots.filter((s) => s.start.startsWith(day)).map((s) => (
                  <button key={s.start} className={s.start === slot ? "" : "ghost"} onClick={() => setSlot(s.start)}>
                    {timeLabel(s.start)}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="row">
            <button disabled={!slot} onClick={reschedule}>Move my booking</button>
            <button className="ghost" onClick={() => setPicking(false)}>Never mind</button>
          </div>
        </div>
      )}
    </>
  );
}

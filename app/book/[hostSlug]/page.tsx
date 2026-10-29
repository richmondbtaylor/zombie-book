"use client";
// Public booking page: pick a meeting type, pick a slot, enter name + email, answer the questions.
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { dayLabel, timeLabel } from "@/lib/time";
import type { Host, MeetingType } from "@/lib/db";

type Slot = { start: string; label: string };

export default function BookPage({ params }: { params: Promise<{ hostSlug: string }> }) {
  const { hostSlug } = use(params);
  const router = useRouter();
  const [host, setHost] = useState<Host | null>(null);
  const [types, setTypes] = useState<MeetingType[]>([]);
  const [typeId, setTypeId] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState<string[]>(["", ""]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/host?slug=${hostSlug}`).then((r) => r.json()).then((d) => {
      if (d.error) return setError(d.error);
      setHost(d.host);
      setTypes(d.meetingTypes);
      // A link like /book/casey-example?type=t2 opens that meeting type.
      const wanted = new URLSearchParams(window.location.search).get("type");
      const found = d.meetingTypes.find((t: MeetingType) => t.id === wanted);
      setTypeId(found?.id ?? d.meetingTypes[0]?.id ?? "");
    });
  }, [hostSlug]);

  useEffect(() => {
    if (!typeId) return;
    setSlot("");
    fetch(`/api/slots?host=${hostSlug}&type=${typeId}`).then((r) => r.json()).then(setSlots);
  }, [hostSlug, typeId]);

  const type = types.find((t) => t.id === typeId);

  async function book() {
    setError("");
    const res = await fetch("/api/bookings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostSlug, typeId, start: slot, guestName: name, guestEmail: email, answers }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    router.push(`/booked/${data.id}`);
  }

  if (error && !host) return <p className="error">{error}</p>;
  if (!host) return <p className="muted">Loading...</p>;

  // Group slots by day for display.
  const days = [...new Set(slots.map((s) => s.start.slice(0, 10)))];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Book time with {host.name}</h1>
          {/* ZOMBIE: timezones ignored. Times are in the server's time, not yours. */}
          <p className="sub">Times are shown in the server&apos;s time zone (timezones: not built yet).</p>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 16 }}>
        {types.map((t) => (
          <button key={t.id} className={t.id === typeId ? "" : "ghost"} onClick={() => setTypeId(t.id)}>
            {t.name}
          </button>
        ))}
      </div>

      {slots.length === 0 && (
        <div className="card empty">
          <strong>No open times</strong>
          <span className="muted">Nothing is open in the next 7 days. Check back soon.</span>
        </div>
      )}
      {days.map((day) => (
        <div key={day} style={{ marginBottom: 14 }}>
          <strong>{dayLabel(day + "T00:00")}</strong>
          <div className="row" style={{ marginTop: 6 }}>
            {slots.filter((s) => s.start.startsWith(day)).map((s) => (
              <button key={s.start} className={s.start === slot ? "" : "ghost"} onClick={() => setSlot(s.start)}>
                {timeLabel(s.start)}
              </button>
            ))}
          </div>
        </div>
      ))}

      {slot && (
        <div className="card stack" style={{ maxWidth: 420 }}>
          <strong>{dayLabel(slot)} at {timeLabel(slot)}</strong>
          <label>Your name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label>Your email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          {(type?.questions ?? []).map((q, i) => (
            <label key={q}>{q}
              <input value={answers[i] ?? ""} onChange={(e) => setAnswers(answers.map((a, n) => (n === i ? e.target.value : a)))} />
            </label>
          ))}
          {/* ZOMBIE: no bot check or rate limit on this button's request. */}
          <button onClick={book}>Confirm booking</button>
          {error && <p className="error">{error}</p>}
        </div>
      )}
    </>
  );
}

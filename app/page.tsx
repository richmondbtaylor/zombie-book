import Link from "next/link";
import { readDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const db = await readDb();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Zombie Book</h1>
          <p className="sub">Share a link. Guests pick a time. Pick a host to see their public booking page.</p>
        </div>
      </div>
      <div className="grid">
        {db.hosts.map((h) => (
          <div key={h.slug} className="card stack">
            <strong>{h.name}</strong>
            <span className="muted">/book/{h.slug}</span>
            <span className="muted">{db.meetingTypes.filter((t) => t.hostSlug === h.slug).length} meeting types</span>
            <div className="row">
              <Link className="btn" href={`/book/${h.slug}`}>Booking page</Link>
              <Link className="btn ghost" href={`/host?slug=${h.slug}`}>Host dashboard</Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

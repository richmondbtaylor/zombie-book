# MEL.md

This is a hackathon project: a half-built copy of Calendly (a scheduling app) that we are turning into a real SaaS product the whole group can use.

## The stack

- Next.js (App Router) + TypeScript + React. Plain CSS in `app/globals.css`, no Tailwind.
- Data: `lib/db.ts` reads and writes `data/db.json`. `data/seed.json` is the starting data (hosts, meeting types, bookings). This is temporary.
- Time and slots: `lib/time.ts` (times are plain strings in server time) and `lib/slots.ts` (builds the next 7 days of open slots).
- Routes: `app/api/host`, `hosts`, `types`, `slots`, `bookings`, `bookings/[id]` and `bookings/[id]/reschedule`. Pages: `/` (list), `/host` (dashboard), `/book/[hostSlug]` (public page), `/booked/[id]` (confirmation, reschedule, cancel), `/pricing`.
- Meeting types can have up to 2 questions (`questions`). Booking answers are saved on the booking (`answers`). A rescheduled booking has `rescheduledFrom`.
- Payments: `app/api/checkout/route.ts` is a stub. Stripe is not connected.
- Runs on port 3106.

## The job

Work through `ZOMBIE.md` in order: make it work, make it secure, make it compliant, connect Stripe, ship it.
Every planted problem in the code is marked with a `ZOMBIE:` comment.
Start with double booking and timezones. A scheduling tool that books the same time twice is useless.

## Rules for agents

- Keep it running. Run `npm run build` after each change and fix what breaks.
- Never commit secrets. Keys go in `.env.local` (it is git-ignored).
- Use Stripe test mode keys only.
- Keep all sample data fake (example.com emails). Never add real people's data.
- When you fix a `ZOMBIE:` item, delete its comment and tick its box in `ZOMBIE.md`.
- Small commits with plain messages.

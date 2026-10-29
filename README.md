# Zombie Book

> A half-built copy of **Calendly**. It runs, it kind of works, and it is not ready for real users.
> Your job tonight: bring it back to life.

**Replaces:** Calendly (about $12 per user per month)

**Live demo:** https://zombie-book.vercel.app (a shared demo: data resets whenever the server restarts)
<!-- Source: https://calendly.com/pricing, Standard plan, "Billed monthly" toggle, $12/seat/mo. Checked 2026-10-29. -->

## Run it (2 minutes)

You need [Node.js 20 or newer](https://nodejs.org).

```bash
npm install
npm run dev
```

Open http://localhost:3106.

## What works

- Host dashboard (`/host`): counts for this week and next week, upcoming bookings grouped by day (with the guest's answers), meeting types as cards, weekly availability and a buffer number.
- Meeting types: add a name, a length in minutes and 0 to 2 questions the guest answers. Each card has a "Copy booking link" button.
- Public booking page (`/book/casey-example`): shows the next 7 days of open slots for the meeting type you pick, and the questions for that type.
- A guest picks a slot, enters a name, email and answers, and the booking is saved.
- Confirmation page (`/booked/<id>`): who, when, meeting type and answers. The guest can cancel, or reschedule by picking a new slot. "Add to calendar" says "Not built yet".
- The host can open or cancel any booking.
- Pricing page (Stripe is not connected).
- 2 fake hosts, 4 meeting types and 12 bookings (November and December 2026) in `data/seed.json`. Everyone is made up.

## What's broken

See [ZOMBIE.md](ZOMBIE.md). That's the to-do list for the night.

## How we build tonight

- **Mel** ([openmel.dev](https://openmel.dev)) does the building. Open this folder in Mel and give it tasks from ZOMBIE.md.
- **Prompt Anything** ([promptanything.io](https://www.promptanything.io)) writes the prompts. Use it inside Mel for features, agents, customer success flows, code fixes and reading this repo.
- **MEL.md** in this folder tells Mel's agents what this project is and how to work on it.

## Submit

Fork this repo, push your work, and send your link through the submission form before the deadline.
Many people can pick the same app. The one that actually works wins.

## License

MIT. Use it, ship it, share it.

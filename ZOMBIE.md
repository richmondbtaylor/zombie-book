# 🧟 ZOMBIE.md: what's broken

This app is a zombie on purpose. Pick items off this list. Every box you tick gets it closer to a product we can all use and stop paying for Calendly.

Search the code for `ZOMBIE:` to find every planted problem.

## 1. Make it work

- [ ] Double booking is possible. Booked slots still show as open, and the booking route does not check for a clash (`lib/slots.ts`, `app/api/bookings/route.ts`).
- [ ] Timezones are ignored. Everything is in the server's time (`lib/time.ts`). Save the host's timezone, store times in UTC, and show guests their own timezone.
- [ ] The buffer time setting is saved but ignored. Leave a gap before and after each booking.
- [ ] Google and Outlook calendar sync is not built yet.
- [ ] Reminder and confirmation emails are not built yet.
- [ ] Reschedule leaves the old booking behind. The host dashboard shows both the old and the new time as upcoming (`app/api/bookings/[id]/reschedule/route.ts`). Move the booking instead of copying it.
- [ ] Reschedule does not check the new time against open slots or other bookings.
- [ ] "Add to calendar" on the confirmation page says "Not built yet". Build an .ics file and Google and Outlook links.
- [ ] Booking questions are set when a meeting type is created. There is no way to edit or delete them, and answers are not required.

## 2. Make it secure

- [ ] There is no host login. Anyone can open `/host`, change availability, add meeting types and read every booking.
- [ ] The confirmation, reschedule and cancel links work for anyone who has the booking id (`/booked/[id]`, `GET /api/bookings/[id]`). That page shows the guest's name, email and answers. Use a secret token per booking.
- [ ] Guests can cancel any booking by id. Use a secret cancel link per booking, and check the host's login for host cancels.
- [ ] No rate limit. A bot can fill the whole calendar. Add a rate limit and a bot check (CAPTCHA or email confirmation).
- [ ] Guest emails are not checked. Send a confirmation email with a link before the booking counts.
- [ ] Every API route trusts whatever it's sent. Validate input on the server.
- [ ] Ids are guessable (`lib/db.ts`). Use random ids and check that the record belongs to the signed-in user.
- [ ] Data lives in `data/db.json` on disk. Move it to a real database.

## 3. Make it compliant

- [ ] **Privacy policy and terms:** guests give you a name and an email. Say what you do with them. Laws like GDPR (EU/UK) and CCPA/CPRA (California) require this.
- [ ] **Data retention:** old bookings are kept forever. Pick a time limit (for example 12 months) and delete older ones.
- [ ] **Delete and export:** a guest must be able to ask for their data to be exported or deleted (GDPR articles 15 and 17, CCPA).
- [ ] **Email rules:** reminder emails need an easy way to stop them. CAN-SPAM (US) and GDPR/PECR (EU/UK) apply. Do not use guest emails for marketing without consent.
- [ ] **Calendar permissions:** when you add Google or Outlook sync, ask for the smallest permission you need. Google's API rules and verification apply.
- [ ] **Accessibility:** public booking pages should meet WCAG 2.1 AA (ADA in the US, European Accessibility Act in the EU).
- [ ] No privacy policy or terms page.
- [ ] No way for a user to export or delete their data.

## 4. Connect Stripe

- [ ] `app/api/checkout/route.ts` returns a 501. Create a Stripe Checkout Session (test mode is fine).
- [ ] Add a webhook route that marks the account as paid.
- [ ] Lock the paid features behind the plan.

## 5. Ship it

- [ ] Deploy it (Vercel, Netlify, Railway...). The JSON file database will not survive this, so do section 2 first.
- [ ] Put the live link in your README.

## What "done" looks like

Someone who has never seen it can sign up, pay, use the main feature end to end, and come back tomorrow to find their data still there.

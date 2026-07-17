# Affiliate setup checklist

All affiliate links in the app currently use **placeholder tracking tags**
(`YOURTAG-20`, `YOURREF`). Until these are replaced with real ones, clicking
through and buying earns no commission — the vendor has no account to
attribute the sale to.

Every pick lives in one file: `src/lib/affiliate-picks.ts`. That's the only
place you need to edit.

## 1. Join each affiliate program

| Program | Used for | Sign up |
| --- | --- | --- |
| Amazon Associates | All `amazon.com` picks (8 of 13) | https://affiliate-program.amazon.com |
| Babylist affiliate program | Hospital bag essentials kit, Baby registry | https://www.babylist.com/affiliates (or their partner network, e.g. ShareASale/Impact — check current program) |
| Glo affiliate/referral program | Prenatal yoga class | Check Glo's site footer or partner network for their current referral program |
| FirstCry affiliate program | Newborn grooming kit, Baby feeding bottle set | FirstCry typically runs its affiliate program through a network (e.g. Admitad, Involve Asia, vCommission) rather than direct sign-up — check their site footer for "Affiliate Program" or search the network that covers your region |

Approval isn't instant for most of these — Amazon Associates in particular
requires a qualifying sale within 180 days of approval or the account gets
closed, so don't sign up until you're ready to actually drive traffic.

## 2. Replace the placeholders

- [ ] Amazon: replace every `tag=YOURTAG-20` in `src/lib/affiliate-picks.ts`
      with your real Associates tag (find/replace — it's the same string
      everywhere).
- [ ] Babylist: replace `ref=YOURREF` on the **Hospital bag essentials kit**
      and **Baby registry** picks with your real Babylist affiliate ref.
- [ ] Glo: replace `ref=YOURREF` on the **Prenatal yoga class** pick with
      your real Glo referral ref. (Same placeholder text as Babylist above,
      but it's a separate program with its own ref — don't reuse one for
      the other.)
- [ ] FirstCry: replace `ref=YOURFIRSTCRYREF` on the **Newborn grooming
      kit** and **Baby feeding bottle set** picks with your real FirstCry
      (or FirstCry's affiliate network) tracking ref.

## 3. Know the limits

- Commission tracking happens entirely on the vendor's side via that URL
  parameter and a cookie they drop on landing — nothing in this app
  reports sales back. The `affiliate_clicks` Supabase table only logs
  clicks *inside the app* (which pick, which screen) for your own
  analytics; it has no bearing on whether a vendor pays out.
- Attribution windows are short and vendor-specific — Amazon Associates'
  is notoriously tight (24 hours from click, extended if the shopper adds
  to cart). A click today doesn't guarantee credit for a purchase next
  week.

## 4. Where each pick shows up

All 13 picks are defined once and reused — no duplication to keep in sync:

- `HOME_PICKS` → Home screen ("Handy right now")
- `TRACK_PICKS` → Track screen ("Gear that helps you track")
- `JOURNEY_PICKS_BY_WEEK` → Journey screen, per pregnancy week
- `FIRSTCRY_PICKS` → Shop-only for now (Hospital bag & newborn, Health & tracking gear categories) — not surfaced on Home/Track/Journey
- `SHOP_SECTIONS` → `/shop`, all of the above regrouped into categories

Adding a new pick to any of those objects makes it show up everywhere it's
referenced — no need to touch `home.tsx`, `track.tsx`, `journey.tsx`, or
`shop.tsx` for content changes.

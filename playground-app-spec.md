# Playground Ops — one-page spec

**One-line pitch:** Playground Ops is a free, secret-agent-themed web app that sends kid "agents" on a mission through a playground's equipment — briefed before play, debriefed after, never used during.

## Problem
Kids show up at a playground and just wander. A simple generated mission (climb this, cross that, balance here) adds a bit of structure and fun without needing any equipment or supervision changes.

## Users
- Kids, ages 4–12 (the players)
- Parents, caregivers, or counselors (the ones actually holding the phone)

## Core principle
**The phone is used before and after play — never during.** No kid should be looking at a screen while on equipment. The app's job is to hand off a mission, then get out of the way.

## Theme & voice
Secret-agent style, applied to vocabulary and copy rather than visuals alone:
- The kid is the **agent**. The adult holding the phone is **field support** (or "handler").
- A playground is a **base** or **location**. The app **briefs** the agent before play and **debriefs** them after.
- Steps within a mission can be called **objectives**.
- "Mission complete" screens can read like a successful op: e.g. "Objective cleared. Agent [name], your cover as a kid on a regular trip to the park remains intact."
- The privacy story doubles as in-universe flavor: location is detected but never recorded — copy can lean into this directly ("this transmission was not logged," "coordinates erased after briefing") rather than hiding it in fine print. It's a rare case where the real engineering decision and the fictional theme reinforce each other.
- Keep the tone playful/winking rather than tense — this is for 4-year-olds too, so "secret agent" should feel more like a fun game than anything ominous.

## Core user flow
1. Arrive at the playground. Adult opens the app (shared link or QR code posted at the park).
2. App detects the nearby playground on-device (see below), or the adult picks one from a list.
3. App shows that playground's visual representation and generates a themed mission from its equipment (e.g. "climb the rock wall → cross the monkey bars → balance on the beam → finish on the big slide").
4. Phone goes away. Kid plays through the mission.
5. Afterward, reopen the app to check off steps and see a "mission complete" screen.

## Location detection — with zero data collection
This is the key constraint: detect the playground, but never store or transmit location.

- Use the browser's built-in geolocation feature to get device coordinates **on the device only**.
- Compare those coordinates, in the browser, against a small built-in catalog of known playgrounds (name + coordinates + equipment list + visual) bundled with the app itself — no server lookup, no API call carrying location data.
- If a match within roughly 100m is found, auto-select that playground.
- If no match, the adult manually picks a playground from the catalog, or adds a new one (see below).
- Coordinates are used once, held in memory, then discarded. Never logged, stored, sent to a server, or attached to any analytics event.
- No accounts, no sign-in, no persistent identifiers of any kind.

## Playground visual representation
Every playground needs a visual a parent can glance at to confirm "yes, this is the one" — not just a typed equipment list. Options, roughly in order of effort:

1. **Google Maps satellite snapshot (MVP default).** Pull a static aerial image centered on the playground's coordinates (Google Maps Static API, or an embedded map). Cheap, no special equipment, works for any playground that's visible from above. Good for orientation ("yes, that's our park") but doesn't show individual equipment well.
2. **Photos (MVP default).** A couple of straightforward photos of the equipment, taken once by whoever adds the playground. Cheapest way to actually show what's there.
3. **3D scan (stretch goal, not MVP).** Apps like Polycam or Scaniverse can turn a phone's camera into a 3D model (best on phones with LiDAR), exporting a file that can be displayed as a rotatable model in the browser using the `<model-viewer>` web component. This gives the most intuitive "is this my playground" view, but it's extra production work per playground and isn't something a typical website can do live in-browser — it requires a separate capture step using one of those apps, done in advance. Worth doing for your 3 official playgrounds once the MVP works; too high-friction to require from random community contributors.

For now: **map snapshot + a couple of photos** for each playground, with 3D scans as a nice-to-have you add later for the 3 official spots.

## Missions: official vs. community-built
- **Official missions** (launch): written and entered by you for the 3 school playgrounds. These are the curated, trusted default.
- **Community-built missions** (later): other parents/teachers can submit their own missions for a playground. These should be visually marked as "community" vs. "official" so it's clear which is which, and — since this is a kids' product — will need some form of review before going live (even a lightweight one-person approval step) to keep content appropriate.

## MVP scope
**In:**
- Catalog of the 3 school playgrounds, each with coordinates, equipment list, a map snapshot, and a couple of photos
- On-device location match to auto-suggest a playground, with manual fallback
- Manually-entered official missions for each playground
- Mission generator that sequences a playground's equipment into a themed mission
- Simple checklist + "mission complete" screen
- Mobile-friendly, installable to home screen (PWA) — no app store needed

**Out (later versions):**
- Community-submitted playgrounds and missions (with moderation)
- 3D-scanned playground views
- Accounts, saved progress, badges
- Multiplayer or class leaderboards

## Technical approach
- **Fully static web app** — HTML/CSS/JS, no backend server, no database. This is a deliberate privacy choice: with no server, there's nowhere for location data to even accidentally end up.
- Playground catalog is a local JSON file bundled with the app (name, coordinates, equipment array, image paths).
- Hosted as free static files (e.g. GitHub Pages, Netlify, Cloudflare Pages).
- Built with Claude Code.

## Success criteria for the pilot
- The 3 school playgrounds are live with official missions
- Kids can complete a mission with minimal adult re-explaining
- Kids confirm that the missions make it more fun to go to the playground
- No privacy concerns raised by parents or staff

## Open questions
- How parents will add a new playground when one isn't already in the catalog (manual entry form? request a map snapshot via address?)
- Moderation process for future community-built missions
- Exact wording for in-app roles and screens (e.g. "field support," briefing/debrief copy) — first draft above, open to refinement once you see it built

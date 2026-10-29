# Mashiur Khan — portfolio design plan

Audience: startup investors. Two routes share one content file (`src/content.ts`) and one mock API (`src/api/mock.ts`).

## Visual system
| Token | Value | Use |
|---|---|---|
| `--ink` | `#16171a` | text, continents |
| `--paper` | `#f6f4f0` | page background (warm white) |
| `--silver` | `#b9bec6` / `--silver-deep` `#8a9099` | rabbit, rules, globe rim |
| `--gold` | `#d9a441` | bridge, pins, check |
| `--sunset` | `#ee7b3a` | links, accents, rabbit nose |

Type: **Rubik** is the display font (`--display`: FOUNDER / EX-ORACLE / VANDERBILT, KHANFLOW.COM). **Fredoka** (`--rounded`) is for the name and softer headings, and **Nunito** for body text. No serifs anywhere.
Motifs: bunny head (Robbit), Golden Gate Bridge silhouette (source illustration keyed to transparent orange-gold by `scripts/bridge.mjs`).

## `/` — three full-height panels
**Panel 1 (hero)**, laid out from sketch #2:
```
                                   MASHIUR KHAN.  ░░bridge░░░░░░░→ (off-page)
            ╭───────────╮               (rabbit starts here)
           ╱             ╲  FOUNDER  ✓
          ╱  building      ╲    ˅
   [chat]╱   khanflow.com ↗  EX-ORACLE ✓
 (rabbit)                    VANDERBILT ✓
```
- `MASHIUR KHAN.` sits top-right, light and wide-tracked, and fades in. Behind it the bridge silhouette stretches past both ends of the name and bleeds off the right edge at low opacity.
- The rabbit head starts beside FOUNDER, arcs up and over to the left, then drops to the bottom-left. It spins fast with ears fluttering. `building khanflow.com ↗` is set along the descending part of the arc, and each letter unlocks as the rabbit passes it.
- On phones there's no room beside the credentials, so `building khanflow.com ↗` instead rides a gentle, nearly level bow centred in the band between the name and FOUNDER. The credentials sit lower to make room.
- The rabbit lands with a small hop and its arms bud out. From then on it is `position: fixed` and draggable. **It is Robbit:** clicking it opens the chat as a speech bubble above its head.
- `FOUNDER` slams in (large, rounded, left-aligned stack, centre of the page), and a tapered gold dash (heavy at the foot, hairline at the tip) draws from the bottom up. A small chevron under the newest credential bobs up and down.
- A faded `Press any key` hint: each key press slams in the next credential (`EX-ORACLE`, then `VANDERBILT`), each with its own check, and the chevron moves down. Scrolling reveals all of them.

**Panel 2 (story + timeline + globe)**, laid out from sketch #1: narrative and timeline on the left, a large globe on the right.
- Lead copy: "In 2022, I had yet to take a plane. I was in Bangladesh. 4 years later, I launched my first startup in SF."
- A vertical timeline (filled dot at the top, hollow dot at the end), with rows reading `year — location — title — description`. On entering view, rows fade in from the first year to the last.
- The globe unblurs and can be dragged through 360°. White ocean, glowing grey rim, almost-black continents (d3-geo orthographic + world-atlas, bundled, no runtime fetch).
- Every city in the timeline is pinned. Hovering a pin highlights the entries for that city and greys out the rest.
- Data: `getTimeline()` (mock). LinkedIn returns HTTP 999 to scrapers, so a real sync needs an official export or a data provider. The sample entries in `content.ts` are placeholders to correct.

**Panel 3 (CTA)**
- `CHECK OUT THE STARTUP HERE: KHANFLOW.COM`, centred and set high.
- When the cursor is on or near the link, the rabbit perks its ears, lifts its right arm and waves.
- Contact icons spread along the bottom (email, phone, LinkedIn, GitHub).

## `/sf` — minimal edition
A single column taking the middle 50% of the screen on desktop (full width minus gutters on mobile). Quiet type, hairline rules, lots of air.
1. Introduction: name, photo (right), short intro + mission, row of links.
2. khanflow.com: what it is, plus "meet my cofounder →" with a photo of Tausif.
3. Who I am: Jane Street, Oracle, Vanderbilt, each linkable to a project.
4. FAQ: "Favorite city" "SF."

## Shared components
- **Header**: an `MK` monogram on the left and a route toggle (`Studio` / `SF`) on the right. Small and translucent.
- **Robbit chat**: on `/` the landed rabbit is the chat. Click it and a speech bubble opens: "Hi! I'm Robbit, your furry friend. Ask me anything!" On `/sf` a small bunny button sits at the bottom-right. `sendChat()` is mocked with keyword answers drawn from `content.ts`. The real version would be a server route calling the Claude API.

## Accessibility & motion
`prefers-reduced-motion` skips straight to the final hero state. Every interactive control is keyboard reachable. The dragged rabbit is decorative (`aria-hidden`).

## Build order
1. Frontend `/` (hero, timeline, globe, CTA) → 2. `/sf` + Robbit → 3. mock API wiring → 4. browser verification at desktop + mobile widths.

## Open items (need Mashiur)
- Real timeline (LinkedIn export), email, phone, GitHub handle, a headshot, and a photo of Tausif.

# Mashiur Khan — portfolio design plan

Audience: startup investors. Two routes share one content file (`src/content.ts`) and one mock API (`src/api/mock.ts`).

## Visual system
Night theme: silver and metallic blue on a deep navy-black background.
| Token | Value | Use |
|---|---|---|
| `--paper` | `#060a14` (radial lift to `#101b33` up top) | page background |
| `--ink` | `#e4e8ee` | body text |
| `--metal-silver` | brushed silver gradient | name, credentials, headlines, continents |
| `--metal-blue` | brushed blue gradient | KHANFLOW.COM, dashes, accents, active toggle |
| `--glow` | `110, 170, 255` | cursor light and hover glow |

- Big headers (name, credentials, story headline, KHANFLOW.COM, /sf name and answer) use the metal gradients with a slow back-and-forth gleam.
- The pointer carries a soft blue light that swells over anything interactive. Links, buttons and pins glow blue on hover.
- A very sparse field of faint stars (silver, a few blue) pulses slowly behind everything.
- The rabbit is a soft moonlit silver-white, and leaves a blue-silver shooting-star trail (in flight or while dragged) that lingers about 3s before fading.

Type: **Michroma** is the display font (`--display`: FOUNDER / EX-ORACLE / VANDERBILT, KHANFLOW.COM): extended and squared-off, stretched 1.5× taller. **Fredoka** (`--rounded`) is for the name and softer headings, and **Nunito** for body text. No serifs anywhere.
Motifs: bunny head (Robbit), Golden Gate Bridge silhouette (source illustration keyed to transparent orange-gold by `scripts/bridge.mjs`).

## `/` — three full-height panels
**Panel 1 (hero)**, laid out from sketch #2:
```
                                   MASHIUR KHAN.  ░░bridge░░░░░░░→ (off-page)
                 ╭───────────────╮
  FOUNDER    ╱  ╱                 ╲
  EX-ORACLE ╱  ╱ (rabbit starts)   ╲
  VANDERBILT ╱   ˅                  ╲[chat] (rabbit)
```
- `MASHIUR KHAN.` sits top-right, light and wide-tracked. Its letters slide in from the left, emerging from behind an invisible, soft-edged curtain at 50vw (just left of the name on phones): the period first, the M last. Behind it the bridge silhouette stretches past both ends of the name and bleeds off the right edge at low opacity.
- The rabbit head starts low on the left (over where the credentials will appear), arcs up and over to the right, then drops to the bottom-right. It spins fast with ears fluttering.
- The rabbit lands with a small hop and its arms bud out. From then on it is `position: fixed` and draggable. **It is Robbit:** clicking it opens the chat as a speech bubble beside it (to its left when it's on the right half of the screen).
- As soon as the rabbit takes off, the credentials (a large left-aligned stack, 5vw from the left edge) slide in one letter at a time from the right edge of the screen, moving right to left; the leading letter arrives first, like a train pulling in. The bottom word starts first and each word's first letter lags the one below it: `VANDERBILT`, then `EX-ORACLE`, then `FOUNDER`. Once a word is in, a tapered gold dash (heavy at the foot, hairline at the tip) draws from the bottom up. A small chevron under `VANDERBILT` bobs up and down.

- Scrolling down slides the name and bridge off to the right and each credential row off to the left, in step with the page position. The rows leave one at a time, top first, each over its own overlapping stretch of scroll. Everything is off once the hero is 80% scrolled away, and scrolling back up brings it all back.

**Panel 2 (story + timeline + globe)**, laid out from sketch #1: narrative and timeline on the left, a large globe on the right.
- Lead copy: "In 2022, I had yet to take a plane. I was in Bangladesh. 4 years later, I launched my first startup in SF."
- A vertical timeline (filled dot at the top, hollow dot at the end), with rows reading `year — location — title — description`. Once it's reached, the whole timeline fades in as one soft wipe from top to bottom (a 1.8s animation, not tied to scroll).
- The globe unblurs and can be dragged through 360°. White ocean, glowing grey rim, almost-black continents (d3-geo orthographic + world-atlas, bundled, no runtime fetch).
- Every city in the timeline is pinned. Hovering a pin highlights the entries for that city and greys out the rest.
- Data: `getTimeline()` (mock). LinkedIn returns HTTP 999 to scrapers, so a real sync needs an official export or a data provider. The sample entries in `content.ts` are placeholders to correct.

**Panel 3 (CTA)**
- `CHECK IT OUT: KHANFLOW.COM`, centred and set high. The first time it scrolls into view, KHANFLOW.COM arrives with its letters spread wide apart and closes up into the word over 1s.
- When the cursor is on or near the link, the rabbit perks its ears, lifts its right arm and waves.
- Contact icons spread along the bottom (email, phone, LinkedIn, GitHub). When they're first reached, each does a quick hop and a little wobble in place, left to right.

## `/sf` — minimal edition
A single column taking the middle 50% of the screen on desktop (full width minus gutters on mobile). Quiet type, hairline rules, lots of air.
1. Introduction: name, photo (right), short intro + mission, row of links.
2. khanflow.com: what it is, plus "meet my cofounder →" with a photo of Tausif.
3. Who I am: Jane Street, Oracle, Vanderbilt, each linkable to a project.
4. FAQ: "Favorite city" "SF."

## Shared components
- **Header**: just the route toggle (`Studio` / `SF`) at the top right. Small and translucent.
- **Robbit chat**: on `/` the landed rabbit is the chat. Click it and a speech bubble opens: "Hi! I'm Robbit, your furry friend. Ask me anything!" On `/sf` a small bunny button sits at the bottom-right. `sendChat()` is mocked with keyword answers drawn from `content.ts`. The real version would be a server route calling the Claude API.

## Accessibility & motion
`prefers-reduced-motion` skips straight to the final hero state. Every interactive control is keyboard reachable. The dragged rabbit is decorative (`aria-hidden`).

## Build order
1. Frontend `/` (hero, timeline, globe, CTA) → 2. `/sf` + Robbit → 3. mock API wiring → 4. browser verification at desktop + mobile widths.

## Open items (need Mashiur)
- Real timeline (LinkedIn export), email, phone, GitHub handle, a headshot, and a photo of Tausif.

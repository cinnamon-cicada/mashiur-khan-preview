# mashiurkhan

Portfolio preview for Mashiur Khan, aimed at startup investors. Design plan: [DESIGN.md](DESIGN.md).

- `/`: animated studio edition (hero choreography, timeline + globe, khanflow CTA)
- `/sf`: minimal edition

## Setup

Requires Node.js 20+ and access to this private repo.

```bash
git clone https://github.com/cinnamon-cicada/mashiurkhan.git
cd mashiurkhan
npm install
npm run dev   # → http://localhost:5173 (and /sf)
```

All copy and data live in `src/content.ts` (lines marked `SAMPLE` need real values). Backend calls are mocked in `src/api/mock.ts`.
`scripts/bridge.mjs` turns the source Golden Gate illustration into the transparent gold silhouette in `public/img/`.

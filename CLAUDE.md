# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start local dev server (Vite)
npm run build     # Production build → /dist
npm run preview   # Preview production build locally
```

There are no test or lint scripts configured.

## Architecture

**Newton** is a React 18 + Vite SPA deployed on Vercel as a serverless app. It is an AI-powered lead intelligence and content generation platform for Newtec A/S (fresh produce machinery manufacturer).

### Entry Point Flow

```
index.html → main.jsx → App.jsx (password gate → tabbed UI)
```

`App.jsx` is monolithic (~2,256 lines) and contains nearly all frontend logic: state, styles (CSS-in-JS via `<style>` tag), tab routing, lead management, chart rendering, and API calls.

`ContentLab2.jsx` (~1,455 lines) is a self-contained component rendered in the "Content Lab" tab.

### Tabs / Views (in `App.jsx`)

- **Intelligence** — Loads leads from Airtable every 30s, filters by score/verdict/country, renders expandable cards with KPI/chart summaries
- **Content Lab** — `ContentLab2` component; generates social content via `/api/content2`
- **Campaign** — Email content generation
- **Calendar** — CRUD for content schedule stored in Airtable
- **VoiceFlow** — Embedded Voiceflow chatbot (lazy-loaded on tab activate)
- **Settings** — Configuration UI

### Serverless API (`/api/`)

All backend logic lives in Vercel serverless functions:

| File | Method | Purpose |
|------|---------|---------|
| `chat.js` | POST | AI Q&A over lead data → Claude API → answer + charts |
| `content.js` | POST | Content generation v1 (legacy) |
| `content2.js` | POST | Content generation v2 → Claude API + FAL.ai image gen |
| `calendar.js` | GET/POST | Content calendar CRUD in Airtable |
| `webhook.js` | POST | Forward events to Make.com automation |

### External Services

- **Airtable** — Lead records (table `tblIuwlJ3qnUEcPWI`) + calendar entries (table `tblgR7ekntYJuV2oi`)
- **Claude API** — Content generation and lead analysis (key: `CLAUDE_API_KEY` env var)
- **FAL.ai** — AI image generation (used in `content2.js`)
- **Voiceflow** — Embedded chat widget (project ID from `VITE_VOICEFLOW_ID`)
- **Make.com** — Automation webhooks (validated to `hook.eu1.make.com` / `hook.make.com`)

### Environment Variables

Frontend (Vite, prefix `VITE_`):
- `VITE_AIRTABLE_PAT` — Airtable Personal Access Token
- `VITE_AIRTABLE_BASE` — Airtable base ID (`appDQHnrGIRM7hr59`)
- `VITE_AIRTABLE_TABLE` — Lead table ID
- `VITE_VOICEFLOW_ID` — Voiceflow project ID

Serverless only:
- `CLAUDE_API_KEY` — Anthropic API key (used in `content2.js`, `chat.js`)
- `FAL_KEY` — FAL.ai API key

### Styling

CSS is injected via a `<style>` tag at the top of `App.jsx`. CSS custom properties (`--b`, `--bg`, `--s`, `--t`, `--t2`) define the color theme. A `CL` object in JS maps semantic names (hot, warm, cold, LinkedIn, etc.) to hex values for chart/badge coloring.

**Fonts**: Playfair Display (headings), DM Sans (body), JetBrains Mono (code)

### Auth

A hardcoded password gate (`"Newtecgamechanger2026$"`) is checked on first render in `App.jsx` before any content is shown.

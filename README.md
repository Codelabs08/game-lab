# Game Lab

## Adding a game (no coding needed)

1. On GitHub, open the `games` folder → open your class folder (e.g. `y3-yellow`; create it if it's not there).
2. **Add file → Upload files**. Drag in a folder for your game containing:
   - `index.html` — the game (required)
   - `thumb.png` (or .jpg/.webp/.svg) — the picture on the card (optional; otherwise a coloured emoji tile is used)
   - `info.json` — optional details (see below)
3. Click **Commit changes**. The site updates by itself in about a minute.

Quick option: just upload a single `my-game.html` into a subject folder, plus `my-game.png` next to it for the picture.

### info.json (all fields optional)
```json
{
  "title": "Number Bonds to 10",
  "by": "Year 4 Blue",
  "years": "Y1–Y2",
  "emoji": "➕",
  "description": "Find the missing number to make 10",
  "added": "2026-10-01"
}
```
`added` shows a NEW badge for 14 days. Without a title, the folder name is used (`times-table-race` → "Times Table Race").

## New class section
Create a folder inside `games` (e.g. `games/y3-green`). It appears automatically.
Set its name, emoji and colour in `site.json`. The order in `site.json` is the order on the page.

## Site name
Edit `title` and `tagline` in `site.json`.

## Ads (later)
Paste the AdSense script where `<!-- ADS -->` is marked in `index.html` and `play.html`.

## Hosting (GitHub Pages)
Settings → Pages → Source: GitHub Actions. Deploys on every commit (.github/workflows/pages.yml runs build.js).

## Old: Cloudflare Pages
- Build command: `node build.js`
- Build output directory: `/`

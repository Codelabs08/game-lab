// Scans the games/ folder and writes games.json.
// Runs automatically on Cloudflare Pages (build command: node build.js).
// No packages needed.
//
// Two ways to add a game:
//   1. Folder:  games/<subject>/<game-name>/index.html   (+ optional thumb.png, info.json)
//   2. Single:  games/<subject>/<game-name>.html         (+ optional <game-name>.png next to it)

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const GAMES = path.join(ROOT, "games");
const IMG = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"];
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "site.json"), "utf8"));

const titleCase = s =>
  s.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, c => c.toUpperCase());
const rel = p => path.relative(ROOT, p).split(path.sep).join("/");
const readJSON = p => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return {}; } };
const findImg = (dir, base) => {
  for (const ext of IMG) { const p = path.join(dir, base + ext); if (fs.existsSync(p)) return rel(p); }
  return null;
};

const games = [];
const subjects = [];

if (fs.existsSync(GAMES)) {
  for (const subject of fs.readdirSync(GAMES).sort()) {
    const sDir = path.join(GAMES, subject);
    if (!fs.statSync(sDir).isDirectory() || subject.startsWith(".")) continue;
    let count = 0;

    for (const entry of fs.readdirSync(sDir).sort()) {
      if (entry.startsWith(".")) continue;
      const p = path.join(sDir, entry);
      const stat = fs.statSync(p);
      let game = null;

      if (stat.isDirectory()) {
        // Folder game: needs index.html, or else the first .html file inside
        let entryFile = path.join(p, "index.html");
        if (!fs.existsSync(entryFile)) {
          const html = fs.readdirSync(p).find(f => f.toLowerCase().endsWith(".html"));
          if (!html) continue;
          entryFile = path.join(p, html);
        }
        const info = readJSON(path.join(p, "info.json"));
        game = {
          id: `${subject}/${entry}`,
          title: info.title || titleCase(entry),
          thumb: info.thumb ? rel(path.join(p, info.thumb)) : (findImg(p, "thumb") || findImg(p, "thumbnail") || findImg(p, "cover")),
          url: rel(entryFile),
          ...pick(info),
        };
      } else if (entry.toLowerCase().endsWith(".html")) {
        // Single-file game
        const base = entry.slice(0, -5);
        const info = readJSON(path.join(sDir, base + ".json"));
        game = {
          id: `${subject}/${base}`,
          title: info.title || titleCase(base),
          thumb: findImg(sDir, base),
          url: rel(p),
          ...pick(info),
        };
      }

      if (game) { game.subject = subject; games.push(game); count++; }
    }
    if (count) subjects.push(subject);
  }
}

function pick(info) {
  const out = {};
  for (const k of ["by", "years", "description", "emoji", "added"]) if (info[k]) out[k] = info[k];
  return out;
}

// Order subjects as listed in site.json, then any extra folders alphabetically
const order = Object.keys(site.subjects || {});
subjects.sort((a, b) => {
  const ia = order.indexOf(a), ib = order.indexOf(b);
  return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || a.localeCompare(b);
});

fs.writeFileSync(
  path.join(ROOT, "games.json"),
  JSON.stringify({ built: new Date().toISOString(), subjects, games }, null, 2)
);
console.log(`games.json: ${games.length} games in ${subjects.length} subjects (${subjects.join(", ")})`);

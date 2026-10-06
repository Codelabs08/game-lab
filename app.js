(async function () {
  const [site, data] = await Promise.all([
    fetch("site.json").then(r => r.json()),
    fetch("games.json", { cache: "no-store" }).then(r => r.json()).catch(() => ({ subjects: [], games: [] })),
  ]);

  const PALETTE = ["#2563eb", "#059669", "#dc2626", "#7c3aed", "#0891b2", "#b45309", "#db2777", "#4f46e5"];
  const subj = (key, i = 0) => {
    const s = (site.subjects || {})[key] || {};
    return {
      key,
      name: s.name || key.replace(/[-_]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
      emoji: s.emoji || "🎲",
      colour: s.colour || PALETTE[i % PALETTE.length],
    };
  };
  const subjects = data.subjects.map(subj);
  const byKey = Object.fromEntries(subjects.map(s => [s.key, s]));

  document.title = site.title;
  document.getElementById("site-title").textContent = site.title;
  document.getElementById("site-tagline").textContent = site.tagline || "";
  document.getElementById("footer").textContent = `${data.games.length} games · ${site.title}`;

  const params = new URLSearchParams(location.search);
  let active = params.get("s") || "all";
  if (active !== "all" && !byKey[active]) active = "all";
  let query = "";

  // ---------- Chips ----------
  const chips = document.getElementById("chips");
  const mkChip = (key, label, colour) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = label;
    b.dataset.key = key;
    if (colour) b.style.setProperty("--c", colour);
    b.onclick = () => {
      active = key;
      const u = new URL(location);
      key === "all" ? u.searchParams.delete("s") : u.searchParams.set("s", key);
      history.replaceState(null, "", u);
      render();
    };
    chips.appendChild(b);
  };
  mkChip("all", "⭐ All");
  subjects.forEach(s => mkChip(s.key, `${s.emoji} ${s.name}`, s.colour));

  document.getElementById("search").addEventListener("input", e => {
    query = e.target.value.trim().toLowerCase();
    render();
  });

  // ---------- Cards ----------
  const isNew = g => g.added && (Date.now() - new Date(g.added)) / 864e5 < 14;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function card(g) {
    const s = byKey[g.subject];
    const a = document.createElement("a");
    a.className = "card";
    a.href = `play.html?g=${encodeURIComponent(g.id)}`;
    a.style.setProperty("--c", s.colour);
    const sub = [g.by && `by ${g.by}`, g.years].filter(Boolean).join(" · ");
    a.innerHTML = `
      <div class="thumb ${g.thumb ? "" : "fallback"}">
        ${g.thumb ? `<img src="${esc(g.thumb)}" alt="" loading="lazy">` : `<span class="emoji">${esc(g.emoji || s.emoji)}</span>`}
        ${isNew(g) ? `<span class="badge">NEW</span>` : ""}
        <div class="play"><span>▶ Play</span></div>
      </div>
      <div class="meta">
        <h3>${esc(g.title)}</h3>
        ${sub ? `<p>${esc(sub)}</p>` : ""}
      </div>`;
    return a;
  }

  function render() {
    chips.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c.dataset.key === active));
    const main = document.getElementById("main");
    main.innerHTML = "";
    const match = g =>
      (active === "all" || g.subject === active) &&
      (!query || [g.title, g.by, g.description, g.years, byKey[g.subject].name].join(" ").toLowerCase().includes(query));

    const show = subjects.filter(s => active === "all" || s.key === active);
    let total = 0;
    for (const s of show) {
      const list = data.games.filter(g => g.subject === s.key && match(g));
      if (!list.length) continue;
      total += list.length;
      const sec = document.createElement("section");
      sec.className = "section";
      sec.style.setProperty("--c", s.colour);
      sec.innerHTML = `<h2><span class="dot"></span>${esc(s.emoji)} ${esc(s.name)} <small>${list.length} game${list.length > 1 ? "s" : ""}</small></h2>`;
      const grid = document.createElement("div");
      grid.className = "grid";
      list.forEach(g => grid.appendChild(card(g)));
      sec.appendChild(grid);
      main.appendChild(sec);
    }
    if (!total) main.innerHTML = `<p class="empty">No games found${query ? ` for “${esc(query)}”` : ""} 🙈</p>`;
  }

  render();
})();

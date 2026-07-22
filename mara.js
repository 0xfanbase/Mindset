// mara.js — Mara tab: animal reference + Great Migration facts (BUILD-PLAN.md v1.25)
const DATA_URL = "./data/mara.json";

let built = false;
let data = null;
let selectedId = null;
let root, indexEl, detailEl;

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) node.appendChild(c);
  return node;
}

function bandClass(band) {
  return "mara-band-" + band.toLowerCase().replace(/[^a-z]+/g, "-").replace(/(^-|-$)/g, "");
}

function renderPhoto(photo, sizeClass) {
  const figure = el("figure", { class: `mara-photo ${sizeClass}` }, [
    el("img", {
      src: `./${photo.src}`,
      alt: photo.alt,
      loading: "lazy",
      width: "900",
      height: "600",
      class: "mara-photo-img",
    }),
    el("figcaption", { class: "mara-photo-caption", text: `${photo.credit} · ${photo.license}` }),
  ]);
  return figure;
}

function renderParkCard() {
  const statsRow = el("div", { class: "mara-park-stats" },
    data.park.stats.map((s) => el("div", { class: "mara-park-stat" }, [
      el("div", { class: "mara-park-stat-label", text: s.label }),
      el("div", { class: "mara-park-stat-value", text: s.value }),
    ]))
  );

  const aboutP = el("p", { class: "mara-park-about", text: data.park.about });

  const migrationParas = data.park.migration.paragraphs.map((p) => el("p", { class: "mara-park-about", text: p }));
  const migrationFacts = el("ul", { class: "mara-field-notes" },
    data.park.migration.facts.map((f) => el("li", { text: f }))
  );

  return el("section", { class: "mara-park-card" }, [
    el("h2", { class: "mara-park-title", text: data.park.name }),
    statsRow,
    aboutP,
    el("h3", { class: "mara-section-title", text: data.park.migration.title }),
    ...migrationParas,
    migrationFacts,
    el("p", { class: "mara-methodology", text: "Sighting likelihoods reflect a typical multi-day August safari, not a published statistic." }),
  ]);
}

function renderTile(animal) {
  const btn = el("button", {
    type: "button",
    class: "mara-tile",
    "data-id": animal.id,
    "aria-label": `${animal.name}, ${animal.sighting.band.toLowerCase()} to see`,
  });
  if (animal.id === selectedId) btn.setAttribute("aria-current", "true");
  const img = el("img", {
    src: `./${animal.photos[0].src}`,
    alt: "",
    loading: "lazy",
    class: "mara-tile-photo",
  });
  const nameRow = el("div", { class: "mara-tile-name" }, [
    el("span", { text: animal.name }),
  ]);
  const swahili = el("div", { class: "mara-tile-swahili", text: animal.swahili });
  const pill = el("div", { class: `mara-tile-pill ${bandClass(animal.sighting.band)}`, text: animal.sighting.band });
  btn.append(img, nameRow, swahili, pill);
  btn.addEventListener("click", () => selectAnimal(animal.id));
  return btn;
}

function renderIndex() {
  indexEl.textContent = "";
  indexEl.appendChild(renderParkCard());
  const grid = el("div", { class: "mara-index-grid" }, data.animals.map(renderTile));
  indexEl.appendChild(grid);
}

function animateSightingCount(numEl, target) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) { numEl.textContent = `${target}%`; return; }
  const durationMs = 700;
  const start = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = 1 - Math.pow(1 - t, 3);
    numEl.textContent = `${Math.round(eased * target)}%`;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function renderSighting(sighting) {
  const wrap = el("div", { class: "mara-sighting" });
  const num = el("div", { class: "mara-sighting-pct", text: "0%" });
  const meta = el("div", { class: "mara-sighting-meta" }, [
    el("div", { class: `mara-sighting-band ${bandClass(sighting.band)}`, text: sighting.band }),
    el("div", { class: "mara-sighting-note", text: sighting.note }),
  ]);
  wrap.append(num, meta);
  requestAnimationFrame(() => animateSightingCount(num, sighting.pct));
  return wrap;
}

function renderStats(stats) {
  const rows = [
    ["LIFESPAN", stats.lifespan],
    ["SIZE", stats.size],
    ["EATS", stats.eats],
  ];
  return el("div", { class: "mara-stats" }, rows.map(([label, value]) =>
    el("div", { class: "mara-stat-row" }, [
      el("div", { class: "mara-stat-label", text: label }),
      el("div", { class: "mara-stat-value", text: value }),
    ])
  ));
}

function renderDetail(id) {
  detailEl.textContent = "";
  const animal = data.animals.find((a) => a.id === id);
  if (!animal) {
    detailEl.appendChild(el("p", { class: "mara-empty", text: "Choose an animal from the list to see its full profile." }));
    return;
  }

  const back = el("button", { type: "button", class: "mara-back", text: "‹ All animals" });
  back.addEventListener("click", () => selectAnimal(null));

  const nameBlock = el("div", { class: "mara-detail-name" }, [
    el("h2", { class: "mara-detail-name-en", text: animal.name }),
    el("div", { class: "mara-detail-name-sw", text: animal.swahili }),
  ]);

  const whereSection = el("div", { class: "mara-section" }, [
    el("h3", { class: "mara-section-title", text: "WHERE TO LOOK" }),
    el("p", { class: "mara-section-body", text: animal.whereToLook }),
  ]);

  const notesSection = el("div", { class: "mara-section" }, [
    el("h3", { class: "mara-section-title", text: "FIELD NOTES" }),
    el("ul", { class: "mara-field-notes" }, animal.fieldNotes.map((n) => el("li", { text: n }))),
  ]);

  detailEl.append(
    back,
    renderPhoto(animal.photos[0], "mara-photo-main"),
    nameBlock,
    renderSighting(animal.sighting),
    renderStats(animal.stats),
    el("p", { class: "mara-intro", text: animal.intro }),
    whereSection,
    notesSection,
    renderPhoto(animal.photos[1], "mara-photo-secondary")
  );
}

function selectAnimal(id) {
  selectedId = id;
  root.setAttribute("data-view", id ? "detail" : "index");
  renderDetail(id);
  // keep index tile aria-current in sync for the persistent desktop sidebar
  indexEl.querySelectorAll(".mara-tile[aria-current]").forEach((t) => t.removeAttribute("aria-current"));
  if (id) {
    const tile = indexEl.querySelector(`.mara-tile[data-id="${id}"]`);
    if (tile) tile.setAttribute("aria-current", "true");
  }
  if (!id) detailEl.scrollTop = 0;
}

async function build() {
  root = document.getElementById("mara-root");
  root.setAttribute("data-view", "index");
  const layout = el("div", { class: "mara-layout" });
  indexEl = el("div", { class: "mara-index", id: "mara-index" });
  detailEl = el("div", { class: "mara-detail", id: "mara-detail" });
  layout.append(indexEl, detailEl);
  root.appendChild(layout);

  const res = await fetch(DATA_URL, { cache: "no-store" });
  data = await res.json();

  renderIndex();
  renderDetail(null);
}

export async function initMaraTab() {
  if (built) return;
  built = true;
  try {
    await build();
  } catch (e) {
    built = false;
    if (root) root.appendChild(el("p", { class: "mara-empty", text: "Couldn't load the Mara reference. Refresh, or check back later." }));
  }
}

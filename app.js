const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// ---------- stan (localStorage z bezpiecznym fallbackiem) ----------
const KEY = "madera26";
let state = {};
try { state = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
state.done = state.done || {};

// ---------- motyw ----------
function applyTheme() {
  if (state.theme) document.documentElement.dataset.theme = state.theme; else delete document.documentElement.dataset.theme;
  MapView.readTheme();
}
$("#themeBtn").onclick = () => {
  const dark = state.theme ? state.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  state.theme = dark ? "light" : "dark"; save(); applyTheme();
};

// ---------- pomocnicze ----------
const nav = (c, t) => `https://maps.apple.com/?daddr=${c[0]},${c[1]}&dirflg=d&q=${encodeURIComponent(t)}`;
const gnav = c => `https://www.google.com/maps/dir/?api=1&destination=${c[0]},${c[1]}`;
const allStops = () => DAYS.flatMap(d => d.items.map(i => ({ d, i })));

function initialDay() {
  const t = new Date(); const iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  const d = DAYS.find(d => `2026-10-${d.dn}` === iso);
  return d ? d.day : 1;
}
let curDay = state.day || initialDay();

// ---------- PLAN ----------
function chip(d, active, extra = "") {
  return `<button class="chip ${active ? "active" : ""}" data-day="${d.day}" ${extra}><small>${d.dow}</small><b>${d.dn}</b></button>`;
}
function renderDays() {
  $("#days").innerHTML = DAYS.map(d => chip(d, d.day === curDay)).join("");
  const a = $("#days .active"); a && a.scrollIntoView({ inline: "center", block: "nearest" });
}
function stopHTML(it, d, showDay) {
  const sub = it.trail || it.food || it.park || "";
  const rows = [["Parking", it.park], ["Szlak", it.trail], ["Jedzenie", it.food]].filter(r => r[1])
    .map(r => `<div class="row"><span>${r[0]}</span><div>${esc(r[1])}</div></div>`).join("");
  const subs = (it.sub || []).map(s => `<a class="btn" href="${nav([s[1], s[2]], s[0])}">${esc(s[0])}</a>`).join("");
  return `<li class="stop ${state.done[it.id] ? "done" : ""}" data-id="${it.id}">
    <div class="rail"><span class="time">${it.time}</span><button class="tick" data-tick="${it.id}" aria-label="Odhacz"></button></div>
    <div class="body">
      <button class="head" data-open="${it.id}">
        ${showDay ? `<span class="daytag">Dzień ${d.day} · ${d.dow} ${d.dn}.10</span>` : ""}
        <h3>${esc(it.title)}</h3>${sub ? `<span class="sub">${esc(sub.length > 70 ? sub.slice(0, 68) + "…" : sub)}</span>` : ""}
      </button>
      <div class="more"><div><div class="more-in">
        <p class="desc">${esc(it.desc)}</p>${rows}
        <div class="actions">
          <a class="btn primary" href="${nav(it.c, it.title)}">Nawiguj</a>
          <button class="btn" data-map="${it.id}">Na mapie</button>
          <a class="btn" href="${gnav(it.c)}">Google</a>
          <button class="btn" data-copy="${it.c.join(",")}">Kopiuj GPS</button>
          ${subs}
        </div>
      </div></div></div>
    </div></li>`;
}
function renderDay() {
  const d = DAYS.find(x => x.day === curDay);
  const done = d.items.filter(i => state.done[i.id]).length;
  $("#dayHead").innerHTML = `<h2>${esc(d.title)}</h2><p>${esc(d.weather)}</p><div class="bar"><i style="width:${done / d.items.length * 100}%"></i></div>`;
  $("#stops").innerHTML = d.items.map(i => stopHTML(i, d, false)).join("");
}
function selectDay(n) {
  curDay = n; state.day = n; save();
  $("#searchInput").value = ""; $("#dayHead").hidden = false; $("#days").hidden = false;
  renderDays(); renderDay();
}
$("#days").onclick = e => { const b = e.target.closest("[data-day]"); if (b) selectDay(+b.dataset.day); };

$("#searchToggle").onclick = () => {
  const w = $("#searchWrap"); w.hidden = !w.hidden;
  if (!w.hidden) $("#searchInput").focus(); else selectDay(curDay);
};
$("#searchInput").oninput = e => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) return selectDay(curDay);
  const res = allStops().filter(({ i }) => `${i.title} ${i.desc} ${i.park || ""} ${i.trail || ""} ${i.food || ""} ${(i.sub || []).map(s => s[0]).join(" ")}`.toLowerCase().includes(q));
  $("#days").hidden = true; $("#dayHead").hidden = true;
  $("#stops").innerHTML = res.length ? res.map(({ d, i }) => stopHTML(i, d, true)).join("") : `<p class="muted" style="padding:20px 0">Brak wyników.</p>`;
};

$("#stops").onclick = e => {
  const li = e.target.closest(".stop"); if (!li) return;
  const id = li.dataset.id;
  if (e.target.closest("[data-tick]")) { toggleDone(id); return; }
  if (e.target.closest("[data-open]")) { li.classList.toggle("open"); return; }
  const m = e.target.closest("[data-map]");
  if (m) { openTab("map"); const dd = DAYS.find(d => d.items.some(i => i.id === id)).day; setMapDay(dd); MapView.select(id); return; }
  const c = e.target.closest("[data-copy]");
  if (c) copy(c.dataset.copy, c);
};
function toggleDone(id) {
  state.done[id] = !state.done[id]; save();
  const q = $("#searchInput").value.trim();
  if (q) { const li = $(`.stop[data-id="${id}"]`); li && li.classList.toggle("done", state.done[id]); } else { const open = $$(".stop.open").map(x => x.dataset.id); renderDay(); open.forEach(o => $(`.stop[data-id="${o}"]`)?.classList.add("open")); }
}
function copy(text, btn) {
  const done = () => { const o = btn.textContent; btn.textContent = "Skopiowano"; setTimeout(() => btn.textContent = o, 1400); };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, done);
  else { const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (e) {} t.remove(); done(); }
}

// ---------- MAPA ----------
function setMapDay(n) {
  $$("#mapChips .chip").forEach(c => c.classList.toggle("active", +c.dataset.day === n));
  MapView.setFilter(n);
}
function renderMapChips() {
  $("#mapChips").innerHTML = `<button class="chip pill active" data-day="0">Wszystko</button>` + DAYS.map(d => `<button class="chip pill" data-day="${d.day}">Dzień ${d.day}</button>`).join("");
}
$("#mapChips").onclick = e => { const b = e.target.closest("[data-day]"); if (b) setMapDay(+b.dataset.day); };

MapView.init(p => {
  const sh = $("#sheet");
  if (!p) { sh.hidden = true; return; }
  const d = DAYS.find(x => x.day === p.day), it = d.items.find(i => i.id === p.id);
  const c = p.sub ? [p.lat, p.lon] : it.c;
  sh.hidden = false;
  sh.innerHTML = `<button class="x" id="sheetX" aria-label="Zamknij">✕</button>
    <h3>${esc(p.title)}</h3>
    <div class="sub">Dzień ${d.day} · ${d.dow} ${d.dn}.10${p.sub ? "" : " · " + it.time}</div>
    <div class="actions"><a class="btn primary" href="${nav(c, p.title)}">Nawiguj</a>
    <button class="btn" id="sheetPlan">W planie</button></div>`;
  $("#sheetX").onclick = () => { sh.hidden = true; };
  $("#sheetPlan").onclick = () => { selectDay(d.day); openTab("plan"); const li = $(`.stop[data-id="${it.id}"]`); if (li) { li.classList.add("open"); li.scrollIntoView({ block: "center" }); } };
});
$("#zoomIn").onclick = () => MapView.zoom(1.6);
$("#zoomOut").onclick = () => MapView.zoom(1 / 1.6);
let watchId = null;
$("#locate").onclick = () => {
  if (!navigator.geolocation) return alert("Brak geolokalizacji w tej przeglądarce.");
  let first = true;
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  watchId = navigator.geolocation.watchPosition(
    p => { MapView.setUser(p.coords.latitude, p.coords.longitude, p.coords.accuracy, first); first = false; },
    err => alert("Nie udało się ustalić lokalizacji. Zezwól na dostęp w Ustawieniach."),
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
};

// ---------- INFO / KUCHNIA / LISTA ----------
$("#guide").innerHTML = GUIDE.map((g, i) => `<div class="acc ${g.open ? "open" : ""}"><button>${esc(g.t)}</button><div class="in">${g.p.map(p => `<p>${p}</p>`).join("")}</div></div>`).join("");
$("#guide").onclick = e => { const b = e.target.closest(".acc > button"); if (b) b.parentElement.classList.toggle("open"); };

function checklist(el, list, prefix) {
  el.innerHTML = list.map((t, i) => `<li data-k="${prefix}${i}" class="${state.done[prefix + i] ? "done" : ""}"><span class="tick"></span><span>${esc(t)}</span></li>`).join("");
  el.onclick = e => { const li = e.target.closest("li"); if (!li) return; const k = li.dataset.k; state.done[k] = !state.done[k]; save(); li.classList.toggle("done", state.done[k]); };
}
checklist($("#foodList"), FOOD, "food_");
checklist($("#prepList"), PREP, "prep_");
$("#wineRows").innerHTML = WINE.map(w => `<tr><td><b>${w[0]}</b></td><td>${w[1]}</td><td>${w[2]}</td></tr>`).join("");
$("#links").innerHTML = LINKS.map(l => `<a href="${l[1]}" target="_blank" rel="noopener">${esc(l[0])}</a>`).join("");
$("#resetBtn").onclick = () => { if (confirm("Wyczyścić wszystkie odhaczenia?")) { state.done = {}; save(); renderDay(); checklist($("#foodList"), FOOD, "food_"); checklist($("#prepList"), PREP, "prep_"); } };

// ---------- zakładki ----------
function openTab(t) {
  $$(".view").forEach(v => v.classList.toggle("active", v.id === "view-" + t));
  $$("#tabbar button").forEach(b => b.classList.toggle("active", b.dataset.tab === t));
  if (t === "map") MapView.show(); else window.scrollTo(0, 0);
  state.tab = t; save();
}
$("#tabbar").onclick = e => { const b = e.target.closest("[data-tab]"); if (b) openTab(b.dataset.tab); };

// ---------- start ----------
applyTheme(); renderMapChips(); renderDays(); renderDay();

// ---------- offline / instalacja ----------
const standalone = navigator.standalone || matchMedia("(display-mode: standalone)").matches;
const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
if (ios && !standalone && !localStorage.getItem("madera_hint")) {
  $("#install").hidden = false;
  $("#installClose").onclick = () => { $("#install").hidden = true; try { localStorage.setItem("madera_hint", "1"); } catch (e) {} };
}
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").then(() => navigator.serviceWorker.ready).then(() => { $("#offlineState").textContent = "Aplikacja gotowa do pracy offline."; }).catch(() => {});
} else {
  $("#offlineState").textContent = "Tryb offline wymaga otwarcia przez HTTPS i dodania do ekranu początkowego.";
}

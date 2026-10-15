// Mapa offline na canvas: wybrzeże, drogi, miejscowości (MAP_DATA) + punkty planu (DAYS).
const MapView = (() => {
  const cv = document.getElementById("map");
  const ctx = cv.getContext("2d");
  const LAT0 = 32.74, KX = Math.cos(LAT0 * Math.PI / 180);
  const COLORS = ["#0f766e", "#2563eb", "#9333ea", "#16a34a", "#ea580c", "#db2777", "#ca8a04", "#475569"];
  const BOUNDS = { w: -17.28, e: -16.64, s: 32.6, n: 32.9 };

  let W = 0, H = 0, dpr = 1, s = 1, sMin = 1, sMax = 1, cx = 0, cy = 0;
  let filter = 0, selected = null, user = null, theme = {}, raf = 0, ready = false;
  let onSelect = () => {};

  // punkty: {id, day, n, lat, lon, title, time, base, sub}
  const pins = [];
  DAYS.forEach(d => d.items.forEach((it, i) => {
    pins.push({ id: it.id, day: d.day, n: i + 1, lat: it.c[0], lon: it.c[1], title: it.title, time: it.time, base: !!it.base });
    (it.sub || []).forEach(sp => pins.push({ id: it.id, day: d.day, sub: true, lat: sp[1], lon: sp[2], title: sp[0] }));
  }));

  const wx = lon => lon * KX;
  const wy = lat => -lat;
  const px = (lon, lat) => [(wx(lon) - cx) * s + W / 2, (wy(lat) - cy) * s + H / 2];

  function readTheme() {
    const cs = getComputedStyle(document.documentElement);
    const g = n => cs.getPropertyValue(n).trim();
    theme = { sea: g("--sea"), land: g("--land"), road: g("--road"), road2: g("--road2"), ink: g("--ink"), muted: g("--muted"), card: g("--card") };
    draw();
  }

  function resize() {
    const r = cv.getBoundingClientRect();
    if (!r.width) return false;
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const spanX = (BOUNDS.e - BOUNDS.w) * KX, spanY = BOUNDS.n - BOUNDS.s;
    sMin = Math.min(W / spanX, H / spanY) * 0.9;
    sMax = sMin * 120;
    if (!ready) { ready = true; fitAll(); }
    draw();
    return true;
  }

  function fitAll() {
    s = Math.min(W / ((-16.66 - -17.27) * KX), H / 0.34) * 0.95;
    cx = wx(-16.96); cy = wy(32.74);
  }

  function fitPins(list) {
    if (!list.length) return fitAll();
    let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
    list.forEach(p => { const x = wx(p.lon), y = wy(p.lat); a = Math.min(a, x); b = Math.max(b, x); c = Math.min(c, y); d = Math.max(d, y); });
    const padX = 70, padTop = 110, padBot = 200;
    const spanX = Math.max(b - a, 0.02), spanY = Math.max(d - c, 0.02);
    const ns = Math.min((W - padX * 2) / spanX, (H - padTop - padBot) / spanY);
    animate(Math.min(Math.max(ns, sMin), sMax), (a + b) / 2, (c + d) / 2 - (padBot - padTop) / 2 / Math.min(Math.max(ns, sMin), sMax));
  }

  let anim = null, animId = 0;
  function animate(ts, tx, ty) {
    const s0 = s, x0 = cx, y0 = cy, t0 = performance.now(), my = ++animId;
    anim = true;
    const step = now => {
      if (my !== animId) return;
      const k = Math.min(1, (now - t0) / 350), e = 1 - Math.pow(1 - k, 3);
      s = s0 * Math.pow(ts / s0, e); cx = x0 + (tx - x0) * e; cy = y0 + (ty - y0) * e;
      draw();
      if (k < 1 && anim) requestAnimationFrame(step); else anim = null;
    };
    requestAnimationFrame(step);
  }

  function clamp() {
    s = Math.min(Math.max(s, sMin), sMax);
    cx = Math.min(Math.max(cx, wx(BOUNDS.w)), wx(BOUNDS.e));
    cy = Math.min(Math.max(cy, wy(BOUNDS.n)), wy(BOUNDS.s));
  }

  function draw() {
    if (!ready || !W) return;
    if (raf) return;
    raf = requestAnimationFrame(render);
  }

  function path(line, close) {
    let first = true;
    for (const p of line) {
      const [x, y] = px(p[0], p[1]);
      if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
    }
    if (close) ctx.closePath();
  }

  function render() {
    raf = 0;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = theme.sea || "#e8eff2";
    ctx.fillRect(0, 0, W, H);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    const z = s / sMin;

    // ląd
    ctx.beginPath();
    MAP_DATA.coast.forEach(l => path(l, l[0][0] === l[l.length - 1][0] && l[0][1] === l[l.length - 1][1]));
    ctx.fillStyle = theme.land; ctx.fill("evenodd");
    ctx.strokeStyle = theme.road2; ctx.lineWidth = 1; ctx.stroke();

    // drogi
    ctx.strokeStyle = theme.road; ctx.lineWidth = Math.min(1 + z * 0.12, 2.5);
    ctx.beginPath(); MAP_DATA.roads.minor.forEach(l => path(l)); ctx.stroke();
    ctx.strokeStyle = theme.road2; ctx.lineWidth = Math.min(1.4 + z * 0.2, 4);
    ctx.beginPath(); MAP_DATA.roads.major.forEach(l => path(l)); ctx.stroke();

    // miejscowości
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const placed = [];
    const sorted = MAP_DATA.places.slice().sort((a, b) => a[3] - b[3]);
    for (const [name, lon, lat, t] of sorted) {
      if (t === 2 && z < 2.6) continue;
      if (t === 1 && z < 1.1) continue;
      const [x, y] = px(lon, lat);
      if (x < -50 || y < -20 || x > W + 50 || y > H + 20) continue;
      const fs = t === 0 ? 13 : t === 1 ? 11.5 : 10.5;
      ctx.font = `${t === 0 ? 600 : 500} ${fs}px -apple-system, sans-serif`;
      const w = ctx.measureText(name).width + 6;
      const r = [x - w / 2, y - fs / 2, w, fs];
      if (placed.some(q => r[0] < q[0] + q[2] && r[0] + r[2] > q[0] && r[1] < q[1] + q[3] && r[1] + r[3] > q[1])) continue;
      placed.push(r);
      ctx.lineWidth = 3; ctx.strokeStyle = theme.land; ctx.strokeText(name, x, y);
      ctx.fillStyle = theme.muted; ctx.fillText(name, x, y);
    }

    // trasa wybranego dnia
    const vis = pins.filter(p => !filter || p.day === filter);
    if (filter) {
      const main = vis.filter(p => !p.sub);
      ctx.strokeStyle = COLORS[(filter - 1) % 8]; ctx.lineWidth = 2; ctx.setLineDash([2, 6]);
      ctx.beginPath(); main.forEach((p, i) => { const [x, y] = px(p.lon, p.lat); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
      ctx.setLineDash([]);
    }

    // punkty (podpunkty najpierw, pod spodem)
    const order = vis.slice().sort((a, b) => (a.sub ? 0 : 1) - (b.sub ? 0 : 1));
    for (const p of order) {
      const [x, y] = px(p.lon, p.lat);
      if (x < -30 || y < -30 || x > W + 30 || y > H + 30) continue;
      const col = COLORS[(p.day - 1) % 8];
      const sel = selected && selected.id === p.id && !!selected.sub === !!p.sub && selected.title === p.title;
      if (p.sub) {
        ctx.beginPath(); ctx.arc(x, y, sel ? 7 : 5, 0, 7);
        ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = "#fff"; ctx.stroke();
        if (z > 3 || sel) label(p.title, x, y + 14);
        continue;
      }
      const r = sel ? 15 : 12;
      ctx.beginPath();
      if (p.base) ctx.roundRect ? ctx.roundRect(x - r, y - r, r * 2, r * 2, 6) : ctx.rect(x - r, y - r, r * 2, r * 2);
      else ctx.arc(x, y, r, 0, 7);
      ctx.fillStyle = col; ctx.fill();
      ctx.lineWidth = sel ? 3 : 2; ctx.strokeStyle = "#fff"; ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.font = "700 12px -apple-system, sans-serif";
      ctx.fillText(p.base ? "⌂" : String(filter ? p.n : p.day), x, y + 0.5);
      if (sel || (filter && z > 2.5)) label(p.title, x, y + r + 11);
    }

    // użytkownik
    if (user) {
      const [x, y] = px(user.lon, user.lat);
      const acc = Math.max(user.acc * s * 1 / 111000 * KX * 1.0, 0);
      const ar = user.acc / 111320 * s;
      if (ar > 12) { ctx.beginPath(); ctx.arc(x, y, ar, 0, 7); ctx.fillStyle = "rgba(37,99,235,.12)"; ctx.fill(); }
      ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fillStyle = "#2563eb"; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = "#fff"; ctx.stroke();
    }
  }

  function label(text, x, y) {
    ctx.font = "600 12px -apple-system, sans-serif";
    ctx.lineWidth = 4; ctx.strokeStyle = theme.land; ctx.strokeText(text, x, y);
    ctx.fillStyle = theme.ink; ctx.fillText(text, x, y);
  }

  function hit(x, y) {
    let best = null, bd = 26 * 26;
    const list = pins.filter(p => !filter || p.day === filter);
    for (const p of list) {
      const [a, b] = px(p.lon, p.lat);
      const d = (a - x) * (a - x) + (b - y) * (b - y);
      if (d < bd || (d === bd && best && best.sub && !p.sub)) { bd = d; best = p; }
    }
    return best;
  }

  // gesty
  const ptrs = new Map();
  let last = null, moved = 0, downT = 0, lastTap = 0;
  const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };

  cv.addEventListener("pointerdown", e => {
    cv.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId, pos(e)); anim = null;
    if (ptrs.size === 1) { moved = 0; downT = performance.now(); }
    last = snapshot();
  });
  cv.addEventListener("pointermove", e => {
    if (!ptrs.has(e.pointerId)) return;
    const p = pos(e); ptrs.set(e.pointerId, p);
    const now = snapshot();
    if (last) {
      cx -= (now.x - last.x) / s; cy -= (now.y - last.y) / s;
      moved += Math.abs(now.x - last.x) + Math.abs(now.y - last.y);
      if (ptrs.size > 1 && last.d > 0 && now.d > 0) {
        const f = now.d / last.d, ns = Math.min(Math.max(s * f, sMin), sMax);
        // zoom względem środka gestu
        const wxp = cx + (now.x - W / 2) / s, wyp = cy + (now.y - H / 2) / s;
        s = ns; cx = wxp - (now.x - W / 2) / s; cy = wyp - (now.y - H / 2) / s;
      }
      clamp(); draw();
    }
    last = now;
  });
  const up = e => {
    if (!ptrs.has(e.pointerId)) return;
    const p = ptrs.get(e.pointerId);
    ptrs.delete(e.pointerId);
    last = ptrs.size ? snapshot() : null;
    if (!ptrs.size && moved < 8 && performance.now() - downT < 400) {
      const t = performance.now();
      if (t - lastTap < 300) { zoomAt(p[0], p[1], 2); lastTap = 0; return; }
      lastTap = t;
      setTimeout(() => { if (lastTap === t) tap(p[0], p[1]); }, 310);
    }
  };
  cv.addEventListener("pointerup", up);
  cv.addEventListener("pointercancel", up);
  cv.addEventListener("wheel", e => { e.preventDefault(); const p = pos(e); zoomAt(p[0], p[1], Math.exp(-e.deltaY * 0.002)); }, { passive: false });

  function snapshot() {
    const a = [...ptrs.values()];
    if (!a.length) return null;
    const x = a.reduce((m, p) => m + p[0], 0) / a.length, y = a.reduce((m, p) => m + p[1], 0) / a.length;
    const d = a.length > 1 ? Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]) : 0;
    return { x, y, d };
  }
  function zoomAt(x, y, f) {
    const wxp = cx + (x - W / 2) / s, wyp = cy + (y - H / 2) / s;
    s = Math.min(Math.max(s * f, sMin), sMax);
    cx = wxp - (x - W / 2) / s; cy = wyp - (y - H / 2) / s;
    clamp(); draw();
  }
  function tap(x, y) {
    const p = hit(x, y);
    selected = p; draw(); onSelect(p);
  }

  return {
    init(cb) { onSelect = cb; readTheme(); window.addEventListener("resize", resize); matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", readTheme); },
    show() { requestAnimationFrame(() => { resize(); readTheme(); }); },
    readTheme,
    setFilter(d) { filter = d; selected = null; onSelect(null); fitPins(pins.filter(p => !d || p.day === d)); },
    select(id) { const p = pins.find(q => q.id === id && !q.sub); if (p) { selected = p; const z = Math.max(sMin * 14, s); animate(z, wx(p.lon), wy(p.lat) + 60 / z); onSelect(p); } },
    zoom(f) { zoomAt(W / 2, H / 2, f); },
    setUser(lat, lon, acc, center) { user = { lat, lon, acc }; if (center) animate(Math.max(s, sMin * 10), wx(lon), wy(lat)); else draw(); },
    getFilter: () => filter
  };
})();

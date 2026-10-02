// Shared pieces for IceCreamClear's chapters: colours, live chart boards, the screen layout, and the
// "microscope" view of ice crystals, air bubbles, fat globules and syrup that every chapter uses.
// The physics lives in physics.js (no 3D in it, so it can be checked by itself).
import { THREE, M, box, clamp, swarm } from './kit.js';
import { rng, TAU } from './physics.js';
export * from './physics.js';
export { THREE };

export const COL = {
  ice: '#bfe6ff', air: '#ffffff', fat: '#ffd34d', syrup: '#f0b56a', cold: '#8ef0ff', warm: '#ffb547', hot: '#ff7a59',
  pink: '#f59ee6', good: '#5ce1a9', bad: '#ff6b6b', text: '#e8eef8', dim: 'rgba(255,255,255,.6)',
};

// ---------------------------------------------------------------- boards (live charts in 3D)
export function panelBg(g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,12,18,.92)'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2); }
export function board(root, w, h, pxW, pxH, draw, pos = [0, 0, 0]) {
  const c = document.createElement('canvas'); c.width = pxW; c.height = pxH;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const redraw = () => { draw(g, pxW, pxH); tex.needsUpdate = true; };
  redraw();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide }));
  m.position.set(...pos); root.add(m);
  return { tex, redraw, canvas: c, mesh: m };
}
export function axes(g, w, h, { x0 = 84, x1 = w - 28, y0 = h - 64, y1 = 70, xMax, yMax, xMin = 0, yMin = 0, xTicks, yTicks, xFmt = String, yFmt = String, xLabel = '', yLabel = '' }) {
  const X = (x) => x0 + ((x - xMin) / (xMax - xMin)) * (x1 - x0);
  const Y = (y) => y0 - ((y - yMin) / (yMax - yMin)) * (y0 - y1);
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1; g.fillStyle = 'rgba(255,255,255,.6)'; g.font = '22px sans-serif';
  for (const t of xTicks) { g.beginPath(); g.moveTo(X(t), y1); g.lineTo(X(t), y0); g.stroke(); const s = xFmt(t); g.fillText(s, X(t) - g.measureText(s).width / 2, y0 + 26); }
  for (const t of yTicks) { g.beginPath(); g.moveTo(x0, Y(t)); g.lineTo(x1, Y(t)); g.stroke(); const s = yFmt(t); g.fillText(s, x0 - 10 - g.measureText(s).width, Y(t) + 6); }
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0, y0); g.lineTo(x1, y0); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '21px sans-serif';
  if (xLabel) g.fillText(xLabel, x1 - g.measureText(xLabel).width, y0 + 52);
  if (yLabel) g.fillText(yLabel, x0 + 8, y1 - 10);
  return { X, Y, x0, x1, y0, y1 };
}
export function title(g, text, sub = '') {
  g.fillStyle = COL.text; g.font = 'bold 27px sans-serif'; g.fillText(text, 20, 36);
  if (sub) { g.font = '20px sans-serif'; g.fillStyle = COL.dim; g.fillText(sub, 20, 60); }
}
export function line(g, pts, X, Y, col, wdt = 5, dash = null) {
  if (pts.length < 2) return;
  g.strokeStyle = col; g.lineWidth = wdt; g.setLineDash(dash || []); g.lineJoin = 'round'; g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))));
  g.stroke(); g.setLineDash([]);
}
export function dot(g, x, y, col, r = 10) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke(); }
export function dashH(g, X0, X1, y, text = '', col = 'rgba(255,255,255,.5)') {
  g.strokeStyle = col; g.setLineDash([8, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(X0, y); g.lineTo(X1, y); g.stroke(); g.setLineDash([]);
  if (text) { g.font = '20px sans-serif'; g.fillStyle = 'rgba(255,255,255,.8)'; g.fillText(text, X1 - g.measureText(text).width - 4, y - 8); }
}
export function note(g, text, x, y, col = COL.dim, font = '20px sans-serif') { g.font = font; g.fillStyle = col; g.fillText(text, x, y); }
// Horizontal bars with labels: rows [{ label, value, color, text }].
export function bars(g, rows, { x = 20, y = 80, w = 600, rowH = 56, labelW = 230, max = null } = {}) {
  const mx = max ?? Math.max(1e-9, ...rows.map((r) => Math.abs(r.value))) * 1.2, span = w - labelW - 20;
  rows.forEach((r, i) => {
    const yy = y + i * rowH, L = (Math.abs(r.value) / mx) * span;
    g.font = 'bold 22px sans-serif'; g.fillStyle = r.color; g.fillText(r.label, x, yy + 24);
    g.globalAlpha = 0.85; g.fillRect(x + labelW, yy + 6, Math.max(2, L), rowH - 22); g.globalAlpha = 1;
    g.font = '21px sans-serif'; g.fillStyle = '#fff'; const t = r.text, tw = g.measureText(t).width;
    g.fillText(t, x + labelW + L + 8 + tw > w ? x + labelW + Math.max(4, L - tw - 8) : x + labelW + L + 8, yy + 26);
  });
}

// ---------------------------------------------------------------- layout
// True while the Glassbox studio records the reel.
export const inReel = () => document.body.classList.contains('gb-reel');
// Frame a box Wc wide and Hc tall around `target`, seen from direction `dir`, whatever the screen shape.
export function frame(stage, target, dir, Wc, Hc, dur = 1.1) {
  const a = stage.camera.aspect, t = Math.tan((stage.camera.fov * Math.PI) / 360) * 2;
  const d = 1.1 * Math.max(Hc / t, Wc / (t * a));
  const k = Math.min(2.5, Math.max(1, 1.45 / Math.max(0.3, a)));
  const D = new THREE.Vector3(...dir).normalize().multiplyScalar(d / k);
  stage.setView([target[0] + D.x, target[1] + D.y, target[2] + D.z], target, dur);
}
// Three screen shapes. "wide": a desktop, where the stage is nearly square and the readout card covers
// its upper left, so the microscope view sits at the upper right, the chart board at the lower left
// and the model at the lower right. "tall": the portrait reel and tablets, stacked with the model at
// the bottom, the microscope in the middle and the board on top. "phone": the readout card covers the
// top half of a small stage, so the board is dropped (the card carries the numbers) and the
// microscope and the model sit side by side underneath it.
export const VIEW = { wide: { target: [0, 5.1, 0], W: 11.2, H: 10.2 }, tall: { target: [0, 6.9, 0], W: 7.8, H: 14.2 }, phone: { target: [0, 2.45, 0], W: 9.6, H: 5.3 } };
export const SPOT = {
  micro: { wide: [3.4, 7.55, 0.72], tall: [0, 6.3, 1], phone: [-1.85, 2.75, 0.76] },
  model: { wide: [3.2, 0.3, 1], tall: [0, 0, 1], phone: [3.15, 0.3, 0.85] },
  board: { wide: [-2.85, 2.9, 1], tall: [0, 11.5, 1.2], phone: null },
};
export function screenMode(stage) { return !inReel() && stage.host.clientWidth < 560 ? 'phone' : stage.camera.aspect < 0.9 ? 'tall' : 'wide'; }
// Calls `apply(mode)` whenever the screen shape changes, frames the view, and hides the labels in
// `minor` on a phone. Returns the mode.
export function arrange(stage, state, apply, minor = []) {
  const mode = screenMode(stage);
  if (state.mode !== mode) {
    state.mode = mode; const v = apply(mode) || VIEW[mode];
    stage.setShift(0, mode === 'phone' ? -0.27 : 0);
    frame(stage, v.target, v.dir || [0, 0.06, 1], v.W, v.H, 0.8);
  }
  minor.forEach((l) => { if (l) l.visible = mode !== 'phone'; });
  return mode;
}
// Put a group or a board at its spot for this screen shape: [x, y, scale], or null to hide it.
export function place(obj, mode, spot) {
  const o = obj.mesh || obj.group || obj, p = spot[mode] === undefined ? spot.tall : spot[mode];
  o.visible = !!p; if (!p) return;
  o.position.set(p[0], p[1], 0); o.scale.setScalar(p[2] ?? 1);
}
// A thin glowing line between two points that can be moved later.
export function link(parent, color = 0x8ef0ff, r = 0.012) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 8), M.glow(color, { transparent: true, opacity: 0.5 })); parent.add(m);
  const A = new THREE.Vector3(), B = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  m.set = (a, b) => { A.set(...a); B.set(...b); m.position.copy(A).add(B).multiplyScalar(0.5); m.scale.y = Math.max(0.001, A.distanceTo(B)); m.quaternion.setFromUnitVectors(up, B.clone().sub(A).normalize()); };
  return m;
}

// A shape turned around the vertical axis from [radius, height] pairs. `half` keeps only the back
// half, so you can see inside from the front.
export function latheY(profile, mat, { seg = 48, half = false } = {}) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(Math.max(0, r), y)), seg, half ? Math.PI / 2 : 0, half ? Math.PI : TAU);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true;
  return m;
}

// The back half of an upright cylinder, with a flat face where it was cut, so parts in front show.
export function halfCyl(r, h, mat, seg = 32) {
  const g = new THREE.Group();
  const a = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg, 1, false, Math.PI / 2, Math.PI), mat);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(2 * r, h), mat);
  a.castShadow = true; g.add(a, f);
  return g;
}

// ---------------------------------------------------------------- the microscope view
// A window 0.6 mm wide into the ice cream: 1 unit = 100 µm (about the width of a hair). Ice crystals
// are drawn as faceted lumps, air bubbles as clear balls, and the unfrozen syrup as the amber sheet
// between them. Each covers the same share of the window as its share of the volume. Fat globules
// are really about 1 µm, far too small to see at this scale, so they are drawn about six times too
// big; they sit on the bubbles, as in the real thing.
export function makeMicro(parent, { w = 6, h = 4.4, seed = 7, stage = null } = {}) {
  const g = new THREE.Group(); parent.add(g);
  const NI = 460, NA = 110, NF = 700, A = w * h, rnd = rng(seed);
  const pool = (n) => Array.from({ length: n }, () => ({ x: (rnd() - 0.5) * w, y: (rnd() - 0.5) * h, z: (rnd() - 0.5) * 0.24, s: 0.78 + rnd() * 0.44, a: rnd() * TAU, b: rnd() * TAU }));
  const iceP = pool(NI), airP = pool(NA), fatP = pool(NF);
  const back = box(w + 0.18, h + 0.18, 0.05, new THREE.MeshBasicMaterial({ color: 0x141a26 })); back.position.z = -0.62; back.castShadow = false; g.add(back);
  const syrupMat = new THREE.MeshStandardMaterial({ color: 0xd28a2c, roughness: 0.4, transparent: true, opacity: 0.8 });
  const syrup = box(w, h, 0.1, syrupMat); syrup.position.z = -0.5; syrup.castShadow = false; g.add(syrup);
  const iceMat = new THREE.MeshStandardMaterial({ color: 0xbfe6ff, roughness: 0.25, flatShading: true, transparent: true, opacity: 0.95 });
  const airMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x9a9a9a, roughness: 0.1, transparent: true, opacity: 0.55, depthWrite: false });
  const fatMat = new THREE.MeshStandardMaterial({ color: 0xffd34d, roughness: 0.5, transparent: true, opacity: 1 });
  const ice = swarm(NI, new THREE.DodecahedronGeometry(1, 0), iceMat), air = swarm(NA, new THREE.SphereGeometry(1, 20, 14), airMat), fat = swarm(NF, new THREE.SphereGeometry(1, 8, 6), fatMat);
  ice.castShadow = air.castShadow = fat.castShadow = false; air.renderOrder = 2;
  ice.frustumCulled = air.frustumCulled = fat.frustumCulled = false;
  g.add(ice, fat, air);
  const bar = box(1, 0.05, 0.02, new THREE.MeshBasicMaterial({ color: 0xffffff })); bar.position.set(-w / 2 + 0.5, -h / 2 - 0.22, 0); bar.castShadow = false; g.add(bar);
  const labels = stage ? {
    scale: stage.label('0.1 mm', [-w / 2 + 1.55, -h / 2 - 0.24, 0], g),
    ice: stage.label('Ice crystal', [0, 0, 0], g), air: stage.label('Air bubble', [0, 0, 0], g),
    fat: stage.label('Fat globules', [0, 0, 0], g), syrup: stage.label('Unfrozen syrup', [0, 0, 0], g),
  } : {};
  let key = '', items = [], nI = 0, nA = 0, nF = 0, fats = [], poseKey = '';
  const OFF = { ice: [-0.27 * w, 0.29 * h], air: [0.27 * w, 0.29 * h], fat: [-0.27 * w, -0.29 * h], syrup: [0.27 * w, -0.29 * h] };

  function set({ ice: sI = 0.27, air: sA = 0.49, fat: sF = 0.06, dIce = 50, dAir = 70 } = {}) {
    const k = `${sI.toFixed(3)}|${sA.toFixed(3)}|${sF.toFixed(3)}|${dIce.toFixed(1)}|${dAir.toFixed(0)}`;
    if (k === key) return; key = k; poseKey = '';
    const rI = dIce / 200, rA = dAir / 200;                       // radius in units (100 µm each)
    const aI = clamp(sI, 0, 0.62) * A, aA = clamp(sA, 0, 0.62) * A;
    nA = 0; nI = 0; items = [];
    for (let acc = 0; nA < NA; nA++) { const r = rA * airP[nA].s, a = Math.PI * r * r; if (acc + a / 2 > aA) break; acc += a; items.push({ p: airP[nA], r, x: airP[nA].x, y: airP[nA].y, air: true }); }
    for (let acc = 0; nI < NI; nI++) { const r = rI * iceP[nI].s, a = Math.PI * r * r; if (acc + a / 2 > aI) break; acc += a; items.push({ p: iceP[nI], r, x: iceP[nI].x, y: iceP[nI].y, air: false }); }
    const n = items.length, iters = n > 260 ? 14 : 26;
    for (let it = 0; it < iters; it++) {
      for (let i = 0; i < n; i++) { const a = items[i];
        for (let j = i + 1; j < n; j++) { const b = items[j]; let dx = b.x - a.x, dy = b.y - a.y; const min = (a.r + b.r) * 1.03; if (Math.abs(dx) > min || Math.abs(dy) > min) continue;
          let d = Math.hypot(dx, dy); if (d >= min) continue; if (d < 1e-4) { dx = 0.01; dy = 0.007 * (i % 2 ? 1 : -1); d = 0.0122; }
          const push = (min - d) / 2 / d; a.x -= dx * push; a.y -= dy * push; b.x += dx * push; b.y += dy * push; } }
      for (const a of items) { const mx = Math.max(0, w / 2 - a.r), my = Math.max(0, h / 2 - a.r); a.x = clamp(a.x, -mx, mx); a.y = clamp(a.y, -my, my); }
    }
    // fat: most of it studs the bubbles, the rest floats in the syrup
    nF = Math.min(NF, Math.round(sF * 2600)); fats = [];
    const bub = items.filter((q) => q.air);
    for (let i = 0; i < nF; i++) {
      const p = fatP[i];
      if (bub.length && i % 4 !== 3 && i < bub.length * 16) { const b = bub[i % bub.length]; fats.push({ x: b.x + Math.cos(p.a) * (b.r + 0.02), y: b.y + Math.sin(p.a) * (b.r + 0.02), z: 0.05 + Math.sin(p.b) * 0.1 }); continue; }
      let x = p.x, y = p.y;
      for (const q of items) { const dx = x - q.x, dy = y - q.y, d = Math.hypot(dx, dy); if (d < q.r + 0.04) { const f = (q.r + 0.05) / Math.max(d, 1e-3); x = q.x + dx * f; y = q.y + dy * f; } }
      fats.push({ x: clamp(x, -w / 2 + 0.05, w / 2 - 0.05), y: clamp(y, -h / 2 + 0.05, h / 2 - 0.05), z: p.z });
    }
  }

  function pose({ explode = 0, show = 'all' } = {}) {
    const k = `${key}|${explode.toFixed(3)}|${show}`;
    if (k === poseKey) return; poseKey = k;
    const e = explode * explode * (3 - 2 * explode), sc = 1 - 0.5 * e;
    const at = (ph, x, y, z) => [x * sc + OFF[ph][0] * e, y * sc + OFF[ph][1] * e, z];
    let a = 0, c = 0;
    for (const q of items) { if (q.air) air.place(a++, at('air', q.x, q.y, q.p.z + 0.1), null, q.r * sc); else ice.place(c++, at('ice', q.x, q.y, q.p.z), [q.p.a, q.p.b, 0], q.r * sc * 1.08); }
    air.count = a; ice.count = c; air.done(); ice.done();
    fats.forEach((f, i) => fat.place(i, at('fat', f.x, f.y, f.z + 0.12), null, 0.032 * (1 + 0.6 * e)));
    fat.count = fats.length; fat.done();
    syrup.position.set(OFF.syrup[0] * e, OFF.syrup[1] * e, -0.5); syrup.scale.set(sc, sc, 1);
    const dim = (ph) => (show === 'all' || show === ph ? 1 : 0.12);
    iceMat.opacity = 0.95 * dim('ice'); airMat.opacity = 0.55 * dim('air') + (show === 'air' ? 0.25 : 0); fatMat.opacity = dim('fat'); syrupMat.opacity = 0.8 * dim('syrup') + (show === 'syrup' ? 0.2 : 0);
    if (labels.ice) {
      const up = 0.26 * h * sc + 0.3;
      const near = (isAir, fx, fy) => { let best = null, bd = 1e9; for (const q of items) if (q.air === isAir) { const d = Math.hypot(q.x - fx * w, q.y - fy * h); if (d < bd) { bd = d; best = q; } } return best; };
      const put = (l, ph, q, dy) => { l.visible = !!q || e > 0.5; if (e > 0.5) l.position.set(OFF[ph][0] * e, OFF[ph][1] * e + up, 0.3); else if (q) l.position.set(q.x, q.y + dy, 0.4); };
      put(labels.ice, 'ice', near(false, -0.14, 0.3), 0); put(labels.air, 'air', near(true, 0.22, 0.02), 0);
      let f0 = null, fd = 1e9; for (const f of fats) { const d = Math.hypot(f.x + 0.1 * w, f.y + 0.3 * h); if (d < fd) { fd = d; f0 = f; } }
      labels.fat.visible = !!f0 || e > 0.5; if (e > 0.5) labels.fat.position.set(OFF.fat[0] * e, OFF.fat[1] * e + up, 0.3); else if (f0) labels.fat.position.set(f0.x, f0.y + 0.28, 0.4);
      labels.syrup.visible = true; if (e > 0.5) labels.syrup.position.set(OFF.syrup[0] * e, OFF.syrup[1] * e + up, 0.3); else labels.syrup.position.set(w / 2 - 1.1, -h / 2 - 0.3, 0.4);
    }
  }
  set(); pose();
  return { group: g, set, pose, labels, w, h, count: () => ({ ice: nI, air: nA, fat: nF }) };
}

// ---------------------------------------------------------------- little models used in several chapters
const CREAM = 0xfff1d6;
export const creamMat = (color = CREAM, o = {}) => M.plastic(color, { roughness: 0.75, ...o });
// A waffle cone, tip down, with its rim at height y.
export function cone(y = 1.6, r = 0.55) {
  const g = new THREE.Group();
  const c = new THREE.Mesh(new THREE.ConeGeometry(r, y, 28, 1, true), M.matte(0xc98b45, { side: THREE.DoubleSide }));
  c.rotation.x = Math.PI; c.position.y = y / 2; c.castShadow = true; g.add(c);
  for (let i = 0; i < 5; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(r * (0.25 + i * 0.17), 0.012, 6, 28), M.matte(0x9a6328)); t.rotation.x = Math.PI / 2; t.position.y = y * (0.25 + i * 0.17); g.add(t); }
  return g;
}
// A scoop: a ball with a ruffled skirt where the scoop cut it.
export function scoop(r = 0.62, mat = creamMat()) {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(r, 36, 24), p = geo.attributes.position, rnd = rng(3);
  const bump = Array.from({ length: 40 }, () => rnd());
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), n = 1 + 0.035 * Math.sin(a * 7 + y * 9) + 0.03 * Math.sin(a * 13 + bump[i % 40] * 6) + (y < -r * 0.45 ? 0.1 * Math.sin(a * 9) + 0.08 : 0); p.setXYZ(i, x * n, y, z * n); }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat); m.castShadow = true; g.add(m); g.ball = m;
  return g;
}

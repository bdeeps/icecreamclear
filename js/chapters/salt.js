// Chapter 2: salt and ice. Why a pot of ice and salt gets far colder than ice alone, and how that
// freezes ice cream in a hand-cranked pot and kulfi in a matka.
// Bath temperature: the freezing line of salt water (CRC Handbook values, brineFreeze in physics.js),
//   10% salt −6.6 °C, 20% −16.5 °C, and no lower than the eutectic, −21.1 °C at 23.3% salt.
// The mix: its own freezing point comes from its sugar and milk salts (makeMix in physics.js, the
//   sucrose-equivalent method of Goff & Hartel with Leighton's table): about −2.6 °C for a standard mix
//   and about −3.4 °C for thick, reduced kulfi milk. Plain ice at 0 °C can never freeze either.
// Freezing: the can is one lump losing heat at U·A·(T − bath); see potRun in physics.js for the
//   sizes and the heat-transfer figures (typical values). One second on screen is four minutes.
import { M, box, beam, sphere, clamp, swarm } from '../kit.js';
import { THREE, potRun, POTS, bathTemp, EUTECTIC, rng, latheY, halfCyl, board, panelBg, axes, title, line, dot, dashH, note, COL, arrange, place, inReel, fmtC, fmtMin } from '../icecream.js';

const SPEED = 240;
const HERE = { model: { wide: [2.75, 0.3, 1.1], tall: [0, 0.2, 1.45], phone: [0, 0.15, 1.25] }, board: { wide: [-2.85, 2.9, 1], tall: [0, 10.9, 1.25], phone: null } };

export default {
  id: 'salt',
  short: 'Salt and ice',
  title: 'Salt makes ice colder than ice',
  subtitle: 'Ice alone sits at 0 °C, too warm to freeze a sweet mix. Add salt and the pot drops towards −21 °C.',
  view: { pos: [0, 6, 15], target: [0, 5.1, 0] },
  learn: `<p>Here is a puzzle. Ice cream mix does not freeze at 0 °C. Its sugar and milk salts get in the way of the water molecules trying to lock into ice, so a typical mix only <b>starts</b> to freeze at about <b>−2.6 °C</b>. This is <b>freezing-point depression</b>. A bucket of plain ice sits at 0 °C. So plain ice can never freeze ice cream.</p>
    <p>The old trick is to throw <b>salt</b> on the ice. Salt water freezes lower still: 10% salt freezes at −6.6 °C and 20% at −16.5 °C. So salty ice at 0 °C is now <i>above</i> its freezing point, and it <b>melts</b>. Melting needs heat, 334 kJ for every kilogram, and the only place to take it from is the bath itself and the can sitting in it. The slush chills itself. It can go no lower than <b>−21.1 °C</b>, reached at 23.3% salt. That lowest point is called the <b>eutectic</b>. <a href="https://glassbox.how/meltclear/">MeltClear</a> shows why salt does this, and <a href="https://glassbox.how/freezeclear/">FreezeClear</a> shows the latent heat.</p>
    <p><b>The hand-cranked pot.</b> A metal can of mix stands in a wooden tub packed with crushed ice and salt. Turning the handle spins a paddle, the <b>dasher</b>, inside the can. Heat flows from the mix, through the metal, into the cold brine (heat always runs from warm to cold: see <a href="https://glassbox.how/heatclear/">HeatClear</a>). In Gujarat this was the <b>kothi</b> method, and it is how India's first ice cream brands began.</p>
    <p><b>The kulfi matka.</b> A kulfi-wallah packs sealed metal cones of thick, sweet, slow-boiled milk into an earthen pot of ice and salt. Nothing is churned. The clay keeps the heat of the day out, and the brine does the freezing.</p>
    <p>A home freezer does the same job with a machine: see <a href="https://glassbox.how/fridgeclear/">FridgeClear</a>.</p>
    <p class="tip"><b>Try it:</b> take the salt down to zero and watch the mix refuse to freeze. Then find the least salt that freezes the pot within an hour. Switch to the kulfi matka and try again.</p>`,
  terms: [
    { t: 'Freezing-point depression', d: 'Anything dissolved in water lowers the temperature at which it freezes. Sugar does it to the mix, salt does it to the ice bath.' },
    { t: 'Brine', d: 'Salt water. The liquid in the pot is brine made by salt melting the ice.' },
    { t: 'Eutectic point', d: 'The lowest freezing point a salt and water mixture can have. For common salt: −21.1 °C at 23.3% salt.' },
    { t: 'Latent heat of fusion', d: 'The heat ice must take in to melt: 334 kJ for each kilogram. In the pot, it is taken from the brine and the can.' },
    { t: 'Dasher', d: 'The paddle that turns inside the can, scraping ice off the cold wall and stirring it into the mix.' },
    { t: 'Matka', d: 'An earthen pot. A matka of ice and salt is the kulfi-seller\'s freezer.' },
  ],
  defaults: { pot: 'crank', salt: 15 },
  controls: [
    { key: 'pot', type: 'seg', label: 'Freeze', options: [{ v: 'crank', label: 'Ice cream in a hand-cranked pot' }, { v: 'kulfi', label: 'Kulfi in a matka' }] },
    { key: 'salt', type: 'range', label: 'Salt in the ice (by weight)', min: 0, max: 30, step: 1, ends: ['no salt', '30%'], fmt: (v) => `${v}%: bath at ${fmtC(bathTemp(v))}` },
    { type: 'buttons', label: 'Clock', items: [{ label: 'Start again', act: (s) => { s._again = true; } }] },
  ],
  onChange(s, key) { if (key === 'pot' || key === 'salt') s._again = true; },
  quiz: [
    { q: 'Why can a bucket of plain ice not freeze ice cream mix?', options: ['Ice is not cold', 'Plain ice sits at 0 °C, but the sweet mix only starts to freeze at about −2.6 °C', 'The can is in the way', 'It can, it just takes longer'], answer: 1, why: 'Sugar and milk salts lower the mix\'s freezing point below 0 °C. The bath must be colder than that, and plain ice is not.' },
    { q: 'Where does the cold come from when salt is added to ice?', options: ['Salt is cold', 'A chemical reaction makes cold', 'The salt makes ice melt, and melting takes heat from the bath and the can', 'From the air'], answer: 2, why: 'Salt water freezes below 0 °C, so the ice melts. Each kilogram of melting ice takes in 334 kJ, which chills the slush.' },
    { q: 'What is the coldest that ice and common salt can get?', options: ['0 °C', 'About −5 °C', 'About −21 °C', 'About −80 °C'], answer: 2, why: 'The eutectic of salt and water is −21.1 °C at 23.3% salt. Extra salt beyond that cannot dissolve, so it does nothing.' },
  ],
  reel: [
    { ms: 5600, caption: 'Sweet mix only starts to freeze at about −2.6 °C, so plain ice at 0 °C can never freeze it.', set: { pot: 'crank', salt: 0 }, act: (s, inst) => inst.again(), spin: 0 },
    { ms: 5800, caption: 'Salt makes the ice melt, and melting takes heat: the pot chills itself towards −21 °C and the mix freezes.', set: { pot: 'crank', salt: 20 }, act: (s, inst) => inst.again(), spin: 0 },
  ],

  build({ stage, s }) {
    const root = new THREE.Group(); stage.root.add(root);
    const model = new THREE.Group(); root.add(model);
    const crankG = new THREE.Group(), matkaG = new THREE.Group(); model.add(crankG, matkaG);
    const rnd = rng(11);
    const wood = M.matte(0x8a5a33, { side: THREE.DoubleSide }), steel = M.metal(0xc9d0da, { side: THREE.DoubleSide }), clay = M.matte(0xb5613a, { side: THREE.DoubleSide });
    const brineMat = M.clear(0x7fc4ff, 0.3), mixMat = M.plastic(0xf7e2ae, { roughness: 0.7 }), kulfiMat = M.plastic(0xf3d9a0, { roughness: 0.7 });
    const iceMat = M.plastic(0xe6f5ff, { transparent: true, opacity: 0.85, roughness: 0.15 }), saltMat = M.glow(0xffffff);

    // ---- the hand-cranked pot (cut in half so the inside shows)
    crankG.add(latheY([[1.45, 0], [1.75, 2.7], [1.85, 2.7], [1.55, -0.02], [0, -0.02]], wood, { half: true }));
    for (const y of [0.45, 2.25]) { const hoop = new THREE.Mesh(new THREE.TorusGeometry(1.52 + y * 0.115, 0.04, 8, 40, Math.PI), M.metal(0x6b7280)); hoop.rotation.x = -Math.PI / 2; hoop.position.y = y; crankG.add(hoop); }
    const brineC = latheY([[0.78, 0.12], [1.42, 0.12], [1.68, 2.35], [0.78, 2.35]], brineMat, { half: true }); crankG.add(brineC);
    crankG.add(latheY([[0.74, 0.12], [0.74, 3.0]], steel, { half: true }));
    const mixC = halfCyl(0.7, 2.3, mixMat); mixC.position.y = 1.3; crankG.add(mixC);
    const dasher = new THREE.Group(); crankG.add(dasher);
    dasher.add(beam([0, 0.2, 0], [0, 3.35, 0], 0.045, M.metal(0x9aa3b2)));
    for (const sx of [-1, 1]) { const pad = box(0.5, 2.0, 0.05, M.matte(0xd9c7a0)); pad.position.set(sx * 0.38, 1.3, 0); dasher.add(pad); }
    const bar = box(3.9, 0.2, 0.34, M.metal(0x59606e)); bar.position.set(0, 3.25, 0); crankG.add(bar);
    const gearbox = box(0.5, 0.42, 0.5, M.metal(0x59606e)); gearbox.position.set(0, 3.35, 0); crankG.add(gearbox);
    const handle = new THREE.Group(); handle.position.set(1.95, 3.3, 0); crankG.add(handle);
    handle.add(beam([0, 0, 0], [0.35, 0, 0], 0.05, M.metal(0x9aa3b2)), beam([0.35, 0, 0], [0.35, -0.6, 0], 0.045, M.metal(0x9aa3b2)), beam([0.35, -0.6, 0], [0.75, -0.6, 0], 0.07, M.matte(0x5b3a22)));

    // ---- the kulfi matka
    matkaG.add(latheY([[0.55, 0], [1.35, 0.45], [1.85, 1.5], [1.65, 2.5], [1.15, 3.0], [1.3, 3.25], [1.38, 3.25], [1.24, 3.0], [1.74, 2.5], [1.94, 1.5], [1.42, 0.4], [0.6, -0.04], [0, -0.04]], clay, { half: true }));
    const cloth = new THREE.Mesh(new THREE.TorusGeometry(1.26, 0.09, 8, 40, Math.PI), M.matte(0xc0392b)); cloth.rotation.x = -Math.PI / 2; cloth.position.y = 3.02; matkaG.add(cloth);
    const brineM = latheY([[0, 0.1], [0.55, 0.1], [1.32, 0.5], [1.8, 1.5], [1.62, 2.45], [0, 2.45]], brineMat, { half: true }); matkaG.add(brineM);
    const cones = [];
    [-1.05, -0.52, 0, 0.52, 1.05].forEach((x, i) => {
      const g = new THREE.Group(); g.position.set(x, 1.55 + (i % 2) * 0.12, 0.05); g.rotation.z = (i - 2) * 0.1;
      const shell = new THREE.Mesh(new THREE.ConeGeometry(0.21, 1.25, 20, 1, true), M.metal(0xd6dbe3, { transparent: true, opacity: 0.4, side: THREE.DoubleSide })); shell.rotation.x = Math.PI;
      const fill = new THREE.Mesh(new THREE.ConeGeometry(0.17, 1.05, 20), kulfiMat); fill.rotation.x = Math.PI; fill.position.y = 0.06;
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.07, 20), M.metal(0xb9bec8)); cap.position.y = 0.66;
      g.add(fill, shell, cap); matkaG.add(g); cones.push(g);
    });

    // ---- ice lumps and salt, shared by both pots
    const NI = 90, NS = 220, lumps = swarm(NI, new THREE.BoxGeometry(1, 1, 1), iceMat), grains = swarm(NS, new THREE.BoxGeometry(1, 1, 1), saltMat);
    lumps.castShadow = grains.castShadow = false; lumps.frustumCulled = grains.frustumCulled = false; model.add(lumps, grains);
    const seeds = Array.from({ length: Math.max(NI, NS) }, () => [rnd(), rnd(), rnd(), rnd(), rnd()]);
    function fill(pot, melt, salt) {
      const inner = pot === 'crank' ? 0.85 : 0.0, top = pot === 'crank' ? 2.25 : 2.35, outer = (y) => (pot === 'crank' ? 1.38 + y * 0.1 : y < 0.5 ? 0.5 + y * 1.5 : y < 1.5 ? 1.25 + (y - 0.5) * 0.45 : 1.7 - (y - 1.5) * 0.16);
      for (let i = 0; i < NI; i++) {
        const [a, b, c, d, e] = seeds[i], y = 0.25 + b * (top - 0.3), ro = outer(y) - 0.12, r = inner + Math.sqrt(a) * Math.max(0.05, ro - inner), th = Math.PI * (0.5 + c);   // back half
        let x = Math.sin(th) * r, z = Math.cos(th) * r - 0.02;
        if (pot === 'kulfi' && Math.abs(z) < 0.3 && y > 0.9 && y < 2.3) z -= 0.35;
        lumps.place(i, [x, y, z], [d * 3, e * 3, a * 3], (0.2 + d * 0.16) * (1 - 0.45 * melt));
      }
      lumps.done();
      const n = Math.round(clamp(salt / 30, 0, 1) * NS);
      for (let i = 0; i < NS; i++) {
        const [a, b, c] = seeds[i], y = top - 0.02 - b * 0.5, ro = outer(y) - 0.1, r = inner + Math.sqrt(c) * Math.max(0.05, ro - inner), th = Math.PI * (0.5 + a);
        grains.place(i, [Math.sin(th) * r, y + 0.05, Math.cos(th) * r + 0.03], null, i < n ? 0.035 : 0.0001);
      }
      grains.done();
    }

    let run = potRun(s.pot, s.salt), runKey = `${s.pot}|${s.salt}`, tSim = 0, hold = 0, spin = 0, key = '';
    const tEnd = () => (run.done < 0 ? 60 * 60 : clamp(run.done * 1.5, 30 * 60, 120 * 60));
    const b = board(root, 5.6, 4.0, 680, 486, (g, w, h) => {
      panelBg(g, w, h);
      const end = tEnd() / 60, Tf = run.mix.Tf;
      title(g, 'Temperature in the pot', `${POTS[s.pot].name} · ${s.salt}% salt`);
      const step = end > 90 ? 30 : end > 45 ? 15 : 10, xT = []; for (let v = 0; v <= end + 0.01; v += step) xT.push(v);
      const a = axes(g, w, h, { xMax: end, yMin: -24, yMax: 10, y1: 84, xTicks: xT, yTicks: [-20, -10, 0, 10], xFmt: (v) => v + ' min', yFmt: (v) => (v < 0 ? '−' + -v : v) + '°' });
      dashH(g, a.x0, a.x1, a.Y(Tf), `mix starts to freeze: ${fmtC(Tf)}`, COL.warm);
      line(g, [[0, run.Tb], [end, run.Tb]], a.X, a.Y, COL.cold, 4);
      note(g, `ice and salt: ${fmtC(run.Tb)}`, a.x0 + 10, a.Y(run.Tb) + (run.Tb < -18 ? -10 : 26), COL.cold, 'bold 20px sans-serif');
      const pts = run.pts.filter(([t]) => t <= end * 60).map(([t, T]) => [t / 60, T]);
      line(g, pts, a.X, a.Y, COL.pink, 5);
      const t = Math.min(tSim, end * 60); dot(g, a.X(t / 60), a.Y(run.at(t)), '#fff', 8);
      if (run.done >= 0) { g.strokeStyle = COL.good; g.setLineDash([4, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(a.X(run.done / 60), a.y0); g.lineTo(a.X(run.done / 60), a.y1); g.stroke(); g.setLineDash([]); note(g, `set: ${fmtMin(run.done)}`, Math.min(a.X(run.done / 60) + 8, a.x1 - 130), a.y1 + 22, COL.good, 'bold 20px sans-serif'); }
      else note(g, 'The bath is not cold enough to set it.', a.x0 + 10, a.y1 + 22, COL.bad, 'bold 20px sans-serif');
    });
    const lab = {
      bath: stage.label('', [-1.2, 0.75, 0.6], model, 'hot'),
      mix: stage.label('', [0.9, 3.95, 0], model),
      crank: stage.label('Crank turns the dasher', [1.6, 2.35, 0.4], crankG),
      can: stage.label('Metal can', [-0.2, 0.55, 0.8], crankG),
      mould: stage.label('Sealed kulfi moulds', [0, 0.6, 0.9], matkaG),
    };
    const lay = {}, cA = new THREE.Color(), liquid = new THREE.Color(0xf7e2ae), frozen = new THREE.Color(0xffffff);
    const api = { again() { tSim = 0; hold = 0; s._again = false; } };
    return {
      ...api,
      update(dt, st) {
        dt = Math.max(0, dt);
        const mode = arrange(stage, lay, (tl) => { place(model, tl, HERE.model); place(b, tl, HERE.board); }), big = mode === 'wide';
        const rk = `${st.pot}|${st.salt}`; if (rk !== runKey) { runKey = rk; run = potRun(st.pot, st.salt); api.again(); }
        if (st._again) api.again();
        const end = tEnd();
        if (tSim < end) tSim = Math.min(end, tSim + dt * SPEED); else { hold += dt; if (hold > 4 && !inReel()) api.again(); }
        const T = run.at(tSim), fz = run.mix.frozen(T), isCrank = st.pot === 'crank';
        crankG.visible = isCrank; matkaG.visible = !isCrank;
        lab.crank.visible = lab.can.visible = isCrank && big; lab.mould.visible = !isCrank && big;
        const stiff = clamp(fz / 0.5, 0, 1);
        spin += dt * 5 * (1 - 0.75 * stiff); dasher.rotation.y = spin; handle.rotation.x = spin * 1.6;
        cA.copy(liquid).lerp(frozen, clamp(fz / 0.6, 0, 1)); mixMat.color.copy(cA); kulfiMat.color.copy(cA);
        brineMat.opacity = 0.16 + 0.3 * clamp(tSim / 900, 0, 1) * clamp(st.salt / 8, 0.15, 1);
        const melt = clamp(tSim / end, 0, 1) * clamp(st.salt / 10, 0.1, 1);
        const fk = `${st.pot}|${st.salt}|${melt.toFixed(2)}`; if (fk !== key) { key = fk; fill(st.pot, melt, st.salt); }
        lab.bath.element.innerHTML = `Ice${st.salt > 0 ? ' + salt' : ''}: <b>${fmtC(run.Tb)}</b>`;
        lab.mix.position.set(isCrank ? 0.95 : 0.2, isCrank ? 3.95 : 3.75, 0);
        lab.mix.element.innerHTML = `${isCrank ? 'Mix' : 'Kulfi'} <b>${fmtC(T)}</b> · ${fz <= 0 ? 'still liquid' : `${(fz * 100).toFixed(0)}% of its water is ice`}`;
        if (Math.round(tSim / 30) !== b._t) { b._t = Math.round(tSim / 30); b.redraw(); }
      },
      readout: (st) => {
        const T = run.at(tSim), fz = run.mix.frozen(T), ratio = st.salt > 0 ? (100 - st.salt) / st.salt : 0;
        return `<div class="big">${run.done < 0 ? 'It will not freeze' : `Set in ${fmtMin(run.done)}`}</div>
          <div class="row"><span>Ice ${st.salt > 0 ? 'and salt ' : ''}bath</span><b>${fmtC(run.Tb)}</b></div>
          <div class="row"><span>${st.pot === 'crank' ? 'Mix' : 'Kulfi'} starts to freeze at</span><b>${fmtC(run.mix.Tf)}</b></div>
          <div class="row"><span>${st.pot === 'crank' ? 'Mix' : 'Kulfi'} now, after ${fmtMin(tSim)}</span><b>${fmtC(T)}</b></div>
          <div class="row"><span>Water turned to ice</span><b>${(fz * 100).toFixed(0)}%</b></div>
          <div class="row"><span>Salt to ice</span><b>${st.salt > 0 ? `1 part to ${ratio.toFixed(ratio < 10 ? 1 : 0)}` : 'none'}</b></div>
          <small>${st.salt > EUTECTIC.pct ? 'Past 23.3% the extra salt cannot dissolve: −21.1 °C is the floor. ' : ''}"Set" means half the water is ice. Heat-flow figures are typical values. One second = 4 minutes.</small>`;
      },
    };
  },
};

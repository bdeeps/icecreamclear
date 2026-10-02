// Chapter 3: churn while freezing. The scraped-surface ("barrel") freezer.
// What the machine does (Goff, Guelph Ice Cream Technology e-Book, "Freezing/whipping"): mix at about
//   4 °C is pumped through a tube jacketed with boiling refrigerant (ammonia, about −30 °C). Blades on
//   a spinning dasher scrape the ice off the wall. A continuous freezer does the job in about 30
//   seconds, a batch freezer in 10 to 15 minutes, and the ice cream leaves at about −5 to −6 °C with
//   about half its water frozen. Our freezing curve (makeMix in physics.js) gives 47% at −5.5 °C.
// Crystal size: crystalDraw() and hardened() in physics.js, a fit through textbook ranges (25 to 35 µm
//   at the draw, 40 to 55 µm after hardening, 100 µm and more when nothing is scraped). The tongue
//   starts to feel crystals above about 50 µm. A dasher that is too fast warms the mix by friction and
//   gives slightly bigger crystals (Drewett & Hartel 2007).
// The barrel is drawn 3.4 units long; a real one is roughly 1 m.
import { M, rod, latheX, box, beam, tube, clamp, swarm } from '../kit.js';
import { THREE, makeMix, STANDARD, shares, crystalDraw, hardened, HARDEN, SMOOTH_LIMIT, rng, makeMicro, board, panelBg, axes, title, line, dot, dashH, note, COL, arrange, place, SPOT, fmtC } from '../icecream.js';

const mix = makeMix(STANDARD), DRAW_T = -5.5;
const sizes = (s) => { const d = crystalDraw(s.wall, s.rpm, mix.Tf); return { draw: d, hard: hardened(d, s.harden) }; };
const verdict = (d) => (d <= SMOOTH_LIMIT ? { word: 'Smooth', cls: 'ok' } : d <= 80 ? { word: 'A little coarse', cls: 'no' } : { word: 'Icy and crunchy', cls: 'no' });

export default {
  id: 'churn',
  short: 'Churn while freezing',
  title: 'Churn while it freezes',
  subtitle: 'Freeze fast and scrape the wall, and you get millions of tiny crystals instead of a few big ones.',
  view: { pos: [0, 6, 15], target: [0, 5.1, 0] },
  learn: `<p>Put ice cream mix in an ice tray and you get a sweet, milky <b>ice block</b>. The water freezes slowly, a few crystals start, and they grow long and large. Your tongue can feel a crystal once it is bigger than about <b>50 micrometres</b>. Above that, ice cream tastes icy and coarse. Below it, smooth.</p>
    <p>So the whole art is to make <b>many small crystals</b> instead of a few big ones. Two things do it. <b>Freeze fast</b>: a very cold wall starts crystals quickly, and the more crystals share the water, the smaller each one stays. And <b>scrape</b>: ice forms on the cold wall first, so blades shave it off as a snow of tiny seeds and stir it into the mix, many times a second.</p>
    <p>That is the <b>scraped-surface freezer</b>. Mix at 4 °C is pumped into a steel barrel. Around the barrel runs a jacket of boiling refrigerant at about −30 °C. Inside turns the <b>dasher</b>, carrying scraper blades. In a factory the mix is in the barrel for only about <b>30 seconds</b>. It comes out at about −5 °C, like soft serve, with about <b>half its water frozen</b>. A hand-cranked pot does the same thing slowly, which is why its ice cream is a bit coarser.</p>
    <p>Speed has a limit. A dasher that spins too fast heats the mix by friction, melts the smallest seeds, and the crystals come out slightly bigger.</p>
    <p><b>Hardening.</b> The soft ice cream is packed and rushed into a blast freezer at −30 to −40 °C. No new crystals form now. The rest of the water freezes onto the crystals already there, so they grow a little. Harden slowly, in a home freezer, and they grow more.</p>
    <p class="tip"><b>Try it:</b> stop the dasher and see what an unscraped wall does. Then warm the refrigerant to −12 °C. Find the dasher speed that gives the smallest crystals.</p>`,
  terms: [
    { t: 'Scraped-surface freezer', d: 'A chilled barrel with blades that shave ice off its wall as fast as it forms. Also called a barrel freezer.' },
    { t: 'Nucleation', d: 'The birth of a new crystal. Fast freezing gives many births, so the crystals stay small.' },
    { t: 'Draw temperature', d: 'The temperature of ice cream leaving the freezer, about −5 to −6 °C.' },
    { t: 'Hardening', d: 'Quickly freezing the packed ice cream to −18 °C or below, without stirring.' },
    { t: 'Refrigerant', d: 'The liquid that boils in the jacket and carries heat away. Ice cream plants often use ammonia.' },
  ],
  defaults: { wall: -30, rpm: 200, harden: 'blast' },
  controls: [
    { key: 'wall', type: 'range', label: 'Refrigerant in the jacket', min: -35, max: -10, step: 1, ends: ['−35 °C', '−10 °C'], fmt: (v) => fmtC(v, 0) },
    { key: 'rpm', type: 'range', label: 'Dasher speed', min: 0, max: 400, step: 10, ends: ['stopped', '400 turns a minute'], fmt: (v) => (v ? `${v} turns a minute` : 'stopped: no scraping') },
    { key: 'harden', type: 'seg', label: 'Then harden in', options: [{ v: 'blast', label: 'Blast freezer, −35 °C' }, { v: 'home', label: 'Home freezer, −18 °C' }] },
  ],
  quiz: [
    { q: 'Why does fast freezing give smoother ice cream?', options: ['It adds more sugar', 'Many crystals start at once, so each one stays small', 'It removes the water', 'It melts the fat'], answer: 1, why: 'Fast freezing starts a huge number of crystals. They share the same water, so none can grow large.' },
    { q: 'What do the scraper blades do?', options: ['Cut the fat', 'Shave ice off the cold wall and stir it into the mix as tiny seeds', 'Add air only', 'Warm the mix'], answer: 1, why: 'Ice forms on the cold wall first. Scraping keeps the wall clear and scatters the shavings through the mix.' },
    { q: 'About how big can an ice crystal be before your tongue feels it as icy?', options: ['1 micrometre', 'About 50 micrometres', '1 millimetre', '1 centimetre'], answer: 1, why: 'Around 50 micrometres, half the width of a hair. Good ice cream keeps its crystals at or below that.' },
  ],
  reel: [
    { ms: 5600, caption: 'Blades scrape ice off a wall at −30 °C, scattering millions of tiny crystals smaller than 50 micrometres.', set: { wall: -30, harden: 'blast' }, anim: { rpm: [0, 200] }, spin: 0 },
  ],

  build({ stage, s }) {
    const root = new THREE.Group(); stage.root.add(root);
    const model = new THREE.Group(); root.add(model);
    const micro = makeMicro(root, { stage, seed: 21 });
    micro.labels.fat.element.textContent = ''; micro.labels.syrup.element.textContent = '';
    const rnd = rng(4), CY = 1.75, L = 1.7;
    const mach = new THREE.Group(); mach.position.y = CY; model.add(mach);
    const cut = { phiStart: Math.PI / 2, phiLength: Math.PI };
    mach.add(latheX([[-L, 1.06], [L, 1.06], [L, 1.12], [-L, 1.12]], M.metal(0xaab2bf, { side: THREE.DoubleSide }), cut));       // outer cover
    const refMat = M.clear(0x49a6ff, 0.7); mach.add(latheX([[-L, 0.8], [L, 0.8], [L, 1.05], [-L, 1.05], [-L, 0.8]], refMat, cut));   // refrigerant jacket
    mach.add(latheX([[-L, 0.74], [L, 0.74], [L, 0.79], [-L, 0.79]], M.metal(0xdfe4ea, { side: THREE.DoubleSide }), cut));       // barrel wall
    const mixMat = M.clear(0xfff0cf, 0.5); mach.add(latheX([[-L, 0], [-L, 0.73], [L, 0.73], [L, 0]], mixMat, cut));
    for (const x of [-L, L]) { const cap = latheX([[x - 0.04, 0.2], [x - 0.04, 1.12], [x + 0.04, 1.12], [x + 0.04, 0.2]], M.metal(0x8d96a5, { side: THREE.DoubleSide }), cut); mach.add(cap); }
    const dasher = new THREE.Group(); mach.add(dasher);
    dasher.add(rod(-L - 0.5, L, 0.2, 0.2, M.metal(0x9aa3b2)));
    for (const a of [0, Math.PI]) {
      const g = new THREE.Group(); g.rotation.x = a; dasher.add(g);
      const blade = box(2 * L - 0.25, 0.05, 0.26, M.metal(0xf2c14e)); blade.position.set(0, 0.66, 0.06); blade.rotation.x = 0.5; g.add(blade);
      for (const x of [-1.2, 0, 1.2]) g.add(beam([x, 0.18, 0], [x, 0.62, 0], 0.035, M.metal(0x9aa3b2)));
    }
    const motor = box(0.7, 0.8, 0.8, M.plastic(0x3b4252)); motor.position.set(-L - 0.85, 0, 0); mach.add(motor);
    mach.add(tube([[-L + 0.25, -1.9, 0.3], [-L + 0.25, -1.0, 0.3], [-L + 0.25, -0.6, 0.15]], 0.09, M.metal(0xb9bec8)));        // mix in
    const outMat = M.plastic(0xfff3da, { roughness: 0.8 });
    const out = tube([[L, 0, 0], [L + 0.35, 0, 0], [L + 0.6, -0.25, 0], [L + 0.62, -1.0, 0]], 0.16, outMat); mach.add(out);
    const tub = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 0.6, 28, 1, true), M.clear(0xcfe8ff, 0.3)); tub.position.set(L + 0.62, -1.42, 0); mach.add(tub);
    const heap = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 12), outMat); heap.scale.y = 0.6; heap.position.set(L + 0.62, -1.3, 0); mach.add(heap);
    for (const x of [-1.2, 1.2]) { const leg = box(0.16, CY - 1.0, 1.4, M.metal(0x59606e)); leg.position.set(x, (CY - 1.1) / 2, -0.2); model.add(leg); }
    // ice seeds: born on the wall, swept round and along
    const NS = 260, seeds = swarm(NS, new THREE.DodecahedronGeometry(1, 0), M.plastic(0xffffff, { roughness: 0.2 })); seeds.castShadow = false; seeds.frustumCulled = false; mach.add(seeds);
    const sd = Array.from({ length: NS }, () => ({ u: rnd(), a: rnd() * 6.283, r: rnd(), w: 0.6 + rnd() * 0.8 }));
    const layerMat = M.plastic(0xffffff, { transparent: true, opacity: 0.9, side: THREE.DoubleSide });
    const layer = latheX([[-L + 0.05, 0.6], [L - 0.05, 0.6], [L - 0.05, 0.735], [-L + 0.05, 0.735], [-L + 0.05, 0.6]], layerMat, cut); mach.add(layer);
    const lab = {
      ref: stage.label('', [0.2, CY + 1.35, 0], model, 'hot'),
      inn: stage.label('Mix in, 4 °C', [-L + 0.25, CY - 2.05, 0.3], model),
      out: stage.label('', [L + 0.6, CY - 2.0, 0], model),
      blade: stage.label('Scraper blade', [-0.4, CY - 0.95, 0.9], model),
    };

    const b = board(root, 5.6, 4.0, 680, 486, (g, w, h) => {
      panelBg(g, w, h);
      title(g, 'Crystal size against dasher speed', `refrigerant at ${fmtC(s.wall, 0)} · hardened in a ${s.harden === 'blast' ? 'blast' : 'home'} freezer`);
      const a = axes(g, w, h, { xMax: 400, yMax: 200, y1: 84, xTicks: [0, 100, 200, 300, 400], yTicks: [0, 50, 100, 150, 200], yFmt: (v) => v + ' µm', xLabel: 'dasher turns a minute' });
      const cur = (fn) => { const p = []; for (let r = 0; r <= 400; r += 10) p.push([r, Math.min(200, fn(r))]); return p; };
      g.fillStyle = 'rgba(92,225,169,.10)'; g.fillRect(a.x0, a.Y(SMOOTH_LIMIT), a.x1 - a.x0, a.y0 - a.Y(SMOOTH_LIMIT));
      dashH(g, a.x0, a.x1, a.Y(SMOOTH_LIMIT), '', COL.good); note(g, 'the tongue feels crystals above about 50 µm', a.x1 - 400, a.Y(SMOOTH_LIMIT) - 40, COL.good, '19px sans-serif');
      line(g, cur((r) => crystalDraw(s.wall, r, mix.Tf)), a.X, a.Y, COL.cold, 3, [8, 6]);
      line(g, cur((r) => hardened(crystalDraw(s.wall, r, mix.Tf), s.harden)), a.X, a.Y, COL.pink, 5);
      const z = sizes(s); dot(g, a.X(s.rpm), a.Y(Math.min(200, z.hard)), '#fff', 9);
      note(g, 'solid: after hardening · dashed: leaving the barrel', a.x0 + 10, a.y1 + 22, COL.dim, '19px sans-serif');
    });
    const lay = {}; let key = '', ang = 0, tt = 0;
    return {
      update(dt, st) {
        dt = Math.max(0, dt); tt += dt;
        const mode = arrange(stage, lay, (tl) => { place(model, tl, { wide: [3.05, 0.75, 0.92], tall: [-0.25, 0.1, 1.15], phone: [3.0, 0.9, 0.68] }); place(micro, tl, SPOT.micro); place(b, tl, SPOT.board); }), big = mode === 'wide';
        lab.blade.visible = lab.inn.visible = big; lab.out.visible = lab.ref.visible = mode !== 'phone';
        const z = sizes(st), v = verdict(z.hard), sh = shares(mix, 100, -18);
        ang += dt * (st.rpm / 60) * 6.283 * 0.12; dasher.rotation.x = ang;
        refMat.color.setHSL(0.58, 0.9, clamp(0.35 + (st.wall + 35) / 60, 0.3, 0.75));
        // seeds: the faster the freezing, the more of them; with no scraping they stay as a layer on the wall
        const rate = clamp((mix.Tf - st.wall) / 32, 0.1, 1), scraping = st.rpm > 0, n = scraping ? Math.round(NS * (0.35 + 0.65 * rate)) : 0;
        const flow = 0.1 + 0.06 * tt, sz = clamp(z.draw / 30, 0.7, 3) * 0.022;
        for (let i = 0; i < NS; i++) {
          const d = sd[i], u = (d.u + flow * d.w) % 1, a = d.a + ang * d.w, r = 0.71 - 0.45 * d.r * u;
          seeds.place(i, [-L + 0.1 + u * (2 * L - 0.2), Math.cos(a) * r, Math.sin(a) * r], [a, d.a, 0], i < n * (0.25 + 0.75 * u) ? sz * (0.6 + u) : 0.0001);
        }
        seeds.done();
        layer.visible = !scraping;
        micro.set({ ice: sh.ice, air: sh.air, fat: sh.fat, dIce: clamp(z.hard, 20, 200), dAir: 70 });
        micro.pose({ explode: 0, show: 'all' });
        micro.labels.fat.visible = micro.labels.syrup.visible = false; micro.labels.scale.visible = big;
        micro.labels.ice.element.innerHTML = `Ice crystals: about <b>${z.hard.toFixed(0)} µm</b>`;
        micro.labels.air.visible = false;
        lab.ref.element.innerHTML = `Refrigerant jacket <b>${fmtC(st.wall, 0)}</b>`;
        lab.out.element.innerHTML = scraping ? `Out at ${fmtC(DRAW_T)}` : 'Ice builds on the wall';
        const k = `${st.wall}|${st.rpm}|${st.harden}`; if (k !== key) { key = k; b.redraw(); }
      },
      readout: (st) => {
        const z = sizes(st), v = verdict(z.hard);
        return `<div class="big"><span class="${v.cls}">${v.word}</span>: ${z.hard.toFixed(0)} µm crystals</div>
          <div class="row"><span>Leaving the barrel</span><b>${z.draw.toFixed(0)} µm</b></div>
          <div class="row"><span>After hardening (${st.harden === 'blast' ? 'blast' : 'home'} freezer)</span><b>${z.hard.toFixed(0)} µm</b></div>
          <div class="row"><span>Wall is colder than the mix by</span><b>${(mix.Tf - st.wall).toFixed(0)} °C</b></div>
          <div class="row"><span>Water frozen at the draw, ${fmtC(DRAW_T)}</span><b>${(mix.frozen(DRAW_T) * 100).toFixed(0)}%</b></div>
          <div class="row"><span>Water frozen once hard, ${fmtC(HARDEN[st.harden].T, 0)}</span><b>${(mix.frozen(HARDEN[st.harden].T) * 100).toFixed(0)}%</b></div>
          <small>${st.rpm === 0 ? 'With the dasher stopped, ice coats the wall, insulates it, and grows as a few large crystals. ' : st.rpm > 300 ? 'Friction from a very fast dasher warms the mix and melts the smallest crystals. ' : ''}Crystal sizes are a fit through textbook ranges, not a measurement.</small>`;
      },
    };
  },
};

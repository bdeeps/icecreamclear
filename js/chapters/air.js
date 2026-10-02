// Chapter 4: air and overrun.
// Overrun (%) = (volume of ice cream − volume of mix) ÷ volume of mix × 100, and the weight of a litre
//   is the mix density ÷ (1 + overrun/100) (Goff, Guelph e-Book, "Overrun calculations"). Mix density
//   from Goff's formula: about 1.10 kg/L for the standard mix.
// FSSAI 2.1.14 sets the least weight of a litre: 525 g for ice cream, 475 g for medium fat and low
//   fat ice cream. For the standard mix that caps overrun at about 109%.
// Fat and air: whipping knocks part-solid fat globules into each other. They stick without merging
//   (partial coalescence) and form a shell round each bubble (Goff, "Colloidal aspects of ice cream
//   structure"). With little fat the bubbles are fewer-coated and larger; the bubble sizes drawn for
//   low-fat mixes show that trend and are not measured values.
import { M, box, clamp } from '../kit.js';
import { THREE, makeMix, shares, litreWeight, airShare, maxOverrun, FSSAI_WEIGHT, makeMicro, board, panelBg, axes, title, line, dot, dashH, note, COL, arrange, place, SPOT } from '../icecream.js';

const mixOf = (s) => makeMix({ fat: s.fat, sugar: 15, msnf: 11, stab: 0.3 });
const limit = (fat) => (fat >= 10 ? FSSAI_WEIGHT : 475);
const kind = (fat) => (fat >= 10 ? 'Ice cream' : fat > 2.5 ? 'Medium fat ice cream' : 'Low fat ice cream');
const bubble = (fat) => clamp(70 + (10 - fat) * 5, 62, 120);

export default {
  id: 'air',
  short: 'Air and overrun',
  title: 'Half of it is air',
  subtitle: 'Whipping doubles the volume. Sticky clumps of milk fat hold every bubble in place.',
  view: { pos: [0, 6, 15], target: [0, 5.1, 0] },
  learn: `<p>While the dasher scrapes, it also <b>whips air in</b>. The amount of air has a name, <b>overrun</b>: the extra volume as a share of the mix you started with. Turn 1 litre of mix into 2 litres of ice cream and the overrun is <b>100%</b>. Half of every scoop is then air.</p>
    <p>Air is not a cheat. With no air at all, frozen mix is a hard, cold brick. Bubbles make it light, soft enough to scoop, and less numbing on the tongue. But air is also free, so the law sets a floor. In India, FSSAI says a litre of ice cream must weigh at least <b>525 grams</b>. For a typical mix that allows a little over 100% overrun. Premium tubs and gelato hold far less air, which is why they feel heavy.</p>
    <p><b>What holds the bubbles?</b> Milk fat. After the mix is aged in the cold, each fat globule is part liquid and part solid. When the dasher knocks two together they stick, but the solid part stops them merging into one drop. This is <b>partial coalescence</b>. Chains and clumps of half-joined globules gather around each bubble and brace it, like scaffolding. Milk proteins coat the rest of the bubble's skin.</p>
    <p>It is the first step of making butter, stopped early. Keep whipping warm cream and the clumps grow until the fat separates out: that is <a href="https://glassbox.how/butterclear/">ButterClear</a>. An emulsifier in the mix loosens the protein skin on the globules so they clump just enough.</p>
    <p class="tip"><b>Try it:</b> slide the overrun from 0 to 150% and watch the tub and the scale. Find where the tub drops below the legal weight. Then take the fat down to 2% and see what happens to the bubbles.</p>`,
  terms: [
    { t: 'Overrun', d: 'The air whipped in, as extra volume: (ice cream volume − mix volume) ÷ mix volume × 100%.' },
    { t: 'Partial coalescence', d: 'Part-solid fat globules sticking together in clumps without merging into one drop.' },
    { t: 'Foam', d: 'Gas bubbles held in a liquid or solid. Ice cream is a frozen foam.' },
    { t: 'Emulsifier', d: 'An ingredient that loosens the protein skin on fat globules, so they can clump and hold air.' },
    { t: 'Ageing', d: 'Resting the mix at about 4 °C for some hours so the fat partly sets and can form clumps.' },
  ],
  defaults: { overrun: 100, fat: 10 },
  controls: [
    { key: 'overrun', type: 'range', label: 'Overrun (air whipped in)', min: 0, max: 150, step: 5, ends: ['no air', '150%'], fmt: (v) => `${v}%` },
    { key: 'fat', type: 'range', label: 'Milk fat in the mix', min: 1, max: 16, step: 1, ends: ['1%', '16%'], fmt: (v) => `${v}%` },
  ],
  quiz: [
    { q: 'One litre of mix is whipped into 1.8 litres of ice cream. What is the overrun?', options: ['18%', '45%', '80%', '180%'], answer: 2, why: 'The extra volume is 0.8 litres on 1 litre of mix, so the overrun is 80%.' },
    { q: 'What keeps the air bubbles from escaping?', options: ['Sugar crystals', 'Clumps of part-solid fat globules and milk protein around each bubble', 'The cone', 'Salt'], answer: 1, why: 'Partly joined fat globules form a scaffold around each bubble. Proteins coat the rest of its surface.' },
    { q: 'Why does the law set a minimum weight for a litre of ice cream?', options: ['To limit how much of it can be air', 'To make it colder', 'To add more sugar', 'To save packaging'], answer: 0, why: 'Air costs nothing. FSSAI requires at least 525 g per litre, which caps the overrun at a little over 100% for a typical mix.' },
  ],
  reel: [
    { ms: 5400, caption: 'Whipping doubles the volume: at 100% overrun, half of every scoop is air held by clumps of milk fat.', set: { fat: 10 }, anim: { overrun: [0, 100] }, spin: 0 },
  ],

  build({ stage, s }) {
    const root = new THREE.Group(); stage.root.add(root);
    const model = new THREE.Group(); root.add(model);
    const micro = makeMicro(root, { stage, seed: 33 });
    const glass = () => M.clear(0xcfe8ff, 0.16), R = 0.62, LITRE = 1.25;      // one litre is 1.25 units tall in these jars
    const jar = (h) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.04, R + 0.04, h, 36, 1, true), glass()); m.position.y = h / 2; return m; };
    const jug = new THREE.Group(), tubG = new THREE.Group(); jug.position.x = -1.35; tubG.position.x = 0.95; model.add(jug, tubG);
    jug.add(jar(LITRE * 1.25)); tubG.add(jar(LITRE * 2.62));
    const mixMat = M.plastic(0xf7e2ae, { roughness: 0.5 }), iceMat = M.plastic(0xfff6e6, { roughness: 0.85 });
    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(R, R, LITRE, 36), mixMat); liquid.position.y = LITRE / 2 + 0.02; jug.add(liquid);
    const cream = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 1, 36), iceMat); tubG.add(cream);
    const tickMat = M.glow(0xffffff, { transparent: true, opacity: 0.7 });
    for (let i = 1; i <= 2; i++) { const t = box(0.3, 0.02, 0.02, tickMat); t.position.set(R + 0.2, LITRE * i, 0); tubG.add(t); stage.label(`${i} L`, [R + 0.65, LITRE * i, 0], tubG); }
    for (const g of [jug, tubG]) { const base = box(1.7, 0.08, 1.7, M.metal(0x59606e)); base.position.y = -0.04; g.add(base); }
    const lab = { mix: stage.label('', [0, LITRE * 1.25 + 0.3, 0], jug), ice: stage.label('', [0, 0, 0], tubG, 'hot'), to: stage.label('whip + freeze →', [-0.2, 0.55, 0.9], model) };

    const b = board(root, 5.6, 4.0, 680, 486, (g, w, h) => {
      panelBg(g, w, h);
      const mix = mixOf(s), lim = limit(s.fat);
      title(g, 'Weight of one litre of ice cream', `mix weighs ${(mix.rho * 1000).toFixed(0)} g a litre · ${s.fat}% milk fat`);
      const a = axes(g, w, h, { xMax: 150, yMax: 1200, y1: 84, xTicks: [0, 50, 100, 150], yTicks: [0, 300, 600, 900, 1200], xFmt: (v) => v + '%', yFmt: (v) => v + ' g', xLabel: 'overrun' });
      g.fillStyle = 'rgba(255,107,107,.12)'; g.fillRect(a.x0, a.Y(lim), a.x1 - a.x0, a.y0 - a.Y(lim));
      dashH(g, a.x0, a.x1, a.Y(lim), '', COL.bad); note(g, `FSSAI: at least ${lim} g a litre`, a.x0 + 10, a.Y(lim) + 24, COL.bad, 'bold 19px sans-serif');
      const pts = []; for (let o = 0; o <= 150; o += 5) pts.push([o, litreWeight(mix, o)]);
      line(g, pts, a.X, a.Y, COL.pink, 5);
      const wt = litreWeight(mix, s.overrun); dot(g, a.X(s.overrun), a.Y(wt), wt >= lim ? '#fff' : COL.bad, 9);
      note(g, `${wt.toFixed(0)} g`, Math.min(a.X(s.overrun) + 14, a.x1 - 80), a.Y(wt) - 14, COL.text, 'bold 22px sans-serif');
    });
    const lay = {}; let key = '';
    return {
      update(dt, st) {
        dt = Math.max(0, dt);
        const mode = arrange(stage, lay, (tl) => { place(model, tl, { wide: [3.25, 0.35, 1.1], tall: [0.1, 0.15, 1.25], phone: [2.65, 0.2, 0.95] }); place(micro, tl, SPOT.micro); place(b, tl, SPOT.board); }, [lab.to, lab.mix]), big = mode === 'wide';
        const mix = mixOf(st), sh = shares(mix, st.overrun, -14), vol = 1 + st.overrun / 100, hgt = LITRE * vol;
        cream.scale.y = hgt; cream.position.y = hgt / 2 + 0.02;
        lab.ice.position.set(0, hgt + 0.3, 0);
        lab.mix.element.innerHTML = `1 L of mix · ${(mix.rho * 1000).toFixed(0)} g`;
        lab.ice.element.innerHTML = mode === 'phone' ? `<b>${vol.toFixed(2)} L</b>` : `<b>${vol.toFixed(2)} L</b> of ice cream · same ${(mix.rho * 1000).toFixed(0)} g`;
        micro.set({ ice: sh.ice, air: sh.air, fat: sh.fat, dIce: 45, dAir: bubble(st.fat) });
        micro.pose({ explode: 0, show: 'all' });
        micro.labels.ice.visible = micro.labels.syrup.visible = false; micro.labels.scale.visible = big;
        micro.labels.air.element.innerHTML = `Air: <b>${(sh.air * 100).toFixed(0)}%</b> of the volume`;
        micro.labels.fat.element.innerHTML = 'Fat clumps brace the bubble';
        const k = `${st.overrun}|${st.fat}`; if (k !== key) { key = k; b.redraw(); }
      },
      readout: (st) => {
        const mix = mixOf(st), wt = litreWeight(mix, st.overrun), lim = limit(st.fat), ok = wt >= lim;
        return `<div class="big">${(airShare(st.overrun) * 100).toFixed(0)}% air by volume</div>
          <div class="row"><span>1 litre of mix becomes</span><b>${(1 + st.overrun / 100).toFixed(2)} L</b></div>
          <div class="row"><span>A litre of it weighs</span><b>${wt.toFixed(0)} g</b></div>
          <div class="row"><span>A 100 mL scoop weighs</span><b>${(wt / 10).toFixed(0)} g</b></div>
          <div class="row"><span>${kind(st.fat)}: legal weight</span><b class="${ok ? 'ok' : 'no'}">${ok ? 'yes' : 'too light'} (min ${lim} g/L)</b></div>
          <div class="row"><span>Most overrun the rule allows</span><b>${maxOverrun(mix, lim).toFixed(0)}%</b></div>
          <small>${st.fat < 6 ? 'With little fat there are fewer clumps to brace the bubbles, so they merge into bigger ones. ' : ''}Weights by Goff's mix-density formula. Limits: FSSAI regulation 2.1.14.</small>`;
      },
    };
  },
};

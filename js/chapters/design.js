// Chapter 5: design your scoop. A simulator: sugar, fat, air, serving temperature and the way it
// was frozen give the firmness, the crystal size and how long a scoop lasts.
// Freezing curve: makeMix().frozen(T) in physics.js, the sucrose-equivalent method of Goff & Hartel
//   (Leighton's table). Milk solids-not-fat are held at 11% and stabiliser at 0.3%.
// Firmness: scoopability() in physics.js, an index built from the ice share (a guide, not a measured
//   hardness). Crystal size: crystalDraw() and hardened() with three ways of freezing:
//   still in a home freezer (no scraping, wall at −18 °C), a home churner (bowl at about −22 °C, about 60
//   turns a minute, hardened in the home freezer) and a factory (−30 °C, 200 turns a minute, blast
//   hardened). More water means more ice to share out, so the size is scaled by the water content;
//   that scaling is ours. Melting: meltTime() in physics.js, a 60 mL scoop in still air at 30 °C.
// Names and weights: FSSAI 2.1.14 (ice cream at least 10% milk fat and 525 g/L; medium fat more than
//   2.5% and less than 10%, low fat at most 2.5%, both at least 475 g/L).
import { M, box, clamp } from '../kit.js';
import { THREE, makeMix, STANDARD, shares, litreWeight, crystalDraw, hardened, scoopability, meltTime, SMOOTH_LIMIT, makeMicro, scoop, creamMat, latheY, board, panelBg, axes, title, line, dot, dashH, note, COL, arrange, place, SPOT, fmtC, fmtMin } from '../icecream.js';

const std = makeMix(STANDARD);
const mixOf = (s) => makeMix({ fat: s.fat, sugar: s.sugar, msnf: 11, stab: 0.3 });
const HOW = { still: { wall: -18, rpm: 0, harden: 'home', name: 'frozen still' }, home: { wall: -22, rpm: 60, harden: 'home', name: 'home churner' }, plant: { wall: -30, rpm: 200, harden: 'blast', name: 'factory freezer' } };
export function crystalOf(s, mix = mixOf(s)) {
  const h = HOW[s.how];
  return hardened(crystalDraw(h.wall, h.rpm, mix.Tf), h.harden) * clamp(mix.water / std.water, 0.8, 1.3) * (1 - 0.01 * (s.fat - 10));
}
const kind = (fat) => (fat >= 10 ? 'Ice cream' : fat > 2.5 ? 'Medium fat ice cream' : 'Low fat ice cream');
const feel = (d) => (d <= SMOOTH_LIMIT ? { word: 'smooth', cls: 'ok' } : d <= 80 ? { word: 'a little coarse', cls: 'no' } : { word: 'icy', cls: 'no' });

export default {
  id: 'design',
  short: 'Design your scoop',
  title: 'Design your own scoop',
  subtitle: 'Sugar, fat, air and temperature decide whether it scoops, how smooth it is and how fast it melts.',
  view: { pos: [0, 6, 15], target: [0, 5.1, 0] },
  learn: `<p>Every ice cream is a balance. Here are the dials a maker turns.</p>
    <p><b>Sugar</b> is not only for sweetness. It is the <b>antifreeze</b>. More sugar means a lower freezing point and less ice at any temperature, so the scoop is softer. Too little and you get a brick. Too much and it never firms up. Follow the curve on the board: it shows how much of the water is ice at each temperature.</p>
    <p><b>Fat</b> gives richness, carries flavour, and braces the air bubbles. Under FSSAI rules a product needs at least <b>10% milk fat</b> to be sold simply as ice cream. Between 2.5% and 10% it is medium fat ice cream, and at 2.5% or less, low fat.</p>
    <p><b>Air</b> makes it light and soft. A scoop with more air has less ice to melt, so it turns soft sooner in your hand, though the foam can hold its shape for a while. A dense scoop like kulfi holds far more ice and lasts longer.</p>
    <p><b>Temperature</b> decides how much of the water is ice right now. A home freezer at −18 °C makes most ice creams hard. Parlours serve from cabinets at about −12 to −14 °C. Soft serve comes out at about −5 °C.</p>
    <p><b>How it was frozen</b> sets the crystal size, as in the last chapter. Frozen still, the crystals are large and the result is icy.</p>
    <p class="tip"><b>Try it:</b> build a standard scoop, then cut the sugar to 8% and try to scoop it at −18 °C. Next, make a soft serve: low fat, 40% air, served at −5 °C. Can you design a scoop that lasts 40 minutes on a 30 °C day?</p>`,
  terms: [
    { t: 'Freezing curve', d: 'A chart of how much of the water in a mix is ice at each temperature.' },
    { t: 'Freeze concentration', d: 'As ice forms, the sugar is left in less and less water, so the remaining syrup gets harder to freeze.' },
    { t: 'Serving temperature', d: 'About −12 to −14 °C for scooped ice cream, and about −5 °C for soft serve.' },
    { t: 'Total solids', d: 'Everything in the mix that is not water. FSSAI asks for at least 36% in ice cream.' },
    { t: 'Meltdown', d: 'How a scoop softens and loses its shape as its ice melts and its foam collapses.' },
  ],
  defaults: { sugar: 15, fat: 10, overrun: 100, T: -14, how: 'plant' },
  controls: [
    { key: 'sugar', type: 'range', label: 'Sugar', min: 6, max: 26, step: 1, ends: ['6%', '26%'], fmt: (v) => `${v}%` },
    { key: 'fat', type: 'range', label: 'Milk fat', min: 1, max: 18, step: 1, ends: ['1%', '18%'], fmt: (v) => `${v}% · ${kind(v).toLowerCase()}` },
    { key: 'overrun', type: 'range', label: 'Overrun (air)', min: 0, max: 150, step: 5, ends: ['no air', '150%'], fmt: (v) => `${v}%` },
    { key: 'T', type: 'range', label: 'Served at', min: -24, max: -3, step: 0.5, ends: ['−24 °C', '−3 °C'], fmt: (v) => fmtC(v) },
    { key: 'how', type: 'seg', label: 'Frozen in', options: [{ v: 'still', label: 'A tray, no churning' }, { v: 'home', label: 'Home churner' }, { v: 'plant', label: 'Factory freezer' }] },
  ],
  quiz: [
    { q: 'You cut the sugar in a recipe by half. Straight from the freezer, the ice cream will be:', options: ['Softer', 'Harder, because more of its water freezes', 'Exactly the same', 'Warmer'], answer: 1, why: 'Sugar lowers the freezing point. With less of it, more water turns to ice at the same temperature, so the scoop is harder.' },
    { q: 'Under FSSAI rules, what must a product have to be sold simply as "ice cream"?', options: ['At least 10% milk fat', 'At least 50% air', 'No sugar', 'Vegetable oil'], answer: 0, why: 'Ice cream needs at least 10% milk fat. With less it must be called medium fat or low fat ice cream.' },
    { q: 'Why is soft serve soft?', options: ['It has no ice at all', 'It is served at about −5 °C, when only about half its water is ice', 'It is mostly fat', 'It is whipped by hand'], answer: 1, why: 'It is drawn straight from the freezer barrel at about −5 °C and never hardened, so far less of its water is frozen.' },
  ],
  reel: [
    { ms: 5600, caption: 'Sugar is the antifreeze: even at −18 °C about a fifth of the water stays liquid, so a spoon can get in.', set: { sugar: 15, fat: 10, overrun: 100, how: 'plant' }, anim: { T: [-5, -18] }, spin: 0 },
  ],

  build({ stage, s }) {
    const root = new THREE.Group(); stage.root.add(root);
    const model = new THREE.Group(); root.add(model);
    const micro = makeMicro(root, { stage, seed: 51 });
    // a steel dish with one scoop, and the puddle it leaves
    model.add(latheY([[0, 0.5], [0.3, 0.5], [0.42, 0.06], [0.75, 0.0], [0.75, 0.04], [0.45, 0.1], [0.36, 0.52], [1.5, 0.95], [1.62, 1.25], [1.56, 1.25], [1.45, 1.02], [0.3, 0.6], [0, 0.6]], M.metal(0xc9d0da, { side: THREE.DoubleSide })));
    const mat = creamMat(0xfff1d6), sc = scoop(1.0, mat); model.add(sc);
    const puddle = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.05, 40), creamMat(0xf7e2ae, { roughness: 0.3 })); puddle.position.y = 0.72; model.add(puddle);
    const lab = { scoop: stage.label('', [0, 3.2, 0], model, 'hot') };

    const b = board(root, 5.6, 4.0, 680, 486, (g, w, h) => {
      panelBg(g, w, h);
      const mix = mixOf(s);
      title(g, 'How much of the water is ice', `your mix: ${s.sugar}% sugar, ${s.fat}% fat · dashed: standard mix`);
      const a = axes(g, w, h, { xMin: -25, xMax: 0, yMax: 100, y1: 84, xTicks: [-25, -20, -15, -10, -5, 0], yTicks: [0, 25, 50, 75, 100], xFmt: (v) => (v < 0 ? '−' + -v : v) + '°', yFmt: (v) => v + '%' });
      const cur = (m) => { const p = []; for (let T = -25; T <= 0.01; T += 0.5) p.push([T, m.frozen(T) * 100]); return p; };
      line(g, cur(std), a.X, a.Y, 'rgba(255,255,255,.45)', 3, [8, 6]);
      line(g, cur(mix), a.X, a.Y, COL.ice, 5);
      for (const [T, txt] of [[-18, 'home freezer'], [-13, 'parlour'], [-5, 'soft serve']]) { g.strokeStyle = 'rgba(255,255,255,.25)'; g.setLineDash([3, 6]); g.beginPath(); g.moveTo(a.X(T), a.y0); g.lineTo(a.X(T), a.y1 + 20); g.stroke(); g.setLineDash([]); note(g, txt, a.X(T) - g.measureText(txt).width / 2 + 10, a.y1 + 14, COL.dim, '17px sans-serif'); }
      const f = mix.frozen(s.T) * 100; dot(g, a.X(clamp(s.T, -25, 0)), a.Y(f), '#fff', 9);
      note(g, `${f.toFixed(0)}% at ${fmtC(s.T)}`, clamp(a.X(s.T) - 60, a.x0 + 6, a.x1 - 170), Math.max(a.y1 + 44, a.Y(f) - 18), COL.text, 'bold 22px sans-serif');
      note(g, `starts to freeze at ${fmtC(mix.Tf)}`, a.x0 + 10, a.y0 - 14, COL.warm, '19px sans-serif');
    });
    const lay = {}; let key = '', sag = 0;
    return {
      update(dt, st) {
        dt = Math.max(0, dt);
        const mode = arrange(stage, lay, (tl) => { place(model, tl, { wide: [3.2, 0.5, 1.05], tall: [0, 0.3, 1.2], phone: [3.1, 0.6, 0.95] }); place(micro, tl, SPOT.micro); place(b, tl, SPOT.board); }), big = mode === 'wide';
        const mix = mixOf(st), sh = shares(mix, st.overrun, st.T), sv = scoopability(sh), d = crystalOf(st, mix);
        sag += (sv.sag - sag) * (1 - Math.exp(-4 * dt));
        const puff = Math.cbrt((1 + st.overrun / 100) / 2);                  // the same mix whipped to more or less volume
        sc.scale.set(puff * (1 + 0.45 * sag), puff * (1 - 0.6 * sag), puff * (1 + 0.45 * sag)); sc.position.y = 0.72 + puff * (1 - 0.6 * sag) * 0.82;
        puddle.scale.set(0.3 + 1.1 * sag, 1, 0.3 + 1.1 * sag); puddle.visible = sag > 0.05;
        mat.color.setHex(0xfff1d6).lerp(new THREE.Color(0xf2d9a0), clamp((st.fat - 6) / 24, 0, 0.5));
        lab.scoop.position.y = sc.position.y + puff * 1.05 + 0.35;
        lab.scoop.element.innerHTML = `${sv.word}`;
        micro.set({ ice: sh.ice, air: sh.air, fat: sh.fat, dIce: clamp(d, 20, 200), dAir: 70 });
        micro.pose({ explode: 0, show: 'all' });
        micro.labels.air.visible = micro.labels.fat.visible = micro.labels.syrup.visible = false; micro.labels.scale.visible = big;
        micro.labels.ice.element.innerHTML = `Crystals about <b>${d.toFixed(0)} µm</b>`;
        const k = `${st.sugar}|${st.fat}|${st.T}`; if (k !== key) { key = k; b.redraw(); }
      },
      readout: (st) => {
        const mix = mixOf(st), sh = shares(mix, st.overrun, st.T), sv = scoopability(sh), d = crystalOf(st, mix), fl = feel(d);
        const wt = litreWeight(mix, st.overrun), lim = st.fat >= 10 ? 525 : 475;
        return `<div class="big"><span class="${sv.tone}">${sv.word}</span></div>
          <div class="row"><span>Starts to freeze at</span><b>${fmtC(mix.Tf)}</b></div>
          <div class="row"><span>Water that is ice at ${fmtC(st.T)}</span><b>${(sh.frozen * 100).toFixed(0)}%</b></div>
          <div class="row"><span>Ice / air, by volume</span><b>${(sh.ice * 100).toFixed(0)}% / ${(sh.air * 100).toFixed(0)}%</b></div>
          <div class="row"><span>Crystals (${HOW[st.how].name})</span><b class="${fl.cls}">${d.toFixed(0)} µm, ${fl.word}</b></div>
          <div class="row"><span>60 mL scoop melts at 30 °C in</span><b>${fmtMin(meltTime(mix, st.overrun, st.T))}</b></div>
          <div class="row"><span>FSSAI name</span><b>${kind(st.fat)}${wt < lim ? ', but too light' : ''}</b></div>
          <small>Total solids ${mix.solids.toFixed(0)}% (the rule asks for ${st.fat >= 10 ? 36 : st.fat > 2.5 ? 30 : 26}%). Firmness and crystal size are model estimates.</small>`;
      },
    };
  },
};

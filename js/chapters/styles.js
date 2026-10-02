// Chapter 6: the family (ice cream, gelato, soft serve, kulfi, sorbet, frozen dessert) and what a
// trip out of the freezer does to any of them.
// Typical figures for each style are in STYLES (physics.js): soft serve 3 to 6% fat, 33 to 45% air,
//   served near −4 °C; gelato 6 to 9% fat, 25 to 35% air, served at −14 to −11 °C (the ranges quoted on
//   Wikipedia's "Soft serve" and "Gelato" pages); kulfi is reduced milk frozen still, so it holds almost
//   no air. Water frozen, weight per litre and melting time are computed from those by physics.js.
// Law: FSSAI regulation 2.1.14 (ice cream, kulfi, softy ice cream: milk fat only) and 2.1.15 (frozen
//   dessert: vegetable oil or fat allowed, declared on the label).
// Heat shock: heatShock() in physics.js. Warming melts the smallest crystals; on cooling the water
//   lands on the survivors, so there are fewer, bigger crystals (Goff, "Ice cream shelf-life"). The
//   amount of growth per trip is our estimate from the freezing curve, not a measured rate.
// Safety: FSSAI's frozen-storage rule is −18 °C or colder (read from summaries of the Schedule 4
//   hygiene rules, not the regulation text). Melted ice cream should not be refrozen and eaten.
import { M, box, beam, clamp } from '../kit.js';
import { THREE, makeMix, shares, litreWeight, heatShock, scoopability, meltTime, STYLES, SMOOTH_LIMIT, makeMicro, cone, scoop, creamMat, latheY, board, panelBg, title, note, COL, arrange, place, SPOT, fmtC, fmtMin } from '../icecream.js';

const ORDER = ['icecream', 'gelato', 'soft', 'kulfi', 'sorbet', 'dessert'];
const MIX = Object.fromEntries(ORDER.map((k) => [k, makeMix(STYLES[k].mix)]));
const FREEZER = -18;
// Crystal size and air left after `n` trips that warm the tub to Tw and refreeze it.
function trips(k, n, Tw) {
  const st = STYLES[k], mix = MIX[k]; let d = st.d, air = st.overrun, melted = false; const path = [d];
  for (let i = 0; i < n; i++) { const r = heatShock(mix, d, FREEZER, Tw); d = r.d; if (r.melted) { melted = true; air *= 0.35; } path.push(d); }
  return { d, overrun: air, melted, path };
}
const feel = (d) => (d <= SMOOTH_LIMIT ? { word: 'Smooth', cls: 'ok' } : d <= 90 ? { word: 'A little coarse', cls: 'no' } : { word: 'Icy', cls: 'no' });

export default {
  id: 'styles',
  short: 'Kulfi, gelato and the refreeze',
  title: 'Kulfi, gelato and the refreeze',
  subtitle: 'One recipe idea, six results. And why a tub that thawed and froze again turns icy.',
  view: { pos: [0, 6, 15], target: [0, 5.1, 0] },
  learn: `<p>Change the dials and you get the whole family.</p>
    <p><b>Kulfi</b> is the oldest in India. Milk is boiled down slowly until it is thick and nutty (the browning is the same chemistry as in <a href="https://glassbox.how/gheeclear/">GheeClear</a>), sweetened, poured into cones and frozen <b>without churning</b>. No air goes in, so kulfi is <b>dense</b>: a litre weighs about twice as much as a litre of ice cream. All that ice in a small space takes a lot of heat to melt, so kulfi lasts on its stick. Its crystals are larger than churned ice cream's, which gives its firm, slightly grainy bite.</p>
    <p><b>Gelato</b> has less fat and much less air than ice cream, and is served a little warmer, so it tastes intense and soft. <b>Soft serve</b> is ice cream that skipped hardening: it leaves the barrel at about −5 °C with only half its water frozen. <b>Sorbet</b> has no milk at all, only fruit, sugar and water.</p>
    <p><b>Ice cream or frozen dessert?</b> Under FSSAI rules, ice cream, kulfi and softy must get their fat from <b>milk</b>. A product made with <b>vegetable oil or fat</b> instead is a <b>frozen dessert</b>, and the pack must say so. The structure is the same four things: only the fat is different. Which is which was argued in the Bombay High Court in 2017, in a dispute between ice cream and frozen dessert makers over an advertisement. Read the label: it is the law's answer.</p>
    <p><b>The refreeze problem.</b> Every time a tub warms up, on the ride home or on the kitchen counter, its <b>smallest crystals melt first</b>. Back in the freezer, that water does not make new crystals. It freezes onto the big ones that survived. Fewer, bigger crystals: this is <b>recrystallisation</b>, and it is why an old tub is crunchy. If the tub melts right through, the air escapes too, and it refreezes as a hard, icy slab.</p>
    <p><b>Keep it safe.</b> FSSAI's rule for frozen food is storage at <b>−18 °C or colder</b>. Buy ice cream last, take it straight home, and do not refreeze and eat ice cream that has fully melted: melted mix is warm, sweet milk, which germs like.</p>
    <p>Two last things. <b>Brain freeze</b> is a short, harmless headache set off when something very cold touches the roof of your mouth; it passes in under a minute or two. And <b>liquid nitrogen</b> ice cream is the fast-freezing idea taken to its limit: at −196 °C the mix freezes in seconds, so the crystals are tiny.</p>
    <p class="tip"><b>Try it:</b> pick kulfi and compare its weight per litre and melting time with ice cream. Then send a tub of ice cream on six trips out of the freezer, warming to −8 °C each time. Now let it reach +2 °C just once.</p>`,
  terms: [
    { t: 'Kulfi', d: 'Slow-reduced, sweetened milk frozen in moulds without churning. Dense, with almost no air.' },
    { t: 'Frozen dessert', d: 'Under FSSAI rules, a product like ice cream but made with vegetable oil or fat. It must be labelled as such.' },
    { t: 'Recrystallisation', d: 'Ice crystals changing in storage: small ones vanish and big ones grow, so the texture turns coarse.' },
    { t: 'Heat shock', d: 'A warm-up and refreeze. Each one melts the smallest crystals and feeds the largest.' },
    { t: 'Ostwald ripening', d: 'The slow growth of large crystals at the expense of small ones, even at a steady temperature.' },
    { t: 'Cold chain', d: 'Keeping frozen food at −18 °C or colder all the way from factory to home.' },
  ],
  defaults: { style: 'icecream', trips: 0, warm: -8 },
  controls: [
    { key: 'style', type: 'seg', label: 'Which one', options: ORDER.map((k) => ({ v: k, label: STYLES[k].name })) },
    { key: 'trips', type: 'range', label: 'Trips out of the freezer', min: 0, max: 10, step: 1, ends: ['none', '10'], fmt: (v) => (v ? `${v} warm-up${v > 1 ? 's' : ''}` : 'fresh') },
    { key: 'warm', type: 'range', label: 'Each trip warms it to', min: -15, max: 4, step: 1, ends: ['−15 °C', '4 °C'], fmt: (v, s) => `${fmtC(v, 0)}${v > MIX[s.style].Tf ? ': fully melted' : ''}` },
  ],
  quiz: [
    { q: 'Why does kulfi melt more slowly than a scoop of ice cream the same size?', options: ['It contains salt', 'It has almost no air, so the same size holds far more ice to melt', 'It is colder inside', 'It has no sugar'], answer: 1, why: 'Kulfi is not churned, so it is dense. The same volume holds far more ice, and each kilogram of ice needs 334 kJ to melt.' },
    { q: 'Under FSSAI rules, a product whose fat is vegetable oil must be sold as:', options: ['Ice cream', 'Kulfi', 'Frozen dessert', 'Gelato'], answer: 2, why: 'Ice cream, kulfi and softy must use milk fat. With vegetable oil or fat it is a frozen dessert, and the label must say so.' },
    { q: 'Why does a tub that thawed a little and refroze turn icy?', options: ['It gains water from the air', 'Small crystals melt, and on refreezing their water joins the big crystals', 'The sugar disappears', 'The fat freezes'], answer: 1, why: 'Refreezing does not start new crystals. The melted water lands on the survivors, so the crystals end up fewer and bigger.' },
  ],
  reel: [
    { ms: 5200, caption: 'Kulfi is never churned, so it holds almost no air: twice the weight in the same bite, and it melts slowly.', set: { style: 'kulfi', trips: 0, warm: -8 }, spin: 0 },
    { ms: 5600, caption: 'Each trip out of the freezer melts the smallest crystals and grows the biggest, so an old tub turns icy.', set: { style: 'icecream', warm: -6 }, anim: { trips: [0, 10] }, spin: 0 },
  ],

  build({ stage, s }) {
    const root = new THREE.Group(); stage.root.add(root);
    const model = new THREE.Group(); root.add(model);
    const micro = makeMicro(root, { stage, seed: 77 });
    const G = Object.fromEntries(ORDER.map((k) => { const g = new THREE.Group(); model.add(g); return [k, g]; }));
    const cup = (col) => latheY([[0, 0], [0.62, 0], [0.92, 1.0], [0.86, 1.0], [0.58, 0.06], [0, 0.06]], M.matte(col, { side: THREE.DoubleSide }));
    // ice cream and frozen dessert: a scoop on a cone
    for (const [k, col] of [['icecream', 0xfff1d6], ['dessert', 0xf7b6c8]]) { const c = cone(2.2, 0.72); const b = scoop(0.86, creamMat(col)); b.position.y = 2.75; G[k].add(c, b); }
    const tag = box(1.5, 0.5, 0.04, M.matte(0xf4f4f4)); tag.position.set(1.55, 1.2, 0.2); tag.rotation.z = -0.12; G.dessert.add(tag);
    stage.label('FROZEN DESSERT<br>contains vegetable oil', [1.55, 1.2, 0.3], G.dessert, 'hot');
    // gelato: a paper cup, a low heap pressed with a spade
    { const c = cup(0xe8f1f5); c.scale.setScalar(1.5); const h = scoop(0.95, creamMat(0xb9d48b)); h.scale.y = 0.62; h.position.y = 1.7; const sp = box(0.26, 1.3, 0.04, M.plastic(0xff8fa3)); sp.position.set(0.5, 2.5, 0.1); sp.rotation.z = -0.35; G.gelato.add(c, h, sp); }
    // soft serve: a swirl
    { const c = cone(2.2, 0.72); G.soft.add(c); const m = creamMat(0xfffaf0); for (let i = 0; i < 6; i++) { const R = 0.62 - i * 0.1, t = new THREE.Mesh(new THREE.TorusGeometry(R, 0.2 - i * 0.012, 14, 36), m); t.rotation.x = Math.PI / 2 + 0.12; t.rotation.z = i * 0.9; t.position.y = 2.35 + i * 0.27; t.castShadow = true; G.soft.add(t); } const tip = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.45, 16), m); tip.position.y = 4.05; tip.rotation.z = 0.25; G.soft.add(tip); }
    // kulfi: a cone on a stick, tapering upwards, with pistachio flecks
    { const m = creamMat(0xf1dfb6); const k = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.66, 2.3, 28), m); k.position.y = 2.55; k.castShadow = true; const top = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 10, 0, 6.283, 0, Math.PI / 2), m); top.position.y = 3.7; G.kulfi.add(k, top, beam([0, 0.25, 0], [0, 1.5, 0], 0.07, M.matte(0xd9b98a)));
      for (let i = 0; i < 26; i++) { const a = i * 2.4, y = 1.6 + (i / 26) * 2.0, r = 0.66 - ((y - 1.4) / 2.3) * 0.32, f = box(0.07, 0.05, 0.03, M.matte(0x7da453)); f.position.set(Math.cos(a) * r, y, Math.sin(a) * r); f.rotation.y = -a; G.kulfi.add(f); } }
    // sorbet: a glass coupe with a mango scoop
    { G.sorbet.add(latheY([[0.7, 0], [0.7, 0.05], [0.08, 0.12], [0.08, 1.0], [1.0, 1.9], [1.05, 1.9], [0.12, 0.95], [0.12, 0.15]], M.clear(0xcfe8ff, 0.35))); const b = scoop(0.8, creamMat(0xffb23f)); b.position.y = 2.1; G.sorbet.add(b); }

    const lab = { name: stage.label('', [0, 4.5, 0], model, 'hot') };
    const b = board(root, 5.6, 4.0, 680, 486, (g, w, h) => {
      panelBg(g, w, h);
      title(g, 'The family, by the numbers', 'typical values · weight and melting time computed');
      const cols = [[20, ''], [205, 'Fat'], [290, 'Air'], [385, 'Served'], [490, 'g / L'], [585, 'Melts in']];
      g.font = 'bold 19px sans-serif'; g.fillStyle = COL.dim; cols.forEach(([x, t]) => g.fillText(t, x, 96));
      ORDER.forEach((k, i) => {
        const st = STYLES[k], mix = MIX[k], y = 132 + i * 40, on = k === s.style;
        if (on) { g.fillStyle = 'rgba(245,158,230,.18)'; g.fillRect(10, y - 26, w - 20, 38); }
        g.font = on ? 'bold 21px sans-serif' : '21px sans-serif'; g.fillStyle = on ? COL.pink : COL.text;
        [st.name, `${st.mix.fat}%`, `${airPct(st.overrun)}%`, fmtC(st.serve, 0), litreWeight(mix, st.overrun).toFixed(0), fmtMin(meltTime(mix, st.overrun, st.serve))].forEach((t, j) => g.fillText(t, cols[j][0], y));
      });
      const tr = trips(s.style, Math.round(s.trips), s.warm), x0 = 30, x1 = w - 30, y0 = h - 28, top = h - 96, mx = 130;
      note(g, `Crystal size after each trip (warmed to ${fmtC(s.warm, 0)})`, 20, top - 14, COL.text, 'bold 19px sans-serif');
      const bw = (x1 - x0) / 11;
      tr.path.forEach((d, i) => { const hh = (Math.min(d, mx) / mx) * (y0 - top); g.fillStyle = d <= SMOOTH_LIMIT ? COL.good : d <= 90 ? COL.warm : COL.bad; g.fillRect(x0 + i * bw + 4, y0 - hh, bw - 8, hh); g.fillStyle = '#fff'; g.font = '16px sans-serif'; g.fillText(d.toFixed(0), x0 + i * bw + 8, y0 - hh - 4); });
      g.fillStyle = COL.dim; g.font = '16px sans-serif'; g.fillText('µm', x1 - 22, y0 + 20);
    });
    function airPct(o) { return Math.round((o / (100 + o)) * 100); }
    const lay = {}; let key = '';
    return {
      update(dt, st) {
        dt = Math.max(0, dt);
        const mode = arrange(stage, lay, (tl) => { place(model, tl, { wide: [3.2, 0.3, 1.0], tall: [0, 0.1, 1.0], phone: [3.1, 0.2, 0.95] }); place(micro, tl, SPOT.micro); place(b, tl, SPOT.board); }), big = mode === 'wide', narrow = mode === 'phone';
        ORDER.forEach((k) => { G[k].visible = k === st.style; });
        G.dessert.traverse((o) => { if (o.isCSS2DObject) o.visible = st.style === 'dessert' && !narrow; });
        const sty = STYLES[st.style], mix = MIX[st.style], tr = trips(st.style, Math.round(st.trips), st.warm), sh = shares(mix, tr.overrun, sty.serve);
        lab.name.element.innerHTML = `${sty.name} · ${sty.fatKind}`;
        micro.set({ ice: sh.ice, air: sh.air, fat: sh.fat, dIce: clamp(tr.d, 20, 200), dAir: 70 });
        micro.pose({ explode: 0, show: 'all' });
        micro.labels.fat.visible = micro.labels.syrup.visible = false; micro.labels.air.visible = sh.air > 0.1; micro.labels.scale.visible = big;
        micro.labels.ice.element.innerHTML = `Crystals about <b>${tr.d.toFixed(0)} µm</b>`;
        const k = `${st.style}|${Math.round(st.trips)}|${st.warm}`; if (k !== key) { key = k; b.redraw(); }
      },
      readout: (st) => {
        const sty = STYLES[st.style], mix = MIX[st.style], n = Math.round(st.trips), tr = trips(st.style, n, st.warm), sh = shares(mix, tr.overrun, sty.serve), f = feel(tr.d);
        return `<div class="big">${sty.name}: <span class="${f.cls}">${f.word.toLowerCase()}</span></div>
          <div class="row"><span>Fat</span><b>${sty.mix.fat}% ${sty.fatKind === 'no fat' ? '' : sty.fatKind}</b></div>
          <div class="row"><span>Air, by volume</span><b>${(sh.air * 100).toFixed(0)}%</b></div>
          <div class="row"><span>A litre weighs</span><b>${litreWeight(mix, tr.overrun).toFixed(0)} g</b></div>
          <div class="row"><span>Water that is ice at ${fmtC(sty.serve, 0)}</span><b>${(sh.frozen * 100).toFixed(0)}%</b></div>
          <div class="row"><span>Crystals ${n ? `after ${n} trip${n > 1 ? 's' : ''}` : 'when fresh'}</span><b class="${f.cls}">${tr.d.toFixed(0)} µm</b></div>
          <div class="row"><span>60 mL melts at 30 °C in</span><b>${fmtMin(meltTime(mix, tr.overrun, sty.serve))}</b></div>
          <small>${tr.melted ? 'It melted right through: the air escaped and it refroze still, as a coarse slab. Do not eat ice cream that has melted and been refrozen. ' : ''}${sty.law}.</small>`;
      },
    };
  },
};

// Chapter 1: what is in a scoop. Ice cream is four things at once: ice crystals, air bubbles, fat
// globules and an unfrozen sugar syrup.
// Shares by volume come from shares() in physics.js for a standard mix (10% milk fat, 11% milk
// solids-not-fat, 15% sugar, 0.3% stabiliser, 63.7% water) at 100% overrun. At −14 °C the model gives
// about 27% ice, 49% air, 6% fat and 18% syrup; Clarke (The Science of Ice Cream, RSC 2004) quotes
// about 30% ice, 50% air, 5% fat and 15% matrix. Sizes and counts are Goff's (Guelph Ice Cream
// Technology e-Book): in one gram about 8 million ice crystals of 50 µm, 8 million air bubbles of 70 µm
// and 1.5 million million fat globules of about 1 µm. Milk: about 87% water (cow), FSSAI/NDRI typical.
import { M, clamp } from '../kit.js';
import { THREE, makeMix, shares, STANDARD, makeMicro, cone, scoop, board, panelBg, title, bars, note, COL, arrange, place, link, SPOT, fmtC } from '../icecream.js';

const mix = makeMix(STANDARD);
const pct = (v) => (v * 100).toFixed(0) + '%';

export default {
  id: 'scoop',
  short: 'What is in a scoop',
  title: 'What is in a scoop of ice cream?',
  subtitle: 'Four things at once: ice crystals, air bubbles, fat globules and a syrup that never freezes.',
  view: { pos: [0, 6, 15], target: [0, 5.1, 0] },
  learn: `<p>Ice cream looks like one smooth thing. Under a microscope it is <b>four things at once</b>. There are <b>ice crystals</b>, each about 50 micrometres across, half the width of a hair. There are <b>air bubbles</b>, a little bigger. There are <b>fat globules</b>, tiny balls of milk fat about 1 micrometre across. And between them all runs a thick, sweet <b>syrup that is still liquid</b>, even in the freezer.</p>
    <p>By volume, a typical scoop is about <b>half air</b>, a quarter to a third ice, about a twentieth fat, and the rest syrup. Slide the temperature and watch: the colder it is, the more of the water has turned to ice, but it never all freezes. That leftover syrup is why you can push a spoon into ice cream at −14 °C but not into an ice cube.</p>
    <p><b>It all starts as milk.</b> Milk is about 87% water, with fat, proteins, milk sugar (lactose) and minerals. Ice cream needs four of milk's gifts: the <b>fat</b>, the <b>proteins</b> that wrap the fat and the bubbles, the water that becomes <b>ice</b>, and added <b>sugar</b>. The sibling boxes use other parts: <a href="https://glassbox.how/curdclear/">CurdClear</a>, <a href="https://glassbox.how/paneerclear/">PaneerClear</a> and <a href="https://glassbox.how/cheeseclear/">CheeseClear</a> turn the casein protein into a gel, and <a href="https://glassbox.how/butterclear/">ButterClear</a> and <a href="https://glassbox.how/gheeclear/">GheeClear</a> collect the fat.</p>
    <p><b>The mix.</b> A dairy blends milk, cream, milk powder, sugar and a pinch of <b>stabiliser</b> (plant gums that thicken the syrup) and <b>emulsifier</b>. A typical mix is 10 to 16% milk fat, 9 to 12% other milk solids and 14 to 18% sugars. It is <b>pasteurised</b> (for example 80 °C for 25 seconds) to kill germs, <b>homogenised</b> (squeezed through a tiny gap so the fat globules end up under 1 micrometre), then <b>aged</b> cold for at least four hours so the fat inside each globule partly sets hard. Only then is it frozen.</p>
    <p class="tip"><b>Try it:</b> pull the scoop apart with the first slider and compare the four piles. Then warm the scoop from −25 °C to −4 °C and watch the ice shrink and the syrup grow.</p>`,
  terms: [
    { t: 'Ice crystal', d: 'A tiny piece of pure frozen water. In smooth ice cream they are about 50 micrometres across or less.' },
    { t: 'Overrun', d: 'The air whipped in, given as extra volume. 100% overrun means the mix doubled in volume, so half the scoop is air.' },
    { t: 'Fat globule', d: 'A ball of milk fat about 1 micrometre across, wrapped in a thin skin of protein.' },
    { t: 'Serum (unfrozen syrup)', d: 'The liquid left between the crystals: water with sugar, milk protein and salts dissolved in it.' },
    { t: 'Milk solids-not-fat', d: 'Everything in milk except water and fat: proteins, lactose and minerals. MSNF for short.' },
    { t: 'Micrometre (µm)', d: 'A thousandth of a millimetre. A human hair is roughly 70 to 100 µm thick.' },
  ],
  defaults: { explode: 0, show: 'all', T: -14 },
  controls: [
    { key: 'explode', type: 'range', label: 'Pull the scoop apart', min: 0, max: 1, step: 0.01, ends: ['together', 'four piles'], fmt: (v) => (v < 0.05 ? 'as it is' : v > 0.95 ? 'sorted' : 'sorting') },
    { key: 'show', type: 'seg', label: 'Light up', options: [{ v: 'all', label: 'All' }, { v: 'ice', label: 'Ice' }, { v: 'air', label: 'Air' }, { v: 'fat', label: 'Fat' }, { v: 'syrup', label: 'Syrup' }] },
    { key: 'T', type: 'range', label: 'Temperature of the scoop', min: -25, max: -4, step: 0.5, ends: ['−25 °C', '−4 °C'], fmt: (v) => fmtC(v) },
  ],
  quiz: [
    { q: 'Roughly how much of a typical scoop of ice cream is air, by volume?', options: ['None', 'About a tenth', 'About half', 'Nearly all of it'], answer: 2, why: 'At 100% overrun the mix has doubled in volume, so about half the scoop is air. That is why ice cream is light and soft.' },
    { q: 'At −14 °C, is all the water in ice cream frozen?', options: ['Yes, every drop', 'No: about a quarter is still liquid, as a thick sugar syrup', 'No: none of it is frozen', 'Only the fat is frozen'], answer: 1, why: 'Sugar lowers the freezing point. As ice forms, the syrup left behind gets stronger and harder to freeze, so some stays liquid.' },
    { q: 'Why is the mix homogenised before freezing?', options: ['To add air', 'To kill germs', 'To break the fat into tiny globules under 1 micrometre', 'To make it sweeter'], answer: 2, why: 'Homogenising forces the mix through a tiny gap. Small, even fat globules give a smooth ice cream and help hold the air bubbles.' },
  ],
  reel: [
    { ms: 5200, caption: 'A scoop of ice cream is four things at once: ice crystals, air bubbles, fat globules and a syrup that never freezes.', set: { explode: 0, show: 'all', T: -14 }, spin: 0 },
    { ms: 5600, caption: 'By volume it is about half air, a quarter ice, a twentieth fat, and the rest sweet liquid syrup.', set: { show: 'all', T: -14 }, anim: { explode: [0, 1] }, spin: 0 },
  ],

  build({ stage, s }) {
    const root = new THREE.Group(); stage.root.add(root);
    const model = new THREE.Group(); root.add(model);
    const micro = makeMicro(root, { stage });
    const c = cone(2.2, 0.72); model.add(c);
    const sc = scoop(0.86); sc.position.y = 2.75; model.add(sc);
    const spot = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.018, 8, 24), M.glow(0x8ef0ff)); spot.position.set(0.15, 3.3, 0.72); model.add(spot);
    const l1 = link(root), l2 = link(root);
    const lab = { scoop: stage.label('One scoop', [-1.75, 2.8, 0], model), lens: stage.label('Magnified about 300 times', [0, 2.62, 0], micro.group, 'hot') };

    const b = board(root, 5.6, 4.0, 680, 486, (g, w, h) => {
      panelBg(g, w, h);
      const sh = shares(mix, 100, s.T);
      title(g, `What fills a scoop at ${fmtC(s.T)}`, 'share of the volume (standard mix, 100% overrun)');
      bars(g, [
        { label: 'Air bubbles', value: sh.air, color: COL.air, text: pct(sh.air) },
        { label: 'Ice crystals', value: sh.ice, color: COL.ice, text: pct(sh.ice) },
        { label: 'Unfrozen syrup', value: sh.syrup, color: COL.syrup, text: pct(sh.syrup) },
        { label: 'Fat globules', value: sh.fat, color: COL.fat, text: pct(sh.fat) },
      ], { y: 84, w: w - 30, labelW: 200, rowH: 66, max: 0.62 });
      note(g, `${pct(sh.frozen)} of the water is ice. The rest stays liquid.`, 20, 384, COL.text, 'bold 24px sans-serif');
      note(g, 'In 1 gram: about 8 million crystals, 8 million bubbles', 20, 420);
      note(g, 'and 1.5 million million fat globules.', 20, 446);
    });
    const lay = {}; let key = '';
    const P = new THREE.Vector3();
    return {
      update(dt, st) {
        dt = Math.max(0, dt);
        const mode = arrange(stage, lay, (tl) => {
          place(model, tl, SPOT.model); place(micro, tl, SPOT.micro); place(b, tl, SPOT.board);
          root.updateMatrixWorld(true);
          const from = spot.getWorldPosition(P).toArray(), g = micro.group, k = g.scale.x;
          l1.visible = l2.visible = tl !== 'phone';
          l1.set(from, [g.position.x - 3.05 * k, g.position.y - 2.25 * k, 0]); l2.set(from, [g.position.x + 3.05 * k, g.position.y - 2.25 * k, 0]);
        }, [lab.scoop, lab.lens]);
        const big = mode === 'wide';
        const sh = shares(mix, 100, st.T);
        micro.set({ ice: sh.ice, air: sh.air, fat: sh.fat, dIce: 50, dAir: 70 });
        micro.pose({ explode: clamp(st.explode, 0, 1), show: st.show });
        const ex = st.explode > 0.5;
        if (ex) lab.lens.visible = false;
        micro.labels.ice.element.innerHTML = ex ? `Ice crystals <b>${pct(sh.ice)}</b>` : 'Ice crystal';
        micro.labels.air.element.innerHTML = ex ? `Air bubbles <b>${pct(sh.air)}</b>` : 'Air bubble';
        micro.labels.fat.element.innerHTML = ex ? `Fat globules <b>${pct(sh.fat)}</b>` : 'Fat globules';
        micro.labels.syrup.element.innerHTML = ex ? `Unfrozen syrup <b>${pct(sh.syrup)}</b>` : 'Unfrozen syrup';
        micro.labels.scale.visible = big;
        const k = st.T.toFixed(1); if (k !== key) { key = k; b.redraw(); }
      },
      readout: (st) => {
        const sh = shares(mix, 100, st.T);
        return `<div class="big">Half air, a quarter ice</div>
          <div class="row"><span>Air bubbles (about 70 µm)</span><b>${pct(sh.air)}</b></div>
          <div class="row"><span>Ice crystals (about 50 µm)</span><b>${pct(sh.ice)}</b></div>
          <div class="row"><span>Unfrozen syrup</span><b>${pct(sh.syrup)}</b></div>
          <div class="row"><span>Fat globules (about 1 µm)</span><b>${pct(sh.fat)}</b></div>
          <div class="row"><span>Water frozen at ${fmtC(st.T)}</span><b>${pct(sh.frozen)}</b></div>
          <small>Shares by volume for a typical mix. Fat globules are drawn about six times too big to be seen.</small>`;
      },
    };
  },
};

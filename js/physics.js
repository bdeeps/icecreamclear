// The numbers and working models behind IceCreamClear. Plain JavaScript with no 3D in it, so every
// model can be run and checked by itself (node can import this file).
//
// Sources used throughout:
//   [Goff]   H. D. Goff, Ice Cream Technology e-Book, University of Guelph
//            (books.lib.uoguelph.ca/icecreamtechnologyebook): mix composition, mix density, overrun,
//            "about 50% of the water frozen" at the barrel freezer, "about 72% at −16 °C", hardening at
//            −30 to −40 °C, 1 g of ice cream holding about 8 million ice crystals of 50 µm, 8 million
//            air bubbles of 70 µm and 1.5 million million fat globules of 1 µm.
//   [G&H]    Goff & Hartel, Ice Cream, 7th ed. (Springer 2013): freezing-point calculation by sucrose
//            equivalents with Leighton's 1927 table; crystal sizes at draw and after hardening.
//   [Clarke] C. Clarke, The Science of Ice Cream (RSC 2004): about 30% ice, 50% air, 5% fat and 15%
//            unfrozen matrix by volume.
//   [CRC]    CRC Handbook of Chemistry and Physics: freezing point of NaCl solutions; eutectic at
//            23.3% salt and −21.1 °C.
//   [FSSAI]  Food Safety and Standards (Food Products Standards and Food Additives) Regulations 2011,
//            2.1.14 ice cream / kulfi and 2.1.15 frozen dessert.
export const L_F = 334000;      // J/kg, latent heat of fusion of water
export const RHO_ICE = 917;     // kg/m³
export const RHO_FAT = 920;     // kg/m³, milk fat (typical)
export const C_MIX = 3350;      // J/kg·K, unfrozen ice cream mix (typical) [G&H]
export const C_FROZEN = 2000;   // J/kg·K, sensible heat of the frozen part (typical)
export const TAU = Math.PI * 2;

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export function rng(seed = 1) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export const fmtC = (T, d = 1) => `${T < -0.049 ? '−' : ''}${Math.abs(T).toFixed(d)} °C`;
export const fmtMin = (t) => (t >= 3600 ? `${Math.floor(t / 3600)} h ${String(Math.round((t % 3600) / 60)).padStart(2, '0')} min` : `${Math.round(t / 60)} min`);

function table(tab, x) {
  if (x <= tab[0][0]) return tab[0][1];
  for (let i = 1; i < tab.length; i++) if (x <= tab[i][0]) { const [a, ya] = tab[i - 1], [b, yb] = tab[i]; return lerp(ya, yb, (x - a) / (b - a)); }
  const n = tab.length, [a, ya] = tab[n - 2], [b, yb] = tab[n - 1];
  return yb + ((x - b) * (yb - ya)) / (b - a);          // carry the last slope on
}

// ---------------------------------------------------------------- salt and ice
// Freezing point of salt water (NaCl), °C, by weight per cent of salt, down to the eutectic [CRC].
const BRINE = [[0, 0], [5, -3.05], [10, -6.56], [15, -10.89], [20, -16.46], [23.3, -21.1]];
export const EUTECTIC = { pct: 23.3, T: -21.1 };
export const brineFreeze = (pct) => table(BRINE, clamp(pct, 0, 23.3));
// A bath of crushed ice with salt stirred in, salt given as % of the weight of ice + salt. While ice
// and brine sit together the brine stays on the freezing line, so the bath settles at the freezing
// point of brine of that overall strength. More than 23.3% cannot dissolve at that temperature: the
// extra salt just sits there.
export const bathTemp = (saltPct) => brineFreeze(Math.min(saltPct, 23.3));

// ---------------------------------------------------------------- the mix and its freezing curve
// Freezing-point depression of a sugar solution, °C, against grams of sucrose per 100 g of water
// (Leighton 1927, as tabulated in [G&H]; thinned to every 15 g).
const LEIGHTON = [[0, 0], [15, 0.90], [30, 1.86], [45, 2.80], [60, 3.85], [75, 5.00], [90, 6.23], [105, 7.56], [120, 8.92], [135, 10.22], [150, 11.41], [165, 12.67], [180, 13.68]];
export const fpdSugar = (gPer100) => table(LEIGHTON, Math.max(0, gPer100));

// A mix by weight %: milk fat, sugar (sucrose), milk solids-not-fat (MSNF), stabiliser. The rest is water.
// The lactose in MSNF counts as 0.545 g of sucrose per gram of MSNF, and the milk salts add
// 2.37 × MSNF ÷ water (°C) [G&H]. About 0.35 g of water per gram of MSNF is held by the proteins and
// never freezes (a typical figure for bound water; it brings the curve to about 75% frozen at −16 °C,
// where [Goff] quotes "about 72%").
export function makeMix({ fat = 10, sugar = 15, msnf = 11, stab = 0.3 } = {}) {
  const water = 100 - fat - sugar - msnf - stab;
  const se = sugar + 0.545 * msnf, bound = 0.35 * msnf, free = Math.max(1, water - bound);
  const fpd = (w) => fpdSugar((se / w) * 100) + (2.37 * msnf) / w;      // w = liquid water left, g per 100 g mix
  const m = { fat, sugar, msnf, stab, water, solids: 100 - water, se, bound, free, Tf: -fpd(free) };
  // Fraction of ALL the water that is ice at temperature T (°C).
  m.frozen = (T) => {
    if (T >= m.Tf) return 0;
    let lo = 0.2, hi = free;
    for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (fpd(mid) > -T) lo = mid; else hi = mid; }
    return clamp((free - (lo + hi) / 2) / water, 0, 1);
  };
  // Density of the liquid mix, kg/L [Goff, "Calculating mix density"].
  m.rho = 1 / ((fat / 100) * 1.075 + ((m.solids - fat) / 100) * 0.63 + water / 100);
  // Heat content, J per kg of mix, counted from liquid mix at its freezing point.
  m.H = (T) => (T >= m.Tf ? C_MIX * (T - m.Tf) : -(L_F * (water / 100) * m.frozen(T) + C_FROZEN * (m.Tf - T)));
  let tab = null;
  m.TofH = (H) => {
    if (H >= 0) return m.Tf + H / C_MIX;
    if (!tab) { tab = []; for (let T = m.Tf; T >= -40; T -= 0.25) tab.push([T, m.H(T)]); }
    for (let i = 1; i < tab.length; i++) if (H >= tab[i][1]) { const [Ta, Ha] = tab[i - 1], [Tb, Hb] = tab[i]; return lerp(Ta, Tb, (H - Ha) / (Hb - Ha)); }
    return -40;
  };
  return m;
}
export const STANDARD = { fat: 10, sugar: 15, msnf: 11, stab: 0.3 };

// ---------------------------------------------------------------- air
// Overrun (%) = extra volume ÷ volume of mix × 100 [Goff]. Weight of a litre = mix density ÷ (1 + overrun).
export const litreWeight = (mix, overrun) => (mix.rho * 1000) / (1 + overrun / 100);   // grams per litre
export const airShare = (overrun) => overrun / (100 + overrun);                         // of the volume
// FSSAI 2.1.14: ice cream at least 525 g/L (medium fat and low fat: 475 g/L).
export const FSSAI_WEIGHT = 525;
export const maxOverrun = (mix, w = FSSAI_WEIGHT) => ((mix.rho * 1000) / w - 1) * 100;

// Volume shares of one scoop at temperature T: air, ice, fat, and the unfrozen syrup (sugar, milk
// protein, salts and the water that is still liquid).
export function shares(mix, overrun, T) {
  const f = mix.frozen(T), ice = ((mix.water / 100) * f) / (RHO_ICE / 1000), fat = mix.fat / 100 / (RHO_FAT / 1000);
  const vMix = 1 / mix.rho, vSolid = vMix + ice * (1 - RHO_ICE / 1000);       // litres per kg; ice swells 9%
  const syrup = vSolid - ice - fat, total = vSolid + vMix * (overrun / 100);
  return { frozen: f, air: (vMix * overrun / 100) / total, ice: ice / total, fat: fat / total, syrup: syrup / total, density: 1 / total };
}

// ---------------------------------------------------------------- how big the crystals come out
// Mean ice-crystal size (µm) leaving the freezer. Real freezers give about 25 to 35 µm at the draw and
// 40 to 55 µm after hardening [G&H]; still-frozen mixes run to 100 µm and beyond. Faster freezing (a
// colder wall) seeds more crystals, so each is smaller [Goff, "Importance of crystallization rate"].
// Scraping throws the seeds into the mix; with no scraping a few crystals grow long. Too fast a dasher
// warms the mix by friction and the crystals come out a little bigger (Drewett & Hartel, J. Food Eng.
// 78, 2007). The formula is our fit through those ranges, not a law.
export function crystalDraw(Twall, rpm, Tf = -2.5) {
  const dT = Math.max(2, Tf - Twall), k = rpm / 200;
  return 18 + (280 / dT) * (1 / (0.12 + k) + 0.15 * k * k);
}
// Hardening is still freezing: the water left over lands on the crystals already there.
export const HARDEN = { blast: { name: 'Blast freezer, −35 °C', T: -35, grow: 12 }, home: { name: 'Home freezer, −18 °C', T: -18, grow: 25 } };
export const hardened = (dDraw, how) => dDraw + HARDEN[how].grow;
export const SMOOTH_LIMIT = 50;     // µm: above about this the tongue starts to feel ice [G&H]

// One warm-up and refreeze (heat shock). Warming from Tcold to Twarm melts part of the ice, the
// smallest crystals first. On cooling the water does not make new crystals: it lands on the survivors
// [Goff, "Ice cream shelf-life"]. If a share of the ice melts, we let half that share of the
// crystals vanish, so the mean size grows by (1 − 0.5·lost)^(−1/3). A tub that melts right through and
// refreezes with no churning comes back coarse (about 120 µm) and without its air.
export function heatShock(mix, d, Tcold, Twarm) {
  const fc = mix.frozen(Tcold), fw = mix.frozen(Math.min(Twarm, 0));
  if (fw <= 0.02) return { d: Math.max(d, 120), melted: true, lost: 1 };
  const lost = clamp(1 - fw / fc, 0, 0.95);
  return { d: d * Math.pow(1 - 0.5 * lost, -1 / 3), melted: false, lost };
}

// ---------------------------------------------------------------- scooping and melting
// How firm it is. Ice is the stiff part and air the soft part, so the index is the ice share of the
// part that is not air, eased by the air: index = ice ÷ (1 − air) × (1 − 0.4 × air). The bands are a
// fit to everyday experience with a standard ice cream (hard to scoop straight from −18 °C, easy at
// −12 to −14 °C, soft serve at −5 °C). It is a guide, not a measured hardness.
export function firmness(sh) { return (sh.ice / Math.max(0.05, 1 - sh.air)) * (1 - 0.4 * sh.air); }
export function scoopability(sh) {
  const x = firmness(sh);
  if (x < 0.2) return { x, word: 'Runny', tone: 'no', sag: 1 };
  if (x < 0.37) return { x, word: 'Soft, like soft serve', tone: 'ok', sag: 0.55 };
  if (x < 0.445) return { x, word: 'Scoops well', tone: 'ok', sag: 0.12 };
  if (x < 0.48) return { x, word: 'Firm: needs a strong wrist', tone: 'ok', sag: 0 };
  return { x, word: 'Rock hard: bends the spoon', tone: 'no', sag: 0 };
}
// Time (s) for the ice in a 60 mL scoop to melt in still air: the heat it must take in (warming up to
// its melting point, then 334 kJ for each kilogram of ice) divided by the heat that reaches it through
// the air film, h = 12 W/m²K (still air plus radiation, typical) on the surface of a 60 mL ball.
export function meltTime(mix, overrun, T, Tair = 30, vol = 60e-6) {
  const sh = shares(mix, overrun, T), mass = sh.density * 1000 * vol;                  // kg
  const Q = mass * -mix.H(T);                                                          // J, to just melted
  const r = Math.cbrt((3 * vol) / (4 * Math.PI)), A = 4 * Math.PI * r * r;
  const Tmid = (T + mix.Tf) / 2;
  return Q / (12 * A * (Tair - Tmid));
}

// ---------------------------------------------------------------- the pot of ice and salt
// A can of mix standing in the bath, as one lump: its heat content falls at U·A·(T − bath) and its
// temperature follows the freezing curve. Hand-cranked pot: 1 kg of mix, can 12 cm across and 15 cm
// tall (A = 0.068 m²), U = 150 W/m²K with the dasher scraping the wall and the slush stirred (typical
// for a scraped wall in brine). Kulfi: 70 g cones, A = 0.011 m² each, nothing stirs inside, so heat
// must cross the frozen kulfi itself: U = 45 W/m²K (about 1.5 cm of frozen mix at 1 W/m·K behind a
// brine film). Both count as "set" when half the water is ice.
export const POTS = {
  crank: { name: 'Hand-cranked pot', mass: 1, UA: 150 * 0.068, done: 0.5, mix: { fat: 10, sugar: 15, msnf: 11, stab: 0.3 } },
  kulfi: { name: 'Kulfi matka', mass: 0.07, UA: 45 * 0.011, done: 0.5, mix: { fat: 11, sugar: 14, msnf: 16, stab: 0 } },
};
export function potRun(pot, saltPct, T0 = 8, tMax = 3 * 3600) {
  const p = POTS[pot], mix = makeMix(p.mix), Tb = bathTemp(saltPct), dt = 5, pts = [];
  let H = mix.H(T0), T = T0, done = -1;
  for (let t = 0; t <= tMax; t += dt) {
    if (t % 60 === 0) pts.push([t, T]);
    H -= (p.UA * (T - Tb) * dt) / p.mass; T = mix.TofH(H);
    if (done < 0 && mix.frozen(T) >= p.done) done = t;
  }
  return { mix, Tb, pts, done, at: (t) => { const i = clamp(t / 60, 0, pts.length - 1), a = Math.floor(i), b = Math.min(pts.length - 1, a + 1); return lerp(pts[a][1], pts[b][1], i - a); } };
}

// ---------------------------------------------------------------- the family of frozen desserts
// Typical figures. Fat and overrun: ice cream and soft serve from [Goff] and the trade ranges quoted
// on Wikipedia ("Soft serve": 3 to 6% fat, 33 to 45% air, served near −4 °C; "Gelato": 6 to 9% fat,
// 25 to 35% air, served at −14 to −11 °C). Kulfi is reduced milk frozen still, so almost no air.
export const STYLES = {
  icecream: { name: 'Ice cream', mix: { fat: 10, sugar: 15, msnf: 11, stab: 0.3 }, overrun: 100, serve: -14, churn: true, d: 45, fatKind: 'milk fat', law: 'Ice cream (FSSAI 2.1.14): at least 10% milk fat' },
  gelato: { name: 'Gelato', mix: { fat: 7, sugar: 21, msnf: 10, stab: 0.3 }, overrun: 30, serve: -12, churn: true, d: 45, fatKind: 'milk fat', law: 'Medium fat ice cream in India: milk fat between 2.5% and 10%' },
  soft: { name: 'Soft serve', mix: { fat: 5, sugar: 14, msnf: 12, stab: 0.3 }, overrun: 40, serve: -5, churn: true, d: 30, fatKind: 'milk fat', law: 'Softy ice cream: sold straight from the freezer barrel, never hardened' },
  kulfi: { name: 'Kulfi', mix: { fat: 11, sugar: 14, msnf: 16, stab: 0 }, overrun: 3, serve: -14, churn: false, d: 85, fatKind: 'milk fat', law: 'Kulfi shares the ice cream standard (FSSAI 2.1.14)' },
  sorbet: { name: 'Sorbet', mix: { fat: 0, sugar: 27, msnf: 0, stab: 0.3 }, overrun: 25, serve: -13, churn: true, d: 50, fatKind: 'no fat', law: 'No milk at all: fruit, sugar and water' },
  dessert: { name: 'Frozen dessert', mix: { fat: 10, sugar: 15, msnf: 11, stab: 0.3 }, overrun: 100, serve: -14, churn: true, d: 45, fatKind: 'vegetable fat', law: 'Frozen dessert (FSSAI 2.1.15): vegetable fat allowed, and the pack must say so' },
};

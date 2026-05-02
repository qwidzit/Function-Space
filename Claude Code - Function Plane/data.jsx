// Function Plane — pack & level data

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];

// Roman packs — sequential difficulty / theme
const ROMAN_PACKS = ROMAN.map((r, i) => ({
  id: `r-${r}`,
  numeral: r,
  index: i + 1,
  name: [
    'Foundations','Slopes','Curves','Reflections','Intersections',
    'Asymptotes','Compositions','Discontinuities','Transforms','Mastery'
  ][i],
  kind: r,
  type: 'roman',
}));

// Special packs — 4 named
const SPECIAL_PACKS = [
  { id: 's-lin',  numeral: 'ƒ', name: 'Linear',      kind: 'lin',  type: 'special', tag: 'mx + b' },
  { id: 's-qua',  numeral: 'ƒ', name: 'Quadratic',   kind: 'qua',  type: 'special', tag: 'ax² + bx + c' },
  { id: 's-trig', numeral: 'ƒ', name: 'Trigonometry',kind: 'trig', type: 'special', tag: 'sin · cos · tan' },
  { id: 's-exp',  numeral: 'ƒ', name: 'Exponential', kind: 'exp',  type: 'special', tag: 'aᵇˣ · log' },
];

// Progress presets — { packId: { stars: [s0..s9], best: [b0..b9] } }
// each level has 0..3 stars; -1 means not yet attempted; null means locked
function buildProgress(state) {
  const all = [...ROMAN_PACKS, ...SPECIAL_PACKS];
  const out = {};
  all.forEach((p, idx) => {
    out[p.id] = { stars: Array(10).fill(-1), best: Array(10).fill(null) };
  });

  if (state === 'fresh') {
    // only first roman pack, only level 1 unlocked & untouched
    out['r-I'].stars[0] = -1;
  } else if (state === 'mid') {
    // I complete (mostly 3-stars), II mostly done, III in progress, IV started, rest locked
    out['r-I'].stars   = [3,3,3,2,3,3,2,3,3,3];
    out['r-I'].best    = [120,140,160,210,180,220,250,240,270,300];
    out['r-II'].stars  = [3,3,2,3,2,3,2,1,-1,-1];
    out['r-II'].best   = [180,200,260,230,280,260,310,360,null,null];
    out['r-III'].stars = [3,2,2,1,-1,-1,-1,-1,-1,-1];
    out['r-III'].best  = [220,290,310,420,null,null,null,null,null,null];
    out['r-IV'].stars  = [2,-1,-1,-1,-1,-1,-1,-1,-1,-1];
    out['r-IV'].best   = [380,null,null,null,null,null,null,null,null,null];
    // V..X locked
    for (let i = 4; i < 10; i++) {
      out[ROMAN_PACKS[i].id].stars = Array(10).fill(null);
    }
    // specials — Linear fully open, Quadratic in progress, others locked-by-stars
    out['s-lin'].stars  = [3,3,3,3,2,3,3,2,3,3];
    out['s-lin'].best   = [140,160,180,200,260,220,240,290,250,310];
    out['s-qua'].stars  = [3,2,2,-1,-1,-1,-1,-1,-1,-1];
    out['s-qua'].best   = [200,280,310,null,null,null,null,null,null,null];
    out['s-trig'].stars = Array(10).fill(null);
    out['s-exp'].stars  = Array(10).fill(null);
  } else if (state === 'power') {
    // most done w/ many 3-star perfects
    [...ROMAN_PACKS.slice(0,8), SPECIAL_PACKS[0], SPECIAL_PACKS[1]].forEach(p => {
      out[p.id].stars = [3,3,3,3,3,3,3,3,3,3];
      out[p.id].best  = [120,140,150,160,170,180,190,200,210,220];
    });
    out['r-IX'].stars = [3,3,3,3,3,3,2,2,1,-1];
    out['r-IX'].best  = [200,210,220,230,240,250,290,300,360,null];
    out['r-X'].stars  = [3,2,2,1,-1,-1,-1,-1,-1,-1];
    out['r-X'].best   = [260,320,340,420,null,null,null,null,null,null];
    out['s-trig'].stars = [3,3,3,2,2,1,-1,-1,-1,-1];
    out['s-trig'].best  = [220,240,250,300,320,400,null,null,null,null];
    out['s-exp'].stars  = [3,2,1,-1,-1,-1,-1,-1,-1,-1];
    out['s-exp'].best   = [240,310,420,null,null,null,null,null,null,null];
  }
  return out;
}

// helpers
function packTotalStars(progress, packId) {
  const s = progress[packId]?.stars || [];
  return s.reduce((a, v) => a + (v > 0 ? v : 0), 0);
}
function packIsLocked(progress, packId) {
  const s = progress[packId]?.stars || [];
  // locked if every level is null
  return s.length > 0 && s.every(v => v === null);
}
function packIsComplete(progress, packId) {
  const s = progress[packId]?.stars || [];
  return s.every(v => v !== null && v >= 1);
}
function totalStarsAll(progress) {
  return Object.keys(progress).reduce((a, k) => a + packTotalStars(progress, k), 0);
}

Object.assign(window, {
  ROMAN_PACKS, SPECIAL_PACKS, buildProgress,
  packTotalStars, packIsLocked, packIsComplete, totalStarsAll,
});

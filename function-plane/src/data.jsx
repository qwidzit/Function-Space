// Function Plane — Level data

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];

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

const SPECIAL_PACKS = [
  { id: 's-lin',  numeral: 'ƒ', name: 'Linear',       kind: 'lin',  type: 'special', tag: 'mx + b' },
  { id: 's-qua',  numeral: 'ƒ', name: 'Quadratic',    kind: 'qua',  type: 'special', tag: 'ax² + bx + c' },
  { id: 's-trig', numeral: 'ƒ', name: 'Trigonometry', kind: 'trig', type: 'special', tag: 'sin · cos · tan' },
  { id: 's-exp',  numeral: 'ƒ', name: 'Exponential',  kind: 'exp',  type: 'special', tag: 'aᵇˣ · log' },
];

// ─── Level data ──────────────────────────────────────────────
// Each entry: { ball: {x,y}, stars: [{x,y},...] }
// Key format: `${packId}-${levelIndex}` (0-based)

const LEVELS = {
  // Default placeholder used for any level not yet defined
  _default: {
    ball: { x: -3, y: 5 },
    stars: [{ x: -1, y: 2 }, { x: 1, y: 0 }, { x: 3, y: -2 }],
  },
  // ── Pack I: Foundations ──────────────────────────────────────
  'r-I-0': { // Warm-up — hint: y = -x
    ball: { x: -4, y: 5 },
    stars: [{ x: -2, y: 2 }, { x: 0, y: 0 }, { x: 2, y: -2 }],
  },
  'r-I-1': { // First slope — hint: y = 0.5x - 1
    ball: { x: -4, y: 4 },
    stars: [{ x: -2, y: -2 }, { x: 0, y: -1 }, { x: 4, y: 1 }],
  },
  'r-I-2': { // Through the gate — hint: y = x^2 - 3
    ball: { x: 0, y: 5 },
    stars: [{ x: -2, y: 1 }, { x: 0, y: -3 }, { x: 2, y: 1 }],
  },
};

function getLevelData(packId, levelIndex) {
  return LEVELS[`${packId}-${levelIndex}`] || LEVELS._default;
}

// ─── Progress helpers ────────────────────────────────────────

function freshProgress() {
  const out = {};
  [...ROMAN_PACKS, ...SPECIAL_PACKS].forEach(p => {
    out[p.id] = { stars: Array(10).fill(null), best: Array(10).fill(null) };
  });
  out['r-I'].stars = Array(10).fill(-1);
  return out;
}

function buildProgress(state) {
  const all = [...ROMAN_PACKS, ...SPECIAL_PACKS];
  const out = {};
  all.forEach(p => {
    out[p.id] = { stars: Array(10).fill(-1), best: Array(10).fill(null) };
  });
  if (state === 'mid') {
    out['r-I'].stars   = [3,3,3,2,3,3,2,3,3,3];
    out['r-I'].best    = [120,140,160,210,180,220,250,240,270,300];
    out['r-II'].stars  = [3,3,2,3,2,3,2,1,-1,-1];
    out['r-II'].best   = [180,200,260,230,280,260,310,360,null,null];
    out['r-III'].stars = [3,2,2,1,-1,-1,-1,-1,-1,-1];
    out['r-III'].best  = [220,290,310,420,null,null,null,null,null,null];
    out['r-IV'].stars  = [2,-1,-1,-1,-1,-1,-1,-1,-1,-1];
    out['r-IV'].best   = [380,null,null,null,null,null,null,null,null,null];
    for (let i = 4; i < 10; i++) out[ROMAN_PACKS[i].id].stars = Array(10).fill(null);
    out['s-lin'].stars  = [3,3,3,3,2,3,3,2,3,3];
    out['s-lin'].best   = [140,160,180,200,260,220,240,290,250,310];
    out['s-qua'].stars  = [3,2,2,-1,-1,-1,-1,-1,-1,-1];
    out['s-qua'].best   = [200,280,310,null,null,null,null,null,null,null];
    out['s-trig'].stars = Array(10).fill(null);
    out['s-exp'].stars  = Array(10).fill(null);
  }
  return out;
}

function packTotalStars(progress, packId) {
  return (progress[packId]?.stars || []).reduce((a, v) => a + (v > 0 ? v : 0), 0);
}
function packIsLocked(progress, packId) {
  const s = progress[packId]?.stars || [];
  return s.length > 0 && s.every(v => v === null);
}
function packIsComplete(progress, packId) {
  const s = progress[packId]?.stars || [];
  return s.length > 0 && s.every(v => v !== null && v >= 1);
}
function totalStarsAll(progress) {
  return Object.keys(progress).reduce((a, k) => a + packTotalStars(progress, k), 0);
}
function findContinuePoint(progress) {
  for (const pack of [...ROMAN_PACKS, ...SPECIAL_PACKS]) {
    if (packIsLocked(progress, pack.id)) continue;
    const pd = progress[pack.id];
    if (!pd) continue;
    for (let i = 0; i < 10; i++) {
      const s = pd.stars[i];
      if (s === null) break;
      if (s === -1 || s === 0) return { pack, levelIndex: i };
    }
  }
  return { pack: ROMAN_PACKS[0], levelIndex: 0 };
}

const LEVEL_NAMES = [
  'Warm-up', 'First slope', 'Through the gate', 'Twin peaks', 'Reflections',
  'The valley', 'Crosswinds', 'Threshold', 'Loop & catch', 'The summit',
];
const LEVEL_GRAPH = ['I','II','III','IV','V','VI','VII','VIII','IX','X','lin','qua','trig','exp'];

Object.assign(window, {
  ROMAN_PACKS, SPECIAL_PACKS, LEVELS,
  getLevelData,
  freshProgress, buildProgress,
  packTotalStars, packIsLocked, packIsComplete, totalStarsAll,
  findContinuePoint,
  LEVEL_NAMES, LEVEL_GRAPH,
});

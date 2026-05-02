// Function Plane — Achievements screen (4)

const ACHIEVEMENTS = [
  { id: 'first-clear',   name: 'First Steps',     desc: 'Clear any level',                          progress: 1,    target: 1,    unlocked: true,  cat: 'Beginner' },
  { id: 'pack-i',        name: 'Pack I Complete', desc: 'Earn at least 1 star on every Pack I level', progress: 10,target: 10,   unlocked: true,  cat: 'Chapters' },
  { id: 'pack-ii',       name: 'Foothills',       desc: 'Complete every level in Pack II',         progress: 8,    target: 10,   unlocked: false, cat: 'Chapters' },
  { id: 'three-star-10', name: 'Sharpshooter',    desc: 'Get 3 stars on 10 different levels',       progress: 14,   target: 10,   unlocked: true,  cat: 'Skill' },
  { id: 'three-star-25', name: 'Marksman',        desc: 'Get 3 stars on 25 different levels',       progress: 14,   target: 25,   unlocked: false, cat: 'Skill' },
  { id: 'minimal',       name: 'Minimalist',      desc: 'Clear a level using a single equation',    progress: 6,    target: 1,    unlocked: true,  cat: 'Skill' },
  { id: 'no-trig',       name: 'Pure Polynomial', desc: 'Complete Pack III without sin/cos/tan',    progress: 0,    target: 1,    unlocked: false, cat: 'Style' },
  { id: 'speed',         name: 'Quick Solver',    desc: 'Clear any level in under 30 seconds',      progress: 1,    target: 1,    unlocked: true,  cat: 'Style' },
  { id: 'linear-only',   name: 'Straight Lines',  desc: 'Complete the Linear pack with only mx+b',  progress: 7,    target: 10,   unlocked: false, cat: 'Themed' },
  { id: 'trig-master',   name: 'Wave Rider',      desc: 'Earn 30 stars in the Trigonometry pack',   progress: 0,    target: 30,   unlocked: false, cat: 'Themed' },
  { id: 'collector',     name: 'Collector',       desc: 'Collect 200 stars in total',               progress: 122,  target: 200,  unlocked: false, cat: 'Milestones' },
  { id: 'completionist', name: 'Completionist',   desc: 'Earn 3 stars on every level in any pack',  progress: 1,    target: 1,    unlocked: true,  cat: 'Milestones' },
];

const RANK_TIERS = [
  { name: 'Bronze',    color: '#a3704a' },
  { name: 'Silver',    color: '#9aa0a6' },
  { name: 'Gold',      color: '#c8a64b' },
  { name: 'Platinum',  color: '#7da7c2' },
  { name: 'Diamond',   color: '#5e9ce0' },
];

function AchievementsScreen({ onBack, density = 'comfortable', progress }) {
  const padX = density === 'compact' ? 18 : 22;
  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length;
  const total = ACHIEVEMENTS.length;
  const pct = Math.round((unlockedCount / total) * 100);

  // Per-pack rank for fully completed packs (mid/power presets)
  const completedPacks = [];
  for (const p of [...ROMAN_PACKS, ...SPECIAL_PACKS]) {
    if (packIsComplete(progress, p.id)) {
      const stars = packTotalStars(progress, p.id);
      // pretend rank = global leaderboard position (mocked)
      const rank = stars >= 30 ? Math.max(1, Math.round(2400 - stars * 70)) : 9999;
      completedPacks.push({ pack: p, stars, rank });
    }
  }

  // group achievements by category
  const groups = {};
  ACHIEVEMENTS.forEach(a => { (groups[a.cat] = groups[a.cat] || []).push(a); });
  const order = ['Beginner', 'Skill', 'Chapters', 'Themed', 'Style', 'Milestones'];

  return (
    <div className="fp-screen" style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      paddingTop: 56,
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `8px ${padX}px 6px`, flex: '0 0 auto',
      }}>
        <button onClick={onBack} aria-label="Back" style={{
          width: 38, height: 38, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--fp-ink-2)',
        }}>
          <Icon.Chevron dir="left" size={20} />
        </button>
        <div style={{
          fontSize: 11.5, color: 'var(--fp-ink-3)', letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          Achievements
        </div>
        <div style={{ width: 38 }}/>
      </div>

      {/* Scroll body */}
      <div className="fp-scroll" style={{ flex: 1, overflowY: 'auto', padding: `0 ${padX}px 24px` }}>
        {/* Hero progress */}
        <div style={{ padding: '8px 0 16px' }}>
          <div style={{
            fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic',
            fontSize: 36, lineHeight: 1, letterSpacing: '-0.02em',
          }}>
            Achievements
          </div>
          <div style={{
            marginTop: 6, fontSize: 12.5, color: 'var(--fp-ink-3)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span><span className="fp-mono" style={{ color: 'var(--fp-ink)' }}>{unlockedCount}</span> / {total} unlocked</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span className="fp-mono" style={{ color: 'var(--fp-ink-2)' }}>{pct}%</span>
          </div>
          <div style={{
            marginTop: 12, height: 6, borderRadius: 3,
            background: 'var(--fp-surface-2)', overflow: 'hidden',
          }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: 'var(--fp-ink)',
            }}/>
          </div>
        </div>

        {/* Ranks */}
        <SectionHead>Pack Ranks</SectionHead>
        {completedPacks.length === 0 ? (
          <div style={{
            border: '1px dashed var(--fp-line)', borderRadius: 12,
            padding: '14px', textAlign: 'center',
            color: 'var(--fp-ink-3)', fontSize: 12.5,
          }}>
            Complete a pack to receive a leaderboard rank.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {completedPacks.map(({ pack, stars, rank }) => (
              <RankRow key={pack.id} pack={pack} stars={stars} rank={rank} />
            ))}
          </div>
        )}

        {/* Achievements by group */}
        {order.filter(g => groups[g]).map((cat, gi) => (
          <div key={cat} style={{ marginTop: 22 }}>
            <SectionHead>{cat}</SectionHead>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {groups[cat].map(a => <AchievementRow key={a.id} a={a} />)}
            </div>
          </div>
        ))}

        <div style={{ height: 12 }} />
      </div>
    </div>
  );
}

function SectionHead({ children }) {
  return (
    <div style={{
      fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
      color: 'var(--fp-ink-3)', fontWeight: 500,
      padding: '4px 2px 10px',
    }}>{children}</div>
  );
}

function rankTierFor(rank) {
  if (rank <= 100)   return RANK_TIERS[4]; // Diamond
  if (rank <= 500)   return RANK_TIERS[3]; // Platinum
  if (rank <= 2000)  return RANK_TIERS[2]; // Gold
  if (rank <= 10000) return RANK_TIERS[1]; // Silver
  return RANK_TIERS[0];
}

function RankRow({ pack, stars, rank }) {
  const tier = rankTierFor(rank);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px',
      borderRadius: 14,
      border: '1px solid var(--fp-line)',
      background: 'var(--fp-surface)',
    }}>
      {/* numeral */}
      <div style={{
        width: 44, height: 44, borderRadius: 10, flex: '0 0 44px',
        background: 'var(--fp-surface-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Instrument Serif', Georgia, serif",
        fontStyle: 'italic', fontSize: 20, color: 'var(--fp-ink)',
        letterSpacing: '-0.02em',
      }}>{pack.numeral}</div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fp-ink)' }}>{pack.name}</div>
        <div style={{ marginTop: 2, fontSize: 11.5, color: 'var(--fp-ink-3)', display: 'flex', gap: 8 }}>
          <span className="fp-mono">{stars}/30 ★</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>Tier <span style={{ color: tier.color, fontWeight: 500 }}>{tier.name}</span></span>
        </div>
      </div>

      {/* Rank */}
      <div style={{
        textAlign: 'right',
      }}>
        <div className="fp-mono" style={{
          fontSize: 18, lineHeight: 1, color: 'var(--fp-ink)', fontWeight: 500,
        }}>#{rank.toLocaleString()}</div>
        <div style={{ marginTop: 3, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fp-ink-4)' }}>
          Global rank
        </div>
      </div>
    </div>
  );
}

function AchievementRow({ a }) {
  const pct = Math.min(100, Math.round((a.progress / a.target) * 100));
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', gap: 12,
      padding: '12px 14px',
      borderRadius: 14,
      border: '1px solid var(--fp-line)',
      background: 'var(--fp-surface)',
      opacity: a.unlocked ? 1 : 0.95,
    }}>
      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 10, flex: '0 0 40px',
        background: a.unlocked ? 'var(--fp-ink)' : 'var(--fp-surface-2)',
        color: a.unlocked ? 'var(--fp-bg)' : 'var(--fp-ink-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {a.unlocked
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12 L10 17 L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          : <Icon.Lock size={14} c="currentColor"/>
        }
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--fp-ink)' }}>{a.name}</span>
          {a.unlocked && (
            <span style={{
              fontSize: 8.5, letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '1px 5px', borderRadius: 3,
              background: 'var(--fp-ink)', color: 'var(--fp-bg)',
            }}>Unlocked</span>
          )}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--fp-ink-3)', lineHeight: 1.35 }}>{a.desc}</div>

        {!a.unlocked && a.target > 1 && (
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              flex: 1, height: 4, borderRadius: 2,
              background: 'var(--fp-surface-2)', overflow: 'hidden',
            }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--fp-ink-2)' }}/>
            </div>
            <span className="fp-mono" style={{ fontSize: 10.5, color: 'var(--fp-ink-3)' }}>
              {a.progress}/{a.target}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

window.AchievementsScreen = AchievementsScreen;

// Function Plane — Achievements screen

const ACH_LIST = [
  {
    id: 'first_roll',
    name: 'First Roll',
    desc: 'Complete your first level',
    check: p => Object.values(p).some(pd => pd.stars.some(s => s >= 1)),
  },
  {
    id: 'three_stars',
    name: 'Shooting Star',
    desc: 'Earn 3 stars on any level',
    check: p => Object.values(p).some(pd => pd.stars.some(s => s === 3)),
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    desc: 'Complete a level scoring 120 or less (1 equation)',
    check: p => Object.values(p).some(pd =>
      pd.best.some((b, i) => b != null && b <= 120 && (pd.stars[i] ?? -1) >= 1)
    ),
  },
  {
    id: 'ten_levels',
    name: 'On a Roll',
    desc: 'Complete 10 levels across all packs',
    check: p => Object.values(p).reduce(
      (a, pd) => a + pd.stars.filter(s => s >= 1).length, 0
    ) >= 10,
  },
  {
    id: 'pack_complete',
    name: 'Pack Master',
    desc: 'Complete all 10 levels in a single pack',
    check: p => Object.values(p).some(pd => pd.stars.filter(s => s >= 1).length >= 10),
  },
  {
    id: 'pack_gold',
    name: 'Golden Pack',
    desc: 'Earn 3 stars on every level in a pack',
    check: p => Object.values(p).some(pd =>
      pd.stars.length === 10 && pd.stars.every(s => s === 3)
    ),
  },
  {
    id: 'pack_i_done',
    name: 'Scholar',
    desc: 'Complete all Pack I levels',
    check: p => (p['r-I']?.stars ?? []).filter(s => s >= 1).length >= 10,
  },
  {
    id: 'fifty_stars',
    name: 'Star Collector',
    desc: 'Earn 50 stars in total',
    check: p => Object.values(p).reduce(
      (a, pd) => a + pd.stars.reduce((b, s) => b + (s > 0 ? s : 0), 0), 0
    ) >= 50,
  },
  {
    id: 'special_start',
    name: 'Extra Credit',
    desc: 'Complete any Special pack level',
    check: p => ['s-lin','s-qua','s-trig','s-exp'].some(id =>
      (p[id]?.stars ?? []).some(s => s >= 1)
    ),
  },
  {
    id: 'all_roman',
    name: 'Completionist',
    desc: 'Complete all 10 Roman numeral packs',
    check: p => ['I','II','III','IV','V','VI','VII','VIII','IX','X'].every(r =>
      (p[`r-${r}`]?.stars ?? []).filter(s => s >= 1).length >= 10
    ),
  },
];

function AchievementsScreen({ onBack, progress, density = 'comfortable' }) {
  const padX = density === 'compact' ? 22 : 26;
  const unlocked = new Set(ACH_LIST.filter(a => a.check(progress)).map(a => a.id));
  const count = unlocked.size;

  return (
    <div className="fp-screen" style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
    }}>
      {/* Top bar */}
      <div style={{
        padding: `calc(14px + env(safe-area-inset-top, 0px)) ${padX}px 14px`,
        display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto',
        borderBottom: '1px solid var(--fp-line)',
      }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--fp-ink-2)',
        }}>
          <Icon.Chevron dir="left" size={18}/>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontStyle: 'italic', fontSize: 24, letterSpacing: '-0.02em', color: 'var(--fp-ink)',
          }}>Achievements</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--fp-ink-3)', display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span className="fp-mono" style={{ fontSize: 16, color: 'var(--fp-ink)', fontWeight: 500 }}>{count}</span>
          / {ACH_LIST.length}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ padding: `10px ${padX}px 14px`, flex: '0 0 auto' }}>
        <div style={{ height: 4, background: 'var(--fp-line)', borderRadius: 2 }}>
          <div style={{
            height: '100%', borderRadius: 2, background: 'var(--fp-accent)',
            width: `${(count / ACH_LIST.length) * 100}%`,
            transition: 'width .5s ease',
          }}/>
        </div>
      </div>

      {/* List */}
      <div className="fp-scroll" style={{
        flex: 1, overflowY: 'auto',
        padding: `0 ${padX}px`,
        paddingBottom: 'max(28px, env(safe-area-inset-bottom, 0px))',
      }}>
        {ACH_LIST.map((ach, i) => {
          const done = unlocked.has(ach.id);
          return (
            <div key={ach.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
              borderBottom: i < ACH_LIST.length - 1 ? '1px solid var(--fp-line)' : 'none',
              opacity: done ? 1 : 0.42,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, flex: '0 0 44px',
                background: done ? 'var(--fp-surface)' : 'var(--fp-surface-2)',
                border: '1px solid var(--fp-line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {done
                  ? <Icon.Trophy size={20} c="var(--fp-ink-2)"/>
                  : <Icon.Lock size={18} c="var(--fp-ink-4)"/>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13.5, fontWeight: 600, color: 'var(--fp-ink)',
                  letterSpacing: '-0.01em', marginBottom: 2,
                }}>{ach.name}</div>
                <div style={{ fontSize: 12, color: 'var(--fp-ink-3)', lineHeight: 1.45 }}>
                  {ach.desc}
                </div>
              </div>
              {done && (
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ flex: '0 0 18px' }}>
                  <path d="M5 13 L9 17 L19 7"
                    stroke="var(--fp-accent)" strokeWidth={2.2}
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.AchievementsScreen = AchievementsScreen;

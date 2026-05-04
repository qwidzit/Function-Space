// Function Plane — Achievements screen

const { useState: useACHState } = React;

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
    desc: 'Complete a level with a score of 50 or less',
    check: p => Object.values(p).some(pd =>
      pd.best.some((b, i) => b != null && b <= 50 && (pd.stars[i] ?? -1) >= 1)
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
    desc: 'Complete any Themed pack level',
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
  const [tab, setTab] = useACHState('achievements'); // 'achievements' | 'leaderboard'
  const unlocked = new Set(ACH_LIST.filter(a => a.check(progress)).map(a => a.id));
  const count = unlocked.size;
  const myStars = totalStarsAll(progress);

  return (
    <div className="fp-screen" style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
    }}>
      {/* Top bar */}
      <div style={{
        padding: `calc(14px + env(safe-area-inset-top, 0px)) ${padX}px 0`,
        display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto',
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
          }}>
            {tab === 'achievements' ? 'Achievements' : 'Leaderboard'}
          </div>
        </div>
        {tab === 'achievements' && (
          <div style={{ fontSize: 12, color: 'var(--fp-ink-3)', display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span className="fp-mono" style={{ fontSize: 16, color: 'var(--fp-ink)', fontWeight: 500 }}>{count}</span>
            / {ACH_LIST.length}
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 4, padding: `10px ${padX}px 0`,
        flex: '0 0 auto',
      }}>
        {[['achievements','Achievements'],['leaderboard','Leaderboard']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            height: 32, padding: '0 14px', borderRadius: 999,
            background: tab === id ? 'var(--fp-ink)' : 'transparent',
            color: tab === id ? 'var(--fp-bg)' : 'var(--fp-ink-3)',
            fontSize: 12.5, fontWeight: 500,
            border: tab === id ? 'none' : '1px solid var(--fp-line)',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'achievements' && (
        <>
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

          {/* Achievement list */}
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
        </>
      )}

      {tab === 'leaderboard' && (
        <LeaderboardTab padX={padX} myStars={myStars}/>
      )}
    </div>
  );
}

function LeaderboardTab({ padX, myStars }) {
  const signedIn = !!(window.FP_AUTH && FP_AUTH.getActive());
  const rows = window.FP_AUTH ? FP_AUTH.buildLeaderboard({ metric: 'stars' }) : [];

  return (
    <div className="fp-scroll" style={{
      flex: 1, overflowY: 'auto',
      paddingBottom: 'max(28px, env(safe-area-inset-bottom, 0px))',
    }}>
      <div style={{ padding: `14px ${padX}px 0` }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '0 0 8px',
          fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fp-ink-4)',
        }}>
          <div style={{ width: 32 }}>#</div>
          <div style={{ flex: 1 }}>Player</div>
          <div style={{ width: 48, textAlign: 'right' }}>Stars</div>
        </div>

        {rows.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--fp-ink-3)', fontSize: 12.5, padding: '24px 0', lineHeight: 1.6 }}>
            {signedIn
              ? <>No friends yet.<br/>Add some from the Account screen to see them ranked here.</>
              : <>Sign in and add friends from the Account screen<br/>to compare star totals.</>}
          </div>
        )}

        {rows.map((row, i) => (
          <div key={row.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: row.self ? '11px 12px' : '11px 0',
            margin: row.self ? '6px 0' : 0,
            borderRadius: row.self ? 12 : 0,
            background: row.self ? 'var(--fp-surface)' : 'transparent',
            border: row.self ? '1.5px solid var(--fp-ink)' : 'none',
            borderBottom: !row.self && i < rows.length - 1 ? '1px solid var(--fp-line)' : (row.self ? '1.5px solid var(--fp-ink)' : 'none'),
          }}>
            <div style={{
              width: 32, flex: '0 0 32px',
              fontFamily: "'Geist Mono', monospace",
              fontSize: row.rank <= 3 ? 14 : 12,
              fontWeight: row.rank <= 3 ? 700 : 400,
              color: row.rank === 1 ? '#d4a017' : row.rank === 2 ? '#9ba0a6' : row.rank === 3 ? '#b87333' : 'var(--fp-ink-4)',
            }}>
              {row.rank <= 3 ? ['🥇','🥈','🥉'][row.rank-1] : row.rank}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flex: '0 0 32px',
                background: 'var(--fp-surface-2)', border: '1px solid var(--fp-line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>{row.avatar || '🟢'}</div>
              <span style={{ fontSize: 13.5, fontWeight: row.self ? 600 : 500, color: 'var(--fp-ink)' }}>
                {row.self ? `${row.name} (you)` : row.name}
              </span>
            </div>
            <div style={{ width: 48, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
              <span className="fp-mono" style={{ fontSize: 13, fontWeight: row.self ? 700 : 600, color: 'var(--fp-ink)' }}>{row.stars}</span>
              <Icon.Star size={10} c="var(--lv-star)"/>
            </div>
          </div>
        ))}

        {!signedIn && (
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--fp-ink-4)', padding: '14px 0 8px' }}>
            You currently have <span className="fp-mono" style={{ color: 'var(--fp-ink-2)' }}>{myStars}</span> ★ as Guest
          </div>
        )}
      </div>
    </div>
  );
}

window.AchievementsScreen = AchievementsScreen;
window.ACH_LIST = ACH_LIST;

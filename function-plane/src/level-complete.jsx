// Function Plane — Level Complete popup

const { useState: useLCState, useEffect: useLCEffect } = React;

// Mock per-level leaderboard
function mockLevelLeaderboard(levelIndex) {
  const names = ['FunctionMaster','CurvePro99','MathWizard','SineWave','InfiniteSlope',
                  'XAxisHero','TrigLegend','PolyNomials'];
  const base = 25 + levelIndex * 15;
  return names.slice(0, 6).map((name, i) => ({
    rank: i + 1,
    name,
    score: base + i * 12,
  }));
}

function LevelCompletePopup({
  pack, levelIndex,
  starsRating, score,
  prevBest, isNewBest, totalStars,
  onReplay, onNext, onClose,
}) {
  const [revealed, setRevealed] = useLCState(false);
  const [tab, setTab] = useLCState('score'); // 'score' | 'leaderboard'

  useLCEffect(() => {
    const t = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(t);
  }, []);

  const packLabel = pack
    ? (pack.type === 'roman' ? `Pack ${pack.numeral}` : pack.name)
    : 'Pack I';

  const leaderboard = mockLevelLeaderboard(levelIndex);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'flex-end',
      backdropFilter: 'blur(2px)',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%',
        background: 'var(--fp-bg)',
        borderRadius: '24px 24px 0 0',
        paddingBottom: 'max(28px, env(safe-area-inset-bottom, 0px))',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
        transform: revealed ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform .3s cubic-bezier(.22,.68,0,1.2)',
        boxSizing: 'border-box',
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Drag pill + header */}
        <div style={{ padding: '12px 24px 0', flex: '0 0 auto' }}>
          <div style={{
            width: 36, height: 4, borderRadius: 2,
            background: 'var(--fp-ink-4)',
            margin: '0 auto 16px',
          }}/>

          <div style={{
            textAlign: 'center',
            fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--fp-ink-3)', marginBottom: 4,
          }}>
            {packLabel} · Level {levelIndex + 1}
          </div>

          <div style={{
            textAlign: 'center',
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 34, lineHeight: 1.05, letterSpacing: '-0.02em',
            color: 'var(--fp-ink)', marginBottom: 16,
          }}>
            {starsRating === 3 ? 'Perfect!' : starsRating === 2 ? 'Nice work' : 'Level clear'}
          </div>

          {/* Stars row */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            gap: 6, marginBottom: 18,
          }}>
            {[0, 1, 2].map(i => {
              const earned = i < starsRating;
              const size = i === 1 ? 52 : 42;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: revealed && earned
                    ? (i === 1 ? 'scale(1) translateY(-6px)' : 'scale(1)')
                    : 'scale(0.4)',
                  opacity: revealed ? 1 : 0,
                  transition: `transform .35s cubic-bezier(.34,1.56,.64,1) ${i * 75 + 120}ms,
                               opacity .2s ease ${i * 75 + 120}ms`,
                }}>
                  <svg width={size} height={size} viewBox="0 0 24 24">
                    <path d="M12 2 L15 9 L22 9.5 L17 14 L18.5 21 L12 17.5 L5.5 21 L7 14 L2 9.5 L9 9 Z"
                      fill={earned ? 'var(--lv-star)' : 'none'}
                      stroke={earned ? 'var(--lv-star)' : 'var(--fp-ink-4)'}
                      strokeWidth={1.5} strokeLinejoin="round"/>
                  </svg>
                </div>
              );
            })}
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
            {[['score','Score'],['leaderboard','Leaderboard']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                height: 30, padding: '0 14px', borderRadius: 999,
                background: tab === id ? 'var(--fp-ink)' : 'transparent',
                color: tab === id ? 'var(--fp-bg)' : 'var(--fp-ink-3)',
                fontSize: 12, fontWeight: 500,
                border: tab === id ? 'none' : '1px solid var(--fp-line)',
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="fp-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
          {tab === 'score' && (
            <div>
              {/* Score block */}
              <div style={{
                background: 'var(--fp-surface)',
                border: '1px solid var(--fp-line)',
                borderRadius: 16,
                padding: '14px 18px',
                marginBottom: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fp-ink-3)', marginBottom: 3 }}>
                      Score
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span className="fp-mono" style={{ fontSize: 30, fontWeight: 600, color: 'var(--fp-ink)', letterSpacing: '-0.03em' }}>
                        {score}
                      </span>
                      {isNewBest && (
                        <span style={{
                          fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
                          textTransform: 'uppercase', color: 'var(--fp-accent)',
                          padding: '2px 7px', borderRadius: 999,
                          background: 'color-mix(in srgb, var(--fp-accent) 14%, transparent)',
                        }}>
                          New best
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fp-ink-3)', marginBottom: 3 }}>
                      Stars
                    </div>
                    <div className="fp-mono" style={{ fontSize: 22, color: 'var(--fp-ink)' }}>
                      {totalStars}/{totalStars}
                    </div>
                  </div>
                </div>

                {prevBest != null && !isNewBest && (
                  <div style={{
                    marginTop: 10, paddingTop: 10,
                    borderTop: '1px solid var(--fp-line)',
                    fontSize: 11.5, color: 'var(--fp-ink-3)',
                  }}>
                    Previous best: <span className="fp-mono" style={{ color: 'var(--fp-ink-2)' }}>{prevBest}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'leaderboard' && (
            <div style={{ marginBottom: 16 }}>
              {/* Column headers */}
              <div style={{
                display: 'flex', alignItems: 'center', padding: '0 0 8px',
                fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fp-ink-4)',
              }}>
                <div style={{ width: 28 }}>#</div>
                <div style={{ flex: 1 }}>Player</div>
                <div style={{ width: 52, textAlign: 'right' }}>Score</div>
              </div>

              {leaderboard.map((row, i) => (
                <div key={row.rank} style={{
                  display: 'flex', alignItems: 'center',
                  padding: '9px 0',
                  borderBottom: i < leaderboard.length - 1 ? '1px solid var(--fp-line)' : 'none',
                }}>
                  <div style={{
                    width: 28, flex: '0 0 28px',
                    fontSize: row.rank <= 3 ? 13 : 11,
                    fontWeight: row.rank <= 3 ? 700 : 400,
                    color: row.rank === 1 ? '#d4a017' : row.rank === 2 ? '#9ba0a6' : row.rank === 3 ? '#b87333' : 'var(--fp-ink-4)',
                    fontFamily: "'Geist Mono', monospace",
                  }}>
                    {row.rank <= 3 ? ['🥇','🥈','🥉'][row.rank-1] : row.rank}
                  </div>
                  <div style={{ flex: 1, fontSize: 13, color: 'var(--fp-ink)', fontWeight: 500 }}>{row.name}</div>
                  <div style={{ width: 52, textAlign: 'right' }}>
                    <span className="fp-mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--fp-ink)' }}>{row.score}</span>
                  </div>
                </div>
              ))}

              {/* Your entry */}
              <div style={{
                display: 'flex', alignItems: 'center',
                padding: '9px 10px', margin: '8px 0',
                borderRadius: 10, background: 'var(--fp-surface)',
                border: '1.5px solid var(--fp-ink)',
              }}>
                <div style={{ width: 28, flex: '0 0 28px', fontSize: 11, color: 'var(--fp-ink-4)', fontFamily: "'Geist Mono', monospace" }}>—</div>
                <div style={{ flex: 1, fontSize: 13, color: 'var(--fp-ink)', fontWeight: 600 }}>You</div>
                <div style={{ width: 52, textAlign: 'right' }}>
                  <span className="fp-mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--fp-ink)' }}>{score}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--fp-ink-4)', paddingBottom: 4 }}>
                Sign in to appear on the leaderboard
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ padding: '0 24px', flex: '0 0 auto' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onReplay} style={{
              flex: 1,
              height: 50, borderRadius: 14,
              background: 'var(--fp-surface)', border: '1px solid var(--fp-line)',
              color: 'var(--fp-ink)', fontSize: 14, fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <path d="M1 4v6h6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.51 15a9 9 0 1 0 .49-4.96" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Replay
            </button>
            <button onClick={onNext} style={{
              flex: 2,
              height: 50, borderRadius: 14,
              background: 'var(--fp-accent)', color: 'var(--fp-accent-ink)',
              fontSize: 14, fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}>
              Next level
              <Icon.Chevron dir="right" size={14} c="currentColor"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.LevelCompletePopup = LevelCompletePopup;

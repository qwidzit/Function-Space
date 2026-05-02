// Function Plane — Level Completion Popup

function LevelCompletePopup({ pack, levelIndex, score, stars, prevBest, isNewBest, onContinue, onReplay, onClose }) {
  // Star reveal animation
  const [revealed, setRevealed] = React.useState(0);
  React.useEffect(() => {
    setRevealed(0);
    let i = 0;
    const tick = () => {
      i += 1;
      setRevealed(i);
      if (i < stars) setTimeout(tick, 240);
    };
    setTimeout(tick, 200);
  }, [stars, score]);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 50,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%',
        background: 'var(--fp-bg)',
        borderRadius: '20px 20px 0 0',
        borderTop: '1px solid var(--fp-line)',
        padding: '14px 22px 22px',
        boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--fp-ink-4)' }}/>
        </div>

        {/* Eyebrow */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{
            fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--fp-ink-3)',
          }}>
            {pack.type === 'roman' ? `Pack ${pack.numeral}` : pack.name} · Level {levelIndex + 1}
          </div>
          <button onClick={onClose} aria-label="Close" style={{
            color: 'var(--fp-ink-3)', padding: 4,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Title */}
        <div style={{
          fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic',
          fontSize: 38, lineHeight: 1, letterSpacing: '-0.02em', color: 'var(--fp-ink)',
        }}>
          {stars === 3 ? 'Perfect.' : stars > 0 ? 'Solved.' : 'Try again.'}
        </div>

        {/* Big stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, padding: '4px 0 6px' }}>
          {[0,1,2].map(i => {
            const on = i < revealed;
            return (
              <div key={i} style={{
                transform: on ? 'scale(1)' : 'scale(0.6)',
                opacity: on ? 1 : 0.35,
                transition: 'transform .25s cubic-bezier(.4,1.6,.5,1), opacity .2s',
              }}>
                <Icon.Star size={48} filled={on}
                  c={on ? 'var(--fp-ink)' : 'var(--fp-star-empty)'}
                  empty="var(--fp-star-empty)" />
              </div>
            );
          })}
        </div>

        {/* Score block */}
        <div style={{
          display: 'flex', alignItems: 'stretch',
          border: '1px solid var(--fp-line)', borderRadius: 14,
          background: 'var(--fp-surface)',
        }}>
          <ScoreCell label="Score" value={score} mono accent={isNewBest}/>
          <Divider/>
          <ScoreCell label={isNewBest ? 'Previous best' : 'Best'}
            value={prevBest == null ? '—' : prevBest} mono />
          <Divider/>
          <ScoreCell label="Rank" value="#1,284" mono />
        </div>

        {isNewBest && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontSize: 11.5, color: 'var(--fp-ink-2)', marginTop: -8,
          }}>
            <span style={{
              fontSize: 8.5, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '2px 6px', borderRadius: 3,
              background: 'var(--fp-ink)', color: 'var(--fp-bg)',
            }}>New best</span>
            {prevBest != null && <span className="fp-mono" style={{ color: 'var(--fp-ink-3)' }}>−{prevBest - score}</span>}
          </div>
        )}

        {/* Mini leaderboard */}
        <div>
          <div style={{
            fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--fp-ink-3)', fontWeight: 500, padding: '0 2px 6px',
          }}>Leaderboard</div>
          <div style={{
            border: '1px solid var(--fp-line)', borderRadius: 12,
            background: 'var(--fp-surface)',
            display: 'flex', flexDirection: 'column',
          }}>
            <LeaderRow rank={1}    name="m.kowalski"  score={120} />
            <LeaderRow rank={2}    name="ada_l"       score={140} />
            <LeaderRow rank={3}    name="riemann.hyp" score={160} />
            <LeaderRow rank={1284} name="you" you score={score} />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onReplay} style={{
            flex: '0 0 auto', padding: '0 18px', height: 50, borderRadius: 14,
            border: '1px solid var(--fp-line)', background: 'var(--fp-surface)',
            color: 'var(--fp-ink)', fontSize: 14, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 12 A8 8 0 1 1 7 18 M4 12 V6 M4 12 H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Replay
          </button>
          <button onClick={onContinue} style={{
            flex: 1, height: 50, borderRadius: 14,
            background: 'var(--fp-accent)', color: 'var(--fp-accent-ink)',
            fontSize: 14, fontWeight: 500,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            Next level
            <Icon.Chevron size={16} c="var(--fp-accent-ink)" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreCell({ label, value, mono, accent }) {
  return (
    <div style={{
      flex: 1, padding: '10px 12px',
      display: 'flex', flexDirection: 'column', gap: 3,
    }}>
      <div style={{ fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fp-ink-3)' }}>
        {label}
      </div>
      <div className={mono ? 'fp-mono' : ''} style={{
        fontSize: 18, fontWeight: 500,
        color: accent ? 'var(--fp-ink)' : 'var(--fp-ink)',
        letterSpacing: '-0.01em',
      }}>{value}</div>
    </div>
  );
}
function Divider() {
  return <div style={{ width: 1, background: 'var(--fp-line)' }} />;
}
function LeaderRow({ rank, name, score, you }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 12px',
      borderTop: '1px solid var(--fp-line)',
      background: you ? 'var(--fp-surface-2)' : 'transparent',
    }}>
      <span className="fp-mono" style={{
        width: 48, fontSize: 11, color: 'var(--fp-ink-3)',
      }}>#{rank.toLocaleString()}</span>
      <span style={{
        flex: 1, fontSize: 13, color: 'var(--fp-ink)',
        fontWeight: you ? 500 : 400,
      }}>
        {name}{you && <span style={{ marginLeft: 6, fontSize: 9.5, color: 'var(--fp-ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>You</span>}
      </span>
      <span className="fp-mono" style={{ fontSize: 13, color: 'var(--fp-ink)' }}>{score}</span>
    </div>
  );
}

window.LevelCompletePopup = LevelCompletePopup;

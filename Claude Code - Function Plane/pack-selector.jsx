// Function Plane — Pack Selector (2)

function PackSelector({ progress, onBack, onPickPack, density = 'comfortable' }) {
  const padX = density === 'compact' ? 18 : 22;
  const totalStars = totalStarsAll(progress);
  const totalPossible = (ROMAN_PACKS.length + SPECIAL_PACKS.length) * 30;

  return (
    <div className="fp-screen" style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      paddingTop: 56,
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `8px ${padX}px 6px`,
      }}>
        <button onClick={onBack} aria-label="Back" style={{
          width: 38, height: 38, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--fp-ink-2)',
        }}>
          <Icon.Chevron dir="left" size={20} />
        </button>
        <WordmarkSmall />
        <div style={{
          height: 32, padding: '0 12px', borderRadius: 999,
          border: '1px solid var(--fp-line)', display: 'flex', alignItems: 'center', gap: 6,
          color: 'var(--fp-ink-2)', fontSize: 12,
        }}>
          <Icon.Star size={11} c="var(--fp-ink)" />
          <span className="fp-mono" style={{ color: 'var(--fp-ink)' }}>{totalStars}</span>
          <span style={{ opacity: 0.5 }}>/ {totalPossible}</span>
        </div>
      </div>

      {/* Title */}
      <div style={{ padding: `6px ${padX}px 14px` }}>
        <h1 style={{
          margin: 0,
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontStyle: 'italic', fontWeight: 400,
          fontSize: 36, lineHeight: 1, letterSpacing: '-0.02em',
        }}>
          Packs
        </h1>
        <div style={{
          marginTop: 6, fontSize: 12.5, color: 'var(--fp-ink-3)',
        }}>
          {ROMAN_PACKS.length} chapters · {SPECIAL_PACKS.length} themed
        </div>
      </div>

      {/* Scroll list */}
      <div className="fp-scroll" style={{ flex: 1, overflowY: 'auto', padding: `0 ${padX}px 24px` }}>
        {/* Roman section */}
        <SectionLabel>Chapters</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ROMAN_PACKS.map((p, i) => {
            const prev = i > 0 ? ROMAN_PACKS[i - 1].id : null;
            const locked = packIsLocked(progress, p.id);
            const stars = packTotalStars(progress, p.id);
            const complete = packIsComplete(progress, p.id);
            return (
              <PackRow key={p.id} pack={p} stars={stars} locked={locked} complete={complete}
                onClick={() => !locked && onPickPack(p)} />
            );
          })}
        </div>

        {/* Special section */}
        <div style={{ marginTop: 22 }}>
          <SectionLabel sub="By function family">Themed</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {SPECIAL_PACKS.map((p) => {
              const locked = packIsLocked(progress, p.id);
              const stars = packTotalStars(progress, p.id);
              const complete = packIsComplete(progress, p.id);
              return (
                <SpecialPackCard key={p.id} pack={p} stars={stars} locked={locked} complete={complete}
                  onClick={() => !locked && onPickPack(p)} />
              );
            })}
          </div>
        </div>

        <div style={{ height: 12 }} />
      </div>
    </div>
  );
}

function SectionLabel({ children, sub }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      padding: '6px 2px 10px',
    }}>
      <div style={{
        fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--fp-ink-3)', fontWeight: 500,
      }}>{children}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--fp-ink-4)' }}>{sub}</div>}
    </div>
  );
}

// Roman pack — horizontal row card
function PackRow({ pack, stars, locked, complete, onClick }) {
  return (
    <button onClick={onClick} disabled={locked} style={{
      display: 'flex', alignItems: 'stretch', gap: 14,
      padding: '14px 14px 14px 14px',
      borderRadius: 16,
      border: '1px solid var(--fp-line)',
      background: 'var(--fp-surface)',
      textAlign: 'left',
      opacity: locked ? 0.55 : 1,
      cursor: locked ? 'not-allowed' : 'pointer',
      position: 'relative',
    }}>
      {/* Numeral tile */}
      <div style={{
        width: 64, height: 64, borderRadius: 12, flex: '0 0 64px',
        background: locked ? 'var(--fp-locked)' : 'var(--fp-surface-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* faint mini graph behind numeral */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: locked ? 0 : 0.18,
        }}>
          <MiniGraph kind={pack.kind} w={64} h={42} c="var(--fp-ink)" dim="transparent"/>
        </div>
        <span style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontStyle: 'italic', fontWeight: 400,
          fontSize: pack.numeral.length > 2 ? 22 : 26,
          color: 'var(--fp-ink)', position: 'relative',
          letterSpacing: '-0.02em',
        }}>
          {pack.numeral}
        </span>
      </div>

      {/* Body */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        minWidth: 0,
      }}>
        <div>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 8,
          }}>
            <span style={{
              fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--fp-ink-3)',
            }}>Pack {pack.numeral}</span>
            {complete && (
              <span style={{
                fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '1px 6px', borderRadius: 4,
                background: 'var(--fp-ink)', color: 'var(--fp-bg)',
              }}>Complete</span>
            )}
          </div>
          <div style={{
            fontSize: 16, fontWeight: 500, color: 'var(--fp-ink)',
            marginTop: 2, letterSpacing: '-0.01em',
          }}>
            {pack.name}
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 8,
        }}>
          {locked ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--fp-ink-3)', fontSize: 11.5 }}>
              <Icon.Lock size={12} />
              Complete previous pack
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Stars count={Math.min(3, Math.round(stars / 10))} total={3} size={11} />
              <span className="fp-mono" style={{ fontSize: 11.5, color: 'var(--fp-ink-2)' }}>
                {stars}<span style={{ color: 'var(--fp-ink-4)' }}>/30</span>
              </span>
            </span>
          )}
          {!locked && <Icon.Chevron size={16} c="var(--fp-ink-3)"/>}
        </div>
      </div>
    </button>
  );
}

// Special pack — square card
function SpecialPackCard({ pack, stars, locked, complete, onClick }) {
  return (
    <button onClick={onClick} disabled={locked} style={{
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '14px',
      borderRadius: 16,
      border: '1px solid var(--fp-line)',
      background: 'var(--fp-surface)',
      textAlign: 'left',
      minHeight: 140,
      opacity: locked ? 0.55 : 1,
      cursor: locked ? 'not-allowed' : 'pointer',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--fp-ink-3)',
        }}>Themed</span>
        {locked
          ? <Icon.Lock size={12} c="var(--fp-ink-3)"/>
          : complete
            ? <span style={{
                fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '1px 5px', borderRadius: 3,
                background: 'var(--fp-ink)', color: 'var(--fp-bg)',
              }}>100%</span>
            : null
        }
      </div>

      {/* Mini graph */}
      <div style={{
        margin: '8px 0 8px',
        background: 'var(--fp-surface-2)', borderRadius: 10,
        height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <MiniGraph kind={pack.kind} w={88} h={40} c={locked ? 'var(--fp-ink-4)' : 'var(--fp-ink)'} dim="var(--fp-line)"/>
      </div>

      <div>
        <div style={{
          fontSize: 15, fontWeight: 500, color: 'var(--fp-ink)',
          letterSpacing: '-0.01em',
        }}>{pack.name}</div>
        <div className="fp-mono" style={{ fontSize: 10.5, color: 'var(--fp-ink-3)', marginTop: 1 }}>
          {pack.tag}
        </div>
        <div style={{
          marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {locked ? (
            <span style={{ fontSize: 10.5, color: 'var(--fp-ink-3)' }}>50★ to unlock</span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Stars count={Math.min(3, Math.round(stars / 10))} total={3} size={10} />
              <span className="fp-mono" style={{ fontSize: 10.5, color: 'var(--fp-ink-2)' }}>
                {stars}<span style={{ color: 'var(--fp-ink-4)' }}>/30</span>
              </span>
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

window.PackSelector = PackSelector;

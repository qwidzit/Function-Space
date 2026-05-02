// Function Plane — How to Play (3)

function HowToPlayScreen({ onBack, onStart, density = 'comfortable' }) {
  const padX = density === 'compact' ? 18 : 22;
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
        }}>How to play</div>
        <div style={{ width: 38 }}/>
      </div>

      <div className="fp-scroll" style={{ flex: 1, overflowY: 'auto', padding: `0 ${padX}px 22px` }}>
        {/* Title */}
        <div style={{ padding: '6px 0 18px' }}>
          <div style={{
            fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic',
            fontSize: 36, lineHeight: 1, letterSpacing: '-0.02em',
          }}>
            Make the math<br/>do the work.
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--fp-ink-3)', lineHeight: 1.5 }}>
            Each level is a coordinate plane with a <strong style={{ color: 'var(--fp-ink-2)' }}>ball</strong>,
            a few <strong style={{ color: 'var(--fp-ink-2)' }}>stars</strong>, and obstacles. Write functions
            so the ball rolls along your curves and collects stars on the way down.
          </div>
        </div>

        {/* Step cards */}
        <SectionLabel>The loop</SectionLabel>
        <Step n={1} title="Read the plane">
          A blue ball sits somewhere above the x-axis. Yellow stars float at fixed coordinates. Sometimes there are walls or pegs.
        </Step>
        <Step n={2} title="Write a function">
          Open the equations panel and type any <span className="fp-mono">y = f(x)</span>. Try simple lines first: <span className="fp-mono">y = -0.5x + 4</span>.
          Add more functions to chain paths.
        </Step>
        <Step n={3} title="Press Play">
          The ball is released and follows the curve nearest to it as gravity pulls it down. It collects every star it touches.
        </Step>
        <Step n={4} title="Earn stars">
          Three for collecting every star, two if you miss one, one if you reach the floor at all. Lower equation count = better score.
        </Step>

        {/* Function tips */}
        <SectionLabel>Equation cheatsheet</SectionLabel>
        <div style={{
          border: '1px solid var(--fp-line)', borderRadius: 14,
          background: 'var(--fp-surface)', overflow: 'hidden',
        }}>
          <CheatRow lhs="y = mx + b"          desc="Straight line"/>
          <CheatRow lhs="y = a(x − h)² + k"   desc="Parabola, vertex at (h, k)"/>
          <CheatRow lhs="y = sin(x), cos(x)"   desc="Waves"/>
          <CheatRow lhs="y = a · e^x"          desc="Exponential"/>
          <CheatRow lhs="y = √x, |x|, ln(x)"   desc="Roots, abs, logs"/>
          <CheatRow lhs="^   *   ()   π"       desc="Power, multiply, group, pi"/>
        </div>

        <SectionLabel>Scoring</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ScoreLine icon={<Icon.Star size={14} c="var(--fp-ink)" filled/>}     label="All stars collected"  detail="+3 stars"/>
          <ScoreLine icon={<MiniGraph kind="lin" w={20} h={14} c="var(--fp-ink)" dim="transparent"/>} label="Single equation" detail="bonus"/>
          <ScoreLine icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 6 V12 L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
          </svg>} label="Solve in under 30s" detail="bonus"/>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 22 }}>
          <PrimaryButton onClick={onStart} icon={<Icon.Play size={14} c="var(--fp-accent-ink)"/>}>
            Got it — play
          </PrimaryButton>
        </div>
        <div style={{ height: 8 }}/>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
      color: 'var(--fp-ink-3)', fontWeight: 500,
      padding: '20px 2px 10px',
    }}>{children}</div>
  );
}

function Step({ n, title, children }) {
  return (
    <div style={{
      display: 'flex', gap: 14,
      padding: '12px 14px', marginBottom: 8,
      borderRadius: 14, border: '1px solid var(--fp-line)',
      background: 'var(--fp-surface)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, flex: '0 0 32px',
        background: 'var(--fp-ink)', color: 'var(--fp-bg)',
        fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic',
        fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{n}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fp-ink)' }}>{title}</div>
        <div style={{ marginTop: 3, fontSize: 12.5, color: 'var(--fp-ink-3)', lineHeight: 1.45 }}>{children}</div>
      </div>
    </div>
  );
}

function CheatRow({ lhs, desc }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '10px 14px',
      borderTop: '1px solid var(--fp-line)',
    }}>
      <span className="fp-mono" style={{ fontSize: 13, color: 'var(--fp-ink)', minWidth: 0, flex: '0 0 48%' }}>{lhs}</span>
      <span style={{ fontSize: 12, color: 'var(--fp-ink-3)' }}>{desc}</span>
    </div>
  );
}

function ScoreLine({ icon, label, detail }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', borderRadius: 12,
      border: '1px solid var(--fp-line)', background: 'var(--fp-surface)',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 7,
        background: 'var(--fp-surface-2)', color: 'var(--fp-ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <div style={{ flex: 1, fontSize: 13, color: 'var(--fp-ink)' }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--fp-ink-3)', letterSpacing: '0.04em' }}>{detail}</div>
    </div>
  );
}

window.HowToPlayScreen = HowToPlayScreen;

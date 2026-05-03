// Function Plane — How to Play screen

function HowToPlayScreen({ onBack, density = 'comfortable' }) {
  const padX = density === 'compact' ? 22 : 26;

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
        <div style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontStyle: 'italic', fontSize: 24, letterSpacing: '-0.02em', color: 'var(--fp-ink)',
        }}>How to play</div>
      </div>

      <div className="fp-scroll" style={{
        flex: 1, overflowY: 'auto',
        paddingBottom: 'max(28px, env(safe-area-inset-bottom, 0px))',
      }}>
        <HTPSection icon={<HTPIcon d="M12 2 C6.5 2 2 6.5 2 12 C2 17.5 6.5 22 12 22 C17.5 22 22 17.5 22 12 C22 6.5 17.5 2 12 2M12 8 C9.8 8 8 9.8 8 12 C8 14.2 9.8 16 12 16 C14.2 16 16 14.2 16 12 C16 9.8 14.2 8 12 8M12 11 L12 13 M12 11 L12 13"/>} title="The goal">
          Guide the ball from its start position to collect every star on the level.
          The ball rolls under gravity along curves you draw. All stars must be collected
          for the level to count as complete.
        </HTPSection>

        <HTPSection icon={<HTPIcon d="M4 8 H20 M4 16 H20"/>} title="Write equations">
          <p style={{ margin: '0 0 6px' }}>
            Tap <strong>Add</strong> in the panel at the bottom and type any equation.
            You can write it in any form:
          </p>
          <CodeLine>y = sin(x)</CodeLine>
          <CodeLine>x^2 + y^2 = 25</CodeLine>
          <CodeLine>y = 0.5*x - 1</CodeLine>
          <p style={{ margin: '8px 0 0' }}>
            The curve appears on the plane instantly. On mobile, use the built-in
            keyboard that pops up automatically.
          </p>
        </HTPSection>

        <HTPSection icon={<HTPIcon d="M5 3 L19 12 L5 21 Z"/>} title="Press Play">
          When your equations look right, press <strong>Play</strong>. The ball drops
          from its starting position (shown by the dashed circle) and rolls along your
          curves. Press <strong>Stop</strong> at any time to reset and adjust.
        </HTPSection>

        <HTPSection icon={<HTPIcon d="M12 2 L15.1 8.3 L22 9.3 L17 14.1 L18.2 21 L12 17.8 L5.8 21 L7 14.1 L2 9.3 L8.9 8.3 Z"/>} title="Collect all stars">
          Stars disappear when the ball touches them. If the ball falls off the bottom
          without collecting every star, it resets — the level only completes when all
          stars are collected.
        </HTPSection>

        <HTPSection icon={<HTPIcon d="M8 6 H16 M8 12 H16 M8 18 H13"/>} title="Star rating">
          <div style={{ marginBottom: 6 }}>Each level awards 1–3 stars based on how elegantly you solved it:</div>
          <RatingRow n={1}>Collect all stars</RatingRow>
          <RatingRow n={2}>Score at or below the score goal shown in the HUD</RatingRow>
          <RatingRow n={3}>Use at or fewer equations than the equation goal</RatingRow>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--fp-ink-4)' }}>
            Score = equations × 100 + 20. Lower is better.
          </div>
        </HTPSection>

        <HTPSection icon={<HTPIcon d="M3 12 H21 M12 3 V21 M7 7 L17 17"/>} title="Domain restrictions">
          Tap the grid icon on any equation to restrict where it appears on the plane.
          Add segments like x ∈ [−3, 3] to show only part of a curve.
          Multiple segments are supported — useful for building ramps and platforms.
        </HTPSection>

        <HTPSection icon={<HTPIcon d="M15 3 H21 V9 M9 21 H3 V15 M21 15 V21 H15 M3 9 V3 H9"/>} title="Pan & zoom" last>
          Drag the coordinate plane to pan. Use the +/− buttons or pinch to zoom.
          The crosshair button resets the view to the origin.
        </HTPSection>
      </div>
    </div>
  );
}

function HTPSection({ icon, title, children, last }) {
  return (
    <div style={{ padding: '18px 26px 0' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flex: '0 0 40px',
          background: 'var(--fp-surface)', border: '1px solid var(--fp-line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fp-ink)', marginBottom: 6, letterSpacing: '-0.01em' }}>
            {title}
          </div>
          <div style={{ fontSize: 13, color: 'var(--fp-ink-3)', lineHeight: 1.6 }}>
            {children}
          </div>
        </div>
      </div>
      {!last && <div style={{ height: 1, background: 'var(--fp-line)', margin: '18px 0 0' }}/>}
    </div>
  );
}

function HTPIcon({ d }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <path d={d} stroke="var(--fp-ink-2)" strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CodeLine({ children }) {
  return (
    <div className="fp-mono" style={{
      fontSize: 12.5, color: 'var(--fp-ink-2)',
      background: 'var(--fp-surface)', border: '1px solid var(--fp-line)',
      borderRadius: 7, padding: '5px 10px', marginBottom: 4,
      display: 'inline-block', width: '100%', boxSizing: 'border-box',
    }}>{children}</div>
  );
}

function RatingRow({ n, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 5 }}>
      <Stars count={n} total={3} size={9} c="var(--lv-star)" empty="var(--fp-ink-4)"/>
      <span style={{ fontSize: 12, color: 'var(--fp-ink-2)', lineHeight: 1.4 }}>{children}</span>
    </div>
  );
}

window.HowToPlayScreen = HowToPlayScreen;

// Function Plane — Settings (and Account) screens

function SettingsScreen({ onBack, density = 'comfortable', tweaks, setTweak }) {
  const padX = density === 'compact' ? 18 : 22;
  const dark = tweaks.theme === 'dark';

  return (
    <div className="fp-screen" style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      paddingTop: 56,
    }}>
      <TopBar onBack={onBack} title="Settings" padX={padX}/>

      <div className="fp-scroll" style={{ flex: 1, overflowY: 'auto', padding: `0 ${padX}px 24px` }}>
        <Title>Settings</Title>

        <SectionLabelS>Appearance</SectionLabelS>
        <Group>
          <SegmentRow label="Theme"
            value={tweaks.theme}
            options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
            onChange={(v) => setTweak('theme', v)} />
          <SegmentRow label="Density"
            value={tweaks.density}
            options={[{ value: 'compact', label: 'Compact' }, { value: 'comfortable', label: 'Comfort' }]}
            onChange={(v) => setTweak('density', v)} />
        </Group>

        <SectionLabelS>Sound & haptics</SectionLabelS>
        <Group>
          <ToggleRow label="Sound effects" defaultOn={true}/>
          <ToggleRow label="Music" defaultOn={false}/>
          <ToggleRow label="Haptics" defaultOn={true}/>
          <SliderRow label="Volume" defaultValue={70}/>
        </Group>

        <SectionLabelS>Gameplay</SectionLabelS>
        <Group>
          <ToggleRow label="Show grid labels" defaultOn={true}/>
          <ToggleRow label="Snap to integers" defaultOn={false}/>
          <ToggleRow label="Auto-zoom on play" defaultOn={true}/>
          <SegmentRow label="Notation"
            value="standard"
            options={[{ value: 'standard', label: 'Standard' }, { value: 'pretty', label: 'Pretty' }]}
            onChange={() => {}} />
        </Group>

        <SectionLabelS>Notifications</SectionLabelS>
        <Group>
          <ToggleRow label="Daily challenge" defaultOn={true}/>
          <ToggleRow label="New pack releases" defaultOn={true}/>
          <ToggleRow label="Friends activity" defaultOn={false}/>
        </Group>

        <SectionLabelS>About</SectionLabelS>
        <Group>
          <NavRow label="Privacy policy"/>
          <NavRow label="Terms of service"/>
          <NavRow label="Open source licenses"/>
          <NavRow label="Contact support"/>
        </Group>

        <div style={{
          textAlign: 'center', fontSize: 10.5, color: 'var(--fp-ink-4)',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          paddingTop: 18,
        }}>
          v 1.0 · build 24
        </div>
      </div>
    </div>
  );
}

function AccountScreen({ onBack, density = 'comfortable', totalStars }) {
  const padX = density === 'compact' ? 18 : 22;
  return (
    <div className="fp-screen" style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      paddingTop: 56,
    }}>
      <TopBar onBack={onBack} title="Account" padX={padX}/>

      <div className="fp-scroll" style={{ flex: 1, overflowY: 'auto', padding: `0 ${padX}px 24px` }}>
        <Title>Account</Title>

        {/* Profile card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px', borderRadius: 16,
          border: '1px solid var(--fp-line)', background: 'var(--fp-surface)',
          marginBottom: 18,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', flex: '0 0 64px',
            background: 'var(--fp-surface-2)', color: 'var(--fp-ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic',
            fontSize: 26, letterSpacing: '-0.02em',
          }}>
            EM
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic',
              fontSize: 22, lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--fp-ink)',
            }}>Emma Marshall</div>
            <div style={{ marginTop: 2, fontSize: 12, color: 'var(--fp-ink-3)' }}>
              <span className="fp-mono">@emma_m</span>
            </div>
            <div style={{ marginTop: 6, display: 'flex', gap: 10, fontSize: 11.5, color: 'var(--fp-ink-3)' }}>
              <span><span className="fp-mono" style={{ color: 'var(--fp-ink)' }}>{totalStars}</span> ★</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>Level <span className="fp-mono" style={{ color: 'var(--fp-ink)' }}>14</span></span>
            </div>
          </div>
          <button style={{
            padding: '6px 12px', borderRadius: 999,
            border: '1px solid var(--fp-line)', background: 'var(--fp-surface-2)',
            color: 'var(--fp-ink)', fontSize: 12, fontWeight: 500,
          }}>Edit</button>
        </div>

        {/* Stats grid */}
        <SectionLabelS>Lifetime stats</SectionLabelS>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        }}>
          <Stat label="Levels cleared" value="38"/>
          <Stat label="Stars" value={totalStars}/>
          <Stat label="Best streak" value="14"/>
          <Stat label="Equations written" value="412"/>
        </div>

        <SectionLabelS>Connection</SectionLabelS>
        <Group>
          <NavRow label="Apple ID"        right={<Pill>connected</Pill>}/>
          <NavRow label="Google Play"     right={<Pill muted>not linked</Pill>}/>
          <NavRow label="Game Center"     right={<Pill>connected</Pill>}/>
        </Group>

        <SectionLabelS>Privacy</SectionLabelS>
        <Group>
          <ToggleRow label="Public profile" defaultOn={true}/>
          <ToggleRow label="Show on leaderboards" defaultOn={true}/>
          <NavRow label="Manage data"/>
        </Group>

        <SectionLabelS>Subscription</SectionLabelS>
        <div style={{
          padding: 16, borderRadius: 16,
          border: '1px solid var(--fp-line)', background: 'var(--fp-surface)',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{
              fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic',
              fontSize: 22, color: 'var(--fp-ink)',
            }}>Free</span>
            <span style={{ fontSize: 11, color: 'var(--fp-ink-3)' }}>· no ads through Pack III</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--fp-ink-3)', lineHeight: 1.4 }}>
            Function Plane Plus unlocks every pack, removes ads, and adds the daily challenge.
          </div>
          <button style={{
            marginTop: 12, width: '100%', height: 44, borderRadius: 12,
            background: 'var(--fp-ink)', color: 'var(--fp-bg)',
            fontSize: 13.5, fontWeight: 500,
          }}>
            Try Plus — 7 days free
          </button>
        </div>

        <div style={{ paddingTop: 18 }}>
          <button style={{
            width: '100%', height: 44, borderRadius: 12,
            border: '1px solid var(--fp-line)', background: 'transparent',
            color: 'var(--fp-ink-2)', fontSize: 13,
          }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared sub-components ───────────────────────────────────

function TopBar({ onBack, title, padX }) {
  return (
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
      }}>{title}</div>
      <div style={{ width: 38 }}/>
    </div>
  );
}

function Title({ children }) {
  return (
    <div style={{
      fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic',
      fontSize: 36, lineHeight: 1, letterSpacing: '-0.02em',
      padding: '6px 0 8px',
    }}>{children}</div>
  );
}

function SectionLabelS({ children }) {
  return (
    <div style={{
      fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
      color: 'var(--fp-ink-3)', fontWeight: 500,
      padding: '20px 2px 10px',
    }}>{children}</div>
  );
}

function Group({ children }) {
  return (
    <div style={{
      border: '1px solid var(--fp-line)', borderRadius: 14,
      background: 'var(--fp-surface)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>{children}</div>
  );
}

function ToggleRow({ label, defaultOn = false }) {
  const [on, setOn] = React.useState(defaultOn);
  return (
    <div style={rowStyle()}>
      <div style={{ flex: 1, fontSize: 13.5, color: 'var(--fp-ink)' }}>{label}</div>
      <button onClick={() => setOn(o => !o)} aria-label={label} style={{
        width: 42, height: 24, borderRadius: 999,
        background: on ? 'var(--fp-ink)' : 'var(--fp-surface-2)',
        border: '1px solid var(--fp-line)',
        position: 'relative', transition: 'background .15s',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: on ? 20 : 2,
          width: 18, height: 18, borderRadius: '50%',
          background: on ? 'var(--fp-bg)' : 'var(--fp-ink)',
          transition: 'left .15s',
        }}/>
      </button>
    </div>
  );
}

function SegmentRow({ label, value, options, onChange }) {
  return (
    <div style={rowStyle()}>
      <div style={{ flex: 1, fontSize: 13.5, color: 'var(--fp-ink)' }}>{label}</div>
      <div style={{
        display: 'flex', padding: 2, borderRadius: 8,
        background: 'var(--fp-surface-2)', border: '1px solid var(--fp-line)',
      }}>
        {options.map(o => (
          <button key={o.value} onClick={() => onChange(o.value)} style={{
            padding: '5px 10px', borderRadius: 6,
            background: value === o.value ? 'var(--fp-bg)' : 'transparent',
            color: value === o.value ? 'var(--fp-ink)' : 'var(--fp-ink-3)',
            fontSize: 11.5, fontWeight: 500,
          }}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

function SliderRow({ label, defaultValue = 50 }) {
  const [v, setV] = React.useState(defaultValue);
  return (
    <div style={rowStyle()}>
      <div style={{ flex: '0 0 110px', fontSize: 13.5, color: 'var(--fp-ink)' }}>{label}</div>
      <input type="range" min="0" max="100" value={v} onChange={e => setV(+e.target.value)} style={{
        flex: 1, accentColor: 'var(--fp-ink)',
      }}/>
      <span className="fp-mono" style={{ flex: '0 0 32px', textAlign: 'right', fontSize: 11.5, color: 'var(--fp-ink-3)' }}>{v}</span>
    </div>
  );
}

function NavRow({ label, right = null }) {
  return (
    <button style={{ ...rowStyle(), cursor: 'pointer', textAlign: 'left' }}>
      <div style={{ flex: 1, fontSize: 13.5, color: 'var(--fp-ink)' }}>{label}</div>
      {right}
      <Icon.Chevron size={14} c="var(--fp-ink-4)"/>
    </button>
  );
}

function Pill({ children, muted }) {
  return (
    <span style={{
      fontSize: 10, padding: '3px 8px', borderRadius: 999,
      background: muted ? 'transparent' : 'var(--fp-ink)',
      color: muted ? 'var(--fp-ink-3)' : 'var(--fp-bg)',
      border: muted ? '1px solid var(--fp-line)' : '0',
      letterSpacing: '0.04em', textTransform: 'uppercase',
    }}>{children}</span>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{
      padding: '14px 14px',
      border: '1px solid var(--fp-line)', borderRadius: 14,
      background: 'var(--fp-surface)',
    }}>
      <div style={{
        fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic',
        fontSize: 26, lineHeight: 1, color: 'var(--fp-ink)', letterSpacing: '-0.02em',
      }}>{value}</div>
      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--fp-ink-3)', letterSpacing: '0.02em' }}>{label}</div>
    </div>
  );
}

function rowStyle() {
  return {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 14px',
    borderTop: '1px solid var(--fp-line)',
    background: 'transparent',
  };
}

window.SettingsScreen = SettingsScreen;
window.AccountScreen = AccountScreen;

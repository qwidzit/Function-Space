// Function Plane — Settings screen

function SettingsScreen({ onBack, settings, updateSetting, density = 'comfortable' }) {
  const padX = density === 'compact' ? 18 : 22;

  return (
    <div className="fp-screen" style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      boxSizing: 'border-box',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `calc(14px + env(safe-area-inset-top, 0px)) ${padX}px 6px`,
        flex: '0 0 auto',
      }}>
        <button onClick={onBack} aria-label="Back" style={{
          width: 38, height: 38, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--fp-ink-2)',
        }}>
          <Icon.Chevron dir="left" size={20} />
        </button>
        <div style={{ fontSize: 11.5, color: 'var(--fp-ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Settings
        </div>
        <div style={{ width: 38 }} />
      </div>

      <div className="fp-scroll" style={{
        flex: 1, overflowY: 'auto',
        padding: `0 ${padX}px calc(24px + env(safe-area-inset-bottom, 0px))`,
      }}>
        <STitle>Settings</STitle>

        <SSection>Appearance</SSection>
        <SGroup>
          <SegRow label="Theme"
            value={settings.theme}
            options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
            onChange={v => updateSetting('theme', v)} />
          <SegRow label="Density"
            value={settings.density}
            options={[{ value: 'compact', label: 'Compact' }, { value: 'comfortable', label: 'Comfort' }]}
            onChange={v => updateSetting('density', v)} />
        </SGroup>

        <SSection>Sound &amp; haptics</SSection>
        <SGroup>
          <TogRow label="Sound effects" value={settings.sound}   onChange={v => updateSetting('sound', v)} />
          <TogRow label="Music"         value={settings.music}   onChange={v => updateSetting('music', v)} />
          <TogRow label="Haptics"       value={settings.haptics} onChange={v => updateSetting('haptics', v)} />
          <SliderRow label="Volume" value={settings.volume} onChange={v => updateSetting('volume', v)} />
        </SGroup>

        <SSection>Gameplay</SSection>
        <SGroup>
          <TogRow label="Show grid labels"  value={settings.gridLabels}    onChange={v => updateSetting('gridLabels', v)} />
          <TogRow label="Snap to integers"  value={settings.snapIntegers}  onChange={v => updateSetting('snapIntegers', v)} />
          <TogRow label="Auto-zoom on play" value={settings.autoZoom}      onChange={v => updateSetting('autoZoom', v)} />
          <SegRow label="Notation"
            value={settings.notation}
            options={[{ value: 'standard', label: 'Standard' }, { value: 'pretty', label: 'Pretty' }]}
            onChange={v => updateSetting('notation', v)} />
        </SGroup>

        <SSection>Notifications</SSection>
        <SGroup>
          <TogRow label="Daily challenge"    value={settings.notifDaily}    onChange={v => updateSetting('notifDaily', v)} />
          <TogRow label="New pack releases"  value={settings.notifNewPacks} onChange={v => updateSetting('notifNewPacks', v)} />
          <TogRow label="Friends activity"   value={settings.notifFriends}  onChange={v => updateSetting('notifFriends', v)} />
        </SGroup>

        <SSection>About</SSection>
        <SGroup>
          <SNavRow label="Privacy policy"        onPress={() => {}} />
          <SNavRow label="Terms of service"      onPress={() => {}} />
          <SNavRow label="Open source licenses"  onPress={() => {}} />
          <SNavRow label="Contact support"       onPress={() => alert('support@functionplane.app')} />
        </SGroup>

        <div style={{
          textAlign: 'center', fontSize: 10.5, color: 'var(--fp-ink-4)',
          letterSpacing: '0.06em', textTransform: 'uppercase', paddingTop: 18,
        }}>
          v 1.0 · build 2
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function STitle({ children }) {
  return (
    <div style={{
      fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic',
      fontSize: 36, lineHeight: 1, letterSpacing: '-0.02em',
      padding: '6px 0 8px',
    }}>{children}</div>
  );
}

function SSection({ children }) {
  return (
    <div style={{
      fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
      color: 'var(--fp-ink-3)', fontWeight: 500,
      padding: '20px 2px 10px',
    }}>{children}</div>
  );
}

function SGroup({ children }) {
  return (
    <div style={{
      border: '1px solid var(--fp-line)', borderRadius: 14,
      background: 'var(--fp-surface)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>{children}</div>
  );
}

function sRowBase() {
  return {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 14px',
    borderTop: '1px solid var(--fp-line)',
    background: 'transparent',
  };
}

function TogRow({ label, value, onChange }) {
  return (
    <div style={sRowBase()}>
      <div style={{ flex: 1, fontSize: 13.5, color: 'var(--fp-ink)' }}>{label}</div>
      <button onClick={() => onChange(!value)} aria-label={label} style={{
        width: 42, height: 24, borderRadius: 999,
        background: value ? 'var(--fp-ink)' : 'var(--fp-surface-2)',
        border: '1px solid var(--fp-line)',
        position: 'relative', transition: 'background .15s', cursor: 'pointer',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: value ? 20 : 2,
          width: 18, height: 18, borderRadius: '50%',
          background: value ? 'var(--fp-bg)' : 'var(--fp-ink)',
          transition: 'left .15s',
        }}/>
      </button>
    </div>
  );
}

function SegRow({ label, value, options, onChange }) {
  return (
    <div style={sRowBase()}>
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
            fontSize: 11.5, fontWeight: 500, cursor: 'pointer',
          }}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

function SliderRow({ label, value, onChange }) {
  return (
    <div style={sRowBase()}>
      <div style={{ fontSize: 13.5, color: 'var(--fp-ink)', flex: '0 0 auto' }}>{label}</div>
      <input type="range" min="0" max="100" value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: 'var(--fp-ink)', marginLeft: 8 }}/>
    </div>
  );
}

function SNavRow({ label, onPress }) {
  return (
    <button onClick={onPress} style={{ ...sRowBase(), cursor: 'pointer', textAlign: 'left', width: '100%' }}>
      <div style={{ flex: 1, fontSize: 13.5, color: 'var(--fp-ink)' }}>{label}</div>
      <Icon.Chevron size={14} c="var(--fp-ink-4)"/>
    </button>
  );
}

window.SettingsScreen = SettingsScreen;

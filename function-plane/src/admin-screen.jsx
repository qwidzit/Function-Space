// Function Plane — Admin panel
// Visible only to the user with display name "Test Account". Lets them edit
// pack metadata (name, allowed equation class) and per-level data
// (level name, ball position, stars, score & equation goals). Writes go to the
// pack_overrides / level_overrides Supabase tables; on save the parent app
// re-fetches overrides and the change becomes live for everyone.

const { useState: useAS, useEffect: useASE } = React;

const FUNCTION_CLASSES = [
  { id: '',          label: 'Any (no restriction)' },
  { id: 'linear',    label: 'Linear only' },
  { id: 'quadratic', label: 'Quadratic only' },
  { id: 'trig',      label: 'Trigonometry only' },
  { id: 'exp',       label: 'Exponential / log only' },
  { id: 'cubic',     label: 'Cubic only' },
];

function AdminScreen({ onBack, density = 'comfortable', onChanged }) {
  const padX = density === 'compact' ? 18 : 22;
  const [view, setView]   = useAS('list');           // 'list' | 'pack' | 'level'
  const [pack, setPack]   = useAS(null);
  const [levelIndex, setLI] = useAS(0);

  if (view === 'pack' && pack)
    return <PackEditor pack={pack} padX={padX}
      onBack={() => setView('list')}
      onChanged={onChanged}
      onPickLevel={(idx) => { setLI(idx); setView('level'); }}/>;

  if (view === 'level' && pack)
    return <LevelEditor pack={pack} levelIndex={levelIndex} padX={padX}
      onBack={() => setView('pack')}
      onChanged={onChanged}/>;

  return (
    <ScreenFrameAS title="Admin · Packs" onBack={onBack} padX={padX}>
      <div style={{ padding: '14px 0 24px' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fp-ink-3)', marginBottom: 8 }}>
          Roman packs
        </div>
        {ROMAN_PACKS.map(p => (
          <PackRow key={p.id} pack={p} onClick={() => { setPack(p); setView('pack'); }}/>
        ))}

        <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fp-ink-3)', marginBottom: 8, marginTop: 18 }}>
          Themed packs
        </div>
        {SPECIAL_PACKS.map(p => (
          <PackRow key={p.id} pack={p} onClick={() => { setPack(p); setView('pack'); }}/>
        ))}
      </div>
    </ScreenFrameAS>
  );
}

function PackRow({ pack, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px', marginBottom: 6,
      borderRadius: 12, background: 'var(--fp-surface)', border: '1px solid var(--fp-line)',
      textAlign: 'left',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flex: '0 0 36px',
        background: 'var(--fp-surface-2)', border: '1px solid var(--fp-line)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Geist Mono', monospace", fontSize: 13, color: 'var(--fp-ink)',
      }}>{pack.numeral}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fp-ink)' }}>{pack.name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--fp-ink-3)' }}>
          {pack.id} {pack.allowedClass ? `· ${pack.allowedClass}` : ''}
        </div>
      </div>
      <Icon.Chevron dir="right" size={14} c="var(--fp-ink-3)"/>
    </button>
  );
}

// ─── Pack editor ───────────────────────────────────────────────────────────

function PackEditor({ pack, padX, onBack, onPickLevel, onChanged }) {
  const [name, setName] = useAS(pack.name || '');
  const [cls,  setCls]  = useAS(pack.allowedClass || '');
  const [busy, setBusy] = useAS(false);
  const [msg,  setMsg]  = useAS('');

  const save = async () => {
    setBusy(true); setMsg('');
    try {
      await FP_AUTH.savePackOverride(pack.id, {
        name: name.trim() || null,
        allowed_class: cls || null,
      });
      setMsg('Saved');
      onChanged && await onChanged();
    } catch (e) { setMsg(e.message); }
    finally    { setBusy(false); }
  };

  return (
    <ScreenFrameAS title={`Pack · ${pack.id}`} onBack={onBack} padX={padX}>
      <div style={{ padding: '18px 0 24px' }}>
        <FieldText label="Pack name" value={name} onChange={setName}/>
        <FieldSelect label="Allowed equation class" value={cls} onChange={setCls} options={FUNCTION_CLASSES}/>

        <button onClick={save} disabled={busy} style={primaryBtn(busy)}>
          {busy ? 'Saving…' : 'Save pack'}
        </button>
        {msg && <div style={{ marginTop: 10, fontSize: 12, textAlign: 'center', color: msg === 'Saved' ? 'var(--fp-accent)' : '#e34' }}>{msg}</div>}

        <div style={{ height: 1, background: 'var(--fp-line)', margin: '24px 0 14px' }}/>

        <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fp-ink-3)', marginBottom: 10 }}>
          Levels
        </div>
        {Array.from({ length: 10 }, (_, i) => (
          <button key={i} onClick={() => onPickLevel(i)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 12px', marginBottom: 5,
            borderRadius: 11, background: 'var(--fp-surface)', border: '1px solid var(--fp-line)',
            textAlign: 'left',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, flex: '0 0 28px',
              background: 'var(--fp-surface-2)', border: '1px solid var(--fp-line)',
              fontFamily: "'Geist Mono', monospace", fontSize: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fp-ink)',
            }}>{i+1}</div>
            <div style={{ flex: 1, fontSize: 13, color: 'var(--fp-ink)' }}>
              {getLevelName(pack.id, i)}
            </div>
            <Icon.Chevron dir="right" size={13} c="var(--fp-ink-3)"/>
          </button>
        ))}
      </div>
    </ScreenFrameAS>
  );
}

// ─── Level editor ──────────────────────────────────────────────────────────

function LevelEditor({ pack, levelIndex, padX, onBack, onChanged }) {
  const data = getLevelData(pack.id, levelIndex);
  const ov   = window.FP_LEVEL_OVERRIDES?.[`${pack.id}-${levelIndex}`] || {};

  const [name,      setName]      = useAS(ov.name || LEVEL_NAMES[levelIndex] || '');
  const [ballX,     setBallX]     = useAS(String(data.ball.x));
  const [ballY,     setBallY]     = useAS(String(data.ball.y));
  const [scoreGoal, setScoreGoal] = useAS(String(data.scoreGoal));
  const [eqGoal,    setEqGoal]    = useAS(String(data.eqGoal));
  const [stars,     setStars]     = useAS(data.stars.map(s => ({ x: String(s.x), y: String(s.y) })));
  const [busy, setBusy] = useAS(false);
  const [msg,  setMsg]  = useAS('');

  const setStar = (i, k, v) => setStars(arr => arr.map((s, idx) => idx === i ? { ...s, [k]: v } : s));
  const addStar = () => setStars(arr => [...arr, { x: '0', y: '0' }]);
  const removeStar = (i) => setStars(arr => arr.filter((_, idx) => idx !== i));

  const save = async () => {
    setBusy(true); setMsg('');
    try {
      const patch = {
        name: name.trim() || null,
        ball_x: numOrNull(ballX),
        ball_y: numOrNull(ballY),
        stars: stars.map(s => ({ x: Number(s.x), y: Number(s.y) }))
                    .filter(s => isFinite(s.x) && isFinite(s.y)),
        score_goal: intOrNull(scoreGoal),
        eq_goal:    intOrNull(eqGoal),
      };
      if (!patch.stars.length) throw new Error('At least one star is required');
      if (patch.ball_x == null || patch.ball_y == null) throw new Error('Ball position is required');
      if (patch.score_goal == null || patch.eq_goal == null) throw new Error('Both star goals are required');
      await FP_AUTH.saveLevelOverride(pack.id, levelIndex, patch);
      setMsg('Saved');
      onChanged && await onChanged();
    } catch (e) { setMsg(e.message); }
    finally    { setBusy(false); }
  };

  return (
    <ScreenFrameAS title={`${pack.id} · Level ${levelIndex+1}`} onBack={onBack} padX={padX}>
      <div style={{ padding: '18px 0 24px' }}>
        <FieldText label="Level name" value={name} onChange={setName} placeholder={LEVEL_NAMES[levelIndex]}/>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}><FieldText label="Ball x" value={ballX} onChange={setBallX}/></div>
          <div style={{ flex: 1 }}><FieldText label="Ball y" value={ballY} onChange={setBallY}/></div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}><FieldText label="Score goal (≤ for 2★)" value={scoreGoal} onChange={setScoreGoal}/></div>
          <div style={{ flex: 1 }}><FieldText label="Equation goal (≤ for 3★)" value={eqGoal} onChange={setEqGoal}/></div>
        </div>

        <div style={{ marginTop: 12, marginBottom: 8 }}>
          <div style={{ fontSize: 11.5, color: 'var(--fp-ink-3)', letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: 8 }}>
            Stars to collect
          </div>
          {stars.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ width: 18, fontSize: 11.5, color: 'var(--fp-ink-4)', fontFamily: "'Geist Mono', monospace" }}>{i+1}</span>
              <input value={s.x} onChange={e => setStar(i, 'x', e.target.value)} placeholder="x" style={miniInput()}/>
              <input value={s.y} onChange={e => setStar(i, 'y', e.target.value)} placeholder="y" style={miniInput()}/>
              <button onClick={() => removeStar(i)} style={{ width: 28, height: 28, borderRadius: 7, color: 'var(--fp-ink-4)', fontSize: 16 }}>×</button>
            </div>
          ))}
          <button onClick={addStar} style={{ marginTop: 4, fontSize: 12, color: 'var(--fp-ink-3)' }}>+ add star</button>
        </div>

        <button onClick={save} disabled={busy} style={primaryBtn(busy)}>
          {busy ? 'Saving…' : 'Save level'}
        </button>
        {msg && <div style={{ marginTop: 10, fontSize: 12, textAlign: 'center', color: msg === 'Saved' ? 'var(--fp-accent)' : '#e34' }}>{msg}</div>}
      </div>
    </ScreenFrameAS>
  );
}

// ─── Shared bits ───────────────────────────────────────────────────────────

function ScreenFrameAS({ title, onBack, padX, children }) {
  return (
    <div className="fp-screen" style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', boxSizing:'border-box' }}>
      <div style={{
        padding: `calc(14px + env(safe-area-inset-top, 0px)) ${padX}px 12px`,
        display:'flex', alignItems:'center', gap:12, flex:'0 0 auto',
        borderBottom: '1px solid var(--fp-line)',
      }}>
        <button onClick={onBack} style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--fp-ink-2)' }}>
          <Icon.Chevron dir="left" size={18}/>
        </button>
        <div style={{ fontFamily:"'Instrument Serif', Georgia, serif", fontStyle:'italic', fontSize:22, letterSpacing:'-0.02em', color:'var(--fp-ink)' }}>
          {title}
        </div>
      </div>
      <div className="fp-scroll" style={{ flex:1, overflowY:'auto', padding:`0 ${padX}px`, paddingBottom:'max(28px, env(safe-area-inset-bottom, 0px))' }}>
        {children}
      </div>
    </div>
  );
}

function FieldText({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11.5, color: 'var(--fp-ink-3)', marginBottom: 5, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{label}</div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%', height:42, borderRadius:10, boxSizing:'border-box', padding:'0 12px', fontSize:14,
          background:'var(--fp-surface)', border:'1px solid var(--fp-line)', color:'var(--fp-ink)', outline:'none' }}/>
    </div>
  );
}

function FieldSelect({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11.5, color: 'var(--fp-ink-3)', marginBottom: 5, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{label}</div>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width:'100%', height:42, borderRadius:10, boxSizing:'border-box', padding:'0 10px', fontSize:14,
          background:'var(--fp-surface)', border:'1px solid var(--fp-line)', color:'var(--fp-ink)', outline:'none' }}>
        {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );
}

function miniInput() {
  return { flex:1, height:36, borderRadius:8, boxSizing:'border-box', padding:'0 10px', fontSize:13,
    background:'var(--fp-surface)', border:'1px solid var(--fp-line)', color:'var(--fp-ink)',
    outline:'none', fontFamily:"'Geist Mono', monospace" };
}

function primaryBtn(disabled) {
  return { width:'100%', height:48, borderRadius:13, background:'var(--fp-accent)',
    color:'var(--fp-accent-ink)', fontSize:14, fontWeight:500, opacity: disabled ? 0.6 : 1, marginTop: 8 };
}

const numOrNull = s => { const n = Number(s); return isFinite(n) ? n : null; };
const intOrNull = s => { const n = parseInt(s, 10); return isFinite(n) ? n : null; };

window.AdminScreen = AdminScreen;

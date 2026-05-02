// Function Plane — Level Screen (Desmos-style)
// Pannable + zoomable coordinate plane with equations panel.

const { useState: useStateLv, useRef: useRefLv, useEffect: useEffectLv, useMemo: useMemoLv, useCallback: useCallbackLv } = React;

// Color palette for equations (Desmos-style)
const EQ_COLORS = ['#c74440', '#2d70b3', '#388c46', '#6042a6', '#fa7e19', '#000000'];

// ─────────────────────────────────────────────────────────────
// Function evaluation — safe-ish parser using new Function
// ─────────────────────────────────────────────────────────────
function compileFn(expr) {
  if (!expr || !expr.trim()) return null;
  // normalize: ^ → **, implicit mul like 2x → 2*x, π → Math.PI
  let s = expr.replace(/\s+/g, '');
  s = s.replace(/π/g, '(Math.PI)');
  s = s.replace(/\^/g, '**');
  // implicit mul: digit followed by letter or '('
  s = s.replace(/(\d)([a-zA-Z(])/g, '$1*$2');
  // ) followed by ( or letter or digit
  s = s.replace(/\)([a-zA-Z(0-9])/g, ')*$1');
  // letter followed by '(' is a function call — leave alone
  // map common math fns
  const map = ['sin','cos','tan','asin','acos','atan','sqrt','abs','log','exp','floor','ceil','round','max','min','pow'];
  map.forEach(fn => {
    s = s.replace(new RegExp(`\\b${fn}\\(`, 'g'), `Math.${fn}(`);
  });
  s = s.replace(/\bln\(/g, 'Math.log(');
  s = s.replace(/\be\b/g, '(Math.E)');
  try {
    // eslint-disable-next-line no-new-func
    const f = new Function('x', `try { return (${s}); } catch(e) { return NaN; }`);
    // sanity-test
    const test = f(0);
    if (typeof test !== 'number' && !Number.isNaN(test)) return null;
    return f;
  } catch (e) {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Coordinate plane (interactive)
// ─────────────────────────────────────────────────────────────
function CoordPlane({ width, height, equations, dark, level, running }) {
  // viewport: center (cx, cy) in math units, scale = pixels per unit
  const [view, setView] = useStateLv({ cx: 0, cy: 0, scale: 32 });
  const dragRef = useRefLv(null);
  const pinchRef = useRefLv(null);
  const svgRef = useRefLv(null);

  // m2p (math → pixel) and p2m (pixel → math)
  const m2p = (x, y) => ({
    x: width / 2 + (x - view.cx) * view.scale,
    y: height / 2 - (y - view.cy) * view.scale,
  });

  // Compute visible math range
  const range = useMemoLv(() => {
    const halfX = (width / 2) / view.scale;
    const halfY = (height / 2) / view.scale;
    return {
      xMin: view.cx - halfX, xMax: view.cx + halfX,
      yMin: view.cy - halfY, yMax: view.cy + halfY,
    };
  }, [view, width, height]);

  // Choose nice grid step based on scale
  const gridStep = useMemoLv(() => {
    // target ~30-60px between minor lines
    const target = 40 / view.scale; // math units per minor line
    const pow = Math.pow(10, Math.floor(Math.log10(target)));
    const norm = target / pow;
    let step;
    if (norm < 1.5) step = 1 * pow;
    else if (norm < 3) step = 2 * pow;
    else if (norm < 7) step = 5 * pow;
    else step = 10 * pow;
    return step;
  }, [view.scale]);

  // Pointer handlers — pan
  const onPointerDown = (e) => {
    if (e.button && e.button !== 0) return;
    e.target.setPointerCapture?.(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy, id: e.pointerId };
  };
  const onPointerMove = (e) => {
    if (!dragRef.current || dragRef.current.id !== e.pointerId) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    setView(v => ({
      ...v,
      cx: dragRef.current.cx - dx / v.scale,
      cy: dragRef.current.cy + dy / v.scale,
    }));
  };
  const onPointerUp = (e) => {
    if (dragRef.current && dragRef.current.id === e.pointerId) dragRef.current = null;
  };

  // Wheel zoom
  const onWheel = (e) => {
    e.preventDefault();
    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const factor = Math.exp(-e.deltaY * 0.0015);
    setView(v => {
      const newScale = Math.max(6, Math.min(400, v.scale * factor));
      // keep cursor anchor
      const mxBefore = v.cx + (px - width / 2) / v.scale;
      const myBefore = v.cy - (py - height / 2) / v.scale;
      const newCx = mxBefore - (px - width / 2) / newScale;
      const newCy = myBefore + (py - height / 2) / newScale;
      return { cx: newCx, cy: newCy, scale: newScale };
    });
  };

  // Build grid lines
  const lines = [];
  const ticks = [];
  // minor lines
  const minorStep = gridStep;
  const majorStep = gridStep * 5;
  const x0 = Math.floor(range.xMin / minorStep) * minorStep;
  for (let x = x0; x <= range.xMax; x += minorStep) {
    const isMajor = Math.abs(Math.round(x / majorStep) * majorStep - x) < minorStep * 0.01;
    const px = m2p(x, 0).x;
    lines.push(<line key={`vx${x.toFixed(4)}`} x1={px} y1={0} x2={px} y2={height}
      stroke={isMajor ? 'var(--lv-grid-major)' : 'var(--lv-grid-minor)'} strokeWidth={isMajor ? 1 : 1}/>);
  }
  const y0 = Math.floor(range.yMin / minorStep) * minorStep;
  for (let y = y0; y <= range.yMax; y += minorStep) {
    const isMajor = Math.abs(Math.round(y / majorStep) * majorStep - y) < minorStep * 0.01;
    const py = m2p(0, y).y;
    lines.push(<line key={`hy${y.toFixed(4)}`} x1={0} y1={py} x2={width} y2={py}
      stroke={isMajor ? 'var(--lv-grid-major)' : 'var(--lv-grid-minor)'} strokeWidth={isMajor ? 1 : 1}/>);
  }

  // Axes
  const axisX = m2p(0, 0).y;
  const axisY = m2p(0, 0).x;

  // Tick labels (every majorStep)
  const tickLabels = [];
  const tStep = majorStep;
  for (let x = Math.ceil(range.xMin / tStep) * tStep; x <= range.xMax; x += tStep) {
    if (Math.abs(x) < tStep * 0.01) continue;
    const px = m2p(x, 0).x;
    const py = Math.max(12, Math.min(height - 4, axisX + 12));
    tickLabels.push(<text key={`tx${x.toFixed(4)}`} x={px} y={py} fontSize="10"
      fontFamily="ui-monospace, monospace" fill="var(--lv-tick)" textAnchor="middle">
      {formatTick(x, tStep)}
    </text>);
  }
  for (let y = Math.ceil(range.yMin / tStep) * tStep; y <= range.yMax; y += tStep) {
    if (Math.abs(y) < tStep * 0.01) continue;
    const py = m2p(0, y).y;
    const px = Math.max(4, Math.min(width - 4, axisY + 6));
    tickLabels.push(<text key={`ty${y.toFixed(4)}`} x={px} y={py + 3} fontSize="10"
      fontFamily="ui-monospace, monospace" fill="var(--lv-tick)" textAnchor="start">
      {formatTick(y, tStep)}
    </text>);
  }

  // Sample equations
  const eqPaths = equations.filter(e => e.visible && e.fn).map((eq, idx) => {
    const path = sampleFn(eq.fn, range.xMin, range.xMax, view.scale, m2p);
    return <path key={eq.id} d={path} stroke={eq.color} strokeWidth="2.2" fill="none"
      strokeLinecap="round" strokeLinejoin="round" />;
  });

  // Stars + ball
  const starsEl = level.stars.map((s, i) => {
    const p = m2p(s.x, s.y);
    return (
      <g key={`s${i}`} transform={`translate(${p.x},${p.y})`}>
        <circle r="13" fill="var(--lv-bg)" opacity="0.7"/>
        <path d="M0 -10 L3 -3 L11 -2 L5 3 L7 11 L0 6 L-7 11 L-5 3 L-11 -2 L-3 -3 Z"
          fill={s.collected ? 'var(--lv-star)' : 'none'}
          stroke="var(--lv-star)" strokeWidth="1.5" strokeLinejoin="round" />
      </g>
    );
  });

  const ball = (() => {
    const p = m2p(level.ball.x, level.ball.y);
    return (
      <g transform={`translate(${p.x},${p.y})`}>
        <circle r="8" fill="var(--lv-ball)" stroke="var(--lv-ball-stroke)" strokeWidth="1.5"/>
        <circle r="2" cx="-2.5" cy="-2.5" fill="var(--lv-ball-shine)"/>
      </g>
    );
  })();

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: 'var(--lv-bg)', overflow: 'hidden',
      touchAction: 'none',
    }}
      onWheel={onWheel}
    >
      <svg
        ref={svgRef}
        width={width} height={height}
        style={{ display: 'block', cursor: dragRef.current ? 'grabbing' : 'grab', userSelect: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Minor + major grid */}
        {lines}
        {/* Axes */}
        <line x1={0} y1={axisX} x2={width} y2={axisX} stroke="var(--lv-axis)" strokeWidth="1.4"/>
        <line x1={axisY} y1={0} x2={axisY} y2={height} stroke="var(--lv-axis)" strokeWidth="1.4"/>
        {/* Origin label */}
        <text x={axisY - 4} y={axisX + 12} fontSize="10" fontFamily="ui-monospace, monospace"
          fill="var(--lv-tick)" textAnchor="end">0</text>
        {/* tick labels */}
        {tickLabels}
        {/* Equations */}
        {eqPaths}
        {/* Stars */}
        {starsEl}
        {/* Ball */}
        {ball}
      </svg>

      {/* Zoom controls */}
      <div style={{
        position: 'absolute', right: 10, bottom: 10,
        display: 'flex', flexDirection: 'column',
        background: 'var(--lv-surface)', border: '1px solid var(--lv-line)',
        borderRadius: 10, overflow: 'hidden',
      }}>
        <button onClick={() => setView(v => ({ ...v, scale: Math.min(400, v.scale * 1.4) }))}
          style={ctrlBtnStyle()} aria-label="Zoom in">+</button>
        <div style={{ height: 1, background: 'var(--lv-line)' }}/>
        <button onClick={() => setView(v => ({ ...v, scale: Math.max(6, v.scale / 1.4) }))}
          style={ctrlBtnStyle()} aria-label="Zoom out">−</button>
        <div style={{ height: 1, background: 'var(--lv-line)' }}/>
        <button onClick={() => setView({ cx: 0, cy: 0, scale: 32 })}
          style={ctrlBtnStyle(true)} aria-label="Recenter">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 3 V6 M12 18 V21 M3 12 H6 M18 12 H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function ctrlBtnStyle(small = false) {
  return {
    width: 34, height: small ? 30 : 32,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--fp-ink)', fontSize: 17, fontWeight: 400,
    background: 'transparent', border: 0, cursor: 'pointer',
  };
}

function formatTick(v, step) {
  if (step >= 1) return Math.round(v).toString();
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  return v.toFixed(decimals);
}

function sampleFn(fn, xMin, xMax, scale, m2p) {
  const stepPx = 2;
  const stepX = stepPx / scale;
  let d = '';
  let pen = false;
  let lastY = NaN;
  for (let x = xMin; x <= xMax; x += stepX) {
    const y = fn(x);
    if (typeof y !== 'number' || !isFinite(y)) {
      pen = false; lastY = NaN; continue;
    }
    const p = m2p(x, y);
    // break on huge jumps
    if (pen && Math.abs(y - lastY) * scale > 1000) {
      pen = false;
    }
    if (!pen) { d += `M${p.x.toFixed(1)} ${p.y.toFixed(1)} `; pen = true; }
    else d += `L${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
    lastY = y;
  }
  return d;
}

// ─────────────────────────────────────────────────────────────
// Equations panel (bottom sheet)
// ─────────────────────────────────────────────────────────────
function EquationsPanel({ equations, setEquations, expanded, onToggle }) {
  const update = (id, patch) => setEquations(eqs => eqs.map(e => e.id === id ? { ...e, ...patch, fn: 'expr' in patch ? compileFn(patch.expr) : e.fn } : e));
  const addRow = () => {
    setEquations(eqs => {
      const id = Math.max(0, ...eqs.map(e => e.id)) + 1;
      return [...eqs, { id, expr: '', fn: null, color: EQ_COLORS[eqs.length % EQ_COLORS.length], visible: true }];
    });
  };
  const removeRow = (id) => setEquations(eqs => eqs.filter(e => e.id !== id));

  return (
    <div style={{
      background: 'var(--lv-surface)',
      borderTop: '1px solid var(--lv-line)',
      display: 'flex', flexDirection: 'column',
      maxHeight: expanded ? 320 : 200,
      transition: 'max-height .2s ease',
    }}>
      {/* Drag handle / collapse */}
      <button onClick={onToggle} style={{
        height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', cursor: 'pointer',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--fp-ink-4)' }}/>
      </button>

      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 12px 8px',
      }}>
        <div style={{
          fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--fp-ink-3)', fontWeight: 500,
        }}>
          Equations <span className="fp-mono" style={{ color: 'var(--fp-ink-4)', marginLeft: 4 }}>
            {equations.filter(e => e.expr.trim()).length}
          </span>
        </div>
        <button onClick={addRow} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 9px 4px 7px', borderRadius: 999,
          background: 'var(--fp-surface-2)', color: 'var(--fp-ink)',
          fontSize: 11.5, fontWeight: 500,
        }}>
          <span style={{ fontSize: 14, lineHeight: 1, marginTop: -1 }}>+</span> Add
        </button>
      </div>

      {/* Rows */}
      <div className="fp-scroll" style={{ flex: 1, overflowY: 'auto', paddingBottom: 6 }}>
        {equations.map((e, idx) => (
          <EquationRow key={e.id} idx={idx} eq={e}
            onChange={(patch) => update(e.id, patch)}
            onRemove={() => removeRow(e.id)}
          />
        ))}
        {equations.length === 0 && (
          <div style={{ padding: '14px 16px', fontSize: 12, color: 'var(--fp-ink-3)' }}>
            Tap <strong>Add</strong> to enter an equation. Try <span className="fp-mono">y = x</span> or <span className="fp-mono">y = sin(x)</span>.
          </div>
        )}
      </div>
    </div>
  );
}

function EquationRow({ idx, eq, onChange, onRemove }) {
  const [focused, setFocused] = useStateLv(false);
  const valid = !eq.expr.trim() || eq.fn != null;
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', gap: 0,
      borderTop: '1px solid var(--lv-line)',
      background: focused ? 'var(--fp-surface-2)' : 'transparent',
    }}>
      {/* Index bubble */}
      <button
        onClick={() => onChange({ visible: !eq.visible })}
        title={eq.visible ? 'Hide' : 'Show'}
        style={{
          width: 36, flex: '0 0 36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', background: 'transparent',
        }}>
        <span style={{
          width: 22, height: 22, borderRadius: '50%',
          background: eq.visible ? eq.color : 'transparent',
          border: `1.5px solid ${eq.color}`,
          color: eq.visible ? '#fff' : eq.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 600, fontFamily: 'ui-monospace, monospace',
        }}>{idx + 1}</span>
      </button>

      {/* Expression input */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 8px 8px 0', minWidth: 0,
      }}>
        <span className="fp-mono" style={{ color: 'var(--fp-ink-3)', fontSize: 14 }}>y =</span>
        <input
          value={eq.expr}
          onChange={e => onChange({ expr: e.target.value })}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={'\u00a0'}
          spellCheck={false}
          style={{
            flex: 1, minWidth: 0,
            background: 'transparent', border: 0, outline: 0,
            fontFamily: 'ui-monospace, "Geist Mono", monospace',
            fontSize: 15, color: valid ? 'var(--fp-ink)' : '#c74440',
            padding: '4px 0',
          }}
        />
      </div>

      {/* Remove */}
      <button onClick={onRemove} aria-label="Remove"
        style={{
          width: 36, flex: '0 0 36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--fp-ink-3)', cursor: 'pointer', background: 'transparent',
        }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Level screen (everything)
// ─────────────────────────────────────────────────────────────
function LevelScreen({ pack, levelIndex, progress, onBack, density = 'comfortable', completed, onCloseComplete, onNextLevel, onReplay }) {
  const [equations, setEquations] = useStateLv([
    { id: 1, expr: '0.4*x + 1', fn: compileFn('0.4*x + 1'), color: EQ_COLORS[0], visible: true },
    { id: 2, expr: '',           fn: null,                   color: EQ_COLORS[1], visible: true },
  ]);
  const [panelOpen, setPanelOpen] = useStateLv(true);

  // Level data — handcrafted for "Pack III · Level 4"
  const level = useMemoLv(() => ({
    ball: { x: -5, y: 5 },
    stars: [
      { x: -2, y: 3, collected: false },
      { x: 1,  y: 2, collected: false },
      { x: 4,  y: 4, collected: false },
    ],
  }), [pack, levelIndex]);

  // Best & current score (illustrative)
  const collected = level.stars.filter(s => s.collected).length;
  const best = progress?.[pack.id]?.best?.[levelIndex] ?? null;
  const stars = progress?.[pack.id]?.stars?.[levelIndex] ?? -1;

  const padX = 14;

  return (
    <div className="fp-screen lv-root" style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      paddingTop: 0,
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `60px ${padX}px 8px`, flex: '0 0 auto',
        background: 'var(--lv-bg)',
      }}>
        <button onClick={onBack} aria-label="Back" style={{
          width: 36, height: 36, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--lv-surface)', border: '1px solid var(--lv-line)',
          color: 'var(--fp-ink-2)',
        }}>
          <Icon.Chevron dir="left" size={18} />
        </button>

        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          minWidth: 0, flex: 1,
        }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--fp-ink-3)', whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
          }}>
            {pack.type === 'roman' ? `Pack ${pack.numeral}` : pack.name} · Level {levelIndex + 1}
          </div>
          <div style={{
            fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic',
            fontSize: 16, lineHeight: 1, color: 'var(--fp-ink)',
            letterSpacing: '-0.02em', whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
          }}>
            {LEVEL_TITLE_OF(pack, levelIndex)}
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          height: 36, padding: '0 12px', borderRadius: 999,
          border: '1px solid var(--lv-line)', background: 'var(--lv-surface)',
        }}>
          <Stars count={stars >= 0 ? stars : 0} total={3} size={11} />
        </div>
      </div>

      {/* HUD bar — best / current score / play */}
      <div style={{
        padding: `0 ${padX}px 8px`, flex: '0 0 auto',
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--lv-bg)',
      }}>
        <HudChip label="Best" value={best == null ? '—' : best} />
        <HudChip label="Eqs" value={equations.filter(e => e.fn).length} />
        <HudChip label="Stars" value={`${collected}/${level.stars.length}`} />
        <button onClick={() => alert('Run — drop the balls (next iteration)')} style={{
          marginLeft: 'auto',
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '8px 14px 8px 16px', borderRadius: 999,
          background: 'var(--fp-accent)', color: 'var(--fp-accent-ink)',
          fontSize: 13, fontWeight: 500,
        }}>
          Play <Icon.Play size={11} c="var(--fp-accent-ink)" />
        </button>
      </div>

      {/* Plane */}
      <div style={{
        flex: 1, position: 'relative', minHeight: 0,
        borderTop: '1px solid var(--lv-line)',
        borderBottom: '1px solid var(--lv-line)',
      }}>
        <PlaneFiller equations={equations} level={level}/>
      </div>

      {/* Equations panel */}
      <EquationsPanel
        equations={equations} setEquations={setEquations}
        expanded={panelOpen} onToggle={() => setPanelOpen(o => !o)}
      />

      {/* Completion popup */}
      {completed && (
        <LevelCompletePopup
          pack={pack} levelIndex={levelIndex}
          score={completed.score}
          stars={completed.stars}
          prevBest={completed.prevBest}
          isNewBest={completed.isNewBest}
          onContinue={onNextLevel}
          onReplay={onReplay}
          onClose={onCloseComplete}
        />
      )}
    </div>
  );
}

function HudChip({ label, value }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 28, padding: '0 10px', borderRadius: 8,
      background: 'var(--lv-surface)', border: '1px solid var(--lv-line)',
    }}>
      <span style={{ fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fp-ink-3)' }}>{label}</span>
      <span className="fp-mono" style={{ fontSize: 12, color: 'var(--fp-ink)' }}>{value}</span>
    </div>
  );
}

// Plane wrapper that measures its own size (so SVG fills)
function PlaneFiller({ equations, level }) {
  const ref = useRefLv(null);
  const [size, setSize] = useStateLv({ w: 360, h: 300 });
  useEffectLv(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(entries => {
      const r = entries[0].contentRect;
      setSize({ w: Math.round(r.width), h: Math.round(r.height) });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
      <CoordPlane width={size.w} height={size.h}
        equations={equations} level={level}
        dark={document.documentElement.dataset.theme === 'dark'} />
    </div>
  );
}

function LEVEL_TITLE_OF(pack, idx) {
  const names = ['Warm-up','First slope','Through the gate','Twin peaks','Reflections',
    'The valley','Crosswinds','Threshold','Loop & catch','The summit'];
  return names[idx] || `Level ${idx + 1}`;
}

window.LevelScreen = LevelScreen;

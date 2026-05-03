// Function Plane — Level Screen with physics simulation

const { useState: useSL, useRef: useRL, useEffect: useEL, useMemo: useML } = React;

// ─── Equation colours (Desmos palette) ──────────────────────
const EQ_COLORS = ['#c74440','#2d70b3','#388c46','#6042a6','#fa7e19','#000000'];

// ─── Physics constants ───────────────────────────────────────
const GRAVITY    = 12;   // math-units / s²
const SUB_STEPS  = 5;    // sub-steps per animation frame
const STAR_R     = 0.55; // collection radius (math units)
const FALL_LIMIT = -13;  // y below which level ends
const TIME_LIMIT = 28;   // seconds before auto-end

function computeScore(starsCollected, eqsUsed, totalStars) {
  // Lower is better: each equation adds 100, each missed star adds 60, +20 base
  return eqsUsed * 100 + (totalStars - starsCollected) * 60 + 20;
}
function starRating(starsCollected, totalStars) {
  if (starsCollected === totalStars) return 3;
  if (starsCollected >= totalStars - 1) return 2;
  return 1;
}

// ─── Expression compiler ─────────────────────────────────────
function compileFn(expr) {
  if (!expr || !expr.trim()) return null;
  let s = expr.replace(/\s+/g, '');
  s = s.replace(/π/g, '(Math.PI)');
  s = s.replace(/\^/g, '**');
  s = s.replace(/(\d)([a-zA-Z(])/g, '$1*$2');
  s = s.replace(/\)([a-zA-Z(0-9])/g, ')*$1');
  const fns = ['sin','cos','tan','asin','acos','atan','sqrt','abs','log','exp','floor','ceil','round','max','min','pow'];
  fns.forEach(f => { s = s.replace(new RegExp(`\\b${f}\\(`, 'g'), `Math.${f}(`); });
  s = s.replace(/\bln\(/g, 'Math.log(');
  s = s.replace(/\be\b/g, '(Math.E)');
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('x', `try{return(${s});}catch(e){return NaN;}`);
    const t = fn(0);
    if (typeof t !== 'number' && !Number.isNaN(t)) return null;
    return fn;
  } catch { return null; }
}

// ─── Physics step (mutates ph in place) ─────────────────────
function physicsStep(ph, fns, dt) {
  // Gravity
  ph.vy -= GRAVITY * dt;
  // Move
  ph.x += ph.vx * dt;
  ph.y += ph.vy * dt;

  // Collision: find the highest curve the ball is at or below
  let hitFn = null, hitY = -Infinity;
  for (const fn of fns) {
    const cy = fn(ph.x);
    if (!isFinite(cy) || isNaN(cy)) continue;
    if (ph.y <= cy && cy > hitY) { hitY = cy; hitFn = fn; }
  }

  if (hitFn !== null) {
    ph.y = hitY;
    // Tangent slope at hit point
    const h = 0.003;
    const fp = hitFn(ph.x + h), fm = hitFn(ph.x - h);
    if (isFinite(fp) && isFinite(fm)) {
      const slope = (fp - fm) / (2 * h);
      const mag   = Math.sqrt(1 + slope * slope);
      const nx    = -slope / mag; // upward surface normal
      const ny    = 1 / mag;
      const vn    = ph.vx * nx + ph.vy * ny; // velocity into surface
      if (vn < 0) {
        ph.vx -= vn * nx;  // remove penetrating component
        ph.vy -= vn * ny;
        ph.vx *= 0.997;    // tiny friction
        ph.vy *= 0.997;
      }
    }
  }

  // Star collection
  for (let i = 0; i < ph.stars.length; i++) {
    if (!ph.stars[i].collected && Math.hypot(ph.x - ph.stars[i].x, ph.y - ph.stars[i].y) < STAR_R) {
      ph.stars[i] = { ...ph.stars[i], collected: true };
    }
  }
}

// ─── Coordinate plane ────────────────────────────────────────
function CoordPlane({ width, height, equations, ballPos, simStars, startPos }) {
  const [view, setView] = useSL({ cx: 0, cy: 0, scale: 40 });
  const svgRef = useRL(null);
  const dragRef = useRL(null);

  const m2p = (mx, my) => ({
    x: width / 2 + (mx - view.cx) * view.scale,
    y: height / 2 - (my - view.cy) * view.scale,
  });

  const range = useML(() => ({
    xMin: view.cx - width  / (2 * view.scale),
    xMax: view.cx + width  / (2 * view.scale),
    yMin: view.cy - height / (2 * view.scale),
    yMax: view.cy + height / (2 * view.scale),
  }), [view, width, height]);

  const gridStep = useML(() => {
    const t = 40 / view.scale;
    const p = Math.pow(10, Math.floor(Math.log10(t)));
    const n = t / p;
    return n < 1.5 ? p : n < 3 ? 2*p : n < 7 ? 5*p : 10*p;
  }, [view.scale]);

  const onPointerDown = e => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { px: e.clientX, py: e.clientY, cx: view.cx, cy: view.cy, id: e.pointerId };
  };
  const onPointerMove = e => {
    if (!dragRef.current || dragRef.current.id !== e.pointerId) return;
    const dx = e.clientX - dragRef.current.px;
    const dy = e.clientY - dragRef.current.py;
    setView(v => ({ ...v, cx: dragRef.current.cx - dx/v.scale, cy: dragRef.current.cy + dy/v.scale }));
  };
  const onPointerUp = () => { dragRef.current = null; };
  const onWheel = e => {
    e.preventDefault();
    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    const f  = Math.exp(-e.deltaY * 0.001);
    setView(v => {
      const s  = Math.max(8, Math.min(400, v.scale * f));
      const mx = v.cx + (px - width/2) / v.scale;
      const my = v.cy - (py - height/2) / v.scale;
      return { cx: mx - (px - width/2)/s, cy: my + (py - height/2)/s, scale: s };
    });
  };

  // Grid
  const lines = [];
  const minor = gridStep, major = gridStep * 5;
  for (let x = Math.floor(range.xMin/minor)*minor; x <= range.xMax; x += minor) {
    const isMj = Math.abs(Math.round(x/major)*major - x) < minor*0.01;
    const px = m2p(x, 0).x;
    lines.push(<line key={`v${x.toFixed(5)}`} x1={px} y1={0} x2={px} y2={height}
      stroke={isMj ? 'var(--lv-grid-major)' : 'var(--lv-grid-minor)'} strokeWidth={1}/>);
  }
  for (let y = Math.floor(range.yMin/minor)*minor; y <= range.yMax; y += minor) {
    const isMj = Math.abs(Math.round(y/major)*major - y) < minor*0.01;
    const py = m2p(0, y).y;
    lines.push(<line key={`h${y.toFixed(5)}`} x1={0} y1={py} x2={width} y2={py}
      stroke={isMj ? 'var(--lv-grid-major)' : 'var(--lv-grid-minor)'} strokeWidth={1}/>);
  }

  const ax = m2p(0, 0);
  const tickLabels = [];
  const ts = major;
  for (let x = Math.ceil(range.xMin/ts)*ts; x <= range.xMax; x += ts) {
    if (Math.abs(x) < ts*0.01) continue;
    const p = m2p(x, 0);
    const ty = Math.max(12, Math.min(height-4, ax.y+12));
    tickLabels.push(<text key={`tx${x.toFixed(3)}`} x={p.x} y={ty} fontSize={10}
      fontFamily="ui-monospace,monospace" fill="var(--lv-tick)" textAnchor="middle">
      {gridStep >= 1 ? Math.round(x) : x.toFixed(1)}
    </text>);
  }
  for (let y = Math.ceil(range.yMin/ts)*ts; y <= range.yMax; y += ts) {
    if (Math.abs(y) < ts*0.01) continue;
    const p = m2p(0, y);
    const tx = Math.max(4, Math.min(width-20, ax.x+6));
    tickLabels.push(<text key={`ty${y.toFixed(3)}`} x={tx} y={p.y+3} fontSize={10}
      fontFamily="ui-monospace,monospace" fill="var(--lv-tick)" textAnchor="start">
      {gridStep >= 1 ? Math.round(y) : y.toFixed(1)}
    </text>);
  }

  // Equation curves
  const eqPaths = equations.filter(e => e.fn && e.visible).map(eq => {
    let d = '', pen = false, prevY = NaN;
    const step = 2 / view.scale;
    for (let x = range.xMin; x <= range.xMax; x += step) {
      const y = eq.fn(x);
      if (!isFinite(y) || Math.abs(y - prevY)*view.scale > 900) { pen = false; prevY = NaN; continue; }
      const p = m2p(x, y);
      d += pen ? `L${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `M${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      pen = true; prevY = y;
    }
    return <path key={eq.id} d={d} stroke={eq.color} strokeWidth={2.2}
      fill="none" strokeLinecap="round" strokeLinejoin="round"/>;
  });

  // Stars
  const starsEl = simStars.map((s, i) => {
    const p = m2p(s.x, s.y);
    return (
      <g key={i} transform={`translate(${p.x},${p.y})`}>
        <circle r={14} fill="var(--lv-bg)" opacity={0.65}/>
        <path d="M0 -10 L3 -3 L11 -2 L5 3 L7 11 L0 6 L-7 11 L-5 3 L-11 -2 L-3 -3 Z"
          fill={s.collected ? 'var(--lv-star)' : 'none'}
          stroke="var(--lv-star)" strokeWidth={1.5} strokeLinejoin="round"
          style={{ transition: s.collected ? 'fill .12s' : 'none' }}/>
      </g>
    );
  });

  // Ball
  const bp = m2p(ballPos.x, ballPos.y);
  // Ghost start marker
  const sp = m2p(startPos.x, startPos.y);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%',
      background: 'var(--lv-bg)', overflow: 'hidden', touchAction: 'none' }}
      onWheel={onWheel}>
      <svg ref={svgRef} width={width} height={height}
        style={{ display: 'block', cursor: 'grab', userSelect: 'none' }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        {lines}
        <line x1={0} y1={ax.y} x2={width} y2={ax.y} stroke="var(--lv-axis)" strokeWidth={1.4}/>
        <line x1={ax.x} y1={0} x2={ax.x} y2={height} stroke="var(--lv-axis)" strokeWidth={1.4}/>
        <text x={Math.min(ax.x - 4, width - 4)} y={Math.max(12, ax.y + 12)}
          fontSize={10} fontFamily="ui-monospace,monospace" fill="var(--lv-tick)" textAnchor="end">0</text>
        {tickLabels}
        {eqPaths}
        {/* Start position ghost */}
        <circle cx={sp.x} cy={sp.y} r={8}
          fill="none" stroke="var(--lv-ball)" strokeWidth={1.5} strokeDasharray="3 2" opacity={0.35}/>
        {starsEl}
        {/* Ball */}
        <g transform={`translate(${bp.x},${bp.y})`}>
          <circle r={8} fill="var(--lv-ball)" stroke="var(--lv-ball-stroke)" strokeWidth={1.5}/>
          <circle r={2.5} cx={-2.5} cy={-2.5} fill="var(--lv-ball-shine)"/>
        </g>
      </svg>

      {/* Zoom controls */}
      <div style={{ position: 'absolute', right: 10, bottom: 10,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: 'var(--lv-surface)', border: '1px solid var(--lv-line)', borderRadius: 10 }}>
        <ZBtn onClick={() => setView(v => ({...v, scale: Math.min(400, v.scale*1.4)}))}>+</ZBtn>
        <div style={{ height: 1, background: 'var(--lv-line)' }}/>
        <ZBtn onClick={() => setView(v => ({...v, scale: Math.max(6, v.scale/1.4)}))}>−</ZBtn>
        <div style={{ height: 1, background: 'var(--lv-line)' }}/>
        <ZBtn onClick={() => setView({ cx:0, cy:0, scale:40 })} sm>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <circle cx={12} cy={12} r={3} stroke="currentColor" strokeWidth={2}/>
            <path d="M12 3V6M12 18V21M3 12H6M18 12H21" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
          </svg>
        </ZBtn>
      </div>
    </div>
  );
}

function ZBtn({ children, onClick, sm }) {
  return (
    <button onClick={onClick} style={{ width: 34, height: sm ? 28 : 32,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, color: 'var(--fp-ink)', cursor: 'pointer' }}>
      {children}
    </button>
  );
}

// ─── Equations panel (bottom sheet) ──────────────────────────
function EquationsPanel({ equations, setEquations, expanded, onToggle, disabled }) {
  const addRow = () => setEquations(eqs => {
    const id = Math.max(0, ...eqs.map(e => e.id)) + 1;
    return [...eqs, { id, expr: '', fn: null, color: EQ_COLORS[eqs.length % EQ_COLORS.length], visible: true }];
  });
  const update = (id, patch) => setEquations(eqs => eqs.map(e =>
    e.id === id ? { ...e, ...patch, fn: 'expr' in patch ? compileFn(patch.expr) : e.fn } : e
  ));
  const remove = id => setEquations(eqs => eqs.filter(e => e.id !== id));

  return (
    <div style={{ background: 'var(--lv-surface)', borderTop: '1px solid var(--lv-line)',
      display: 'flex', flexDirection: 'column',
      maxHeight: expanded ? 300 : 188, transition: 'max-height .2s ease',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* Handle */}
      <button onClick={onToggle} style={{ height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--fp-ink-4)' }}/>
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px 8px' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fp-ink-3)', fontWeight: 500 }}>
          Equations <span className="fp-mono" style={{ color: 'var(--fp-ink-4)', marginLeft: 4 }}>
            {equations.filter(e => e.expr.trim()).length}
          </span>
        </div>
        <button onClick={addRow} disabled={disabled} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '4px 9px 4px 7px', borderRadius: 999,
          background: 'var(--fp-surface-2)', color: 'var(--fp-ink)',
          fontSize: 11.5, fontWeight: 500, opacity: disabled ? 0.5 : 1,
        }}>
          <span style={{ fontSize: 14, lineHeight: 1, marginTop: -1 }}>+</span> Add
        </button>
      </div>

      {/* Rows */}
      <div className="fp-scroll" style={{ flex: 1, overflowY: 'auto', paddingBottom: 6 }}>
        {equations.map((e, i) => (
          <EqRow key={e.id} idx={i} eq={e} disabled={disabled}
            onChange={p => update(e.id, p)} onRemove={() => remove(e.id)} />
        ))}
        {equations.length === 0 && (
          <div style={{ padding: '14px 16px', fontSize: 12, color: 'var(--fp-ink-3)' }}>
            Tap <strong>Add</strong> to enter an equation. Try <span className="fp-mono">y = -x</span>.
          </div>
        )}
      </div>
    </div>
  );
}

function EqRow({ idx, eq, onChange, onRemove, disabled }) {
  const [focused, setFocused] = useSL(false);
  const valid = !eq.expr.trim() || eq.fn != null;
  return (
    <div style={{ display: 'flex', alignItems: 'stretch',
      borderTop: '1px solid var(--lv-line)',
      background: focused ? 'var(--fp-surface-2)' : 'transparent' }}>
      <button onClick={() => !disabled && onChange({ visible: !eq.visible })} style={{
        width: 36, flex: '0 0 36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ width: 22, height: 22, borderRadius: '50%',
          background: eq.visible ? eq.color : 'transparent', border: `1.5px solid ${eq.color}`,
          color: eq.visible ? '#fff' : eq.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 600, fontFamily: 'ui-monospace,monospace' }}>
          {idx + 1}
        </span>
      </button>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 8px 8px 0', minWidth: 0 }}>
        <span className="fp-mono" style={{ color: 'var(--fp-ink-3)', fontSize: 14 }}>y =</span>
        <input value={eq.expr} onChange={e => onChange({ expr: e.target.value })}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          disabled={disabled} spellCheck={false}
          style={{ flex: 1, minWidth: 0, background: 'transparent', border: 0, outline: 0,
            fontFamily: 'ui-monospace,"Geist Mono",monospace', fontSize: 15,
            color: valid ? 'var(--fp-ink)' : '#c74440', padding: '4px 0' }}/>
      </div>
      <button onClick={() => !disabled && onRemove()} style={{
        width: 36, flex: '0 0 36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fp-ink-3)' }}>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
          <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

// ─── Plane wrapper (measures own size) ───────────────────────
function PlaneFiller({ equations, ballPos, simStars, startPos }) {
  const ref = useRL(null);
  const [size, setSize] = useSL({ w: 360, h: 300 });
  useEL(() => {
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
        equations={equations} ballPos={ballPos} simStars={simStars} startPos={startPos}/>
    </div>
  );
}

// ─── HUD chip ────────────────────────────────────────────────
function HudChip({ label, value }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
      height: 28, padding: '0 10px', borderRadius: 8,
      background: 'var(--lv-surface)', border: '1px solid var(--lv-line)' }}>
      <span style={{ fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fp-ink-3)' }}>{label}</span>
      <span className="fp-mono" style={{ fontSize: 12, color: 'var(--fp-ink)' }}>{value}</span>
    </div>
  );
}

// ─── Level screen ─────────────────────────────────────────────
function LevelScreen({ pack, levelIndex, progress, onBack, onComplete, onNext, density = 'comfortable' }) {
  const levelData = getLevelData(pack.id, levelIndex);
  const totalStars = levelData.stars.length;

  const [equations, setEquations] = useSL([
    { id: 1, expr: '', fn: null, color: EQ_COLORS[0], visible: true },
  ]);
  const [panelOpen, setPanelOpen] = useSL(true);
  const [running, setRunning] = useSL(false);
  const [ballPos, setBallPos] = useSL({ ...levelData.ball });
  const [simStars, setSimStars] = useSL(levelData.stars.map(s => ({ ...s, collected: false })));
  const [collectedCount, setCollectedCount] = useSL(0);
  const [completed, setCompleted] = useSL(null); // null | { starsCollected, score, starsRating, prevBest, isNewBest }

  const physRef = useRL(null);   // mutable physics state (avoids stale closures)
  const animRef = useRL(null);
  const equationsRef = useRL(equations);
  equationsRef.current = equations; // always fresh

  const best      = progress?.[pack.id]?.best?.[levelIndex] ?? null;
  const prevStars = progress?.[pack.id]?.stars?.[levelIndex] ?? -1;
  const eqsUsed   = equations.filter(e => e.fn).length;

  const handlePlay = () => {
    if (running) {
      // Stop
      cancelAnimationFrame(animRef.current);
      setRunning(false);
      setBallPos({ ...levelData.ball });
      setSimStars(levelData.stars.map(s => ({ ...s, collected: false })));
      setCollectedCount(0);
      return;
    }
    // Start
    physRef.current = {
      x: levelData.ball.x, y: levelData.ball.y,
      vx: 0, vy: 0,
      stars: levelData.stars.map(s => ({ ...s, collected: false })),
      startTs: null,
    };
    setSimStars(levelData.stars.map(s => ({ ...s, collected: false })));
    setCollectedCount(0);
    setCompleted(null);
    setRunning(true);
  };

  const handleReplay = () => {
    setCompleted(null);
    setBallPos({ ...levelData.ball });
    setSimStars(levelData.stars.map(s => ({ ...s, collected: false })));
    setCollectedCount(0);
    setEquations(eqs => eqs.map(e => ({ ...e })));
  };

  // Animation loop
  useEL(() => {
    if (!running) return;
    const ph = physRef.current;
    const dt = 1 / (60 * SUB_STEPS);

    const frame = ts => {
      if (!ph.startTs) ph.startTs = ts;
      const elapsed = (ts - ph.startTs) / 1000;

      const fns = equationsRef.current
        .filter(e => e.fn && e.visible)
        .map(e => e.fn);

      for (let s = 0; s < SUB_STEPS; s++) {
        physicsStep(ph, fns, dt);
      }

      // Update render state
      setBallPos({ x: ph.x, y: ph.y });
      const collected = ph.stars.filter(s => s.collected).length;
      setCollectedCount(collected);
      setSimStars([...ph.stars]);

      // Check end conditions
      const done = ph.y < FALL_LIMIT || elapsed > TIME_LIMIT;
      if (done) {
        cancelAnimationFrame(animRef.current);
        setRunning(false);

        const eqsN    = equationsRef.current.filter(e => e.fn).length;
        const sc      = computeScore(collected, eqsN, totalStars);
        const rating  = starRating(collected, totalStars);
        const prevB   = best;
        const isNew   = prevB == null || sc < prevB;

        const result = { starsCollected: collected, score: sc, starsRating: rating, prevBest: prevB, isNewBest: isNew };
        setCompleted(result);
        onComplete(rating, sc);
        return;
      }

      animRef.current = requestAnimationFrame(frame);
    };

    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, [running]);

  return (
    <div className="fp-screen" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `calc(14px + env(safe-area-inset-top, 0px)) 14px 8px`,
        flex: '0 0 auto', background: 'var(--lv-bg)' }}>
        <button onClick={onBack} aria-label="Back" style={{
          width: 36, height: 36, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--lv-surface)', border: '1px solid var(--lv-line)', color: 'var(--fp-ink-2)' }}>
          <Icon.Chevron dir="left" size={18}/>
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--fp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
            {pack.type === 'roman' ? `Pack ${pack.numeral}` : pack.name} · Level {levelIndex + 1}
          </div>
          <div style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontStyle: 'italic',
            fontSize: 16, lineHeight: 1, color: 'var(--fp-ink)', letterSpacing: '-0.02em',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
            {LEVEL_NAMES[levelIndex] || `Level ${levelIndex + 1}`}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6,
          height: 36, padding: '0 12px', borderRadius: 999,
          border: '1px solid var(--lv-line)', background: 'var(--lv-surface)' }}>
          <Stars count={Math.max(0, prevStars)} total={3} size={11}/>
        </div>
      </div>

      {/* HUD */}
      <div style={{ padding: '0 14px 8px', flex: '0 0 auto',
        display: 'flex', alignItems: 'center', gap: 8, background: 'var(--lv-bg)' }}>
        <HudChip label="Best"  value={best == null ? '—' : best}/>
        <HudChip label="Eqs"   value={eqsUsed}/>
        <HudChip label="Stars" value={`${collectedCount}/${totalStars}`}/>
        <button onClick={handlePlay} style={{
          marginLeft: 'auto',
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '8px 14px 8px 16px', borderRadius: 999,
          background: running ? '#c74440' : 'var(--fp-accent)',
          color: running ? '#fff' : 'var(--fp-accent-ink)',
          fontSize: 13, fontWeight: 500 }}>
          {running ? 'Stop' : 'Play'} {running
            ? <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor"><rect x={4} y={4} width={6} height={16} rx={1}/><rect x={14} y={4} width={6} height={16} rx={1}/></svg>
            : <Icon.Play size={11} c="currentColor"/>}
        </button>
      </div>

      {/* Plane */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0,
        borderTop: '1px solid var(--lv-line)', borderBottom: '1px solid var(--lv-line)' }}>
        <PlaneFiller
          equations={equations} ballPos={ballPos}
          simStars={simStars} startPos={levelData.ball}/>
      </div>

      {/* Equations panel */}
      <EquationsPanel
        equations={equations} setEquations={setEquations}
        expanded={panelOpen} onToggle={() => setPanelOpen(o => !o)}
        disabled={running}/>

      {/* Completion popup */}
      {completed && (
        <LevelCompletePopup
          pack={pack} levelIndex={levelIndex}
          starsCollected={completed.starsCollected}
          starsRating={completed.starsRating}
          score={completed.score}
          prevBest={completed.prevBest}
          isNewBest={completed.isNewBest}
          totalStars={totalStars}
          onReplay={handleReplay}
          onNext={onNext}
          onClose={() => setCompleted(null)}/>
      )}
    </div>
  );
}

window.LevelScreen = LevelScreen;
window.compileFn   = compileFn;

// Function Plane — Level Screen

const { useState: useSL, useRef: useRL, useEffect: useEL, useMemo: useML } = React;

const EQ_COLORS = ['#c74440','#2d70b3','#388c46','#6042a6','#fa7e19','#000000'];

const GRAVITY    = 12;
const SUB_STEPS  = 5;
const STAR_R     = 0.55;
const BALL_R     = 0.22;
const FALL_LIMIT = -13;
const TIME_LIMIT = 28;

function computeScore(eqsUsed) { return eqsUsed * 100 + 20; }
function starRating(eqsUsed, score, eqGoal, scoreGoal) {
  if (eqsUsed <= eqGoal)    return 3;
  if (score   <= scoreGoal) return 2;
  return 1;
}

// ─── Equation parser — explicit y=f(x) or implicit F(x,y)=G(x,y) ────
function normExpr(s) {
  s = s.replace(/\s+/g,'');
  s = s.replace(/π/g,'(Math.PI)');
  s = s.replace(/\^/g,'**');
  s = s.replace(/(\d)([a-zA-Z(])/g,'$1*$2');
  s = s.replace(/\)([a-zA-Z(0-9])/g,')*$1');
  const fns = ['sin','cos','tan','asin','acos','atan','sqrt','abs','log','exp',
                'floor','ceil','round','max','min','pow'];
  fns.forEach(f => { s = s.replace(new RegExp(`\\b${f}\\(`,'g'),`Math.${f}(`); });
  s = s.replace(/\bln\(/g,'Math.log(');
  s = s.replace(/\be\b/g,'(Math.E)');
  return s;
}

function parseEquation(raw) {
  if (!raw || !raw.trim()) return { fn: null, isImplicit: false };
  const eq = raw.trim();
  const eqIdx = eq.indexOf('=');

  if (eqIdx < 0) {
    // No '=': treat as y = expr
    try {
      const fn = new Function('x', `try{return(${normExpr(eq)});}catch(e){return NaN;}`);
      fn(0);
      return { fn, isImplicit: false };
    } catch { return { fn: null, isImplicit: false }; }
  }

  const lhs = eq.slice(0, eqIdx).trim();
  const rhs = eq.slice(eqIdx + 1).trim();

  // Explicit: y = expr (no y on right side — we don't check, just compile)
  if (lhs === 'y') {
    try {
      const fn = new Function('x', `try{return(${normExpr(rhs)});}catch(e){return NaN;}`);
      fn(0);
      return { fn, isImplicit: false };
    } catch { return { fn: null, isImplicit: false }; }
  }

  // General implicit: LHS - RHS = 0
  const nL = normExpr(lhs), nR = normExpr(rhs);
  try {
    const fn = new Function('x','y',
      `try{return(${nL})-(${nR});}catch(e){return NaN;}`);
    fn(0, 0);
    return { fn, isImplicit: true };
  } catch { return { fn: null, isImplicit: false }; }
}

// ─── Marching squares (implicit curve) ───────────────────────
function marchingSquares(fn, xMin, xMax, yMin, yMax, res, m2p) {
  const dx = (xMax - xMin) / res;
  const dy = (yMax - yMin) / res;
  const W = res + 1;
  const vals = new Float32Array(W * W);
  for (let j = 0; j <= res; j++)
    for (let i = 0; i <= res; i++) {
      const v = fn(xMin + i*dx, yMin + j*dy);
      vals[j*W + i] = isFinite(v) ? v : NaN;
    }

  const lerp = (a,b,va,vb) => {
    const d = Math.abs(va) + Math.abs(vb);
    return d < 1e-12 ? (a+b)/2 : a + (b-a)*Math.abs(va)/d;
  };

  const parts = [];
  for (let j = 0; j < res; j++) {
    for (let i = 0; i < res; i++) {
      const vbl = vals[j*W+i], vbr = vals[j*W+i+1];
      const vtr = vals[(j+1)*W+i+1], vtl = vals[(j+1)*W+i];
      if (isNaN(vbl)||isNaN(vbr)||isNaN(vtr)||isNaN(vtl)) continue;

      const cx0 = xMin+i*dx, cx1 = xMin+(i+1)*dx;
      const cy0 = yMin+j*dy, cy1 = yMin+(j+1)*dy;

      const sbl=vbl>0?1:0, sbr=vbr>0?1:0, str=vtr>0?1:0, stl=vtl>0?1:0;
      const crossB = sbl!==sbr, crossR = sbr!==str;
      const crossT = stl!==str, crossL = sbl!==stl;

      const pts = [];
      if (crossB) { const p=m2p(lerp(cx0,cx1,vbl,vbr),cy0); pts.push(p); }
      if (crossR) { const p=m2p(cx1,lerp(cy0,cy1,vbr,vtr)); pts.push(p); }
      if (crossT) { const p=m2p(lerp(cx0,cx1,vtl,vtr),cy1); pts.push(p); }
      if (crossL) { const p=m2p(cx0,lerp(cy0,cy1,vbl,vtl)); pts.push(p); }

      const seg = (a,b) =>
        `M${a.x.toFixed(1)},${a.y.toFixed(1)}L${b.x.toFixed(1)},${b.y.toFixed(1)}`;

      if (pts.length === 2) {
        parts.push(seg(pts[0],pts[1]));
      } else if (pts.length === 4) {
        const vctr = (vbl+vbr+vtr+vtl)/4;
        if ((vctr>0) === (sbl>0)) {
          parts.push(seg(pts[0],pts[3])); parts.push(seg(pts[1],pts[2]));
        } else {
          parts.push(seg(pts[0],pts[1])); parts.push(seg(pts[2],pts[3]));
        }
      }
    }
  }
  return parts.join(' ');
}

// ─── Domain helpers ───────────────────────────────────────────
function inDomain(x, domain) {
  if (!domain || domain.length === 0) return true;
  return domain.some(s => x >= s.xMin && x <= s.xMax);
}

// ─── Physics step ─────────────────────────────────────────────
function physicsStep(ph, explFns, dt) {
  ph.vy -= GRAVITY * dt;
  ph.x  += ph.vx * dt;
  ph.y  += ph.vy * dt;

  let hitFn = null, hitY = -Infinity;
  for (const { fn, domain } of explFns) {
    if (!inDomain(ph.x, domain)) continue;
    const cy = fn(ph.x);
    if (!isFinite(cy) || isNaN(cy)) continue;
    if (ph.y - BALL_R <= cy && cy > hitY) { hitY = cy; hitFn = fn; }
  }

  if (hitFn !== null) {
    ph.y = hitY + BALL_R;
    const h = 0.003;
    const fp = hitFn(ph.x+h), fm = hitFn(ph.x-h);
    if (isFinite(fp) && isFinite(fm)) {
      const slope = (fp-fm)/(2*h);
      const mag = Math.sqrt(1+slope*slope);
      const nx = -slope/mag, ny = 1/mag;
      const vn = ph.vx*nx + ph.vy*ny;
      if (vn < 0) {
        ph.vx -= (1+PHYSICS_CONFIG.bounciness)*vn*nx;
        ph.vy -= (1+PHYSICS_CONFIG.bounciness)*vn*ny;
        ph.vx *= PHYSICS_CONFIG.energyRetention;
        ph.vy *= PHYSICS_CONFIG.energyRetention;
      }
    }
  }

  for (let i = 0; i < ph.stars.length; i++) {
    if (!ph.stars[i].collected &&
        Math.hypot(ph.x-ph.stars[i].x, ph.y-ph.stars[i].y) < STAR_R+BALL_R) {
      ph.stars[i] = { ...ph.stars[i], collected: true };
    }
  }
}

// ─── Coordinate plane ─────────────────────────────────────────
function CoordPlane({ width, height, equations, ballPos, simStars, startPos }) {
  const [view, setView] = useSL({ cx:0, cy:0, scale:40 });
  const svgRef  = useRL(null);
  const dragRef = useRL(null);

  const m2p = (mx,my) => ({
    x: width/2  + (mx-view.cx)*view.scale,
    y: height/2 - (my-view.cy)*view.scale,
  });

  const range = useML(() => ({
    xMin: view.cx - width /(2*view.scale),
    xMax: view.cx + width /(2*view.scale),
    yMin: view.cy - height/(2*view.scale),
    yMax: view.cy + height/(2*view.scale),
  }), [view, width, height]);

  const gridStep = useML(() => {
    const t = 40/view.scale;
    const p = Math.pow(10, Math.floor(Math.log10(t)));
    const n = t/p;
    return n<1.5?p : n<3?2*p : n<7?5*p : 10*p;
  }, [view.scale]);

  const onPointerDown = e => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { px:e.clientX, py:e.clientY, cx:view.cx, cy:view.cy, id:e.pointerId };
  };
  const onPointerMove = e => {
    if (!dragRef.current || dragRef.current.id!==e.pointerId) return;
    const dx = e.clientX-dragRef.current.px, dy = e.clientY-dragRef.current.py;
    setView(v => ({ ...v,
      cx: dragRef.current.cx - dx/v.scale,
      cy: dragRef.current.cy + dy/v.scale,
    }));
  };
  const onPointerUp = () => { dragRef.current = null; };
  const onWheel = e => {
    e.preventDefault();
    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX-rect.left, py = e.clientY-rect.top;
    const f = Math.exp(-e.deltaY*0.001);
    setView(v => {
      const s = Math.max(8, Math.min(400, v.scale*f));
      const mx = v.cx+(px-width/2)/v.scale, my = v.cy-(py-height/2)/v.scale;
      return { cx:mx-(px-width/2)/s, cy:my+(py-height/2)/s, scale:s };
    });
  };

  // Grid lines
  const lines = [];
  const minor = gridStep, major = gridStep*5;
  for (let x = Math.floor(range.xMin/minor)*minor; x<=range.xMax; x+=minor) {
    const isMj = Math.abs(Math.round(x/major)*major-x) < minor*0.01;
    const px = m2p(x,0).x;
    lines.push(<line key={`v${x.toFixed(5)}`} x1={px} y1={0} x2={px} y2={height}
      stroke={isMj?'var(--lv-grid-major)':'var(--lv-grid-minor)'} strokeWidth={1}/>);
  }
  for (let y = Math.floor(range.yMin/minor)*minor; y<=range.yMax; y+=minor) {
    const isMj = Math.abs(Math.round(y/major)*major-y) < minor*0.01;
    const py = m2p(0,y).y;
    lines.push(<line key={`h${y.toFixed(5)}`} x1={0} y1={py} x2={width} y2={py}
      stroke={isMj?'var(--lv-grid-major)':'var(--lv-grid-minor)'} strokeWidth={1}/>);
  }

  const ax = m2p(0,0);
  const tickLabels = [];
  const ts = major;
  for (let x = Math.ceil(range.xMin/ts)*ts; x<=range.xMax; x+=ts) {
    if (Math.abs(x)<ts*0.01) continue;
    const p = m2p(x,0);
    const ty = Math.max(12, Math.min(height-4, ax.y+12));
    tickLabels.push(<text key={`tx${x.toFixed(3)}`} x={p.x} y={ty} fontSize={10}
      fontFamily="ui-monospace,monospace" fill="var(--lv-tick)" textAnchor="middle">
      {gridStep>=1?Math.round(x):x.toFixed(1)}</text>);
  }
  for (let y = Math.ceil(range.yMin/ts)*ts; y<=range.yMax; y+=ts) {
    if (Math.abs(y)<ts*0.01) continue;
    const p = m2p(0,y);
    const tx = Math.max(4, Math.min(width-20, ax.x+6));
    tickLabels.push(<text key={`ty${y.toFixed(3)}`} x={tx} y={p.y+3} fontSize={10}
      fontFamily="ui-monospace,monospace" fill="var(--lv-tick)" textAnchor="start">
      {gridStep>=1?Math.round(y):y.toFixed(1)}</text>);
  }

  // Equation curves
  const eqPaths = equations.filter(eq => eq.fn && eq.visible).map(eq => {
    if (eq.isImplicit) {
      // Implicit curve via marching squares
      const implFn = eq.domain
        ? (x,y) => inDomain(x,eq.domain) ? eq.fn(x,y) : NaN
        : eq.fn;
      const d = marchingSquares(implFn,
        range.xMin, range.xMax, range.yMin, range.yMax, 60, m2p);
      return <path key={eq.id} d={d} stroke={eq.color} strokeWidth={2.2}
        fill="none" strokeLinecap="round" strokeLinejoin="round"/>;
    }
    // Explicit curve
    let d = '', pen = false, prevY = NaN;
    const step = 2/view.scale;
    for (let x = range.xMin; x <= range.xMax; x += step) {
      if (!inDomain(x, eq.domain)) { pen = false; prevY = NaN; continue; }
      const y = eq.fn(x);
      if (!isFinite(y) || Math.abs(y-prevY)*view.scale>900) { pen=false; prevY=NaN; continue; }
      const p = m2p(x,y);
      d += pen?`L${p.x.toFixed(1)} ${p.y.toFixed(1)}`:`M${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      pen=true; prevY=y;
    }
    return <path key={eq.id} d={d} stroke={eq.color} strokeWidth={2.2}
      fill="none" strokeLinecap="round" strokeLinejoin="round"/>;
  });

  // Stars — disappear on collect
  const starsEl = simStars.map((s,i) => {
    if (s.collected) return null;
    const p = m2p(s.x,s.y);
    return (
      <g key={i} transform={`translate(${p.x},${p.y})`}>
        <circle r={14} fill="var(--lv-bg)" opacity={0.65}/>
        <path d="M0 -10 L3 -3 L11 -2 L5 3 L7 11 L0 6 L-7 11 L-5 3 L-11 -2 L-3 -3 Z"
          fill="none" stroke="var(--lv-star)" strokeWidth={1.5} strokeLinejoin="round"/>
      </g>
    );
  });

  const bp = m2p(ballPos.x, ballPos.y);
  const sp = m2p(startPos.x, startPos.y);

  return (
    <div style={{
      position:'relative', width:'100%', height:'100%',
      background:'var(--lv-bg)', overflow:'hidden', touchAction:'none',
      transform:'translateZ(0)', WebkitTransform:'translateZ(0)',
    }} onWheel={onWheel}>
      <svg ref={svgRef} width={width} height={height}
        style={{ display:'block', cursor:'grab', userSelect:'none' }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        {lines}
        <line x1={0} y1={ax.y} x2={width} y2={ax.y}
          stroke="var(--lv-axis)" strokeWidth={1.4}/>
        <line x1={ax.x} y1={0} x2={ax.x} y2={height}
          stroke="var(--lv-axis)" strokeWidth={1.4}/>
        <text x={Math.min(ax.x-4,width-4)} y={Math.max(12,ax.y+12)}
          fontSize={10} fontFamily="ui-monospace,monospace"
          fill="var(--lv-tick)" textAnchor="end">0</text>
        {tickLabels}
        {eqPaths}
        <circle cx={sp.x} cy={sp.y} r={8}
          fill="none" stroke="var(--lv-ball)" strokeWidth={1.5}
          strokeDasharray="3 2" opacity={0.35}/>
        {starsEl}
        <g transform={`translate(${bp.x},${bp.y})`}>
          <circle r={8} fill="var(--lv-ball)" stroke="var(--lv-ball-stroke)" strokeWidth={1.5}/>
          <circle r={2.5} cx={-2.5} cy={-2.5} fill="var(--lv-ball-shine)"/>
        </g>
      </svg>
      <div style={{
        position:'absolute', right:10, bottom:10,
        display:'flex', flexDirection:'column', overflow:'hidden',
        background:'var(--lv-surface)', border:'1px solid var(--lv-line)', borderRadius:10,
      }}>
        <ZBtn onClick={()=>setView(v=>({...v,scale:Math.min(400,v.scale*1.4)}))}>+</ZBtn>
        <div style={{height:1,background:'var(--lv-line)'}}/>
        <ZBtn onClick={()=>setView(v=>({...v,scale:Math.max(6,v.scale/1.4)}))}>−</ZBtn>
        <div style={{height:1,background:'var(--lv-line)'}}/>
        <ZBtn onClick={()=>setView({cx:0,cy:0,scale:40})} sm>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <circle cx={12} cy={12} r={3} stroke="currentColor" strokeWidth={2}/>
            <path d="M12 3V6M12 18V21M3 12H6M18 12H21"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
          </svg>
        </ZBtn>
      </div>
    </div>
  );
}

function ZBtn({ children, onClick, sm }) {
  return (
    <button onClick={onClick} style={{
      width:34, height:sm?28:32,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:18, color:'var(--fp-ink)', cursor:'pointer',
    }}>{children}</button>
  );
}

function PlaneFiller({ equations, ballPos, simStars, startPos }) {
  const ref = useRL(null);
  const [size, setSize] = useSL({ w:360, h:300 });
  useEL(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(entries => {
      const r = entries[0].contentRect;
      setSize({ w:Math.round(r.width), h:Math.round(r.height) });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ position:'absolute', inset:0 }}>
      <CoordPlane width={size.w} height={size.h}
        equations={equations} ballPos={ballPos}
        simStars={simStars} startPos={startPos}/>
    </div>
  );
}

// ─── HUD chips ────────────────────────────────────────────────
function GoalChip({ stars, label }) {
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:5,
      height:22, padding:'0 8px', borderRadius:6,
      background:'var(--lv-surface)', border:'1px solid var(--lv-line)',
    }}>
      <Stars count={stars} total={3} size={7} c="var(--lv-star)" empty="var(--fp-ink-4)"/>
      <span className="fp-mono" style={{ fontSize:10, color:'var(--fp-ink-3)' }}>{label}</span>
    </div>
  );
}
function HudChip({ label, value }) {
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:6,
      height:28, padding:'0 10px', borderRadius:8,
      background:'var(--lv-surface)', border:'1px solid var(--lv-line)',
    }}>
      <span style={{ fontSize:9.5, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--fp-ink-3)' }}>{label}</span>
      <span className="fp-mono" style={{ fontSize:12, color:'var(--fp-ink)' }}>{value}</span>
    </div>
  );
}

// ─── Domain editor ────────────────────────────────────────────
function DomainEditor({ domain, onChange }) {
  const segs = domain || [];
  const add = () => onChange([...segs, { xMin:-5, xMax:5 }]);
  const remove = i => onChange(segs.filter((_,j)=>j!==i));
  const update = (i, k, v) => onChange(segs.map((s,j)=>j===i?{...s,[k]:parseFloat(v)||0}:s));

  return (
    <div style={{
      padding:'8px 12px 10px',
      background:'var(--fp-surface-2)',
      borderTop:'1px solid var(--lv-line)',
    }}>
      <div style={{ fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase',
        color:'var(--fp-ink-3)', marginBottom:6 }}>
        Restrict domain
      </div>
      {segs.length === 0 && (
        <div style={{ fontSize:11, color:'var(--fp-ink-4)', marginBottom:6 }}>
          No restriction — curve draws everywhere.
        </div>
      )}
      {segs.map((seg,i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
          <span className="fp-mono" style={{ fontSize:11, color:'var(--fp-ink-3)' }}>x ∈</span>
          <input type="number" value={seg.xMin}
            onChange={e=>update(i,'xMin',e.target.value)}
            style={{
              width:52, fontSize:12, textAlign:'center', padding:'3px 4px',
              background:'var(--fp-surface)', border:'1px solid var(--lv-line)',
              borderRadius:6, color:'var(--fp-ink)',
            }}/>
          <span style={{ fontSize:11, color:'var(--fp-ink-3)' }}>to</span>
          <input type="number" value={seg.xMax}
            onChange={e=>update(i,'xMax',e.target.value)}
            style={{
              width:52, fontSize:12, textAlign:'center', padding:'3px 4px',
              background:'var(--fp-surface)', border:'1px solid var(--lv-line)',
              borderRadius:6, color:'var(--fp-ink)',
            }}/>
          <button onClick={()=>remove(i)} style={{ color:'var(--fp-ink-3)', fontSize:16, lineHeight:1, padding:'0 4px' }}>×</button>
        </div>
      ))}
      <button onClick={add} style={{
        fontSize:11.5, color:'var(--fp-accent)', fontWeight:500, padding:'2px 0',
      }}>+ Add segment</button>
    </div>
  );
}

// ─── Equation row ─────────────────────────────────────────────
function EqRow({ idx, eq, onChange, onRemove, disabled, onActivate }) {
  const inputRef = useRL(null);
  const [domOpen, setDomOpen] = useSL(false);
  const valid = !eq.expr.trim() || eq.fn != null;

  return (
    <div style={{ borderTop:'1px solid var(--lv-line)' }}>
      <div style={{ display:'flex', alignItems:'stretch' }}>
        {/* Colour dot */}
        <button onPointerDown={e=>{e.preventDefault(); !disabled && onChange({ visible:!eq.visible });}}
          style={{ width:36, flex:'0 0 36px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{
            width:20, height:20, borderRadius:'50%',
            background: eq.visible ? eq.color : 'transparent',
            border:`1.5px solid ${eq.color}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:10, fontWeight:600, fontFamily:'ui-monospace,monospace',
            color: eq.visible ? '#fff' : eq.color,
          }}>{idx+1}</span>
        </button>

        {/* Expression input */}
        <input
          ref={inputRef}
          value={eq.expr}
          onChange={e => onChange({ expr: e.target.value })}
          onFocus={() => !disabled && onActivate(inputRef)}
          disabled={disabled}
          inputMode="none"
          spellCheck={false}
          placeholder="e.g.  y = sin(x)"
          style={{
            flex:1, minWidth:0, background:'transparent', border:0, outline:0,
            fontFamily:"'Geist Mono','ui-monospace',monospace", fontSize:14,
            color: valid ? 'var(--fp-ink)' : '#c74440',
            padding:'10px 0',
          }}/>

        {/* Domain toggle */}
        <button onPointerDown={e=>{e.preventDefault(); setDomOpen(o=>!o);}}
          title="Restrict domain"
          style={{
            width:32, flex:'0 0 32px', display:'flex', alignItems:'center',
            justifyContent:'center', color: domOpen ? 'var(--fp-accent)' : 'var(--fp-ink-4)',
          }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <path d="M6 3v18M18 3v18M3 9h18M3 15h18" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"/>
          </svg>
        </button>

        {/* Remove */}
        <button onPointerDown={e=>{e.preventDefault(); !disabled && onRemove();}}
          style={{ width:34, flex:'0 0 34px', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--fp-ink-3)' }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {domOpen && (
        <DomainEditor
          domain={eq.domain}
          onChange={domain => onChange({ domain: domain.length ? domain : null })}
        />
      )}
    </div>
  );
}

// ─── Equations panel ──────────────────────────────────────────
function EquationsPanel({ equations, setEquations, expanded, onToggle, disabled }) {
  const activeInputRef = useRL(null);
  const [activeId, setActiveId] = useSL(null);
  const kbOpen = activeId !== null && !disabled;

  const activate = (id, ref) => {
    activeInputRef.current = ref.current;
    setActiveId(id);
  };
  const dismiss = () => { setActiveId(null); activeInputRef.current?.blur(); };

  const handleKbChange = newVal => {
    setEquations(eqs => eqs.map(e =>
      e.id === activeId
        ? { ...e, expr: newVal, ...parseEquation(newVal) }
        : e
    ));
  };

  const addRow = () => setEquations(eqs => {
    const id = Math.max(0,...eqs.map(e=>e.id)) + 1;
    return [...eqs, { id, expr:'', fn:null, isImplicit:false, color:EQ_COLORS[eqs.length%EQ_COLORS.length], visible:true, domain:null }];
  });

  const update = (id, patch) => setEquations(eqs => eqs.map(e => {
    if (e.id !== id) return e;
    const merged = { ...e, ...patch };
    if ('expr' in patch) Object.assign(merged, parseEquation(patch.expr));
    return merged;
  }));

  const remove = id => setEquations(eqs => eqs.filter(e=>e.id!==id));

  return (
    <div style={{
      background:'var(--lv-surface)', borderTop:'1px solid var(--lv-line)',
      display:'flex', flexDirection:'column',
      maxHeight: kbOpen ? '50vh' : (expanded ? 300 : 188),
      transition:'max-height .2s ease',
    }}>
      {/* Handle */}
      <button onClick={onToggle} style={{ height:22, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:36, height:4, borderRadius:2, background:'var(--fp-ink-4)' }}/>
      </button>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 12px 8px' }}>
        <div style={{ fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--fp-ink-3)', fontWeight:500 }}>
          Equations <span className="fp-mono" style={{ color:'var(--fp-ink-4)', marginLeft:4 }}>
            {equations.filter(e=>e.expr.trim()).length}
          </span>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {kbOpen && (
            <button onPointerDown={e=>{e.preventDefault(); dismiss();}}
              style={{ fontSize:12, color:'var(--fp-accent)', fontWeight:500 }}>
              Done
            </button>
          )}
          <button onPointerDown={e=>{e.preventDefault(); !disabled && addRow();}} disabled={disabled} style={{
            display:'flex', alignItems:'center', gap:4,
            padding:'4px 9px 4px 7px', borderRadius:999,
            background:'var(--fp-surface-2)', color:'var(--fp-ink)',
            fontSize:11.5, fontWeight:500, opacity:disabled?0.5:1,
          }}>
            <span style={{ fontSize:14, lineHeight:1, marginTop:-1 }}>+</span> Add
          </button>
        </div>
      </div>

      {/* Rows */}
      <div className="fp-scroll" style={{ flex:1, overflowY:'auto', paddingBottom:6 }}>
        {equations.map((e,i) => (
          <EqRow key={e.id} idx={i} eq={e} disabled={disabled}
            onChange={p=>update(e.id,p)} onRemove={()=>remove(e.id)}
            onActivate={ref=>activate(e.id,ref)}/>
        ))}
        {equations.length === 0 && (
          <div style={{ padding:'14px 16px', fontSize:12, color:'var(--fp-ink-3)' }}>
            Tap <strong>Add</strong> to enter an equation, e.g. <span className="fp-mono">y=sin(x)</span>
          </div>
        )}
      </div>

      {/* Custom keyboard */}
      {kbOpen && <MathKeyboard inputRef={activeInputRef} onChange={handleKbChange}/>}
    </div>
  );
}

// ─── Level screen ─────────────────────────────────────────────
function LevelScreen({ pack, levelIndex, progress, onBack, onComplete, onNext, density='comfortable' }) {
  const levelData  = getLevelData(pack.id, levelIndex);
  const totalStars = levelData.stars.length;
  const scoreGoal  = levelData.scoreGoal ?? 320;
  const eqGoal     = levelData.eqGoal    ?? 1;

  const [equations, setEquations] = useSL([
    { id:1, expr:'', fn:null, isImplicit:false, color:EQ_COLORS[0], visible:true, domain:null },
  ]);
  const [panelOpen, setPanelOpen] = useSL(true);
  const [running, setRunning] = useSL(false);
  const [ballPos, setBallPos] = useSL({ ...levelData.ball });
  const [simStars, setSimStars] = useSL(levelData.stars.map(s=>({...s,collected:false})));
  const [collectedCount, setCollectedCount] = useSL(0);
  const [completed, setCompleted] = useSL(null);
  const [missMsg, setMissMsg] = useSL(false);

  const physRef      = useRL(null);
  const animRef      = useRL(null);
  const equationsRef = useRL(equations);
  equationsRef.current = equations;

  const best      = progress?.[pack.id]?.best?.[levelIndex]  ?? null;
  const prevStars = progress?.[pack.id]?.stars?.[levelIndex] ?? -1;
  const eqsUsed   = equations.filter(e=>e.fn).length;

  const resetSim = () => {
    setBallPos({ ...levelData.ball });
    setSimStars(levelData.stars.map(s=>({...s,collected:false})));
    setCollectedCount(0);
  };

  const handlePlay = () => {
    if (running) {
      cancelAnimationFrame(animRef.current);
      setRunning(false);
      resetSim();
      return;
    }
    physRef.current = {
      x:levelData.ball.x, y:levelData.ball.y, vx:0, vy:0,
      stars:levelData.stars.map(s=>({...s,collected:false})),
      startTs:null,
    };
    setSimStars(levelData.stars.map(s=>({...s,collected:false})));
    setCollectedCount(0);
    setCompleted(null);
    setRunning(true);
  };

  const handleReplay = () => {
    setCompleted(null);
    resetSim();
  };

  useEL(() => {
    if (!running) return;
    const ph = physRef.current;
    const dt = 1/(60*SUB_STEPS);

    const frame = ts => {
      if (!ph.startTs) ph.startTs = ts;
      const elapsed = (ts-ph.startTs)/1000;

      const explFns = equationsRef.current
        .filter(e => e.fn && e.visible && !e.isImplicit)
        .map(e => ({ fn:e.fn, domain:e.domain }));

      for (let s=0; s<SUB_STEPS; s++) physicsStep(ph, explFns, dt);

      setBallPos({ x:ph.x, y:ph.y });
      const collected = ph.stars.filter(s=>s.collected).length;
      setCollectedCount(collected);
      setSimStars([...ph.stars]);

      const done = ph.y < FALL_LIMIT || elapsed > TIME_LIMIT;
      if (done) {
        cancelAnimationFrame(animRef.current);
        setRunning(false);

        if (collected < totalStars) {
          resetSim();
          setMissMsg(true);
          setTimeout(()=>setMissMsg(false), 1800);
          return;
        }

        const eqsN   = equationsRef.current.filter(e=>e.fn).length;
        const sc     = computeScore(eqsN);
        const rating = starRating(eqsN, sc, eqGoal, scoreGoal);
        const isNew  = best == null || sc < best;

        setCompleted({ score:sc, starsRating:rating, prevBest:best, isNewBest:isNew });
        onComplete(rating, sc);
        return;
      }
      animRef.current = requestAnimationFrame(frame);
    };

    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, [running]);

  return (
    <div className="fp-screen" style={{
      width:'100%', height:'100%', display:'flex', flexDirection:'column',
      position:'relative',
    }}>
      {/* Safe-area spacer for punch-hole cameras */}
      <div style={{ height:'env(safe-area-inset-top, 0px)', flex:'0 0 auto', background:'var(--lv-bg)' }}/>

      {/* Top bar */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'10px 14px 8px', flex:'0 0 auto', background:'var(--lv-bg)',
      }}>
        <button onClick={onBack} aria-label="Back" style={{
          width:36, height:36, borderRadius:10,
          display:'flex', alignItems:'center', justifyContent:'center',
          background:'var(--lv-surface)', border:'1px solid var(--lv-line)', color:'var(--fp-ink-2)',
        }}>
          <Icon.Chevron dir="left" size={18}/>
        </button>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, minWidth:0, flex:1 }}>
          <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase',
            color:'var(--fp-ink-3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'100%' }}>
            {pack.type==='roman'?`Pack ${pack.numeral}`:pack.name} · Level {levelIndex+1}
          </div>
          <div style={{ fontFamily:"'Instrument Serif',Georgia,serif", fontStyle:'italic',
            fontSize:16, lineHeight:1, color:'var(--fp-ink)', letterSpacing:'-0.02em',
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'100%' }}>
            {LEVEL_NAMES[levelIndex] || `Level ${levelIndex+1}`}
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:6,
          height:36, padding:'0 12px', borderRadius:999,
          border:'1px solid var(--lv-line)', background:'var(--lv-surface)' }}>
          <Stars count={Math.max(0,prevStars)} total={3} size={11}/>
        </div>
      </div>

      {/* HUD */}
      <div style={{ padding:'0 14px 6px', flex:'0 0 auto', background:'var(--lv-bg)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <HudChip label="Best"  value={best==null?'—':best}/>
          <HudChip label="Eqs"   value={eqsUsed}/>
          <HudChip label="Stars" value={`${collectedCount}/${totalStars}`}/>
          <button onClick={handlePlay} style={{
            marginLeft:'auto',
            display:'flex', alignItems:'center', gap:7,
            padding:'8px 14px 8px 16px', borderRadius:999,
            background: running?'#c74440':'var(--fp-accent)',
            color: running?'#fff':'var(--fp-accent-ink)',
            fontSize:13, fontWeight:500,
          }}>
            {running?'Stop':'Play'} {running
              ? <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor">
                  <rect x={4} y={4} width={6} height={16} rx={1}/>
                  <rect x={14} y={4} width={6} height={16} rx={1}/>
                </svg>
              : <Icon.Play size={11} c="currentColor"/>}
          </button>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <GoalChip stars={2} label={`score ≤ ${scoreGoal}`}/>
          <GoalChip stars={3} label={`≤ ${eqGoal} eq`}/>
          {missMsg && (
            <div style={{ marginLeft:'auto', fontSize:11, color:'#c74440',
              display:'flex', alignItems:'center', fontWeight:500 }}>
              Collect all stars!
            </div>
          )}
        </div>
      </div>

      {/* Plane */}
      <div style={{
        flex:1, position:'relative', minHeight:0,
        borderTop:'1px solid var(--lv-line)', borderBottom:'1px solid var(--lv-line)',
      }}>
        <PlaneFiller
          equations={equations} ballPos={ballPos}
          simStars={simStars} startPos={levelData.ball}/>
      </div>

      {/* Equations panel */}
      <EquationsPanel
        equations={equations} setEquations={setEquations}
        expanded={panelOpen} onToggle={()=>setPanelOpen(o=>!o)}
        disabled={running}/>

      {/* Completion popup */}
      {completed && (
        <LevelCompletePopup
          pack={pack} levelIndex={levelIndex}
          starsRating={completed.starsRating}
          score={completed.score}
          prevBest={completed.prevBest}
          isNewBest={completed.isNewBest}
          totalStars={totalStars}
          onReplay={handleReplay}
          onNext={onNext}
          onClose={()=>setCompleted(null)}/>
      )}
    </div>
  );
}

window.LevelScreen = LevelScreen;
window.parseEquation = parseEquation;

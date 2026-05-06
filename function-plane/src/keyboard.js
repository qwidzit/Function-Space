// Function Plane — Custom math keyboard

function MathKeyboard({
  inputRef,
  onChange
}) {
  const ins = text => {
    const inp = inputRef?.current;
    if (!inp) return;
    inp.focus();
    const s = inp.selectionStart ?? inp.value.length;
    const e = inp.selectionEnd ?? inp.value.length;
    const v = inp.value.slice(0, s) + text + inp.value.slice(e);
    const p = s + text.length;
    onChange(v);
    requestAnimationFrame(() => inp.setSelectionRange?.(p, p));
  };
  const del = () => {
    const inp = inputRef?.current;
    if (!inp) return;
    inp.focus();
    const s = inp.selectionStart,
      e = inp.selectionEnd;
    let v, p;
    if (s !== e) {
      v = inp.value.slice(0, s) + inp.value.slice(e);
      p = s;
    } else if (s > 0) {
      v = inp.value.slice(0, s - 1) + inp.value.slice(s);
      p = s - 1;
    } else return;
    onChange(v);
    requestAnimationFrame(() => inp.setSelectionRange?.(p, p));
  };
  const clr = () => onChange('');
  const mov = d => {
    const inp = inputRef?.current;
    if (!inp) return;
    inp.focus();
    const p = Math.max(0, Math.min(inp.value.length, (inp.selectionStart ?? 0) + d));
    requestAnimationFrame(() => inp.setSelectionRange?.(p, p));
  };

  // t: 'fn' | 'op' | 'num' | 'var' | 'const' | 'del' | 'nav' | 'util'
  const ROWS = [[{
    lbl: 'sin',
    act: () => ins('sin('),
    t: 'fn'
  }, {
    lbl: 'cos',
    act: () => ins('cos('),
    t: 'fn'
  }, {
    lbl: 'tan',
    act: () => ins('tan('),
    t: 'fn'
  }, {
    lbl: '(',
    act: () => ins('('),
    t: 'op'
  }, {
    lbl: ')',
    act: () => ins(')'),
    t: 'op'
  }, {
    lbl: '⌫',
    act: del,
    t: 'del'
  }], [{
    lbl: 'log',
    act: () => ins('log('),
    t: 'fn'
  }, {
    lbl: 'ln',
    act: () => ins('ln('),
    t: 'fn'
  }, {
    lbl: '√‾',
    act: () => ins('sqrt('),
    t: 'fn'
  }, {
    lbl: 'x',
    act: () => ins('x'),
    t: 'var'
  }, {
    lbl: 'y',
    act: () => ins('y'),
    t: 'var'
  }, {
    lbl: '^',
    act: () => ins('^'),
    t: 'op'
  }], [{
    lbl: 'π',
    act: () => ins('π'),
    t: 'const'
  }, {
    lbl: 'e',
    act: () => ins('e'),
    t: 'const'
  }, {
    lbl: '|x|',
    act: () => ins('abs('),
    t: 'fn'
  }, {
    lbl: '7',
    act: () => ins('7'),
    t: 'num'
  }, {
    lbl: '8',
    act: () => ins('8'),
    t: 'num'
  }, {
    lbl: '9',
    act: () => ins('9'),
    t: 'num'
  }], [{
    lbl: '⌊x⌋',
    act: () => ins('floor('),
    t: 'fn'
  }, {
    lbl: '÷',
    act: () => ins('/'),
    t: 'op'
  }, {
    lbl: '×',
    act: () => ins('*'),
    t: 'op'
  }, {
    lbl: '4',
    act: () => ins('4'),
    t: 'num'
  }, {
    lbl: '5',
    act: () => ins('5'),
    t: 'num'
  }, {
    lbl: '6',
    act: () => ins('6'),
    t: 'num'
  }], [{
    lbl: '⌈x⌉',
    act: () => ins('ceil('),
    t: 'fn'
  }, {
    lbl: '−',
    act: () => ins('-'),
    t: 'op'
  }, {
    lbl: '+',
    act: () => ins('+'),
    t: 'op'
  }, {
    lbl: '1',
    act: () => ins('1'),
    t: 'num'
  }, {
    lbl: '2',
    act: () => ins('2'),
    t: 'num'
  }, {
    lbl: '3',
    act: () => ins('3'),
    t: 'num'
  }], [{
    lbl: '=',
    act: () => ins('='),
    t: 'op'
  }, {
    lbl: '.',
    act: () => ins('.'),
    t: 'num'
  }, {
    lbl: '0',
    act: () => ins('0'),
    t: 'num'
  }, {
    lbl: 'CLR',
    act: clr,
    t: 'util'
  }, {
    lbl: '←',
    act: () => mov(-1),
    t: 'nav'
  }, {
    lbl: '→',
    act: () => mov(1),
    t: 'nav'
  }]];
  const bg = t => {
    if (t === 'num') return 'var(--fp-surface)';
    if (t === 'del') return 'var(--fp-surface-2)';
    if (t === 'util') return 'var(--fp-surface-2)';
    if (t === 'nav') return 'var(--fp-surface-2)';
    if (t === 'var') return 'rgba(45,112,179,0.13)';
    if (t === 'const') return 'rgba(56,140,70,0.11)';
    return 'var(--lv-bg)';
  };
  const fg = t => {
    if (t === 'var') return '#2d70b3';
    if (t === 'const') return '#388c46';
    return 'var(--fp-ink)';
  };
  const ff = t => t === 'var' || t === 'const' ? "'Geist Mono',monospace" : 'inherit';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--fp-surface)',
      borderTop: '1px solid var(--lv-line)',
      padding: '4px 5px',
      paddingBottom: 'max(5px, env(safe-area-inset-bottom, 0px))',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      touchAction: 'manipulation'
    }
  }, ROWS.map((row, ri) => /*#__PURE__*/React.createElement("div", {
    key: ri,
    style: {
      display: 'flex',
      gap: 3,
      marginBottom: ri < ROWS.length - 1 ? 3 : 0
    }
  }, row.map((k, ki) => /*#__PURE__*/React.createElement("button", {
    key: ki,
    onPointerDown: e => {
      e.preventDefault();
      k.act();
    },
    style: {
      flex: 1,
      height: 38,
      borderRadius: 7,
      fontSize: k.lbl.length > 3 ? 10 : 12.5,
      background: bg(k.t),
      border: '1px solid var(--lv-line)',
      color: fg(k.t),
      fontWeight: k.t === 'var' || k.t === 'const' ? 600 : 400,
      fontFamily: ff(k.t),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      letterSpacing: '-0.01em'
    }
  }, k.lbl)))));
}
window.MathKeyboard = MathKeyboard;
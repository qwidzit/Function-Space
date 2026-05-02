// Function Plane — App shell & router

const { useState, useEffect, useMemo } = React;

function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('fp-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [density] = useState('comfortable');

  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('fp-progress');
      return saved ? JSON.parse(saved) : freshProgress();
    } catch {
      return freshProgress();
    }
  });

  const [nav, setNav] = useState({ route: 'main', pack: null, levelIndex: 0 });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('fp-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('fp-progress', JSON.stringify(progress));
  }, [progress]);

  const totalStars = useMemo(() => totalStarsAll(progress), [progress]);
  const continuePoint = useMemo(() => findContinuePoint(progress), [progress]);

  const navigate = (route, extra = {}) =>
    setNav({ route, pack: null, levelIndex: 0, ...extra });

  const renderScreen = () => {
    const { route } = nav;

    if (route === 'main') {
      return (
        <MainScreen
          totalStars={totalStars}
          continuePoint={continuePoint}
          progress={progress}
          density={density}
          onPlay={() => navigate('packs')}
          onInfo={() => navigate('how-to-play')}
          onAchievements={() => navigate('achievements')}
          onAccount={() => navigate('account')}
          onSettings={() => navigate('settings')}
        />
      );
    }

    // Screens for future steps
    return (
      <PlaceholderScreen
        title={({
          'packs': 'Pack Selector',
          'levels': 'Level Selector',
          'level': 'Level',
          'how-to-play': 'How to Play',
          'achievements': 'Achievements',
          'settings': 'Settings',
          'account': 'Account',
        })[route] || route}
        subtitle="Coming in the next step"
        onBack={() => navigate('main')}
      />
    );
  };

  return (
    <div
      data-theme={theme}
      data-density={density}
      style={{ width: '100%', height: '100%' }}
    >
      {renderScreen()}
    </div>
  );
}

function PlaceholderScreen({ title, subtitle, onBack }) {
  return (
    <div className="fp-screen" style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      paddingTop: 'max(56px, calc(44px + var(--safe-top)))',
      paddingBottom: 'max(18px, var(--safe-bottom))',
      boxSizing: 'border-box',
    }}>
      <div style={{
        padding: '8px 22px 6px',
        display: 'flex', alignItems: 'center',
      }}>
        <button onClick={onBack} style={{
          width: 38, height: 38, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--fp-ink-2)',
        }}>
          <Icon.Chevron dir="left" size={20} />
        </button>
      </div>

      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 10, padding: '0 32px',
      }}>
        <div style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontStyle: 'italic',
          fontSize: 36, lineHeight: 1,
          letterSpacing: '-0.02em',
          color: 'var(--fp-ink)',
          textAlign: 'center',
        }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--fp-ink-3)', textAlign: 'center' }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function mount() {
  if (
    typeof MainScreen === 'undefined' ||
    typeof freshProgress === 'undefined' ||
    typeof Icon === 'undefined'
  ) {
    return setTimeout(mount, 30);
  }
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
}
mount();

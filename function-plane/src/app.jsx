// Function Plane — App shell & router

const { useState, useEffect, useMemo } = React;

const SETTINGS_DEFAULTS = {
  theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  density: 'comfortable',
  sound: true,
  music: false,
  haptics: true,
  volume: 70,
  gridLabels: true,
  snapIntegers: false,
  autoZoom: true,
  notation: 'standard',
  notifDaily: true,
  notifNewPacks: true,
  notifFriends: false,
};

function App() {
  const [settings, setSettings] = useState(() => {
    try {
      return { ...SETTINGS_DEFAULTS, ...JSON.parse(localStorage.getItem('fp-settings') || '{}') };
    } catch {
      return { ...SETTINGS_DEFAULTS };
    }
  });

  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('fp-progress');
      return saved ? JSON.parse(saved) : freshProgress();
    } catch {
      return freshProgress();
    }
  });

  const [nav, setNav] = useState({ route: 'main', pack: null, levelIndex: 0 });

  const updateSetting = (key, value) =>
    setSettings(s => ({ ...s, [key]: value }));

  // Apply theme and density to the DOM
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('fp-settings', JSON.stringify(settings));
  }, [settings]);

  // Persist progress
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
          density={settings.density}
          onPlay={() => navigate('packs')}
          onInfo={() => navigate('how-to-play')}
          onAchievements={() => navigate('achievements')}
          onAccount={() => navigate('account')}
          onSettings={() => navigate('settings')}
        />
      );
    }

    if (route === 'packs') {
      return (
        <PackSelector
          progress={progress}
          density={settings.density}
          onBack={() => navigate('main')}
          onPickPack={pack => navigate('levels', { pack })}
        />
      );
    }

    if (route === 'levels') {
      return (
        <LevelSelector
          pack={nav.pack}
          progress={progress}
          density={settings.density}
          onBack={() => navigate('packs')}
          onPickLevel={(pack, levelIndex) => navigate('level', { pack, levelIndex })}
        />
      );
    }

    if (route === 'settings') {
      return (
        <SettingsScreen
          settings={settings}
          updateSetting={updateSetting}
          density={settings.density}
          onBack={() => navigate('main')}
        />
      );
    }

    if (route === 'level') {
      const { pack, levelIndex } = nav;
      const handleComplete = (rating, score) => {
        setProgress(prev => {
          const next = { ...prev };
          const pd   = next[pack.id] = { ...prev[pack.id] };
          const stars = [...pd.stars];
          const best  = [...pd.best];
          stars[levelIndex] = Math.max(stars[levelIndex] ?? -1, rating);
          best[levelIndex]  = best[levelIndex] == null ? score : Math.min(best[levelIndex], score);
          // Unlock next level if it was null
          if (levelIndex + 1 < 10 && stars[levelIndex + 1] === null) {
            stars[levelIndex + 1] = -1;
          }
          pd.stars = stars;
          pd.best  = best;
          return next;
        });
      };
      const handleNext = () => {
        const nextIndex = levelIndex + 1;
        if (nextIndex < 10) {
          navigate('level', { pack, levelIndex: nextIndex });
        } else {
          navigate('levels', { pack });
        }
      };
      return (
        <LevelScreen
          key={`${pack.id}-${levelIndex}`}
          pack={pack}
          levelIndex={levelIndex}
          progress={progress}
          density={settings.density}
          onBack={() => navigate('levels', { pack })}
          onComplete={handleComplete}
          onNext={handleNext}
        />
      );
    }

    if (route === 'how-to-play') {
      return <HowToPlayScreen onBack={() => navigate('main')} density={settings.density}/>;
    }

    if (route === 'achievements') {
      return <AchievementsScreen onBack={() => navigate('main')} progress={progress} density={settings.density}/>;
    }

    if (route === 'account') {
      return <AccountScreen onBack={() => navigate('main')} density={settings.density}/>;
    }

    return (
      <PlaceholderScreen
        title={route}
        subtitle="Coming soon"
        onBack={() => navigate('main')}
      />
    );
  };

  return (
    <div
      data-theme={settings.theme}
      data-density={settings.density}
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
      boxSizing: 'border-box',
    }}>
      <div style={{
        padding: `calc(14px + env(safe-area-inset-top, 0px)) 22px 6px`,
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
          fontSize: 36, lineHeight: 1, letterSpacing: '-0.02em',
          color: 'var(--fp-ink)', textAlign: 'center',
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
    typeof PackSelector === 'undefined' ||
    typeof LevelSelector === 'undefined' ||
    typeof SettingsScreen === 'undefined' ||
    typeof LevelScreen === 'undefined' ||
    typeof LevelCompletePopup === 'undefined' ||
    typeof HowToPlayScreen === 'undefined' ||
    typeof AchievementsScreen === 'undefined' ||
    typeof AccountScreen === 'undefined' ||
    typeof MathKeyboard === 'undefined' ||
    typeof freshProgress === 'undefined' ||
    typeof Icon === 'undefined'
  ) {
    return setTimeout(mount, 30);
  }
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
}
mount();

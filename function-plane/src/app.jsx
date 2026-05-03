// Function Plane — App shell & router

const { useState, useEffect, useRef, useMemo } = React;

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

  // Achievement toast queue
  const [toastQueue, setToastQueue] = useState([]);
  const achInitRef    = useRef(false);
  const prevUnlockedRef = useRef(new Set());

  const updateSetting = (key, value) =>
    setSettings(s => ({ ...s, [key]: value }));

  // Apply theme to the DOM
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

  // Achievement unlock detection
  useEffect(() => {
    if (typeof ACH_LIST === 'undefined') return;
    if (!achInitRef.current) {
      // Seed on first render so we don't toast pre-existing achievements
      ACH_LIST.filter(a => a.check(progress)).forEach(a => prevUnlockedRef.current.add(a.id));
      achInitRef.current = true;
      return;
    }
    const newlyUnlocked = ACH_LIST.filter(
      a => a.check(progress) && !prevUnlockedRef.current.has(a.id)
    );
    newlyUnlocked.forEach(a => {
      prevUnlockedRef.current.add(a.id);
      setToastQueue(q => [...q, { id: a.id, name: a.name }]);
    });
  }, [progress]);

  const totalStars    = useMemo(() => totalStarsAll(progress), [progress]);
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
          settings={settings}
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
      style={{ width: '100%', height: '100%', position: 'relative' }}
    >
      {renderScreen()}

      {/* Achievement toast */}
      {toastQueue.length > 0 && (
        <AchievementToast
          key={toastQueue[0].id}
          name={toastQueue[0].name}
          onDone={() => setToastQueue(q => q.slice(1))}
        />
      )}
    </div>
  );
}

function AchievementToast({ name, onDone }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 60);
    const t2 = setTimeout(() => setShow(false), 2800);
    const t3 = setTimeout(onDone, 3400);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
      zIndex: 9999,
      pointerEvents: 'none',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--fp-ink)', color: 'var(--fp-accent-ink)',
        padding: '10px 16px 10px 12px',
        borderRadius: '0 0 18px 18px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
        transform: show ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.38s cubic-bezier(.22,.68,0,1.2)',
        marginTop: 'env(safe-area-inset-top, 0px)',
        maxWidth: 300,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, flex: '0 0 30px',
          background: 'rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon.Trophy size={16} c="currentColor"/>
        </div>
        <div>
          <div style={{ fontSize: 9.5, opacity: 0.65, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 1 }}>
            Achievement unlocked
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>{name}</div>
        </div>
      </div>
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

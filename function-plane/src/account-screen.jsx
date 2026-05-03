// Function Plane — Account screen (UI shell, no real auth)

const { useState: useACS } = React;

function AccountScreen({ onBack, density = 'comfortable' }) {
  const [view, setView] = useACS('main'); // 'main' | 'signin' | 'register'
  const padX = density === 'compact' ? 22 : 26;

  if (view === 'signin')   return <SignInView   onBack={() => setView('main')} padX={padX}/>;
  if (view === 'register') return <RegisterView onBack={() => setView('main')} padX={padX}/>;

  return (
    <div className="fp-screen" style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
    }}>
      {/* Top bar */}
      <div style={{
        padding: `calc(14px + env(safe-area-inset-top, 0px)) ${padX}px 0`,
        display: 'flex', alignItems: 'center', flex: '0 0 auto',
      }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--fp-ink-2)',
        }}>
          <Icon.Chevron dir="left" size={18}/>
        </button>
      </div>

      {/* Guest state */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: `0 ${padX}px`,
      }}>
        {/* Avatar */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'var(--fp-surface-2)', border: '2px solid var(--fp-line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 18,
        }}>
          <Icon.User size={34} c="var(--fp-ink-4)"/>
        </div>

        <div style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontStyle: 'italic', fontSize: 28, letterSpacing: '-0.02em',
          color: 'var(--fp-ink)', marginBottom: 8,
        }}>Guest</div>

        <div style={{
          fontSize: 13.5, color: 'var(--fp-ink-3)', textAlign: 'center',
          lineHeight: 1.55, maxWidth: 270, marginBottom: 36,
        }}>
          Sign in to save your progress across devices and compete on global leaderboards.
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => setView('signin')} style={{
            height: 52, borderRadius: 15,
            background: 'var(--fp-accent)', color: 'var(--fp-accent-ink)',
            fontSize: 15, fontWeight: 500,
          }}>Sign in</button>

          <button onClick={() => setView('register')} style={{
            height: 52, borderRadius: 15,
            background: 'var(--fp-surface)', border: '1px solid var(--fp-line)',
            color: 'var(--fp-ink)', fontSize: 15, fontWeight: 500,
          }}>Create account</button>
        </div>
      </div>

      <div style={{
        textAlign: 'center', fontSize: 11, color: 'var(--fp-ink-4)',
        padding: '12px',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
      }}>
        Progress is saved locally on this device.
      </div>
    </div>
  );
}

function AuthField({ label, type, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontSize: 11.5, color: 'var(--fp-ink-3)', marginBottom: 6,
        letterSpacing: '0.03em', textTransform: 'uppercase',
      }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', height: 48, borderRadius: 12, boxSizing: 'border-box',
          padding: '0 14px', fontSize: 15,
          background: 'var(--fp-surface)', border: '1px solid var(--fp-line)',
          color: 'var(--fp-ink)', outline: 'none',
        }}
      />
    </div>
  );
}

function SignInView({ onBack, padX }) {
  const [email, setEmail] = useACS('');
  const [pass,  setPass]  = useACS('');

  return (
    <div className="fp-screen" style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
    }}>
      <div style={{
        padding: `calc(14px + env(safe-area-inset-top, 0px)) ${padX}px 14px`,
        display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto',
        borderBottom: '1px solid var(--fp-line)',
      }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--fp-ink-2)',
        }}>
          <Icon.Chevron dir="left" size={18}/>
        </button>
        <div style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontStyle: 'italic', fontSize: 24, letterSpacing: '-0.02em', color: 'var(--fp-ink)',
        }}>Sign in</div>
      </div>

      <div style={{
        flex: 1, padding: `24px ${padX}px`,
        paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))',
        overflowY: 'auto',
      }}>
        <AuthField label="Email"    type="email"    value={email} onChange={setEmail} placeholder="you@example.com"/>
        <AuthField label="Password" type="password" value={pass}  onChange={setPass}  placeholder="••••••••"/>

        <button style={{
          width: '100%', height: 52, borderRadius: 15, marginTop: 4,
          background: 'var(--fp-accent)', color: 'var(--fp-accent-ink)',
          fontSize: 15, fontWeight: 500,
        }}>Sign in</button>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button style={{ fontSize: 13, color: 'var(--fp-ink-3)' }}>
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
}

function RegisterView({ onBack, padX }) {
  const [name,  setName]  = useACS('');
  const [email, setEmail] = useACS('');
  const [pass,  setPass]  = useACS('');

  return (
    <div className="fp-screen" style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
    }}>
      <div style={{
        padding: `calc(14px + env(safe-area-inset-top, 0px)) ${padX}px 14px`,
        display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto',
        borderBottom: '1px solid var(--fp-line)',
      }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--fp-ink-2)',
        }}>
          <Icon.Chevron dir="left" size={18}/>
        </button>
        <div style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontStyle: 'italic', fontSize: 24, letterSpacing: '-0.02em', color: 'var(--fp-ink)',
        }}>Create account</div>
      </div>

      <div style={{
        flex: 1, padding: `24px ${padX}px`,
        paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))',
        overflowY: 'auto',
      }}>
        <AuthField label="Display name" type="text"     value={name}  onChange={setName}  placeholder="Your name"/>
        <AuthField label="Email"        type="email"    value={email} onChange={setEmail} placeholder="you@example.com"/>
        <AuthField label="Password"     type="password" value={pass}  onChange={setPass}  placeholder="At least 8 characters"/>

        <button style={{
          width: '100%', height: 52, borderRadius: 15, marginTop: 4,
          background: 'var(--fp-accent)', color: 'var(--fp-accent-ink)',
          fontSize: 15, fontWeight: 500,
        }}>Create account</button>

        <div style={{
          textAlign: 'center', marginTop: 18,
          fontSize: 11.5, color: 'var(--fp-ink-4)', lineHeight: 1.55,
        }}>
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}

window.AccountScreen = AccountScreen;

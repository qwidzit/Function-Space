// Function Plane — Account screen (UI shell, no real auth)

const { useState: useACS } = React;

function AccountScreen({ onBack, density = 'comfortable' }) {
  const [view, setView] = useACS('main'); // 'main' | 'signin' | 'register' | 'premium'
  const padX = density === 'compact' ? 22 : 26;

  if (view === 'signin')   return <SignInView   onBack={() => setView('main')} padX={padX}/>;
  if (view === 'register') return <RegisterView onBack={() => setView('main')} padX={padX}/>;
  if (view === 'premium')  return <PremiumView  onBack={() => setView('main')} padX={padX}/>;

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

      <div className="fp-scroll" style={{
        flex: 1, overflowY: 'auto',
        padding: `0 ${padX}px`,
        paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))',
      }}>
        {/* Guest state */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          paddingTop: 32, paddingBottom: 28,
        }}>
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
            lineHeight: 1.55, maxWidth: 270, marginBottom: 28,
          }}>
            Sign in to save progress across devices and compete on global leaderboards.
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

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--fp-line)', marginBottom: 24 }}/>

        {/* Premium section */}
        <div style={{
          borderRadius: 18,
          background: 'var(--fp-surface)',
          border: '1px solid var(--fp-line)',
          overflow: 'hidden',
          marginBottom: 24,
        }}>
          <div style={{
            padding: '16px 18px 0',
            display: 'flex', alignItems: 'flex-start', gap: 14,
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, flex: '0 0 42px',
              background: 'var(--fp-surface-2)', border: '1px solid var(--fp-line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="var(--fp-ink)" stroke="var(--fp-ink)" strokeWidth={1} strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fp-ink)', marginBottom: 3, letterSpacing: '-0.01em' }}>
                Function Plane Premium
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--fp-ink-3)', lineHeight: 1.5 }}>
                Unlock all packs instantly and support future development.
              </div>
            </div>
          </div>
          <div style={{ padding: '12px 18px 16px', paddingLeft: 74 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginBottom: 14 }}>
              {['All packs unlocked','No ads','Priority support','Future packs included'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--fp-ink-2)' }}>
                  <svg width={11} height={11} viewBox="0 0 24 24" fill="none">
                    <path d="M5 13L9 17L19 7" stroke="var(--fp-accent)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {f}
                </div>
              ))}
            </div>
            <button onClick={() => setView('premium')} style={{
              width: '100%', height: 46, borderRadius: 12,
              background: 'var(--fp-accent)', color: 'var(--fp-accent-ink)',
              fontSize: 14, fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              View Premium plans
              <Icon.Chevron dir="right" size={13} c="currentColor"/>
            </button>
          </div>
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

function PremiumView({ onBack, padX }) {
  const [selected, setSelected] = useACS('yearly');

  const plans = [
    { id: 'yearly',  label: 'Annual',  price: '$19.99', sub: '$1.67 / month', badge: 'Best value' },
    { id: 'monthly', label: 'Monthly', price: '$2.99',  sub: 'Billed monthly' },
    { id: 'lifetime',label: 'Lifetime',price: '$39.99', sub: 'One-time purchase' },
  ];

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
        }}>Premium</div>
      </div>

      <div className="fp-scroll" style={{
        flex: 1, overflowY: 'auto',
        padding: `24px ${padX}px`,
        paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))',
      }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, margin: '0 auto 14px',
            background: 'var(--fp-surface-2)', border: '1px solid var(--fp-line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="var(--fp-ink)" stroke="var(--fp-ink)" strokeWidth={1} strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{
            fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic',
            fontSize: 28, letterSpacing: '-0.02em', color: 'var(--fp-ink)', marginBottom: 6,
          }}>Unlock everything</div>
          <div style={{ fontSize: 13.5, color: 'var(--fp-ink-3)', lineHeight: 1.55 }}>
            All packs, now and forever. No stars required.
          </div>
        </div>

        {/* Feature list */}
        <div style={{
          background: 'var(--fp-surface)', border: '1px solid var(--fp-line)',
          borderRadius: 16, padding: '14px 18px', marginBottom: 22,
        }}>
          {[
            'All themed packs unlocked immediately',
            'All future chapter packs included',
            'No advertisements ever',
            'Support indie development',
          ].map((f, i, arr) => (
            <div key={f} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '9px 0',
              borderBottom: i < arr.length - 1 ? '1px solid var(--fp-line)' : 'none',
            }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <path d="M5 13L9 17L19 7" stroke="var(--fp-accent)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 13.5, color: 'var(--fp-ink)' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Plans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {plans.map(plan => (
            <button key={plan.id} onClick={() => setSelected(plan.id)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderRadius: 14, textAlign: 'left',
              background: selected === plan.id ? 'var(--fp-surface)' : 'transparent',
              border: `1.5px solid ${selected === plan.id ? 'var(--fp-ink)' : 'var(--fp-line)'}`,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fp-ink)' }}>{plan.label}</span>
                  {plan.badge && (
                    <span style={{
                      fontSize: 9.5, letterSpacing: '0.06em', textTransform: 'uppercase',
                      padding: '2px 7px', borderRadius: 999,
                      background: 'var(--fp-ink)', color: 'var(--fp-bg)',
                    }}>{plan.badge}</span>
                  )}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--fp-ink-3)', marginTop: 2 }}>{plan.sub}</div>
              </div>
              <div style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 17, fontWeight: 600, color: 'var(--fp-ink)',
              }}>{plan.price}</div>
            </button>
          ))}
        </div>

        <button style={{
          width: '100%', height: 54, borderRadius: 16,
          background: 'var(--fp-accent)', color: 'var(--fp-accent-ink)',
          fontSize: 16, fontWeight: 600,
        }}>
          Continue
        </button>

        <div style={{
          textAlign: 'center', marginTop: 14,
          fontSize: 11, color: 'var(--fp-ink-4)', lineHeight: 1.6,
        }}>
          Payment processed securely. Cancel anytime.
          <br/>
          Restore purchases · Terms · Privacy
        </div>
      </div>
    </div>
  );
}

window.AccountScreen = AccountScreen;

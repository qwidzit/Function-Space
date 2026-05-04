// Function Plane — Account screen (local accounts + friend codes)

const { useState: useACS, useEffect: useACSEffect, useRef: useACSRef } = React;

function AccountScreen({ onBack, density = 'comfortable', account, progress }) {
  const [view, setView] = useACS('main'); // 'main' | 'signin' | 'register' | 'premium' | 'switch' | 'friends'
  const [error, setError] = useACS('');
  const padX = density === 'compact' ? 22 : 26;

  // Reset error when navigating views
  useACSEffect(() => { setError(''); }, [view]);

  const goMain = () => setView('main');
  const reload = () => { /* state changes propagate via FP_AUTH.subscribe */ };

  if (view === 'signin')
    return <SignInView onBack={goMain} padX={padX} onSuccess={goMain} error={error} setError={setError}/>;
  if (view === 'register')
    return <RegisterView onBack={goMain} padX={padX} onSuccess={goMain} error={error} setError={setError}/>;
  if (view === 'premium')
    return <PremiumView onBack={goMain} padX={padX}/>;
  if (view === 'switch')
    return <SwitchAccountView onBack={goMain} padX={padX} active={account}/>;
  if (view === 'friends')
    return <FriendsView onBack={goMain} padX={padX} signedIn={!!account}/>;

  return account
    ? <SignedInView account={account} progress={progress} onBack={onBack} padX={padX}
        onSwitch={() => setView('switch')} onFriends={() => setView('friends')}
        onPremium={() => setView('premium')}/>
    : <GuestView onBack={onBack} padX={padX}
        onSignIn={() => setView('signin')} onRegister={() => setView('register')}
        onPremium={() => setView('premium')} onFriends={() => setView('friends')}/>;
}

// ─── Reusable bits ─────────────────────────────────────────────

function ScreenFrame({ title, onBack, padX, children }) {
  return (
    <div className="fp-screen" style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
    }}>
      <div style={{
        padding: `calc(14px + env(safe-area-inset-top, 0px)) ${padX}px 14px`,
        display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto',
        borderBottom: title ? '1px solid var(--fp-line)' : 'none',
      }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--fp-ink-2)',
        }}>
          <Icon.Chevron dir="left" size={18}/>
        </button>
        {title && (
          <div style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontStyle: 'italic', fontSize: 24, letterSpacing: '-0.02em', color: 'var(--fp-ink)',
          }}>{title}</div>
        )}
      </div>
      <div className="fp-scroll" style={{
        flex: 1, overflowY: 'auto',
        padding: `0 ${padX}px`,
        paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))',
      }}>
        {children}
      </div>
    </div>
  );
}

function AuthField({ label, type, value, onChange, placeholder, autoFocus }) {
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
        autoFocus={autoFocus}
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

function ErrorLine({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 10, marginBottom: 12,
      background: 'color-mix(in srgb, #e34 14%, transparent)',
      color: '#e34', fontSize: 12.5, lineHeight: 1.5,
    }}>{msg}</div>
  );
}

// ─── Guest view (not signed in) ─────────────────────────────────

function GuestView({ onBack, padX, onSignIn, onRegister, onPremium, onFriends }) {
  return (
    <div className="fp-screen" style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
    }}>
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
            lineHeight: 1.55, maxWidth: 280, marginBottom: 28,
          }}>
            Create an account to keep separate progress per player on this device
            and compare scores with friends via share codes.
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={onRegister} style={{
              height: 52, borderRadius: 15,
              background: 'var(--fp-accent)', color: 'var(--fp-accent-ink)',
              fontSize: 15, fontWeight: 500,
            }}>Create account</button>

            <button onClick={onSignIn} style={{
              height: 52, borderRadius: 15,
              background: 'var(--fp-surface)', border: '1px solid var(--fp-line)',
              color: 'var(--fp-ink)', fontSize: 15, fontWeight: 500,
            }}>Sign in</button>
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--fp-line)', marginBottom: 20 }}/>

        <button onClick={onFriends} style={{
          width: '100%', height: 52, borderRadius: 14, marginBottom: 14,
          background: 'var(--fp-surface)', border: '1px solid var(--fp-line)',
          color: 'var(--fp-ink)', fontSize: 14, fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px',
        }}>
          <span>Friends &amp; share codes</span>
          <Icon.Chevron dir="right" size={14} c="var(--fp-ink-3)"/>
        </button>

        <PremiumCard onPremium={onPremium}/>
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

function PremiumCard({ onPremium }) {
  return (
    <div style={{
      borderRadius: 18,
      background: 'var(--fp-surface)',
      border: '1px solid var(--fp-line)',
      overflow: 'hidden',
      marginBottom: 24,
    }}>
      <div style={{ padding: '16px 18px 0', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
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
        <button onClick={onPremium} style={{
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
  );
}

// ─── Signed-in view ─────────────────────────────────────────────

function SignedInView({ account, progress, onBack, padX, onSwitch, onFriends, onPremium }) {
  const stars = FP_AUTH.totalStarsFromProgress(progress);
  const friendsCount = FP_AUTH.getFriends().length;
  const otherAccounts = FP_AUTH.listAccounts().filter(a => a.id !== account.id).length;

  const [shareCode, setShareCode] = useACS(null);
  const [copied, setCopied] = useACS(false);

  const showShare = () => {
    try { setShareCode(FP_AUTH.generateShareCode()); }
    catch (e) { setShareCode(`Error: ${e.message}`); }
  };
  const copy = () => {
    if (!shareCode) return;
    if (navigator.clipboard) navigator.clipboard.writeText(shareCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const signOut = () => {
    if (confirm('Sign out? Your progress stays saved on this device.')) {
      FP_AUTH.signOut();
    }
  };

  return (
    <div className="fp-screen" style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
    }}>
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
        {/* Profile header */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          paddingTop: 24, paddingBottom: 22,
        }}>
          <div style={{
            width: 84, height: 84, borderRadius: '50%',
            background: 'var(--fp-surface-2)', border: '2px solid var(--fp-line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14, fontSize: 38,
          }}>{account.avatar}</div>

          <div style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontStyle: 'italic', fontSize: 28, letterSpacing: '-0.02em',
            color: 'var(--fp-ink)', marginBottom: 4,
          }}>{account.name}</div>

          <div style={{ fontSize: 12, color: 'var(--fp-ink-3)' }}>{account.email}</div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 18, marginTop: 14,
          }}>
            <Stat label="Stars" value={stars}/>
            <Stat label="Friends" value={friendsCount}/>
          </div>
        </div>

        {/* Friend code */}
        <div style={{
          background: 'var(--fp-surface)', border: '1px solid var(--fp-line)',
          borderRadius: 16, padding: 16, marginBottom: 14,
        }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fp-ink-3)', marginBottom: 6 }}>
            Friend code
          </div>
          <div className="fp-mono" style={{ fontSize: 18, fontWeight: 600, color: 'var(--fp-ink)', letterSpacing: '0.04em' }}>
            {account.friendCode}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--fp-ink-3)', marginTop: 4, lineHeight: 1.5 }}>
            Share your full score code with friends so their device shows your scores on level &amp; total leaderboards.
          </div>

          {!shareCode ? (
            <button onClick={showShare} style={{
              marginTop: 12, width: '100%', height: 42, borderRadius: 11,
              background: 'var(--fp-ink)', color: 'var(--fp-bg)',
              fontSize: 13, fontWeight: 500,
            }}>Generate share code</button>
          ) : (
            <div style={{ marginTop: 12 }}>
              <textarea readOnly value={shareCode} onClick={e => e.target.select()} style={{
                width: '100%', minHeight: 64, boxSizing: 'border-box',
                padding: 10, borderRadius: 10, resize: 'none',
                fontFamily: "'Geist Mono', monospace", fontSize: 11,
                background: 'var(--fp-bg)', border: '1px solid var(--fp-line)',
                color: 'var(--fp-ink-2)', wordBreak: 'break-all',
              }}/>
              <button onClick={copy} style={{
                marginTop: 8, width: '100%', height: 38, borderRadius: 10,
                background: 'var(--fp-surface-2)', border: '1px solid var(--fp-line)',
                color: 'var(--fp-ink)', fontSize: 13, fontWeight: 500,
              }}>{copied ? 'Copied!' : 'Copy to clipboard'}</button>
            </div>
          )}
        </div>

        {/* Friends button */}
        <button onClick={onFriends} style={{
          width: '100%', height: 52, borderRadius: 14, marginBottom: 10,
          background: 'var(--fp-surface)', border: '1px solid var(--fp-line)',
          color: 'var(--fp-ink)', fontSize: 14, fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px',
        }}>
          <span>Manage friends</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="fp-mono" style={{ fontSize: 12, color: 'var(--fp-ink-3)' }}>{friendsCount}</span>
            <Icon.Chevron dir="right" size={14} c="var(--fp-ink-3)"/>
          </span>
        </button>

        {/* Switch / sign out */}
        <button onClick={onSwitch} style={{
          width: '100%', height: 52, borderRadius: 14, marginBottom: 10,
          background: 'var(--fp-surface)', border: '1px solid var(--fp-line)',
          color: 'var(--fp-ink)', fontSize: 14, fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px',
        }}>
          <span>Switch account</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="fp-mono" style={{ fontSize: 12, color: 'var(--fp-ink-3)' }}>{otherAccounts}</span>
            <Icon.Chevron dir="right" size={14} c="var(--fp-ink-3)"/>
          </span>
        </button>

        <button onClick={signOut} style={{
          width: '100%', height: 48, borderRadius: 14, marginBottom: 22,
          background: 'transparent', border: '1px solid var(--fp-line)',
          color: 'var(--fp-ink-2)', fontSize: 13.5, fontWeight: 500,
        }}>Sign out</button>

        <div style={{ height: 1, background: 'var(--fp-line)', marginBottom: 18 }}/>

        <PremiumCard onPremium={onPremium}/>
      </div>

      <div style={{
        textAlign: 'center', fontSize: 11, color: 'var(--fp-ink-4)',
        padding: '8px 12px',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
      }}>
        Accounts and friends are stored on this device only.
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="fp-mono" style={{ fontSize: 22, fontWeight: 600, color: 'var(--fp-ink)' }}>{value}</div>
      <div style={{ fontSize: 10.5, color: 'var(--fp-ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

// ─── Sign in / register ─────────────────────────────────────────

function SignInView({ onBack, padX, onSuccess, error, setError }) {
  const [email, setEmail] = useACS('');
  const [pass,  setPass]  = useACS('');
  const [busy,  setBusy]  = useACS(false);

  const submit = async () => {
    setError(''); setBusy(true);
    try {
      await FP_AUTH.signIn({ email, password: pass });
      onSuccess();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <ScreenFrame title="Sign in" onBack={onBack} padX={padX}>
      <div style={{ padding: '24px 0' }}>
        <ErrorLine msg={error}/>
        <AuthField label="Email"    type="email"    value={email} onChange={setEmail} placeholder="you@example.com" autoFocus/>
        <AuthField label="Password" type="password" value={pass}  onChange={setPass}  placeholder="••••••••"/>

        <button onClick={submit} disabled={busy} style={{
          width: '100%', height: 52, borderRadius: 15, marginTop: 4,
          background: 'var(--fp-accent)', color: 'var(--fp-accent-ink)',
          fontSize: 15, fontWeight: 500, opacity: busy ? 0.6 : 1,
        }}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </div>
    </ScreenFrame>
  );
}

function RegisterView({ onBack, padX, onSuccess, error, setError }) {
  const [name,  setName]  = useACS('');
  const [email, setEmail] = useACS('');
  const [pass,  setPass]  = useACS('');
  const [busy,  setBusy]  = useACS(false);

  const submit = async () => {
    setError(''); setBusy(true);
    try {
      await FP_AUTH.register({ name, email, password: pass });
      onSuccess();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <ScreenFrame title="Create account" onBack={onBack} padX={padX}>
      <div style={{ padding: '24px 0' }}>
        <ErrorLine msg={error}/>
        <AuthField label="Display name" type="text"     value={name}  onChange={setName}  placeholder="Your name" autoFocus/>
        <AuthField label="Email"        type="email"    value={email} onChange={setEmail} placeholder="you@example.com"/>
        <AuthField label="Password"     type="password" value={pass}  onChange={setPass}  placeholder="At least 6 characters"/>

        <button onClick={submit} disabled={busy} style={{
          width: '100%', height: 52, borderRadius: 15, marginTop: 4,
          background: 'var(--fp-accent)', color: 'var(--fp-accent-ink)',
          fontSize: 15, fontWeight: 500, opacity: busy ? 0.6 : 1,
        }}>{busy ? 'Creating…' : 'Create account'}</button>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 11.5, color: 'var(--fp-ink-4)', lineHeight: 1.55 }}>
          Accounts are stored on this device only — no email is sent anywhere.
        </div>
      </div>
    </ScreenFrame>
  );
}

// ─── Switch account ─────────────────────────────────────────────

function SwitchAccountView({ onBack, padX, active }) {
  const accounts = FP_AUTH.listAccounts();

  const pick = id => {
    if (id === active?.id) return;
    FP_AUTH.setActive(id);
  };
  const removeAccount = (id, name) => {
    if (confirm(`Delete account "${name}" and all its progress on this device?`)) {
      FP_AUTH.deleteAccount(id);
    }
  };

  return (
    <ScreenFrame title="Switch account" onBack={onBack} padX={padX}>
      <div style={{ padding: '20px 0' }}>
        {accounts.map(a => (
          <div key={a.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px', marginBottom: 8,
            borderRadius: 14,
            background: a.id === active?.id ? 'var(--fp-surface)' : 'transparent',
            border: `1.5px solid ${a.id === active?.id ? 'var(--fp-ink)' : 'var(--fp-line)'}`,
          }}>
            <button onClick={() => pick(a.id)} style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 12,
              background: 'transparent', textAlign: 'left',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flex: '0 0 40px',
                background: 'var(--fp-surface-2)', border: '1px solid var(--fp-line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>{a.avatar}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fp-ink)' }}>{a.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--fp-ink-3)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.email}</div>
              </div>
            </button>
            {a.id !== active?.id && (
              <button onClick={() => removeAccount(a.id, a.name)} style={{
                width: 32, height: 32, borderRadius: 8,
                color: 'var(--fp-ink-4)', fontSize: 18,
              }} title="Delete">×</button>
            )}
          </div>
        ))}

        {accounts.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--fp-ink-3)', fontSize: 13, padding: 24 }}>
            No accounts yet.
          </div>
        )}
      </div>
    </ScreenFrame>
  );
}

// ─── Friends list / add by code ─────────────────────────────────

function FriendsView({ onBack, padX, signedIn }) {
  const [code, setCode] = useACS('');
  const [error, setError] = useACS('');
  const [success, setSuccess] = useACS('');
  const [, force] = useACS(0);
  const friends = FP_AUTH.getFriends();

  const submit = () => {
    setError(''); setSuccess('');
    try {
      const f = FP_AUTH.importShareCode(code);
      setSuccess(`Added ${f.name}`);
      setCode('');
    } catch (e) { setError(e.message); }
  };

  const remove = (id, name) => {
    if (confirm(`Remove ${name} from your friends?`)) {
      FP_AUTH.removeFriend(id);
      force(x => x + 1);
    }
  };

  return (
    <ScreenFrame title="Friends" onBack={onBack} padX={padX}>
      <div style={{ padding: '20px 0' }}>
        {!signedIn && (
          <ErrorLine msg="Sign in or create an account to add friends."/>
        )}

        <div style={{
          background: 'var(--fp-surface)', border: '1px solid var(--fp-line)',
          borderRadius: 16, padding: 14, marginBottom: 18,
        }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fp-ink-3)', marginBottom: 8 }}>
            Add by share code
          </div>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Paste a friend's FP1.… code"
            disabled={!signedIn}
            style={{
              width: '100%', minHeight: 64, boxSizing: 'border-box',
              padding: 10, borderRadius: 10, resize: 'none',
              fontFamily: "'Geist Mono', monospace", fontSize: 11,
              background: 'var(--fp-bg)', border: '1px solid var(--fp-line)',
              color: 'var(--fp-ink-2)', outline: 'none',
            }}
          />
          {error   && <div style={{ marginTop: 8, fontSize: 12, color: '#e34' }}>{error}</div>}
          {success && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--fp-accent)' }}>{success}</div>}
          <button onClick={submit} disabled={!signedIn || !code.trim()} style={{
            marginTop: 10, width: '100%', height: 42, borderRadius: 11,
            background: 'var(--fp-ink)', color: 'var(--fp-bg)',
            fontSize: 13, fontWeight: 500,
            opacity: (!signedIn || !code.trim()) ? 0.5 : 1,
          }}>Add friend</button>
        </div>

        <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fp-ink-3)', marginBottom: 8 }}>
          {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
        </div>

        {friends.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--fp-ink-3)', fontSize: 12.5, padding: '20px 0', lineHeight: 1.55 }}>
            No friends yet. Ask a friend to share their code from their account screen.
          </div>
        ) : (
          friends.map(f => (
            <div key={f.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 0', borderBottom: '1px solid var(--fp-line)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flex: '0 0 36px',
                background: 'var(--fp-surface-2)', border: '1px solid var(--fp-line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>{f.avatar || '🟢'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fp-ink)' }}>{f.name}</div>
                <div style={{ fontSize: 11, color: 'var(--fp-ink-4)' }}>
                  {f.stars} ★ · imported {new Date(f.importedAt).toLocaleDateString()}
                </div>
              </div>
              <button onClick={() => remove(f.id, f.name)} style={{
                width: 30, height: 30, borderRadius: 8,
                color: 'var(--fp-ink-4)', fontSize: 18,
              }} title="Remove">×</button>
            </div>
          ))
        )}
      </div>
    </ScreenFrame>
  );
}

// ─── Premium ────────────────────────────────────────────────────

function PremiumView({ onBack, padX }) {
  const [selected, setSelected] = useACS('yearly');

  const plans = [
    { id: 'yearly',  label: 'Annual',  price: '$19.99', sub: '$1.67 / month', badge: 'Best value' },
    { id: 'monthly', label: 'Monthly', price: '$2.99',  sub: 'Billed monthly' },
    { id: 'lifetime',label: 'Lifetime',price: '$39.99', sub: 'One-time purchase' },
  ];

  return (
    <ScreenFrame title="Premium" onBack={onBack} padX={padX}>
      <div style={{ padding: '24px 0' }}>
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
    </ScreenFrame>
  );
}

window.AccountScreen = AccountScreen;

// Function Plane — FP_AUTH backed by Supabase
//
// Provides: register / signIn / signOut / getActive (sync, cached) /
//           getActiveProgress (sync, localStorage cache) /
//           updateActiveProgress (sync write + async Supabase upload) /
//           buildLeaderboard (async) / subscribe
//
// If SUPABASE_URL / SUPABASE_ANON_KEY are not filled in yet the module runs
// in guest mode — all local features work, no network calls are made.

(() => {
  const AVATARS = ['🟢','🟣','🟠','🔵','🟡','🔴','⚫','⚪','🟤'];
  const PROGRESS_PREFIX = 'fp-progress-';
  const GUEST_KEY       = 'fp-progress';

  // Module-level cache — keeps getActive() / getActiveProgress() synchronous
  let _sb          = null;   // supabase client
  let _currentUser = null;   // { id, email, name, avatar, totalStars } | null
  let _syncTimer   = null;

  const subscribers = new Set();
  const notify = () => subscribers.forEach(fn => { try { fn(); } catch {} });

  const readJSON  = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
  const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const progressKey = id  => id ? PROGRESS_PREFIX + id : GUEST_KEY;

  // ── Initialise ────────────────────────────────────────────────────────────

  async function _init() {
    const url = window.SUPABASE_URL  || '';
    const key = window.SUPABASE_ANON_KEY || '';
    if (!url || url.includes('YOUR-PROJECT') || !key || key.includes('YOUR-ANON')) {
      console.info('FP_AUTH: Supabase not configured — guest mode');
      return;
    }

    _sb = window.supabase.createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true },
    });

    // Restore existing session (e.g. returning visitor on same device)
    const { data: { session } } = await _sb.auth.getSession();
    if (session) {
      _currentUser = await _fetchProfile(session.user);
      await _syncProgressDown(session.user.id, true);
    }
    notify();

    // Keep cache in sync when auth state changes (sign-in / sign-out / token refresh)
    _sb.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        _currentUser = await _fetchProfile(session.user);
        if (event === 'SIGNED_IN') await _syncProgressDown(session.user.id, false);
      } else {
        _currentUser = null;
      }
      notify();
    });
  }

  async function _fetchProfile(user) {
    if (!_sb) return null;
    const { data } = await _sb.from('profiles')
      .select('name, avatar, total_stars').eq('id', user.id).single();
    return {
      id:         user.id,
      email:      user.email,
      name:       data?.name  || user.user_metadata?.name   || 'Player',
      avatar:     data?.avatar || user.user_metadata?.avatar || '🟢',
      totalStars: data?.total_stars || 0,
    };
  }

  // Download remote progress, merge with local, push merged back up
  async function _syncProgressDown(userId, skipUpload = false) {
    if (!_sb) return;
    const { data } = await _sb.from('progress').select('data').eq('user_id', userId).single();
    const remote   = data?.data || null;
    const local    = readJSON(progressKey(userId), null);
    const merged   = _mergeProgress(remote, local);
    writeJSON(progressKey(userId), merged);
    if (!skipUpload && merged) _scheduleUpload(userId, merged);
  }

  // Merge two progress snapshots, taking the best of each level
  function _mergeProgress(a, b) {
    if (!a) return b;
    if (!b) return a;
    const out = {};
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      const pa = a[k] || { stars: [], best: [] };
      const pb = b[k] || { stars: [], best: [] };
      out[k] = {
        stars: Array.from({ length: 10 }, (_, i) => {
          const sa = pa.stars?.[i] ?? null, sb = pb.stars?.[i] ?? null;
          if (sa === null && sb === null) return null;
          return Math.max(sa ?? -1, sb ?? -1);
        }),
        best: Array.from({ length: 10 }, (_, i) => {
          const ba = pa.best?.[i] ?? null, bb = pb.best?.[i] ?? null;
          if (ba === null && bb === null) return null;
          if (ba === null) return bb;
          if (bb === null) return ba;
          return Math.min(ba, bb); // lower score = better (fewer equations used)
        }),
      };
    }
    return out;
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  async function register({ name, email, password }) {
    name  = (name  || '').trim();
    email = (email || '').trim().toLowerCase();
    if (!name)                    throw new Error('Display name is required');
    if (!email.includes('@'))     throw new Error('Enter a valid email address');
    if ((password||'').length < 6) throw new Error('Password must be at least 6 characters');
    if (!_sb)                     throw new Error('Supabase is not configured yet');

    const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    const { data, error } = await _sb.auth.signUp({
      email, password,
      options: { data: { name, avatar } },
    });
    if (error) throw new Error(error.message);

    // Migrate any guest progress to the new account
    const guestProgress = readJSON(GUEST_KEY, null);
    if (guestProgress && data.user) {
      writeJSON(progressKey(data.user.id), guestProgress);
    }
    return { id: data.user?.id, name, email, avatar };
  }

  async function signIn({ email, password }) {
    if (!_sb) throw new Error('Supabase is not configured yet');
    const { error } = await _sb.auth.signInWithPassword({
      email: (email || '').trim().toLowerCase(), password,
    });
    if (error) throw new Error(
      error.message.toLowerCase().includes('invalid') ? 'Incorrect email or password' : error.message
    );
    return _currentUser;
  }

  async function signOut() {
    if (_sb) await _sb.auth.signOut();
  }

  async function resetPassword(email) {
    if (!_sb) throw new Error('Supabase is not configured yet');
    const { error } = await _sb.auth.resetPasswordForEmail(
      (email || '').trim().toLowerCase(),
      { redirectTo: window.location.origin },
    );
    if (error) throw new Error(error.message);
  }

  function getActive() { return _currentUser; }

  // ── Progress (sync interface, async Supabase background sync) ─────────────

  function getActiveProgress() {
    return readJSON(progressKey(_currentUser?.id), null);
  }

  function updateActiveProgress(progress) {
    writeJSON(progressKey(_currentUser?.id), progress);
    if (_sb && _currentUser) _scheduleUpload(_currentUser.id, progress);
  }

  function _scheduleUpload(userId, progress) {
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => _uploadProgress(userId, progress), 1500);
  }

  async function _uploadProgress(userId, progress) {
    if (!_sb) return;
    try {
      const totalStars = _countStars(progress);

      await Promise.all([
        _sb.from('progress').upsert({ user_id: userId, data: progress, updated_at: new Date().toISOString() }),
        _sb.from('profiles').update({ total_stars: totalStars }).eq('id', userId),
      ]);

      // Upsert individual completed level rows (drives per-level leaderboards)
      const rows = [];
      for (const [packId, pd] of Object.entries(progress)) {
        (pd?.best || []).forEach((score, levelIndex) => {
          const stars = pd?.stars?.[levelIndex] ?? -1;
          if (score != null && stars >= 1) {
            rows.push({ user_id: userId, pack_id: packId, level_index: levelIndex, best_score: score, stars });
          }
        });
      }
      if (rows.length) {
        await _sb.from('level_scores').upsert(rows, {
          onConflict: 'user_id,pack_id,level_index', ignoreDuplicates: false,
        });
      }

      if (_currentUser) _currentUser.totalStars = totalStars;
    } catch (e) {
      console.warn('FP_AUTH: upload error', e);
    }
  }

  function _countStars(progress) {
    if (!progress) return 0;
    return Object.values(progress).reduce(
      (a, pd) => a + (pd?.stars || []).reduce((b, s) => b + (s > 0 ? s : 0), 0), 0,
    );
  }

  // ── Leaderboards (async) ──────────────────────────────────────────────────
  //
  // metric = 'stars'  → global ranking by total stars (for Achievements screen)
  // metric = 'level'  → ranking for one level by best_score ascending (for Level Complete)

  async function buildLeaderboard({ metric = 'stars', packId = null, levelIndex = null } = {}) {
    if (!_sb) return [];

    if (metric === 'stars') {
      const { data, error } = await _sb
        .from('profiles')
        .select('id, name, avatar, total_stars')
        .order('total_stars', { ascending: false })
        .limit(25);
      if (error || !data) return [];

      const rows = data.map((r, i) => ({
        id: r.id, name: r.name, avatar: r.avatar,
        stars: r.total_stars, rank: i + 1,
        self: r.id === _currentUser?.id,
      }));

      // Append current user below top-25 if not already in list
      if (_currentUser && !rows.find(r => r.self)) {
        rows.push({
          id: _currentUser.id, name: _currentUser.name, avatar: _currentUser.avatar,
          stars: _countStars(getActiveProgress()), rank: null, self: true,
        });
      }
      return rows;
    }

    if (metric === 'level' && packId != null && levelIndex != null) {
      const { data, error } = await _sb
        .from('level_scores')
        .select('user_id, best_score, profiles ( name, avatar )')
        .eq('pack_id', packId)
        .eq('level_index', levelIndex)
        .order('best_score', { ascending: true })  // lower score = more elegant solution
        .limit(25);
      if (error || !data) return [];

      const rows = data.map((r, i) => ({
        id: r.user_id,
        name:   r.profiles?.name   || 'Player',
        avatar: r.profiles?.avatar || '🟢',
        score: r.best_score, rank: i + 1,
        self: r.user_id === _currentUser?.id,
      }));

      // Append self below top-25 if not present (using local cached score)
      if (_currentUser && !rows.find(r => r.self)) {
        const myScore = getActiveProgress()?.[packId]?.best?.[levelIndex];
        if (myScore != null) {
          rows.push({
            id: _currentUser.id, name: _currentUser.name, avatar: _currentUser.avatar,
            score: myScore, rank: null, self: true,
          });
        }
      }
      return rows;
    }

    return [];
  }

  // ── Misc ──────────────────────────────────────────────────────────────────

  function totalStarsFromProgress(p) { return _countStars(p); }

  function subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }

  // ── Export ────────────────────────────────────────────────────────────────

  window.FP_AUTH = {
    getActive, signOut,
    register, signIn, resetPassword,
    getActiveProgress, updateActiveProgress,
    buildLeaderboard, totalStarsFromProgress,
    subscribe,
    AVATARS,
  };

  // Kick off async init (errors are caught internally; app always loads)
  _init().catch(e => console.warn('FP_AUTH init:', e));
})();

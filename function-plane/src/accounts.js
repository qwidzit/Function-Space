// Function Plane — Local accounts + friend codes (FP_AUTH)
//
// Storage model (all in localStorage):
//   fp-users         { [id]: { id, name, email, salt, hash, avatar, friendCode, createdAt, progress } }
//   fp-active-user   string | null
//   fp-friends       { [ownerId]: [{ id, name, avatar, stars, perLevel:{[packId]:[best,...]}, importedAt }] }
//   fp-progress      legacy/guest progress (kept as a fallback for not-signed-in play)
//
// "Auth" here is local-only — accounts live on this device. Passwords are
// salted+SHA-256 hashed but the threat model is "casual shared-device privacy",
// not "secure remote auth". The module is designed so the surface (register /
// signIn / setActive / updateActiveProgress / friend codes) can later be backed
// by a real server with no caller changes.

(() => {
  const USERS_KEY    = 'fp-users';
  const ACTIVE_KEY   = 'fp-active-user';
  const FRIENDS_KEY  = 'fp-friends';
  const PROGRESS_KEY = 'fp-progress';

  const AVATARS = ['🟢','🟣','🟠','🔵','🟡','🔴','⚫','⚪','🟤'];

  const subscribers = new Set();
  const notify = () => subscribers.forEach(fn => { try { fn(); } catch {} });

  // ── helpers ──
  const readJSON = (k, d) => {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; }
  };
  const writeJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  const randomId = () =>
    'u_' + Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  const randomSalt = () =>
    Array.from(crypto.getRandomValues(new Uint8Array(8)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  const friendCodeFor = id => {
    // 9-char base32-ish code from the id; stable per account
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 9; i++) {
      out += alphabet[(h >>> (i * 3)) & 31];
      if (i === 2 || i === 5) out += '-';
    }
    return out;
  };

  async function hashPassword(pass, salt) {
    const data = new TextEncoder().encode(salt + ':' + pass);
    const buf  = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ── store accessors ──
  const getUsers   = () => readJSON(USERS_KEY, {});
  const setUsers   = u => { writeJSON(USERS_KEY, u); notify(); };
  const getActiveId = () => localStorage.getItem(ACTIVE_KEY);
  const setActiveId = id => {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else    localStorage.removeItem(ACTIVE_KEY);
    notify();
  };

  function getActive() {
    const id = getActiveId();
    if (!id) return null;
    const u = getUsers()[id];
    return u ? publicUser(u) : null;
  }

  function publicUser(u) {
    return { id: u.id, name: u.name, email: u.email, avatar: u.avatar,
             friendCode: u.friendCode, createdAt: u.createdAt };
  }

  function listAccounts() {
    return Object.values(getUsers()).map(publicUser)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  function findByEmail(email) {
    const e = (email || '').trim().toLowerCase();
    return Object.values(getUsers()).find(u => u.email === e) || null;
  }

  // ── auth ──
  async function register({ name, email, password }) {
    name  = (name  || '').trim();
    email = (email || '').trim().toLowerCase();
    if (!name)                   throw new Error('Display name is required');
    if (!email.includes('@'))    throw new Error('Enter a valid email');
    if ((password || '').length < 6) throw new Error('Password must be at least 6 characters');
    if (findByEmail(email))      throw new Error('An account with that email already exists');

    const salt = randomSalt();
    const hash = await hashPassword(password, salt);
    const id   = randomId();
    const user = {
      id, name, email, salt, hash,
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      friendCode: friendCodeFor(id),
      createdAt: Date.now(),
      progress: readJSON(PROGRESS_KEY, null) || (window.freshProgress ? window.freshProgress() : {}),
    };
    const users = getUsers();
    users[id] = user;
    setUsers(users);
    setActiveId(id);
    return publicUser(user);
  }

  async function signIn({ email, password }) {
    const u = findByEmail(email);
    if (!u) throw new Error('No account found with that email');
    const hash = await hashPassword(password, u.salt);
    if (hash !== u.hash) throw new Error('Incorrect password');
    setActiveId(u.id);
    return publicUser(u);
  }

  function signOut() { setActiveId(null); }

  function setActive(id) {
    if (!getUsers()[id]) throw new Error('Account not found');
    setActiveId(id);
  }

  function deleteAccount(id) {
    const users = getUsers();
    delete users[id];
    setUsers(users);
    const friends = readJSON(FRIENDS_KEY, {});
    delete friends[id];
    writeJSON(FRIENDS_KEY, friends);
    if (getActiveId() === id) setActiveId(null);
  }

  function updateAccount(id, patch) {
    const users = getUsers();
    if (!users[id]) return;
    users[id] = { ...users[id], ...patch };
    setUsers(users);
  }

  // ── progress ──
  function getActiveProgress() {
    const id = getActiveId();
    if (!id) return readJSON(PROGRESS_KEY, null);
    return getUsers()[id]?.progress || null;
  }

  function updateActiveProgress(progress) {
    const id = getActiveId();
    if (!id) {
      writeJSON(PROGRESS_KEY, progress);
      return;
    }
    const users = getUsers();
    if (users[id]) {
      users[id].progress = progress;
      writeJSON(USERS_KEY, users); // no notify — avoid re-render loops
    }
  }

  // ── friends / share codes ──
  // A share code is a base64url-encoded JSON snapshot of a player's public
  // scoreboard. Friends are stored per-owner so each local account has its own
  // friend list.

  function topPerLevel(progress) {
    const out = {};
    Object.keys(progress || {}).forEach(packId => {
      out[packId] = (progress[packId]?.best || []).map(b => b == null ? null : b);
    });
    return out;
  }

  function totalStarsFromProgress(p) {
    if (!p) return 0;
    return Object.values(p).reduce(
      (a, pd) => a + (pd?.stars || []).reduce((b, s) => b + (s > 0 ? s : 0), 0), 0,
    );
  }

  function b64urlEncode(s) {
    return btoa(unescape(encodeURIComponent(s)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64urlDecode(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return decodeURIComponent(escape(atob(s)));
  }

  function generateShareCode() {
    const u = getUsers()[getActiveId()];
    if (!u) throw new Error('Sign in to share your scores');
    const payload = {
      v: 1, id: u.id, name: u.name, avatar: u.avatar,
      stars: totalStarsFromProgress(u.progress),
      perLevel: topPerLevel(u.progress),
      stamp: Date.now(),
    };
    return 'FP1.' + b64urlEncode(JSON.stringify(payload));
  }

  function parseShareCode(code) {
    code = (code || '').trim();
    if (code.startsWith('FP1.')) code = code.slice(4);
    let payload;
    try { payload = JSON.parse(b64urlDecode(code)); }
    catch { throw new Error('Invalid share code'); }
    if (!payload || payload.v !== 1 || !payload.id || !payload.name)
      throw new Error('Invalid share code');
    return payload;
  }

  function importShareCode(code) {
    const ownerId = getActiveId();
    if (!ownerId) throw new Error('Sign in to add friends');
    const payload = parseShareCode(code);
    if (payload.id === ownerId) throw new Error("That's your own code");
    const friends = readJSON(FRIENDS_KEY, {});
    const list = friends[ownerId] || [];
    const idx  = list.findIndex(f => f.id === payload.id);
    const entry = {
      id: payload.id, name: payload.name, avatar: payload.avatar || '🟢',
      stars: payload.stars || 0, perLevel: payload.perLevel || {},
      importedAt: Date.now(),
    };
    if (idx >= 0) list[idx] = entry;
    else          list.push(entry);
    friends[ownerId] = list;
    writeJSON(FRIENDS_KEY, friends);
    notify();
    return entry;
  }

  function getFriends() {
    const ownerId = getActiveId();
    if (!ownerId) return [];
    const friends = readJSON(FRIENDS_KEY, {});
    return friends[ownerId] || [];
  }

  function removeFriend(friendId) {
    const ownerId = getActiveId();
    if (!ownerId) return;
    const friends = readJSON(FRIENDS_KEY, {});
    friends[ownerId] = (friends[ownerId] || []).filter(f => f.id !== friendId);
    writeJSON(FRIENDS_KEY, friends);
    notify();
  }

  // ── leaderboard composition ──
  // Builds a sorted list combining the active player + their friends.
  // metric = 'stars' (totals) or 'level' (per-level best, lower = better)
  function buildLeaderboard({ metric = 'stars', packId = null, levelIndex = null } = {}) {
    const me = getActive();
    const friends = getFriends();
    const meProgress = getActiveProgress() || {};
    const rows = [];

    if (metric === 'stars') {
      if (me) rows.push({ id: me.id, name: me.name, avatar: me.avatar, stars: totalStarsFromProgress(meProgress), self: true });
      friends.forEach(f => rows.push({ id: f.id, name: f.name, avatar: f.avatar, stars: f.stars || 0, self: false }));
      rows.sort((a, b) => b.stars - a.stars);
    } else if (metric === 'level' && packId != null && levelIndex != null) {
      const meBest = meProgress[packId]?.best?.[levelIndex];
      if (me && meBest != null)
        rows.push({ id: me.id, name: me.name, avatar: me.avatar, score: meBest, self: true });
      friends.forEach(f => {
        const s = f.perLevel?.[packId]?.[levelIndex];
        if (s != null) rows.push({ id: f.id, name: f.name, avatar: f.avatar, score: s, self: false });
      });
      rows.sort((a, b) => a.score - b.score);
    }
    rows.forEach((r, i) => r.rank = i + 1);
    return rows;
  }

  function subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }

  window.FP_AUTH = {
    listAccounts, getActive, setActive, signOut,
    register, signIn, deleteAccount, updateAccount,
    getActiveProgress, updateActiveProgress,
    generateShareCode, importShareCode, parseShareCode,
    getFriends, removeFriend,
    buildLeaderboard, totalStarsFromProgress,
    subscribe,
    AVATARS,
  };
})();

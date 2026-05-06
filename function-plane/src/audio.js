// Function Plane — Audio & haptics system
(function () {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, type, dur, vol, attack) {
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.connect(g);
      g.connect(c.destination);
      osc.type = type;
      osc.frequency.value = freq;
      const t = c.currentTime;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + attack);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    } catch (_) {}
  }

  window.FP_AUDIO = {
    bounce(vol = 1) {
      tone(200, 'sine', 0.10, 0.14 * vol, 0.005);
    },
    collectStar(vol = 1) {
      tone(880, 'sine', 0.14, 0.12 * vol, 0.008);
      setTimeout(() => tone(1100, 'sine', 0.12, 0.10 * vol, 0.008), 70);
    },
    levelComplete(vol = 1) {
      [523, 659, 784, 1047].forEach((f, i) =>
        setTimeout(() => tone(f, 'sine', 0.30, 0.13 * vol, 0.01), i * 90)
      );
    },
    levelFail(vol = 1) {
      tone(280, 'sawtooth', 0.18, 0.10 * vol, 0.01);
      setTimeout(() => tone(190, 'sawtooth', 0.22, 0.08 * vol, 0.01), 110);
    },
    click(vol = 1) {
      tone(600, 'sine', 0.05, 0.07 * vol, 0.003);
    },
  };

})();

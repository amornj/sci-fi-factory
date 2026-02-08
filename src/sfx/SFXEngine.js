// Procedural SFX engine — Web Audio API oscillators + noise buffers
// No audio files needed. Lazy-init on first user interaction (browser policy).

let ctx = null;
let noiseBuffer = null;

function ensureNoiseBuffer() {
  if (noiseBuffer) return noiseBuffer;
  const len = ctx.sampleRate; // 1 second of noise
  noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return noiseBuffer;
}

function playNoiseBurst(duration, filterFreq, filterType, gain) {
  const src = ctx.createBufferSource();
  src.buffer = ensureNoiseBuffer();
  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = filterFreq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  src.connect(filter).connect(g).connect(ctx.destination);
  src.start();
  src.stop(ctx.currentTime + duration);
}

function playOsc(freq, type, duration, gain, detune) {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  if (detune) osc.detune.value = detune;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(g).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
  return osc;
}

const sfx = {
  _ready: false,

  init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      this._ready = true;
    } catch (e) {
      // Audio not available — silently degrade
    }
  },

  // Pickaxe hit — metallic clang + low thud
  playPickaxeHit() {
    if (!ctx) return;
    // Metallic clang — high frequency short burst
    playOsc(800, 'square', 0.08, 0.15);
    playOsc(1200, 'sine', 0.06, 0.1, 50);
    // Low thud
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.25, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
    // Noise texture
    playNoiseBurst(0.05, 3000, 'highpass', 0.08);
  },

  // Chisel tap — crystalline "ting"
  playChiselTap() {
    if (!ctx) return;
    // High sine sweep
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.15);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    // Harmonic
    playOsc(3000, 'sine', 0.2, 0.06, 30);
    playOsc(5000, 'sine', 0.1, 0.03);
  },

  // Ladle scoop — wet "shlorp"
  playLadleScoop() {
    if (!ctx) return;
    // Lowpass filtered noise
    playNoiseBurst(0.25, 600, 'lowpass', 0.2);
    // Low "blorp"
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  },

  // Mushroom pickup — ascending two-note cheerful tone
  playMushroomPickup() {
    if (!ctx) return;
    // Note 1
    playOsc(523, 'sine', 0.15, 0.12); // C5
    // Note 2 (delayed)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 659; // E5
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.setValueAtTime(0.12, ctx.currentTime + 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(g).connect(ctx.destination);
    osc.start(ctx.currentTime + 0.12);
    osc.stop(ctx.currentTime + 0.35);
  },

  // Interact — subtle blip click
  playInteract() {
    if (!ctx) return;
    playOsc(1000, 'sine', 0.04, 0.08);
    playOsc(1500, 'sine', 0.03, 0.04);
  },

  // Enemy hit — meaty thud with distortion
  playEnemyHit() {
    if (!ctx) return;
    playOsc(200, 'sawtooth', 0.1, 0.2);
    playOsc(80, 'sine', 0.15, 0.15);
    playNoiseBurst(0.08, 1000, 'lowpass', 0.15);
  },

  // Player damage — low thud + alarm beep
  playPlayerDamage() {
    if (!ctx) return;
    playOsc(150, 'sine', 0.15, 0.25);
    playOsc(400, 'square', 0.05, 0.1);
    playNoiseBurst(0.1, 800, 'lowpass', 0.12);
  },

  // DNA scan beep — ascending sweep
  playScanBeep() {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  },

  // Laser/plasma fire — high sweep down + crackle
  playLaserFire() {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.12);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
    playNoiseBurst(0.06, 4000, 'highpass', 0.06);
  },

  // Sword swing — whoosh
  playSwordSwing() {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.12, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
    playNoiseBurst(0.15, 1500, 'bandpass', 0.1);
  },

  // Baton hit — electric zap + thud
  playBatonHit() {
    if (!ctx) return;
    playOsc(1800, 'square', 0.04, 0.12);
    playOsc(2400, 'sawtooth', 0.03, 0.08);
    playOsc(100, 'sine', 0.12, 0.18);
    playNoiseBurst(0.06, 3000, 'highpass', 0.08);
  },

  // Enemy death — descending tone + burst
  playEnemyDeath() {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    playNoiseBurst(0.2, 800, 'lowpass', 0.15);
  },

  // Player hurt — low impact + warning tone
  playPlayerHurt() {
    if (!ctx) return;
    playOsc(100, 'sine', 0.2, 0.25);
    playOsc(350, 'square', 0.08, 0.1);
    playNoiseBurst(0.12, 600, 'lowpass', 0.15);
  },

  // Wave alert — alarm siren
  playWaveAlert() {
    if (!ctx) return;
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.25;
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + delay + 0.12);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime + delay);
      g.gain.setValueAtTime(0.1, ctx.currentTime + delay + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.2);
      osc.connect(g).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.2);
    }
  },

  // Scatter shot — burst of multiple pops
  playScatterShot() {
    if (!ctx) return;
    for (let i = 0; i < 5; i++) {
      const delay = i * 0.02;
      const freq = 1600 + Math.random() * 800;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.3, ctx.currentTime + delay + 0.08);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime + delay);
      g.gain.setValueAtTime(0.08, ctx.currentTime + delay + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.1);
      osc.connect(g).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.1);
    }
    playNoiseBurst(0.08, 5000, 'highpass', 0.1);
  },

  // Empty click — dry click when out of ammo
  playEmptyClick() {
    if (!ctx) return;
    playOsc(200, 'square', 0.03, 0.1);
    playOsc(100, 'sine', 0.05, 0.08);
  },

  // Critical hit — enhanced impact with accent
  playCritHit() {
    if (!ctx) return;
    playOsc(300, 'sawtooth', 0.12, 0.2);
    playOsc(1500, 'sine', 0.06, 0.12);
    playNoiseBurst(0.08, 2000, 'highpass', 0.1);
  },

  // Status effect proc — subtle electric zap
  playStatusProc() {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
    playNoiseBurst(0.05, 4000, 'highpass', 0.04);
  },

  // Compound mix — bubbly fizz
  playCompoundMix() {
    if (!ctx) return;
    for (let i = 0; i < 5; i++) {
      const delay = i * 0.06;
      const freq = 800 + Math.random() * 2000;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime + delay);
      g.gain.setValueAtTime(0.06, ctx.currentTime + delay + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15);
      osc.connect(g).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.15);
    }
    playNoiseBurst(0.3, 2000, 'bandpass', 0.06);
  },
};

export default sfx;

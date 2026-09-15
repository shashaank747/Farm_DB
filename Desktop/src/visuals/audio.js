/**
 * FARMDB Audio Synthesizer
 * High-performance, lightweight Web Audio API sound effects
 * Zero external audio assets required; 100% procedurally synthesized.
 */

class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = true; // Muted by default per user requirement
    this.ambientInterval = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  unmute() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.muted = false;
    this.startAmbient();
  }

  mute() {
    this.muted = true;
    this.stopAmbient();
  }

  toggleMute() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.muted = !this.muted;
    if (!this.muted) {
      this.startAmbient();
      this.playChime();
    } else {
      this.stopAmbient();
    }
    return !this.muted;
  }

  playChime() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3); // C6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.8);
  }

  playCoin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    osc2.frequency.setValueAtTime(987.77, now);
    osc2.frequency.setValueAtTime(1318.51, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  playTractorMotor(duration = 3.5) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.5);
    osc.frequency.linearRampToValueAtTime(55, now + duration);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.3);
    gain.gain.linearRampToValueAtTime(0.06, now + duration - 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  playTractorRev() {
    this.playTractorMotor(2.2);
  }

  playTractorIdle() {
    this.playTractorMotor(1.8);
  }

  playWaterSplash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.08;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600 + i * 300, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.15);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    }
  }

  playCowMoo() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Moo pitch contour: 125Hz -> 155Hz -> 105Hz
    osc.frequency.setValueAtTime(125, now);
    osc.frequency.linearRampToValueAtTime(155, now + 0.35);
    osc.frequency.linearRampToValueAtTime(105, now + 1.25);

    // Subtle LFO vibrato
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(4.5, now);
    lfoGain.gain.setValueAtTime(3.5, now);
    lfo.connect(osc.frequency);

    // Lowpass formant filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, now);
    filter.frequency.linearRampToValueAtTime(460, now + 0.35);
    filter.frequency.linearRampToValueAtTime(260, now + 1.25);
    filter.Q.value = 4.0;

    // Amplitude envelope
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.2);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.85);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 1.35);
    osc.stop(now + 1.35);
  }

  playTruckHorn() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const honks = [
      { start: now, dur: 0.18 },
      { start: now + 0.24, dur: 0.22 }
    ];

    honks.forEach(h => {
      [330, 415].forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, h.start);

        gain.gain.setValueAtTime(0.001, h.start);
        gain.gain.linearRampToValueAtTime(0.12, h.start + 0.02);
        gain.gain.setValueAtTime(0.11, h.start + h.dur - 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, h.start + h.dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(h.start);
        osc.stop(h.start + h.dur);
      });
    });
  }

  playSeedScatter() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const t = now + i * 0.05 + Math.random() * 0.02;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400 + Math.random() * 800, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.06);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.06);
    }
  }

  playSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880]; // A major
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    });
  }

  playHarvestSuccess() {
    this.playSuccess();
  }

  playErrorBuzz() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.setValueAtTime(110, now + 0.1);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  startAmbient(timeOfDay = 'day') {
    if (this.ambientInterval) return;
    this.ambientInterval = setInterval(() => {
      if (!this.muted && Math.random() > 0.5) {
        if (this.currentTimeOfDay === 'night') {
          this.playCricketChirp();
        } else {
          this.playBirdChirp();
        }
      }
    }, 4500);
  }

  setTimeOfDay(phase) {
    this.currentTimeOfDay = phase;
  }

  stopAmbient() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }

  playBirdChirp() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 2200 + Math.random() * 800;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq + 400, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq - 200, now + 0.15);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  playCricketChirp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(4500 + Math.random() * 300, t);
      gain.gain.setValueAtTime(0.018, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
    }
  }

  /**
   * Procedural Cock / Rooster Crow ("Kuku-du-ku-ku" / "Cock-a-doodle-doo")
   * Synthesizes the four melodic vocal syllables of a farm rooster crowing at dawn:
   * 1. "Ku-" (~440Hz)
   * 2. "-ku-" (~540Hz)
   * 3. "-du-" (~470Hz)
   * 4. "-koo-oo-oo!" (~680Hz -> 860Hz with vibrato & brassy throat formant)
   */
  playRoosterCrow(force = false) {
    if (this.muted && !force) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    const playSyllable = (startTime, freqStart, freqEnd, duration, volume = 0.16) => {
      const osc = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      // Vocal formant filter (rooster beak & throat resonance)
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1450, startTime);
      filter.Q.setValueAtTime(2.6, startTime);

      // Fundamental oscillator (sawtooth for brassy cock timbre)
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freqStart, startTime);
      osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration);

      // Harmonic oscillator for rich vocal texture
      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(freqStart * 1.5, startTime);
      oscHarmonic.frequency.exponentialRampToValueAtTime(freqEnd * 1.5, startTime + duration);

      // Amplitude envelope
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.025);
      gain.gain.setValueAtTime(volume, startTime + duration - 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(filter);
      oscHarmonic.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      oscHarmonic.start(startTime);
      osc.stop(startTime + duration);
      oscHarmonic.stop(startTime + duration);
    };

    // 1. "Ku-" (~430Hz -> 470Hz)
    playSyllable(now, 430, 470, 0.13, 0.15);

    // 2. "-ku-" (~520Hz -> 570Hz)
    playSyllable(now + 0.15, 520, 570, 0.15, 0.17);

    // 3. "-du-" (~450Hz -> 490Hz)
    playSyllable(now + 0.32, 450, 490, 0.12, 0.14);

    // 4. "-koo-oo-oo!" (~660Hz gliding up to 860Hz with sustained crow vibrato)
    const longStart = now + 0.46;
    const longDuration = 0.85;

    const longOsc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    // 6.5Hz vocal vibrato
    lfo.frequency.setValueAtTime(6.5, longStart);
    lfoGain.gain.setValueAtTime(15, longStart);
    lfo.connect(longOsc.frequency);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, longStart);
    filter.Q.setValueAtTime(3.0, longStart);

    longOsc.type = 'sawtooth';
    longOsc.frequency.setValueAtTime(680, longStart);
    longOsc.frequency.linearRampToValueAtTime(860, longStart + 0.22);
    longOsc.frequency.linearRampToValueAtTime(840, longStart + 0.65);
    longOsc.frequency.exponentialRampToValueAtTime(540, longStart + longDuration);

    gain.gain.setValueAtTime(0.001, longStart);
    gain.gain.linearRampToValueAtTime(0.20, longStart + 0.035);
    gain.gain.setValueAtTime(0.18, longStart + longDuration - 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, longStart + longDuration);

    longOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    lfo.start(longStart);
    longOsc.start(longStart);
    lfo.stop(longStart + longDuration);
    longOsc.stop(longStart + longDuration);
  }

  playPhaseTransition(phase, prevPhase, force = false) {
    if (phase === 'morning') {
      // Shifting to morning: Cock crow "kuku-du-ku-ku!"
      this.playRoosterCrow(force);
      if (!this.muted || force) {
        setTimeout(() => this.playBirdChirp(), 1200);
      }
    } else if (phase === 'night') {
      if (!this.muted || force) this.playCricketChirp();
    } else {
      if (!this.muted || force) this.playChime();
    }
  }

  playWaterPlop() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(580 + Math.random() * 80, now);
    osc.frequency.exponentialRampToValueAtTime(880 + Math.random() * 120, now + 0.12);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }
}

export const sound = new SoundController();

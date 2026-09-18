/**
 * FARMDB Audio Controller (Mobile)
 * Manages official sound effects, ambient weather/wind system, animal vocalizations,
 * machinery, water flow, and celebratory feedback using authentic audio assets.
 * Features real-life 5-minute dog cooldown, audio segment trimming, loop fade controls,
 * and duplicate-instance prevention.
 */

export const AUDIO_DURATIONS = {
  'cow moo 1.mp3': 2.32,
  'cow moo 2.mp3': 1.32,
  'Dog barking.mp3': 4.32,
  'Dog Whining.mp3': 7.80,
  'farm hen.mp3': 40.92,
  'harsh wind.mp3': 13.39,
  'level up.mp3': 4.83,
  'money received.mp3': 2.48,
  'moving water.mp3': 10.34,
  'rooster.mp3': 2.80,
  'tractor.mp3': 43.78,
  'tree wind.mp3': 23.38,
  'wind.mp3': 8.05
};

class SoundController {
  constructor() {
    this.ctx = null;
    try {
      const savedMute = localStorage.getItem('farmdb_audio_muted');
      this.muted = savedMute !== null ? savedMute === 'true' : false;
    } catch (e) {
      this.muted = false;
    }

    // Real-Life Shared Dog Cooldown (300,000ms = 5 minutes)
    this.DOG_COOLDOWN_MS = 300000;
    try {
      const savedDogTime = localStorage.getItem('farmdb_last_dog_time');
      this.lastDogTime = savedDogTime ? parseInt(savedDogTime, 10) : 0;
    } catch (e) {
      this.lastDogTime = 0;
    }

    // Cooldown & State tracking
    this.lastCowTime = 0;
    this.cowIndex = 0;
    this.lastHenTime = 0;
    this.lastRoosterDay = -1;
    this.lastWaterTime = 0;

    // Active Audio Instances and fade timers
    this.audioCache = {};
    this.fadeTimers = {};
    this.segmentTimeouts = {};

    this.windAudio = null;
    this.harshWindAudio = null;
    this.treeWindAudio = null;
    this.tractorAudio = null;
    this.waterAudio = null;

    this.isHarshWindActive = false;
    this.isTractorMoving = false;
    this.isWaterFlowing = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (typeof document !== 'undefined' && !this.visibilityListenerAttached) {
      this.visibilityListenerAttached = true;
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseAllLoops();
        } else {
          this.resumeAllLoops();
        }
      });
    }
  }

  pauseAllLoops() {
    Object.values(this.audioCache).forEach(audio => {
      if (audio && audio.loop && !audio.paused) {
        audio._wasPlayingBeforeHide = true;
        audio.pause();
      }
    });
  }

  resumeAllLoops() {
    if (this.muted) return;
    Object.values(this.audioCache).forEach(audio => {
      if (audio && audio.loop && audio._wasPlayingBeforeHide) {
        audio._wasPlayingBeforeHide = false;
        const p = audio.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
    });
  }

  getAudio(filename, loop = false, defaultVolume = 0.5) {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return null;
    const key = `${filename}_${loop ? 'loop' : 'oneshot'}`;
    if (!this.audioCache[key]) {
      try {
        const audio = new Audio(`/audio/${encodeURIComponent(filename)}`);
        audio.loop = loop;
        audio.volume = defaultVolume;
        audio.preload = 'auto';
        this.audioCache[key] = audio;
      } catch (e) {
        console.warn(`Could not initialize audio asset: ${filename}`, e);
        return null;
      }
    }
    return this.audioCache[key];
  }

  /**
   * Controlled playback for short sounds or bounded segments of long files
   */
  playSegment(filename, volume = 0.5, maxDuration = null) {
    if (this.muted) return;
    try {
      const audio = this.getAudio(filename, false, volume);
      if (audio) {
        // Clear any previous segment timeout for this file
        if (this.segmentTimeouts[filename]) {
          clearTimeout(this.segmentTimeouts[filename]);
          delete this.segmentTimeouts[filename];
        }

        audio.currentTime = 0;
        audio.volume = volume;
        const promise = audio.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(() => { /* Catch browser autoplay restrictions silently */ });
        }

        // Auto-stop after maxDuration if configured
        if (maxDuration && maxDuration > 0) {
          this.segmentTimeouts[filename] = setTimeout(() => {
            try {
              if (!audio.paused) {
                audio.pause();
                audio.currentTime = 0;
              }
            } catch (e) {}
            delete this.segmentTimeouts[filename];
          }, maxDuration * 1000);
        }
      }
    } catch (e) {}
  }

  playFile(filename, volume = 0.5, maxDuration = null) {
    this.playSegment(filename, volume, maxDuration);
  }

  /**
   * Smooth volume fade helper for loops
   */
  fadeAudio(audio, targetVolume, durationMs = 300, onComplete = null) {
    if (!audio) return;
    const fadeKey = audio.src || 'loop';
    if (this.fadeTimers[fadeKey]) {
      clearInterval(this.fadeTimers[fadeKey]);
      delete this.fadeTimers[fadeKey];
    }

    const startVol = audio.volume;
    const steps = 10;
    const stepTime = durationMs / steps;
    const volStep = (targetVolume - startVol) / steps;
    let currentStep = 0;

    this.fadeTimers[fadeKey] = setInterval(() => {
      currentStep++;
      const nextVol = Math.max(0, Math.min(1, startVol + (volStep * currentStep)));
      try {
        audio.volume = nextVol;
      } catch (e) {}

      if (currentStep >= steps) {
        clearInterval(this.fadeTimers[fadeKey]);
        delete this.fadeTimers[fadeKey];
        try { audio.volume = targetVolume; } catch (e) {}
        if (onComplete) onComplete();
      }
    }, stepTime);
  }

  // ==========================================================
  // 1. DOG AUDIO (Shared 5-Minute Real-Life Cooldown & Segment Control)
  // ==========================================================
  canPlayDogSound() {
    const now = Date.now();
    return (now - this.lastDogTime >= this.DOG_COOLDOWN_MS);
  }

  playDogSound() {
    if (this.muted) return false;
    const now = Date.now();
    if (now - this.lastDogTime < this.DOG_COOLDOWN_MS) {
      // Still on 5-minute real-life cooldown
      return false;
    }

    this.lastDogTime = now;
    try {
      localStorage.setItem('farmdb_last_dog_time', String(now));
    } catch (e) {}

    // Randomly pick either Dog barking OR Dog Whining
    const dogFiles = [
      { file: 'Dog barking.mp3', duration: 3.5, volume: 0.60 },
      { file: 'Dog Whining.mp3', duration: 3.5, volume: 0.55 }
    ];
    const chosen = dogFiles[Math.floor(Math.random() * dogFiles.length)];

    // Play controlled short segment without playing the full recording
    this.playFile(chosen.file, chosen.volume, chosen.duration);
    return true;
  }

  playDogBark() {
    if (this.muted || !this.canPlayDogSound()) return false;
    const now = Date.now();
    this.lastDogTime = now;
    try { localStorage.setItem('farmdb_last_dog_time', String(now)); } catch (e) {}
    this.playFile('Dog barking.mp3', 0.60, 3.5);
    return true;
  }

  playDogWhine() {
    if (this.muted || !this.canPlayDogSound()) return false;
    const now = Date.now();
    this.lastDogTime = now;
    try { localStorage.setItem('farmdb_last_dog_time', String(now)); } catch (e) {}
    this.playFile('Dog Whining.mp3', 0.55, 3.5);
    return true;
  }

  // ==========================================================
  // 2. COW AUDIO (cow moo 1, cow moo 2)
  // ==========================================================
  playCowMoo() {
    if (this.muted) return;
    const now = Date.now();
    if (now - this.lastCowTime < 3000) return; // 3.0s cooldown
    this.lastCowTime = now;

    const cowFiles = [
      { file: 'cow moo 1.mp3', duration: 2.3, volume: 0.65 },
      { file: 'cow moo 2.mp3', duration: 1.3, volume: 0.65 }
    ];
    const chosen = cowFiles[this.cowIndex % cowFiles.length];
    this.cowIndex++;
    this.playFile(chosen.file, chosen.volume, chosen.duration);
  }

  // ==========================================================
  // 3. HEN AUDIO (farm hen)
  // ==========================================================
  playHenSound() {
    if (this.muted) return;
    const now = Date.now();
    if (now - this.lastHenTime < 4000) return;
    this.lastHenTime = now;
    // Controlled 3.0s segment from farm hen.mp3
    this.playFile('farm hen.mp3', 0.50, 3.0);
  }

  // ==========================================================
  // 4. WIND AUDIO (wind, harsh wind, tree wind)
  // ==========================================================
  startNormalWind() {
    if (this.muted || this.isHarshWindActive) return;
    if (!this.windAudio) {
      this.windAudio = this.getAudio('wind.mp3', true, 0.25);
    }
    if (this.windAudio && this.windAudio.paused) {
      this.windAudio.currentTime = 0;
      this.windAudio.volume = 0.25;
      const promise = this.windAudio.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    }
  }

  stopNormalWind(fade = false) {
    if (this.windAudio) {
      try {
        this.windAudio.pause();
        this.windAudio.currentTime = 0;
      } catch (e) {}
    }
  }

  startHarshWind() {
    if (this.muted) return;
    this.isHarshWindActive = true;
    this.stopNormalWind(false);

    if (!this.harshWindAudio) {
      this.harshWindAudio = this.getAudio('harsh wind.mp3', true, 0.40);
    }
    if (!this.treeWindAudio) {
      this.treeWindAudio = this.getAudio('tree wind.mp3', true, 0.35);
    }

    if (this.harshWindAudio && this.harshWindAudio.paused) {
      this.harshWindAudio.currentTime = 0;
      this.harshWindAudio.volume = 0.40;
      const p1 = this.harshWindAudio.play();
      if (p1 && typeof p1.catch === 'function') p1.catch(() => {});
    }

    if (this.treeWindAudio && this.treeWindAudio.paused) {
      this.treeWindAudio.currentTime = 0;
      this.treeWindAudio.volume = 0.35;
      const p2 = this.treeWindAudio.play();
      if (p2 && typeof p2.catch === 'function') p2.catch(() => {});
    }
  }

  stopHarshWind(fade = false) {
    this.isHarshWindActive = false;
    if (this.harshWindAudio) {
      try {
        this.harshWindAudio.pause();
        this.harshWindAudio.currentTime = 0;
      } catch (e) {}
    }
    if (this.treeWindAudio) {
      try {
        this.treeWindAudio.pause();
        this.treeWindAudio.currentTime = 0;
      } catch (e) {}
    }
  }

  // ==========================================================
  // 5. ROOSTER AUDIO (rooster)
  // ==========================================================
  playRooster(dayNum = null) {
    if (this.muted) return;
    if (dayNum !== null && this.lastRoosterDay === dayNum) return; // Prevent multiple plays in same morning
    if (dayNum !== null) {
      this.lastRoosterDay = dayNum;
    }
    // Rooster crow ~2.8s
    this.playFile('rooster.mp3', 0.65, 2.8);
  }

  // ==========================================================
  // 6. LEVEL-UP AUDIO (level up)
  // ==========================================================
  playLevelUp() {
    if (this.muted) return;
    this.playFile('level up.mp3', 0.75, 3.5);
  }

  // ==========================================================
  // 7. MONEY RECEIVED AUDIO (money received)
  // ==========================================================
  playMoneyReceived() {
    if (this.muted) return;
    this.playFile('money received.mp3', 0.70, 2.0);
  }

  playCoin() {
    this.playMoneyReceived();
  }

  // ==========================================================
  // 8. MOVING WATER AUDIO (moving water)
  // ==========================================================
  startMovingWater() {
    if (this.muted) return;
    this.isWaterFlowing = true;
    if (!this.waterAudio) {
      this.waterAudio = this.getAudio('moving water.mp3', true, 0.40);
    }
    if (this.waterAudio && this.waterAudio.paused) {
      this.waterAudio.currentTime = 0;
      this.waterAudio.volume = 0.40;
      const promise = this.waterAudio.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    }
  }

  stopMovingWater(fade = false) {
    this.isWaterFlowing = false;
    if (this.waterAudio) {
      try {
        this.waterAudio.pause();
        this.waterAudio.currentTime = 0;
      } catch (e) {}
    }
  }

  playWaterActivity(duration = 2.5) {
    if (this.muted) return;
    this.startMovingWater();
    setTimeout(() => {
      this.stopMovingWater(false);
    }, duration * 1000);
  }

  // ==========================================================
  // 9. TRACTOR AUDIO (tractor)
  // ==========================================================
  startTractor() {
    if (this.muted) return;
    this.isTractorMoving = true;
    if (!this.tractorAudio) {
      this.tractorAudio = this.getAudio('tractor.mp3', true, 0.45);
    }
    if (this.tractorAudio && this.tractorAudio.paused) {
      this.tractorAudio.currentTime = 0;
      this.tractorAudio.volume = 0.45;
      const promise = this.tractorAudio.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    }
  }

  stopTractor(fade = false) {
    this.isTractorMoving = false;
    if (this.tractorAudio) {
      try {
        this.tractorAudio.pause();
        this.tractorAudio.currentTime = 0;
      } catch (e) {}
    }
  }

  playTractorMotor(duration = 3.0) {
    if (this.muted) return;
    this.startTractor();
    setTimeout(() => {
      this.stopTractor(false);
    }, duration * 1000);
  }

  playTractorRev() {
    this.playTractorMotor(2.5);
  }

  playTractorIdle() {
    this.playTractorMotor(1.8);
  }

  // ==========================================================
  // 10. MUTE CONTROLS & SYNTHESIZED PROCEDURAL FALLBACKS
  // ==========================================================
  mute() {
    this.muted = true;
    try { localStorage.setItem('farmdb_audio_muted', 'true'); } catch (e) {}
    this.stopNormalWind(false);
    this.stopHarshWind(false);
    this.stopTractor(false);
    this.stopMovingWater(false);
  }

  unmute() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.muted = false;
    try { localStorage.setItem('farmdb_audio_muted', 'false'); } catch (e) {}
  }

  toggleMute() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.muted = !this.muted;
    try { localStorage.setItem('farmdb_audio_muted', String(this.muted)); } catch (e) {}
    if (this.muted) {
      this.mute();
    } else {
      this.unmute();
      this.playChime();
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
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.8);
  }

  playErrorBuzz() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.25);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playHarvestSuccess() {
    if (this.muted) return;
    this.playLevelUp();
  }

  playSuccess() {
    this.playChime();
  }

  playSwitchClick(isExpand = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isExpand ? 587.33 : 440, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playPlotSelect() {
    this.playSwitchClick(true);
  }

  playBirdChirp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(3200, now + 0.05);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playWaterSplash() {
    this.playWaterActivity(1.5);
  }

  playWaterPlop() {
    this.playWaterActivity(1.0);
  }

  playSeedScatter() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playTruckHorn() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(330, now);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  setTimeOfDay(timeOfDay) {
    if (timeOfDay === 'morning' || timeOfDay === 'day') {
      this.startNormalWind();
    }
  }

  playPhaseTransition(from, to, immediate = false) {
    if (to === 'morning') {
      this.playRooster();
    }
  }

  playQueryError() {
    this.playErrorBuzz();
  }

  playLevelComplete() {
    this.playLevelUp();
  }

  startAmbient() {
    this.startNormalWind();
  }

  stopAmbient() {
    this.stopNormalWind(false);
    this.stopHarshWind(false);
  }
}

export const sound = new SoundController();

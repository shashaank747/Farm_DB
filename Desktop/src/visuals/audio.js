/**
 * FARMDB Audio Controller
 * Manages official sound effects, ambient weather/wind system, animal vocalizations,
 * machinery, water flow, and celebratory feedback using authentic audio assets.
 */

class SoundController {
  constructor() {
    this.ctx = null;
    try {
      const savedMute = localStorage.getItem('farmdb_audio_muted');
      this.muted = savedMute !== null ? savedMute === 'true' : false;
    } catch (e) {
      this.muted = false;
    }

    // Cooldown & State tracking
    this.lastCowTime = 0;
    this.cowIndex = 0;
    this.lastDogTime = 0;
    this.dogIndex = 0;
    this.lastHenTime = 0;
    this.lastRoosterDay = -1;
    this.lastWaterTime = 0;
    this.lastNormalWindTime = 0;

    // Looping / Continuous instances
    this.audioCache = {};
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
  }

  getAudio(filename, loop = false, volume = 0.5) {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return null;
    const key = `${filename}_${loop ? 'loop' : 'oneshot'}`;
    if (!this.audioCache[key]) {
      try {
        const audio = new Audio(`/audio/${encodeURIComponent(filename)}`);
        audio.loop = loop;
        audio.volume = volume;
        audio.preload = 'auto';
        this.audioCache[key] = audio;
      } catch (e) {
        console.warn(`Could not initialize audio asset: ${filename}`, e);
        return null;
      }
    }
    return this.audioCache[key];
  }

  playFile(filename, volume = 0.5) {
    if (this.muted) return;
    try {
      const audio = this.getAudio(filename, false, volume);
      if (audio) {
        audio.currentTime = 0;
        audio.volume = volume;
        const promise = audio.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(() => { /* Catch browser autoplay restrictions silently */ });
        }
      }
    } catch (e) {}
  }

  // ==========================================================
  // 1. COW SOUNDS ('cow moo 1.mp3', 'cow moo 2.mp3')
  // ==========================================================
  playCowMoo() {
    if (this.muted) return;
    const now = Date.now();
    if (now - this.lastCowTime < 3000) return; // 3.0s cooldown
    this.lastCowTime = now;
    const cowFiles = ['cow moo 1.mp3', 'cow moo 2.mp3'];
    const chosen = cowFiles[this.cowIndex % cowFiles.length];
    this.cowIndex++;
    this.playFile(chosen, 0.65);
  }

  // ==========================================================
  // 2. DOG SOUNDS ('Dog barking.mp3', 'Dog Whining.mp3')
  // ==========================================================
  playDogSound() {
    if (this.muted) return;
    const now = Date.now();
    if (now - this.lastDogTime < 3500) return; // 3.5s cooldown
    this.lastDogTime = now;
    const dogFiles = ['Dog barking.mp3', 'Dog Whining.mp3'];
    const chosen = dogFiles[Math.floor(Math.random() * dogFiles.length)];
    this.playFile(chosen, 0.6);
  }

  playDogBark() {
    if (this.muted) return;
    const now = Date.now();
    if (now - this.lastDogTime < 3000) return;
    this.lastDogTime = now;
    this.playFile('Dog barking.mp3', 0.6);
  }

  playDogWhine() {
    if (this.muted) return;
    const now = Date.now();
    if (now - this.lastDogTime < 3000) return;
    this.lastDogTime = now;
    this.playFile('Dog Whining.mp3', 0.55);
  }

  // ==========================================================
  // 3. HENS ('farm hen.mp3')
  // ==========================================================
  playHenSound() {
    if (this.muted) return;
    const now = Date.now();
    if (now - this.lastHenTime < 4000) return;
    this.lastHenTime = now;
    this.playFile('farm hen.mp3', 0.5);
  }

  // ==========================================================
  // 4. WIND SYSTEM ('wind.mp3', 'harsh wind.mp3', 'tree wind.mp3')
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

  stopNormalWind() {
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
    this.stopNormalWind();

    if (!this.harshWindAudio) {
      this.harshWindAudio = this.getAudio('harsh wind.mp3', true, 0.4);
    }
    if (!this.treeWindAudio) {
      this.treeWindAudio = this.getAudio('tree wind.mp3', true, 0.35);
    }

    if (this.harshWindAudio && this.harshWindAudio.paused) {
      this.harshWindAudio.currentTime = 0;
      this.harshWindAudio.volume = 0.4;
      const promise = this.harshWindAudio.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    }

    if (this.treeWindAudio && this.treeWindAudio.paused) {
      this.treeWindAudio.currentTime = 0;
      this.treeWindAudio.volume = 0.35;
      const promise = this.treeWindAudio.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    }
  }

  stopHarshWind() {
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
  // 5. ROOSTER ('rooster.mp3')
  // ==========================================================
  playRooster(dayNum = null) {
    if (this.muted) return;
    if (dayNum !== null && this.lastRoosterDay === dayNum) return; // Prevent multiple plays in same morning
    if (dayNum !== null) {
      this.lastRoosterDay = dayNum;
    }
    this.playFile('rooster.mp3', 0.65);
  }

  // ==========================================================
  // 6. LEVEL UP ('level up.mp3')
  // ==========================================================
  playLevelUp() {
    if (this.muted) return;
    this.playFile('level up.mp3', 0.75);
  }

  // ==========================================================
  // 7. MONEY RECEIVED ('money received.mp3')
  // ==========================================================
  playMoneyReceived() {
    if (this.muted) return;
    this.playFile('money received.mp3', 0.7);
  }

  playCoin() {
    this.playMoneyReceived();
  }

  // ==========================================================
  // 8. MOVING WATER ('moving water.mp3')
  // ==========================================================
  startMovingWater() {
    if (this.muted) return;
    this.isWaterFlowing = true;
    if (!this.waterAudio) {
      this.waterAudio = this.getAudio('moving water.mp3', true, 0.4);
    }
    if (this.waterAudio && this.waterAudio.paused) {
      this.waterAudio.currentTime = 0;
      this.waterAudio.volume = 0.4;
      const promise = this.waterAudio.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    }
  }

  stopMovingWater() {
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
      this.stopMovingWater();
    }, duration * 1000);
  }

  // ==========================================================
  // 9. TRACTOR ('tractor.mp3')
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

  stopTractor() {
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
      this.stopTractor();
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
    this.stopNormalWind();
    this.stopHarshWind();
    this.stopTractor();
    this.stopMovingWater();
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
    this.stopNormalWind();
    this.stopHarshWind();
  }
}

export const sound = new SoundController();

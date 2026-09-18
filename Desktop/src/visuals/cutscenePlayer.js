/**
 * FARMDB Cinematic Level Intro Video Player
 * Plays animated 16:9 widescreen video cutscenes before each level
 * with Ken Burns camera panning, atmospheric canvas particles, timed subtitles,
 * procedural audio scoring, and scrubbable playback controls.
 */

import { sound } from './audio.js';

class CutscenePlayer {
  constructor() {}
  init() {}
  createDOM() {}
  setupListeners() {}
  playCutscene(cutsceneData, levelNumber, levelRole, onComplete = null) {
    if (typeof onComplete === 'function') onComplete();
  }
  stopAndClose() {
    if (typeof this.onCompleteCallback === 'function') this.onCompleteCallback();
  }
}

  createDOM() {
    if (document.getElementById('cutscene-modal-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'cutscene-modal-overlay';
    overlay.className = 'cutscene-modal-overlay';
    overlay.innerHTML = `
      <div class="cutscene-viewport-container">
        <!-- 16:9 Cinematic Screen -->
        <div class="cutscene-screen" id="cutscene-screen">
          <div class="cutscene-backdrop" id="cutscene-backdrop"></div>
          <canvas class="cutscene-particle-canvas" id="cutscene-particle-canvas"></canvas>
          
          <!-- Cinematic Letterbox Bars -->
          <div class="cinema-bar cinema-bar-top">
            <span class="cinema-chapter-tag" id="cutscene-chapter-tag">CHAPTER 1</span>
            <span class="cinema-fps-badge">● 60 FPS • 1080p Widescreen</span>
          </div>
          <div class="cinema-bar cinema-bar-bottom"></div>

          <!-- Title Card (Fades in at start) -->
          <div class="cutscene-title-card" id="cutscene-title-card">
            <div class="cutscene-level-badge" id="cutscene-level-badge">LEVEL 1</div>
            <h2 class="cutscene-title-text" id="cutscene-title-text">The Inherited Homestead</h2>
            <div class="cutscene-role-text" id="cutscene-role-text">Role: New Farmer</div>
          </div>

          <!-- Dynamic Subtitle Overlay -->
          <div class="cutscene-subtitle-container" id="cutscene-subtitle-container">
            <div class="cutscene-mentor-badge">
              <span class="mentor-icon">👨‍🌾</span>
              <span class="mentor-label">Uncle Somu</span>
            </div>
            <div class="cutscene-subtitle-text" id="cutscene-subtitle-text">
              "Your grandfather had the heart of a farmer..."
            </div>
          </div>
        </div>

        <!-- Video Player Control Bar -->
        <div class="cutscene-controls-bar">
          <div class="cutscene-timeline-container">
            <div class="cutscene-timeline-bar" id="cutscene-timeline-bar">
              <div class="cutscene-timeline-fill" id="cutscene-timeline-fill"></div>
              <div class="cutscene-timeline-thumb" id="cutscene-timeline-thumb"></div>
            </div>
          </div>

          <div class="cutscene-buttons-row">
            <div class="cutscene-controls-left">
              <button class="cutscene-btn" id="btn-cutscene-play-pause" title="Play/Pause (Space)">
                <span id="cutscene-play-icon">❚❚</span>
              </button>
              <button class="cutscene-btn" id="btn-cutscene-replay" title="Replay">
                <span>↺</span>
              </button>
              <button class="cutscene-btn" id="btn-cutscene-audio" title="Mute/Unmute Audio">
                <span id="cutscene-audio-icon">🔊</span>
              </button>
              <span class="cutscene-time-display" id="cutscene-time-display">0:00 / 0:11</span>
            </div>

            <div class="cutscene-controls-right">
              <button class="cutscene-btn btn-cutscene-skip" id="btn-cutscene-skip" title="Skip Video and Begin Level (Esc)">
                <span>Begin Level ❯</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  setupListeners() {
    const playPauseBtn = document.getElementById('btn-cutscene-play-pause');
    const replayBtn = document.getElementById('btn-cutscene-replay');
    const audioBtn = document.getElementById('btn-cutscene-audio');
    const skipBtn = document.getElementById('btn-cutscene-skip');
    const timelineBar = document.getElementById('cutscene-timeline-bar');

    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => this.togglePlayPause());
    }
    if (replayBtn) {
      replayBtn.addEventListener('click', () => this.replay());
    }
    if (audioBtn) {
      audioBtn.addEventListener('click', () => this.toggleAudio());
    }
    if (skipBtn) {
      skipBtn.addEventListener('click', () => this.stopAndClose());
    }

    if (timelineBar) {
      timelineBar.addEventListener('click', (e) => {
        const rect = timelineBar.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.seekTo(pos * this.duration);
      });
    }

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      const overlay = document.getElementById('cutscene-modal-overlay');
      if (overlay && overlay.classList.contains('active')) {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.stopAndClose();
        } else if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          this.togglePlayPause();
        }
      }
    });

    // Handle canvas resize
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });

    // Visibility handling (pause when tab hidden)
    document.addEventListener('visibilitychange', () => {
      const overlay = document.getElementById('cutscene-modal-overlay');
      if (overlay && overlay.classList.contains('active')) {
        if (document.hidden) {
          if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
          if (this.particleFrameId) cancelAnimationFrame(this.particleFrameId);
        } else if (this.isPlaying) {
          this.lastTimestamp = performance.now();
          this.startPlaybackLoop();
          this.initParticles(this.activeCutscene ? this.activeCutscene.mood : 'peaceful');
        }
      }
    });
  }

  playCutscene(cutsceneData, levelNumber, levelRole, onComplete = null) {
    this.activeCutscene = cutsceneData || {
      title: `Level ${levelNumber}`,
      image: `/images/cinematics/level${levelNumber}_fields.jpg`,
      duration: 11,
      mood: 'peaceful',
      subtitles: [
        { start: 0, end: 5, text: "A new agricultural chapter begins." },
        { start: 5, end: 11, text: "Apply your database skills to help the farm prosper!" }
      ]
    };
    this.levelNumber = levelNumber;
    this.levelRole = levelRole;
    this.duration = this.activeCutscene.duration || 11;
    this.onCompleteCallback = onComplete;
    this.currentTime = 0;
    this.isPlaying = true;

    const overlay = document.getElementById('cutscene-modal-overlay');
    const backdrop = document.getElementById('cutscene-backdrop');
    const chapterTag = document.getElementById('cutscene-chapter-tag');
    const levelBadge = document.getElementById('cutscene-level-badge');
    const titleText = document.getElementById('cutscene-title-text');
    const roleText = document.getElementById('cutscene-role-text');
    const titleCard = document.getElementById('cutscene-title-card');
    const playIcon = document.getElementById('cutscene-play-icon');

    if (chapterTag) chapterTag.textContent = `CHAPTER ${levelNumber}`;
    if (levelBadge) levelBadge.textContent = `LEVEL ${levelNumber}`;
    if (titleText) titleText.textContent = this.activeCutscene.title;
    if (roleText) roleText.textContent = `Player Role: ${levelRole || 'Farmer'}`;

    if (backdrop) {
      backdrop.style.backgroundImage = `url('${this.activeCutscene.image}')`;
      // Reset Ken Burns class
      backdrop.classList.remove('ken-burns-active');
      void backdrop.offsetWidth;
      backdrop.classList.add('ken-burns-active');
    }

    if (titleCard) {
      titleCard.classList.remove('fade-out');
      titleCard.style.opacity = '1';
      setTimeout(() => {
        if (titleCard) titleCard.classList.add('fade-out');
      }, 3500);
    }

    if (playIcon) playIcon.textContent = '❚❚';
    if (overlay) overlay.classList.add('active');

    // Initialize particles & audio
    this.initParticles(this.activeCutscene.mood || 'peaceful');
    this.playAudioCue(this.activeCutscene.mood || 'peaceful');

    this.lastTimestamp = performance.now();
    this.startPlaybackLoop();
  }

  startPlaybackLoop() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    const loop = (now) => {
      if (!this.isPlaying) return;

      const delta = (now - this.lastTimestamp) / 1000;
      this.lastTimestamp = now;

      this.currentTime += delta;

      if (this.currentTime >= this.duration) {
        this.currentTime = this.duration;
        this.updateUI();
        this.handleVideoEnded();
        return;
      }

      this.updateUI();
      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  updateUI() {
    const timeFill = document.getElementById('cutscene-timeline-fill');
    const timeThumb = document.getElementById('cutscene-timeline-thumb');
    const timeDisplay = document.getElementById('cutscene-time-display');
    const subtitleText = document.getElementById('cutscene-subtitle-text');

    const pct = Math.max(0, Math.min(100, (this.currentTime / this.duration) * 100));
    if (timeFill) timeFill.style.width = `${pct}%`;
    if (timeThumb) timeThumb.style.left = `${pct}%`;

    const curM = Math.floor(this.currentTime / 60);
    const curS = Math.floor(this.currentTime % 60);
    const durM = Math.floor(this.duration / 60);
    const durS = Math.floor(this.duration % 60);
    if (timeDisplay) {
      timeDisplay.textContent = `${curM}:${curS < 10 ? '0' : ''}${curS} / ${durM}:${durS < 10 ? '0' : ''}${durS}`;
    }

    // Find active subtitle
    if (subtitleText && this.activeCutscene && this.activeCutscene.subtitles) {
      const sub = this.activeCutscene.subtitles.find(s => this.currentTime >= s.start && this.currentTime < s.end);
      if (sub) {
        if (subtitleText.textContent !== `"${sub.text}"`) {
          subtitleText.style.opacity = '0';
          setTimeout(() => {
            subtitleText.textContent = `"${sub.text}"`;
            subtitleText.style.opacity = '1';
          }, 150);
        }
      }
    }
  }

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    const playIcon = document.getElementById('cutscene-play-icon');
    const backdrop = document.getElementById('cutscene-backdrop');

    if (playIcon) playIcon.textContent = this.isPlaying ? '❚❚' : '▶';

    if (this.isPlaying) {
      if (backdrop) backdrop.style.animationPlayState = 'running';
      this.lastTimestamp = performance.now();
      this.startPlaybackLoop();
    } else {
      if (backdrop) backdrop.style.animationPlayState = 'paused';
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    }
  }

  replay() {
    this.currentTime = 0;
    this.isPlaying = true;
    const playIcon = document.getElementById('cutscene-play-icon');
    if (playIcon) playIcon.textContent = '❚❚';

    const backdrop = document.getElementById('cutscene-backdrop');
    if (backdrop) {
      backdrop.classList.remove('ken-burns-active');
      void backdrop.offsetWidth;
      backdrop.classList.add('ken-burns-active');
      backdrop.style.animationPlayState = 'running';
    }

    const titleCard = document.getElementById('cutscene-title-card');
    if (titleCard) {
      titleCard.classList.remove('fade-out');
      titleCard.style.opacity = '1';
      setTimeout(() => {
        if (titleCard) titleCard.classList.add('fade-out');
      }, 3000);
    }

    this.lastTimestamp = performance.now();
    this.startPlaybackLoop();
  }

  seekTo(seconds) {
    this.currentTime = Math.max(0, Math.min(this.duration, seconds));
    this.updateUI();
  }

  toggleAudio() {
    this.isMuted = !this.isMuted;
    const audioIcon = document.getElementById('cutscene-audio-icon');
    if (audioIcon) audioIcon.textContent = this.isMuted ? '🔇' : '🔊';
  }

  handleVideoEnded() {
    this.isPlaying = false;
    const playIcon = document.getElementById('cutscene-play-icon');
    if (playIcon) playIcon.textContent = '▶';
    // Auto transition after a brief pause
    setTimeout(() => {
      this.stopAndClose();
    }, 800);
  }

  stopAndClose() {
    this.isPlaying = false;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.particleFrameId) cancelAnimationFrame(this.particleFrameId);

    const overlay = document.getElementById('cutscene-modal-overlay');
    if (overlay) overlay.classList.remove('active');

    sound.playChime();

    if (typeof this.onCompleteCallback === 'function') {
      const cb = this.onCompleteCallback;
      this.onCompleteCallback = null;
      cb();
    }
  }

  // Atmospheric Canvas Particles
  initParticles(mood) {
    const canvas = document.getElementById('cutscene-particle-canvas');
    if (!canvas) return;

    this.resizeCanvas();
    const ctx = canvas.getContext('2d');
    this.particles = [];

    const count = mood === 'tense' ? 80 : 45;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * (mood === 'tense' ? 1.5 : 2.5) + 0.8,
        speedX: (Math.random() - 0.4) * (mood === 'crisis' ? 2 : 1),
        speedY: mood === 'tense' ? (Math.random() * 8 + 6) : (Math.random() * 0.8 - 0.4),
        color: mood === 'tense' ? 'rgba(180, 210, 255, 0.4)' :
               mood === 'crisis' ? 'rgba(255, 180, 90, 0.5)' :
               mood === 'epic' ? 'rgba(255, 230, 160, 0.6)' :
               'rgba(255, 255, 200, 0.5)',
        alpha: Math.random() * 0.7 + 0.3
      });
    }

    const animateParticles = () => {
      if (!this.isPlaying && this.currentTime >= this.duration) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      this.particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        if (mood === 'tense') {
          // Rain streaks
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.radius;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 2, p.y + 10);
          ctx.stroke();
        } else {
          // Soft floating particle glow
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
      });

      this.particleFrameId = requestAnimationFrame(animateParticles);
    };

    if (this.particleFrameId) cancelAnimationFrame(this.particleFrameId);
    this.particleFrameId = requestAnimationFrame(animateParticles);
  }

  resizeCanvas() {
    const canvas = document.getElementById('cutscene-particle-canvas');
    const screen = document.getElementById('cutscene-screen');
    if (canvas && screen) {
      canvas.width = screen.clientWidth;
      canvas.height = screen.clientHeight;
    }
  }

  playAudioCue(mood) {
    if (this.isMuted) return;
    try {
      if (mood === 'peaceful') {
        sound.playBirdChirp();
      } else if (mood === 'energetic') {
        sound.playChime();
      } else if (mood === 'market') {
        sound.playCoin();
      } else if (mood === 'crew') {
        sound.playTractorIdle();
      } else if (mood === 'crisis' || mood === 'epic') {
        sound.playHarvestSuccess();
      }
    } catch (e) {}
  }
}

export const cutscenePlayer = new CutscenePlayer();

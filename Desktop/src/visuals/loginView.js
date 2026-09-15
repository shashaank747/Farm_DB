/**
 * FARMDB Living Login View Controller
 * Coordinates Living Background, Day/Night Lighting, Parallax, and Cinematic Entry
 */

import { gameState } from '../game/state.js';
import { sound } from './audio.js';

class LoginViewController {
  constructor() {
    this.screenEl = null;
    this.cardEl = null;
    this.sceneryEl = null;
    this.formEl = null;
    this.loginBtn = null;
    this.emailInput = null;
    this.passwordInput = null;
    this.togglePassBtn = null;
    this.errorToast = null;
    this.timeBadge = null;
    this.timeTextEl = null;
    this.timeDotEl = null;
    
    this.isParallaxActive = false;
    this.targetMouse = { x: 0, y: 0 };
    this.currentMouse = { x: 0, y: 0 };
    this.rafId = null;
    this.isLoggedIn = false;
  }

  init() {
    this.screenEl = document.getElementById('login-screen');
    if (!this.screenEl) return;

    this.cardEl = document.getElementById('login-card');
    this.sceneryEl = document.getElementById('login-scenery');
    this.formEl = document.getElementById('login-form');
    this.loginBtn = document.getElementById('btn-login-submit');
    this.emailInput = document.getElementById('login-email');
    this.passwordInput = document.getElementById('login-password');
    this.togglePassBtn = document.getElementById('btn-toggle-password');
    this.errorToast = document.getElementById('login-error-toast');
    this.timeBadge = document.getElementById('login-time-badge');
    this.timeTextEl = document.getElementById('login-time-text');
    this.timeDotEl = document.getElementById('login-time-dot');

    this.setupEventListeners();
    this.setupMouseParallax();
    this.updateLighting(gameState.timeOfDay);

    // Directly show the page after login by default (bypass login screen)
    const urlParams = new URLSearchParams(window.location.search);
    const showLoginExplicitly = urlParams.get('login') === 'true' || urlParams.get('show_login') === 'true';

    if (!showLoginExplicitly) {
      this.hideImmediate();
      this.isLoggedIn = true;
    } else {
      this.show();
    }
  }

  setupEventListeners() {
    // 1. Password Visibility Toggle with Microinteraction
    if (this.togglePassBtn && this.passwordInput) {
      this.togglePassBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isPassword = this.passwordInput.type === 'password';
        this.passwordInput.type = isPassword ? 'text' : 'password';
        this.togglePassBtn.innerHTML = isPassword ? '👁️‍🗨️' : '👁';
        this.togglePassBtn.title = isPassword ? 'Hide password' : 'Show password';
        this.togglePassBtn.style.transform = 'scale(0.85) rotate(15deg)';
        setTimeout(() => {
          this.togglePassBtn.style.transform = 'scale(1) rotate(0deg)';
        }, 180);
      });
    }

    // 2. Form Submission & Validation
    if (this.formEl) {
      this.formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // 3. Demo / Guest Login Trigger
    const guestBtn = document.getElementById('btn-guest-login');
    if (guestBtn) {
      guestBtn.addEventListener('click', () => {
        if (this.emailInput) this.emailInput.value = 'farmer@farmdb.com';
        if (this.passwordInput) this.passwordInput.value = 'farmdb2026';
        this.handleLogin();
      });
    }

    // 4. Social Buttons (Google & GitHub)
    const googleBtn = document.getElementById('btn-social-google');
    const githubBtn = document.getElementById('btn-social-github');
    const handleSocial = (provider) => {
      if (this.emailInput) this.emailInput.value = `${provider.toLowerCase()}.farmer@farmdb.com`;
      if (this.passwordInput) this.passwordInput.value = 'social_pass';
      this.handleLogin();
    };
    if (googleBtn) googleBtn.addEventListener('click', () => handleSocial('Google'));
    if (githubBtn) githubBtn.addEventListener('click', () => handleSocial('GitHub'));

    // 5. Interactive Time-of-Day Switcher in Top Right
    if (this.timeBadge) {
      this.timeBadge.addEventListener('click', () => {
        const times = ['morning', 'day', 'sunset', 'night', 'midnight'];
        const current = gameState.timeOfDay || 'morning';
        const nextIdx = (times.indexOf(current) + 1) % times.length;
        const nextTime = times[nextIdx];
        
        // Update game state and login lighting
        gameState.timeOfDay = nextTime;
        gameState.notifyListeners();
        this.updateLighting(nextTime);
        sound.playBirdChirp();
      });
    }

    // Clear error on input
    [this.emailInput, this.passwordInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', () => {
          if (this.errorToast) this.errorToast.style.display = 'none';
        });
      }
    });

    // Wire global logout button in top navigation
    const logoutBtn = document.getElementById('btn-logout-game');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }
  }

  /**
   * 2. Day/Night Lighting Transitions
   */
  updateLighting(timeOfDay) {
    if (!this.sceneryEl) return;

    const root = document.documentElement;
    this.sceneryEl.className = `login-scenery-container time-${timeOfDay}`;

    let timeLabel = 'Morning ☀️';
    let timeDot = '☀️';

    switch (timeOfDay) {
      case 'morning':
        timeLabel = 'Morning 🌅';
        timeDot = '🌅';
        root.style.setProperty('--night-overlay', '0');
        root.style.setProperty('--lantern-opacity', '0.05');
        root.style.setProperty('--star-opacity', '0');
        break;
      case 'day':
        timeLabel = 'Sunny Afternoon ☀️';
        timeDot = '☀️';
        root.style.setProperty('--night-overlay', '0');
        root.style.setProperty('--lantern-opacity', '0');
        root.style.setProperty('--star-opacity', '0');
        break;
      case 'sunset':
        timeLabel = 'Golden Evening 🌄';
        timeDot = '🌄';
        root.style.setProperty('--night-overlay', '0.22');
        root.style.setProperty('--lantern-opacity', '0.45');
        root.style.setProperty('--star-opacity', '0.3');
        break;
      case 'night':
        timeLabel = 'Starry Night 🌙';
        timeDot = '🌙';
        root.style.setProperty('--night-overlay', '0.62');
        root.style.setProperty('--lantern-opacity', '0.88');
        root.style.setProperty('--star-opacity', '0.9');
        break;
      case 'midnight':
        timeLabel = 'Deep Midnight 🌌';
        timeDot = '🌌';
        root.style.setProperty('--night-overlay', '0.78');
        root.style.setProperty('--lantern-opacity', '1.0');
        root.style.setProperty('--star-opacity', '1.0');
        break;
    }

    if (this.timeTextEl) this.timeTextEl.textContent = timeLabel;
    if (this.timeDotEl) this.timeDotEl.textContent = timeDot;
  }

  /**
   * 13. Desktop Mouse Parallax with smooth lerp
   */
  setupMouseParallax() {
    // Check if device is desktop and prefers motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = window.innerWidth >= 1024 && !('ontouchstart' in window);

    if (prefersReducedMotion || !isDesktop) return;

    this.isParallaxActive = true;

    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      this.targetMouse = { x, y };
    });

    const loop = () => {
      if (!this.isParallaxActive) return;

      this.currentMouse.x += (this.targetMouse.x - this.currentMouse.x) * 0.08;
      this.currentMouse.y += (this.targetMouse.y - this.currentMouse.y) * 0.08;

      const mx = this.currentMouse.x;
      const my = this.currentMouse.y;

      const root = document.documentElement;
      // Background: ±2px
      root.style.setProperty('--parallax-bg-x', `${(-mx * 3).toFixed(2)}px`);
      root.style.setProperty('--parallax-bg-y', `${(-my * 2).toFixed(2)}px`);
      // Midground (Farm elements, barn): ±4px
      root.style.setProperty('--parallax-mid-x', `${(-mx * 6).toFixed(2)}px`);
      root.style.setProperty('--parallax-mid-y', `${(-my * 4).toFixed(2)}px`);
      // Foreground (Tree, Grandpa, crate): ±6px
      root.style.setProperty('--parallax-fore-x', `${(mx * 8).toFixed(2)}px`);
      root.style.setProperty('--parallax-fore-y', `${(my * 5).toFixed(2)}px`);
      // Login Card: ±1px
      root.style.setProperty('--parallax-card-x', `${(mx * 2.5).toFixed(2)}px`);
      root.style.setProperty('--parallax-card-y', `${(my * 2).toFixed(2)}px`);

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  /**
   * 16 & 17. Form Validation & Cinematic Login Transition
   */
  async handleLogin() {
    const email = (this.emailInput?.value || '').trim();
    const pass = (this.passwordInput?.value || '').trim();

    // Validation
    if (!email || !pass) {
      this.triggerError('Please enter your email and password.');
      return;
    }

    // Play subtle click sound
    sound.playPlotSelect();

    // Start Cinematic Transition Sequence
    if (this.loginBtn) {
      this.loginBtn.classList.add('loading');
      this.loginBtn.disabled = true;
    }

    const btnText = document.getElementById('login-btn-text');
    
    // Step 1: Logging in...
    if (btnText) btnText.textContent = 'Logging in...';
    await new Promise(r => setTimeout(r, 450));

    // Step 2: Preparing your farm...
    if (btnText) btnText.textContent = '🌱 Preparing your farm...';
    await new Promise(r => setTimeout(r, 500));

    // Step 3: Loading database...
    if (btnText) btnText.textContent = 'Loading database...';
    sound.playLevelComplete();
    await new Promise(r => setTimeout(r, 450));

    // Step 4: Entering Farm World!
    if (btnText) btnText.textContent = 'Entering Farm World...';
    await new Promise(r => setTimeout(r, 350));

    // Store login flag
    localStorage.setItem('farmdb_logged_in', 'true');
    this.isLoggedIn = true;

    // Fade out login card and screen
    this.hide();

    // Reset button for next time
    setTimeout(() => {
      if (this.loginBtn) {
        this.loginBtn.classList.remove('loading');
        this.loginBtn.disabled = false;
      }
      if (btnText) btnText.textContent = 'Log In';
    }, 1000);
  }

  triggerError(msg) {
    if (this.errorToast) {
      this.errorToast.textContent = `⚠️ ${msg}`;
      this.errorToast.style.display = 'flex';
    }

    if (this.cardEl) {
      this.cardEl.classList.remove('shake');
      void this.cardEl.offsetWidth;
      this.cardEl.classList.add('shake');
    }

    sound.playQueryError();
  }

  show() {
    if (this.screenEl) {
      this.screenEl.style.display = '';
      this.screenEl.classList.remove('hidden');
    }
  }

  hide() {
    if (this.screenEl) {
      this.screenEl.classList.add('hidden');
    }
  }

  hideImmediate() {
    if (this.screenEl) {
      this.screenEl.classList.add('hidden');
      this.screenEl.style.display = 'none';
    }
  }

  logout() {
    localStorage.removeItem('farmdb_logged_in');
    this.isLoggedIn = false;
    if (this.screenEl) {
      this.screenEl.style.display = '';
      void this.screenEl.offsetWidth;
      this.screenEl.classList.remove('hidden');
    }
    sound.playBirdChirp();
  }
}

export const loginView = new LoginViewController();

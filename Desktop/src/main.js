/**
 * FARMDB - From Farmer to Agribusiness
 * Main Application Orchestrator
 */

import { sqlEngine } from './sql/engine.js';
import { gameState } from './game/state.js';
import { simulation } from './game/simulation.js';
import { MISSIONS_DATA } from './game/missions.js';
import { farmRenderer } from './visuals/farmRenderer.js';
import { setupDraggableWindow } from './visuals/draggable.js';
import { sound } from './visuals/audio.js';
import { loginView } from './visuals/loginView.js';
import { farm3D } from './visuals/farm3D.js';

class FarmDBApp {
  constructor() {
    this.sqlEngine = sqlEngine;
    this.gameState = gameState;
    this.simulation = simulation;
    this.sound = sound;
    this.loginView = loginView;
    this.farm3D = farm3D;
    this.is3DMode = true;
    this.activeHintTier = 1;
    this.schemaVisible = true;
    this.isInitialized = false;
  }

  async init() {
    console.log('🌾 Booting FARMDB Engine...');
    if (typeof window !== 'undefined') {
      window.farmdb = this;
    }

    const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

    // Check for ?reset or ?clear query param in URL to allow one-click URL reset
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('reset') || urlParams.has('clear')) {
        localStorage.clear();
        gameState.resetAll();
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // --- PHASE 0: Instant Visual Render (Immediate paint: FCP & LCP in <200ms) ---
    this.renderGameState();
    this.renderCurrentMission();
    this.renderMinimizedFarmReport();
    this.setupUIEventListeners();
    this.setupSQLEditorListeners();
    this.setupViewSwitching();

    // Setup Draggable Floating SQL Terminal Window
    const terminalEl = document.getElementById('floating-sql-terminal');
    const titlebarEl = document.getElementById('terminal-titlebar');
    const resizeHandleEl = document.getElementById('terminal-resize-handle');
    this.terminalController = setupDraggableWindow(terminalEl, titlebarEl, resizeHandleEl);

    if (terminalEl) {
      terminalEl.addEventListener('mousedown', () => {
        terminalEl.style.zIndex = '600';
      });
    }

    // Global hooks
    window.renderFarmQuickReport = () => this.renderMinimizedFarmReport();
    window.sqlEngine = sqlEngine;
    window.gameState = gameState;
    window.sound = sound;
    window.farm3D = farm3D;
    window.simulation = simulation;

    // Yield control so browser paints Phase 0 immediately without waiting for WASM/WebGL
    await yieldToMain();

    // --- PHASE 1: SQLite WebAssembly Engine & Baseline Data ---
    const statusMsg = document.getElementById('status-message');
    if (statusMsg) statusMsg.textContent = 'Connecting to SQLite WebAssembly...';

    try {
      await sqlEngine.init();
      if (statusMsg) statusMsg.textContent = 'SQLite WASM Engine Ready • Ctrl+Enter to execute';
      console.log('✅ SQLite WASM Engine is fully ready.');
    } catch (err) {
      const errMsg = err.message || String(err);
      if (statusMsg) statusMsg.textContent = `SQLite Error: ${errMsg}`;
      console.error('Fatal: SQLite WASM initialization failed:', err);
      this.showToast(`SQLite Error: ${errMsg}`, 'error');
    }

    simulation.initBaselineTables();
    simulation.syncPlotsWithLevel(gameState.currentLevel);

    // Yield to main thread
    await yieldToMain();

    // --- PHASE 2: 2D & 3D Living World Initialization ---
    farmRenderer.init({
      plotsContainer: document.getElementById('plots-container'),
      waterFill: document.getElementById('water-fill-bar'),
      waterStats: document.getElementById('water-stats-text'),
      pasturePen: document.getElementById('pasture-pen-container'),
      equipmentPad: document.getElementById('equipment-pad-container'),
      warehouseCrates: document.getElementById('warehouse-crates-container'),
      inspectorModal: document.getElementById('plot-inspector-modal')
    });

    const farm3dWrapper = document.getElementById('farm-3d-wrapper');
    if (farm3dWrapper) {
      farm3D.init(farm3dWrapper);
    }

    // Yield to main thread
    await yieldToMain();

    // --- PHASE 3: Subscriptions & Secondary UI Rendering ---
    this.setupDebugPanel();

    gameState.addListener(() => {
      simulation.syncPlotsWithLevel(gameState.currentLevel);
      if (gameState.prevTimeOfDay === 'night' && gameState.timeOfDay === 'morning') {
        sound.playPhaseTransition('morning', 'night', false);
        this.showToast(`🐓 "Kuku-du-ku-ku!" Dawn has broken over the farm!`, 'success');
        gameState.prevTimeOfDay = null;
      }
      this.renderGameState();
      this.renderMinimizedFarmReport();
      loginView.updateLighting(gameState.timeOfDay);
      this.updateDebugPanel();
      if (this.is3DMode) {
        farm3D.syncLightingAndTime();
        farm3D.syncFromDatabase();
      }
    });

    sqlEngine.addChangeListener(() => {
      this.renderSchemaTree();
      this.renderDatabaseERD();
      this.renderInventoryView();
      this.renderMinimizedFarmReport();
      this.updateDebugPanel();
      if (this.is3DMode) {
        farm3D.syncFromDatabase();
      }
    });

    this.renderSchemaTree();
    this.renderDatabaseERD();
    this.renderInventoryView();
    this.renderJourneyView();
    this.updateDebugPanel();

    this.startTimeCycleTimer();

    // Yield to main thread
    await yieldToMain();

    // --- PHASE 4: Open Story Notebook Directly ---
    const hasSeenIntro = localStorage.getItem('farmdb_intro_seen');
    if (!hasSeenIntro) {
      this.openNotebookModal();
    }

    loginView.init();

    this.isInitialized = true;
    console.log('✅ FARMDB Fully Initialized & Interactive.');
  }

  startTimeCycleTimer() {
    if (this.timeCycleInterval) clearInterval(this.timeCycleInterval);
    // Advance 30 in-game minutes every 6 seconds (1 in-game hour every 12 seconds)
    this.timeCycleInterval = setInterval(() => {
      if (!gameState.isTimePaused && typeof document !== 'undefined' && document.visibilityState === 'visible') {
        gameState.advanceTime(30);
      }
    }, 6000);
  }

  // ==========================================================
  // TOP BAR & GAME STATE BINDINGS
  // ==========================================================
  renderGameState() {
    const dayVal = document.getElementById('day-val');
    const moneyVal = document.getElementById('money-val');
    const levelRole = document.getElementById('level-role');
    const weatherIcon = document.getElementById('weather-icon');
    const weatherText = document.getElementById('weather-text');
    const timeIcon = document.getElementById('time-icon');
    const timeText = document.getElementById('time-text');
    const timePill = document.getElementById('time-pill');
    const farmWorldContainer = document.getElementById('farm-world-container');

    if (dayVal) dayVal.textContent = gameState.day;
    if (moneyVal) moneyVal.textContent = `₹${gameState.money.toLocaleString()}`;
    
    const lvlData = MISSIONS_DATA[gameState.currentLevel];
    if (levelRole && lvlData) {
      levelRole.textContent = `Lvl ${gameState.currentLevel}: ${lvlData.role}`;
      levelRole.title = `Level ${gameState.currentLevel}: ${lvlData.role} • Concept: ${lvlData.concept || 'SQL'}`;
    }
    const sidebarFarmerRole = document.getElementById('sidebar-farmer-role');
    if (sidebarFarmerRole && lvlData) {
      sidebarFarmerRole.textContent = `Lvl ${gameState.currentLevel}: ${lvlData.role}`;
    }

    if (weatherIcon) weatherIcon.textContent = gameState.weather.icon;
    if (weatherText) {
      weatherText.textContent = gameState.weather.temp;
      const weatherPill = document.getElementById('weather-pill');
      if (weatherPill) weatherPill.title = `${gameState.weather.type} • ${gameState.weather.temp}`;
    }

    // Update Day/Night Cycle State
    const phaseInfo = gameState.getTimePhaseInfo();
    if (timeIcon) timeIcon.textContent = phaseInfo.icon;
    if (timeText) timeText.textContent = gameState.getTimeString();
    
    if (timePill) {
      timePill.className = `stat-pill time-pill time-${gameState.timeOfDay}`;
      timePill.title = `Current Time: ${gameState.getTimeString()} (${phaseInfo.label})\nClick to cycle time of day!`;
    }

    if (farmWorldContainer) {
      farmWorldContainer.classList.remove('time-morning', 'time-day', 'time-sunset', 'time-night');
      farmWorldContainer.classList.add(`time-${gameState.timeOfDay}`);
    }

    // Dynamic Sun Trajectory from East (Left) to West (Right)
    this.updateSunTrajectory();

    sound.setTimeOfDay(gameState.timeOfDay);
    farmRenderer.renderAnimals();

    const navPlots = document.getElementById('nav-plots-count');
    if (navPlots) {
      const openCount = gameState.currentLevel < 3 ? 1 : Math.min(5, gameState.currentLevel - 1);
      navPlots.textContent = `${openCount}/5`;
      navPlots.title = `${openCount} of 5 Plots Unlocked (Level ${gameState.currentLevel})`;
    }

    this.renderCurrentMission();
  }

  /**
   * Calculate sun position along a realistic parabolic arc from East (Left) to West (Right)
   * Sunrise begins at 5:00 AM in the East (left 8%)
   * Sun reaches zenith at midday 12:30 PM overhead (left 48%, top 10%)
   * Sun sets at 20:30 PM in the West (left 86%, top 48%)
   * At night, sun dips below the horizon and opacity is 0.
   */
  updateSunTrajectory() {
    const sunEl = document.getElementById('sky-sun');
    if (!sunEl) return;

    const currentHourFloat = gameState.hour + gameState.minute / 60;
    if (currentHourFloat >= 5 && currentHourFloat <= 20.5) {
      sunEl.style.display = 'block';
      const progress = (currentHourFloat - 5) / (20.5 - 5); // 0.0 at dawn, 1.0 at dusk
      // East (left 8%) to West (left 86%)
      const leftPct = 8 + progress * 78;
      // Parabolic arc: high in midday (top 10%), lower at dawn & dusk (top 46%)
      const arcFactor = 4 * progress * (1 - progress); // 0 at edges, 1 at center
      const topPct = 46 - (arcFactor * 34); // 46% at dawn/dusk, 12% at midday

      sunEl.style.setProperty('--sun-left', `${leftPct.toFixed(1)}%`);
      sunEl.style.setProperty('--sun-top', `${topPct.toFixed(1)}%`);
      sunEl.style.setProperty('--sun-opacity', '1');
    } else {
      // Night: Sun below the Western horizon
      sunEl.style.display = 'none';
      sunEl.style.setProperty('--sun-left', '95%');
      sunEl.style.setProperty('--sun-top', '120%');
      sunEl.style.setProperty('--sun-opacity', '0');
    }
  }

  // ==========================================================
  // MISSION & STORY CONTROLLER
  // ==========================================================
  getCurrentMissionData() {
    const lvlData = MISSIONS_DATA[gameState.currentLevel];
    if (!lvlData || !lvlData.missions) return null;
    return lvlData.missions[gameState.currentMissionIndex] || null;
  }

  renderCurrentMission() {
    const mission = this.getCurrentMissionData();
    const lvlData = MISSIONS_DATA[gameState.currentLevel];
    const descEl = document.getElementById('sidebar-mission-desc');
    const missionTabText = document.getElementById('mission-tab-text');
    const hintBadgeLabel = document.getElementById('hint-button-label');

    // Floating Quest HUD Elements
    const hudTitle = document.getElementById('quest-hud-title');
    const hudStepBadge = document.getElementById('quest-hud-step-badge');
    const hudQuoteText = document.getElementById('quest-hud-quote-text');
    const hudPillTitle = document.getElementById('quest-hud-pill-title');

    if (!mission) {
      if (hudTitle) hudTitle.textContent = `🎉 Level ${gameState.currentLevel} Complete!`;
      if (hudStepBadge) hudStepBadge.textContent = 'DONE';
      if (hudPillTitle) hudPillTitle.textContent = `🎉 Level Complete!`;
      if (hudQuoteText) hudQuoteText.textContent = `All tasks complete! Check the celebration screen to advance.`;
      if (descEl) descEl.innerHTML = `<strong>🎉 ${lvlData ? lvlData.title : 'Level'} Complete!</strong><br>Check the celebration screen to advance!`;
      if (missionTabText) missionTabText.innerHTML = `<div style="color: #15803D; font-weight: bold;">🎉 All tasks for Level ${gameState.currentLevel} are completed!</div>`;
      return;
    }

    if (hudTitle) hudTitle.textContent = mission.title;
    if (hudStepBadge) {
      const totalMissions = lvlData?.missions?.length || 1;
      hudStepBadge.textContent = `${gameState.currentMissionIndex + 1}/${totalMissions}`;
    }
    if (hudPillTitle) hudPillTitle.textContent = mission.title;
    if (hudQuoteText) {
      const dialogue = mission.dialogue || 'Inspect our expanded farm.';
      hudQuoteText.textContent = dialogue.startsWith('Uncle Somu:') ? dialogue.replace(/^Uncle Somu:\s*['"]?/, '').replace(/['"]$/, '') : dialogue;
    }

    if (descEl) {
      descEl.innerHTML = `<div>${mission.objective}</div>`;
    }

    if (missionTabText) {
      missionTabText.innerHTML = `
        <div style="font-size: 14px; font-weight: 800; color: #15803D; margin-bottom: 6px;">${mission.title}</div>
        <p style="margin-bottom: 8px; color: #374151;">${mission.objective}</p>
        <div style="background: #F0FDF4; border-left: 3px solid #22C55E; padding: 8px 10px; margin-bottom: 8px; font-size: 12px;">
          💬 <em>${mission.dialogue}</em>
        </div>
        <div style="font-size: 11px; color: #64748B;">
          <strong>Concept Covered:</strong> <code>${mission.concept || 'SQL'}</code>
        </div>
      `;
    }

    this.renderHints();
    if (hintBadgeLabel) hintBadgeLabel.textContent = `💡 Hint (${this.activeHintTier}/3)`;
  }

  renderHints() {
    const mission = this.getCurrentMissionData();
    const container = document.getElementById('hints-tab-content');
    const tierCountEl = document.getElementById('hint-tier-count');
    if (tierCountEl) tierCountEl.textContent = this.activeHintTier;
    if (!container) return;

    if (!mission || !mission.hints) {
      container.innerHTML = '<div style="color: #9CA3AF;">No hints needed for this step.</div>';
      return;
    }

    let html = '';
    for (let i = 0; i < this.activeHintTier; i++) {
      const hint = mission.hints[i];
      if (hint) {
        html += `
          <div class="hint-card">
            <div class="hint-tier-title">Tier ${i + 1} Hint:</div>
            <pre style="white-space: pre-wrap; font-family: var(--font-mono); font-size: 12px; color: #1E293B;">${hint}</pre>
          </div>
        `;
      }
    }

    if (this.activeHintTier < 3) {
      html += `
        <button class="btn-advance-day" style="margin-top: 10px; font-size: 12px; padding: 6px 12px;" id="btn-next-hint-tier">
          <span>Reveal Tier ${this.activeHintTier + 1} Hint ❯</span>
        </button>
      `;
    }

    container.innerHTML = html;

    const nextHintBtn = document.getElementById('btn-next-hint-tier');
    if (nextHintBtn) {
      nextHintBtn.addEventListener('click', () => {
        this.cycleHintTier();
      });
    }
  }

  cycleHintTier() {
    this.activeHintTier = (this.activeHintTier % 3) + 1;
    this.recordHintUsage();
    const label = document.getElementById('hint-button-label');
    if (label) label.textContent = `💡 Hint (${this.activeHintTier}/3)`;
    this.renderHints();
    this.switchOutputTab('hints');
  }

  // ==========================================================
  // MINIMIZED FARM QUICK REPORT & DISPATCH MONITOR
  // ==========================================================
  renderMinimizedFarmReport() {
    // 1. Time & Weather Status
    const timeBadge = document.getElementById('report-time-badge');
    if (timeBadge) {
      const phaseInfo = gameState.getTimePhaseInfo ? gameState.getTimePhaseInfo() : { icon: '☀️', label: 'Morning' };
      timeBadge.textContent = `Day ${gameState.day} • ${phaseInfo.label} ${gameState.weather ? gameState.weather.icon : '☀️'}`;
    }

    // 2. Field Plots
    const plotsVal = document.getElementById('report-plots-val');
    const plotsSub = document.getElementById('report-plots-sub');
    try {
      const plots = sqlEngine.getTableData('plots') || [];
      const farming = sqlEngine.getTableData('farming') || [];
      const totalPlots = plots.length || 5;
      const lockedPlots = plots.filter(p => p.status === 'locked').length;
      const openPlots = Math.max(1, totalPlots - lockedPlots);
      const growingCrops = farming.filter(f => f.status === 'growing');
      const readyCrops = growingCrops.filter(f => (f.growth_percent || 0) >= 100);
      const growingCount = growingCrops.length;
      const fallowCount = Math.max(0, openPlots - growingCount);

      if (plotsVal) {
        if (readyCrops.length > 0) {
          plotsVal.innerHTML = `<span style="color: #E11D48;">${readyCrops.length} Ready</span> / ${openPlots} Open`;
        } else if (growingCount > 0) {
          plotsVal.innerHTML = `<span style="color: #16A34A;">${growingCount} Growing</span> / ${openPlots} Open`;
        } else {
          plotsVal.textContent = `${openPlots} Open Plot${openPlots > 1 ? 's' : ''}`;
        }
      }
      if (plotsSub) {
        if (readyCrops.length > 0) {
          plotsSub.textContent = `🎉 Ready to harvest! (${lockedPlots} locked)`;
        } else if (growingCount > 0) {
          plotsSub.textContent = `${fallowCount} Available • ${lockedPlots} Locked`;
        } else {
          plotsSub.textContent = openPlots === 1 ? `Plot A1 Ready • ${lockedPlots} Locked` : `${openPlots} Ready • ${lockedPlots} Locked`;
        }
      }
    } catch (e) {
      if (plotsVal) plotsVal.textContent = 'Plots Ready';
    }

    // 3. Water Reservoir
    const waterVal = document.getElementById('report-water-val');
    const waterSub = document.getElementById('report-water-sub');
    const waterBarFill = document.getElementById('report-water-bar-fill');
    try {
      const water = simulation.getWaterLevel();
      const pct = Math.max(0, Math.min(100, Math.round((water.current / water.capacity) * 100)));
      if (waterVal) waterVal.textContent = `${water.current.toLocaleString()} L`;
      if (waterSub) waterSub.textContent = `${pct}% Reserves Full`;
      if (waterBarFill) waterBarFill.style.width = `${pct}%`;
    } catch (e) {}

    // 4. Warehouse Seeds
    const seedsVal = document.getElementById('report-seeds-val');
    const seedsSub = document.getElementById('report-seeds-sub');
    try {
      const seeds = sqlEngine.getTableData('seeds') || [];
      const seedMap = new Map();
      let totalSeedUnits = 0;
      seeds.forEach(s => {
        const name = (s.seed_name || '').trim();
        if (!name) return;
        const key = name.toLowerCase();
        const qty = Number(s.quantity) || 0;
        if (!seedMap.has(key)) {
          seedMap.set(key, qty);
        } else {
          seedMap.set(key, Math.max(seedMap.get(key), qty));
        }
      });
      for (const qty of seedMap.values()) {
        totalSeedUnits += qty;
      }
      const varietyCount = seedMap.size;
      if (seedsVal) {
        if (totalSeedUnits > 0) {
          seedsVal.textContent = `${totalSeedUnits} Seeds`;
        } else {
          seedsVal.textContent = `0 Seeds`;
        }
      }
      if (seedsSub) {
        if (varietyCount > 0) {
          const names = Array.from(seedMap.keys()).map(n => n.charAt(0).toUpperCase() + n.slice(1)).slice(0, 2).join(', ');
          seedsSub.textContent = `${varietyCount} Type${varietyCount > 1 ? 's' : ''}: ${names}`;
        } else {
          seedsSub.textContent = `Buy via SQL INSERT`;
        }
      }
    } catch (e) {}

    // 5. Pasture & Barn
    const animalsVal = document.getElementById('report-livestock-val');
    const animalsSub = document.getElementById('report-livestock-sub');
    try {
      const animals = sqlEngine.getTableData('animals') || [];
      if (animalsVal) {
        if (animals.length > 0) {
          animalsVal.textContent = `${animals.length} Cattle`;
        } else {
          animalsVal.textContent = `In Barn (0 Reg)`;
        }
      }
      if (animalsSub) {
        if (animals.length > 0) {
          const isNight = gameState.timeOfDay === 'night';
          animalsSub.textContent = isNight ? `💤 Sleeping peacefully` : `Grazing • 100% Happy`;
        } else {
          animalsSub.textContent = `Register via SQL in Lvl 1`;
        }
      }
    } catch (e) {}

    // 6. Active Mission Objective Teaser
    const missionTitle = document.getElementById('report-mission-title');
    const mission = this.getCurrentMissionData();
    if (missionTitle) {
      if (!mission) {
        missionTitle.innerHTML = `🎉 <strong>Level ${gameState.currentLevel} Completed!</strong>`;
      } else {
        missionTitle.textContent = `${mission.title || 'Mission active'}: ${mission.objectives ? mission.objectives[0] : 'See task objectives'}`;
      }
    }
  }

  // ==========================================================
  // STUDENT ANALYTICS TELEMETRY FOR TRAINER PORTAL
  // ==========================================================
  trackStudentAnalytics(sql, result, isSuccess) {
    try {
      const stored = localStorage.getItem('farmdb_student_analytics');
      const analytics = stored ? JSON.parse(stored) : {
        studentName: 'Live Student',
        startedAt: Date.now(),
        totalQueries: 0,
        successfulQueries: 0,
        failedQueries: 0,
        hintsUsed: 0,
        levelStats: {}
      };

      const lvl = gameState.currentLevel || 1;
      if (!analytics.levelStats[lvl]) {
        analytics.levelStats[lvl] = {
          attempts: 0,
          queries: [],
          errors: [],
          hintsRequested: 0,
          passed: false,
          passedAt: null,
          lastQuery: ''
        };
      }

      analytics.totalQueries++;
      analytics.levelStats[lvl].attempts++;
      analytics.levelStats[lvl].lastQuery = sql.trim();
      analytics.levelStats[lvl].queries.push({
        sql: sql.trim(),
        timestamp: Date.now(),
        success: isSuccess
      });

      if (isSuccess) {
        analytics.successfulQueries++;
      } else {
        analytics.failedQueries++;
        if (result && result.error) {
          analytics.levelStats[lvl].errors.push(result.error);
        }
      }

      localStorage.setItem('farmdb_student_analytics', JSON.stringify(analytics));
    } catch (e) { }
  }

  recordHintUsage() {
    try {
      const stored = localStorage.getItem('farmdb_student_analytics');
      const analytics = stored ? JSON.parse(stored) : {
        studentName: 'Live Student',
        startedAt: Date.now(),
        totalQueries: 0,
        successfulQueries: 0,
        failedQueries: 0,
        hintsUsed: 0,
        levelStats: {}
      };

      analytics.hintsUsed = (analytics.hintsUsed || 0) + 1;
      const lvl = gameState.currentLevel || 1;
      if (!analytics.levelStats[lvl]) {
        analytics.levelStats[lvl] = { attempts: 0, queries: [], errors: [], hintsRequested: 0, passed: false, passedAt: null, lastQuery: '' };
      }
      analytics.levelStats[lvl].hintsRequested = (analytics.levelStats[lvl].hintsRequested || 0) + 1;
      localStorage.setItem('farmdb_student_analytics', JSON.stringify(analytics));
    } catch (e) { }
  }

  recordLevelPassed(lvl) {
    try {
      const stored = localStorage.getItem('farmdb_student_analytics');
      if (stored) {
        const analytics = JSON.parse(stored);
        if (!analytics.levelStats[lvl]) {
          analytics.levelStats[lvl] = { attempts: 1, queries: [], errors: [], hintsRequested: 0, passed: false, passedAt: null, lastQuery: '' };
        }
        analytics.levelStats[lvl].passed = true;
        analytics.levelStats[lvl].passedAt = Date.now();
        localStorage.setItem('farmdb_student_analytics', JSON.stringify(analytics));
      }
    } catch (e) { }
  }

  // ==========================================================
  // SQL EXECUTION & VALIDATION PIPELINE
  // ==========================================================
  executeSQL() {
    const inputEl = document.getElementById('sql-input');
    if (!inputEl) return;
    const sql = inputEl.value;

    const result = sqlEngine.execute(sql);
    this.trackStudentAnalytics(sql, result, result.success);
    this.renderQueryResult(result);
    this.switchOutputTab('results');
    this.updateDebugPanel();

    if (!result.success) {
      sound.playErrorBuzz();
      return;
    }

    sound.playChime();

    // Trigger 3D Interactive World Animations based on query semantics
    if (this.is3DMode) {
      const sqlUpper = sql.toUpperCase();
      const isInsert = sqlUpper.includes('INSERT');
      const isUpdate = sqlUpper.includes('UPDATE');

      // 1. Inserting/updating something in the plot/soil -> Farmer comes from barn and sows seeds
      if ((isInsert || isUpdate) && (sqlUpper.includes('FARMING') || sqlUpper.includes('PLOTS') || sqlUpper.includes('CROPS') || sqlUpper.includes('SOW') || sqlUpper.includes('SEED'))) {
        let targetPlot = 'A1.1';
        const match = sql.match(/['"](A[1-5](\.[1-2])?)['"]/i);
        if (match) targetPlot = match[1];
        if (farm3D.playFarmerPlantAnimation) {
          farm3D.playFarmerPlantAnimation(targetPlot);
        }
      }
      // 2. Putting something into the barn / warehouse / supplies / inventory -> Delivery truck pulls up & unloads sack
      else if ((isInsert || isUpdate) && (sqlUpper.includes('WAREHOUSE') || sqlUpper.includes('INVENTORY') || sqlUpper.includes('SUPPLIES') || sqlUpper.includes('FERTILIZER') || sqlUpper.includes('EQUIPMENT') || (sqlUpper.includes('SEEDS') && !sqlUpper.includes('FARMING')))) {
        let itemName = 'Supplies';
        if (sqlUpper.includes('FERTILIZER')) itemName = 'Fertilizer';
        else if (sqlUpper.includes('SEED')) itemName = 'Seed Sacks';
        else if (sqlUpper.includes('EQUIPMENT')) itemName = 'Farm Equipment';
        else if (sqlUpper.includes('TOMATO') || sqlUpper.includes('WHEAT') || sqlUpper.includes('CROP')) itemName = 'Harvest Yield';
        if (farm3D.playTruckDeliveryAnimation) {
          farm3D.playTruckDeliveryAnimation(itemName);
        }
      }
      // 3. Querying or altering animals / cattle / cows -> Animals trot and moo happily
      else if (sqlUpper.includes('ANIMALS') || sqlUpper.includes('CATTLE') || sqlUpper.includes('LIVESTOCK') || sqlUpper.includes('COW') || sqlUpper.includes('MILK') || sqlUpper.includes('FEED')) {
        if (farm3D.playAnimalReactionAnimation) {
          farm3D.playAnimalReactionAnimation();
        }
      }
    }

    // Check if the query satisfied the current mission
    const mission = this.getCurrentMissionData();
    if (mission && typeof mission.validate === 'function') {
      const isValid = mission.validate(sqlEngine, result);
      if (isValid) {
        this.handleMissionSuccess(mission);
      }
    }
  }

  handleMissionSuccess(mission) {
    sound.playHarvestSuccess();
    this.showToast(`🎯 Mission Complete: ${mission.title}!`, 'success');
    const isNew = !gameState.completedMissions.includes(mission.id);
    if (isNew) {
      gameState.addXP(25);
    }

    // Specific in-game consequences per mission
    if (mission.id === 'L1_M4' || mission.id === 'L1_M5') {
      if (this.is3DMode && farm3D.playAnimalReactionAnimation) {
        farm3D.playAnimalReactionAnimation();
      }
    } else if (mission.id === 'L2_M2') {
      if (this.is3DMode && farm3D.playFarmerPlantAnimation) {
        farm3D.playFarmerPlantAnimation('A1.1');
      }
      this.showToast('🌱 Tomato sown in Plot A1! Advance Day to water and grow it.', 'info');
    } else if (mission.id === 'L2_M4') {
      farmRenderer.playHarvestAnimation();
      if (this.is3DMode) farm3D.playHarvestAnimation();
      this.showToast('🚜 Tractor harvested 40kg tomatoes! Added to Warehouse.', 'success');
    } else if (mission.id === 'L4_M1' || mission.id === 'L4_M2') {
      if (this.is3DMode && farm3D.playTruckDeliveryAnimation) {
        farm3D.playTruckDeliveryAnimation('Seeds & Fertilizer');
      }
    } else if (mission.id === 'L2_M5') {
      if (isNew) {
        const stock = sqlEngine.getTableData('stock');
        const tomato = stock.find(s => (s.product_name || '').toLowerCase() === 'tomato');
        const unitPrice = (tomato && Number(tomato.price) > 0) ? Number(tomato.price) : 20;
        const saleRevenue = 40 * unitPrice; // 40kg * ₹20/kg = ₹800
        gameState.addMoney(saleRevenue);
        sound.playCoin();
        this.showToast(`💰 Order fulfilled! Earned ₹${saleRevenue.toLocaleString()} cash!`, 'success');
      }
    } else if (mission.id === 'L3_M4') {
      this.showToast('🔓 High-Yield plots filtered! Plot A2 unlocked for cultivation.', 'success');
    } else if (mission.id === 'L4_M4') {
      if (isNew) {
        gameState.addMoney(1200);
        sound.playCoin();
        this.showToast('💰 Priority orders dispatched! Earned ₹1,200 bonus!', 'success');
      }
    } else if (mission.id === 'L5_M4') {
      if (isNew) {
        gameState.addMoney(3500);
        sound.playCoin();
        this.showToast('💰 Wholesale orders invoiced! Earned ₹3,500!', 'success');
      }
    } else if (mission.id === 'L6_M4') {
      this.showToast('🚜 Machinery fleet deployed to field crews!', 'success');
    } else if (mission.id === 'L7_M4') {
      if (isNew) {
        gameState.addMoney(5000);
        sound.playCoin();
        this.showToast('⚖️ Forensic audit recovered ₹5,000 in lost revenue!', 'success');
      }
    } else if (mission.id === 'L10_M3') {
      if (isNew) {
        gameState.addMoney(10000);
        sound.playCoin();
        farmRenderer.playHarvestAnimation();
        if (this.is3DMode) farm3D.playHarvestAnimation();
        this.showToast('🏆 Emergency drought relief contract completed! Earned ₹10,000!', 'success');
      }
    }

    if (this.is3DMode) {
      farm3D.syncFromDatabase();
    }

    // Advance mission index
    gameState.completeCurrentMission();
    this.activeHintTier = 1;

    // Check if Level is completed
    const lvlData = MISSIONS_DATA[gameState.currentLevel];
    if (gameState.currentMissionIndex >= lvlData.missions.length) {
      this.handleLevelCompletion(lvlData);
    } else {
      this.renderCurrentMission();
    }
  }

  handleLevelCompletion(lvlData) {
    if (lvlData.completion && lvlData.completion.badge) {
      gameState.awardBadge(lvlData.completion.badge);
    }
    sound.playLevelUp();
    this.recordLevelPassed(gameState.currentLevel);
    this.showCelebrationModal(lvlData);
  }

  showCelebrationModal(lvlData) {
    const overlay = document.getElementById('celebration-modal-overlay');
    const badgeEl = document.getElementById('celebration-badge');
    const titleEl = document.getElementById('celebration-title');
    const subtitleEl = document.getElementById('celebration-subtitle');
    const statsGrid = document.getElementById('celebration-stats-grid');
    const unlocksText = document.getElementById('celebration-unlocks-text');
    const btnProceed = document.getElementById('btn-proceed-next-level');

    if (overlay && lvlData.completion) {
      if (badgeEl) badgeEl.textContent = lvlData.completion.badge.split(' ')[0] || '🎖️';
      if (titleEl) titleEl.textContent = lvlData.completion.title;
      if (subtitleEl) subtitleEl.textContent = lvlData.completion.subtitle;

      if (statsGrid && lvlData.completion.stats) {
        statsGrid.innerHTML = lvlData.completion.stats.map(s => `
          <div class="stat-card">
            <div class="stat-label">${s.label}</div>
            <div class="stat-value">${s.value}</div>
          </div>
        `).join('');
      }

      if (unlocksText) {
        unlocksText.textContent = lvlData.completion.nextLevelTitle;
      }

      if (btnProceed) {
        const span = btnProceed.querySelector('span');
        if (span) {
          if (gameState.currentLevel >= 10) {
            span.textContent = '🏆 Celebrate Agribusiness Empire!';
          } else {
            span.textContent = `Begin Chapter ${gameState.currentLevel + 1} ❯`;
          }
        }
      }

      overlay.classList.add('active');
    }
  }

  showGrandFinaleModal() {
    const overlay = document.getElementById('celebration-modal-overlay');
    const badgeEl = document.getElementById('celebration-badge');
    const titleEl = document.getElementById('celebration-title');
    const subtitleEl = document.getElementById('celebration-subtitle');
    const statsGrid = document.getElementById('celebration-stats-grid');
    const unlocksText = document.getElementById('celebration-unlocks-text');
    const btnProceed = document.getElementById('btn-proceed-next-level');

    if (overlay) {
      if (badgeEl) badgeEl.textContent = '👑';
      if (titleEl) titleEl.textContent = 'GRAND FINALE COMPLETED!';
      if (subtitleEl) subtitleEl.textContent = 'You have mastered SQL and built a modern Agricultural Empire!';

      if (statsGrid) {
        statsGrid.innerHTML = `
          <div class="stat-card">
            <div class="stat-label">Title Earned</div>
            <div class="stat-value" style="color: #F59E0B; font-size: 13px;">Agribusiness Emperor 👑</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Levels Conquered</div>
            <div class="stat-value">10 / 10</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Treasury</div>
            <div class="stat-value">₹${gameState.money.toLocaleString()}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">SQL Prowess</div>
            <div class="stat-value">Grandmaster 🎓</div>
          </div>
        `;
      }

      if (unlocksText) {
        unlocksText.textContent = 'Freeplay Sandbox: All 5 plots unlocked, full CTE, Window Functions, and multi-facility tables active!';
      }

      if (btnProceed) {
        const span = btnProceed.querySelector('span');
        if (span) span.textContent = '🌾 Return to Farm World';
        btnProceed.onclick = () => {
          overlay.classList.remove('active');
          this.switchView('farm-world');
        };
      }

      overlay.classList.add('active');
    }
  }

  // ==========================================================
  // QUERY RESULT RENDERING
  // ==========================================================
  renderQueryResult(result) {
    const container = document.getElementById('tab-content-results');
    if (!container) return;

    if (!result.success) {
      container.innerHTML = `
        <div class="sql-error-box">
          <div class="sql-error-title">⚠️ SQL Execution Error</div>
          <div class="sql-error-msg">${result.error}</div>
          ${result.hint ? `<div class="sql-error-hint"><strong>💡 Farm Advisor Tip:</strong> ${result.hint}</div>` : ''}
        </div>
      `;
      return;
    }

    if (!result.results || result.results.length === 0) {
      container.innerHTML = `
        <div class="sql-success-box">
          <div><strong>✓ Query executed successfully!</strong></div>
          <div style="font-size: 12px; color: #4B5563; margin-top: 4px;">Action: ${result.action} on ${result.table || 'database'} (Rows affected: ${result.rowsAffected || 0})</div>
        </div>
      `;
      return;
    }

    // Render Query Result Tables
    let html = '';
    result.results.forEach(tbl => {
      html += `
        <div style="font-size: 11px; font-weight: 700; color: #4B5563; margin-bottom: 6px;">
          Result: ${tbl.values.length} row(s) returned
        </div>
        <table class="sql-result-table">
          <thead>
            <tr>
              ${tbl.columns.map(col => `<th>${col}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tbl.values.map(row => `
              <tr>
                ${row.map(val => `<td>${val !== null && val !== undefined ? val : '<span style="color:#9CA3AF;">NULL</span>'}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    });

    container.innerHTML = html;
  }

  // ==========================================================
  // SCHEMA TREE & ERD RENDERING
  // ==========================================================
  renderSchemaTree() {
    const container = document.getElementById('schema-tree-container');
    if (!container) return;

    const schema = sqlEngine.getSchema();
    const tableNames = Object.keys(schema);

    if (tableNames.length === 0) {
      container.innerHTML = `
        <div style="font-size: 12px; color: #9CA3AF; padding: 12px; text-align:center;">
          No user tables created yet.<br>Run <code>CREATE TABLE</code> to add tables!
        </div>
      `;
      return;
    }

    let html = '';
    tableNames.forEach(tblName => {
      const cols = schema[tblName];
      html += `
        <div class="schema-table-item" data-table="${tblName}">
          <div class="schema-table-name" onclick="this.parentElement.classList.toggle('collapsed')">
            <div class="table-name-left">
              <span class="table-collapse-icon">▼</span>
              <span class="table-icon">📋</span>
              <strong class="table-title">${tblName}</strong>
            </div>
            <span class="col-count-badge">${cols.length} cols</span>
          </div>
          <div class="schema-columns-list">
            ${cols.map(c => {
              const typeLower = (c.type || 'TEXT').toLowerCase();
              let typeClass = 'type-text';
              if (typeLower.includes('int')) typeClass = 'type-int';
              else if (typeLower.includes('bool')) typeClass = 'type-bool';
              else if (typeLower.includes('real') || typeLower.includes('float') || typeLower.includes('num')) typeClass = 'type-num';

              return `
                <div class="schema-col-item" title="${c.name} (${c.type || 'TEXT'}${c.pk ? ' - Primary Key' : ''})">
                  <div class="col-name-group">
                    <span class="col-key-icon" ${c.pk ? 'title="Primary Key"' : ''}>${c.pk ? '🔑' : '•'}</span>
                    <span class="col-name ${c.pk ? 'col-pk' : ''}">${c.name}</span>
                  </div>
                  <span class="col-type ${typeClass}">${c.type || 'TEXT'}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Attach Toggle All Tables action once
    const btnToggleAll = document.getElementById('btn-schema-toggle-all');
    if (btnToggleAll && !btnToggleAll._boundToggle) {
      btnToggleAll._boundToggle = true;
      btnToggleAll.addEventListener('click', (e) => {
        e.stopPropagation();
        const items = container.querySelectorAll('.schema-table-item');
        const anyOpen = Array.from(items).some(item => !item.classList.contains('collapsed'));
        items.forEach(item => {
          if (anyOpen) {
            item.classList.add('collapsed');
          } else {
            item.classList.remove('collapsed');
          }
        });
      });
    }
  }

  renderDatabaseERD() {
    const container = document.getElementById('database-erd-container');
    if (!container) return;

    const schema = sqlEngine.getSchema();
    const tableNames = Object.keys(schema);

    if (tableNames.length === 0) {
      container.innerHTML = '<div style="color: #9CA3AF; font-size: 14px;">No tables exist yet. Execute Level 1 to build your database!</div>';
      return;
    }

    let html = '';
    tableNames.forEach(tbl => {
      const cols = schema[tbl];
      const rowData = sqlEngine.getTableData(tbl);
      html += `
        <div style="background: white; border: 2px solid var(--border-warm); border-radius: 12px; overflow: hidden; box-shadow: var(--shadow-sm);">
          <div style="background: var(--green-light); padding: 10px 14px; border-bottom: 2px solid var(--green-primary); display:flex; justify-content:space-between; align-items:center;">
            <strong style="color: var(--green-deep); font-size: 14px;">📋 ${tbl}</strong>
            <span style="font-size: 11px; background: white; padding: 2px 8px; border-radius: 999px; font-weight:700; color: var(--green-deep);">${rowData.length} rows</span>
          </div>
          <div style="padding: 10px 14px; font-size: 12px; max-height: 220px; overflow-y: auto;">
            ${cols.map(c => `
              <div style="display:flex; justify-content:space-between; padding: 3px 0; border-bottom: 1px dashed #F3F4F6;">
                <span>${c.pk ? '🔑 ' : ''}<strong>${c.name}</strong></span>
                <span style="color: #6B7280; font-family: var(--font-mono); font-size: 11px;">${c.type || 'TEXT'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  renderInventoryView() {
    const seedsContainer = document.getElementById('warehouse-full-seeds');
    const stockContainer = document.getElementById('warehouse-full-stock');
    if (!seedsContainer || !stockContainer) return;

    const seeds = sqlEngine.getTableData('seeds');
    const stock = sqlEngine.getTableData('stock');

    const seedMap = new Map();
    seeds.forEach(s => {
      const key = (s.seed_name || '').toLowerCase().trim();
      if (!seedMap.has(key)) {
        seedMap.set(key, s);
      } else {
        const ex = seedMap.get(key);
        ex.quantity = Math.max(ex.quantity, s.quantity || 0);
      }
    });
    const uniqueSeeds = Array.from(seedMap.values());

    if (uniqueSeeds.length === 0) {
      seedsContainer.innerHTML = '<div style="color: #9CA3AF; font-size: 13px;">No seeds recorded in database yet.</div>';
    } else {
      seedsContainer.innerHTML = `
        <table class="sql-result-table">
          <thead><tr><th>Seed Name</th><th>Quantity</th><th>Price (₹)</th></tr></thead>
          <tbody>
            ${uniqueSeeds.map(s => `<tr><td><strong>${s.seed_name}</strong></td><td>${s.quantity}</td><td>₹${s.price || 0}</td></tr>`).join('')}
          </tbody>
        </table>
      `;
    }

    if (stock.length === 0) {
      stockContainer.innerHTML = '<div style="color: #9CA3AF; font-size: 13px;">No harvest stock recorded yet. Harvest crops in Level 2!</div>';
    } else {
      stockContainer.innerHTML = `
        <table class="sql-result-table">
          <thead><tr><th>Product Name</th><th>Quantity</th><th>Unit</th><th>Price (₹)</th></tr></thead>
          <tbody>
            ${stock.map(st => `<tr><td><strong>${st.product_name}</strong></td><td>${st.quantity}</td><td>${st.unit || 'kg'}</td><td>₹${st.price || 0}</td></tr>`).join('')}
          </tbody>
        </table>
      `;
    }
  }

  renderJourneyView() {
    const container = document.getElementById('journey-cards-grid');
    if (!container) return;

    let html = '';
    for (let i = 1; i <= 10; i++) {
      const lvl = MISSIONS_DATA[i];
      const isCurrent = gameState.currentLevel === i;
      const isCompleted = gameState.currentLevel > i;
      const isUnlocked = i <= gameState.currentLevel;

      let statusBadge = isCompleted ? '✓ Completed' : isCurrent ? '▶ Active' : '🔒 Locked';
      let statusClass = isCompleted ? 'completed' : isCurrent ? 'active' : 'locked';

      let actionButtons = '';
      if (isUnlocked) {
        actionButtons = `
          <div class="journey-card-actions" style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
            ${!isCurrent ? `
              <button class="btn-journey-switch" data-level="${i}" style="background: rgba(34, 197, 94, 0.15); border: 1px solid #22C55E; color: #15803D; padding: 5px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px;" title="Switch to this chapter">
                <span>▶ Jump to Level</span>
              </button>
            ` : `
              <span style="font-size: 11px; font-weight: 700; color: #16A34A; display: flex; align-items: center; gap: 4px; padding: 4px 0;">
                <span>🌟 Current Mission</span>
              </span>
            `}
          </div>
        `;
      }

      html += `
        <div class="journey-card ${statusClass}">
          <div class="journey-card-header">
            <span class="journey-level-tag">Level ${i}</span>
            <span class="journey-status-tag">${statusBadge}</span>
          </div>
          <h3 class="journey-card-title">${lvl ? lvl.title : `Chapter ${i}`}</h3>
          <div class="journey-card-role">${lvl ? lvl.role : 'Manager'}</div>
          <div class="journey-card-concept"><strong>SQL:</strong> ${lvl ? lvl.concept : 'Advanced SQL'}</div>
          <p class="journey-card-teaser">${lvl && lvl.teaser ? lvl.teaser : (lvl && lvl.storyIntro ? lvl.storyIntro.text.substring(0, 100) + '...' : '')}</p>
          ${actionButtons}
        </div>
      `;
    }

    container.innerHTML = html;

    // Attach listeners for interactive buttons

    container.querySelectorAll('.btn-journey-switch').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const lvlNum = parseInt(btn.dataset.level, 10);
        gameState.setLevel(lvlNum);
        simulation.syncPlotsWithLevel(lvlNum);
        if (this.is3DMode) farm3D.syncFromDatabase();
        this.renderJourneyView();
        this.switchView('farm-world');
        this.openNotebookModal();
        this.showToast(`Switched to Level ${lvlNum}: ${MISSIONS_DATA[lvlNum].title}!`, 'info');
      });
    });
  }

  // ==========================================================
  // EVENT LISTENERS & UI WIRING
  // ==========================================================
  setupUIEventListeners() {
    // 3D Environment Toggle Button
    const btnToggle3D = document.getElementById('btn-toggle-3d-mode');
    if (btnToggle3D) {
      if (this.is3DMode) btnToggle3D.classList.add('active');
      btnToggle3D.addEventListener('click', () => {
        this.toggle3DMode();
      });
    }

    // Top Bar SQL Compiler Button
    const btnTopCompiler = document.getElementById('btn-top-sql-compiler');
    if (btnTopCompiler) {
      btnTopCompiler.addEventListener('click', () => this.openTerminal());
    }

    // Advance Day
    const btnAdvanceDay = document.getElementById('btn-advance-day');
    if (btnAdvanceDay) {
      btnAdvanceDay.addEventListener('click', () => {
        simulation.advanceDay();
        sound.playPhaseTransition('morning', null, true);
        const soundIcon = document.getElementById('sound-icon');
        if (soundIcon && !sound.muted) soundIcon.textContent = '🔊';
        this.showToast(`🌅 Advanced to Day ${gameState.day} • 🐓 "Kuku-du-ku-ku!" Dawn has broken!`, 'success');
        if (this.is3DMode) {
          farm3D.syncFromDatabase();
        }
        // Check if day advancement satisfied the nurture mission (L2_M3)
        const mission = this.getCurrentMissionData();
        if (mission && mission.id === 'L2_M3') {
          if (mission.validate(sqlEngine)) {
            this.handleMissionSuccess(mission);
          }
        }
      });
    }

    // Cycle Day/Night on Time Pill Click
    const timePill = document.getElementById('time-pill');
    if (timePill) {
      timePill.addEventListener('click', () => {
        const prevPhase = gameState.timeOfDay;
        const nextPhase = gameState.cycleTimeOfDay();
        const phaseInfo = gameState.getTimePhaseInfo();

        if (nextPhase === 'morning') {
          // Shifting night to morning: Cock crow "kuku-du-ku-ku!"
          sound.playPhaseTransition('morning', prevPhase, true);
          const soundIcon = document.getElementById('sound-icon');
          if (soundIcon && !sound.muted) soundIcon.textContent = '🔊';
          this.showToast(`🐓 "Kuku-du-ku-ku!" Dawn has broken on Day ${gameState.day}!`, 'success');
        } else {
          sound.playPhaseTransition(nextPhase, prevPhase);
          this.showToast(`Time shifted to ${phaseInfo.icon} ${phaseInfo.label} (${gameState.getTimeString()})`, 'info');
        }

        if (this.is3DMode) {
          farm3D.syncLightingAndTime();
        }
      });
    }

    // Toggle Sound
    const btnToggleSound = document.getElementById('btn-toggle-sound');
    const soundIcon = document.getElementById('sound-icon');
    if (soundIcon) {
      soundIcon.textContent = sound.muted ? '🔇' : '🔊';
    }
    if (btnToggleSound) {
      btnToggleSound.addEventListener('click', () => {
        const isSoundOn = sound.toggleMute();
        if (soundIcon) soundIcon.textContent = isSoundOn ? '🔊' : '🔇';
        this.showToast(isSoundOn ? 'Sound effects enabled 🔊' : 'Sound muted 🔇', 'info');
      });
    }

    // Auto-resume AudioContext on first user interaction so sounds play unmuted
    const unlockAudio = () => {
      sound.init();
      if (sound.ctx && sound.ctx.state === 'suspended' && !sound.muted) {
        sound.ctx.resume();
        sound.startAmbient();
      }
      document.removeEventListener('pointerdown', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    document.addEventListener('pointerdown', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });

    // Show Story Notebook
    const btnShowStory = document.getElementById('btn-show-story');
    if (btnShowStory) {
      btnShowStory.addEventListener('click', () => this.openNotebookModal());
    }



    // Start Playing from Notebook
    const btnStartPlaying = document.getElementById('btn-start-playing');
    if (btnStartPlaying) {
      btnStartPlaying.addEventListener('click', () => {
        const modal = document.getElementById('notebook-modal-overlay');
        if (modal) modal.classList.remove('active');
        localStorage.setItem('farmdb_intro_seen', 'true');
        sound.playChime();
        this.openTerminal();
      });
    }

    // Click backdrop to dismiss notebook modal
    const notebookOverlay = document.getElementById('notebook-modal-overlay');
    if (notebookOverlay) {
      notebookOverlay.addEventListener('click', (e) => {
        if (e.target === notebookOverlay) {
          notebookOverlay.classList.remove('active');
        }
      });
    }

    // Reset All Game Progress
    const btnResetLevel = document.getElementById('btn-reset-level');
    if (btnResetLevel) {
      btnResetLevel.addEventListener('click', () => {
        if (confirm('Reset all FARMDB game progress and restart from Level 1, Day 1?')) {
          this.fullReset();
        }
      });
    }

    // Next Level Proceed Button from Celebration Modal (Levels 1 through 10)
    const btnProceed = document.getElementById('btn-proceed-next-level');
    if (btnProceed) {
      btnProceed.addEventListener('click', () => {
        const overlay = document.getElementById('celebration-modal-overlay');
        if (overlay) overlay.classList.remove('active');

        const nextLevel = gameState.currentLevel + 1;
        if (nextLevel <= 10) {
          gameState.setLevel(nextLevel);
          simulation.syncPlotsWithLevel(nextLevel);
          if (this.is3DMode) farm3D.syncFromDatabase();
          const lvlData = MISSIONS_DATA[nextLevel];
          this.showToast(`🎉 Welcome to Level ${nextLevel}: ${lvlData ? lvlData.title : 'Next Chapter'}!`, 'success');
          this.openNotebookModal();
        } else {
          this.showGrandFinaleModal();
        }
      });
    }

    // Plot Inspector Close & Action
    const btnCloseInspector = document.getElementById('btn-close-inspector');
    if (btnCloseInspector) {
      btnCloseInspector.addEventListener('click', () => farmRenderer.closePlotInspector());
    }

    const btnInspectorAction = document.getElementById('btn-inspector-action');
    if (btnInspectorAction) {
      btnInspectorAction.addEventListener('click', () => {
        farmRenderer.closePlotInspector();
        this.openTerminal();
      });
    }

    // Open Terminal from Quest HUD Mission Card
    const btnOpenFromMission = document.getElementById('btn-open-terminal-from-mission');
    if (btnOpenFromMission) {
      btnOpenFromMission.addEventListener('click', () => this.openTerminal());
    }

    // Farmer Profile Area & Level Pill Click to Open Profile Modal
    const farmerCard = document.querySelector('.sidebar-farmer-card');
    if (farmerCard) {
      farmerCard.style.cursor = 'pointer';
      farmerCard.title = 'Click to open Farmer Career Profile & Stats';
      farmerCard.addEventListener('click', () => this.openProfileModal());
    }

    const levelPill = document.getElementById('level-pill');
    if (levelPill) {
      levelPill.style.cursor = 'pointer';
      levelPill.title = 'Click to view Farmer Profile & Career Milestones';
      levelPill.addEventListener('click', () => this.openProfileModal());
    }

    const btnCloseProfile = document.getElementById('btn-close-profile-modal');
    if (btnCloseProfile) {
      btnCloseProfile.addEventListener('click', () => {
        const modal = document.getElementById('profile-modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    }

    const btnProfileContinue = document.getElementById('btn-profile-continue');
    if (btnProfileContinue) {
      btnProfileContinue.addEventListener('click', () => {
        const modal = document.getElementById('profile-modal-overlay');
        if (modal) modal.classList.remove('active');
      });
    }

    const profileOverlay = document.getElementById('profile-modal-overlay');
    if (profileOverlay) {
      profileOverlay.addEventListener('click', (e) => {
        if (e.target === profileOverlay) {
          profileOverlay.classList.remove('active');
        }
      });
    }

    // Floating Quest HUD Controls & Dragging
    this.setupQuestHud();

    // Burger Navigation Toggle & Sidebar Collapsing
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    const btnFloatingBurger = document.getElementById('btn-floating-burger');
    const btnCollapseSidebar = document.getElementById('btn-collapse-sidebar');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');

    if (btnToggleSidebar) {
      btnToggleSidebar.addEventListener('click', () => {
        this.toggleSidebar();
      });
    }

    if (btnFloatingBurger) {
      btnFloatingBurger.addEventListener('click', () => {
        this.toggleSidebar(true);
      });
    }

    if (btnCollapseSidebar) {
      btnCollapseSidebar.addEventListener('click', () => {
        this.toggleSidebar(false);
      });
    }

    if (sidebarBackdrop) {
      sidebarBackdrop.addEventListener('click', () => {
        this.toggleSidebar(false);
      });
    }

    // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar, Escape to close
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        this.toggleSidebar();
      } else if (e.key === 'Escape') {
        const sidebar = document.getElementById('app-sidebar');
        if (sidebar && !sidebar.classList.contains('collapsed') && window.innerWidth <= 768) {
          this.toggleSidebar(false);
        }
      }
    });

    // Restore saved sidebar state from localStorage
    const savedSidebarState = localStorage.getItem('farmdb_sidebar_collapsed');
    if (savedSidebarState === 'true') {
      this.toggleSidebar(false, true);
    } else {
      const sidebar = document.getElementById('app-sidebar');
      const burger = document.getElementById('btn-toggle-sidebar');
      const floatingBurger = document.getElementById('btn-floating-burger');
      if (sidebar) sidebar.classList.remove('collapsed');
      if (burger) burger.classList.add('active');
      if (floatingBurger) floatingBurger.classList.add('active');
    }
  }

  toggleSidebar(forceOpen = null, silent = false) {
    const sidebar = document.getElementById('app-sidebar') || document.querySelector('.sidebar');
    const burgerBtn = document.getElementById('btn-toggle-sidebar');
    const floatingBurger = document.getElementById('btn-floating-burger');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (!sidebar) return;

    const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
    const willBeOpen = forceOpen !== null ? forceOpen : isCurrentlyCollapsed;

    if (willBeOpen) {
      sidebar.classList.remove('collapsed');
      if (burgerBtn) burgerBtn.classList.add('active');
      if (floatingBurger) floatingBurger.classList.add('active');
      if (backdrop && window.innerWidth <= 768) backdrop.classList.add('active');
      localStorage.setItem('farmdb_sidebar_collapsed', 'false');
      if (!silent) {
        sound.playPlotSelect();
        this.showToast('🧭 Farm Menu opened (Ctrl+B)', 'info');
      }
    } else {
      sidebar.classList.add('collapsed');
      if (burgerBtn) burgerBtn.classList.remove('active');
      if (floatingBurger) floatingBurger.classList.remove('active');
      if (backdrop) backdrop.classList.remove('active');
      localStorage.setItem('farmdb_sidebar_collapsed', 'true');
      if (!silent) {
        sound.playPlotSelect();
        this.showToast('🧭 Farm Menu closed (Ctrl+B to reopen)', 'info');
      }
    }

    // Smoothly animate 3D Farm resize during and after the 300ms CSS transition
    const startTime = performance.now();
    const animateResize = (now) => {
      if (this.is3DMode && farm3D) {
        farm3D.onWindowResize();
      } else if (farmRenderer) {
        farmRenderer.render();
      }
      if (now - startTime < 350) {
        requestAnimationFrame(animateResize);
      } else {
        window.dispatchEvent(new Event('resize'));
      }
    };
    requestAnimationFrame(animateResize);
  }

  setupQuestHud() {
    const hudRoot = document.getElementById('quest-hud');
    const hudCard = document.getElementById('quest-hud-card');
    const hudPill = document.getElementById('quest-hud-pill');
    const btnMin = document.getElementById('btn-quest-hud-minimize');
    const btnTogglePos = document.getElementById('btn-quest-hud-toggle-pos');
    const btnHint = document.getElementById('btn-quest-hud-hint');
    const dragHeader = document.getElementById('quest-hud-drag-header');

    if (!hudRoot) return;

    // Minimize / Expand Toggle
    const setMinimized = (minimized) => {
      if (minimized) {
        if (hudCard) hudCard.style.display = 'none';
        if (hudPill) hudPill.style.display = 'flex';
        try { localStorage.setItem('farmdb_quest_hud_min', 'true'); } catch (_) {}
      } else {
        if (hudCard) hudCard.style.display = 'block';
        if (hudPill) hudPill.style.display = 'none';
        try { localStorage.setItem('farmdb_quest_hud_min', 'false'); } catch (_) {}
      }
    };

    if (btnMin) {
      btnMin.addEventListener('click', (e) => {
        e.stopPropagation();
        setMinimized(true);
      });
    }

    if (hudPill) {
      hudPill.addEventListener('click', () => {
        setMinimized(false);
      });
    }

    // Restore saved minimize state
    try {
      if (localStorage.getItem('farmdb_quest_hud_min') === 'true') {
        setMinimized(true);
      }
    } catch (_) {}

    // Toggle Corner Position (Top-Left / Top-Right)
    if (btnTogglePos) {
      btnTogglePos.addEventListener('click', (e) => {
        e.stopPropagation();
        hudRoot.style.left = '';
        hudRoot.style.right = '';
        hudRoot.style.top = '';
        const isRight = hudRoot.classList.toggle('pos-top-right');
        try { localStorage.setItem('farmdb_quest_hud_corner', isRight ? 'right' : 'left'); } catch (_) {}
      });
    }

    // Restore saved corner position
    try {
      if (localStorage.getItem('farmdb_quest_hud_corner') === 'right') {
        hudRoot.classList.add('pos-top-right');
      }
    } catch (_) {}

    // Hint button: opens terminal and switches directly to Hints tab
    if (btnHint) {
      btnHint.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openTerminal();
        this.switchOutputTab('hints');
      });
    }

    // Smooth dragging on header
    if (dragHeader) {
      let isDragging = false;
      let startX = 0, startY = 0;
      let initialLeft = 0, initialTop = 0;

      dragHeader.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.quest-hud-ctrl-btn')) return;
        isDragging = true;
        dragHeader.style.cursor = 'grabbing';
        try { dragHeader.setPointerCapture(e.pointerId); } catch (_) {}

        const rect = hudRoot.getBoundingClientRect();
        const parent = hudRoot.parentElement || document.body;
        const parentRect = parent.getBoundingClientRect();

        startX = e.clientX;
        startY = e.clientY;
        initialLeft = rect.left - parentRect.left;
        initialTop = rect.top - parentRect.top;

        hudRoot.classList.remove('pos-top-right');
        hudRoot.style.right = 'auto';
        hudRoot.style.left = `${initialLeft}px`;
        hudRoot.style.top = `${initialTop}px`;
      });

      dragHeader.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        const parent = hudRoot.parentElement || document.body;
        const parentRect = parent.getBoundingClientRect();
        const rect = hudRoot.getBoundingClientRect();

        const maxLeft = Math.max(10, parentRect.width - rect.width - 10);
        const maxTop = Math.max(10, parentRect.height - rect.height - 10);

        const newLeft = Math.max(10, Math.min(maxLeft, initialLeft + dx));
        const newTop = Math.max(10, Math.min(maxTop, initialTop + dy));

        hudRoot.style.left = `${newLeft}px`;
        hudRoot.style.top = `${newTop}px`;
      });

      const stopDrag = (e) => {
        if (!isDragging) return;
        isDragging = false;
        dragHeader.style.cursor = 'grab';
        try { dragHeader.releasePointerCapture(e.pointerId); } catch (_) {}
      };

      dragHeader.addEventListener('pointerup', stopDrag);
      dragHeader.addEventListener('pointercancel', stopDrag);
    }
  }

  toggle3DMode(forceMode = null) {
    this.is3DMode = forceMode !== null ? forceMode : !this.is3DMode;
    const wrapper3D = document.getElementById('farm-3d-wrapper');
    const container2D = document.getElementById('farm-world-container');
    const btn = document.getElementById('btn-toggle-3d-mode');
    const label = document.getElementById('view-mode-label');
    const icon = document.getElementById('view-mode-icon');

    if (this.is3DMode) {
      if (wrapper3D) wrapper3D.style.display = 'block';
      if (container2D) container2D.style.display = 'none';
      if (label) label.textContent = '3D World';
      if (icon) icon.textContent = '🎮';
      if (btn) btn.classList.add('active');
      farm3D.onWindowResize();
      farm3D.syncFromDatabase();
      this.showToast('🎮 3D Farm Environment Active! Left-click drag to orbit, right-click to pan, scroll to zoom.', 'info');
    } else {
      if (wrapper3D) wrapper3D.style.display = 'none';
      if (container2D) container2D.style.display = 'block';
      if (label) label.textContent = '2D Grid';
      if (icon) icon.textContent = '🗺️';
      if (btn) btn.classList.remove('active');
      farmRenderer.render();
      this.showToast('🗺️ Switched to Classic 2D Farm Grid view.', 'info');
    }
  }

  setupSQLEditorListeners() {
    const inputEl = document.getElementById('sql-input');
    const lineNumbers = document.getElementById('editor-line-numbers');
    const btnRun = document.getElementById('btn-run-sql');
    const btnClear = document.getElementById('btn-clear-sql');
    const btnQuickFill = document.getElementById('btn-quick-fill');
    const btnToggleHint = document.getElementById('btn-toggle-hint');
    const btnToggleSchema = document.getElementById('btn-toggle-schema');
    const schemaPane = document.getElementById('schema-pane');

    // Run on Button Click
    if (btnRun) {
      btnRun.addEventListener('click', () => this.executeSQL());
    }

    // Keyboard Shortcuts: Ctrl+Enter or Cmd+Enter to Run
    if (inputEl) {
      inputEl.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          this.executeSQL();
        }
      });

      // Update Line Numbers on Input & Scroll
      const updateLines = () => {
        const lines = inputEl.value.split('\n').length;
        if (lineNumbers) {
          lineNumbers.innerHTML = Array.from({ length: Math.max(lines, 3) }, (_, i) => i + 1).join('<br>');
        }
      };

      inputEl.addEventListener('input', updateLines);
      inputEl.addEventListener('scroll', () => {
        if (lineNumbers) lineNumbers.scrollTop = inputEl.scrollTop;
      });
      updateLines();
    }

    // Clear SQL
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (inputEl) {
          inputEl.value = '';
          inputEl.focus();
          const lines = document.getElementById('editor-line-numbers');
          if (lines) lines.innerHTML = '1<br>2<br>3';
        }
      });
    }

    // Quick Fill Current Mission Solution / Template
    if (btnQuickFill) {
      btnQuickFill.addEventListener('click', () => {
        const mission = this.getCurrentMissionData();
        if (mission && mission.quickFill && inputEl) {
          inputEl.value = mission.quickFill;
          inputEl.focus();
          const lines = inputEl.value.split('\n').length;
          if (lineNumbers) {
            lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
          }
          this.showToast('Query inserted into editor! Click Run SQL or press Ctrl+Enter.', 'info');
        }
      });
    }

    // Hints Button
    if (btnToggleHint) {
      btnToggleHint.addEventListener('click', () => {
        this.cycleHintTier();
      });
    }

    // Toggle Schema Drawer
    if (btnToggleSchema && schemaPane) {
      btnToggleSchema.addEventListener('click', () => {
        this.schemaVisible = !this.schemaVisible;
        schemaPane.style.display = this.schemaVisible ? 'flex' : 'none';
        const splitGutter = document.getElementById('schema-split-gutter');
        if (splitGutter) splitGutter.style.display = this.schemaVisible ? 'block' : 'none';
      });
    }

    // Output Tabs Switching
    document.querySelectorAll('.output-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        this.switchOutputTab(tabName);
      });
    });

    // Reopen Terminal Button
    const btnReopenTerminal = document.getElementById('btn-toggle-terminal');
    if (btnReopenTerminal) {
      btnReopenTerminal.addEventListener('click', () => this.openTerminal());
    }
  }

  setupViewSwitching() {
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const viewId = item.dataset.view;
        this.switchView(viewId);
        if (window.innerWidth <= 768) {
          this.toggleSidebar(false, true);
        }
      });
    });
  }

  switchView(viewId) {
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewId);
    });

    const targetPanelId = (viewId === 'fields-view' || viewId === 'pasture-view') ? 'view-farm-world' : `view-${viewId}`;

    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === targetPanelId);
    });

    if (targetPanelId === 'view-farm-world') {
      if (this.is3DMode) {
        farm3D.onWindowResize();
        if (viewId === 'fields-view') {
          farm3D.setCameraPreset('plot');
        } else if (viewId === 'pasture-view') {
          farm3D.setCameraPreset('farmer');
        } else {
          farm3D.setCameraPreset('isometric');
        }
      } else {
        farmRenderer.render();
      }
    }

    if (viewId === 'journey-view') {
      this.renderJourneyView();
    }
  }

  switchOutputTab(tabName) {
    document.querySelectorAll('.output-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabName);
    });

    const resPane = document.getElementById('tab-content-results');
    const misPane = document.getElementById('tab-content-mission');
    const hntPane = document.getElementById('tab-content-hints');

    if (resPane) resPane.style.display = tabName === 'results' ? 'block' : 'none';
    if (misPane) misPane.style.display = tabName === 'mission' ? 'block' : 'none';
    if (hntPane) hntPane.style.display = tabName === 'hints' ? 'block' : 'none';
  }

  openTerminal() {
    const term = document.getElementById('floating-sql-terminal');
    const trigger = document.getElementById('btn-toggle-terminal');
    if (term) {
      term.style.display = 'flex';
      term.classList.remove('minimized');
      term.style.zIndex = '600';
    }
    if (trigger) trigger.style.display = 'none';
    const inputEl = document.getElementById('sql-input');
    if (inputEl) inputEl.focus();
  }

  openNotebookModal() {
    const modal = document.getElementById('notebook-modal-overlay');
    const entriesContainer = document.getElementById('notebook-entries');
    const mentorSpeech = document.getElementById('mentor-intro-speech');
    const lvlData = MISSIONS_DATA[gameState.currentLevel];

    if (modal && lvlData && lvlData.storyIntro) {
      if (mentorSpeech) mentorSpeech.textContent = `"${lvlData.storyIntro.text}"`;
      if (entriesContainer && lvlData.storyIntro.notebookEntries) {
        entriesContainer.innerHTML = lvlData.storyIntro.notebookEntries.map(e => `
          <div class="notebook-entry">
            <span class="entry-bullet">✎</span>
            <div>
              <strong style="color: #4E342E;">${e.label}:</strong>
              <span style="color: #6D4C41; margin-left: 6px;">${e.value}</span>
            </div>
          </div>
        `).join('');
      }
      modal.classList.add('active');
    }
  }

  openProfileModal() {
    const modal = document.getElementById('profile-modal-overlay');
    if (!modal) return;

    const roleEl = document.getElementById('profile-modal-role');
    const cashEl = document.getElementById('profile-modal-cash');
    const plotsEl = document.getElementById('profile-modal-plots');
    const waterEl = document.getElementById('profile-modal-water');
    const tablesEl = document.getElementById('profile-modal-tables');
    const badgesEl = document.getElementById('profile-modal-badges');

    const lvlData = MISSIONS_DATA[gameState.currentLevel];
    if (roleEl) roleEl.textContent = `Lvl ${gameState.currentLevel}: ${lvlData ? lvlData.role : 'Farmer'}`;
    if (cashEl) cashEl.textContent = `₹${(gameState.money || 500).toLocaleString()}`;

    // Compute active plots
    const plotsData = (sqlEngine && sqlEngine.isReady) ? (sqlEngine.getTableData('plots') || []) : [];
    const activePlots = plotsData.filter(p => p.status !== 'locked' && p.plot_id && p.plot_id.includes('.')).length;
    if (plotsEl) plotsEl.textContent = `${Math.min(5, Math.ceil(activePlots / 2))} / 5 Plots (${activePlots} Beds)`;

    // Compute water reserves
    const water = simulation.getWaterLevel();
    if (waterEl) waterEl.textContent = `${(water.current || 0).toLocaleString()} L`;

    // Compute table count
    const schema = (sqlEngine && sqlEngine.isReady) ? sqlEngine.getSchema() : {};
    const tableCount = Object.keys(schema).length;
    if (tablesEl) tablesEl.textContent = `${tableCount} Tables`;

    // Badges list
    if (badgesEl) {
      const badges = [];
      for (let i = 1; i <= gameState.currentLevel; i++) {
        const d = MISSIONS_DATA[i];
        if (d && d.completion && d.completion.badge) {
          badges.push(`<span style="background: #E2E8F0; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600;">${d.completion.badge}</span>`);
        }
      }
      if (badges.length === 0) {
        badges.push('<span style="background: #E2E8F0; padding: 4px 8px; border-radius: 6px; font-size: 12px;">🌱 Database Pioneer</span>');
      }
      badgesEl.innerHTML = badges.join('');
    }

    modal.classList.add('active');
    sound.playPlotSelect();
  }

  fullReset() {
    try {
      localStorage.clear();
      gameState.resetAll();
      sqlEngine.reset();
      simulation.initBaselineTables();
      this.activeHintTier = 1;

      // Reset SQL editor input
      const input = document.getElementById('sql-input');
      if (input) {
        input.value = '';
        const lines = document.getElementById('editor-line-numbers');
        if (lines) lines.innerHTML = '1<br>2<br>3';
      }

      // Reset query results tab
      const results = document.getElementById('tab-content-results');
      if (results) {
        results.innerHTML = '<div style="color: #9CA3AF; font-style: italic; padding: 8px;">Run a query above to view results.</div>';
      }

      // Re-render all views and farm canvas
      this.renderGameState();
      this.renderCurrentMission();
      this.renderSchemaTree();
      this.renderDatabaseERD();
      this.renderInventoryView();
      this.renderJourneyView();
      farmRenderer.render();
      if (this.is3DMode) {
        farm3D.syncFromDatabase();
      }
      this.updateDebugPanel();

      // Close celebration or other modals
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));

      // Re-open Grandfather's notebook modal
      this.openNotebookModal();
      this.showToast('🌱 Farm progress reset! Starting fresh from Level 1.', 'success');
      console.log('🔄 FARMDB Game Progress completely reset.');
    } catch (e) {
      console.error('Error during full reset:', e);
    }
  }

  // ==========================================================
  // DEVELOPER DIAGNOSTIC DEBUG PANEL (Requirement 17)
  // ==========================================================
  setupDebugPanel() {
    const btnToggle = document.getElementById('btn-toggle-debug');
    const btnClose = document.getElementById('btn-close-debug');
    const modal = document.getElementById('debug-modal-overlay');
    const btnTestSql = document.getElementById('dbg-btn-test-sql');
    const btnClearStorage = document.getElementById('dbg-btn-clear-storage');

    const toggle = () => {
      if (modal) {
        modal.classList.toggle('active');
        if (modal.classList.contains('active')) {
          this.updateDebugPanel();
        }
      }
    };

    if (btnToggle) btnToggle.addEventListener('click', toggle);
    if (btnClose) btnClose.addEventListener('click', toggle);

    // Press F2 to toggle debug panel anywhere
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'Escape') {
        if (modal && modal.classList.contains('active')) modal.classList.remove('active');
        const nb = document.getElementById('notebook-modal-overlay');
        if (nb && nb.classList.contains('active')) nb.classList.remove('active');
      }
    });

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }

    if (btnTestSql) {
      btnTestSql.addEventListener('click', () => {
        const res = sqlEngine.execute('SELECT 1 AS ping, datetime("now") AS server_time;');
        this.showToast('SQL Ping executed! See Debug panel or results.', 'info');
        this.updateDebugPanel();
      });
    }

    if (btnClearStorage) {
      btnClearStorage.addEventListener('click', () => {
        if (confirm('Clear all localStorage and reload fresh?')) {
          localStorage.clear();
          window.location.reload();
        }
      });
    }
  }

  updateDebugPanel() {
    const dbgSqlite = document.getElementById('dbg-sqlite-status');
    const dbgTables = document.getElementById('dbg-tables-status');
    const dbgState = document.getElementById('dbg-state-status');
    const dbgRenderer = document.getElementById('dbg-renderer-status');
    const dbgMission = document.getElementById('dbg-mission-status');
    const dbgStory = document.getElementById('dbg-story-status');
    const dbgLastSql = document.getElementById('dbg-last-sql');
    const dbgLastResult = document.getElementById('dbg-last-result');
    const dbgLastError = document.getElementById('dbg-last-error');

    if (dbgSqlite) {
      if (sqlEngine.isReady) {
        dbgSqlite.textContent = 'READY (SQLite WASM active)';
        dbgSqlite.style.color = '#16A34A';
      } else if (sqlEngine.initError) {
        dbgSqlite.textContent = `ERROR: ${sqlEngine.initError}`;
        dbgSqlite.style.color = '#DC2626';
      } else {
        dbgSqlite.textContent = 'INITIALIZING...';
        dbgSqlite.style.color = '#D97706';
      }
    }

    if (dbgTables) {
      const schema = sqlEngine.getSchema();
      const tables = Object.keys(schema);
      dbgTables.textContent = tables.length > 0 ? `READY (${tables.join(', ')})` : 'NO USER TABLES';
      dbgTables.style.color = tables.length > 0 ? '#16A34A' : '#D97706';
    }

    if (dbgState) {
      dbgState.textContent = `READY (Lvl ${gameState.currentLevel}, Day ${gameState.day}, Cash ₹${gameState.money}, XP ${gameState.xp})`;
      dbgState.style.color = '#16A34A';
    }

    if (dbgRenderer) {
      const plotCards = document.querySelectorAll('.plot-card').length;
      dbgRenderer.textContent = `READY (${plotCards} plot cards in DOM)`;
      dbgRenderer.style.color = '#16A34A';
    }

    if (dbgMission) {
      const mission = this.getCurrentMissionData();
      dbgMission.textContent = mission ? `READY (${mission.id}: ${mission.title})` : 'LEVEL COMPLETE';
      dbgMission.style.color = '#16A34A';
    }

    if (dbgStory) {
      const lvl = MISSIONS_DATA[gameState.currentLevel];
      dbgStory.textContent = lvl ? `READY (${lvl.title})` : 'READY';
      dbgStory.style.color = '#16A34A';
    }

    if (dbgLastSql) dbgLastSql.textContent = sqlEngine.lastSql || '(none)';
    if (dbgLastResult) dbgLastResult.textContent = sqlEngine.lastResult || '(none)';
    if (dbgLastError) {
      dbgLastError.textContent = sqlEngine.lastError || '(none)';
      dbgLastError.style.color = sqlEngine.lastError && sqlEngine.lastError !== '(none)' ? '#DC2626' : '#16A34A';
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    toast.title = 'Click to dismiss';
    
    // Choose appropriate icon based on content
    let icon = type === 'success' ? '🌱' : type === 'error' ? '⚠️' : 'ℹ️';
    if (message.includes('Kuku-du-ku-ku') || message.includes('Dawn') || message.includes('Morning has arrived')) icon = '🐓';
    else if (message.includes('Mission Complete') || message.includes('🎯')) icon = '🎯';
    else if (message.includes('₹') || message.includes('💰') || message.includes('cash')) icon = '💰';
    else if (message.includes('🚜') || message.includes('harvest')) icon = '🚜';
    else if (message.includes('🔊')) icon = '🔊';
    else if (message.includes('🔇')) icon = '🔇';

    const cleanMsg = message.replace(/^[\u{1F300}-\u{1F9FF}\s]+/u, '').trim();

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-text">${cleanMsg}</div>
      <button class="toast-close-btn" title="Dismiss notification" aria-label="Close">✕</button>
    `;

    let isDismissed = false;
    const dismiss = (e) => {
      if (isDismissed) return;
      isDismissed = true;
      if (e) e.stopPropagation();
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 200);
    };

    // Clicking anywhere on the notification box closes it immediately
    toast.addEventListener('click', dismiss);

    // Auto dismiss after 4 seconds
    setTimeout(dismiss, 4000);

    container.appendChild(toast);
  }
}

// Robust bootstrap supporting both pre- and post-DOMContentLoaded
function startFarmDB() {
  if (!window.farmdb) {
    window.farmdb = new FarmDBApp();
    window.sqlEngine = sqlEngine;
    window.simulation = simulation;
    window.gameState = gameState;
    window.farmRenderer = farmRenderer;
    window.farm3D = farm3D;
    window.farmdb.init();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startFarmDB);
} else {
  startFarmDB();
}

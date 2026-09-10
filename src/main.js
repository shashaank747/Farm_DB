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

class FarmDBApp {
  constructor() {
    this.sqlEngine = sqlEngine;
    this.gameState = gameState;
    this.simulation = simulation;
    this.sound = sound;
    this.loginView = loginView;
    this.activeHintTier = 1;
    this.schemaVisible = true;
    this.isInitialized = false;
  }

  async init() {
    console.log('🌾 Booting FARMDB Engine...');
    if (typeof window !== 'undefined') {
      window.farmdb = this;
    }

    // Check for ?reset or ?clear query param in URL to allow one-click URL reset
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('reset') || urlParams.has('clear')) {
        localStorage.clear();
        gameState.resetAll();
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // 1. Initialize SQLite WebAssembly Engine
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

    // 2. Initialize Simulation & Baseline Tables (Plots, Water Reservoir)
    simulation.initBaselineTables();
    simulation.syncPlotsWithLevel(gameState.currentLevel);

    // 3. Initialize Living Farm Renderer
    farmRenderer.init({
      plotsContainer: document.getElementById('plots-container'),
      waterFill: document.getElementById('water-fill-bar'),
      waterStats: document.getElementById('water-stats-text'),
      pasturePen: document.getElementById('pasture-pen-container'),
      equipmentPad: document.getElementById('equipment-pad-container'),
      warehouseCrates: document.getElementById('warehouse-crates-container'),
      inspectorModal: document.getElementById('plot-inspector-modal')
    });

    // 4. Setup Draggable Floating SQL Terminal Window
    const terminalEl = document.getElementById('floating-sql-terminal');
    const titlebarEl = document.getElementById('terminal-titlebar');
    const resizeHandleEl = document.getElementById('terminal-resize-handle');
    this.terminalController = setupDraggableWindow(terminalEl, titlebarEl, resizeHandleEl);

    // Global hook for live minimized farm report
    window.renderFarmQuickReport = () => this.renderMinimizedFarmReport();

    // Bring terminal to front on click
    if (terminalEl) {
      terminalEl.addEventListener('mousedown', () => {
        terminalEl.style.zIndex = '600';
      });
    }

    // 5. Attach Event Listeners
    this.setupUIEventListeners();
    this.setupSQLEditorListeners();
    this.setupViewSwitching();
    this.setupDebugPanel();

    // 6. Subscribe to Game State & Database Changes
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
    });
    sqlEngine.addChangeListener(() => {
      this.renderSchemaTree();
      this.renderDatabaseERD();
      this.renderInventoryView();
      this.renderMinimizedFarmReport();
      this.updateDebugPanel();
    });

    // 7. Initial Renders
    this.renderGameState();
    this.renderCurrentMission();
    this.renderMinimizedFarmReport();
    this.renderSchemaTree();
    this.renderDatabaseERD();
    this.renderInventoryView();
    this.renderJourneyView();
    this.updateDebugPanel();

    // 8. Start Ambient Day/Night Cycle Progression
    this.startTimeCycleTimer();

    // 9. First-time Opening Cinematic Story Check
    const hasSeenIntro = localStorage.getItem('farmdb_intro_seen');
    if (!hasSeenIntro) {
      this.openNotebookModal();
    }

    // 10. Initialize Living Login View
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

    if (!mission) {
      if (descEl) descEl.innerHTML = `<strong>🎉 ${lvlData ? lvlData.title : 'Level'} Complete!</strong><br>Check the celebration screen to advance!`;
      if (missionTabText) missionTabText.innerHTML = `<div style="color: #15803D; font-weight: bold;">🎉 All tasks for Level ${gameState.currentLevel} are completed!</div>`;
      return;
    }

    if (descEl) {
      descEl.innerHTML = `
        <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">${mission.title}</div>
        <div style="color: #374151; font-size: 12px; margin-bottom: 6px;">${mission.objective}</div>
        <div style="font-size: 11px; color: #6B7280; font-style: italic;">${mission.dialogue}</div>
      `;
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
          animalsVal.textContent = `Barn Empty`;
        }
      }
      if (animalsSub) {
        if (animals.length > 0) {
          const isNight = gameState.timeOfDay === 'night';
          animalsSub.textContent = isNight ? `💤 Sleeping peacefully` : `Grazing • 100% Happy`;
        } else {
          animalsSub.textContent = `Add cows via SQL`;
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
  // SQL EXECUTION & VALIDATION PIPELINE
  // ==========================================================
  executeSQL() {
    const inputEl = document.getElementById('sql-input');
    if (!inputEl) return;
    const sql = inputEl.value;

    const result = sqlEngine.execute(sql);
    this.renderQueryResult(result);
    this.switchOutputTab('results');
    this.updateDebugPanel();

    if (!result.success) {
      sound.playErrorBuzz();
      return;
    }

    sound.playChime();

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
    gameState.addXP(25);

    // Specific in-game consequences per mission
    if (mission.id === 'L2_M2') {
      this.showToast('🌱 Tomato sown in Plot A1! Advance Day to water and grow it.', 'info');
    } else if (mission.id === 'L2_M4') {
      farmRenderer.playHarvestAnimation();
      this.showToast('🚜 Tractor harvested 40kg tomatoes! Added to Warehouse.', 'success');
    } else if (mission.id === 'L2_M5') {
      gameState.addMoney(800);
      sound.playCoin();
      this.showToast('💰 Order fulfilled! Earned ₹800 cash!', 'success');
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
    sound.playHarvestSuccess();
    this.showCelebrationModal(lvlData);
  }

  showCelebrationModal(lvlData) {
    const overlay = document.getElementById('celebration-modal-overlay');
    const badgeEl = document.getElementById('celebration-badge');
    const titleEl = document.getElementById('celebration-title');
    const subtitleEl = document.getElementById('celebration-subtitle');
    const statsGrid = document.getElementById('celebration-stats-grid');
    const unlocksText = document.getElementById('celebration-unlocks-text');

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
        <div class="schema-table-item">
          <div class="schema-table-name" onclick="this.parentElement.classList.toggle('collapsed')">
            <span>📋 <strong>${tblName}</strong></span>
            <span style="font-size: 10px; color: #6B7280;">(${cols.length} cols)</span>
          </div>
          <div class="schema-columns-list">
            ${cols.map(c => `
              <div class="schema-col-item">
                <span>${c.pk ? '🔑' : '•'} ${c.name}</span>
                <span class="col-type">${c.type || 'TEXT'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
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

      let statusBadge = isCompleted ? '✓ Completed' : isCurrent ? '▶ Active' : '🔒 Locked';
      let statusClass = isCompleted ? 'completed' : isCurrent ? 'active' : 'locked';

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
        </div>
      `;
    }

    container.innerHTML = html;
  }

  // ==========================================================
  // EVENT LISTENERS & UI WIRING
  // ==========================================================
  setupUIEventListeners() {
    // Advance Day
    const btnAdvanceDay = document.getElementById('btn-advance-day');
    if (btnAdvanceDay) {
      btnAdvanceDay.addEventListener('click', () => {
        simulation.advanceDay();
        sound.playPhaseTransition('morning', null, true);
        const soundIcon = document.getElementById('sound-icon');
        if (soundIcon && !sound.muted) soundIcon.textContent = '🔊';
        this.showToast(`🌅 Advanced to Day ${gameState.day} • 🐓 "Kuku-du-ku-ku!" Dawn has broken!`, 'success');
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
      });
    }

    // Toggle Sound
    const btnToggleSound = document.getElementById('btn-toggle-sound');
    const soundIcon = document.getElementById('sound-icon');
    if (btnToggleSound) {
      btnToggleSound.addEventListener('click', () => {
        const isSoundOn = sound.toggleMute();
        if (soundIcon) soundIcon.textContent = isSoundOn ? '🔊' : '🔇';
        this.showToast(isSoundOn ? 'Sound effects enabled 🔊' : 'Sound muted 🔇', 'info');
      });
    }

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

    // Next Level Proceed Button from Celebration Modal
    const btnProceed = document.getElementById('btn-proceed-next-level');
    if (btnProceed) {
      btnProceed.addEventListener('click', () => {
        const overlay = document.getElementById('celebration-modal-overlay');
        if (overlay) overlay.classList.remove('active');

        if (gameState.currentLevel === 1) {
          gameState.setLevel(2);
          simulation.syncPlotsWithLevel(2);
          this.showToast('🎉 Welcome to Level 2: First Harvest! Cultivate your crops on Plot A1!', 'success');
          this.openNotebookModal();
        } else if (gameState.currentLevel === 2) {
          this.showToast('🏆 Level 2 Complete! 🔓 Plot A2 is now UNLOCKED for Level 3!', 'success');
          this.switchView('journey-view');
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

    // Open Terminal from Sidebar Mission Card
    const btnOpenFromMission = document.getElementById('btn-open-terminal-from-mission');
    if (btnOpenFromMission) {
      btnOpenFromMission.addEventListener('click', () => this.openTerminal());
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
    window.farmdb.init();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startFarmDB);
} else {
  startFarmDB();
}

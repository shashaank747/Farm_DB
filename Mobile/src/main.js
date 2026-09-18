/**
 * FARMDB Mobile Application Controller (Full Desktop 3D Visual Engine)
 * Features the complete 3D living world, touch controls & virtual keyboard adaptation
 */

import { sqlEngine } from './sql/engine.js';
import { gameState } from './game/state.js';
import { simulation } from './game/simulation.js';
import { MISSIONS_DATA } from './game/missions.js';
import { farm3D } from './visuals/farm3D.js';
import { sound } from './visuals/audio.js';

class MobileApp {
  constructor() {
    this.activeTab = 'editor';
    this.currentLevelData = MISSIONS_DATA[1];
  }

  async start() {
    console.log('🚀 Booting FARMDB Mobile (Full 3D Engine)...');
    const yieldToMain = () => new Promise(resolve => setTimeout(resolve, 0));

    // Phase 0: Setup UI and render HUD instantly (0ms FCP/LCP)
    this.setupUI();
    this.setupVirtualKeyboardDetection();
    this.setupOrientationHandling();
    this.updateHUD();
    this.renderMissionInfo();

    await yieldToMain();

    // Phase 1: Initialize SQLite WASM
    await sqlEngine.init();
    simulation.initBaselineTables();
    simulation.syncPlotsWithLevel(gameState.currentLevel || 1);

    await yieldToMain();

    // Phase 2: Initialize 3D Living Farm
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
      farm3D.init(canvasContainer);
      farm3D.setCameraPreset('isometric', false);
      farm3D.syncLightingAndTime();
      farm3D.syncFromDatabase();
    }

    await yieldToMain();

    // Phase 3: Event Subscriptions & Global handles
    sqlEngine.addChangeListener(() => {
      if (farm3D) {
        farm3D.syncFromDatabase();
      }
      this.updateHUD();
    });

    gameState.addListener(() => {
      if (farm3D) {
        farm3D.syncLightingAndTime();
        farm3D.syncFromDatabase();
      }
      this.updateHUD();
      this.renderMissionInfo();
    });

    window.sqlEngine = sqlEngine;
    window.gameState = gameState;
    window.sound = sound;
    window.farm3D = farm3D;
    window.simulation = simulation;

    console.log('🌾 FARMDB Mobile 3D World Ready!');
  }

  setupUI() {
    const inputArea = document.getElementById('sql-input');
    const btnExecute = document.getElementById('btn-execute');
    const btnClear = document.getElementById('btn-clear');
    const btnDismissKb = document.getElementById('btn-dismiss-kb');
    const modalBriefing = document.getElementById('modal-briefing');
    const btnOpenBriefing = document.getElementById('btn-open-briefing');
    const btnOpenBriefing2 = document.getElementById('btn-open-briefing-2');
    const btnCloseBriefing = document.getElementById('btn-close-briefing');

    // Run SQL Button
    if (btnExecute) {
      btnExecute.addEventListener('click', () => {
        this.runQuery();
      });
    }

    // Clear Button
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        sound.init();
        if (inputArea) {
          inputArea.value = '';
          inputArea.focus();
        }
      });
    }

    // Dismiss Keyboard Button
    if (btnDismissKb) {
      btnDismissKb.addEventListener('click', () => {
        if (inputArea) inputArea.blur();
        document.body.classList.remove('keyboard-open');
        this.triggerCanvasResize();
      });
    }

    // Briefing Modal
    const openModal = () => {
      sound.init();
      if (modalBriefing) modalBriefing.classList.add('open');
    };
    if (btnOpenBriefing) btnOpenBriefing.addEventListener('click', openModal);
    if (btnOpenBriefing2) btnOpenBriefing2.addEventListener('click', openModal);
    if (btnCloseBriefing && modalBriefing) {
      btnCloseBriefing.addEventListener('click', () => {
        sound.init();
        modalBriefing.classList.remove('open');
      });
    }

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sound.init();
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Quick SQL Chips
    document.querySelectorAll('.chip-btn').forEach(chip => {
      chip.addEventListener('click', () => {
        sound.init();
        const snippet = chip.dataset.insert;
        if (!snippet || !inputArea) return;

        if (chip.classList.contains('query-template')) {
          inputArea.value = snippet;
        } else {
          const val = inputArea.value;
          inputArea.value = val ? `${val.trimEnd()} ${snippet}` : snippet;
        }
        inputArea.focus();
      });
    });
  }

  runQuery() {
    const inputArea = document.getElementById('sql-input');
    const sql = inputArea ? inputArea.value.trim() : '';
    if (!sql) return;

    sound.init();
    sound.unmute();

    let result;
    try {
      result = sqlEngine.execute(sql);
    } catch (e) {
      result = { error: e.message };
    }

    const statusBanner = document.getElementById('result-status');
    const tableContainer = document.getElementById('result-table-wrap');

    if (result && result.error) {
      if (sound.playBuzzer) sound.playBuzzer();
      if (statusBanner) {
        statusBanner.className = 'result-status-banner error';
        statusBanner.innerHTML = `⚠️ <b>SQL Error:</b> ${result.error}`;
      }
      if (tableContainer) tableContainer.innerHTML = '';
      this.switchTab('results');
    } else {
      if (sound.playChime) sound.playChime();
      if (statusBanner) {
        statusBanner.className = 'result-status-banner success';
        statusBanner.innerHTML = `✅ Query executed successfully.`;
      }

      // Check if crops or plots were affected and trigger animations
      const norm = sql.toLowerCase();
      if (norm.includes('insert') || norm.includes('update')) {
        if (norm.includes('crop') || norm.includes('wheat') || norm.includes('farming')) {
          if (farm3D.playFarmerPlantAnimation) farm3D.playFarmerPlantAnimation('A1.1');
        }
        if (norm.includes('tractor') || norm.includes('equipment')) {
          if (farm3D.playTruckDeliveryAnimation) farm3D.playTruckDeliveryAnimation('Equipment');
        }
      }

      // Render Result Table
      if (tableContainer) {
        this.renderResultTable(result.columns, result.values, tableContainer);
      }

      this.switchTab('results');
    }
  }

  renderResultTable(columns, values, container) {
    if (!columns || columns.length === 0) {
      container.innerHTML = '<p style="font-size:12px;color:#78909C;padding:12px 0;">Executed successfully. No rows returned.</p>';
      return;
    }

    let html = '<div class="table-scroller"><table class="mobile-data-table"><thead><tr>';
    columns.forEach(col => {
      html += `<th>${col}</th>`;
    });
    html += '</tr></thead><tbody>';

    values.forEach(row => {
      html += '<tr>';
      row.forEach(cell => {
        html += `<td>${cell !== null ? cell : '<i>NULL</i>'}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
  }

  renderMissionInfo() {
    const missionDesc = document.getElementById('mission-desc');
    if (missionDesc && this.currentLevelData) {
      missionDesc.textContent = `${this.currentLevelData.title}: ${this.currentLevelData.concept}`;
    }

    // Render task cards in the Tasks tab
    const taskContainer = document.getElementById('task-cards-list');
    if (taskContainer && this.currentLevelData && this.currentLevelData.missions) {
      let html = '';
      this.currentLevelData.missions.forEach(m => {
        const isDone = gameState.completedMissions && gameState.completedMissions.includes(m.id);
        html += `
          <div class="task-card ${isDone ? 'done' : ''}">
            <div class="task-checkbox">${isDone ? '✓' : ''}</div>
            <div class="task-info">
              <h4>${m.title}</h4>
              <p>${m.instruction || m.concept || ''}</p>
              <code style="display:block;margin-top:4px;font-size:10px;color:#FFD54F;">${m.starterQuery || ''}</code>
            </div>
          </div>
        `;
      });
      taskContainer.innerHTML = html;
    }
  }

  updateHUD() {
    const elCoins = document.getElementById('hud-coins');
    const elWater = document.getElementById('hud-water');
    if (elCoins) elCoins.textContent = gameState.money || 500;

    // Get current water from water_reservoir table
    try {
      const waterData = sqlEngine.getTableData('water_reservoir');
      if (waterData && waterData.length > 0 && elWater) {
        elWater.textContent = `${Math.round(waterData[0].current_liters / 1000)}k`;
      }
    } catch (e) {}
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `tab-${tabName}`);
    });
  }

  /**
   * Android Onscreen Keyboard Detection
   */
  setupVirtualKeyboardDetection() {
    const inputArea = document.getElementById('sql-input');

    if (window.visualViewport) {
      const baseHeight = window.visualViewport.height;

      window.visualViewport.addEventListener('resize', () => {
        const currentH = window.visualViewport.height;
        const isKeyboard = currentH < (baseHeight * 0.75);

        if (isKeyboard) {
          document.body.classList.add('keyboard-open');
        } else {
          document.body.classList.remove('keyboard-open');
        }
        this.triggerCanvasResize();
      });
    }

    if (inputArea) {
      inputArea.addEventListener('focus', () => {
        document.body.classList.add('keyboard-open');
        this.triggerCanvasResize();
      });

      inputArea.addEventListener('blur', () => {
        setTimeout(() => {
          document.body.classList.remove('keyboard-open');
          this.triggerCanvasResize();
        }, 150);
      });
    }
  }

  setupOrientationHandling() {
    const onResize = () => {
      this.triggerCanvasResize();
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(onResize, 200);
    });
  }

  triggerCanvasResize() {
    setTimeout(() => {
      if (farm3D && farm3D.onWindowResize) {
        farm3D.onWindowResize();
      }
    }, 100);
  }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  const app = new MobileApp();
  app.start();
  window.farmdbMobile = app;
});

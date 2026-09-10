/**
 * FARMDB Living Farm World Visual Renderer
 * Synchronizes SQLite database state directly with interactive visual elements & animations.
 */

import { sqlEngine } from '../sql/engine.js';
import { gameState } from '../game/state.js';
import { simulation } from '../game/simulation.js';
import { sound } from './audio.js';

class FarmRenderer {
  constructor() {
    this.plotsContainer = null;
    this.waterFillEl = null;
    this.waterStatsEl = null;
    this.pasturePenEl = null;
    this.equipmentPadEl = null;
    this.warehouseCratesEl = null;
    this.inspectorModal = null;
    this.starsLayerEl = null;
    this.firefliesLayerEl = null;
    this.selectedPlot = null;
  }

  init(domElements) {
    this.plotsContainer = domElements.plotsContainer;
    this.waterFillEl = domElements.waterFill;
    this.waterStatsEl = domElements.waterStats;
    this.pasturePenEl = domElements.pasturePen;
    this.equipmentPadEl = domElements.equipmentPad;
    this.warehouseCratesEl = domElements.warehouseCrates;
    this.inspectorModal = domElements.inspectorModal;
    this.starsLayerEl = domElements.starsLayer || document.getElementById('stars-layer');
    this.firefliesLayerEl = domElements.firefliesLayer || document.getElementById('fireflies-layer');

    // Populate ambient night stars and fireflies once
    this.populateStarfield();
    this.populateFireflies();

    // Enable tactile mouse ripple effect on water reservoir
    this.setupWaterRipple();

    // Listen to all database mutations to re-render world
    sqlEngine.addChangeListener(() => {
      this.render();
    });

    this.render();
  }

  setupWaterRipple() {
    const tank = document.querySelector('.reservoir-tank-visual');
    if (!tank) return;

    tank.title = 'Click to create ripples in the water reservoir!';

    tank.addEventListener('click', (e) => {
      const rect = tank.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Spawn concentric expanding water ripples
      this.createRipple(tank, x, y);
      setTimeout(() => this.createRipple(tank, x, y), 120);
      setTimeout(() => this.createRipple(tank, x, y), 240);

      // Splash the wave surface
      const wave = tank.querySelector('.water-wave');
      if (wave) {
        wave.classList.add('wave-splash');
        setTimeout(() => wave.classList.remove('wave-splash'), 600);
      }

      // Play procedural water droplet audio
      sound.playWaterPlop();
    });
  }

  createRipple(container, x, y) {
    const ripple = document.createElement('span');
    ripple.className = 'water-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    container.appendChild(ripple);
    setTimeout(() => {
      if (ripple.parentElement) ripple.remove();
    }, 900);
  }

  populateStarfield() {
    if (!this.starsLayerEl) return;
    this.starsLayerEl.innerHTML = '';
    const starCount = 42;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const size = Math.random() < 0.25 ? 3 : Math.random() < 0.7 ? 2 : 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.top = `${Math.random() * 95}%`;
      star.style.left = `${Math.random() * 98}%`;
      star.style.animationDelay = `${(Math.random() * 3).toFixed(2)}s`;
      star.style.animationDuration = `${(2.2 + Math.random() * 2.8).toFixed(2)}s`;
      this.starsLayerEl.appendChild(star);
    }
  }

  populateFireflies() {
    if (!this.firefliesLayerEl) return;
    this.firefliesLayerEl.innerHTML = '';
    const count = 14;
    for (let i = 0; i < count; i++) {
      const fly = document.createElement('div');
      fly.className = 'firefly';
      fly.style.top = `${25 + Math.random() * 65}%`;
      fly.style.left = `${5 + Math.random() * 90}%`;
      fly.style.animationDelay = `${(Math.random() * 4).toFixed(2)}s`;
      fly.style.animationDuration = `${(4.5 + Math.random() * 3.5).toFixed(2)}s`;
      this.firefliesLayerEl.appendChild(fly);
    }
  }

  render() {
    this.renderPlots();
    this.renderWaterReservoir();
    this.renderAnimals();
    this.renderEquipment();
    this.renderWarehouse();
  }

  /**
   * 1. Render Farming Plots (A1 - A5) with 5 progressive growth stages
   */
  renderPlots() {
    if (!this.plotsContainer) return;

    const plots = sqlEngine.getTableData('plots') || [];
    const farming = sqlEngine.getTableData('farming') || [];

    this.plotsContainer.innerHTML = '';

    const columns = ['A1', 'A2', 'A3', 'A4', 'A5'];

    columns.forEach((col, colIdx) => {
      const unlockLevel = colIdx === 0 ? 1 : colIdx + 2;
      const isColLocked = gameState.currentLevel < unlockLevel;

      // Sub-plots for this column (e.g. A1.1 and A1.2)
      const sub1Id = `${col}.1`;
      const sub2Id = `${col}.2`;

      const plotRecord1 = plots.find(p => p.plot_id === sub1Id) || { plot_id: sub1Id, status: isColLocked ? 'locked' : 'available' };
      const plotRecord2 = plots.find(p => p.plot_id === sub2Id) || { plot_id: sub2Id, status: isColLocked ? 'locked' : 'available' };

      // Filter active growing crops
      const colFarming = farming.filter(f => f.status === 'growing');
      let crop1 = colFarming.find(f => f.plot_id === sub1Id);
      let crop2 = colFarming.find(f => f.plot_id === sub2Id);

      // Support generic crops planted with parent ID (e.g. 'A1')
      const genericCrops = colFarming.filter(f => f.plot_id === col);
      if (!crop1 && genericCrops.length > 0) crop1 = genericCrops[0];
      if (!crop2 && genericCrops.length > 1) crop2 = genericCrops[1];

      const colCard = document.createElement('div');
      colCard.className = `plot-card ${isColLocked ? 'locked' : ''}`;
      colCard.dataset.colId = col;
      colCard.dataset.plotId = col;

      // Column Header
      const colHeader = document.createElement('div');
      colHeader.className = 'plot-card-header';
      colHeader.innerHTML = `
        <span class="plot-col-tag">${col}</span>
        <span class="plot-col-badge ${isColLocked ? 'locked' : 'available'}">${isColLocked ? '🔒 Locked' : '2 Beds'}</span>
      `;
      colCard.appendChild(colHeader);

      // Sub-beds container
      const subBedsContainer = document.createElement('div');
      subBedsContainer.className = 'plot-sub-beds';

      // Helper to build a sub-bed element
      const buildSubBed = (subPlot, activeCrop) => {
        const isSubLocked = isColLocked || subPlot.status === 'locked';
        const subCard = document.createElement('div');
        subCard.className = `sub-bed-card ${this.selectedPlot === subPlot.plot_id ? 'selected' : ''} ${isSubLocked ? 'locked' : ''}`;
        subCard.dataset.plotId = subPlot.plot_id;

        if (isSubLocked) {
          subCard.innerHTML = `
            <div class="sub-bed-header">
              <span class="sub-bed-tag">${subPlot.plot_id}</span>
              <span class="sub-bed-status locked">🔒 Locked</span>
            </div>
            <div class="plot-soil sub-soil">
              <div class="locked-soil-content">
                <span class="locked-padlock">🔒</span>
                <span class="locked-level-pill">Level ${unlockLevel}</span>
              </div>
            </div>
            <div class="crop-meta-text" style="font-size: 8.5px; color: #6B7280; font-weight: 700;">Unlocks at Level ${unlockLevel}</div>
          `;

          subCard.title = `Plot ${subPlot.plot_id} is locked. Reach Level ${unlockLevel} to unlock!`;
          subCard.addEventListener('click', (e) => {
            e.stopPropagation();
            colCard.classList.remove('shake-card');
            void colCard.offsetWidth;
            colCard.classList.add('shake-card');
            sound.playBirdChirp();
            if (window.farmdb && window.farmdb.showToast) {
              window.farmdb.showToast(`🔒 Plot ${col} is locked! Reach Level ${unlockLevel} to unlock and cultivate this land.`, 'warning');
            }
          });
        } else {
          let cropIcon = '';
          let stageText = 'Empty Bed';
          let growthPct = 0;
          let statusClass = 'available';
          let statusLabel = 'Available';

          if (activeCrop) {
            growthPct = activeCrop.growth_percent || 0;
            statusClass = growthPct >= 100 ? 'ready' : 'occupied';
            statusLabel = growthPct >= 100 ? 'Ready!' : 'Growing';

            const cropName = (activeCrop.crop_id || '').toLowerCase();
            const isWheat = cropName.includes('wheat');
            const isRice = cropName.includes('rice');

            if (growthPct === 0) {
              cropIcon = '🌱';
              stageText = 'Sprouting';
            } else if (growthPct <= 30) {
              cropIcon = '🌱';
              stageText = 'Sprout';
            } else if (growthPct <= 60) {
              cropIcon = '🌿';
              stageText = 'Growing';
            } else if (growthPct <= 90) {
              cropIcon = isWheat ? '🌾' : (isRice ? '🌾' : '🪴');
              stageText = 'Flowering';
            } else {
              cropIcon = isWheat ? '🌾' : (isRice ? '🌾' : '🍅');
              stageText = isWheat ? 'Ripe Wheat!' : (isRice ? 'Ripe Rice!' : 'Ripe Tomatoes!');
            }
          }

          subCard.innerHTML = `
            <div class="sub-bed-header">
              <span class="sub-bed-tag">${subPlot.plot_id}</span>
              <span class="sub-bed-status ${statusClass}">${statusLabel}</span>
            </div>
            <div class="plot-soil sub-soil">
              ${cropIcon ? `<div class="crop-visual sub-crop">${cropIcon}</div>` : `<div style="opacity:0.25; font-size:16px;">🕳️</div>`}
            </div>
            ${activeCrop ? `
              <div class="crop-growth-bar">
                <div class="crop-growth-fill" style="width: ${growthPct}%"></div>
              </div>
              <div class="crop-meta-text" style="font-size: 8.5px; font-weight: 700;">${stageText} (${growthPct}%)</div>
            ` : `
              <div class="crop-meta-text" style="font-size: 8.5px; color: #A08C82;">0.5 Acre Soil</div>
            `}
          `;

          subCard.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openPlotInspector(subPlot, activeCrop);
          });
        }

        return subCard;
      };

      subBedsContainer.appendChild(buildSubBed(plotRecord1, crop1));
      subBedsContainer.appendChild(buildSubBed(plotRecord2, crop2));
      colCard.appendChild(subBedsContainer);

      this.plotsContainer.appendChild(colCard);
    });
  }

  /**
   * 2. Render Water Reservoir gauge and liters counter
   */
  renderWaterReservoir() {
    if (!this.waterFillEl || !this.waterStatsEl) return;
    const water = simulation.getWaterLevel();
    const pct = Math.max(0, Math.min(100, Math.round((water.current / water.capacity) * 100)));

    this.waterFillEl.style.height = `${pct}%`;
    this.waterStatsEl.innerHTML = `
      <span>${water.current.toLocaleString()} L</span>
      <span style="color:#64748B;">/ ${water.capacity.toLocaleString()} L</span>
    `;
  }

  /**
   * 3. Render Pasture Barn & Animated Cows
   */
  renderAnimals() {
    if (!this.pasturePenEl) return;
    const animals = sqlEngine.getTableData('animals');

    if (!animals || animals.length === 0) {
      this.pasturePenEl.innerHTML = `
        <div style="font-size: 11px; color: #15803D; font-weight:600; opacity: 0.6; text-align:center;">
          Barn is empty.<br>Add cows via FARMDB!
        </div>
      `;
      return;
    }

    this.pasturePenEl.innerHTML = '';
    animals.forEach((animal, i) => {
      const cowEl = document.createElement('div');
      const isNight = gameState.timeOfDay === 'night';
      cowEl.className = `animal-cow ${isNight ? 'sleeping' : ''}`;
      cowEl.style.animationDelay = `${i * 0.7}s`;
      const emoji = animal.animal_type === 'Chicken' ? '🐔' : '🐄';
      cowEl.innerHTML = isNight ? `${emoji}<span class="sleep-bubble">💤</span>` : emoji;
      cowEl.title = `${animal.name || 'Cow'} (${animal.health || 'Healthy'})${isNight ? ' - Sleeping peacefully' : ''}`;
      cowEl.addEventListener('click', () => {
        sound.playBirdChirp();
      });
      this.pasturePenEl.appendChild(cowEl);
    });
  }

  /**
   * 4. Render Equipment Yard & Old Tractor
   */
  renderEquipment() {
    if (!this.equipmentPadEl) return;
    const equip = sqlEngine.getTableData('equipment');

    if (!equip || equip.length === 0) {
      this.equipmentPadEl.innerHTML = `
        <div style="font-size: 11px; color: #6B7280; font-weight:600; text-align:center;">
          No equipment registered yet.
        </div>
      `;
      return;
    }

    this.equipmentPadEl.innerHTML = `
      <div id="tractor-vehicle" class="tractor-sprite" title="Old Red (Operational Tractor)">🚜</div>
    `;
  }

  /**
   * Trigger Scripted Harvest Drive Animation
   */
  playHarvestAnimation() {
    const tractor = document.getElementById('tractor-vehicle');
    if (tractor) {
      sound.playTractorMotor(3.5);
      tractor.classList.add('tractor-harvesting');
      setTimeout(() => {
        tractor.classList.remove('tractor-harvesting');
      }, 3500);
    }
  }

  /**
   * 5. Render Warehouse Crates (Seeds and Harvested Stock)
   */
  renderWarehouse() {
    if (!this.warehouseCratesEl) return;
    const seeds = sqlEngine.getTableData('seeds');
    const stock = sqlEngine.getTableData('stock');

    this.warehouseCratesEl.innerHTML = '';

    // Render Seeds (deduplicated by seed_name so multiple runs do not pile duplicate crates)
    const seedMap = new Map();
    if (seeds && seeds.length > 0) {
      seeds.forEach(s => {
        const name = (s.seed_name || '').trim();
        if (!name) return;
        const key = name.toLowerCase();
        if (!seedMap.has(key)) {
          seedMap.set(key, { ...s });
        } else {
          const existing = seedMap.get(key);
          existing.quantity = Math.max(existing.quantity, s.quantity || 0);
        }
      });
    }

    seedMap.forEach(s => {
      const icon = (s.seed_name || '').toLowerCase().includes('tomato') ? '🍅' : 
                   (s.seed_name || '').toLowerCase().includes('rice') ? '🌾' : '🌾';
      const crate = document.createElement('div');
      crate.className = 'crate-item';
      crate.innerHTML = `
        <span class="crate-icon">${icon}</span>
        <div>${s.seed_name}</div>
        <div class="crate-qty">${s.quantity} seeds</div>
      `;
      this.warehouseCratesEl.appendChild(crate);
    });

    // Render Harvested Stock (deduplicated by product_name)
    const stockMap = new Map();
    if (stock && stock.length > 0) {
      stock.forEach(st => {
        const name = (st.product_name || '').trim();
        if (!name) return;
        const key = name.toLowerCase();
        if (!stockMap.has(key)) {
          stockMap.set(key, { ...st });
        } else {
          const existing = stockMap.get(key);
          existing.quantity = (existing.quantity || 0) + (st.quantity || 0);
        }
      });
    }

    stockMap.forEach(st => {
      const crate = document.createElement('div');
      crate.className = 'crate-item';
      crate.style.background = '#DCFCE7';
      crate.style.borderColor = '#86EFAC';
      crate.innerHTML = `
        <span class="crate-icon">📦</span>
        <div>${st.product_name}</div>
        <div class="crate-qty" style="color:#15803D;">${st.quantity} ${st.unit || 'kg'}</div>
      `;
      this.warehouseCratesEl.appendChild(crate);
    });

    if (seedMap.size === 0 && stockMap.size === 0) {
      this.warehouseCratesEl.innerHTML = `
        <div style="grid-column: 1/-1; font-size:11px; color:#8D6E63; font-weight:600; text-align:center;">
          Storage is empty.<br>Record seeds via SQL!
        </div>
      `;
    }
  }

  /**
   * Plot Inspector Popover Card
   */
  openPlotInspector(plot, activeCrop) {
    if (!this.inspectorModal) return;
    this.selectedPlot = plot.plot_id;
    this.renderPlots();

    const titleEl = document.getElementById('inspector-plot-id');
    const cropEl = document.getElementById('inspector-crop');
    const statusEl = document.getElementById('inspector-status');
    const growthEl = document.getElementById('inspector-growth');
    const yieldEl = document.getElementById('inspector-yield');
    const waterEl = document.getElementById('inspector-water');

    if (titleEl) titleEl.textContent = `Plot ${plot.plot_id}`;
    if (cropEl) cropEl.textContent = activeCrop ? activeCrop.crop_id : 'None (Empty Soil)';
    if (statusEl) statusEl.textContent = activeCrop ? (activeCrop.growth_percent >= 100 ? 'Ready for Harvest' : 'Growing') : 'Available';
    if (growthEl) growthEl.textContent = activeCrop ? `${activeCrop.growth_percent}%` : '0%';
    if (yieldEl) yieldEl.textContent = activeCrop ? (activeCrop.growth_percent >= 100 ? '40 kg' : 'Est. 40 kg') : '0 kg';
    if (waterEl) waterEl.textContent = activeCrop ? '400 L / day' : '0 L';

    this.inspectorModal.classList.add('active');
  }

  closePlotInspector() {
    if (this.inspectorModal) {
      this.inspectorModal.classList.remove('active');
    }
    this.selectedPlot = null;
    this.renderPlots();
  }
}

export const farmRenderer = new FarmRenderer();

/**
 * FARMDB Simulation Engine
 * Manages in-game time advancement, deterministic crop growth, dynamic sub-bed water consumption,
 * and drought crisis lifecycle.
 */

import { sqlEngine } from '../sql/engine.js';
import { gameState } from './state.js';
import { sound } from '../visuals/audio.js';

export const CROP_GROWTH_RATES = {
  tomato: 34, // 0 -> 34 -> 68 -> 100 (3 days)
  wheat: 50,  // 0 -> 50 -> 100 (2 days)
  rice: 25,   // 0 -> 25 -> 50 -> 75 -> 100 (4 days)
  corn: 34,   // 0 -> 34 -> 68 -> 100 (3 days)
  default: 34
};

export const WATER_CONSUMPTION_PER_SUB_BED = 200; // 200L / active growing sub-bed / day

export class SimulationEngine {
  constructor() {
    this.columns = ['A1', 'A2', 'A3', 'A4', 'A5'];
    // Sub-plots: 2 sub-beds per plot column (A1.1 & A1.2, A2.1 & A2.2, etc.)
    this.plots = [
      { plot_id: 'A1.1', parent_id: 'A1', sub_index: 1, plot_name: 'Plot A1.1 (North Bed)', size: '0.5 acre', unlockLevel: 1 },
      { plot_id: 'A1.2', parent_id: 'A1', sub_index: 2, plot_name: 'Plot A1.2 (South Bed)', size: '0.5 acre', unlockLevel: 1 },
      { plot_id: 'A2.1', parent_id: 'A2', sub_index: 1, plot_name: 'Plot A2.1 (North Bed)', size: '0.5 acre', unlockLevel: 3 },
      { plot_id: 'A2.2', parent_id: 'A2', sub_index: 2, plot_name: 'Plot A2.2 (South Bed)', size: '0.5 acre', unlockLevel: 3 },
      { plot_id: 'A3.1', parent_id: 'A3', sub_index: 1, plot_name: 'Plot A3.1 (North Bed)', size: '0.5 acre', unlockLevel: 4 },
      { plot_id: 'A3.2', parent_id: 'A3', sub_index: 2, plot_name: 'Plot A3.2 (South Bed)', size: '0.5 acre', unlockLevel: 4 },
      { plot_id: 'A4.1', parent_id: 'A4', sub_index: 1, plot_name: 'Plot A4.1 (North Bed)', size: '0.5 acre', unlockLevel: 5 },
      { plot_id: 'A4.2', parent_id: 'A4', sub_index: 2, plot_name: 'Plot A4.2 (South Bed)', size: '0.5 acre', unlockLevel: 5 },
      { plot_id: 'A5.1', parent_id: 'A5', sub_index: 1, plot_name: 'Plot A5.1 (North Bed)', size: '0.5 acre', unlockLevel: 6 },
      { plot_id: 'A5.2', parent_id: 'A5', sub_index: 2, plot_name: 'Plot A5.2 (South Bed)', size: '0.5 acre', unlockLevel: 6 }
    ];
  }

  /**
   * Seed baseline environment tables (plots & water reservoir)
   */
  initBaselineTables(engine = sqlEngine) {
    if (!engine || !engine.isReady) return;

    try {
      // Plots table
      engine.execute(`
        CREATE TABLE IF NOT EXISTS plots (
          plot_id TEXT PRIMARY KEY,
          plot_name TEXT NOT NULL,
          size TEXT NOT NULL,
          status TEXT DEFAULT 'available'
        );
      `);

      const existingPlots = engine.getTableData('plots');
      const hasSubPlots = existingPlots && existingPlots.some(p => p.plot_id && p.plot_id.includes('.'));

      if (!existingPlots || existingPlots.length === 0 || !hasSubPlots) {
        // Seed divided sub-plots (A1.1, A1.2, etc.)
        this.plots.forEach(p => {
          const isUnlocked = p.unlockLevel <= gameState.currentLevel;
          const status = isUnlocked ? 'available' : 'locked';
          engine.execute(`
            INSERT OR REPLACE INTO plots (plot_id, plot_name, size, status)
            VALUES ('${p.plot_id}', '${p.plot_name}', '${p.size}', '${status}');
          `);
        });

        // Also seed parent plot identifiers (A1-A5) for full query backward compatibility
        this.columns.forEach((col, idx) => {
          const colUnlockLevel = idx === 0 ? 1 : idx + 2;
          const isUnlocked = colUnlockLevel <= gameState.currentLevel;
          const status = isUnlocked ? 'available' : 'locked';
          engine.execute(`
            INSERT OR REPLACE INTO plots (plot_id, plot_name, size, status)
            VALUES ('${col}', 'Plot ${col} (Full Field)', '1 acre', '${status}');
          `);
        });
      } else {
        this.syncPlotsWithLevel(gameState.currentLevel, engine);
      }

      // Water Reservoir table with full schema aliases for universal query compatibility
      engine.execute(`
        CREATE TABLE IF NOT EXISTS water_reservoir (
          reservoir_id INTEGER PRIMARY KEY,
          name TEXT,
          capacity_liters INTEGER,
          max_capacity INTEGER,
          current_liters INTEGER,
          daily_recharge INTEGER,
          last_updated TEXT
        );
      `);

      const existingWater = engine.getTableData('water_reservoir');
      if (existingWater.length === 0) {
        engine.execute(`
          INSERT INTO water_reservoir (reservoir_id, name, capacity_liters, max_capacity, current_liters, daily_recharge, last_updated)
          VALUES (1, 'Main Farm Reservoir', 100000, 100000, 65000, 3000, date('now'));
        `);
      }
    } catch (e) {
      console.error('Error seeding baseline tables:', e);
    }
  }

  /**
   * Synchronize plots status based on current game level
   */
  syncPlotsWithLevel(level = gameState.currentLevel, engine = sqlEngine) {
    if (!engine || !engine.isReady) return;

    try {
      this.plots.forEach(p => {
        const isUnlocked = p.unlockLevel <= level;
        if (isUnlocked) {
          engine.execute(`
            UPDATE plots 
            SET status = 'available' 
            WHERE plot_id = '${p.plot_id}' AND status = 'locked';
          `);
        } else {
          const farming = engine.getTableData('farming');
          const isGrowing = farming && farming.some(f => f.plot_id === p.plot_id && f.status !== 'harvested' && f.stage !== 'Harvested');
          if (!isGrowing) {
            engine.execute(`
              UPDATE plots 
              SET status = 'locked' 
              WHERE plot_id = '${p.plot_id}' AND status = 'available';
            `);
          }
        }
      });

      this.columns.forEach((col, idx) => {
        const colUnlockLevel = idx === 0 ? 1 : idx + 2;
        const isUnlocked = colUnlockLevel <= level;
        if (isUnlocked) {
          engine.execute(`
            UPDATE plots 
            SET status = 'available' 
            WHERE plot_id = '${col}' AND status = 'locked';
          `);
        } else {
          const farming = engine.getTableData('farming');
          const isGrowing = farming && farming.some(f => f.plot_id === col && f.status !== 'harvested' && f.stage !== 'Harvested');
          if (!isGrowing) {
            engine.execute(`
              UPDATE plots 
              SET status = 'locked' 
              WHERE plot_id = '${col}' AND status = 'available';
            `);
          }
        }
      });
    } catch (e) {
      console.error('Error syncing plots with level:', e);
    }
  }

  /**
   * Initialize Level 10 Drought Crisis Mode (Safe and Idempotent)
   */
  initDroughtMode(engine = sqlEngine) {
    if (!engine || !engine.isReady) return false;
    if (gameState.droughtInitialized) return false;

    try {
      engine.execute(`
        UPDATE water_reservoir 
        SET current_liters = 18000, daily_recharge = 0, last_updated = date('now')
        WHERE reservoir_id = 1;
      `);
      gameState.droughtInitialized = true;
      gameState.notify();
      return true;
    } catch (e) {
      console.error('Error initializing drought mode:', e);
      return false;
    }
  }

  /**
   * Resolve Level 10 Grand Victory Drought Resolution (Idempotent)
   */
  resolveDroughtMode(engine = sqlEngine) {
    if (!engine || !engine.isReady) return false;
    try {
      engine.execute(`
        UPDATE water_reservoir 
        SET current_liters = 65000, daily_recharge = 5000, last_updated = date('now')
        WHERE reservoir_id = 1;
      `);
      return true;
    } catch (e) {
      console.error('Error resolving drought mode:', e);
      return false;
    }
  }

  /**
   * Advance day: deterministic crop growth, sub-bed dynamic water consumption
   * @param {Object} engine - Optional sqlEngine instance for headless testing
   * @returns {Object} { day, activeCrops, waterConsumed, growthAdvanced, currentWater }
   */
  advanceDay(engine = sqlEngine) {
    const currentDay = gameState.advanceDay();
    if (sound && typeof sound.playChime === 'function') {
      sound.playChime();
    }

    if (!engine || !engine.isReady) {
      return { day: currentDay, activeCrops: 0, waterConsumed: 0, growthAdvanced: false, currentWater: 0 };
    }

    try {
      // 1. Inspect farming table for active growing crops
      const farmingData = engine.getTableData('farming');
      const activeGrowingCrops = (farmingData || []).filter(f => {
        const stage = (f.stage || f.status || '').toLowerCase();
        const growth = Number(f.growth_percent ?? f.growth_pct ?? 0);
        return stage !== 'harvested' && growth < 100;
      });

      // 2. Inspect water reservoir
      const waterData = engine.getTableData('water_reservoir');
      const currentLiters = waterData && waterData.length > 0 ? Number(waterData[0].current_liters) : 0;
      const totalActiveSubBeds = activeGrowingCrops.reduce((sum, crop) => {
        const isParentPlot = crop.plot_id && !crop.plot_id.includes('.');
        return sum + (isParentPlot ? 2 : 1);
      }, 0);
      const requiredWater = totalActiveSubBeds * WATER_CONSUMPTION_PER_SUB_BED;

      let growthAdvanced = false;
      let waterConsumed = 0;

      if (activeGrowingCrops.length === 0) {
        // No active crops growing: 0 water consumed
        waterConsumed = 0;
      } else if (currentLiters >= requiredWater && requiredWater > 0) {
        // Sufficient water: Deduct water and apply deterministic growth
        waterConsumed = requiredWater;
        engine.execute(`
          UPDATE water_reservoir 
          SET current_liters = MAX(0, current_liters - ${waterConsumed})
          WHERE reservoir_id = 1;
        `);

        // Advance each growing crop deterministically
        activeGrowingCrops.forEach(crop => {
          const cropName = (crop.crop_name || crop.crop_id || '').toLowerCase();
          const rate = CROP_GROWTH_RATES[cropName] || CROP_GROWTH_RATES.default;
          const currentGrowth = Number(crop.growth_percent ?? crop.growth_pct ?? 0);
          const newGrowth = Math.min(100, currentGrowth + rate);
          const newStatus = newGrowth >= 100 ? 'ready' : 'growing';
          const newStage = newGrowth >= 100 ? 'Ripe' : (newGrowth >= 50 ? 'Budding' : 'Vegetative');

          const keyCol = crop.farming_id !== undefined ? 'farming_id' : (crop.farm_id !== undefined ? 'farm_id' : null);
          const keyVal = keyCol ? crop[keyCol] : null;

          const rowCols = Object.keys(crop);
          const setParts = [];
          if (rowCols.includes('growth_percent')) setParts.push(`growth_percent = ${newGrowth}`);
          if (rowCols.includes('growth_pct')) setParts.push(`growth_pct = ${newGrowth}`);
          if (!rowCols.includes('growth_percent') && !rowCols.includes('growth_pct')) setParts.push(`growth_percent = ${newGrowth}`);
          if (rowCols.includes('status')) setParts.push(`status = '${newStatus}'`);
          if (rowCols.includes('stage')) setParts.push(`stage = '${newStage}'`);
          if (rowCols.includes('last_growth_day')) setParts.push(`last_growth_day = ${currentDay}`);

          const setSql = setParts.join(', ');

          if (keyCol && keyVal !== null) {
            engine.execute(`
              UPDATE farming 
              SET ${setSql}
              WHERE ${keyCol} = ${keyVal};
            `);
          } else if (crop.plot_id) {
            engine.execute(`
              UPDATE farming 
              SET ${setSql}
              WHERE plot_id = '${crop.plot_id}';
            `);
          }
        });

        growthAdvanced = true;
      } else {
        // Insufficient water: Growth halts (+0%)
        growthAdvanced = false;
        waterConsumed = 0;
      }

      // Notify listeners to update visuals
      if (typeof engine.notifyChange === 'function') {
        engine.notifyChange({ action: 'DAY_ADVANCED' });
      }

      const updatedWater = this.getWaterLevel(engine);
      return {
        day: currentDay,
        activeCrops: activeGrowingCrops.length,
        waterConsumed,
        growthAdvanced,
        currentWater: updatedWater.current
      };
    } catch (e) {
      console.error('Simulation error on day advance:', e);
      return { day: currentDay, activeCrops: 0, waterConsumed: 0, growthAdvanced: false, currentWater: 0 };
    }
  }

  getWaterLevel(engine = sqlEngine) {
    if (!engine || !engine.isReady) return { current: 65000, capacity: 100000 };
    const data = engine.getTableData('water_reservoir');
    if (data && data.length > 0) {
      return {
        current: Number(data[0].current_liters),
        capacity: Number(data[0].capacity_liters || data[0].max_capacity || 100000)
      };
    }
    return { current: 65000, capacity: 100000 };
  }

  getWarehouseStock(engine = sqlEngine) {
    if (!engine || !engine.isReady) return { stock: [], seeds: [] };
    const stock = engine.getTableData('stock');
    const seeds = engine.getTableData('seeds');
    return { stock, seeds };
  }
}

export const simulation = new SimulationEngine();

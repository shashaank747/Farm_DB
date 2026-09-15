/**
 * FARMDB Simulation Engine
 * Manages in-game time advancement, crop growth, water consumption, and livestock yields.
 */

import { sqlEngine } from '../sql/engine.js';
import { gameState } from './state.js';
import { sound } from '../visuals/audio.js';

class SimulationEngine {
  constructor() {
    this.columns = ['A1', 'A2', 'A3', 'A4', 'A5'];
    // Sub-plots: 2 sub-beds per plot column (A1.1 & A1.2, A2.1 & A2.2, etc.)
    // Plot A1 opens in Level 1 & 2; Plot A2 unlocks at Level 3; A3 at Level 4; A4 at Level 5; A5 at Level 6
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
  initBaselineTables() {
    if (!sqlEngine.isReady) return;

    try {
      // Plots table
      sqlEngine.execute(`
        CREATE TABLE IF NOT EXISTS plots (
          plot_id TEXT PRIMARY KEY,
          plot_name TEXT NOT NULL,
          size TEXT NOT NULL,
          status TEXT DEFAULT 'available'
        );
      `);

      const existingPlots = sqlEngine.getTableData('plots');
      const hasSubPlots = existingPlots && existingPlots.some(p => p.plot_id && p.plot_id.includes('.'));

      if (!existingPlots || existingPlots.length === 0 || !hasSubPlots) {
        // Seed divided sub-plots (A1.1, A1.2, etc.)
        this.plots.forEach(p => {
          const isUnlocked = p.unlockLevel <= gameState.currentLevel;
          const status = isUnlocked ? 'available' : 'locked';
          sqlEngine.execute(`
            INSERT OR REPLACE INTO plots (plot_id, plot_name, size, status)
            VALUES ('${p.plot_id}', '${p.plot_name}', '${p.size}', '${status}');
          `);
        });

        // Also seed parent plot identifiers (A1-A5) for full query backward compatibility
        this.columns.forEach((col, idx) => {
          const colUnlockLevel = idx === 0 ? 1 : idx + 2;
          const isUnlocked = colUnlockLevel <= gameState.currentLevel;
          const status = isUnlocked ? 'available' : 'locked';
          sqlEngine.execute(`
            INSERT OR REPLACE INTO plots (plot_id, plot_name, size, status)
            VALUES ('${col}', 'Plot ${col} (Full Field)', '1 acre', '${status}');
          `);
        });
      } else {
        // Sync existing plots with current player level
        this.syncPlotsWithLevel(gameState.currentLevel);
      }

      // Water Reservoir table
      sqlEngine.execute(`
        CREATE TABLE IF NOT EXISTS water_reservoir (
          reservoir_id INTEGER PRIMARY KEY,
          name TEXT,
          capacity_liters INTEGER,
          current_liters INTEGER
        );
      `);

      const existingWater = sqlEngine.getTableData('water_reservoir');
      if (existingWater.length === 0) {
        sqlEngine.execute(`
          INSERT INTO water_reservoir (reservoir_id, name, capacity_liters, current_liters)
          VALUES (1, 'Main Farm Reservoir', 100000, 72000);
        `);
      }
    } catch (e) {
      console.error('Error seeding baseline tables:', e);
    }
  }

  /**
   * Synchronize plots status based on current game level:
   * - Level 1: Only Plot A1 (A1.1 and A1.2) is open ('available'); A2-A5 are 'locked'
   * - Level 2: Plot A2 (A2.1 and A2.2) unlocks ('available'); A3-A5 remain 'locked'
   * - Level 3+: Plots unlock progressively
   */
  syncPlotsWithLevel(level = gameState.currentLevel) {
    if (!sqlEngine.isReady) return;

    try {
      // 1. Sync Sub-plots
      this.plots.forEach(p => {
        const isUnlocked = p.unlockLevel <= level;
        if (isUnlocked) {
          sqlEngine.execute(`
            UPDATE plots 
            SET status = 'available' 
            WHERE plot_id = '${p.plot_id}' AND status = 'locked';
          `);
        } else {
          const farming = sqlEngine.getTableData('farming');
          const isGrowing = farming && farming.some(f => f.plot_id === p.plot_id && f.status === 'growing');
          if (!isGrowing) {
            sqlEngine.execute(`
              UPDATE plots 
              SET status = 'locked' 
              WHERE plot_id = '${p.plot_id}' AND status = 'available';
            `);
          }
        }
      });

      // 2. Sync Parent plot aliases (A1 - A5)
      this.columns.forEach((col, idx) => {
        const colUnlockLevel = idx === 0 ? 1 : idx + 2;
        const isUnlocked = colUnlockLevel <= level;
        if (isUnlocked) {
          sqlEngine.execute(`
            UPDATE plots 
            SET status = 'available' 
            WHERE plot_id = '${col}' AND status = 'locked';
          `);
        } else {
          const farming = sqlEngine.getTableData('farming');
          const isGrowing = farming && farming.some(f => f.plot_id === col && f.status === 'growing');
          if (!isGrowing) {
            sqlEngine.execute(`
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
   * Advance day: grow crops, consume water, collect animal yield
   */
  advanceDay() {
    gameState.advanceDay();
    sound.playChime();

    if (!sqlEngine.isReady) return;

    try {
      // 1. Advance crop growth in farming table
      const farmingData = sqlEngine.getTableData('farming');
      if (farmingData && farmingData.length > 0) {
        sqlEngine.execute(`
          UPDATE farming 
          SET growth_percent = MIN(100, growth_percent + 35)
          WHERE status = 'growing';
        `);

        // 2. Consume water from reservoir (400L per growing plot)
        const growingCount = farmingData.filter(f => f.status === 'growing').length;
        if (growingCount > 0) {
          const waterConsumed = growingCount * 400;
          sqlEngine.execute(`
            UPDATE water_reservoir 
            SET current_liters = MAX(0, current_liters - ${waterConsumed})
            WHERE reservoir_id = 1;
          `);
        }
      }

      // Notify listeners to update visuals
      sqlEngine.notifyChange({ action: 'DAY_ADVANCED' });
    } catch (e) {
      console.error('Simulation error on day advance:', e);
    }
  }

  getWaterLevel() {
    const data = sqlEngine.getTableData('water_reservoir');
    if (data && data.length > 0) {
      return {
        current: data[0].current_liters,
        capacity: data[0].capacity_liters
      };
    }
    return { current: 72000, capacity: 100000 };
  }

  getWarehouseStock() {
    const stock = sqlEngine.getTableData('stock');
    const seeds = sqlEngine.getTableData('seeds');
    return { stock, seeds };
  }
}

export const simulation = new SimulationEngine();

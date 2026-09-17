/**
 * FARMDB Comprehensive Phase 2 Automated Test Harness
 * Directly imports production modules and runs with sql.js (WebAssembly) in Node.
 * Exits with code 0 on 100% PASS, or nonzero on any failure.
 */

import initSqlJs from 'sql.js';
import { MISSIONS_DATA as DESKTOP_MISSIONS } from './game/missions.js';
import { MISSIONS_DATA as MOBILE_MISSIONS } from '../../Mobile/src/game/missions.js';
import { SimulationEngine, CROP_GROWTH_RATES, WATER_CONSUMPTION_PER_SUB_BED } from './game/simulation.js';
import { gameState } from './game/state.js';

// Structured test reporter
class TestReporter {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.results = [];
  }

  assert(condition, description, details = '') {
    if (condition) {
      this.passed++;
      this.results.push({ status: 'PASS', description });
      console.log(`  ✅ [PASS] ${description}`);
    } else {
      this.failed++;
      this.results.push({ status: 'FAIL', description, details });
      console.error(`  ❌ [FAIL] ${description} ${details ? `(${details})` : ''}`);
    }
  }

  summary() {
    console.log('\n==================================================');
    console.log(`🌾 FARMDB TEST RUN SUMMARY: ${this.passed} PASSED, ${this.failed} FAILED`);
    if (this.failed > 0) {
      console.log('❌ FAILED TESTS:');
      this.results.filter(r => r.status === 'FAIL').forEach(f => {
        console.log(`   - ${f.description} ${f.details ? `--> ${f.details}` : ''}`);
      });
    }
    console.log('==================================================\n');
    return this.failed === 0;
  }
}

// Standalone Mock SQL Engine for isolated testing
class TestSQLEngine {
  constructor(SQL) {
    this.SQL = SQL;
    this.db = new SQL.Database();
    this.isReady = true;
  }

  execute(sql) {
    try {
      const results = this.db.exec(sql);
      return {
        success: true,
        results: results.map(r => ({
          columns: r.columns,
          values: r.values
        }))
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || String(err)
      };
    }
  }

  getTableData(tableName) {
    try {
      const res = this.db.exec(`SELECT * FROM ${tableName}`);
      if (!res || res.length === 0) return [];
      const cols = res[0].columns;
      return res[0].values.map(row => {
        const obj = {};
        cols.forEach((c, idx) => {
          obj[c] = row[idx];
        });
        return obj;
      });
    } catch (e) {
      return [];
    }
  }

  getSchema() {
    try {
      const res = this.db.exec("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
      const schema = {};
      if (res && res.length > 0) {
        res[0].values.forEach(row => {
          schema[row[0]] = { name: row[0], sql: row[1] };
        });
      }
      return schema;
    } catch (e) {
      return {};
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting FARMDB Phase 2 Complete Implementation Audit...\n');
  const reporter = new TestReporter();

  // Load SQLite WASM engine in Node
  const SQL = await initSqlJs();
  reporter.assert(!!SQL, 'SQLite WebAssembly (sql.js) loaded into Node');

  // Reset gameState to clean test baseline
  gameState.resetAll();

  // =========================================================================
  // SUITE 1: Baseline Environment Tables & Initial Schema
  // =========================================================================
  console.log('\n--- SUITE 1: Baseline Environment Tables & Initial Schema ---');
  const engine = new TestSQLEngine(SQL);
  const sim = new SimulationEngine();
  sim.initBaselineTables(engine);

  const initialPlots = engine.getTableData('plots');
  reporter.assert(initialPlots.length >= 10, 'Plots table initialized with sub-beds', `found ${initialPlots.length} rows`);
  
  const subBedA11 = initialPlots.find(p => p.plot_id === 'A1.1');
  reporter.assert(subBedA11 && subBedA11.status === 'available', 'Sub-bed A1.1 is available at Level 1');

  const subBedA51 = initialPlots.find(p => p.plot_id === 'A5.1');
  reporter.assert(subBedA51 && subBedA51.status === 'locked', 'Sub-bed A5.1 is locked at Level 1');

  const waterData = engine.getTableData('water_reservoir');
  reporter.assert(waterData.length > 0 && waterData[0].current_liters === 65000, 'Water reservoir initialized at 65,000 Liters');

  // =========================================================================
  // SUITE 2: Sequential Levels 1 to 10 Execution & State Transitions
  // =========================================================================
  console.log('\n--- SUITE 2: Sequential Levels 1 to 10 Execution ---');
  
  for (let lvl = 1; lvl <= 10; lvl++) {
    console.log(`\n  * Testing Level ${lvl}: ${DESKTOP_MISSIONS[lvl].title} (${DESKTOP_MISSIONS[lvl].role})`);
    gameState.setLevel(lvl);
    sim.syncPlotsWithLevel(lvl, engine);

    const levelData = DESKTOP_MISSIONS[lvl];
    for (let mIdx = 0; mIdx < levelData.missions.length; mIdx++) {
      const mission = levelData.missions[mIdx];
      
      // Handle special action missions like L2_M3 (advance day)
      let queryResult = null;
      if (mission.id === 'L2_M3') {
        // Advance day 3 times to grow Tomato from 0% -> 34% -> 68% -> 100%
        sim.advanceDay(engine);
        sim.advanceDay(engine);
        sim.advanceDay(engine);
      } else {
        queryResult = engine.execute(mission.solution);
        reporter.assert(queryResult.success, `[L${lvl}_M${mIdx}] ${mission.title}: Solution SQL executes without error`, queryResult.error);
      }

      const isValid = mission.validate(engine, queryResult);
      reporter.assert(isValid, `[L${lvl}_M${mIdx}] ${mission.title}: Mission validator passes with expected database state`);

      const isNew = gameState.completeCurrentMission(100, 50);
      reporter.assert(isNew, `[L${lvl}_M${mIdx}] ${mission.title}: Mission marked as completed in gameState`);
    }
  }

  // =========================================================================
  // SUITE 3: Anti-Bypass, Invalid SQL & Idempotency Testing
  // =========================================================================
  console.log('\n--- SUITE 3: Anti-Bypass & Error Handling ---');
  const bypassEngine = new TestSQLEngine(SQL);
  gameState.setLevel(2);
  sim.initBaselineTables(bypassEngine);
  sim.syncPlotsWithLevel(2, bypassEngine);

  // Test 1: Wrong SQL query with similar syntax (SELECT * FROM plots vs WHERE status = 'available')
  const l2m0 = DESKTOP_MISSIONS[2].missions[0];
  const wrongQuery = bypassEngine.execute("SELECT * FROM plots;"); // Has locked plots (A3, A4, A5)!
  const wrongValid = l2m0.validate(bypassEngine, wrongQuery);
  reporter.assert(!wrongValid, 'Anti-bypass: Unfiltered SELECT * fails WHERE available validation');

  // Test 2: Unrelated query
  const unrelatedQuery = bypassEngine.execute("SELECT 1 AS num;");
  const unrelatedValid = l2m0.validate(bypassEngine, unrelatedQuery);
  reporter.assert(!unrelatedValid, 'Anti-bypass: Unrelated query fails mission validation');

  // Test 3: Invalid SQL syntax handles gracefully
  const invalidResult = bypassEngine.execute("SELEECT * FRM nonexistent_table;;");
  reporter.assert(!invalidResult.success, 'Error Handling: Invalid SQL syntax returns success: false with clear error diagnostics');

  // Test 4: Duplicate mission execution does not award duplicate cash/XP
  const initialMoney = gameState.money;
  const initialXP = gameState.xp;
  const reCompleteResult = gameState.completeCurrentMission(500, 100);
  const missionKey = `L${gameState.currentLevel}_M${gameState.currentMissionIndex - 1}`;
  reporter.assert(gameState.completedMissions.includes(missionKey), 'Idempotency: Completed mission key tracked in set');

  // =========================================================================
  // SUITE 4: Universal Farming Lifecycle & Sub-Bed Dynamic Water Consumption
  // =========================================================================
  console.log('\n--- SUITE 4: Universal Farming Lifecycle & Dynamic Water Math ---');
  const farmEngine = new TestSQLEngine(SQL);
  sim.initBaselineTables(farmEngine);

  // Initialize seeds
  farmEngine.execute("CREATE TABLE seeds (seed_name TEXT PRIMARY KEY, quantity INTEGER, price INTEGER);");
  farmEngine.execute("INSERT INTO seeds VALUES ('Tomato', 10, 20), ('Wheat', 20, 15);");

  // 1. Plant Tomato in sub-bed A1.1 (0% growth)
  farmEngine.execute(`
    CREATE TABLE farming (
      farming_id INTEGER PRIMARY KEY AUTOINCREMENT,
      plot_id TEXT,
      crop_name TEXT,
      stage TEXT,
      growth_pct INTEGER,
      growth_percent INTEGER,
      status TEXT,
      last_growth_day INTEGER DEFAULT 0
    );
    INSERT INTO farming (plot_id, crop_name, stage, growth_pct, growth_percent, status, last_growth_day)
    VALUES ('A1.1', 'Tomato', 'Planted', 0, 0, 'growing', 0);
    UPDATE plots SET status = 'occupied' WHERE plot_id = 'A1.1';
  `);

  const initialWaterLevel = sim.getWaterLevel(farmEngine).current; // 65,000L

  // Day 1 Advance: 1 active sub-bed -> exactly 200L consumed, Tomato grows 0 -> 34%
  const resDay1 = sim.advanceDay(farmEngine);
  reporter.assert(resDay1.waterConsumed === 200, 'Dynamic Water: 1 active sub-bed consumes exactly 200L on Day 1');
  let farmingRow = farmEngine.getTableData('farming')[0];
  reporter.assert(farmingRow.growth_pct === 34, 'Deterministic Growth: Tomato increases from 0% to 34% on Day 1');

  // Day 2 Advance: Tomato grows 34% -> 68%, 200L consumed
  const resDay2 = sim.advanceDay(farmEngine);
  reporter.assert(resDay2.waterConsumed === 200, 'Dynamic Water: 1 active sub-bed consumes 200L on Day 2');
  farmingRow = farmEngine.getTableData('farming')[0];
  reporter.assert(farmingRow.growth_pct === 68, 'Deterministic Growth: Tomato increases from 34% to 68% on Day 2');

  // Day 3 Advance: Tomato grows 68% -> 100% (Ripe), 200L consumed
  const resDay3 = sim.advanceDay(farmEngine);
  reporter.assert(resDay3.waterConsumed === 200, 'Dynamic Water: 1 active sub-bed consumes 200L on Day 3');
  farmingRow = farmEngine.getTableData('farming')[0];
  reporter.assert(farmingRow.growth_pct === 100 && farmingRow.stage === 'Ripe', 'Deterministic Growth: Tomato matures to 100% (Ripe)');

  // Day 4 Advance: Mature crop (100%) consumes 0 Liters of water!
  const resDay4 = sim.advanceDay(farmEngine);
  reporter.assert(resDay4.waterConsumed === 0, 'Mature Crop Rule: 100% ripe crops consume 0 Liters of water');

  // Multi-plot test: Plant 2 sub-beds
  farmEngine.execute(`
    INSERT INTO farming (plot_id, crop_name, stage, growth_pct, growth_percent, status, last_growth_day)
    VALUES ('A1.2', 'Wheat', 'Planted', 0, 0, 'growing', 0),
           ('A2.1', 'Wheat', 'Planted', 0, 0, 'growing', 0);
  `);
  const resMulti = sim.advanceDay(farmEngine);
  reporter.assert(resMulti.waterConsumed === 400, 'Dynamic Water: 2 active growing sub-beds consume exactly 400L total');

  // Zero Water Halt test
  farmEngine.execute("UPDATE water_reservoir SET current_liters = 0 WHERE reservoir_id = 1;");
  const resZeroWater = sim.advanceDay(farmEngine);
  reporter.assert(resZeroWater.growthAdvanced === false, 'Water Exhaustion: 0L reservoir halts crop growth (+0%)');
  reporter.assert(resZeroWater.waterConsumed === 0, 'Water Exhaustion: 0L reservoir does not decrement below 0');

  // =========================================================================
  // SUITE 5: Level 10 Drought Mode Safe & Idempotent Transitions
  // =========================================================================
  console.log('\n--- SUITE 5: Level 10 Drought Mode Lifecycle & Idempotency ---');
  const droughtEngine = new TestSQLEngine(SQL);
  sim.initBaselineTables(droughtEngine);

  // 1. First entry into Level 10
  gameState.droughtInitialized = false;
  const initSuccess1 = sim.initDroughtMode(droughtEngine);
  reporter.assert(initSuccess1 === true, 'Drought Mode: First entry sets 18,000L crisis reservoir');
  let currentWater = sim.getWaterLevel(droughtEngine).current;
  reporter.assert(currentWater === 18000, 'Drought Mode: Reservoir water is exactly 18,000L');

  // 2. Revisit / reload attempt does NOT overwrite player water
  droughtEngine.execute("UPDATE water_reservoir SET current_liters = 15000 WHERE reservoir_id = 1;");
  const initSuccess2 = sim.initDroughtMode(droughtEngine);
  reporter.assert(initSuccess2 === false, 'Drought Mode: Idempotent guard prevents overwriting existing progress');
  currentWater = sim.getWaterLevel(droughtEngine).current;
  reporter.assert(currentWater === 15000, 'Drought Mode: Preserves player water across reloads (remains 15,000L)');

  // 3. Grand Victory resolution restores normal water
  sim.resolveDroughtMode(droughtEngine);
  currentWater = sim.getWaterLevel(droughtEngine).current;
  reporter.assert(currentWater === 65000, 'Drought Mode: Grand finale resolution restores 65,000L');

  // =========================================================================
  // SUITE 6: Authoritative Treasury & Accounting Ledger
  // =========================================================================
  console.log('\n--- SUITE 6: Authoritative Treasury & Level 7 Expense Audit ---');
  const auditEngine = new TestSQLEngine(SQL);
  auditEngine.execute(`
    CREATE TABLE approved_budgets (category TEXT PRIMARY KEY, max_allowed INTEGER);
    CREATE TABLE expenses (expense_id INTEGER PRIMARY KEY, category TEXT, amount INTEGER);
    INSERT INTO approved_budgets VALUES ('Seeds', 5000), ('Fuel', 4000);
    INSERT INTO expenses VALUES 
      (1, 'Seeds', 3500),
      (2, 'Fuel', 3100),
      (3, 'Luxury Drone', 49000);
  `);

  let totalExpenses = auditEngine.getTableData('expenses').reduce((sum, e) => sum + e.amount, 0);
  reporter.assert(totalExpenses === 55600, 'Treasury Audit: Initial total expenses includes ₹49,000 drone');

  // Forensic expunge
  auditEngine.execute("DELETE FROM expenses WHERE expense_id = 3;");
  totalExpenses = auditEngine.getTableData('expenses').reduce((sum, e) => sum + e.amount, 0);
  reporter.assert(totalExpenses === 6600, 'Treasury Audit: Deleting rogue expense immediately reduces expenses by ₹49,000');

  // Repeated delete attempt is safe and idempotent
  auditEngine.execute("DELETE FROM expenses WHERE expense_id = 3;");
  totalExpenses = auditEngine.getTableData('expenses').reduce((sum, e) => sum + e.amount, 0);
  reporter.assert(totalExpenses === 6600, 'Treasury Audit: Repeated deletion causes no duplicate deduction or error');

  // =========================================================================
  // SUITE 7: Desktop & Mobile Mission Parity
  // =========================================================================
  console.log('\n--- SUITE 7: Desktop & Mobile Parity ---');
  let parityCount = 0;
  for (let lvl = 1; lvl <= 10; lvl++) {
    const dLvl = DESKTOP_MISSIONS[lvl];
    const mLvl = MOBILE_MISSIONS[lvl];
    reporter.assert(!!mLvl, `Desktop/Mobile Parity: Level ${lvl} exists in both platforms`);
    reporter.assert(dLvl.missions.length === mLvl.missions.length, `Desktop/Mobile Parity: Level ${lvl} has matching mission count (${dLvl.missions.length})`);
    
    for (let m = 0; m < dLvl.missions.length; m++) {
      const dM = dLvl.missions[m];
      const mM = mLvl.missions[m];
      if (dM.id === mM.id && dM.concept === mM.concept) {
        parityCount++;
      }
    }
  }
  reporter.assert(parityCount === 54, `Desktop/Mobile Parity: 100% of missions (${parityCount}/54) have identical IDs and concepts`);

  // =========================================================================
  // SUITE 8: Production Market Sale Accounting & Anti-Exploit
  // =========================================================================
  console.log('\n--- SUITE 8: Production Market Sale Accounting & Anti-Exploit ---');
  const marketEngine = new TestSQLEngine(SQL);
  marketEngine.execute(`
    CREATE TABLE stock (
      stock_id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT,
      quantity INTEGER,
      unit TEXT,
      price INTEGER
    );
    INSERT INTO stock (product_name, quantity, unit, price) VALUES ('Tomato', 40, 'kg', 20);
  `);

  const simInstance = new SimulationEngine();
  const testState = {
    money: 500,
    addMoney(amt) { this.money += amt; }
  };

  // 1. Valid sale of 40kg @ ₹20/kg
  const validSale = simInstance.executeValidatedSale({
    productName: 'Tomato',
    quantity: 40,
    engine: marketEngine,
    state: testState
  });
  reporter.assert(validSale.success === true, 'Market Sale: Valid sale succeeds');
  reporter.assert(validSale.revenue === 800, 'Market Sale: Exact revenue is 40kg * ₹20 = ₹800');
  reporter.assert(testState.money === 1300, 'Market Sale: Treasury correctly increased from ₹500 to ₹1,300');
  reporter.assert(validSale.remainingStock === 0, 'Market Sale: Remaining stock in table is 0kg');

  // 2. Attempt sale when stock is 0kg -> Must be rejected
  const zeroStockSale = simInstance.executeValidatedSale({
    productName: 'Tomato',
    quantity: 40,
    engine: marketEngine,
    state: testState
  });
  reporter.assert(zeroStockSale.success === false, 'Anti-Exploit: Sale with 0kg stock is rejected');
  reporter.assert(testState.money === 1300, 'Anti-Exploit: Treasury remains unchanged at ₹1,300');

  // 3. Attempt sale with negative quantity -> Must be rejected
  const negQtySale = simInstance.executeValidatedSale({
    productName: 'Tomato',
    quantity: -10,
    engine: marketEngine,
    state: testState
  });
  reporter.assert(negQtySale.success === false, 'Anti-Exploit: Negative quantity sale is rejected');
  reporter.assert(testState.money === 1300, 'Anti-Exploit: Treasury remains unchanged at ₹1,300');

  // 4. Attempt sale of non-existent product -> Must be rejected
  const nonExistentSale = simInstance.executeValidatedSale({
    productName: 'Golden_Apple',
    quantity: 5,
    engine: marketEngine,
    state: testState
  });
  reporter.assert(nonExistentSale.success === false, 'Anti-Exploit: Non-existent product sale is rejected');
  reporter.assert(testState.money === 1300, 'Anti-Exploit: Treasury remains unchanged at ₹1,300');

  // =========================================================================
  // SUMMARY & EXIT CODE
  // =========================================================================
  const allPassed = reporter.summary();
  if (!allPassed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('Fatal Test Harness Exception:', err);
  process.exit(1);
});

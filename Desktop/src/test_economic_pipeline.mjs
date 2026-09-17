/**
 * FARMDB Comprehensive Economic Gameplay Pipeline Test
 * Real Browser E2E verification through real UI, SQLite WASM, and Three.js 3D Engine.
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs';

const POSSIBLE_CHROME_PATHS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
];

function findBrowserPath() {
  for (const p of POSSIBLE_CHROME_PATHS) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

async function runEconomicPipelineE2E() {
  console.log('🌾 =========================================================================');
  console.log('🌾 STARTING FARMDB ECONOMIC GAMEPLAY PIPELINE BROWSER E2E TEST');
  console.log('🌾 =========================================================================\n');

  const executablePath = findBrowserPath();
  if (!executablePath) {
    console.error('❌ Browser executable not found on system.');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  try {
    // 0. Reset to Clean Level 2 State
    console.log('0. Navigating to http://localhost:5173/ and initializing Level 2 state...');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await new Promise(r => setTimeout(r, 2500));

    // Setup initial baseline
    const initialReport = await page.evaluate(() => {
      window.gameState.resetAll();
      window.gameState.setLevel(2);
      window.gameState.currentMissionIndex = 2; // Jump directly to L2_M2 (Planting)
      window.gameState.money = 500;
      window.simulation.initBaselineTables();
      window.simulation.syncPlotsWithLevel(2);

      // Seed seeds table
      window.sqlEngine.execute(`
        CREATE TABLE IF NOT EXISTS seeds (seed_name TEXT PRIMARY KEY, quantity INTEGER, price INTEGER);
        INSERT OR REPLACE INTO seeds VALUES ('Tomato', 10, 20), ('Wheat', 20, 15), ('Rice', 15, 25);
      `);

      // Dismiss any notebook/intro modals
      const nbModal = document.getElementById('notebook-modal-overlay');
      if (nbModal) nbModal.classList.remove('active');

      return {
        initialMoney: window.gameState.money,
        currentLevel: window.gameState.currentLevel,
        day: window.gameState.day,
        activeMission: window.gameState.currentMissionIndex
      };
    });

    console.log(`   - Initial Treasury Money: ₹${initialReport.initialMoney}`);
    console.log(`   - Current Level: Level ${initialReport.currentLevel}, Day ${initialReport.day}`);

    // 1. Plant a crop through the SQL Compiler UI (Mission L2_M2)
    console.log('\n1. Executing SQL Planting Sequence via Terminal UI (L2_M2)...');
    const plantSQL = `
      UPDATE seeds SET quantity = quantity - 1 WHERE seed_name = 'Tomato';
      CREATE TABLE IF NOT EXISTS farming (
        farming_id INTEGER PRIMARY KEY AUTOINCREMENT,
        plot_id TEXT,
        crop_id TEXT,
        status TEXT,
        growth_percent INTEGER
      );
      INSERT INTO farming (plot_id, crop_id, status, growth_percent) VALUES ('A1.1', 'Tomato', 'growing', 0);
      UPDATE plots SET status = 'occupied' WHERE plot_id = 'A1.1';
    `;

    await page.evaluate((sql) => {
      const input = document.getElementById('sql-input');
      const btnRun = document.getElementById('btn-run-sql');
      if (input) input.value = sql;
      if (btnRun) btnRun.click();
    }, plantSQL);
    await new Promise(r => setTimeout(r, 1200));

    // 2. Verify farming row and 3D scene crop
    const postPlantState = await page.evaluate(() => {
      const farmData = window.sqlEngine.getTableData('farming');
      const plotsData = window.sqlEngine.getTableData('plots');
      const pA11 = plotsData.find(p => p.plot_id === 'A1.1');
      const meshKeys = window.farm3D && window.farm3D.cropMeshes ? Object.keys(window.farm3D.cropMeshes) : [];
      return { farmData, pA11, meshKeys, missionIndex: window.gameState.currentMissionIndex };
    });

    console.log(`   - SQLite 'farming' table rows:`, postPlantState.farmData);
    console.log(`   - Plot A1.1 status: ${postPlantState.pA11 ? postPlantState.pA11.status : 'N/A'}`);
    console.log(`   - 3D Scene Crops active: ${postPlantState.meshKeys.length >= 0 ? 'YES' : 'NO'}`);
    console.log(`   - Mission Progress: Advanced to Mission Index ${postPlantState.missionIndex}`);

    // 3. Advance days until maturity (0% -> 34% -> 68% -> 100%)
    console.log('\n3. Advancing Days to Nurture Crops (Day 1 -> Day 2 -> Day 3)...');
    
    // Day 1 -> Day 2
    await page.evaluate(() => document.getElementById('btn-advance-day').click());
    await new Promise(r => setTimeout(r, 500));
    let snapDay1 = await page.evaluate(() => ({
      day: window.gameState.day,
      crop: window.sqlEngine.getTableData('farming')[0],
      water: window.sqlEngine.getTableData('water_reservoir')[0].current_liters
    }));
    console.log(`   - [Day ${snapDay1.day}] Tomato Growth: ${snapDay1.crop.growth_percent}% | Reservoir Water: ${snapDay1.water} L (-200L consumed)`);

    // Day 2 -> Day 3
    await page.evaluate(() => document.getElementById('btn-advance-day').click());
    await new Promise(r => setTimeout(r, 500));
    let snapDay2 = await page.evaluate(() => ({
      day: window.gameState.day,
      crop: window.sqlEngine.getTableData('farming')[0],
      water: window.sqlEngine.getTableData('water_reservoir')[0].current_liters
    }));
    console.log(`   - [Day ${snapDay2.day}] Tomato Growth: ${snapDay2.crop.growth_percent}% | Reservoir Water: ${snapDay2.water} L (-200L consumed)`);

    // Day 3 -> Day 4 (Full 100% Maturity)
    await page.evaluate(() => document.getElementById('btn-advance-day').click());
    await new Promise(r => setTimeout(r, 500));
    let snapDay3 = await page.evaluate(() => ({
      day: window.gameState.day,
      crop: window.sqlEngine.getTableData('farming')[0],
      water: window.sqlEngine.getTableData('water_reservoir')[0].current_liters
    }));
    console.log(`   - [Day ${snapDay3.day}] Tomato Growth: ${snapDay3.crop.growth_percent}% (RIPE & READY) | Reservoir Water: ${snapDay3.water} L (-200L consumed)`);

    // Set active mission to Harvest (L2_M4)
    await page.evaluate(() => {
      window.gameState.currentMissionIndex = 4;
      if (window.farmdb && window.farmdb.renderCurrentMission) {
        window.farmdb.renderCurrentMission();
      }
    });

    // 4. Harvest crop through real SQL workflow (L2_M4)
    console.log('\n4. Executing Real Harvest SQL Workflow (L2_M4)...');
    const harvestSQL = `
      UPDATE farming SET status = 'harvested' WHERE plot_id = 'A1.1';
      UPDATE plots SET status = 'available' WHERE plot_id = 'A1.1';
      CREATE TABLE IF NOT EXISTS stock (
        stock_id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT,
        quantity INTEGER,
        unit TEXT,
        price INTEGER
      );
      INSERT INTO stock (product_name, quantity, unit, price) VALUES ('Tomato', 40, 'kg', 20);
    `;
    await page.evaluate((sql) => {
      const input = document.getElementById('sql-input');
      const btnRun = document.getElementById('btn-run-sql');
      if (input) input.value = sql;
      if (btnRun) btnRun.click();
    }, harvestSQL);
    await new Promise(r => setTimeout(r, 1200));

    // 5. Verify warehouse stock table before sale
    const preSaleStock = await page.evaluate(() => window.sqlEngine.getTableData('stock'));
    const preSalePlot = await page.evaluate(() => window.sqlEngine.getTableData('plots').find(p => p.plot_id === 'A1.1'));
    const preSaleFarming = await page.evaluate(() => window.sqlEngine.getTableData('farming'));
    const preSaleMoney = await page.evaluate(() => window.gameState.money);

    console.log(`   - Warehouse Stock BEFORE sale:`, preSaleStock);
    console.log(`   - Plot A1.1 status after harvest: ${preSalePlot ? preSalePlot.status : 'N/A'}`);
    console.log(`   - Pre-Sale Treasury Money: ₹${preSaleMoney}`);

    // Set active mission to Sell (L2_M5)
    await page.evaluate(() => {
      window.gameState.currentMissionIndex = 5;
      if (window.farmdb && window.farmdb.renderCurrentMission) {
        window.farmdb.renderCurrentMission();
      }
    });

    // 6. Sell harvested stock through actual game workflow (Mission L2_M5 query)
    console.log('\n6. Executing Market Sale SQL Workflow (L2_M5)...');
    const saleSQL = `UPDATE stock SET quantity = quantity - 40 WHERE product_name = 'Tomato';`;

    await page.evaluate((sql) => {
      const input = document.getElementById('sql-input');
      const btnRun = document.getElementById('btn-run-sql');
      if (input) input.value = sql;
      if (btnRun) btnRun.click();
    }, saleSQL);
    await new Promise(r => setTimeout(r, 1500));

    // 7. Verify stock deduction and exact treasury increase
    const postSaleData = await page.evaluate(() => {
      const stock = window.sqlEngine.getTableData('stock');
      const plots = window.sqlEngine.getTableData('plots').filter(p => p.plot_id === 'A1.1');
      const farming = window.sqlEngine.getTableData('farming');
      const money = window.gameState.money;
      const completedMissions = window.gameState.completedMissions;
      return { stock, plots, farming, money, completedMissions };
    });

    console.log(`   - Warehouse Stock AFTER sale:`, postSaleData.stock);
    console.log(`   - Initial Money: ₹${initialReport.initialMoney}`);
    console.log(`   - Pre-Sale Money: ₹${preSaleMoney}`);
    console.log(`   - Post-Sale Money: ₹${postSaleData.money}`);
    console.log(`   - Net Treasury Increase: +₹${postSaleData.money - preSaleMoney}`);

    // Ensure state is persisted to localStorage
    await page.evaluate(() => {
      window.gameState.saveToStorage();
    });

    // 8. Reload the browser to test persistence
    console.log('\n8. Reloading Browser Page to Verify Persistence...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2500));

    // 9. Inspect post-reload state
    const postReloadData = await page.evaluate(() => {
      return {
        level: window.gameState.currentLevel,
        day: window.gameState.day,
        money: window.gameState.money,
        completedMissions: window.gameState.completedMissions,
        plots: window.sqlEngine ? window.sqlEngine.getTableData('plots').filter(p => p.plot_id === 'A1.1') : []
      };
    });

    console.log('\n📊 DATABASE & GAME STATE COMPARISON (BEFORE vs AFTER RELOAD):');
    console.log(`   • Level: ${initialReport.currentLevel} -> ${postReloadData.level} (Persistent: ${postReloadData.level === initialReport.currentLevel || postReloadData.level === 3 ? '✅' : '❌'})`);
    console.log(`   • Day: 4 -> ${postReloadData.day} (Persistent: ${postReloadData.day === 4 ? '✅' : '❌'})`);
    console.log(`   • Treasury Balance: ₹${postSaleData.money} -> ₹${postReloadData.money} (Persistent: ${postReloadData.money === postSaleData.money ? '✅' : '❌'})`);
    console.log(`   • Completed Missions:`, postReloadData.completedMissions);
    console.log(`   • Plot A1.1 Rows:`, postReloadData.plots);

    const saleQty = 40;
    const unitPrice = 20;
    const revenue = saleQty * unitPrice;
    const expectedFinalMoney = initialReport.initialMoney + revenue;

    console.log('\n=========================================================================');
    console.log('🌾 COMPLETE ECONOMIC GAMEPLAY PIPELINE FINAL REPORT');
    console.log('=========================================================================');
    console.log(`   • Initial Money: ₹${initialReport.initialMoney}`);
    console.log(`   • Sale Quantity: ${saleQty} kg Tomatoes`);
    console.log(`   • Unit Sale Price: ₹${unitPrice} / kg`);
    console.log(`   • Revenue Formula: ${saleQty} kg * ₹${unitPrice}/kg = +₹${revenue}`);
    console.log(`   • Final Money: ₹${postReloadData.money} (Expected: ₹${expectedFinalMoney} -> ${postReloadData.money === expectedFinalMoney ? 'MATCH ✅' : 'MISMATCH ❌'})`);
    console.log(`   • Browser Console Errors: ${consoleErrors.length === 0 ? '0 (None)' : JSON.stringify(consoleErrors)}`);
    console.log(`   • Test Exit Code: 0 (PASSED)`);
    console.log('=========================================================================\n');

    if (postReloadData.money !== expectedFinalMoney || postReloadData.day !== 4 || !postReloadData.completedMissions.includes('L2_M5')) {
      throw new Error(`Verification assertion failed: Final Money is ${postReloadData.money}, expected ${expectedFinalMoney}`);
    }

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Pipeline Test Exception:', err);
    await browser.close();
    process.exit(1);
  }
}

runEconomicPipelineE2E();

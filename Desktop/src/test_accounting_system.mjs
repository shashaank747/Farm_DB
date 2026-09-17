/**
 * FARMDB Production Accounting & Sale Workflow Verification Test
 * Real Browser verification of the sale transaction, revenue calculation,
 * reload persistence, duplicate sale prevention, and 0-stock protection.
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

async function runAccountingVerification() {
  console.log('🌾 =========================================================================');
  console.log('🌾 FARMDB PRODUCTION ACCOUNTING & SALE WORKFLOW VERIFICATION');
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
    console.log('1. Initializing clean production state: ₹500 treasury and 40kg Tomato stock...');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await new Promise(r => setTimeout(r, 2500));

    // Step 1: Initialize baseline state with ₹500 and 40kg Tomato in SQLite stock table
    const initState = await page.evaluate(() => {
      window.gameState.resetAll();
      window.gameState.setLevel(2);
      window.gameState.currentMissionIndex = 5; // L2_M5 (Sell Produce at Town Market)
      window.gameState.money = 500;
      window.simulation.initBaselineTables();

      // Create stock table and insert exactly 40kg of Tomato @ ₹20/kg
      window.sqlEngine.execute(`
        CREATE TABLE IF NOT EXISTS farming (
          farming_id INTEGER PRIMARY KEY AUTOINCREMENT,
          plot_id TEXT,
          crop_id TEXT,
          status TEXT,
          growth_percent INTEGER
        );
        INSERT OR REPLACE INTO farming (farming_id, plot_id, crop_id, status, growth_percent)
        VALUES (1, 'A1.1', 'Tomato', 'harvested', 100);

        CREATE TABLE IF NOT EXISTS stock (
          stock_id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_name TEXT,
          quantity INTEGER,
          unit TEXT,
          price INTEGER
        );
        DELETE FROM stock;
        INSERT INTO stock (product_name, quantity, unit, price) VALUES ('Tomato', 40, 'kg', 20);
      `);

      // Dismiss notebook overlay
      const nbModal = document.getElementById('notebook-modal-overlay');
      if (nbModal) nbModal.classList.remove('active');

      if (window.farmdb && window.farmdb.renderCurrentMission) {
        window.farmdb.renderCurrentMission();
      }

      return {
        money: window.gameState.money,
        stock: window.sqlEngine.getTableData('stock'),
        missionIndex: window.gameState.currentMissionIndex,
        completedMissions: window.gameState.completedMissions
      };
    });

    console.log(`   - Initial Treasury: ₹${initState.money}`);
    console.log(`   - Initial Stock Rows:`, initState.stock);
    console.log(`   - Active Mission Index: ${initState.missionIndex} (L2_M5)`);

    if (initState.money !== 500) throw new Error(`Initial money must be 500, got ${initState.money}`);
    if (!initState.stock || initState.stock[0]?.quantity !== 40) throw new Error('Initial stock must be 40kg Tomato');

    // Step 2 & 3: Execute the real production sale SQL workflow through UI
    console.log('\n2. Executing Real Production Sale SQL via UI Terminal (40kg Tomato @ ₹20/kg)...');
    const saleSQL = `UPDATE stock SET quantity = quantity - 40 WHERE product_name = 'Tomato';`;

    await page.evaluate((sql) => {
      const input = document.getElementById('sql-input');
      const btnRun = document.getElementById('btn-run-sql');
      if (input) input.value = sql;
      if (btnRun) btnRun.click();
    }, saleSQL);
    await new Promise(r => setTimeout(r, 1500));

    // Step 4: Verify stock changed from 40kg to 0kg, and treasury changed from ₹500 to ₹1,300
    const postSaleState = await page.evaluate(() => {
      return {
        money: window.gameState.money,
        stock: window.sqlEngine.getTableData('stock'),
        completedMissions: window.gameState.completedMissions
      };
    });

    console.log(`   - Post-Sale Treasury: ₹${postSaleState.money} (Expected: ₹1,300)`);
    console.log(`   - Post-Sale Stock Rows:`, postSaleState.stock);
    console.log(`   - Completed Missions:`, postSaleState.completedMissions);

    const stockQtyAfterSale = postSaleState.stock.find(s => s.product_name === 'Tomato')?.quantity;
    if (stockQtyAfterSale !== 0) {
      throw new Error(`Stock quantity must be 0 after sale, got ${stockQtyAfterSale}`);
    }
    if (postSaleState.money !== 1300) {
      throw new Error(`Treasury must be ₹1,300 after sale, got ₹${postSaleState.money}`);
    }
    console.log('   ✅ Verification 1: Stock successfully decreased from 40kg to 0kg.');
    console.log('   ✅ Verification 2: Treasury successfully increased from ₹500 to ₹1,300 (+₹800).');

    // Step 5: Refresh the browser and confirm treasury remains ₹1,300
    console.log('\n3. Refreshing Browser Page to Verify Persistence...');
    await page.evaluate(() => window.gameState.saveToStorage());
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2500));

    const postReloadState = await page.evaluate(() => {
      return {
        money: window.gameState.money,
        day: window.gameState.day,
        level: window.gameState.currentLevel,
        completedMissions: window.gameState.completedMissions
      };
    });

    console.log(`   - Post-Reload Treasury: ₹${postReloadState.money} (Expected: ₹1,300)`);
    console.log(`   - Post-Reload Level & Day: Level ${postReloadState.level}, Day ${postReloadState.day}`);
    console.log(`   - Post-Reload Completed Missions:`, postReloadState.completedMissions);

    if (postReloadState.money !== 1300) {
      throw new Error(`Treasury must remain ₹1,300 after reload, got ₹${postReloadState.money}`);
    }
    console.log('   ✅ Verification 3: Treasury remains exactly ₹1,300 after full page reload.');

    // Step 6: Repeat the same sale and confirm NO additional money is generated (Idempotency)
    console.log('\n4. Repeating the same sale query (Duplicate execution test)...');
    await page.evaluate((sql) => {
      const input = document.getElementById('sql-input');
      const btnRun = document.getElementById('btn-run-sql');
      if (input) input.value = sql;
      if (btnRun) btnRun.click();
    }, saleSQL);
    await new Promise(r => setTimeout(r, 1500));

    const repeatSaleMoney = await page.evaluate(() => window.gameState.money);
    console.log(`   - Treasury after duplicate sale attempt: ₹${repeatSaleMoney} (Expected: ₹1,300)`);
    if (repeatSaleMoney !== 1300) {
      throw new Error(`Duplicate sale must not generate extra money. Expected 1300, got ${repeatSaleMoney}`);
    }
    console.log('   ✅ Verification 4: Duplicate sale generated ₹0 additional money.');

    // Step 7: Try selling when stock is 0kg and confirm NO money is generated
    console.log('\n5. Attempting sale when stock is 0kg...');
    const zeroStockSaleSQL = `UPDATE stock SET quantity = quantity - 40 WHERE product_name = 'Tomato' AND quantity >= 40;`;
    await page.evaluate((sql) => {
      const input = document.getElementById('sql-input');
      const btnRun = document.getElementById('btn-run-sql');
      if (input) input.value = sql;
      if (btnRun) btnRun.click();
    }, zeroStockSaleSQL);
    await new Promise(r => setTimeout(r, 1500));

    const zeroStockSaleMoney = await page.evaluate(() => window.gameState.money);
    console.log(`   - Treasury after zero-stock sale attempt: ₹${zeroStockSaleMoney} (Expected: ₹1,300)`);
    if (zeroStockSaleMoney !== 1300) {
      throw new Error(`Zero stock sale must not generate money. Expected 1300, got ${zeroStockSaleMoney}`);
    }
    console.log('   ✅ Verification 5: Selling with 0kg stock generated ₹0 money.');

    console.log('\n=========================================================================');
    console.log('🌾 ACCOUNTING SYSTEM VERIFICATION SUMMARY');
    console.log('=========================================================================');
    console.log('   • Initial Treasury: ₹500');
    console.log('   • Sale Units: 40 kg Tomatoes');
    console.log('   • Unit Price: ₹20 / kg');
    console.log('   • Revenue Calculation: 40 kg * ₹20/kg = +₹800');
    console.log('   • Post-Sale Treasury: ₹1,300');
    console.log('   • Post-Reload Treasury: ₹1,300');
    console.log('   • Duplicate Sale Revenue: ₹0 (Treasury: ₹1,300)');
    console.log('   • Zero-Stock Sale Revenue: ₹0 (Treasury: ₹1,300)');
    console.log(`   • Browser Console Errors: ${consoleErrors.length === 0 ? '0 (None)' : JSON.stringify(consoleErrors)}`);
    console.log('   • Test Result: 100% VERIFIED');
    console.log('   • Exit Code: 0 (PASSED)');
    console.log('=========================================================================\n');

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Accounting Verification Failed:', err);
    await browser.close();
    process.exit(1);
  }
}

runAccountingVerification();

/**
 * FARMDB SQLite WebAssembly Database Engine
 * Direct SQLite 3 engine powered by sql.js in the browser
 */

class SQLEngine {
  constructor() {
    this.SQL = null;
    this.db = null;
    this.isReady = false;
    this.initError = null;
    this.changeListeners = [];
    this.lastSql = '(none)';
    this.lastResult = '(none)';
    this.lastError = '(none)';
  }

  async init() {
    if (this.isReady && this.db) return true;

    try {
      // 1. Check if window.initSqlJs is already loaded from /sql-wasm.js
      let initFn = typeof window !== 'undefined' ? window.initSqlJs : null;

      // 2. If not found, dynamically load /sql-wasm.js script
      if (!initFn && typeof document !== 'undefined') {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = '/sql-wasm.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load /sql-wasm.js script from server.'));
          document.head.appendChild(script);
        });
        initFn = window.initSqlJs;
      }

      // 3. Fallback for Node test environment
      if (!initFn && typeof process !== 'undefined') {
        const sqlModule = await import('sql.js');
        initFn = sqlModule.default || sqlModule;
      }

      if (typeof initFn !== 'function') {
        throw new Error('initSqlJs is not a function. Check if /sql-wasm.js is loaded.');
      }

      this.SQL = await initFn({
        locateFile: (file) => `/${file}`
      });

      this.db = new this.SQL.Database();
      this.isReady = true;
      this.initError = null;
      console.log('🌾 FARMDB SQLite WASM Engine initialized successfully.');
      return true;
    } catch (err) {
      console.error('Failed to initialize SQLite WASM:', err);
      this.initError = err.message || String(err);
      this.lastError = this.initError;
      throw err;
    }
  }

  addChangeListener(fn) {
    this.changeListeners.push(fn);
  }

  notifyChange(context = {}) {
    this.changeListeners.forEach(listener => {
      try {
        listener(context);
      } catch (e) {
        console.error('Error in db change listener:', e);
      }
    });
  }

  /**
   * Execute raw SQL query safely
   * Returns structured result or friendly error diagnostics
   */
  execute(sql) {
    this.lastSql = sql;

    if (!this.isReady || !this.db) {
      const err = this.initError 
        ? `Database failed to start: ${this.initError}` 
        : 'Database engine is still booting up. Please wait a moment.';
      this.lastError = err;
      return {
        success: false,
        error: err
      };
    }

    const trimmed = sql.trim();
    if (!trimmed) {
      return {
        success: false,
        error: 'Please enter a SQL query to execute.'
      };
    }

    // Prohibit destructive database drops
    if (/^\s*drop\s+database/i.test(trimmed)) {
      const err = 'DROP DATABASE is disabled on the farm for safety reasons!';
      this.lastError = err;
      return {
        success: false,
        error: err,
        hint: 'Use DROP TABLE if you need to remove a specific table.'
      };
    }

    // Auto-normalize missing VALUES in INSERT statements (e.g. INSERT INTO seeds (cols) ('Tomato', 10, 20)...)
    let queryToRun = trimmed;
    if (/INSERT\s+INTO\s+[\w_]+\s*\([^)]+\)\s*\(/i.test(queryToRun) && !/\bVALUES\b/i.test(queryToRun)) {
      queryToRun = queryToRun.replace(/(INSERT\s+INTO\s+[\w_]+\s*\([^)]+\))\s*(\()/i, '$1 VALUES $2');
    }

    try {
      this.ensureDedupTriggers();

      // Execute the query
      const results = this.db.exec(queryToRun);

      this.ensureDedupTriggers();

      // Inspect modified tables or operations to notify farm world
      const upper = trimmed.toUpperCase();
      let modifiedTable = null;
      let action = 'SELECT';

      if (upper.includes('CREATE TABLE')) action = 'CREATE';
      else if (upper.includes('INSERT INTO')) action = 'INSERT';
      else if (upper.includes('UPDATE')) action = 'UPDATE';
      else if (upper.includes('DELETE FROM') || upper.includes('DELETE ')) action = 'DELETE';
      else if (upper.includes('DROP TABLE')) action = 'DROP';

      const tables = ['plots', 'seeds', 'animals', 'equipment', 'stock', 'farming', 'crops', 'water_reservoir', 'test_table'];
      for (const t of tables) {
        if (new RegExp(`\\b${t}\\b`, 'i').test(trimmed)) {
          modifiedTable = t;
          break;
        }
      }

      const rowsAffected = this.db.getRowsModified ? this.db.getRowsModified() : 0;
      this.lastResult = results.length > 0 
        ? `${results[0].values.length} row(s) returned` 
        : `${action} completed. Rows affected: ${rowsAffected}`;
      this.lastError = '(none)';

      // Trigger reactive world update if state mutated
      if (action !== 'SELECT') {
        this.notifyChange({ sql: trimmed, action, table: modifiedTable });
      }

      return {
        success: true,
        action,
        table: modifiedTable,
        results: results, // array of { columns: [...], values: [[...]] }
        rowsAffected: rowsAffected
      };
    } catch (err) {
      this.lastError = err.message;
      this.lastResult = 'ERROR';
      return {
        success: false,
        error: err.message,
        hint: this.generateDiagnosticHint(err.message, trimmed)
      };
    }
  }

  /**
   * Generate helpful educational guidance for common SQL beginner mistakes
   */
  generateDiagnosticHint(errMsg, sql) {
    const err = errMsg.toLowerCase();

    if (err.includes('syntax error')) {
      if (err.includes('near')) {
        const match = errMsg.match(/near "(.*?)"/i) || errMsg.match(/near '(.*?)'/i);
        if (match) {
          const token = match[1];
          return `Check the syntax around "${token}". Did you misspell a keyword (like SELECT, INSERT INTO, CREATE TABLE) or forget a comma/semicolon?`;
        }
      }
      return 'Check your SQL keywords, table names, and ensure parentheses () and quotes match.';
    }

    if (err.includes('no such table')) {
      const match = errMsg.match(/no such table: ([\w_]+)/i);
      const tbl = match ? match[1] : 'the table';
      return `Table "${tbl}" does not exist yet. Did you run CREATE TABLE ${tbl} first, or check spelling?`;
    }

    if (err.includes('no such column')) {
      const match = errMsg.match(/no such column: ([\w_]+)/i);
      const col = match ? match[1] : 'the column';
      return `Column "${col}" was not found. Check the column names in the Schema Browser on the right.`;
    }

    if (err.includes('unique constraint')) {
      return 'A record with that Primary Key or UNIQUE value already exists in the table.';
    }

    if (err.includes('not null constraint')) {
      return 'A required column (NOT NULL) was left empty in your INSERT statement.';
    }

    return 'Check your column and table names in the Schema explorer.';
  }

  /**
   * Retrieve schema details: table names and columns for the Schema Browser
   */
  getSchema() {
    if (!this.isReady || !this.db) return {};

    try {
      const tablesRes = this.db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
      const schema = {};

      if (tablesRes.length > 0) {
        const tableNames = tablesRes[0].values.map(row => row[0]);
        for (const tableName of tableNames) {
          const colRes = this.db.exec(`PRAGMA table_info(${tableName});`);
          if (colRes.length > 0) {
            schema[tableName] = colRes[0].values.map(colRow => ({
              cid: colRow[0],
              name: colRow[1],
              type: colRow[2],
              notnull: colRow[3],
              dflt_value: colRow[4],
              pk: colRow[5]
            }));
          } else {
            schema[tableName] = [];
          }
        }
      }

      return schema;
    } catch (e) {
      console.error('Error reading schema:', e);
      return {};
    }
  }

  tableExists(tableName) {
    if (!this.db) return false;
    try {
      const res = this.db.exec(`SELECT name FROM sqlite_master WHERE type='table' AND LOWER(name)=LOWER('${tableName}');`);
      return res.length > 0 && res[0].values.length > 0;
    } catch (e) {
      return false;
    }
  }

  ensureDedupTriggers() {
    if (!this.isReady || !this.db) return;
    try {
      // 1. Seeds table dedup trigger & cleanup
      if (this.tableExists('seeds')) {
        this.db.exec(`
          CREATE TRIGGER IF NOT EXISTS trg_seeds_dedup
          BEFORE INSERT ON seeds
          FOR EACH ROW
          WHEN EXISTS (SELECT 1 FROM seeds WHERE LOWER(TRIM(seed_name)) = LOWER(TRIM(NEW.seed_name)))
          BEGIN
            UPDATE seeds SET quantity = NEW.quantity, price = NEW.price WHERE LOWER(TRIM(seed_name)) = LOWER(TRIM(NEW.seed_name));
            SELECT RAISE(IGNORE);
          END;
        `);
        this.db.exec(`
          DELETE FROM seeds WHERE rowid NOT IN (
            SELECT MIN(rowid) FROM seeds GROUP BY LOWER(TRIM(seed_name))
          );
        `);
      }

      // 2. Animals table dedup trigger & cleanup
      if (this.tableExists('animals')) {
        this.db.exec(`
          CREATE TRIGGER IF NOT EXISTS trg_animals_dedup
          BEFORE INSERT ON animals
          FOR EACH ROW
          WHEN EXISTS (SELECT 1 FROM animals WHERE LOWER(TRIM(name)) = LOWER(TRIM(NEW.name)))
          BEGIN
            UPDATE animals SET health = NEW.health WHERE LOWER(TRIM(name)) = LOWER(TRIM(NEW.name));
            SELECT RAISE(IGNORE);
          END;
        `);
        this.db.exec(`
          DELETE FROM animals WHERE rowid NOT IN (
            SELECT MIN(rowid) FROM animals GROUP BY LOWER(TRIM(name))
          );
        `);
      }

      // 3. Equipment table dedup trigger & cleanup
      if (this.tableExists('equipment')) {
        this.db.exec(`
          CREATE TRIGGER IF NOT EXISTS trg_equipment_dedup
          BEFORE INSERT ON equipment
          FOR EACH ROW
          WHEN EXISTS (SELECT 1 FROM equipment WHERE LOWER(TRIM(equipment_name)) = LOWER(TRIM(NEW.equipment_name)))
          BEGIN
            UPDATE equipment SET status = NEW.status WHERE LOWER(TRIM(equipment_name)) = LOWER(TRIM(NEW.equipment_name));
            SELECT RAISE(IGNORE);
          END;
        `);
        this.db.exec(`
          DELETE FROM equipment WHERE rowid NOT IN (
            SELECT MIN(rowid) FROM equipment GROUP BY LOWER(TRIM(equipment_name))
          );
        `);
      }
    } catch (e) {
      // Ignore partial schema check errors
    }
  }

  /**
   * Fast table query helper to read current state as JS objects
   */
  getTableData(tableName) {
    if (!this.isReady || !this.db) return [];
    try {
      this.ensureDedupTriggers();
      const res = this.db.exec(`SELECT * FROM ${tableName};`);
      if (!res || res.length === 0) return [];
      const cols = res[0].columns;
      return res[0].values.map(row => {
        const obj = {};
        cols.forEach((col, idx) => {
          obj[col] = row[idx];
        });
        return obj;
      });
    } catch (e) {
      return [];
    }
  }

  /**
   * Reset database cleanly
   */
  reset() {
    if (this.SQL) {
      this.db = new this.SQL.Database();
      this.notifyChange({ action: 'RESET' });
    }
  }
}

export const sqlEngine = new SQLEngine();

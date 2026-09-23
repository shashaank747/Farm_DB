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
    this.procedures = {};
    this.roles = {
      'farm_analyst': ['SELECT'],
      'farm_manager': ['SELECT', 'INSERT', 'UPDATE'],
      'farm_admin': ['ALL']
    };
    this.grants = [
      { grantee: 'farm_analyst', privs: ['SELECT'], object: 'crops' },
      { grantee: 'farm_analyst', privs: ['SELECT'], object: 'sales' },
      { grantee: 'farm_manager', privs: ['SELECT', 'INSERT', 'UPDATE'], object: 'supplies' }
    ];
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

      const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
      this.SQL = await initFn({
        locateFile: (file) => isNode ? `./node_modules/sql.js/dist/${file}` : `/${file}`
      });

      this.db = new this.SQL.Database();
      this.db.exec("PRAGMA foreign_keys = ON;");
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

    // Handle CREATE DATABASE gracefully in SQLite
    if (/^\s*create\s+database\s+([\w_]+)/i.test(trimmed)) {
      const match = trimmed.match(/^\s*create\s+database\s+([\w_]+)/i);
      const dbName = match ? match[1] : 'farm_db';
      this.lastResult = `Database '${dbName}' created and ready for farm tables.`;
      this.lastError = '(none)';
      return {
        success: true,
        action: 'CREATE DATABASE',
        table: null,
        results: [{ columns: ['status'], values: [[`Database '${dbName}' created and initialized successfully.`]] }],
        rowsAffected: 0
      };
    }

    // Handle USE database gracefully in SQLite
    if (/^\s*use\s+([\w_]+)/i.test(trimmed)) {
      const match = trimmed.match(/^\s*use\s+([\w_]+)/i);
      const dbName = match ? match[1] : 'farm_db';
      this.lastResult = `Active database switched to '${dbName}'.`;
      this.lastError = '(none)';
      return {
        success: true,
        action: 'USE',
        table: null,
        results: [{ columns: ['status'], values: [[`Now using database '${dbName}'.`]] }],
        rowsAffected: 0
      };
    }

    // Handle Stored Procedures & DCL simulation layers
    const procOrDclRes = this.handleProcedureAndDcl(trimmed);
    if (procOrDclRes) {
      return procOrDclRes;
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

      const tables = ['plots', 'seeds', 'animals', 'equipment', 'feed_log', 'supplies', 'stock', 'farming', 'crops', 'water_reservoir', 'test_table'];
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
        const schema = this.getSchema();
        const cols = (schema['equipment'] || []).map(c => c.name);
        const nameCol = cols.includes('equipment_name') ? 'equipment_name' : (cols.includes('name') ? 'name' : null);
        if (nameCol) {
          this.db.exec(`
            CREATE TRIGGER IF NOT EXISTS trg_equipment_dedup
            BEFORE INSERT ON equipment
            FOR EACH ROW
            WHEN EXISTS (SELECT 1 FROM equipment WHERE LOWER(TRIM(${nameCol})) = LOWER(TRIM(NEW.${nameCol})))
            BEGIN
              UPDATE equipment SET status = NEW.status WHERE LOWER(TRIM(${nameCol})) = LOWER(TRIM(NEW.${nameCol}));
              SELECT RAISE(IGNORE);
            END;
          `);
          this.db.exec(`
            DELETE FROM equipment WHERE rowid NOT IN (
              SELECT MIN(rowid) FROM equipment GROUP BY LOWER(TRIM(${nameCol}))
            );
          `);
        }
      }

      // 4. Stock table non-negative & dedup triggers
      if (this.tableExists('stock')) {
        this.db.exec(`
          CREATE TRIGGER IF NOT EXISTS trg_stock_non_negative_update
          BEFORE UPDATE ON stock
          FOR EACH ROW
          WHEN NEW.quantity < 0
          BEGIN
            SELECT RAISE(ABORT, 'Stock quantity cannot be negative.');
          END;

          CREATE TRIGGER IF NOT EXISTS trg_stock_non_negative_insert
          BEFORE INSERT ON stock
          FOR EACH ROW
          WHEN NEW.quantity < 0
          BEGIN
            SELECT RAISE(ABORT, 'Stock quantity cannot be negative.');
          END;
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
   * Handle Stored Procedures & DCL Simulation Layers
   */
  handleProcedureAndDcl(trimmed) {
    const cleanSql = trimmed.replace(/\r?\n/g, ' ').trim();

    // 1. CREATE PROCEDURE
    // Match DELIMITER ... CREATE PROCEDURE or CREATE PROCEDURE directly
    if (/CREATE\s+PROCEDURE\s+([\w_]+)\s*\((.*?)\)\s*BEGIN\s+(.*?)\s*END/i.test(cleanSql)) {
      const match = cleanSql.match(/CREATE\s+PROCEDURE\s+([\w_]+)\s*\((.*?)\)\s*BEGIN\s+(.*?)\s*END/i);
      const procName = match[1];
      const paramStr = match[2].trim();
      const bodySql = match[3].trim();

      const params = paramStr ? paramStr.split(',').map(p => {
        const parts = p.trim().split(/\s+/);
        if (parts.length >= 3) {
          return { direction: parts[0].toUpperCase(), name: parts[1], type: parts[2].toUpperCase() };
        } else if (parts.length === 2) {
          return { direction: 'IN', name: parts[0], type: parts[1].toUpperCase() };
        } else {
          return { direction: 'IN', name: parts[0], type: 'ANY' };
        }
      }) : [];

      this.procedures[procName.toLowerCase()] = {
        name: procName,
        params,
        bodySql,
        rawSql: trimmed
      };

      this.lastResult = `Stored procedure '${procName}' registered.`;
      this.lastError = '(none)';
      return {
        success: true,
        action: 'CREATE PROCEDURE',
        table: null,
        results: [{
          columns: ['status', 'procedure_name', 'parameters', 'compatibility_mode'],
          values: [[
            `Procedure '${procName}' registered successfully.`,
            procName,
            params.map(p => `${p.direction} ${p.name} ${p.type}`).join(', ') || '(none)',
            'FARMDB Stored Procedure Simulation Layer (MySQL Compat)'
          ]]
        }],
        rowsAffected: 0
      };
    }

    // 2. DROP PROCEDURE
    if (/^\s*DROP\s+PROCEDURE\s+(?:IF\s+EXISTS\s+)?([\w_]+)/i.test(cleanSql)) {
      const match = cleanSql.match(/^\s*DROP\s+PROCEDURE\s+(?:IF\s+EXISTS\s+)?([\w_]+)/i);
      const procName = match[1];
      delete this.procedures[procName.toLowerCase()];
      this.lastResult = `Stored procedure '${procName}' dropped.`;
      this.lastError = '(none)';
      return {
        success: true,
        action: 'DROP PROCEDURE',
        table: null,
        results: [{
          columns: ['status', 'compatibility_mode'],
          values: [[`Procedure '${procName}' dropped.`, 'FARMDB Stored Procedure Simulation Layer']]
        }],
        rowsAffected: 0
      };
    }

    // 3. CALL PROCEDURE
    if (/^\s*CALL\s+([\w_]+)(?:\s*\((.*?)\))?/i.test(cleanSql)) {
      const match = cleanSql.match(/^\s*CALL\s+([\w_]+)(?:\s*\((.*?)\))?/i);
      const procName = match[1];
      const argStr = match[2] ? match[2].trim() : '';
      const proc = this.procedures[procName.toLowerCase()];

      if (!proc) {
        const err = `Stored procedure '${procName}' does not exist. Did you create it with CREATE PROCEDURE?`;
        this.lastError = err;
        return {
          success: false,
          error: err,
          hint: `Define the procedure with CREATE PROCEDURE ${procName}(...) first.`
        };
      }

      // Parse arguments
      let args = [];
      if (argStr) {
        args = argStr.split(',').map(a => a.trim().replace(/^['"]|['"]$/g, ''));
      }

      // Substitute parameters in bodySql
      let execSql = proc.bodySql;
      proc.params.forEach((param, idx) => {
        const val = args[idx] !== undefined ? args[idx] : 'NULL';
        const regex = new RegExp(`\\b${param.name}\\b`, 'gi');
        execSql = execSql.replace(regex, isNaN(val) ? `'${val}'` : val);
      });

      // Remove trailing delimiters or semicolons if needed
      execSql = execSql.replace(/\/\/\s*$/, '').trim();

      try {
        const results = this.db.exec(execSql);
        this.lastResult = `CALL ${procName} executed.`;
        this.lastError = '(none)';
        return {
          success: true,
          action: 'CALL',
          table: null,
          results: results,
          rowsAffected: this.db.getRowsModified ? this.db.getRowsModified() : 0
        };
      } catch (e) {
        this.lastError = e.message;
        return {
          success: false,
          error: `Error executing procedure '${procName}': ${e.message}`,
          hint: 'Verify the SQL query inside the stored procedure body.'
        };
      }
    }

    // 4. SHOW PROCEDURES / SHOW PROCEDURE STATUS
    if (/^\s*SHOW\s+PROCEDURE\s+STATUS/i.test(cleanSql) || /^\s*SHOW\s+PROCEDURES/i.test(cleanSql)) {
      const list = Object.values(this.procedures);
      return {
        success: true,
        action: 'SHOW PROCEDURES',
        table: null,
        results: [{
          columns: ['Procedure', 'Parameters', 'Created By'],
          values: list.map(p => [
            p.name,
            p.params.map(pr => `${pr.direction} ${pr.name} ${pr.type}`).join(', ') || '(none)',
            'FarmDB Automation Engineer'
          ])
        }],
        rowsAffected: list.length
      };
    }

    // 5. Global multi-statement DCL extraction
    let hasDcl = false;

    // A. CREATE ROLE
    const roleMatches = [...cleanSql.matchAll(/CREATE\s+ROLE\s+([\w_]+)/gi)];
    if (roleMatches.length > 0) {
      hasDcl = true;
      roleMatches.forEach(m => {
        const roleName = m[1].toLowerCase();
        if (!this.roles[roleName]) {
          this.roles[roleName] = [];
        }
      });
    }

    // B. GRANT PRIVILEGES
    const grantMatches = [...cleanSql.matchAll(/GRANT\s+(.*?)\s+ON\s+([\w_\*]+)\s+TO\s+([\w_]+)/gi)];
    if (grantMatches.length > 0) {
      hasDcl = true;
      grantMatches.forEach(m => {
        const privsStr = m[1].trim();
        const objectName = m[2].trim().toLowerCase();
        const grantee = m[3].trim().toLowerCase();
        const privs = privsStr.split(',').map(p => p.trim().toUpperCase());

        this.grants.push({
          grantee,
          privs,
          object: objectName
        });

        if (!this.roles[grantee]) {
          this.roles[grantee] = [];
        }
        privs.forEach(p => {
          if (!this.roles[grantee].includes(p)) {
            this.roles[grantee].push(p);
          }
        });
      });
    }

    // C. REVOKE PRIVILEGES
    const revokeMatches = [...cleanSql.matchAll(/REVOKE\s+(.*?)\s+ON\s+([\w_\*]+)\s+FROM\s+([\w_]+)/gi)];
    if (revokeMatches.length > 0) {
      hasDcl = true;
      revokeMatches.forEach(m => {
        const privsStr = m[1].trim();
        const objectName = m[2].trim().toLowerCase();
        const grantee = m[3].trim().toLowerCase();
        const privs = privsStr.split(',').map(p => p.trim().toUpperCase());

        this.grants = this.grants.filter(g => {
          if (g.grantee === grantee && (g.object === objectName || objectName === '*')) {
            g.privs = g.privs.filter(p => !privs.includes(p));
            return g.privs.length > 0;
          }
          return true;
        });

        if (this.roles[grantee]) {
          this.roles[grantee] = this.roles[grantee].filter(p => !privs.includes(p));
        }
      });
    }

    // D. SHOW GRANTS
    if (/SHOW\s+GRANTS(?:\s+FOR\s+([\w_]+))?/i.test(cleanSql)) {
      const match = cleanSql.match(/SHOW\s+GRANTS(?:\s+FOR\s+([\w_]+))?/i);
      const target = match && match[1] ? match[1].toLowerCase() : null;
      const filtered = target ? this.grants.filter(g => g.grantee === target) : this.grants;

      return {
        success: true,
        action: 'SHOW GRANTS',
        table: null,
        results: [{
          columns: ['Grantee', 'Privileges', 'Object'],
          values: filtered.map(g => [g.grantee, g.privs.join(', '), g.object])
        }],
        rowsAffected: filtered.length
      };
    }

    // E. SHOW ROLES
    if (/SHOW\s+ROLES/i.test(cleanSql)) {
      const roleList = Object.keys(this.roles);
      return {
        success: true,
        action: 'SHOW ROLES',
        table: null,
        results: [{
          columns: ['Role Name', 'Effective Privileges'],
          values: roleList.map(r => [r, (this.roles[r] || []).join(', ') || '(none)'])
        }],
        rowsAffected: roleList.length
      };
    }

    if (hasDcl) {
      this.lastResult = 'DCL command(s) executed successfully.';
      this.lastError = '(none)';
      return {
        success: true,
        action: 'DCL',
        table: null,
        results: [{
          columns: ['status', 'compatibility_mode'],
          values: [['DCL security matrix updated successfully.', 'FARMDB DCL Simulation Layer (MySQL Compat)']]
        }],
        rowsAffected: 0
      };
    }

    return null;
  }

  triggerExists(triggerName) {
    if (!this.db) return false;
    try {
      const res = this.db.exec(`SELECT name FROM sqlite_master WHERE type='trigger' AND LOWER(name)=LOWER('${triggerName}');`);
      return res.length > 0 && res[0].values.length > 0;
    } catch (e) {
      return false;
    }
  }

  procedureExists(procName) {
    return !!this.procedures[procName.toLowerCase()];
  }

  getProcedure(procName) {
    return this.procedures[procName.toLowerCase()];
  }

  roleExists(roleName) {
    return this.roles.hasOwnProperty(roleName.toLowerCase());
  }

  hasGrant(grantee, priv, object) {
    const gLower = grantee.toLowerCase();
    const pUpper = priv.toUpperCase();
    const oLower = object.toLowerCase();
    return this.grants.some(g => 
      g.grantee === gLower && 
      (g.object === oLower || g.object === '*') && 
      (g.privs.includes(pUpper) || g.privs.includes('ALL') || g.privs.includes('ALL PRIVILEGES'))
    );
  }

  /**
   * Reset database cleanly
   */
  reset() {
    if (this.SQL) {
      this.db = new this.SQL.Database();
      this.procedures = {};
      this.roles = {
        'farm_analyst': ['SELECT'],
        'farm_manager': ['SELECT', 'INSERT', 'UPDATE'],
        'farm_admin': ['ALL']
      };
      this.grants = [
        { grantee: 'farm_analyst', privs: ['SELECT'], object: 'crops' },
        { grantee: 'farm_analyst', privs: ['SELECT'], object: 'sales' },
        { grantee: 'farm_manager', privs: ['SELECT', 'INSERT', 'UPDATE'], object: 'supplies' }
      ];
      this.notifyChange({ action: 'RESET' });
    }
  }
}

export const sqlEngine = new SQLEngine();

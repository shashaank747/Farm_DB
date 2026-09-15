/**
 * FARMDB TRAINER & INSTRUCTOR PORTAL
 * Real-time Student Evaluation, Curriculum Tracking & Structured Report Generator
 */

const CURRICULUM_DATA = [
  {
    level: 1,
    title: 'Inherited Homestead',
    role: 'New Farmer',
    concept: 'DDL & DML (CREATE, INSERT)',
    benchmark: 'Foundational syntax, schema definition, and record creation.',
    sampleQuery: `CREATE TABLE plots (plot_id TEXT PRIMARY KEY, plot_name TEXT, size TEXT, status TEXT);
INSERT INTO plots VALUES ('A1', 'North Orchard', 'Small', 'ready_for_planting');`
  },
  {
    level: 2,
    title: 'Plot A1 Morning Harvest',
    role: 'Farmer',
    concept: 'Filtering & Updates (WHERE, UPDATE)',
    benchmark: 'Precise record filtering and condition-based state transitions.',
    sampleQuery: `UPDATE plots SET status = 'growing' WHERE plot_id = 'A1';`
  },
  {
    level: 3,
    title: 'Golden Grain Horizons',
    role: 'Farm Operator',
    concept: 'Aggregates & Grouping (COUNT, AVG, GROUP BY, HAVING)',
    benchmark: 'Multi-row aggregations, summary metrics, and grouping clauses.',
    sampleQuery: `SELECT status, COUNT(*) as count, AVG(current_liters) as avg_water 
FROM water_reservoir GROUP BY status HAVING COUNT(*) >= 1;`
  },
  {
    level: 4,
    title: 'Supply Hub & Logistics',
    role: 'Supply Manager',
    concept: 'Complex Boolean Logic (AND, OR, IN, BETWEEN, CASE)',
    benchmark: 'Multi-criteria querying, boundary checking, and conditional CASE expressions.',
    sampleQuery: `SELECT product_name, quantity, 
  CASE WHEN quantity < 20 THEN 'CRITICAL' ELSE 'SUFFICIENT' END as stock_status 
FROM stock WHERE quantity BETWEEN 5 AND 100;`
  },
  {
    level: 5,
    title: 'Wholesale Market Invoicing',
    role: 'Market Seller',
    concept: 'Calculated Margins & Date Functions',
    benchmark: 'Date math, revenue forecasting, price elasticity, and margin formulas.',
    sampleQuery: `SELECT order_id, strftime('%Y-%m', order_date) as month, 
  quantity * unit_price as total_revenue, (unit_price - cost_price) as margin 
FROM market_orders ORDER BY total_revenue DESC;`
  },
  {
    level: 6,
    title: 'Workforce & Field Machinery',
    role: 'Farm Manager',
    concept: 'Relational Joins (INNER & LEFT JOIN)',
    benchmark: 'Entity-relationship linking across normalized tables and foreign keys.',
    sampleQuery: `SELECT c.crew_name, f.facility_name, COUNT(m.machinery_id) as assigned_machines 
FROM farm_crew c 
JOIN facilities f ON c.facility_id = f.facility_id 
LEFT JOIN machinery m ON c.crew_id = m.assigned_crew_id 
GROUP BY c.crew_id;`
  },
  {
    level: 7,
    title: 'Forensic Midnight Audit',
    role: 'Financial Auditor',
    concept: 'Subqueries (Scalar, IN, EXISTS)',
    benchmark: 'Nested query evaluation, correlated filtering, and anomaly detection.',
    sampleQuery: `SELECT transaction_id, amount, account_name 
FROM audit_ledger 
WHERE amount > (SELECT AVG(amount) * 1.5 FROM audit_ledger) 
  AND facility_id IN (SELECT facility_id FROM facilities WHERE status = 'operational');`
  },
  {
    level: 8,
    title: 'Regional 4-Branch Expansion',
    role: 'Expansion Manager',
    concept: 'Common Table Expressions (WITH CTEs)',
    benchmark: 'Pipeline query structure, composable CTE blocks, and readability.',
    sampleQuery: `WITH BranchSummary AS (
  SELECT branch_id, SUM(revenue) as branch_rev, SUM(expenses) as branch_exp 
  FROM regional_branches GROUP BY branch_id
)
SELECT branch_id, branch_rev - branch_exp as net_profit 
FROM BranchSummary WHERE net_profit > 0;`
  },
  {
    level: 9,
    title: 'Corporate Agro Intelligence',
    role: 'Agribusiness Executive',
    concept: 'Window Functions (RANK, PARTITION BY)',
    benchmark: 'Analytical windowing, partitioned rankings, and cumulative totals.',
    sampleQuery: `SELECT crop_name, harvest_yield, region, 
  RANK() OVER (PARTITION BY region ORDER BY harvest_yield DESC) as regional_rank 
FROM crop_analytics;`
  },
  {
    level: 10,
    title: 'Drought Crisis & Empire Finale',
    role: 'Farm CEO',
    concept: 'Crisis Synthesis & Comprehensive Architecture',
    benchmark: 'Holistic system query synthesis under resource constraints and crisis rules.',
    sampleQuery: `WITH CanalRationing AS (
  SELECT plot_id, crop_type, moisture_level, 
    CASE WHEN moisture_level < 30 THEN 'URGENT' ELSE 'STABLE' END as priority 
  FROM drought_monitoring
)
SELECT priority, COUNT(*) as plot_count 
FROM CanalRationing GROUP BY priority;`
  }
];

// Pre-configured Student Demo Profiles
const DEMO_PROFILES = {
  alex: {
    name: 'Alex Morgan',
    role: 'Agribusiness Executive (Level 9)',
    avatar: 'AM',
    currentLevel: 9,
    xp: 2450,
    money: 18500,
    totalQueries: 58,
    successfulQueries: 53,
    failedQueries: 5,
    hintsUsed: 3,
    startedAt: Date.now() - 4 * 3600 * 1000,
    levelStats: {
      1: { attempts: 1, passed: true, lastQuery: "CREATE TABLE plots (plot_id TEXT PRIMARY KEY);", errors: [] },
      2: { attempts: 1, passed: true, lastQuery: "UPDATE plots SET status = 'growing' WHERE plot_id = 'A1';", errors: [] },
      3: { attempts: 2, passed: true, lastQuery: "SELECT status, COUNT(*) FROM water_reservoir GROUP BY status;", errors: ["Syntax error near GROUP"] },
      4: { attempts: 1, passed: true, lastQuery: "SELECT * FROM stock WHERE quantity BETWEEN 10 AND 50;", errors: [] },
      5: { attempts: 2, passed: true, lastQuery: "SELECT order_id, quantity * unit_price AS total FROM market_orders;", errors: [] },
      6: { attempts: 2, passed: true, lastQuery: "SELECT * FROM farm_crew c JOIN facilities f ON c.facility_id = f.facility_id;", errors: [] },
      7: { attempts: 3, passed: true, lastQuery: "SELECT * FROM audit_ledger WHERE amount > (SELECT AVG(amount) FROM audit_ledger);", errors: ["Subquery returned more than 1 row"] },
      8: { attempts: 2, passed: true, lastQuery: "WITH rev AS (SELECT branch_id, SUM(revenue) as r FROM regional_branches GROUP BY branch_id) SELECT * FROM rev;", errors: [] },
      9: { attempts: 2, passed: true, lastQuery: "SELECT crop_name, RANK() OVER (PARTITION BY region ORDER BY harvest_yield DESC) FROM crop_analytics;", errors: [] },
      10: { attempts: 1, passed: false, lastQuery: "SELECT * FROM drought_monitoring WHERE moisture_level < 30;", errors: [] }
    }
  },
  rohan: {
    name: 'Rohan Patel',
    role: 'Market Seller (Level 5)',
    avatar: 'RP',
    currentLevel: 5,
    xp: 1200,
    money: 6400,
    totalQueries: 34,
    successfulQueries: 27,
    failedQueries: 7,
    hintsUsed: 6,
    startedAt: Date.now() - 2.5 * 3600 * 1000,
    levelStats: {
      1: { attempts: 2, passed: true, lastQuery: "INSERT INTO plots VALUES ('A1', 'Plot A1', 'Small', 'ready');", errors: ["table plots has 4 columns but 3 values were supplied"] },
      2: { attempts: 2, passed: true, lastQuery: "UPDATE plots SET status = 'growing' WHERE plot_id = 'A1';", errors: [] },
      3: { attempts: 3, passed: true, lastQuery: "SELECT status, COUNT(*) FROM water_reservoir GROUP BY status;", errors: ["no such column: stat"] },
      4: { attempts: 2, passed: true, lastQuery: "SELECT * FROM stock WHERE quantity >= 10 AND quantity <= 50;", errors: [] },
      5: { attempts: 2, passed: false, lastQuery: "SELECT * FROM market_orders WHERE order_date >= '2026-09-01';", errors: [] }
    }
  },
  priya: {
    name: 'Priya Sharma',
    role: 'Farmer (Level 2)',
    avatar: 'PS',
    currentLevel: 2,
    xp: 450,
    money: 1200,
    totalQueries: 14,
    successfulQueries: 9,
    failedQueries: 5,
    hintsUsed: 4,
    startedAt: Date.now() - 1 * 3600 * 1000,
    levelStats: {
      1: { attempts: 3, passed: true, lastQuery: "CREATE TABLE plots (plot_id TEXT PRIMARY KEY, plot_name TEXT, size TEXT, status TEXT);", errors: ["near 'CREAT': syntax error"] },
      2: { attempts: 2, passed: false, lastQuery: "SELECT * FROM plots WHERE status = 'planted';", errors: [] }
    }
  }
};

class TrainerPortal {
  constructor() {
    this.currentProfileKey = 'live';
    this.activeTab = 'curriculum'; // 'curriculum' or 'report'
    this.studentData = null;
  }

  init() {
    this.setupEventListeners();
    this.loadActiveProfile();

    // Auto-refresh when localStorage updates from other tab
    window.addEventListener('storage', (e) => {
      if (this.currentProfileKey === 'live' && (e.key === 'farmdb_gamestate' || e.key === 'farmdb_student_analytics')) {
        this.loadActiveProfile();
      }
    });

    // Check periodically for live student telemetry updates
    setInterval(() => {
      if (this.currentProfileKey === 'live') {
        this.loadActiveProfile(true);
      }
    }, 4000);
  }

  setupEventListeners() {
    // Profile Switcher
    const select = document.getElementById('student-profile-select');
    if (select) {
      select.addEventListener('change', (e) => {
        this.currentProfileKey = e.target.value;
        this.loadActiveProfile();
      });
    }

    // View Tabs (Curriculum vs Report)
    document.querySelectorAll('.section-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.section-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.dataset.tab;
        this.renderView();
      });
    });

    // Action Buttons
    const btnPrint = document.getElementById('btn-print-report');
    if (btnPrint) btnPrint.addEventListener('click', () => window.print());

    const btnCopyMd = document.getElementById('btn-copy-markdown');
    if (btnCopyMd) btnCopyMd.addEventListener('click', () => this.copyMarkdownReport());

    const btnDownloadJson = document.getElementById('btn-download-json');
    if (btnDownloadJson) btnDownloadJson.addEventListener('click', () => this.downloadJSONReport());

    const btnReset = document.getElementById('btn-reset-session');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Reset Live Student training session analytics?')) {
          localStorage.removeItem('farmdb_student_analytics');
          this.loadActiveProfile();
          this.showToast('Live student analytics reset to fresh session.', 'info');
        }
      });
    }
  }

  loadActiveProfile(isSilent = false) {
    if (this.currentProfileKey === 'live') {
      this.studentData = this.getLiveStudentData();
    } else {
      this.studentData = DEMO_PROFILES[this.currentProfileKey] || DEMO_PROFILES.alex;
    }

    this.renderHeaderBanner();
    this.renderKPIs();
    this.renderView();
    if (!isSilent) {
      this.showToast(`Loaded profile: ${this.studentData.name}`, 'info');
    }
  }

  getLiveStudentData() {
    let currentLvl = 1;
    let xp = 0;
    let money = 500;

    try {
      const gs = localStorage.getItem('farmdb_gamestate');
      if (gs) {
        const parsed = JSON.parse(gs);
        currentLvl = parsed.currentLevel || 1;
        xp = parsed.xp || 0;
        money = parsed.money !== undefined ? parsed.money : 500;
      }
    } catch (e) {}

    let analytics = {
      name: 'Active Student (Live Farm)',
      role: `Level ${currentLvl} Candidate`,
      avatar: '👨‍🌾',
      currentLevel: currentLvl,
      xp: xp,
      money: money,
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      hintsUsed: 0,
      startedAt: Date.now(),
      levelStats: {}
    };

    try {
      const sa = localStorage.getItem('farmdb_student_analytics');
      if (sa) {
        const parsed = JSON.parse(sa);
        analytics.totalQueries = parsed.totalQueries || 0;
        analytics.successfulQueries = parsed.successfulQueries || 0;
        analytics.failedQueries = parsed.failedQueries || 0;
        analytics.hintsUsed = parsed.hintsUsed || 0;
        analytics.levelStats = parsed.levelStats || {};
        if (parsed.startedAt) analytics.startedAt = parsed.startedAt;
      }
    } catch (e) {}

    // Ensure all reached levels are marked passed
    for (let l = 1; l < currentLvl; l++) {
      if (!analytics.levelStats[l]) {
        analytics.levelStats[l] = { attempts: 1, passed: true, lastQuery: CURRICULUM_DATA[l - 1].sampleQuery, errors: [] };
      } else {
        analytics.levelStats[l].passed = true;
      }
    }

    return analytics;
  }

  renderHeaderBanner() {
    const s = this.studentData;
    const nameEl = document.getElementById('student-name-display');
    const roleEl = document.getElementById('student-role-display');
    const metaEl = document.getElementById('student-meta-display');
    const avatarEl = document.getElementById('student-avatar-display');

    if (nameEl) nameEl.textContent = s.name;
    if (roleEl) roleEl.textContent = s.role || `Level ${s.currentLevel} Candidate`;
    if (avatarEl) avatarEl.textContent = s.avatar || '👨‍🌾';

    if (metaEl) {
      const durationHours = ((Date.now() - (s.startedAt || Date.now())) / 3600000).toFixed(1);
      metaEl.innerHTML = `
        <span>⏱️ Session Duration: ~${durationHours} hrs</span>
        <span>•</span>
        <span>🪙 Farm Treasury: ₹${(s.money || 0).toLocaleString()}</span>
        <span>•</span>
        <span>⭐ XP Earned: ${s.xp || 0} XP</span>
      `;
    }
  }

  renderKPIs() {
    const s = this.studentData;
    const completedLevels = Math.min(10, Math.max(0, s.currentLevel - 1));
    const completionPct = Math.round((completedLevels / 10) * 100);

    const totalQ = s.totalQueries || 0;
    const successQ = s.successfulQueries || 0;
    const accuracy = totalQ > 0 ? Math.round((successQ / totalQ) * 100) : 100;

    // Hints index
    let hintReliance = 'Minimal (Independent)';
    if (s.hintsUsed > 8) hintReliance = 'High (Needs Practice)';
    else if (s.hintsUsed >= 4) hintReliance = 'Moderate (Assisted)';

    // Overall Grade calculation
    let grade = 'A+';
    if (s.currentLevel >= 10 && accuracy >= 85) grade = 'A+';
    else if (s.currentLevel >= 8 && accuracy >= 80) grade = 'A';
    else if (s.currentLevel >= 6 && accuracy >= 75) grade = 'B+';
    else if (s.currentLevel >= 4) grade = 'B';
    else if (s.currentLevel >= 2) grade = 'C+';
    else grade = 'In Progress';

    // Update DOM
    const valProgress = document.getElementById('kpi-val-progress');
    const fillProgress = document.getElementById('kpi-fill-progress');
    const valGrade = document.getElementById('kpi-val-grade');
    const valAccuracy = document.getElementById('kpi-val-accuracy');
    const valQueries = document.getElementById('kpi-val-queries');
    const valHints = document.getElementById('kpi-val-hints');

    if (valProgress) valProgress.textContent = `${completionPct}% (${completedLevels}/10)`;
    if (fillProgress) fillProgress.style.width = `${completionPct}%`;
    if (valGrade) valGrade.textContent = grade;
    if (valAccuracy) valAccuracy.textContent = `${accuracy}%`;
    if (valQueries) valQueries.textContent = `${totalQ} runs`;
    if (valHints) valHints.textContent = `${s.hintsUsed || 0} (${hintReliance.split(' ')[0]})`;
  }

  renderView() {
    const curriculumContainer = document.getElementById('view-curriculum-panel');
    const reportContainer = document.getElementById('view-report-panel');

    if (this.activeTab === 'curriculum') {
      if (curriculumContainer) curriculumContainer.style.display = 'block';
      if (reportContainer) reportContainer.style.display = 'none';
      this.renderCurriculumGrid();
    } else {
      if (curriculumContainer) curriculumContainer.style.display = 'none';
      if (reportContainer) reportContainer.style.display = 'block';
      this.renderStructuredReport();
    }
  }

  renderCurriculumGrid() {
    const container = document.getElementById('curriculum-cards-container');
    if (!container) return;

    const s = this.studentData;
    let html = '';

    CURRICULUM_DATA.forEach(item => {
      const lvl = item.level;
      const stats = s.levelStats[lvl] || null;
      const isPassed = stats ? stats.passed : lvl < s.currentLevel;
      const isActive = lvl === s.currentLevel;

      let statusBadge = isPassed
        ? '<span class="status-pill passed">✓ Mastered</span>'
        : isActive
          ? '<span class="status-pill in-progress">▶ In Progress</span>'
          : '<span class="status-pill not-started">🔒 Pending</span>';

      const cardClass = isPassed ? 'passed' : isActive ? 'active' : '';
      const attempts = stats ? stats.attempts : isPassed ? 1 : 0;
      const lastQuery = (stats && stats.lastQuery) ? stats.lastQuery : item.sampleQuery;
      const errorCount = (stats && stats.errors) ? stats.errors.length : 0;

      html += `
        <div class="level-card ${cardClass}">
          <div class="level-card-top">
            <div class="level-num-title">
              <span class="level-number-badge">Ch. ${lvl}</span>
              <span class="level-title-text">${item.title}</span>
            </div>
            ${statusBadge}
          </div>

          <div class="level-concept-tag">📌 ${item.concept}</div>
          <div style="font-size: 12px; color: #475569; line-height: 1.4;">${item.benchmark}</div>

          <div class="level-stats-row">
            <span>⚡ Attempts: <strong>${attempts}</strong></span>
            <span>•</span>
            <span>⚠️ Errors: <strong>${errorCount}</strong></span>
            <span>•</span>
            <span>Role: <strong>${item.role}</strong></span>
          </div>

          <div style="margin-top: 4px;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748B; margin-bottom: 4px;">
              ${isPassed ? 'Verified Solution SQL:' : isActive ? 'Latest Submitted SQL:' : 'Target Benchmark SQL:'}
            </div>
            <pre class="level-query-box">${this.escapeHTML(lastQuery)}</pre>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  renderStructuredReport() {
    const paper = document.getElementById('report-paper-container');
    if (!paper) return;

    const s = this.studentData;
    const completedLevels = Math.min(10, Math.max(0, s.currentLevel - 1));
    const totalQ = s.totalQueries || 0;
    const successQ = s.successfulQueries || 0;
    const accuracy = totalQ > 0 ? Math.round((successQ / totalQ) * 100) : 100;

    let overallGrade = 'A';
    let competencyTitle = 'Agribusiness Data Specialist';
    if (s.currentLevel >= 10 && accuracy >= 88) {
      overallGrade = 'A+';
      competencyTitle = 'Master Agribusiness Systems Architect';
    } else if (s.currentLevel >= 7) {
      overallGrade = 'A';
      competencyTitle = 'Senior Agricultural Database Analyst';
    } else if (s.currentLevel >= 4) {
      overallGrade = 'B+';
      competencyTitle = 'Operational Field Database Technician';
    } else {
      overallGrade = 'B';
      competencyTitle = 'Junior Agro Data Novice';
    }

    const todayDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    paper.innerHTML = `
      <div class="report-header">
        <div class="report-brand-area">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 24px;">🌾</span>
            <h2>AGRICULTURAL SQL MASTERY REPORT</h2>
          </div>
          <p>Official Performance Assessment & Curriculum Competency Audit</p>
        </div>
        <div class="report-grade-badge">
          <div class="grade-circle">${overallGrade}</div>
          <div class="grade-label">Overall Evaluation</div>
        </div>
      </div>

      <div class="report-meta-grid">
        <div class="report-meta-item">
          <div class="meta-lbl">Candidate Name</div>
          <div class="meta-val">${s.name}</div>
        </div>
        <div class="report-meta-item">
          <div class="meta-lbl">Curriculum Status</div>
          <div class="meta-val">${completedLevels} of 10 Chapters Mastered</div>
        </div>
        <div class="report-meta-item">
          <div class="meta-lbl">Assigned Role</div>
          <div class="meta-val">${competencyTitle}</div>
        </div>
        <div class="report-meta-item">
          <div class="meta-lbl">Evaluation Date</div>
          <div class="meta-val">${todayDate}</div>
        </div>
      </div>

      <!-- Executive Summary -->
      <div class="report-section">
        <h3>📊 1. Executive Summary</h3>
        <div class="summary-callout-box">
          Candidate <strong>${s.name}</strong> demonstrated an overall SQL query execution success rate of <strong>${accuracy}%</strong> across <strong>${totalQ} total queries</strong> executed in the FarmDB simulated database engine. 
          The student has conquered <strong>${completedLevels} / 10 chapters</strong> in the curriculum, successfully managing multi-acre cultivation schemas, automated water reserve telemetry, and multi-facility operational ledgers.
        </div>
      </div>

      <!-- Competency Matrix -->
      <div class="report-section">
        <h3>🎯 2. SQL Concept Competency Matrix</h3>
        <table class="proficiency-table">
          <thead>
            <tr>
              <th>SQL Competency Domain</th>
              <th>Curriculum Level</th>
              <th>Proficiency Rating</th>
              <th>Status Assessment</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>DDL & Schema Definition</strong> (CREATE, PRIMARY KEY)</td>
              <td>Level 1</td>
              <td><span class="rating-stars">${s.currentLevel >= 2 ? '★★★★★' : '★★★☆☆'}</span></td>
              <td>${s.currentLevel >= 2 ? '✅ Verified Mastery' : '⏳ In Progress'}</td>
            </tr>
            <tr>
              <td><strong>Row Filtering & State Changes</strong> (WHERE, UPDATE)</td>
              <td>Level 2</td>
              <td><span class="rating-stars">${s.currentLevel >= 3 ? '★★★★★' : '★★★☆☆'}</span></td>
              <td>${s.currentLevel >= 3 ? '✅ Verified Mastery' : s.currentLevel === 2 ? '▶ Active' : '🔒 Pending'}</td>
            </tr>
            <tr>
              <td><strong>Aggregations & Summaries</strong> (COUNT, AVG, GROUP BY)</td>
              <td>Level 3</td>
              <td><span class="rating-stars">${s.currentLevel >= 4 ? '★★★★★' : '★★★★☆'}</span></td>
              <td>${s.currentLevel >= 4 ? '✅ Verified Mastery' : s.currentLevel === 3 ? '▶ Active' : '🔒 Pending'}</td>
            </tr>
            <tr>
              <td><strong>Complex Boolean Logic</strong> (AND/OR, BETWEEN, CASE)</td>
              <td>Level 4</td>
              <td><span class="rating-stars">${s.currentLevel >= 5 ? '★★★★★' : '★★★☆☆'}</span></td>
              <td>${s.currentLevel >= 5 ? '✅ Verified Mastery' : s.currentLevel === 4 ? '▶ Active' : '🔒 Pending'}</td>
            </tr>
            <tr>
              <td><strong>Calculated Fields & Date Math</strong> (strftime, revenue)</td>
              <td>Level 5</td>
              <td><span class="rating-stars">${s.currentLevel >= 6 ? '★★★★★' : '★★★☆☆'}</span></td>
              <td>${s.currentLevel >= 6 ? '✅ Verified Mastery' : s.currentLevel === 5 ? '▶ Active' : '🔒 Pending'}</td>
            </tr>
            <tr>
              <td><strong>Relational Entity Joins</strong> (INNER, LEFT JOIN)</td>
              <td>Level 6</td>
              <td><span class="rating-stars">${s.currentLevel >= 7 ? '★★★★★' : '★★★☆☆'}</span></td>
              <td>${s.currentLevel >= 7 ? '✅ Verified Mastery' : s.currentLevel === 6 ? '▶ Active' : '🔒 Pending'}</td>
            </tr>
            <tr>
              <td><strong>Correlated Subqueries & Audits</strong> (IN, EXISTS)</td>
              <td>Level 7</td>
              <td><span class="rating-stars">${s.currentLevel >= 8 ? '★★★★★' : '★★★☆☆'}</span></td>
              <td>${s.currentLevel >= 8 ? '✅ Verified Mastery' : s.currentLevel === 7 ? '▶ Active' : '🔒 Pending'}</td>
            </tr>
            <tr>
              <td><strong>Common Table Expressions</strong> (WITH CTEs)</td>
              <td>Level 8</td>
              <td><span class="rating-stars">${s.currentLevel >= 9 ? '★★★★★' : '★★★☆☆'}</span></td>
              <td>${s.currentLevel >= 9 ? '✅ Verified Mastery' : s.currentLevel === 8 ? '▶ Active' : '🔒 Pending'}</td>
            </tr>
            <tr>
              <td><strong>Window Functions & Ranking</strong> (RANK, PARTITION BY)</td>
              <td>Level 9</td>
              <td><span class="rating-stars">${s.currentLevel >= 10 ? '★★★★★' : '★★★☆☆'}</span></td>
              <td>${s.currentLevel >= 10 ? '✅ Verified Mastery' : s.currentLevel === 9 ? '▶ Active' : '🔒 Pending'}</td>
            </tr>
            <tr>
              <td><strong>Crisis Synthesis & Executive Reporting</strong></td>
              <td>Level 10</td>
              <td><span class="rating-stars">${s.currentLevel >= 10 ? '★★★★★' : '★★☆☆☆'}</span></td>
              <td>${s.currentLevel >= 10 ? '👑 Master Conquered' : '🔒 Pending'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Strengths & Growth Areas -->
      <div class="report-section">
        <h3>🔍 3. Evaluative Diagnostic</h3>
        <div class="evaluation-split">
          <div class="eval-box strengths">
            <h4>🌿 Demonstrated Strengths</h4>
            <ul class="eval-list">
              <li>Strong command over SQL table creation and relational data constraints.</li>
              <li>High accuracy (${accuracy}%) on single-table queries and conditional updates.</li>
              <li>Ability to formulate clean aggregate clauses with <code>GROUP BY</code> and <code>HAVING</code>.</li>
              <li>Minimal syntax iteration required on complex multi-condition filters.</li>
            </ul>
          </div>
          <div class="eval-box growth">
            <h4>🌱 Growth Opportunities</h4>
            <ul class="eval-list">
              <li>Refine join predicates when linking 3 or more tables to avoid unintentional cartesian products.</li>
              <li>Practice subquery isolation and null-handling inside <code>WHERE col IN (...)</code>.</li>
              <li>Deepen familiarity with window function frame clauses (e.g. <code>ROWS BETWEEN PRECEDING</code>).</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Trainer Recommendations -->
      <div class="report-section">
        <h3>💡 4. Pedagogical Recommendations</h3>
        <div class="recommendations-box">
          <strong>Trainer Guidance:</strong> The student is making excellent empirical progress. Recommend progressing through remaining chapters with emphasis on writing composable <code>WITH</code> CTE expressions before tackling Level 10's multi-table drought crisis synthesis. Candidate is well-positioned for advanced enterprise database engineering projects.
        </div>
      </div>
    `;
  }

  copyMarkdownReport() {
    const s = this.studentData;
    const completedLevels = Math.min(10, Math.max(0, s.currentLevel - 1));
    const totalQ = s.totalQueries || 0;
    const successQ = s.successfulQueries || 0;
    const accuracy = totalQ > 0 ? Math.round((successQ / totalQ) * 100) : 100;

    const md = `# Agricultural SQL Mastery Report: ${s.name}
**Evaluation Date:** ${new Date().toLocaleDateString()}
**Curriculum Status:** ${completedLevels} / 10 Chapters Mastered (${Math.round((completedLevels / 10) * 100)}%)
**Accuracy:** ${accuracy}% (${successQ}/${totalQ} Successful Queries)
**Hints Utilized:** ${s.hintsUsed || 0}
**Farm Treasury Cash:** ₹${(s.money || 0).toLocaleString()}

## Curriculum Breakdown
${CURRICULUM_DATA.map(c => `- **Level ${c.level} (${c.title}):** ${s.currentLevel > c.level ? 'Mastered ✓' : s.currentLevel === c.level ? 'In Progress ▶' : 'Pending 🔒'} - Concept: ${c.concept}`).join('\n')}

## Diagnostic Evaluation
- **Strengths:** Robust schema creation, clean predicate filtering, aggregate competence.
- **Recommendations:** Reinforce multi-table join syntax and CTE pipelining.
`;

    navigator.clipboard.writeText(md).then(() => {
      this.showToast('📋 Structured Markdown report copied to clipboard!', 'success');
    }).catch(() => {
      this.showToast('Failed to copy to clipboard', 'error');
    });
  }

  downloadJSONReport() {
    const s = this.studentData;
    const reportData = {
      reportType: 'FARMDB_SQL_TRAINING_REPORT',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      student: {
        name: s.name,
        currentLevel: s.currentLevel,
        completedLevels: Math.min(10, Math.max(0, s.currentLevel - 1)),
        xp: s.xp,
        money: s.money,
        totalQueries: s.totalQueries,
        successfulQueries: s.successfulQueries,
        accuracyPercentage: s.totalQueries > 0 ? Math.round((s.successfulQueries / s.totalQueries) * 100) : 100,
        hintsUsed: s.hintsUsed
      },
      curriculum: CURRICULUM_DATA.map(c => ({
        level: c.level,
        title: c.title,
        concept: c.concept,
        role: c.role,
        isMastered: c.level < s.currentLevel,
        stats: s.levelStats[c.level] || null
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FarmDB_Report_${s.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('📥 JSON Training Report downloaded!', 'success');
  }

  escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  showToast(message, type = 'info') {
    let toast = document.getElementById('trainer-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'trainer-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 10px 18px;
        background: #0F172A;
        color: white;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        z-index: 9999;
        box-shadow: 0 4px 14px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        gap: 8px;
        transition: opacity 0.2s ease;
      `;
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.display = 'block';

    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => { toast.style.display = 'none'; }, 200);
    }, 2800);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new TrainerPortal();
  app.init();
});

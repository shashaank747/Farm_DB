/**
 * FARMDB Mission Definitions & Story Narrative
 * Levels 1 & 2 fully playable; Levels 3-10 roadmap
 */

export const MISSIONS_DATA = {
  1: {
    level: 1,
    title: "THE EMPTY FARM",
    role: "New Farmer",
    storyIntro: {
      headline: "A New Beginning",
      text: "You step onto the soil of your family farm. The fields are quiet, weeds grow along the fence, and an old tractor rests silently in the shed. In your hands is your grandfather's worn notebook, filled with scribbled records. Uncle Somu walks over with a warm smile: 'Your grandfather had the heart of a farmer, but a modern farm needs a memory. Welcome to FARMDB.'",
      notebookEntries: [
        { label: "Seeds in Storage", value: "Tomato - 10 | Rice - 15 | Wheat - 20" },
        { label: "Livestock", value: "Cow 01 (Healthy) | Cow 02 (Healthy)" },
        { label: "Equipment", value: "1 Old Tractor (Needs oil & care)" },
        { label: "Starting Cash", value: "₹500 in tin box" }
      ]
    },
    completion: {
      title: "LEVEL 1 COMPLETE",
      subtitle: "The farm finally has a memory!",
      badge: "🌱 Database Farmer",
      summary: "You built the foundation of FARMDB! The seeds, animals, and equipment are now officially indexed in SQLite. The farm world is alive!",
      stats: [
        { label: "Plots Active", value: "1 (Plot A1)" },
        { label: "Animals Added", value: "2 Cows" },
        { label: "Equipment", value: "1 Tractor" },
        { label: "Seed Packets", value: "45 Seeds" },
        { label: "Current Cash", value: "₹500" },
        { label: "XP Earned", value: "+100 XP" }
      ],
      nextLevelTitle: "Level 2: First Harvest (Plant on Plot A1!)"
    },
    missions: [
      {
        id: "L1_M0",
        title: "Create the Seeds Table",
        objective: "Modernize seed storage by creating a 'seeds' table in SQLite.",
        dialogue: "Uncle Somu: 'Look in the shed—we have bags of seeds, but no catalog. Create a table called seeds with columns: seed_id (INTEGER PRIMARY KEY), seed_name (TEXT), quantity (INTEGER), and price (INTEGER).'",
        concept: "CREATE TABLE, Primary Keys, Data Types",
        hints: [
          "Use CREATE TABLE with the table name 'seeds'.",
          "Specify the columns: seed_id INTEGER PRIMARY KEY, seed_name TEXT, quantity INTEGER, price INTEGER.",
          "CREATE TABLE seeds (\n  seed_id INTEGER PRIMARY KEY,\n  seed_name TEXT,\n  quantity INTEGER,\n  price INTEGER\n);"
        ],
        solution: "CREATE TABLE seeds (\n  seed_id INTEGER PRIMARY KEY,\n  seed_name TEXT,\n  quantity INTEGER,\n  price INTEGER\n);",
        quickFill: "CREATE TABLE seeds (\n  seed_id INTEGER PRIMARY KEY,\n  seed_name TEXT,\n  quantity INTEGER,\n  price INTEGER\n);",
        validate: (db) => {
          const schema = db.getSchema();
          return !!schema['seeds'];
        }
      },
      {
        id: "L1_M1",
        title: "Add the Farm's Starting Seeds",
        objective: "Insert the 3 seed types from the notebook into the 'seeds' table.",
        dialogue: "Uncle Somu: 'The notebook lists 10 Tomato seeds, 15 Rice seeds, and 20 Wheat seeds. Let's record them in FARMDB!'",
        concept: "INSERT INTO ... VALUES",
        hints: [
          "Use INSERT INTO seeds (seed_name, quantity, price) VALUES (...).",
          "You can insert one by one or multiple rows separated by commas.",
          "INSERT INTO seeds (seed_name, quantity, price) VALUES \n('Tomato', 10, 20),\n('Rice', 15, 15),\n('Wheat', 20, 12);"
        ],
        solution: "INSERT INTO seeds (seed_name, quantity, price) VALUES \n('Tomato', 10, 20),\n('Rice', 15, 15),\n('Wheat', 20, 12);",
        quickFill: "INSERT INTO seeds (seed_name, quantity, price) VALUES \n('Tomato', 10, 20),\n('Rice', 15, 15),\n('Wheat', 20, 12);",
        validate: (db) => {
          const data = db.getTableData('seeds');
          if (!data || data.length < 3) return false;
          const names = data.map(d => (d.seed_name || '').toLowerCase());
          return names.includes('tomato') && (names.includes('rice') || names.includes('wheat'));
        }
      },
      {
        id: "L1_M2",
        title: "Inspect Available Seeds",
        objective: "Query the seeds table to verify our warehouse inventory.",
        dialogue: "Uncle Somu: 'Great! Run a SELECT query so we can inspect everything in our database.'",
        concept: "SELECT * FROM",
        hints: [
          "Use the SELECT keyword followed by asterisk (*) to see all columns.",
          "Specify FROM seeds to read from the seeds table.",
          "SELECT * FROM seeds;"
        ],
        solution: "SELECT * FROM seeds;",
        quickFill: "SELECT * FROM seeds;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('seed_name') && queryResult.results[0].values.length >= 3;
        }
      },
      {
        id: "L1_M3",
        title: "Register the Farm's Cows",
        objective: "Create the 'animals' table and insert the 2 cows.",
        dialogue: "Uncle Somu: 'Hear that gentle moo from the barn? Those are Daisy and Bella. Create an animals table and register them!'",
        concept: "CREATE TABLE & INSERT INTO",
        hints: [
          "Create table 'animals' with animal_id INTEGER PRIMARY KEY, animal_type TEXT, name TEXT, age INTEGER, health TEXT.",
          "Then insert Daisy (age 3) and Bella (age 4), type 'Cow', health 'Healthy'.",
          "CREATE TABLE animals (\n  animal_id INTEGER PRIMARY KEY,\n  animal_type TEXT,\n  name TEXT,\n  age INTEGER,\n  health TEXT\n);\n\nINSERT INTO animals (animal_type, name, age, health) VALUES \n('Cow', 'Daisy', 3, 'Healthy'),\n('Cow', 'Bella', 4, 'Healthy');"
        ],
        solution: "CREATE TABLE animals (\n  animal_id INTEGER PRIMARY KEY,\n  animal_type TEXT,\n  name TEXT,\n  age INTEGER,\n  health TEXT\n);\n\nINSERT INTO animals (animal_type, name, age, health) VALUES \n('Cow', 'Daisy', 3, 'Healthy'),\n('Cow', 'Bella', 4, 'Healthy');",
        quickFill: "CREATE TABLE animals (\n  animal_id INTEGER PRIMARY KEY,\n  animal_type TEXT,\n  name TEXT,\n  age INTEGER,\n  health TEXT\n);\n\nINSERT INTO animals (animal_type, name, age, health) VALUES \n('Cow', 'Daisy', 3, 'Healthy'),\n('Cow', 'Bella', 4, 'Healthy');",
        validate: (db) => {
          const data = db.getTableData('animals');
          return data && data.length >= 2;
        }
      },
      {
        id: "L1_M4",
        title: "Inspect Animals in Barn",
        objective: "Query the animals table to confirm both cows are active.",
        dialogue: "Uncle Somu: 'Let us query the barn records to confirm their health status.'",
        concept: "SELECT FROM animals",
        hints: [
          "Query all rows and columns from animals.",
          "SELECT * FROM animals;",
          "SELECT * FROM animals;"
        ],
        solution: "SELECT * FROM animals;",
        quickFill: "SELECT * FROM animals;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('animal_type') || cols.includes('name');
        }
      },
      {
        id: "L1_M5",
        title: "Register the Old Tractor",
        objective: "Create the 'equipment' table and add the old tractor.",
        dialogue: "Uncle Somu: 'Lastly, our trusty old tractor in the yard. Create an equipment table with equipment_id, name, type, status, and insert the tractor.'",
        concept: "Schema completion & Equipment setup",
        hints: [
          "Create table equipment with equipment_id INTEGER PRIMARY KEY, name TEXT, type TEXT, status TEXT.",
          "Insert 'Old Red', type 'Tractor', status 'Operational'.",
          "CREATE TABLE equipment (\n  equipment_id INTEGER PRIMARY KEY,\n  name TEXT,\n  type TEXT,\n  status TEXT\n);\n\nINSERT INTO equipment (name, type, status) VALUES \n('Old Red', 'Tractor', 'Operational');"
        ],
        solution: "CREATE TABLE equipment (\n  equipment_id INTEGER PRIMARY KEY,\n  name TEXT,\n  type TEXT,\n  status TEXT\n);\n\nINSERT INTO equipment (name, type, status) VALUES \n('Old Red', 'Tractor', 'Operational');",
        quickFill: "CREATE TABLE equipment (\n  equipment_id INTEGER PRIMARY KEY,\n  name TEXT,\n  type TEXT,\n  status TEXT\n);\n\nINSERT INTO equipment (name, type, status) VALUES \n('Old Red', 'Tractor', 'Operational');",
        validate: (db) => {
          const data = db.getTableData('equipment');
          return data && data.length >= 1;
        }
      }
    ]
  },

  2: {
    level: 2,
    title: "FIRST HARVEST",
    role: "Farmer",
    storyIntro: {
      headline: "The First Seeds in Soil",
      text: "Uncle Somu looks at the balance sheet: 'We have ₹500, but bills will arrive soon. We need our very first harvest to earn revenue! Tomatoes are fast growers and in high demand at the local market. Let's inspect our available plots and plant our first crop!'",
      notebookEntries: [
        { label: "Mission Goal", value: "Grow and harvest 40kg of ripe tomatoes" },
        { label: "Target Plot", value: "Plot A1" },
        { label: "Target Market", value: "₹20/kg at town wholesale market" },
        { label: "Expected Revenue", value: "₹800 cash" }
      ]
    },
    completion: {
      title: "LEVEL 2 COMPLETE",
      subtitle: "First harvest delivered and sold!",
      badge: "🌾 Harvest Master",
      summary: "You completed the full agricultural lifecycle with SQL: finding available land with WHERE, managing inventory with UPDATE, tracking crop growth, harvesting yield with the tractor, and selling produce for a ₹800 profit!",
      stats: [
        { label: "Tomatoes Harvested", value: "40 kg" },
        { label: "Total Revenue Earned", value: "₹800" },
        { label: "Ending Cash", value: "₹1,300" },
        { label: "SQL Operations Used", value: "SELECT, WHERE, UPDATE, INSERT" },
        { label: "Water Consumed", value: "400 L" },
        { label: "XP Earned", value: "+150 XP" }
      ],
      nextLevelTitle: "Level 3: Expanding Farmland (Plot A2 Unlocks!)"
    },
    missions: [
      {
        id: "L2_M0",
        title: "Find Available Plots",
        objective: "Use WHERE to find farm plots with status 'available'.",
        dialogue: "Uncle Somu: 'Before planting, we need to find empty soil. Query the plots table using a WHERE clause to filter for plots where status = \"available\".'",
        concept: "SELECT ... WHERE",
        hints: [
          "Use WHERE to filter records matching a condition.",
          "SELECT * FROM plots WHERE status = 'available';",
          "SELECT * FROM plots WHERE status = 'available';"
        ],
        solution: "SELECT * FROM plots WHERE status = 'available';",
        quickFill: "SELECT * FROM plots WHERE status = 'available';",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length > 0 && rows.every(r => r.includes('available'));
        }
      },
      {
        id: "L2_M1",
        title: "Check Tomato Seed Inventory",
        objective: "Inspect the seeds table specifically for 'Tomato'.",
        dialogue: "Uncle Somu: 'Now let us verify how many Tomato seeds we have in stock.'",
        concept: "WHERE with TEXT matching",
        hints: [
          "Filter seeds table where seed_name = 'Tomato'.",
          "SELECT * FROM seeds WHERE seed_name = 'Tomato';",
          "SELECT * FROM seeds WHERE seed_name = 'Tomato';"
        ],
        solution: "SELECT * FROM seeds WHERE seed_name = 'Tomato';",
        quickFill: "SELECT * FROM seeds WHERE seed_name = 'Tomato';",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.some(r => r.some(val => String(val).toLowerCase() === 'tomato'));
        }
      },
      {
        id: "L2_M2",
        title: "Plant Tomato in Plot A1",
        objective: "Decrease tomato seeds by 1, create farming record, and mark Plot A1 as occupied.",
        dialogue: "Uncle Somu: 'Time to sow! Execute the planting sequence: reduce tomato seeds by 1, record the planting in the farming table, and update Plot A1 to occupied!'",
        concept: "UPDATE, INSERT, and Relational State",
        hints: [
          "1. UPDATE seeds SET quantity = quantity - 1 WHERE seed_name = 'Tomato';",
          "2. CREATE TABLE IF NOT EXISTS farming (farming_id INTEGER PRIMARY KEY AUTOINCREMENT, plot_id TEXT, crop_id TEXT, status TEXT, growth_percent INTEGER);",
          "3. INSERT INTO farming (plot_id, crop_id, status, growth_percent) VALUES ('A1', 'Tomato', 'growing', 0);",
          "4. UPDATE plots SET status = 'occupied' WHERE plot_id = 'A1';"
        ],
        solution: "UPDATE seeds SET quantity = quantity - 1 WHERE seed_name = 'Tomato';\n\nCREATE TABLE IF NOT EXISTS farming (\n  farming_id INTEGER PRIMARY KEY AUTOINCREMENT,\n  plot_id TEXT,\n  crop_id TEXT,\n  status TEXT,\n  growth_percent INTEGER\n);\n\nINSERT INTO farming (plot_id, crop_id, status, growth_percent) VALUES ('A1', 'Tomato', 'growing', 0);\n\nUPDATE plots SET status = 'occupied' WHERE plot_id = 'A1';",
        quickFill: "UPDATE seeds SET quantity = quantity - 1 WHERE seed_name = 'Tomato';\n\nCREATE TABLE IF NOT EXISTS farming (\n  farming_id INTEGER PRIMARY KEY AUTOINCREMENT,\n  plot_id TEXT,\n  crop_id TEXT,\n  status TEXT,\n  growth_percent INTEGER\n);\n\nINSERT INTO farming (plot_id, crop_id, status, growth_percent) VALUES ('A1', 'Tomato', 'growing', 0);\n\nUPDATE plots SET status = 'occupied' WHERE plot_id = 'A1';",
        validate: (db) => {
          const plots = db.getTableData('plots');
          const pA1 = plots.find(p => p.plot_id === 'A1');
          const farming = db.getTableData('farming');
          const hasFarming = farming.some(f => f.plot_id === 'A1');
          return (pA1 && pA1.status === 'occupied') || hasFarming;
        }
      },
      {
        id: "L2_M3",
        title: "Nurture Crop to Full Growth",
        objective: "Advance farm days using the top navigation button until tomatoes reach 100% growth.",
        dialogue: "Uncle Somu: 'Look! The seedling has sprouted in Plot A1! Click \"Advance Day\" in the top bar to water and nurture the crops over the coming days until they are ripe.'",
        concept: "Agricultural cycle & In-game Day Progression",
        hints: [
          "Click the blue 'Advance Day' button in the top navigation bar.",
          "Each day adds 25%-35% growth to the crop in Plot A1 and consumes water from the reservoir.",
          "Advance the day until the tomatoes reach 100% growth (ready for harvest)!"
        ],
        solution: "-- Click the 'Advance Day' button on the top navigation bar!",
        quickFill: "-- Advance day via top navigation button",
        validate: (db) => {
          const farming = db.getTableData('farming');
          const f = farming.find(f => f.plot_id === 'A1');
          return f && f.growth_percent >= 100;
        }
      },
      {
        id: "L2_M4",
        title: "Harvest the Ripe Crop",
        objective: "Execute harvest SQL to free Plot A1 and add 40kg of Tomato to warehouse stock.",
        dialogue: "Uncle Somu: 'The tomatoes are ripe and glistening in the morning sun! Let us harvest them with the tractor, free up Plot A1, and store 40kg of fresh tomatoes in our warehouse!'",
        concept: "Stock Management, Harvest & State Transition",
        hints: [
          "1. UPDATE farming SET status = 'harvested' WHERE plot_id = 'A1';",
          "2. UPDATE plots SET status = 'available' WHERE plot_id = 'A1';",
          "3. CREATE TABLE IF NOT EXISTS stock (stock_id INTEGER PRIMARY KEY AUTOINCREMENT, product_name TEXT, quantity INTEGER, unit TEXT, price INTEGER);",
          "4. INSERT INTO stock (product_name, quantity, unit, price) VALUES ('Tomato', 40, 'kg', 20);"
        ],
        solution: "UPDATE farming SET status = 'harvested' WHERE plot_id = 'A1';\n\nUPDATE plots SET status = 'available' WHERE plot_id = 'A1';\n\nCREATE TABLE IF NOT EXISTS stock (\n  stock_id INTEGER PRIMARY KEY AUTOINCREMENT,\n  product_name TEXT,\n  quantity INTEGER,\n  unit TEXT,\n  price INTEGER\n);\n\nINSERT INTO stock (product_name, quantity, unit, price) VALUES ('Tomato', 40, 'kg', 20);",
        quickFill: "UPDATE farming SET status = 'harvested' WHERE plot_id = 'A1';\n\nUPDATE plots SET status = 'available' WHERE plot_id = 'A1';\n\nCREATE TABLE IF NOT EXISTS stock (\n  stock_id INTEGER PRIMARY KEY AUTOINCREMENT,\n  product_name TEXT,\n  quantity INTEGER,\n  unit TEXT,\n  price INTEGER\n);\n\nINSERT INTO stock (product_name, quantity, unit, price) VALUES ('Tomato', 40, 'kg', 20);",
        validate: (db) => {
          const plots = db.getTableData('plots');
          const pA1 = plots.find(p => p.plot_id === 'A1');
          const stock = db.getTableData('stock');
          const tomatoStock = stock.find(s => (s.product_name || '').toLowerCase() === 'tomato');
          return (pA1 && pA1.status === 'available') && (tomatoStock && tomatoStock.quantity >= 40);
        }
      },
      {
        id: "L2_M5",
        title: "Sell Produce at Town Market",
        objective: "Update stock to sell 40kg of tomatoes and collect ₹800 cash.",
        dialogue: "Uncle Somu: 'A buyer from Green Grocers wants our entire 40kg tomato harvest at ₹20 per kg! Update the warehouse stock to 0 to complete the order!'",
        concept: "UPDATE stock & Market Transaction",
        hints: [
          "Reduce tomato stock quantity by 40 (or set to 0).",
          "UPDATE stock SET quantity = quantity - 40 WHERE product_name = 'Tomato';",
          "UPDATE stock SET quantity = 0 WHERE product_name = 'Tomato';"
        ],
        solution: "UPDATE stock SET quantity = quantity - 40 WHERE product_name = 'Tomato';",
        quickFill: "UPDATE stock SET quantity = quantity - 40 WHERE product_name = 'Tomato';",
        validate: (db) => {
          const stock = db.getTableData('stock');
          const tomato = stock.find(s => (s.product_name || '').toLowerCase() === 'tomato');
          return tomato && tomato.quantity === 0;
        }
      }
    ]
  },

  // Roadmapped Levels 3-10
  3: { level: 3, title: "THE FARM GETS BUSY", role: "Farm Operator", concept: "ORDER BY, GROUP BY, Aggregate functions (COUNT, SUM, AVG, MIN, MAX), HAVING", locked: true, teaser: "Multiple crops (Tomato, Rice, Wheat, Corn) are thriving across many plots. Learn visual grouping and statistical yield analysis." },
  4: { level: 4, title: "THE SUPPLY PROBLEM", role: "Supply Manager", concept: "AND, OR, IN, BETWEEN, LIKE, CASE, NULL handling", locked: true, teaser: "Seed, fertilizer, and feed shortages hit the farm! Connect with suppliers and dispatch delivery trucks." },
  5: { level: 5, title: "THE MARKET", role: "Market Seller", concept: "Date functions, fluctuating market prices, calculated fields, customer orders", locked: true, teaser: "Prices fluctuate dynamically. Time your harvest sales and serve restaurant buyers for peak revenue." },
  6: { level: 6, title: "FARM MANAGER", role: "Farm Manager", concept: "INNER JOIN, LEFT JOIN, multiple-table relational reports", locked: true, teaser: "Hire workers (Ravi, Maya, Arjun) and assign staff to plots and machinery using relational joins." },
  7: { level: 7, title: "THE NUMBERS DON'T MATCH", role: "Financial Manager", concept: "Subqueries, nested queries, financial reconciliation", locked: true, teaser: "A ₹49,000 cash discrepancy threatens the farm. Uncover hidden expenses and billing errors using nested SQL." },
  8: { level: 8, title: "THE EXPANSION", role: "Expansion Manager", concept: "CTEs (WITH), multi-farm schemas, regional analysis", locked: true, teaser: "Acquire Farm North, Farm South, and Farm East. Conduct multi-facility performance comparisons." },
  9: { level: 9, title: "THE AGRICULTURAL EMPIRE", role: "Agribusiness Executive", concept: "Window functions (RANK, ROW_NUMBER, PARTITION BY), running totals", locked: true, teaser: "Analyze top 3 crops per farm, rank employee productivity, and forecast enterprise cash flows." },
  10: { level: 10, title: "THE HARVEST DECISION", role: "Farm CEO", concept: "Comprehensive strategic data synthesis under severe drought constraints", locked: true, teaser: "A severe drought threatens the region! Synthesize historical yields, water limits, and margins to steer the business to survival." }
};

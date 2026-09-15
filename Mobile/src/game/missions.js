/**
 * FARMDB Mission Definitions & Story Narrative
 * Levels 1 & 2 fully playable; Levels 3-10 roadmap
 */

export const MISSIONS_DATA = {
  1: {
    level: 1,
    title: "THE EMPTY FARM",
    role: "New Farmer",
    concept: "CREATE TABLE, INSERT, SELECT",
    cutscene: {
      title: "Chapter 1: The Inherited Homestead",
      image: "/images/cinematics/level1_homestead.jpg",
      duration: 11,
      mood: "peaceful",
      subtitles: [
        { start: 0, end: 3.5, text: "You step onto the quiet soil of your grandfather's countryside farmstead." },
        { start: 3.5, end: 7.5, text: "The fields rest silently, and an old red tractor sleeps in the yard." },
        { start: 7.5, end: 11, text: "Uncle Somu: 'A modern farm needs a memory. Welcome to FARMDB.'" }
      ]
    },
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
    concept: "WHERE, UPDATE, Crop Lifecycle",
    cutscene: {
      title: "Chapter 2: First Harvest & Morning Dew",
      image: "/images/cinematics/level2_harvest.jpg",
      duration: 11,
      mood: "energetic",
      subtitles: [
        { start: 0, end: 3.5, text: "Golden morning sunlight warms the fertile soil of Plot A1." },
        { start: 3.5, end: 7.5, text: "The first tomato seedlings are ready to sprout, water, and grow." },
        { start: 7.5, end: 11, text: "Uncle Somu: 'Nurture your crops and sell produce for our very first profit!'" }
      ]
    },
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

  // ==========================================================
  // LEVEL 3: THE FARM GETS BUSY
  // ==========================================================
  3: {
    level: 3,
    title: "THE FARM GETS BUSY",
    role: "Farm Operator",
    concept: "ORDER BY, GROUP BY, Aggregates (COUNT, SUM, AVG, MIN, MAX), HAVING",
    teaser: "Multiple crops (Tomato, Rice, Wheat, Corn) are thriving across plots. Learn visual grouping and statistical yield analysis.",
    cutscene: {
      title: "Chapter 3: The Bustling Farmland",
      image: "/images/cinematics/level3_fields.jpg",
      duration: 11,
      mood: "energetic",
      subtitles: [
        { start: 0, end: 3.5, text: "The morning breeze sweeps across fertile fields of golden wheat and tall green corn." },
        { start: 3.5, end: 7.5, text: "With Plot A2 unlocked, harvest yields are piling up in the storage warehouse." },
        { start: 7.5, end: 11, text: "Uncle Somu: 'Handwritten notes won't do anymore. We need SQL analytics to find our top crops!'" }
      ]
    },
    storyIntro: {
      headline: "Plot A2 Unlocks & Harvest Analytics",
      text: "Uncle Somu points across the fence: 'Good news! Our harvest revenue paid off the lease on Plot A2! Both North and South beds of A2 are now ready for sowing. We're growing Tomatoes, Wheat, Rice, and Corn. With so much produce entering our warehouse, we need SQL ordering, grouping, and statistical aggregates to make sense of our yields!'",
      notebookEntries: [
        { label: "New Acreage", value: "Plot A2 (A2.1 North Bed & A2.2 South Bed) Unlocked" },
        { label: "Crops in Production", value: "Tomato, Wheat, Rice, Corn" },
        { label: "Operational Target", value: "Stock multi-crop yields and run SQL analytics" },
        { label: "Key SQL Concepts", value: "ORDER BY, GROUP BY, COUNT, SUM, AVG, HAVING" }
      ]
    },
    completion: {
      title: "LEVEL 3 COMPLETE",
      subtitle: "Master of Agricultural Analytics!",
      badge: "📊 Yield Analyst",
      summary: "You mastered SQL data analytics! By sorting with ORDER BY, aggregating with COUNT/SUM/AVG, and filtering grouped yields with HAVING, you unlocked clear operational insights into the farm's multi-crop production.",
      stats: [
        { label: "Plots Active", value: "2 Plots (A1, A2)" },
        { label: "Crops Tracked", value: "4 Varieties" },
        { label: "Total Yield Analyzed", value: "350 kg" },
        { label: "Cash Reward", value: "+₹1,500" },
        { label: "XP Earned", value: "+200 XP" }
      ],
      nextLevelTitle: "Level 4: The Supply Problem (Plot A3 Unlocks!)"
    },
    missions: [
      {
        id: "L3_M0",
        title: "Verify Unlocked Plot A2",
        objective: "Query the plots table using WHERE to verify Plot A2 is available for cultivation.",
        dialogue: "Uncle Somu: 'Inspect our expanded farmland. Run a query for available plots to confirm Plot A2 is open!'",
        concept: "SELECT ... WHERE",
        hints: [
          "Query all rows from plots where status is 'available'.",
          "SELECT * FROM plots WHERE status = 'available';",
          "SELECT * FROM plots WHERE status = 'available';"
        ],
        solution: "SELECT * FROM plots WHERE status = 'available';",
        quickFill: "SELECT * FROM plots WHERE status = 'available';",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.some(r => r.some(val => String(val).includes('A2')));
        }
      },
      {
        id: "L3_M1",
        title: "Stock Multi-Crop Harvest Batch",
        objective: "Insert harvested stock for Wheat, Rice, Corn, and fresh Tomatoes into the warehouse stock table.",
        dialogue: "Uncle Somu: 'The harvest carts just arrived from the fields! Let us record 80kg of Wheat, 120kg of Rice, 60kg of Corn, and 90kg of Tomatoes into our stock table.'",
        concept: "INSERT INTO multiple rows",
        hints: [
          "Insert 4 rows into stock with columns (product_name, quantity, unit, price).",
          "Include Wheat (80kg @ ₹15), Rice (120kg @ ₹25), Corn (60kg @ ₹18), and Tomato (90kg @ ₹20).",
          "INSERT INTO stock (product_name, quantity, unit, price) VALUES \n('Wheat', 80, 'kg', 15),\n('Rice', 120, 'kg', 25),\n('Corn', 60, 'kg', 18),\n('Tomato', 90, 'kg', 20);"
        ],
        solution: "INSERT INTO stock (product_name, quantity, unit, price) VALUES \n('Wheat', 80, 'kg', 15),\n('Rice', 120, 'kg', 25),\n('Corn', 60, 'kg', 18),\n('Tomato', 90, 'kg', 20);",
        quickFill: "INSERT INTO stock (product_name, quantity, unit, price) VALUES \n('Wheat', 80, 'kg', 15),\n('Rice', 120, 'kg', 25),\n('Corn', 60, 'kg', 18),\n('Tomato', 90, 'kg', 20);",
        validate: (db) => {
          const stock = db.getTableData('stock');
          if (!stock || stock.length < 3) return false;
          const names = stock.map(s => (s.product_name || '').toLowerCase());
          return names.includes('wheat') && names.includes('rice') && names.includes('corn');
        }
      },
      {
        id: "L3_M2",
        title: "Sort Warehouse Inventory by Yield",
        objective: "Use ORDER BY quantity DESC to rank crops from highest yield to lowest.",
        dialogue: "Uncle Somu: 'Which crop produced the heaviest harvest? Sort our warehouse stock in descending order of quantity!'",
        concept: "SELECT ... ORDER BY DESC",
        hints: [
          "Use ORDER BY with the column name 'quantity' followed by DESC.",
          "SELECT * FROM stock ORDER BY quantity DESC;",
          "SELECT * FROM stock ORDER BY quantity DESC;"
        ],
        solution: "SELECT * FROM stock ORDER BY quantity DESC;",
        quickFill: "SELECT * FROM stock ORDER BY quantity DESC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const qtyIdx = cols.indexOf('quantity');
          if (qtyIdx === -1) return false;
          const rows = queryResult.results[0].values;
          if (rows.length < 2) return false;
          for (let i = 0; i < rows.length - 1; i++) {
            if (Number(rows[i][qtyIdx]) < Number(rows[i + 1][qtyIdx])) return false;
          }
          return true;
        }
      },
      {
        id: "L3_M3",
        title: "Calculate Inventory Statistics",
        objective: "Calculate total item count, total yield in kg, and average unit price across warehouse stock.",
        dialogue: "Uncle Somu: 'Now calculate our grand totals: COUNT of products, SUM of quantity, and AVG of price.'",
        concept: "Aggregates: COUNT, SUM, AVG",
        hints: [
          "Use COUNT(*), SUM(quantity), and AVG(price) in your SELECT clause.",
          "SELECT COUNT(*) AS total_items, SUM(quantity) AS total_kg, AVG(price) AS avg_unit_price FROM stock;",
          "SELECT COUNT(*) AS total_items, SUM(quantity) AS total_kg, AVG(price) AS avg_unit_price FROM stock;"
        ],
        solution: "SELECT COUNT(*) AS total_items, SUM(quantity) AS total_kg, AVG(price) AS avg_unit_price FROM stock;",
        quickFill: "SELECT COUNT(*) AS total_items, SUM(quantity) AS total_kg, AVG(price) AS avg_unit_price FROM stock;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return (cols.some(c => c.includes('count') || c.includes('items')) ||
                  cols.some(c => c.includes('sum') || c.includes('kg') || c.includes('total'))) &&
                  queryResult.results[0].values.length === 1;
        }
      },
      {
        id: "L3_M4",
        title: "Group Harvest by Crop Variety",
        objective: "Use GROUP BY product_name to find total yield and average price per crop.",
        dialogue: "Uncle Somu: 'Let us group our inventory by crop name so we have clean totals for each variety.'",
        concept: "GROUP BY with SUM & AVG",
        hints: [
          "Select product_name, SUM(quantity) AS total_yield, AVG(price) AS avg_price FROM stock GROUP BY product_name.",
          "SELECT product_name, SUM(quantity) AS total_yield, AVG(price) AS avg_price FROM stock GROUP BY product_name;",
          "SELECT product_name, SUM(quantity) AS total_yield, AVG(price) AS avg_price FROM stock GROUP BY product_name;"
        ],
        solution: "SELECT product_name, SUM(quantity) AS total_yield, AVG(price) AS avg_price FROM stock GROUP BY product_name;",
        quickFill: "SELECT product_name, SUM(quantity) AS total_yield, AVG(price) AS avg_price FROM stock GROUP BY product_name;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('product_name') && queryResult.results[0].values.length >= 3;
        }
      },
      {
        id: "L3_M5",
        title: "Filter High-Yield Crops with HAVING",
        objective: "Use GROUP BY with HAVING to display only crops with total yield >= 80 kg.",
        dialogue: "Uncle Somu: 'Our market trucks only haul major bulk crops. Use HAVING to filter for crop varieties with 80kg or more!'",
        concept: "GROUP BY ... HAVING",
        hints: [
          "Remember: WHERE filters individual rows before grouping; HAVING filters aggregated groups after grouping!",
          "SELECT product_name, SUM(quantity) AS total_yield FROM stock GROUP BY product_name HAVING SUM(quantity) >= 80;",
          "SELECT product_name, SUM(quantity) AS total_yield FROM stock GROUP BY product_name HAVING SUM(quantity) >= 80;"
        ],
        solution: "SELECT product_name, SUM(quantity) AS total_yield FROM stock GROUP BY product_name HAVING SUM(quantity) >= 80;",
        quickFill: "SELECT product_name, SUM(quantity) AS total_yield FROM stock GROUP BY product_name HAVING SUM(quantity) >= 80;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          if (rows.length === 0) return false;
          const hasCorn = rows.some(r => r.some(val => String(val).toLowerCase() === 'corn'));
          return !hasCorn && rows.length >= 2;
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 4: THE SUPPLY PROBLEM
  // ==========================================================
  4: {
    level: 4,
    title: "THE SUPPLY PROBLEM",
    role: "Supply Manager",
    concept: "AND, OR, IN, BETWEEN, LIKE, CASE, NULL handling",
    teaser: "Seed, fertilizer, and feed shortages hit the farm! Connect with suppliers and dispatch delivery trucks.",
    cutscene: {
      title: "Chapter 4: Supply Train & Logistics",
      image: "/images/cinematics/level4_supplies.jpg",
      duration: 11,
      mood: "logistics",
      subtitles: [
        { start: 0, end: 3.5, text: "Supply trucks roll into the farm depot as seed sacks and feed bags stack high." },
        { start: 3.5, end: 7.5, text: "With Plot A3 opening, fertilizer and cattle feed reserves are running critically low." },
        { start: 7.5, end: 11, text: "Uncle Somu: 'Connect our farm with trusted suppliers and audit our inventory thresholds!'" }
      ]
    },
    storyIntro: {
      headline: "Plot A3 Unlocks & Supply Chain Crisis",
      text: "Uncle Somu wipes his brow: 'We've expanded to Plot A3! But with three acres under cultivation, we're burning through fertilizer and seeds faster than ever. We've established accounts with regional agricultural suppliers, but we need to audit what supplies are running low, filter vendors within budget, and triage emergency reorders using SQL logical operators!'",
      notebookEntries: [
        { label: "New Acreage", value: "Plot A3 (A3.1 North Bed & A3.2 South Bed) Unlocked" },
        { label: "Active Shortage", value: "Bio-Fertilizers, Seed stock & Feed pellets" },
        { label: "Target", value: "Build suppliers & supplies catalog; audit stock thresholds" },
        { label: "Key SQL Concepts", value: "AND, OR, IN, BETWEEN, LIKE, CASE WHEN, IS NULL" }
      ]
    },
    completion: {
      title: "LEVEL 4 COMPLETE",
      subtitle: "Supply Chain Fully Restored!",
      badge: "📦 Supply Chain Master",
      summary: "You organized the farm's supply chain! Using complex conditional filters (AND, OR, IN, BETWEEN, LIKE) and triage status classification (CASE WHEN), you ensured our warehouses never run out of vital farming inputs.",
      stats: [
        { label: "Plots Active", value: "3 Plots (A1, A2, A3)" },
        { label: "Suppliers Cataloged", value: "3 Vendors" },
        { label: "Critical Shortages Fixed", value: "5 Items" },
        { label: "Cash Bonus", value: "+₹2,000" },
        { label: "XP Earned", value: "+250 XP" }
      ],
      nextLevelTitle: "Level 5: The Market (Plot A4 Unlocks!)"
    },
    missions: [
      {
        id: "L4_M0",
        title: "Create Supply Management Tables",
        objective: "Create 'suppliers' and 'supplies' tables in SQLite for farm logistics.",
        dialogue: "Uncle Somu: 'First, create two tables: suppliers (supplier_id, supplier_name, contact, city) and supplies (supply_id, item_name, category, stock_level, reorder_level, unit_cost, supplier_id).'",
        concept: "CREATE TABLE with Foreign Keys",
        hints: [
          "Create suppliers and supplies tables.",
          "CREATE TABLE suppliers (...); CREATE TABLE supplies (...);",
          "CREATE TABLE suppliers (\n  supplier_id INTEGER PRIMARY KEY,\n  supplier_name TEXT,\n  contact TEXT,\n  city TEXT\n);\n\nCREATE TABLE supplies (\n  supply_id INTEGER PRIMARY KEY,\n  item_name TEXT,\n  category TEXT,\n  stock_level INTEGER,\n  reorder_level INTEGER,\n  unit_cost INTEGER,\n  supplier_id INTEGER\n);"
        ],
        solution: "CREATE TABLE suppliers (\n  supplier_id INTEGER PRIMARY KEY,\n  supplier_name TEXT,\n  contact TEXT,\n  city TEXT\n);\n\nCREATE TABLE supplies (\n  supply_id INTEGER PRIMARY KEY,\n  item_name TEXT,\n  category TEXT,\n  stock_level INTEGER,\n  reorder_level INTEGER,\n  unit_cost INTEGER,\n  supplier_id INTEGER\n);",
        quickFill: "CREATE TABLE suppliers (\n  supplier_id INTEGER PRIMARY KEY,\n  supplier_name TEXT,\n  contact TEXT,\n  city TEXT\n);\n\nCREATE TABLE supplies (\n  supply_id INTEGER PRIMARY KEY,\n  item_name TEXT,\n  category TEXT,\n  stock_level INTEGER,\n  reorder_level INTEGER,\n  unit_cost INTEGER,\n  supplier_id INTEGER\n);",
        validate: (db) => {
          const schema = db.getSchema();
          return !!schema['suppliers'] && !!schema['supplies'];
        }
      },
      {
        id: "L4_M1",
        title: "Seed Suppliers & Warehouse Inventory",
        objective: "Insert supplier directory and supply records into the newly created tables.",
        dialogue: "Uncle Somu: 'Insert our three primary suppliers and inventory records into supplies.'",
        concept: "INSERT INTO",
        hints: [
          "Insert records into suppliers and supplies.",
          "Use INSERT INTO suppliers ... and INSERT INTO supplies ...",
          "INSERT INTO suppliers (supplier_id, supplier_name, contact, city) VALUES \n(1, 'GreenAgro Supplies', '9876543210', 'Green Valley'),\n(2, 'Kisan BioTech', NULL, 'Rivertown'),\n(3, 'Sunrise Organics', '9123456780', 'Metro Hills');\n\nINSERT INTO supplies (item_name, category, stock_level, reorder_level, unit_cost, supplier_id) VALUES \n('Organic NPK Fertilizer', 'Fertilizer', 5, 20, 450, 1),\n('Bio-Compost Mix', 'Fertilizer', 30, 15, 250, 3),\n('Hybrid Corn Seeds', 'Seeds', 8, 25, 380, 1),\n('Wheat Seed Bags', 'Seeds', 50, 20, 180, 2),\n('Cattle Feed Pellets', 'Feed', 12, 40, 520, 1),\n('Drip Irrigation Pipe', 'Equipment', 15, 10, 850, 2);"
        ],
        solution: "INSERT INTO suppliers (supplier_id, supplier_name, contact, city) VALUES \n(1, 'GreenAgro Supplies', '9876543210', 'Green Valley'),\n(2, 'Kisan BioTech', NULL, 'Rivertown'),\n(3, 'Sunrise Organics', '9123456780', 'Metro Hills');\n\nINSERT INTO supplies (item_name, category, stock_level, reorder_level, unit_cost, supplier_id) VALUES \n('Organic NPK Fertilizer', 'Fertilizer', 5, 20, 450, 1),\n('Bio-Compost Mix', 'Fertilizer', 30, 15, 250, 3),\n('Hybrid Corn Seeds', 'Seeds', 8, 25, 380, 1),\n('Wheat Seed Bags', 'Seeds', 50, 20, 180, 2),\n('Cattle Feed Pellets', 'Feed', 12, 40, 520, 1),\n('Drip Irrigation Pipe', 'Equipment', 15, 10, 850, 2);",
        quickFill: "INSERT INTO suppliers (supplier_id, supplier_name, contact, city) VALUES \n(1, 'GreenAgro Supplies', '9876543210', 'Green Valley'),\n(2, 'Kisan BioTech', NULL, 'Rivertown'),\n(3, 'Sunrise Organics', '9123456780', 'Metro Hills');\n\nINSERT INTO supplies (item_name, category, stock_level, reorder_level, unit_cost, supplier_id) VALUES \n('Organic NPK Fertilizer', 'Fertilizer', 5, 20, 450, 1),\n('Bio-Compost Mix', 'Fertilizer', 30, 15, 250, 3),\n('Hybrid Corn Seeds', 'Seeds', 8, 25, 380, 1),\n('Wheat Seed Bags', 'Seeds', 50, 20, 180, 2),\n('Cattle Feed Pellets', 'Feed', 12, 40, 520, 1),\n('Drip Irrigation Pipe', 'Equipment', 15, 10, 850, 2);",
        validate: (db) => {
          const supps = db.getTableData('supplies');
          return supps && supps.length >= 5;
        }
      },
      {
        id: "L4_M2",
        title: "Find Urgent Low-Stock Items (AND / OR)",
        objective: "Query supplies where stock_level <= reorder_level AND unit_cost <= 500.",
        dialogue: "Uncle Somu: 'Find affordable supplies that have dropped below their reorder threshold using an AND condition!'",
        concept: "WHERE condition1 AND condition2",
        hints: [
          "Filter supplies where stock_level <= reorder_level AND unit_cost <= 500.",
          "SELECT * FROM supplies WHERE stock_level <= reorder_level AND unit_cost <= 500;",
          "SELECT * FROM supplies WHERE stock_level <= reorder_level AND unit_cost <= 500;"
        ],
        solution: "SELECT * FROM supplies WHERE stock_level <= reorder_level AND unit_cost <= 500;",
        quickFill: "SELECT * FROM supplies WHERE stock_level <= reorder_level AND unit_cost <= 500;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length >= 2;
        }
      },
      {
        id: "L4_M3",
        title: "Target Key Categories with IN & BETWEEN",
        objective: "Filter supplies for category IN ('Fertilizer', 'Seeds') with unit_cost BETWEEN 200 AND 500.",
        dialogue: "Uncle Somu: 'Now target only our core inputs: Fertilizer and Seeds, with prices between ₹200 and ₹500.'",
        concept: "IN ('...', '...') & BETWEEN min AND max",
        hints: [
          "Use IN ('Fertilizer', 'Seeds') and BETWEEN 200 AND 500.",
          "SELECT * FROM supplies WHERE category IN ('Fertilizer', 'Seeds') AND unit_cost BETWEEN 200 AND 500;",
          "SELECT * FROM supplies WHERE category IN ('Fertilizer', 'Seeds') AND unit_cost BETWEEN 200 AND 500;"
        ],
        solution: "SELECT * FROM supplies WHERE category IN ('Fertilizer', 'Seeds') AND unit_cost BETWEEN 200 AND 500;",
        quickFill: "SELECT * FROM supplies WHERE category IN ('Fertilizer', 'Seeds') AND unit_cost BETWEEN 200 AND 500;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length >= 2;
        }
      },
      {
        id: "L4_M4",
        title: "Find Certified Organic Supplies with LIKE",
        objective: "Use pattern matching LIKE '%Organic%' to query all organic products.",
        dialogue: "Uncle Somu: 'Our farm is committed to sustainable agriculture. Find all products with \"Organic\" in their name or category!'",
        concept: "Pattern Matching with LIKE '%...%'",
        hints: [
          "Use WHERE item_name LIKE '%Organic%' OR category LIKE '%Organic%'.",
          "SELECT * FROM supplies WHERE item_name LIKE '%Organic%' OR category LIKE '%Organic%';",
          "SELECT * FROM supplies WHERE item_name LIKE '%Organic%' OR category LIKE '%Organic%';"
        ],
        solution: "SELECT * FROM supplies WHERE item_name LIKE '%Organic%' OR category LIKE '%Organic%';",
        quickFill: "SELECT * FROM supplies WHERE item_name LIKE '%Organic%' OR category LIKE '%Organic%';",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length >= 1 && rows.some(r => r.some(val => String(val).toLowerCase().includes('organic')));
        }
      },
      {
        id: "L4_M5",
        title: "Triage Inventory Status with CASE WHEN",
        objective: "Classify items into 'Reorder Needed' or 'Sufficient' using a CASE WHEN expression.",
        dialogue: "Uncle Somu: 'Write a CASE statement to produce an operational dashboard report classifying each supply as Reorder Needed or Sufficient!'",
        concept: "Conditional logic: CASE WHEN ... THEN ... ELSE ... END",
        hints: [
          "Select item_name, stock_level, reorder_level, and a CASE WHEN expression for status.",
          "SELECT item_name, stock_level, reorder_level, CASE WHEN stock_level <= reorder_level THEN 'Reorder Needed' ELSE 'Sufficient' END AS stock_status FROM supplies;",
          "SELECT item_name, stock_level, reorder_level, CASE WHEN stock_level <= reorder_level THEN 'Reorder Needed' ELSE 'Sufficient' END AS stock_status FROM supplies;"
        ],
        solution: "SELECT item_name, stock_level, reorder_level, CASE WHEN stock_level <= reorder_level THEN 'Reorder Needed' ELSE 'Sufficient' END AS stock_status FROM supplies;",
        quickFill: "SELECT item_name, stock_level, reorder_level, CASE WHEN stock_level <= reorder_level THEN 'Reorder Needed' ELSE 'Sufficient' END AS stock_status FROM supplies;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('item_name') && queryResult.results[0].values.length >= 4;
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 5: THE MARKET
  // ==========================================================
  5: {
    level: 5,
    title: "THE MARKET",
    role: "Market Seller",
    concept: "Date functions, calculated fields, dynamic pricing, customer orders",
    teaser: "Prices fluctuate dynamically. Time your harvest sales and serve restaurant buyers for peak revenue.",
    cutscene: {
      title: "Chapter 5: The Vibrant Town Market",
      image: "/images/cinematics/level5_market.jpg",
      duration: 11,
      mood: "market",
      subtitles: [
        { start: 0, end: 3.5, text: "Crates of fresh produce line the bustling morning bazaar." },
        { start: 3.5, end: 7.5, text: "City restaurants and wholesale buyers negotiate for prime harvest." },
        { start: 7.5, end: 11, text: "Uncle Somu: 'Timing is everything in agriculture. Sell high and lock in contracts!'" }
      ]
    },
    storyIntro: {
      headline: "Plot A4 Unlocks & Restaurant Contracts",
      text: "Uncle Somu smiles broadly: 'Plot A4 is now open for farming! Our production capacity has reached commercial scale. City restaurants and grocery chains are submitting purchase orders. Market prices fluctuate daily. We need to track price trends, calculate profit margins, and fulfill high-value contracts using SQL date and math calculations!'",
      notebookEntries: [
        { label: "New Acreage", value: "Plot A4 (A4.1 North Bed & A4.2 South Bed) Unlocked" },
        { label: "Market Buyers", value: "Bistros, Curry Houses, Flour Mills" },
        { label: "Target", value: "Fulfill high-margin commercial contracts" },
        { label: "Key SQL Concepts", value: "Date functions (date()), calculated fields, UPDATE" }
      ]
    },
    completion: {
      title: "LEVEL 5 COMPLETE",
      subtitle: "Commercial Trader & Market Master!",
      badge: "🏷️ Market Mogul",
      summary: "You mastered agricultural commerce! By tracking market prices with date calculations, calculating order revenues, and fulfilling restaurant purchase contracts, you brought unprecedented cash flow into the farm treasury.",
      stats: [
        { label: "Plots Active", value: "4 Plots (A1 to A4)" },
        { label: "Contracts Fulfillable", value: "3 Commercial Buyers" },
        { label: "Contract Revenue", value: "₹1,680 Cash" },
        { label: "Cash Bonus", value: "+₹3,500" },
        { label: "XP Earned", value: "+300 XP" }
      ],
      nextLevelTitle: "Level 6: Farm Manager (Plot A5 Unlocks!)"
    },
    missions: [
      {
        id: "L5_M0",
        title: "Create Market Tables",
        objective: "Create 'market_prices' and 'orders' tables in SQLite.",
        dialogue: "Uncle Somu: 'Set up tables to track daily market prices and inbound customer purchase orders.'",
        concept: "CREATE TABLE for Commerce",
        hints: [
          "Create market_prices and orders tables.",
          "CREATE TABLE market_prices (...); CREATE TABLE orders (...);",
          "CREATE TABLE market_prices (\n  price_id INTEGER PRIMARY KEY,\n  crop_name TEXT,\n  market_name TEXT,\n  price_per_kg INTEGER,\n  recorded_date TEXT\n);\n\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_name TEXT,\n  crop_name TEXT,\n  quantity_kg INTEGER,\n  unit_price INTEGER,\n  order_date TEXT,\n  status TEXT\n);"
        ],
        solution: "CREATE TABLE market_prices (\n  price_id INTEGER PRIMARY KEY,\n  crop_name TEXT,\n  market_name TEXT,\n  price_per_kg INTEGER,\n  recorded_date TEXT\n);\n\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_name TEXT,\n  crop_name TEXT,\n  quantity_kg INTEGER,\n  unit_price INTEGER,\n  order_date TEXT,\n  status TEXT\n);",
        quickFill: "CREATE TABLE market_prices (\n  price_id INTEGER PRIMARY KEY,\n  crop_name TEXT,\n  market_name TEXT,\n  price_per_kg INTEGER,\n  recorded_date TEXT\n);\n\nCREATE TABLE orders (\n  order_id INTEGER PRIMARY KEY,\n  customer_name TEXT,\n  crop_name TEXT,\n  quantity_kg INTEGER,\n  unit_price INTEGER,\n  order_date TEXT,\n  status TEXT\n);",
        validate: (db) => {
          const schema = db.getSchema();
          return !!schema['market_prices'] && !!schema['orders'];
        }
      },
      {
        id: "L5_M1",
        title: "Record Market Prices & Inbound Orders",
        objective: "Insert daily market quotes and pending restaurant contracts into SQLite.",
        dialogue: "Uncle Somu: 'Insert today\'s market price feeds and active orders from Chef Mario, Royal Curry, and Bakery Delights!'",
        concept: "INSERT INTO with Date Defaults",
        hints: [
          "Insert records into market_prices and orders.",
          "Use date('now') or standard date strings.",
          "INSERT INTO market_prices (crop_name, market_name, price_per_kg, recorded_date) VALUES \n('Tomato', 'Wholesale Depot', 22, date('now')),\n('Tomato', 'Chef Syndicate', 28, date('now')),\n('Rice', 'Central Grain Mart', 30, date('now')),\n('Wheat', 'City Flour Mill', 18, date('now')),\n('Corn', 'Local Farmers Market', 24, date('now'));\n\nINSERT INTO orders (customer_name, crop_name, quantity_kg, unit_price, order_date, status) VALUES \n('Chef Mario Italian Bistro', 'Tomato', 60, 28, date('now', '-2 days'), 'pending'),\n('Royal Curry House', 'Rice', 100, 30, date('now', '-4 days'), 'pending'),\n('Bakery Delights', 'Wheat', 50, 18, date('now', '-10 days'), 'pending');"
        ],
        solution: "INSERT INTO market_prices (crop_name, market_name, price_per_kg, recorded_date) VALUES \n('Tomato', 'Wholesale Depot', 22, date('now')),\n('Tomato', 'Chef Syndicate', 28, date('now')),\n('Rice', 'Central Grain Mart', 30, date('now')),\n('Wheat', 'City Flour Mill', 18, date('now')),\n('Corn', 'Local Farmers Market', 24, date('now'));\n\nINSERT INTO orders (customer_name, crop_name, quantity_kg, unit_price, order_date, status) VALUES \n('Chef Mario Italian Bistro', 'Tomato', 60, 28, date('now', '-2 days'), 'pending'),\n('Royal Curry House', 'Rice', 100, 30, date('now', '-4 days'), 'pending'),\n('Bakery Delights', 'Wheat', 50, 18, date('now', '-10 days'), 'pending');",
        quickFill: "INSERT INTO market_prices (crop_name, market_name, price_per_kg, recorded_date) VALUES \n('Tomato', 'Wholesale Depot', 22, date('now')),\n('Tomato', 'Chef Syndicate', 28, date('now')),\n('Rice', 'Central Grain Mart', 30, date('now')),\n('Wheat', 'City Flour Mill', 18, date('now')),\n('Corn', 'Local Farmers Market', 24, date('now'));\n\nINSERT INTO orders (customer_name, crop_name, quantity_kg, unit_price, order_date, status) VALUES \n('Chef Mario Italian Bistro', 'Tomato', 60, 28, date('now', '-2 days'), 'pending'),\n('Royal Curry House', 'Rice', 100, 30, date('now', '-4 days'), 'pending'),\n('Bakery Delights', 'Wheat', 50, 18, date('now', '-10 days'), 'pending');",
        validate: (db) => {
          const ords = db.getTableData('orders');
          return ords && ords.length >= 3;
        }
      },
      {
        id: "L5_M2",
        title: "Compute Total Order Revenue",
        objective: "Calculate total revenue for each order using arithmetic: (quantity_kg * unit_price) AS total_revenue.",
        dialogue: "Uncle Somu: 'Calculate how much each buyer owes us by multiplying quantity by unit price!'",
        concept: "Calculated Fields & Column Aliases",
        hints: [
          "Select customer_name, crop_name, (quantity_kg * unit_price) AS total_revenue from orders.",
          "SELECT customer_name, crop_name, quantity_kg, unit_price, (quantity_kg * unit_price) AS total_revenue FROM orders;",
          "SELECT customer_name, crop_name, quantity_kg, unit_price, (quantity_kg * unit_price) AS total_revenue FROM orders;"
        ],
        solution: "SELECT customer_name, crop_name, quantity_kg, unit_price, (quantity_kg * unit_price) AS total_revenue FROM orders;",
        quickFill: "SELECT customer_name, crop_name, quantity_kg, unit_price, (quantity_kg * unit_price) AS total_revenue FROM orders;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('total_revenue') || cols.includes('revenue') || cols.length >= 5;
        }
      },
      {
        id: "L5_M3",
        title: "Query Recent Active Orders (Date Functions)",
        objective: "Filter pending orders placed within the last 7 days using SQLite date('now', '-7 days').",
        dialogue: "Uncle Somu: 'Our freshness policy requires fulfilling orders within 7 days. Find active pending orders from the last week!'",
        concept: "Date filtering with date() function",
        hints: [
          "Use date(order_date) >= date('now', '-7 days') and status = 'pending'.",
          "SELECT * FROM orders WHERE status = 'pending' AND date(order_date) >= date('now', '-7 days');",
          "SELECT * FROM orders WHERE status = 'pending' AND date(order_date) >= date('now', '-7 days');"
        ],
        solution: "SELECT * FROM orders WHERE status = 'pending' AND date(order_date) >= date('now', '-7 days');",
        quickFill: "SELECT * FROM orders WHERE status = 'pending' AND date(order_date) >= date('now', '-7 days');",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 2; // Chef Mario (-2 days) and Royal Curry (-4 days)
        }
      },
      {
        id: "L5_M4",
        title: "Fulfill Chef Mario's Restaurant Order",
        objective: "Update order_id = 1 status to 'fulfilled' to finalize delivery.",
        dialogue: "Uncle Somu: 'Chef Mario\'s truck has arrived at the farm gate! Mark order 1 as fulfilled to collect payment!'",
        concept: "UPDATE ... WHERE order_id = 1",
        hints: [
          "UPDATE orders SET status = 'fulfilled' WHERE order_id = 1;",
          "UPDATE orders SET status = 'fulfilled' WHERE order_id = 1;",
          "UPDATE orders SET status = 'fulfilled' WHERE order_id = 1;"
        ],
        solution: "UPDATE orders SET status = 'fulfilled' WHERE order_id = 1;",
        quickFill: "UPDATE orders SET status = 'fulfilled' WHERE order_id = 1;",
        validate: (db) => {
          const ords = db.getTableData('orders');
          const o1 = ords.find(o => o.order_id === 1);
          return o1 && o1.status === 'fulfilled';
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 6: FARM MANAGER
  // ==========================================================
  6: {
    level: 6,
    title: "FARM MANAGER",
    role: "Farm Manager",
    concept: "INNER JOIN, LEFT JOIN, foreign keys, workforce assignment",
    teaser: "Hire workers (Ravi, Maya, Arjun) and assign staff to plots and machinery using relational joins.",
    cutscene: {
      title: "Chapter 6: The Farm Workforce",
      image: "/images/cinematics/level6_crew.jpg",
      duration: 11,
      mood: "crew",
      subtitles: [
        { start: 0, end: 3.5, text: "The morning sun illuminates the full farmstead as our field crew gathers for duty." },
        { start: 3.5, end: 7.5, text: "All 5 plot columns are unlocked! Ten sub-beds need dedicated specialists." },
        { start: 7.5, end: 11, text: "Uncle Somu: 'A great farm manager connects people to the land using relational JOINs!'" }
      ]
    },
    storyIntro: {
      headline: "Plot A5 Unlocks & Full Acreage Workforce",
      text: "Uncle Somu raises his arms in triumph: 'Plot A5 is officially open! All 5 major plot zones—10 sub-beds in total—are now under our command! Managing this entire expanse alone is impossible. We are hiring four dedicated specialists: an agronomist, an irrigation technician, a tractor operator, and a harvest supervisor. We will manage assignments and audit coverage using SQL INNER and LEFT JOINs!'",
      notebookEntries: [
        { label: "New Acreage", value: "Plot A5 (A5.1 & A5.2) Unlocked — ALL 5 PLOTS OPEN!" },
        { label: "Workforce", value: "Ravi (Agronomist), Maya (Irrigation), Arjun (Machinery), Priya (Supervisor)" },
        { label: "Target", value: "Assign staff to plots and audit unstaffed sectors" },
        { label: "Key SQL Concepts", value: "INNER JOIN, LEFT JOIN, Foreign Keys" }
      ]
    },
    completion: {
      title: "LEVEL 6 COMPLETE",
      subtitle: "Master of Operations & Relational Data!",
      badge: "👔 General Farm Manager",
      summary: "You graduated to full farm management! By linking personnel to plots and equipment through relational JOINs, you demonstrated how modern enterprise databases coordinate complex operational teams.",
      stats: [
        { label: "Plots Active", value: "5 Plots (A1 – A5) 100% Unlocked" },
        { label: "Workforce Hired", value: "4 Agricultural Specialists" },
        { label: "Relational Queries", value: "INNER JOIN & LEFT JOIN" },
        { label: "Cash Bonus", value: "+₹4,500" },
        { label: "XP Earned", value: "+350 XP" }
      ],
      nextLevelTitle: "Level 7: The Numbers Don't Match (Financial Audit!)"
    },
    missions: [
      {
        id: "L6_M0",
        title: "Create Workforce Schema",
        objective: "Create 'workers' and 'assignments' tables in SQLite.",
        dialogue: "Uncle Somu: 'Build the relational schema: workers (worker_id, name, role, wage_daily, hire_date) and assignments (assignment_id, worker_id, plot_id, equipment_id, shift).'",
        concept: "Relational Foreign Key Schemas",
        hints: [
          "Create workers and assignments tables.",
          "CREATE TABLE workers (...); CREATE TABLE assignments (...);",
          "CREATE TABLE workers (\n  worker_id INTEGER PRIMARY KEY,\n  name TEXT,\n  role TEXT,\n  wage_daily INTEGER,\n  hire_date TEXT\n);\n\nCREATE TABLE assignments (\n  assignment_id INTEGER PRIMARY KEY,\n  worker_id INTEGER,\n  plot_id TEXT,\n  equipment_id INTEGER,\n  shift TEXT\n);"
        ],
        solution: "CREATE TABLE workers (\n  worker_id INTEGER PRIMARY KEY,\n  name TEXT,\n  role TEXT,\n  wage_daily INTEGER,\n  hire_date TEXT\n);\n\nCREATE TABLE assignments (\n  assignment_id INTEGER PRIMARY KEY,\n  worker_id INTEGER,\n  plot_id TEXT,\n  equipment_id INTEGER,\n  shift TEXT\n);",
        quickFill: "CREATE TABLE workers (\n  worker_id INTEGER PRIMARY KEY,\n  name TEXT,\n  role TEXT,\n  wage_daily INTEGER,\n  hire_date TEXT\n);\n\nCREATE TABLE assignments (\n  assignment_id INTEGER PRIMARY KEY,\n  worker_id INTEGER,\n  plot_id TEXT,\n  equipment_id INTEGER,\n  shift TEXT\n);",
        validate: (db) => {
          const schema = db.getSchema();
          return !!schema['workers'] && !!schema['assignments'];
        }
      },
      {
        id: "L6_M1",
        title: "Recruit Agricultural Specialists",
        objective: "Insert the 4 farm specialists into the workers table.",
        dialogue: "Uncle Somu: 'Register Ravi, Maya, Arjun, and Priya in our worker database.'",
        concept: "INSERT INTO workers",
        hints: [
          "Insert 4 specialists into workers.",
          "INSERT INTO workers VALUES (1, 'Ravi Kumar', ...), ...",
          "INSERT INTO workers (worker_id, name, role, wage_daily, hire_date) VALUES \n(1, 'Ravi Kumar', 'Agronomist', 600, date('now', '-30 days')),\n(2, 'Maya Sharma', 'Irrigation Specialist', 550, date('now', '-20 days')),\n(3, 'Arjun Singh', 'Machinery Operator', 500, date('now', '-15 days')),\n(4, 'Priya Patel', 'Crop Supervisor', 650, date('now', '-5 days'));"
        ],
        solution: "INSERT INTO workers (worker_id, name, role, wage_daily, hire_date) VALUES \n(1, 'Ravi Kumar', 'Agronomist', 600, date('now', '-30 days')),\n(2, 'Maya Sharma', 'Irrigation Specialist', 550, date('now', '-20 days')),\n(3, 'Arjun Singh', 'Machinery Operator', 500, date('now', '-15 days')),\n(4, 'Priya Patel', 'Crop Supervisor', 650, date('now', '-5 days'));",
        quickFill: "INSERT INTO workers (worker_id, name, role, wage_daily, hire_date) VALUES \n(1, 'Ravi Kumar', 'Agronomist', 600, date('now', '-30 days')),\n(2, 'Maya Sharma', 'Irrigation Specialist', 550, date('now', '-20 days')),\n(3, 'Arjun Singh', 'Machinery Operator', 500, date('now', '-15 days')),\n(4, 'Priya Patel', 'Crop Supervisor', 650, date('now', '-5 days'));",
        validate: (db) => {
          const wkrs = db.getTableData('workers');
          return wkrs && wkrs.length >= 4;
        }
      },
      {
        id: "L6_M2",
        title: "Assign Crew to Plots & Machinery",
        objective: "Insert duty assignments for Ravi, Maya, and Arjun into the assignments table.",
        dialogue: "Uncle Somu: 'Assign Ravi to Plot A1.1, Maya to Plot A2.1, and Arjun to our Tractor (equipment 1) on Plot A3.1.'",
        concept: "Foreign Key Linking Rows",
        hints: [
          "Insert 3 records into assignments linking worker_id to plots.",
          "INSERT INTO assignments (worker_id, plot_id, equipment_id, shift) VALUES (1, 'A1.1', NULL, 'Morning'), (2, 'A2.1', NULL, 'Morning'), (3, 'A3.1', 1, 'Full Day');",
          "INSERT INTO assignments (worker_id, plot_id, equipment_id, shift) VALUES \n(1, 'A1.1', NULL, 'Morning'),\n(2, 'A2.1', NULL, 'Morning'),\n(3, 'A3.1', 1, 'Full Day');"
        ],
        solution: "INSERT INTO assignments (worker_id, plot_id, equipment_id, shift) VALUES \n(1, 'A1.1', NULL, 'Morning'),\n(2, 'A2.1', NULL, 'Morning'),\n(3, 'A3.1', 1, 'Full Day');",
        quickFill: "INSERT INTO assignments (worker_id, plot_id, equipment_id, shift) VALUES \n(1, 'A1.1', NULL, 'Morning'),\n(2, 'A2.1', NULL, 'Morning'),\n(3, 'A3.1', 1, 'Full Day');",
        validate: (db) => {
          const ass = db.getTableData('assignments');
          return ass && ass.length >= 3;
        }
      },
      {
        id: "L6_M3",
        title: "Generate Master Roster with INNER JOIN",
        objective: "Join workers and assignments on worker_id to display name, role, plot_id, and shift.",
        dialogue: "Uncle Somu: 'Generate our operational duty roster using an INNER JOIN between workers and assignments!'",
        concept: "SELECT ... INNER JOIN ... ON ...",
        hints: [
          "Join workers and assignments on workers.worker_id = assignments.worker_id.",
          "SELECT workers.name, workers.role, assignments.plot_id, assignments.shift FROM workers INNER JOIN assignments ON workers.worker_id = assignments.worker_id;",
          "SELECT workers.name, workers.role, assignments.plot_id, assignments.shift FROM workers INNER JOIN assignments ON workers.worker_id = assignments.worker_id;"
        ],
        solution: "SELECT workers.name, workers.role, assignments.plot_id, assignments.shift FROM workers INNER JOIN assignments ON workers.worker_id = assignments.worker_id;",
        quickFill: "SELECT workers.name, workers.role, assignments.plot_id, assignments.shift FROM workers INNER JOIN assignments ON workers.worker_id = assignments.worker_id;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('name') && cols.includes('plot_id') && queryResult.results[0].values.length === 3;
        }
      },
      {
        id: "L6_M4",
        title: "Audit Unassigned Staff with LEFT JOIN",
        objective: "Use a LEFT JOIN to find workers who do not have an active assignment record.",
        dialogue: "Uncle Somu: 'Notice Priya is missing from the roster! Use a LEFT JOIN with WHERE assignments.assignment_id IS NULL to find unassigned staff!'",
        concept: "LEFT JOIN ... WHERE right_table.key IS NULL",
        hints: [
          "Use LEFT JOIN workers and assignments, filtering for assignments.assignment_id IS NULL.",
          "SELECT workers.name, workers.role FROM workers LEFT JOIN assignments ON workers.worker_id = assignments.worker_id WHERE assignments.assignment_id IS NULL;",
          "SELECT workers.name, workers.role FROM workers LEFT JOIN assignments ON workers.worker_id = assignments.worker_id WHERE assignments.assignment_id IS NULL;"
        ],
        solution: "SELECT workers.name, workers.role FROM workers LEFT JOIN assignments ON workers.worker_id = assignments.worker_id WHERE assignments.assignment_id IS NULL;",
        quickFill: "SELECT workers.name, workers.role FROM workers LEFT JOIN assignments ON workers.worker_id = assignments.worker_id WHERE assignments.assignment_id IS NULL;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length >= 1 && rows.some(r => r.some(val => String(val).includes('Priya')));
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 7: THE NUMBERS DON'T MATCH
  // ==========================================================
  7: {
    level: 7,
    title: "THE NUMBERS DON'T MATCH",
    role: "Financial Auditor",
    concept: "Subqueries, nested queries, scalar subqueries, EXISTS, reconciliation",
    teaser: "A ₹49,000 cash discrepancy threatens the farm. Uncover hidden expenses and billing errors using nested SQL.",
    cutscene: {
      title: "Chapter 7: Midnight Financial Audit",
      image: "/images/cinematics/level7_audit.jpg",
      duration: 11,
      mood: "tense",
      subtitles: [
        { start: 0, end: 3.5, text: "Rain taps against the office window as ledger journals spill across the desk." },
        { start: 3.5, end: 7.5, text: "A massive ₹49,000 cash discrepancy has appeared in the farm treasury balance." },
        { start: 7.5, end: 11, text: "Uncle Somu: 'Trace every rupee. Nested SQL subqueries will reveal where the leak is!'" }
      ]
    },
    storyIntro: {
      headline: "The ₹49,000 Discrepancy & Forensic Audit",
      text: "Uncle Somu calls an emergency midnight meeting: 'Our bank balance shows ₹49,000 missing! Looking through the expense ledger, somebody logged an unauthorized charge. We need to isolate transactions that exceed company averages, identify expenses outside approved budget categories, and restore financial integrity using nested subqueries!'",
      notebookEntries: [
        { label: "Ledger Discrepancy", value: "₹49,000 Missing from Treasury" },
        { label: "Suspicion", value: "Rogue equipment purchase or unapproved expense" },
        { label: "Target", value: "Isolate unauthorized records and reconcile ledger" },
        { label: "Key SQL Concepts", value: "Subqueries (Scalar, NOT IN, EXISTS), DELETE" }
      ]
    },
    completion: {
      title: "LEVEL 7 COMPLETE",
      subtitle: "Financial Integrity Fully Restored!",
      badge: "🔍 Forensic Auditor",
      summary: "You cracked the financial mystery! Using nested scalar subqueries, NOT IN exclusions, and EXISTS predicates, you unmasked the rogue ₹49,000 charge, cleansed the database, and balanced the farm accounts.",
      stats: [
        { label: "Discrepancy Solved", value: "₹49,000 Unmasked" },
        { label: "Rogue Record", value: "VIP Gold Drone Expunged" },
        { label: "Subquery Techniques", value: "Scalar, IN, EXISTS" },
        { label: "Cash Restored", value: "+₹5,000" },
        { label: "XP Earned", value: "+400 XP" }
      ],
      nextLevelTitle: "Level 8: The Expansion (Multi-Farm CTEs!)"
    },
    missions: [
      {
        id: "L7_M0",
        title: "Create Expenses & Approved Budgets Schema",
        objective: "Create 'expenses' and 'approved_budgets' audit tables.",
        dialogue: "Uncle Somu: 'Create tables: approved_budgets (category, max_allowed) and expenses (expense_id, category, description, amount, expense_date, approved_by).'",
        concept: "Financial Audit Schema",
        hints: [
          "Create approved_budgets and expenses tables.",
          "CREATE TABLE approved_budgets (...); CREATE TABLE expenses (...);",
          "CREATE TABLE approved_budgets (\n  category TEXT PRIMARY KEY,\n  max_allowed INTEGER\n);\n\nCREATE TABLE expenses (\n  expense_id INTEGER PRIMARY KEY,\n  category TEXT,\n  description TEXT,\n  amount INTEGER,\n  expense_date TEXT,\n  approved_by TEXT\n);"
        ],
        solution: "CREATE TABLE approved_budgets (\n  category TEXT PRIMARY KEY,\n  max_allowed INTEGER\n);\n\nCREATE TABLE expenses (\n  expense_id INTEGER PRIMARY KEY,\n  category TEXT,\n  description TEXT,\n  amount INTEGER,\n  expense_date TEXT,\n  approved_by TEXT\n);",
        quickFill: "CREATE TABLE approved_budgets (\n  category TEXT PRIMARY KEY,\n  max_allowed INTEGER\n);\n\nCREATE TABLE expenses (\n  expense_id INTEGER PRIMARY KEY,\n  category TEXT,\n  description TEXT,\n  amount INTEGER,\n  expense_date TEXT,\n  approved_by TEXT\n);",
        validate: (db) => {
          const schema = db.getSchema();
          return !!schema['approved_budgets'] && !!schema['expenses'];
        }
      },
      {
        id: "L7_M1",
        title: "Seed Ledger & Detect Expenses Above Average",
        objective: "Insert ledger records and use a scalar subquery to find expenses above the average expense.",
        dialogue: "Uncle Somu: 'Seed our ledger records, then write a subquery to find any expense where amount > (SELECT AVG(amount) FROM expenses)!'",
        concept: "Scalar Subqueries in WHERE",
        hints: [
          "Seed the tables, then query expenses WHERE amount > (SELECT AVG(amount) FROM expenses).",
          "INSERT INTO approved_budgets ...; INSERT INTO expenses ...; SELECT * FROM expenses WHERE amount > (SELECT AVG(amount) FROM expenses);",
          "INSERT INTO approved_budgets (category, max_allowed) VALUES \n('Seeds', 5000),\n('Fertilizer', 8000),\n('Fuel', 4000),\n('Repairs', 6000);\n\nINSERT INTO expenses (expense_id, category, description, amount, expense_date, approved_by) VALUES \n(1, 'Seeds', 'Wheat seed stock', 3500, date('now', '-10 days'), 'Uncle Somu'),\n(2, 'Fertilizer', 'Bulk NPK', 7200, date('now', '-8 days'), 'Uncle Somu'),\n(3, 'Fuel', 'Diesel for tractor', 3100, date('now', '-6 days'), 'Uncle Somu'),\n(4, 'Luxury Drone', 'VIP Gold Drone', 49000, date('now', '-3 days'), 'Unknown'),\n(5, 'Repairs', 'Irrigation pump fix', 2400, date('now', '-1 days'), 'Uncle Somu');\n\nSELECT * FROM expenses WHERE amount > (SELECT AVG(amount) FROM expenses);"
        ],
        solution: "INSERT INTO approved_budgets (category, max_allowed) VALUES \n('Seeds', 5000),\n('Fertilizer', 8000),\n('Fuel', 4000),\n('Repairs', 6000);\n\nINSERT INTO expenses (expense_id, category, description, amount, expense_date, approved_by) VALUES \n(1, 'Seeds', 'Wheat seed stock', 3500, date('now', '-10 days'), 'Uncle Somu'),\n(2, 'Fertilizer', 'Bulk NPK', 7200, date('now', '-8 days'), 'Uncle Somu'),\n(3, 'Fuel', 'Diesel for tractor', 3100, date('now', '-6 days'), 'Uncle Somu'),\n(4, 'Luxury Drone', 'VIP Gold Drone', 49000, date('now', '-3 days'), 'Unknown'),\n(5, 'Repairs', 'Irrigation pump fix', 2400, date('now', '-1 days'), 'Uncle Somu');\n\nSELECT * FROM expenses WHERE amount > (SELECT AVG(amount) FROM expenses);",
        quickFill: "INSERT INTO approved_budgets (category, max_allowed) VALUES \n('Seeds', 5000),\n('Fertilizer', 8000),\n('Fuel', 4000),\n('Repairs', 6000);\n\nINSERT INTO expenses (expense_id, category, description, amount, expense_date, approved_by) VALUES \n(1, 'Seeds', 'Wheat seed stock', 3500, date('now', '-10 days'), 'Uncle Somu'),\n(2, 'Fertilizer', 'Bulk NPK', 7200, date('now', '-8 days'), 'Uncle Somu'),\n(3, 'Fuel', 'Diesel for tractor', 3100, date('now', '-6 days'), 'Uncle Somu'),\n(4, 'Luxury Drone', 'VIP Gold Drone', 49000, date('now', '-3 days'), 'Unknown'),\n(5, 'Repairs', 'Irrigation pump fix', 2400, date('now', '-1 days'), 'Uncle Somu');\n\nSELECT * FROM expenses WHERE amount > (SELECT AVG(amount) FROM expenses);",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 1 && rows[0].some(val => String(val).includes('49000'));
        }
      },
      {
        id: "L7_M2",
        title: "Find Unauthorized Budget Categories with NOT IN",
        objective: "Use a subquery with NOT IN to find expenses in categories not present in approved_budgets.",
        dialogue: "Uncle Somu: 'Now verify which expenses were logged under unapproved categories!'",
        concept: "WHERE category NOT IN (SELECT ...)",
        hints: [
          "Query expenses where category NOT IN (SELECT category FROM approved_budgets).",
          "SELECT * FROM expenses WHERE category NOT IN (SELECT category FROM approved_budgets);",
          "SELECT * FROM expenses WHERE category NOT IN (SELECT category FROM approved_budgets);"
        ],
        solution: "SELECT * FROM expenses WHERE category NOT IN (SELECT category FROM approved_budgets);",
        quickFill: "SELECT * FROM expenses WHERE category NOT IN (SELECT category FROM approved_budgets);",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 1 && rows[0].some(val => String(val).includes('Luxury Drone'));
        }
      },
      {
        id: "L7_M3",
        title: "Verify Discrepancy with NOT EXISTS",
        objective: "Use a correlated NOT EXISTS subquery to confirm which expense lacks a valid budget cap.",
        dialogue: "Uncle Somu: 'Double check with a NOT EXISTS subquery confirming no authorized budget covered this charge.'",
        concept: "Correlated Subqueries & NOT EXISTS",
        hints: [
          "Use WHERE NOT EXISTS (SELECT 1 FROM approved_budgets b WHERE b.category = e.category AND e.amount <= b.max_allowed).",
          "SELECT * FROM expenses e WHERE NOT EXISTS (SELECT 1 FROM approved_budgets b WHERE b.category = e.category AND e.amount <= b.max_allowed);",
          "SELECT * FROM expenses e WHERE NOT EXISTS (SELECT 1 FROM approved_budgets b WHERE b.category = e.category AND e.amount <= b.max_allowed);"
        ],
        solution: "SELECT * FROM expenses e WHERE NOT EXISTS (SELECT 1 FROM approved_budgets b WHERE b.category = e.category AND e.amount <= b.max_allowed);",
        quickFill: "SELECT * FROM expenses e WHERE NOT EXISTS (SELECT 1 FROM approved_budgets b WHERE b.category = e.category AND e.amount <= b.max_allowed);",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 1 && rows[0].some(val => String(val).includes('Luxury Drone'));
        }
      },
      {
        id: "L7_M4",
        title: "Expunge Fraudulent Charge",
        objective: "Delete expense_id = 4 from the database to restore balanced books.",
        dialogue: "Uncle Somu: 'Fraud detected! Delete this rogue record to reconcile our bank ledger!'",
        concept: "DELETE FROM ... WHERE expense_id = 4",
        hints: [
          "DELETE FROM expenses WHERE expense_id = 4;",
          "DELETE FROM expenses WHERE expense_id = 4;",
          "DELETE FROM expenses WHERE expense_id = 4;"
        ],
        solution: "DELETE FROM expenses WHERE expense_id = 4;",
        quickFill: "DELETE FROM expenses WHERE expense_id = 4;",
        validate: (db) => {
          const exps = db.getTableData('expenses');
          return exps && !exps.some(e => e.expense_id === 4);
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 8: THE EXPANSION
  // ==========================================================
  8: {
    level: 8,
    title: "THE EXPANSION",
    role: "Expansion Manager",
    concept: "CTEs (WITH), multi-farm schemas, regional analysis",
    teaser: "Acquire Farm North, Farm South, and Farm East. Conduct multi-facility performance comparisons.",
    cutscene: {
      title: "Chapter 8: Regional Farm Expansion",
      image: "/images/cinematics/level8_regional.jpg",
      duration: 11,
      mood: "epic",
      subtitles: [
        { start: 0, end: 3.5, text: "A regional agricultural map unfolds across the conference table." },
        { start: 3.5, end: 7.5, text: "Farm North, Farm South, Farm East, and Home Farm unite under our brand." },
        { start: 7.5, end: 11, text: "Uncle Somu: 'Common Table Expressions turn enterprise data chaos into pure clarity!'" }
      ]
    },
    storyIntro: {
      headline: "The Multi-Farm Regional Enterprise",
      text: "Uncle Somu rolls out a regional topographical map: 'Our farm has expanded into a multi-facility enterprise! We have acquired Farm North (dairy & fodder), Farm South (fruit & horticulture), and Farm East (grain fields). With four regional branches producing tons of harvest, traditional queries get messy. We need Common Table Expressions (WITH CTEs) to build modular, elegant enterprise reports!'",
      notebookEntries: [
        { label: "Enterprises", value: "Home Farm, Farm North, Farm South, Farm East" },
        { label: "Combined Acreage", value: "83 Total Acres" },
        { label: "Target", value: "Compare facility yield and identify cost-efficiency leaders" },
        { label: "Key SQL Concepts", value: "Common Table Expressions (WITH CTE), Chained CTEs" }
      ]
    },
    completion: {
      title: "LEVEL 8 COMPLETE",
      subtitle: "Regional Agribusiness Director!",
      badge: "🌐 Regional Director",
      summary: "You conquered enterprise data architecture! By authoring modular, reusable Common Table Expressions (WITH CTEs), you benchmarked multi-facility performance, calculated cost-per-ton efficiency, and scaled our farming operations regional-wide.",
      stats: [
        { label: "Facilities Managed", value: "4 Regional Farms" },
        { label: "Total Yield Monitored", value: "230 Metric Tons" },
        { label: "Architecture", value: "Chained WITH CTEs" },
        { label: "Cash Bonus", value: "+₹7,000" },
        { label: "XP Earned", value: "+450 XP" }
      ],
      nextLevelTitle: "Level 9: The Agricultural Empire (Window Functions!)"
    },
    missions: [
      {
        id: "L8_M0",
        title: "Create Regional Enterprise Schema",
        objective: "Create 'facilities' and 'regional_production' tables in SQLite.",
        dialogue: "Uncle Somu: 'Build our enterprise schema: facilities (facility_id, facility_name, region, acres) and regional_production (record_id, facility_id, crop_name, yield_tons, production_cost).'",
        concept: "Enterprise Schema Design",
        hints: [
          "Create facilities and regional_production tables.",
          "CREATE TABLE facilities (...); CREATE TABLE regional_production (...);",
          "CREATE TABLE facilities (\n  facility_id TEXT PRIMARY KEY,\n  facility_name TEXT,\n  region TEXT,\n  acres INTEGER\n);\n\nCREATE TABLE regional_production (\n  record_id INTEGER PRIMARY KEY,\n  facility_id TEXT,\n  crop_name TEXT,\n  yield_tons REAL,\n  production_cost INTEGER\n);"
        ],
        solution: "CREATE TABLE facilities (\n  facility_id TEXT PRIMARY KEY,\n  facility_name TEXT,\n  region TEXT,\n  acres INTEGER\n);\n\nCREATE TABLE regional_production (\n  record_id INTEGER PRIMARY KEY,\n  facility_id TEXT,\n  crop_name TEXT,\n  yield_tons REAL,\n  production_cost INTEGER\n);",
        quickFill: "CREATE TABLE facilities (\n  facility_id TEXT PRIMARY KEY,\n  facility_name TEXT,\n  region TEXT,\n  acres INTEGER\n);\n\nCREATE TABLE regional_production (\n  record_id INTEGER PRIMARY KEY,\n  facility_id TEXT,\n  crop_name TEXT,\n  yield_tons REAL,\n  production_cost INTEGER\n);",
        validate: (db) => {
          const schema = db.getSchema();
          return !!schema['facilities'] && !!schema['regional_production'];
        }
      },
      {
        id: "L8_M1",
        title: "Populate Regional Facilities & Harvest Logs",
        objective: "Seed facilities and production data across our 4 regional branches.",
        dialogue: "Uncle Somu: 'Insert our 4 regional branches and harvest production logs.'",
        concept: "Multi-facility data insertion",
        hints: [
          "Insert data into facilities and regional_production.",
          "INSERT INTO facilities ...; INSERT INTO regional_production ...;",
          "INSERT INTO facilities (facility_id, facility_name, region, acres) VALUES \n('HOME', 'Home Valley Farm', 'Central', 10),\n('NORTH', 'Farm North Dairy & Fodder', 'Highlands', 25),\n('SOUTH', 'Farm South Fruit Orchards', 'Delta', 18),\n('EAST', 'Farm East Grain Fields', 'Plains', 30);\n\nINSERT INTO regional_production (facility_id, crop_name, yield_tons, production_cost) VALUES \n('HOME', 'Tomato', 12.5, 45000),\n('HOME', 'Wheat', 18.0, 38000),\n('NORTH', 'Corn', 32.0, 72000),\n('NORTH', 'Wheat', 24.5, 51000),\n('SOUTH', 'Tomato', 28.0, 68000),\n('SOUTH', 'Corn', 15.5, 39000),\n('EAST', 'Wheat', 45.0, 88000),\n('EAST', 'Rice', 52.0, 110000);"
        ],
        solution: "INSERT INTO facilities (facility_id, facility_name, region, acres) VALUES \n('HOME', 'Home Valley Farm', 'Central', 10),\n('NORTH', 'Farm North Dairy & Fodder', 'Highlands', 25),\n('SOUTH', 'Farm South Fruit Orchards', 'Delta', 18),\n('EAST', 'Farm East Grain Fields', 'Plains', 30);\n\nINSERT INTO regional_production (facility_id, crop_name, yield_tons, production_cost) VALUES \n('HOME', 'Tomato', 12.5, 45000),\n('HOME', 'Wheat', 18.0, 38000),\n('NORTH', 'Corn', 32.0, 72000),\n('NORTH', 'Wheat', 24.5, 51000),\n('SOUTH', 'Tomato', 28.0, 68000),\n('SOUTH', 'Corn', 15.5, 39000),\n('EAST', 'Wheat', 45.0, 88000),\n('EAST', 'Rice', 52.0, 110000);",
        quickFill: "INSERT INTO facilities (facility_id, facility_name, region, acres) VALUES \n('HOME', 'Home Valley Farm', 'Central', 10),\n('NORTH', 'Farm North Dairy & Fodder', 'Highlands', 25),\n('SOUTH', 'Farm South Fruit Orchards', 'Delta', 18),\n('EAST', 'Farm East Grain Fields', 'Plains', 30);\n\nINSERT INTO regional_production (facility_id, crop_name, yield_tons, production_cost) VALUES \n('HOME', 'Tomato', 12.5, 45000),\n('HOME', 'Wheat', 18.0, 38000),\n('NORTH', 'Corn', 32.0, 72000),\n('NORTH', 'Wheat', 24.5, 51000),\n('SOUTH', 'Tomato', 28.0, 68000),\n('SOUTH', 'Corn', 15.5, 39000),\n('EAST', 'Wheat', 45.0, 88000),\n('EAST', 'Rice', 52.0, 110000);",
        validate: (db) => {
          const prods = db.getTableData('regional_production');
          return prods && prods.length >= 8;
        }
      },
      {
        id: "L8_M2",
        title: "Summarize Facility Output with a WITH CTE",
        objective: "Use a Common Table Expression (WITH FacilityYields AS ...) to aggregate total tons and costs per facility, filtering for total_tons > 35.",
        dialogue: "Uncle Somu: 'Author our first CTE named FacilityYields to calculate total output per facility, filtering for branches yielding over 35 metric tons!'",
        concept: "WITH CTE_Name AS (SELECT ...)",
        hints: [
          "Define WITH FacilityYields AS (SELECT facility_id, SUM(yield_tons) AS total_tons, SUM(production_cost) AS total_cost FROM regional_production GROUP BY facility_id) SELECT * FROM FacilityYields WHERE total_tons > 35;",
          "WITH FacilityYields AS (\n  SELECT facility_id, SUM(yield_tons) AS total_tons, SUM(production_cost) AS total_cost \n  FROM regional_production \n  GROUP BY facility_id\n)\nSELECT * FROM FacilityYields WHERE total_tons > 35;",
          "WITH FacilityYields AS (\n  SELECT facility_id, SUM(yield_tons) AS total_tons, SUM(production_cost) AS total_cost \n  FROM regional_production \n  GROUP BY facility_id\n)\nSELECT * FROM FacilityYields WHERE total_tons > 35;"
        ],
        solution: "WITH FacilityYields AS (\n  SELECT facility_id, SUM(yield_tons) AS total_tons, SUM(production_cost) AS total_cost \n  FROM regional_production \n  GROUP BY facility_id\n)\nSELECT * FROM FacilityYields WHERE total_tons > 35;",
        quickFill: "WITH FacilityYields AS (\n  SELECT facility_id, SUM(yield_tons) AS total_tons, SUM(production_cost) AS total_cost \n  FROM regional_production \n  GROUP BY facility_id\n)\nSELECT * FROM FacilityYields WHERE total_tons > 35;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length >= 2;
        }
      },
      {
        id: "L8_M3",
        title: "Benchmark Above-Average Facilities (Chained CTEs)",
        objective: "Chain two CTEs together to select facilities producing more than the average regional facility tonnage.",
        dialogue: "Uncle Somu: 'Now chain two CTEs together: one calculating facility totals, and another calculating the enterprise-wide average!'",
        concept: "Chained Common Table Expressions: WITH CTE1 AS (...), CTE2 AS (...) SELECT ...",
        hints: [
          "Define FacilityTotals, then EnterpriseAvg, then SELECT f.* FROM FacilityTotals f, EnterpriseAvg e WHERE f.total_tons >= e.avg_tons.",
          "WITH FacilityTotals AS (\n  SELECT facility_id, SUM(yield_tons) AS total_tons \n  FROM regional_production \n  GROUP BY facility_id\n),\nEnterpriseAvg AS (\n  SELECT AVG(total_tons) AS avg_tons FROM FacilityTotals\n)\nSELECT f.facility_id, f.total_tons, e.avg_tons \nFROM FacilityTotals f, EnterpriseAvg e \nWHERE f.total_tons >= e.avg_tons;",
          "WITH FacilityTotals AS (\n  SELECT facility_id, SUM(yield_tons) AS total_tons \n  FROM regional_production \n  GROUP BY facility_id\n),\nEnterpriseAvg AS (\n  SELECT AVG(total_tons) AS avg_tons FROM FacilityTotals\n)\nSELECT f.facility_id, f.total_tons, e.avg_tons \nFROM FacilityTotals f, EnterpriseAvg e \nWHERE f.total_tons >= e.avg_tons;"
        ],
        solution: "WITH FacilityTotals AS (\n  SELECT facility_id, SUM(yield_tons) AS total_tons \n  FROM regional_production \n  GROUP BY facility_id\n),\nEnterpriseAvg AS (\n  SELECT AVG(total_tons) AS avg_tons FROM FacilityTotals\n)\nSELECT f.facility_id, f.total_tons, e.avg_tons \nFROM FacilityTotals f, EnterpriseAvg e \nWHERE f.total_tons >= e.avg_tons;",
        quickFill: "WITH FacilityTotals AS (\n  SELECT facility_id, SUM(yield_tons) AS total_tons \n  FROM regional_production \n  GROUP BY facility_id\n),\nEnterpriseAvg AS (\n  SELECT AVG(total_tons) AS avg_tons FROM FacilityTotals\n)\nSELECT f.facility_id, f.total_tons, e.avg_tons \nFROM FacilityTotals f, EnterpriseAvg e \nWHERE f.total_tons >= e.avg_tons;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length >= 1 && rows.some(r => r.includes('EAST'));
        }
      },
      {
        id: "L8_M4",
        title: "Analyze Unit Cost Efficiency (Cost per Ton)",
        objective: "Write a CTE computing production cost per ton, ordered by lowest cost.",
        dialogue: "Uncle Somu: 'Which regional branch gives us the cheapest cost per ton? Calculate cost_per_ton = total_cost / total_tons and sort ascending!'",
        concept: "Calculated CTE with ORDER BY",
        hints: [
          "Use a CTE calculating cost_per_ton and ORDER BY cost_per_ton ASC.",
          "WITH UnitCostCTE AS (\n  SELECT facility_id, \n         SUM(yield_tons) AS total_tons, \n         SUM(production_cost) AS total_cost,\n         ROUND(SUM(production_cost) / SUM(yield_tons), 2) AS cost_per_ton \n  FROM regional_production \n  GROUP BY facility_id\n)\nSELECT * FROM UnitCostCTE ORDER BY cost_per_ton ASC;",
          "WITH UnitCostCTE AS (\n  SELECT facility_id, \n         SUM(yield_tons) AS total_tons, \n         SUM(production_cost) AS total_cost,\n         ROUND(SUM(production_cost) / SUM(yield_tons), 2) AS cost_per_ton \n  FROM regional_production \n  GROUP BY facility_id\n)\nSELECT * FROM UnitCostCTE ORDER BY cost_per_ton ASC;"
        ],
        solution: "WITH UnitCostCTE AS (\n  SELECT facility_id, \n         SUM(yield_tons) AS total_tons, \n         SUM(production_cost) AS total_cost,\n         ROUND(SUM(production_cost) / SUM(yield_tons), 2) AS cost_per_ton \n  FROM regional_production \n  GROUP BY facility_id\n)\nSELECT * FROM UnitCostCTE ORDER BY cost_per_ton ASC;",
        quickFill: "WITH UnitCostCTE AS (\n  SELECT facility_id, \n         SUM(yield_tons) AS total_tons, \n         SUM(production_cost) AS total_cost,\n         ROUND(SUM(production_cost) / SUM(yield_tons), 2) AS cost_per_ton \n  FROM regional_production \n  GROUP BY facility_id\n)\nSELECT * FROM UnitCostCTE ORDER BY cost_per_ton ASC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length >= 4;
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 9: THE AGRICULTURAL EMPIRE
  // ==========================================================
  9: {
    level: 9,
    title: "THE AGRICULTURAL EMPIRE",
    role: "Agribusiness Executive",
    concept: "Window functions (RANK, ROW_NUMBER, PARTITION BY), running totals",
    teaser: "Analyze top 3 crops per farm, rank employee productivity, and forecast enterprise cash flows.",
    cutscene: {
      title: "Chapter 9: The Agribusiness Empire",
      image: "/images/cinematics/level9_empire.jpg",
      duration: 11,
      mood: "epic",
      subtitles: [
        { start: 0, end: 3.5, text: "Grain silos, automated processing plants, and distribution fleets operate in harmony." },
        { start: 3.5, end: 7.5, text: "Executive boardrooms review real-time agricultural analytics across all sectors." },
        { start: 7.5, end: 11, text: "Uncle Somu: 'Window functions give you row-level precision with enterprise vision!'" }
      ]
    },
    storyIntro: {
      headline: "Executive Suite & SQL Window Functions",
      text: "Uncle Somu hands you an executive badge: 'Welcome to corporate leadership! FARMDB is now a statewide agribusiness empire. At this level, executive decisions demand SQL Window Functions—functions that calculate running totals, ranks, and moving averages across partitions without collapsing individual rows!'",
      notebookEntries: [
        { label: "Corporate Scope", value: "Statewide Agribusiness Empire" },
        { label: "Divisions", value: "Central, Grains, Horticulture, Logistics" },
        { label: "Target", value: "Rank crops by division & model cumulative cash flows" },
        { label: "Key SQL Concepts", value: "SUM() OVER (), RANK() OVER (PARTITION BY ...), ROW_NUMBER()" }
      ]
    },
    completion: {
      title: "LEVEL 9 COMPLETE",
      subtitle: "Corporate Agribusiness Titan!",
      badge: "👑 Agribusiness Executive",
      summary: "You mastered advanced enterprise SQL! By deploying window functions (RANK, ROW_NUMBER, running totals with PARTITION BY), you generated executive analytics worthy of a Fortune 500 agricultural corporation.",
      stats: [
        { label: "Empire Revenue", value: "Statewide Scale" },
        { label: "Analytics Deployed", value: "Window Functions" },
        { label: "Running Cash Flows", value: "Modeled" },
        { label: "Cash Bonus", value: "+₹10,000" },
        { label: "XP Earned", value: "+500 XP" }
      ],
      nextLevelTitle: "Level 10: The Harvest Decision (Drought Crisis Finale!)"
    },
    missions: [
      {
        id: "L9_M0",
        title: "Create Enterprise Revenue Ledger",
        objective: "Create 'empire_revenue' table and seed quarterly monthly financial data.",
        dialogue: "Uncle Somu: 'Set up our corporate revenue ledger tracking monthly performance across divisions.'",
        concept: "CREATE TABLE for Corporate Accounting",
        hints: [
          "Create empire_revenue and insert monthly figures.",
          "CREATE TABLE empire_revenue (...); INSERT INTO empire_revenue ...;",
          "CREATE TABLE empire_revenue (\n  record_id INTEGER PRIMARY KEY,\n  month_num INTEGER,\n  division TEXT,\n  monthly_revenue INTEGER\n);\n\nINSERT INTO empire_revenue (record_id, month_num, division, monthly_revenue) VALUES \n(1, 1, 'Central', 45000),\n(2, 1, 'Grains', 85000),\n(3, 2, 'Central', 52000),\n(4, 2, 'Grains', 92000),\n(5, 3, 'Central', 61000),\n(6, 3, 'Grains', 105000),\n(7, 4, 'Central', 58000),\n(8, 4, 'Grains', 98000);"
        ],
        solution: "CREATE TABLE empire_revenue (\n  record_id INTEGER PRIMARY KEY,\n  month_num INTEGER,\n  division TEXT,\n  monthly_revenue INTEGER\n);\n\nINSERT INTO empire_revenue (record_id, month_num, division, monthly_revenue) VALUES \n(1, 1, 'Central', 45000),\n(2, 1, 'Grains', 85000),\n(3, 2, 'Central', 52000),\n(4, 2, 'Grains', 92000),\n(5, 3, 'Central', 61000),\n(6, 3, 'Grains', 105000),\n(7, 4, 'Central', 58000),\n(8, 4, 'Grains', 98000);",
        quickFill: "CREATE TABLE empire_revenue (\n  record_id INTEGER PRIMARY KEY,\n  month_num INTEGER,\n  division TEXT,\n  monthly_revenue INTEGER\n);\n\nINSERT INTO empire_revenue (record_id, month_num, division, monthly_revenue) VALUES \n(1, 1, 'Central', 45000),\n(2, 1, 'Grains', 85000),\n(3, 2, 'Central', 52000),\n(4, 2, 'Grains', 92000),\n(5, 3, 'Central', 61000),\n(6, 3, 'Grains', 105000),\n(7, 4, 'Central', 58000),\n(8, 4, 'Grains', 98000);",
        validate: (db) => {
          const revs = db.getTableData('empire_revenue');
          return revs && revs.length >= 8;
        }
      },
      {
        id: "L9_M1",
        title: "Compute Running Cumulative Revenue",
        objective: "Use SUM(monthly_revenue) OVER (ORDER BY record_id) to calculate running cumulative totals.",
        dialogue: "Uncle Somu: 'Calculate our running cumulative company revenue across records using an OVER window clause!'",
        concept: "Window Function: SUM(...) OVER (ORDER BY ...)",
        hints: [
          "Select record_id, month_num, division, monthly_revenue, SUM(monthly_revenue) OVER (ORDER BY record_id) AS running_total FROM empire_revenue.",
          "SELECT record_id, month_num, division, monthly_revenue, SUM(monthly_revenue) OVER (ORDER BY record_id) AS running_total FROM empire_revenue;",
          "SELECT record_id, month_num, division, monthly_revenue, SUM(monthly_revenue) OVER (ORDER BY record_id) AS running_total FROM empire_revenue;"
        ],
        solution: "SELECT record_id, month_num, division, monthly_revenue, SUM(monthly_revenue) OVER (ORDER BY record_id) AS running_total FROM empire_revenue;",
        quickFill: "SELECT record_id, month_num, division, monthly_revenue, SUM(monthly_revenue) OVER (ORDER BY record_id) AS running_total FROM empire_revenue;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('running_total') || cols.length >= 5;
        }
      },
      {
        id: "L9_M2",
        title: "Rank Crops per Facility with RANK()",
        objective: "Rank crop production per facility using RANK() OVER (PARTITION BY facility_id ORDER BY yield_tons DESC).",
        dialogue: "Uncle Somu: 'Rank our crops within each regional branch using RANK() partitioned by facility!'",
        concept: "RANK() OVER (PARTITION BY ... ORDER BY ...)",
        hints: [
          "Select facility_id, crop_name, yield_tons, RANK() OVER (PARTITION BY facility_id ORDER BY yield_tons DESC) AS yield_rank FROM regional_production.",
          "SELECT facility_id, crop_name, yield_tons, RANK() OVER (PARTITION BY facility_id ORDER BY yield_tons DESC) AS yield_rank FROM regional_production;",
          "SELECT facility_id, crop_name, yield_tons, RANK() OVER (PARTITION BY facility_id ORDER BY yield_tons DESC) AS yield_rank FROM regional_production;"
        ],
        solution: "SELECT facility_id, crop_name, yield_tons, RANK() OVER (PARTITION BY facility_id ORDER BY yield_tons DESC) AS yield_rank FROM regional_production;",
        quickFill: "SELECT facility_id, crop_name, yield_tons, RANK() OVER (PARTITION BY facility_id ORDER BY yield_tons DESC) AS yield_rank FROM regional_production;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('yield_rank') && queryResult.results[0].values.length >= 8;
        }
      },
      {
        id: "L9_M3",
        title: "Extract Top Performer per Branch with ROW_NUMBER()",
        objective: "Use a CTE with ROW_NUMBER() OVER (PARTITION BY facility_id ORDER BY yield_tons DESC) to isolate the #1 crop for each facility.",
        dialogue: "Uncle Somu: 'Extract only the single top-producing crop for every regional farm using ROW_NUMBER() = 1!'",
        concept: "ROW_NUMBER() inside a CTE filter",
        hints: [
          "WITH RankedCrops AS (SELECT facility_id, crop_name, yield_tons, ROW_NUMBER() OVER (PARTITION BY facility_id ORDER BY yield_tons DESC) AS rn FROM regional_production) SELECT * FROM RankedCrops WHERE rn = 1;",
          "WITH RankedCrops AS (\n  SELECT facility_id, crop_name, yield_tons,\n         ROW_NUMBER() OVER (PARTITION BY facility_id ORDER BY yield_tons DESC) AS rn\n  FROM regional_production\n)\nSELECT facility_id, crop_name, yield_tons FROM RankedCrops WHERE rn = 1;",
          "WITH RankedCrops AS (\n  SELECT facility_id, crop_name, yield_tons,\n         ROW_NUMBER() OVER (PARTITION BY facility_id ORDER BY yield_tons DESC) AS rn\n  FROM regional_production\n)\nSELECT facility_id, crop_name, yield_tons FROM RankedCrops WHERE rn = 1;"
        ],
        solution: "WITH RankedCrops AS (\n  SELECT facility_id, crop_name, yield_tons,\n         ROW_NUMBER() OVER (PARTITION BY facility_id ORDER BY yield_tons DESC) AS rn\n  FROM regional_production\n)\nSELECT facility_id, crop_name, yield_tons FROM RankedCrops WHERE rn = 1;",
        quickFill: "WITH RankedCrops AS (\n  SELECT facility_id, crop_name, yield_tons,\n         ROW_NUMBER() OVER (PARTITION BY facility_id ORDER BY yield_tons DESC) AS rn\n  FROM regional_production\n)\nSELECT facility_id, crop_name, yield_tons FROM RankedCrops WHERE rn = 1;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 4; // Exactly 1 top crop for each of the 4 facilities
        }
      },
      {
        id: "L9_M4",
        title: "Running Revenue by Division (PARTITION BY)",
        objective: "Calculate running cumulative revenue partitioned by division.",
        dialogue: "Uncle Somu: 'Track cumulative revenue separately for Central and Grains divisions using PARTITION BY division!'",
        concept: "SUM(...) OVER (PARTITION BY ... ORDER BY ...)",
        hints: [
          "SELECT month_num, division, monthly_revenue, SUM(monthly_revenue) OVER (PARTITION BY division ORDER BY month_num) AS division_running_total FROM empire_revenue;",
          "SELECT month_num, division, monthly_revenue, SUM(monthly_revenue) OVER (PARTITION BY division ORDER BY month_num) AS division_running_total FROM empire_revenue;",
          "SELECT month_num, division, monthly_revenue, SUM(monthly_revenue) OVER (PARTITION BY division ORDER BY month_num) AS division_running_total FROM empire_revenue;"
        ],
        solution: "SELECT month_num, division, monthly_revenue, SUM(monthly_revenue) OVER (PARTITION BY division ORDER BY month_num) AS division_running_total FROM empire_revenue;",
        quickFill: "SELECT month_num, division, monthly_revenue, SUM(monthly_revenue) OVER (PARTITION BY division ORDER BY month_num) AS division_running_total FROM empire_revenue;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('division_running_total') || cols.length >= 4;
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 10: THE HARVEST DECISION
  // ==========================================================
  10: {
    level: 10,
    title: "THE HARVEST DECISION",
    role: "Farm CEO",
    concept: "Comprehensive strategic data synthesis under severe drought constraints",
    teaser: "A severe drought threatens the region! Synthesize historical yields, water limits, and margins to steer the business to survival.",
    cutscene: {
      title: "Chapter 10: The Regional Drought Crisis",
      image: "/images/cinematics/level10_drought.jpg",
      duration: 12,
      mood: "crisis",
      subtitles: [
        { start: 0, end: 4, text: "Intense heat waves ripple across the arid valley as canal gates seal shut." },
        { start: 4, end: 8, text: "Only 18,000 liters remain in the emergency water reservoir." },
        { start: 8, end: 12, text: "Uncle Somu: 'This is the test of a lifetime. Lead us to survival and victory, Farm CEO!'" }
      ]
    },
    storyIntro: {
      headline: "The Great Drought & The Ultimate Executive Decision",
      text: "Uncle Somu gathers the executive council around the table under a blazing sun: 'CRISIS ALERT! The worst drought in fifty years has hit our state. River canals are locked, and our water reservoir has dropped to emergency levels. Every drop of water counts. As Chief Executive Officer of FARMDB, you must synthesize water consumption metrics, production costs, and expected market valuations in SQLite to allocate our remaining reserves, harvest high-margin yields, and guide the farm to total triumph!'",
      notebookEntries: [
        { label: "Crisis Event", value: "Centennial Regional Drought" },
        { label: "Water Reservoir", value: "Critically Rationed (18,000 L Remaining)" },
        { label: "CEO Objective", value: "Optimize margin per liter of water & save the empire" },
        { label: "Key SQL Concepts", value: "Full Relational Synthesis (JOINs + CTEs + Aggregates + CASE)" }
      ]
    },
    completion: {
      title: "🏆 GRAND FINALE: FARMDB CONQUERED!",
      subtitle: "The Ultimate Agribusiness Emperor!",
      badge: "🏆 Agribusiness Emperor",
      summary: "YOU DID IT! From a novice farmer holding your grandfather's weathered notebook to the Chief Executive Officer of an agricultural empire. You mastered DDL, DML, filtering, joins, subqueries, CTEs, and window functions to lead FARMDB through drought and adversity to legendary success!",
      stats: [
        { label: "All Levels Complete", value: "10 / 10 Mastered" },
        { label: "Drought Crisis", value: "Averted & Conquered" },
        { label: "Empire Valuation", value: "₹1,000,000+" },
        { label: "Final Cash Grant", value: "+₹25,000" },
        { label: "Final XP Earned", value: "+1,000 XP" }
      ],
      nextLevelTitle: "Congratulations! You are the Sovereign Farm CEO!"
    },
    missions: [
      {
        id: "L10_M0",
        title: "Drought Telemetry & Resource Model",
        objective: "Create 'drought_metrics' table and seed crop water requirements and market valuations.",
        dialogue: "Uncle Somu: 'Create drought_metrics: crop_name, water_liters_per_kg, expected_market_price, and cultivation_cost.'",
        concept: "Strategic Crisis Schema",
        hints: [
          "Create drought_metrics and populate data for Tomato, Rice, Wheat, and Corn.",
          "CREATE TABLE drought_metrics (...); INSERT INTO drought_metrics ...;",
          "CREATE TABLE drought_metrics (\n  crop_name TEXT PRIMARY KEY,\n  water_liters_per_kg INTEGER,\n  expected_market_price INTEGER,\n  cultivation_cost INTEGER\n);\n\nINSERT INTO drought_metrics (crop_name, water_liters_per_kg, expected_market_price, cultivation_cost) VALUES \n('Tomato', 50, 32, 12),\n('Rice', 140, 35, 15),\n('Wheat', 30, 24, 10),\n('Corn', 40, 26, 11);"
        ],
        solution: "CREATE TABLE drought_metrics (\n  crop_name TEXT PRIMARY KEY,\n  water_liters_per_kg INTEGER,\n  expected_market_price INTEGER,\n  cultivation_cost INTEGER\n);\n\nINSERT INTO drought_metrics (crop_name, water_liters_per_kg, expected_market_price, cultivation_cost) VALUES \n('Tomato', 50, 32, 12),\n('Rice', 140, 35, 15),\n('Wheat', 30, 24, 10),\n('Corn', 40, 26, 11);",
        quickFill: "CREATE TABLE drought_metrics (\n  crop_name TEXT PRIMARY KEY,\n  water_liters_per_kg INTEGER,\n  expected_market_price INTEGER,\n  cultivation_cost INTEGER\n);\n\nINSERT INTO drought_metrics (crop_name, water_liters_per_kg, expected_market_price, cultivation_cost) VALUES \n('Tomato', 50, 32, 12),\n('Rice', 140, 35, 15),\n('Wheat', 30, 24, 10),\n('Corn', 40, 26, 11);",
        validate: (db) => {
          const m = db.getTableData('drought_metrics');
          return m && m.length >= 4;
        }
      },
      {
        id: "L10_M1",
        title: "Compute Profit Margin per Liter of Water",
        objective: "Write a CTE calculating profit per kg and profit_per_liter = ROUND(CAST(expected_market_price - cultivation_cost AS REAL) / water_liters_per_kg, 2).",
        dialogue: "Uncle Somu: 'Water is our rarest asset. Calculate which crop gives the greatest profit margin per liter of water consumed!'",
        concept: "Water-to-Profit Efficiency CTE",
        hints: [
          "WITH WaterEfficiency AS (SELECT crop_name, (expected_market_price - cultivation_cost) AS profit_per_kg, water_liters_per_kg, ROUND(CAST(expected_market_price - cultivation_cost AS REAL) / water_liters_per_kg, 2) AS profit_per_liter FROM drought_metrics) SELECT * FROM WaterEfficiency ORDER BY profit_per_liter DESC;",
          "WITH WaterEfficiency AS (\n  SELECT crop_name, \n         (expected_market_price - cultivation_cost) AS profit_per_kg,\n         water_liters_per_kg,\n         ROUND(CAST(expected_market_price - cultivation_cost AS REAL) / water_liters_per_kg, 2) AS profit_per_liter\n  FROM drought_metrics\n)\nSELECT * FROM WaterEfficiency ORDER BY profit_per_liter DESC;",
          "WITH WaterEfficiency AS (\n  SELECT crop_name, \n         (expected_market_price - cultivation_cost) AS profit_per_kg,\n         water_liters_per_kg,\n         ROUND(CAST(expected_market_price - cultivation_cost AS REAL) / water_liters_per_kg, 2) AS profit_per_liter\n  FROM drought_metrics\n)\nSELECT * FROM WaterEfficiency ORDER BY profit_per_liter DESC;"
        ],
        solution: "WITH WaterEfficiency AS (\n  SELECT crop_name, \n         (expected_market_price - cultivation_cost) AS profit_per_kg,\n         water_liters_per_kg,\n         ROUND(CAST(expected_market_price - cultivation_cost AS REAL) / water_liters_per_kg, 2) AS profit_per_liter\n  FROM drought_metrics\n)\nSELECT * FROM WaterEfficiency ORDER BY profit_per_liter DESC;",
        quickFill: "WITH WaterEfficiency AS (\n  SELECT crop_name, \n         (expected_market_price - cultivation_cost) AS profit_per_kg,\n         water_liters_per_kg,\n         ROUND(CAST(expected_market_price - cultivation_cost AS REAL) / water_liters_per_kg, 2) AS profit_per_liter\n  FROM drought_metrics\n)\nSELECT * FROM WaterEfficiency ORDER BY profit_per_liter DESC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('profit_per_liter') && queryResult.results[0].values.length === 4;
        }
      },
      {
        id: "L10_M2",
        title: "Allocate Crisis Irrigation Quotas with CASE",
        objective: "Allocate water based on efficiency: >= 0.40 gets 'Full Irrigation', >= 0.35 gets 'Rationed Half Irrigation', else 'Fallow/Dormant'.",
        dialogue: "Uncle Somu: 'Assign our emergency water rationing quotas using a CASE statement based on margin per liter!'",
        concept: "Strategic Crisis Allocation with CASE",
        hints: [
          "Select crop_name and a CASE statement categorizing irrigation quotas.",
          "SELECT crop_name,\n  CASE \n    WHEN (CAST(expected_market_price - cultivation_cost AS REAL) / water_liters_per_kg) >= 0.40 THEN 'Full Irrigation Priority'\n    WHEN (CAST(expected_market_price - cultivation_cost AS REAL) / water_liters_per_kg) >= 0.35 THEN 'Rationed Half Irrigation'\n    ELSE 'Fallow/Dormant'\n  END AS drought_strategy\nFROM drought_metrics;",
          "SELECT crop_name,\n  CASE \n    WHEN (CAST(expected_market_price - cultivation_cost AS REAL) / water_liters_per_kg) >= 0.40 THEN 'Full Irrigation Priority'\n    WHEN (CAST(expected_market_price - cultivation_cost AS REAL) / water_liters_per_kg) >= 0.35 THEN 'Rationed Half Irrigation'\n    ELSE 'Fallow/Dormant'\n  END AS drought_strategy\nFROM drought_metrics;"
        ],
        solution: "SELECT crop_name,\n  CASE \n    WHEN (CAST(expected_market_price - cultivation_cost AS REAL) / water_liters_per_kg) >= 0.40 THEN 'Full Irrigation Priority'\n    WHEN (CAST(expected_market_price - cultivation_cost AS REAL) / water_liters_per_kg) >= 0.35 THEN 'Rationed Half Irrigation'\n    ELSE 'Fallow/Dormant'\n  END AS drought_strategy\nFROM drought_metrics;",
        quickFill: "SELECT crop_name,\n  CASE \n    WHEN (CAST(expected_market_price - cultivation_cost AS REAL) / water_liters_per_kg) >= 0.40 THEN 'Full Irrigation Priority'\n    WHEN (CAST(expected_market_price - cultivation_cost AS REAL) / water_liters_per_kg) >= 0.35 THEN 'Rationed Half Irrigation'\n    ELSE 'Fallow/Dormant'\n  END AS drought_strategy\nFROM drought_metrics;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 4 && rows.some(r => r.includes('Full Irrigation Priority'));
        }
      },
      {
        id: "L10_M3",
        title: "Value Remaining Emergency Warehouse Stock",
        objective: "Join stock with drought_metrics to compute crisis market valuation (quantity * expected_market_price).",
        dialogue: "Uncle Somu: 'Join our warehouse stock with current drought market valuations to assess our liquid reserve power!'",
        concept: "Multi-Table Strategic JOIN",
        hints: [
          "Join stock and drought_metrics on crop name.",
          "SELECT s.product_name, s.quantity, d.expected_market_price, (s.quantity * d.expected_market_price) AS crisis_value FROM stock s INNER JOIN drought_metrics d ON LOWER(s.product_name) = LOWER(d.crop_name);",
          "SELECT s.product_name, s.quantity, d.expected_market_price, (s.quantity * d.expected_market_price) AS crisis_value FROM stock s INNER JOIN drought_metrics d ON LOWER(s.product_name) = LOWER(d.crop_name);"
        ],
        solution: "SELECT s.product_name, s.quantity, d.expected_market_price, (s.quantity * d.expected_market_price) AS crisis_value FROM stock s INNER JOIN drought_metrics d ON LOWER(s.product_name) = LOWER(d.crop_name);",
        quickFill: "SELECT s.product_name, s.quantity, d.expected_market_price, (s.quantity * d.expected_market_price) AS crisis_value FROM stock s INNER JOIN drought_metrics d ON LOWER(s.product_name) = LOWER(d.crop_name);",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('crisis_value') && queryResult.results[0].values.length >= 3;
        }
      },
      {
        id: "L10_M4",
        title: "The Grand Sovereign Victory Resolution",
        objective: "Execute the final grand triumph query verifying total farm empire survival and victory!",
        dialogue: "Uncle Somu embraces you with tears of joy: 'You did it! The drought is broken, the harvest is preserved, and the empire is prosperous. Run our final executive victory query to crown your journey as Farm CEO!'",
        concept: "The Final Sovereign Synthesis",
        hints: [
          "Execute the final triumph query summing our crisis harvest revenue.",
          "SELECT 'FARMDB EMPIRE SURVIVED & TRIUMPHED' AS status, SUM(s.quantity * d.expected_market_price) AS final_treasury_revenue FROM stock s INNER JOIN drought_metrics d ON LOWER(s.product_name) = LOWER(d.crop_name);",
          "SELECT 'FARMDB EMPIRE SURVIVED & TRIUMPHED' AS status, SUM(s.quantity * d.expected_market_price) AS final_treasury_revenue FROM stock s INNER JOIN drought_metrics d ON LOWER(s.product_name) = LOWER(d.crop_name);"
        ],
        solution: "SELECT 'FARMDB EMPIRE SURVIVED & TRIUMPHED' AS status, SUM(s.quantity * d.expected_market_price) AS final_treasury_revenue FROM stock s INNER JOIN drought_metrics d ON LOWER(s.product_name) = LOWER(d.crop_name);",
        quickFill: "SELECT 'FARMDB EMPIRE SURVIVED & TRIUMPHED' AS status, SUM(s.quantity * d.expected_market_price) AS final_treasury_revenue FROM stock s INNER JOIN drought_metrics d ON LOWER(s.product_name) = LOWER(d.crop_name);",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 1 && rows[0].some(val => String(val).includes('TRIUMPHED'));
        }
      }
    ]
  }
};


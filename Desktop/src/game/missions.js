/**
 * FARMDB Mission Definitions & Story Narrative
 * Levels 1 & 2 fully playable; Levels 3-10 roadmap
 */

export const MISSIONS_DATA = {
  1: {
    level: 1,
    title: "THE FARM WITHOUT A MEMORY",
    role: "Farm Assistant",
    concept: "CREATE TABLE, PRIMARY KEY, FOREIGN KEY, INSERT, SELECT",
    cutscene: {
      title: "Chapter 1: The Farm Without a Memory",
      image: "/images/cinematics/level1_homestead.jpg",
      duration: 11,
      mood: "peaceful",
      subtitles: [
        { start: 0, end: 3.5, text: "You arrive at a neglected countryside farm with unkept fields and scattered records." },
        { start: 3.5, end: 7.5, text: "An old tractor rests in the yard and two cows graze quietly near the barn." },
        { start: 7.5, end: 11, text: "Uncle Somu: 'Before we plant anything, we need to know what we actually have. Welcome to FARMDB.'" }
      ]
    },
    storyIntro: {
      headline: "A Farm Without a Memory",
      text: "You arrive at a neglected countryside farmstead. The fields are quiet, weeds grow along the fence, and operational records are scattered and unreliable. Uncle Somu greets you: 'Before we plant anything, we need to know what we actually have. Every record in our database needs a unique identity (PRIMARY KEY), and related records must connect to each other (FOREIGN KEY). Let us build our farm's memory in FARMDB!'",
      notebookEntries: [
        { label: "Warehouse Inventory", value: "Tomato (10), Rice (15), Wheat (20)" },
        { label: "Livestock in Barn", value: "Daisy (Cow, Age 3) | Bella (Cow, Age 4)" },
        { label: "Feed Supplies", value: "15 kg Hay for dairy cattle" },
        { label: "Yard Machinery", value: "Old Red (Tractor, Operational)" },
        { label: "Starting Capital", value: "₹500 in tin box" }
      ]
    },
    completion: {
      title: "LEVEL 1 COMPLETE",
      subtitle: "The farm finally has a memory!",
      badge: "🌱 Farm Assistant",
      summary: "You built the foundational relational schema of FARMDB! With PRIMARY KEYs giving identity to seeds, livestock, and machinery, and FOREIGN KEYs connecting feed logs to cattle, the farm database is officially operational.",
      stats: [
        { label: "Career Role", value: "Farm Assistant" },
        { label: "Tables Created", value: "4 (seeds, animals, feed_log, equipment)" },
        { label: "Relational Keys", value: "PRIMARY KEY & FOREIGN KEY" },
        { label: "Starting Seed Stock", value: "45 Total Seeds" },
        { label: "Cash on Hand", value: "₹500" },
        { label: "XP Earned", value: "+100 XP" }
      ],
      nextLevelTitle: "Level 2: The Warehouse Has a Problem"
    },
    missions: [
      {
        id: "L1_M0",
        title: "Create the Seeds Catalog (PRIMARY KEY)",
        objective: "Create the 'seeds' table with seed_id as PRIMARY KEY, seed_name, quantity, and price.",
        dialogue: "Uncle Somu: 'Before we plant anything, we need to know what we actually have. In SQL, every record needs an identity — a PRIMARY KEY. Create our first catalog table: seeds with columns seed_id (INTEGER PRIMARY KEY), seed_name (TEXT), quantity (INTEGER), and price (INTEGER).'",
        concept: "CREATE TABLE, PRIMARY KEY, Data Types",
        hints: [
          "Use CREATE TABLE with the table name 'seeds'.",
          "Specify seed_id INTEGER PRIMARY KEY, seed_name TEXT, quantity INTEGER, price INTEGER.",
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
        title: "Record Starting Seed Inventory",
        objective: "Insert the 3 seed varieties from the notebook into the 'seeds' table.",
        dialogue: "Uncle Somu: 'The old notebook lists 10 Tomato seeds, 15 Rice seeds, and 20 Wheat seeds. Let's record them in our seeds table using INSERT INTO so nothing is lost!'",
        concept: "INSERT INTO ... VALUES",
        hints: [
          "Use INSERT INTO seeds (seed_name, quantity, price) VALUES (...).",
          "You can insert multiple rows separated by commas.",
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
        dialogue: "Uncle Somu: 'Great! Run a SELECT query so we can inspect everything stored in our seeds table.'",
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
        title: "Register Livestock with Primary Keys",
        objective: "Create the 'animals' table with animal_id PRIMARY KEY and insert Daisy and Bella.",
        dialogue: "Uncle Somu: 'Hear that gentle moo from the barn? Those are Daisy and Bella. Create an animals table with animal_id (INTEGER PRIMARY KEY), animal_type (TEXT), name (TEXT), age (INTEGER), health (TEXT), and register them!'",
        concept: "CREATE TABLE & INSERT with PRIMARY KEY",
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
        title: "Connect Feed to Cattle (FOREIGN KEY)",
        objective: "Create 'feed_log' with a FOREIGN KEY referencing animals(animal_id), and insert feed for Daisy.",
        dialogue: "Uncle Somu: 'Every animal in the barn needs feed. A FOREIGN KEY connects a record in one table to a record in another table! Create a feed_log table where animal_id is a FOREIGN KEY referencing animals(animal_id), then log 15kg of Hay for Daisy (animal_id 1).'",
        concept: "FOREIGN KEY & Relational Table Links",
        hints: [
          "Create feed_log table with columns: feed_id INTEGER PRIMARY KEY, animal_id INTEGER, feed_type TEXT, amount_kg INTEGER, and FOREIGN KEY (animal_id) REFERENCES animals(animal_id).",
          "Then insert 15kg of 'Hay' for animal_id 1.",
          "CREATE TABLE feed_log (\n  feed_id INTEGER PRIMARY KEY,\n  animal_id INTEGER,\n  feed_type TEXT,\n  amount_kg INTEGER,\n  FOREIGN KEY (animal_id) REFERENCES animals(animal_id)\n);\n\nINSERT INTO feed_log (animal_id, feed_type, amount_kg) VALUES (1, 'Hay', 15);"
        ],
        solution: "CREATE TABLE feed_log (\n  feed_id INTEGER PRIMARY KEY,\n  animal_id INTEGER,\n  feed_type TEXT,\n  amount_kg INTEGER,\n  FOREIGN KEY (animal_id) REFERENCES animals(animal_id)\n);\n\nINSERT INTO feed_log (animal_id, feed_type, amount_kg) VALUES (1, 'Hay', 15);",
        quickFill: "CREATE TABLE feed_log (\n  feed_id INTEGER PRIMARY KEY,\n  animal_id INTEGER,\n  feed_type TEXT,\n  amount_kg INTEGER,\n  FOREIGN KEY (animal_id) REFERENCES animals(animal_id)\n);\n\nINSERT INTO feed_log (animal_id, feed_type, amount_kg) VALUES (1, 'Hay', 15);",
        validate: (db) => {
          const schema = db.getSchema();
          if (!schema['feed_log']) return false;
          const data = db.getTableData('feed_log');
          return data && data.length >= 1;
        }
      },
      {
        id: "L1_M5",
        title: "Register the Old Tractor",
        objective: "Create the 'equipment' table with equipment_id PRIMARY KEY and add the old tractor.",
        dialogue: "Uncle Somu: 'Lastly, our trusty old tractor in the yard. Create an equipment table with equipment_id (INTEGER PRIMARY KEY), name (TEXT), type (TEXT), status (TEXT), and insert Old Red!'",
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
    title: "THE WAREHOUSE HAS A PROBLEM",
    role: "Farm Assistant",
    concept: "INSERT, SELECT, Column Selection, Multi-Row INSERT",
    cutscene: {
      title: "Chapter 2: The Disorganized Warehouse",
      image: "/images/cinematics/level2_harvest.jpg",
      duration: 11,
      mood: "curious",
      subtitles: [
        { start: 0, end: 3.5, text: "The morning sun casts light on the storage shed, where boxes and sacks pile high." },
        { start: 3.5, end: 7.5, text: "Old paper logs list fertilizers, feed, and tools, but nobody knows what is actually in stock." },
        { start: 7.5, end: 11, text: "Uncle Somu: 'A messy warehouse stops farm operations. Let us digitize our supplies!'" }
      ]
    },
    storyIntro: {
      headline: "The Warehouse Dilemma",
      text: "Our database now tracks seeds, animals, feed logs, and equipment, but the main storage warehouse is in disarray. Dusty bags of fertilizer, animal feed, and hand tools are stacked without a digital ledger. The owner sighs: 'Nobody knows exactly what supplies we have in stock. Let's create our supplies ledger and record every batch into FARMDB!'",
      notebookEntries: [
        { label: "Warehouse Goal", value: "Catalog and audit all farm supplies in SQLite" },
        { label: "Unlogged Fertilizers", value: "50 bags Compost, 30 bags Organic NPK" },
        { label: "Unlogged Animal Feed", value: "25 sacks Dairy Cattle Mash" },
        { label: "Unlogged Tools", value: "12 pieces Hand Hoes" },
        { label: "Target Skills", value: "INSERT, SELECT, column projection, multi-row batches" }
      ]
    },
    completion: {
      title: "LEVEL 2 COMPLETE",
      subtitle: "Warehouse inventory organized and verified!",
      badge: "📦 Inventory Assistant",
      summary: "You restored order to the farm warehouse! Using multi-row INSERTs and precise SELECT column queries, all fertilizers, feed, and tools are now indexed and auditable in FARMDB.",
      stats: [
        { label: "Supplies Cataloged", value: "4 Items (117 Total Units)" },
        { label: "Categories Tracked", value: "Fertilizer, Feed, Tools" },
        { label: "SQL Mastered", value: "INSERT, SELECT, Column Projection" },
        { label: "Cash Reward", value: "+₹300" },
        { label: "XP Earned", value: "+125 XP" }
      ],
      nextLevelTitle: "Level 3: Find What You Need"
    },
    missions: [
      {
        id: "L2_M0",
        title: "Create the Warehouse Supplies Catalog",
        objective: "Create the 'supplies' table with supply_id (INTEGER PRIMARY KEY), item_name (TEXT), category (TEXT), quantity (INTEGER), and unit (TEXT).",
        dialogue: "Uncle Somu: 'Before we can record our supplies, we need a dedicated table. Create supplies with supply_id (INTEGER PRIMARY KEY), item_name (TEXT), category (TEXT), quantity (INTEGER), and unit (TEXT).'",
        concept: "CREATE TABLE with PRIMARY KEY",
        hints: [
          "Use CREATE TABLE with table name 'supplies'.",
          "Specify: supply_id INTEGER PRIMARY KEY, item_name TEXT, category TEXT, quantity INTEGER, unit TEXT.",
          "CREATE TABLE supplies (\n  supply_id INTEGER PRIMARY KEY,\n  item_name TEXT,\n  category TEXT,\n  quantity INTEGER,\n  unit TEXT\n);"
        ],
        solution: "CREATE TABLE supplies (\n  supply_id INTEGER PRIMARY KEY,\n  item_name TEXT,\n  category TEXT,\n  quantity INTEGER,\n  unit TEXT\n);",
        quickFill: "CREATE TABLE supplies (\n  supply_id INTEGER PRIMARY KEY,\n  item_name TEXT,\n  category TEXT,\n  quantity INTEGER,\n  unit TEXT\n);",
        validate: (db) => {
          const schema = db.getSchema();
          return !!schema['supplies'];
        }
      },
      {
        id: "L2_M1",
        title: "Log Fertilizer Supplies (Multi-Row INSERT)",
        objective: "Insert Compost (50 bags) and Organic NPK (30 bags) into the 'supplies' table in a single query.",
        dialogue: "Uncle Somu: 'Let us record our fertilizers first: 50 bags of Compost and 30 bags of Organic NPK. You can insert multiple rows at once using commas!'",
        concept: "INSERT INTO ... VALUES (multiple rows)",
        hints: [
          "Use INSERT INTO supplies (item_name, category, quantity, unit) VALUES (...), (...);",
          "Add ('Compost', 'Fertilizer', 50, 'bags') and ('Organic NPK', 'Fertilizer', 30, 'bags').",
          "INSERT INTO supplies (item_name, category, quantity, unit) VALUES \n('Compost', 'Fertilizer', 50, 'bags'),\n('Organic NPK', 'Fertilizer', 30, 'bags');"
        ],
        solution: "INSERT INTO supplies (item_name, category, quantity, unit) VALUES \n('Compost', 'Fertilizer', 50, 'bags'),\n('Organic NPK', 'Fertilizer', 30, 'bags');",
        quickFill: "INSERT INTO supplies (item_name, category, quantity, unit) VALUES \n('Compost', 'Fertilizer', 50, 'bags'),\n('Organic NPK', 'Fertilizer', 30, 'bags');",
        validate: (db) => {
          const data = db.getTableData('supplies');
          if (!data || data.length < 2) return false;
          const names = data.map(d => (d.item_name || '').toLowerCase());
          return names.includes('compost') && (names.includes('organic npk') || names.some(n => n.includes('npk')));
        }
      },
      {
        id: "L2_M2",
        title: "Catalog Feed Sacks & Field Tools",
        objective: "Insert Dairy Cattle Mash (25 sacks) and Hand Hoe (12 pieces) into 'supplies'.",
        dialogue: "Uncle Somu: 'Next in the corner: 25 sacks of Dairy Cattle Mash (category Feed) and 12 Hand Hoes (category Tools). Add them to the supplies table!'",
        concept: "INSERT INTO (Expanding Warehouse Records)",
        hints: [
          "Insert ('Dairy Cattle Mash', 'Feed', 25, 'sacks') and ('Hand Hoe', 'Tools', 12, 'pieces') into supplies.",
          "INSERT INTO supplies (item_name, category, quantity, unit) VALUES \n('Dairy Cattle Mash', 'Feed', 25, 'sacks'),\n('Hand Hoe', 'Tools', 12, 'pieces');",
          "INSERT INTO supplies (item_name, category, quantity, unit) VALUES \n('Dairy Cattle Mash', 'Feed', 25, 'sacks'),\n('Hand Hoe', 'Tools', 12, 'pieces');"
        ],
        solution: "INSERT INTO supplies (item_name, category, quantity, unit) VALUES \n('Dairy Cattle Mash', 'Feed', 25, 'sacks'),\n('Hand Hoe', 'Tools', 12, 'pieces');",
        quickFill: "INSERT INTO supplies (item_name, category, quantity, unit) VALUES \n('Dairy Cattle Mash', 'Feed', 25, 'sacks'),\n('Hand Hoe', 'Tools', 12, 'pieces');",
        validate: (db) => {
          const data = db.getTableData('supplies');
          if (!data || data.length < 4) return false;
          const names = data.map(d => (d.item_name || '').toLowerCase());
          return names.some(n => n.includes('mash') || n.includes('dairy')) && names.some(n => n.includes('hoe'));
        }
      },
      {
        id: "L2_M3",
        title: "Inspect Complete Warehouse Inventory",
        objective: "Query all records and columns from the supplies table using SELECT *.",
        dialogue: "Uncle Somu: 'All incoming deliveries are logged! Execute a query to retrieve all rows and columns from the supplies table.'",
        concept: "SELECT * FROM supplies",
        hints: [
          "Use the SELECT keyword with asterisk (*) to select all columns.",
          "Specify FROM supplies to read the supplies table.",
          "SELECT * FROM supplies;"
        ],
        solution: "SELECT * FROM supplies;",
        quickFill: "SELECT * FROM supplies;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('item_name') && queryResult.results[0].values.length >= 4;
        }
      },
      {
        id: "L2_M4",
        title: "Check Item Names & Quantities (Column Projection)",
        objective: "Query only the item_name and quantity columns from the supplies table.",
        dialogue: "Uncle Somu: 'The farm manager wants a quick stock count without the extra details. Query only the item_name and quantity columns from supplies.'",
        concept: "SELECT column1, column2 (Column Projection)",
        hints: [
          "Instead of asterisk (*), specify the column names separated by a comma: item_name, quantity.",
          "SELECT item_name, quantity FROM supplies;",
          "SELECT item_name, quantity FROM supplies;"
        ],
        solution: "SELECT item_name, quantity FROM supplies;",
        quickFill: "SELECT item_name, quantity FROM supplies;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('item_name') && cols.includes('quantity') && queryResult.results[0].values.length >= 4;
        }
      },
      {
        id: "L2_M5",
        title: "Generate Shelf Packaging Report",
        objective: "Query item_name, category, and unit from the supplies table for shelf labeling.",
        dialogue: "Uncle Somu: 'To print shelf labels for the warehouse storage racks, retrieve the item_name, category, and unit columns.'",
        concept: "SELECT specific multiple columns",
        hints: [
          "Select item_name, category, unit from supplies.",
          "SELECT item_name, category, unit FROM supplies;",
          "SELECT item_name, category, unit FROM supplies;"
        ],
        solution: "SELECT item_name, category, unit FROM supplies;",
        quickFill: "SELECT item_name, category, unit FROM supplies;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('item_name') && cols.includes('category') && cols.includes('unit') && queryResult.results[0].values.length >= 4;
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 3: THE FARM GETS BUSY
  // ==========================================================
  3: {
    level: 3,
    title: "FIND WHAT YOU NEED",
    role: "Data Analyst",
    concept: "WHERE, ORDER BY, LIMIT",
    cutscene: {
      title: "Chapter 3: Searching the Farm's Ledger",
      image: "/images/cinematics/level3_fields.jpg",
      duration: 11,
      mood: "curious",
      subtitles: [
        { start: 0, end: 3.5, text: "As the farm grows, handwritten logbooks become thick and difficult to search." },
        { start: 3.5, end: 7.5, text: "The farm manager urgently needs to know which supplies are running low and which seeds are top priority." },
        { start: 7.5, end: 11, text: "Uncle Somu: 'Manual inspection takes too long. Use SQL filtering and sorting to find what you need!'" }
      ]
    },
    storyIntro: {
      headline: "The Growing Farm Ledger",
      text: "The farm database is now tracking seeds, livestock, feed logs, equipment, and warehouse supplies. But manual inspection is becoming impossible. The manager approaches you with urgent operational questions: Which supplies are running critically low? Which seed varieties are most expensive? Which orders need immediate attention? You will now turn SQL into a precision search and sorting tool!",
      notebookEntries: [
        { label: "Manager's Question 1", value: "Identify supplies below safe operational threshold (< 30 units)" },
        { label: "Manager's Question 2", value: "Filter specific categories (Fertilizer supplies)" },
        { label: "Manager's Question 3", value: "Rank seed varieties by market price" },
        { label: "Manager's Question 4", value: "Generate a prioritized restock report for the procurement team" },
        { label: "Target SQL Tools", value: "WHERE, ORDER BY (ASC/DESC), LIMIT" }
      ]
    },
    completion: {
      title: "LEVEL 3 COMPLETE",
      subtitle: "The farm database is now an active intelligence tool!",
      badge: "🔍 Search & Filter Analyst",
      summary: "You transformed FARMDB from a passive ledger into an agile search and prioritization engine! By filtering with WHERE, sorting with ORDER BY, and slicing with LIMIT, the farm management can instantly locate critical assets.",
      stats: [
        { label: "Career Role", value: "Data Analyst" },
        { label: "Search Queries Mastered", value: "WHERE, ORDER BY, LIMIT" },
        { label: "Restock Priorities Identified", value: "Hand Hoes (12), Cattle Mash (25)" },
        { label: "Cash Reward", value: "+₹400" },
        { label: "XP Earned", value: "+150 XP" }
      ],
      nextLevelTitle: "Level 4: First Planting"
    },
    missions: [
      {
        id: "L3_M0",
        title: "Find Low Stock Supplies",
        objective: "Use WHERE to query all columns from 'supplies' where quantity is less than 30.",
        dialogue: "Uncle Somu: 'Some warehouse items are running dangerously low. In SQL, the WHERE clause filters rows matching exact conditions. Query all columns from supplies where quantity < 30.'",
        concept: "SELECT ... WHERE (Numeric Comparison)",
        hints: [
          "Use WHERE quantity < 30 after FROM supplies.",
          "SELECT * FROM supplies WHERE quantity < 30;",
          "SELECT * FROM supplies WHERE quantity < 30;"
        ],
        solution: "SELECT * FROM supplies WHERE quantity < 30;",
        quickFill: "SELECT * FROM supplies WHERE quantity < 30;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const qtyIdx = cols.indexOf('quantity');
          if (qtyIdx === -1 || rows.length === 0) return false;
          return rows.every(r => Number(r[qtyIdx]) < 30) && rows.length >= 2;
        }
      },
      {
        id: "L3_M1",
        title: "Filter Fertilizer Supplies",
        objective: "Use WHERE to find all rows in 'supplies' where category is 'Fertilizer'.",
        dialogue: "Uncle Somu: 'The field crew needs all fertilizer supplies for soil treatment. Filter the supplies table where category = \"Fertilizer\".'",
        concept: "SELECT ... WHERE (Text Exact Match)",
        hints: [
          "Filter by text using category = 'Fertilizer'.",
          "SELECT * FROM supplies WHERE category = 'Fertilizer';",
          "SELECT * FROM supplies WHERE category = 'Fertilizer';"
        ],
        solution: "SELECT * FROM supplies WHERE category = 'Fertilizer';",
        quickFill: "SELECT * FROM supplies WHERE category = 'Fertilizer';",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const catIdx = cols.indexOf('category');
          if (catIdx === -1 || rows.length === 0) return false;
          return rows.every(r => String(r[catIdx]).toLowerCase() === 'fertilizer');
        }
      },
      {
        id: "L3_M2",
        title: "Sort Seeds by Market Price",
        objective: "Use ORDER BY price ASC to arrange seeds from cheapest to most expensive.",
        dialogue: "Uncle Somu: 'Let us see our seed stock arranged by price. Use the ORDER BY clause with ASC to sort from lowest price to highest.'",
        concept: "SELECT ... ORDER BY column ASC",
        hints: [
          "Add ORDER BY price ASC at the end of your query.",
          "SELECT * FROM seeds ORDER BY price ASC;",
          "SELECT * FROM seeds ORDER BY price ASC;"
        ],
        solution: "SELECT * FROM seeds ORDER BY price ASC;",
        quickFill: "SELECT * FROM seeds ORDER BY price ASC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const priceIdx = cols.indexOf('price');
          if (priceIdx === -1 || rows.length < 2) return false;
          for (let i = 0; i < rows.length - 1; i++) {
            if (Number(rows[i][priceIdx]) > Number(rows[i + 1][priceIdx])) return false;
          }
          return true;
        }
      },
      {
        id: "L3_M3",
        title: "Identify Top Premium Seeds",
        objective: "Use ORDER BY price DESC and LIMIT 2 to find our 2 most expensive seed varieties.",
        dialogue: "Uncle Somu: 'Which seeds represent our highest investment? Sort the seeds table in descending order (DESC) and restrict the result with LIMIT 2!'",
        concept: "ORDER BY DESC with LIMIT",
        hints: [
          "Use ORDER BY price DESC followed by LIMIT 2.",
          "SELECT * FROM seeds ORDER BY price DESC LIMIT 2;",
          "SELECT * FROM seeds ORDER BY price DESC LIMIT 2;"
        ],
        solution: "SELECT * FROM seeds ORDER BY price DESC LIMIT 2;",
        quickFill: "SELECT * FROM seeds ORDER BY price DESC LIMIT 2;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const priceIdx = cols.indexOf('price');
          if (priceIdx === -1 || rows.length !== 2) return false;
          return Number(rows[0][priceIdx]) >= Number(rows[1][priceIdx]);
        }
      },
      {
        id: "L3_M4",
        title: "Warehouse Restock Priority List",
        objective: "Query item_name, quantity, and unit from 'supplies' where quantity < 40 ordered by quantity ASC.",
        dialogue: "Uncle Somu: 'The procurement assistant needs a restock priority list. Select item_name, quantity, and unit from supplies where quantity < 40, sorted with lowest quantity first (ORDER BY quantity ASC)!'",
        concept: "Combining WHERE and ORDER BY",
        hints: [
          "Select specific columns item_name, quantity, unit, filter with WHERE quantity < 40, and sort with ORDER BY quantity ASC.",
          "SELECT item_name, quantity, unit FROM supplies WHERE quantity < 40 ORDER BY quantity ASC;",
          "SELECT item_name, quantity, unit FROM supplies WHERE quantity < 40 ORDER BY quantity ASC;"
        ],
        solution: "SELECT item_name, quantity, unit FROM supplies WHERE quantity < 40 ORDER BY quantity ASC;",
        quickFill: "SELECT item_name, quantity, unit FROM supplies WHERE quantity < 40 ORDER BY quantity ASC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const qtyIdx = cols.indexOf('quantity');
          if (qtyIdx === -1 || rows.length < 2) return false;
          const isFiltered = rows.every(r => Number(r[qtyIdx]) < 40);
          let isSorted = true;
          for (let i = 0; i < rows.length - 1; i++) {
            if (Number(rows[i][qtyIdx]) > Number(rows[i + 1][qtyIdx])) isSorted = false;
          }
          return isFiltered && isSorted;
        }
      },
      {
        id: "L3_M5",
        title: "Critical Urgent Restock Action Report",
        objective: "Query item_name, category, and quantity from 'supplies' where quantity < 30 ordered by quantity ASC LIMIT 1.",
        dialogue: "Uncle Somu: 'Executive summary time! Find the single most urgent supply item in the warehouse (quantity < 30), sorted lowest first, limited to 1 row!'",
        concept: "WHERE + ORDER BY + LIMIT Combined",
        hints: [
          "Combine WHERE quantity < 30, ORDER BY quantity ASC, and LIMIT 1.",
          "SELECT item_name, category, quantity FROM supplies WHERE quantity < 30 ORDER BY quantity ASC LIMIT 1;",
          "SELECT item_name, category, quantity FROM supplies WHERE quantity < 30 ORDER BY quantity ASC LIMIT 1;"
        ],
        solution: "SELECT item_name, category, quantity FROM supplies WHERE quantity < 30 ORDER BY quantity ASC LIMIT 1;",
        quickFill: "SELECT item_name, category, quantity FROM supplies WHERE quantity < 30 ORDER BY quantity ASC LIMIT 1;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const nameIdx = cols.indexOf('item_name');
          if (rows.length !== 1 || nameIdx === -1) return false;
          return String(rows[0][nameIdx]).toLowerCase().includes('hoe');
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 4: THE SUPPLY PROBLEM
  // ==========================================================
  4: {
    level: 4,
    title: "FIRST PLANTING",
    role: "Data Analyst",
    concept: "INSERT, UPDATE, WHERE, PK/FK Relational Planting",
    cutscene: {
      title: "Chapter 4: Sowing the Soil",
      image: "/images/cinematics/level4_supplies.jpg",
      duration: 11,
      mood: "energetic",
      subtitles: [
        { start: 0, end: 3.5, text: "Morning sunlight warms the tilled fields across Plots A1, A2, and A3." },
        { start: 3.5, end: 7.5, text: "The seeds are ready and the land is ready, but we must record which crop belongs in each plot." },
        { start: 7.5, end: 11, text: "Uncle Somu: 'A foreign key connects our crops to our fields. Let us plant with precision!'" }
      ]
    },
    storyIntro: {
      headline: "The First Seeds in Soil",
      text: "The farm finally has reliable records for seeds and warehouse supplies. Now the owner wants to start planting across our plots! But there is an operational challenge: we must accurately record which crop variety is planted in which plot of land. Using PRIMARY KEYs for crop identities and FOREIGN KEYs in our planting ledger, you will connect crops to fields in a practical 1:M relationship!",
      notebookEntries: [
        { label: "Planting Goal", value: "Establish crops catalog and assign crops to Plots A1, A2, and A3" },
        { label: "Crop Varieties", value: "Tomato (ID 1, ₹20), Wheat (ID 2, ₹12), Rice (ID 3, ₹15)" },
        { label: "Relational Structure", value: "farming.crop_id (FK) connects to crops.crop_id (PK)" },
        { label: "Key SQL Operations", value: "CREATE TABLE, INSERT, UPDATE, WHERE" }
      ]
    },
    completion: {
      title: "LEVEL 4 COMPLETE",
      subtitle: "Fields are successfully sown and tracked!",
      badge: "🌱 Field Sower",
      summary: "You established the farm's active planting system! By connecting crop catalog identities to field plots through foreign keys and correcting field assignments with UPDATE, the farm's land is officially alive with growing crops.",
      stats: [
        { label: "Plots Planted", value: "3 Active Plots (A1, A2, A3)" },
        { label: "Crops Sown", value: "Tomato & Rice" },
        { label: "Relational Pattern", value: "1:M (Crop to Multiple Plots)" },
        { label: "Cash Reward", value: "+₹500" },
        { label: "XP Earned", value: "+175 XP" }
      ],
      nextLevelTitle: "Level 5: Farm Cleanup"
    },
    missions: [
      {
        id: "L4_M0",
        title: "Prepare the Crop Catalog",
        objective: "Create the 'crops' table with crop_id (INTEGER PRIMARY KEY), crop_name (TEXT), growth_days (INTEGER), market_price (INTEGER), and insert Tomato, Wheat, and Rice.",
        dialogue: "Uncle Somu: 'Before assigning crops to our fields, we need an official crops catalog. Create the crops table with crop_id (INTEGER PRIMARY KEY), crop_name (TEXT), growth_days (INTEGER), and market_price (INTEGER), then insert Tomato, Wheat, and Rice!'",
        concept: "CREATE TABLE with PRIMARY KEY & Multi-row INSERT",
        hints: [
          "Create table crops (crop_id INTEGER PRIMARY KEY, crop_name TEXT, growth_days INTEGER, market_price INTEGER).",
          "Then insert Tomato (1, 'Tomato', 3, 20), Wheat (2, 'Wheat', 2, 12), and Rice (3, 'Rice', 4, 15).",
          "CREATE TABLE crops (\n  crop_id INTEGER PRIMARY KEY,\n  crop_name TEXT,\n  growth_days INTEGER,\n  market_price INTEGER\n);\n\nINSERT INTO crops (crop_id, crop_name, growth_days, market_price) VALUES \n(1, 'Tomato', 3, 20),\n(2, 'Wheat', 2, 12),\n(3, 'Rice', 4, 15);"
        ],
        solution: "CREATE TABLE crops (\n  crop_id INTEGER PRIMARY KEY,\n  crop_name TEXT,\n  growth_days INTEGER,\n  market_price INTEGER\n);\n\nINSERT INTO crops (crop_id, crop_name, growth_days, market_price) VALUES \n(1, 'Tomato', 3, 20),\n(2, 'Wheat', 2, 12),\n(3, 'Rice', 4, 15);",
        quickFill: "CREATE TABLE crops (\n  crop_id INTEGER PRIMARY KEY,\n  crop_name TEXT,\n  growth_days INTEGER,\n  market_price INTEGER\n);\n\nINSERT INTO crops (crop_id, crop_name, growth_days, market_price) VALUES \n(1, 'Tomato', 3, 20),\n(2, 'Wheat', 2, 12),\n(3, 'Rice', 4, 15);",
        validate: (db) => {
          const schema = db.getSchema();
          if (!schema['crops']) return false;
          const data = db.getTableData('crops');
          return data && data.length >= 3;
        }
      },
      {
        id: "L4_M1",
        title: "Prepare the Field Planting Ledger",
        objective: "Create the 'farming' table with farming_id (INTEGER PRIMARY KEY), plot_id (TEXT), crop_id (INTEGER), status (TEXT), growth_percent (INTEGER), and FOREIGN KEY (crop_id) REFERENCES crops(crop_id).",
        dialogue: "Uncle Somu: 'Now we need a ledger to connect each plot with its planted crop. Create the farming table with farming_id as PRIMARY KEY, and crop_id as a FOREIGN KEY referencing crops(crop_id)!'",
        concept: "CREATE TABLE with FOREIGN KEY Relationship",
        hints: [
          "Create table farming with columns: farming_id INTEGER PRIMARY KEY, plot_id TEXT, crop_id INTEGER, status TEXT, growth_percent INTEGER, and FOREIGN KEY (crop_id) REFERENCES crops(crop_id).",
          "CREATE TABLE farming (\n  farming_id INTEGER PRIMARY KEY,\n  plot_id TEXT,\n  crop_id INTEGER,\n  status TEXT,\n  growth_percent INTEGER,\n  FOREIGN KEY (crop_id) REFERENCES crops(crop_id)\n);",
          "CREATE TABLE farming (\n  farming_id INTEGER PRIMARY KEY,\n  plot_id TEXT,\n  crop_id INTEGER,\n  status TEXT,\n  growth_percent INTEGER,\n  FOREIGN KEY (crop_id) REFERENCES crops(crop_id)\n);"
        ],
        solution: "CREATE TABLE farming (\n  farming_id INTEGER PRIMARY KEY,\n  plot_id TEXT,\n  crop_id INTEGER,\n  status TEXT,\n  growth_percent INTEGER,\n  FOREIGN KEY (crop_id) REFERENCES crops(crop_id)\n);",
        quickFill: "CREATE TABLE farming (\n  farming_id INTEGER PRIMARY KEY,\n  plot_id TEXT,\n  crop_id INTEGER,\n  status TEXT,\n  growth_percent INTEGER,\n  FOREIGN KEY (crop_id) REFERENCES crops(crop_id)\n);",
        validate: (db) => {
          const schema = db.getSchema();
          return !!schema['farming'];
        }
      },
      {
        id: "L4_M2",
        title: "Assign the First Crop (Plot A1)",
        objective: "Plant Tomato in Plot A1 by inserting a record with plot_id 'A1', crop_id 1, status 'growing', and growth_percent 0 into 'farming'.",
        dialogue: "Uncle Somu: 'The soil in Plot A1 is ready. Plant our first crop by inserting a record for Plot A1 with crop_id 1 (Tomato), status \"growing\", and growth_percent 0!'",
        concept: "INSERT with FOREIGN KEY Reference",
        hints: [
          "Insert into farming (plot_id, crop_id, status, growth_percent) VALUES ('A1', 1, 'growing', 0).",
          "INSERT INTO farming (plot_id, crop_id, status, growth_percent) VALUES ('A1', 1, 'growing', 0);",
          "INSERT INTO farming (plot_id, crop_id, status, growth_percent) VALUES ('A1', 1, 'growing', 0);"
        ],
        solution: "INSERT INTO farming (plot_id, crop_id, status, growth_percent) VALUES ('A1', 1, 'growing', 0);",
        quickFill: "INSERT INTO farming (plot_id, crop_id, status, growth_percent) VALUES ('A1', 1, 'growing', 0);",
        validate: (db) => {
          const farming = db.getTableData('farming');
          if (!farming || farming.length === 0) return false;
          return farming.some(f => (f.plot_id === 'A1' || f.plot_id === 'A1.1') && (f.crop_id == 1 || String(f.crop_id).toLowerCase() === 'tomato'));
        }
      },
      {
        id: "L4_M3",
        title: "Plant More Fields (1:M Relationship)",
        objective: "Insert planting records for Plot A2 (Tomato, crop_id 1) and Plot A3 (Wheat, crop_id 2).",
        dialogue: "Uncle Somu: 'Notice that one crop variety can be planted across multiple plots! Plant Tomato (crop_id 1) in Plot A2, and Wheat (crop_id 2) in Plot A3.'",
        concept: "1:M Practical Table Relationship",
        hints: [
          "Insert two rows: ('A2', 1, 'growing', 0) and ('A3', 2, 'growing', 0) into farming.",
          "INSERT INTO farming (plot_id, crop_id, status, growth_percent) VALUES \n('A2', 1, 'growing', 0),\n('A3', 2, 'growing', 0);",
          "INSERT INTO farming (plot_id, crop_id, status, growth_percent) VALUES \n('A2', 1, 'growing', 0),\n('A3', 2, 'growing', 0);"
        ],
        solution: "INSERT INTO farming (plot_id, crop_id, status, growth_percent) VALUES \n('A2', 1, 'growing', 0),\n('A3', 2, 'growing', 0);",
        quickFill: "INSERT INTO farming (plot_id, crop_id, status, growth_percent) VALUES \n('A2', 1, 'growing', 0),\n('A3', 2, 'growing', 0);",
        validate: (db) => {
          const farming = db.getTableData('farming');
          if (!farming || farming.length < 3) return false;
          const hasA2 = farming.some(f => (f.plot_id === 'A2' || f.plot_id === 'A2.1') && (f.crop_id == 1 || String(f.crop_id).toLowerCase() === 'tomato'));
          const hasA3 = farming.some(f => (f.plot_id === 'A3' || f.plot_id === 'A3.1'));
          return hasA2 && hasA3;
        }
      },
      {
        id: "L4_M4",
        title: "Correct a Planting Mistake",
        objective: "Use UPDATE with a WHERE clause to change crop_id to 3 (Rice) for Plot A3.",
        dialogue: "Uncle Somu: 'Wait! Plot A3 was actually sown with Rice (crop_id 3), not Wheat. Use UPDATE with a WHERE clause to correct Plot A3 in the farming table!'",
        concept: "UPDATE ... WHERE (Modifying Relational Data)",
        hints: [
          "Update farming SET crop_id = 3 WHERE plot_id = 'A3'.",
          "UPDATE farming SET crop_id = 3 WHERE plot_id = 'A3';",
          "UPDATE farming SET crop_id = 3 WHERE plot_id = 'A3';"
        ],
        solution: "UPDATE farming SET crop_id = 3 WHERE plot_id = 'A3';",
        quickFill: "UPDATE farming SET crop_id = 3 WHERE plot_id = 'A3';",
        validate: (db) => {
          const farming = db.getTableData('farming');
          if (!farming || farming.length === 0) return false;
          const a3 = farming.find(f => f.plot_id === 'A3' || f.plot_id === 'A3.1');
          return a3 && (a3.crop_id == 3 || String(a3.crop_id).toLowerCase() === 'rice');
        }
      },
      {
        id: "L4_M5",
        title: "Confirm the Active Planting Schedule",
        objective: "Query all columns from 'farming' where status = 'growing' to verify active fields.",
        dialogue: "Uncle Somu: 'All three plots are planted and recorded! Query the farming table where status = \"growing\" to confirm our full field schedule.'",
        concept: "SELECT ... WHERE (Relational State Verification)",
        hints: [
          "Query all columns from farming where status = 'growing'.",
          "SELECT * FROM farming WHERE status = 'growing';",
          "SELECT * FROM farming WHERE status = 'growing';"
        ],
        solution: "SELECT * FROM farming WHERE status = 'growing';",
        quickFill: "SELECT * FROM farming WHERE status = 'growing';",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const plotIdx = cols.indexOf('plot_id');
          if (plotIdx === -1 || rows.length < 3) return false;
          const plotIds = rows.map(r => String(r[plotIdx]));
          return plotIds.some(p => p.includes('A1')) && plotIds.some(p => p.includes('A2')) && plotIds.some(p => p.includes('A3'));
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 5: THE HARVEST & MARKET
  // ==========================================================
  5: {
    level: 5,
    title: "THE HARVEST & MARKET",
    role: "Data Analyst",
    concept: "UPDATE ... WHERE, DELETE ... WHERE, Data Hygiene & State Changes",
    teaser: "Crops are growing and farm operations move fast. Safely update field progress, remove obsolete records, and prepare market shipments.",
    cutscene: {
      title: "Chapter 5: The First Harvest",
      image: "/images/cinematics/level5_market.jpg",
      duration: 11,
      mood: "market",
      subtitles: [
        { start: 0, end: 3.5, text: "The summer sun warms the lush green crops across the farm." },
        { start: 3.5, end: 7.5, text: "The first tomato vines in Plot A1 are heavy with ripe red fruit ready for picking." },
        { start: 7.5, end: 11, text: "Uncle Somu: 'Farm data changes as the farm grows. Update records accurately, clean out obsolete entries, and prepare for market!'" }
      ]
    },
    storyIntro: {
      headline: "Field Growth, Data Hygiene & Market Prep",
      text: "Uncle Somu walks the fields with pride: 'Look at those vigorous tomato plants in Plot A1! But our database records must keep pace with reality. Crops grow, supplies get consumed, tools break, and harvests ship to market. In this level, you will master UPDATE and DELETE with strict WHERE clauses to maintain accurate, reliable farm data without accidentally wiping your tables!'",
      notebookEntries: [
        { label: "Active Plots", value: "Plots A1 (Tomatoes), A2 (Wheat), A3 (Rice)" },
        { label: "Warehouse Inventory", value: "Compost, NPK, Cattle Mash, Tools" },
        { label: "Key SQL Concepts", value: "UPDATE ... WHERE, DELETE ... WHERE, SELECT verification" },
        { label: "Golden Rule", value: "NEVER run UPDATE or DELETE without a WHERE clause!" }
      ]
    },
    completion: {
      title: "LEVEL 5 COMPLETE",
      subtitle: "Harvest Master & Data Custodian!",
      badge: "🌾 Harvest Master",
      summary: "You successfully managed changing field states and warehouse inventory! By using targeted UPDATE and DELETE statements with precise WHERE conditions, you kept the farm database accurate and shipped your first harvest to market.",
      stats: [
        { label: "Plots Harvested", value: "Plot A1 (Tomatoes)" },
        { label: "Warehouse Audited", value: "Obsolete Tools Removed" },
        { label: "Market Bonus", value: "+₹800 Cash" },
        { label: "XP Earned", value: "+300 XP" }
      ],
      nextLevelTitle: "Level 6: Aggregations & Farm Analytics"
    },
    missions: [
      {
        id: "L5_M0",
        title: "Update Crop Growth Progress",
        objective: "Update the growth_percent of Plot A1 to 50 in the 'farming' table.",
        dialogue: "Uncle Somu: 'The tomatoes in Plot A1 have sprouted vigorously! Use UPDATE with a WHERE clause to update Plot A1\\'s growth_percent to 50!'",
        concept: "UPDATE ... SET ... WHERE (Changing Existing Records)",
        hints: [
          "Use UPDATE farming SET growth_percent = 50 WHERE plot_id = 'A1';",
          "Make sure to include WHERE plot_id = 'A1' so other plots are not changed!",
          "UPDATE farming SET growth_percent = 50 WHERE plot_id = 'A1';"
        ],
        solution: "UPDATE farming SET growth_percent = 50 WHERE plot_id = 'A1';",
        quickFill: "UPDATE farming SET growth_percent = 50 WHERE plot_id = 'A1';",
        validate: (db) => {
          const farming = db.getTableData('farming');
          if (!farming || farming.length === 0) return false;
          const a1 = farming.find(f => f.plot_id === 'A1' || f.plot_id === 'A1.1');
          const a2 = farming.find(f => f.plot_id === 'A2' || f.plot_id === 'A2.1');
          return a1 && a1.growth_percent === 50 && (!a2 || a2.growth_percent !== 50);
        }
      },
      {
        id: "L5_M1",
        title: "Mark a Crop Ready for Harvest",
        objective: "Update Plot A1's status to 'ready' and growth_percent to 100 in 'farming'.",
        dialogue: "Uncle Somu: 'The tomatoes in Plot A1 are fully ripe! Update Plot A1 to status = \"ready\" and growth_percent = 100 in the farming table.'",
        concept: "UPDATE multiple columns with SET col1 = val1, col2 = val2 WHERE ...",
        hints: [
          "Update both status and growth_percent in one UPDATE statement.",
          "UPDATE farming SET status = 'ready', growth_percent = 100 WHERE plot_id = 'A1';",
          "UPDATE farming SET status = 'ready', growth_percent = 100 WHERE plot_id = 'A1';"
        ],
        solution: "UPDATE farming SET status = 'ready', growth_percent = 100 WHERE plot_id = 'A1';",
        quickFill: "UPDATE farming SET status = 'ready', growth_percent = 100 WHERE plot_id = 'A1';",
        validate: (db) => {
          const farming = db.getTableData('farming');
          if (!farming || farming.length === 0) return false;
          const a1 = farming.find(f => f.plot_id === 'A1' || f.plot_id === 'A1.1');
          return a1 && a1.status === 'ready' && a1.growth_percent === 100;
        }
      },
      {
        id: "L5_M2",
        title: "Correct a Supply Record",
        objective: "Update the quantity of 'Compost' to 45 in the 'supplies' table.",
        dialogue: "Uncle Somu: 'We applied 5 bags of Compost to the tomato beds. Update the quantity for \"Compost\" in the supplies table to 45!'",
        concept: "UPDATE ... WHERE (Targeted Inventory Correction)",
        hints: [
          "Update supplies SET quantity = 45 WHERE item_name = 'Compost';",
          "UPDATE supplies SET quantity = 45 WHERE item_name = 'Compost';",
          "UPDATE supplies SET quantity = 45 WHERE item_name = 'Compost';"
        ],
        solution: "UPDATE supplies SET quantity = 45 WHERE item_name = 'Compost';",
        quickFill: "UPDATE supplies SET quantity = 45 WHERE item_name = 'Compost';",
        validate: (db) => {
          const supplies = db.getTableData('supplies');
          if (!supplies || supplies.length === 0) return false;
          const compost = supplies.find(s => (s.item_name || '').toLowerCase() === 'compost' || (s.item_name || '').toLowerCase().includes('compost'));
          return compost && compost.quantity === 45;
        }
      },
      {
        id: "L5_M3",
        title: "Remove an Obsolete Record (DELETE)",
        objective: "Delete the broken tool 'Hand Hoe' from the 'supplies' table.",
        dialogue: "Uncle Somu: 'Our hand hoe broke during field tilling and was scrapped. Use DELETE with WHERE to remove \"Hand Hoe\" from supplies! CAUTION: Always specify WHERE, or all rows will be wiped!'",
        concept: "DELETE FROM ... WHERE (Targeted Row Deletion)",
        hints: [
          "Use DELETE FROM supplies WHERE item_name = 'Hand Hoe';",
          "DELETE FROM supplies WHERE item_name = 'Hand Hoe';",
          "DELETE FROM supplies WHERE item_name = 'Hand Hoe';"
        ],
        solution: "DELETE FROM supplies WHERE item_name = 'Hand Hoe';",
        quickFill: "DELETE FROM supplies WHERE item_name = 'Hand Hoe';",
        validate: (db) => {
          const supplies = db.getTableData('supplies');
          if (!supplies || supplies.length === 0) return false;
          const hasHoe = supplies.some(s => (s.item_name || '').toLowerCase() === 'hand hoe');
          const hasCompost = supplies.some(s => (s.item_name || '').toLowerCase().includes('compost'));
          return !hasHoe && hasCompost;
        }
      },
      {
        id: "L5_M4",
        title: "Verify the Warehouse Cleanup",
        objective: "Query all columns from 'supplies' to audit the remaining inventory.",
        dialogue: "Uncle Somu: 'Let\\'s inspect our supplies table to verify that the broken hoe is gone and our fertilizer and feed records are intact!'",
        concept: "SELECT * FROM ... (Post-Mutation Data Audit)",
        hints: [
          "Query all records from the supplies table.",
          "SELECT * FROM supplies;",
          "SELECT * FROM supplies;"
        ],
        solution: "SELECT * FROM supplies;",
        quickFill: "SELECT * FROM supplies;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const nameIdx = cols.indexOf('item_name');
          if (nameIdx === -1 || rows.length < 3) return false;
          const names = rows.map(r => String(r[nameIdx]).toLowerCase());
          return !names.includes('hand hoe') && names.some(n => n.includes('compost'));
        }
      },
      {
        id: "L5_M5",
        title: "Prepare the Harvest for Market",
        objective: "Update Plot A1's status in the 'farming' table to 'harvested'.",
        dialogue: "Uncle Somu: 'The ripe tomatoes in Plot A1 have been harvested and crated for market shipment! Update Plot A1\\'s status in the farming table to \"harvested\"!'",
        concept: "UPDATE ... WHERE (Transitioning Operational State)",
        hints: [
          "Update farming SET status = 'harvested' WHERE plot_id = 'A1';",
          "UPDATE farming SET status = 'harvested' WHERE plot_id = 'A1';",
          "UPDATE farming SET status = 'harvested' WHERE plot_id = 'A1';"
        ],
        solution: "UPDATE farming SET status = 'harvested' WHERE plot_id = 'A1';",
        quickFill: "UPDATE farming SET status = 'harvested' WHERE plot_id = 'A1';",
        validate: (db) => {
          const farming = db.getTableData('farming');
          if (!farming || farming.length === 0) return false;
          const a1 = farming.find(f => f.plot_id === 'A1' || f.plot_id === 'A1.1');
          return a1 && a1.status === 'harvested';
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 6: FARM ANALYTICS & AGGREGATIONS
  // ==========================================================
  6: {
    level: 6,
    title: "FARM ANALYTICS & AGGREGATIONS",
    role: "Farm Data Analyst",
    concept: "COUNT, SUM, AVG, MIN, MAX, GROUP BY",
    teaser: "Turn raw farm records into high-level business intelligence using SQL aggregate functions.",
    cutscene: {
      title: "Chapter 6: The Growing Harvest Numbers",
      image: "/images/cinematics/level6_crew.jpg",
      duration: 11,
      mood: "analytical",
      subtitles: [
        { start: 0, end: 3.5, text: "The farm office desk is stacked with ledger sheets and crop records." },
        { start: 3.5, end: 7.5, text: "Uncle Somu needs executive summaries: total inventory, average prices, and field counts." },
        { start: 7.5, end: 11, text: "Uncle Somu: 'Data is only useful when you can aggregate it into big-picture insights!'" }
      ]
    },
    storyIntro: {
      headline: "Executive Farm Analytics & Aggregate Functions",
      text: "Uncle Somu sits at the farm accounting table: 'Our farm is expanding! Manual line-by-line inspection is no longer enough. The bank and our co-op partners need exact summary metrics: How many crop varieties do we maintain? What is the total volume of warehouse supplies? What is our average crop market value? In this level, you will master SQL aggregate functions—COUNT, SUM, AVG, MIN, MAX—and GROUP BY to produce executive analytics!'",
      notebookEntries: [
        { label: "Aggregate Functions", value: "COUNT(), SUM(), AVG(), MIN(), MAX()" },
        { label: "Grouping Clause", value: "GROUP BY (collapses rows sharing the same value)" },
        { label: "Target", value: "Compute farm-wide statistics and category summaries" },
        { label: "Key Rule", value: "Non-aggregated SELECT columns must appear in GROUP BY" }
      ]
    },
    completion: {
      title: "LEVEL 6 COMPLETE",
      subtitle: "Farm Analytics Specialist!",
      badge: "📊 Analytics Pro",
      summary: "You mastered farm aggregations! By applying COUNT, SUM, AVG, MIN, MAX, and GROUP BY across crops, field records, and warehouse inventory, you delivered executive-grade business metrics to Uncle Somu.",
      stats: [
        { label: "Total Supplies Stock", value: "100 Units" },
        { label: "Average Crop Value", value: "₹38.33 / kg" },
        { label: "Aggregations", value: "COUNT, SUM, AVG, MIN, MAX, GROUP BY" },
        { label: "Cash Bonus", value: "+₹1,000" },
        { label: "XP Earned", value: "+350 XP" }
      ],
      nextLevelTitle: "Level 7: Important Crops (HAVING)"
    },
    missions: [
      {
        id: "L6_M0",
        title: "Count Total Crop Varieties",
        objective: "Use COUNT(*) to find the total number of registered crop varieties in the 'crops' table.",
        dialogue: "Uncle Somu: 'How many distinct crop varieties are currently cataloged in our crops database? Use COUNT(*) to find out!'",
        concept: "COUNT(*) (Counting Table Rows)",
        hints: [
          "Use SELECT COUNT(*) FROM crops;",
          "You can alias the result with AS total_crops.",
          "SELECT COUNT(*) AS total_crops FROM crops;"
        ],
        solution: "SELECT COUNT(*) AS total_crops FROM crops;",
        quickFill: "SELECT COUNT(*) AS total_crops FROM crops;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 1 && Number(rows[0][0]) >= 3;
        }
      },
      {
        id: "L6_M1",
        title: "Count Field Plots by Crop",
        objective: "Use GROUP BY crop_id with COUNT(*) on 'farming' to calculate how many plots are assigned to each crop.",
        dialogue: "Uncle Somu: 'Group our farming records by crop_id and count how many field plots are allocated to each crop!'",
        concept: "SELECT column, COUNT(*) ... GROUP BY column",
        hints: [
          "Select crop_id and COUNT(*) from farming grouped by crop_id.",
          "SELECT crop_id, COUNT(*) AS plot_count FROM farming GROUP BY crop_id;",
          "SELECT crop_id, COUNT(*) AS plot_count FROM farming GROUP BY crop_id;"
        ],
        solution: "SELECT crop_id, COUNT(*) AS plot_count FROM farming GROUP BY crop_id;",
        quickFill: "SELECT crop_id, COUNT(*) AS plot_count FROM farming GROUP BY crop_id;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('crop_id') && rows.length >= 2;
        }
      },
      {
        id: "L6_M2",
        title: "Calculate Total Warehouse Stock",
        objective: "Use SUM(quantity) to compute the total quantity of all inventory items in 'supplies'.",
        dialogue: "Uncle Somu: 'How many total units of supplies are sitting in the warehouse? Use SUM(quantity) on the supplies table!'",
        concept: "SUM(column) (Summing Numeric Values)",
        hints: [
          "Use SELECT SUM(quantity) FROM supplies;",
          "SELECT SUM(quantity) AS total_stock FROM supplies;",
          "SELECT SUM(quantity) AS total_stock FROM supplies;"
        ],
        solution: "SELECT SUM(quantity) AS total_stock FROM supplies;",
        quickFill: "SELECT SUM(quantity) AS total_stock FROM supplies;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const val = Number(queryResult.results[0].values[0][0]);
          return val === 100;
        }
      },
      {
        id: "L6_M3",
        title: "Calculate Average Market Price",
        objective: "Use AVG(market_price) to find the average crop price across all crops in the 'crops' table.",
        dialogue: "Uncle Somu: 'To plan our revenue model, find the average market price of our crops using AVG(market_price)!'",
        concept: "AVG(column) (Calculating Arithmetic Mean)",
        hints: [
          "Use SELECT AVG(market_price) FROM crops;",
          "SELECT AVG(market_price) AS avg_price FROM crops;",
          "SELECT AVG(market_price) AS avg_price FROM crops;"
        ],
        solution: "SELECT AVG(market_price) AS avg_price FROM crops;",
        quickFill: "SELECT AVG(market_price) AS avg_price FROM crops;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const val = Number(queryResult.results[0].values[0][0]);
          return val >= 15 && val <= 16;
        }
      },
      {
        id: "L6_M4",
        title: "Find Minimum & Maximum Crop Prices",
        objective: "Use MIN(market_price) and MAX(market_price) in a single query on the 'crops' table.",
        dialogue: "Uncle Somu: 'What are our lowest and highest crop price benchmarks? Retrieve MIN(market_price) and MAX(market_price) together!'",
        concept: "MIN(column) & MAX(column) (Extremes Analysis)",
        hints: [
          "Select both MIN(market_price) and MAX(market_price) from crops.",
          "SELECT MIN(market_price) AS min_price, MAX(market_price) AS max_price FROM crops;",
          "SELECT MIN(market_price) AS min_price, MAX(market_price) AS max_price FROM crops;"
        ],
        solution: "SELECT MIN(market_price) AS min_price, MAX(market_price) AS max_price FROM crops;",
        quickFill: "SELECT MIN(market_price) AS min_price, MAX(market_price) AS max_price FROM crops;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const row = queryResult.results[0].values[0];
          const min = Number(row[0]);
          const max = Number(row[1]);
          return min === 12 && max === 20;
        }
      },
      {
        id: "L6_M5",
        title: "Generate Warehouse Category Analytics Report",
        objective: "Group 'supplies' by category and compute COUNT(*), SUM(quantity), and AVG(quantity).",
        dialogue: "Uncle Somu: 'Produce a comprehensive warehouse inventory summary by grouping supplies by category and calculating count, total stock, and average stock per item!'",
        concept: "Combining Aggregate Functions with GROUP BY",
        hints: [
          "Select category, COUNT(*), SUM(quantity), and AVG(quantity) grouped by category.",
          "SELECT category, COUNT(*) AS item_count, SUM(quantity) AS total_quantity, AVG(quantity) AS avg_quantity FROM supplies GROUP BY category;",
          "SELECT category, COUNT(*) AS item_count, SUM(quantity) AS total_quantity, AVG(quantity) AS avg_quantity FROM supplies GROUP BY category;"
        ],
        solution: "SELECT category, COUNT(*) AS item_count, SUM(quantity) AS total_quantity, AVG(quantity) AS avg_quantity FROM supplies GROUP BY category;",
        quickFill: "SELECT category, COUNT(*) AS item_count, SUM(quantity) AS total_quantity, AVG(quantity) AS avg_quantity FROM supplies GROUP BY category;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('category') && rows.length >= 2;
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 7: IMPORTANT CROPS
  // ==========================================================
  7: {
    level: 7,
    title: "IMPORTANT CROPS",
    role: "Farm Operations Analyst",
    concept: "GROUP BY, HAVING, WHERE vs HAVING execution order",
    teaser: "Identify which crop varieties and inventory categories meet key farm scale thresholds using HAVING filters.",
    cutscene: {
      title: "Chapter 7: Commercial Field Prioritization",
      image: "/images/cinematics/level7_audit.jpg",
      duration: 11,
      mood: "focused",
      subtitles: [
        { start: 0, end: 3.5, text: "Plot A4 opens as commercial planting expands across the valley." },
        { start: 3.5, end: 7.5, text: "The farm manager asks: 'Which crops exceed our minimum commercial threshold?'" },
        { start: 7.5, end: 11, text: "Uncle Somu: 'WHERE filters rows before grouping. HAVING filters groups after aggregation!'" }
      ]
    },
    storyIntro: {
      headline: "Commercial Crop Thresholds & The HAVING Clause",
      text: "Uncle Somu reviews the operational map: 'Now that we have multiple plots planted across the farm, we must distinguish between minor trial plots and our major commercial crops. A basic GROUP BY calculates totals for every group, but what if we only want groups that exceed a specific volume? That is where the HAVING clause comes in! You will learn the crucial difference: WHERE filters individual rows before aggregation, while HAVING filters grouped results after aggregation!'",
      notebookEntries: [
        { label: "The HAVING Clause", value: "Filters grouped rows after GROUP BY" },
        { label: "WHERE vs HAVING", value: "WHERE = row-level (before grouping), HAVING = aggregate-level (after grouping)" },
        { label: "Target", value: "Filter crops and supply categories by aggregated thresholds" },
        { label: "Rule of Thumb", value: "Never put aggregate functions (SUM, COUNT) in a WHERE clause" }
      ]
    },
    completion: {
      title: "LEVEL 7 COMPLETE",
      subtitle: "Commercial Threshold Analyst!",
      badge: "🎯 Threshold Master",
      summary: "You mastered advanced group filtering with HAVING! By differentiating pre-aggregation row filtering (WHERE) from post-aggregation group filtering (HAVING), you isolated our most important commercial crops and bulk supply categories.",
      stats: [
        { label: "Commercial Crops Filtered", value: "Wheat (Multiple Plots)" },
        { label: "Bulk Categories", value: "Fertilizers (>50 kg Total)" },
        { label: "Techniques Mastered", value: "GROUP BY + HAVING, WHERE + HAVING" },
        { label: "Cash Bonus", value: "+₹1,200" },
        { label: "XP Earned", value: "+400 XP" }
      ],
      nextLevelTitle: "Level 8: Smart Filtering (AND, OR, IN, BETWEEN, LIKE)"
    },
    missions: [
      {
        id: "L7_M0",
        title: "Expand Planting & Review Crop Distribution",
        objective: "Plant Tomato (crop_id 1) in Plot A4, then count plots per crop with GROUP BY.",
        dialogue: "Uncle Somu: 'Plant Tomato (crop_id 1) into Plot A4, then query crop_id and COUNT(*) from farming grouped by crop_id!'",
        concept: "INSERT followed by GROUP BY",
        hints: [
          "Insert into farming (plot_id, crop_id, status, growth_percent) VALUES ('A4', 1, 'growing', 0); then SELECT crop_id, COUNT(*) AS plot_count FROM farming GROUP BY crop_id;",
          "INSERT INTO farming (plot_id, crop_id, status, growth_percent) VALUES ('A4', 1, 'growing', 0);\nSELECT crop_id, COUNT(*) AS plot_count FROM farming GROUP BY crop_id;",
          "INSERT INTO farming (plot_id, crop_id, status, growth_percent) VALUES ('A4', 1, 'growing', 0);\nSELECT crop_id, COUNT(*) AS plot_count FROM farming GROUP BY crop_id;"
        ],
        solution: "INSERT INTO farming (plot_id, crop_id, status, growth_percent) VALUES ('A4', 1, 'growing', 0);\nSELECT crop_id, COUNT(*) AS plot_count FROM farming GROUP BY crop_id;",
        quickFill: "INSERT INTO farming (plot_id, crop_id, status, growth_percent) VALUES ('A4', 1, 'growing', 0);\nSELECT crop_id, COUNT(*) AS plot_count FROM farming GROUP BY crop_id;",
        validate: (db, queryResult) => {
          const farming = db.getTableData('farming');
          if (!farming || farming.length < 4) return false;
          const a4 = farming.find(f => f.plot_id === 'A4');
          if (!a4 || a4.crop_id != 1) return false;
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          return queryResult.results[0].values.length >= 2;
        }
      },
      {
        id: "L7_M1",
        title: "Find Crops Occupying Multiple Plots (HAVING)",
        objective: "Use HAVING COUNT(*) >= 2 to find crops allocated to 2 or more plots.",
        dialogue: "Uncle Somu: 'Which crops have achieved multi-plot commercial scale? Use HAVING COUNT(*) >= 2 on the farming table!'",
        concept: "GROUP BY ... HAVING COUNT(*) >= 2",
        hints: [
          "Add HAVING COUNT(*) >= 2 after GROUP BY crop_id.",
          "SELECT crop_id, COUNT(*) AS plot_count FROM farming GROUP BY crop_id HAVING COUNT(*) >= 2;",
          "SELECT crop_id, COUNT(*) AS plot_count FROM farming GROUP BY crop_id HAVING COUNT(*) >= 2;"
        ],
        solution: "SELECT crop_id, COUNT(*) AS plot_count FROM farming GROUP BY crop_id HAVING COUNT(*) >= 2;",
        quickFill: "SELECT crop_id, COUNT(*) AS plot_count FROM farming GROUP BY crop_id HAVING COUNT(*) >= 2;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 1 && rows[0][0] == 1 && Number(rows[0][1]) >= 2;
        }
      },
      {
        id: "L7_M2",
        title: "Filter Rows Before Grouping (WHERE + GROUP BY)",
        objective: "Use WHERE status = 'growing' before GROUP BY crop_id to count only currently growing crops.",
        dialogue: "Uncle Somu: 'Notice Plot A1 was harvested earlier. Use WHERE status = \"growing\" to filter active rows before grouping by crop_id!'",
        concept: "WHERE (Row Filter) executed Before GROUP BY",
        hints: [
          "Place WHERE status = 'growing' before GROUP BY crop_id.",
          "SELECT crop_id, COUNT(*) AS active_plots FROM farming WHERE status = 'growing' GROUP BY crop_id;",
          "SELECT crop_id, COUNT(*) AS active_plots FROM farming WHERE status = 'growing' GROUP BY crop_id;"
        ],
        solution: "SELECT crop_id, COUNT(*) AS active_plots FROM farming WHERE status = 'growing' GROUP BY crop_id;",
        quickFill: "SELECT crop_id, COUNT(*) AS active_plots FROM farming WHERE status = 'growing' GROUP BY crop_id;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('crop_id') && rows.length === 2;
        }
      },
      {
        id: "L7_M3",
        title: "Filter Groups After Aggregation (HAVING SUM)",
        objective: "Group 'supplies' by category and filter for categories having SUM(quantity) > 50.",
        dialogue: "Uncle Somu: 'Which warehouse supply categories hold more than 50 total units? Use HAVING SUM(quantity) > 50!'",
        concept: "GROUP BY ... HAVING SUM(column) > threshold",
        hints: [
          "Group supplies by category and add HAVING SUM(quantity) > 50.",
          "SELECT category, SUM(quantity) AS total_quantity FROM supplies GROUP BY category HAVING SUM(quantity) > 50;",
          "SELECT category, SUM(quantity) AS total_quantity FROM supplies GROUP BY category HAVING SUM(quantity) > 50;"
        ],
        solution: "SELECT category, SUM(quantity) AS total_quantity FROM supplies GROUP BY category HAVING SUM(quantity) > 50;",
        quickFill: "SELECT category, SUM(quantity) AS total_quantity FROM supplies GROUP BY category HAVING SUM(quantity) > 50;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 1 && String(rows[0][0]).toLowerCase() === 'fertilizer' && Number(rows[0][1]) === 75;
        }
      },
      {
        id: "L7_M4",
        title: "Combine WHERE and HAVING in One Query",
        objective: "Filter supplies with quantity >= 30, group by category, and filter HAVING COUNT(*) >= 2.",
        dialogue: "Uncle Somu: 'Now combine both: filter for individual items with quantity >= 30 using WHERE, group by category, and use HAVING COUNT(*) >= 2 to find categories with multiple large items!'",
        concept: "WHERE (Pre-Group) combined with HAVING (Post-Group)",
        hints: [
          "Use WHERE quantity >= 30 GROUP BY category HAVING COUNT(*) >= 2.",
          "SELECT category, COUNT(*) AS bulk_item_count, SUM(quantity) AS bulk_total FROM supplies WHERE quantity >= 30 GROUP BY category HAVING COUNT(*) >= 2;",
          "SELECT category, COUNT(*) AS bulk_item_count, SUM(quantity) AS bulk_total FROM supplies WHERE quantity >= 30 GROUP BY category HAVING COUNT(*) >= 2;"
        ],
        solution: "SELECT category, COUNT(*) AS bulk_item_count, SUM(quantity) AS bulk_total FROM supplies WHERE quantity >= 30 GROUP BY category HAVING COUNT(*) >= 2;",
        quickFill: "SELECT category, COUNT(*) AS bulk_item_count, SUM(quantity) AS bulk_total FROM supplies WHERE quantity >= 30 GROUP BY category HAVING COUNT(*) >= 2;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 1 && String(rows[0][0]).toLowerCase() === 'fertilizer' && Number(rows[0][1]) === 2;
        }
      },
      {
        id: "L7_M5",
        title: "Major Commercial Crop Allocation Report",
        objective: "Generate a production scale report: query crop_id, COUNT(*) AS plot_count, and AVG(growth_percent) FROM farming WHERE status = 'growing' GROUP BY crop_id HAVING COUNT(*) >= 2.",
        dialogue: "Uncle Somu: 'Assemble our executive commercial scale report showing active growing crops that span 2 or more plots!'",
        concept: "Production Scale Analysis (WHERE + GROUP BY + HAVING)",
        hints: [
          "Select crop_id, COUNT(*) AS plot_count, AVG(growth_percent) AS avg_growth from farming WHERE status = 'growing' GROUP BY crop_id HAVING COUNT(*) >= 2.",
          "SELECT crop_id, COUNT(*) AS plot_count, AVG(growth_percent) AS avg_growth FROM farming WHERE status = 'growing' GROUP BY crop_id HAVING COUNT(*) >= 2;",
          "SELECT crop_id, COUNT(*) AS plot_count, AVG(growth_percent) AS avg_growth FROM farming WHERE status = 'growing' GROUP BY crop_id HAVING COUNT(*) >= 2;"
        ],
        solution: "SELECT crop_id, COUNT(*) AS plot_count, AVG(growth_percent) AS avg_growth FROM farming WHERE status = 'growing' GROUP BY crop_id HAVING COUNT(*) >= 2;",
        quickFill: "SELECT crop_id, COUNT(*) AS plot_count, AVG(growth_percent) AS avg_growth FROM farming WHERE status = 'growing' GROUP BY crop_id HAVING COUNT(*) >= 2;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 1 && rows[0][0] == 1 && Number(rows[0][1]) >= 2;
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 8: SMART FILTERING
  // ==========================================================
  8: {
    level: 8,
    title: "SMART FILTERING",
    role: "Precision Data Analyst",
    concept: "AND, OR, IN, BETWEEN, LIKE",
    teaser: "Execute precision searches across crops and inventory using pattern matching and compound boolean logic.",
    cutscene: {
      title: "Chapter 8: Precision Farm Queries",
      image: "/images/cinematics/level8_regional.jpg",
      duration: 11,
      mood: "smart",
      subtitles: [
        { start: 0, end: 3.5, text: "As the farm expands, our records span dozens of entries across multiple categories." },
        { start: 3.5, end: 7.5, text: "Simple single-column filters are no longer enough for precision operations." },
        { start: 7.5, end: 11, text: "Uncle Somu: 'Master logical operators and pattern matching to extract exactly what the farm needs!'" }
      ]
    },
    storyIntro: {
      headline: "Compound Boolean Logic & String Pattern Matching",
      text: "Uncle Somu opens the digital farm terminal: 'Our farm operations have reached a stage where we need smart, multi-condition filtering. Whether looking for crops within a specific market price window (BETWEEN), checking multiple inventory categories (IN), matching text patterns (LIKE), or chaining complex logic (AND / OR), SQL gives you total precision. Let us master smart filtering!'",
      notebookEntries: [
        { label: "Range Filtering", value: "BETWEEN min AND max (inclusive range)" },
        { label: "List Matching", value: "IN ('val1', 'val2', ...) (membership in a list)" },
        { label: "Pattern Matching", value: "LIKE '%pattern%' (% matches any characters)" },
        { label: "Compound Logic", value: "AND (both true), OR (either true)" }
      ]
    },
    completion: {
      title: "LEVEL 8 COMPLETE",
      subtitle: "Master of Precision Queries!",
      badge: "🔍 Search Architect",
      summary: "You mastered smart filtering! By combining AND, OR, IN, BETWEEN, and LIKE, you equipped the farm with precision querying capabilities to filter complex inventory and agronomic datasets instantly.",
      stats: [
        { label: "Range Queries", value: "BETWEEN 35 AND 50" },
        { label: "Pattern Queries", value: "LIKE Pattern Matching" },
        { label: "Compound Logic", value: "AND / OR / IN" },
        { label: "Cash Bonus", value: "+₹1,500" },
        { label: "XP Earned", value: "+450 XP" }
      ],
      nextLevelTitle: "Level 9: The Supply Problem"
    },
    missions: [
      {
        id: "L8_M0",
        title: "Find Crops in a Price Range (BETWEEN)",
        objective: "Use BETWEEN 14 AND 22 to find crops with market_price in that range.",
        dialogue: "Uncle Somu: 'Which crops sell within our target price bracket of ₹14 to ₹22? Use the BETWEEN operator!'",
        concept: "WHERE column BETWEEN val1 AND val2",
        hints: [
          "Use WHERE market_price BETWEEN 14 AND 22.",
          "SELECT * FROM crops WHERE market_price BETWEEN 14 AND 22;",
          "SELECT * FROM crops WHERE market_price BETWEEN 14 AND 22;"
        ],
        solution: "SELECT * FROM crops WHERE market_price BETWEEN 14 AND 22;",
        quickFill: "SELECT * FROM crops WHERE market_price BETWEEN 14 AND 22;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const priceIdx = cols.indexOf('market_price');
          if (priceIdx === -1 || rows.length === 0) return false;
          return rows.every(r => Number(r[priceIdx]) >= 14 && Number(r[priceIdx]) <= 22) && rows.length === 2;
        }
      },
      {
        id: "L8_M1",
        title: "Search Multiple Categories (IN)",
        objective: "Use IN ('Fertilizer', 'Feed') to query supplies belonging to either category.",
        dialogue: "Uncle Somu: 'Retrieve all warehouse supplies that belong to either the Fertilizer or Feed category using the IN operator!'",
        concept: "WHERE column IN (value1, value2, ...)",
        hints: [
          "Use WHERE category IN ('Fertilizer', 'Feed').",
          "SELECT * FROM supplies WHERE category IN ('Fertilizer', 'Feed');",
          "SELECT * FROM supplies WHERE category IN ('Fertilizer', 'Feed');"
        ],
        solution: "SELECT * FROM supplies WHERE category IN ('Fertilizer', 'Feed');",
        quickFill: "SELECT * FROM supplies WHERE category IN ('Fertilizer', 'Feed');",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const catIdx = cols.indexOf('category');
          if (catIdx === -1 || rows.length === 0) return false;
          return rows.every(r => ['fertilizer', 'feed'].includes(String(r[catIdx]).toLowerCase())) && rows.length === 3;
        }
      },
      {
        id: "L8_M2",
        title: "Find Crops by Name Pattern (LIKE)",
        objective: "Use LIKE '%at%' to find all crops whose name contains the substring 'at'.",
        dialogue: "Uncle Somu: 'Search the crops table for any crop name containing the letters \"at\" using the LIKE operator with wildcards!'",
        concept: "WHERE column LIKE '%pattern%' (Wildcard Substring Match)",
        hints: [
          "Use WHERE crop_name LIKE '%at%'.",
          "SELECT * FROM crops WHERE crop_name LIKE '%at%';",
          "SELECT * FROM crops WHERE crop_name LIKE '%at%';"
        ],
        solution: "SELECT * FROM crops WHERE crop_name LIKE '%at%';",
        quickFill: "SELECT * FROM crops WHERE crop_name LIKE '%at%';",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const nameIdx = cols.indexOf('crop_name');
          if (nameIdx === -1 || rows.length === 0) return false;
          return rows.every(r => String(r[nameIdx]).toLowerCase().includes('at')) && rows.length === 2;
        }
      },
      {
        id: "L8_M3",
        title: "Combine Conditions with AND",
        objective: "Use WHERE category = 'Fertilizer' AND quantity >= 40 on the 'supplies' table.",
        dialogue: "Uncle Somu: 'Find high-volume fertilizer supplies by combining two conditions: category must be Fertilizer AND quantity must be at least 40!'",
        concept: "WHERE condition1 AND condition2",
        hints: [
          "Use WHERE category = 'Fertilizer' AND quantity >= 40.",
          "SELECT * FROM supplies WHERE category = 'Fertilizer' AND quantity >= 40;",
          "SELECT * FROM supplies WHERE category = 'Fertilizer' AND quantity >= 40;"
        ],
        solution: "SELECT * FROM supplies WHERE category = 'Fertilizer' AND quantity >= 40;",
        quickFill: "SELECT * FROM supplies WHERE category = 'Fertilizer' AND quantity >= 40;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const catIdx = cols.indexOf('category');
          const qtyIdx = cols.indexOf('quantity');
          if (catIdx === -1 || qtyIdx === -1 || rows.length === 0) return false;
          return rows.every(r => String(r[catIdx]).toLowerCase() === 'fertilizer' && Number(r[qtyIdx]) >= 40) && rows.length === 1;
        }
      },
      {
        id: "L8_M4",
        title: "Alternative Conditions with OR",
        objective: "Use WHERE growth_days <= 2 OR market_price >= 20 on the 'crops' table.",
        dialogue: "Uncle Somu: 'Find fast-growing crops OR premium-priced crops: growth_days <= 2 OR market_price >= 20!'",
        concept: "WHERE condition1 OR condition2",
        hints: [
          "Use WHERE growth_days <= 2 OR market_price >= 20.",
          "SELECT * FROM crops WHERE growth_days <= 2 OR market_price >= 20;",
          "SELECT * FROM crops WHERE growth_days <= 2 OR market_price >= 20;"
        ],
        solution: "SELECT * FROM crops WHERE growth_days <= 2 OR market_price >= 20;",
        quickFill: "SELECT * FROM crops WHERE growth_days <= 2 OR market_price >= 20;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const daysIdx = cols.indexOf('growth_days');
          const priceIdx = cols.indexOf('market_price');
          if (daysIdx === -1 || priceIdx === -1 || rows.length === 0) return false;
          return rows.every(r => Number(r[daysIdx]) <= 2 || Number(r[priceIdx]) >= 20) && rows.length === 2;
        }
      },
      {
        id: "L8_M5",
        title: "Smart Farm Search (Compound Filter)",
        objective: "Query supplies using IN and BETWEEN: category IN ('Fertilizer', 'Feed') AND quantity BETWEEN 25 AND 50.",
        dialogue: "Uncle Somu: 'Execute a compound smart search across supplies: find items in the Fertilizer or Feed categories with quantity between 25 and 50!'",
        concept: "Compound Filtering: IN + BETWEEN + AND",
        hints: [
          "Combine category IN ('Fertilizer', 'Feed') AND quantity BETWEEN 25 AND 50.",
          "SELECT * FROM supplies WHERE category IN ('Fertilizer', 'Feed') AND quantity BETWEEN 25 AND 50;",
          "SELECT * FROM supplies WHERE category IN ('Fertilizer', 'Feed') AND quantity BETWEEN 25 AND 50;"
        ],
        solution: "SELECT * FROM supplies WHERE category IN ('Fertilizer', 'Feed') AND quantity BETWEEN 25 AND 50;",
        quickFill: "SELECT * FROM supplies WHERE category IN ('Fertilizer', 'Feed') AND quantity BETWEEN 25 AND 50;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const catIdx = cols.indexOf('category');
          const qtyIdx = cols.indexOf('quantity');
          if (catIdx === -1 || qtyIdx === -1 || rows.length === 0) return false;
          return rows.every(r => ['fertilizer', 'feed'].includes(String(r[catIdx]).toLowerCase()) && Number(r[qtyIdx]) >= 25 && Number(r[qtyIdx]) <= 50) && rows.length === 3;
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 9: THE SUPPLY PROBLEM
  // ==========================================================
  9: {
    level: 9,
    title: "THE SUPPLY PROBLEM",
    role: "Supply Chain Analyst",
    concept: "INNER JOIN, Table Relationships, PK/FK, Column Projection, Joined Filtering",
    teaser: "Connect warehouse inventory to suppliers and identify who supplies critical farm materials.",
    cutscene: {
      title: "Chapter 9: The Supply Problem",
      image: "/images/cinematics/level4_supplies.jpg",
      duration: 11,
      mood: "curious",
      subtitles: [
        { start: 0, end: 3.5, text: "The warehouse holds fertilizer, feed, and tools, but supplier details are missing." },
        { start: 3.5, end: 7.5, text: "When stock drops, nobody knows which merchant to contact for restocks." },
        { start: 7.5, end: 11, text: "Uncle Somu: 'Relational databases unite separated records. Master the INNER JOIN!'" }
      ]
    },
    storyIntro: {
      headline: "Connecting Inventory with Farm Suppliers",
      text: "The warehouse is no longer our only operational challenge. The farm works with several external agricultural vendors, but the inventory ledger only shows item names and current stock. When stock runs low, the team scrambles to find who supplies what. By creating a dedicated suppliers table, connecting it to supplies via foreign keys, and writing INNER JOIN queries, you will bridge the gap between warehouse inventory and supplier contacts!",
      notebookEntries: [
        { label: "Suppliers Catalog", value: "GreenGrow Organics, Kisan Agro Traders, AgroCare Tools & Tech" },
        { label: "Relational Key", value: "supplies.supplier_id (FK) -> suppliers.supplier_id (PK)" },
        { label: "Core Concept", value: "INNER JOIN table ON condition" },
        { label: "Operational Goal", value: "Identify low stock suppliers & build procurement contact lists" }
      ]
    },
    completion: {
      title: "LEVEL 9 COMPLETE",
      subtitle: "Warehouse & Suppliers Successfully Linked!",
      badge: "🤝 Supply Chain Partner",
      summary: "You connected the farm's warehouse inventory to its supplier network! Using INNER JOIN, you linked supplies with supplier details and generated targeted low-stock contact directories for the procurement team.",
      stats: [
        { label: "Suppliers Tracked", value: "3 Key Vendors" },
        { label: "Relational Query", value: "INNER JOIN supplies & suppliers" },
        { label: "Procurement Lookup", value: "Instant Contact Access" },
        { label: "Cash Bonus", value: "+₹1,800" },
        { label: "XP Earned", value: "+500 XP" }
      ],
      nextLevelTitle: "Level 10: Market & Revenue"
    },
    missions: [
      {
        id: "L9_M0",
        title: "Meet the Farm Suppliers",
        objective: "Create the 'suppliers' table with supplier_id (INTEGER PRIMARY KEY), supplier_name (TEXT), and contact (TEXT), then insert 3 suppliers.",
        dialogue: "Uncle Somu: 'Before connecting our supplies, we need a dedicated directory for our vendors. Create the suppliers table with supplier_id (INTEGER PRIMARY KEY), supplier_name (TEXT), and contact (TEXT), then add GreenGrow Organics, Kisan Agro Traders, and AgroCare Tools & Tech!'",
        concept: "CREATE TABLE with PRIMARY KEY & Multi-Row INSERT",
        hints: [
          "Create table suppliers (supplier_id INTEGER PRIMARY KEY, supplier_name TEXT, contact TEXT).",
          "Insert 3 suppliers: (1, 'GreenGrow Organics', '+91 98765 43210'), (2, 'Kisan Agro Traders', '+91 98123 45678'), (3, 'AgroCare Tools & Tech', '+91 98450 11223').",
          "CREATE TABLE suppliers (\n  supplier_id INTEGER PRIMARY KEY,\n  supplier_name TEXT,\n  contact TEXT\n);\n\nINSERT INTO suppliers (supplier_id, supplier_name, contact) VALUES \n(1, 'GreenGrow Organics', '+91 98765 43210'),\n(2, 'Kisan Agro Traders', '+91 98123 45678'),\n(3, 'AgroCare Tools & Tech', '+91 98450 11223');"
        ],
        solution: "CREATE TABLE suppliers (\n  supplier_id INTEGER PRIMARY KEY,\n  supplier_name TEXT,\n  contact TEXT\n);\n\nINSERT INTO suppliers (supplier_id, supplier_name, contact) VALUES \n(1, 'GreenGrow Organics', '+91 98765 43210'),\n(2, 'Kisan Agro Traders', '+91 98123 45678'),\n(3, 'AgroCare Tools & Tech', '+91 98450 11223');",
        quickFill: "CREATE TABLE suppliers (\n  supplier_id INTEGER PRIMARY KEY,\n  supplier_name TEXT,\n  contact TEXT\n);\n\nINSERT INTO suppliers (supplier_id, supplier_name, contact) VALUES \n(1, 'GreenGrow Organics', '+91 98765 43210'),\n(2, 'Kisan Agro Traders', '+91 98123 45678'),\n(3, 'AgroCare Tools & Tech', '+91 98450 11223');",
        validate: (db) => {
          const schema = db.getSchema();
          if (!schema['suppliers']) return false;
          const data = db.getTableData('suppliers');
          return data && data.length >= 3;
        }
      },
      {
        id: "L9_M1",
        title: "Connect Supplies to Suppliers",
        objective: "Add 'supplier_id' column to supplies and assign supplier IDs to existing inventory items.",
        dialogue: "Uncle Somu: 'Now connect our warehouse supplies to their suppliers. Add a supplier_id column to supplies and assign supplier 1 to Fertilizers, supplier 2 to Feed, and add Hand Hoe for supplier 3!'",
        concept: "ALTER TABLE & Relational Foreign Key Assignment",
        hints: [
          "Use ALTER TABLE supplies ADD COLUMN supplier_id INTEGER; then update the records.",
          "Set supplier_id = 1 for Fertilizer, supplier_id = 2 for Feed, and insert Hand Hoe with supplier_id = 3.",
          "ALTER TABLE supplies ADD COLUMN supplier_id INTEGER;\n\nUPDATE supplies SET supplier_id = 1 WHERE category = 'Fertilizer';\nUPDATE supplies SET supplier_id = 2 WHERE category = 'Feed';\nINSERT INTO supplies (supply_id, item_name, category, quantity, unit, supplier_id) VALUES (4, 'Hand Hoe', 'Tools', 12, 'pieces', 3);"
        ],
        solution: "ALTER TABLE supplies ADD COLUMN supplier_id INTEGER;\n\nUPDATE supplies SET supplier_id = 1 WHERE category = 'Fertilizer';\nUPDATE supplies SET supplier_id = 2 WHERE category = 'Feed';\nINSERT INTO supplies (supply_id, item_name, category, quantity, unit, supplier_id) VALUES (4, 'Hand Hoe', 'Tools', 12, 'pieces', 3);",
        quickFill: "ALTER TABLE supplies ADD COLUMN supplier_id INTEGER;\n\nUPDATE supplies SET supplier_id = 1 WHERE category = 'Fertilizer';\nUPDATE supplies SET supplier_id = 2 WHERE category = 'Feed';\nINSERT INTO supplies (supply_id, item_name, category, quantity, unit, supplier_id) VALUES (4, 'Hand Hoe', 'Tools', 12, 'pieces', 3);",
        validate: (db) => {
          const data = db.getTableData('supplies');
          if (!data || data.length < 3) return false;
          return data.some(d => d.supplier_id === 1 || d.supplier_id === '1') && data.some(d => d.supplier_id === 2 || d.supplier_id === '2');
        }
      },
      {
        id: "L9_M2",
        title: "Find Who Supplies What (INNER JOIN)",
        objective: "Use INNER JOIN between 'supplies' and 'suppliers' to select item_name, quantity, and supplier_name.",
        dialogue: "Uncle Somu: 'Let us write our first relational query! Join supplies and suppliers on supplier_id to display item_name, quantity, and supplier_name.'",
        concept: "INNER JOIN table ON table1.key = table2.key",
        hints: [
          "Join supplies and suppliers where supplies.supplier_id = suppliers.supplier_id.",
          "SELECT supplies.item_name, supplies.quantity, suppliers.supplier_name FROM supplies INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id;",
          "SELECT supplies.item_name, supplies.quantity, suppliers.supplier_name FROM supplies INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id;"
        ],
        solution: "SELECT supplies.item_name, supplies.quantity, suppliers.supplier_name FROM supplies INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id;",
        quickFill: "SELECT supplies.item_name, supplies.quantity, suppliers.supplier_name FROM supplies INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const hasItem = cols.some(c => c.includes('item_name') || c === 'item_name');
          const hasSupplier = cols.some(c => c.includes('supplier_name') || c === 'supplier_name');
          return hasItem && hasSupplier && rows.length >= 3;
        }
      },
      {
        id: "L9_M3",
        title: "Find Low Stock Suppliers (JOIN + WHERE)",
        objective: "Query item_name, quantity, and supplier_name where supplies.quantity < 40 using INNER JOIN and WHERE.",
        dialogue: "Uncle Somu: 'Which suppliers do we need to contact urgently for items with stock below 40? Combine INNER JOIN with a WHERE filter on quantity < 40!'",
        concept: "INNER JOIN combined with WHERE condition",
        hints: [
          "Use INNER JOIN to connect supplies and suppliers, then add WHERE supplies.quantity < 40.",
          "SELECT supplies.item_name, supplies.quantity, suppliers.supplier_name FROM supplies INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id WHERE supplies.quantity < 40;",
          "SELECT supplies.item_name, supplies.quantity, suppliers.supplier_name FROM supplies INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id WHERE supplies.quantity < 40;"
        ],
        solution: "SELECT supplies.item_name, supplies.quantity, suppliers.supplier_name FROM supplies INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id WHERE supplies.quantity < 40;",
        quickFill: "SELECT supplies.item_name, supplies.quantity, suppliers.supplier_name FROM supplies INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id WHERE supplies.quantity < 40;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const qtyIdx = cols.findIndex(c => c.includes('quantity'));
          if (qtyIdx === -1 || rows.length === 0) return false;
          return rows.every(r => Number(r[qtyIdx]) < 40) && rows.length >= 2;
        }
      },
      {
        id: "L9_M4",
        title: "Supplier Inventory Report",
        objective: "Select item_name, category, quantity, unit, and supplier_name from joined supplies and suppliers.",
        dialogue: "Uncle Somu: 'The warehouse team needs a comprehensive inventory breakdown showing item_name, category, quantity, unit, and supplier_name.'",
        concept: "Multi-Column Relational Projection",
        hints: [
          "Select item_name, category, quantity, unit, and supplier_name from supplies INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id.",
          "SELECT supplies.item_name, supplies.category, supplies.quantity, supplies.unit, suppliers.supplier_name FROM supplies INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id;",
          "SELECT supplies.item_name, supplies.category, supplies.quantity, supplies.unit, suppliers.supplier_name FROM supplies INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id;"
        ],
        solution: "SELECT supplies.item_name, supplies.category, supplies.quantity, supplies.unit, suppliers.supplier_name FROM supplies INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id;",
        quickFill: "SELECT supplies.item_name, supplies.category, supplies.quantity, supplies.unit, suppliers.supplier_name FROM supplies INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.length >= 5 && rows.length >= 3;
        }
      },
      {
        id: "L9_M5",
        title: "Warehouse Contact List (JOIN + ORDER BY)",
        objective: "Generate a procurement list: select item_name, quantity, supplier_name, and contact ordered by quantity ASC.",
        dialogue: "Uncle Somu: 'Create an actionable procurement contact directory containing item_name, quantity, supplier_name, and contact phone number, sorted lowest stock first (ORDER BY quantity ASC)!'",
        concept: "INNER JOIN with Sorting (ORDER BY)",
        hints: [
          "Select item_name, quantity, supplier_name, contact from supplies joined with suppliers, ordered by quantity ASC.",
          "SELECT supplies.item_name, supplies.quantity, suppliers.supplier_name, suppliers.contact FROM supplies INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id ORDER BY supplies.quantity ASC;",
          "SELECT supplies.item_name, supplies.quantity, suppliers.supplier_name, suppliers.contact FROM supplies INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id ORDER BY supplies.quantity ASC;"
        ],
        solution: "SELECT supplies.item_name, supplies.quantity, suppliers.supplier_name, suppliers.contact FROM supplies INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id ORDER BY supplies.quantity ASC;",
        quickFill: "SELECT supplies.item_name, supplies.quantity, suppliers.supplier_name, suppliers.contact FROM supplies INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id ORDER BY supplies.quantity ASC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const qtyIdx = cols.findIndex(c => c.includes('quantity'));
          if (qtyIdx === -1 || rows.length < 3) return false;
          let isSorted = true;
          for (let i = 0; i < rows.length - 1; i++) {
            if (Number(rows[i][qtyIdx]) > Number(rows[i + 1][qtyIdx])) isSorted = false;
          }
          return isSorted;
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 10: MARKET & REVENUE
  // ==========================================================
  10: {
    level: 10,
    title: "MARKET & REVENUE",
    role: "Commercial Operations Analyst",
    concept: "INNER JOIN, Calculated Fields, GROUP BY with JOIN, Sales Aggregation",
    teaser: "Bridge agricultural harvest production with market sales and calculate commercial revenue.",
    cutscene: {
      title: "Chapter 10: Market & Revenue",
      image: "/images/cinematics/level5_harvest.jpg",
      duration: 11,
      mood: "prosperous",
      subtitles: [
        { start: 0, end: 3.5, text: "Crates of harvested tomatoes, wheat, and rice arrive at regional wholesale mandis." },
        { start: 3.5, end: 7.5, text: "Uncle Somu: 'Growing crops feeds the land; selling crops feeds the farm business!'" },
        { start: 7.5, end: 11, text: "Connect crop production records to sales transactions to analyze our revenue." }
      ]
    },
    storyIntro: {
      headline: "From Farm Soil to Market Revenue",
      text: "The farm is producing healthy crops again! Now the farm owner and Uncle Somu pose a vital business question: 'We are harvesting crops, but how much revenue are we actually making at the market?' By creating a sales ledger, joining it with the crops catalog, and combining JOIN with arithmetic and GROUP BY aggregations, you will calculate transaction values and reveal the farm's most profitable crops!",
      notebookEntries: [
        { label: "Sales Ledger", value: "sales (sale_id, crop_id, quantity, sale_price, sale_date)" },
        { label: "Relational Link", value: "sales.crop_id (FK) -> crops.crop_id (PK)" },
        { label: "Calculated Field", value: "quantity * sale_price AS sale_value" },
        { label: "Business Analytics", value: "GROUP BY crops.crop_name with SUM(revenue)" }
      ]
    },
    completion: {
      title: "LEVEL 10 COMPLETE",
      subtitle: "Commercial Revenue Engine Unlocked!",
      badge: "💰 Market Strategist",
      summary: "You connected agricultural production to commercial revenue! By joining crops with sales transactions and calculating aggregated revenue by crop, you provided clear financial intelligence to guide future plantings.",
      stats: [
        { label: "Commercial Ledgers", value: "crops & sales Joined" },
        { label: "Revenue Aggregation", value: "SUM(quantity * sale_price)" },
        { label: "Top Grossing Crop", value: "Tomato & Wheat" },
        { label: "Cash Bonus", value: "+₹2,200" },
        { label: "XP Earned", value: "+550 XP" }
      ],
      nextLevelTitle: "Level 11: The Farm Manager"
    },
    missions: [
      {
        id: "L10_M0",
        title: "Open the Farm Market",
        objective: "Create the 'sales' table with sale_id (INTEGER PRIMARY KEY), crop_id (INTEGER), quantity (INTEGER), sale_price (INTEGER), sale_date (TEXT), and foreign key referencing crops(crop_id), then insert 6 sales records.",
        dialogue: "Uncle Somu: 'To track our market shipments, create the sales table with sale_id (INTEGER PRIMARY KEY), crop_id (INTEGER), quantity (INTEGER), sale_price (INTEGER), sale_date (TEXT), and FOREIGN KEY (crop_id) REFERENCES crops(crop_id), then log our first batch of sales!'",
        concept: "CREATE TABLE with FOREIGN KEY & Multi-Row INSERT",
        hints: [
          "Create the sales table and insert 6 sales records across crops 1, 2, and 3.",
          "CREATE TABLE sales (\n  sale_id INTEGER PRIMARY KEY,\n  crop_id INTEGER,\n  quantity INTEGER,\n  sale_price INTEGER,\n  sale_date TEXT,\n  FOREIGN KEY (crop_id) REFERENCES crops(crop_id)\n);\n\nINSERT INTO sales (sale_id, crop_id, quantity, sale_price, sale_date) VALUES \n(1, 1, 50, 20, '2026-09-10'),\n(2, 1, 30, 22, '2026-09-15'),\n(3, 2, 100, 12, '2026-09-12'),\n(4, 2, 80, 14, '2026-09-18'),\n(5, 3, 60, 15, '2026-09-14'),\n(6, 3, 40, 16, '2026-09-20');",
          "CREATE TABLE sales (\n  sale_id INTEGER PRIMARY KEY,\n  crop_id INTEGER,\n  quantity INTEGER,\n  sale_price INTEGER,\n  sale_date TEXT,\n  FOREIGN KEY (crop_id) REFERENCES crops(crop_id)\n);\n\nINSERT INTO sales (sale_id, crop_id, quantity, sale_price, sale_date) VALUES \n(1, 1, 50, 20, '2026-09-10'),\n(2, 1, 30, 22, '2026-09-15'),\n(3, 2, 100, 12, '2026-09-12'),\n(4, 2, 80, 14, '2026-09-18'),\n(5, 3, 60, 15, '2026-09-14'),\n(6, 3, 40, 16, '2026-09-20');"
        ],
        solution: "CREATE TABLE sales (\n  sale_id INTEGER PRIMARY KEY,\n  crop_id INTEGER,\n  quantity INTEGER,\n  sale_price INTEGER,\n  sale_date TEXT,\n  FOREIGN KEY (crop_id) REFERENCES crops(crop_id)\n);\n\nINSERT INTO sales (sale_id, crop_id, quantity, sale_price, sale_date) VALUES \n(1, 1, 50, 20, '2026-09-10'),\n(2, 1, 30, 22, '2026-09-15'),\n(3, 2, 100, 12, '2026-09-12'),\n(4, 2, 80, 14, '2026-09-18'),\n(5, 3, 60, 15, '2026-09-14'),\n(6, 3, 40, 16, '2026-09-20');",
        quickFill: "CREATE TABLE sales (\n  sale_id INTEGER PRIMARY KEY,\n  crop_id INTEGER,\n  quantity INTEGER,\n  sale_price INTEGER,\n  sale_date TEXT,\n  FOREIGN KEY (crop_id) REFERENCES crops(crop_id)\n);\n\nINSERT INTO sales (sale_id, crop_id, quantity, sale_price, sale_date) VALUES \n(1, 1, 50, 20, '2026-09-10'),\n(2, 1, 30, 22, '2026-09-15'),\n(3, 2, 100, 12, '2026-09-12'),\n(4, 2, 80, 14, '2026-09-18'),\n(5, 3, 60, 15, '2026-09-14'),\n(6, 3, 40, 16, '2026-09-20');",
        validate: (db) => {
          const schema = db.getSchema();
          if (!schema['sales']) return false;
          const data = db.getTableData('sales');
          return data && data.length >= 6;
        }
      },
      {
        id: "L10_M1",
        title: "Match Crops to Sales",
        objective: "Join 'crops' and 'sales' on crop_id to display crop_name, quantity, and sale_price.",
        dialogue: "Uncle Somu: 'Join our crops catalog with the sales ledger so we can see the crop name alongside the quantity and price of each sale!'",
        concept: "INNER JOIN across Business Entities",
        hints: [
          "Join crops and sales where crops.crop_id = sales.crop_id.",
          "SELECT crops.crop_name, sales.quantity, sales.sale_price FROM crops INNER JOIN sales ON crops.crop_id = sales.crop_id;",
          "SELECT crops.crop_name, sales.quantity, sales.sale_price FROM crops INNER JOIN sales ON crops.crop_id = sales.crop_id;"
        ],
        solution: "SELECT crops.crop_name, sales.quantity, sales.sale_price FROM crops INNER JOIN sales ON crops.crop_id = sales.crop_id;",
        quickFill: "SELECT crops.crop_name, sales.quantity, sales.sale_price FROM crops INNER JOIN sales ON crops.crop_id = sales.crop_id;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const hasCrop = cols.some(c => c.includes('crop_name'));
          const hasQty = cols.some(c => c.includes('quantity'));
          const hasPrice = cols.some(c => c.includes('sale_price') || c.includes('price'));
          return hasCrop && hasQty && hasPrice && rows.length >= 6;
        }
      },
      {
        id: "L10_M2",
        title: "Calculate Sale Value (Arithmetic in SELECT)",
        objective: "Query sale_id, crop_name, quantity, sale_price, and (sales.quantity * sales.sale_price) AS sale_value.",
        dialogue: "Uncle Somu: 'How much money did each sale transaction bring in? Calculate (sales.quantity * sales.sale_price) AS sale_value!'",
        concept: "Calculated Expression in SELECT with JOIN",
        hints: [
          "Multiply quantity by sale_price and alias it as sale_value.",
          "SELECT sales.sale_id, crops.crop_name, sales.quantity, sales.sale_price, (sales.quantity * sales.sale_price) AS sale_value FROM sales INNER JOIN crops ON sales.crop_id = crops.crop_id;",
          "SELECT sales.sale_id, crops.crop_name, sales.quantity, sales.sale_price, (sales.quantity * sales.sale_price) AS sale_value FROM sales INNER JOIN crops ON sales.crop_id = crops.crop_id;"
        ],
        solution: "SELECT sales.sale_id, crops.crop_name, sales.quantity, sales.sale_price, (sales.quantity * sales.sale_price) AS sale_value FROM sales INNER JOIN crops ON sales.crop_id = crops.crop_id;",
        quickFill: "SELECT sales.sale_id, crops.crop_name, sales.quantity, sales.sale_price, (sales.quantity * sales.sale_price) AS sale_value FROM sales INNER JOIN crops ON sales.crop_id = crops.crop_id;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const valIdx = cols.findIndex(c => c.includes('sale_value') || c.includes('value'));
          if (valIdx === -1 || rows.length < 6) return false;
          return rows.some(r => Number(r[valIdx]) === 1000); // 50 * 20 = 1000
        }
      },
      {
        id: "L10_M3",
        title: "Find Crop Revenue (JOIN + GROUP BY + SUM)",
        objective: "Group joined crops and sales by crop_name and calculate SUM(sales.quantity * sales.sale_price) AS total_revenue.",
        dialogue: "Uncle Somu: 'Now combine your GROUP BY knowledge with JOIN! Calculate the total revenue generated by each crop across all its sales!'",
        concept: "JOIN + GROUP BY with SUM(Arithmetic)",
        hints: [
          "Join crops and sales, group by crops.crop_name, and calculate SUM(sales.quantity * sales.sale_price) AS total_revenue.",
          "SELECT crops.crop_name, SUM(sales.quantity * sales.sale_price) AS total_revenue FROM crops INNER JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name;",
          "SELECT crops.crop_name, SUM(sales.quantity * sales.sale_price) AS total_revenue FROM crops INNER JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name;"
        ],
        solution: "SELECT crops.crop_name, SUM(sales.quantity * sales.sale_price) AS total_revenue FROM crops INNER JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name;",
        quickFill: "SELECT crops.crop_name, SUM(sales.quantity * sales.sale_price) AS total_revenue FROM crops INNER JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const revIdx = cols.findIndex(c => c.includes('revenue') || c.includes('total'));
          if (revIdx === -1 || rows.length !== 3) return false;
          const revenues = rows.map(r => Number(r[revIdx]));
          return revenues.includes(1660) && revenues.includes(2320) && revenues.includes(1540);
        }
      },
      {
        id: "L10_M4",
        title: "Highest Selling Crops (JOIN + GROUP BY + ORDER BY)",
        objective: "Query crop_name and SUM(sales.quantity * sales.sale_price) AS total_revenue ordered by total_revenue DESC.",
        dialogue: "Uncle Somu: 'Which crop is our biggest earner? Sort the total revenue in descending order (ORDER BY total_revenue DESC)!'",
        concept: "JOIN + GROUP BY + ORDER BY DESC",
        hints: [
          "Add ORDER BY total_revenue DESC to the grouped revenue query.",
          "SELECT crops.crop_name, SUM(sales.quantity * sales.sale_price) AS total_revenue FROM crops INNER JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name ORDER BY total_revenue DESC;",
          "SELECT crops.crop_name, SUM(sales.quantity * sales.sale_price) AS total_revenue FROM crops INNER JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name ORDER BY total_revenue DESC;"
        ],
        solution: "SELECT crops.crop_name, SUM(sales.quantity * sales.sale_price) AS total_revenue FROM crops INNER JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name ORDER BY total_revenue DESC;",
        quickFill: "SELECT crops.crop_name, SUM(sales.quantity * sales.sale_price) AS total_revenue FROM crops INNER JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name ORDER BY total_revenue DESC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const revIdx = cols.findIndex(c => c.includes('revenue') || c.includes('total'));
          if (revIdx === -1 || rows.length !== 3) return false;
          return Number(rows[0][revIdx]) >= Number(rows[1][revIdx]) && Number(rows[1][revIdx]) >= Number(rows[2][revIdx]);
        }
      },
      {
        id: "L10_M5",
        title: "Market Revenue Report",
        objective: "Generate a full commercial report: crop_name, SUM(sales.quantity) AS total_sold, and SUM(sales.quantity * sales.sale_price) AS total_revenue ordered by total_revenue DESC.",
        dialogue: "Uncle Somu: 'Executive presentation time! Assemble our complete market revenue report displaying crop_name, total_sold, and total_revenue, sorted highest earner first!'",
        concept: "Comprehensive Business Relational Aggregation",
        hints: [
          "Select crop_name, SUM(sales.quantity) AS total_sold, SUM(sales.quantity * sales.sale_price) AS total_revenue, grouped by crop_name, ordered by total_revenue DESC.",
          "SELECT crops.crop_name, SUM(sales.quantity) AS total_sold, SUM(sales.quantity * sales.sale_price) AS total_revenue FROM crops INNER JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name ORDER BY total_revenue DESC;",
          "SELECT crops.crop_name, SUM(sales.quantity) AS total_sold, SUM(sales.quantity * sales.sale_price) AS total_revenue FROM crops INNER JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name ORDER BY total_revenue DESC;"
        ],
        solution: "SELECT crops.crop_name, SUM(sales.quantity) AS total_sold, SUM(sales.quantity * sales.sale_price) AS total_revenue FROM crops INNER JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name ORDER BY total_revenue DESC;",
        quickFill: "SELECT crops.crop_name, SUM(sales.quantity) AS total_sold, SUM(sales.quantity * sales.sale_price) AS total_revenue FROM crops INNER JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name ORDER BY total_revenue DESC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const soldIdx = cols.findIndex(c => c.includes('sold') || c.includes('qty'));
          const revIdx = cols.findIndex(c => c.includes('revenue') || c.includes('total'));
          if (cols.length < 3 || rows.length !== 3 || revIdx === -1 || soldIdx === -1) return false;
          return Number(rows[0][revIdx]) >= Number(rows[1][revIdx]);
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 11: THE FARM MANAGER
  // ==========================================================
  11: {
    level: 11,
    title: "THE FARM MANAGER",
    role: "Farm Operations Manager",
    concept: "Multi-Table INNER JOIN, Table Aliases, Operational Reporting, JOIN + WHERE + ORDER BY",
    teaser: "Unify field plots, crop varieties, and commercial sales into one master operational system.",
    cutscene: {
      title: "Chapter 11: The Farm Manager",
      image: "/images/cinematics/level1_homestead.jpg",
      duration: 11,
      mood: "smart",
      subtitles: [
        { start: 0, end: 3.5, text: "Field plots are active, crops are growing, and market shipments are in motion." },
        { start: 3.5, end: 7.5, text: "The farm manager needs one consolidated operational view across all tables." },
        { start: 7.5, end: 11, text: "Uncle Somu: 'Relational databases shine when all pieces work together in harmony.'" }
      ]
    },
    storyIntro: {
      headline: "The Consolidated Farm Management Dashboard",
      text: "The farm owner and manager trust your database expertise completely. Instead of checking isolated tables one by one, the operations team needs one unified view of the farm: which plot is growing which crop, what is the field growth status, and how do field plantings connect with market performance? In this level, you will master multi-table INNER JOINs, table aliases, and composite operational queries to deliver the Farm Manager's Master Report!",
      notebookEntries: [
        { label: "Management Goal", value: "Unify plots, crops, and sales into consolidated reports" },
        { label: "Relational Nodes", value: "farming (plots) <-> crops (catalog) <-> sales (commercial)" },
        { label: "Techniques", value: "Table Aliases (f, c, s), Multi-table INNER JOIN" },
        { label: "Master Report", value: "Operational field progress with revenue performance" }
      ]
    },
    completion: {
      title: "LEVEL 11 COMPLETE",
      subtitle: "Master of Farm Operations & Relational Reporting!",
      badge: "📋 Farm Operations Master",
      summary: "You delivered the Farm Manager's Master Operational Report! By mastering multi-table INNER JOINs, table aliases, and composite operational queries, you unified the farm's agronomic and commercial ecosystems into a single relational engine.",
      stats: [
        { label: "System Role", value: "Farm Operations Manager" },
        { label: "Master Dashboard", value: "3-Way Relational Integration" },
        { label: "Plots Monitored", value: "All Active Field Plots" },
        { label: "Cash Bonus", value: "+₹3,000" },
        { label: "XP Earned", value: "+700 XP" }
      ],
      nextLevelTitle: "Level 12: The Missing Records"
    },
    missions: [
      {
        id: "L11_M0",
        title: "Build the Farm Manager's Field Report",
        objective: "Join 'farming' with 'crops' on crop_id to display plot_id, crop_name, status, and growth_percent.",
        dialogue: "Uncle Somu: 'The farm manager wants to see which crop is in which plot along with its growth status. Join farming with crops on crop_id!'",
        concept: "Field Operational INNER JOIN (farming + crops)",
        hints: [
          "Join farming and crops on farming.crop_id = crops.crop_id.",
          "SELECT farming.plot_id, crops.crop_name, farming.status, farming.growth_percent FROM farming INNER JOIN crops ON farming.crop_id = crops.crop_id;",
          "SELECT farming.plot_id, crops.crop_name, farming.status, farming.growth_percent FROM farming INNER JOIN crops ON farming.crop_id = crops.crop_id;"
        ],
        solution: "SELECT farming.plot_id, crops.crop_name, farming.status, farming.growth_percent FROM farming INNER JOIN crops ON farming.crop_id = crops.crop_id;",
        quickFill: "SELECT farming.plot_id, crops.crop_name, farming.status, farming.growth_percent FROM farming INNER JOIN crops ON farming.crop_id = crops.crop_id;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const hasPlot = cols.some(c => c.includes('plot_id'));
          const hasCrop = cols.some(c => c.includes('crop_name'));
          const hasStatus = cols.some(c => c.includes('status'));
          return hasPlot && hasCrop && hasStatus && rows.length >= 4;
        }
      },
      {
        id: "L11_M1",
        title: "Track Active Fields (JOIN + WHERE)",
        objective: "Join 'farming' and 'crops' and filter for actively growing fields (WHERE farming.status = 'growing').",
        dialogue: "Uncle Somu: 'Filter our field report to show only actively growing plots: WHERE farming.status = \"growing\"!'",
        concept: "Operational Filtering with JOIN + WHERE",
        hints: [
          "Join farming and crops, then filter with WHERE farming.status = 'growing'.",
          "SELECT farming.plot_id, crops.crop_name, farming.growth_percent FROM farming INNER JOIN crops ON farming.crop_id = crops.crop_id WHERE farming.status = 'growing';",
          "SELECT farming.plot_id, crops.crop_name, farming.growth_percent FROM farming INNER JOIN crops ON farming.crop_id = crops.crop_id WHERE farming.status = 'growing';"
        ],
        solution: "SELECT farming.plot_id, crops.crop_name, farming.growth_percent FROM farming INNER JOIN crops ON farming.crop_id = crops.crop_id WHERE farming.status = 'growing';",
        quickFill: "SELECT farming.plot_id, crops.crop_name, farming.growth_percent FROM farming INNER JOIN crops ON farming.crop_id = crops.crop_id WHERE farming.status = 'growing';",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const hasPlot = cols.some(c => c.includes('plot_id'));
          const hasCrop = cols.some(c => c.includes('crop_name'));
          return hasPlot && hasCrop && rows.length >= 3;
        }
      },
      {
        id: "L11_M2",
        title: "Sort the Farm Report (JOIN + ORDER BY)",
        objective: "Display plot_id, crop_name, status, and growth_percent sorted with highest growth first (ORDER BY growth_percent DESC).",
        dialogue: "Uncle Somu: 'Which plots are closest to harvest? Sort our joined field report by growth_percent descending!'",
        concept: "JOIN combined with ORDER BY DESC",
        hints: [
          "Select plot_id, crop_name, status, growth_percent from farming joined with crops, ordered by growth_percent DESC.",
          "SELECT farming.plot_id, crops.crop_name, farming.status, farming.growth_percent FROM farming INNER JOIN crops ON farming.crop_id = crops.crop_id ORDER BY farming.growth_percent DESC;",
          "SELECT farming.plot_id, crops.crop_name, farming.status, farming.growth_percent FROM farming INNER JOIN crops ON farming.crop_id = crops.crop_id ORDER BY farming.growth_percent DESC;"
        ],
        solution: "SELECT farming.plot_id, crops.crop_name, farming.status, farming.growth_percent FROM farming INNER JOIN crops ON farming.crop_id = crops.crop_id ORDER BY farming.growth_percent DESC;",
        quickFill: "SELECT farming.plot_id, crops.crop_name, farming.status, farming.growth_percent FROM farming INNER JOIN crops ON farming.crop_id = crops.crop_id ORDER BY farming.growth_percent DESC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const growthIdx = cols.findIndex(c => c.includes('growth'));
          if (growthIdx === -1 || rows.length < 4) return false;
          let isSorted = true;
          for (let i = 0; i < rows.length - 1; i++) {
            if (Number(rows[i][growthIdx]) < Number(rows[i + 1][growthIdx])) isSorted = false;
          }
          return isSorted;
        }
      },
      {
        id: "L11_M3",
        title: "Connect Farm Operations (Multi-Table JOIN)",
        objective: "Join 'farming', 'crops', and 'sales' using table aliases (f, c, s) to display plot_id, crop_name, quantity, and sale_price.",
        dialogue: "Uncle Somu: 'Now link 3 tables at once! Join farming (f), crops (c), and sales (s) using table aliases to show plot_id, crop_name, sales quantity, and sale_price.'",
        concept: "Multi-Table INNER JOIN with Table Aliases",
        hints: [
          "Use FROM farming f INNER JOIN crops c ON f.crop_id = c.crop_id INNER JOIN sales s ON c.crop_id = s.crop_id.",
          "SELECT f.plot_id, c.crop_name, s.quantity, s.sale_price FROM farming f INNER JOIN crops c ON f.crop_id = c.crop_id INNER JOIN sales s ON c.crop_id = s.crop_id;",
          "SELECT f.plot_id, c.crop_name, s.quantity, s.sale_price FROM farming f INNER JOIN crops c ON f.crop_id = c.crop_id INNER JOIN sales s ON c.crop_id = s.crop_id;"
        ],
        solution: "SELECT f.plot_id, c.crop_name, s.quantity, s.sale_price FROM farming f INNER JOIN crops c ON f.crop_id = c.crop_id INNER JOIN sales s ON c.crop_id = s.crop_id;",
        quickFill: "SELECT f.plot_id, c.crop_name, s.quantity, s.sale_price FROM farming f INNER JOIN crops c ON f.crop_id = c.crop_id INNER JOIN sales s ON c.crop_id = s.crop_id;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const hasPlot = cols.some(c => c.includes('plot_id'));
          const hasCrop = cols.some(c => c.includes('crop_name'));
          const hasQty = cols.some(c => c.includes('quantity'));
          const hasPrice = cols.some(c => c.includes('sale_price') || c.includes('price'));
          return hasPlot && hasCrop && hasQty && hasPrice && rows.length >= 6;
        }
      },
      {
        id: "L11_M4",
        title: "Find Market-Ready Production",
        objective: "Join 'farming' and 'crops' to query plot_id, crop_name, market_price, status, and growth_percent where status = 'harvested' OR growth_percent >= 50.",
        dialogue: "Uncle Somu: 'Identify field plots that are either harvested or past 50% maturity: WHERE f.status = \"harvested\" OR f.growth_percent >= 50!'",
        concept: "Relational Query with Compound WHERE Filtering",
        hints: [
          "Join farming and crops, filter with WHERE status = 'harvested' OR growth_percent >= 50, and order by growth_percent DESC.",
          "SELECT f.plot_id, c.crop_name, c.market_price, f.status, f.growth_percent FROM farming f INNER JOIN crops c ON f.crop_id = c.crop_id WHERE f.status = 'harvested' OR f.growth_percent >= 50 ORDER BY f.growth_percent DESC;",
          "SELECT f.plot_id, c.crop_name, c.market_price, f.status, f.growth_percent FROM farming f INNER JOIN crops c ON f.crop_id = c.crop_id WHERE f.status = 'harvested' OR f.growth_percent >= 50 ORDER BY f.growth_percent DESC;"
        ],
        solution: "SELECT f.plot_id, c.crop_name, c.market_price, f.status, f.growth_percent FROM farming f INNER JOIN crops c ON f.crop_id = c.crop_id WHERE f.status = 'harvested' OR f.growth_percent >= 50 ORDER BY f.growth_percent DESC;",
        quickFill: "SELECT f.plot_id, c.crop_name, c.market_price, f.status, f.growth_percent FROM farming f INNER JOIN crops c ON f.crop_id = c.crop_id WHERE f.status = 'harvested' OR f.growth_percent >= 50 ORDER BY f.growth_percent DESC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const statusIdx = cols.findIndex(c => c.includes('status'));
          const growthIdx = cols.findIndex(c => c.includes('growth'));
          if (statusIdx === -1 || growthIdx === -1 || rows.length === 0) return false;
          return rows.every(r => String(r[statusIdx]).toLowerCase() === 'harvested' || Number(r[growthIdx]) >= 50);
        }
      },
      {
        id: "L11_M5",
        title: "THE FARM MANAGER'S MASTER REPORT",
        objective: "Join 'crops', 'farming', and 'sales' to generate the master operational report: crop_name, COUNT(DISTINCT farming.plot_id) AS active_plots, SUM(sales.quantity) AS total_units_sold, and SUM(sales.quantity * sales.sale_price) AS total_revenue ORDER BY total_revenue DESC.",
        dialogue: "Uncle Somu: 'The grand finale of Chapter 11! Deliver the Farm Manager's Master Report uniting crops, field plot counts, total market units sold, and gross revenue, ordered by revenue descending!'",
        concept: "Master Multi-Table Operational & Commercial Synthesis",
        hints: [
          "Join crops, farming, and sales, group by crops.crop_name, and calculate active_plots, total_units_sold, and total_revenue ordered by total_revenue DESC.",
          "SELECT crops.crop_name, COUNT(DISTINCT farming.plot_id) AS active_plots, SUM(sales.quantity) AS total_units_sold, SUM(sales.quantity * sales.sale_price) AS total_revenue FROM crops INNER JOIN farming ON crops.crop_id = farming.crop_id INNER JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name ORDER BY total_revenue DESC;",
          "SELECT crops.crop_name, COUNT(DISTINCT farming.plot_id) AS active_plots, SUM(sales.quantity) AS total_units_sold, SUM(sales.quantity * sales.sale_price) AS total_revenue FROM crops INNER JOIN farming ON crops.crop_id = farming.crop_id INNER JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name ORDER BY total_revenue DESC;"
        ],
        solution: "SELECT crops.crop_name, COUNT(DISTINCT farming.plot_id) AS active_plots, SUM(sales.quantity) AS total_units_sold, SUM(sales.quantity * sales.sale_price) AS total_revenue FROM crops INNER JOIN farming ON crops.crop_id = farming.crop_id INNER JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name ORDER BY total_revenue DESC;",
        quickFill: "SELECT crops.crop_name, COUNT(DISTINCT farming.plot_id) AS active_plots, SUM(sales.quantity) AS total_units_sold, SUM(sales.quantity * sales.sale_price) AS total_revenue FROM crops INNER JOIN farming ON crops.crop_id = farming.crop_id INNER JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name ORDER BY total_revenue DESC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const revIdx = cols.findIndex(c => c.includes('revenue') || c.includes('total'));
          if (cols.length < 4 || rows.length < 2 || revIdx === -1) return false;
          return Number(rows[0][revIdx]) >= Number(rows[1][revIdx]);
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 12: THE MISSING RECORDS
  // ==========================================================
  12: {
    level: 12,
    title: "THE MISSING RECORDS",
    role: "Systems Integration Analyst",
    concept: "LEFT JOIN, NULL, IS NULL, IS NOT NULL, Finding Missing Records",
    teaser: "Identify crops without sales and suppliers without orders using LEFT JOIN and NULL filtering.",
    cutscene: {
      title: "Chapter 12: The Missing Records",
      image: "/images/cinematics/level4_supplies.jpg",
      duration: 11,
      mood: "investigative",
      subtitles: [
        { start: 0, end: 3.5, text: "The farm introduces new test crops and registers new supplier partners." },
        { start: 3.5, end: 7.5, text: "Uncle Somu: 'An INNER JOIN only shows what matches. We must discover what is missing!'" },
        { start: 7.5, end: 11, text: "Preserve every row and isolate missing relationships using LEFT JOIN and NULL." }
      ]
    },
    storyIntro: {
      headline: "Preserving Unmatched Data with LEFT JOIN",
      text: "The farm manager discovers an operational blind spot: when running INNER JOIN queries, new experimental crops and newly contracted suppliers disappear from reports because they don't have matching sales or supply transactions yet! Uncle Somu explains: 'INNER JOIN excludes unmatched rows. To see our entire farm catalog—including items with zero transactions—we use LEFT JOIN, where missing relationships are represented as NULL!'",
      notebookEntries: [
        { label: "New Catalog Items", value: "Corn (ID 4) & Cotton (ID 5)" },
        { label: "New Supplier", value: "BioPest Solutions (ID 4)" },
        { label: "Core Concept", value: "LEFT JOIN preserves all left table rows; unmatched right columns are NULL" },
        { label: "Missing Checks", value: "IS NULL (find unmatched), IS NOT NULL (find matched)" }
      ]
    },
    completion: {
      title: "LEVEL 12 COMPLETE",
      subtitle: "Master of Data Reconciliation & LEFT JOIN!",
      badge: "🔍 Data Reconciler",
      summary: "You mastered LEFT JOIN and NULL handling! By auditing unmatched crops and orderless suppliers, you ensured that zero farm operations slip through the cracks of missing relational data.",
      stats: [
        { label: "Unmatched Rows Found", value: "Corn, Cotton & BioPest" },
        { label: "Relational Queries", value: "LEFT JOIN + IS NULL / IS NOT NULL" },
        { label: "Audit Accuracy", value: "100% Reconciled" },
        { label: "Cash Bonus", value: "+₹3,500" },
        { label: "XP Earned", value: "+800 XP" }
      ],
      nextLevelTitle: "Level 13: Above Average"
    },
    missions: [
      {
        id: "L12_M0",
        title: "Catalog Unsold Crops & Test LEFT JOIN",
        objective: "Insert Corn (crop_id 4, 3 days, ₹18) and Cotton (crop_id 5, 5 days, ₹25) into 'crops', then execute a LEFT JOIN between 'crops' and 'sales'.",
        dialogue: "Uncle Somu: 'We have two new experimental crops: Corn and Cotton. Insert them into crops, then write a LEFT JOIN with sales to see all crops regardless of whether they have sales!'",
        concept: "LEFT JOIN Preserving Left Table Rows",
        hints: [
          "Insert Corn (4, 'Corn', 3, 18) and Cotton (5, 'Cotton', 5, 25) into crops.",
          "Then SELECT crops.crop_name, sales.sale_id, sales.quantity, sales.sale_price FROM crops LEFT JOIN sales ON crops.crop_id = sales.crop_id;",
          "INSERT INTO crops (crop_id, crop_name, growth_days, market_price) VALUES \n(4, 'Corn', 3, 18),\n(5, 'Cotton', 5, 25);\n\nSELECT crops.crop_name, sales.sale_id, sales.quantity, sales.sale_price\nFROM crops\nLEFT JOIN sales ON crops.crop_id = sales.crop_id;"
        ],
        solution: "INSERT INTO crops (crop_id, crop_name, growth_days, market_price) VALUES \n(4, 'Corn', 3, 18),\n(5, 'Cotton', 5, 25);\n\nSELECT crops.crop_name, sales.sale_id, sales.quantity, sales.sale_price\nFROM crops\nLEFT JOIN sales ON crops.crop_id = sales.crop_id;",
        quickFill: "INSERT INTO crops (crop_id, crop_name, growth_days, market_price) VALUES \n(4, 'Corn', 3, 18),\n(5, 'Cotton', 5, 25);\n\nSELECT crops.crop_name, sales.sale_id, sales.quantity, sales.sale_price\nFROM crops\nLEFT JOIN sales ON crops.crop_id = sales.crop_id;",
        validate: (db, queryResult) => {
          const crops = db.getTableData('crops');
          if (!crops || crops.length < 5) return false;
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length >= 8; // 6 existing sales + 2 unsold crops
        }
      },
      {
        id: "L12_M1",
        title: "Find Crops With No Sales (IS NULL)",
        objective: "Identify crops that have never been sold: select crop_name and market_price using LEFT JOIN and WHERE sales.sale_id IS NULL.",
        dialogue: "Uncle Somu: 'Which crops have zero commercial sales records? Use LEFT JOIN and filter with WHERE sales.sale_id IS NULL!'",
        concept: "Finding Unmatched Rows with IS NULL",
        hints: [
          "Join crops and sales with LEFT JOIN, then filter WHERE sales.sale_id IS NULL.",
          "SELECT crops.crop_name, crops.market_price FROM crops LEFT JOIN sales ON crops.crop_id = sales.crop_id WHERE sales.sale_id IS NULL;",
          "SELECT crops.crop_name, crops.market_price FROM crops LEFT JOIN sales ON crops.crop_id = sales.crop_id WHERE sales.sale_id IS NULL;"
        ],
        solution: "SELECT crops.crop_name, crops.market_price FROM crops LEFT JOIN sales ON crops.crop_id = sales.crop_id WHERE sales.sale_id IS NULL;",
        quickFill: "SELECT crops.crop_name, crops.market_price FROM crops LEFT JOIN sales ON crops.crop_id = sales.crop_id WHERE sales.sale_id IS NULL;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const names = rows.map(r => String(r[0]).toLowerCase());
          return names.includes('corn') && names.includes('cotton') && rows.length === 2;
        }
      },
      {
        id: "L12_M2",
        title: "Find Crops Already Sold (IS NOT NULL)",
        objective: "Find all distinct crop names that have active sales records using LEFT JOIN and WHERE sales.sale_id IS NOT NULL.",
        dialogue: "Uncle Somu: 'Now verify which crops have active market sales using DISTINCT and WHERE sales.sale_id IS NOT NULL!'",
        concept: "Filtering for Existing Relationships with IS NOT NULL",
        hints: [
          "Use SELECT DISTINCT crops.crop_name FROM crops LEFT JOIN sales ON crops.crop_id = sales.crop_id WHERE sales.sale_id IS NOT NULL.",
          "SELECT DISTINCT crops.crop_name FROM crops LEFT JOIN sales ON crops.crop_id = sales.crop_id WHERE sales.sale_id IS NOT NULL;",
          "SELECT DISTINCT crops.crop_name FROM crops LEFT JOIN sales ON crops.crop_id = sales.crop_id WHERE sales.sale_id IS NOT NULL;"
        ],
        solution: "SELECT DISTINCT crops.crop_name FROM crops LEFT JOIN sales ON crops.crop_id = sales.crop_id WHERE sales.sale_id IS NOT NULL;",
        quickFill: "SELECT DISTINCT crops.crop_name FROM crops LEFT JOIN sales ON crops.crop_id = sales.crop_id WHERE sales.sale_id IS NOT NULL;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 3; // Tomato, Wheat, Rice
        }
      },
      {
        id: "L12_M3",
        title: "Suppliers With No Current Orders",
        objective: "Register supplier 'BioPest Solutions' (supplier_id 4, contact '+91 98999 11223'), then find suppliers with no supply records using LEFT JOIN and supplies.supply_id IS NULL.",
        dialogue: "Uncle Somu: 'We signed a partnership with BioPest Solutions. Add them to suppliers, then write a LEFT JOIN to find any supplier who currently has zero registered supply inventory!'",
        concept: "LEFT JOIN Audit Across Procurement Tables",
        hints: [
          "Insert BioPest Solutions (4, 'BioPest Solutions', '+91 98999 11223') into suppliers.",
          "Then SELECT suppliers.supplier_name, suppliers.contact FROM suppliers LEFT JOIN supplies ON suppliers.supplier_id = supplies.supplier_id WHERE supplies.supply_id IS NULL;",
          "INSERT INTO suppliers (supplier_id, supplier_name, contact) VALUES (4, 'BioPest Solutions', '+91 98999 11223');\n\nSELECT suppliers.supplier_name, suppliers.contact\nFROM suppliers\nLEFT JOIN supplies ON suppliers.supplier_id = supplies.supplier_id\nWHERE supplies.supply_id IS NULL;"
        ],
        solution: "INSERT INTO suppliers (supplier_id, supplier_name, contact) VALUES (4, 'BioPest Solutions', '+91 98999 11223');\n\nSELECT suppliers.supplier_name, suppliers.contact\nFROM suppliers\nLEFT JOIN supplies ON suppliers.supplier_id = supplies.supplier_id\nWHERE supplies.supply_id IS NULL;",
        quickFill: "INSERT INTO suppliers (supplier_id, supplier_name, contact) VALUES (4, 'BioPest Solutions', '+91 98999 11223');\n\nSELECT suppliers.supplier_name, suppliers.contact\nFROM suppliers\nLEFT JOIN supplies ON suppliers.supplier_id = supplies.supplier_id\nWHERE supplies.supply_id IS NULL;",
        validate: (db, queryResult) => {
          const supps = db.getTableData('suppliers');
          if (!supps || supps.length < 4) return false;
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 1 && String(rows[0][0]).toLowerCase().includes('biopest');
        }
      },
      {
        id: "L12_M4",
        title: "Complete Crop Market Status",
        objective: "Query all crops and count of sales transactions: select crop_name, market_price, and COUNT(sales.sale_id) AS sales_count grouped by crop_name.",
        dialogue: "Uncle Somu: 'Generate a complete market audit showing every crop, its price, and how many sales it has logged (using COUNT(sales.sale_id))!'",
        concept: "LEFT JOIN with Group Aggregation & Count of Nullable Columns",
        hints: [
          "Select crop_name, market_price, COUNT(sales.sale_id) AS sales_count from crops LEFT JOIN sales, grouped by crops.crop_name.",
          "SELECT crops.crop_name, crops.market_price, COUNT(sales.sale_id) AS sales_count FROM crops LEFT JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name;",
          "SELECT crops.crop_name, crops.market_price, COUNT(sales.sale_id) AS sales_count FROM crops LEFT JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name;"
        ],
        solution: "SELECT crops.crop_name, crops.market_price, COUNT(sales.sale_id) AS sales_count FROM crops LEFT JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name;",
        quickFill: "SELECT crops.crop_name, crops.market_price, COUNT(sales.sale_id) AS sales_count FROM crops LEFT JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 5; // All 5 crops represented
        }
      },
      {
        id: "L12_M5",
        title: "THE MISSING RECORDS REPORT",
        objective: "Produce the master missing records report: crop_name, market_price, COUNT(sales.sale_id) AS total_sales, and COALESCE(SUM(sales.quantity), 0) AS total_quantity_sold ordered by total_sales ASC.",
        dialogue: "Uncle Somu: 'Assemble our executive reconciliation report: select crop_name, market_price, COUNT(sales.sale_id) AS total_sales, and COALESCE(SUM(sales.quantity), 0) AS total_quantity_sold, sorted lowest sales first!'",
        concept: "Master Reconciliation Report (LEFT JOIN + COALESCE + Aggregates)",
        hints: [
          "Use LEFT JOIN between crops and sales, group by crop_name, calculate total_sales and total_quantity_sold, ordered by total_sales ASC.",
          "SELECT crops.crop_name, crops.market_price, COUNT(sales.sale_id) AS total_sales, COALESCE(SUM(sales.quantity), 0) AS total_quantity_sold FROM crops LEFT JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name ORDER BY total_sales ASC;",
          "SELECT crops.crop_name, crops.market_price, COUNT(sales.sale_id) AS total_sales, COALESCE(SUM(sales.quantity), 0) AS total_quantity_sold FROM crops LEFT JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name ORDER BY total_sales ASC;"
        ],
        solution: "SELECT crops.crop_name, crops.market_price, COUNT(sales.sale_id) AS total_sales, COALESCE(SUM(sales.quantity), 0) AS total_quantity_sold FROM crops LEFT JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name ORDER BY total_sales ASC;",
        quickFill: "SELECT crops.crop_name, crops.market_price, COUNT(sales.sale_id) AS total_sales, COALESCE(SUM(sales.quantity), 0) AS total_quantity_sold FROM crops LEFT JOIN sales ON crops.crop_id = sales.crop_id GROUP BY crops.crop_name ORDER BY total_sales ASC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const salesIdx = cols.findIndex(c => c.includes('sales'));
          if (cols.length < 4 || rows.length !== 5 || salesIdx === -1) return false;
          return Number(rows[0][salesIdx]) === 0 && Number(rows[1][salesIdx]) === 0;
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 13: ABOVE AVERAGE
  // ==========================================================
  13: {
    level: 13,
    title: "ABOVE AVERAGE",
    role: "Agribusiness Intelligence Analyst",
    concept: "Subqueries, Scalar Subqueries, Subquery in WHERE, Aggregate Subqueries, Correlated Subqueries",
    teaser: "Compare sales performance against overall benchmarks and crop-specific averages using subqueries.",
    cutscene: {
      title: "Chapter 13: Above Average",
      image: "/images/cinematics/level5_harvest.jpg",
      duration: 11,
      mood: "smart",
      subtitles: [
        { start: 0, end: 3.5, text: "Agricultural trading desks track price trends and market volatility daily." },
        { start: 3.5, end: 7.5, text: "Uncle Somu: 'Which transactions beat the average? We can query inside a query!'" },
        { start: 7.5, end: 11, text: "Master scalar subqueries and correlated comparisons in SQL." }
      ]
    },
    storyIntro: {
      headline: "Diving Deeper with Nested Subqueries & Correlated Logic",
      text: "The farm owner poses a sharper analytical question: 'Which sales transactions outperformed the overall farm average price? And which transactions achieved a premium above the average for that specific crop?' Running separate queries and manually typing numbers into a filter is slow and error-prone. By nesting a subquery inside your WHERE clause and using correlated subqueries that link outer rows to inner calculations, you can benchmark farm performance dynamically!",
      notebookEntries: [
        { label: "Benchmark Problem", value: "Identify premium transactions exceeding average sale prices" },
        { label: "Scalar Subquery", value: "WHERE sale_price > (SELECT AVG(sale_price) FROM sales)" },
        { label: "Correlated Logic", value: "Inner subquery references outer table row (WHERE s2.crop_id = s1.crop_id)" },
        { label: "Analytical Goal", value: "Filter high-performing transactions dynamically in one query" }
      ]
    },
    completion: {
      title: "LEVEL 13 COMPLETE",
      subtitle: "Master of Subqueries & Correlated Logic!",
      badge: "📊 Benchmark Analyst",
      summary: "You mastered scalar subqueries and correlated subqueries! By comparing individual sales against overall and crop-specific averages, you equipped the farm with automated performance benchmarking.",
      stats: [
        { label: "Subquery Types", value: "Scalar & Correlated" },
        { label: "Benchmarking", value: "Dynamic AVG Comparisons" },
        { label: "Premium Sales Found", value: "Transactions Above Average" },
        { label: "Cash Bonus", value: "+₹4,000" },
        { label: "XP Earned", value: "+900 XP" }
      ],
      nextLevelTitle: "Level 14: Farm Intelligence"
    },
    missions: [
      {
        id: "L13_M0",
        title: "Find the Farm Average",
        objective: "Calculate the average sale price across all transactions in 'sales' as overall_avg_price.",
        dialogue: "Uncle Somu: 'First, find our baseline benchmark: calculate the average sale price across all sales transactions!'",
        concept: "Scalar Aggregate Baseline Query",
        hints: [
          "Use SELECT AVG(sale_price) AS overall_avg_price FROM sales.",
          "SELECT AVG(sale_price) AS overall_avg_price FROM sales;",
          "SELECT AVG(sale_price) AS overall_avg_price FROM sales;"
        ],
        solution: "SELECT AVG(sale_price) AS overall_avg_price FROM sales;",
        quickFill: "SELECT AVG(sale_price) AS overall_avg_price FROM sales;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 1 && Number(rows[0][0]) > 10;
        }
      },
      {
        id: "L13_M1",
        title: "Sales Above Farm Average (Subquery in WHERE)",
        objective: "Query all sales with sale_price > (SELECT AVG(sale_price) FROM sales).",
        dialogue: "Uncle Somu: 'Now nest that calculation! Find all sales transactions where the sale_price exceeds the overall average sale price.'",
        concept: "Scalar Subquery in WHERE Clause",
        hints: [
          "Use WHERE sale_price > (SELECT AVG(sale_price) FROM sales).",
          "SELECT sale_id, crop_id, quantity, sale_price, sale_date FROM sales WHERE sale_price > (SELECT AVG(sale_price) FROM sales);",
          "SELECT sale_id, crop_id, quantity, sale_price, sale_date FROM sales WHERE sale_price > (SELECT AVG(sale_price) FROM sales);"
        ],
        solution: "SELECT sale_id, crop_id, quantity, sale_price, sale_date FROM sales WHERE sale_price > (SELECT AVG(sale_price) FROM sales);",
        quickFill: "SELECT sale_id, crop_id, quantity, sale_price, sale_date FROM sales WHERE sale_price > (SELECT AVG(sale_price) FROM sales);",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const priceIdx = cols.findIndex(c => c.includes('price'));
          if (priceIdx === -1 || rows.length === 0) return false;
          return rows.every(r => Number(r[priceIdx]) > 16.5);
        }
      },
      {
        id: "L13_M2",
        title: "Above Average Crop Market Price",
        objective: "Query crop_name and market_price from 'crops' where market_price > (SELECT AVG(market_price) FROM crops).",
        dialogue: "Uncle Somu: 'Which crop varieties in our catalog have a base market price higher than the catalog average price?'",
        concept: "Subquery with Catalog Aggregation",
        hints: [
          "Select crop_name, market_price from crops where market_price > (SELECT AVG(market_price) FROM crops).",
          "SELECT crop_name, market_price FROM crops WHERE market_price > (SELECT AVG(market_price) FROM crops);",
          "SELECT crop_name, market_price FROM crops WHERE market_price > (SELECT AVG(market_price) FROM crops);"
        ],
        solution: "SELECT crop_name, market_price FROM crops WHERE market_price > (SELECT AVG(market_price) FROM crops);",
        quickFill: "SELECT crop_name, market_price FROM crops WHERE market_price > (SELECT AVG(market_price) FROM crops);",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const names = rows.map(r => String(r[0]).toLowerCase());
          return names.includes('tomato') && names.includes('cotton') && rows.length === 2;
        }
      },
      {
        id: "L13_M3",
        title: "Compare Every Crop's Sales (Correlated Subquery)",
        objective: "Use a correlated subquery to find sales where sale_price > average sale_price for that specific crop.",
        dialogue: "Uncle Somu: 'Now the master technique: a correlated subquery! Find sales transactions where the price is higher than the average sale price for THAT specific crop (s2.crop_id = s1.crop_id)!'",
        concept: "Correlated Subquery (Inner Query References Outer Row)",
        hints: [
          "Use SELECT s1.sale_id, s1.crop_id, s1.quantity, s1.sale_price FROM sales s1 WHERE s1.sale_price > (SELECT AVG(s2.sale_price) FROM sales s2 WHERE s2.crop_id = s1.crop_id);",
          "SELECT s1.sale_id, s1.crop_id, s1.quantity, s1.sale_price FROM sales s1 WHERE s1.sale_price > (SELECT AVG(s2.sale_price) FROM sales s2 WHERE s2.crop_id = s1.crop_id);",
          "SELECT s1.sale_id, s1.crop_id, s1.quantity, s1.sale_price FROM sales s1 WHERE s1.sale_price > (SELECT AVG(s2.sale_price) FROM sales s2 WHERE s2.crop_id = s1.crop_id);"
        ],
        solution: "SELECT s1.sale_id, s1.crop_id, s1.quantity, s1.sale_price FROM sales s1 WHERE s1.sale_price > (SELECT AVG(s2.sale_price) FROM sales s2 WHERE s2.crop_id = s1.crop_id);",
        quickFill: "SELECT s1.sale_id, s1.crop_id, s1.quantity, s1.sale_price FROM sales s1 WHERE s1.sale_price > (SELECT AVG(s2.sale_price) FROM sales s2 WHERE s2.crop_id = s1.crop_id);",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 3; // Sales 2 (Tomato @ 22), 4 (Wheat @ 14), 6 (Rice @ 16)
        }
      },
      {
        id: "L13_M4",
        title: "Find Strong Performing Crop Sales (Correlated Subquery + JOIN)",
        objective: "Join 'crops' with the correlated subquery to display crop_name, sale_id, quantity, and sale_price.",
        dialogue: "Uncle Somu: 'Combine the correlated subquery with a JOIN to crops so we can see the crop name next to each premium sale!'",
        concept: "Correlated Subquery Combined with JOIN",
        hints: [
          "Join sales s1 and crops c on s1.crop_id = c.crop_id with the correlated subquery condition.",
          "SELECT c.crop_name, s1.sale_id, s1.quantity, s1.sale_price FROM sales s1 INNER JOIN crops c ON s1.crop_id = c.crop_id WHERE s1.sale_price > (SELECT AVG(s2.sale_price) FROM sales s2 WHERE s2.crop_id = s1.crop_id);",
          "SELECT c.crop_name, s1.sale_id, s1.quantity, s1.sale_price FROM sales s1 INNER JOIN crops c ON s1.crop_id = c.crop_id WHERE s1.sale_price > (SELECT AVG(s2.sale_price) FROM sales s2 WHERE s2.crop_id = s1.crop_id);"
        ],
        solution: "SELECT c.crop_name, s1.sale_id, s1.quantity, s1.sale_price FROM sales s1 INNER JOIN crops c ON s1.crop_id = c.crop_id WHERE s1.sale_price > (SELECT AVG(s2.sale_price) FROM sales s2 WHERE s2.crop_id = s1.crop_id);",
        quickFill: "SELECT c.crop_name, s1.sale_id, s1.quantity, s1.sale_price FROM sales s1 INNER JOIN crops c ON s1.crop_id = c.crop_id WHERE s1.sale_price > (SELECT AVG(s2.sale_price) FROM sales s2 WHERE s2.crop_id = s1.crop_id);",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.some(c => c.includes('crop_name')) && rows.length === 3;
        }
      },
      {
        id: "L13_M5",
        title: "THE ABOVE-AVERAGE REPORT",
        objective: "Join 'crops' and 'sales' for transactions where quantity > (SELECT AVG(quantity) FROM sales) ordered by quantity DESC.",
        dialogue: "Uncle Somu: 'Grand finale of Chapter 13! Generate the High Volume Sales Report: join crops and sales for all transactions where quantity exceeds the overall average sales quantity, sorted highest quantity first!'",
        concept: "Master Subquery Analytical Reporting",
        hints: [
          "Join crops and sales, filter WHERE s.quantity > (SELECT AVG(quantity) FROM sales), ordered by s.quantity DESC.",
          "SELECT c.crop_name, s.sale_id, s.quantity, s.sale_price, (s.quantity * s.sale_price) AS sale_value FROM sales s INNER JOIN crops c ON s.crop_id = c.crop_id WHERE s.quantity > (SELECT AVG(quantity) FROM sales) ORDER BY s.quantity DESC;",
          "SELECT c.crop_name, s.sale_id, s.quantity, s.sale_price, (s.quantity * s.sale_price) AS sale_value FROM sales s INNER JOIN crops c ON s.crop_id = c.crop_id WHERE s.quantity > (SELECT AVG(quantity) FROM sales) ORDER BY s.quantity DESC;"
        ],
        solution: "SELECT c.crop_name, s.sale_id, s.quantity, s.sale_price, (s.quantity * s.sale_price) AS sale_value FROM sales s INNER JOIN crops c ON s.crop_id = c.crop_id WHERE s.quantity > (SELECT AVG(quantity) FROM sales) ORDER BY s.quantity DESC;",
        quickFill: "SELECT c.crop_name, s.sale_id, s.quantity, s.sale_price, (s.quantity * s.sale_price) AS sale_value FROM sales s INNER JOIN crops c ON s.crop_id = c.crop_id WHERE s.quantity > (SELECT AVG(quantity) FROM sales) ORDER BY s.quantity DESC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const qtyIdx = cols.findIndex(c => c.includes('quantity'));
          if (qtyIdx === -1 || rows.length !== 2) return false;
          return Number(rows[0][qtyIdx]) > Number(rows[1][qtyIdx]) && Number(rows[1][qtyIdx]) > 60;
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 14: FARM INTELLIGENCE
  // ==========================================================
  14: {
    level: 14,
    title: "FARM INTELLIGENCE",
    role: "Strategic Operations Architect",
    concept: "Common Table Expressions (CTEs), WITH ... AS, Multi-Step Aggregations, CTE + JOIN, CTE + GROUP BY",
    teaser: "Master Common Table Expressions (CTEs) to architect clean, multi-step agricultural intelligence pipelines.",
    cutscene: {
      title: "Chapter 14: Farm Intelligence",
      image: "/images/cinematics/level8_regional.jpg",
      duration: 11,
      mood: "smart",
      subtitles: [
        { start: 0, end: 3.5, text: "As farm calculations grow in complexity, nested subqueries become hard to read." },
        { start: 3.5, end: 7.5, text: "Uncle Somu: 'Common Table Expressions break complex analysis into clean, named steps!'" },
        { start: 7.5, end: 11, text: "Build multi-step agricultural analytics using WITH ... AS syntax." }
      ]
    },
    storyIntro: {
      headline: "Multi-Step Business Intelligence Pipelines with CTEs",
      text: "The farm management team needs multi-stage reports combining inventory summaries, plot distributions, and commercial revenues. When queries require multiple calculations, nesting subqueries inside subqueries makes SQL unreadable. Uncle Somu introduces Common Table Expressions (CTEs): 'With the WITH clause, you create clean, temporary named result sets that act like analytical building blocks for your final report!'",
      notebookEntries: [
        { label: "Core Concept", value: "WITH cte_name AS (SELECT ...) SELECT ... FROM cte_name" },
        { label: "Advantages", value: "Modular, readable, reusable multi-step data pipelines" },
        { label: "Operations", value: "CTE + Aggregation, CTE + JOIN, Multiple CTE chaining" },
        { label: "Architecture", value: "Clean separation of data preparation from presentation" }
      ]
    },
    completion: {
      title: "LEVEL 14 COMPLETE",
      subtitle: "Master of Enterprise CTEs & Multi-Step Analysis!",
      badge: "🧠 Enterprise Architect",
      summary: "You mastered Common Table Expressions (CTEs)! By architecting modular, multi-step analytical pipelines with WITH ... AS syntax, you elevated FARMDB's reporting to professional enterprise standards.",
      stats: [
        { label: "Analytics Architecture", value: "Common Table Expressions (CTEs)" },
        { label: "Multi-Step Pipeline", value: "Chained Intermediate Datasets" },
        { label: "Reporting Quality", value: "Modular Enterprise Standard" },
        { label: "Cash Bonus", value: "+₹5,000" },
        { label: "XP Earned", value: "+1,000 XP" }
      ],
      nextLevelTitle: "Level 15: The Farm Database Rebuild"
    },
    missions: [
      {
        id: "L14_M0",
        title: "Create a Farm Analysis CTE",
        objective: "Write a CTE named 'supply_summary' calculating category, SUM(quantity) AS total_qty, COUNT(*) AS item_count from supplies, then select from it WHERE total_qty >= 25.",
        dialogue: "Uncle Somu: 'Let us build our first CTE! Define a CTE named supply_summary that calculates total quantity and item count per category, then query categories with total_qty >= 25.'",
        concept: "Basic CTE Structure (WITH ... AS)",
        hints: [
          "Use WITH supply_summary AS (SELECT category, SUM(quantity) AS total_qty, COUNT(*) AS item_count FROM supplies GROUP BY category) SELECT * FROM supply_summary WHERE total_qty >= 25;",
          "WITH supply_summary AS (\n  SELECT category, SUM(quantity) AS total_qty, COUNT(*) AS item_count\n  FROM supplies\n  GROUP BY category\n)\nSELECT * FROM supply_summary WHERE total_qty >= 25;",
          "WITH supply_summary AS (\n  SELECT category, SUM(quantity) AS total_qty, COUNT(*) AS item_count\n  FROM supplies\n  GROUP BY category\n)\nSELECT * FROM supply_summary WHERE total_qty >= 25;"
        ],
        solution: "WITH supply_summary AS (\n  SELECT category, SUM(quantity) AS total_qty, COUNT(*) AS item_count\n  FROM supplies\n  GROUP BY category\n)\nSELECT * FROM supply_summary WHERE total_qty >= 25;",
        quickFill: "WITH supply_summary AS (\n  SELECT category, SUM(quantity) AS total_qty, COUNT(*) AS item_count\n  FROM supplies\n  GROUP BY category\n)\nSELECT * FROM supply_summary WHERE total_qty >= 25;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const qtyIdx = cols.findIndex(c => c.includes('total') || c.includes('qty'));
          if (qtyIdx === -1 || rows.length < 2) return false;
          return rows.every(r => Number(r[qtyIdx]) >= 25);
        }
      },
      {
        id: "L14_M1",
        title: "Build a Sales Summary CTE",
        objective: "Write a CTE named 'crop_sales' calculating crop_id, SUM(quantity) AS units_sold, and SUM(quantity * sale_price) AS total_revenue from sales, then query it.",
        dialogue: "Uncle Somu: 'Create a CTE named crop_sales that summarizes units sold and gross revenue for each crop_id!'",
        concept: "CTE with Multi-Column Aggregations",
        hints: [
          "Define crop_sales CTE with SUM(quantity) AS units_sold and SUM(quantity * sale_price) AS total_revenue grouped by crop_id.",
          "WITH crop_sales AS (SELECT crop_id, SUM(quantity) AS units_sold, SUM(quantity * sale_price) AS total_revenue FROM sales GROUP BY crop_id) SELECT * FROM crop_sales;",
          "WITH crop_sales AS (\n  SELECT crop_id, SUM(quantity) AS units_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT * FROM crop_sales;"
        ],
        solution: "WITH crop_sales AS (\n  SELECT crop_id, SUM(quantity) AS units_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT * FROM crop_sales;",
        quickFill: "WITH crop_sales AS (\n  SELECT crop_id, SUM(quantity) AS units_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT * FROM crop_sales;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 3; // 3 crops with sales
        }
      },
      {
        id: "L14_M2",
        title: "Join the Analysis (CTE + JOIN)",
        objective: "Join the 'crop_sales' CTE with 'crops' on crop_id to display crop_name, market_price, units_sold, and total_revenue.",
        dialogue: "Uncle Somu: 'Now join our crop_sales CTE with the crops catalog table to connect crop names and base prices with sales totals!'",
        concept: "Joining a CTE with a Physical Table",
        hints: [
          "Define crop_sales CTE and join it with crops: FROM crop_sales cs INNER JOIN crops c ON cs.crop_id = c.crop_id.",
          "WITH crop_sales AS (SELECT crop_id, SUM(quantity) AS units_sold, SUM(quantity * sale_price) AS total_revenue FROM sales GROUP BY crop_id) SELECT c.crop_name, c.market_price, cs.units_sold, cs.total_revenue FROM crop_sales cs INNER JOIN crops c ON cs.crop_id = c.crop_id;",
          "WITH crop_sales AS (\n  SELECT crop_id, SUM(quantity) AS units_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT c.crop_name, c.market_price, cs.units_sold, cs.total_revenue\nFROM crop_sales cs\nINNER JOIN crops c ON cs.crop_id = c.crop_id;"
        ],
        solution: "WITH crop_sales AS (\n  SELECT crop_id, SUM(quantity) AS units_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT c.crop_name, c.market_price, cs.units_sold, cs.total_revenue\nFROM crop_sales cs\nINNER JOIN crops c ON cs.crop_id = c.crop_id;",
        quickFill: "WITH crop_sales AS (\n  SELECT crop_id, SUM(quantity) AS units_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT c.crop_name, c.market_price, cs.units_sold, cs.total_revenue\nFROM crop_sales cs\nINNER JOIN crops c ON cs.crop_id = c.crop_id;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.some(c => c.includes('crop_name')) && cols.some(c => c.includes('revenue')) && rows.length === 3;
        }
      },
      {
        id: "L14_M3",
        title: "Find High-Value Crops (CTE + Filtering)",
        objective: "Filter the 'crop_sales' CTE for high-earning crops with total_revenue >= 2000 joined with crops.",
        dialogue: "Uncle Somu: 'Which crops have generated at least ₹2,000 in gross revenue? Filter the joined CTE with WHERE cs.total_revenue >= 2000!'",
        concept: "Filtering Aggregated Results via CTE",
        hints: [
          "Add WHERE cs.total_revenue >= 2000 to the joined CTE query.",
          "WITH crop_sales AS (SELECT crop_id, SUM(quantity) AS units_sold, SUM(quantity * sale_price) AS total_revenue FROM sales GROUP BY crop_id) SELECT c.crop_name, cs.total_revenue FROM crop_sales cs INNER JOIN crops c ON cs.crop_id = c.crop_id WHERE cs.total_revenue >= 2000;",
          "WITH crop_sales AS (\n  SELECT crop_id, SUM(quantity) AS units_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT c.crop_name, cs.total_revenue\nFROM crop_sales cs\nINNER JOIN crops c ON cs.crop_id = c.crop_id\nWHERE cs.total_revenue >= 2000;"
        ],
        solution: "WITH crop_sales AS (\n  SELECT crop_id, SUM(quantity) AS units_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT c.crop_name, cs.total_revenue\nFROM crop_sales cs\nINNER JOIN crops c ON cs.crop_id = c.crop_id\nWHERE cs.total_revenue >= 2000;",
        quickFill: "WITH crop_sales AS (\n  SELECT crop_id, SUM(quantity) AS units_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT c.crop_name, cs.total_revenue\nFROM crop_sales cs\nINNER JOIN crops c ON cs.crop_id = c.crop_id\nWHERE cs.total_revenue >= 2000;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 1 && String(rows[0][0]).toLowerCase().includes('wheat');
        }
      },
      {
        id: "L14_M4",
        title: "Build a Multi-Step Farm Report (CTE + Calculations)",
        objective: "Write a CTE 'crop_performance' calculating total_qty, AVG(sale_price) AS avg_sale_price, and SUM(quantity * sale_price) AS gross_revenue, then select crop_name, total_qty, ROUND(avg_sale_price, 2) AS avg_price, gross_revenue ordered by gross_revenue DESC.",
        dialogue: "Uncle Somu: 'Build a comprehensive crop performance summary with CTEs: total quantity, rounded average sale price, and gross revenue, ordered by gross revenue descending!'",
        concept: "Multi-Step Calculated Reporting with CTE",
        hints: [
          "Define crop_performance CTE, join with crops, format ROUND(avg_sale_price, 2), ordered by gross_revenue DESC.",
          "WITH crop_performance AS (SELECT crop_id, SUM(quantity) AS total_qty, AVG(sale_price) AS avg_sale_price, SUM(quantity * sale_price) AS gross_revenue FROM sales GROUP BY crop_id) SELECT c.crop_name, cp.total_qty, ROUND(cp.avg_sale_price, 2) AS avg_price, cp.gross_revenue FROM crop_performance cp INNER JOIN crops c ON cp.crop_id = c.crop_id ORDER BY cp.gross_revenue DESC;",
          "WITH crop_performance AS (\n  SELECT crop_id, SUM(quantity) AS total_qty, AVG(sale_price) AS avg_sale_price, SUM(quantity * sale_price) AS gross_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT c.crop_name, cp.total_qty, ROUND(cp.avg_sale_price, 2) AS avg_price, cp.gross_revenue\nFROM crop_performance cp\nINNER JOIN crops c ON cp.crop_id = c.crop_id\nORDER BY cp.gross_revenue DESC;"
        ],
        solution: "WITH crop_performance AS (\n  SELECT crop_id, SUM(quantity) AS total_qty, AVG(sale_price) AS avg_sale_price, SUM(quantity * sale_price) AS gross_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT c.crop_name, cp.total_qty, ROUND(cp.avg_sale_price, 2) AS avg_price, cp.gross_revenue\nFROM crop_performance cp\nINNER JOIN crops c ON cp.crop_id = c.crop_id\nORDER BY cp.gross_revenue DESC;",
        quickFill: "WITH crop_performance AS (\n  SELECT crop_id, SUM(quantity) AS total_qty, AVG(sale_price) AS avg_sale_price, SUM(quantity * sale_price) AS gross_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT c.crop_name, cp.total_qty, ROUND(cp.avg_sale_price, 2) AS avg_price, cp.gross_revenue\nFROM crop_performance cp\nINNER JOIN crops c ON cp.crop_id = c.crop_id\nORDER BY cp.gross_revenue DESC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const revIdx = cols.findIndex(c => c.includes('revenue') || c.includes('gross'));
          if (revIdx === -1 || rows.length !== 3) return false;
          return Number(rows[0][revIdx]) >= Number(rows[1][revIdx]);
        }
      },
      {
        id: "L14_M5",
        title: "FARM INTELLIGENCE REPORT",
        objective: "Master multi-step report: combine two CTEs ('plot_metrics' and 'sales_metrics') joined with 'crops' to produce crop_name, plots_planted, total_sold, and total_revenue ordered by total_revenue DESC.",
        dialogue: "Uncle Somu: 'The grand finale of Chapter 14! Chain multiple CTEs to deliver the Farm Intelligence Report: combine plot counts from farming and revenue from sales into one unified strategic dashboard!'",
        concept: "Multiple Chained CTEs (Enterprise Intelligence Pipeline)",
        hints: [
          "Define plot_metrics and sales_metrics with commas, join both with crops, ordered by total_revenue DESC.",
          "WITH plot_metrics AS (SELECT crop_id, COUNT(*) AS active_plots FROM farming GROUP BY crop_id), sales_metrics AS (SELECT crop_id, SUM(quantity) AS total_sold, SUM(quantity * sale_price) AS total_revenue FROM sales GROUP BY crop_id) SELECT c.crop_name, COALESCE(pm.active_plots, 0) AS plots_planted, sm.total_sold, sm.total_revenue FROM crops c INNER JOIN sales_metrics sm ON c.crop_id = sm.crop_id LEFT JOIN plot_metrics pm ON c.crop_id = pm.crop_id ORDER BY sm.total_revenue DESC;",
          "WITH plot_metrics AS (\n  SELECT crop_id, COUNT(*) AS active_plots\n  FROM farming\n  GROUP BY crop_id\n),\nsales_metrics AS (\n  SELECT crop_id, SUM(quantity) AS total_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT c.crop_name, COALESCE(pm.active_plots, 0) AS plots_planted, sm.total_sold, sm.total_revenue\nFROM crops c\nINNER JOIN sales_metrics sm ON c.crop_id = sm.crop_id\nLEFT JOIN plot_metrics pm ON c.crop_id = pm.crop_id\nORDER BY sm.total_revenue DESC;"
        ],
        solution: "WITH plot_metrics AS (\n  SELECT crop_id, COUNT(*) AS active_plots\n  FROM farming\n  GROUP BY crop_id\n),\nsales_metrics AS (\n  SELECT crop_id, SUM(quantity) AS total_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT c.crop_name, COALESCE(pm.active_plots, 0) AS plots_planted, sm.total_sold, sm.total_revenue\nFROM crops c\nINNER JOIN sales_metrics sm ON c.crop_id = sm.crop_id\nLEFT JOIN plot_metrics pm ON c.crop_id = pm.crop_id\nORDER BY sm.total_revenue DESC;",
        quickFill: "WITH plot_metrics AS (\n  SELECT crop_id, COUNT(*) AS active_plots\n  FROM farming\n  GROUP BY crop_id\n),\nsales_metrics AS (\n  SELECT crop_id, SUM(quantity) AS total_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT c.crop_name, COALESCE(pm.active_plots, 0) AS plots_planted, sm.total_sold, sm.total_revenue\nFROM crops c\nINNER JOIN sales_metrics sm ON c.crop_id = sm.crop_id\nLEFT JOIN plot_metrics pm ON c.crop_id = pm.crop_id\nORDER BY sm.total_revenue DESC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const revIdx = cols.findIndex(c => c.includes('revenue') || c.includes('total_revenue'));
          if (cols.length < 4 || rows.length !== 3 || revIdx === -1) return false;
          return Number(rows[0][revIdx]) >= Number(rows[1][revIdx]) && Number(rows[1][revIdx]) >= Number(rows[2][revIdx]);
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 15: THE FARM DATABASE REBUILD
  // ==========================================================
  15: {
    level: 15,
    title: "THE FARM DATABASE REBUILD",
    role: "Database Systems Administrator",
    concept: "Data Definition Language (DDL), ALTER TABLE, ADD COLUMN, RENAME TABLE, DROP TABLE, Schema Restructuring",
    teaser: "Master structural DDL commands to remodel and restructure the growing farm database.",
    cutscene: {
      title: "Chapter 15: The Farm Database Rebuild",
      image: "/images/cinematics/level4_supplies.jpg",
      duration: 11,
      mood: "smart",
      subtitles: [
        { start: 0, end: 3.5, text: "The farm has grown, and our initial schema structures are starting to show limitations." },
        { start: 3.5, end: 7.5, text: "Uncle Somu: 'We fixed the farm data; now we must restructure the database itself!'" },
        { start: 7.5, end: 11, text: "Master Data Definition Language (DDL) to modify tables without breaking operations." }
      ]
    },
    storyIntro: {
      headline: "Remodeling Schemas with Data Definition Language (DDL)",
      text: "The farm has grown into a bustling agricultural hub. The initial database served us well, but the manager has discovered structural shortcomings: vendor contact tables need digital email fields, temporary logs from earlier seasons need standardized names, deprecated scratchpad columns must be cleaned up, and obsolete tables must be dropped safely. Uncle Somu hands you the master terminal: 'It is time to evolve our schema structure using DDL!'",
      notebookEntries: [
        { label: "Core Concept", value: "DDL: Structural changes to database objects (Tables, Columns)" },
        { label: "Add Column", value: "ALTER TABLE table_name ADD COLUMN col_name datatype;" },
        { label: "Rename Table", value: "ALTER TABLE old_name RENAME TO new_name;" },
        { label: "Drop Table", value: "DROP TABLE table_name; (Permanently removes structure)" }
      ]
    },
    completion: {
      title: "LEVEL 15 COMPLETE",
      subtitle: "Database Architecture Upgraded!",
      badge: "🏗️ Schema Architect",
      summary: "You restructured the farm's relational schemas with DDL! By modifying columns, standardizing table names, and building permanent facility registries, you fortified FARMDB's underlying foundation.",
      stats: [
        { label: "DDL Upgrades", value: "ALTER, RENAME, DROP" },
        { label: "New Facilities", value: "facility_registry Active" },
        { label: "Schema Health", value: "100% Normalized DDL" },
        { label: "Cash Bonus", value: "+₹3,000" },
        { label: "XP Earned", value: "+600 XP" }
      ],
      nextLevelTitle: "Level 16: The Blueprint of the Farm"
    },
    missions: [
      {
        id: "L15_M0",
        title: "Inspect the Farm Structure",
        objective: "Inspect all registered user tables in the database by querying sqlite_master ordered by name.",
        dialogue: "Uncle Somu: 'Before modifying any database structures, inspect our master schema catalog! Query sqlite_master to list all registered user tables.'",
        concept: "Database Object Inspection via sqlite_master",
        hints: [
          "Query name from sqlite_master where type = 'table' and name NOT LIKE 'sqlite_%'.",
          "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name;",
          "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
        ],
        solution: "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name;",
        quickFill: "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const tableNames = rows.map(r => String(r[0]).toLowerCase());
          return tableNames.includes('crops') && tableNames.includes('farming') && tableNames.includes('supplies');
        }
      },
      {
        id: "L15_M1",
        title: "Add Farm Contact Information",
        objective: "Use ALTER TABLE to add an 'email' column of type TEXT to the 'suppliers' table.",
        dialogue: "Uncle Somu: 'Our vendor network is modernizing. Add an email column of type TEXT to our suppliers table using ALTER TABLE ... ADD COLUMN!'",
        concept: "ALTER TABLE table_name ADD COLUMN column_name datatype",
        hints: [
          "Use ALTER TABLE suppliers ADD COLUMN email TEXT;",
          "ALTER TABLE suppliers ADD COLUMN email TEXT;",
          "ALTER TABLE suppliers ADD COLUMN email TEXT;"
        ],
        solution: "ALTER TABLE suppliers ADD COLUMN email TEXT;",
        quickFill: "ALTER TABLE suppliers ADD COLUMN email TEXT;",
        validate: (db) => {
          const schema = db.getSchema();
          if (!schema['suppliers']) return false;
          return schema['suppliers'].some(col => col.name.toLowerCase() === 'email');
        }
      },
      {
        id: "L15_M2",
        title: "Rename an Old Table",
        objective: "Create a legacy training table 'old_crop_notes' and rename it to 'archived_crop_notes' using ALTER TABLE ... RENAME TO.",
        dialogue: "Uncle Somu: 'Standardize our naming conventions: rename the legacy table old_crop_notes to archived_crop_notes!'",
        concept: "ALTER TABLE old_name RENAME TO new_name",
        hints: [
          "Create old_crop_notes then rename it with ALTER TABLE old_crop_notes RENAME TO archived_crop_notes;",
          "CREATE TABLE IF NOT EXISTS old_crop_notes (note_id INTEGER PRIMARY KEY, note TEXT);\nALTER TABLE old_crop_notes RENAME TO archived_crop_notes;",
          "CREATE TABLE IF NOT EXISTS old_crop_notes (note_id INTEGER PRIMARY KEY, note TEXT);\nALTER TABLE old_crop_notes RENAME TO archived_crop_notes;"
        ],
        solution: "CREATE TABLE IF NOT EXISTS old_crop_notes (note_id INTEGER PRIMARY KEY, note TEXT);\nALTER TABLE old_crop_notes RENAME TO archived_crop_notes;",
        quickFill: "CREATE TABLE IF NOT EXISTS old_crop_notes (note_id INTEGER PRIMARY KEY, note TEXT);\nALTER TABLE old_crop_notes RENAME TO archived_crop_notes;",
        validate: (db) => {
          return db.tableExists('archived_crop_notes') && !db.tableExists('old_crop_notes');
        }
      },
      {
        id: "L15_M3",
        title: "Remove an Obsolete Field",
        objective: "Remove the obsolete column 'temp_notes' from the training audit table 'field_audit_log' using ALTER TABLE ... DROP COLUMN.",
        dialogue: "Uncle Somu: 'The field_audit_log table has an obsolete temp_notes scratchpad column wasting space. Remove it cleanly using ALTER TABLE ... DROP COLUMN!'",
        concept: "ALTER TABLE table_name DROP COLUMN column_name",
        hints: [
          "Create field_audit_log and drop temp_notes with ALTER TABLE field_audit_log DROP COLUMN temp_notes;",
          "CREATE TABLE IF NOT EXISTS field_audit_log (\n  audit_id INTEGER PRIMARY KEY,\n  plot_id TEXT,\n  audit_date TEXT,\n  temp_notes TEXT\n);\nALTER TABLE field_audit_log DROP COLUMN temp_notes;",
          "CREATE TABLE IF NOT EXISTS field_audit_log (\n  audit_id INTEGER PRIMARY KEY,\n  plot_id TEXT,\n  audit_date TEXT,\n  temp_notes TEXT\n);\nALTER TABLE field_audit_log DROP COLUMN temp_notes;"
        ],
        solution: "CREATE TABLE IF NOT EXISTS field_audit_log (\n  audit_id INTEGER PRIMARY KEY,\n  plot_id TEXT,\n  audit_date TEXT,\n  temp_notes TEXT\n);\nALTER TABLE field_audit_log DROP COLUMN temp_notes;",
        quickFill: "CREATE TABLE IF NOT EXISTS field_audit_log (\n  audit_id INTEGER PRIMARY KEY,\n  plot_id TEXT,\n  audit_date TEXT,\n  temp_notes TEXT\n);\nALTER TABLE field_audit_log DROP COLUMN temp_notes;",
        validate: (db) => {
          if (!db.tableExists('field_audit_log')) return false;
          const schema = db.getSchema();
          const cols = (schema['field_audit_log'] || []).map(c => c.name.toLowerCase());
          return cols.includes('audit_id') && !cols.includes('temp_notes');
        }
      },
      {
        id: "L15_M4",
        title: "Remove an Abandoned Table",
        objective: "Safely remove the temporary scratchpad table 'abandoned_records' using DROP TABLE.",
        dialogue: "Uncle Somu: 'An old temporary scratchpad table abandoned_records from last season is cluttering the catalog. Remove it completely with DROP TABLE!'",
        concept: "DROP TABLE table_name",
        hints: [
          "Drop abandoned_records using DROP TABLE IF EXISTS abandoned_records;",
          "CREATE TABLE IF NOT EXISTS abandoned_records (temp_id INTEGER PRIMARY KEY, data TEXT);\nDROP TABLE abandoned_records;",
          "CREATE TABLE IF NOT EXISTS abandoned_records (temp_id INTEGER PRIMARY KEY, data TEXT);\nDROP TABLE abandoned_records;"
        ],
        solution: "CREATE TABLE IF NOT EXISTS abandoned_records (temp_id INTEGER PRIMARY KEY, data TEXT);\nDROP TABLE abandoned_records;",
        quickFill: "CREATE TABLE IF NOT EXISTS abandoned_records (temp_id INTEGER PRIMARY KEY, data TEXT);\nDROP TABLE abandoned_records;",
        validate: (db) => {
          return !db.tableExists('abandoned_records');
        }
      },
      {
        id: "L15_M5",
        title: "REBUILD THE FARM DATABASE",
        objective: "Architect the permanent 'facility_registry' table with facility_id (INTEGER PRIMARY KEY), facility_name (TEXT NOT NULL), capacity (INTEGER), add 'location_code' TEXT column via ALTER TABLE, and insert 3 facilities.",
        dialogue: "Uncle Somu: 'Grand finale of Chapter 15! Build our modern facility registry: create facility_registry, add location_code using ALTER TABLE, and register our Main Barn, Cold Storage, and Grain Silo!'",
        concept: "Master DDL Architecture & Facility Registry Creation",
        hints: [
          "Create facility_registry, add location_code column, and insert 3 records.",
          "CREATE TABLE facility_registry (\n  facility_id INTEGER PRIMARY KEY,\n  facility_name TEXT NOT NULL,\n  capacity INTEGER\n);\nALTER TABLE facility_registry ADD COLUMN location_code TEXT;\nINSERT INTO facility_registry (facility_id, facility_name, capacity, location_code) VALUES \n(1, 'Main Barn', 100, 'ZONE-A'),\n(2, 'Cold Storage', 500, 'ZONE-B'),\n(3, 'Grain Silo', 1200, 'ZONE-C');",
          "CREATE TABLE facility_registry (\n  facility_id INTEGER PRIMARY KEY,\n  facility_name TEXT NOT NULL,\n  capacity INTEGER\n);\nALTER TABLE facility_registry ADD COLUMN location_code TEXT;\nINSERT INTO facility_registry (facility_id, facility_name, capacity, location_code) VALUES \n(1, 'Main Barn', 100, 'ZONE-A'),\n(2, 'Cold Storage', 500, 'ZONE-B'),\n(3, 'Grain Silo', 1200, 'ZONE-C');"
        ],
        solution: "CREATE TABLE facility_registry (\n  facility_id INTEGER PRIMARY KEY,\n  facility_name TEXT NOT NULL,\n  capacity INTEGER\n);\nALTER TABLE facility_registry ADD COLUMN location_code TEXT;\nINSERT INTO facility_registry (facility_id, facility_name, capacity, location_code) VALUES \n(1, 'Main Barn', 100, 'ZONE-A'),\n(2, 'Cold Storage', 500, 'ZONE-B'),\n(3, 'Grain Silo', 1200, 'ZONE-C');",
        quickFill: "CREATE TABLE facility_registry (\n  facility_id INTEGER PRIMARY KEY,\n  facility_name TEXT NOT NULL,\n  capacity INTEGER\n);\nALTER TABLE facility_registry ADD COLUMN location_code TEXT;\nINSERT INTO facility_registry (facility_id, facility_name, capacity, location_code) VALUES \n(1, 'Main Barn', 100, 'ZONE-A'),\n(2, 'Cold Storage', 500, 'ZONE-B'),\n(3, 'Grain Silo', 1200, 'ZONE-C');",
        validate: (db) => {
          if (!db.tableExists('facility_registry')) return false;
          const schema = db.getSchema();
          const cols = (schema['facility_registry'] || []).map(c => c.name.toLowerCase());
          const data = db.getTableData('facility_registry');
          return cols.includes('location_code') && data.length >= 3;
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 16: THE BLUEPRINT OF THE FARM
  // ==========================================================
  16: {
    level: 16,
    title: "THE BLUEPRINT OF THE FARM",
    role: "Relational Data Architect",
    concept: "ER Modeling, 1:1 Relationship, 1:M Relationship, M:M Junction Tables, Normalization (1NF, 2NF, 3NF)",
    teaser: "Design the comprehensive relational architecture of the farm with normalized entity models.",
    cutscene: {
      title: "Chapter 16: The Blueprint of the Farm",
      image: "/images/cinematics/level8_regional.jpg",
      duration: 11,
      mood: "smart",
      subtitles: [
        { start: 0, end: 3.5, text: "As farm data interconnects, we need a rigorous blueprint mapping our entities." },
        { start: 3.5, end: 7.5, text: "Uncle Somu: 'A great database design removes duplicate information and defines exact relationships!'" },
        { start: 7.5, end: 11, text: "Master 1:1, 1:M, M:M junction tables, and relational database normalization." }
      ]
    },
    storyIntro: {
      headline: "Relational Modeling, Cardinality & Database Normalization",
      text: "The farm database is alive and expanding, but the owner wants an architectural blueprint. We must define which entities exist, how they relate, where duplicate information causes update anomalies, and how junction tables bridge many-to-many relationships. Uncle Somu explains: 'A true relational database uses Primary Keys and Foreign Keys to model real-world cardinality: One-to-One (1:1), One-to-Many (1:M), and Many-to-Many (M:M) through junction tables. Let us blueprint the farm!'",
      notebookEntries: [
        { label: "1:1 Relationship", value: "One Farm <-> One Official Profile (Primary Key link)" },
        { label: "1:M Relationship", value: "One Crop <-> Many Field Plots (Foreign Key on plots)" },
        { label: "M:M Relationship", value: "Many Crops <-> Many Suppliers (Junction table with composite PK)" },
        { label: "Normalization", value: "1NF (Atomic), 2NF (No partial keys), 3NF (No transitive dependencies)" }
      ]
    },
    completion: {
      title: "LEVEL 16 COMPLETE",
      subtitle: "Relational Blueprint Mastered!",
      badge: "📐 Entity Modeler",
      summary: "You constructed the official relational blueprint for FARMDB! By architecting 1:1 profiles, 1:M plot mappings, M:M junction links, and normalized schemas, you designed a robust agribusiness data foundation.",
      stats: [
        { label: "Cardinality Models", value: "1:1, 1:M, and M:M Active" },
        { label: "Junction Table", value: "crop_suppliers Linked" },
        { label: "Normalization", value: "Third Normal Form (3NF)" },
        { label: "Cash Bonus", value: "+₹3,500" },
        { label: "XP Earned", value: "+750 XP" }
      ],
      nextLevelTitle: "Level 17: DA Final — Can You Save The Farm?"
    },
    missions: [
      {
        id: "L16_M0",
        title: "Draw the Farm Entities",
        objective: "Inspect primary farm entity sizes by querying entity names and record counts across crops, suppliers, farming, and sales.",
        dialogue: "Uncle Somu: 'Let us map our core farm entities! Query entity names and row counts across our primary tables using UNION ALL to inspect the farm ecosystem.'",
        concept: "Entity Cardinality & Ecosystem Assessment",
        hints: [
          "Use UNION ALL to select entity name and count from crops, suppliers, farming, and sales.",
          "SELECT 'crops' AS entity_name, COUNT(*) AS total_records FROM crops\nUNION ALL\nSELECT 'suppliers', COUNT(*) FROM suppliers\nUNION ALL\nSELECT 'farming', COUNT(*) FROM farming\nUNION ALL\nSELECT 'sales', COUNT(*) FROM sales;",
          "SELECT 'crops' AS entity_name, COUNT(*) AS total_records FROM crops\nUNION ALL\nSELECT 'suppliers', COUNT(*) FROM suppliers\nUNION ALL\nSELECT 'farming', COUNT(*) FROM farming\nUNION ALL\nSELECT 'sales', COUNT(*) FROM sales;"
        ],
        solution: "SELECT 'crops' AS entity_name, COUNT(*) AS total_records FROM crops\nUNION ALL\nSELECT 'suppliers', COUNT(*) FROM suppliers\nUNION ALL\nSELECT 'farming', COUNT(*) FROM farming\nUNION ALL\nSELECT 'sales', COUNT(*) FROM sales;",
        quickFill: "SELECT 'crops' AS entity_name, COUNT(*) AS total_records FROM crops\nUNION ALL\nSELECT 'suppliers', COUNT(*) FROM suppliers\nUNION ALL\nSELECT 'farming', COUNT(*) FROM farming\nUNION ALL\nSELECT 'sales', COUNT(*) FROM sales;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 4 && rows.every(r => Number(r[1]) > 0);
        }
      },
      {
        id: "L16_M1",
        title: "One Crop, Many Fields (1:M Relationship)",
        objective: "Demonstrate the 1:M relationship by joining 'crops' and 'farming' on crop_id to display crop_name, plot_id, status, and growth_percent.",
        dialogue: "Uncle Somu: 'Examine our 1:M relationship in action! One crop can be planted across multiple plots. Join crops and farming on crop_id to display every active field assignment.'",
        concept: "1:M Relational Cardinality (One Crop -> Many Plots)",
        hints: [
          "Join crops and farming on crop_id and select crop_name, plot_id, status, growth_percent.",
          "SELECT crops.crop_name, farming.plot_id, farming.status, farming.growth_percent FROM crops INNER JOIN farming ON crops.crop_id = farming.crop_id ORDER BY crops.crop_name, farming.plot_id;",
          "SELECT crops.crop_name, farming.plot_id, farming.status, farming.growth_percent FROM crops INNER JOIN farming ON crops.crop_id = farming.crop_id ORDER BY crops.crop_name, farming.plot_id;"
        ],
        solution: "SELECT crops.crop_name, farming.plot_id, farming.status, farming.growth_percent FROM crops INNER JOIN farming ON crops.crop_id = farming.crop_id ORDER BY crops.crop_name, farming.plot_id;",
        quickFill: "SELECT crops.crop_name, farming.plot_id, farming.status, farming.growth_percent FROM crops INNER JOIN farming ON crops.crop_id = farming.crop_id ORDER BY crops.crop_name, farming.plot_id;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length >= 4;
        }
      },
      {
        id: "L16_M2",
        title: "Build a One-to-One Profile (1:1 Relationship)",
        objective: "Create the 'farm_profile' table (profile_id INTEGER PRIMARY KEY, farm_name TEXT NOT NULL, owner_name TEXT, established_year INTEGER) representing a 1:1 relationship, and insert the official farm record.",
        dialogue: "Uncle Somu: 'Every farm enterprise has exactly one official organizational profile (1:1). Create farm_profile with profile_id (INTEGER PRIMARY KEY), farm_name, owner_name, established_year, and register Green Valley Agribusiness!'",
        concept: "1:1 Relational Cardinality with Primary Key",
        hints: [
          "Create farm_profile with profile_id INTEGER PRIMARY KEY, farm_name TEXT NOT NULL, owner_name TEXT, established_year INTEGER, then insert the record.",
          "CREATE TABLE farm_profile (\n  profile_id INTEGER PRIMARY KEY,\n  farm_name TEXT NOT NULL,\n  owner_name TEXT,\n  established_year INTEGER\n);\nINSERT INTO farm_profile (profile_id, farm_name, owner_name, established_year) VALUES \n(1, 'Green Valley Agribusiness', 'Uncle Somu & Partners', 1984);",
          "CREATE TABLE farm_profile (\n  profile_id INTEGER PRIMARY KEY,\n  farm_name TEXT NOT NULL,\n  owner_name TEXT,\n  established_year INTEGER\n);\nINSERT INTO farm_profile (profile_id, farm_name, owner_name, established_year) VALUES \n(1, 'Green Valley Agribusiness', 'Uncle Somu & Partners', 1984);"
        ],
        solution: "CREATE TABLE farm_profile (\n  profile_id INTEGER PRIMARY KEY,\n  farm_name TEXT NOT NULL,\n  owner_name TEXT,\n  established_year INTEGER\n);\nINSERT INTO farm_profile (profile_id, farm_name, owner_name, established_year) VALUES \n(1, 'Green Valley Agribusiness', 'Uncle Somu & Partners', 1984);",
        quickFill: "CREATE TABLE farm_profile (\n  profile_id INTEGER PRIMARY KEY,\n  farm_name TEXT NOT NULL,\n  owner_name TEXT,\n  established_year INTEGER\n);\nINSERT INTO farm_profile (profile_id, farm_name, owner_name, established_year) VALUES \n(1, 'Green Valley Agribusiness', 'Uncle Somu & Partners', 1984);",
        validate: (db) => {
          if (!db.tableExists('farm_profile')) return false;
          const data = db.getTableData('farm_profile');
          return data && data.length >= 1 && String(data[0].farm_name).includes('Green Valley');
        }
      },
      {
        id: "L16_M3",
        title: "Connect Crops and Suppliers (M:M Junction Table)",
        objective: "Create the junction table 'crop_suppliers' with crop_id INTEGER, supplier_id INTEGER, PRIMARY KEY (crop_id, supplier_id), foreign keys referencing crops and suppliers, then insert 5 relationship links.",
        dialogue: "Uncle Somu: 'A crop can be supplied by multiple vendors, and a vendor can supply multiple crops (M:M). Bridge them using a junction table crop_suppliers with composite PRIMARY KEY (crop_id, supplier_id)!'",
        concept: "M:M Relationship Modeling via Junction Table & Composite PK",
        hints: [
          "Create crop_suppliers with crop_id, supplier_id, PRIMARY KEY (crop_id, supplier_id), and insert 5 mappings.",
          "CREATE TABLE crop_suppliers (\n  crop_id INTEGER,\n  supplier_id INTEGER,\n  PRIMARY KEY (crop_id, supplier_id),\n  FOREIGN KEY (crop_id) REFERENCES crops(crop_id),\n  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)\n);\nINSERT INTO crop_suppliers (crop_id, supplier_id) VALUES \n(1, 1),\n(1, 2),\n(2, 2),\n(2, 3),\n(3, 1);",
          "CREATE TABLE crop_suppliers (\n  crop_id INTEGER,\n  supplier_id INTEGER,\n  PRIMARY KEY (crop_id, supplier_id),\n  FOREIGN KEY (crop_id) REFERENCES crops(crop_id),\n  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)\n);\nINSERT INTO crop_suppliers (crop_id, supplier_id) VALUES \n(1, 1),\n(1, 2),\n(2, 2),\n(2, 3),\n(3, 1);"
        ],
        solution: "CREATE TABLE crop_suppliers (\n  crop_id INTEGER,\n  supplier_id INTEGER,\n  PRIMARY KEY (crop_id, supplier_id),\n  FOREIGN KEY (crop_id) REFERENCES crops(crop_id),\n  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)\n);\nINSERT INTO crop_suppliers (crop_id, supplier_id) VALUES \n(1, 1),\n(1, 2),\n(2, 2),\n(2, 3),\n(3, 1);",
        quickFill: "CREATE TABLE crop_suppliers (\n  crop_id INTEGER,\n  supplier_id INTEGER,\n  PRIMARY KEY (crop_id, supplier_id),\n  FOREIGN KEY (crop_id) REFERENCES crops(crop_id),\n  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)\n);\nINSERT INTO crop_suppliers (crop_id, supplier_id) VALUES \n(1, 1),\n(1, 2),\n(2, 2),\n(2, 3),\n(3, 1);",
        validate: (db) => {
          if (!db.tableExists('crop_suppliers')) return false;
          const data = db.getTableData('crop_suppliers');
          return data && data.length >= 5;
        }
      },
      {
        id: "L16_M4",
        title: "Normalize the Farm Records (3NF Normalization)",
        objective: "Architect the normalized 'shipment_orders' table (order_id INTEGER PRIMARY KEY, crop_id INTEGER, supplier_id INTEGER, quantity INTEGER, order_date TEXT) eliminating redundant text attributes.",
        dialogue: "Uncle Somu: 'In unnormalized files, vendor contact numbers and crop names are duplicated on every shipment row. Create the normalized shipment_orders table referencing crop_id and supplier_id!'",
        concept: "Third Normal Form (3NF) Normalization",
        hints: [
          "Create shipment_orders referencing crop_id and supplier_id, then insert 3 records.",
          "CREATE TABLE shipment_orders (\n  order_id INTEGER PRIMARY KEY,\n  crop_id INTEGER,\n  supplier_id INTEGER,\n  quantity INTEGER,\n  order_date TEXT,\n  FOREIGN KEY (crop_id) REFERENCES crops(crop_id),\n  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)\n);\nINSERT INTO shipment_orders (order_id, crop_id, supplier_id, quantity, order_date) VALUES \n(101, 1, 1, 200, '2026-09-21'),\n(102, 2, 2, 350, '2026-09-22'),\n(103, 3, 1, 150, '2026-09-23');",
          "CREATE TABLE shipment_orders (\n  order_id INTEGER PRIMARY KEY,\n  crop_id INTEGER,\n  supplier_id INTEGER,\n  quantity INTEGER,\n  order_date TEXT,\n  FOREIGN KEY (crop_id) REFERENCES crops(crop_id),\n  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)\n);\nINSERT INTO shipment_orders (order_id, crop_id, supplier_id, quantity, order_date) VALUES \n(101, 1, 1, 200, '2026-09-21'),\n(102, 2, 2, 350, '2026-09-22'),\n(103, 3, 1, 150, '2026-09-23');"
        ],
        solution: "CREATE TABLE shipment_orders (\n  order_id INTEGER PRIMARY KEY,\n  crop_id INTEGER,\n  supplier_id INTEGER,\n  quantity INTEGER,\n  order_date TEXT,\n  FOREIGN KEY (crop_id) REFERENCES crops(crop_id),\n  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)\n);\nINSERT INTO shipment_orders (order_id, crop_id, supplier_id, quantity, order_date) VALUES \n(101, 1, 1, 200, '2026-09-21'),\n(102, 2, 2, 350, '2026-09-22'),\n(103, 3, 1, 150, '2026-09-23');",
        quickFill: "CREATE TABLE shipment_orders (\n  order_id INTEGER PRIMARY KEY,\n  crop_id INTEGER,\n  supplier_id INTEGER,\n  quantity INTEGER,\n  order_date TEXT,\n  FOREIGN KEY (crop_id) REFERENCES crops(crop_id),\n  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)\n);\nINSERT INTO shipment_orders (order_id, crop_id, supplier_id, quantity, order_date) VALUES \n(101, 1, 1, 200, '2026-09-21'),\n(102, 2, 2, 350, '2026-09-22'),\n(103, 3, 1, 150, '2026-09-23');",
        validate: (db) => {
          if (!db.tableExists('shipment_orders')) return false;
          const data = db.getTableData('shipment_orders');
          return data && data.length >= 3;
        }
      },
      {
        id: "L16_M5",
        title: "THE FARM DATABASE BLUEPRINT",
        objective: "Execute the Master Blueprint Query linking 'crops', 'crop_suppliers', and 'suppliers' through the M:M junction table to display crop_name, supplier_name, and contact ordered by crop_name, supplier_name.",
        dialogue: "Uncle Somu: 'The grand finale of Chapter 16! Execute the Master Blueprint Query traversing our M:M junction architecture from Crops to Suppliers!'",
        concept: "Master M:M Relational Traversal",
        hints: [
          "Join crops, crop_suppliers, and suppliers and select crop_name, supplier_name, contact ordered by crop_name, supplier_name.",
          "SELECT c.crop_name, s.supplier_name, s.contact FROM crops c INNER JOIN crop_suppliers cs ON c.crop_id = cs.crop_id INNER JOIN suppliers s ON cs.supplier_id = s.supplier_id ORDER BY c.crop_name ASC, s.supplier_name ASC;",
          "SELECT c.crop_name, s.supplier_name, s.contact FROM crops c INNER JOIN crop_suppliers cs ON c.crop_id = cs.crop_id INNER JOIN suppliers s ON cs.supplier_id = s.supplier_id ORDER BY c.crop_name ASC, s.supplier_name ASC;"
        ],
        solution: "SELECT c.crop_name, s.supplier_name, s.contact FROM crops c INNER JOIN crop_suppliers cs ON c.crop_id = cs.crop_id INNER JOIN suppliers s ON cs.supplier_id = s.supplier_id ORDER BY c.crop_name ASC, s.supplier_name ASC;",
        quickFill: "SELECT c.crop_name, s.supplier_name, s.contact FROM crops c INNER JOIN crop_suppliers cs ON c.crop_id = cs.crop_id INNER JOIN suppliers s ON cs.supplier_id = s.supplier_id ORDER BY c.crop_name ASC, s.supplier_name ASC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.length >= 3 && rows.length >= 5;
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 17: DA FINAL — CAN YOU SAVE THE FARM?
  // ==========================================================
  17: {
    level: 17,
    title: "DA FINAL — CAN YOU SAVE THE FARM?",
    role: "Chief Agricultural Data Scientist",
    concept: "Data Analytics Capstone Synthesis (Multi-Table JOINs, Aggregates, Subqueries, CTEs, Business Decision Logic)",
    teaser: "Synthesize everything you have learned to resolve a major farm crisis in the Data Analytics Capstone.",
    cutscene: {
      title: "Chapter 17: The Agribusiness Crisis",
      image: "/images/cinematics/level5_harvest.jpg",
      duration: 11,
      mood: "prosperous",
      subtitles: [
        { start: 0, end: 3.5, text: "Market demand is shifting rapidly and input costs are fluctuating across the region." },
        { start: 3.5, end: 7.5, text: "The Owner: 'The farm is back on its feet, but now we face our greatest commercial trial!'" },
        { start: 7.5, end: 11, text: "Uncle Somu: 'Synthesize all your SQL knowledge to formulate the ultimate farm salvation strategy!'" }
      ]
    },
    storyIntro: {
      headline: "The Grand Capstone: Data-Driven Agribusiness Strategy",
      text: "The farm has finally been restored from neglect, but a new challenge arrives. Regional market prices are fluctuating, critical warehouse supplies are running low, and unplanted crop varieties are sitting idle. The farm owner and Uncle Somu call you to the executive boardroom: 'You have mastered basic queries, aggregations, joins, subqueries, CTEs, and relational modeling. Now prove you can synthesize everything to diagnose our vulnerabilities and formulate a bulletproof business turnaround plan!'",
      notebookEntries: [
        { label: "Phase 1: Field Audit", value: "Multi-table status evaluation across active plots" },
        { label: "Phase 2: Risk Analysis", value: "Identify low-stock supplies and immediate supplier contacts" },
        { label: "Phase 3: Market Benchmark", value: "Isolate top-grossing crops exceeding farm-wide averages" },
        { label: "Phase 4: Capstone Pipeline", value: "Multi-CTE strategic turnaround directive with CASE logic" }
      ]
    },
    completion: {
      title: "DATA ANALYTICS PATH COMPLETED!",
      subtitle: "Master of Agricultural Data Science!",
      badge: "🎓 Chief Data Scientist",
      summary: "YOU SAVED THE FARM! By synthesizing multi-table joins, subquery benchmarks, and multi-step CTE business logic, you guided the farm through its greatest crisis and completed the Data Analytics Curriculum!",
      stats: [
        { label: "Curriculum Status", value: "DA Path 100% Complete" },
        { label: "Title Conferred", value: "Chief Data Scientist 🎓" },
        { label: "Full Stack Extension", value: "Unlocked (Levels 18+)" },
        { label: "Grand Cash Prize", value: "+₹10,000" },
        { label: "XP Earned", value: "+2,000 XP" }
      ],
      nextLevelTitle: "Level 18: The Farm's New View (Full Stack)"
    },
    missions: [
      {
        id: "L17_M0",
        title: "ASSESS THE FARM",
        objective: "Query all active growing plots by selecting plot_id, crop_name, market_price, status, and growth_percent from farming joined with crops where status = 'growing' ordered by growth_percent DESC.",
        dialogue: "Uncle Somu: 'Capstone Step 1: evaluate our active growing crops across all field plots sorted by maturity level!'",
        concept: "Field Production Audit (JOIN + WHERE + ORDER BY)",
        hints: [
          "Join farming and crops on crop_id where farming.status = 'growing' ordered by growth_percent DESC.",
          "SELECT f.plot_id, c.crop_name, c.market_price, f.status, f.growth_percent FROM farming f INNER JOIN crops c ON f.crop_id = c.crop_id WHERE f.status = 'growing' ORDER BY f.growth_percent DESC;",
          "SELECT f.plot_id, c.crop_name, c.market_price, f.status, f.growth_percent FROM farming f INNER JOIN crops c ON f.crop_id = c.crop_id WHERE f.status = 'growing' ORDER BY f.growth_percent DESC;"
        ],
        solution: "SELECT f.plot_id, c.crop_name, c.market_price, f.status, f.growth_percent FROM farming f INNER JOIN crops c ON f.crop_id = c.crop_id WHERE f.status = 'growing' ORDER BY f.growth_percent DESC;",
        quickFill: "SELECT f.plot_id, c.crop_name, c.market_price, f.status, f.growth_percent FROM farming f INNER JOIN crops c ON f.crop_id = c.crop_id WHERE f.status = 'growing' ORDER BY f.growth_percent DESC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const growthIdx = cols.findIndex(c => c.includes('growth'));
          if (growthIdx === -1 || rows.length < 2) return false;
          return Number(rows[0][growthIdx]) >= Number(rows[1][growthIdx]);
        }
      },
      {
        id: "L17_M1",
        title: "FIND THE SUPPLY RISK",
        objective: "Identify supply risks: select item_name, category, quantity, supplier_name, and contact from supplies joined with suppliers where quantity < 35 ordered by quantity ASC.",
        dialogue: "Uncle Somu: 'Capstone Step 2: identify warehouse supplies with critically low stock (< 35) and retrieve immediate supplier phone numbers!'",
        concept: "Procurement Shortage Analysis (JOIN + WHERE + ORDER BY)",
        hints: [
          "Join supplies and suppliers where quantity < 35 ordered by quantity ASC.",
          "SELECT s.item_name, s.category, s.quantity, sup.supplier_name, sup.contact FROM supplies s INNER JOIN suppliers sup ON s.supplier_id = sup.supplier_id WHERE s.quantity < 35 ORDER BY s.quantity ASC;",
          "SELECT s.item_name, s.category, s.quantity, sup.supplier_name, sup.contact FROM supplies s INNER JOIN suppliers sup ON s.supplier_id = sup.supplier_id WHERE s.quantity < 35 ORDER BY s.quantity ASC;"
        ],
        solution: "SELECT s.item_name, s.category, s.quantity, sup.supplier_name, sup.contact FROM supplies s INNER JOIN suppliers sup ON s.supplier_id = sup.supplier_id WHERE s.quantity < 35 ORDER BY s.quantity ASC;",
        quickFill: "SELECT s.item_name, s.category, s.quantity, sup.supplier_name, sup.contact FROM supplies s INNER JOIN suppliers sup ON s.supplier_id = sup.supplier_id WHERE s.quantity < 35 ORDER BY s.quantity ASC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const qtyIdx = cols.findIndex(c => c.includes('quantity'));
          if (qtyIdx === -1 || rows.length === 0) return false;
          return rows.every(r => Number(r[qtyIdx]) < 35);
        }
      },
      {
        id: "L17_M2",
        title: "FIND THE MARKET OPPORTUNITY",
        objective: "Find commercial star crops: query crop_name and total_revenue from crops joined with sales having total revenue greater than the average crop revenue across the farm.",
        dialogue: "Uncle Somu: 'Capstone Step 3: which crops are our highest revenue generators? Filter grouped crop revenues against the average crop revenue benchmark!'",
        concept: "Revenue Benchmarking (JOIN + GROUP BY + HAVING Subquery)",
        hints: [
          "Group joined crops and sales by crop_name and use HAVING total_revenue > (subquery).",
          "SELECT c.crop_name, SUM(s.quantity * s.sale_price) AS total_revenue FROM crops c INNER JOIN sales s ON c.crop_id = s.crop_id GROUP BY c.crop_name HAVING SUM(s.quantity * s.sale_price) > (SELECT AVG(crop_rev) FROM (SELECT SUM(quantity * sale_price) AS crop_rev FROM sales GROUP BY crop_id)) ORDER BY total_revenue DESC;",
          "SELECT c.crop_name, SUM(s.quantity * s.sale_price) AS total_revenue FROM crops c INNER JOIN sales s ON c.crop_id = s.crop_id GROUP BY c.crop_name HAVING SUM(s.quantity * s.sale_price) > (SELECT AVG(crop_rev) FROM (SELECT SUM(quantity * sale_price) AS crop_rev FROM sales GROUP BY crop_id)) ORDER BY total_revenue DESC;"
        ],
        solution: "SELECT c.crop_name, SUM(s.quantity * s.sale_price) AS total_revenue FROM crops c INNER JOIN sales s ON c.crop_id = s.crop_id GROUP BY c.crop_name HAVING SUM(s.quantity * s.sale_price) > (SELECT AVG(crop_rev) FROM (SELECT SUM(quantity * sale_price) AS crop_rev FROM sales GROUP BY crop_id)) ORDER BY total_revenue DESC;",
        quickFill: "SELECT c.crop_name, SUM(s.quantity * s.sale_price) AS total_revenue FROM crops c INNER JOIN sales s ON c.crop_id = s.crop_id GROUP BY c.crop_name HAVING SUM(s.quantity * s.sale_price) > (SELECT AVG(crop_rev) FROM (SELECT SUM(quantity * sale_price) AS crop_rev FROM sales GROUP BY crop_id)) ORDER BY total_revenue DESC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length >= 1 && String(rows[0][0]).toLowerCase().includes('wheat');
        }
      },
      {
        id: "L17_M3",
        title: "FIND THE HIDDEN PROBLEM",
        objective: "Identify unutilized crop catalog assets: find crops that have NO active planting assignment in 'farming' using LEFT JOIN and IS NULL.",
        dialogue: "Uncle Somu: 'Capstone Step 4: uncover idle crop varieties in our catalog that have zero active planting records in farming using LEFT JOIN + IS NULL!'",
        concept: "Gap & Underutilization Analysis (LEFT JOIN + IS NULL)",
        hints: [
          "Join crops with farming using LEFT JOIN and filter WHERE f.plot_id IS NULL.",
          "SELECT c.crop_id, c.crop_name, c.market_price FROM crops c LEFT JOIN farming f ON c.crop_id = f.crop_id WHERE f.plot_id IS NULL;",
          "SELECT c.crop_id, c.crop_name, c.market_price FROM crops c LEFT JOIN farming f ON c.crop_id = f.crop_id WHERE f.plot_id IS NULL;"
        ],
        solution: "SELECT c.crop_id, c.crop_name, c.market_price FROM crops c LEFT JOIN farming f ON c.crop_id = f.crop_id WHERE f.plot_id IS NULL;",
        quickFill: "SELECT c.crop_id, c.crop_name, c.market_price FROM crops c LEFT JOIN farming f ON c.crop_id = f.crop_id WHERE f.plot_id IS NULL;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length >= 2; // Corn and Cotton
        }
      },
      {
        id: "L17_M4",
        title: "BUILD THE EXECUTIVE REPORT",
        objective: "Write a CTE 'crop_stats' calculating units_sold and total_revenue, then select crop_name, market_price, units_sold, and total_revenue from crops left joined with crop_stats ordered by total_revenue DESC.",
        dialogue: "Uncle Somu: 'Capstone Step 5: compile our complete crop performance portfolio using a CTE to include all crops (even unsold varieties with 0 revenue)!'",
        concept: "Enterprise CTE Portfolio Analytics",
        hints: [
          "Define crop_stats CTE and left join with crops using COALESCE for zero values, ordered by total_revenue DESC.",
          "WITH crop_stats AS (SELECT crop_id, SUM(quantity) AS units_sold, SUM(quantity * sale_price) AS total_revenue FROM sales GROUP BY crop_id) SELECT c.crop_name, c.market_price, COALESCE(cs.units_sold, 0) AS units_sold, COALESCE(cs.total_revenue, 0) AS total_revenue FROM crops c LEFT JOIN crop_stats cs ON c.crop_id = cs.crop_id ORDER BY total_revenue DESC;",
          "WITH crop_stats AS (\n  SELECT crop_id, SUM(quantity) AS units_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT c.crop_name, c.market_price, COALESCE(cs.units_sold, 0) AS units_sold, COALESCE(cs.total_revenue, 0) AS total_revenue\nFROM crops c\nLEFT JOIN crop_stats cs ON c.crop_id = cs.crop_id\nORDER BY total_revenue DESC;"
        ],
        solution: "WITH crop_stats AS (\n  SELECT crop_id, SUM(quantity) AS units_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT c.crop_name, c.market_price, COALESCE(cs.units_sold, 0) AS units_sold, COALESCE(cs.total_revenue, 0) AS total_revenue\nFROM crops c\nLEFT JOIN crop_stats cs ON c.crop_id = cs.crop_id\nORDER BY total_revenue DESC;",
        quickFill: "WITH crop_stats AS (\n  SELECT crop_id, SUM(quantity) AS units_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT c.crop_name, c.market_price, COALESCE(cs.units_sold, 0) AS units_sold, COALESCE(cs.total_revenue, 0) AS total_revenue\nFROM crops c\nLEFT JOIN crop_stats cs ON c.crop_id = cs.crop_id\nORDER BY total_revenue DESC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length === 5; // All 5 crops
        }
      },
      {
        id: "L17_M5",
        title: "CAN YOU SAVE THE FARM?",
        objective: "Grand Capstone Finale: Chain CTEs ('plot_summary' and 'revenue_summary') joined with 'crops' to produce crop_name, active_plots, total_sold, total_revenue, and a CASE strategic recommendation ('Expand Production' for >= 2000, 'Maintain Production' for > 0, 'Initiate Field Trials' otherwise) ordered by total_revenue DESC.",
        dialogue: "Uncle Somu: 'The Ultimate Challenge! Formulate the definitive Agribusiness Salvation Strategy using chained CTEs and CASE recommendations to secure the farm future!'",
        concept: "Strategic Farm Salvation Directive (Chained CTEs + CASE Logic)",
        hints: [
          "Define plot_summary and revenue_summary CTEs, join with crops, add CASE for recommendations, ordered by total_revenue DESC.",
          "WITH plot_summary AS (SELECT crop_id, COUNT(*) AS active_plots FROM farming GROUP BY crop_id), revenue_summary AS (SELECT crop_id, SUM(quantity) AS total_sold, SUM(quantity * sale_price) AS total_revenue FROM sales GROUP BY crop_id) SELECT c.crop_name, COALESCE(ps.active_plots, 0) AS active_plots, COALESCE(rs.total_sold, 0) AS total_sold, COALESCE(rs.total_revenue, 0) AS total_revenue, CASE WHEN COALESCE(rs.total_revenue, 0) >= 2000 THEN 'Expand Production' WHEN COALESCE(rs.total_revenue, 0) > 0 THEN 'Maintain Production' ELSE 'Initiate Field Trials' END AS strategic_recommendation FROM crops c LEFT JOIN plot_summary ps ON c.crop_id = ps.crop_id LEFT JOIN revenue_summary rs ON c.crop_id = rs.crop_id ORDER BY total_revenue DESC;",
          "WITH plot_summary AS (\n  SELECT crop_id, COUNT(*) AS active_plots\n  FROM farming\n  GROUP BY crop_id\n),\nrevenue_summary AS (\n  SELECT crop_id, SUM(quantity) AS total_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT \n  c.crop_name,\n  COALESCE(ps.active_plots, 0) AS active_plots,\n  COALESCE(rs.total_sold, 0) AS total_sold,\n  COALESCE(rs.total_revenue, 0) AS total_revenue,\n  CASE \n    WHEN COALESCE(rs.total_revenue, 0) >= 2000 THEN 'Expand Production'\n    WHEN COALESCE(rs.total_revenue, 0) > 0 THEN 'Maintain Production'\n    ELSE 'Initiate Field Trials'\n  END AS strategic_recommendation\nFROM crops c\nLEFT JOIN plot_summary ps ON c.crop_id = ps.crop_id\nLEFT JOIN revenue_summary rs ON c.crop_id = rs.crop_id\nORDER BY total_revenue DESC;"
        ],
        solution: "WITH plot_summary AS (\n  SELECT crop_id, COUNT(*) AS active_plots\n  FROM farming\n  GROUP BY crop_id\n),\nrevenue_summary AS (\n  SELECT crop_id, SUM(quantity) AS total_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT \n  c.crop_name,\n  COALESCE(ps.active_plots, 0) AS active_plots,\n  COALESCE(rs.total_sold, 0) AS total_sold,\n  COALESCE(rs.total_revenue, 0) AS total_revenue,\n  CASE \n    WHEN COALESCE(rs.total_revenue, 0) >= 2000 THEN 'Expand Production'\n    WHEN COALESCE(rs.total_revenue, 0) > 0 THEN 'Maintain Production'\n    ELSE 'Initiate Field Trials'\n  END AS strategic_recommendation\nFROM crops c\nLEFT JOIN plot_summary ps ON c.crop_id = ps.crop_id\nLEFT JOIN revenue_summary rs ON c.crop_id = rs.crop_id\nORDER BY total_revenue DESC;",
        quickFill: "WITH plot_summary AS (\n  SELECT crop_id, COUNT(*) AS active_plots\n  FROM farming\n  GROUP BY crop_id\n),\nrevenue_summary AS (\n  SELECT crop_id, SUM(quantity) AS total_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n)\nSELECT \n  c.crop_name,\n  COALESCE(ps.active_plots, 0) AS active_plots,\n  COALESCE(rs.total_sold, 0) AS total_sold,\n  COALESCE(rs.total_revenue, 0) AS total_revenue,\n  CASE \n    WHEN COALESCE(rs.total_revenue, 0) >= 2000 THEN 'Expand Production'\n    WHEN COALESCE(rs.total_revenue, 0) > 0 THEN 'Maintain Production'\n    ELSE 'Initiate Field Trials'\n  END AS strategic_recommendation\nFROM crops c\nLEFT JOIN plot_summary ps ON c.crop_id = ps.crop_id\nLEFT JOIN revenue_summary rs ON c.crop_id = rs.crop_id\nORDER BY total_revenue DESC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.length >= 5 && rows.length === 5 && rows.some(r => String(r[4]).includes('Expand Production'));
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 18: THE FARM'S NEW VIEW
  // ==========================================================
  18: {
    level: 18,
    title: "THE FARM'S NEW VIEW",
    role: "Agribusiness Systems Engineer",
    concept: "Database Views, CREATE VIEW, SELECT FROM View, DROP VIEW, Virtual Table Abstractions",
    teaser: "Encapsulate complex multi-table analytical logic into reusable, virtual database views.",
    cutscene: {
      title: "Chapter 18: Reusable Database Objects",
      image: "/images/cinematics/level4_supplies.jpg",
      duration: 11,
      mood: "smart",
      subtitles: [
        { start: 0, end: 3.5, text: "Having farm managers rewrite long JOIN queries every morning is slow and error-prone." },
        { start: 3.5, end: 7.5, text: "Uncle Somu: 'Save your most valuable analytical queries as virtual database views!'" },
        { start: 7.5, end: 11, text: "Enter Full Stack engineering with CREATE VIEW and modular query abstractions." }
      ]
    },
    storyIntro: {
      headline: "Virtual Tables & Query Encapsulation with Views",
      text: "The farm management team is thrilled with your executive reports. However, typing 10-line multi-table JOINs every time someone needs sales or inventory data is tedious. The owner asks: 'Can we save these useful queries directly in the database as reusable virtual tables?' You enter the Full Stack database curriculum! By mastering CREATE VIEW, SELECT FROM view, and DROP VIEW, you will provide instant, secure data abstractions for the entire farm organization!",
      notebookEntries: [
        { label: "Core Concept", value: "CREATE VIEW view_name AS SELECT ..." },
        { label: "Querying Views", value: "SELECT * FROM view_name WHERE condition;" },
        { label: "Updating Views", value: "DROP VIEW IF EXISTS view_name; CREATE VIEW view_name AS ..." },
        { label: "Benefits", value: "Query reusability, simplified reporting, data security abstraction" }
      ]
    },
    completion: {
      title: "LEVEL 18 COMPLETE",
      subtitle: "Virtual View Engine Activated!",
      badge: "🔭 View Architect",
      summary: "You created modular, reusable database views! By abstracting complex joined queries into virtual tables like v_crop_sales and v_master_farm_dashboard, you streamlined operations for all farm departments.",
      stats: [
        { label: "Views Engineered", value: "CREATE VIEW & DROP VIEW" },
        { label: "Master View", value: "v_master_farm_dashboard" },
        { label: "Path Progress", value: "Full Stack Extension Active" },
        { label: "Cash Bonus", value: "+₹4,000" },
        { label: "XP Earned", value: "+800 XP" }
      ],
      nextLevelTitle: "Level 19: The Safe Transaction"
    },
    missions: [
      {
        id: "L18_M0",
        title: "Create the Farm Sales View",
        objective: "Create a view named 'v_crop_sales' joining crops and sales to display crop_name, quantity, sale_price, (quantity * sale_price) AS sale_value, and sale_date.",
        dialogue: "Uncle Somu: 'Save our sales join query as a reusable view named v_crop_sales using CREATE VIEW!'",
        concept: "CREATE VIEW view_name AS SELECT ...",
        hints: [
          "Use CREATE VIEW v_crop_sales AS SELECT crops.crop_name, sales.quantity, sales.sale_price, (sales.quantity * sales.sale_price) AS sale_value, sales.sale_date FROM crops INNER JOIN sales ON crops.crop_id = sales.crop_id;",
          "CREATE VIEW v_crop_sales AS\nSELECT crops.crop_name, sales.quantity, sales.sale_price, (sales.quantity * sales.sale_price) AS sale_value, sales.sale_date\nFROM crops\nINNER JOIN sales ON crops.crop_id = sales.crop_id;",
          "CREATE VIEW v_crop_sales AS\nSELECT crops.crop_name, sales.quantity, sales.sale_price, (sales.quantity * sales.sale_price) AS sale_value, sales.sale_date\nFROM crops\nINNER JOIN sales ON crops.crop_id = sales.crop_id;"
        ],
        solution: "CREATE VIEW v_crop_sales AS\nSELECT crops.crop_name, sales.quantity, sales.sale_price, (sales.quantity * sales.sale_price) AS sale_value, sales.sale_date\nFROM crops\nINNER JOIN sales ON crops.crop_id = sales.crop_id;",
        quickFill: "CREATE VIEW v_crop_sales AS\nSELECT crops.crop_name, sales.quantity, sales.sale_price, (sales.quantity * sales.sale_price) AS sale_value, sales.sale_date\nFROM crops\nINNER JOIN sales ON crops.crop_id = sales.crop_id;",
        validate: (db) => {
          const res = db.execute("SELECT name FROM sqlite_master WHERE type='view' AND name='v_crop_sales';");
          return res.success && res.results.length > 0 && res.results[0].values.length > 0;
        }
      },
      {
        id: "L18_M1",
        title: "Read the Saved View",
        objective: "Query all columns from 'v_crop_sales' where sale_value >= 1000.",
        dialogue: "Uncle Somu: 'Now query our saved view just like a regular physical table! Select all rows from v_crop_sales where sale_value >= 1000.'",
        concept: "SELECT FROM View with Filtering",
        hints: [
          "Select all columns from v_crop_sales where sale_value >= 1000.",
          "SELECT * FROM v_crop_sales WHERE sale_value >= 1000;",
          "SELECT * FROM v_crop_sales WHERE sale_value >= 1000;"
        ],
        solution: "SELECT * FROM v_crop_sales WHERE sale_value >= 1000;",
        quickFill: "SELECT * FROM v_crop_sales WHERE sale_value >= 1000;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const valIdx = cols.findIndex(c => c.includes('value') || c.includes('sale_value'));
          if (valIdx === -1 || rows.length === 0) return false;
          return rows.every(r => Number(r[valIdx]) >= 1000);
        }
      },
      {
        id: "L18_M2",
        title: "Create the Manager View",
        objective: "Create view 'v_warehouse_inventory' joining supplies and suppliers to display item_name, category, quantity, unit, supplier_name, and contact.",
        dialogue: "Uncle Somu: 'Create a manager view v_warehouse_inventory combining warehouse supplies with vendor contact details!'",
        concept: "Multi-Table Relational View Construction",
        hints: [
          "Create view v_warehouse_inventory joining supplies and suppliers on supplier_id.",
          "CREATE VIEW v_warehouse_inventory AS\nSELECT s.item_name, s.category, s.quantity, s.unit, sup.supplier_name, sup.contact\nFROM supplies s\nINNER JOIN suppliers sup ON s.supplier_id = sup.supplier_id;",
          "CREATE VIEW v_warehouse_inventory AS\nSELECT s.item_name, s.category, s.quantity, s.unit, sup.supplier_name, sup.contact\nFROM supplies s\nINNER JOIN suppliers sup ON s.supplier_id = sup.supplier_id;"
        ],
        solution: "CREATE VIEW v_warehouse_inventory AS\nSELECT s.item_name, s.category, s.quantity, s.unit, sup.supplier_name, sup.contact\nFROM supplies s\nINNER JOIN suppliers sup ON s.supplier_id = sup.supplier_id;",
        quickFill: "CREATE VIEW v_warehouse_inventory AS\nSELECT s.item_name, s.category, s.quantity, s.unit, sup.supplier_name, sup.contact\nFROM supplies s\nINNER JOIN suppliers sup ON s.supplier_id = sup.supplier_id;",
        validate: (db) => {
          const res = db.execute("SELECT name FROM sqlite_master WHERE type='view' AND name='v_warehouse_inventory';");
          return res.success && res.results.length > 0 && res.results[0].values.length > 0;
        }
      },
      {
        id: "L18_M3",
        title: "Filter the View",
        objective: "Query 'v_warehouse_inventory' for items with quantity < 50 ordered by quantity ASC.",
        dialogue: "Uncle Somu: 'Query our view for warehouse restocking: select all items from v_warehouse_inventory where quantity < 50 sorted lowest quantity first!'",
        concept: "View Querying with Sorting & Filtering",
        hints: [
          "Select * from v_warehouse_inventory where quantity < 50 ordered by quantity ASC.",
          "SELECT * FROM v_warehouse_inventory WHERE quantity < 50 ORDER BY quantity ASC;",
          "SELECT * FROM v_warehouse_inventory WHERE quantity < 50 ORDER BY quantity ASC;"
        ],
        solution: "SELECT * FROM v_warehouse_inventory WHERE quantity < 50 ORDER BY quantity ASC;",
        quickFill: "SELECT * FROM v_warehouse_inventory WHERE quantity < 50 ORDER BY quantity ASC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const qtyIdx = cols.findIndex(c => c.includes('quantity'));
          if (qtyIdx === -1 || rows.length < 2) return false;
          return rows.every(r => Number(r[qtyIdx]) < 50);
        }
      },
      {
        id: "L18_M4",
        title: "Update the Farm Report",
        objective: "Drop view 'v_crop_sales' using DROP VIEW IF EXISTS and create the aggregated summary view 'v_crop_sales_summary' calculating total_quantity and total_revenue per crop_name.",
        dialogue: "Uncle Somu: 'When reporting requirements change, update your views! Drop v_crop_sales and create the aggregated summary view v_crop_sales_summary.'",
        concept: "DROP VIEW & Aggregated View Redefinition",
        hints: [
          "Drop v_crop_sales and create view v_crop_sales_summary with GROUP BY crops.crop_name.",
          "DROP VIEW IF EXISTS v_crop_sales;\nCREATE VIEW v_crop_sales_summary AS\nSELECT crops.crop_name, SUM(sales.quantity) AS total_quantity, SUM(sales.quantity * sales.sale_price) AS total_revenue\nFROM crops\nINNER JOIN sales ON crops.crop_id = sales.crop_id\nGROUP BY crops.crop_name;",
          "DROP VIEW IF EXISTS v_crop_sales;\nCREATE VIEW v_crop_sales_summary AS\nSELECT crops.crop_name, SUM(sales.quantity) AS total_quantity, SUM(sales.quantity * sales.sale_price) AS total_revenue\nFROM crops\nINNER JOIN sales ON crops.crop_id = sales.crop_id\nGROUP BY crops.crop_name;"
        ],
        solution: "DROP VIEW IF EXISTS v_crop_sales;\nCREATE VIEW v_crop_sales_summary AS\nSELECT crops.crop_name, SUM(sales.quantity) AS total_quantity, SUM(sales.quantity * sales.sale_price) AS total_revenue\nFROM crops\nINNER JOIN sales ON crops.crop_id = sales.crop_id\nGROUP BY crops.crop_name;",
        quickFill: "DROP VIEW IF EXISTS v_crop_sales;\nCREATE VIEW v_crop_sales_summary AS\nSELECT crops.crop_name, SUM(sales.quantity) AS total_quantity, SUM(sales.quantity * sales.sale_price) AS total_revenue\nFROM crops\nINNER JOIN sales ON crops.crop_id = sales.crop_id\nGROUP BY crops.crop_name;",
        validate: (db) => {
          const res = db.execute("SELECT * FROM v_crop_sales_summary;");
          return res.success && res.results.length > 0 && res.results[0].values.length === 3;
        }
      },
      {
        id: "L18_M5",
        title: "THE FARM DASHBOARD VIEW",
        objective: "Create the master executive view 'v_master_farm_dashboard' combining crop_id, crop_name, market_price, active_plots, total_sold, and total_revenue, then query it ordered by total_revenue DESC.",
        dialogue: "Uncle Somu: 'The grand finale of Chapter 18! Create the permanent master view v_master_farm_dashboard that unifies plots, crop varieties, and total sales into a single reusable object!'",
        concept: "Master Executive View Architecture",
        hints: [
          "Create v_master_farm_dashboard with scalar subqueries for plots and sales, then select from it ordered by total_revenue DESC.",
          "CREATE VIEW v_master_farm_dashboard AS\nSELECT \n  c.crop_id,\n  c.crop_name,\n  c.market_price,\n  (SELECT COUNT(*) FROM farming f WHERE f.crop_id = c.crop_id) AS active_plots,\n  COALESCE((SELECT SUM(s.quantity) FROM sales s WHERE s.crop_id = c.crop_id), 0) AS total_sold,\n  COALESCE((SELECT SUM(s.quantity * s.sale_price) FROM sales s WHERE s.crop_id = c.crop_id), 0) AS total_revenue\nFROM crops c;\n\nSELECT * FROM v_master_farm_dashboard ORDER BY total_revenue DESC;",
          "CREATE VIEW v_master_farm_dashboard AS\nSELECT \n  c.crop_id,\n  c.crop_name,\n  c.market_price,\n  (SELECT COUNT(*) FROM farming f WHERE f.crop_id = c.crop_id) AS active_plots,\n  COALESCE((SELECT SUM(s.quantity) FROM sales s WHERE s.crop_id = c.crop_id), 0) AS total_sold,\n  COALESCE((SELECT SUM(s.quantity * s.sale_price) FROM sales s WHERE s.crop_id = c.crop_id), 0) AS total_revenue\nFROM crops c;\n\nSELECT * FROM v_master_farm_dashboard ORDER BY total_revenue DESC;"
        ],
        solution: "CREATE VIEW v_master_farm_dashboard AS\nSELECT \n  c.crop_id,\n  c.crop_name,\n  c.market_price,\n  (SELECT COUNT(*) FROM farming f WHERE f.crop_id = c.crop_id) AS active_plots,\n  COALESCE((SELECT SUM(s.quantity) FROM sales s WHERE s.crop_id = c.crop_id), 0) AS total_sold,\n  COALESCE((SELECT SUM(s.quantity * s.sale_price) FROM sales s WHERE s.crop_id = c.crop_id), 0) AS total_revenue\nFROM crops c;\n\nSELECT * FROM v_master_farm_dashboard ORDER BY total_revenue DESC;",
        quickFill: "CREATE VIEW v_master_farm_dashboard AS\nSELECT \n  c.crop_id,\n  c.crop_name,\n  c.market_price,\n  (SELECT COUNT(*) FROM farming f WHERE f.crop_id = c.crop_id) AS active_plots,\n  COALESCE((SELECT SUM(s.quantity) FROM sales s WHERE s.crop_id = c.crop_id), 0) AS total_sold,\n  COALESCE((SELECT SUM(s.quantity * s.sale_price) FROM sales s WHERE s.crop_id = c.crop_id), 0) AS total_revenue\nFROM crops c;\n\nSELECT * FROM v_master_farm_dashboard ORDER BY total_revenue DESC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          const revIdx = cols.findIndex(c => c.includes('revenue') || c.includes('total_revenue'));
          return cols.length >= 6 && rows.length === 5 && revIdx !== -1 && Number(rows[0][revIdx]) >= Number(rows[1][revIdx]);
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 19: THE SAFE TRANSACTION
  // ==========================================================
  19: {
    level: 19,
    title: "THE SAFE TRANSACTION",
    role: "Agribusiness Reliability Engineer",
    concept: "Transactions, BEGIN TRANSACTION, COMMIT, ROLLBACK, ACID Guarantees, Atomic Operations",
    teaser: "Guarantee bulletproof data integrity across multi-step farm operations using database transactions.",
    cutscene: {
      title: "Chapter 19: Atomic Operations",
      image: "/images/cinematics/level5_harvest.jpg",
      duration: 11,
      mood: "smart",
      subtitles: [
        { start: 0, end: 3.5, text: "As the farm expands, single business actions touch multiple database tables simultaneously." },
        { start: 3.5, end: 7.5, text: "Uncle Somu: 'If one step fails midway, the database must never be left half-updated!'" },
        { start: 7.5, end: 11, text: "Master BEGIN, COMMIT, and ROLLBACK to guarantee complete ACID transaction safety." }
      ]
    },
    storyIntro: {
      headline: "ACID Guarantees & Transactional Integrity",
      text: "The farm is now processing high-volume multi-step operations: dispatching seed shipments, adjusting warehouse inventories, and writing financial ledger entries. If power fails or an error strikes midway through, the farm could deduct inventory without logging the shipment, creating disastrous discrepancies. Uncle Somu introduces transaction control: 'A transaction ensures all operations succeed together (COMMIT) or any mistake is completely undone (ROLLBACK). Master atomic transactions!'",
      notebookEntries: [
        { label: "Start Transaction", value: "BEGIN TRANSACTION;" },
        { label: "Save Changes", value: "COMMIT; (Makes all changes permanent)" },
        { label: "Cancel & Restore", value: "ROLLBACK; (Undoes all changes back to BEGIN)" },
        { label: "ACID Principle", value: "Atomicity, Consistency, Isolation, Durability" }
      ]
    },
    completion: {
      title: "LEVEL 19 COMPLETE",
      subtitle: "Transactional Integrity Guaranteed!",
      badge: "🛡️ Transaction Guardian",
      summary: "You mastered database transactions! By encapsulating multi-step operations within BEGIN, COMMIT, and ROLLBACK blocks, you provided total ACID data safety for FARMDB's growing enterprise operations.",
      stats: [
        { label: "Control Commands", value: "BEGIN, COMMIT, ROLLBACK" },
        { label: "Integrity Level", value: "100% ACID Guaranteed" },
        { label: "Audit Ledger", value: "farm_audit_ledger Active" },
        { label: "Cash Bonus", value: "+₹5,000" },
        { label: "XP Earned", value: "+1,000 XP" }
      ],
      nextLevelTitle: "Level 20: Upcoming Chapter"
    },
    missions: [
      {
        id: "L19_M0",
        title: "Start a Safe Operation (BEGIN TRANSACTION)",
        objective: "Create table 'vault_staging' and test safe transaction execution using BEGIN TRANSACTION, INSERT, COMMIT, and SELECT.",
        dialogue: "Uncle Somu: 'Welcome to transaction control! Create vault_staging, begin a transaction, insert a record, and commit it to make it permanent.'",
        concept: "BEGIN TRANSACTION ... COMMIT Workflow",
        hints: [
          "Create vault_staging, start transaction with BEGIN TRANSACTION, insert a row, COMMIT, and SELECT.",
          "CREATE TABLE IF NOT EXISTS vault_staging (\n  item_id INTEGER PRIMARY KEY,\n  item_name TEXT,\n  qty INTEGER\n);\nBEGIN TRANSACTION;\nINSERT INTO vault_staging (item_id, item_name, qty) VALUES (1, 'Organic Compost', 100);\nCOMMIT;\nSELECT * FROM vault_staging;",
          "CREATE TABLE IF NOT EXISTS vault_staging (\n  item_id INTEGER PRIMARY KEY,\n  item_name TEXT,\n  qty INTEGER\n);\nBEGIN TRANSACTION;\nINSERT INTO vault_staging (item_id, item_name, qty) VALUES (1, 'Organic Compost', 100);\nCOMMIT;\nSELECT * FROM vault_staging;"
        ],
        solution: "CREATE TABLE IF NOT EXISTS vault_staging (\n  item_id INTEGER PRIMARY KEY,\n  item_name TEXT,\n  qty INTEGER\n);\nBEGIN TRANSACTION;\nINSERT INTO vault_staging (item_id, item_name, qty) VALUES (1, 'Organic Compost', 100);\nCOMMIT;\nSELECT * FROM vault_staging;",
        quickFill: "CREATE TABLE IF NOT EXISTS vault_staging (\n  item_id INTEGER PRIMARY KEY,\n  item_name TEXT,\n  qty INTEGER\n);\nBEGIN TRANSACTION;\nINSERT INTO vault_staging (item_id, item_name, qty) VALUES (1, 'Organic Compost', 100);\nCOMMIT;\nSELECT * FROM vault_staging;",
        validate: (db) => {
          if (!db.tableExists('vault_staging')) return false;
          const data = db.getTableData('vault_staging');
          return data && data.length >= 1;
        }
      },
      {
        id: "L19_M1",
        title: "Commit the Shipment",
        objective: "Execute a safe inventory deduction transaction: BEGIN TRANSACTION, decrease quantity of Fertilizer in supplies by 5, and COMMIT.",
        dialogue: "Uncle Somu: 'Execute an atomic supply dispatch: begin a transaction, deduct 5 units from Fertilizer in supplies, and commit the update!'",
        concept: "Atomic UPDATE with COMMIT",
        hints: [
          "Use BEGIN TRANSACTION, update supplies quantity, and COMMIT.",
          "BEGIN TRANSACTION;\nUPDATE supplies SET quantity = quantity - 5 WHERE category = 'Fertilizer';\nCOMMIT;\nSELECT * FROM supplies WHERE category = 'Fertilizer';",
          "BEGIN TRANSACTION;\nUPDATE supplies SET quantity = quantity - 5 WHERE category = 'Fertilizer';\nCOMMIT;\nSELECT * FROM supplies WHERE category = 'Fertilizer';"
        ],
        solution: "BEGIN TRANSACTION;\nUPDATE supplies SET quantity = quantity - 5 WHERE category = 'Fertilizer';\nCOMMIT;\nSELECT * FROM supplies WHERE category = 'Fertilizer';",
        quickFill: "BEGIN TRANSACTION;\nUPDATE supplies SET quantity = quantity - 5 WHERE category = 'Fertilizer';\nCOMMIT;\nSELECT * FROM supplies WHERE category = 'Fertilizer';",
        validate: (db) => {
          const data = db.getTableData('supplies');
          const fert = data.find(d => String(d.category).toLowerCase() === 'fertilizer');
          return fert && Number(fert.quantity) <= 40;
        }
      },
      {
        id: "L19_M2",
        title: "Cancel a Mistake (ROLLBACK)",
        objective: "Simulate an operator error setting supply quantities to 0 inside a transaction, then execute ROLLBACK to restore data without loss.",
        dialogue: "Uncle Somu: 'An operator ran an accidental query setting all supply quantities to 0 inside a transaction! Issue a ROLLBACK command immediately to restore our data!'",
        concept: "ROLLBACK Data Restoration",
        hints: [
          "Use BEGIN TRANSACTION, set quantity = 0, then ROLLBACK.",
          "BEGIN TRANSACTION;\nUPDATE supplies SET quantity = 0;\nROLLBACK;\nSELECT * FROM supplies;",
          "BEGIN TRANSACTION;\nUPDATE supplies SET quantity = 0;\nROLLBACK;\nSELECT * FROM supplies;"
        ],
        solution: "BEGIN TRANSACTION;\nUPDATE supplies SET quantity = 0;\nROLLBACK;\nSELECT * FROM supplies;",
        quickFill: "BEGIN TRANSACTION;\nUPDATE supplies SET quantity = 0;\nROLLBACK;\nSELECT * FROM supplies;",
        validate: (db) => {
          const data = db.getTableData('supplies');
          return data && data.length >= 3 && data.every(d => Number(d.quantity) > 0);
        }
      },
      {
        id: "L19_M3",
        title: "Protect the Inventory (Multi-Step Transaction)",
        objective: "Create 'inventory_shipments' table, execute an atomic transaction: deduct 5 units from Feed in supplies, insert shipment record into 'inventory_shipments', and COMMIT.",
        dialogue: "Uncle Somu: 'Tie inventory deduction and shipment logging into one atomic transaction: deduct 5 units of Feed and insert a record into inventory_shipments, then commit!'",
        concept: "Multi-Table Atomic Transaction Execution",
        hints: [
          "Create inventory_shipments, start transaction, deduct 5 units from Feed, insert into inventory_shipments, and commit.",
          "CREATE TABLE IF NOT EXISTS inventory_shipments (\n  shipment_id INTEGER PRIMARY KEY,\n  item_name TEXT,\n  qty_shipped INTEGER,\n  ship_date TEXT\n);\nBEGIN TRANSACTION;\nUPDATE supplies SET quantity = quantity - 5 WHERE category = 'Feed';\nINSERT INTO inventory_shipments (shipment_id, item_name, qty_shipped, ship_date) VALUES \n(1, 'Cattle Feed', 5, '2026-09-23');\nCOMMIT;",
          "CREATE TABLE IF NOT EXISTS inventory_shipments (\n  shipment_id INTEGER PRIMARY KEY,\n  item_name TEXT,\n  qty_shipped INTEGER,\n  ship_date TEXT\n);\nBEGIN TRANSACTION;\nUPDATE supplies SET quantity = quantity - 5 WHERE category = 'Feed';\nINSERT INTO inventory_shipments (shipment_id, item_name, qty_shipped, ship_date) VALUES \n(1, 'Cattle Feed', 5, '2026-09-23');\nCOMMIT;"
        ],
        solution: "CREATE TABLE IF NOT EXISTS inventory_shipments (\n  shipment_id INTEGER PRIMARY KEY,\n  item_name TEXT,\n  qty_shipped INTEGER,\n  ship_date TEXT\n);\nBEGIN TRANSACTION;\nUPDATE supplies SET quantity = quantity - 5 WHERE category = 'Feed';\nINSERT INTO inventory_shipments (shipment_id, item_name, qty_shipped, ship_date) VALUES \n(1, 'Cattle Feed', 5, '2026-09-23');\nCOMMIT;",
        quickFill: "CREATE TABLE IF NOT EXISTS inventory_shipments (\n  shipment_id INTEGER PRIMARY KEY,\n  item_name TEXT,\n  qty_shipped INTEGER,\n  ship_date TEXT\n);\nBEGIN TRANSACTION;\nUPDATE supplies SET quantity = quantity - 5 WHERE category = 'Feed';\nINSERT INTO inventory_shipments (shipment_id, item_name, qty_shipped, ship_date) VALUES \n(1, 'Cattle Feed', 5, '2026-09-23');\nCOMMIT;",
        validate: (db) => {
          if (!db.tableExists('inventory_shipments')) return false;
          const data = db.getTableData('inventory_shipments');
          return data && data.length >= 1;
        }
      },
      {
        id: "L19_M4",
        title: "Recover From a Failed Operation",
        objective: "Demonstrate disaster recovery: create 'critical_seed_vault', begin transaction, update stock, then execute ROLLBACK to verify complete fault tolerance.",
        dialogue: "Uncle Somu: 'Demonstrate disaster recovery on our critical seed vault: begin a transaction, simulate a failed operation, and execute ROLLBACK to verify complete data safety!'",
        concept: "Simulated Fault Recovery via ROLLBACK",
        hints: [
          "Create critical_seed_vault, start transaction, modify stock, ROLLBACK, and verify stock remains 50.",
          "CREATE TABLE IF NOT EXISTS critical_seed_vault (\n  vault_id INTEGER PRIMARY KEY,\n  seed_name TEXT,\n  stock INTEGER\n);\nINSERT INTO critical_seed_vault (vault_id, seed_name, stock) VALUES (1, 'Heirloom Wheat', 50);\nBEGIN TRANSACTION;\nUPDATE critical_seed_vault SET stock = stock - 30 WHERE vault_id = 1;\nROLLBACK;\nSELECT * FROM critical_seed_vault WHERE vault_id = 1;",
          "CREATE TABLE IF NOT EXISTS critical_seed_vault (\n  vault_id INTEGER PRIMARY KEY,\n  seed_name TEXT,\n  stock INTEGER\n);\nINSERT INTO critical_seed_vault (vault_id, seed_name, stock) VALUES (1, 'Heirloom Wheat', 50);\nBEGIN TRANSACTION;\nUPDATE critical_seed_vault SET stock = stock - 30 WHERE vault_id = 1;\nROLLBACK;\nSELECT * FROM critical_seed_vault WHERE vault_id = 1;"
        ],
        solution: "CREATE TABLE IF NOT EXISTS critical_seed_vault (\n  vault_id INTEGER PRIMARY KEY,\n  seed_name TEXT,\n  stock INTEGER\n);\nINSERT INTO critical_seed_vault (vault_id, seed_name, stock) VALUES (1, 'Heirloom Wheat', 50);\nBEGIN TRANSACTION;\nUPDATE critical_seed_vault SET stock = stock - 30 WHERE vault_id = 1;\nROLLBACK;\nSELECT * FROM critical_seed_vault WHERE vault_id = 1;",
        quickFill: "CREATE TABLE IF NOT EXISTS critical_seed_vault (\n  vault_id INTEGER PRIMARY KEY,\n  seed_name TEXT,\n  stock INTEGER\n);\nINSERT INTO critical_seed_vault (vault_id, seed_name, stock) VALUES (1, 'Heirloom Wheat', 50);\nBEGIN TRANSACTION;\nUPDATE critical_seed_vault SET stock = stock - 30 WHERE vault_id = 1;\nROLLBACK;\nSELECT * FROM critical_seed_vault WHERE vault_id = 1;",
        validate: (db) => {
          if (!db.tableExists('critical_seed_vault')) return false;
          const data = db.getTableData('critical_seed_vault');
          return data && data.length >= 1 && Number(data[0].stock) === 50;
        }
      },
      {
        id: "L19_M5",
        title: "THE SAFE FARM OPERATION",
        objective: "Grand finale of Level 19: Execute the complete farm transaction workflow: create 'farm_audit_ledger', begin transaction, expand Grain Silo capacity by +200 in 'facility_registry', insert audit record into 'farm_audit_ledger', and COMMIT.",
        dialogue: "Uncle Somu: 'Grand finale of Chapter 19! Execute the master multi-table transaction that expands facility capacity and logs an audit ledger entry with complete ACID transactional integrity!'",
        concept: "Master Multi-Table Enterprise Transaction",
        hints: [
          "Create farm_audit_ledger, start transaction, update facility_registry capacity, insert audit record, and COMMIT.",
          "CREATE TABLE IF NOT EXISTS farm_audit_ledger (\n  entry_id INTEGER PRIMARY KEY,\n  action_type TEXT,\n  details TEXT,\n  timestamp TEXT\n);\nBEGIN TRANSACTION;\nUPDATE facility_registry SET capacity = capacity + 200 WHERE facility_name = 'Grain Silo';\nINSERT INTO farm_audit_ledger (entry_id, action_type, details, timestamp) VALUES \n(1, 'CAPACITY_EXPANSION', 'Grain Silo expanded by +200 MT', '2026-09-23 12:00:00');\nCOMMIT;\nSELECT * FROM farm_audit_ledger;",
          "CREATE TABLE IF NOT EXISTS farm_audit_ledger (\n  entry_id INTEGER PRIMARY KEY,\n  action_type TEXT,\n  details TEXT,\n  timestamp TEXT\n);\nBEGIN TRANSACTION;\nUPDATE facility_registry SET capacity = capacity + 200 WHERE facility_name = 'Grain Silo';\nINSERT INTO farm_audit_ledger (entry_id, action_type, details, timestamp) VALUES \n(1, 'CAPACITY_EXPANSION', 'Grain Silo expanded by +200 MT', '2026-09-23 12:00:00');\nCOMMIT;\nSELECT * FROM farm_audit_ledger;"
        ],
        solution: "CREATE TABLE IF NOT EXISTS farm_audit_ledger (\n  entry_id INTEGER PRIMARY KEY,\n  action_type TEXT,\n  details TEXT,\n  timestamp TEXT\n);\nBEGIN TRANSACTION;\nUPDATE facility_registry SET capacity = capacity + 200 WHERE facility_name = 'Grain Silo';\nINSERT INTO farm_audit_ledger (entry_id, action_type, details, timestamp) VALUES \n(1, 'CAPACITY_EXPANSION', 'Grain Silo expanded by +200 MT', '2026-09-23 12:00:00');\nCOMMIT;\nSELECT * FROM farm_audit_ledger;",
        quickFill: "CREATE TABLE IF NOT EXISTS farm_audit_ledger (\n  entry_id INTEGER PRIMARY KEY,\n  action_type TEXT,\n  details TEXT,\n  timestamp TEXT\n);\nBEGIN TRANSACTION;\nUPDATE facility_registry SET capacity = capacity + 200 WHERE facility_name = 'Grain Silo';\nINSERT INTO farm_audit_ledger (entry_id, action_type, details, timestamp) VALUES \n(1, 'CAPACITY_EXPANSION', 'Grain Silo expanded by +200 MT', '2026-09-23 12:00:00');\nCOMMIT;\nSELECT * FROM farm_audit_ledger;",
        validate: (db) => {
          if (!db.tableExists('farm_audit_ledger')) return false;
          const audit = db.getTableData('farm_audit_ledger');
          const fac = db.getTableData('facility_registry');
          const silo = fac.find(f => String(f.facility_name).includes('Grain Silo'));
          return audit && audit.length >= 1 && silo && Number(silo.capacity) >= 1400;
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 20: THE FARM'S AUTOMATIC DEFENSE
  // ==========================================================
  20: {
    level: 20,
    title: "THE FARM'S AUTOMATIC DEFENSE",
    role: "Farm Database Administrator",
    concept: "Database Triggers, CREATE TRIGGER, BEFORE/AFTER, Event Auditing, Invariant Validation",
    teaser: "Arm the farm database with autonomous triggers that log audits and enforce data integrity.",
    cutscene: {
      title: "Chapter 20: The Farm's Automatic Defense",
      image: "/images/cinematics/level5_harvest.jpg",
      duration: 11,
      mood: "alert",
      subtitles: [
        { start: 0, end: 3.5, text: "The farm has grown into a bustling agricultural hub with dozens of active operations." },
        { start: 3.5, end: 7.5, text: "Uncle Somu: 'Manual monitoring cannot catch every operator mistake. We need the database to defend itself!'" },
        { start: 7.5, end: 11, text: "Deploy database triggers to automate audit logging and block invalid updates autonomously." }
      ]
    },
    storyIntro: {
      headline: "Autonomous Database Defense & Audit Trails",
      text: "As agricultural operations scale, human errors inevitably occur: an operator accidentally updates inventory with negative stock, or changes warehouse quantities without leaving an audit trail. As Farm Database Administrator, you will construct autonomous SQLite database triggers—using CREATE TRIGGER with BEFORE/AFTER and INSERT/UPDATE events—ensuring that every data change is tracked and validated automatically!",
      notebookEntries: [
        { label: "Trigger Architecture", value: "CREATE TRIGGER trg_name [BEFORE|AFTER] [INSERT|UPDATE|DELETE] ON table" },
        { label: "Row Transition Variables", value: "NEW (post-operation values) and OLD (pre-operation values)" },
        { label: "Audit Logging", value: "AFTER INSERT/UPDATE -> INSERT INTO audit_table" },
        { label: "Invariant Enforcement", value: "BEFORE UPDATE WHEN NEW.col < 0 -> SELECT RAISE(ABORT, 'msg')" }
      ]
    },
    completion: {
      title: "LEVEL 20 COMPLETE",
      subtitle: "Autonomous Trigger Defense Active!",
      badge: "🛡️ Trigger Guardian",
      summary: "You constructed autonomous trigger defenses across the farm database! Every stock adjustment and inventory arrival is now logged to audit ledgers automatically, and invalid negative quantities are instantly blocked.",
      stats: [
        { label: "Triggers Deployed", value: "Audit & Validation Triggers" },
        { label: "Audit Trails", value: "inventory_audit & stock_history" },
        { label: "Data Invariant", value: "Negative Stock Blocked" },
        { label: "Cash Bonus", value: "+₹3,500" },
        { label: "XP Earned", value: "+800 XP" }
      ],
      nextLevelTitle: "Level 21: The Farm's Automation Office"
    },
    missions: [
      {
        id: "L20_M0",
        title: "Inspect the Trigger System",
        objective: "Query sqlite_master to inspect existing system triggers and trigger definitions on the farm database.",
        dialogue: "Uncle Somu: 'Before writing new triggers, inspect sqlite_master to review active triggers registered in our database schema!'",
        concept: "Trigger Catalog Inspection via sqlite_master",
        hints: [
          "Select type, name, tbl_name, and sql from sqlite_master where type = 'trigger'.",
          "SELECT type, name, tbl_name, sql FROM sqlite_master WHERE type = 'trigger';",
          "SELECT type, name, tbl_name, sql FROM sqlite_master WHERE type = 'trigger';"
        ],
        solution: "SELECT type, name, tbl_name, sql FROM sqlite_master WHERE type = 'trigger';",
        quickFill: "SELECT type, name, tbl_name, sql FROM sqlite_master WHERE type = 'trigger';",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('name') && cols.includes('type');
        }
      },
      {
        id: "L20_M1",
        title: "Audit New Seed Inventory (AFTER INSERT)",
        objective: "Create 'inventory_audit' table and an AFTER INSERT trigger on 'seeds' to automatically log new seed additions.",
        dialogue: "Uncle Somu: 'Whenever a new seed variety is added to our seed catalog, we need an automatic log entry! Create the inventory_audit table and an AFTER INSERT trigger on seeds!'",
        concept: "AFTER INSERT Trigger & Audit Logging",
        hints: [
          "Create table inventory_audit and create trigger trg_audit_seeds_insert AFTER INSERT ON seeds.",
          "CREATE TABLE IF NOT EXISTS inventory_audit (\n  audit_id INTEGER PRIMARY KEY,\n  item_name TEXT,\n  action_type TEXT,\n  logged_at TEXT\n);\n\nCREATE TRIGGER IF NOT EXISTS trg_audit_seeds_insert\nAFTER INSERT ON seeds\nFOR EACH ROW\nBEGIN\n  INSERT INTO inventory_audit (item_name, action_type, logged_at)\n  VALUES (NEW.seed_name, 'NEW_SEED_ADDED', '2026-09-23');\nEND;",
          "CREATE TABLE IF NOT EXISTS inventory_audit (\n  audit_id INTEGER PRIMARY KEY,\n  item_name TEXT,\n  action_type TEXT,\n  logged_at TEXT\n);\n\nCREATE TRIGGER IF NOT EXISTS trg_audit_seeds_insert\nAFTER INSERT ON seeds\nFOR EACH ROW\nBEGIN\n  INSERT INTO inventory_audit (item_name, action_type, logged_at)\n  VALUES (NEW.seed_name, 'NEW_SEED_ADDED', '2026-09-23');\nEND;"
        ],
        solution: "CREATE TABLE IF NOT EXISTS inventory_audit (\n  audit_id INTEGER PRIMARY KEY,\n  item_name TEXT,\n  action_type TEXT,\n  logged_at TEXT\n);\n\nCREATE TRIGGER IF NOT EXISTS trg_audit_seeds_insert\nAFTER INSERT ON seeds\nFOR EACH ROW\nBEGIN\n  INSERT INTO inventory_audit (item_name, action_type, logged_at)\n  VALUES (NEW.seed_name, 'NEW_SEED_ADDED', '2026-09-23');\nEND;",
        quickFill: "CREATE TABLE IF NOT EXISTS inventory_audit (\n  audit_id INTEGER PRIMARY KEY,\n  item_name TEXT,\n  action_type TEXT,\n  logged_at TEXT\n);\n\nCREATE TRIGGER IF NOT EXISTS trg_audit_seeds_insert\nAFTER INSERT ON seeds\nFOR EACH ROW\nBEGIN\n  INSERT INTO inventory_audit (item_name, action_type, logged_at)\n  VALUES (NEW.seed_name, 'NEW_SEED_ADDED', '2026-09-23');\nEND;",
        validate: (db) => {
          return db.tableExists('inventory_audit') && db.triggerExists('trg_audit_seeds_insert');
        }
      },
      {
        id: "L20_M2",
        title: "Track Stock Level Fluctuations (AFTER UPDATE)",
        objective: "Create 'stock_history' table and an AFTER UPDATE trigger on 'supplies' to record previous and new supply quantities.",
        dialogue: "Uncle Somu: 'When warehouse supply counts change, we must record the old and new quantities with a timestamp. Create stock_history and trigger trg_audit_supplies_update on supplies!'",
        concept: "AFTER UPDATE Trigger with OLD and NEW Transition Variables",
        hints: [
          "Create stock_history table and create trigger trg_audit_supplies_update AFTER UPDATE ON supplies.",
          "CREATE TABLE IF NOT EXISTS stock_history (\n  history_id INTEGER PRIMARY KEY,\n  item_id INTEGER,\n  old_qty INTEGER,\n  new_qty INTEGER,\n  change_date TEXT\n);\n\nCREATE TRIGGER IF NOT EXISTS trg_audit_supplies_update\nAFTER UPDATE ON supplies\nFOR EACH ROW\nBEGIN\n  INSERT INTO stock_history (item_id, old_qty, new_qty, change_date)\n  VALUES (OLD.supply_id, OLD.quantity, NEW.quantity, '2026-09-23');\nEND;",
          "CREATE TABLE IF NOT EXISTS stock_history (\n  history_id INTEGER PRIMARY KEY,\n  item_id INTEGER,\n  old_qty INTEGER,\n  new_qty INTEGER,\n  change_date TEXT\n);\n\nCREATE TRIGGER IF NOT EXISTS trg_audit_supplies_update\nAFTER UPDATE ON supplies\nFOR EACH ROW\nBEGIN\n  INSERT INTO stock_history (item_id, old_qty, new_qty, change_date)\n  VALUES (OLD.supply_id, OLD.quantity, NEW.quantity, '2026-09-23');\nEND;"
        ],
        solution: "CREATE TABLE IF NOT EXISTS stock_history (\n  history_id INTEGER PRIMARY KEY,\n  item_id INTEGER,\n  old_qty INTEGER,\n  new_qty INTEGER,\n  change_date TEXT\n);\n\nCREATE TRIGGER IF NOT EXISTS trg_audit_supplies_update\nAFTER UPDATE ON supplies\nFOR EACH ROW\nBEGIN\n  INSERT INTO stock_history (item_id, old_qty, new_qty, change_date)\n  VALUES (OLD.supply_id, OLD.quantity, NEW.quantity, '2026-09-23');\nEND;",
        quickFill: "CREATE TABLE IF NOT EXISTS stock_history (\n  history_id INTEGER PRIMARY KEY,\n  item_id INTEGER,\n  old_qty INTEGER,\n  new_qty INTEGER,\n  change_date TEXT\n);\n\nCREATE TRIGGER IF NOT EXISTS trg_audit_supplies_update\nAFTER UPDATE ON supplies\nFOR EACH ROW\nBEGIN\n  INSERT INTO stock_history (item_id, old_qty, new_qty, change_date)\n  VALUES (OLD.supply_id, OLD.quantity, NEW.quantity, '2026-09-23');\nEND;",
        validate: (db) => {
          return db.tableExists('stock_history') && db.triggerExists('trg_audit_supplies_update');
        }
      },
      {
        id: "L20_M3",
        title: "Prevent Negative Supplies (BEFORE UPDATE Validation)",
        objective: "Create a BEFORE UPDATE trigger on 'supplies' that aborts any update attempting to set quantity < 0.",
        dialogue: "Uncle Somu: 'Our warehouse cannot hold negative stock! Build a BEFORE UPDATE validation trigger using RAISE(ABORT, ...) to block negative quantities!'",
        concept: "BEFORE UPDATE Trigger with WHEN Condition and RAISE(ABORT)",
        hints: [
          "Create trigger trg_prevent_negative_supplies BEFORE UPDATE ON supplies FOR EACH ROW WHEN NEW.quantity < 0.",
          "CREATE TRIGGER IF NOT EXISTS trg_prevent_negative_supplies\nBEFORE UPDATE ON supplies\nFOR EACH ROW\nWHEN NEW.quantity < 0\nBEGIN\n  SELECT RAISE(ABORT, 'Supply quantity cannot be negative!');\nEND;",
          "CREATE TRIGGER IF NOT EXISTS trg_prevent_negative_supplies\nBEFORE UPDATE ON supplies\nFOR EACH ROW\nWHEN NEW.quantity < 0\nBEGIN\n  SELECT RAISE(ABORT, 'Supply quantity cannot be negative!');\nEND;"
        ],
        solution: "CREATE TRIGGER IF NOT EXISTS trg_prevent_negative_supplies\nBEFORE UPDATE ON supplies\nFOR EACH ROW\nWHEN NEW.quantity < 0\nBEGIN\n  SELECT RAISE(ABORT, 'Supply quantity cannot be negative!');\nEND;",
        quickFill: "CREATE TRIGGER IF NOT EXISTS trg_prevent_negative_supplies\nBEFORE UPDATE ON supplies\nFOR EACH ROW\nWHEN NEW.quantity < 0\nBEGIN\n  SELECT RAISE(ABORT, 'Supply quantity cannot be negative!');\nEND;",
        validate: (db) => {
          return db.triggerExists('trg_prevent_negative_supplies');
        }
      },
      {
        id: "L20_M4",
        title: "Trigger the Audit Engine",
        objective: "Test automated trigger execution: insert 'Sunflower' into 'seeds' and update 'supplies' quantity for item 1 to 45.",
        dialogue: "Uncle Somu: 'Now let us test our trigger engine in action: insert Sunflower seeds and update supplies item 1 to 45 units, then verify that audit records were generated automatically!'",
        concept: "Autonomous Event Trigger Execution Verification",
        hints: [
          "Insert into seeds ('Sunflower') and update supplies set quantity = 45 where supply_id = 1.",
          "INSERT INTO seeds (seed_id, seed_name, quantity, price) VALUES (4, 'Sunflower', 40, 18);\nUPDATE supplies SET quantity = 45 WHERE supply_id = 1;\nSELECT * FROM inventory_audit;\nSELECT * FROM stock_history;",
          "INSERT INTO seeds (seed_id, seed_name, quantity, price) VALUES (4, 'Sunflower', 40, 18);\nUPDATE supplies SET quantity = 45 WHERE supply_id = 1;\nSELECT * FROM inventory_audit;\nSELECT * FROM stock_history;"
        ],
        solution: "INSERT INTO seeds (seed_id, seed_name, quantity, price) VALUES (4, 'Sunflower', 40, 18);\nUPDATE supplies SET quantity = 45 WHERE supply_id = 1;\nSELECT * FROM inventory_audit;\nSELECT * FROM stock_history;",
        quickFill: "INSERT INTO seeds (seed_id, seed_name, quantity, price) VALUES (4, 'Sunflower', 40, 18);\nUPDATE supplies SET quantity = 45 WHERE supply_id = 1;\nSELECT * FROM inventory_audit;\nSELECT * FROM stock_history;",
        validate: (db) => {
          const seeds = db.getTableData('seeds');
          const hasSunflower = seeds.some(s => String(s.seed_name).toLowerCase().includes('sunflower'));
          const audit = db.getTableData('inventory_audit');
          const history = db.getTableData('stock_history');
          return hasSunflower && audit.length >= 1 && history.length >= 1;
        }
      },
      {
        id: "L20_M5",
        title: "THE FARM'S AUTOMATIC DEFENSE",
        objective: "Grand finale of Level 20: Create 'animal_health_alerts' table, build trigger 'trg_check_cattle_health' AFTER UPDATE ON 'animals' WHEN NEW.health = 'Sick', and test by updating animal 1 health to 'Sick'.",
        dialogue: "Uncle Somu: 'Grand finale of Chapter 20! Create the animal_health_alerts table and a trigger that automatically sounds an alarm when cattle health is marked as Sick, then test it!'",
        concept: "Master Automated Health Alert Trigger Workflow",
        hints: [
          "Create animal_health_alerts, create trigger trg_check_cattle_health AFTER UPDATE ON animals WHEN NEW.health = 'Sick', and update animal health to 'Sick'.",
          "CREATE TABLE IF NOT EXISTS animal_health_alerts (\n  alert_id INTEGER PRIMARY KEY,\n  animal_name TEXT,\n  alert_msg TEXT,\n  recorded_at TEXT\n);\n\nCREATE TRIGGER IF NOT EXISTS trg_check_cattle_health\nAFTER UPDATE ON animals\nFOR EACH ROW\nWHEN NEW.health = 'Sick'\nBEGIN\n  INSERT INTO animal_health_alerts (animal_name, alert_msg, recorded_at)\n  VALUES (NEW.name, 'CRITICAL_HEALTH_DROP', '2026-09-23');\nEND;\n\nUPDATE animals SET health = 'Sick' WHERE animal_id = 1;\nSELECT * FROM animal_health_alerts;",
          "CREATE TABLE IF NOT EXISTS animal_health_alerts (\n  alert_id INTEGER PRIMARY KEY,\n  animal_name TEXT,\n  alert_msg TEXT,\n  recorded_at TEXT\n);\n\nCREATE TRIGGER IF NOT EXISTS trg_check_cattle_health\nAFTER UPDATE ON animals\nFOR EACH ROW\nWHEN NEW.health = 'Sick'\nBEGIN\n  INSERT INTO animal_health_alerts (animal_name, alert_msg, recorded_at)\n  VALUES (NEW.name, 'CRITICAL_HEALTH_DROP', '2026-09-23');\nEND;\n\nUPDATE animals SET health = 'Sick' WHERE animal_id = 1;\nSELECT * FROM animal_health_alerts;"
        ],
        solution: "CREATE TABLE IF NOT EXISTS animal_health_alerts (\n  alert_id INTEGER PRIMARY KEY,\n  animal_name TEXT,\n  alert_msg TEXT,\n  recorded_at TEXT\n);\n\nCREATE TRIGGER IF NOT EXISTS trg_check_cattle_health\nAFTER UPDATE ON animals\nFOR EACH ROW\nWHEN NEW.health = 'Sick'\nBEGIN\n  INSERT INTO animal_health_alerts (animal_name, alert_msg, recorded_at)\n  VALUES (NEW.name, 'CRITICAL_HEALTH_DROP', '2026-09-23');\nEND;\n\nUPDATE animals SET health = 'Sick' WHERE animal_id = 1;\nSELECT * FROM animal_health_alerts;",
        quickFill: "CREATE TABLE IF NOT EXISTS animal_health_alerts (\n  alert_id INTEGER PRIMARY KEY,\n  animal_name TEXT,\n  alert_msg TEXT,\n  recorded_at TEXT\n);\n\nCREATE TRIGGER IF NOT EXISTS trg_check_cattle_health\nAFTER UPDATE ON animals\nFOR EACH ROW\nWHEN NEW.health = 'Sick'\nBEGIN\n  INSERT INTO animal_health_alerts (animal_name, alert_msg, recorded_at)\n  VALUES (NEW.name, 'CRITICAL_HEALTH_DROP', '2026-09-23');\nEND;\n\nUPDATE animals SET health = 'Sick' WHERE animal_id = 1;\nSELECT * FROM animal_health_alerts;",
        validate: (db) => {
          if (!db.tableExists('animal_health_alerts')) return false;
          if (!db.triggerExists('trg_check_cattle_health')) return false;
          const alerts = db.getTableData('animal_health_alerts');
          return alerts && alerts.length >= 1;
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 21: THE FARM'S AUTOMATION OFFICE
  // ==========================================================
  21: {
    level: 21,
    title: "THE FARM'S AUTOMATION OFFICE",
    role: "Farm Automation Engineer",
    concept: "Stored Procedures, CREATE PROCEDURE, CALL, IN Parameters, Reusable Database Logic",
    teaser: "Encapsulate repetitive farm reporting queries into reusable, parameterized stored procedures.",
    cutscene: {
      title: "Chapter 21: The Farm's Automation Office",
      image: "/images/cinematics/level5_harvest.jpg",
      duration: 11,
      mood: "efficient",
      subtitles: [
        { start: 0, end: 3.5, text: "Field managers and warehouse staff repeatedly request identical SQL queries throughout the day." },
        { start: 3.5, end: 7.5, text: "Uncle Somu: 'Typing the same complex query ten times a day is a waste of farmer energy!'" },
        { start: 7.5, end: 11, text: "Build reusable stored procedures to automate farm intelligence with single CALL commands." }
      ]
    },
    storyIntro: {
      headline: "Reusable SQL Routines & Enterprise Automation",
      text: "As operations grow, farm executives need standardized, reliable reports without manually writing multi-line SQL queries every time. Stored procedures allow database architects to encapsulate complex logic, queries, and aggregations directly on the database server. Using CREATE PROCEDURE with IN parameters and executing routines via CALL, you will establish FARMDB's automated intelligence office!",
      notebookEntries: [
        { label: "Stored Procedure Definition", value: "CREATE PROCEDURE proc_name(IN param_name TYPE) BEGIN ... END;" },
        { label: "Execution Command", value: "CALL proc_name(arguments);" },
        { label: "Parameter Types", value: "IN (Input argument passed into procedure)" },
        { label: "FARMDB Compatibility", value: "Executed via FARMDB Stored Procedure Simulation Layer (MySQL Standard)" }
      ]
    },
    completion: {
      title: "LEVEL 21 COMPLETE",
      subtitle: "Farm Automation Office Online!",
      badge: "⚙️ Automation Engineer",
      summary: "You created modular stored procedures across the farm! Standard operational reports, low-stock alerts, and sales aggregations can now be invoked instantly with single CALL statements.",
      stats: [
        { label: "Procedures Deployed", value: "GetFarmCrops, GetLowSupplies, GetCropSalesSummary" },
        { label: "Parameter Support", value: "IN (Dynamic Thresholds)" },
        { label: "Execution Engine", value: "FARMDB MySQL-Compatible Procedure Engine" },
        { label: "Cash Bonus", value: "+₹3,800" },
        { label: "XP Earned", value: "+900 XP" }
      ],
      nextLevelTitle: "Level 22: The Farm's Security Gate"
    },
    missions: [
      {
        id: "L21_M0",
        title: "Inspect Farm Automation Needs",
        objective: "Inspect the automation office by querying registered stored procedures using SHOW PROCEDURES;.",
        dialogue: "Uncle Somu: 'Check our automation registry to review currently registered stored procedures!'",
        concept: "SHOW PROCEDURES Routine Inspection",
        hints: [
          "Execute SHOW PROCEDURES; to inspect active database routines.",
          "SHOW PROCEDURES;",
          "SHOW PROCEDURES;"
        ],
        solution: "SHOW PROCEDURES;",
        quickFill: "SHOW PROCEDURES;",
        validate: (db, queryResult) => {
          return queryResult && queryResult.success;
        }
      },
      {
        id: "L21_M1",
        title: "Create the Crop Catalog Procedure",
        objective: "Create stored procedure 'GetFarmCrops()' that selects all records from 'crops' ordered by crop_id ASC.",
        dialogue: "Uncle Somu: 'Create our first stored procedure, GetFarmCrops(), to select all crops sorted by crop_id ASC!'",
        concept: "CREATE PROCEDURE without Parameters",
        hints: [
          "Use CREATE PROCEDURE GetFarmCrops() BEGIN SELECT * FROM crops ORDER BY crop_id ASC; END;",
          "CREATE PROCEDURE GetFarmCrops()\nBEGIN\n  SELECT * FROM crops ORDER BY crop_id ASC;\nEND;",
          "CREATE PROCEDURE GetFarmCrops()\nBEGIN\n  SELECT * FROM crops ORDER BY crop_id ASC;\nEND;"
        ],
        solution: "CREATE PROCEDURE GetFarmCrops()\nBEGIN\n  SELECT * FROM crops ORDER BY crop_id ASC;\nEND;",
        quickFill: "CREATE PROCEDURE GetFarmCrops()\nBEGIN\n  SELECT * FROM crops ORDER BY crop_id ASC;\nEND;",
        validate: (db) => {
          return db.procedureExists('GetFarmCrops');
        }
      },
      {
        id: "L21_M2",
        title: "Create Parameterized Low-Stock Routine",
        objective: "Create stored procedure 'GetLowSupplies(IN min_qty INT)' that selects item_name, category, and quantity from 'supplies' WHERE quantity < min_qty.",
        dialogue: "Uncle Somu: 'Now build a parameterized routine: GetLowSupplies(IN min_qty INT) to retrieve supplies below any requested stock threshold!'",
        concept: "CREATE PROCEDURE with IN Parameter",
        hints: [
          "Define procedure GetLowSupplies with IN min_qty INT parameter.",
          "CREATE PROCEDURE GetLowSupplies(IN min_qty INT)\nBEGIN\n  SELECT item_name, category, quantity FROM supplies WHERE quantity < min_qty;\nEND;",
          "CREATE PROCEDURE GetLowSupplies(IN min_qty INT)\nBEGIN\n  SELECT item_name, category, quantity FROM supplies WHERE quantity < min_qty;\nEND;"
        ],
        solution: "CREATE PROCEDURE GetLowSupplies(IN min_qty INT)\nBEGIN\n  SELECT item_name, category, quantity FROM supplies WHERE quantity < min_qty;\nEND;",
        quickFill: "CREATE PROCEDURE GetLowSupplies(IN min_qty INT)\nBEGIN\n  SELECT item_name, category, quantity FROM supplies WHERE quantity < min_qty;\nEND;",
        validate: (db) => {
          return db.procedureExists('GetLowSupplies');
        }
      },
      {
        id: "L21_M3",
        title: "Call the Low-Stock Routine",
        objective: "Execute stored procedure 'GetLowSupplies' with a threshold of 30 units: CALL GetLowSupplies(30);.",
        dialogue: "Uncle Somu: 'Invoke our new stored procedure to pull all supplies currently below 30 units: CALL GetLowSupplies(30);!'",
        concept: "CALL Statement Execution",
        hints: [
          "Execute CALL GetLowSupplies(30);",
          "CALL GetLowSupplies(30);",
          "CALL GetLowSupplies(30);"
        ],
        solution: "CALL GetLowSupplies(30);",
        quickFill: "CALL GetLowSupplies(30);",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length >= 1;
        }
      },
      {
        id: "L21_M4",
        title: "Create Sales Aggregation Procedure",
        objective: "Create stored procedure 'GetCropSalesSummary(IN min_price INT)' that selects crop_id, SUM(quantity) AS total_sold, and SUM(quantity * sale_price) AS total_revenue from 'sales' WHERE sale_price >= min_price GROUP BY crop_id.",
        dialogue: "Uncle Somu: 'Create an analytical procedure GetCropSalesSummary(IN min_price INT) to aggregate sales volume and total revenue for transactions meeting a minimum price!'",
        concept: "Stored Procedure with GROUP BY and Aggregations",
        hints: [
          "Create GetCropSalesSummary with IN min_price INT grouping by crop_id.",
          "CREATE PROCEDURE GetCropSalesSummary(IN min_price INT)\nBEGIN\n  SELECT crop_id, SUM(quantity) AS total_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  WHERE sale_price >= min_price\n  GROUP BY crop_id;\nEND;",
          "CREATE PROCEDURE GetCropSalesSummary(IN min_price INT)\nBEGIN\n  SELECT crop_id, SUM(quantity) AS total_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  WHERE sale_price >= min_price\n  GROUP BY crop_id;\nEND;"
        ],
        solution: "CREATE PROCEDURE GetCropSalesSummary(IN min_price INT)\nBEGIN\n  SELECT crop_id, SUM(quantity) AS total_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  WHERE sale_price >= min_price\n  GROUP BY crop_id;\nEND;",
        quickFill: "CREATE PROCEDURE GetCropSalesSummary(IN min_price INT)\nBEGIN\n  SELECT crop_id, SUM(quantity) AS total_sold, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  WHERE sale_price >= min_price\n  GROUP BY crop_id;\nEND;",
        validate: (db) => {
          return db.procedureExists('GetCropSalesSummary');
        }
      },
      {
        id: "L21_M5",
        title: "THE MASTER FARM AUTOMATION ROUTINE",
        objective: "Grand finale of Level 21: Create 'GetExecutiveFarmOverview(IN min_stock INT)' joining 'supplies' and 'suppliers' WHERE supplies.quantity >= min_stock, then execute CALL GetExecutiveFarmOverview(20);.",
        dialogue: "Uncle Somu: 'Grand finale of Chapter 21! Create the master executive supplier procedure GetExecutiveFarmOverview(IN min_stock INT) and execute it with threshold 20!'",
        concept: "Enterprise Relational Stored Procedure & Execution",
        hints: [
          "Create GetExecutiveFarmOverview joining supplies and suppliers, then execute CALL GetExecutiveFarmOverview(20);",
          "CREATE PROCEDURE GetExecutiveFarmOverview(IN min_stock INT)\nBEGIN\n  SELECT supplies.item_name, supplies.quantity, suppliers.supplier_name, suppliers.contact\n  FROM supplies\n  INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id\n  WHERE supplies.quantity >= min_stock;\nEND;\n\nCALL GetExecutiveFarmOverview(20);",
          "CREATE PROCEDURE GetExecutiveFarmOverview(IN min_stock INT)\nBEGIN\n  SELECT supplies.item_name, supplies.quantity, suppliers.supplier_name, suppliers.contact\n  FROM supplies\n  INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id\n  WHERE supplies.quantity >= min_stock;\nEND;\n\nCALL GetExecutiveFarmOverview(20);"
        ],
        solution: "CREATE PROCEDURE GetExecutiveFarmOverview(IN min_stock INT)\nBEGIN\n  SELECT supplies.item_name, supplies.quantity, suppliers.supplier_name, suppliers.contact\n  FROM supplies\n  INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id\n  WHERE supplies.quantity >= min_stock;\nEND;\n\nCALL GetExecutiveFarmOverview(20);",
        quickFill: "CREATE PROCEDURE GetExecutiveFarmOverview(IN min_stock INT)\nBEGIN\n  SELECT supplies.item_name, supplies.quantity, suppliers.supplier_name, suppliers.contact\n  FROM supplies\n  INNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id\n  WHERE supplies.quantity >= min_stock;\nEND;\n\nCALL GetExecutiveFarmOverview(20);",
        validate: (db, queryResult) => {
          const hasProc = db.procedureExists('GetExecutiveFarmOverview');
          const hasResult = queryResult && queryResult.results && queryResult.results.length > 0;
          return hasProc && hasResult;
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 22: THE FARM'S SECURITY GATE
  // ==========================================================
  22: {
    level: 22,
    title: "THE FARM'S SECURITY GATE",
    role: "Database Security Administrator",
    concept: "Data Control Language (DCL), GRANT, REVOKE, Roles, Privileges, Least Privilege Security",
    teaser: "Establish role-based access control (RBAC) to protect sensitive farm ledgers from unauthorized edits.",
    cutscene: {
      title: "Chapter 22: The Farm's Security Gate",
      image: "/images/cinematics/level5_harvest.jpg",
      duration: 11,
      mood: "authoritative",
      subtitles: [
        { start: 0, end: 3.5, text: "The farm staff has expanded: field workers, accountants, analysts, and regional buyers." },
        { start: 3.5, end: 7.5, text: "Uncle Somu: 'Giving everyone full database permissions is a disaster waiting to happen!'" },
        { start: 7.5, end: 11, text: "Configure Data Control Language (DCL) roles and privileges to secure our agricultural assets." }
      ]
    },
    storyIntro: {
      headline: "Role-Based Access Control (RBAC) & DCL Privileges",
      text: "In an enterprise agricultural company, different team members require different levels of database access. An intern analyst should only be able to SELECT data, while a warehouse manager needs INSERT and UPDATE permissions, and only trusted administrators should have DELETE rights. Using Data Control Language (DCL)—specifically GRANT and REVOKE commands—you will establish a strict Principle of Least Privilege security posture!",
      notebookEntries: [
        { label: "Role Creation", value: "CREATE ROLE role_name;" },
        { label: "Granting Privileges", value: "GRANT SELECT, INSERT ON table_name TO role_name;" },
        { label: "Revoking Privileges", value: "REVOKE DELETE ON table_name FROM role_name;" },
        { label: "Auditing Grants", value: "SHOW GRANTS FOR role_name; / SHOW ROLES;" }
      ]
    },
    completion: {
      title: "LEVEL 22 COMPLETE",
      subtitle: "Security Gate & RBAC Fully Enforced!",
      badge: "🔐 Security Officer",
      summary: "You established an airtight role-based access control matrix across the farm! Data analysts, warehouse clerks, and farm managers now operate with strictly scoped DCL privileges.",
      stats: [
        { label: "Roles Configured", value: "farm_analyst, farm_clerk, farm_director" },
        { label: "DCL Enforced", value: "GRANT & REVOKE on crops, sales, supplies" },
        { label: "Security Posture", value: "Principle of Least Privilege" },
        { label: "Cash Bonus", value: "+₹4,200" },
        { label: "XP Earned", value: "+1,000 XP" }
      ],
      nextLevelTitle: "Level 23: Farm Intelligence & Crisis Automation"
    },
    missions: [
      {
        id: "L22_M0",
        title: "Inspect Farm Access Roles",
        objective: "Inspect the current farm roles and privilege configuration using SHOW ROLES;.",
        dialogue: "Uncle Somu: 'Inspect our security registry with SHOW ROLES; to review the default farm access roles!'",
        concept: "DCL Security Role Audit",
        hints: [
          "Execute SHOW ROLES; to inspect current roles.",
          "SHOW ROLES;",
          "SHOW ROLES;"
        ],
        solution: "SHOW ROLES;",
        quickFill: "SHOW ROLES;",
        validate: (db, queryResult) => {
          return queryResult && queryResult.success;
        }
      },
      {
        id: "L22_M1",
        title: "Register Farm Security Roles",
        objective: "Create two dedicated database security roles: 'farm_analyst' and 'farm_clerk'.",
        dialogue: "Uncle Somu: 'Create two new security roles: farm_analyst for report writers and farm_clerk for warehouse staff!'",
        concept: "CREATE ROLE Security Command",
        hints: [
          "Use CREATE ROLE farm_analyst; and CREATE ROLE farm_clerk;",
          "CREATE ROLE farm_analyst;\nCREATE ROLE farm_clerk;\nSHOW ROLES;",
          "CREATE ROLE farm_analyst;\nCREATE ROLE farm_clerk;\nSHOW ROLES;"
        ],
        solution: "CREATE ROLE farm_analyst;\nCREATE ROLE farm_clerk;\nSHOW ROLES;",
        quickFill: "CREATE ROLE farm_analyst;\nCREATE ROLE farm_clerk;\nSHOW ROLES;",
        validate: (db) => {
          return db.roleExists('farm_analyst') && db.roleExists('farm_clerk');
        }
      },
      {
        id: "L22_M2",
        title: "Grant Read Access to Analyst",
        objective: "Grant SELECT privilege on 'crops' and 'sales' tables to role 'farm_analyst'.",
        dialogue: "Uncle Somu: 'Grant read-only SELECT permissions on crops and sales to our farm_analyst role!'",
        concept: "GRANT SELECT Privilege Assignment",
        hints: [
          "Use GRANT SELECT ON crops TO farm_analyst; and GRANT SELECT ON sales TO farm_analyst;",
          "GRANT SELECT ON crops TO farm_analyst;\nGRANT SELECT ON sales TO farm_analyst;\nSHOW GRANTS FOR farm_analyst;",
          "GRANT SELECT ON crops TO farm_analyst;\nGRANT SELECT ON sales TO farm_analyst;\nSHOW GRANTS FOR farm_analyst;"
        ],
        solution: "GRANT SELECT ON crops TO farm_analyst;\nGRANT SELECT ON sales TO farm_analyst;\nSHOW GRANTS FOR farm_analyst;",
        quickFill: "GRANT SELECT ON crops TO farm_analyst;\nGRANT SELECT ON sales TO farm_analyst;\nSHOW GRANTS FOR farm_analyst;",
        validate: (db) => {
          return db.hasGrant('farm_analyst', 'SELECT', 'crops') && db.hasGrant('farm_analyst', 'SELECT', 'sales');
        }
      },
      {
        id: "L22_M3",
        title: "Grant Inventory Management Access",
        objective: "Grant INSERT and UPDATE privileges on 'supplies' table to role 'farm_clerk'.",
        dialogue: "Uncle Somu: 'Grant INSERT and UPDATE privileges on supplies to farm_clerk so they can update stock arrivals!'",
        concept: "GRANT Multi-Privilege Assignment",
        hints: [
          "Use GRANT INSERT, UPDATE ON supplies TO farm_clerk;",
          "GRANT INSERT, UPDATE ON supplies TO farm_clerk;\nSHOW GRANTS FOR farm_clerk;",
          "GRANT INSERT, UPDATE ON supplies TO farm_clerk;\nSHOW GRANTS FOR farm_clerk;"
        ],
        solution: "GRANT INSERT, UPDATE ON supplies TO farm_clerk;\nSHOW GRANTS FOR farm_clerk;",
        quickFill: "GRANT INSERT, UPDATE ON supplies TO farm_clerk;\nSHOW GRANTS FOR farm_clerk;",
        validate: (db) => {
          return db.hasGrant('farm_clerk', 'INSERT', 'supplies') && db.hasGrant('farm_clerk', 'UPDATE', 'supplies');
        }
      },
      {
        id: "L22_M4",
        title: "Revoke Dangerous Privileges",
        objective: "Revoke DELETE privilege on 'sales' table from role 'farm_manager'.",
        dialogue: "Uncle Somu: 'Sales records are financial audit history! Revoke DELETE privileges on sales from the farm_manager role!'",
        concept: "REVOKE Privilege Command",
        hints: [
          "Use REVOKE DELETE ON sales FROM farm_manager;",
          "REVOKE DELETE ON sales FROM farm_manager;\nSHOW GRANTS FOR farm_manager;",
          "REVOKE DELETE ON sales FROM farm_manager;\nSHOW GRANTS FOR farm_manager;"
        ],
        solution: "REVOKE DELETE ON sales FROM farm_manager;\nSHOW GRANTS FOR farm_manager;",
        quickFill: "REVOKE DELETE ON sales FROM farm_manager;\nSHOW GRANTS FOR farm_manager;",
        validate: (db) => {
          return !db.hasGrant('farm_manager', 'DELETE', 'sales');
        }
      },
      {
        id: "L22_M5",
        title: "THE ENTERPRISE SECURITY MATRIX",
        objective: "Grand finale of Level 22: Create role 'farm_director', grant ALL PRIVILEGES ON * TO farm_director, and inspect with SHOW GRANTS FOR farm_director;.",
        dialogue: "Uncle Somu: 'Grand finale of Chapter 22! Create the executive farm_director role, grant ALL PRIVILEGES ON * TO farm_director, and verify with SHOW GRANTS!'",
        concept: "Master Enterprise DCL Role & Privilege Matrix",
        hints: [
          "Create role farm_director, grant ALL PRIVILEGES ON * to farm_director, and run SHOW GRANTS FOR farm_director;",
          "CREATE ROLE farm_director;\nGRANT ALL PRIVILEGES ON * TO farm_director;\nSHOW GRANTS FOR farm_director;",
          "CREATE ROLE farm_director;\nGRANT ALL PRIVILEGES ON * TO farm_director;\nSHOW GRANTS FOR farm_director;"
        ],
        solution: "CREATE ROLE farm_director;\nGRANT ALL PRIVILEGES ON * TO farm_director;\nSHOW GRANTS FOR farm_director;",
        quickFill: "CREATE ROLE farm_director;\nGRANT ALL PRIVILEGES ON * TO farm_director;\nSHOW GRANTS FOR farm_director;",
        validate: (db, queryResult) => {
          const hasRole = db.roleExists('farm_director');
          const hasGrant = db.hasGrant('farm_director', 'ALL', '*');
          return hasRole && hasGrant;
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 23: FARM INTELLIGENCE & CRISIS AUTOMATION
  // ==========================================================
  23: {
    level: 23,
    title: "FARM INTELLIGENCE & CRISIS AUTOMATION",
    role: "Farm Intelligence Architect",
    concept: "AI-Augmented Decision Support, Structured SQL Intelligence Pipelines, Multi-Table Diagnostic CTEs",
    teaser: "Feed structured SQL analytics directly into AI-driven decision engines to solve agricultural crises.",
    cutscene: {
      title: "Chapter 23: Farm Intelligence & Crisis Automation",
      image: "/images/cinematics/level5_harvest.jpg",
      duration: 11,
      mood: "intense",
      subtitles: [
        { start: 0, end: 3.5, text: "A sudden climate fluctuation and supply chain crunch threaten regional food markets." },
        { start: 3.5, end: 7.5, text: "Uncle Somu: 'The board needs predictive recommendations backed strictly by database facts!'" },
        { start: 7.5, end: 11, text: "Construct SQL intelligence feeds that fuel automated AI decision-making models." }
      ]
    },
    storyIntro: {
      headline: "Database Ground Truth -> AI Decision Support",
      text: "Modern agribusiness intelligence relies on an immutable rule: AI models do not guess facts—they interpret structured database outputs! In this crisis, you will craft high-precision SQL intelligence queries that extract stock velocity, supply bottlenecks, plot health, and revenue margins. These structured results are consumed by the farm's automated decision layer to generate actionable crisis recommendations!",
      notebookEntries: [
        { label: "Intelligence Workflow", value: "DATABASE (Truth) -> SQL Query -> Structured Result -> AI Decision Engine" },
        { label: "Stock Velocity", value: "SUM(sales.quantity) vs stock.quantity" },
        { label: "Risk Tiers", value: "CASE WHEN quantity < threshold THEN 'CRITICAL' ... END" },
        { label: "Chained Intelligence CTEs", value: "WITH SupplyHealth AS (...), RevenueBenchmark AS (...) SELECT ..." }
      ]
    },
    completion: {
      title: "LEVEL 23 COMPLETE",
      subtitle: "Crisis Mitigated via AI Intelligence Pipeline!",
      badge: "🧠 AI Agribusiness Architect",
      summary: "You constructed the complete SQL-to-AI decision support architecture! By extracting factual database metrics into structured analytical feeds, the farm's automated intelligence engine successfully navigated the crisis.",
      stats: [
        { label: "Intelligence Feeds", value: "Velocity, Bottlenecks, Margin CTEs" },
        { label: "Decision Engine", value: "Structured SQL Ground Truth Feed" },
        { label: "Crisis Status", value: "Resolved & Automated" },
        { label: "Cash Bonus", value: "+₹5,000" },
        { label: "XP Earned", value: "+1,200 XP" }
      ],
      nextLevelTitle: "Level 24: The Final Harvest (Full Stack Capstone)"
    },
    missions: [
      {
        id: "L23_M0",
        title: "Query Crisis Signals (Stock vs Sales Velocity)",
        objective: "Query crop_name, COUNT(farming.plot_id) AS active_plots, and SUM(sales.quantity) AS total_sold by joining 'crops', 'farming', and 'sales' on crop_id GROUP BY crops.crop_id.",
        dialogue: "Uncle Somu: 'Extract our crop production versus sales velocity feed: join crops, farming, and sales to project crop_name, active_plots, and total_sold!'",
        concept: "Multi-Table Aggregation for AI Velocity Feed",
        hints: [
          "Join crops, farming, and sales on crop_id, group by crops.crop_id, and sum sales quantity.",
          "SELECT crops.crop_name, COUNT(farming.plot_id) AS active_plots, SUM(sales.quantity) AS total_sold\nFROM crops\nLEFT JOIN farming ON crops.crop_id = farming.crop_id\nINNER JOIN sales ON crops.crop_id = sales.crop_id\nGROUP BY crops.crop_id;",
          "SELECT crops.crop_name, COUNT(farming.plot_id) AS active_plots, SUM(sales.quantity) AS total_sold\nFROM crops\nLEFT JOIN farming ON crops.crop_id = farming.crop_id\nINNER JOIN sales ON crops.crop_id = sales.crop_id\nGROUP BY crops.crop_id;"
        ],
        solution: "SELECT crops.crop_name, COUNT(farming.plot_id) AS active_plots, SUM(sales.quantity) AS total_sold\nFROM crops\nLEFT JOIN farming ON crops.crop_id = farming.crop_id\nINNER JOIN sales ON crops.crop_id = sales.crop_id\nGROUP BY crops.crop_id;",
        quickFill: "SELECT crops.crop_name, COUNT(farming.plot_id) AS active_plots, SUM(sales.quantity) AS total_sold\nFROM crops\nLEFT JOIN farming ON crops.crop_id = farming.crop_id\nINNER JOIN sales ON crops.crop_id = sales.crop_id\nGROUP BY crops.crop_id;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.some(c => c.includes('crop_name')) && cols.some(c => c.includes('sold')) && rows.length >= 3;
        }
      },
      {
        id: "L23_M1",
        title: "Detect Supply Chain Bottlenecks",
        objective: "Query supplies where quantity < 35, joined with 'suppliers' to display item_name, category, quantity, supplier_name, and contact ordered by quantity ASC.",
        dialogue: "Uncle Somu: 'Generate the supplier emergency contact feed: pull supplies below 35 units joined with suppliers, sorted by quantity ASC!'",
        concept: "Threshold Filtering with Supplier Resolution",
        hints: [
          "Join supplies and suppliers on supplier_id where quantity < 35 order by quantity ASC.",
          "SELECT supplies.item_name, supplies.category, supplies.quantity, suppliers.supplier_name, suppliers.contact\nFROM supplies\nINNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id\nWHERE supplies.quantity < 35\nORDER BY supplies.quantity ASC;",
          "SELECT supplies.item_name, supplies.category, supplies.quantity, suppliers.supplier_name, suppliers.contact\nFROM supplies\nINNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id\nWHERE supplies.quantity < 35\nORDER BY supplies.quantity ASC;"
        ],
        solution: "SELECT supplies.item_name, supplies.category, supplies.quantity, suppliers.supplier_name, suppliers.contact\nFROM supplies\nINNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id\nWHERE supplies.quantity < 35\nORDER BY supplies.quantity ASC;",
        quickFill: "SELECT supplies.item_name, supplies.category, supplies.quantity, suppliers.supplier_name, suppliers.contact\nFROM supplies\nINNER JOIN suppliers ON supplies.supplier_id = suppliers.supplier_id\nWHERE supplies.quantity < 35\nORDER BY supplies.quantity ASC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.some(c => c.includes('supplier_name')) && cols.some(c => c.includes('contact')) && rows.length >= 1;
        }
      },
      {
        id: "L23_M2",
        title: "Identify Premium Crop Margins",
        objective: "Query crop_id, crop_name, and market_price from 'crops' where market_price > (SELECT AVG(market_price) FROM crops).",
        dialogue: "Uncle Somu: 'Find crops trading above our farm average market price to prioritize high-margin planting schedules!'",
        concept: "Scalar Subquery for Benchmark Margin Comparison",
        hints: [
          "Select crop_id, crop_name, market_price from crops where market_price > (SELECT AVG(market_price) FROM crops).",
          "SELECT crop_id, crop_name, market_price FROM crops WHERE market_price > (SELECT AVG(market_price) FROM crops);",
          "SELECT crop_id, crop_name, market_price FROM crops WHERE market_price > (SELECT AVG(market_price) FROM crops);"
        ],
        solution: "SELECT crop_id, crop_name, market_price FROM crops WHERE market_price > (SELECT AVG(market_price) FROM crops);",
        quickFill: "SELECT crop_id, crop_name, market_price FROM crops WHERE market_price > (SELECT AVG(market_price) FROM crops);",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length >= 1;
        }
      },
      {
        id: "L23_M3",
        title: "Detect Unharvested Plot Anomalies",
        objective: "Perform a LEFT JOIN between 'crops' and 'farming' on crop_id to display crop_id, crop_name, plot_id, and status to detect unplanted or idle crop varieties.",
        dialogue: "Uncle Somu: 'Audit our plot allocation: LEFT JOIN crops with farming so our AI engine can spot unplanted or idle crop varieties!'",
        concept: "LEFT JOIN for Asset Utilization Auditing",
        hints: [
          "Select crops.crop_id, crops.crop_name, farming.plot_id, farming.status from crops LEFT JOIN farming on crops.crop_id = farming.crop_id.",
          "SELECT crops.crop_id, crops.crop_name, farming.plot_id, farming.status\nFROM crops\nLEFT JOIN farming ON crops.crop_id = farming.crop_id;",
          "SELECT crops.crop_id, crops.crop_name, farming.plot_id, farming.status\nFROM crops\nLEFT JOIN farming ON crops.crop_id = farming.crop_id;"
        ],
        solution: "SELECT crops.crop_id, crops.crop_name, farming.plot_id, farming.status\nFROM crops\nLEFT JOIN farming ON crops.crop_id = farming.crop_id;",
        quickFill: "SELECT crops.crop_id, crops.crop_name, farming.plot_id, farming.status\nFROM crops\nLEFT JOIN farming ON crops.crop_id = farming.crop_id;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.some(c => c.includes('crop_name')) && cols.some(c => c.includes('plot_id') || c.includes('status')) && rows.length >= 3;
        }
      },
      {
        id: "L23_M4",
        title: "Build Multi-Tier Risk CTE",
        objective: "Write a CTE categorizing supplies into risk tiers ('CRITICAL' when quantity < 30, 'WARNING' when quantity < 60, else 'HEALTHY') and select all ordered by quantity ASC.",
        dialogue: "Uncle Somu: 'Construct an automated risk tier CTE that tags every supply item as CRITICAL, WARNING, or HEALTHY!'",
        concept: "Common Table Expression with CASE Classification",
        hints: [
          "Use WITH SupplyHealth AS (SELECT item_name, quantity, CASE ... END AS risk_tier FROM supplies) SELECT * FROM SupplyHealth ORDER BY quantity ASC;",
          "WITH SupplyHealth AS (\n  SELECT item_name, quantity, \n         CASE \n           WHEN quantity < 30 THEN 'CRITICAL'\n           WHEN quantity < 60 THEN 'WARNING'\n           ELSE 'HEALTHY'\n         END AS risk_tier\n  FROM supplies\n)\nSELECT * FROM SupplyHealth ORDER BY quantity ASC;",
          "WITH SupplyHealth AS (\n  SELECT item_name, quantity, \n         CASE \n           WHEN quantity < 30 THEN 'CRITICAL'\n           WHEN quantity < 60 THEN 'WARNING'\n           ELSE 'HEALTHY'\n         END AS risk_tier\n  FROM supplies\n)\nSELECT * FROM SupplyHealth ORDER BY quantity ASC;"
        ],
        solution: "WITH SupplyHealth AS (\n  SELECT item_name, quantity, \n         CASE \n           WHEN quantity < 30 THEN 'CRITICAL'\n           WHEN quantity < 60 THEN 'WARNING'\n           ELSE 'HEALTHY'\n         END AS risk_tier\n  FROM supplies\n)\nSELECT * FROM SupplyHealth ORDER BY quantity ASC;",
        quickFill: "WITH SupplyHealth AS (\n  SELECT item_name, quantity, \n         CASE \n           WHEN quantity < 30 THEN 'CRITICAL'\n           WHEN quantity < 60 THEN 'WARNING'\n           ELSE 'HEALTHY'\n         END AS risk_tier\n  FROM supplies\n)\nSELECT * FROM SupplyHealth ORDER BY quantity ASC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('risk_tier') && rows.length >= 3;
        }
      },
      {
        id: "L23_M5",
        title: "THE CRISIS DECISION SUPPORT PIPELINE",
        objective: "Grand finale of Level 23: Execute the master decision feed CTE combining crop details, active plots planted, and total commercial revenue, ordered by total_revenue DESC.",
        dialogue: "Uncle Somu: 'Grand finale of Chapter 23! Deliver the complete executive crop decision matrix CTE combining active plot allocation and sales revenue!'",
        concept: "Master Chained CTE Decision Intelligence Architecture",
        hints: [
          "Combine CropRevenue and PlotUsage CTEs and left join with crops ordered by total_revenue DESC.",
          "WITH CropRevenue AS (\n  SELECT crop_id, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n),\nPlotUsage AS (\n  SELECT crop_id, COUNT(*) AS active_plots\n  FROM farming\n  GROUP BY crop_id\n)\nSELECT \n  crops.crop_name, \n  crops.market_price, \n  COALESCE(PlotUsage.active_plots, 0) AS plots_planted, \n  COALESCE(CropRevenue.total_revenue, 0) AS total_revenue\nFROM crops\nLEFT JOIN PlotUsage ON crops.crop_id = PlotUsage.crop_id\nLEFT JOIN CropRevenue ON crops.crop_id = CropRevenue.crop_id\nORDER BY total_revenue DESC;",
          "WITH CropRevenue AS (\n  SELECT crop_id, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n),\nPlotUsage AS (\n  SELECT crop_id, COUNT(*) AS active_plots\n  FROM farming\n  GROUP BY crop_id\n)\nSELECT \n  crops.crop_name, \n  crops.market_price, \n  COALESCE(PlotUsage.active_plots, 0) AS plots_planted, \n  COALESCE(CropRevenue.total_revenue, 0) AS total_revenue\nFROM crops\nLEFT JOIN PlotUsage ON crops.crop_id = PlotUsage.crop_id\nLEFT JOIN CropRevenue ON crops.crop_id = CropRevenue.crop_id\nORDER BY total_revenue DESC;"
        ],
        solution: "WITH CropRevenue AS (\n  SELECT crop_id, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n),\nPlotUsage AS (\n  SELECT crop_id, COUNT(*) AS active_plots\n  FROM farming\n  GROUP BY crop_id\n)\nSELECT \n  crops.crop_name, \n  crops.market_price, \n  COALESCE(PlotUsage.active_plots, 0) AS plots_planted, \n  COALESCE(CropRevenue.total_revenue, 0) AS total_revenue\nFROM crops\nLEFT JOIN PlotUsage ON crops.crop_id = PlotUsage.crop_id\nLEFT JOIN CropRevenue ON crops.crop_id = CropRevenue.crop_id\nORDER BY total_revenue DESC;",
        quickFill: "WITH CropRevenue AS (\n  SELECT crop_id, SUM(quantity * sale_price) AS total_revenue\n  FROM sales\n  GROUP BY crop_id\n),\nPlotUsage AS (\n  SELECT crop_id, COUNT(*) AS active_plots\n  FROM farming\n  GROUP BY crop_id\n)\nSELECT \n  crops.crop_name, \n  crops.market_price, \n  COALESCE(PlotUsage.active_plots, 0) AS plots_planted, \n  COALESCE(CropRevenue.total_revenue, 0) AS total_revenue\nFROM crops\nLEFT JOIN PlotUsage ON crops.crop_id = PlotUsage.crop_id\nLEFT JOIN CropRevenue ON crops.crop_id = CropRevenue.crop_id\nORDER BY total_revenue DESC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.some(c => c.includes('revenue')) && cols.some(c => c.includes('plots')) && rows.length >= 3;
        }
      }
    ]
  },

  // ==========================================================
  // LEVEL 24: THE FINAL HARVEST (FULL STACK CAPSTONE)
  // ==========================================================
  24: {
    level: 24,
    title: "THE FINAL HARVEST",
    role: "FarmDB System Architect & Agribusiness Owner",
    concept: "Full Stack Agribusiness Capstone Synthesis: DDL, DML, Transactions, Triggers, Views, Procedures, DCL, and Executive Reporting",
    teaser: "The ultimate trial: unite the entire database curriculum to lead your agricultural empire to global glory.",
    cutscene: {
      title: "Chapter 24: The Final Harvest",
      image: "/images/cinematics/level5_harvest.jpg",
      duration: 12,
      mood: "epic",
      subtitles: [
        { start: 0, end: 4, text: "From a single dusty plot to a state-of-the-art agricultural enterprise." },
        { start: 4, end: 8, text: "Uncle Somu: 'You are no longer an apprentice writing queries. You are the Architect of this Empire!'" },
        { start: 8, end: 12, text: "Unite all database systems in this final capstone to claim the Agribusiness Crown." }
      ]
    },
    storyIntro: {
      headline: "The Master Agribusiness Architecture",
      text: "You have arrived at the ultimate milestone of FARMDB! The National Agribusiness Federation is reviewing our entire operational infrastructure for enterprise accreditation. To achieve highest honors, you must demonstrate end-to-end mastery across all tiers: schema auditing, transactional restocks, high-volume sales aggregation, security access controls, stored procedure automation, and the grand executive intelligence report!",
      notebookEntries: [
        { label: "Grand Capstone Milestone 1", value: "Schema & Object Catalog Audit (sqlite_master)" },
        { label: "Grand Capstone Milestone 2", value: "Atomic ACID Restock (BEGIN TRANSACTION -> COMMIT)" },
        { label: "Grand Capstone Milestone 3", value: "Commercial Revenue & Volume Ranking (JOIN + GROUP BY + HAVING)" },
        { label: "Grand Capstone Milestone 4", value: "Enterprise RBAC Security Assignment (GRANT / REVOKE)" },
        { label: "Grand Capstone Milestone 5", value: "Automation Routine Deployment (CREATE PROCEDURE / CALL)" },
        { label: "Grand Capstone Milestone 6", value: "Master Agribusiness Statement CTE" }
      ]
    },
    completion: {
      title: "👑 AGRIBUSINESS EMPIRE MASTERED",
      subtitle: "Full Stack Database Engineering Degree Awarded!",
      badge: "👑 Agribusiness Emperor",
      summary: "YOU HAVE CONQUERED FARMDB! You rebuilt the database from scratch, mastered joins, subqueries, CTEs, views, ACID transactions, autonomous triggers, stored procedures, DCL security, and AI decision analytics. Your agricultural empire is unstoppable!",
      stats: [
        { label: "Total Chapters", value: "24 / 24 Mastered" },
        { label: "Curriculum", value: "Full Stack Data & Database Engineering" },
        { label: "Career Title", value: "Chief Agribusiness System Architect 👑" },
        { label: "Grand Cash Prize", value: "+₹10,000" },
        { label: "XP Awarded", value: "+2,500 XP" }
      ],
      nextLevelTitle: "Freeplay Sandbox: Endless Agricultural Empire"
    },
    missions: [
      {
        id: "L24_M0",
        title: "Enterprise Database Architecture Audit",
        objective: "Query sqlite_master to audit all enterprise database objects: group by type and count total objects across the schema.",
        dialogue: "Uncle Somu: 'Begin the final capstone! Audit all registered database objects across tables, views, and triggers with GROUP BY type!'",
        concept: "Enterprise Object Catalog Aggregation",
        hints: [
          "Select type, count(*) as object_count from sqlite_master where name not like 'sqlite_%' group by type.",
          "SELECT type, COUNT(*) AS object_count FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' GROUP BY type;",
          "SELECT type, COUNT(*) AS object_count FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' GROUP BY type;"
        ],
        solution: "SELECT type, COUNT(*) AS object_count FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' GROUP BY type;",
        quickFill: "SELECT type, COUNT(*) AS object_count FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' GROUP BY type;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          return rows.length >= 2;
        }
      },
      {
        id: "L24_M1",
        title: "Emergency Atomic Supply Restock (ACID Transaction)",
        objective: "Execute an atomic transaction: BEGIN TRANSACTION, add +50 to Fertilizer in 'supplies', add +50 to 'Cold Storage' capacity in 'facility_registry', and COMMIT.",
        dialogue: "Uncle Somu: 'Execute an atomic supply arrival: begin transaction, increase Fertilizer quantity by +50 in supplies, expand Cold Storage capacity by +50 in facility_registry, and commit!'",
        concept: "Multi-Table ACID Transaction Execution",
        hints: [
          "Use BEGIN TRANSACTION, update supplies, update facility_registry, and COMMIT.",
          "BEGIN TRANSACTION;\nUPDATE supplies SET quantity = quantity + 50 WHERE category = 'Fertilizer';\nUPDATE facility_registry SET capacity = capacity + 50 WHERE facility_name = 'Cold Storage';\nCOMMIT;\nSELECT * FROM supplies WHERE category = 'Fertilizer';",
          "BEGIN TRANSACTION;\nUPDATE supplies SET quantity = quantity + 50 WHERE category = 'Fertilizer';\nUPDATE facility_registry SET capacity = capacity + 50 WHERE facility_name = 'Cold Storage';\nCOMMIT;\nSELECT * FROM supplies WHERE category = 'Fertilizer';"
        ],
        solution: "BEGIN TRANSACTION;\nUPDATE supplies SET quantity = quantity + 50 WHERE category = 'Fertilizer';\nUPDATE facility_registry SET capacity = capacity + 50 WHERE facility_name = 'Cold Storage';\nCOMMIT;\nSELECT * FROM supplies WHERE category = 'Fertilizer';",
        quickFill: "BEGIN TRANSACTION;\nUPDATE supplies SET quantity = quantity + 50 WHERE category = 'Fertilizer';\nUPDATE facility_registry SET capacity = capacity + 50 WHERE facility_name = 'Cold Storage';\nCOMMIT;\nSELECT * FROM supplies WHERE category = 'Fertilizer';",
        validate: (db) => {
          const supp = db.getTableData('supplies');
          const fert = supp.find(s => String(s.category).toLowerCase() === 'fertilizer');
          const fac = db.getTableData('facility_registry');
          const cold = fac ? fac.find(f => String(f.facility_name).includes('Cold Storage')) : null;
          return fert && Number(fert.quantity) >= 80 && cold && Number(cold.capacity) >= 550;
        }
      },
      {
        id: "L24_M2",
        title: "Commercial Revenue & High-Yield Analysis",
        objective: "Query crop_name, COUNT(sales.sale_id) AS total_orders, SUM(sales.quantity) AS total_units_sold, and SUM(sales.quantity * sales.sale_price) AS total_revenue from 'sales' JOIN 'crops' GROUP BY crops.crop_id HAVING total_revenue > 1000 ORDER BY total_revenue DESC.",
        dialogue: "Uncle Somu: 'Deliver the high-volume commercial sales audit: join crops and sales, group by crop_id, filter for crops with total_revenue > 1000 using HAVING, sorted DESC!'",
        concept: "Complex JOIN with GROUP BY, HAVING, and Aggregation",
        hints: [
          "Join sales and crops on crop_id, group by crops.crop_id, having total_revenue > 1000 order by total_revenue DESC.",
          "SELECT \n  crops.crop_name, \n  COUNT(sales.sale_id) AS total_orders, \n  SUM(sales.quantity) AS total_units_sold, \n  SUM(sales.quantity * sales.sale_price) AS total_revenue\nFROM sales\nINNER JOIN crops ON sales.crop_id = crops.crop_id\nGROUP BY crops.crop_id\nHAVING total_revenue > 1000\nORDER BY total_revenue DESC;",
          "SELECT \n  crops.crop_name, \n  COUNT(sales.sale_id) AS total_orders, \n  SUM(sales.quantity) AS total_units_sold, \n  SUM(sales.quantity * sales.sale_price) AS total_revenue\nFROM sales\nINNER JOIN crops ON sales.crop_id = crops.crop_id\nGROUP BY crops.crop_id\nHAVING total_revenue > 1000\nORDER BY total_revenue DESC;"
        ],
        solution: "SELECT \n  crops.crop_name, \n  COUNT(sales.sale_id) AS total_orders, \n  SUM(sales.quantity) AS total_units_sold, \n  SUM(sales.quantity * sales.sale_price) AS total_revenue\nFROM sales\nINNER JOIN crops ON sales.crop_id = crops.crop_id\nGROUP BY crops.crop_id\nHAVING total_revenue > 1000\nORDER BY total_revenue DESC;",
        quickFill: "SELECT \n  crops.crop_name, \n  COUNT(sales.sale_id) AS total_orders, \n  SUM(sales.quantity) AS total_units_sold, \n  SUM(sales.quantity * sales.sale_price) AS total_revenue\nFROM sales\nINNER JOIN crops ON sales.crop_id = crops.crop_id\nGROUP BY crops.crop_id\nHAVING total_revenue > 1000\nORDER BY total_revenue DESC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.some(c => c.includes('revenue')) && rows.length >= 2;
        }
      },
      {
        id: "L24_M3",
        title: "Enforce System Security & Audit Invariants",
        objective: "Grant SELECT and INSERT privileges on 'facility_registry' to 'farm_manager', then inspect active triggers with SELECT name, tbl_name FROM sqlite_master WHERE type='trigger';",
        dialogue: "Uncle Somu: 'Lock down facility administration: grant SELECT, INSERT ON facility_registry to farm_manager, and confirm trigger security is active!'",
        concept: "DCL Privilege Assignment & Invariant Verification",
        hints: [
          "Use GRANT SELECT, INSERT ON facility_registry TO farm_manager; and select triggers from sqlite_master.",
          "GRANT SELECT, INSERT ON facility_registry TO farm_manager;\nSELECT name, tbl_name FROM sqlite_master WHERE type='trigger';",
          "GRANT SELECT, INSERT ON facility_registry TO farm_manager;\nSELECT name, tbl_name FROM sqlite_master WHERE type='trigger';"
        ],
        solution: "GRANT SELECT, INSERT ON facility_registry TO farm_manager;\nSELECT name, tbl_name FROM sqlite_master WHERE type='trigger';",
        quickFill: "GRANT SELECT, INSERT ON facility_registry TO farm_manager;\nSELECT name, tbl_name FROM sqlite_master WHERE type='trigger';",
        validate: (db) => {
          return db.hasGrant('farm_manager', 'SELECT', 'facility_registry') && db.hasGrant('farm_manager', 'INSERT', 'facility_registry');
        }
      },
      {
        id: "L24_M4",
        title: "Deploy Enterprise Agribusiness Automation Procedure",
        objective: "Create stored procedure 'GetFarmEmpireSummary()' that selects crop_name, market_price, and growth_days from 'crops' ORDER BY market_price DESC, then execute CALL GetFarmEmpireSummary();.",
        dialogue: "Uncle Somu: 'Deploy our final automation routine: GetFarmEmpireSummary() to retrieve premium crop schedules sorted by market_price DESC, then execute it!'",
        concept: "Enterprise Automation Stored Procedure Deployment",
        hints: [
          "Create procedure GetFarmEmpireSummary selecting from crops, then execute CALL GetFarmEmpireSummary();",
          "CREATE PROCEDURE GetFarmEmpireSummary()\nBEGIN\n  SELECT crop_name, market_price, growth_days FROM crops ORDER BY market_price DESC;\nEND;\n\nCALL GetFarmEmpireSummary();",
          "CREATE PROCEDURE GetFarmEmpireSummary()\nBEGIN\n  SELECT crop_name, market_price, growth_days FROM crops ORDER BY market_price DESC;\nEND;\n\nCALL GetFarmEmpireSummary();"
        ],
        solution: "CREATE PROCEDURE GetFarmEmpireSummary()\nBEGIN\n  SELECT crop_name, market_price, growth_days FROM crops ORDER BY market_price DESC;\nEND;\n\nCALL GetFarmEmpireSummary();",
        quickFill: "CREATE PROCEDURE GetFarmEmpireSummary()\nBEGIN\n  SELECT crop_name, market_price, growth_days FROM crops ORDER BY market_price DESC;\nEND;\n\nCALL GetFarmEmpireSummary();",
        validate: (db, queryResult) => {
          const hasProc = db.procedureExists('GetFarmEmpireSummary');
          const hasResult = queryResult && queryResult.results && queryResult.results.length > 0;
          return hasProc && hasResult;
        }
      },
      {
        id: "L24_M5",
        title: "THE FINAL HARVEST: MASTER AGRIBUSINESS REPORT",
        objective: "The Grand Finale of FARMDB: Write a comprehensive multi-tier CTE report combining crop performance, total plots planted, total revenue generated, and business tier categorization ('EMPIRE_CORE' for revenue >= 2000, else 'STEADY_CASHFLOW') ordered by crop_revenue DESC!",
        dialogue: "Uncle Somu: 'THE FINAL MOMENT HAS ARRIVED! Compile the Master Agribusiness Empire Statement using chained CTEs and CASE categorization! Save the farm and claim your crown as Chief Agribusiness Architect!'",
        concept: "The Ultimate Agribusiness Enterprise Intelligence Synthesis",
        hints: [
          "Combine CropPerformance and ActivePlots CTEs, select metrics with CASE tiering, ordered by crop_revenue DESC.",
          "WITH CropPerformance AS (\n  SELECT crops.crop_id, crops.crop_name, crops.market_price, SUM(sales.quantity * sales.sale_price) AS crop_revenue\n  FROM crops\n  INNER JOIN sales ON crops.crop_id = sales.crop_id\n  GROUP BY crops.crop_id\n),\nActivePlots AS (\n  SELECT crop_id, COUNT(*) AS total_plots\n  FROM farming\n  GROUP BY crop_id\n)\nSELECT \n  CropPerformance.crop_name, \n  CropPerformance.market_price, \n  COALESCE(ActivePlots.total_plots, 0) AS plots_in_use, \n  CropPerformance.crop_revenue, \n  CASE \n    WHEN CropPerformance.crop_revenue >= 2000 THEN 'EMPIRE_CORE'\n    ELSE 'STEADY_CASHFLOW'\n  END AS business_tier\nFROM CropPerformance\nLEFT JOIN ActivePlots ON CropPerformance.crop_id = ActivePlots.crop_id\nORDER BY CropPerformance.crop_revenue DESC;",
          "WITH CropPerformance AS (\n  SELECT crops.crop_id, crops.crop_name, crops.market_price, SUM(sales.quantity * sales.sale_price) AS crop_revenue\n  FROM crops\n  INNER JOIN sales ON crops.crop_id = sales.crop_id\n  GROUP BY crops.crop_id\n),\nActivePlots AS (\n  SELECT crop_id, COUNT(*) AS total_plots\n  FROM farming\n  GROUP BY crop_id\n)\nSELECT \n  CropPerformance.crop_name, \n  CropPerformance.market_price, \n  COALESCE(ActivePlots.total_plots, 0) AS plots_in_use, \n  CropPerformance.crop_revenue, \n  CASE \n    WHEN CropPerformance.crop_revenue >= 2000 THEN 'EMPIRE_CORE'\n    ELSE 'STEADY_CASHFLOW'\n  END AS business_tier\nFROM CropPerformance\nLEFT JOIN ActivePlots ON CropPerformance.crop_id = ActivePlots.crop_id\nORDER BY CropPerformance.crop_revenue DESC;"
        ],
        solution: "WITH CropPerformance AS (\n  SELECT crops.crop_id, crops.crop_name, crops.market_price, SUM(sales.quantity * sales.sale_price) AS crop_revenue\n  FROM crops\n  INNER JOIN sales ON crops.crop_id = sales.crop_id\n  GROUP BY crops.crop_id\n),\nActivePlots AS (\n  SELECT crop_id, COUNT(*) AS total_plots\n  FROM farming\n  GROUP BY crop_id\n)\nSELECT \n  CropPerformance.crop_name, \n  CropPerformance.market_price, \n  COALESCE(ActivePlots.total_plots, 0) AS plots_in_use, \n  CropPerformance.crop_revenue, \n  CASE \n    WHEN CropPerformance.crop_revenue >= 2000 THEN 'EMPIRE_CORE'\n    ELSE 'STEADY_CASHFLOW'\n  END AS business_tier\nFROM CropPerformance\nLEFT JOIN ActivePlots ON CropPerformance.crop_id = ActivePlots.crop_id\nORDER BY CropPerformance.crop_revenue DESC;",
        quickFill: "WITH CropPerformance AS (\n  SELECT crops.crop_id, crops.crop_name, crops.market_price, SUM(sales.quantity * sales.sale_price) AS crop_revenue\n  FROM crops\n  INNER JOIN sales ON crops.crop_id = sales.crop_id\n  GROUP BY crops.crop_id\n),\nActivePlots AS (\n  SELECT crop_id, COUNT(*) AS total_plots\n  FROM farming\n  GROUP BY crop_id\n)\nSELECT \n  CropPerformance.crop_name, \n  CropPerformance.market_price, \n  COALESCE(ActivePlots.total_plots, 0) AS plots_in_use, \n  CropPerformance.crop_revenue, \n  CASE \n    WHEN CropPerformance.crop_revenue >= 2000 THEN 'EMPIRE_CORE'\n    ELSE 'STEADY_CASHFLOW'\n  END AS business_tier\nFROM CropPerformance\nLEFT JOIN ActivePlots ON CropPerformance.crop_id = ActivePlots.crop_id\nORDER BY CropPerformance.crop_revenue DESC;",
        validate: (db, queryResult) => {
          if (!queryResult || !queryResult.results || queryResult.results.length === 0) return false;
          const rows = queryResult.results[0].values;
          const cols = queryResult.results[0].columns.map(c => c.toLowerCase());
          return cols.includes('business_tier') && cols.some(c => c.includes('revenue')) && rows.length >= 3;
        }
      }
    ]
  }
};





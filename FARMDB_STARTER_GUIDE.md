# FARMDB — STUDENT STARTER GUIDE
### *"Everything you need to know before entering the farm."*

---

## 🌾 WELCOME TO FARMDB

Welcome to **FARMDB**!

FARMDB is a SQL learning game where you manage and restore a digital farm using a real relational database.

Instead of learning SQL only through abstract theory and dry syntax drills, you will use SQL to solve real-world problems happening across the farm's fields, warehouse, market, and livestock pens.

You will start with basic database concepts and gradually take full responsibility as the Chief Agribusiness System Architect.

During the game, you will use SQL to:
- **Create and manage tables**
- **Add and modify data**
- **Find and project information**
- **Filter and sort records**
- **Analyze farm productivity and revenue**
- **Connect related tables**
- **Detect missing information and discrepancies**
- **Architect normalized relational databases**
- **Automate database operations with triggers & routines**
- **Manage database security and access permissions**
- **Build executive intelligence reports**
- **Solve the ultimate farm crisis**

---

## 🎮 HOW THE GAME WORKS

Each level presents an authentic farm challenge:

```
Story & Context
      ↓
Operational Problem
      ↓
Mission Task
      ↓
Write SQL Query
      ↓
Inspect Database Result & Advance!
```

You solve each mission by writing SQL queries in the **FARMDB Terminal**. The game engine executes your SQL on a live WebAssembly database and checks whether the problem is resolved.

### Example Scenario:
The farm manager needs to find warehouse supplies with less than 50 units in stock:

```sql
SELECT *
FROM supplies
WHERE quantity < 50;
```

> [!TIP]
> Do not worry if you cannot write every query immediately! Concepts are introduced gradually with interactive dialogues, hints, and feedback.

---

## 🗺️ CHOOSE YOUR PATH

When starting FARMDB, you choose your learning journey:

### 1. Data Analytics Path (Levels 1–17)
Designed for students focusing on SQL data querying, analytics, aggregation, reporting, and relational design.
- **Core Topics**: `CREATE TABLE`, PK/FK, `INSERT`, `SELECT`, `WHERE`, `ORDER BY`, `LIMIT`, `UPDATE`, `DELETE`, Aggregations (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`), `GROUP BY`, `HAVING`, `AND`/`OR`, `BETWEEN`, `IN`, `LIKE`, `INNER JOIN`, `LEFT JOIN`, `NULL`, `CASE`, Subqueries, CTEs, DDL, ER Modeling, Normalization (1NF–3NF), and the **Level 17 Data Analytics Capstone**.
- **Completion**: Finishes at Chapter 17.

### 2. Full Stack Path (Levels 1–24)
Includes the entire Data Analytics curriculum and continues into enterprise database engineering and backend systems.
- **Extended Topics**: Database Views (`CREATE VIEW`), ACID Transactions (`BEGIN`, `COMMIT`, `ROLLBACK`), Autonomous Triggers (`CREATE TRIGGER`), Stored Procedures (`CREATE PROCEDURE`, `CALL`), Data Control Language (`GRANT`, `REVOKE`, RBAC), AI + SQL Decision Pipelines, and the **Level 24 Full Stack Final Capstone**.
- **Completion**: Concludes at Chapter 24 with the Agribusiness Emperor degree.

---

## 🗄️ WHAT IS A DATABASE?

A database is an organized, persistent collection of data.

In FARMDB, the database stores everything about the agricultural enterprise:
- **Crops** (varieties, growth cycles, market prices)
- **Supplies** (seeds, fertilizer, cattle feed, tools)
- **Suppliers** (vendor contacts, location codes)
- **Sales** (transactions, units sold, revenue)
- **Fields & Plots** (soil status, growth percentages)
- **Livestock** (cattle, health records, barn allocations)

All of this information is structured into **tables**.

---

## 📊 TABLES, ROWS AND COLUMNS

Think of a database table like a structured spreadsheet:

| `crop_id` (PK) | `crop_name` | `market_price` |
| :--- | :--- | :--- |
| **1** | Wheat | ₹45 |
| **2** | Rice | ₹60 |
| **3** | Corn | ₹50 |

- **TABLE**: The complete collection of related records (e.g., `crops`).
- **ROW (Record / Tuple)**: One individual item across the table (e.g., Row 1: Wheat).
- **COLUMN (Field / Attribute)**: One specific type of information (e.g., `crop_name`).

---

## 🔑 PRIMARY KEY (PK)

A **PRIMARY KEY** uniquely identifies every record in a table. No two rows can have the same primary key value, and it can never be empty (`NULL`).

```sql
CREATE TABLE crops (
    crop_id INT PRIMARY KEY,
    crop_name VARCHAR(50)
);
```

> **Think**: PRIMARY KEY = *"Which exact record is this?"*

---

## 🔗 FOREIGN KEY (FK)

A **FOREIGN KEY** creates a relational link connecting a record in one table to the primary key of another table.

```sql
CREATE TABLE farming (
    field_id INT PRIMARY KEY,
    crop_id INT,
    FOREIGN KEY (crop_id) REFERENCES crops(crop_id)
);
```

> **Think**: FOREIGN KEY = *"Which record in another table is this connected to?"*

---

## 🏷️ COMMON SQL DATA TYPES

Columns specify the kind of data they can hold:

- `INT` / `INTEGER`: Whole numbers (e.g., `quantity INT`)
- `FLOAT` / `DECIMAL`: Numbers with decimal places (e.g., `price FLOAT`)
- `VARCHAR(N)` / `TEXT`: Text strings up to $N$ characters (e.g., `crop_name VARCHAR(50)`)
- `DATE`: Calendar dates (`'YYYY-MM-DD'`)
- `DATETIME`: Timestamps with date and time (`'YYYY-MM-DD HH:MM:SS'`)

---

## ⚡ CORE SQL COMMAND CHEATSHEET

### 1. `INSERT` — Add New Records
```sql
INSERT INTO crops (crop_id, crop_name, market_price)
VALUES (1, 'Wheat', 45);
```
> **Think**: *Add new data into the table.*

---

### 2. `SELECT` — Retrieve Records
```sql
-- Select all columns
SELECT * FROM crops;

-- Select specific columns (projection)
SELECT crop_name, market_price FROM crops;
```
> **Think**: *Show me the data.*

---

### 3. `WHERE` — Filter Specific Rows
```sql
SELECT * FROM crops WHERE market_price > 50;
```
> **Think**: *Which specific records do I want?*

---

### 4. `ORDER BY` — Sort Results
```sql
SELECT * FROM crops ORDER BY market_price DESC;
```
- `ASC`: Ascending (lowest to highest / A–Z, default)
- `DESC`: Descending (highest to lowest / Z–A)

---

### 5. `LIMIT` — Restrict Row Count
```sql
SELECT * FROM crops LIMIT 5;
```

---

### 6. `UPDATE` — Modify Existing Records
```sql
UPDATE crops
SET market_price = 55
WHERE crop_id = 1;
```
> [!CAUTION]
> Always check your `WHERE` clause! An `UPDATE` without a `WHERE` will change every row in the table!

---

### 7. `DELETE` — Remove Outdated Records
```sql
DELETE FROM crops
WHERE crop_id = 3;
```
> [!CAUTION]
> A `DELETE` without a `WHERE` clause removes all records from the table!

---

## 📈 AGGREGATIONS & GROUPING

SQL performs powerful mathematical calculations across multiple rows:

- `COUNT()`: Counts total rows matching criteria
- `SUM()`: Adds numerical values
- `AVG()`: Calculates the mean average
- `MIN()`: Finds the smallest value
- `MAX()`: Finds the largest value

### `GROUP BY` — Category Calculations
Performs aggregate calculations separately for each distinct category:
```sql
SELECT crop_id, SUM(quantity) AS total_harvested
FROM sales
GROUP BY crop_id;
```
> **Think**: *Calculate metrics separately for each category.*

### `HAVING` — Filter Grouped Aggregates
Filters results *after* they have been aggregated by `GROUP BY`:
```sql
SELECT crop_id, SUM(quantity) AS total_harvested
FROM sales
GROUP BY crop_id
HAVING SUM(quantity) > 100;
```
> **Golden Rule**:
> - `WHERE` filters individual rows **before** grouping.
> - `HAVING` filters aggregated metrics **after** grouping.

---

## 🔍 SMART FILTERING OPERATORS

- `AND`: Both conditions must be true (`WHERE price > 20 AND quantity > 50`)
- `OR`: At least one condition is true (`WHERE category = 'Seed' OR category = 'Feed'`)
- `BETWEEN`: Value falls inside an inclusive range (`WHERE market_price BETWEEN 20 AND 50`)
- `IN`: Value matches any item in a provided list (`WHERE category IN ('Tool', 'Fertilizer')`)
- `LIKE`: Pattern search using wildcards (`WHERE item_name LIKE 'Tomato%'`)

---

## 🤝 RELATIONAL JOINS

Real databases divide data across specialized tables to prevent duplication. A **JOIN** recombines them:

```sql
SELECT crops.crop_name, supplies.quantity
FROM crops
INNER JOIN supplies ON crops.crop_id = supplies.crop_id;
```

- **`INNER JOIN`**: Returns rows only when a matching record exists in **both** tables.
- **`LEFT JOIN`**: Returns **all** rows from the left table, even if no match exists on the right (missing fields show `NULL`).

---

## ❓ WORKING WITH `NULL`

`NULL` represents missing, unknown, or unrecorded data.

```sql
-- Find records with missing data:
SELECT * FROM suppliers WHERE contact IS NULL;

-- Find records with valid data:
SELECT * FROM suppliers WHERE contact IS NOT NULL;
```
> [!WARNING]
> Never write `= NULL` or `!= NULL`. Always use `IS NULL` or `IS NOT NULL`.

---

## 🧠 ADVANCED QUERY PATTERNS

### `CASE WHEN` — Conditional Business Classifications
```sql
SELECT crop_name,
       CASE
           WHEN market_price >= 50 THEN 'Premium Tier'
           ELSE 'Standard Crop'
       END AS business_tier
FROM crops;
```

### Subqueries — Query Inside a Query
```sql
SELECT crop_name, market_price
FROM crops
WHERE market_price > (SELECT AVG(market_price) FROM crops);
```

### Common Table Expressions (`CTE`) — Modular Multi-Stage Queries
```sql
WITH CropSales AS (
    SELECT crop_id, SUM(quantity) AS total_units
    FROM sales
    GROUP BY crop_id
)
SELECT * FROM CropSales WHERE total_units > 100;
```
> **Think**: *Build a clean temporary dataset first, then query from it.*

---

## 🏗️ DATABASE DESIGN & ARCHITECTURE

- **1:1 (One-to-One)**: One entity relates to exactly one profile (e.g., Farm $\leftrightarrow$ `farm_profile`).
- **1:M (One-to-Many)**: One parent relates to multiple children (e.g., One Crop $\leftrightarrow$ Multiple Field Plots).
- **M:M (Many-to-Many)**: Multiple entities relate to each other via a **Junction Table** (e.g., `crop_suppliers` linking crops and vendors).
- **Normalization (1NF, 2NF, 3NF)**: Systematic rules to remove redundant duplication and ensure data consistency.
- **DDL (Data Definition Language)**: Commands that modify schema blueprints (`CREATE TABLE`, `ALTER TABLE`, `ADD COLUMN`, `DROP TABLE`).

---

## 🚀 FULL STACK EXTENSIONS (LEVELS 18–24)

- **Views (`CREATE VIEW`)**: Saved virtual tables that simplify recurring multi-table reports.
- **Transactions (`BEGIN`, `COMMIT`, `ROLLBACK`)**: Atomic operations ensuring ACID safety across multiple table mutations.
- **Triggers (`CREATE TRIGGER`)**: Autonomous procedural logic that automatically logs audits or validates data on `INSERT`/`UPDATE`.
- **Stored Procedures (`CREATE PROCEDURE`, `CALL`)**: Centralized, parameterized routines stored in the database.
- **DCL (`GRANT`, `REVOKE`)**: Role-Based Access Control enforcing the Principle of Least Privilege.
- **AI + SQL Pipelines**: Relational SQL serves as the immutable ground truth that feeds diagnostic structured data to AI decision engines.

---

## 🎯 HOW TO APPROACH A MISSION

When you receive an operational challenge from Uncle Somu or the farm manager:

1. **Read the Story Context**: Understand the real farm problem.
2. **Identify Required Data**: Which table (or tables) store the necessary information?
3. **Select the Concept**: Do you need filtering (`WHERE`), grouping (`GROUP BY`), joining (`JOIN`), or automation (`TRIGGER`)?
4. **Draft Your Query**: Type your SQL into the terminal.
5. **Run & Inspect**: Press `Ctrl+Enter` or click **Run Query**.
6. **Read Hints If Needed**: Hint Tier 1 provides guidance, Tier 2 clarifies syntax, and Tier 3 gives complete architectural assistance.

---

## 💡 IMPORTANT SQL MINDSET

You do **not** need to memorize every SQL syntax keyword before starting!

Instead, always ask:
> *"What real farm problem am I solving, and which SQL tool fits this problem?"*

| Goal | SQL Tool |
| :--- | :--- |
| Find & read records | `SELECT` |
| Filter specific rows | `WHERE` |
| Sort results | `ORDER BY` |
| Calculate totals & averages | `SUM()`, `AVG()`, `COUNT()` |
| Group calculations by category | `GROUP BY` |
| Filter aggregated numbers | `HAVING` |
| Connect multiple tables | `INNER JOIN` / `LEFT JOIN` |
| Compare with benchmark average | `Subquery` |
| Multi-step diagnostic query | `CTE (WITH ... AS)` |
| Automatic validation / audit | `CREATE TRIGGER` |
| Reusable routine | `CREATE PROCEDURE` |
| Security & permissions | `GRANT` / `REVOKE` |

---

## 🌟 READY TO ENTER THE FARM?

1. Choose your path: **[ DATA ANALYTICS ]** or **[ FULL STACK ]**.
2. Put on your boots.
3. Master SQL.
4. Solve the crisis.
5. Build your agricultural empire!

**WELCOME TO FARMDB.** 🌾🚜

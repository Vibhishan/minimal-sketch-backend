// src/database/connection.js
import { Sequelize } from "sequelize";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Place DB in project root's 'data' folder (adjust path if needed)
const storagePath = path.join(__dirname, "..", "..", "data", "db.sqlite");
console.log(`[DB] Using SQLite storage path: ${storagePath}`);

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: storagePath,
  logging: console.log, // Log SQL queries (or false to disable)
  // SQLite specific options if needed
});

export default sequelize;

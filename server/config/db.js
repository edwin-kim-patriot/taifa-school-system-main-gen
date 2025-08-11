// C:\taifa-school-system-main\server\config\db.js

import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: "edwin",
  password: "Mseto@2025",
  host: "localhost",
  port: 5432,
  database: "taifa_school",
});

export default pool;

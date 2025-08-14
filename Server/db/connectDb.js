const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

// For production db
const pool = process.env.DATABASE_ENV === "production"
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 30000, 
      idleTimeoutMillis: 60000, 
      max: 20, 
    })
  : // For local db
    new Pool({
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
    });

let db;

const connectDb = async (retries = 5, delay = 5000) => {
  if (db) return; // Already connected

  while (retries > 0) {
    try {
      db = await pool.connect();
      console.log("Database connected");
      return;
    } catch (error) {
      console.error(`Database connection failed. Retries left: ${retries - 1}`, error.message);
      retries--;

      if (retries === 0) {
        console.error("All retries failed. Could not connect to the database.");
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

const getDb = async () => {
  if (!db) {
    await connectDb();
  }
  return db;
};

const closeDb = async () => {
  if (db) {
    await db.release();
    db = null;
    console.log("Database connection closed");
  }
};

module.exports = {
  connectDb,
  getDb,
  closeDb,
};

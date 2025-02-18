const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

//for production db

const pool = process.env.NODE_ENV === "production" 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 30000, // Increase connection timeout
      idleTimeoutMillis: 60000, // Set idle timeout to keep connections alive
      max: 20, // Max number of connections in pool
    })
  : // for local db
    new Pool({
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
    });

let db;

const connectDb = async () => {
  if (!db) {
    try {
      db = await pool.connect();
      console.log("Database connected");
    } catch (error) {
      if (error) console.log("new error:", error);
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
    await db.end();
    console.log("Database connection closed");
  }
};

module.exports = {
  connectDb,
  getDb,
  closeDb,
};

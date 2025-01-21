const { Pool } = require("pg"); 
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
})

let db;

const connectDb = async () => {
    if (!db) { 
        try {
            db = await pool.connect();
            console.log("Database connected");
        } catch (error) {
            if(error) console.log(error);
        }
    }
}

const getDb = () => {
    if (!db) {
        throw new Error("Database not connected yet. Call connectDb first.");
    }
    return db;
}

module.exports = {
    connectDb,
    getDb
};

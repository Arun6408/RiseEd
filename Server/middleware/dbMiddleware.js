// middleware/dbMiddleware.js
const { connectDb } = require("../db/connectDb");

const ensureDbConnection = async (req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (error) {
    res.status(500).json({ error: "Database connection failed" });
  }
};

module.exports = ensureDbConnection;

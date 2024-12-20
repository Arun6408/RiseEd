const mysql = require('mysql2');

let connection; // Declare connection outside to make it globally accessible

const connectDb = () => {
    connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err.stack);
            return;
        }
        console.log('Connected to the database as id ' + connection.threadId);
    });
};

const getDb = () => {
    if (!connection) {
        throw new Error('Database connection has not been established. Call connectDb first.');
    }
    return connection;
};

module.exports = { connectDb, getDb };

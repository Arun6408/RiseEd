const mysql = require('mysql2');

let connection; // Declare connection outside to make it globally accessible

const connectDb = () => {
    connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        // port: process.env.DB_PORT || 3306,
        multipleStatements: true
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

const endConnection = () => {
    if (connection) {
        connection.end((err) => {
            if (err) {
                console.error('Error ending the database connection:', err.stack);
                return;
            }
            console.log('Database connection ended.');
        });
    } else {
        console.log('No database connection to end.');
    }
};

module.exports = { connectDb, getDb, endConnection };


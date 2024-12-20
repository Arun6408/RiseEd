const {connectDb, getDb} = require("./db/connectDb");
const dotenv = require("dotenv");
dotenv.config();

const populate = () =>{
    connectDb();
    const db = getDb();

    const queries = [
        `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL,
            age INT,
            phone VARCHAR(15),
            email VARCHAR(100) UNIQUE NOT NULL
        );
        `,
        `
        CREATE TABLE IF NOT EXISTS events (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            date DATE NOT NULL,
            location VARCHAR(100) NOT NULL,
            user_id INT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        `
    ];
    
    
    queries.forEach(query => {
        db.query(query, (err, result) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("Table created successfully");
        });
    });
}

populate();
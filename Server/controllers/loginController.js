const { getDb } = require("../db/connectDb");

const login = (req, res) => {
    const db = getDb();
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    db.query(query, (err, result) => {
        if (err) {
            res.status(500).send("Error while fetching data from the database");
            return;
        }
        
        if (result.length > 0) {
            res.status(200).json({
                status: "success",
                message: "Login successfull",
                data: result
            });
        }
         else {
            res.status(401).send("Invalid username or password");
        }
    });
}

const register = (req, res) => {
    const db = getDb();
    const { username, password, role, age, phone, email} = req.body;
    const query = `INSERT INTO users (username, password, role, age, phone, email) VALUES ('${username}', '${password}','${role}', '${age}','${phone}', '${email}')`;
    db.query(query, (err, result) => {
        if (err) {
            res.status(500).send("Error while inserting data into the database");
            return;
        }
        res.status(201).json({
            status: "success",
            message: "User created successfully"
        });
    });
}



module.exports = { login };
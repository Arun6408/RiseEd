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

    const user = req.user;

    if (!(user.role === 'super_admin' || user.role === 'principal' || user.role === 'head_master')) {
        res.status(403).send("Access denied. You are not authorized to create a new user");
        return;
    }

    const db = getDb();
    const { username, password, role, age, phone, email} = req.body;

    const usernameCheckQuery = `SELECT * FROM all_users WHERE username = '${username}'`;

    db.query(usernameCheckQuery, (err, result) => {
        if (err) {
            res.status(500).send("Error while fetching data from the database");
            return;
        }
        if (result.length > 0) {
            res.status(409).send("Username already exists");
            return;
        }
        
        
        if(role === 'super_admin'){
            res.status(403).send("Access denied. No one can create a user with super_admin role");
            return;
        }
        
        if((role === 'principal' && user.role !== 'super_admin') || (role === 'head_master' && (user.role !== 'super_admin' && user.role !== 'principal'))){
            res.status(403).send(`Access denied. ${user.role} is not authorized to create a user with ${role} role`);
            return;
        }
        
        const userCreateQuery = `INSERT INTO all_users (username, password, role, age, phone, email) VALUES ('${username}', '${password}','${role}', '${age}','${phone}', '${email}')`;
        
        if(role === 'principal'){
            const { salary, otherMoneyBenifits } = req.body;
            userCreateQuery += `INSERT INTO principals (user_id, salary, otherMoneyBenifits) VALUES ((SELECT id from all_users where username = '${username}'), '${salary}', '${otherMoneyBenifits}')`;
        }
        if(role === 'head_master'){
            const { salary, department, assignedClasses, otherMoneyBenifits } = req.body;
            userCreateQuery += `INSERT INTO head_masters (user_id, salary, department, assignedClasses, otherMoneyBenifits) VALUES ((SELECT id from all_users where username = '${username}'), '${salary}', '${department}', '${assignedClasses}', '${otherMoneyBenifits}')`;
        }
        if(role === 'teacher'){
            const { salary, department, assignedClasses, otherMoneyBenifits } = req.body;
            userCreateQuery += `INSERT INTO teachers (user_id, salary, department, assignedClasses, otherMoneyBenifits) VALUES ((SELECT id from all_users where username = '${username}'), '${salary}', '${department}', '${assignedClasses}', '${otherMoneyBenifits}')`;
        }
        if(role === 'student'){
            const { class:studentClass, scholarshipAmount, score } = req.body;
            userCreateQuery += `INSERT INTO students (user_id, class, scholarshipAmount, score) VALUES ((SELECT id from all_users where username = '${username}'), '${studentClass}', '${scholarshipAmount}', '${score}')`;
        }
        
        console.log(userCreateQuery);
        
        
        db.query(userCreateQuery, (err, result) => {
            if (err) {
                res.status(500).send("Error while inserting data into the database");
                return;
            }
            res.status(201).json({
                status: "success",
                message: "User created successfully"
            });
        });
    });
}
    
    
    
    module.exports = { login, register };
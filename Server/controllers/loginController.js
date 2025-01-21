const jwt = require("jsonwebtoken");
const { getDb } = require("../db/connectDb");
const { restrictUsers, allowUsers } = require("./utilController");

const login = async (req, res) => {
  const db = getDb();
  const { username, email, password } = req.body;

  const query = `SELECT * FROM allusers WHERE (username = $1 OR email = $2) AND password = $3`;
  await db.query(query, [username, email, password], (err, result) => {
    if (err) {
      return res.status(500).json({
        status: "failed",
        message: "Error while fetching data from the database",
        error: err.message,
      });
    }
    const userRes = result.rows;

    if (userRes.length > 0) {
      const user = {
        name: userRes[0].name,
        userId: userRes[0].id,
        username: userRes[0].username,
        role: userRes[0].role,
      };

      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1d" });

      return res.status(200).json({
        status: "success",
        message: "Login successful",
        user,
        token,
      });
    }

    return res.status(401).json({
      status: "failed",
      message: "Invalid username or password",
    });
  });
};

const register = async (req, res) => {
  const user = req.user;

  restrictUsers(res,['student','parent','teacher'],user.role,'to create a new user')

  const db = await getDb();
  const {
    username,
    password,
    role,
    age,
    phone,
    email,
    class: studentClass,
    scholarshipAmount,
    score,
    salary,
    department,
    assignedClasses,
    otherMoneyBenifits,
  } = req.body;

  const usernameCheckQuery = `SELECT * FROM AllUsers WHERE username = $1 OR email = $2`;

  try {
    const usernameCheckResult = await db.query(usernameCheckQuery, [
      username,
      email,
    ]);

    if (usernameCheckResult.rows.length > 0) {
      return res.status(409).json({
        status: "failed",
        message: "Username or email already exists",
      });
    }

    if (role === "superAdmin") {
      return res.status(403).json({
        status: "failed",
        message: "Access denied. Cannot create a user with superAdmin role",
      });
    }

    if (
      (role === "principal" && user.role !== "superAdmin") ||
      (role === "headMaster" &&
        user.role !== "superAdmin" &&
        user.role !== "principal")
    ) {
      return res.status(403).json({
        status: "failed",
        message: `Access denied. ${user.role} is not authorized to create a user with ${role} role`,
      });
    }

    const userCreateQuery = `INSERT INTO AllUsers (username, password, role, age, phone, email) 
                             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;

    const userRes = await db.query(userCreateQuery, [
      username,
      password,
      role,
      age,
      phone,
      email,
    ]);

    const userId = userRes.rows[0].id; // Get userId from the query result

    let roleInsertQuery = "";
    let roleParams = [];

    if (role === "principal") {
      roleInsertQuery = `INSERT INTO Principals (userId, salary, otherMoneyBenefits) 
                         VALUES ($1, $2, $3)`;
      roleParams = [userId, salary, JSON.stringify(otherMoneyBenifits)];
    } else if (role === "headMaster") {
      roleInsertQuery = `INSERT INTO HeadMasters (userId, salary, department, assignedClasses, otherMoneyBenefits) 
                         VALUES ($1, $2, $3, $4, $5)`;
      roleParams = [
        userId,
        salary,
        department,
        assignedClasses,
        JSON.stringify(otherMoneyBenifits),
      ];
    } else if (role === "teacher") {
      roleInsertQuery = `INSERT INTO Teachers (userId, salary, department, assignedClasses, otherMoneyBenefits) 
                         VALUES ($1, $2, $3, $4, $5)`;
      roleParams = [
        userId,
        salary,
        department,
        assignedClasses,
        JSON.stringify(otherMoneyBenifits),
      ];
    } else if (role === "student") {
      roleInsertQuery = `INSERT INTO Students (userId, class, scholarshipAmount, score) 
                         VALUES ($1, $2, $3, $4)`;
      roleParams = [userId, studentClass, scholarshipAmount, score];
    }

    if (roleInsertQuery) {
      await db.query(roleInsertQuery, roleParams);
    }

    return res.status(201).json({
      status: "success",
      message: `${role} role created successfully`,
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      status: "failed",
      message: "Error while creating user in the database",
      error: err.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  const user = req.user;

  allowUsers(res,['superAdmin'],user.role,'to get all users')

  const db = await getDb();
  const query = `SELECT id, username, role, name, email FROM allusers where role != 'superAdmin'`;

  await db.query(query, (err, dbRes) => {
    if (err) {
      return res.status(500).json({
        status: "failed",
        message: "Error while fetching data from the database",
        error: err.message,
      });
    }
    const result = dbRes.rows;

    res.status(200).json({
      status: "success",
      message: "Successfully fetched users",
      data: {
        users: result,
      },
    });
  });
};

const superAdminLogin = async (req, res) => {
  const user = req.user;
  const db = await getDb();

  allowUsers(res,['superAdmin'],user.role,'');

  
  const { username } = req.body;
  const query = `SELECT * FROM allusers WHERE username = $1`;

  await db.query(query, [username], (err, dbRes) => {
    if (err) {
      return res.status(500).json({
        status: "failed",
        message: "Error while fetching data from the database",
        error: err.message,
      });
    }
    const result = dbRes.rows;

    if (result.length > 0) {
      const user = {
        name: result[0].name,
        userId: result[0].id,
        username: result[0].username,
        role: result[0].role,
      };

      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1d" });

      return res.status(200).json({
        status: "success",
        message: "Login successful",
        user,
        token,
      });
    }

    return res.status(401).json({
      status: "failed",
      message: "Invalid username",
    });
  });
};

module.exports = { login, register, getAllUsers, superAdminLogin };

const { getDb } = require("../db/connectDb");
const jwt = require("jsonwebtoken");

const login = (req, res) => {
  const db = getDb();
  const { username, email, password } = req.body;

  const query = `SELECT * FROM allusers WHERE (username = ? OR email = ?) AND password = ?`;
  db.query(query, [username, email, password], (err, result) => {
    if (err) {
      return res.status(500).json({
        status: "failed",
        message: "Error while fetching data from the database",
        error: err.message,
      });
    }

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
      message: "Invalid username or password",
    });
  });
};

const register = (req, res) => {
  const user = req.user;

  if (
    !(
      user.role === "superAdmin" ||
      user.role === "principal" ||
      user.role === "headMaster"
    )
  ) {
    return res.status(403).json({
      status: "failed",
      message: "Access denied. You are not authorized to create a new user",
    });
  }

  const db = getDb();
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

  const usernameCheckQuery = `SELECT * FROM AllUsers WHERE username = ? OR email = ?`;

  db.query(usernameCheckQuery, [username, email], (err, result) => {
    if (err) {
      return res.status(500).json({
        status: "failed",
        message: "Error while checking for existing username or email",
        error: err.message,
      });
    }

    if (result.length > 0) {
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

    const userCreateQuery = `INSERT INTO AllUsers (username, password, role, age, phone, email) VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(
      userCreateQuery,
      [username, password, role, age, phone, email],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            status: "failed",
            message: "Error while creating user in the database",
            error: err.message,
          });
        }

        const userIdQuery = `SELECT id FROM AllUsers WHERE username = ?`;
        db.query(userIdQuery, [username], (err, result) => {
          if (err) {
            return res.status(500).json({
              status: "failed",
              message: "Error while retrieving user ID",
              error: err.message,
            });
          }

          const userId = result[0].id;
          let roleInsertQuery = "";

          if (role === "principal") {
            roleInsertQuery = `INSERT INTO Principals (userId, salary, otherMoneyBenefits) VALUES (?, ?, ?)`;
          } else if (role === "headMaster") {
            roleInsertQuery = `INSERT INTO HeadMasters (userId, salary, department, assignedClasses, otherMoneyBenefits) VALUES (?, ?, ?, ?, ?)`;
          } else if (role === "teacher") {
            roleInsertQuery = `INSERT INTO Teachers (userId, salary, department, assignedClasses, otherMoneyBenefits) VALUES (?, ?, ?, ?, ?)`;
          } else if (role === "student") {
            roleInsertQuery = `INSERT INTO Students (userId, class, scholarshipAmount, score) VALUES (?, ?, ?, ?)`;
          }

          if (roleInsertQuery) {
            const roleParams =
              role === "principal"
                ? [userId, salary, JSON.stringify(otherMoneyBenifits)]
                : role === "headMaster" || role === "teacher"
                ? [
                    userId,
                    salary,
                    department,
                    assignedClasses,
                    JSON.stringify(otherMoneyBenifits),
                  ]
                : [userId, studentClass, scholarshipAmount, score];

            db.query(roleInsertQuery, roleParams, (err) => {
              if (err) {
                return res.status(500).json({
                  status: "failed",
                  message: "Error while assigning role to the user",
                  error: err.message,
                });
              }

              return res.status(201).json({
                status: "success",
                message: `${role} role created successfully. Please login to continue`,
              });
            });
          } else {
            return res.status(201).json({
              status: "success",
              message: `${role} role created successfully`,
            });
          }
        });
      }
    );
  });
};

module.exports = { login, register };

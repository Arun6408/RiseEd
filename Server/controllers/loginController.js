const jwt = require("jsonwebtoken");
const { getDb } = require("../db/connectDb");
const { restrictUsers, allowUsers } = require("./utilController");
const login = async (req, res) => {
  try {
    const db = await getDb();
    const { username, email, password } = req.body;

    const query = `SELECT * FROM allusers WHERE (username = $1 OR email = $2) AND password = $3`;
    const result = await db.query(query, [username, email, password]); 

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: "failed",
        message: "Invalid username or password",
      });
    }

    const user = {
      name: result.rows[0].name,
      userId: result.rows[0].id,
      username: result.rows[0].username,
      role: result.rows[0].role,
    };

    const today = new Date().toISOString().split("T")[0];

    // Check if attendance already exists
    const checkAttendanceQuery = 
      `SELECT * FROM Attendance WHERE userId = $1 AND attendanceDate = $2`;
    const attendanceResult = await db.query(checkAttendanceQuery, [user.userId, today]);

    if (attendanceResult.rows.length === 0) {
      // Insert attendance only if it doesn't exist
      const attendanceQuery = 
        `INSERT INTO Attendance (userId, attendanceDate) VALUES ($1, $2)`;
      await db.query(attendanceQuery, [user.userId, today]);
    }

    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      user,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      status: "failed",
      message: "Error while processing login",
      error: err.message,
    });
  }
};




const register = async (req, res) => {
  try {
    const user = req.user;

    restrictUsers(res, ["student", "parent", "teacher"], user.role, "to create a new user");

    const db = await getDb();
    const {
      name,
      username,
      password,
      role,
      age,
      phone,
      email,
      class: studentClass,
      scholarshipAmount,
      score,
      department,
      assignedClasses,
      basicSalary,
      rentAllowance,
      foodAllowance,
      travelAllowance,
      otherAllowance,
      taxDeduction,
      providentFund,
      otherDeductions,
      lastIncrementDate,
      lastIncrementAmount,
      nextAppraisalDate,
      parentName,
      parentUsername,
      parentPassword,
      parentAge,
      parentPhoneNumber,
      parentEmail,
      totalFeeAmount,
      feePaid,
    } = req.body;


    if (!username || !email) {
      return res.status(400).json({
        status: "failed",
        message: "Username and email are required",
      });
    }

    const usernameCheckQuery = `
      SELECT * FROM AllUsers 
      WHERE username IN ($1, $2) OR email IN ($3, $4)
    `;
    
    const usernameCheckResult = await db.query(usernameCheckQuery, [
      username, 
      parentUsername || null, 
      email, 
      parentEmail || null
    ]);


    if (usernameCheckResult.rows.length > 0) {
      console.log('hi');
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
      (role === "headMaster" && !(user.role === "superAdmin" || user.role === "principal"))
    ) {
      return res.status(403).json({
        status: "failed",
        message: `Access denied. ${user.role} is not authorized to create a user with ${role} role`,
      });
    }

    const userCreateQuery = `
      INSERT INTO AllUsers (name, username, password, role, age, phone, email) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
    `;

    const userRes = await db.query(userCreateQuery, [name, username, password, role, age, phone, email]);
    const userId = userRes.rows[0].id;

    console.log("User created with ID:", userId);

    if (role === "headMaster" || role === "teacher") {
      const roleInsertQuery = `
        INSERT INTO ${role === "headMaster" ? "HeadMasters" : "Teachers"} 
        (userId, department, assignedClasses) VALUES ($1, $2, $3)
      `;
      await db.query(roleInsertQuery, [userId, department, JSON.stringify(assignedClasses)]);
    } 
    
    else if (role === "student") {
      const studentInsertQuery = `
        INSERT INTO Students (userId, class, scholarshipAmount, score) 
        VALUES ($1, $2, $3, $4)
      `;
      await db.query(studentInsertQuery, [userId, studentClass, scholarshipAmount, score]);

      if (parentName && parentUsername && parentPassword && parentEmail) {
        const parentCreateQuery = `
          INSERT INTO AllUsers (name, username, password, role, age, phone, email) 
          VALUES ($1, $2, $3, 'parent', $4, $5, $6) RETURNING id
        `;

        const parentRes = await db.query(parentCreateQuery, [
          parentName, parentUsername, parentPassword, parentAge, parentPhoneNumber, parentEmail,
        ]);
        const parentId = parentRes.rows[0].id;

        console.log("Parent created with ID:", parentId);

        const parentInsertQuery = `
          INSERT INTO Parents (userId, studentId, totalFee, feePaid) 
          VALUES ($1, $2, $3, $4)
        `;
        await db.query(parentInsertQuery, [parentId, userId, totalFeeAmount, feePaid]);
      }
    }

    if (role === "headMaster" || role === "teacher") {
      const salaryInsertQuery = `
        INSERT INTO Salaries (
          userId, basic, rentAllowance, foodAllowance, travelAllowance, 
          otherAllowance, taxDeduction, providentFund, otherDeductions, 
          lastIncrementDate, lastIncrementAmount, nextAppraisalDate
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `;

      await db.query(salaryInsertQuery, [
        userId, basicSalary, rentAllowance, foodAllowance, travelAllowance,
        otherAllowance, taxDeduction, providentFund, otherDeductions,
        lastIncrementDate, lastIncrementAmount, nextAppraisalDate
      ]);
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

  allowUsers(res, ["superAdmin"], user.role, "to get all users");

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

    return res.status(200).json({
      status: "success",
      message: "Successfully fetched users",
      data: {
        users: result,
      },
    });
  });
};

const superAdminLogin = async (req, res) => {
  try {
    const user = req.user;
    const db = await getDb();

    allowUsers(res, ["superAdmin"], user.role, "");

    const { username } = req.body;
    const query = `SELECT * FROM allusers WHERE username = $1;`;

    const dbRes = await db.query(query, [username]); // ✅ Use `await` instead of callback

    if (dbRes.rows.length > 0) {
      const user = {
        name: dbRes.rows[0].name,
        userId: dbRes.rows[0].id,
        username: dbRes.rows[0].username,
        role: dbRes.rows[0].role,
      };
    const checkAttendanceQuery = `SELECT * FROM Attendance WHERE userId = $1 AND attendanceDate = $2`;
    const attendanceResult = await db.query(checkAttendanceQuery, [user.userId, new Date().toISOString().split("T")[0]]);

    if (attendanceResult.rows.length === 0) {

      const attendancequery = `
      INSERT INTO Attendance (userId, attendanceDate)
      VALUES ($1, DATE($2));`;
      await db.query(attendancequery, [
        user.userId,
        new Date().toISOString().split("T")[0]
      ]);
    }

      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1d" });
      console.log(user);


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
  } catch (err) {
    return res.status(500).json({
      status: "failed",
      message: "Error while fetching data from the database",
      error: err.message,
    });
  }
};

module.exports = { login, register, getAllUsers, superAdminLogin };

const { getDb } = require("../../db/connectDb");
const { restrictUsers } = require("../utilController");

const getAllCourses = async (req, res) => {
  const db = getDb();
  const query = `
  SELECT courseId, title, class, description, name as taughtBy 
  FROM courses as c 
  JOIN allusers as au on c.userId = au.id
  `;
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).json({
        status: "error",
        message: "Error while fetching courses",
        error: err,
      });
      return;
    }
    res.status(200).json({
      status: "success",
      results: result.length,
      data: {
        courses: result,
      },
    });
  });
};

const createCourse = async (req, res) => {
  const db = getDb();
  const { title, description, class: courseClasses, content } = req.body;
  const role = req.user.role;

  if (restrictUsers(res, ["student", "principal"], role, "create a new course")) {
    return;
  }

  db.query(`SELECT * FROM courses WHERE title = ?`, [title], (err, result) => {
    if (err) {
      res.status(500).json({
        status: "error",
        message: "Error while checking for existing courses",
        error: err,
      });
      return;
    }
    if (result.length > 0) {
      res.status(409).json({
        status: "error",
        message: "Course with the same title already exists",
      });
      return;
    }

    const userId = req.user.userId;
    const assignedClassesQuery = `
      SELECT assignedClasses, department 
      FROM teachers WHERE userId = ? 
      UNION 
      SELECT assignedClasses, department 
      FROM HeadMasters WHERE userId = ?
    `;
    db.query(assignedClassesQuery, [userId, userId], (err, result) => {
      if (err) {
        res.status(500).json({
          status: "error",
          message: "Error while fetching assigned classes",
          error: err,
        });
        return;
      }
      if (!result.length) {
        res.status(403).json({
          status: "error",
          message: "You are not authorized to create a course in the selected classes",
        });
        return;
      }

      const department = result[0].department;
      const assignedClasses = result[0].assignedClasses
        .split(",")
        .map((c) => parseInt(c))
        .filter((c) => courseClasses.includes(c))
        .join(",");

      if (!assignedClasses.length) {
        res.status(403).json({
          status: "error",
          message: "No matching classes found to create a course",
        });
        return;
      }

      const query = `INSERT INTO Courses (title, description, content, class, department, userId) VALUES (?, ?, ?, ?, ?, ?)`;
      db.query(
        query,
        [title, description, content, assignedClasses, department, userId],
        (err, result) => {
          if (err) {
            res.status(500).json({
              status: "error",
              message: "Error while creating the course",
              error: err,
            });
            return;
          }
          res.status(201).json({
            status: "success",
            message: `${title} Course created successfully`,
          });
        }
      );
    });
  });
};

const getCourse = async (req, res) => {
  const { courseId } = req.params;
  const db = getDb();
  const query = `
    SELECT courseId, title, class, description, name as taughtBy 
    FROM courses as c 
    JOIN allusers as au on c.userId = au.id
    WHERE courseId = ?
  `;
  db.query(query, [courseId], (err, result) => {
    if (err) {
      res.status(500).json({
        status: "error",
        message: "Error while fetching the course",
        error: err,
      });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Course not found",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      data: result[0],
    });
  });
};

const deleteCourse = (req, res) => {
  const db = getDb();
  const { courseId } = req.params;

  if (restrictUsers(res, ["student"], req.user.role, "delete a course")) {
    return;
  }

  const deleteCourseQuery = `DELETE FROM Courses WHERE courseId = ?`;
  db.query(deleteCourseQuery, [courseId], (err, result) => {
    if (err) {
      res.status(500).json({
        status: "error",
        message: "Error while deleting the course",
        error: err,
      });
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).json({
        status: "error",
        message: "Course not found",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      message: "Course deleted successfully",
    });
  });
};

module.exports = {
  getAllCourses,
  createCourse,
  getCourse,
  deleteCourse,
};

const { getDb } = require("../../db/connectDb");
const { restrictUsers, getUserId } = require("../utilController");

const getAllCourses = async (req, res) => {
  const userId = getUserId(req);
  const db = await getDb();
  const query = `
    SELECT c.courseId, c.title, c.class, c.description, au.name AS taughtBy
    FROM courses AS c
    JOIN allusers AS au ON c.userId = au.id
  `;

  try {
    const result = await db.query(query);
    

    // Manually map keys to camelCase
    const formattedRows = result.rows.map((row) => ({
      courseId: row.courseid,
      title: row.title,
      class: row.class,
      description: row.description,
      taughtBy: row.taughtby,
    }));

    return res.status(200).json({
      status: "success",
      results: formattedRows.length,
      data: {
        courses: formattedRows,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error while fetching courses",
      error: err.message,
    });
  }
};


const createCourse = async (req, res) => {
  const db = await getDb();
  const { title, description, class: courseClasses, content } = req.body;
  const role = req.user.role;

  if (restrictUsers(res, ["student", "parent"], role, "create a new course")) {
    return;
  }

  try {
    // Check for duplicate course title
    const duplicateCheckQuery = `SELECT * FROM courses WHERE title = $1`;
    const duplicateResult = await db.query(duplicateCheckQuery, [title]);

    if (duplicateResult.rows.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "Course with the same title already exists",
      });
    }

    // Fetch assigned classes and department for the user
    const userId = req.user.userId;
    const assignedClassesQuery = `
      SELECT assignedClasses, department 
      FROM teachers WHERE userId = $1
    `;
    const assignedResult = await db.query(assignedClassesQuery, [userId]);

    if (assignedResult.rows.length === 0) {
      return res.status(403).json({
        status: "error",
        message:
          "You are not authorized to create a course in the selected classes",
      });
    }

    const department = assignedResult.rows[0].department;
    const assignedClasses = assignedResult.rows[0].assignedclasses
      .split(",")
      .map((c) => parseInt(c))
      .filter((c) => courseClasses.includes(c))
      .join(",");

    if (!assignedClasses.length) {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to create a course in any of these classes",
      });
    }

    // Insert the new course
    const createCourseQuery = `
      INSERT INTO Courses (title, description, content, class, department, userId) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING courseId
    `;
    const createResult = await db.query(createCourseQuery, [
      title,
      description,
      content,
      assignedClasses,
      department,
      userId,
    ]);

    return res.status(201).json({
      status: "success",
      message: `${title} Course created successfully`,
      courseId: createResult.rows[0].courseid,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error while creating the course",
      error: err.message,
    });
  }
};

const getCourse = async (req, res) => {
  const { courseId } = req.params;
  const db = await getDb();

  const query = `
    SELECT courseId, title, class, description, name as taughtBy
    FROM courses as c
    JOIN allusers as au on c.userId = au.id
    WHERE courseId = $1
  `;

  try {
    const result = await db.query(query, [courseId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    // Manually map keys to camelCase
    const course = {
      courseId: result.rows[0].courseid,
      title: result.rows[0].title,
      class: result.rows[0].class,
      description: result.rows[0].description,
      taughtBy: result.rows[0].taughtby,
    };

    return res.status(200).json({
      status: "success",
      data: course,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error while fetching the course",
      error: err.message,
    });
  }
};


const deleteCourse = async (req, res) => {
  const db = await getDb();
  const { courseId } = req.params;
  restrictUsers(res, ["student"], req.user.role, "delete a course")

  const deleteCourseQuery = `DELETE FROM Courses WHERE courseId = $1`;

  try {
    const result = await db.query(deleteCourseQuery, [courseId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Course deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error while deleting the course",
      error: err.message,
    });
  }
};

module.exports = {
  getAllCourses,
  createCourse,
  getCourse,
  deleteCourse,
};

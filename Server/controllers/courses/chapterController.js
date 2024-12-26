const { getDb } = require("../../db/connectDb");
const { restrictUsers } = require("../utilController");

const getAllChapters = async (req, res) => {
  const db = getDb();
  const { courseId } = req.params;
  const query = `
      SELECT chapterId, title, description, content, courseId 
      FROM chapters
      WHERE courseId = ?
    `;
  db.query(query, [courseId], (err, result) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Error while fetching chapters",
        error: err.message,
      });
    }
    if (result.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No chapters found for this course.",
      });
    }
    res.status(200).json({
      status: "success",
      results: result.length,
      data: { chapters: result },
    });
  });
};

const createChapter = async (req, res) => {
  const db = getDb();
  const { courseId } = req.params;
  const { title, description, content } = req.body;
  const role = req.user.role;

  restrictUsers(res, ["student", "principal"], role, "to create a new chapter");

  const checkDuplicateQuery = `
    SELECT * FROM chapters WHERE courseId = ? AND title = ?
  `;

  db.query(checkDuplicateQuery, [courseId, title], (err, result) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Error while checking for duplicate chapters",
        error: err.message,
      });
    }
    if (result.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "Chapter with the same title already exists in this course.",
      });
    }

    const checkCourseQuery = `SELECT * FROM Courses WHERE courseId = ?`;

    db.query(checkCourseQuery, [courseId], (err, result) => {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Error while verifying course existence",
          error: err.message,
        });
      }
      if (result.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Course not found to add a chapter.",
        });
      }

      const query = `
        INSERT INTO Chapters (title, description, content, courseId) 
        VALUES (?, ?, ?, ?)
      `;
      db.query(query, [title, description, content, courseId], (err) => {
        if (err) {
          return res.status(500).json({
            status: "error",
            message: "Error while creating chapter",
            error: err.message,
          });
        }
        res.status(201).json({
          status: "success",
          message: "Chapter created successfully",
          data: { message: `${title} Chapter created successfully` },
        });
      });
    });
  });
};

const getChapter = async (req, res) => {
  const { chapterId, courseId } = req.params;
  const db = getDb();
  const query = `
    SELECT chapterId, title, description, content, courseId 
    FROM chapters 
    WHERE chapterId = ? AND courseId = ?
  `;
  db.query(query, [chapterId, courseId], (err, result) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Error while fetching chapter",
        error: err.message,
      });
    }
    if (result.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Chapter not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: result[0],
    });
  });
};

const deleteChapter = (req, res) => {
  const db = getDb();
  const { chapterId, courseId } = req.params;

  restrictUsers(res, ["student"], req.user.role, "to delete a chapter");

  const deleteChapterQuery = `
    DELETE FROM Chapters WHERE chapterId = ? AND courseId = ?
  `;

  db.query(deleteChapterQuery, [chapterId, courseId], (err, result) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Error while deleting chapter",
        error: err.message,
      });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Chapter not found with the specified course",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Chapter deleted successfully",
    });
  });
};

module.exports = {
  getAllChapters,
  createChapter,
  getChapter,
  deleteChapter,
};

const { getDb } = require("../../db/connectDb");
const { restrictUsers } = require("../utilController");

const getAllChapters = async (req, res) => {
  const db = await getDb();
  const { courseId } = req.params;

  const query = `
    SELECT chapterId, title, description, content, courseId 
    FROM chapters
    WHERE courseId = $1
  `;

  try {
    const result = await db.query(query, [courseId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No chapters found for this course.",
      });
    }

    const formattedChapters = result.rows.map((chapter) => ({
      chapterId: chapter.chapterid,
      title: chapter.title,
      description: chapter.description,
      content: chapter.content,
      courseId: chapter.courseid,
    }));

    return res.status(200).json({
      status: "success",
      results: formattedChapters.length,
      data: { chapters: formattedChapters },
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error while fetching chapters",
      error: err.message,
    });
  }
};

const createChapter = async (req, res) => {
  const db = await getDb();
  const { courseId } = req.params;
  const { title, description, content } = req.body;
  const role = req.user.role;

  if (restrictUsers(res, ["student", "principal"], role, "to create a new chapter")) {
    return; // Ensure no duplicate responses
  }

  const checkDuplicateQuery = `SELECT * FROM Chapters WHERE courseId = $1 AND title = $2`;
  const checkCourseQuery = `SELECT * FROM Courses WHERE courseId = $1`;
  const createChapterQuery = `INSERT INTO Chapters (title, description, content, courseId) VALUES ($1, $2, $3, $4) RETURNING chapterId`;

  try {
    const duplicateResult = await db.query(checkDuplicateQuery, [courseId, title]);
    if (duplicateResult.rows.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "Chapter with the same title already exists in this course.",
      });
    }

    const courseResult = await db.query(checkCourseQuery, [courseId]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Course not found to add a chapter.",
      });
    }

    const createResult = await db.query(createChapterQuery, [title, description, content, courseId]);

    return res.status(201).json({
      status: "success",
      message: "Chapter created successfully",
      data: { message: `${title} Chapter created successfully` },
      chapterId: createResult.rows[0].chapterid,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error while creating chapter",
      error: err.message,
    });
  }
};

const getChapter = async (req, res) => {
  const { chapterId, courseId } = req.params;
  const db = await getDb();
  const query = `
    SELECT chapterId, title, description, content, courseId 
    FROM Chapters 
    WHERE chapterId = $1 AND courseId = $2
  `;

  try {
    const result = await db.query(query, [chapterId, courseId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Chapter not found",
      });
    }

    const chapter = {
      chapterId: result.rows[0].chapterid,
      title: result.rows[0].title,
      description: result.rows[0].description,
      content: result.rows[0].content,
      courseId: result.rows[0].courseid,
    };

    return res.status(200).json({
      status: "success",
      data: chapter,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error while fetching chapter",
      error: err.message,
    });
  }
};

const deleteChapter = async (req, res) => {
  const db = await getDb();
  const { chapterId, courseId } = req.params;

  if (restrictUsers(res, ["student"], req.user.role, "to delete a chapter")) {
    return;
  }

  const deleteChapterQuery = `DELETE FROM Chapters WHERE chapterId = $1 AND courseId = $2`;

  try {
    const result = await db.query(deleteChapterQuery, [chapterId, courseId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "Chapter not found with the specified course",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Chapter deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error while deleting chapter",
      error: err.message,
    });
  }
};

module.exports = {
  getAllChapters,
  createChapter,
  getChapter,
  deleteChapter,
};

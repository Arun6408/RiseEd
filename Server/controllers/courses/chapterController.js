const { getDb } = require("../../db/connectDb");
const { restrictUsers } = require("../utilController");

const getAllChapters = async (req, res) => {
  const db = await getDb(); // Ensure the connection is established
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

    // Manually map keys to camelCase
    const formattedChapters = result.rows.map((chapter) => ({
      chapterId: chapter.chapterid,
      title: chapter.title,
      description: chapter.description,
      content: chapter.content,
      courseId: chapter.courseid,
    }));

    res.status(200).json({
      status: "success",
      results: formattedChapters.length,
      data: { chapters: formattedChapters },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error while fetching chapters",
      error: err.message,
    });
  }
};



const createChapter = async (req, res) => {
  const db = await getDb(); // Ensure the connection is established
  const { courseId } = req.params;
  const { title, description, content } = req.body;
  const role = req.user.role;

  // Restrict users who cannot create chapters
  restrictUsers(res, ["student", "principal"], role, "to create a new chapter");

  const checkDuplicateQuery = `
    SELECT * FROM Chapters WHERE courseId = $1 AND title = $2
  `;
  const checkCourseQuery = `
    SELECT * FROM Courses WHERE courseId = $1
  `;
  const createChapterQuery = `
    INSERT INTO Chapters (title, description, content, courseId) 
    VALUES ($1, $2, $3, $4) RETURNING chapterId
  `;

  try {
    // Check for duplicate chapter titles in the course
    const duplicateResult = await db.query(checkDuplicateQuery, [courseId, title]);
    if (duplicateResult.rows.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "Chapter with the same title already exists in this course.",
      });
    }

    // Verify if the course exists
    const courseResult = await db.query(checkCourseQuery, [courseId]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Course not found to add a chapter.",
      });
    }

    // Create the chapter
    const createResult = await db.query(createChapterQuery, [title, description, content, courseId]);

    res.status(201).json({
      status: "success",
      message: "Chapter created successfully",
      data: { message: `${title} Chapter created successfully` },
      chapterId: createResult.rows[0].chapterid,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error while creating chapter",
      error: err.message,
    });
  }
};


const getChapter = async (req, res) => {
  const { chapterId, courseId } = req.params;
  const db = await getDb(); // Ensure the connection is established
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

    // Manually map keys to camelCase
    const chapter = {
      chapterId: result.rows[0].chapterid,
      title: result.rows[0].title,
      description: result.rows[0].description,
      content: result.rows[0].content,
      courseId: result.rows[0].courseid,
    };

    res.status(200).json({
      status: "success",
      data: chapter,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error while fetching chapter",
      error: err.message,
    });
  }
};



const deleteChapter = async (req, res) => {
  const db = await getDb(); // Ensure the connection is established
  const { chapterId, courseId } = req.params;

  restrictUsers(res, ["student"], req.user.role, "to delete a chapter");

  const deleteChapterQuery = `
    DELETE FROM Chapters WHERE chapterId = $1 AND courseId = $2
  `;

  try {
    const result = await db.query(deleteChapterQuery, [chapterId, courseId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "Chapter not found with the specified course",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Chapter deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
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

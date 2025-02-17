const { getDb } = require("../db/connectDb");
const CustomError = require("../errorHandlers/CustomError");

// Create a new quiz
const createQuiz = async (req, res) => {
  const db = await getDb(); // Await the db connection
  const createdByUserId = req.user.userId;
  const {
    quizTitle,
    quizDescription,
    quizCourseId,
    assignedClasses,
    questions,
  } = req.body;
  console.log(req.body);

  const query = `
    INSERT INTO Quiz (quizTitle, quizDescription, quizCourseId, createdByUserId, assignedClasses)
    VALUES ($1, $2, $3, $4, $5) RETURNING quizId
  `;

  try {
    const result = await db.query(query, [
      quizTitle,
      quizDescription,
      quizCourseId,
      createdByUserId,
      assignedClasses,
    ]);
    const quizId = result.rows[0].quizid;

    const questionsQuery = `
      INSERT INTO QuizQuestions (quizId, question, optionA, optionB, optionC, optionD, correctAnswer, difficulty)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    for (const question of questions) {
      await db.query(
        questionsQuery,
        [
          quizId,
          question.question,
          question.optionA,
          question.optionB,
          question.optionC,
          question.optionD,
          question.correctAnswer,
          question.difficulty,
        ],
        (err) => {
          if (err) {
            console.error(
              `Error inserting question for quiz ${quizId}:`,
              err.message
            );
            throw new CustomError(err.message, 500);
          }
        }
      );
    }

    return res.status(201).json({
      status: "success",
      message: "Quiz created successfully",
      quizId: quizId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Error while creating quiz",
      error: err.message,
    });
  }
};

const getAllQuizzes = async (req, res) => {
  const db = await getDb();
  const query = `
    SELECT q.quizId, q.quizTitle, q.quizDescription, q.quizCourseId, q.createdByUserId, q.assignedClasses, q.createdAt, 
           c.title AS courseTitle, u.name AS teacherName
    FROM Quiz q
    LEFT JOIN Courses c ON q.quizCourseId = c.courseId
    LEFT JOIN AllUsers u ON c.userId = u.id
  `;

  try {
    const result = await db.query(query);
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No quizzes found",
      });
    }
    return res.status(200).json({
      status: "success",
      results: result.rows.length,
      data: { quizzes: result.rows },
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error while fetching quizzes",
      error: err.message,
    });
  }
};

// Get a specific quiz by ID along with questions
const getQuiz = async (req, res) => {
  const db = await getDb();
  const { quizId } = req.params;

  const quizQuery = `
    SELECT q.quizId, q.quizTitle, q.quizDescription, q.quizCourseId, q.createdByUserId, q.assignedClasses, q.createdAt, 
           c.title AS courseTitle, c.courseId, u.name AS teacherName
    FROM Quiz q
    LEFT JOIN Courses c ON q.quizCourseId = c.courseId
    LEFT JOIN AllUsers u ON c.userId = u.id
    WHERE q.quizId = $1
  `;

  try {
    const result = await db.query(quizQuery, [quizId]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Quiz not found",
      });
    }

    const quizQuestionsQuery = `
      SELECT quizQuestionId, question, optionA, optionB, optionC, optionD, correctAnswer, difficulty
      FROM QuizQuestions
      WHERE quizId = $1
    `;

    const questionsResult = await db.query(quizQuestionsQuery, [quizId]); // Fetch quiz questions

    return res.status(200).json({
      status: "success",
      data: {
        quizDetails: result.rows[0],
        questions: questionsResult.rows,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error while fetching quiz details",
      error: err.message,
    });
  }
};

// Delete a quiz by ID
const deleteQuiz = async (req, res) => {
  const db = await getDb(); // Ensure the connection is established
  const { quizId } = req.params;

  const deleteQuizQuestionsQuery = `
    DELETE FROM QuizQuestions WHERE quizId = $1
  `;

  const deleteQuizQuery = `
    DELETE FROM Quiz WHERE quizId = $1
  `;

  try {
    // This is important because it ensures both queries are successfully executed if one fails whole process comes to inital state
    // Start a transaction
    await db.query("BEGIN");

    // Delete quiz questions
    await db.query(deleteQuizQuestionsQuery, [quizId]);

    // Delete the quiz
    await db.query(deleteQuizQuery, [quizId]);

    // Commit the transaction
    await db.query("COMMIT");

    return res.status(200).json({
      status: "success",
      message: "Quiz deleted successfully",
    });
  } catch (err) {
    // Rollback the transaction if any query fails
    await db.query("ROLLBACK");

    return res.status(500).json({
      status: "error",
      message: "Error while deleting quiz",
      error: err.message,
    });
  }
};

const createQuizResults = async (req, res) => {
  const db = await getDb();
  const {
    quizId,
    userId,
    totalQues,
    correctCount,
    wrongCount,
    skippedCount,
    timeSpent,
    score,
  } = req.body;

  const query = `
    INSERT INTO QuizResults (quizId, userId, totalQues, correctCount, wrongCount, skippedCount, timeSpent, score)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING resultId
  `;
  await db.query(
    query,
    [
      quizId,
      userId,
      totalQues,
      correctCount,
      wrongCount,
      skippedCount,
      timeSpent,
      score,
    ],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          status: "error",
          message: "Error while creating Quiz Result",
          error: err.message,
        });
      }
      console.log(result.rows);
      return res.status(201).json({
        status: "success",
        message: "Quiz results created successfully",
        quizResultId: result.rows[0].resultid,
      });
    }
  );
};

const getAllQuizzResults = async (req, res) => {
  try {
    const db = await getDb();
    const { userId, quizId } = req.body;

    let query = `
      SELECT qr.resultId, qr.quizId, qr.userId, qr.totalQues, qr.correctCount, qr.wrongCount, qr.skippedCount, qr.timeSpent, qr.score, 
             u.name AS studentName, c.title AS courseTitle
      FROM QuizResults qr
      LEFT JOIN Quiz q ON qr.quizId = q.quizId
      LEFT JOIN Courses c ON q.quizCourseId = c.courseId
      LEFT JOIN AllUsers u ON qr.userId = u.id
      WHERE 1=1
    `;

    const params = [];

    if (userId) {
      query += ` AND qr.userId = $${params.length + 1}`;
      params.push(userId);
    }
    if (quizId) {
      query += ` AND qr.quizId = $${params.length + 1}`;
      params.push(quizId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No quiz results found",
      });
    }

    return res.status(200).json({
      status: "success",
      results: result.rows.length,
      data: { quizResults: result.rows },
    });
  } catch (error) {
    console.error("Database error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
};

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuiz,
  deleteQuiz,
  createQuizResults,
  getAllQuizzResults,
};

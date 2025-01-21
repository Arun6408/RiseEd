const { getDb } = require("../db/connectDb");

// Create a new quiz
const createQuiz = async (req, res) => {
  const db = await getDb();  // Await the db connection
  const { quizTitle, quizDescription, quizCourseId, createdByUserId, assignedClasses, questions } = req.body;

  const query = `
    INSERT INTO Quiz (quizTitle, quizDescription, quizCourseId, createdByUserId, assignedClasses)
    VALUES ($1, $2, $3, $4, $5) RETURNING quizId
  `;

  try {
    const result = await db.query(query, [quizTitle, quizDescription, quizCourseId, createdByUserId, assignedClasses]);
    const quizId = result.rows[0].quizId; 

    const questionsQuery = `
      INSERT INTO QuizQuestions (quizId, question, optionA, optionB, optionC, optionD, correctAnswer, difficulty)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    
    for (const question of questions) {
      await db.query(questionsQuery, [
        quizId,
        question.question,
        question.optionA,
        question.optionB,
        question.optionC,
        question.optionD,
        question.correctAnswer,
        question.difficulty
      ]);
    }

    res.status(201).json({
      status: "success",
      message: "Quiz created successfully",
      quizId: quizId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Error while creating quiz",
      error: err.message
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
    res.status(200).json({
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

    const questionsResult = await db.query(quizQuestionsQuery, [quizId]);  // Fetch quiz questions

    res.status(200).json({
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
  const db = await getDb();  // Ensure the connection is established
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
    await db.query('BEGIN');

    // Delete quiz questions
    await db.query(deleteQuizQuestionsQuery, [quizId]);

    // Delete the quiz
    await db.query(deleteQuizQuery, [quizId]);

    // Commit the transaction
    await db.query('COMMIT');

    res.status(200).json({
      status: "success",
      message: "Quiz deleted successfully",
    });
  } catch (err) {
    // Rollback the transaction if any query fails
    await db.query('ROLLBACK');

    res.status(500).json({
      status: "error",
      message: "Error while deleting quiz",
      error: err.message,
    });
  }
};


module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuiz,
  deleteQuiz
};
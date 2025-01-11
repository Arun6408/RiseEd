const { getDb } = require("../db/connectDb");

// Create a new quiz
const createQuiz = async (req, res) => {
  const db = getDb();
  const { quizTitle, quizDescription, quizCourseId, createdByUserId, assignedClasses, questions } = req.body;

  const query = `
    INSERT INTO Quiz (quizTitle, quizDescription, quizCourseId, createdByUserId, assignedClasses)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [quizTitle, quizDescription, quizCourseId, createdByUserId, assignedClasses], (err, result) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Error while creating quiz",
        error: err.message,
      });
    }

    const quizId = result.insertId;

    // Insert quiz questions
    const questionsQuery = `
      INSERT INTO QuizQuestions (quizId, question, optionA, optionB, optionC, optionD, correctAnswer, difficulty)
      VALUES ?
    `;

    const questionsData = questions.map(q => [
      quizId, q.question, q.optionA, q.optionB, q.optionC, q.optionD, q.correctAnswer, q.difficulty
    ]);

    db.query(questionsQuery, [questionsData], (err) => {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Error while adding quiz questions",
          error: err.message,
        });
      }
      res.status(201).json({
        status: "success",
        message: "Quiz created successfully",
        quizId: quizId
      });
    }); 
  });
};

// Get all quizzes
const getAllQuizzes = async (req, res) => {
    const db = getDb();
    const query = `
      SELECT q.quizId, q.quizTitle, q.quizDescription, q.quizCourseId, q.createdByUserId, q.assignedClasses, q.createdAt, 
             c.title AS courseTitle, u.name AS teacherName
      FROM Quiz q
      LEFT JOIN Courses c ON q.quizCourseId = c.courseId
      LEFT JOIN AllUsers u ON c.userId = u.id
    `;
    
    db.query(query, (err, result) => {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Error while fetching quizzes",
          error: err.message,
        });
      }
      if (result.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "No quizzes found",
        });
      }
      res.status(200).json({
        status: "success",
        results: result.length,
        data: { quizzes: result },
      });
    });
  };
  

// Get a specific quiz by ID along with questions
const getQuiz = async (req, res) => {
    const db = getDb();
    const { quizId } = req.params;
  
    const quizQuery = `
      SELECT q.quizId, q.quizTitle, q.quizDescription, q.quizCourseId, q.createdByUserId, q.assignedClasses, q.createdAt, 
             c.title AS courseTitle, c.courseId, u.name AS teacherName
      FROM Quiz q
      LEFT JOIN Courses c ON q.quizCourseId = c.courseId
      LEFT JOIN AllUsers u ON c.userId = u.id
      WHERE q.quizId = ?
    `;
    
    db.query(quizQuery, [quizId], (err, result) => {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Error while fetching quiz details",
          error: err.message,
        });
      }
      if (result.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Quiz not found",
        });
      }
  
      const quizQuestionsQuery = `
        SELECT quizQuestionId, question, optionA, optionB, optionC, optionD, correctAnswer, difficulty
        FROM QuizQuestions
        WHERE quizId = ?
      `;
  
      db.query(quizQuestionsQuery, [quizId], (err, questions) => {
        if (err) {
          return res.status(500).json({
            status: "error",
            message: "Error while fetching quiz questions",
            error: err.message,
          });
        }
        res.status(200).json({
          status: "success",
          data: {
            quizDetails: result[0],
            questions: questions
          },
        });
      });
    });
  };
  

// Delete a quiz by ID
const deleteQuiz = async (req, res) => {
  const db = getDb();
  const { quizId } = req.params;

  const deleteQuestionsQuery = `
    DELETE FROM QuizQuestions WHERE quizId = ?
  `;
  
  db.query(deleteQuestionsQuery, [quizId], (err) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: "Error while deleting quiz questions",
        error: err.message,
      });
    }

    const deleteQuizQuery = `
      DELETE FROM Quiz WHERE quizId = ?
    `;

    db.query(deleteQuizQuery, [quizId], (err) => {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Error while deleting quiz",
          error: err.message,
        });
      }
      res.status(200).json({
        status: "success",
        message: "Quiz deleted successfully"
      });
    });
  });
};

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuiz,
  deleteQuiz
};
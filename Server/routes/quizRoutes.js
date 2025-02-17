const express = require('express');
const { createQuiz, getAllQuizzes, getQuiz, deleteQuiz, createQuizResults, getAllQuizzResults } = require('../controllers/quizController');
const { validateCreateQuizResult, validate, validateCreateQuiz } = require('../middleware/validationMiddleware');
const quizRouter = express.Router();

quizRouter.route('/quiz').post(validateCreateQuiz,validate,createQuiz).get(getAllQuizzes);
quizRouter.route('/quiz/:quizId').get(getQuiz).delete(deleteQuiz);

//quiz Results
quizRouter.route('/quizResults').post(validateCreateQuizResult,validate,createQuizResults).get(getAllQuizzResults);

module.exports = quizRouter;

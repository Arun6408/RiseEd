const express = require('express');
const { createQuiz, getAllQuizzes, getQuiz, deleteQuiz } = require('../controllers/quizController');
const quizRouter = express.Router();

quizRouter.route('/').post(createQuiz).get(getAllQuizzes);
quizRouter.route('/:quizId').get(getQuiz).delete(deleteQuiz);

module.exports = quizRouter;

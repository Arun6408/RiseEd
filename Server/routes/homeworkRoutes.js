const express = require('express');
const { getHomeWorks, createHomework, getSubmittedHomeworks, submitHomework, gradeUpdate } = require('../controllers/homeworkController');
const homeworkRouter = express.Router();

homeworkRouter.route('/').get(getHomeWorks).post(createHomework);
homeworkRouter.route('/submit').get(getSubmittedHomeworks).post(submitHomework).patch(gradeUpdate);

module.exports = homeworkRouter;
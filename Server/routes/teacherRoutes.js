const express = require('express');
const { teacherDashboardInfo } = require('../controllers/teacherController');

const teacherRouter = express.Router();

teacherRouter.get('/dashboard',teacherDashboardInfo);

module.exports = teacherRouter;
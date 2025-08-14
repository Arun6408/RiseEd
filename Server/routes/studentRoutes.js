const express = require('express');

const { studentDashboardInfo, studentSelfAnalysis } = require('../controllers/studentController');

const studentRouter = express.Router();

studentRouter.get('/dashboard',studentDashboardInfo);
studentRouter.get('/selfAnalysis', studentSelfAnalysis);

module.exports = studentRouter;

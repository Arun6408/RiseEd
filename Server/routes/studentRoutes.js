const express = require('express');
const { studentDashboardInfo } = require('../controllers/studentController');

const studentRouter = express.Router();

studentRouter.get('/dashboard',studentDashboardInfo);


module.exports = studentRouter;

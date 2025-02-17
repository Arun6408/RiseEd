
const express = require('express');
const { getSalaries, paySalary } = require('../controllers/salariesController');
const salariesRouter = express.Router();

salariesRouter.route('/').get(getSalaries);
salariesRouter.route('/pay').post(paySalary);

module.exports = salariesRouter;
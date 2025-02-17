const express = require('express');
const { updateWatchTime } = require('../controllers/videosController');
const { validateWatchTime, validate } = require('../middleware/validationMiddleware');
const videoRouter = express.Router();

videoRouter.patch('/updateWatchStatus',validateWatchTime,validate,updateWatchTime);

module.exports = videoRouter;
const express = require('express');
const { getAllEbooks, createEbook, getEbookById, deleteEbook } = require('../controllers/ebooksController');
const { validateCreateEbook, validate } = require('../middleware/validationMiddleware');
const ebooksRouter = express.Router();

ebooksRouter.route('/').get(getAllEbooks).post(validateCreateEbook,validate,createEbook);
ebooksRouter.route('/:id').get(getEbookById).delete(deleteEbook);

module.exports = ebooksRouter;
const express = require("express");
const { getAllCourses, createCourse, getCourse, deleteCourse } = require("../controllers/courses/courseController");
const { validateCreateChapter, validateCreateCourse, validate, validateCreateTopic } = require("../middleware/validationMiddleware");
const { getAllChapters, createChapter, getChapter, deleteChapter } = require("../controllers/courses/chapterController");
const { getAllTopics, createTopic, getTopic, deleteTopic, updateTopicTime } = require("../controllers/courses/topicController");
const courseRouter = express.Router();

//course routes
courseRouter.route('/').get(getAllCourses).post(validateCreateCourse,validate,createCourse);
courseRouter.route('/:courseId').get(getCourse).delete(deleteCourse);

//chapter routes
courseRouter.route('/:courseId/chapters').get(getAllChapters).post(validateCreateChapter,validate,createChapter);
courseRouter.route('/:courseId/chapters/:chapterId').get(getChapter).delete(deleteChapter);

//topic routes
courseRouter.route('/:courseId/chapters/:chapterId/topics').get(getAllTopics).post(validateCreateTopic,validate,createTopic);
courseRouter.route('/:courseId/chapters/:chapterId/topics/:topicId').get(getTopic).delete(deleteTopic).patch(updateTopicTime);


module.exports = courseRouter;
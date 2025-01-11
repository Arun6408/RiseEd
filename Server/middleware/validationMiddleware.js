const { body, validationResult } = require("express-validator");

const validateLogin = [
  body("username")
    .custom((value, { req }) => value || req.body.email)
    .withMessage("Username or Email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const validateSuperLogin = [
  body("username").notEmpty().withMessage("Username is required"),
];

const validateRegister = [
  body("name").notEmpty().withMessage("Name is required"),
  body("username").notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn([
      "super_admin",
      "principal",
      "head_master",
      "teacher",
      "student",
      "parent",
    ])
    .withMessage("Invalid role"),
  body("age")
    .notEmpty()
    .withMessage("Age is required")
    .isInt()
    .withMessage("Age must be a number"),
  body("phone")
    .notEmpty()
    .withMessage("Phone is required")
    .isMobilePhone()
    .withMessage("Invalid phone number"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  // Role-specific validations
  body("salary")
    .if(body("role").isIn(["principal", "head_master", "teacher"]))
    .notEmpty()
    .withMessage("Salary is required")
    .isNumeric()
    .withMessage("Salary must be a number"),

  body("department")
    .if(body("role").isIn(["head_master", "teacher"]))
    .notEmpty()
    .withMessage("Department is required"),

  body("assignedClasses")
    .if(body("role").isIn(["head_master", "teacher"]))
    .notEmpty()
    .withMessage("Assigned classes are required"),

  body("class")
    .if(body("role").equals("student"))
    .notEmpty()
    .withMessage("Class is required"),

  body("scholarshipAmount")
    .if(body("role").equals("student"))
    .notEmpty()
    .withMessage("Scholarship amount is required")
    .isNumeric()
    .withMessage("Scholarship amount must be a number"),

  body("score")
    .if(body("role").equals("student"))
    .notEmpty()
    .withMessage("Score is required")
    .isNumeric()
    .withMessage("Score must be a number"),
  body("schoolFee")
    .if(body("role").equals("parent"))
    .notEmpty()
    .withMessage("School fee is required")
    .isNumeric()
    .withMessage("School fee must be a number"),
];

const validateCreateCourse = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title must not exceed 100 characters"),
  body("description")
    .isString()
    .withMessage("Description must be a string")
    .notEmpty()
    .withMessage("Description is required"),
  body("class")
    .isString()
    .withMessage("Class must be a string")
    .matches(/^(\d+,)*\d+$/)
    .withMessage("Class must be a comma-separated list of numbers"),
  body("content")
    .isString()
    .withMessage("Content must be a string")
    .notEmpty()
    .withMessage("Content is required"),
];


const validateCreateChapter = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ max: 100 })
    .withMessage("Title must not exceed 100 characters."),
  body("description").trim().notEmpty().withMessage("Description is required."),
  body("content")
    .optional()
    .isString()
    .withMessage("Content must be a string."),
];

const validateCreateTopic = [
  body("title")
    .isString()
    .withMessage("Title must be a string.")
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ max: 100 })
    .withMessage("Title must not exceed 100 characters."),
  body("description")
    .isString()
    .withMessage("Description must be a string.")
    .notEmpty()
    .withMessage("Description is required."),
  body("content")
    .optional()
    .isString()
    .withMessage("Content must be a string if provided."),
  body("topicType")
    .isIn(["video", "content", "pdf", "questionAndAnswers"])
    .withMessage(
      "Invalid topic type. Allowed values are 'video', 'content', 'pdf', 'questionAndAnswers'."
    ),
  body("videoUrl")
    .optional()
    .isURL()
    .withMessage("Video URL must be a valid URL if provided."),
  body("pdfUrl")
    .optional()
    .isURL()
    .withMessage("PDF URL must be a valid URL if provided."),
  body("questionAndAnswers")
    .optional()
    .isString()
    .withMessage("Question and Answers must be a string if provided."),
];

const createQuizValidator = [
  body('quizTitle').notEmpty().withMessage('Quiz title is required').isString().withMessage('Quiz title must be a string'),
  body('quizDescription').notEmpty().withMessage('Quiz description is required').isString().withMessage('Quiz description must be a string'),
  body('quizCourseId').isInt().withMessage('Course ID must be a valid integer'),
  body('createdByUserId').isInt().withMessage('Created by User ID must be a valid integer'),
  body('assignedClasses').notEmpty().withMessage('Assigned classes are required').isString().withMessage('Assigned classes must be a string'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required').custom((questions) => {
    questions.forEach((q) => {
      if (!q.question || !q.optionA || !q.optionB || !q.optionC || !q.optionD || !q.correctAnswer || !q.difficulty) {
        throw new Error('Each question must have all fields: question, options, correctAnswer, difficulty');
      }
    });
    return true;
  })
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    status: "error",
    message: "Validation failed",
    errors: errors.array()
  });
};


module.exports = {
  validateLogin,
  validateRegister,
  validateCreateCourse,
  validateCreateChapter,
  validateCreateTopic,
  createQuizValidator,
  validateSuperLogin,
  validate,
};

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
  body("name").notEmpty().withMessage("Name is required").trim(),
  body("username").notEmpty().withMessage("Username is required").trim(),
  body("password").notEmpty().withMessage("Password is required").trim(),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["superAdmin", "principal", "headMaster", "teacher", "student", "parent"])
    .withMessage("Invalid role"),
  body("age").notEmpty().withMessage("Age is required").isInt().withMessage("Age must be a number"),
  body("phone").notEmpty().withMessage("Phone is required").isMobilePhone().withMessage("Invalid phone number"),
  body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format").trim(),
  
  // Role-specific validations
  body("basicSalary").if(body("role").isIn(["principal", "headMaster", "teacher"])).notEmpty().withMessage("Salary is required").isNumeric(),
  body("rentAllowance").if(body("role").isIn(["principal", "headMaster", "teacher"])).notEmpty().withMessage("Rent Allowance is required").isNumeric(),
  body("foodAllowance").if(body("role").isIn(["principal", "headMaster", "teacher"])).notEmpty().withMessage("Food Allowance is required").isNumeric(),
  body("travelAllowance").if(body("role").isIn(["principal", "headMaster", "teacher"])).notEmpty().withMessage("Travel Allowance is required").isNumeric(),
  body("otherAllowance").if(body("role").isIn(["principal", "headMaster", "teacher"])).notEmpty().withMessage("Other Allowance is required").isNumeric(),
  body("taxDeduction").if(body("role").isIn(["principal", "headMaster", "teacher"])).notEmpty().withMessage("Tax Deduction is required").isNumeric(),
  body("providentFund").if(body("role").isIn(["principal", "headMaster", "teacher"])).notEmpty().withMessage("Provident Fund is required").isNumeric(),
  body("otherDeductions").if(body("role").isIn(["principal", "headMaster", "teacher"])).notEmpty().withMessage("Other Deductions are required").isNumeric(),
  body("subject").if(body("role").isIn(["headMaster", "teacher"])).notEmpty().withMessage("Subject is required"),
  body("assignedClasses").if(body("role").isIn(["headMaster", "teacher"])).isArray().withMessage("Assigned classes must be an array"),
  
  body("class").if(body("role").isIn((value) => value === "student")).notEmpty().withMessage("Class is required"),
  body("scholarshipAmount").if(body("role").custom((value) => value === "student")).notEmpty().withMessage("Scholarship amount is required").isNumeric(),
  body("score").if(body("role").custom((value) => value === "student")).notEmpty().withMessage("Score is required").isNumeric(),
  
  body("parentName").if(body("role").isIn((value) => value === "student")).notEmpty().withMessage("Parent Name is required").trim(),
  body("parentUsername").if(body("role").isIn((value) => value === "student")).notEmpty().withMessage("Parent Username is required").trim(),
  body("parentPassword").if(body("role").isIn((value) => value === "student")).notEmpty().withMessage("Parent Password is required").trim(),
  body("parentAge").if(body("role").isIn((value) => value === "student")).notEmpty().withMessage("Parent Age is required").isInt().withMessage("Parent Age must be a number"),
  body("parentPhoneNumber").if(body("role").isIn((value) => value === "student")).notEmpty().withMessage("Parent Phone is required").isMobilePhone().withMessage("Invalid Parent phone number"),
  body("parentEmail").if(body("role").isIn((value) => value === "student")).notEmpty().withMessage("Parent Email is required").isEmail().withMessage("Invalid Parent email format").trim(),
  body("totalFeeAmount").if(body("role").isIn((value) => value === "student")).notEmpty().withMessage("Total Fee is required").isInt().withMessage("Total Fee must be a number"),
  body("feePaid").if(body("role").isIn((value) => value === "student")).isInt().withMessage("Fee Paid must be a number"),
  
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
];

const validateCreateQuiz = [
  body('quizTitle').notEmpty().withMessage('Quiz title is required').isString().withMessage('Quiz title must be a string'),
  body('quizDescription').notEmpty().withMessage('Quiz description is required').isString().withMessage('Quiz description must be a string'),
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

const validateCreateQuizResult = [
  body('quizId').isInt().withMessage('Quiz ID must be a valid integer'),
  body('userId').isInt().withMessage('User ID must be a valid integer'),
  body('totalQues').isInt().withMessage('Quiz ID must be a valid integer'),
  body('correctCount').isInt().withMessage('Quiz ID must be a valid integer'),
  body('wrongCount').isInt().withMessage('Quiz ID must be a valid integer'),
  body('skippedCount').isInt().withMessage('Quiz ID must be a valid integer'),
  body('timeSpent').isInt().withMessage('Quiz ID must be a valid integer'),
  body('score').isInt().withMessage('Quiz ID must be a valid integer'), 
]

const validateCreateEbook = [
  body('title').notEmpty().withMessage('Ebook title is required').isString().withMessage('Ebook title must be a string'),
  body('description').notEmpty().withMessage('Ebook description is required').isString().withMessage('Ebook description must be a string'),
  body("genre")
  .notEmpty()
  .withMessage("Ebook genre is required")
  .isIn([
    "Fiction",
    "Non-Fiction",
    "Science",
    "Technology",
    "Cooking",
    "Health",
    "Education",
    "Biography",
    "Travel",
    "History",
  ])
  .withMessage("Invalid genre"),
  body('fileUrl').notEmpty().withMessage('fileUrl is required').isString().withMessage('fileUrl must be a string'),
];

const validateWatchTime = [
  body('videoId').isInt().withMessage('User ID must be a valid integer'),
  body('watchTime').isInt().withMessage('Watch time must be a valid integer'),
  body('lastPlaybackPosition').isInt().withMessage('Last Playback Position must be a valid integer'),
];


const validateCreateMessage = (data) => {
  const errors = [];
  if (!data.receiverId) errors.push("Receiver ID is required.");
  if (!data.message && !data.fileUrl) errors.push("Message content or File is required.");
  if (!data.fileType) errors.push("File type is required.");
  return errors;
};

const validateSeenMessage = (data) => {
  const errors = [];
  if (!data.receiverId) errors.push("Receiver ID is required.");
  if (!data.senderId) errors.push("Sender ID is required.");
  return errors;
};

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
  validateCreateQuiz,
  validateSuperLogin,
  validateCreateEbook,
  validateCreateQuizResult,
  validateCreateMessage,
  validateSeenMessage,
  validateWatchTime,
  validate,
};

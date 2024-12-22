const express = require("express");
const { login, register } = require("../controllers/loginController");
const {
  validateRegister,
  validateLogin,
  validate,
} = require("../middleware/validationMiddleware");
const verifyToken = require("../middleware/authMiddleware");

const loginRouter = express.Router();

loginRouter.route("/login").post(validateLogin, validate, login);
loginRouter
  .route("/register")
  .post(verifyToken, validateRegister, validate, register);

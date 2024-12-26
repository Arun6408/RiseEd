const express = require("express");
const { login, register } = require("../controllers/loginController");
const {
  validateRegister,
  validateLogin,
  validate,
} = require("../middleware/validationMiddleware");
const verifyToken = require("../middleware/authMiddleware");

const authRouter = express.Router();

authRouter.route("/login").post(validateLogin, validate, login);
authRouter.route("/register").post(verifyToken, validateRegister, validate, register);

module.exports = authRouter;
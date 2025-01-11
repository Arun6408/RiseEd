const express = require("express");
const {
  login,
  register,
  getAllUsers,
  superAdminLogin,
} = require("../controllers/loginController");
const {
  validateRegister,
  validateLogin,
  validate,
  validateSuperLogin,
} = require("../middleware/validationMiddleware");
const verifyToken = require("../middleware/authMiddleware");

const authRouter = express.Router();

authRouter.route("/login").post(validateLogin, validate, login);
authRouter
  .route("/register")
  .post(verifyToken, validateRegister, validate, register);

authRouter
  .route("/superAdmin/login")
  .get(verifyToken, getAllUsers)
  .post(verifyToken, validateSuperLogin, validate, superAdminLogin);
module.exports = authRouter;

const express = require("express");
const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUser,
  forgotPassword,
  resetPassword,
  changePassword,
  logoutUser,
} = require("../controllers/auth");
const { protectRoutes } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/me").get(protectRoutes, getCurrentUser);
router.route("/updateuser").put(protectRoutes, updateUser);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:token").put(resetPassword);
router.route("/changepassword").put(changePassword);
module.exports = router;

const express = require("express");
const User = require("../models/users");
const {
  getUser,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controllers/users");

const advancedResults = require("../middleware/advancedResults");
const { protectRoutes, authorize } = require("../middleware/auth");

const router = express.Router();

// Adding protection middleware
router.use(protectRoutes);
router.use(authorize("admin"));

router.route("/").get(advancedResults(User, ""), getUsers);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;

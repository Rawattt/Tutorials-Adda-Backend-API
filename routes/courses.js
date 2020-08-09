const express = require("express");
const {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses");

const advancedResults = require("../middleware/advancedResults");
const Course = require("../models/courses");
const { protectRoutes, authorize } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    advancedResults(Course, {
      path: "bootcamp",
      select: "name description",
    }),
    getCourses
  )
  .post(protectRoutes, authorize("publisher", "admin"), addCourse);

router
  .route("/:id")
  .get(getCourse)
  .put(protectRoutes, authorize("publisher", "admin"), updateCourse)
  .delete(protectRoutes, authorize("publisher", "admin"), deleteCourse);

module.exports = router;

const express = require("express");
const router = express.Router();

const Bootcamp = require("../models/bootcamps");

const {
  getBootcamp,
  getBootcamps,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
  getBootcampPhoto,
} = require("../controllers/Bootcamps");

const advancedResults = require("../middleware/advancedResults");
const { protectRoutes, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Include other rosource router
const courseRouter = require("./courses");
const reviewRouter = require("./reviews");

router.use("/:id/courses", courseRouter);
router.use("/:id/reviews", reviewRouter);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protectRoutes, authorize("publisher", "admin"), createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protectRoutes, authorize("publisher", "admin"), updateBootcamp)
  .delete(protectRoutes, authorize("publisher", "admin"), deleteBootcamp);

router
  .route("/:id/image")
  .put(
    protectRoutes,
    authorize("publisher", "admin"),
    upload.single("image"),
    bootcampPhotoUpload
  )
  .get(getBootcampPhoto);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

module.exports = router;

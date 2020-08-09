const express = require("express");
const Review = require("../models/reviews");
const { protectRoutes, authorize } = require("../middleware/auth");
const { getReviews, getReview, addReview } = require("../controllers/reviews");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(advancedResults(Review), getReviews)
  .post(protectRoutes, authorize("user"), addReview);

router.route("/:id").get(getReview);

module.exports = router;

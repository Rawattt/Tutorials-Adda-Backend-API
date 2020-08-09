const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Review = require("../models/reviews");
const Bootcamp = require("../models/bootcamps");

// GET bootcamp reviews
// api/v1/reviews
// api/v1/bootcamps/:id/reviews
// PUBLIC
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.id) {
    const reviews = await Review.find({ bootcamp: req.params.id });
    return res.status(200).json({
      success: true,
      data: reviews,
      count: data.length,
    });
  }
  res.status(200).json(res.advancedResults);
});

// GET single review
// api/v1/reviews/:id
// PUBLIC
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });
  if (!review) {
    return next(new ErrorResponse("Review not found", 404));
  }
  return res.status(200).json({
    success: true,
    data: review,
  });
});

// Add a review
// POST api/v1/bootcamps/:id/reviews
// PRIVATE
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.id;
  req.body.id = req.user.id;

  const bootcamp = Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse("Bootcamp not found", 404));
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});

// UPDATE a review
// PUT api/v1/reviews/:id
// PRIVATE
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse("Review not found", 404));
  }

  // Check if user is authorized to update the review or if it is the admin
  if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        "Your are not authorized to perform this operation",
        401
      )
    );
  }
  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: review,
  });
});

// Delete a review
// DELETE api/v1/reviews/:id
// PRIVATE
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) return next(new ErrorResponse("Review not found", 404));

  if (review.user.toString() !== req.user.id && req.user.role !== "admin")
    return next(
      new ErrorResponse("You are not authorized to perform this operation", 401)
    );

  await review.remove();

  res.status(200).json({ success: true });
});

const Course = require("../models/courses");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Bootcamp = require("../models/bootcamps");

// GET courses
// GET /api/v1/courses
// GET /api/v1/bootcamps/:id/courses
exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;

  if (req.params.id) {
    query = Course.find({ bootcamp: req.params.id });
  } else {
    query = Course.find();
  }

  const courses = await query;

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

// GET single course
// GET /api/v1/courses/:id
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return next(new ErrorResponse(`Course not found`), 404);
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// ADD course
// POST /api/v1/bootcamps/:id/courses
// Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.id;

  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(
        `Bootcamp does not exist. Please add a bootcamp to add a course`
      ),
      404
    );
  }
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    next(new ErrorResponse("You cannot perform this operation"));
  }
  const course = await Course.create(req.body);
  res.status(200).json({
    success: true,
    data: course,
  });
});

// UPDATE course
// PUT /api/v1/courses/:id
// Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorResponse(`Course not found`), 404);
  }
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    next(new ErrorResponse("You cannot perform this operation"));
  }
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: course,
  });
});

// DELETE course
// PUT /api/v1/courses/:id
// Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorResponse(`Course not found`), 404);
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    next(new ErrorResponse("You cannot perform this operation"));
  }

  await course.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

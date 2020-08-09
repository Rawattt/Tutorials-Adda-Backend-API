const Bootcamp = require("../models/bootcamps");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../utils/geocoder");
const sharp = require("sharp");

// GET all bootcamps
// GET /api/v1/bootcamps
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// GET single bootcamp
// GET /api/v1/bootcamps/:id
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id: ${req.params.id}`),
      404
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// PRIVATE
// CREATE bootcamp
// POST /api/v1/bootcamps
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  console.log(req.user);
  req.body.user = req.user.id;

  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // Check if the user is authorized and not the admin

  if (
    publishedBootcamp.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    next(new ErrorResponse("You cannot perform this operation"));
  }

  // Only admin can add more than one bootcamp
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse("You have already published a bootcamp", 400)
    );
  }

  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

// PRIVATE
// UPDATE bootcamp
// PUT /api/v1/bootcamps/:id
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id: ${req.params.id}`),
      404
    );
  }

  // Check if user is authorized to update
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    next(new ErrorResponse("You cannot perform this operation"));
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: bootcamp });
});

// PRIVATE
// DELETE bootcamp
// DELETE /api/v1/bootcamps/:id
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id: ${req.params.id}`),
      404
    );
  }

  // Check if user is authorized to delete
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    next(new ErrorResponse("You cannot perform this operation"));
  }
  bootcamp.remove();

  res.status(200).json({ success: true, data: bootcamp });
});

// PRIVATE
// GET Bootcamp within a radius
// GET /api/v1/bootcamps/radius/:zipcode/distance
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat and long
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const long = loc[0].longitude;

  // Calculate radius using radians
  // Divide distance by earth's radius
  const radius = distance / 6378;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[long, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// GET bootcamp image
// GET api/v1/bootcamps/:id/image
exports.getBootcampPhoto = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) return res.status(404);
  res.set("Content-Type", "image/png");
  res.send(bootcamp.picture);
});

// PRIVATE
// Upload photo for bootcamp
// PUT api/v1/bootcamps/:id/image
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }
  let bootcamp = await Bootcamp.findById(req.params.id);
  // Check if bootcamp exist
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found`, 404));
  }
  // Check if user is authorized to update
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    next(new ErrorResponse("You cannot perform this operation"));
  }
  const buffer = await sharp(req.file.buffer)
    .resize({ width: 250, height: 250 })
    .png()
    .toBuffer();
  bootcamp = await Bootcamp.findByIdAndUpdate(
    req.params.id,
    { picture: buffer },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

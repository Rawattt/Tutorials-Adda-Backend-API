const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/users");
const sendEmail = require("../utils/sendEmail");

// GET all users
// GET /api/v1/users
// PRIVATE/admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// GET single user
// GET /api/v1/user/:id
// PRIVATE/admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({ success: true, data: user });
});

// Update user
// PUT /api/v1/user/:id
// PRIVATE/admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});

// Delete user
// DELETE /api/v1/user/:id
// PRIVATE/admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    data: `User with id: ${req.params.id} has been successfully deleted`,
  });
});

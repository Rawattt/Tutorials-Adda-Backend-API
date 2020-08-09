const crypto = require("crypto");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/users");
const sendEmail = require("../utils/sendEmail");

// Register user
// api/v1/auth/register
// PUBLIC
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  //   Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  //   Create token
  sendTokenResponse(user, 200, res);
});

// Login
// api/v1/auth/login
// PUBLIC
exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Invalid Credentials", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  // Check if user exist
  if (!user) {
    return next(new ErrorResponse("User does not exist", 404));
  }
  //   Check if entered password is correct
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ErrorResponse("Invalid Credentials", 400));
  }

  sendTokenResponse(user, 200, res);
});

// Log user out
// GET api/v1/auth/logout
// PRIVATE
exports.logoutUser = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true });
});

// GET current user
// api/v1/auth/me
// PRIVATE
exports.getCurrentUser = asyncHandler(async (req, res, next) => {
  console.log(req.headers);
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// UPDATE current user
// api/v1/auth/update
// PRIVATE
exports.updateUser = asyncHandler(async (req, res, next) => {
  const updateData = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: user,
  });
});

// UPDATE password
// api/v1/auth/changepassword
// PRIVATE
exports.changePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.comparePassword(user.password))) {
    return next(new ErrorResponse("Entered password is incorrect", 400));
  }

  user.password = req.body.password;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Forget Password
// POST api/v1/auth/forgotpassword
// PUBLIC
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  // Check if the email is registered
  if (!user) return next(new ErrorResponse("Email is not registered", 404));

  // Get reset password token
  const resetToken = user.generateResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/forgotpassword/${resetToken}`;

  const message = `Yor are receiving this email because you(or someone else) has requested to reset the password. Click on the link to reset password: \n ${resetUrl}. \n Ignore if it was not you.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Reset Password",
      to: user.email,
      message,
    });
    res.status(200).json({
      success: true,
      data: "Email Sent",
    });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new ErrorResponse("Email cannot be sent. Please try again", 500)
    );
  }
});

//Reset password link
// PUT api/v1/auth/resetpassword/:token
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // Get user
  const user = await User({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new (ErrorResponse("Invalid token", 400))());
  }

  // Set password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJWT();

  const options = {
    expires: new Date(
      Date.now + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") options.secure = true;

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, data: token });
};

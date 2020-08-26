const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("./async");
const User = require("../models/users");

// Protect routes
exports.protectRoutes = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization ||
    req.headers.authorization?.startsWith("Bearer")
  ) {
    token = req.headers.authorization.replace("Bearer ", "");
  } else if (req.cookies.token) token = req.cookies.token;

  //   Check if token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized", 401));
  }
  try {
    //   Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return next(new ErrorResponse("Not authorized", 401));
  }
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log(req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`User role ${req.user.role} is not authorized`, 403)
      );
    }
    next();
  };
};

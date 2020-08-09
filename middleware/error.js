const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  // Log to console for dev
  let error = { ...err };
  error.message = err.message;
  console.log("error!!!!!!!", err);

  // Handling errors by name
  switch (err.name) {
    // Mongoose Bad Id
    case "CastError": {
      const message = `Resource not found`;
      error = new ErrorResponse(message, 404);
      break;
    }

    // Mongoose Validation Error
    case "ValidationError": {
      const message = Object.values(err.errors).map((val) => val.message);
      error = new ErrorResponse(message, 400);
      break;
    }

    default:
      break;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message =
      "Name is already taken, please try again with different name";
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Something went wrong",
  });
};

module.exports = errorHandler;

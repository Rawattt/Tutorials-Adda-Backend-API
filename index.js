const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const sanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const logger = require("./middleware/loggers");
const errorHandler = require("./middleware/error");
const connectDB = require("./db/mongoose");

// import routers
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

// Load env variables
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Sanitize data
app.use(sanitize());

//Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Prevent http params pollution
app.use(hpp());

// Enable CORS
app.use(cors());

const PORT = process.env.PORT || 5000;

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

app.use(errorHandler);

const server = app.listen(
  PORT,
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (error, promise) => {
  console.log(`Error: ${error.message}`);

  // Close server and exit process
  server.close(() => process.exit(1));
});

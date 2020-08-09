const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");
const Bootcamp = require("./models/bootcamps");
const Course = require("./models/courses");
const User = require("./models/users");
const Review = require("./models/reviews");

// Load env
dotenv.config({ path: `${__dirname}/config/config.env` });

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  autoIndex: true,
});

// Read JSON file
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8")
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`, "utf-8")
);

// Import into DB
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);
    await Review.create(reviews);
    console.log("Data Imported".green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete Data
const deleteData = async () => {
  try {
    await Bootcamp.deleteMany();
    await Course.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data Destroyed".red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

switch (process.argv[2]) {
  case "-i":
    importData();
    break;
  case "-d":
    deleteData();
    break;
  default:
    break;
}

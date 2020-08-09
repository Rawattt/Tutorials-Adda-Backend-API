const mongoose = require("mongoose");
const asyncHandler = require("../middleware/async");

const reviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Review title is requires"],
    maxlength: [100, "Review title cannot exceed length of 100 characters"],
  },
  text: {
    type: String,
    trim: true,
    required: [true, "Review body is required"],
    maxlength: [500, "Review body cannot exceed length of 500 characters"],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Please add a rating"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bootcamp",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

// Prevent user from adding more than one review per bootcamp
reviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Static method to get average rating
reviewSchema.statics.getAverageRating = async function (bootcampId) {
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },

    {
      $group: {
        _id: "$bootcamp",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRating: obj[0].averageRating,
    });
  } catch (error) {
    console.log(error);
  }
};

// Call getAverageRating after save
reviewSchema.post("save", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageRating before remove
reviewSchema.pre("remove", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

const User = mongoose.model("Review", reviewSchema);
module.exports = User;

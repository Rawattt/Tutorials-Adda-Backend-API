const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a course title"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  weeks: {
    type: Number,
    required: [true, "Please add number of weeks"],
  },
  tuition: {
    type: Number,
    required: [true, "Please add tuition cost"],
  },
  minimumSkill: {
    type: String,
    required: [true, "Please add minimum skill set"],
    enum: ["beginner", "intermediate", "advanced"],
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  averageCost: {
    type: Number,
    default: 0,
  },
  bootcamp: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Bootcamp",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

// Static method to get the average tuition fee
courseSchema.statics.getAverageCost = async function (bootcampId) {
  const objArr = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuition" },
      },
    },
  ]);

  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(objArr[0].averageCost / 10) * 10,
    });
  } catch (error) {
    console.log(error);
  }
};

// Call getAverageCost after save
courseSchema.post("save", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
courseSchema.pre("remove", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

const course = mongoose.model("Course", courseSchema);
module.exports = course;

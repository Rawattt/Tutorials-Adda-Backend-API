const mongoose = require("mongoose");
const { default: slugify } = require("slugify");
const geocoder = require("../utils/geocoder");

const bootcampSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: [50, "Name cannot be more 50 characters"],
    },
    slug: String,
    description: {
      type: String,
      required: true,
      maxlength: [500, "Description cannot be more 500 characters"],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please use a valid URL with HTTP or HTTPS",
      ],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone number can not be longer than 20 characters"],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    address: {
      type: String,
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      // Array of strings
      type: [String],
      required: true,
      enum: [
        "Web Development",
        "Mobile Development",
        "UI/UX",
        "Data Science",
        "Business",
        "Other",
      ],
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [10, "Rating must can not be more than 10"],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    picture: {
      type: Buffer,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create bootcamp slug from the schema
bootcampSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Create location field using geocoder
bootcampSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].streetName,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };

  // Do not save address in DB
  this.address = undefined;

  next();
});

// Cascade delete courses whem bootcamp is deleted
bootcampSchema.pre("remove", async function (next) {
  console.log(`Courses being removed from bootcamp ${this._id}`);
  await this.model("Course").deleteMany({ bootcamp: this._id });
  next();
});

// Reverse populate with virtuals
bootcampSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "bootcamp",
  justOne: false,
});

const Bootcamp = mongoose.model("Bootcamp", bootcampSchema);
module.exports = Bootcamp;

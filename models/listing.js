// models/listing.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    image: {
      url: String,
      filename: String,
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    location: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    geometry: {
      type: {
        type: String,
        enum: ["Point"], // must be 'Point'
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

//     category: {
//   type: String,
//   enum: [
//     "Trending",
//     "Rooms",
//     "Iconic Cities",
//     "Mountain",
//     "Castles",
//     "Pools",
//     "Camping",
//     "Arctic",
//     "Design",
//     "Breakfasts"
//   ],
//   default: "Mountain" 
// },


  },
  { timestamps: true } // ✅ sahi jagah pe
);

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

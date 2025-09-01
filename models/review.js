// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// const reviewSchema = new Schema({
//     comment: String,
//     rating: {
//         type: Number,
//         min: 1,
//         max: 5,
//     },

//     createdAt: {
//         type: Date,
//         default: Date.now
//     },
//     author: {
//         type: Schema.Types.ObjectId,
//         ref: "User",
//     }
// });


// module.exports = mongoose.model("Review", reviewSchema)




// models/review.js


const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// models/review.js

const reviewSchema = new Schema({
  comment: {
    type: String,
    trim: true,
    required: true, // comment mandatory
  },
  rating: {
    type: Number,
    required: true,   // ⭐ ab mandatory
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});


module.exports = mongoose.model("Review", reviewSchema);

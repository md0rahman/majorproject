// controllers/reviews.js

const mongoose = require("mongoose");
const Listing = require("../models/listing");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");

// ----------------- Helpers -----------------

// Validate Mongo ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ----------------- Controllers -----------------

// CREATE Review
module.exports.createReview = async (req, res) => {
  const { id } = req.params;

  // ✅ Validate listing id
  if (!isValidObjectId(id)) {
    req.flash("error", "Invalid Listing ID!");
    return res.redirect("/listings");
  }

  // ✅ Find listing
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  // ✅ Extract input
  let rating = req.body.review.rating ? Number(req.body.review.rating) : null;
  const comment = req.body.review.comment?.trim();

  // ✅ Comment required
  if (!comment || comment === "") {
    req.flash("error", "Comment cannot be empty!");
    return res.redirect(`/listings/${id}`);
  }

  // ✅ Rating auto-fix (agar star nahi diya to 1 set karo)
  if (!rating || rating < 1 || rating > 5) {
    rating = 1;
  }

  // ✅ Create new review
  const newReview = new Review({
    rating,
    comment,
    author: req.user._id,
  });

  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();

  req.flash("success", "✅ New Review Added!");
  res.redirect(`/listings/${id}`);
};

// DELETE Review
module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;

  // ✅ Validate IDs
  if (!isValidObjectId(id) || !isValidObjectId(reviewId)) {
    req.flash("error", "Invalid Review ID!");
    return res.redirect("/listings");
  }

  // ✅ Remove review from listing & delete from DB
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "🗑️ Review Deleted!");
  res.redirect(`/listings/${id}`);
};

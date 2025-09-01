// controllers/listings.js
const mongoose = require("mongoose");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing");

// ----------------- Helpers -----------------
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ----------------- Controllers -----------------

// Show all listings
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

// Render form for new listing
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

// Show single listing
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ExpressError("Page Not Found!", 404);

  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
};

// Create new listing
module.exports.createListing = async (req, res) => {
  let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1,
  }).send();

  const data = req.body.listing || {};

  if (!req.file) {
    req.flash("error", "Image is required!");
    return res.redirect("/listings/new");
  }

  const newListing = {
    ...data,
    image: { filename: req.file.filename, url: req.file.path },
    owner: req.user._id,
    geometry: response.body.features[0].geometry, // Save GeoJSON
  };

  await Listing.create(newListing);
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

// Render edit form
module.exports.editListing = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ExpressError("Page Not Found!", 404);

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url.replace("/upload", "/upload/h_180,w_300");
  res.render("listings/edit", { listing, originalImageUrl });
};

// Update listing
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ExpressError("Page Not Found!", 404);

  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError("Listing not found!", 404);

  const data = req.body.listing || {};

  // If location updated, re-geocode
  let geometry = listing.geometry;
  if (data.location && data.location !== listing.location) {
    let response = await geocodingClient.forwardGeocode({
      query: data.location,
      limit: 1,
    }).send();
    geometry = response.body.features[0].geometry;
  }

  const updatedListing = {
    ...data,
    image: req.file
      ? { filename: req.file.filename, url: req.file.path }
      : listing.image,
    geometry,
  };

  await Listing.findByIdAndUpdate(id, updatedListing, { runValidators: true });

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

// Delete listing
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new ExpressError("Page Not Found!", 404);

  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
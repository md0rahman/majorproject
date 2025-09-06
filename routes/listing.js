const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Index + Create
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

// New form
router.get("/new", isLoggedIn, listingController.renderNewForm);

// ✅ Filter by category (uparse) — POPULATE reviews so rating is available in template
router.get(
  "/category/:name",
  wrapAsync(async (req, res) => {
    const { name } = req.params;
    const listings = await Listing.find({ category: name })
      .populate({ path: "reviews", select: "rating" });
    res.render("listings/index", { allListings: listings });
  })
);

// ✅ Search (bhi upar hona chahiye) — POPULATE reviews as well
router.get(
  "/search",
  wrapAsync(async (req, res) => {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
          { country: { $regex: search, $options: "i" } }
        ]
      };
    }

    const listings = await Listing.find(query)
      .populate({ path: "reviews", select: "rating" });
    res.render("listings/index", { allListings: listings });
  })
);

// Edit form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editListing)
);

// Show, Update, Delete
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
  );

module.exports = router;

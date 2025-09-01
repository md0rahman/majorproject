// routes/wishlist.js
const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const User = require("../models/user");
const { isLoggedIn } = require("../middleware");

router.get("/api/wishlist/ping", (req, res) => res.json({ ok: true }));

router.post("/api/wishlist/toggle/:id", isLoggedIn, async (req, res) => {
  try {
    const id = req.params.id;
    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ ok: false });

    const user = await User.findById(req.user._id);
    if (!Array.isArray(user.wishlist)) user.wishlist = [];

    const already = user.wishlist.some(oid => String(oid) === String(id));
    if (already) {
      await User.updateOne({ _id: user._id }, { $pull: { wishlist: id } });
      return res.json({ ok: true, wished: false });
    } else {
      await User.updateOne({ _id: user._id }, { $addToSet: { wishlist: id } });
      return res.json({ ok: true, wished: true });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});


// Wishlist page
router.get("/wishlists", isLoggedIn, async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "wishlist",
    populate: { path: "owner" },
  });
  res.render("listings/wishlists", { allListings: user?.wishlist || [] });
});

module.exports = router;

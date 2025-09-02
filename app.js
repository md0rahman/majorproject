// app.js
const wishlistRoutes = require("./routes/wishlist.js");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRoutes = require("./routes/listing.js");
const reviewsRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

// ✅ Connect MongoDB
main()
  .then(() => console.log("✅ Connected to DB"))
  .catch((err) => console.error("❌ DB Connection Error:", err));
async function main() {
  await mongoose.connect(dbUrl);
}

// ✅ View Engine & Layouts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/boilerplate");

// ✅ Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// ✅ Session Store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: process.env.SECRET },
  touchAfter: 24 * 3600, // update once in 24 hrs
});

store.on("error", (e) => {
  console.log("SESSION STORE ERROR:", e);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ✅ Passport Auth
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ Global Middleware for user & flash
app.use(async (req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  if (req.isAuthenticated && req.isAuthenticated()) {
    try {
      const freshUser = await User.findById(req.user._id).select(
        "username avatar wishlist"
      );
      res.locals.currUser = freshUser;
    } catch (e) {
      console.error("Fresh user fetch error:", e);
      res.locals.currUser = req.user || null;
    }
  } else {
    res.locals.currUser = null;
  }
  next();
});

// ✅ Routes
app.get("/", (req, res) => {
  res.render("home"); // Home page render karega
});

app.use("/listings", listingsRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);
app.use("/", userRoutes);
app.use("/", wishlistRoutes);

// ✅ Example Route
app.get("/some-route", (req, res, next) =>
  next(new ExpressError("Page Not Found!", 404))
);

// ✅ Error Handler
app.use((err, req, res, next) => {
  let statusCode = parseInt(err.statusCode, 10);
  if (isNaN(statusCode)) statusCode = 500;

  let message = err.message || "Something went wrong!";
  if (err.details && Array.isArray(err.details)) {
    message = err.details.map((el) => el.message).join(", ");
    statusCode = 400;
  }

  res.status(statusCode).render("error", { statusCode, message });
});

// ✅ Port Setup (for Render/Heroku)
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));

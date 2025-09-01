const User = require("../models/user");

// GET /signup
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

// POST /signup
module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// GET /login
// 👉 yahan par returnTo & wish ko session me save karenge
module.exports.renderLoginForm = (req, res) => {
  const { returnTo, wish } = req.query || {};
  if (returnTo || wish) {
    req.session.afterLogin = {
      ...(req.session.afterLogin || {}),
      ...(returnTo ? { returnTo } : {}),
      ...(wish ? { wish } : {}),
    };
  }
  res.render("users/login.ejs");
};

// POST /login
module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back, " + req.user.username + "!");

  // session se afterLogin data lo
  const stored = req.session.afterLogin || {};
  delete req.session.afterLogin; // cleanup
  delete req.session.redirectUrl;

  // 1) preference order: client returnTo → middleware redirectUrl → /listings
  let redirectUrl = stored.returnTo || res.locals.redirectUrl || "/listings";

  // 2) agar heart click tha to autowish param add karo
  if (stored.wish) {
    const join = redirectUrl.includes("?") ? "&" : "?";
    redirectUrl = `${redirectUrl}${join}autowish=${encodeURIComponent(stored.wish)}`;
  }

  res.redirect(redirectUrl);
};

// GET /logout
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};

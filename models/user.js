// models/user.js
const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: { type: String, required: true },
  avatar: String,
  wishlist: [{ type: Schema.Types.ObjectId, ref: "Listing" }],
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);

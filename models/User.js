const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  questradeID: String,
  accessToken: String,
  refreshToken: String,
  accessTokenExpiringAt: Date,
  apiServer: String,
});

mongoose.model("users", userSchema);

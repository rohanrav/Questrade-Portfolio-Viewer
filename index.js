const express = require("express");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
const passport = require("passport");
const keys = require("./config/keys.js");
require("./models/User.js");
require("./services/passport.js");

mongoose.connect(keys.MONGO_CONNECTION_STRING, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const app = express();

app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.COOKIE_SECRET_KEY_1, keys.COOKIE_SECRET_KEY_2],
  })
);
app.use(passport.initialize());
app.use(passport.session());

require("./routes/authRoutes.js")(app);
require("./routes/questradeRoutes.js")(app);

// TO DO:
// - Watch all missed udemy videos
// - Add mongo database and corresponding code to find user
// - Write function to get accessToken from refreshToken and update the db and req.user
// - Write all methods to get info from questrade api
// - Figure out the practice account, and use it here instead (make sure no errors from all types of assets)
// - Figure out streaming from the backend

const getAccessTokenFromRefreshToken = (req, cb) => {
  // Do work to get refresh token, and update mongo database and req.user
  // If error, return error (redirect to login error + req.logout()), then react application should redirect to error page
};

app.listen(process.env.PORT || 5000);

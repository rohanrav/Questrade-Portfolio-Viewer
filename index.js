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
// - Watch all missed udemy videos ]
// - Add mongo database and corresponding code to find user ]
// - Write function to get accessToken from refreshToken and update the db and req.user ]
// - Write all methods to get info from questrade api ]
//   - finish doing the stock view (add info table + options table) ]
// - Figure out the practice account, and use it here instead (make sure no errors from all types of assets) ]

//     - orders page --> real time streaming --> TODAY
//     - add more appealing grid for info to stockview --> TODAY
//        - add volumne data to stock view
//        - add tooltip with mroe information
//        - add +/- of current day of stock/option

//   - add header (account selected/not selected, etc.)
//   - add styling for home page, account error, etc.
//   - add guards for accessing restrected pages without being locked in
//   - add liability and use at your own discretion warnings

app.listen(process.env.PORT || 5000);

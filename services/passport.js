const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2").Strategy;
const qapi = require("../api/questradeAPI.js");
const mongoose = require("mongoose");
const addSeconds = require("date-fns/addSeconds");
const keys = require("../config/keys.js");

const redirectURL = `${keys.BASE_URL}/auth/questrade/callback`;
const authURL = `https://login.questrade.com/oauth2/authorize?client_id=${keys.REACT_APP_CLIENT_ID}&response_type=code&redirect_uri=${redirectURL}`;
const tokenURL = `https://login.questrade.com/oauth2/token?client_id=${keys.REACT_APP_CLIENT_ID}&grant_type=authorization_code&redirect_uri=${keys.BASE_URL}`;

const User = mongoose.model("users");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

const strategy = new OAuth2Strategy(
  {
    authorizationURL: authURL,
    tokenURL: tokenURL,
    clientID: keys.REACT_APP_CLIENT_ID,
    callbackURL: redirectURL,
    proxy: true,
  },
  async (accessToken, refreshToken, params, _, cb) => {
    try {
      const accountsReq = qapi(params.api_server, accessToken);
      const accountsRes = await accountsReq.get("/v1/accounts");
      const { userId } = accountsRes.data;

      const existingUser = await User.findOne({ questradeID: userId });
      if (existingUser) {
        existingUser.accessToken = accessToken;
        existingUser.refreshToken = refreshToken;
        existingUser.accessTokenExpiringAt = addSeconds(new Date(), 1800);
        existingUser.apiServer = params.api_server;
        await existingUser.save();
        cb(null, existingUser);
      } else {
        const newUser = await new User({
          questradeID: userId,
          accessToken,
          refreshToken,
          accessTokenExpiringAt: addSeconds(new Date(), 1800),
          apiServer: params.api_server,
        }).save();
        cb(null, newUser);
      }
    } catch (e) {
      console.error("Error in Passport JS Callback: ", e);
      cb(e, null);
    }
  }
);

passport.use(strategy);

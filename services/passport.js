const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2").Strategy;
const mongoose = require("mongoose");
const addSeconds = require("date-fns/addSeconds");
const CryptoJS = require("crypto-js");

const qapi = require("../api/questradeAPI.js");
const keys = require("../config/keys.js");

const User = mongoose.model("users");

const redirectURL = `${keys.BASE_URL}/auth/questrade/callback`;
const authURL =
  `https://login.questrade.com/oauth2/authorize?client_id=${keys.REACT_APP_CLIENT_ID}` +
  `&response_type=code&redirect_uri=${redirectURL}`;
const tokenURL =
  `https://login.questrade.com/oauth2/token?client_id=${keys.REACT_APP_CLIENT_ID}` +
  `&grant_type=authorization_code&redirect_uri=${keys.BASE_URL}`;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  user.accessToken = decryptString(user.accessToken);
  user.refreshToken = decryptString(user.refreshToken);
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
        existingUser.accessToken = encryptString(accessToken);
        existingUser.refreshToken = encryptString(refreshToken);
        existingUser.accessTokenExpiringAt = addSeconds(new Date(), 1800);
        existingUser.apiServer = params.api_server;
        existingUser.refreshTokenTimeoutID = null;
        await existingUser.save();

        existingUser.refreshToken = refreshToken;
        cb(null, existingUser);
      } else {
        const newUser = await new User({
          questradeID: userId,
          accessToken: encryptString(accessToken),
          refreshToken: encryptString(refreshToken),
          accessTokenExpiringAt: addSeconds(new Date(), 1800),
          apiServer: params.api_server,
          refreshTokenTimeoutID: null,
        }).save();

        newUser.refreshToken = refreshToken;
        cb(null, newUser);
      }
    } catch (e) {
      console.error("Error in Passport JS Callback: ", e);
      cb(e, null);
    }
  }
);

const encryptString = (toBeEncrypted) => {
  return CryptoJS.AES.encrypt(toBeEncrypted, keys.MONGO_TOKEN_STORE_ENCRYPTION).toString();
};

const decryptString = (toBeDecrypted) => {
  return CryptoJS.AES.decrypt(toBeDecrypted, keys.MONGO_TOKEN_STORE_ENCRYPTION).toString(
    CryptoJS.enc.Utf8
  );
};

passport.use(strategy);

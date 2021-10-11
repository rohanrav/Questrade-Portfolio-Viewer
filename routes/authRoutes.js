const passport = require("passport");
const axios = require("axios");
const mongoose = require("mongoose");
const addSeconds = require("date-fns/addSeconds");
var CryptoJS = require("crypto-js");

const errors = require("../constants/errors.js");
const keys = require("../config/keys.js");

const User = mongoose.model("users");

const REFRESH_TOKEN_FETCH_INTERVAL_MS = 25 * 60000;
const MAX_INTERVAL_REPITIONS = 25 * 60;

module.exports = (app) => {
  app.get("/auth/questrade/login", (req, res) => {
    if (req.user) {
      res.redirect("/accounts");
    } else {
      res.redirect("/auth/questrade");
    }
  });

  app.get("/auth/questrade", passport.authenticate("oauth2"));

  app.get(
    "/auth/questrade/callback",
    passport.authenticate("oauth2", { failureRedirect: "/auth/login-error" }),
    (req, res) => {
      res.redirect("/accounts");
    }
  );

  app.get("/auth/questrade/login-error", (req, res) => {
    res.status(400).json(new errors.apiErrorMessage(errors.AUTH_ERROR, "Passport JS Error"));
  });

  app.get("/api/logout", async (req, res) => {
    clearInterval(req.user?.refreshTokenTimeoutID);
    await updateRefreshTimeoutID(req, null);
    req.logout();
    res.status(200).send("Successfully logged out.");
  });

  app.get("/api/set-refresh-token-interval", async (req, res) => {
    if (req.user && !req.user?.refreshTokenTimeoutID) {
      const intervalID = await createIntervalToUpdateAuthToken(req);
      await updateRefreshTimeoutID(req, intervalID);
      res.status(200).send("Successfully created refresh token interval.");
    } else {
      res.status(200).send("Invalid attempt to create refresh token interval.");
    }
  });

  app.get("/api/cancel-refresh-token-interval", async (req, res) => {
    clearInterval(req.user?.refreshTokenTimeoutID);
    await updateRefreshTimeoutID(req, null);
    res.status(200).send("Successfully canceled refresh token interval.");
  });
};

const updateRefreshTimeoutID = async (req, intervalID) => {
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, { refreshTokenTimeoutID: intervalID });
  }
};

const createIntervalToUpdateAuthToken = async (req) => {
  setTimeout(async () => {
    await getAccessTokenWithRefreshToken(req);
  }, 500);

  const intervalID = setIntervalWithLimit(
    async () => {
      await getAccessTokenWithRefreshToken(req);
    },
    REFRESH_TOKEN_FETCH_INTERVAL_MS,
    MAX_INTERVAL_REPITIONS
  );
  return intervalID;
};

const setIntervalWithLimit = (callback, delay, maxRepetitions) => {
  let counter = 0;
  const intervalID = setInterval(async () => {
    await callback();
    if (++counter === maxRepetitions) {
      clearInterval(intervalID);
    }
  }, delay);
  return intervalID;
};

const getAccessTokenWithRefreshToken = async (req) => {
  try {
    console.log("Fetching Access Token With Refresh Token");
    const res = await axios.post("https://login.questrade.com/oauth2/token", null, {
      params: {
        grant_type: "refresh_token",
        refresh_token: req.user.refreshToken,
      },
    });

    const encRefreshToken = CryptoJS.AES.encrypt(
      res.data.refresh_token,
      keys.MONGO_TOKEN_STORE_ENCRYPTION
    ).toString();
    const encAccessToken = CryptoJS.AES.encrypt(
      res.data.access_token,
      keys.MONGO_TOKEN_STORE_ENCRYPTION
    ).toString();

    const newUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        accessToken: encAccessToken,
        refreshToken: encRefreshToken,
        accessTokenExpiringAt: addSeconds(new Date(), 1800),
        apiServer: res.data.api_server,
      },
      { new: true, useFindAndModify: false }
    );

    newUser.accessToken = res.data.access_token;
    newUser.refreshToken = res.data.refresh_token;
    req.user = newUser;
    return true;
  } catch (e) {
    console.error(`Error getting access token with refresh token: ${e.message}`);
    console.error(
      `User: ${req.user._id}, refreshTokenTimeoutID: ${req.user.refreshTokenTimeoutID}`
    );
    clearInterval(req.user.refreshTokenTimeoutID);
    await updateRefreshTimeoutID(req, null);
    return false;
  }
};

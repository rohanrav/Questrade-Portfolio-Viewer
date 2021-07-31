const passport = require("passport");
const errors = require("../constants/errors.js");

module.exports = (app) => {
  app.get("/auth/questrade", passport.authenticate("oauth2"));

  app.get(
    "/auth/questrade/callback",
    passport.authenticate("oauth2", { failureRedirect: "/auth/login-error" }),
    (req, res) => {
      res.status(200).json(req.user);
    }
  );

  app.get("/auth/questrade/login-error", (req, res) => {
    res
      .status(400)
      .json({ errorCode: errors.AUTH_ERROR, errorMsg: "Passport JS Error" });
  });

  app.get("/api/logout", (req, res) => {
    req.logout();
    res.status(200).send("Successfully logged out.");
  });

  app.get("/api/current-user", (req, res) => {
    if (req.user) {
      res.status(200).send(req.user);
    } else {
      res.status(401).send({
        errorCode: errors.AUTH_ERROR,
        errorMsg: "User not logged in",
      });
    }
  });
};

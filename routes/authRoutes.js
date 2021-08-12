const passport = require("passport");
const errors = require("../constants/errors.js");

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

  app.get("/api/logout", (req, res) => {
    req.logout();
    res.status(200).send("Successfully logged out.");
  });
};

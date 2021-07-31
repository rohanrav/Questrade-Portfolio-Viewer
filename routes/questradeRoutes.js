module.exports = (app) => {
  app.get("/api/accounts-and-balances", (req, res) => {});

  app.get("/api/posistions/:accountNumber", (req, res) => {});

  app.get("/api/candles/:symbolId", (req, res) => {});
};

const _ = require("lodash");
const datefns = require("date-fns");
var CryptoJS = require("crypto-js");

const qapi = require("../api/questradeAPI.js");
const currencyConv = require("../api/currencyConverter.js");
const errors = require("../constants/errors.js");
const keys = require("../config/keys.js");
const qtradeConstants = require("../constants/questrade.js");

module.exports = (app) => {
  app.get("/api/exchange-rate", async (req, res) => {
    try {
      const rateRes = await currencyConv.get("api/v7/convert", {
        params: {
          q: "USD_CAD",
          compact: "ultra",
          apiKey: keys.CURRENCY_API_KEY,
        },
      });

      res.status(200).json(rateRes.data);
    } catch (e) {
      console.error(`ERROR: Getting USD/CAD Exchange Rate - Using 1.25: ${e.message}`);
      res.status(200).json({
        USD_CAD: 1.25,
      });
    }
  });

  app.get("/api/current-user", async (req, res) => {
    if (req.user) {
      res.status(200).send(req.user);
    } else {
      res.status(401).send(new errors.apiErrorMessage(errors.AUTH_ERROR, "User not logged in"));
    }
  });

  app.get("/api/accounts-and-balances", async (req, res) => {
    const api = qapi(req.user.apiServer, req.user.accessToken);
    try {
      const accountsRes = await api.get("v1/accounts");
      const accounts = accountsRes.data.accounts;

      const balancesPromises = accounts.map((acc) => api.get(`v1/accounts/${acc.number}/balances`));

      Promise.all(balancesPromises).then((balancesRes) => {
        const balances = balancesRes.map((acc) => {
          return {
            ..._.omit(acc.data.combinedBalances[0], [
              "buyingPower",
              "maintenanceExcess",
              "isRealTime",
            ]),
            cashUSD: acc.data.combinedBalances[1].cash,
            marketValueUSD: acc.data.combinedBalances[1].marketValue,
          };
        });
        res.status(200).json(_.merge(accounts, balances));
      });
    } catch (e) {
      console.error(`Error retrieving Accounts and Balances data from Questrade API: ${e.message}`);
      res
        .status(400)
        .json(
          new errors.apiErrorMessage(
            errors.QUESTRADE_API_ERROR,
            `Error retrieving data from Questrade API: ${e.message}`
          )
        );
    }
  });

  app.get("/api/posistions/:accountNumber", async (req, res) => {
    const api = qapi(req.user.apiServer, req.user.accessToken);
    try {
      const positionsRes = await api.get(`v1/accounts/${req.params.accountNumber}/positions`);

      const symbolsRes = await api.get("v1/symbols", {
        params: {
          ids: _.join(_.map(positionsRes.data.positions, "symbolId"), ","),
        },
      });

      res.status(200).json(_.merge(positionsRes.data.positions, symbolsRes.data.symbols));
    } catch (e) {
      console.error(`Error retrieving positions data from Questrade API: ${e.message}`);
      res
        .status(400)
        .json(
          new errors.apiErrorMessage(
            errors.QUESTRADE_API_ERROR,
            `Error retrieving data from Questrade API: ${e.message}`
          )
        );
    }
  });

  app.get("/api/candles/:symbolId", async (req, res) => {
    const api = qapi(req.user.apiServer, req.user.accessToken);
    try {
      const { interval } = req.query;
      const startDate = formatDateForCandles(
        new Date(),
        qtradeConstants.formatCandleDate.START_DATE,
        interval
      );
      const endDate = formatDateForCandles(
        new Date(),
        qtradeConstants.formatCandleDate.END_DATE,
        null
      );

      const candleRes = await api.get(`v1/markets/candles/${req.params.symbolId}`, {
        params: {
          startTime: datefns.formatISO(startDate),
          endTime: datefns.formatISO(endDate),
          interval: qtradeConstants.questradeIntervalEnum[interval],
        },
      });
      res.status(200).json(candleRes.data);
    } catch (e) {
      console.error(`Error retrieving candles positions data from Questrade API: ${e.message}`);
      res
        .status(400)
        .json(
          new errors.apiErrorMessage(
            errors.QUESTRADE_API_ERROR,
            `Error retrieving data from Questrade API: ${e.message}`
          )
        );
    }
  });

  app.get("/api/symbol/:symbolId", async (req, res) => {
    const api = qapi(req.user.apiServer, req.user.accessToken);
    try {
      const symbolRes = await api.get(`v1/symbols/${req.params.symbolId}`);
      res.status(200).json(symbolRes.data);
    } catch (e) {
      console.error(`Error retrieving symbol info data from Questrade API: ${e.message}`);
      res
        .status(400)
        .json(
          new errors.apiErrorMessage(
            errors.QUESTRADE_API_ERROR,
            `Error retrieving symbol info data from Questrade API: ${e.message}`
          )
        );
    }
  });

  app.get("/api/option/:symbolId", async (req, res) => {
    const api = qapi(req.user.apiServer, req.user.accessToken);
    try {
      const optionRes = await api.get(`v1/symbols/${req.params.symbolId}/options`);
      res.status(200).json(optionRes.data);
    } catch (e) {
      console.error(`Error retrieving option info data from Questrade API: ${e.message}`);
      res
        .status(400)
        .json(
          new errors.apiErrorMessage(
            errors.QUESTRADE_API_ERROR,
            `Error retrieving option info data from Questrade API: ${e.message}`
          )
        );
    }
  });

  app.get("/api/symbol-search", async (req, res) => {
    const api = qapi(req.user.apiServer, req.user.accessToken);
    try {
      const searchRes = await api.get(`v1/symbols/search`, {
        params: {
          prefix: req.query.s,
        },
      });
      res.status(200).json(searchRes.data.symbols);
    } catch (e) {
      console.error(`Error retrieving symbol search data from Questrade API: ${e.message}`);
      res
        .status(400)
        .json(
          new errors.apiErrorMessage(
            errors.QUESTRADE_API_ERROR,
            `Error retrieving symbol search data from Questrade API: ${e.message}`
          )
        );
    }
  });

  app.get("/api/executions/:accountNumber", async (req, res) => {
    const api = qapi(req.user.apiServer, req.user.accessToken);
    try {
      const executionsRes = await api.get(`v1/accounts/${req.params.accountNumber}/executions`);
      res.status(200).json(executionsRes.data.executions);
    } catch (e) {
      console.error(`Error retrieving executions data from Questrade API: ${e.message}`);
      res
        .status(400)
        .json(
          new errors.apiErrorMessage(
            errors.QUESTRADE_API_ERROR,
            `Error retrieving executions data from Questrade API: ${e.message}`
          )
        );
    }
  });

  app.get("/api/orders/:accountNumber", async (req, res) => {
    const api = qapi(req.user.apiServer, req.user.accessToken);
    try {
      const ordersRes = await api.get(`v1/accounts/${req.params.accountNumber}/orders`);
      res.status(200).json(ordersRes.data.orders);
    } catch (e) {
      console.error(`Error retrieving orders data from Questrade API: ${e.message}`);
      res
        .status(400)
        .json(
          new errors.apiErrorMessage(
            errors.QUESTRADE_API_ERROR,
            `Error retrieving orders data from Questrade API: ${e.message}`
          )
        );
    }
  });

  app.get("/api/stream/orders", async (req, res) => {
    const api = qapi(req.user.apiServer, req.user.accessToken);
    try {
      const streamPortURL = await getOrderStreamURL(req, api);
      if (typeof streamPortURL !== "string") {
        throw new Error(streamPortURL);
      }

      const dataToSend = {
        success: true,
        questradePortURL: streamPortURL,
        eAT: req.user.accessToken,
      };
      const encObj = CryptoJS.AES.encrypt(
        JSON.stringify(dataToSend),
        keys.CRYPTO_SECRET_KEY
      ).toString();
      res.status(200).json(encObj);
    } catch (e) {
      console.error(`Error retrieving orders streaming port data from Questrade API: ${e.message}`);
      res
        .status(400)
        .json(
          new errors.apiErrorMessage(
            errors.QUESTRADE_API_ERROR,
            `Error retrieving orders streaming port data from Questrade API: ${e.message}`
          )
        );
    }
  });

  app.get("/api/stream/candle/:symbolId", async (req, res) => {
    const api = qapi(req.user.apiServer, req.user.accessToken);
    try {
      const canldePortURL = await getCandleStreamURL(req, api, req.params.symbolId);
      if (typeof canldePortURL !== "string") {
        throw new Error(canldePortURL);
      }

      const dataToSend = {
        success: true,
        questradePortURL: canldePortURL,
        eAT: req.user.accessToken,
      };

      const encObj = CryptoJS.AES.encrypt(
        JSON.stringify(dataToSend),
        keys.CRYPTO_SECRET_KEY
      ).toString();

      res.status(200).json(encObj);
    } catch (e) {
      console.error(
        `Error retrieving candles streaming port data from Questrade API: ${e.message}`
      );
      res
        .status(400)
        .json(
          new errors.apiErrorMessage(
            errors.QUESTRADE_API_ERROR,
            `Error retrieving candles streaming port data from Questrade API: ${e.message}`
          )
        );
    }
  });
};

// Helper Functions
const getCandleStreamURL = async (req, api, symbolId) => {
  try {
    const candleStreamPortRes = await api.get(`v1/markets/quotes`, {
      params: { ids: symbolId, stream: "true", mode: "WebSocket" },
    });

    return `wss:${req.user.apiServer.slice(6, -1)}:${
      candleStreamPortRes.data.streamPort
    }/v1/markets/quotes?ids=${symbolId}&stream=true&mode=WebSocket`;
  } catch (e) {
    console.error(`Error fetching Candle Stream Port: ${e.message}`);
    return { error: true, e };
  }
};

const getOrderStreamURL = async (req, api) => {
  try {
    const ordersStreamPortRes = await api.get("v1/notifications", {
      params: { stream: "true", mode: "WebSocket" },
    });

    return `wss:${req.user.apiServer.slice(6, -1)}:${
      ordersStreamPortRes.data.streamPort
    }/v1/notifications?stream=true&mode=WebSocket`;
  } catch (e) {
    console.error(`Error fetching Order Stream Port: ${e.message}`);
    return { error: true, e };
  }
};

const formatDateForCandles = (date, startDateOrEndDate, interval) => {
  if (startDateOrEndDate === qtradeConstants.formatCandleDate.START_DATE) {
    date = datefns.set(new Date(), { hours: 9, minutes: 30, seconds: 0 });
    switch (interval) {
      case "oneDay":
        date = datefns.subBusinessDays(date, 1);
        break;
      case "fiveDays":
        date = datefns.subBusinessDays(date, 5);
        break;
      case "oneMonth":
        date = datefns.subMonths(date, 1);
        break;
      case "sixMonths":
        date = datefns.subMonths(date, 6);
        break;
      case "oneYear":
        date = datefns.subYears(date, 1);
        break;
      case "fiveYears":
        date = datefns.subYears(date, 5);
        break;
      default:
        date = datefns.subBusinessDays(date, 1);
        break;
    }
  } else if (startDateOrEndDate === qtradeConstants.formatCandleDate.END_DATE) {
    date = datefns.set(new Date(), { hours: 16, minutes: 0, seconds: 0 });
    if (datefns.getISODay(date) === 6) {
      date = datefns.subDays(date, 1);
    } else if (datefns.getISODay(date) === 7) {
      date = datefns.subDays(date, 2);
    }
  }
  return date;
};

import {
  OAUTH_SIGN_IN,
  FETCH_ACCOUNTS_AND_BALANCES,
  USER_LOGOUT,
  FETCH_POSITIONS,
  FETCH_EXCHANGE_RATE,
  FETCH_CANDLES,
  FETCH_SYMBOL_DATA,
  FETCH_OPTIONS_DATA,
} from "./types";
import history from "../history";
import questradeAuth from "../api/questradeAuth";
import questradeAPI from "../api/questradeAPI";
import currencyConverter from "../api/currencyConverter";
import { questradeIntervalEnum } from "../charts/theme";
import _ from "lodash";
import Cookies from "universal-cookie";
const cookies = new Cookies();

const RETRY_LIMIT = 5;

const setRefreshTokenCookie = (refresh_token) => {
  const cookiesRefreshTokenExpiryDate = new Date();
  cookiesRefreshTokenExpiryDate.setDate(
    cookiesRefreshTokenExpiryDate.getDate() + 3
  );
  cookies.set("refresh_token", refresh_token, {
    path: "/",
    expires: cookiesRefreshTokenExpiryDate,
    domain: `.${window.location.host}`,
  });
};

const retryReqeust = (func, retryNumber, error, args) => async (dispatch) => {
  if (retryNumber < RETRY_LIMIT) {
    console.log(`Calling Action Creator: ${func.name} on retry ${retryNumber}`);
    dispatch(func(retryNumber, ...args));
  } else {
    console.error(
      `Error: Unable to successfully call Action Creator: ${func.name} after ${retryNumber} retries`
    );
    console.error(error);
    dispatch(fetchAccessTokenWithRefreshToken(func, args, retryNumber));
  }
};

export const fetchAccessToken = (code) => async (dispatch) => {
  try {
    const res = await questradeAuth.post("/oauth2/token", null, {
      params: {
        client_id: process.env.REACT_APP_CLIENT_ID,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.REACT_APP_DEV_URL,
      },
    });
    dispatch({ type: OAUTH_SIGN_IN, payload: res.data });
    setRefreshTokenCookie(res.data.refresh_token);
    history.push("/accounts");
  } catch (e) {
    console.error("Fetching access token arror Action creator: ", e);
    dispatch(signOut());
    history.push("/account-error");
  }
};

export const fetchAccessTokenWithRefreshToken =
  (func, args, retryNumber) => async (dispatch) => {
    try {
      const refresh_token = cookies.get("refresh_token", {
        domain: `.${window.location.host}`,
      });
      const res = await questradeAuth.post("/oauth2/token", null, {
        params: {
          grant_type: "refresh_token",
          refresh_token,
        },
      });
      dispatch({ type: OAUTH_SIGN_IN, payload: res.data });
      setRefreshTokenCookie(res.data.refresh_token);
      if (retryNumber < RETRY_LIMIT + 1) {
        dispatch(func(retryNumber, ...args));
      } else throw new Error("FATAL ERROR: Max Retry Limit Reached");
    } catch (e) {
      console.error(e);
      dispatch(signOut());
      history.push("/account-error");
    }
  };

export const signOut = () => {
  cookies.remove("refresh_token", {
    path: "/",
    domain: `.${window.location.host}`,
  });
  history.push("/account-error");
  return {
    type: USER_LOGOUT,
  };
};

export const fetchUSDToCADExchangeRate = () => async (dispatch) => {
  try {
    const rateRes = await currencyConverter.get("/api/v7/convert", {
      params: {
        q: "USD_CAD",
        compact: "ultra",
        apiKey: process.env.REACT_APP_CURRENCY_API_KEY,
      },
    });

    dispatch({
      type: FETCH_EXCHANGE_RATE,
      payload: rateRes.data,
    });
  } catch (e) {
    console.error("fetchUSDToCADExchangeRate Error: ", e);
    dispatch({
      type: FETCH_EXCHANGE_RATE,
      payload: {
        USD_CAD: 1.25,
      },
    });
  }
};

export const fetchAccountsAndBalances =
  (retryNumber = 1) =>
  async (dispatch, getState) => {
    const { api_server, access_token } = getState().auth;
    const questradeAPIInstance = questradeAPI(api_server, access_token);
    try {
      const accountsRes = await questradeAPIInstance.get("/v1/accounts");
      const accounts = accountsRes.data.accounts;

      const balancesPromises = accounts.map((acc) =>
        questradeAPIInstance.get(`/v1/accounts/${acc.number}/balances`)
      );

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

        dispatch({
          type: FETCH_ACCOUNTS_AND_BALANCES,
          payload: _.merge(accounts, balances),
        });
      });
    } catch (e) {
      dispatch(retryReqeust(fetchAccountsAndBalances, retryNumber + 1, e, []));
    }
  };

export const fetchPositions =
  (retryNumber = 1, accountNumber) =>
  async (dispatch, getState) => {
    const { api_server, access_token } = getState().auth;
    const questradeAPIInstance = questradeAPI(api_server, access_token);
    try {
      const positionsRes = await questradeAPIInstance.get(
        `/v1/accounts/${accountNumber}/positions`
      );

      const symbolsRes = await questradeAPIInstance.get("/v1/symbols", {
        params: {
          ids: _.join(_.map(positionsRes.data.positions, "symbolId"), ","),
        },
      });

      dispatch({
        type: FETCH_POSITIONS,
        payload: {
          data: _.merge(positionsRes.data.positions, symbolsRes.data.symbols),
          accountNumber,
        },
      });
    } catch (e) {
      dispatch(
        retryReqeust(fetchPositions, retryNumber + 1, e, [accountNumber])
      );
    }
  };

export const fetchSymbolId =
  (symbol, interval) => async (dispatch, getState) => {};

export const fetchCandles =
  (retryNumber = 1, symbolId, interval) =>
  async (dispatch, getState) => {
    const { api_server, access_token } = getState().auth;
    const questradeAPIInstance = questradeAPI(api_server, access_token);
    let endDate = new Date();
    endDate.setHours(4, 30, 0);

    switch (interval) {
      case "oneDay":
        endDate.setDate(endDate.getDate() - 1);
        break;
      case "fiveDays":
        endDate.setDate(endDate.getDate() - 5);
        break;
      case "oneMonth":
        endDate.setMonth(endDate.getMonth() - 1);
        break;
      case "sixMonths":
        endDate.setMonth(endDate.getMonth() - 6);
        break;
      case "oneYear":
        endDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case "fiveYears":
        endDate.setFullYear(endDate.getFullYear() - 5);
        break;
      default:
        endDate.setDate(endDate.getDate() - 1);
        break;
    }

    if (endDate.getDay() === 0) {
      endDate.setDate(endDate.getDate() - 2);
    } else if (endDate.getDay() === 6) {
      endDate.setDate(endDate.getDate() - 1);
    }

    console.log(endDate);

    try {
      const candlesRes = await questradeAPIInstance.get(
        `/v1/markets/candles/${symbolId}`,
        {
          params: {
            startTime: endDate.toISOString().substring(0, 16) + ":00-05:00",
            endTime: new Date().toISOString().substring(0, 16) + ":00-05:00",
            interval: questradeIntervalEnum[interval],
          },
        }
      );
      dispatch({
        type: FETCH_CANDLES,
        payload: {
          data: candlesRes.data,
          symbolId,
        },
      });
    } catch (e) {
      dispatch(
        retryReqeust(fetchCandles, retryNumber + 1, e, [symbolId, interval])
      );
    }
  };

export const fetchSymbolInfoFromId =
  (retryNumber = 1, symbolId) =>
  async (dispatch, getState) => {
    const { api_server, access_token } = getState().auth;
    const questradeAPIInstance = questradeAPI(api_server, access_token);
    try {
      const data = await questradeAPIInstance.get(`/v1/symbols/${symbolId}`);
      dispatch({
        type: FETCH_SYMBOL_DATA,
        payload: {
          data: data.data,
          symbolId,
        },
      });
    } catch (e) {
      dispatch(
        retryReqeust(fetchSymbolInfoFromId, retryNumber + 1, e, [symbolId])
      );
    }
  };

export const fetchOptionsData =
  (retryNumber = 1, symbolId) =>
  async (dispatch, getState) => {
    const { api_server, access_token } = getState().auth;
    const questradeAPIInstance = questradeAPI(api_server, access_token);
    try {
      const res = await questradeAPIInstance.get(
        `/v1/symbols/${symbolId}/options`
      );
      dispatch({
        type: FETCH_OPTIONS_DATA,
        payload: {
          data: res.data,
          symbolId,
        },
      });
    } catch (e) {
      dispatch(retryReqeust(fetchOptionsData, retryNumber + 1, e, [symbolId]));
    }
  };

import axios from "axios";

import {
  FETCH_ACCOUNTS_AND_BALANCES,
  USER_LOGOUT,
  FETCH_POSITIONS,
  FETCH_EXCHANGE_RATE,
  FETCH_CANDLES,
  FETCH_SYMBOL_DATA,
  FETCH_OPTIONS_DATA,
  FETCH_SYMBOL_SEARCH,
} from "./types";
import history from "../history";

export const signOut = () => async (dispatch) => {
  try {
    await axios.get("/api/logout");
    dispatch({
      type: USER_LOGOUT,
    });

    history.push("/account-error");
  } catch (e) {
    console.error("Unable to sign out: ", e);
    window.alert("Unable to log out, please try again!");
  }
};

export const fetchUSDToCADExchangeRate = () => async (dispatch) => {
  try {
    const res = await axios.get("/api/exchange-rate");
    dispatch({
      type: FETCH_EXCHANGE_RATE,
      payload: res.data,
    });
  } catch (e) {
    console.error(
      `ERROR: Getting USD/CAD Exchange Rate: Request failed with status code 400 ${e.message}`
    );
  }
};

export const fetchAccountsAndBalances = () => async (dispatch) => {
  try {
    const res = await axios.get("/api/accounts-and-balances");
    dispatch({
      type: FETCH_ACCOUNTS_AND_BALANCES,
      payload: res.data,
    });
  } catch (e) {
    console.error("Error fetching /accounts-and-balances/ from API: ", e);
    dispatch(signOut());
  }
};

export const fetchPositions = (accountNumber) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/posistions/${accountNumber}`);
    dispatch({
      type: FETCH_POSITIONS,
      payload: {
        data: res.data,
        accountNumber,
      },
    });
  } catch (e) {
    console.error("Error fetching /posistions/.../ from API: ", e);
    dispatch(signOut());
  }
};

export const fetchCandles = (symbolId, interval) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/candles/${symbolId}`, { params: { interval } });
    dispatch({
      type: FETCH_CANDLES,
      payload: {
        data: res.data,
        symbolId,
      },
    });
  } catch (e) {
    console.error("Error fetching /api/candles/.../ from API: ", e);
    dispatch(signOut());
  }
};

export const fetchSymbolInfoFromId = (symbolId) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/symbol/${symbolId}`);
    dispatch({
      type: FETCH_SYMBOL_DATA,
      payload: {
        data: res.data,
        symbolId,
      },
    });
  } catch (e) {
    console.error("Error fetching /api/symbol/.../ from API: ", e);
    dispatch(signOut());
  }
};

export const fetchOptionsData = (symbolId) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/option/${symbolId}`);
    dispatch({
      type: FETCH_OPTIONS_DATA,
      payload: {
        data: res.data,
        symbolId,
      },
    });
  } catch (e) {
    console.error("Error fetching /api/option/.../ from API: ", e);
    dispatch(signOut());
  }
};

// PUT THIS DIRECTLY IN THE COMPENENT - DONT USE REDUX FOR THIS
export const fetchSymbolId = (symbol) => async (dispatch) => {
  try {
    const res = await axios.get(`/api/symbol-search`, { params: { s: symbol } });
    dispatch({
      type: FETCH_SYMBOL_SEARCH,
      payload: res.data,
    });
  } catch (e) {
    console.error("Error fetching /api/symbol-serach from API: ", e);
    dispatch(signOut());
  }
};
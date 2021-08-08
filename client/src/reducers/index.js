import { combineReducers } from "redux";
import accountsReducer from "./accountsReducer";
import positionsReducer from "./positionsReducer";
import exchangeRateReducer from "./exchangeRateReducer";
import candlesReducer from "./candlesReducer";
import tradesReducer from "./tradesReducer";
import { USER_LOGOUT } from "../actions/types";

const appReducer = combineReducers({
  accounts: accountsReducer,
  positions: positionsReducer,
  exchangeRate: exchangeRateReducer,
  candles: candlesReducer,
  trades: tradesReducer,
});

const totalReducer = (state, action) => {
  if (action.type === USER_LOGOUT) {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

export default totalReducer;

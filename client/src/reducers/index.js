import { combineReducers } from "redux";
import accountsReducer from "./accountsReducer";
import positionsReducer from "./positionsReducer";
import exchangeRateReducer from "./exchangeRateReducer";
import candlesReducer from "./candlesReducer";
import { USER_LOGOUT } from "../actions/types";

const appReducer = combineReducers({
  accounts: accountsReducer,
  positions: positionsReducer,
  exchangeRate: exchangeRateReducer,
  candles: candlesReducer,
});

export default (state, action) => {
  if (action.type === USER_LOGOUT) {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

import { combineReducers } from "redux";
import authReducer from "./authReducer";
import accountsReducer from "./accountsReducer";
import positionsReducer from "./positionsReducer";
import exchangeRateReducer from "./exchangeRateReducer";
import { USER_LOGOUT } from "../actions/types";
import candlesReducer from "./candlesReducer";

const appReducer = combineReducers({
  auth: authReducer,
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

import { FETCH_EXCHANGE_RATE } from "../actions/types";

const exchangeRateReducer = (state = null, action) => {
  switch (action.type) {
    case FETCH_EXCHANGE_RATE:
      return action.payload.USD_CAD;
    default:
      return state;
  }
};

export default exchangeRateReducer;

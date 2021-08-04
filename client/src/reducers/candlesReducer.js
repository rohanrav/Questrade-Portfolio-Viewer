import { FETCH_CANDLES, FETCH_SYMBOL_DATA, FETCH_OPTIONS_DATA } from "../actions/types";

export default (state = {}, action) => {
  switch (action.type) {
    case FETCH_CANDLES:
      return {
        ...state,
        [action.payload.symbolId]: {
          ...state[action.payload.symbolId],
          marketData: action.payload.data.candles,
        },
      };
    case FETCH_SYMBOL_DATA:
      return {
        ...state,
        [action.payload.symbolId]: {
          ...state[action.payload.symbolId],
          symbolInfo: action.payload.data.symbols[0],
        },
      };
    case FETCH_OPTIONS_DATA:
      return {
        ...state,
        [action.payload.symbolId]: {
          ...state[action.payload.symbolId],
          optionsData: action.payload.data.optionChain,
        },
      };
    default:
      return state;
  }
};

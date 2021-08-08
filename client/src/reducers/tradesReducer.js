import { FETCH_ORDERS, FETCH_EXECUTIONS } from "../actions/types";

const tradesReducer = (state = {}, action) => {
  switch (action.type) {
    case FETCH_ORDERS:
      return {
        ...state,
        [action.payload.accountNumber]: {
          ...state[action.payload.accountNumber],
          orders: action.payload.data,
        },
      };
    case FETCH_EXECUTIONS:
      return {
        ...state,
        [action.payload.accountNumber]: {
          ...state[action.payload.accountNumber],
          executions: action.payload.data,
        },
      };
    default:
      return state;
  }
};

export default tradesReducer;

import _ from "lodash";
import { FETCH_ACCOUNTS_AND_BALANCES } from "../actions/types";

const accountsReducer = (state = {}, action) => {
  switch (action.type) {
    case FETCH_ACCOUNTS_AND_BALANCES:
      return { ...state, ..._.mapKeys(action.payload, "number") };
    default:
      return state;
  }
};

export default accountsReducer;

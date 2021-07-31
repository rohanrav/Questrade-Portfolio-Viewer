import _ from "lodash";
import { FETCH_POSITIONS } from "../actions/types";

export default (state = {}, action) => {
  switch (action.type) {
    case FETCH_POSITIONS:
      return {
        ...state,
        [action.payload.accountNumber]: {
          ...state[action.payload.accountNumber],
          ..._.mapKeys(action.payload.data, "symbol"),
        },
      };
    default:
      return state;
  }
};

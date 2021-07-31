import { OAUTH_SIGN_IN } from "../actions/types";

const INITIAL_STATE = {
  isSignedIn: null,
  access_token: null,
  expires_in: null,
  refresh_token: null,
  api_server: null,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case OAUTH_SIGN_IN:
      return { ...state, isSignedIn: true, ...action.payload };
    default:
      return state;
  }
};

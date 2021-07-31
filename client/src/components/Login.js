import React from "react";
import { connect } from "react-redux";
import Cookies from "universal-cookie";
import { fetchAccessTokenWithRefreshToken } from "../actions";

class Login extends React.Component {
  constructor(props) {
    super(props);
    // this.redirectURL = `${process.env.REACT_APP_DEV_URL}/onSuccessLogin`;
    // this.OAuthURL = `https://login.questrade.com/oauth2/authorize?client_id=${process.env.REACT_APP_CLIENT_ID}&response_type=code&redirect_uri=${this.redirectURL}`;
    // this.cookies = new Cookies();
  }

  loginButtonClicked = () => {
    // const refresh_token = this.cookies.get("refresh_token");
    // if (refresh_token) {
    //   this.props.fetchAccessTokenWithRefreshToken(
    //     () => {
    //       this.props.history.push("/accounts");
    //       return {
    //         type: "LOGIN_REFRESH_TOKEN",
    //       };
    //     },
    //     [],
    //     1
    //   );
    // } else {
    //   window.location.href = this.OAuthURL;
    // }
  };

  render() {
    return (
      <a href="/auth/questrade" className="ui green button">
        Log In
      </a>
    );
  }
}

export default connect(null, { fetchAccessTokenWithRefreshToken })(Login);

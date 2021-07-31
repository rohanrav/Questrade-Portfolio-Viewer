import React from "react";
import { connect } from "react-redux";
import { signOut, fetchAccessTokenWithRefreshToken } from "../actions";
import { Link } from "react-router-dom";
import Loader from "./Loader";
import Cookies from "universal-cookie";

class AccountError extends React.Component {
  constructor(props) {
    super(props);
    this.refreshTokenAvailable = false;
    const cookies = new Cookies();
    if (cookies.get("refresh_token")) {
      this.refreshTokenAvailable = true;
      this.props.fetchAccessTokenWithRefreshToken(
        () => {
          this.props.history.goBack();
          return {
            type: "LOGIN_REFRESH_TOKEN",
          };
        },
        [],
        1
      );
    }
  }

  render() {
    if (this.refreshTokenAvailable) {
      return <Loader loaderText="Loading account information..." fullScreen />;
    }

    return (
      <div>
        <h2>Account Error: Please Sign In Again</h2>
        <Link className="ui button green" to="/">
          Home
        </Link>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, {
  signOut,
  fetchAccessTokenWithRefreshToken,
})(AccountError);

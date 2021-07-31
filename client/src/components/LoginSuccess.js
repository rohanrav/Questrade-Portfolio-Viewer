import React from "react";
import { connect } from "react-redux";
import { fetchAccessToken } from "../actions";

import Loader from "./Loader";

class LoginSuccess extends React.Component {
  constructor(props) {
    super(props);
    this.urlParams = new URLSearchParams(window.location.search);
    this.code = this.urlParams.get("code");
  }

  componentDidMount() {
    this.props.fetchAccessToken(this.code);
  }

  render() {
    return (
      <Loader fullScreen loaderText="Loading your account information..." />
    );
  }
}

export default connect(null, { fetchAccessToken })(LoginSuccess);

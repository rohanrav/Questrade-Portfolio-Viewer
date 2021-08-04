import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import { signOut } from "../actions";

class AccountError extends React.Component {
  render() {
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

export default connect(null, { signOut })(AccountError);

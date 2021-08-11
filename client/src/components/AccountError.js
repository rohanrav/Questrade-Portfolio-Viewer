import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Header from "./Header";
import "./login.css";

import { signOut } from "../actions";

const AccountError = () => {
  return (
    <>
      <div className="ui container">
        <Header isLoggedIn={false} />
      </div>
      <div className="ui inverted vertical center aligned segment">
        <div className="ui content container">
          <h1 className="ui inverted header">
            Uh oh! There's been an <strong style={{ color: "#ea4335" }}>error!</strong>
          </h1>
          <p>
            An error has occured on Questrade's end. Please log in again to resolve the error and{" "}
            <a
              style={{ cursor: "pointer", color: "#fff" }}
              href="mailto:r8ravind@uwaterloo.ca?subject=Questrade%20Portfolio%20Viewer%20Bug%2FInquiry"
              target="_blank"
              rel="noreferrer"
            >
              contact us
            </a>{" "}
            if the error persists.
          </p>
          <Link to="/" className="btn-log-in ui huge button">
            Home
          </Link>
        </div>
        <footer
          className="ui inverted vertical segment"
          style={{ position: "fixed", bottom: "0", left: "0", right: "0" }}
        >
          Made by{" "}
          <a
            style={{ cursor: "pointer" }}
            href="https://www.linkedin.com/in/rohanrav/"
            target="_blank"
            rel="noreferrer"
          >
            Rohan Ravindran
          </a>
          {" | Style inspired by "}
          <a
            style={{ cursor: "pointer" }}
            href="https://github.com/semantic-ui-forest"
            target="_blank"
            rel="noreferrer"
          >
            @Semantic-UI-Forest
          </a>
          .
        </footer>
      </div>
    </>
  );
};

export default connect(null, { signOut })(AccountError);

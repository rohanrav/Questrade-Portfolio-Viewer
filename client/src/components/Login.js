import React from "react";
import Header from "./Header";
import "./css/login.css";

const Login = () => {
  return (
    <>
      <style>
        {
          "\
    .ui.padded.grid.mobile.only {\
        margin-bottom: 2.5rem !important;\
      }\
    "
        }
      </style>
      <div className="ui container">
        <Header isLoggedIn={false} />
      </div>
      <div className="ui inverted vertical center aligned segment">
        <div className="ui content container">
          <h1 className="ui inverted header">Questrade Portfolio Viewer</h1>
          <p>
            Manage all your Questrade accounts with ease! Get easily understadable graphs, options
            data, and real-time pricing information to make managing your portfolio as easy as
            possible.
          </p>
          <a href="/auth/questrade/login" className="btn-log-in ui green huge button">
            Log In With Questrade
          </a>
        </div>
        <footer
          className="ui inverted vertical segment"
          style={{ position: "fixed", bottom: "0", left: "0", right: "0" }}
        >
          <a
            style={{ cursor: "pointer" }}
            href="https://github.com/rohanrav/questrade_portfolio_view"
            target="_blank"
            rel="noreferrer"
          >
            <i className="github icon"></i>
            {"Questrade Portfolio Viewer"}
          </a>
          {" | "}Made by{" "}
          <a
            style={{ cursor: "pointer" }}
            href="https://www.linkedin.com/in/rohanrav/"
            target="_blank"
            rel="noreferrer"
          >
            Rohan Ravindran
          </a>
        </footer>
      </div>
    </>
  );
};

export default Login;

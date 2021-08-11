import React from "react";
import Header from "./Header";
import "./login.css";

const Login = () => {
  return (
    <>
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

{
  /* <div className="ui inverted vertical center aligned segment">
        <div className="ui content container">
          <h1 className="ui inverted header">Cover your page.</h1>
          <p>View all your accounts in your Questrade Portfolio</p>
          <a href="/auth/questrade/login" className="ui green huge button">
            Log In
          </a>
        </div>
        <footer className="ui inverted vertical segment">
          Made by{" "}
          <a
            style={{ cursor: "pointer" }}
            href="https://www.linkedin.com/in/rohanrav/"
            target="_blank"
            rel="noreferrer"
          >
            Rohan Ravindran
          </a>
          {" | Style by "}
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
      </div> */
}

export default Login;

import React from "react";
import "./css/login.css";

const Footer = () => {
  return (
    <div className="footer ui inverted vertical center aligned segment" style={{ height: "100%" }}>
      <footer
        className="ui inverted vertical segment"
        style={{ position: "absolute", bottom: "0" }}
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
  );
};

export default Footer;

import React from "react";
import "./login.css";

const Footer = () => {
  return (
    <div className="footer ui inverted vertical center aligned segment" style={{ height: "100%" }}>
      <footer
        className="ui inverted vertical segment"
        style={{ position: "absolute", bottom: "0" }}
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
  );
};

export default Footer;

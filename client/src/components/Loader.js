import React from "react";

const Loader = (props) => {
  const color = { backgroundColor: "#2b2b2b" };
  let fullScreen = props.fullScreen ? { ...color, position: "fixed" } : { ...color };
  fullScreen = props.height ? { ...fullScreen, height: props.height } : { ...fullScreen };

  return (
    <div
      className={`${props.fullScreen ? null : "ui segment"}`}
      style={props.height ? { border: "none" } : null}
    >
      <div className="ui active dimmer" style={fullScreen}>
        <div className="ui text loader">{props.loaderText}</div>
      </div>
      <p></p>
    </div>
  );
};

Loader.defaultProps = {
  loaderText: "Loading...",
  fullScreen: null,
  height: null,
};

export default Loader;

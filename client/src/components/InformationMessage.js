import React from "react";

const InformationMessage = (props) => {
  return (
    <div className="ui inverted message">
      <div className="header">{props.header}</div>
      <p>{props.subheader}</p>
    </div>
  );
};

InformationMessage.defaultProps = {
  title: "Message",
  subheader: "Placeholder text for message",
};

export default InformationMessage;

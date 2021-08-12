import React from "react";

const InformationMessage = ({ className, header, subheader }) => {
  return (
    <div className={`ui inverted message ${className}`}>
      <div className="header">{header}</div>
      <p>{subheader}</p>
    </div>
  );
};

InformationMessage.defaultProps = {
  header: "Message",
  subheader: "Placeholder text for message",
};

export default InformationMessage;

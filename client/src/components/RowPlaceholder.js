import React from "react";

const RowPlaceholder = ({ rows = 2, height = "100px" }) => {
  const renderLines = () => {
    let lines = [];
    for (let i = 0; i < rows; i += 3) {
      lines.push(
        <React.Fragment key={i}>
          <div className="full line"></div>
          <div className="very long line"></div>
          <div className="long line"></div>
        </React.Fragment>
      );
    }
    return lines;
  };

  return (
    <div className="ui inverted segment" style={{ height, marginBottom: "0" }}>
      <div className="ui active inverted fluid placeholder">{renderLines()}</div>
    </div>
  );
};

export default RowPlaceholder;

import React from "react";

const AccountTableInfo = (props) => {
  return (
    <td className={`${props.width} wide`}>
      <div className="table-row-header">{props.header}</div>
      <div className="account-title">{props.main}</div>
    </td>
  );
};

export default AccountTableInfo;

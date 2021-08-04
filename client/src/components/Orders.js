import React from "react";
import { useEffect } from "react";

const Orders = (props) => {
  useEffect(() => {
    console.log("USE EFFECT");
  }, []);

  return <div>ORDERS ({props.match.params.accountNumber})</div>;
};

export default Orders;

import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { fetchAccountExecutions, fetchAccountOrders, fetchAccountsAndBalances } from "../actions";
import RowPlaceholder from "./RowPlaceholder";
import InformationMessage from "./InformationMessage";
import Dropdown from "./Drowdown";
import AccountTableInfo from "./AccountTableInfo";
import { parseISO, formatDistance } from "date-fns";
import _ from "lodash";
import axios from "axios";
import keys from "../config/keys";
import CryptoJS from "crypto-js";

const Orders = (props) => {
  const accountNumber = props.match.params.accountNumber;
  const [orders, setOrders] = useState(null);
  const [executions, setExecutions] = useState(null);

  useEffect(() => {
    setOrders(props.orders);
    setExecutions(props.executions);
  }, [props.orders, props.executions]);

  useEffect(() => {
    const fetchData = async () => {
      props.fetchAccountsAndBalances();
      props.fetchAccountExecutions(accountNumber);
      props.fetchAccountOrders(accountNumber);

      try {
        const res = await axios.get(`/api/stream/orders`);
        const bytes = CryptoJS.AES.decrypt(res.data, keys.CRYPTO_SECRET_KEY);
        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        const ws = new WebSocket(decryptedData.questradePortURL);

        ws.onopen = () => {
          ws.send(decryptedData.eAT);
        };

        ws.onmessage = (event) => {
          const unfilteredData = JSON.parse(event.data);
          if (
            !unfilteredData.accountNumber ||
            unfilteredData.accountNumber.toString() !== accountNumber
          ) {
            return;
          }

          let executionsDataToCheck = null;
          let ordersData = null;

          if (unfilteredData.executions && unfilteredData.executions.length !== 0) {
            executionsDataToCheck = _.merge(
              _.keyBy(executions, "orderId"),
              _.keyBy(unfilteredData.executions, "orderId")
            );
            setExecutions(
              Object.values(
                _.merge(_.keyBy(executions, "id"), _.keyBy(unfilteredData.executions, "id"))
              )
            );
          }

          if (unfilteredData.orders && unfilteredData.orders.length !== 0) {
            ordersData = _.merge(_.keyBy(orders, "id"), _.keyBy(unfilteredData.orders, "id"));
            if (executionsDataToCheck) {
              const executionIds = _.keys(executionsDataToCheck);
              const orderIds = _.keys(ordersData);
              ordersData = _.pick(
                ordersData,
                orderIds.filter((el) => !executionIds.includes(el))
              );
            }
            setOrders(Object.values(ordersData));
          }
        };

        process.on("exit", () => {
          if (ws) {
            console.log("Closing WebSocket on 'exit' event");
            ws.close();
          }
          process.exit();
        });

        process.on("SIGINT", () => {
          if (ws) {
            console.log("Closing WebSocket on 'SIGINT' event");
            ws.close();
          }
          process.exit();
        });

        process.on("uncaughtException", () => {
          if (ws) {
            console.log("Closing WebSocket on 'uncaughtException' event");
            ws.close();
          }
        });
      } catch (e) {
        console.error("Error creating socket from /api/stream/orders: ", e);
      }
    };
    fetchData();
  }, []);

  const renderAccountOrders = () => {
    if (!orders) {
      return <RowPlaceholder />;
    } else if (orders.length === 0) {
      return (
        <InformationMessage
          header="No Orders"
          subheader={`There are no active orders for this account`}
        />
      );
    }

    return (
      <table className="ui padded selectable inverted table">
        <tbody>
          {orders.map((order) => {
            return (
              <tr className="accounts-table" key={order.id}>
                <AccountTableInfo header={`Symbol`} main={order.symbol} width="one" />
                <AccountTableInfo header={`Type`} main={order.side} width="one" />
                <AccountTableInfo header={`State`} main={order.state} width="one" />
                <AccountTableInfo
                  header={order.type === "Limit" ? "Limit Price" : "Order Kind"}
                  main={order.type === "Limit" ? `$${order.limitPrice}` : order.type}
                  width="two"
                />
                <AccountTableInfo header={`Good Til'`} main={order.timeInForce} width="two" />
                <AccountTableInfo header={`Open Quantity`} main={order.openQuantity} width="two" />
                <AccountTableInfo
                  header={`Filled Quantity`}
                  main={order.filledQuantity}
                  width="two"
                />
                <AccountTableInfo header={`ID`} main={order.id} width="one" />
                <AccountTableInfo
                  header={`Last Updated`}
                  main={`${formatDistance(new Date(), parseISO(order.updateTime))} ago`}
                  width="three"
                />
                <td className="two wide">
                  <button
                    className="ui button green"
                    style={{ display: "block" }}
                    onClick={() => console.log("UPDATE BUTTON CLICKED")}
                  >
                    Update
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const renderAccountExecutions = () => {
    if (!executions) {
      return <RowPlaceholder />;
    } else if (executions.length === 0) {
      return (
        <InformationMessage
          header="No Executions"
          subheader={`There are no active executions for this account`}
        />
      );
    }

    return (
      <table className="ui padded selectable inverted table">
        <tbody>
          {executions.map((execution) => {
            return (
              <tr className="accounts-table" key={execution.id}>
                <AccountTableInfo header={`Symbol`} main={execution.symbol} width="one" />
                <AccountTableInfo header={`Type`} main={execution.side} width="one" />
                <AccountTableInfo header={`Quantity`} main={execution.quantity} width="one" />
                <AccountTableInfo header={`Price Per`} main={`$${execution.price}`} width="two" />
                <AccountTableInfo
                  header={`Trade Cost`}
                  main={`$${execution.totalCost}`}
                  width="two"
                />
                <AccountTableInfo
                  header={`Commission + Fees`}
                  main={`$${
                    execution.orderPlacementCommission +
                    execution.commission +
                    execution.secFee +
                    execution.canadianExecutionFee
                  }`}
                  width="three"
                />
                <AccountTableInfo header={`ID`} main={execution.orderId} width="three" />
                <AccountTableInfo
                  header={`Time Executed`}
                  main={`${formatDistance(new Date(), parseISO(execution.timestam))} ago`}
                  width="three"
                />
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const renderDropDown = () => {
    if (!props.accounts) {
      return (
        <Dropdown
          selected={{ value: "Loading...", label: "Loading..." }}
          onSelectedChange={null}
          options={[]}
          label=""
          loading
        />
      );
    }
    const selected = props.accounts.find((acc) => acc.number === accountNumber);
    let dropDownData = [];
    Object.values(props.accounts).forEach((account) => {
      if (accountNumber === account.number) return;
      dropDownData.push({
        label: `${account.clientAccountType} ${account.type} (${account.number})`,
        value: account.number,
      });
    });

    return (
      <div style={{ marginTop: "10px" }}>
        <Dropdown
          selected={{
            value: selected.number,
            label: `${selected.clientAccountType} ${selected.type} (${selected.number})`,
          }}
          onSelectedChange={(item) => props.history.push(`/orders/${item.value}`)}
          options={dropDownData}
          label=""
          bottom={false}
        />
      </div>
    );
  };

  return (
    <div>
      <h1 className="ui dividing inverted header">Trades</h1>
      {renderDropDown()}
      <h3 className="ui top attached header attached-segment-header">Orders</h3>
      <div className="ui attached segment" style={{ border: "none", background: "#272727" }}>
        <div className="ui grid">
          <div className="row">
            <div className="sixteen wide column">{renderAccountOrders()}</div>
          </div>
        </div>
      </div>
      <h3 className="ui top attached header attached-segment-header">Executions</h3>
      <div className="ui attached segment" style={{ border: "none", background: "#272727" }}>
        <div className="ui grid">
          <div className="row">
            <div className="sixteen wide column">{renderAccountExecutions()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state, ownProps) => {
  const { accountNumber } = ownProps.match.params;
  if (!state.trades[accountNumber] || !state.accounts[accountNumber]) return {};

  return {
    orders: state.trades[accountNumber].orders,
    executions: state.trades[accountNumber].executions,
    accounts: Object.values(state.accounts),
  };
};

export default connect(mapStateToProps, {
  fetchAccountExecutions,
  fetchAccountOrders,
  fetchAccountsAndBalances,
})(Orders);

/**
 * TUrn into class based component
 * move socket stuff to componentDidMount
 * setup this component to work with redux,
 *      add in action creators to fetch orders and executions + reducers to add into redux store and work on frontend design
 * write code in backend to trigger the socket everytime an event is trggered from the
 *      questrade api socket, and write code in frontend to take that socket, and update the
 *      appropriate order/execution (if order has become execution, dleete it from order, vice versa)
 *      otherwise update the existing order/execution row, then finish this part
 * NEXT:
 *      work on stockview (adding more appealing info about the stock --> +/- in the day, grid boxes, etc.)
 *      volumne data, tooltip, 
 *      Work on header (account selected/not selected, etc.)
//   - add styling for home page, account error, etc.
//   - add guards for accessing restrected pages without being locked in
//   - add liability and use at your own discretion warnings
*/

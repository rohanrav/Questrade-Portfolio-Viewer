import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import { fetchAccountsAndBalances, signOut } from "../actions";
import AccountTableInfo from "./AccountTableInfo";
import Loader from "./Loader";

class Accounts extends React.Component {
  componentDidMount() {
    this.props.fetchAccountsAndBalances();
  }

  roundNumber = (num) => Math.round(Number(num) * 100) / 100;

  renderAccounts = () => {
    return this.props.accounts.map((acc) => {
      return (
        <tr className="accounts-table" key={acc.number}>
          <AccountTableInfo
            header={acc.clientAccountType}
            main={`${acc.type} (${acc.number})`}
            width="four"
          />
          <AccountTableInfo header="Cash" main={`$${this.roundNumber(acc.cash)}`} width="three" />
          <AccountTableInfo
            header="Market Value"
            main={`$${this.roundNumber(acc.marketValue)}`}
            width="three"
          />
          <AccountTableInfo
            header="Total Equity"
            main={`$${this.roundNumber(acc.totalEquity)}`}
            width="three"
          />
          <td className="four wide">
            <Link
              to={`/accounts/${acc.number}`}
              className="ui button green"
              style={{ display: "block" }}
            >
              Details<i className="angle right icon"></i>
            </Link>
          </td>
        </tr>
      );
    });
  };

  render() {
    return (
      <>
        <h1 className="ui dividing inverted header">Investing Accounts</h1>
        {this.props.accounts.length === 0 ? (
          <Loader height="100px" />
        ) : (
          <table className="ui padded selectable inverted table">
            <tbody>{this.renderAccounts()}</tbody>
          </table>
        )}
        <button className="ui button red" onClick={() => this.props.signOut()}>
          Log Out
        </button>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    accounts: Object.values(state.accounts),
  };
};

export default connect(mapStateToProps, { fetchAccountsAndBalances, signOut })(Accounts);
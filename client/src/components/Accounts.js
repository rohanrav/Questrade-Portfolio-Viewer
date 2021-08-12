import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import { fetchAccountsAndBalances, signOut } from "../actions";
import AccountTableInfo from "./AccountTableInfo";
import RowPlaceholder from "./RowPlaceholder";
import Header from "./Header";
import Footer from "./Footer";

const Accounts = ({ fetchAccountsAndBalances, accounts, signOut }) => {
  useEffect(() => {
    fetchAccountsAndBalances();
  }, [fetchAccountsAndBalances]);

  const roundNumber = (num) => Math.round(Number(num) * 100) / 100;

  const renderAccounts = () => {
    return accounts.map((acc) => {
      return (
        <tr className="accounts-table" key={acc.number}>
          <AccountTableInfo
            header={acc.clientAccountType}
            main={`${acc.type} (${acc.number})`}
            width="four"
          />
          <AccountTableInfo header="Cash" main={`$${roundNumber(acc.cash)}`} width="three" />
          <AccountTableInfo
            header="Market Value"
            main={`$${roundNumber(acc.marketValue)}`}
            width="three"
          />
          <AccountTableInfo
            header="Total Equity"
            main={`$${roundNumber(acc.totalEquity)}`}
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

  return (
    <>
      <section className="ui container">
        <div id="content-body">
          <Header />
          <h1 className="ui dividing inverted header page-header-text">Accounts</h1>
          {accounts.length === 0 ? (
            <div style={{ marginBottom: "10px", marginTop: "15px" }}>
              <RowPlaceholder height="100px" />
            </div>
          ) : (
            <table className="ui padded selectable inverted table">
              <tbody>{renderAccounts()}</tbody>
            </table>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

const mapStateToProps = (state) => {
  return {
    accounts: Object.values(state.accounts),
  };
};

export default connect(mapStateToProps, { fetchAccountsAndBalances, signOut })(Accounts);

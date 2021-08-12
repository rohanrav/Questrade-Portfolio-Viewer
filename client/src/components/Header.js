import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button, Form, Grid, Icon, Menu } from "semantic-ui-react";
import { fetchAccountsAndBalances, signOut } from "../actions";
import history from "../history";

const Header = ({ signOut, fetchAccountsAndBalances, accounts, isLoggedIn }) => {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownMenuStyle, setDropdownMenuStyle] = useState({
    display: "none",
  });
  const ref = useRef();
  const mobileWidth = window.innerWidth <= 414 ? true : false;

  const checkUnderline = () => {
    if (
      history.location.pathname.includes("accounts") ||
      history.location.pathname.includes("stock")
    ) {
      return "accounts";
    } else if (history.location.pathname.includes("orders")) {
      return "orders";
    }

    return null;
  };

  useEffect(() => {
    if (isLoggedIn) fetchAccountsAndBalances();
  }, [fetchAccountsAndBalances]);

  useEffect(() => {
    const onBodyClick = (event) => {
      if (!ref?.current || ref.current.contains(event.target)) return;
      setOpen(false);
    };
    if (open) {
      document.body.addEventListener("click", onBodyClick, { capture: true });
    }

    return () => {
      document.body.removeEventListener("click", onBodyClick, { capture: true });
    };
  }, [open]);

  useEffect(() => {
    setLoading(true);
    const search = async () => {
      const { data } = await axios.get("/api/symbol-search", { params: { s: term } });
      setResults(data.slice(0, 8));
      setLoading(false);
    };

    setOpen(true);
    if (term === "") {
      setResults([]);
      setLoading(false);
    }

    if (term && !results.length) {
      search();
    } else {
      const timeOutID = setTimeout(() => {
        if (term) search();
      }, 300);

      return () => {
        clearTimeout(timeOutID);
      };
    }
  }, [term]);

  const handleToggleDropdownMenu = () => {
    let newState = dropdownMenuStyle;
    if (newState.display === "none") {
      newState = { display: "flex" };
    } else {
      newState = { display: "none" };
    }

    setDropdownMenuStyle(newState);
  };

  const renderedResults = () => {
    const filteredResults = results.filter((res) => res.isTradable && res.isQuotable);
    return filteredResults.map((item) => (
      <Link
        key={item.symbolId}
        className="item header-list"
        to={`/stock/${item.symbolId}`}
        name={item.symbolId}
        onClick={(e) => setTerm("")}
        style={{ marginLeft: "0", marginRight: "0", borderRadius: "0" }}
      >
        <div className="right floated content" style={{ color: "#000" }}>
          {item.listingExchange}
        </div>
        <div className="content" style={{ color: "#000" }}>
          {item.symbol} ({item.currency})
        </div>
      </Link>
    ));
  };

  const getAccountsForOrdersLink = () => {
    if (accounts) {
      return accounts[0] ? accounts[0].number : "";
    } else {
      return "";
    }
  };

  const renderHeader = () => {
    const underline = checkUnderline();
    return (
      <>
        <div>
          {!mobileWidth && (
            <div className="ui secondary inverted menu page-menu">
              <Link className="menu-logo item" to="/">
                Questrade Portfolio Viewer
              </Link>
              {isLoggedIn && (
                <>
                  <Link
                    className={`${underline === "accounts" ? "active" : null} item`}
                    to="/accounts"
                  >
                    Accounts
                  </Link>
                  <Link
                    className={`${underline === "orders" ? "active" : null} item`}
                    to={`/orders/${getAccountsForOrdersLink()}`}
                  >
                    Orders
                  </Link>
                  <div className="right menu">
                    <div className="item" style={{ marginRight: "0" }}>
                      <div className={`ui icon ${loading ? "loading" : ""} input`}>
                        <input
                          type="text"
                          placeholder="Search Symbols..."
                          className="input"
                          value={term}
                          onChange={(e) => setTerm(e.target.value)}
                          onClick={() => setOpen(true)}
                        />
                        <i className="search link icon"></i>
                      </div>
                      {open && (
                        <div ref={ref} style={{ position: "absolute" }}>
                          <div className={`results`}>
                            <div
                              className="ui celled list"
                              style={{
                                position: "absolute",
                                top: "0",
                                zIndex: "99999",
                                marginTop: "16.5px",
                              }}
                            >
                              {renderedResults()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <a className="btn-log-out active item" onClick={() => signOut(false)} href="#">
                      Log Out
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        {mobileWidth && (
          <Grid padded className={`mobile only`}>
            <Menu borderless fluid inverted fixed="top" size="huge">
              <Menu.Item header onClick={() => history.push("/")}>
                Questrade Portfolio Viewer
              </Menu.Item>
              {isLoggedIn && (
                <>
                  <Menu.Menu position="right">
                    <Menu.Item>
                      <Button basic inverted icon toggle onClick={handleToggleDropdownMenu}>
                        <Icon name="content" />
                      </Button>
                    </Menu.Item>
                  </Menu.Menu>
                  <Menu borderless fluid inverted vertical style={dropdownMenuStyle}>
                    <Menu.Item>
                      <Form>
                        <Form.Button
                          content="Accounts"
                          color="grey"
                          className="btn-mobile"
                          onClick={() => history.push("/accounts")}
                        />
                        <Form.Button
                          content="Orders"
                          color="grey"
                          className="btn-mobile"
                          onClick={() => history.push(`/orders/${getAccountsForOrdersLink()}`)}
                        />
                        <Form.Button
                          content="Log Out"
                          color="red"
                          className="btn-mobile"
                          onClick={() => signOut(false)}
                        />
                        <Form.Input
                          placeholder="Search Symbols..."
                          type="text"
                          className="input"
                          value={term}
                          onChange={(e) => setTerm(e.target.value)}
                          onClick={() => setOpen(true)}
                        />
                        {open && (
                          <div ref={ref} style={{ position: "absolute" }}>
                            <div className={`results`}>
                              <div
                                className="ui celled list"
                                style={{
                                  position: "absolute",
                                  top: "0",
                                  zIndex: "99999",
                                  marginTop: "-15px",
                                  width: "350px",
                                }}
                              >
                                {renderedResults()}
                              </div>
                            </div>
                          </div>
                        )}
                      </Form>
                    </Menu.Item>
                  </Menu>
                </>
              )}
            </Menu>
          </Grid>
        )}
      </>
    );
  };

  return renderHeader();
};

const mapStateToProps = (state) => {
  return {
    accounts: Object.values(state.accounts),
  };
};

Header.defaultProps = {
  isLoggedIn: true,
};

export default connect(mapStateToProps, { signOut, fetchAccountsAndBalances })(Header);

import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import history from "../history";
import Login from "./Login";
import Accounts from "./Accounts";
import AccountDetail from "./AccountDetail";
import AccountError from "./AccountError";
import StockDetail from "./StockDetail";
import Orders from "./Orders";
import "./styles.css";

const App = () => {
  return (
    <>
      <div className="header-marker"></div>
      <Router history={history}>
        <div>
          <Switch>
            <Route path="/" exact component={Login} />
            <Route path="/account-error" exact component={AccountError} />
            <Route path="/accounts" exact component={Accounts} />
            <Route path="/accounts/:accountNumber" exact component={AccountDetail} />
            <Route path="/stock/:id" exact component={StockDetail} />
            <Route path="/orders/:accountNumber" exact component={Orders} />
          </Switch>
        </div>
      </Router>
    </>
  );
};

export default App;

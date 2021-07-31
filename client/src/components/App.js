import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import history from "../history";
import Login from "./Login";
import LoginSuccess from "./LoginSuccess";
import Accounts from "./Accounts";
import AccountDetail from "./AccountDetail";
import AccountError from "./AccountError";
import StockDetail from "./StockDetail";
import PlaceOrder from "./PlaceOrder";
import "./styles.css";

const App = () => {
  return (
    <div className="ui container">
      <Router history={history}>
        <div>
          <Switch>
            <Route path="/" exact component={Login} />
            <Route path="/onSuccessLogin" exact component={LoginSuccess} />
            <Route path="/account-error" exact component={AccountError} />
            <Route path="/accounts" exact component={Accounts} />
            <Route
              path="/accounts/:accountNumber"
              exact
              component={AccountDetail}
            />
            <Route path="/stock/:id" exact component={StockDetail} />
            <Route path="/trade/:id" exact component={PlaceOrder} />
          </Switch>
        </div>
      </Router>
    </div>
  );
};

export default App;

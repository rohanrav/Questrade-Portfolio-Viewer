import React, { useEffect } from "react";
import { Router, Route, Switch } from "react-router-dom";
import axios from "axios";
import history from "../history";
import Login from "./Login";
import Accounts from "./Accounts";
import AccountDetail from "./AccountDetail";
import AccountError from "./AccountError";
import StockDetail from "./StockDetail";
import Orders from "./Orders";
import PageNotFound from "./PageNotFound";
import "semantic-ui-css/semantic.min.css";
import "./css/styles.css";
import "./css/queries.css";

const App = () => {
  useEffect(() => {
    window.addEventListener("load", onWindowLoad);
    window.addEventListener("beforeunload", onWindowUnload);

    return () => {
      window.removeEventListener("load", onWindowLoad);
      window.removeEventListener("beforeunload", onWindowUnload);
    };
  }, []);

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
            <Route component={PageNotFound} />
          </Switch>
        </div>
      </Router>
    </>
  );
};

const onWindowLoad = async () => {
  try {
    await axios.get(`/api/set-refresh-token-interval`);
  } catch (e) {
    console.error("Error fetching /api/set-refresh-token-interval/ from API: ", e.message);
  }
};

const onWindowUnload = async (e) => {
  e.preventDefault();
  try {
    await axios.get(`/api/cancel-refresh-token-interval`);
  } catch (e) {
    console.error("Error fetching /api/cancel-refresh-token-interval/ from API: ", e.message);
  }
};

export default App;

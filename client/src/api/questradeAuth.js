import axios from "axios";

export default axios.create({
  baseURL: `${process.env.REACT_APP_PROXY_URL}/https://login.questrade.com`,
  headers: {
    "Access-Control-Allow-Origin": "*",
  },
});

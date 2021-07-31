import axios from "axios";

export default axios.create({
  baseURL: `${process.env.REACT_APP_PROXY_URL}/https://free.currconv.com`,
  headers: {},
});

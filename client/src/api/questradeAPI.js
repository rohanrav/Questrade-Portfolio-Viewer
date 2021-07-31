import axios from "axios";

export default (serverURL, accessToken) =>
  axios.create({
    baseURL: `${process.env.REACT_APP_PROXY_URL}/${serverURL}`,
    headers: {
      "Access-Control-Allow-Origin": "*",
      Authorization: `Bearer ${accessToken}`,
    },
  });

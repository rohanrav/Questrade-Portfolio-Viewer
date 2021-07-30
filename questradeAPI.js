const axios = require("axios");

module.exports = (serverURL, accessToken) =>
  axios.create({
    baseURL: serverURL,
    headers: {
      "Access-Control-Allow-Origin": "*",
      Authorization: `Bearer ${accessToken}`,
    },
  });

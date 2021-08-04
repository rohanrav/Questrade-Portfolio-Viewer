const axios = require("axios");

module.exports = axios.create({
  baseURL: "https://free.currconv.com",
  headers: {},
});

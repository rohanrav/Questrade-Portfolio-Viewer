class apiErrorMessage {
  constructor(errCode, errMsg) {
    this.errCode = errCode;
    this.errMsg = errMsg;
  }
}

module.exports = {
  apiErrorMessage,
  AUTH_ERROR: 1,
  FATAL_ERROR: 2,
  QUESTRADE_API_ERROR: 3,
};

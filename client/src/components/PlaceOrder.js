import React from "react";
import { connect } from "react-redux";
import { fetchSymbolInfoFromId } from "../actions";
import { io } from "socket.io-client";

class PlaceOrder extends React.Component {
  constructor(props) {
    super(props);
    this.type = new URLSearchParams(window.location.search).get("type");
    if (!this.type) this.type = "none";
    this.symbolId = this.props.match.params.id;
    this.socketRef = React.createRef();
  }

  componentDidMount() {
    if (!this.props.isSignedIn) {
      this.props.history.push("/account-error");
    } else {
      this.props.fetchSymbolInfoFromId(1, this.symbolId);
      this.socketRef.current = io.connect(
        "https://api02.iq.questrade.com/v1/markets/quotes/8049:18002?stream=true&mode=WebSocket"
      );
      this.socketRef.current.onAny((eventName, ...args) => {
        console.log("EVENT EMITTED");
        console.log(eventName);
        console.log([...args]);
      });
    }
  }

  render() {
    console.log(this.props.symbolInfo);
    return (
      <div>
        <h1 className="ui dividing inverted header">Place Order</h1>
        <h3 className="ui top attached header attached-segment-header">
          Asset Details
        </h3>
        <div
          className="ui attached segment"
          style={{ border: "none", background: "#272727" }}
        >
          <div className="ui grid">
            <div className="row">
              <div className="sixteen wide column"></div>
            </div>
          </div>
        </div>
        <div className="ui grid">
          <div className="row">
            <div className="eight wide column">
              <h3 className="ui top attached header attached-segment-header">
                Account Details
              </h3>
              <div
                className="ui attached segment"
                style={{ border: "none", background: "#272727" }}
              ></div>
            </div>
            <div className="eight wide column">
              <h3 className="ui top attached header attached-segment-header">
                Order Details
              </h3>
              <div
                className="ui attached segment"
                style={{ border: "none", background: "#272727" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps.match.params;
  if (!state.candles[id]) {
    return { isSignedIn: state.auth.isSignedIn };
  }

  return {
    isSignedIn: state.auth.isSignedIn,
    symbolInfo: state.candles[id].symbolInfo,
  };
};

export default connect(mapStateToProps, { fetchSymbolInfoFromId })(PlaceOrder);

import React from "react";
import { connect } from "react-redux";
import { fetchSymbolInfoFromId } from "../actions";

class PlaceOrder extends React.Component {
  constructor(props) {
    super(props);
    this.symbolId = this.props.match.params.id;
  }

  componentDidMount() {}

  render() {
    return (
      <div>
        <h1 className="ui dividing inverted header">Place Order</h1>
        <h3 className="ui top attached header attached-segment-header">Asset Details</h3>
        <div className="ui attached segment" style={{ border: "none", background: "#272727" }}>
          <div className="ui grid">
            <div className="row">
              <div className="sixteen wide column"></div>
            </div>
          </div>
        </div>
        <div className="ui grid">
          <div className="row">
            <div className="eight wide column">
              <h3 className="ui top attached header attached-segment-header">Account Details</h3>
              <div
                className="ui attached segment"
                style={{ border: "none", background: "#272727" }}
              ></div>
            </div>
            <div className="eight wide column">
              <h3 className="ui top attached header attached-segment-header">Order Details</h3>
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
  if (state.candles[id]) {
    return {};
  }

  return {
    symbolInfo: state.candles[id].symbolInfo,
  };
};

export default connect(mapStateToProps, { fetchSymbolInfoFromId })(PlaceOrder);

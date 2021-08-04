import React from "react";
import { connect } from "react-redux";
import { buttonTypes, tickCountMod } from "../charts/theme";
import { fetchCandles, fetchSymbolInfoFromId, fetchOptionsData } from "../actions";
import { Link } from "react-router-dom";
import { ResponsiveLine } from "@nivo/line";
import { area } from "d3-shape";
import { stockPriceChart } from "../charts/theme";
import Loader from "./Loader";
import Dropdown from "./Drowdown";

class StockDetail extends React.Component {
  constructor(props) {
    super(props);
    this.symbolId = this.props.match.params.id;
    this.buttonRefs = {};
    this.loader = false;
    this.currentButton = "oneDay";
    this.tickCount = 0;
    this.tickCountMod = tickCountMod[this.currentButton];
    this.lineColor = "#fff";
    this.fillColor = "rgba(255, 255, 255, 0.2)";
    this.state = {
      selected: { value: "", label: "Select an Options Expiry Date" },
    };
  }

  componentDidMount() {
    this.chartButtonClick({ target: { name: "oneDay" } });
    this.props.fetchSymbolInfoFromId(this.symbolId);
    this.props.fetchOptionsData(this.symbolId);
  }

  componentDidUpdate() {
    this.loader = false;
    this.tickCountMod = tickCountMod[this.currentButton];
    this.tickCount = 0;
  }

  formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }

  formatDate(date) {
    const am_pm = date.getHours() > 12 ? "pm" : "am";
    const dateStr = date.getHours() % 12;
    switch (this.currentButton) {
      case "oneDay":
        return this.formatAMPM(date);
      case "fiveDays":
        return `${date.getMonth() + 1}/${date.getDate()} ${dateStr ? dateStr : 12}${am_pm}`;
      case "oneMonth":
        return `${date.getMonth() + 1}/${date.getDate()}`;
      default:
        return `${date.getMonth() + 1}/${date.getDate()}/${date
          .getFullYear()
          .toString()
          .substring(2)}`;
    }
  }

  chartButtonClick = (e) => {
    this.props.fetchCandles(this.symbolId, e.target.name);
    Object.values(this.buttonRefs).forEach((btn) => (btn.current.className = "ui button"));
    this.buttonRefs[e.target.name].current.className = "ui button active ";
    this.loader = true;
    this.currentButton = e.target.name;
    this.forceUpdate();
  };

  getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value);
  }

  prepChartData() {
    let chartData = {
      id: "Stock Series",
      color: "",
      data: [],
    };

    if (this.props.marketData) {
      this.props.marketData.forEach((int) => {
        const date = new Date(int.start);
        if (
          this.currentButton === "oneDay" ||
          this.currentButton === "fiveDays" ||
          this.currentButton === "oneMonth"
        ) {
          if (date.getHours() < 9 || (date.getHours() === 9 && date.getMinutes() < 30)) {
            return;
          }

          if (date.getHours() > 16 || (date.getHours() === 16 && date.getMinutes() > 0)) {
            return;
          }
        }

        chartData.data.push({
          x: new Date(int.start),
          y: int.open,
          price: int.open,
          high: int.high,
          low: int.low,
          volume: int.volume,
        });
      });
    }

    if (chartData.data[0]) {
      if (chartData.data[0].price < chartData.data[chartData.data.length - 1].price) {
        this.lineColor = "#34a853";
        this.fillColor = "rgba(52, 168, 83, 0.2)";
      } else {
        this.lineColor = "#ea4335";
        this.fillColor = "rgba(234, 67, 52, 0.2)";
      }
    }

    return chartData;
  }

  renderChartAreaLayer = ({ points, xScale, yScale }) => {
    const areaGenerator = area()
      .x((d) => xScale(d.data.x))
      .y0((d) => yScale(d.data.low))
      .y1((d) => yScale(d.data.high));

    return <path d={areaGenerator(points)} fill={this.fillColor} />;
  };

  renderChart = () => {
    if (this.loader) {
      return <Loader height="500px" />;
    }

    const data = this.prepChartData();
    console.log("DATA:", data);
    return (
      <ResponsiveLine
        data={[data]}
        theme={stockPriceChart}
        margin={{ top: 25, right: 30, bottom: 40, left: 65 }}
        xScale={{
          type: "point",
        }}
        yScale={{
          type: "linear",
          min: data.data.reduce((prev, curr) => (prev.low < curr.low ? prev : curr), 0).low,
          max: data.data.reduce((prev, curr) => (prev.high > curr.high ? prev : curr), 0).high,
          stacked: true,
          reverse: false,
        }}
        axisBottom={{
          orient: "bottom",
          tickSize: 0,
          tickPadding: 11,
          tickRotation: 0,
          format: (tick) => {
            this.tickCount++;
            if (this.tickCount % this.tickCountMod === 0 || this.tickCount === 1) {
              return this.formatDate(tick);
            }
            return "";
          },
          legendOffset: 60,
          legendPosition: "middle",
        }}
        axisLeft={{
          orient: "left",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          format: (amount) => `$${amount}`,
        }}
        colors={this.lineColor}
        pointSize={6}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        useMesh={true}
        tooltip={({ datum }) => (
          <div
            style={{
              padding: 12,
              background: "#fff",
            }}
          >
            <strong style={{ color: "#fff" }}>
              {datum.data.x}: ${datum.data.y}
            </strong>
          </div>
        )}
        layers={[
          this.renderChartAreaLayer,
          "grid",
          "markers",
          "axes",
          "areas",
          "crosshair",
          "lines",
          "points",
          "slices",
          "mesh",
          "legends",
        ]}
      />
    );
  };

  renderStockDetailsTable() {
    if (!this.props.symbolInfo) {
      return "Loading...";
    }
    const data = this.props.symbolInfo;

    return (
      <div
        style={{
          height: "500px",
          overflowY: "scroll",
          display: "block",
        }}
      >
        <table className="ui celled inverted selectable table">
          <thead>
            <tr>
              <th colSpan="2">{data.symbol}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Price</td>
              <td>${data.prevDayClosePrice}</td>
            </tr>
            <tr>
              <td>Currency</td>
              <td>{data.currency}</td>
            </tr>
            <tr>
              <td>EPS</td>
              <td>${data.eps}</td>
            </tr>
            <tr>
              <td>P/E Ratio</td>
              <td>{data.pe}</td>
            </tr>
            <tr>
              <td>Dividend Yield</td>
              <td>{data.yield}%</td>
            </tr>
            <tr>
              <td>Average Vol 3 M</td>
              <td>{data.averageVol3Months}</td>
            </tr>
            <tr>
              <td>Average Vol 20 D</td>
              <td>{data.averageVol20Days}</td>
            </tr>
            <tr>
              <td>High (52 W)</td>
              <td>${data.highPrice52}</td>
            </tr>
            <tr>
              <td>Low (52 W)</td>
              <td>${data.lowPrice52}</td>
            </tr>
            <tr>
              <td>Security Type</td>
              <td>{data.securityType}</td>
            </tr>
            <tr>
              <td>Description</td>
              <td>{data.description}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  renderDropDown() {
    if (!this.props.optionsData) {
      return (
        <Dropdown
          selected={{ value: "Loading...", label: "Loading..." }}
          onSelectedChange={null}
          options={[]}
          label=""
          loading
        />
      );
    }
    let dropDownData = [];
    this.props.optionsData.forEach((item) => {
      const d = new Date(item.expiryDate);
      dropDownData.push({
        label: d.toDateString(),
        value: d.getTime(),
      });
    });

    return (
      <div style={{ marginTop: "10px" }}>
        <Dropdown
          selected={this.state.selected}
          onSelectedChange={(item) => this.setState({ selected: item })}
          options={dropDownData}
          label=""
        />
      </div>
    );
  }

  renderOptionsTable() {
    if (!this.props.optionsData) {
      return null;
    }

    const data = this.props.optionsData;
    const res = data.filter((opt) => {
      return new Date(opt.expiryDate).getTime() === this.state.selected.value;
    });

    if (res.length === 0) {
      return null;
    }

    return (
      <div style={{ height: "400px", overflowY: "scroll", display: "block" }}>
        <table className="ui celled inverted selectable table">
          <thead>
            <tr>
              <th>Strike Price</th>
              <th>Expiry Date</th>
              <th>Option Root</th>
              <th>Call Option</th>
              <th>Put Option</th>
            </tr>
          </thead>
          <tbody>
            {res[0].chainPerRoot[0].chainPerStrikePrice.map((opt) => {
              return (
                <tr key={opt.callSymbolId}>
                  <td>${opt.strikePrice}</td>
                  <td>{this.state.selected.label}</td>
                  <td>{res[0].chainPerRoot[0].optionRoot}</td>
                  <td>
                    <a
                      href={`https://my.questrade.com/trading/quote/${this.props.symbolInfo?.symbol}`}
                      className="ui button"
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "block" }}
                    >
                      Trade Call Option
                    </a>
                  </td>
                  <td>
                    <a
                      href={`https://my.questrade.com/trading/quote/${this.props.symbolInfo?.symbol}`}
                      className="ui button"
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: "block" }}
                    >
                      Trade Put Option
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    return (
      <div>
        <h1 className="ui dividing inverted header">Stock View</h1>
        <h3 className="ui top attached header attached-segment-header">
          {this.props.symbolInfo ? this.props.symbolInfo.symbol : "Loading..."}
        </h3>
        <div className="ui attached segment" style={{ border: "none", background: "#272727" }}>
          <div className="ui grid">
            <div className="row">
              <div className="ten wide column">
                <div style={{ height: "500px" }}>{this.renderChart()}</div>
                <div className="six ui buttons" style={{ marginTop: "10px" }}>
                  {Object.values(buttonTypes).map((btn) => {
                    let classNames = btn === "1D" ? "ui button active" : "ui button";
                    this.buttonRefs[this.getKeyByValue(buttonTypes, btn)] = React.createRef();
                    return (
                      <button
                        key={btn}
                        onClick={this.chartButtonClick}
                        name={this.getKeyByValue(buttonTypes, btn)}
                        className={classNames}
                        ref={this.buttonRefs[this.getKeyByValue(buttonTypes, btn)]}
                      >
                        {btn}
                      </button>
                    );
                  })}
                </div>
                <div className="two ui buttons" style={{ marginTop: "10px" }}>
                  <a
                    href={`https://my.questrade.com/trading/quote/${this.props.symbolInfo?.symbol}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ui button green"
                  >
                    Buy
                  </a>
                  <div className="or"></div>
                  <a
                    href={`https://my.questrade.com/trading/quote/${this.props.symbolInfo?.symbol}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ui button red"
                  >
                    Sell
                  </a>
                </div>
              </div>
              <div className="six wide column">
                {this.renderStockDetailsTable()}
                <div style={{ marginTop: "10px" }}>
                  <a
                    className="ui button"
                    style={{ display: "block" }}
                    href={`https://finance.yahoo.com/quote/${this.props.symbolInfo?.symbol}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    More Info
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <h3 className="ui top attached header attached-segment-header">Options</h3>
        <div className="ui attached segment" style={{ border: "none", background: "#272727" }}>
          <div className="ui grid">
            <div className="row">
              <div className="sixteen wide column">{this.renderOptionsTable()}</div>
              <div className="sixteen wide column">{this.renderDropDown()}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { id } = ownProps.match.params;
  if (!state.candles[id]) return {};
  return {
    marketData: state.candles[id].marketData,
    symbolInfo: state.candles[id].symbolInfo,
    optionsData: state.candles[id].optionsData,
  };
};

export default connect(mapStateToProps, {
  fetchCandles,
  fetchSymbolInfoFromId,
  fetchOptionsData,
})(StockDetail);

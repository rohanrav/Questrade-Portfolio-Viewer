import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { buttonTypes, tickCountModImport as tickCountModImportUnFiltered } from "../charts/theme";
import { fetchCandles, fetchSymbolInfoFromId, fetchOptionsData } from "../actions";
import { ResponsiveLine } from "@nivo/line";
import { area } from "d3-shape";
import { stockPriceChart } from "../charts/theme";
import Loader from "./Loader";
import Dropdown from "./Drowdown";
import RowPlaceholder from "./RowPlaceholder";
import { parseISO } from "date-fns";

import { useState, useEffect } from "react";
import axios from "axios";
import keys from "../config/keys";
import CryptoJS from "crypto-js";
import Header from "./Header";
import Footer from "./Footer";
import _ from "lodash";

let currentButton = "oneDay";
let tickCount = 0;
let lineColor = "#fff";
let fillColor = "rgba(255, 255, 255, 0.2)";

const tickCountModImport =
  window.innerWidth <= 414
    ? _.mapValues(tickCountModImportUnFiltered, (o) => o * 2)
    : tickCountModImportUnFiltered;
let tickCountMod = tickCountModImport[currentButton];

const StockDetail = (props) => {
  const buttonRefs = {};
  const [loader, setLoader] = useState(true);
  const [selected, setSelected] = useState({ value: "", label: "Select an Options Expiry Date" });
  const [stockPrice, setStockPrice] = useState(null);

  useEffect(() => {
    tickCountMod = tickCountModImport[currentButton];
    tickCount = 0;
  });

  useEffect(() => {
    if (props.symbolInfo?.prevDayClosePrice) {
      setStockPrice(props.symbolInfo.prevDayClosePrice);
    }
  }, [props.symbolInfo, props.match.params.id]);

  useEffect(() => {
    setLoader(false);
  }, [props.marketData, props.match.params.id]);

  useEffect(() => {
    let ws = null;
    const fetchData = async () => {
      setLoader(true);
      chartButtonClick({ target: { name: "oneDay" } });
      props.fetchSymbolInfoFromId(props.match.params.id);
      props.fetchOptionsData(props.match.params.id);

      const res = await axios.get(`/api/stream/candle/${props.match.params.id}`);
      const bytes = CryptoJS.AES.decrypt(res.data, keys.CRYPTO_SECRET_KEY);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      ws = new WebSocket(decryptedData.questradePortURL);

      ws.onopen = () => {
        ws.send(decryptedData.eAT);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (!data?.quotes) {
          console.log(`Questrade WebSocket Message: ${JSON.stringify(data)}`);
          return;
        }
        setStockPrice(data.quotes[0].lastTradePrice);
      };

      process.on("exit", () => {
        if (ws) {
          console.log("Closing WebSocket on 'exit' event");
          ws.close();
        }
        process.exit();
      });

      process.on("SIGINT", () => {
        if (ws) {
          console.log("Closing WebSocket on 'SIGINT' event");
          ws.close();
        }
        process.exit();
      });

      process.on("uncaughtException", () => {
        if (ws) {
          console.log("Closing WebSocket on 'uncaughtException' event");
          ws.close();
        }
      });
    };
    fetchData();

    return () => {
      if (ws) ws.close();
      currentButton = "oneDay";
      tickCount = 0;
      tickCountMod = tickCountModImport[currentButton];
      lineColor = "#fff";
      fillColor = "rgba(255, 255, 255, 0.2)";
    };
  }, [props.match.params.id]);

  const createOptionsLabel = (dateString, optionRoot, optionType, optionStrikePrice) => {
    const date = parseISO(dateString);
    const exp = `${date.getMonth() + 1}/${date.getDate()}/${date
      .getFullYear()
      .toString()
      .substring(2)}`;
    return `${optionRoot} ${Number(optionStrikePrice).toFixed(2)} ${optionType} (Expiring: ${exp})`;
  };

  const getEntityTitle = (data) => {
    if (!data) return "Loading...";
    if (data.securityType === "Option") {
      return createOptionsLabel(
        data.optionExpiryDate,
        data.optionRoot,
        data.optionType,
        data.optionStrikePrice
      );
    } else {
      return data.symbol;
    }
  };

  const formatAMPM = (date) => {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  };

  const formatDate = (date) => {
    const am_pm = date.getHours() > 12 ? "pm" : "am";
    const dateStr = date.getHours() % 12;
    switch (currentButton) {
      case "oneDay":
        return formatAMPM(date);
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
  };

  const chartButtonClick = (e) => {
    props.fetchCandles(props.match.params.id, e.target.name);
    Object.values(buttonRefs).forEach((btn) => {
      if (btn?.current?.className) {
        btn.current.className = "ui button";
      }
    });
    buttonRefs[e.target.name].current.className = "ui button active ";
    currentButton = e.target.name;
    setLoader(true);
  };

  const getKeyByValue = (object, value) => Object.keys(object).find((key) => object[key] === value);

  const prepChartData = () => {
    let chartData = {
      id: "Stock Series",
      color: "",
      data: [],
    };

    if (props.marketData) {
      props.marketData.forEach((int) => {
        const date = new Date(int.start);
        if (
          currentButton === "oneDay" ||
          currentButton === "fiveDays" ||
          currentButton === "oneMonth"
        ) {
          if (date.getHours() < 9 || (date.getHours() === 9 && date.getMinutes() < 30)) {
            return;
          }

          if (date.getHours() > 16 || (date.getHours() === 16 && date.getMinutes() > 30)) {
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
        lineColor = "#34a853";
        fillColor = "rgba(52, 168, 83, 0.2)";
      } else {
        lineColor = "#ea4335";
        fillColor = "rgba(234, 67, 52, 0.2)";
      }
    }

    return chartData;
  };

  const renderChartAreaLayer = ({ points, xScale, yScale }) => {
    const areaGenerator = area()
      .x((d) => xScale(d.data.x))
      .y0((d) => yScale(d.data.low))
      .y1((d) => yScale(d.data.high));

    return <path d={areaGenerator(points) || []} fill={fillColor} />;
  };

  const renderChart = () => {
    if (loader) {
      return <Loader height="500px" />;
    }

    const data = prepChartData();
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
            tickCount++;
            if (tickCount % tickCountMod === 0 || tickCount === 1) {
              return formatDate(tick);
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
        colors={lineColor}
        pointSize={4}
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
          renderChartAreaLayer,
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

  const renderStockDetailsTable = () => {
    if (!props.symbolInfo || !stockPrice) {
      return <RowPlaceholder rows={22} height="500px" />;
    }

    const data = props.symbolInfo;
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
              <th colSpan="2">{getEntityTitle(data)}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Price</td>
              <td>${stockPrice}</td>
            </tr>
            {data.securityType === "Option" ? (
              <tr>
                <td>Strike Price</td>
                <td>${Number(data.optionStrikePrice).toFixed(2)}</td>
              </tr>
            ) : null}
            {data.securityType === "Option" ? (
              <tr>
                <td>Option Type</td>
                <td>{data.optionType}</td>
              </tr>
            ) : null}
            <tr>
              <td>Currency</td>
              <td>{data.currency}</td>
            </tr>
            {data.securityType === "Option" ? (
              <tr>
                <td>Expiry Date</td>
                <td>{parseISO(data.optionExpiryDate).toDateString()}</td>
              </tr>
            ) : null}
            <tr>
              <td>EPS</td>
              <td>{data.eps ? `$${data.eps}` : `--`}</td>
            </tr>
            <tr>
              <td>P/E Ratio</td>
              <td>{data.pe ? `${data.pe}` : `--`}</td>
            </tr>
            <tr>
              <td>Dividend Yield</td>
              <td>{data.yield ? `${data.yield}%` : `--`}</td>
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
              <td>{data.highPrice52 ? `$${data.highPrice52}` : `--`}</td>
            </tr>
            <tr>
              <td>Low (52 W)</td>
              <td>{data.lowPrice52 ? `$${data.lowPrice52}` : `--`}</td>
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
  };

  const renderDropDown = () => {
    if (!props.optionsData) {
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
    props.optionsData.forEach((item) => {
      const d = new Date(item.expiryDate);
      dropDownData.push({
        label: d.toDateString(),
        value: d.getTime(),
      });
    });

    return (
      <div style={{ marginTop: "10px" }}>
        <Dropdown
          selected={selected}
          onSelectedChange={(item) => setSelected(item)}
          options={dropDownData}
          label=""
        />
      </div>
    );
  };

  const renderOptionsTable = () => {
    if (!props.optionsData) {
      return null;
    }

    const data = props.optionsData;
    const res = data.filter((opt) => {
      return new Date(opt.expiryDate).getTime() === selected.value;
    });

    if (res.length === 0) {
      return null;
    }

    return (
      <div style={{ height: "400px", overflowY: "scroll", display: "block" }}>
        <table className="ui celled inverted selectable options-dropdown">
          <thead className="options-dropdown-head">
            <tr>
              <th>Strike Price</th>
              <th>Expiry Date</th>
              <th>Option Root</th>
              <th>Call Option</th>
              <th>Put Option</th>
            </tr>
          </thead>
          <tbody className="options-dropdown-body">
            {res[0].chainPerRoot[0].chainPerStrikePrice.map((opt) => {
              return (
                <tr key={opt.callSymbolId}>
                  <td>${opt.strikePrice}</td>
                  <td>{selected.label}</td>
                  <td>{res[0].chainPerRoot[0].optionRoot}</td>
                  <td>
                    <Link
                      to={`/stock/${opt.callSymbolId}`}
                      className="ui green button"
                      style={{ display: "block" }}
                    >
                      Trade Call Option
                    </Link>
                  </td>
                  <td>
                    <Link
                      to={`/stock/${opt.putSymbolId}`}
                      className="ui green button"
                      style={{ display: "block" }}
                    >
                      Trade Put Option
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <section className="ui container">
        <Header />
        <div>
          <h1
            className="ui dividing inverted header page-header-text"
            style={{ marginTop: "24px" }}
          >
            Stock View
          </h1>
          <h3 className="ui top attached header attached-segment-header">
            {getEntityTitle(props.symbolInfo)}
          </h3>
          <div
            className="ui attached segment stock-chart"
            style={{
              border: "none",
              background: "#272727",
              borderBottomLeftRadius: "5px",
              borderBottomRightRadius: "5px",
            }}
          >
            <div className="ui stackable two column grid">
              <div className="row">
                <div className="ten wide column">
                  <div style={{ height: "500px" }}>{renderChart()}</div>
                  <div className="six ui buttons" style={{ marginTop: "10px" }}>
                    {Object.values(buttonTypes).map((btn) => {
                      let classNames = btn === "1D" ? "ui button active" : "ui button";
                      buttonRefs[getKeyByValue(buttonTypes, btn)] = React.createRef();
                      return (
                        <button
                          key={btn}
                          onClick={chartButtonClick}
                          name={getKeyByValue(buttonTypes, btn)}
                          className={classNames}
                          ref={buttonRefs[getKeyByValue(buttonTypes, btn)]}
                        >
                          {btn}
                        </button>
                      );
                    })}
                  </div>
                  <div className="two ui buttons" style={{ marginTop: "10px" }}>
                    <a
                      href={`https://my.questrade.com/trading/quote/${props.symbolInfo?.symbol}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ui button green"
                    >
                      Buy
                    </a>
                    <div className="or"></div>
                    <a
                      href={`https://my.questrade.com/trading/quote/${props.symbolInfo?.symbol}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ui button red"
                    >
                      Sell
                    </a>
                  </div>
                </div>
                <div className="six wide column">
                  {renderStockDetailsTable()}
                  <div style={{ marginTop: "10px" }}>
                    <a
                      className="ui button"
                      style={{ display: "block" }}
                      href={`https://finance.yahoo.com/quote/${props.symbolInfo?.symbol}`}
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
          <div
            className="ui attached segment"
            style={{
              border: "none",
              background: "#272727",
              borderBottomLeftRadius: "5px",
              borderBottomRightRadius: "5px",
            }}
          >
            <div className="ui grid">
              <div className="row">
                <div className="sixteen wide column">{renderOptionsTable()}</div>
                <div className="sixteen wide column">{renderDropDown()}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

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

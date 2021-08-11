import React from "react";
import { connect } from "react-redux";
import { fetchPositions, fetchUSDToCADExchangeRate, fetchAccountsAndBalances } from "../actions";
import Loader from "./Loader";
import { ResponsivePie } from "@nivo/pie";
import theme from "../charts/theme";
import _ from "lodash";
import RowPlaceholder from "./RowPlaceholder";
import Header from "./Header";
import Footer from "./Footer";

class AccountDetail extends React.Component {
  constructor(props) {
    super(props);
    this.assetTypesArr = ["Stock", "Option", "Bond", "Right", "Gold", "MutualFund", "Index"];
    this.assetTypesShortForm = {
      Stock: "STK",
      Option: "OPT",
      Bond: "BND",
      Right: "RGT",
      Gold: "GLD",
      MutualFund: "MTF",
      Index: "IND",
    };
  }

  componentDidMount() {
    this.props.fetchAccountsAndBalances();
    this.props.fetchPositions(this.props.match.params.accountNumber);
    this.props.fetchUSDToCADExchangeRate();
  }

  roundNumberTwoDecimals = (num) => Math.round(Number(num) * 100) / 100;
  roundNumberOneDecimal = (num) => Math.round(Number(num) * 10) / 10;

  createOptionsLabel(dateString, optionRoot, optionType) {
    const date = new Date(dateString);
    const exp = `${date.getMonth() + 1}/${date.getDate()}/${date
      .getFullYear()
      .toString()
      .substring(2)}`;
    return `${optionRoot} ${optionType} (${exp})`;
  }

  getAssetAllocationData() {
    if (this.props.positions.length === 0 || !this.props.account) {
      return null;
    }

    this.total = this.props.account.cash + this.props.account.marketValue;
    const currencyMixedData = this.props.positions.map((ele) => {
      if (ele.currency === "USD") {
        return {
          ...ele,
          currency: "CAD",
          currentMarketValue: ele.currentMarketValue * this.props.exchangeRate,
        };
      }
      return ele;
    });

    const assetTypes = _.groupBy(currencyMixedData, "securityType");
    const assetKeys = Object.keys(assetTypes);

    assetKeys.forEach((cur) => {
      assetTypes[cur] = assetTypes[cur].map((asset) => {
        return {
          currentMarketValue: asset.currentMarketValue,
          percentageOfTotal: asset.currentMarketValue / this.total,
        };
      });
    });

    assetKeys.forEach((cur) => {
      assetTypes[cur] = assetTypes[cur].reduce(
        (acc, val) => {
          return {
            currentMarketValue: acc.currentMarketValue + val.currentMarketValue,
            percentageOfTotal: acc.percentageOfTotal + val.percentageOfTotal,
          };
        },
        { currentMarketValue: 0, percentageOfTotal: 0 }
      );
    });

    assetTypes.Cash = {
      currentMarketValue: this.props.account.cash,
      percentageOfTotal: this.props.account.cash / this.total,
    };

    return assetTypes;
  }

  renderAssetAllocationTable() {
    const data = this.getAssetAllocationData();
    if (!data) {
      return <RowPlaceholder height="400px" rows={16} />;
    }

    return (
      <div style={{ height: "400px", overflowY: "scroll", display: "block" }}>
        <table className="ui padded inverted selectable table" style={{ height: "400px" }}>
          <thead>
            <tr>
              <th>Investment type</th>
              <th>%</th>
              <th>Market Value (CAD)</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(data).map((asset) => {
              const assetDetails = data[asset];
              return (
                <tr key={asset}>
                  <td>{asset}</td>
                  <td>{this.roundNumberTwoDecimals(assetDetails.percentageOfTotal * 100)}%</td>
                  <td>${this.roundNumberTwoDecimals(assetDetails.currentMarketValue)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th>Total</th>
              <th>100%</th>
              <th>
                $
                {this.roundNumberTwoDecimals(
                  this.props.account.cash + this.props.account.marketValue
                )}
              </th>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  }

  prepChartData() {
    const chartData = [];
    const data = this.getAssetAllocationData();
    if (!data) return null;

    const keys = Object.keys(data);
    keys.forEach((sec) => {
      chartData.push({
        id: sec,
        label: sec,
        value: data[sec].percentageOfTotal,
        marketValue: data[sec].currentMarketValue,
      });
    });
    return chartData;
  }

  renderAssetAllocationChart() {
    const chartData = this.prepChartData();
    if (!chartData) {
      return <Loader height="400px" />;
    }

    return (
      <ResponsivePie
        data={this.prepChartData()}
        id="id"
        value="value"
        colors={{ scheme: "dark2" }}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.4}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        arcLinkLabelsTextColor="#fff"
        arcLinkLabelsThickness={4}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabel={(d) => `${this.roundNumberOneDecimal(d.value * 100)}%`}
        arcLabelsTextColor="#fff"
        defs={[
          {
            id: "dots",
            type: "patternDots",
            background: "inherit",
            color: "rgba(255, 255, 255, 0.3)",
            size: 4,
            padding: 1,
            stagger: true,
          },
          {
            id: "lines",
            type: "patternLines",
            background: "inherit",
            color: "rgba(255, 255, 255, 0.3)",
            rotation: -45,
            lineWidth: 6,
            spacing: 10,
          },
        ]}
        fill={this.assetTypesArr.map((type, index) => {
          return {
            match: {
              id: type,
            },
            id: index % 2 === 0 ? "dots" : "lines",
          };
        })}
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            justify: false,
            translateX: 35,
            translateY: 56,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: "#fff",
            itemDirection: "left-to-right",
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: "circle",
          },
        ]}
        theme={theme}
        tooltip={({ datum }) => (
          <div
            style={{
              padding: 12,
              background: "#222222",
            }}
          >
            <strong style={{ color: "#fff" }}>
              {datum.data.label}: ${this.roundNumberTwoDecimals(datum.data.marketValue)}
            </strong>
          </div>
        )}
      />
    );
  }

  renderAccountHoldingsTable() {
    if (!this.props.positions || this.props.positions.length === 0) {
      return <RowPlaceholder height="500px" rows={22} />;
    }

    return (
      <div style={{ height: "500px", overflowY: "scroll", display: "block" }}>
        <table className="ui padded inverted selectable table" style={{ height: "500px" }}>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Type</th>
              <th>Currency</th>
              <th>Quantity</th>
              <th>Cost/share</th>
              <th>Mkt Price</th>
              <th>Open P&L</th>
              <th>% Portfolio</th>
            </tr>
          </thead>
          <tbody>
            {this.props.positions.map((ele) => {
              let sym = "";
              if (ele.securityType === "Option") {
                sym = this.createOptionsLabel(ele.optionExpiryDate, ele.optionRoot, ele.optionType);
              } else {
                sym = ele.symbol;
              }

              return (
                <tr
                  onClick={() => this.props.history.push(`/stock/${ele.symbolId}`)}
                  className="holdings-table"
                  key={ele.symbolId}
                >
                  <td>{sym}</td>
                  <td>{this.assetTypesShortForm[ele.securityType]}</td>
                  <td>{ele.currency}</td>
                  <td>{ele.openQuantity}</td>
                  <td>${this.roundNumberTwoDecimals(ele.currentPrice)}</td>
                  <td>${this.roundNumberTwoDecimals(ele.currentMarketValue)}</td>
                  <td>{ele.openPnl}</td>
                  <td>
                    {this.roundNumberTwoDecimals(
                      ((ele.currency === "USD"
                        ? ele.currentMarketValue * this.props.exchangeRate
                        : ele.currentMarketValue) /
                        this.total) *
                        100
                    )}
                    %
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  renderAccountHoldingsChart() {
    if (!this.props.positions || this.props.positions.length === 0) {
      return <Loader height="500px" />;
    }

    const data = this.props.positions.map((ele) => {
      const adjustedMarketValue =
        ele.currency === "USD"
          ? ele.currentMarketValue * this.props.exchangeRate
          : ele.currentMarketValue;
      const label =
        ele.securityType === "Option"
          ? this.createOptionsLabel(ele.optionExpiryDate, ele.optionRoot, ele.optionType)
          : ele.symbol;
      return {
        id: label,
        label,
        value: adjustedMarketValue / this.total,
        marketValue: adjustedMarketValue,
        symbolId: ele.symbolId,
      };
    });

    return (
      <ResponsivePie
        data={data}
        id="id"
        value="value"
        colors={{ scheme: "category10" }}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        innerRadius={0.4}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        borderWidth={1}
        borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
        arcLinkLabelsTextColor="#fff"
        arcLinkLabelsThickness={4}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabel={(d) => `${this.roundNumberOneDecimal(d.value * 100)}%`}
        arcLabelsTextColor="#fff"
        defs={[
          {
            id: "dots",
            type: "patternDots",
            background: "inherit",
            color: "rgba(255, 255, 255, 0.3)",
            size: 4,
            padding: 1,
            stagger: true,
          },
          {
            id: "lines",
            type: "patternLines",
            background: "inherit",
            color: "rgba(255, 255, 255, 0.3)",
            rotation: -45,
            lineWidth: 6,
            spacing: 10,
          },
        ]}
        onClick={(node) => {
          this.props.history.push(`/stock/${node.data.symbolId}`);
        }}
        theme={theme}
        tooltip={({ datum }) => (
          <div
            style={{
              padding: 12,
              background: "#222222",
            }}
          >
            <strong style={{ color: "#fff" }}>
              {datum.data.label}:{` ${this.roundNumberOneDecimal(datum.data.value * 100)}%`}
            </strong>
          </div>
        )}
      />
    );
  }

  renderHeader() {
    if (!this.props.account || this.props.account.length === 0) {
      return (
        <div className="ui inverted segment">
          <div className="ui active inverted placeholder">
            <div className="header">
              <div className="line"></div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <h1 className="ui dividing inverted header page-header-text">
        {`${this.props.account.clientAccountType} ${this.props.account.type} (${this.props.account.number})`}
      </h1>
    );
  }

  render() {
    return (
      <>
        <section className="ui container">
          <Header />
          {this.renderHeader()}
          <h3 className="ui top attached header attached-segment-header">Asset Allocation</h3>
          <div className="ui attached segment attached-segment-content">
            <div className="ui grid">
              <div className="row account-asset-mix">
                <div className="eight wide column">{this.renderAssetAllocationTable()}</div>
                <div className="eight wide column" style={{ maxHeight: "400px" }}>
                  {this.renderAssetAllocationChart()}
                </div>
              </div>
            </div>
          </div>
          <h3 className="ui top attached header attached-segment-header">Account Holdings</h3>
          <div className="ui attached segment" style={{ border: "none", background: "#272727" }}>
            <div className="ui grid">
              <div className="row">
                <div className="nine wide column">{this.renderAccountHoldingsTable()}</div>
                <div className="seven wide column" style={{ height: "500px" }}>
                  {this.renderAccountHoldingsChart()}
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { accountNumber } = ownProps.match.params;
  return {
    positions: Object.values(state.positions[accountNumber] || {}),
    account: state.accounts[accountNumber],
    exchangeRate: state.exchangeRate,
  };
};

export default connect(mapStateToProps, {
  fetchPositions,
  fetchUSDToCADExchangeRate,
  fetchAccountsAndBalances,
})(AccountDetail);

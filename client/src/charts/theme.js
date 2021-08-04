export default {
  textColor: "#e6e6e6",
  fontSize: 13,
};

export const buttonTypes = {
  oneDay: "1D",
  fiveDays: "5D",
  oneMonth: "1M",
  sixMonths: "6M",
  oneYear: "1Y",
  fiveYears: "5Y",
};

export const tickCountMod = {
  oneDay: 15,
  fiveDays: 15,
  oneMonth: 10,
  sixMonths: 13,
  oneYear: 26,
  fiveYears: 27,
};

export const stockPriceChart = {
  textColor: "#adadad",
  fontSize: 13,
  background: "#1c1c1c",
  axis: {
    ticks: {
      line: {
        stroke: "#444",
        strokeWidth: 1,
      },
    },
  },
  grid: {
    line: {
      stroke: "#444",
      strokeWidth: 1,
    },
  },
  crosshair: {
    line: {
      stroke: "#9e9e9e",
    },
  },
};

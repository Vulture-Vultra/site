'use client';

import React, { useContext, useLayoutEffect } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { CoinContext } from "../../../../context/coinContext.js";

const LineChartComponent = () => {
  const { selectedCoin, selectedCoinData, coinsData, startDate, endDate, timeFrame } = useContext(CoinContext);

  const generateDateRange = (start, end, timeFrame) => {
    const range = [];
    const current = new Date(start);

    while (current <= end) {
      let key;
      switch (timeFrame) {
        case "daily":
          key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
          current.setDate(current.getDate() + 1);
          break;
        case "monthly":
          key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
          current.setMonth(current.getMonth() + 1);
          break;
        case "yearly":
          key = `${current.getFullYear()}`;
          current.setFullYear(current.getFullYear() + 1);
          break;
        default:
          key = current.toISOString().split("T")[0];
      }
      range.push(key);
    }

    return range;
  };

  const processData = () => {
    if (selectedCoin === "All-Ticker") {
      return processAllTickersData();
    } else {
      return processSelectedCoinData();
    }
  };

  const processSelectedCoinData = () => {
    if (!selectedCoinData || selectedCoinData.length === 0) return [];
    const sortedData = [...selectedCoinData].sort(
      (a, b) => new Date(a.Date) - new Date(b.Date)
    );

    const groupedData = sortedData.reduce((acc, trade) => {
      const date = new Date(trade.Date);
      let key;

      switch (timeFrame) {
        case "daily":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          break;
        case "monthly":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        case "yearly":
          key = `${date.getFullYear()}`;
          break;
        default:
          key = trade.Date;
      }

      if (!acc[key]) {
        acc[key] = {
          date: key,
          cumulativeSpot: 0,
          cumulativeFutures: 0,
          count: 0,
        };
      }

      const cumulativeSpot = parseFloat(String(trade["Cumulative SPOT"]).replace("%", "")) || 0;
      const cumulativeFutures = parseFloat(String(trade["Cumulative Futures"]).replace("%", "")) || 0;

      acc[key].cumulativeSpot += cumulativeSpot;
      acc[key].cumulativeFutures += cumulativeFutures;
      acc[key].count += 1;

      return acc;
    }, {});

    const dateRange = generateDateRange(startDate, endDate, timeFrame);

    const formattedData = dateRange.map((date) => {
      const period = groupedData[date] || {
        cumulativeSpot: 0,
        cumulativeFutures: 0,
        count: 1,
      };
      return {
        date: formatDate(date, timeFrame),
        cumulativeSpot: period.cumulativeSpot.toFixed(1),
        cumulativeFutures: period.cumulativeFutures.toFixed(1),
      };
    });

    return formattedData;
  };

  const processAllTickersData = () => {
    if (!coinsData || coinsData.length === 0) return [];
    const sortedData = [...coinsData].sort(
      (a, b) => new Date(a.Date) - new Date(b.Date)
    );

    const groupedData = sortedData.reduce((acc, trade) => {
      const date = new Date(trade.Date);
      let key;

      switch (timeFrame) {
        case "daily":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          break;
        case "monthly":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        case "yearly":
          key = `${date.getFullYear()}`;
          break;
        default:
          key = trade.Date;
      }

      if (!acc[key]) {
        acc[key] = {
          date: key,
          cumulativeSpot: 0,
          cumulativeFutures: 0,
          count: 0,
        };
      }

      const cumulativeSpot = parseFloat(String(trade["SPOT"]).replace("%", "")) || 0;
      const cumulativeFutures = parseFloat(String(trade["FUTURES"]).replace("%", "")) || 0;

      acc[key].cumulativeSpot += cumulativeSpot;
      acc[key].cumulativeFutures += cumulativeFutures;
      acc[key].count += 1;

      return acc;
    }, {});

    const dateRange = generateDateRange(startDate, endDate, timeFrame);

    const formattedData = dateRange.map((date) => {
      const period = groupedData[date] || {
        cumulativeSpot: 0,
        cumulativeFutures: 0,
        count: 1,
      };
      return {
        date: formatDate(date, timeFrame),
        cumulativeSpot: period.cumulativeSpot.toFixed(1),
        cumulativeFutures: period.cumulativeFutures.toFixed(1),
      };
    });

    return formattedData;
  };

  const formatDate = (dateStr, timeFrame) => {
    const date = new Date(dateStr);
    switch (timeFrame) {
      case "daily":
        return date.toLocaleDateString("default", { month: "short", day: "numeric" });
      case "monthly":
        return date.toLocaleDateString("default", { month: "short" });
      case "yearly":
        return date.toLocaleDateString("default", { year: "numeric" });
      default:
        return dateStr;
    }
  };

  const data = processData();

  const totalCumulativeSpot = data.reduce((acc, item) => acc + parseFloat(item.cumulativeSpot), 0).toFixed(1);
  const totalCumulativeFutures = data.reduce((acc, item) => acc + parseFloat(item.cumulativeFutures), 0).toFixed(1);

  useLayoutEffect(() => {
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create("chartdiv", am4charts.PieChart3D);
    chart.hiddenState.properties.opacity = 0; 
    chart.innerRadius = am4core.percent(40); 
    chart.depth = 30; 

    chart.legend = new am4charts.Legend();
    chart.legend.position = "bottom";
    chart.legend.labels.template.maxWidth = 60;
    chart.legend.useDefaultMarker = true;
    chart.legend.labels.template.fill = am4core.color("#FFFFFF");
    chart.legend.valueLabels.template.fill = am4core.color("#FFFFFF");
    
    chart.data = [
      {
        Category: "Spot",
        Value: totalCumulativeSpot,
      },
      {
        Category: "Futures",
        Value: totalCumulativeFutures
      }
    ];
    let series = chart.series.push(new am4charts.PieSeries3D());
    series.dataFields.value = "Value";
    series.dataFields.category = "Category";
    series.labels.template.disabled = true;
    series.ticks.template.disabled = true;
    chart.legend.valueLabels.template.disabled = true;
    chart.logo.disabled = true;
    series.tooltip.getFillFromObject = false;
    series.tooltip.background.fill = am4core.color("#000000");
    series.tooltip.label.fill = am4core.color("#FFFFFF");

    return () => {
      chart.dispose();  
    };
  }, [totalCumulativeSpot, totalCumulativeFutures]);

  return (
    <div className="w-full border py-9 px-4 rounded-3xl font-manrope">
      <h1 className="text-lg font-medium text-center text-white mb-4 md:mb-0">
        ROI DISTRIBUTION
      </h1>
      <div className="h-[300px] w-full mt-10 flex items-center justify-center">
        {data.length > 0 ? (
          <div id="chartdiv" style={{ width: "100%", height: "350px" }}></div>
        ) : (
          <div className="h-full flex items-center justify-center text-white/50">
            No data available for the selected period
          </div>
        )}
      </div>
    </div>
  );
}

export default LineChartComponent;
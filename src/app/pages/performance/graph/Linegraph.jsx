"use client";

import { useState, useContext, useEffect } from "react";
import { CoinContext } from "../../../../context/coinContext.js";
import { FaPercentage } from "react-icons/fa";

export default function BarGraph() {
  const [mounted, setMounted] = useState(false);
  const [marketType, setMarketType] = useState("All");
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
          spot: 0,
          futures: 0,
          All: 0,
          count: 0,
        };
      }

      const spot = parseFloat(String(trade.SPOT).replace("%", "")) || 0;
      const futures = parseFloat(String(trade.FUTURES).replace("%", "")) || 0;
      const total = parseFloat(String(trade.Total).replace("%", "")) || 0;

      acc[key].spot += spot;
      acc[key].futures += futures;
      acc[key].All += total;
      acc[key].count += 1;

      return acc;
    }, {});

    const dateRange = generateDateRange(startDate, endDate, timeFrame);

    const formattedData = dateRange.map((date) => {
      const period = groupedData[date] || {
        spot: 0,
        futures: 0,
        All: 0,
        count: 1,
      };
      return {
        date: formatDate(date, timeFrame),
        spot: period.spot,
        futures: period.futures,
        value: period[marketType],
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
          spot: 0,
          futures: 0,
          All: 0,
          count: 0,
        };
      }

      const spot = parseFloat(String(trade.SPOT).replace("%", "")) || 0;
      const futures = parseFloat(String(trade.FUTURES).replace("%", "")) || 0;
      const total = parseFloat(String(trade.Total).replace("%", "")) || 0;

      acc[key].spot += spot;
      acc[key].futures += futures;
      acc[key].All += total;
      acc[key].count += 1;

      return acc;
    }, {});

    const dateRange = generateDateRange(startDate, endDate, timeFrame);

    const formattedData = dateRange.map((date) => {
      const period = groupedData[date] || {
        spot: 0,
        futures: 0,
        All: 0,
        count: 1,
      };
      return {
        date: formatDate(date, timeFrame),
        spot: period.spot,
        futures: period.futures,
        value: period[marketType],
      };
    });

    return formattedData;
  };

  const formatDate = (dateStr, timeFrame) => {
    const date = new Date(dateStr);
    switch (timeFrame) {
      case "daily":
      case "monthly":
        return date.toLocaleDateString("default", {
          month: "short",
          year: "numeric",
        });
      case "yearly":
        return date.toLocaleDateString("default", { year: "numeric" });
      default:
        return dateStr;
    }
  };

  const data = processData();
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <div className="w-full border md:mt-10 mt-5 p-1 rounded-3xl font-manrope">
      <h1 className="text-lg font-medium mt-5 text-center text-white mb-4 md:mb-0">
        YIELD  PERCENTAGE
      </h1>
      <div className="flex flex-col md:flex-row justify-center items-center mt-4">
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          <div className="flex gap-2 bg-white/5 rounded-lg p-1">
            {["All", "futures", "spot"].map((type) => (
              <button
                key={type}
                onClick={() => setMarketType(type)}
                className={`px-3 py-1 rounded-md text-sm capitalize ${
                  marketType === type
                    ? "bg-[#C5A042] text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[273px] w-full mt-10 flex items-start  justify-center">
        {data.length > 0 ? (
          <div className="text-white">
            <div className="flex items-center gap-2">
            <span className=" bg-white/10 rounded-xl p-3 text-2xl"><FaPercentage /></span>
            <h2 className="text-3xl font-normal">Yield </h2>
            </div>
            <p className="text-3xl font-normal mt-6 pl-6 ">
              {data.reduce((acc, item) => acc + item.value, 0).toFixed(1)}%
            </p>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-white/50">
            No data available for the selected period
          </div>
        )}
      </div>
    </div>
  );
}
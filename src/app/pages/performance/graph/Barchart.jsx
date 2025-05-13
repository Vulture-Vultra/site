'use client';

import { useContext } from "react";
import { CoinContext } from "../../../../context/coinContext.js";
import { Bar, BarChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function LineChartComponent() {
  const { selectedCoin, selectedCoinData, coinsData, startDate, endDate, timeFrame } = useContext(CoinContext);

  const processData = () => {
    if (selectedCoin === "All-Ticker") {
      return processAllTickersData();
    } else {
      return processSelectedCoinData();
    }
  };

  const processSelectedCoinData = () => {
    if (!selectedCoinData || selectedCoinData.length === 0) return [];
    return selectedCoinData
      .filter(trade => {
        const tradeDate = new Date(trade.Date);
        return tradeDate >= startDate && tradeDate <= endDate;
      })
      .map(trade => ({
        date: formatDate(trade.Date, timeFrame),
        rawDate: trade.Date,
        cumulativeSpot: parseFloat(trade["Cumulative SPOT"].replace("%", "")) || 0,
        cumulativeFutures: parseFloat(trade["Cumulative Futures"].replace("%", "")) || 0,
        allCumulative: parseFloat(trade["Cumulative ALL"].replace("%", "")) || 0,
      }));
  };

  const processAllTickersData = () => {
    if (!coinsData || coinsData.length === 0) return [];
    return coinsData
      .filter(trade => {
        const tradeDate = new Date(trade.Date);
        return tradeDate >= startDate && tradeDate <= endDate;
      })
      .map(trade => ({
        date: formatDate(trade.Date, timeFrame),
        rawDate: trade.Date,
        cumulativeSpot: parseFloat(trade["Cumulative SPOT"].replace("%", "")) || 0,
        cumulativeFutures: parseFloat(trade["Cumulative Futures"].replace("%", "")) || 0,
        allCumulative: parseFloat(trade["Cumulative ALL"].replace("%", "")) || 0,
      }));
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

 
  const minValue = Math.min(...data.map(d => d.allCumulative));
  const maxValue = Math.max(...data.map(d => d.allCumulative));


  const barSize = Math.max(1, Math.min(data.length));

  return (
    <div className="w-full border mt-1 p-6 rounded-3xl font-manrope ">
      <h1 className="text-lg font-medium text-center text-white mb-4 md:mb-0">YIELD PERFORMANCE</h1>
      <div className="h-[300px] w-full mt-10">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 36,
                bottom: 0,
              }}
              barSize={barSize}
              barGap={0}
              barCategoryGap={0}
              className="bg-transparent"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.5)"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "rgba(255,255,255,0.5)" }}
                dy={10}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "rgba(255,255,255,0.5)" }}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
                dx={-10}
                domain={[0, maxValue]}
                allowDataOverflow={true}
              />
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-white/10 bg-[#1e1e1e]/90 p-2 shadow-xl backdrop-blur-sm">
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-white/50">DATE</span>
                            <span className="font-bold text-white">{payload[0].payload.date}</span>
                          </div>
                          {payload.map((p, index) => (
                            <div key={index} className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-white/50">
                                {p.name === "allCumulative"
                                  ? "CUMULATIVE ALL"
                                  : p.name === "cumulativeSpot"
                                    ? "CUMULATIVE SPOT"
                                    : "CUMULATIVE FUTURES"}
                              </span>
                              <span className="font-bold text-white">{p.value.toFixed(2)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
                wrapperStyle={{ outline: "none" }}
              />
              <Legend
                formatter={(value) => {
                  return value === "allCumulative"
                    ? "Cumulative ALL"
                    : value === "cumulativeSpot"
                      ? "Cumulative SPOT"
                      : "Cumulative Futures";
                }}
                iconType="square"
                wrapperStyle={{ paddingTop: 10 }}
              />
              <Bar dataKey="allCumulative" fill="rgba(44,160,44,0.8)" stroke="#2ca02c" isAnimationActive={false} />
              <Bar dataKey="cumulativeFutures" fill="rgba(255,127,14,0.8)" stroke="#ff7f0e" isAnimationActive={false} />
              <Bar dataKey="cumulativeSpot" fill="rgba(31,119,180,0.8)" stroke="#1f77b4" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-white/50">
            No data available for the selected period
          </div>
        )}
      </div>
    </div>
  );
}
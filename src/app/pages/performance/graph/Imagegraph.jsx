'use client';

import React, { useState, useContext } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CoinContext } from "@/context/coinContext";

const Imagegraph = () => {
  const [timeFrame, setTimeFrame] = useState("yearly");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(true); 
  const { coinsData, uniqueTickers } = useContext(CoinContext);

  const processData = () => {
    if (!coinsData || coinsData.length === 0) return [];

    const sortedData = [...coinsData].sort((a, b) =>
      new Date(a.Date) - new Date(b.Date)
    );

    const groupedData = sortedData.reduce((acc, trade) => {
      const date = new Date(trade.Date);
      let key;
      const ticker = trade.Ticker;

      switch (timeFrame) {
        case "daily":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          break;
        case "weekly":
          const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
          key = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, "0")}-${String(weekStart.getDate()).padStart(2, "0")}`;
          break;
        case "monthly":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        case "yearly":
          key = date.getFullYear().toString();
          break;
        default:
          key = trade.Date;
      }

    
      const selectedYear = selectedDate.getFullYear();
      const isValid = timeFrame === "yearly" && key === selectedYear.toString();
      if (!isValid) return acc;

      if (!acc[ticker]) {
        acc[ticker] = {
          total: 0,
          count: 0,
        };
      }

      const total = parseFloat(String(trade.Total).replace("%", "")) || 0;

      acc[ticker].total += total;
      acc[ticker].count += 1;

      return acc;
    }, {});

    const formattedData = uniqueTickers
      .map((ticker) => ({
        ticker,
        total: groupedData[ticker] ? groupedData[ticker].total : 0,
      }))
      .filter((item) => item.total !== 0); 

    return formattedData;
  };

  const data = processData();

  return (
    <div className="w-full border mt-1 p-2 rounded-3xl font-manrope">
      <h1 className="text-lg font-medium text-center text-white mb-1 md:mb-0 mt-5">
        AVERAGE ANNUAL GROWTH
      </h1>
      <div className="flex flex-col md:flex-row justify-between items-center md:mt-1 mt-4">
        <div className="flex flex-wrap gap-2 md:gap-4">
          

          {timeFrame === "yearly" && (
            <div className="relative">
              {isDatePickerOpen && (
                <div className="relative z-10 flex flex-row gap-3">
                   <button
                key={'year'}
                className={`px-3 py-1 rounded-md text-sm capitalize bg-[#C5A042] text-white`}
              >
                Year
              </button>
              <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    selectsStart
                    startDate={selectedDate}
                    dateFormat="yyyy"
                    showYearPicker
                    className="bg-white text-black p-2 w-32 rounded-md"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="h-[300px] w-full mt-10 overflow-x-scroll pb-3 custom-scrollbar">
        {data.length > 0 ? (
          <ResponsiveContainer width="150%"  height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 20,
                bottom: 0,
              }}
              barSize={25}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis
                dataKey="ticker"
                stroke="rgba(255,255,255,0.5)"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "rgba(255,255,255,0.5)" }}
                dy={5}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "rgba(255,255,255,0.5)" }}
                tickFormatter={(value) => `${value.toFixed(1)}%`}
                dx={-10}
              />
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-white/10 bg-black/60 p-2 shadow-xl backdrop-blur-sm">
                        <div className="grid grid-cols-2 gap-8">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-white/50">
                              Ticker
                            </span>
                            <span className="font-bold text-white">
                              {payload[0].payload.ticker}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-white/50">
                              Total
                            </span>
                            <span className="font-bold text-white">
                              {payload[0].value.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="total"
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
                className="bar"
                style={{ transition: "fill 0.3s ease" }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-white/50">
            No data available for the selected period
          </div>
        )}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #C5A042;
          border-radius: 10px;
          border: 2px solid #00362E; /* Adjust the border color to match your theme */
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }

        .recharts-rectangle .bar:hover {
          fill: #C872;
        }
      `}</style>
    </div>
  );
}

export default Imagegraph;
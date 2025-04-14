'use client';
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import constant from "@/constant";


const CoinContext = createContext();

const CoinProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [coinsData, setCoinsData] = useState([]);
  const [uniqueTickers, setUniqueTickers] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState("All-Ticker");
  const [selectedCoinData, setSelectedCoinData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [timeFrame, setTimeFrame] = useState("daily");

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `/api/excel/getAllData`
        );
        const data = response.data;

        setCoinsData(data);

        if (data) {
          const tickers = data.map((item) => item.Ticker);
          const uniqueTickersArray = [...new Set(tickers)];
          setUniqueTickers(uniqueTickersArray);

          if (data.length > 0) {

            const dates = data.map((item) => new Date(item.Date));
            const minDate = new Date(Math.min(...dates));
            setStartDate(minDate);
           
            
            const maxDate = new Date(Math.max(...dates));  
            setEndDate(maxDate);
            
            
           
          }
          
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCoin === "All-Ticker") {
      setSelectedCoinData(coinsData);
    } else if (selectedCoin && coinsData.length > 0) {
      const filteredData = coinsData.filter(
        (item) => item.Ticker === selectedCoin
      );
      setSelectedCoinData(filteredData);
    }
  }, [selectedCoin, coinsData]);

  const resetFilters = () => {
    setSelectedCoin("All-Ticker");
    setTimeFrame("monthly");
    const earliestDate = new Date(Math.min(...coinsData.map((item) => new Date(item.Date))));
    setStartDate(earliestDate);
    const latestDate = new Date(Math.max(...coinsData.map((item) => new Date(item.Date))));
    setEndDate(latestDate);
  };

  return (
    <CoinContext.Provider
      value={{
        isLoading,
        uniqueTickers,
        selectedCoin,
        selectedCoinData,
        setSelectedCoin,
        coinsData,
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        timeFrame,
        setTimeFrame,
        resetFilters,
      }}
    >
      {children}
    </CoinContext.Provider>
  );
};

export { CoinContext, CoinProvider };
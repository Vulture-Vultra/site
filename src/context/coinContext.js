"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

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
  const [popupMessage, setPopupMessage] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const validateDateFormat = (date) => {
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (date instanceof Date && !isNaN(date)) {
      return true;
    } else if (typeof date === "string" && regex.test(date)) {
      return true;
    }
    return false;
  };

  const handleInvalidDates = (date, dateType) => {
    if (!validateDateFormat(date)) {
      return false;
    }
    return true;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/excel/getAllData`);
        const data = response.data;

        setCoinsData(data);

        if (data) {
          const tickers = data.map((item) => item.Ticker);
          const uniqueTickersArray = [...new Set(tickers)];
          setUniqueTickers(uniqueTickersArray);

          if (data.length > 0) {
            const dates = data.map((item) => new Date(item.Date));
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));

            if (handleInvalidDates(minDate, "startDate")) {
              setStartDate(minDate);
            }

            if (handleInvalidDates(maxDate, "endDate")) {
              setEndDate(maxDate);
            }
          }
        }
      } catch (error) {
        console.error("Axios error:", error);
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Status:", error.response.status);
        } else if (error.request) {
          console.error("No response received:", error.request);
        } else {
          console.error("Error message:", error.message);
        }
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
      const filteredData = coinsData.filter((item) => item.Ticker === selectedCoin);
      setSelectedCoinData(filteredData);
    }
  }, [selectedCoin, coinsData]);

  const resetFilters = () => {
    setSelectedCoin("All-Ticker");
    setTimeFrame("monthly");
    const earliestDate = new Date(Math.min(...coinsData.map((item) => new Date(item.Date))));
    const latestDate = new Date(Math.max(...coinsData.map((item) => new Date(item.Date))));

    if (handleInvalidDates(earliestDate, "startDate")) {
      setStartDate(earliestDate);
    }

    if (handleInvalidDates(latestDate, "endDate")) {
      setEndDate(latestDate);
    }
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
      {isPopupVisible && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            zIndex: 9999,
            textAlign: "center",
          }}
        >
          <p>{popupMessage}</p>
          <button
            onClick={() => setIsPopupVisible(false)}
            style={{
              marginTop: "10px",
              padding: "8px 12px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      )}
    </CoinContext.Provider>
  );
};

export { CoinContext, CoinProvider };
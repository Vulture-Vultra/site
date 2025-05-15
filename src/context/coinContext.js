// src/context/coinContext.js
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
// import axios from "axios"; // Temporarily comment out if not used when fetchData is disabled

const CoinContext = createContext();

const CoinProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false); // Set to false initially, as we are not fetching here
  const [coinsData, setCoinsData] = useState([]);
  const [uniqueTickers, setUniqueTickers] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState("All-Ticker");
  const [selectedCoinData, setSelectedCoinData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [timeFrame, setTimeFrame] = useState("daily");
  const [popupMessage, setPopupMessage] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  // Utility function to validate date format
  const validateDateFormat = (date) => {
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (date instanceof Date && !isNaN(date)) {
      return true;
    } else if (typeof date === "string" && regex.test(date)) {
      return true;
    }
    return false;
  };

  // Function to handle invalid dates
  const handleInvalidDates = (date, dateType) => {
    if (!validateDateFormat(date)) {
      // Original popup logic was commented out, keeping it that way
      return false;
    }
    return true;
  };

  useEffect(() => {
    // Original fetchData function content:
    // async function fetchData() {
    //   try {
    //     setIsLoading(true);
    //     const response = await axios.get(`/api/excel/getAllData`);
    //     const data = response.data;
    //     setCoinsData(data);
    //     // ... rest of data processing
    //   } catch (error) {
    //     console.error("CoinContext: Error fetching data:", error);
    //     setCoinsData([]); setUniqueTickers([]); setSelectedCoinData([]);
    //     setStartDate(null); setEndDate(null);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // }
    // fetchData(); // ORIGINAL CALL

    // --- TEMPORARY MODIFICATION FOR PNL CHART DEBUGGING ---
    console.warn(
      "CoinContext: fetchData() call for /api/excel/getAllData is TEMPORARILY DISABLED for PnL chart debugging."
    );
    setIsLoading(false); // Set loading to false as we are not fetching
    setCoinsData([]); // Provide empty array as default
    setUniqueTickers([]); // Default
    setSelectedCoinData([]); // Default
    setStartDate(null); // Default
    setEndDate(null); // Default
    // --- END TEMPORARY MODIFICATION ---
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    // This logic will still run, but coinsData will be empty due to the modification above
    if (selectedCoin === "All-Ticker") {
      setSelectedCoinData(coinsData); // coinsData is []
    } else if (selectedCoin && coinsData && coinsData.length > 0) { // This condition won't be met
      const filteredData = coinsData.filter(
        (item) => item.Ticker === selectedCoin
      );
      setSelectedCoinData(filteredData);
    } else {
      setSelectedCoinData([]); // Default to empty if no coinsData
    }
  }, [selectedCoin, coinsData]);

  const resetFilters = () => {
    setSelectedCoin("All-Ticker");
    setTimeFrame("daily"); // Reverted to 'daily' from your original code snippet
    // This part will effectively set dates to null because coinsData is empty
    if (coinsData && coinsData.length > 0) {
      const validDates = coinsData.map((item) => new Date(item.Date)).filter(date => !isNaN(date.getTime()));
      if (validDates.length > 0) {
        const earliestDate = new Date(Math.min(...validDates));
        const latestDate = new Date(Math.max(...validDates));

        if (handleInvalidDates(earliestDate, "startDate")) {
          setStartDate(earliestDate);
        } else { setStartDate(null); }

        if (handleInvalidDates(latestDate, "endDate")) {
          setEndDate(latestDate);
        } else { setEndDate(null); }
      } else {
        setStartDate(null);
        setEndDate(null);
      }
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  };

  return (
    <CoinContext.Provider
      value={{
        isLoading, // Will be false from the temporary modification
        uniqueTickers, // Will be []
        selectedCoin,
        selectedCoinData, // Will be []
        setSelectedCoin,
        coinsData, // Will be []
        startDate, // Will be null
        endDate, // Will be null
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
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)", backgroundColor: "white",
            color: "black", // Ensure text visible on white
            padding: "20px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px", zIndex: 9999, textAlign: "center",
          }}
        >
          <p>{popupMessage}</p>
          <button
            onClick={() => setIsPopupVisible(false)}
            style={{
              marginTop: "10px", padding: "8px 12px", backgroundColor: "#007bff",
              color: "white", border: "none", borderRadius: "4px", cursor: "pointer",
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
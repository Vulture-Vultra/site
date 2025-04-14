"use client";

import { useRef, useState, useEffect, useContext } from "react";
import CountUp from "react-countup";
import { CoinContext } from "../../../../context/coinContext.js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Card() {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const cardRef = useRef(null);
  const dropdownRef = useRef(null);

  const {
    isLoading,
    uniqueTickers,
    selectedCoin,
    selectedCoinData,
    setSelectedCoin,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    timeFrame,
    setTimeFrame,
    resetFilters,
  } = useContext(CoinContext);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  const getSelectedCoinStats = () => {
    if (selectedCoinData.length === 0) {
      return {
        totalProfit: 80,
        spotROI: 100,
        futuresROI: 150,
      };
    }

   
    const totalProfit = selectedCoinData.reduce((sum, trade) => {
      const total =
        Number.parseFloat(String(trade.Total).replace("%", "")) || 0;
      return sum + total;
    }, 0);

    const spotROI = selectedCoinData.reduce((sum, trade) => {
      const spot = Number.parseFloat(String(trade.SPOT).replace("%", "")) || 0;
      return sum + spot;
    }, 0);

    const futuresROI = selectedCoinData.reduce((sum, trade) => {
      const futures =
        Number.parseFloat(String(trade.FUTURES).replace("%", "")) || 0;
      return sum + futures;
    }, 0);

    return {
      totalProfit: Math.abs(Math.round(totalProfit)) || 80,
      spotROI: Math.abs(Math.round(spotROI)) || 100,
      futuresROI: Math.abs(Math.round(futuresROI)) || 150,
    };
  };

  const { totalProfit, spotROI, futuresROI } = getSelectedCoinStats();

 
  const filteredTickers = uniqueTickers.filter((ticker) =>
    ticker && ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={cardRef} className="p-6 text-center">
      <div
        className={`text-[#C5A042] font-bold font-poppins ${
          isVisible ? "drop-in" : ""
        }`}
      >
        <h1>TRADING PERFORMANCE OVERVIEW</h1>
      </div>
      <div
        className={`text-4xl font-bold text-white font-manrope ${
          isVisible ? "drop-in" : ""
        }`}
      >
        <h1>Live Performance, Proven Results</h1>
      </div>
      <div className=" flex md:flex-row flex-col gap-4 justify-center place-items-center">
     
        <div className="flex flex-col md:flex-row gap-4 justify-center mt-6">
          <div className="flex flex-row gap-2 bg-white/5 rounded-lg p-1">
            {["daily", "monthly", "yearly"].map((time) => (
              <button
                key={time}
                onClick={() => {
                  setTimeFrame(time);
                }}
                className={`px-3 py-1 rounded-md text-sm capitalize ${
                  timeFrame === time
                    ? "bg-[#C5A042] text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          {timeFrame === "daily" && (
            <div className="relative">
              <div className="relative z-10 justify-center flex flex-row gap-3">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="bg-white/10 text-white p-2 w-20 rounded-md"
                  dateFormat="MM/dd/yyyy"
                />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="bg-white/10 text-white p-2 w-20 rounded-md"
                  dateFormat="MM/dd/yyyy"
                />
              </div>
            </div>
          )}
          {timeFrame === "monthly" && (
            <div className="relative">
              <div className="relative z-10 justify-center flex flex-row gap-3">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="bg-white/10 text-white p-2 w-20 rounded-md"
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="bg-white/10 text-white p-2 w-20 rounded-md"
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                />
              </div>
            </div>
          )}
          {timeFrame === "yearly" && (
            <div className="relative">
              <div className="relative z-10 justify-center flex flex-row gap-3">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="bg-white/10 text-white p-2 w-20 rounded-md"
                  dateFormat="yyyy"
                  showYearPicker
                />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="bg-white/10 text-white p-2 w-20 rounded-md"
                  dateFormat="yyyy"
                  showYearPicker
                />
              </div>
            </div>
          )}
        </div>
        <div ref={dropdownRef} className="relative md:mt-4">
          <div
            className="mt-3 border-none h-11 p-2 w-40 rounded-xl text-white bg-white/10 custom-select cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {selectedCoin || "Select a ticker"}
          </div>
          {isDropdownOpen && (
            <div className="absolute z-10 mt-2 w-full bg-white rounded-xl shadow-lg">
              <input
                type="text"
                className="w-full p-2 border-b border-gray-300 focus:outline-none"
                placeholder="Search ticker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="max-h-72 overflow-y-auto ">
                {isLoading ? (
                  <div className="p-2 text-gray-500">Loading tickers...</div>
                ) : (
                  <>
                    <div
                      className="p-2 cursor-pointer hover:bg-gray-200"
                      onClick={() => {
                        setSelectedCoin("All-Ticker");
                        setIsDropdownOpen(false);
                      }}
                    >
                      All-Ticker
                    </div>
                    {filteredTickers.length > 0 ? (
                      filteredTickers.map((ticker, index) => (
                        <div
                          key={index}
                          className="p-2 cursor-pointer hover:bg-gray-200"
                          onClick={() => {
                            setSelectedCoin(ticker);
                            setIsDropdownOpen(false);
                          }}
                        >
                          {ticker}
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-gray-500">No tickers available</div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
       
        <button
          onClick={resetFilters}
          className="md:mt-7 mt-3 px-4 py-3 rounded-lg text-sm bg-white/10 text-white hover:bg-white/20"
        >
          Clear Filters
        </button>
      </div>
      <div className="mt-12 flex flex-col items-center gap-4 md:flex-row justify-center font-manrope">
        <div
          className={`md:w-56 w-full h-28 border rounded-2xl justify-center place-items-center backdrop-blur-md bg-white/10 ${
            isVisible ? "drop-in" : ""
          }`}
        >
          <h1 className="text-[#C5A042] font-bold text-lg mt-8">
            {isVisible && <CountUp end={totalProfit} duration={5} />}%
          </h1>
          <h1 className="text-white mt-2">Total profit</h1>
        </div>
        <div
          className={`md:w-56 w-full h-28 border rounded-2xl justify-center place-items-center backdrop-blur-md bg-white/10 ${
            isVisible ? "drop-in" : ""
          }`}
        >
          <h1 className="text-[#C5A042] font-bold text-lg mt-8">
            {isVisible && <CountUp end={spotROI} duration={5} />}%
          </h1>
          <h1 className="text-white mt-2">ROI on Spot</h1>
        </div>
        <div
          className={`md:w-56 w-full h-28 border rounded-2xl justify-center place-items-center backdrop-blur-md bg-white/10 ${
            isVisible ? "drop-in" : ""
          }`}
        >
          <h1 className="text-[#C5A042] font-bold text-lg mt-8">
            {isVisible && <CountUp end={futuresROI} duration={5} />}%
          </h1>
          <h1 className="text-white mt-2">ROI on Futures</h1>
        </div>
      </div>

      <style jsx>{`
        .drop-in {
          animation: dropIn 2s ease-in-out;
        }

        @keyframes dropIn {
          0% {
            opacity: 0;
            transform: translateY(-8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .custom-select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1em;
          padding-right: 2.5rem;
        }

        .custom-select option {
          background-color: white;
          color: #1a1a1a;
        }
      `}</style>
    </div>
  );
}

export default Card;
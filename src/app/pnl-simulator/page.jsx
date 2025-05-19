// src/app/pnl-simulator/page.jsx
"use client";

import { useState, useEffect, useRef, useMemo } from 'react'; // Added useMemo
import dynamic from 'next/dynamic';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
// zoomPlugin will be imported dynamically

const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
});

// Helper for safely stringifying objects for logging
const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (value instanceof Date) { return value.toISOString(); }
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) { return "[Circular]"; }
      seen.add(value);
    }
    return value;
  };
};

export default function PnlSimulatorPage() {
  const [initialTradeData, setInitialTradeData] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [pluginsRegistered, setPluginsRegistered] = useState(false);

  const [initialCapitalSpot, setInitialCapitalSpot] = useState(10000);
  const [initialCapitalFutures, setInitialCapitalFutures] = useState(10000);

  const [simulationResultsSpot, setSimulationResultsSpot] = useState([]);
  const [simulationResultsFutures, setSimulationResultsFutures] = useState([]);

  const [chartInstanceData, setChartInstanceData] = useState({ datasets: [] });
  const [clickedTradeDetails, setClickedTradeDetails] = useState(null); // Changed from clickedTradeFullDetails for clarity
  
  const chartRef = useRef(null);
  const TRADE_CAPITAL_ALLOCATION_PERCENT = 0.10;

  const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Effect 1: Register plugins
  useEffect(() => {
    document.title = "Vultra - PnL Simulator";
    let isMounted = true;
    // console.log("PnlSimulatorPage: Effect 1 (PluginReg) triggered. Current pluginsRegistered:", pluginsRegistered);
    if (typeof window !== "undefined" && !pluginsRegistered) {
      async function registerPlugins() {
        // console.log("PnlSimulatorPage: Effect 1 - Attempting to register ChartJS plugins...");
        try {
            const zoomPluginModule = await import('chartjs-plugin-zoom');
            const zoomPlugin = zoomPluginModule.default;
            ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, TimeScale, zoomPlugin );
            if (isMounted) setPluginsRegistered(true);
            // console.log("PnlSimulatorPage: Effect 1 - ChartJS plugins registered successfully.");
        } catch (pluginError) {
            console.error("PnlSimulatorPage: Effect 1 - Error registering chart plugins:", pluginError);
            if (isMounted) setError("Failed to load chart components. Please refresh.");
        }
      }
      registerPlugins();
    }
    return () => { isMounted = false; };
  }, [pluginsRegistered]);

  // Effect 2: Fetch data
  useEffect(() => {
    let isMounted = true;
    if (!pluginsRegistered) {
      // console.log("PnlSimulatorPage: Effect 2 (FetchData) - Waiting for plugins.");
      setIsLoadingData(true); // Ensure loading is true if plugins aren't ready
      return;
    }
    // console.log("PnlSimulatorPage: Effect 2 (FetchData) - Plugins ARE registered. Fetching trade data...");
    async function fetchData() {
      setIsLoadingData(true); setError(null);
      try {
        const response = await fetch('/api/get-trades');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "API response not OK." }));
          throw new Error(errorData.error || `Failed to fetch. Status: ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          // console.log("PnlSimulatorPage: Effect 2 (FetchData) - Data received:", data?.length ?? 'null', "trades.");
          setInitialTradeData(data || []);
        }
      } catch (e) {
        console.error("PnlSimulatorPage: Effect 2 (FetchData) - Error fetching trade data:", e);
        if (isMounted) { setError(e.message); setInitialTradeData([]); }
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }
    fetchData();
    return () => { isMounted = false; };
  }, [pluginsRegistered]);

  // Effect 3: Run simulations
  useEffect(() => {
    // console.log("PnlSimulatorPage: Effect 3 (Simulate) triggered. isLoadingData:", isLoadingData, "pluginsRegistered:", pluginsRegistered, "initialTradeData length:", initialTradeData?.length);
    if (isLoadingData || !pluginsRegistered || !initialTradeData) {
      const startCapS = parseFloat(initialCapitalSpot) || 0;
      const startCapF = parseFloat(initialCapitalFutures) || 0;
      const startPoint = { dateObj: new Date(0), date: "Start", capital: 0, netPnl: 0, tradePnl: 0, tradePnlPercent: 0, ticker: "N/A", direction: "N/A", status: "N/A" };
      setSimulationResultsSpot([{...startPoint, capital: startCapS }]);
      setSimulationResultsFutures([{...startPoint, capital: startCapF }]);
      return;
    }
     if (initialTradeData.length === 0 && !isLoadingData) {
        const startCapS = parseFloat(initialCapitalSpot) || 0;
        const startCapF = parseFloat(initialCapitalFutures) || 0;
        const startPoint = { dateObj: new Date(0), date: "Start", capital: 0, netPnl: 0, tradePnl: 0, tradePnlPercent: 0, ticker: "N/A", direction: "N/A", status: "N/A" };
        setSimulationResultsSpot([{ ...startPoint, capital: startCapS }]);
        setSimulationResultsFutures([{ ...startPoint, capital: startCapF }]);
        return;
    }

    // console.log("PnlSimulatorPage: Effect 3 (Simulate) - RUNNING simulations.");
    const baseStartDate = initialTradeData.length > 0 ? new Date(initialTradeData[0].date) : new Date(0);
    const validBaseStartDate = !isNaN(baseStartDate.getTime()) ? baseStartDate : new Date(0);

    let spotCap = parseFloat(initialCapitalSpot); if (isNaN(spotCap) || spotCap < 0) spotCap = 0;
    let currentCapitalS = spotCap;
    const resultsS = [{ dateObj: validBaseStartDate, date: "Start", capital: currentCapitalS, netPnl: 0, tradePnl: 0, tradePnlPercent: 0, ticker: "N/A", direction: "N/A", status: "N/A" }];
    initialTradeData.forEach(trade => {
      let tradePnlForPointS = 0; let tradePnlPercentForPointS = trade.pnlPercentSpot;
      const tradeDate = new Date(trade.date);
      const validTradeDate = !isNaN(tradeDate.getTime()) ? tradeDate : new Date();
      if (typeof trade.pnlPercentSpot === 'number' && trade.pnlPercentSpot !== 0 && currentCapitalS > 0) {
        const capitalForThisTrade = currentCapitalS * TRADE_CAPITAL_ALLOCATION_PERCENT;
        const pnlAmount = capitalForThisTrade * (trade.pnlPercentSpot / 100);
        currentCapitalS += pnlAmount;
        tradePnlForPointS = parseFloat(pnlAmount.toFixed(2));
      }
      resultsS.push({
        dateObj: validTradeDate, date: trade.date, capital: parseFloat(currentCapitalS.toFixed(2)),
        netPnl: parseFloat((currentCapitalS - spotCap).toFixed(2)),
        tradePnl: tradePnlForPointS, tradePnlPercent: tradePnlPercentForPointS,
        ticker: trade.ticker, direction: trade.direction, status: trade.status
      });
    });
    setSimulationResultsSpot(resultsS);

    let futuresCap = parseFloat(initialCapitalFutures); if (isNaN(futuresCap) || futuresCap < 0) futuresCap = 0;
    let currentCapitalF = futuresCap;
    const resultsF = [{ dateObj: validBaseStartDate, date: "Start", capital: currentCapitalF, netPnl: 0, tradePnl: 0, tradePnlPercent: 0, ticker: "N/A", direction: "N/A", status: "N/A" }];
    initialTradeData.forEach(trade => {
      let tradePnlForPointF = 0; let tradePnlPercentForPointF = trade.pnlPercentFutures;
      const tradeDate = new Date(trade.date);
      const validTradeDate = !isNaN(tradeDate.getTime()) ? tradeDate : new Date();
      if (typeof trade.pnlPercentFutures === 'number' && trade.pnlPercentFutures !== 0 && currentCapitalF > 0) {
        const capitalForThisTrade = currentCapitalF * TRADE_CAPITAL_ALLOCATION_PERCENT;
        const pnlAmount = capitalForThisTrade * (trade.pnlPercentFutures / 100);
        currentCapitalF += pnlAmount;
        tradePnlForPointF = parseFloat(pnlAmount.toFixed(2));
      }
      resultsF.push({
        dateObj: validTradeDate, date: trade.date, capital: parseFloat(currentCapitalF.toFixed(2)),
        netPnl: parseFloat((currentCapitalF - futuresCap).toFixed(2)),
        tradePnl: tradePnlForPointF, tradePnlPercent: tradePnlPercentForPointF,
        ticker: trade.ticker, direction: trade.direction, status: trade.status
      });
    });
    setSimulationResultsFutures(resultsF);
    // console.log("PnlSimulatorPage: Effect 3 (Simulate) - Simulations complete. Spot results:", resultsS.length, "Futures results:", resultsF.length);
  }, [initialCapitalSpot, initialCapitalFutures, initialTradeData, pluginsRegistered, isLoadingData]);

  // Effect 4: Prepare chart data
  useEffect(() => {
    // console.log("PnlSimulatorPage: Effect 4 (ChartData) triggered. isLoadingData:", isLoadingData, "pluginsRegistered:", pluginsRegistered, "simSpotLen:", simulationResultsSpot.length, "simFutLen:", simulationResultsFutures.length);
    if (!pluginsRegistered || isLoadingData) {
        if(!isLoadingData && pluginsRegistered) setChartInstanceData({ datasets: [] });
        return;
    }
    if (!simulationResultsSpot || !simulationResultsFutures || (simulationResultsSpot.length <= 1 && simulationResultsFutures.length <= 1) ) {
        setChartInstanceData({ datasets: [] });
        return;
    }
    // console.log("PnlSimulatorPage: Effect 4 (ChartData) - PREPARING datasets.");
    const datasets = [];
    if (simulationResultsSpot.length > 1) {
      datasets.push({
        label: 'Spot Account Balance',
        data: simulationResultsSpot.map(r => ({ x: r.dateObj.getTime(), y: r.capital, originalSimulationResult: r })),
        borderColor: '#03B085', backgroundColor: 'rgba(3, 176, 133, 0.2)', fill: true, tension: 0.1,
        pointRadius: 2, pointHoverRadius: 5, pointBackgroundColor: '#03B085', pointBorderColor: '#03B085',
      });
    }
    if (simulationResultsFutures.length > 1) {
      datasets.push({
        label: 'Futures Account Balance',
        data: simulationResultsFutures.map(r => ({ x: r.dateObj.getTime(), y: r.capital, originalSimulationResult: r })),
        borderColor: '#FFA500', backgroundColor: 'rgba(255, 165, 0, 0.2)', fill: true, tension: 0.1,
        pointRadius: 2, pointHoverRadius: 5, pointBackgroundColor: '#FFA500', pointBorderColor: '#FFA500',
      });
    }
    setChartInstanceData({ datasets });
    // console.log("PnlSimulatorPage: Effect 4 (ChartData) - FINAL chartInstanceData:", JSON.stringify({ datasets }, getCircularReplacer(), 2));
  }, [simulationResultsSpot, simulationResultsFutures, pluginsRegistered, isLoadingData]);

  // Chart Options - Memoized for dynamic min/max zoom/pan limits
  const chartOptions = useMemo(() => {
    let minXTimestamp = undefined;
    let maxXTimestamp = undefined;

    const allActualTradeDateObjs = [];
    if (simulationResultsSpot.length > 1) simulationResultsSpot.slice(1).forEach(r => r.dateObj && allActualTradeDateObjs.push(r.dateObj));
    if (simulationResultsFutures.length > 1) simulationResultsFutures.slice(1).forEach(r => r.dateObj && allActualTradeDateObjs.push(r.dateObj));
    
    const validDateTimes = allActualTradeDateObjs
        .map(date => date ? date.getTime() : NaN)
        .filter(time => !isNaN(time) && time !== new Date(0).getTime());

    if (validDateTimes.length > 0) {
        minXTimestamp = Math.min(...validDateTimes);
        maxXTimestamp = Math.max(...validDateTimes);
    }

    return {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false, axis: 'x' },
      scales: {
        x: {
          type: 'time', time: { unit: 'day', tooltipFormat: 'MMM dd, yyyy', displayFormats: { day: 'MMM dd, yy' } },
          title: { display: true, text: 'Date', color: '#B0B0B0', font: { family: 'var(--font-geist-mono)' } },
          ticks: { source: 'auto', color: '#B0B0B0', font: { family: 'var(--font-geist-mono)' }, maxRotation: 45, minRotation: 30, autoSkipPadding: 30 },
          grid: { display: false }, min: minXTimestamp, max: maxXTimestamp,
        },
        y: {
          beginAtZero: false, title: { display: true, text: 'Account Capital ($)', color: '#B0B0B0', font: { family: 'var(--font-geist-mono)' } },
          ticks: { color: '#B0B0B0', font: { family: 'var(--font-geist-mono)' }, callback: value => `$${formatNumberWithCommas(value)}` },
          grid: { color: 'rgba(200, 200, 200, 0.1)' }
        }
      },
      plugins: {
        legend: { position: 'top', labels: { color: '#E0E0E0', font: { family: 'var(--font-geist-sans)' } } },
        title: { display: true, text: 'Hypothetical PnL Yield Curve', color: '#E0E0E0', font: { size: 18, family: 'var(--font-geist-sans)', weight: 'bold' } },
        tooltip: {
          titleFont: { family: 'var(--font-geist-sans)' }, bodyFont: { family: 'var(--font-geist-sans)' },
          backgroundColor: 'rgba(20, 20, 20, 0.9)', titleColor: '#03B085', bodyColor: '#E0E0E0',
          borderColor: '#C5A042', borderWidth: 1, padding: 10,
          callbacks: {
            title: (tooltipItems) => { const date = new Date(tooltipItems[0].parsed.x); return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); },
            label: (context) => { const datasetLabel = context.dataset.label || ''; const value = context.parsed.y; return value !== null ? `${datasetLabel}: $${formatNumberWithCommas(value)}` : ''; },
            afterBody: (tooltipItems) => {
              const lines = []; const dataIndex = tooltipItems[0].dataIndex;
              const simDetails = tooltipItems[0].dataset.data[dataIndex]?.originalSimulationResult;
              if (simDetails && simDetails.date !== "Start") {
                lines.push(`Trade: ${simDetails.direction} ${simDetails.ticker} (Status: ${simDetails.status})`);
                if (simDetails.tradePnlPercent !== 0 && typeof simDetails.tradePnlPercent === 'number') {
                   lines.push(` PnL: ${simDetails.tradePnlPercent.toFixed(2)}% ($${formatNumberWithCommas(simDetails.tradePnl)})`);
                }
              } return lines;
            }
          }
        },
        zoom: {
          pan: { enabled: true, mode: 'x', threshold: 5, onPanComplete: ({chart}) => chart.update('none'), limiter: { x: { min: minXTimestamp, max: maxXTimestamp } } },
          zoom: { wheel: { enabled: true, speed: 0.1 }, pinch: { enabled: true }, mode: 'x', onZoomComplete: ({chart}) => chart.update('none'), limiter: { x: { min: minXTimestamp, max: maxXTimestamp } } }
        }
      },
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const { index } = elements[0];
          if (index === 0) { setClickedTradeDetails(null); return; }
          const spotSimDataForDate = simulationResultsSpot[index];
          const futuresSimDataForDate = simulationResultsFutures[index];
          const baseInfoSource = spotSimDataForDate || futuresSimDataForDate;
          if (!baseInfoSource) { setClickedTradeDetails(null); return; }
          setClickedTradeDetails({
              date: baseInfoSource.date, ticker: baseInfoSource.ticker, direction: baseInfoSource.direction, status: baseInfoSource.status,
              spotData: spotSimDataForDate, // This will be the simulation result object for spot for this index
              futuresData: futuresSimDataForDate // This will be the simulation result object for futures for this index
          });
        } else { setClickedTradeDetails(null); }
      },
    };
  }, [simulationResultsSpot, simulationResultsFutures, formatNumberWithCommas]); // Dependencies for chartOptions

  const resetZoom = () => { 
    if (chartRef.current) {
      chartRef.current.resetZoom();
      // Optionally force an update if limits don't stick after reset, though usually not needed
      // chartRef.current.update('none'); 
    }
  };

  // Loading and Error States
  if (!pluginsRegistered && typeof window !== "undefined") { // Show specific message if plugins are the holdup on client
    return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-gray-400 font-manrope"><p>Initializing chart components...</p></div>;
  }
  if (isLoadingData && initialTradeData.length === 0 && !error) { // Show if actively fetching initial data
    return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-gray-400 font-manrope"><p>Loading trade data...</p></div>;
  }
  if (error) {
    return <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 text-red-400 font-manrope text-center p-4"><p className="text-xl mb-2">Error Loading Data</p><p className="text-sm">{error}</p></div>;
  }

  return (
    <main className="min-h-screen bg-[#00100D] text-gray-200 p-4 lg:p-8 font-manrope overflow-x-hidden">
      <div className="max-w-full mx-auto px-2 lg:px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-[#03B085]">PnL Simulator</h1>
        <p className="text-center text-gray-400 mb-12 text-lg">
          Simulate historical trade performance. Click on a point in the chart for detailed trade info.
        </p>
        <div className="mb-12 p-8 bg-[#002a24] rounded-xl shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <label htmlFor="initialCapitalSpot" className="block mb-3 text-2xl font-poppins text-gray-100">Initial Spot Capital: $</label>
            <input type="number" id="initialCapitalSpot" value={initialCapitalSpot} onChange={(e) => setInitialCapitalSpot(parseFloat(e.target.value) || 0)} className="w-full p-4 text-xl bg-[#001f1a] border-2 border-[#004c40] rounded-lg text-white focus:ring-2 focus:ring-[#03B085] focus:border-transparent outline-none transition-all" />
          </div>
          <div>
            <label htmlFor="initialCapitalFutures" className="block mb-3 text-2xl font-poppins text-gray-100">Initial Futures Capital: $</label>
            <input type="number" id="initialCapitalFutures" value={initialCapitalFutures} onChange={(e) => setInitialCapitalFutures(parseFloat(e.target.value) || 0)} className="w-full p-4 text-xl bg-[#001f1a] border-2 border-[#004c40] rounded-lg text-white focus:ring-2 focus:ring-[#03B085] focus:border-transparent outline-none transition-all" />
          </div>
        </div>
        
        <div className="flex flex-col xl:flex-row gap-8">
          <div className="xl:flex-grow-[3] p-1 bg-[#002a24] border border-[#004c40] rounded-xl shadow-2xl min-w-0">
            <div className="mb-4 text-center lg:text-right px-4 pt-2">
              <button onClick={resetZoom} className="px-6 py-3 bg-[#C5A042] text-black rounded-lg hover:bg-opacity-80 transition-colors font-semibold text-base shadow-md">
                Reset Zoom
              </button>
            </div>
            <div className="h-[600px] sm:h-[700px] md:h-[800px] lg:h-[850px] p-2 md:p-4 relative">
              {(Line && chartInstanceData.datasets && chartInstanceData.datasets.length > 0 && !isLoadingData && pluginsRegistered) ? (
                <Line ref={chartRef} options={chartOptions} data={chartInstanceData} />
              ) : (
                <p className="text-center text-gray-500 pt-24 text-lg">
                  {!pluginsRegistered ? "Initializing chart components..." :
                   isLoadingData ? "Loading & Processing trade data..." :
                   (error ? `Error: ${error}` : 
                     (initialTradeData && initialTradeData.length === 0 ? "No trade data found to plot." : 
                      "Chart will display shortly. Ensure valid capital is entered if needed.")
                   )
                  }
                </p>
              )}
            </div>
          </div>

          {/* Details Panel */}
          {clickedTradeDetails && (
            <div className="xl:flex-grow-[1] xl:w-2/5 xl:max-w-md p-6 bg-[#00221D] border border-[#004c40] rounded-xl shadow-2xl self-start mt-10 xl:mt-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-[#C5A042]">Trade Details</h3>
                <button onClick={() => setClickedTradeDetails(null)} className="text-gray-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-2 text-gray-200 text-base">
                <p><strong>Date:</strong> <span className="font-semibold text-white">{clickedTradeDetails.date}</span></p>
                <p><strong>Ticker:</strong> <span className="font-semibold text-white">{clickedTradeDetails.ticker}</span></p>
                <p><strong>Direction:</strong> <span className="font-semibold text-white">{clickedTradeDetails.direction}</span></p>
                <p><strong>Status:</strong> <span className="font-semibold text-white">{clickedTradeDetails.status}</span></p>
                
                <hr className="border-gray-700 my-4" />

                {/* Display Spot Info from clickedTradeDetails.spotData */}
                {clickedTradeDetails.spotData && (typeof clickedTradeDetails.spotData.capital === 'number') && (
                    <div className="mb-4">
                        <p className="font-semibold text-lg text-[#03B085]">Spot Account Snapshot</p>
                        <p><strong>Balance After Trade:</strong> ${formatNumberWithCommas(clickedTradeDetails.spotData.capital)}</p>
                        <p><strong>Net PnL (Cumulative):</strong> <span className={clickedTradeDetails.spotData.netPnl >= 0 ? 'text-green-400' : 'text-red-400'}>${formatNumberWithCommas(clickedTradeDetails.spotData.netPnl)}</span></p>
                        {typeof clickedTradeDetails.spotData.tradePnlPercent === 'number' && clickedTradeDetails.spotData.tradePnlPercent !== 0 && (
                        <p><strong>This Trade's Spot PnL:</strong><span className={`ml-1 ${clickedTradeDetails.spotData.tradePnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>${formatNumberWithCommas(clickedTradeDetails.spotData.tradePnl)} ({clickedTradeDetails.spotData.tradePnlPercent.toFixed(2)}%)</span></p>
                        )}
                    </div>
                )}

                {/* Display Futures Info from clickedTradeDetails.futuresData */}
                {clickedTradeDetails.futuresData && (typeof clickedTradeDetails.futuresData.capital === 'number') && (
                     <div className={`${clickedTradeDetails.spotData ? 'mt-4 pt-3 border-t border-gray-700' : ''}`}>
                        <p className="font-semibold text-lg text-[#FFA500]">Futures Account Snapshot</p>
                        <p><strong>Balance After Trade:</strong> ${formatNumberWithCommas(clickedTradeDetails.futuresData.capital)}</p>
                        <p><strong>Net PnL (Cumulative):</strong> <span className={clickedTradeDetails.futuresData.netPnl >= 0 ? 'text-green-400' : 'text-red-400'}>${formatNumberWithCommas(clickedTradeDetails.futuresData.netPnl)}</span></p>
                        {typeof clickedTradeDetails.futuresData.tradePnlPercent === 'number' && clickedTradeDetails.futuresData.tradePnlPercent !== 0 && (
                        <p><strong>This Trade's Futures PnL:</strong><span className={`ml-1 ${clickedTradeDetails.futuresData.tradePnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>${formatNumberWithCommas(clickedTradeDetails.futuresData.tradePnl)} ({clickedTradeDetails.futuresData.tradePnlPercent.toFixed(2)}%)</span></p>
                        )}
                    </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
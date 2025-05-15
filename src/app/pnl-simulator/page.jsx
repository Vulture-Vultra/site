// src/app/pnl-simulator/page.jsx
"use client";

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
// zoomPlugin will be imported dynamically

const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
});

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

  const [initialCapitalSpot, setInitialCapitalSpot] = useState(10000);
  const [initialCapitalFutures, setInitialCapitalFutures] = useState(10000);

  const [simulationResultsSpot, setSimulationResultsSpot] = useState([]);
  const [simulationResultsFutures, setSimulationResultsFutures] = useState([]);

  const [chartInstanceData, setChartInstanceData] = useState({ datasets: [] });
  const [clickedTradeDetails, setClickedTradeDetails] = useState(null);
  const chartRef = useRef(null);
  const [pluginsRegistered, setPluginsRegistered] = useState(false);

  const TRADE_CAPITAL_ALLOCATION_PERCENT = 0.10;

  const formatNumberWithCommas = (num) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  useEffect(() => { // Effect 1: Register plugins
    console.log("PnlSimulatorPage: Mount/Plugin useEffect. Current pluginsRegistered:", pluginsRegistered);
    if (typeof window !== "undefined" && !pluginsRegistered) {
      async function registerPlugins() {
        console.log("PnlSimulatorPage: Attempting to register ChartJS plugins...");
        try {
            const zoomPluginModule = await import('chartjs-plugin-zoom');
            const zoomPlugin = zoomPluginModule.default;
            ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, TimeScale, zoomPlugin );
            setPluginsRegistered(true);
            console.log("PnlSimulatorPage: ChartJS plugins registered successfully.");
        } catch (pluginError) {
            console.error("PnlSimulatorPage: Error registering chart plugins:", pluginError);
            setError("Failed to load chart components. Please refresh.");
        }
      }
      registerPlugins();
    }
  }, [pluginsRegistered]); // Re-check if needed, but internal guard prevents re-registration

  useEffect(() => { // Effect 2: Fetch data (depends on plugins being registered)
    document.title = "Vultra - PnL Simulator";
    if (!pluginsRegistered) {
      console.log("PnlSimulatorPage: Data fetch - Waiting for plugins.");
      return;
    }
    console.log("PnlSimulatorPage: Data Fetch useEffect - Fetching (plugins ARE registered).");
    async function fetchData() {
      setIsLoadingData(true); setError(null);
      try {
        const response = await fetch('/api/get-trades');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "API response not OK." }));
          throw new Error(errorData.error || `Failed to fetch. Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("PnlSimulatorPage: Data received from API:", data?.length ?? 'null', "trades. Sample:", data?.slice(0,2));
        setInitialTradeData(data || []);
      } catch (e) {
        console.error("PnlSimulatorPage: Error fetching trade data:", e);
        setError(e.message); setInitialTradeData([]);
      } finally { setIsLoadingData(false); }
    }
    fetchData();
  }, [pluginsRegistered]); // Run when pluginsRegistered becomes true

  useEffect(() => { // Effect 3: Run simulations
    console.log("PnlSimulatorPage: Sim useEffect triggered. isLoadingData:", isLoadingData, "pluginsRegistered:", pluginsRegistered, "initialTradeData length:", initialTradeData?.length);
    if (isLoadingData || !pluginsRegistered || !initialTradeData ) {
      const startCapS = parseFloat(initialCapitalSpot) || 0;
      const startCapF = parseFloat(initialCapitalFutures) || 0;
      const startPoint = { dateObj: new Date(0), date: "Start", capital: 0, netPnl: 0, tradePnl: 0, tradePnlPercent: 0, ticker: "N/A", direction: "N/A", status: "N/A" };
      setSimulationResultsSpot([{...startPoint, capital: startCapS }]);
      setSimulationResultsFutures([{...startPoint, capital: startCapF }]);
      console.log("PnlSimulatorPage: Sim useEffect - SKIPPING (loading/no data/no plugins). Set empty sim results.");
      return;
    }
     if (initialTradeData.length === 0) {
        console.log("PnlSimulatorPage: Sim useEffect - No trade data to simulate (initialTradeData is empty).");
        const startCapS = parseFloat(initialCapitalSpot) || 0;
        const startCapF = parseFloat(initialCapitalFutures) || 0;
        const startPoint = { dateObj: new Date(0), date: "Start", capital: 0, netPnl: 0, tradePnl: 0, tradePnlPercent: 0, ticker: "N/A", direction: "N/A", status: "N/A" };
        setSimulationResultsSpot([{ ...startPoint, capital: startCapS }]);
        setSimulationResultsFutures([{ ...startPoint, capital: startCapF }]);
        return;
    }

    console.log("PnlSimulatorPage: Sim useEffect - RUNNING simulations.");
    const baseStartDate = new Date(initialTradeData[0].date);

    let spotCap = parseFloat(initialCapitalSpot); if (isNaN(spotCap) || spotCap < 0) spotCap = 0;
    let currentCapitalS = spotCap;
    const resultsS = [{ dateObj: baseStartDate, date: "Start", capital: currentCapitalS, netPnl: 0, tradePnl: 0, tradePnlPercent: 0, ticker: "N/A", direction: "N/A", status: "N/A" }];
    initialTradeData.forEach(trade => {
      let tradePnlForPointS = 0; let tradePnlPercentForPointS = trade.pnlPercentSpot;
      if (typeof trade.pnlPercentSpot === 'number' && trade.pnlPercentSpot !== 0 && currentCapitalS > 0) {
        const capitalForThisTrade = currentCapitalS * TRADE_CAPITAL_ALLOCATION_PERCENT;
        const pnlAmount = capitalForThisTrade * (trade.pnlPercentSpot / 100);
        currentCapitalS += pnlAmount;
        tradePnlForPointS = parseFloat(pnlAmount.toFixed(2));
      }
      resultsS.push({
        dateObj: new Date(trade.date), date: trade.date, capital: parseFloat(currentCapitalS.toFixed(2)),
        netPnl: parseFloat((currentCapitalS - spotCap).toFixed(2)),
        tradePnl: tradePnlForPointS, tradePnlPercent: tradePnlPercentForPointS,
        ticker: trade.ticker, direction: trade.direction, status: trade.status
      });
    });
    console.log("PnlSimulatorPage: Spot Sim Results (count):", resultsS.length, resultsS.slice(0,3));
    setSimulationResultsSpot(resultsS);

    let futuresCap = parseFloat(initialCapitalFutures); if (isNaN(futuresCap) || futuresCap < 0) futuresCap = 0;
    let currentCapitalF = futuresCap;
    const resultsF = [{ dateObj: baseStartDate, date: "Start", capital: currentCapitalF, netPnl: 0, tradePnl: 0, tradePnlPercent: 0, ticker: "N/A", direction: "N/A", status: "N/A" }];
    initialTradeData.forEach(trade => {
      let tradePnlForPointF = 0; let tradePnlPercentForPointF = trade.pnlPercentFutures;
      if (typeof trade.pnlPercentFutures === 'number' && trade.pnlPercentFutures !== 0 && currentCapitalF > 0) {
        const capitalForThisTrade = currentCapitalF * TRADE_CAPITAL_ALLOCATION_PERCENT;
        const pnlAmount = capitalForThisTrade * (trade.pnlPercentFutures / 100);
        currentCapitalF += pnlAmount;
        tradePnlForPointF = parseFloat(pnlAmount.toFixed(2));
      }
      resultsF.push({
        dateObj: new Date(trade.date), date: trade.date, capital: parseFloat(currentCapitalF.toFixed(2)),
        netPnl: parseFloat((currentCapitalF - futuresCap).toFixed(2)),
        tradePnl: tradePnlForPointF, tradePnlPercent: tradePnlPercentForPointF,
        ticker: trade.ticker, direction: trade.direction, status: trade.status
      });
    });
    console.log("PnlSimulatorPage: Futures Sim Results (count):", resultsF.length, resultsF.slice(0,3));
    setSimulationResultsFutures(resultsF);

  }, [initialCapitalSpot, initialCapitalFutures, initialTradeData, pluginsRegistered, isLoadingData]);

  // Effect 4: Prepare chart data
  useEffect(() => {
    if (!pluginsRegistered) { console.log("PnlSimulatorPage: ChartData useEffect - SKIPPING, plugins not registered."); setChartInstanceData({ datasets: [] }); return; }
    if (!simulationResultsSpot || !simulationResultsFutures || simulationResultsSpot.length === 0 || simulationResultsFutures.length === 0 ) {
        console.log("PnlSimulatorPage: ChartData useEffect - SKIPPING, simulation results not ready or empty.");
        setChartInstanceData({ datasets: [] }); return;
    }
    console.log("PnlSimulatorPage: ChartData useEffect - PREPARING. Spot res:", simulationResultsSpot.length, "Fut res:", simulationResultsFutures.length);

    const datasets = [];
    if (simulationResultsSpot.length > 1) { // Requires more than "Start" point
      datasets.push({
        label: 'Spot Account Balance',
        data: simulationResultsSpot.map(r => ({ x: r.dateObj.getTime(), y: r.capital, originalSimPoint: r })),
        borderColor: '#03B085', backgroundColor: 'rgba(3, 176, 133, 0.2)', fill: true, tension: 0.1,
        pointRadius: 2, pointHoverRadius: 5, pointBackgroundColor: '#03B085', pointBorderColor: '#03B085',
      });
    }
    if (simulationResultsFutures.length > 1) { // Requires more than "Start" point
      datasets.push({
        label: 'Futures Account Balance',
        data: simulationResultsFutures.map(r => ({ x: r.dateObj.getTime(), y: r.capital, originalSimPoint: r })),
        borderColor: '#FFA500', backgroundColor: 'rgba(255, 165, 0, 0.2)', fill: true, tension: 0.1,
        pointRadius: 2, pointHoverRadius: 5, pointBackgroundColor: '#FFA500', pointBorderColor: '#FFA500',
      });
    }
    setChartInstanceData({ datasets });
    console.log("PnlSimulatorPage: ChartData useEffect - FINAL chartInstanceData:", JSON.stringify({ datasets }, getCircularReplacer(), 2));
  }, [simulationResultsSpot, simulationResultsFutures, pluginsRegistered]);

  const options = {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false, axis: 'x' },
      scales: {
        x: {
          type: 'time', time: { unit: 'day', tooltipFormat: 'MMM dd, yyyy', displayFormats: { day: 'MMM dd, yy' } },
          title: { display: true, text: 'Date', color: '#B0B0B0', font: { family: 'var(--font-geist-mono)'} },
          ticks: { source: 'auto', color: '#B0B0B0', font: { family: 'var(--font-geist-mono)'}, maxRotation: 45, minRotation: 30, autoSkipPadding: 30 },
          grid: { display: false }
        },
        y: {
          beginAtZero: false, title: { display: true, text: 'Account Capital ($)', color: '#B0B0B0', font: { family: 'var(--font-geist-mono)'} },
          ticks: { color: '#B0B0B0', font: { family: 'var(--font-geist-mono)'}, callback: value => `$${formatNumberWithCommas(value)}` },
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
              const tradeDetails = tooltipItems[0].dataset.data[dataIndex]?.originalSimPoint;
              if (tradeDetails && tradeDetails.date !== "Start") {
                lines.push(`Trade: ${tradeDetails.direction} ${tradeDetails.ticker} (Status: ${tradeDetails.status})`);
                if (tradeDetails.tradePnlPercent !== 0 && typeof tradeDetails.tradePnlPercent === 'number') {
                   lines.push(` PnL: ${tradeDetails.tradePnlPercent.toFixed(2)}% ($${formatNumberWithCommas(tradeDetails.tradePnl)})`);
                }
              }
              return lines;
            }
          }
        },
        zoom: {
          pan: { enabled: true, mode: 'x', threshold: 5, onPanComplete: ({chart}) => chart.update('none') },
          zoom: { wheel: { enabled: true, speed: 0.1 }, pinch: { enabled: true }, mode: 'x', onZoomComplete: ({chart}) => chart.update('none') }
        }
      },
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const dataIndex = elements[0].index;
          if (dataIndex === 0) { setClickedTradeDetails(null); return; }
          const spotDataForDate = simulationResultsSpot[dataIndex];
          const futuresDataForDate = simulationResultsFutures[dataIndex];
          setClickedTradeDetails({
              date: spotDataForDate?.date || futuresDataForDate?.date,
              ticker: spotDataForDate?.ticker || futuresDataForDate?.ticker,
              direction: spotDataForDate?.direction || futuresDataForDate?.direction,
              status: spotDataForDate?.status || futuresDataForDate?.status,
              spotCapital: spotDataForDate?.capital, spotNetPnl: spotDataForDate?.netPnl,
              spotTradePnl: spotDataForDate?.tradePnl, spotTradePnlPercent: spotDataForDate?.tradePnlPercent,
              futuresCapital: futuresDataForDate?.capital, futuresNetPnl: futuresDataForDate?.netPnl,
              futuresTradePnl: futuresDataForDate?.tradePnl, futuresTradePnlPercent: futuresDataForDate?.tradePnlPercent,
          });
        }
      },
  };

  const resetZoom = () => { if (chartRef.current) chartRef.current.resetZoom(); };

  console.log("PnlSimulatorPage: RENDERING. isLoadingData:", isLoadingData, "error:", error, "pluginsRegistered:", pluginsRegistered, "chartDatasetsLength:", chartInstanceData.datasets?.length);

  if (!pluginsRegistered && typeof window !== "undefined") return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-gray-400 font-manrope"><p>Initializing chart components... (pluginsRegistered: {String(pluginsRegistered)})</p></div>;
  if (isLoadingData && (!initialTradeData || initialTradeData.length === 0)) return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-gray-400 font-manrope"><p>Loading trade data for chart... (isLoadingData: {String(isLoadingData)})</p></div>;
  if (error) return <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 text-red-400 font-manrope text-center p-4"><p className="text-xl mb-2">Error Loading Data</p><p className="text-sm">{error}</p></div>;

  return (
    <main className="min-h-screen bg-[#001A16] text-gray-300 p-4 lg:p-8 font-manrope overflow-x-hidden">
      <div className="max-w-full mx-auto px-2 lg:px-6">
        <h1 className="text-3xl md:text-5xl font-bold text-center mb-6 text-[#03B085]">PnL Simulator</h1>
        <p className="text-center text-gray-400 mb-10 text-base">
          Simulate historical trade performance. Click on a point in the chart for detailed trade info.
        </p>
        <div className="mb-10 p-6 bg-[#002a24] rounded-lg shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
                <label htmlFor="initialCapitalSpot" className="block mb-2 text-xl font-poppins text-gray-100">Initial Spot Capital: $</label>
                <input type="number" id="initialCapitalSpot" value={initialCapitalSpot} onChange={(e) => setInitialCapitalSpot(parseFloat(e.target.value) || 0)} className="w-full p-3 text-lg bg-[#001f1a] border-2 border-[#004c40] rounded-md text-white focus:ring-2 focus:ring-[#03B085] focus:border-transparent outline-none transition-all" />
            </div>
            <div>
                <label htmlFor="initialCapitalFutures" className="block mb-2 text-xl font-poppins text-gray-100">Initial Futures Capital: $</label>
                <input type="number" id="initialCapitalFutures" value={initialCapitalFutures} onChange={(e) => setInitialCapitalFutures(parseFloat(e.target.value) || 0)} className="w-full p-3 text-lg bg-[#001f1a] border-2 border-[#004c40] rounded-md text-white focus:ring-2 focus:ring-[#03B085] focus:border-transparent outline-none transition-all" />
            </div>
        </div>
        <div className="mb-4 text-center">
            <button onClick={resetZoom} className="px-6 py-2 bg-[#C5A042] text-black rounded-md hover:bg-opacity-80 transition-colors font-semibold text-sm shadow-md">
                Reset Zoom
            </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:flex-grow-[3] p-1 bg-[#002a24] border border-[#004c40] rounded-lg shadow-2xl min-w-0">
            <div className="h-[500px] md:h-[650px] mt-2 p-4 md:p-4 relative">
              {(chartInstanceData.datasets && chartInstanceData.datasets.length > 0 && !isLoadingData && pluginsRegistered) ? (
                <Line ref={chartRef} options={options} data={chartInstanceData} />
              ) : (
                <p className="text-center text-gray-500 pt-24">
                  {!pluginsRegistered ? "Initializing chart..." :
                   isLoadingData ? "Processing data for chart..." :
                   (error ? "Error preparing chart data." :
                     (initialTradeData && initialTradeData.length === 0 ? "No trade data available to plot." : 
                      "Chart will display after data processing. Ensure capital is valid and trades exist with PnL.")
                   )
                  }
                </p>
              )}
            </div>
          </div>

          {clickedTradeDetails && (
            <div className="lg:flex-grow-[1] lg:w-1/3 lg:max-w-md p-6 bg-[#00221D] border border-[#004c40] rounded-lg shadow-2xl self-start mt-10 lg:mt-0">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-2xl font-bold text-[#C5A042] border-b-2 border-[#C5A042]/50 pb-2">
                  Trade Details
                </h3>
                <button onClick={() => setClickedTradeDetails(null)} className="text-gray-400 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-3 text-gray-200 text-sm">
                <p><strong>Date:</strong> <span className="font-semibold text-white">{clickedTradeDetails.date}</span></p>
                <p><strong>Ticker:</strong> <span className="font-semibold text-white">{clickedTradeDetails.ticker}</span></p>
                <p><strong>Direction:</strong> <span className="font-semibold text-white">{clickedTradeDetails.direction}</span></p>
                <p><strong>Status:</strong> <span className="font-semibold text-white">{clickedTradeDetails.status}</span></p>
                
                {clickedTradeDetails.spotCapital !== undefined && (
                    <div className="mt-4 pt-3 border-t border-gray-700">
                        <p className="font-semibold text-lg text-[#03B085]">Spot Account</p>
                        <p><strong>Balance After Trade:</strong> ${formatNumberWithCommas(clickedTradeDetails.spotCapital)}</p>
                        <p><strong>Net PnL (Cumulative):</strong> <span className={clickedTradeDetails.spotNetPnl >= 0 ? 'text-green-400' : 'text-red-400'}>${formatNumberWithCommas(clickedTradeDetails.spotNetPnl)}</span></p>
                        {typeof clickedTradeDetails.spotTradePnlPercent === 'number' && clickedTradeDetails.spotTradePnlPercent !== 0 && (
                        <p><strong>Trade PnL:</strong> <span className={clickedTradeDetails.spotTradePnl >= 0 ? 'text-green-400' : 'text-red-400'}>${formatNumberWithCommas(clickedTradeDetails.spotTradePnl)} ({clickedTradeDetails.spotTradePnlPercent.toFixed(2)}%)</span></p>
                        )}
                    </div>
                )}

                {clickedTradeDetails.futuresCapital !== undefined && (
                    <div className="mt-4 pt-3 border-t border-gray-700">
                        <p className="font-semibold text-lg text-[#FFA500]">Futures Account</p>
                        <p><strong>Balance After Trade:</strong> ${formatNumberWithCommas(clickedTradeDetails.futuresCapital)}</p>
                        <p><strong>Net PnL (Cumulative):</strong> <span className={clickedTradeDetails.futuresNetPnl >= 0 ? 'text-green-400' : 'text-red-400'}>${formatNumberWithCommas(clickedTradeDetails.futuresNetPnl)}</span></p>
                        {typeof clickedTradeDetails.futuresTradePnlPercent === 'number' && clickedTradeDetails.futuresTradePnlPercent !== 0 && (
                        <p><strong>Trade PnL:</strong> <span className={clickedTradeDetails.futuresTradePnl >= 0 ? 'text-green-400' : 'text-red-400'}>${formatNumberWithCommas(clickedTradeDetails.futuresTradePnl)} ({clickedTradeDetails.futuresTradePnlPercent.toFixed(2)}%)</span></p>
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
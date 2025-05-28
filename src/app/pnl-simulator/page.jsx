// pr update
"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image'; // Added for the watermark
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import LineChartLoadingSpinner from './LineChartLoadingSpinner';
import Navbar from '../component/Navbar.jsx';

const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });

export default function PnlSimulatorPage() {
  // Loader & state
  const [initialTradeData, setInitialTradeData] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState(null);
  const [pluginsRegistered, setPluginsRegistered] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Capital inputs
  const [initialCapitalSpot, setInitialCapitalSpot] = useState(1000);
  const [initialCapitalFutures, setInitialCapitalFutures] = useState(1000);

  // Simulation & chart data
  const [simulationResultsSpot, setSimulationResultsSpot] = useState([]);
  const [simulationResultsFutures, setSimulationResultsFutures] = useState([]);
  const [chartInstanceData, setChartInstanceData] = useState({ datasets: [] });
  const [clickedTradeDetails, setClickedTradeDetails] = useState(null);
  const chartRef = useRef(null);
  const TRADE_CAPITAL_ALLOCATION_PERCENT = 0.10;

  // Timing & formatting
  const minDataTimestampForKey = useMemo(() => {
    const all = [];
    [...simulationResultsSpot, ...simulationResultsFutures].forEach(r => {
      if (r.dateObj && !isNaN(r.dateObj.getTime())) all.push(r.dateObj.getTime());
    });
    return all.length ? Math.min(...all) : Date.now();
  }, [simulationResultsSpot, simulationResultsFutures]);

  const formatNumberWithCommas = num => {
    if (num == null || isNaN(num)) return 'N/A';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Minimum loader duration: 4s
  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Register plugins
  useEffect(() => {
    let mounted = true;
    if (!pluginsRegistered) {
      import('chartjs-plugin-zoom')
        .then(mod => {
          ChartJS.register(
            CategoryScale,
            LinearScale,
            PointElement,
            LineElement,
            Title,
            Tooltip,
            Legend,
            Filler,
            TimeScale,
            mod.default
          );
          if (mounted) setPluginsRegistered(true);
        })
        .catch(err => {
          console.error(err);
          if (mounted) {
            setError('Failed to load chart components.');
            setIsLoadingData(false);
          }
        });
    }
    return () => { mounted = false; };
  }, [pluginsRegistered]);

  // Fetch data
  useEffect(() => {
    if (!pluginsRegistered) return;
    let mounted = true;
    (async () => {
      setIsLoadingData(true);
      try {
        const res = await fetch('/api/get-trades');
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const data = await res.json();
        const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
        if (mounted) setInitialTradeData(sorted);
      } catch (e) {
        console.error(e);
        if (mounted) {
          setError(e.message);
          setInitialTradeData([]);
        }
      } finally {
        if (mounted) setIsLoadingData(false);
      }
    })();
    return () => { mounted = false; };
  }, [pluginsRegistered]);

  // Run simulations
  useEffect(() => {
    const base = initialTradeData.length ? new Date(initialTradeData[0].date).getTime() : 0;
    const startDate = new Date(base);

    if (!pluginsRegistered || isLoadingData) {
      setSimulationResultsSpot([{
        dateObj: startDate,
        date: 'Start',
        capital: initialCapitalSpot,
        netPnl: 0,
        tradePnl: 0,
        tradePnlPercent: 0,
        ticker: 'N/A',
        direction: 'N/A',
        status: 'N/A'
      }]);
      setSimulationResultsFutures([{
        dateObj: startDate,
        date: 'Start',
        capital: initialCapitalFutures,
        netPnl: 0,
        tradePnl: 0,
        tradePnlPercent: 0,
        ticker: 'N/A',
        direction: 'N/A',
        status: 'N/A'
      }]);
      return;
    }

    setIsSimulating(true);

    // Spot
    let spotCap = initialCapitalSpot;
    const spotResults = initialTradeData.map(t => {
      const pnl = spotCap > 0 && t.pnlPercentSpot
        ? spotCap * TRADE_CAPITAL_ALLOCATION_PERCENT * (t.pnlPercentSpot / 100)
        : 0;
      spotCap += pnl;
      return {
        dateObj: new Date(t.date),
        date: t.date,
        capital: parseFloat(spotCap.toFixed(2)),
        netPnl: parseFloat((spotCap - initialCapitalSpot).toFixed(2)),
        tradePnl: parseFloat(pnl.toFixed(2)),
        tradePnlPercent: t.pnlPercentSpot || 0,
        ticker: t.ticker,
        direction: t.direction,
        status: t.status
      };
    });
    setSimulationResultsSpot([{
      dateObj: startDate,
      date: 'Start',
      capital: initialCapitalSpot,
      netPnl: 0,
      tradePnl: 0,
      tradePnlPercent: 0,
      ticker: 'N/A',
      direction: 'N/A',
      status: 'N/A'
    }, ...spotResults]);

    // Futures
    let futCap = initialCapitalFutures;
    const futResults = initialTradeData.map(t => {
      const pnl = futCap > 0 && t.pnlPercentFutures
        ? futCap * TRADE_CAPITAL_ALLOCATION_PERCENT * (t.pnlPercentFutures / 100)
        : 0;
      futCap += pnl;
      return {
        dateObj: new Date(t.date),
        date: t.date,
        capital: parseFloat(futCap.toFixed(2)),
        netPnl: parseFloat((futCap - initialCapitalFutures).toFixed(2)),
        tradePnl: parseFloat(pnl.toFixed(2)),
        tradePnlPercent: t.pnlPercentFutures || 0,
        ticker: t.ticker,
        direction: t.direction,
        status: t.status
      };
    });
    setSimulationResultsFutures([{
      dateObj: startDate,
      date: 'Start',
      capital: initialCapitalFutures,
      netPnl: 0,
      tradePnl: 0,
      tradePnlPercent: 0,
      ticker: 'N/A',
      direction: 'N/A',
      status: 'N/A'
    }, ...futResults]);

    setIsSimulating(false);
  }, [initialTradeData, isLoadingData, pluginsRegistered, initialCapitalSpot, initialCapitalFutures]);

  // Chart data
  useEffect(() => {
    if (!pluginsRegistered || isLoadingData || isSimulating) return;
    const datasets = [];
    if (simulationResultsSpot.length) datasets.push({ label: 'Spot Account Balance', data: simulationResultsSpot.map(r => ({ x: r.dateObj.getTime(), y: r.capital, originalSimulationResult: r })), borderColor: '#03B085', backgroundColor: 'rgba(3,176,133,0.2)', fill: true, tension: 0.1, pointRadius: 2, pointHoverRadius: 5, pointBackgroundColor: '#03B085', pointBorderColor: '#03B085' });
    if (simulationResultsFutures.length) datasets.push({ label: 'Futures Account Balance', data: simulationResultsFutures.map(r => ({ x: r.dateObj.getTime(), y: r.capital, originalSimulationResult: r })), borderColor: '#FFA500', backgroundColor: 'rgba(255,165,0,0.2)', fill: true, tension: 0.1, pointRadius: 2, pointHoverRadius: 5, pointBackgroundColor: '#FFA500', pointBorderColor: '#FFA500' });
    setChartInstanceData({ datasets });
    chartRef.current?.update('none');
  }, [simulationResultsSpot, simulationResultsFutures, isLoadingData, isSimulating, pluginsRegistered]);

  // Chart options
  const chartOptions = useMemo(() => {
    const allTimes = [];
    [...simulationResultsSpot, ...simulationResultsFutures].forEach(r => r.dateObj && !isNaN(r.dateObj.getTime()) && allTimes.push(r.dateObj.getTime()));
    const min = allTimes.length ? Math.min(...allTimes) : undefined;
    const max = allTimes.length ? Math.max(...allTimes) : undefined;
    const oneDay = 24 * 60 * 60 * 1000;
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false, axis: 'x' },
      scales: {
        x: {
          type: 'time',
          time: { unit: 'day', tooltipFormat: 'MMM dd, yyyy', displayFormats: { day: 'MMM dd, yy' } },
          title: { display: true, text: 'Date', color: '#B0B0B0', font: { family: 'var(--font-geist-mono)' } },
          ticks: { source: 'auto', color: '#B0B0B0', font: { family: 'var(--font-geist-mono)' }, maxRotation: 45, minRotation: 30, autoSkipPadding: 30 },
          grid: { display: false },
          min,
          max: max === min ? min + oneDay : max,
          offset: false,
          bounds: 'data'
        },
        y: {
          beginAtZero: false,
          title: { display: true, text: 'Account Capital ($)', color: '#B0B0B0', font: { family: 'var(--font-geist-mono)' } },
          ticks: { color: '#B0B0B0', font: { family: 'var(--font-geist-mono)' }, callback: val => `$${formatNumberWithCommas(val)}` },
          grid: { color: 'rgba(200,200,200,0.1)' }
        }
      },
      plugins: {
        legend: { position: 'top', labels: { color: '#E0E0E0', font: { family: 'var(--font-geist-sans)' } } },
        title: { display: true, text: 'Hypothetical PnL Yield Curve', color: '#E0E0E0', font: { size: 18, family: 'var(--font-geist-sans)', weight: 'bold' } },
        tooltip: {
          titleFont: { family: 'var(--font-geist-sans)' },
          bodyFont: { family: 'var(--font-geist-sans)' },
          backgroundColor: 'rgba(20,20,20,0.9)',
          titleColor: '#03B085',
          bodyColor: '#E0E0E0',
          borderColor: '#C5A042',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            title: items => items.length ? new Date(items[0].parsed.x).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
            label: ctx => ctx.parsed.y != null ? `${ctx.dataset.label}: $${formatNumberWithCommas(ctx.parsed.y)}` : '',
            afterBody: items => {
              if (!items.length) return [];
              const idx = items[0].dataIndex;
              const d = items[0].dataset.data[idx].originalSimulationResult;
              const lines = [];
              if (d && d.date !== 'Start') {
                lines.push(`Trade: ${d.direction} ${d.ticker} (Status: ${d.status})`);
                if (d.tradePnlPercent) lines.push(`PnL: ${d.tradePnlPercent.toFixed(2)}% ($${formatNumberWithCommas(d.tradePnl)})`);
              }
              return lines;
            }
          }
        },
        zoom: {
          pan: { enabled: true, mode: 'x', threshold: 5 },
          zoom: { wheel: { enabled: true, speed: 0.1 }, pinch: { enabled: true }, mode: 'x' },
          limits: { x: { min, max: max === min ? min + oneDay : max } }
        }
      },
      onClick: (e, elements) => {
        if (elements.length) {
          const { index } = elements[0];
          if (index === 0) { // Assuming 'Start' is always the first data point
            setClickedTradeDetails(null);
          } else {
            // Adjust index if your simulation data array has a "Start" object at the beginning
            // that isn't present in initialTradeData. For this example, assuming direct mapping
            // or that simulationResultsSpot/Futures are already aligned with what you want to show.
            const spot = simulationResultsSpot[index]; // Or adjust index: simulationResultsSpot[index]
            const fut = simulationResultsFutures[index]; // Or adjust index: simulationResultsFutures[index]
            setClickedTradeDetails({
              date: spot.date,
              ticker: spot.ticker,
              direction: spot.direction,
              status: spot.status,
              spotData: spot,
              futuresData: fut
            });
          }
        } else {
          setClickedTradeDetails(null);
        }
      }
    };
  }, [simulationResultsSpot, simulationResultsFutures]); // Removed formatNumberWithCommas if not directly used in options

  const resetZoom = () => chartRef.current?.resetZoom();

  // Show loader
  if (!error && (!minTimeElapsed || !pluginsRegistered || isLoadingData || isSimulating)) {
    const msg = !pluginsRegistered
      ? 'Initializing Chart...'
      : isLoadingData
        ? 'Loading Trade Data…'
        : isSimulating
          ? 'Calculating Performance…'
          : 'Loading…';
    return <LineChartLoadingSpinner message={msg} />;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#00100D] text-gray-200 p-4 lg:p-8 font-manrope overflow-x-hidden">
        <div className="max-w-full mx-auto px-2 lg:px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 text-[#03B085]">PnL Simulator</h1>
          <p className="text-center text-gray-400 mb-12 text-lg">Simulate historical trade performance. Click on a point in the chart for detailed trade info.</p>
          <div className="mb-12 p-8 bg-[#002a24] rounded-xl shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <label htmlFor="initialCapitalSpot" className="block mb-3 text-2xl font-poppins text-gray-100">Initial Spot Capital: $</label>
              <input
                type="number"
                id="initialCapitalSpot"
                value={initialCapitalSpot}
                onChange={e => setInitialCapitalSpot(parseFloat(e.target.value) || 0)}
                className="w-full p-4 text-xl bg-[#001f1a] border-2 border-[#004c40] rounded-lg text-white focus:ring-2 focus:ring-[#03B085] outline-none transition-all"
              />
            </div>
            <div>
              <label htmlFor="initialCapitalFutures" className="block mb-3 text-2xl font-poppins text-gray-100">Initial Futures Capital: $</label>
              <input
                type="number"
                id="initialCapitalFutures"
                value={initialCapitalFutures}
                onChange={e => setInitialCapitalFutures(parseFloat(e.target.value) || 0)}
                className="w-full p-4 text-xl bg-[#001f1a] border-2 border-[#004c40] rounded-lg text-white focus:ring-2 focus:ring-[#03B085] outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex flex-col xl:flex-row gap-8">
            <div className="xl:flex-grow-[3] p-1 bg-[#002a24] border border-[#004c40] rounded-xl shadow-2xl min-w-0">
              <div className="mb-4 text-center lg:text-right px-4 pt-2">
                <button onClick={resetZoom} className="px-6 py-3 bg-[#C5A042] text-black rounded-lg hover:bg-opacity-80 transition-colors font-semibold text-base shadow-md">Reset Zoom</button>
              </div>
              <div className="h-[600px] sm:h-[700px] md:h-[800px] lg:h-[850px] p-2 md:p-4 relative">
                {/* Watermark Image */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: 1.0, // Adjust opacity as needed
                  zIndex: 0, // Ensure it's behind the chart
                  pointerEvents: 'none' // Make it non-interactive
                }}>
                  <Image
                    src="/Vultra Final Logo-22.png" // Path to your logo in the public folder
                    alt="Vultra Logo Watermark"
                    width={300} // Adjusted width for better aspect ratio
                    height={100} // Adjusted height for better aspect ratio
                    priority
                  />
                </div>
                {/* Chart Component */}
                {Line && chartInstanceData.datasets.length > 0 ? (
                  <Line
                    key={minDataTimestampForKey}
                    ref={chartRef}
                    options={chartOptions}
                    data={chartInstanceData}
                    className="relative z-10" // Ensure chart is above watermark
                  />
                ) : (
                  <p className="text-center text-gray-500 pt-24 text-lg">
                    {!pluginsRegistered
                      ? 'Initializing chart...'
                      : isLoadingData
                        ? 'Loading data...'
                        : isSimulating
                          ? 'Calculating...'
                          : error
                            ? `Error: ${error}`
                            : initialTradeData.length
                              ? '' // Data will be loaded or chart will be shown
                              : 'No trade data.'}
                  </p>
                )}
              </div>
            </div>
            {clickedTradeDetails && (
              <div className="xl:flex-grow-[1] xl:w-2/5 xl:max-w-md p-6 bg-[#00221D] border border-[#004c40] rounded-xl shadow-2xl self-start mt-10 xl:mt-0">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-[#C5A042]">Trade Details</h3>
                  <button onClick={() => setClickedTradeDetails(null)} className="text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Ensuring details are displayed correctly */}
                <div className="space-y-3 text-gray-300 text-base">
                  <p><strong>Date:</strong> {new Date(clickedTradeDetails.date).toLocaleDateString()}</p>
                  <p><strong>Ticker:</strong> {clickedTradeDetails.ticker}</p>
                  <p><strong>Direction:</strong> <span className={`font-semibold ${clickedTradeDetails.direction.toLowerCase().includes('long') || clickedTradeDetails.direction.toLowerCase().includes('buy') ? 'text-green-400' : 'text-red-400'}`}>{clickedTradeDetails.direction}</span></p>
                  <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${clickedTradeDetails.status === 'TP' ? 'bg-green-500/20 text-green-300' : clickedTradeDetails.status === 'STL' ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-300'}`}>{clickedTradeDetails.status}</span></p>
                  <hr className="border-gray-700 my-3"/>
                  {clickedTradeDetails.spotData && (
                    <div>
                      <h4 className="text-lg font-semibold text-[#03B085] mb-1">Spot Trade</h4>
                      <p>Trade P&L: <span className={clickedTradeDetails.spotData.tradePnl >= 0 ? 'text-green-400' : 'text-red-400'}>{formatNumberWithCommas(clickedTradeDetails.spotData.tradePnlPercent)}%</span> (${formatNumberWithCommas(clickedTradeDetails.spotData.tradePnl)})</p>
                      <p>Account Capital After Trade: ${formatNumberWithCommas(clickedTradeDetails.spotData.capital)}</p>
                      <p>Net P&L from Start: ${formatNumberWithCommas(clickedTradeDetails.spotData.netPnl)}</p>
                    </div>
                  )}
                  {clickedTradeDetails.futuresData && (
                    <div className="mt-3">
                      <h4 className="text-lg font-semibold text-[#FFA500] mb-1">Futures Trade</h4>
                       <p>Trade P&L: <span className={clickedTradeDetails.futuresData.tradePnl >= 0 ? 'text-green-400' : 'text-red-400'}>{formatNumberWithCommas(clickedTradeDetails.futuresData.tradePnlPercent)}%</span> (${formatNumberWithCommas(clickedTradeDetails.futuresData.tradePnl)})</p>
                      <p>Account Capital After Trade: ${formatNumberWithCommas(clickedTradeDetails.futuresData.capital)}</p>
                      <p>Net P&L from Start: ${formatNumberWithCommas(clickedTradeDetails.futuresData.netPnl)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
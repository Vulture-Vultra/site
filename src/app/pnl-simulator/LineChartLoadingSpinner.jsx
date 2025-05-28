'use client';

import { useState, useEffect } from 'react';

export default function LineChartLoadingSpinner({ message = "Loading..." }) {
  // hydration guard
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (!hydrated) return null;

  const pathLength = 86;
  const pathStyle = {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength,
    animationName: 'drawLineUpGlobal',
    animationDuration: '4.1s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-center items-center bg-[#001a16] text-gray-300">
      <svg width="120" height="120" viewBox="0 0 100 100" className="mb-4">
        <line x1="15" y1="10" x2="15" y2="85" stroke="#4A5568" strokeWidth="1.5" />
        <line x1="15" y1="85" x2="90" y2="85" stroke="#4A5568" strokeWidth="1.5" />
        <path
          d="M20 80 L85 25"
          stroke="#03B085"
          strokeWidth="3.5"
          fill="transparent"
          strokeLinecap="round"
          style={pathStyle}
        />
      </svg>
      <p className="text-lg text-gray-400 font-poppins">{message}</p>
    </div>
  );
}

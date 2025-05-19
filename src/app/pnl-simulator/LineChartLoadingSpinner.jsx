'use client';

import { useState, useEffect } from 'react';

const LineChartLoadingSpinner = ({ message = "Loading..." }) => {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Render nothing on server to avoid hydration mismatch
  if (!hydrated) return null;

  const pathLength = 86;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-center items-center bg-[#001a16] text-gray-300">
      <svg width="120" height="120" viewBox="0 0 100 100" className="mb-4">
        {/* Y-axis */}
        <line x1="15" y1="10" x2="15" y2="85" stroke="#4A5568" strokeWidth="1.5" />
        {/* X-axis */}
        <line x1="15" y1="85" x2="90" y2="85" stroke="#4A5568" strokeWidth="1.5" />

        {/* Animated line */}
        <path
          d="M20 80 L85 25"
          stroke="#03B085"
          strokeWidth="3.5"
          fill="transparent"
          strokeLinecap="round"
          className="animated-line"
        />
      </svg>
      <p className="text-lg text-gray-400 font-poppins">{message}</p>

      <style jsx>{`
        .animated-line {
          stroke-dasharray: ${pathLength};
          stroke-dashoffset: ${pathLength};
          animation: drawLineUp 1.8s ease-in-out infinite;
        }

        @keyframes drawLineUp {
          0% {
            stroke-dashoffset: ${pathLength};
            opacity: 0.5;
          }
          50% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LineChartLoadingSpinner;

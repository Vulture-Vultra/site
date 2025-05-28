'use client'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'

function Services() {
    const textRef = useRef(null)
      const [isVisible, setIsVisible] = useState(false)
      
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        } else {
          setIsVisible(false)
        }
      },
      { threshold: 0.1 }
    )

    if (textRef.current) {
      observer.observe(textRef.current)
    }

    return () => {
      if (textRef.current) {
        observer.unobserve(textRef.current)
      }
    }
  }, [])
    return (
        <div>
            <div ref={textRef} className={`text-center text-white mb-12 ${isVisible ? 'drop-in' : ''}`}>
                <h2 className="text-[#C5A042] text-md uppercase tracking-wider mb-2 font-poppins">SERVICES</h2>
                <h1 className="text-2xl font-semibold font-manrope">Your Edge in the Market Starts Here</h1>
            </div>
            <div ref={textRef} className={` flex flex-col lg:flex-row justify-center items-start gap-4${isVisible ? 'drop-in' : ''}`}>

            <div className='lg:w-2/3 w-full font-manrope'>
                {/* MODIFIED: Changed to CSS Grid layout for the 4 boxes on lg screens */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  
                    {/* Box 1 - Premium Trading Signals */}
                    <div
                        className='w-full border rounded-2xl backdrop-blur-md p-6 bg-white/10 flex flex-col' 
                        // Removed flex-1 as grid handles height now based on cell
                    >
                        <span
                            className='text-[#C5A042] font-bold border border-yellow-400 text-lg h-12 w-12 rounded-full flex justify-center items-center mb-3 flex-shrink-0'
                            style={{ background: 'radial-gradient(circle, #C5A042 0%, transparent 100%)' }}
                        >
                            <Image src='/service1.png' width={24} height={24} alt='Premium Trading Signals' />
                        </span>
                        <h1 className='text-[#C5A042] font-bold text-lg mb-1'>Premium Trading Signals</h1>
                        <p className='text-white text-sm text-justify'>
                          Receive high-probability trading signals across diverse markets including Stocks, Options, Crypto, Futures, and Commodities. Our signals are designed to help you build capital effectively as you learn.
                        </p>
                    </div>

                    {/* Box 2 - Educational Resources & Mentorship (Order changed for grid flow) */}
                    <div
                        className='w-full border rounded-2xl backdrop-blur-md p-6 bg-white/10 flex flex-col'
                    >
                        <span
                            className='text-[#C5A042] font-bold border border-yellow-400 text-lg h-12 w-12 rounded-full flex justify-center items-center mb-3 flex-shrink-0'
                            style={{ background: 'radial-gradient(circle, #C5A042 0%, transparent 100%)' }}
                        >
                            <Image  src='/service3.png' width={24} height={24}  alt='Educational Resources & Mentorship'/>
                        </span>
                        <h1 className='text-[#C5A042] font-bold text-lg mb-1'>Educational Resources & Mentorship</h1>
                        <p className='text-white text-sm text-justify'>
                          Accelerate your learning curve with our structured educational programs, resources, and direct mentorship. We focus on practical application to help you develop sustainable trading strategies.
                        </p>
                    </div>

                    {/* Box 3 - In-Depth Market Analysis (Order changed for grid flow) */}
                    <div
                        className='w-full border rounded-2xl backdrop-blur-md p-6 bg-white/10 flex flex-col'
                    >
                        <span
                            className='text-[#C5A042] font-bold border border-yellow-400 text-lg h-12 w-12 rounded-full flex justify-center items-center mb-3 flex-shrink-0'
                            style={{ background: 'radial-gradient(circle, #C5A042 0%, transparent 100%)' }}
                        >
                            <Image src='/service2.png' width={24} height={24} alt='In-Depth Market Analysis' />
                        </span>
                        <h1 className='text-[#C5A042] font-bold text-lg mb-1'>In-Depth Market Analysis</h1>
                        <p className='text-white text-sm text-justify'>
                          Gain access to comprehensive macro-market analysis and detailed reports. Understand the bigger picture and make informed trading decisions with insights from our experienced analysts.
                        </p>
                    </div>

                    {/* Box 4 - 24/7 Automated Trading Bot */}
                    <div
                        className='w-full border rounded-2xl backdrop-blur-md p-6 bg-white/10 flex flex-col'
                    >
                        <span
                            className='text-[#C5A042] font-bold border border-yellow-400 text-lg h-12 w-12 rounded-full flex justify-center items-center mb-3 flex-shrink-0'
                            style={{ background: 'radial-gradient(circle, #C5A042 0%, transparent 100%)' }}
                        >
                            <Image  src='/service4.png' width={24} height={24} alt='24/7 Automated Trading Bot' />
                        </span>
                        <h1 className='text-[#C5A042] font-bold text-lg mb-1'>24/7 Automated Trading Bot</h1>
                        <p className='text-white text-sm text-justify'>
                          Leverage our cutting-edge trading bot that provides around-the-clock signals, allowing you to capitalize on any and all market opportunity.
                        </p>
                    </div>
                </div>
            </div>
            <div className='lg:w-1/3 w-full lg:mx-auto flex justify-center items-center'>
                  <Image src='/service.png' width={600} height={400} alt="Crypto grid background" className=" p-2" />
            </div>
            </div>
          
      <style jsx>{`
        .drop-in {
          animation: dropIn 2s ease-in-out;
        }

        @keyframes dropIn {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    )
}

export default Services
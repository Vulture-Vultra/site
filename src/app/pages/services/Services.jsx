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
            <div ref={textRef} className={` flex flex-col lg:flex-row justify-center items-center gap-4${isVisible ? 'drop-in' : ''}`}>

            <div className='lg:w-2/3 w-full font-manrope'>
                <div className='flex flex-col  lg:flex-row gap-4 lg:gap-4 justify-items-center'>
                  <div className='lg:w-1/2 flex flex-col gap-4'>

                    <div
                        className='w-full h-44 border rounded-2xl   backdrop-blur-md p-4 bg-white/10'
                    >
                        <span
                            className='text-[#C5A042] font-bold border border-yellow-400 text-lg h-12 w-12 rounded-full flex justify-center items-center'
                            style={{ background: 'radial-gradient(circle, #C5A042 0%, transparent 100%)' }}
                        >

                            <Image src='/service1.png' width={24} height={24} alt='hat' />
                        </span>
                        <h1 className='text-[#C5A042] font-bold text-lg '>Trading Alerts</h1>
                        <h1 className='text-white  '>Profitable spot and futures alerts with precise entries and exits.</h1>

                    </div>
                    <div
                        className='w-full h-44 border rounded-2xl   backdrop-blur-md p-4 bg-white/10'
                    >
                        <span
                            className='text-[#C5A042] font-bold border border-yellow-400 text-lg h-12 w-12 rounded-full flex justify-center items-center'
                            style={{ background: 'radial-gradient(circle, #C5A042 0%, transparent 100%)' }}
                        >

                            <Image src='/service2.png' width={24} height={24} alt='hat' />
                        </span>
                        <h1 className='text-[#C5A042] font-bold text-lg '>Market Analysis</h1>
                        <h1 className='text-white  '>Macroeconomic insights and technical chart breakdowns</h1>

                    </div>
                  </div>
                  <div className='lg:w-1/2 flex flex-col gap-4'>

                    <div
                        className='w-full h-44 border rounded-2xl   backdrop-blur-md p-4 bg-white/10'
                    >
                        <span
                            className='text-[#C5A042] font-bold border border-yellow-400 text-lg h-12 w-12 rounded-full flex justify-center items-center'
                            style={{ background: 'radial-gradient(circle, #C5A042 0%, transparent 100%)' }}
                        >

                            <Image  src='/service3.png' width={24} height={24}  alt='hat'/>
                        </span>
                        <h1 className='text-[#C5A042] font-bold text-lg '>Courses</h1>
                        <h1 className='text-white  '>Master trading and finance with expert content.</h1>

                    </div>
                    <div
                        className='w-full h-44 border rounded-2xl   backdrop-blur-md p-4 bg-white/10'
                    >
                        <span
                            className='text-[#C5A042] font-bold border border-yellow-400 text-lg h-12 w-12 rounded-full flex justify-center items-center'
                            style={{ background: 'radial-gradient(circle, #C5A042 0%, transparent 100%)' }}
                        >

                            <Image  src='/service4.png' width={24} height={24} alt='hat' />
                        </span>
                        <h1 className='text-[#C5A042] font-bold text-lg '>Automation Tools</h1>
                        <h1 className='text-white  '>Trading bots 24/7.</h1>

                    </div>
                  </div>
                </div>
            </div>
            <div className='lg:w-1/3 w-full lg:mx-auto justify-center place-content-center items-center'>
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

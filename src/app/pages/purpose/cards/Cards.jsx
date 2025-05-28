import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import CountUp from 'react-countup'

function Cards() {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

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

  return (
    <div ref={cardRef} className='flex flex-col mt-10 justify-center items-center gap-4 font-manrope'>
      <div className='flex flex-col lg:flex-row justify-center items-center gap-4'>
        <div
          className='w-full sm:w-60 xl:w-96 h-36 border rounded-2xl backdrop-blur-md p-4'
          style={{ background: 'linear-gradient(rgba(176, 241, 39, 0.4), rgba(3, 57, 49, 0.3))' }}
        >
          <span
            className='text-[#C5A042] font-bold border border-yellow-400 text-lg h-12 w-12 rounded-full flex justify-center items-center'
            style={{ background: 'radial-gradient(circle, #C5A042 0%, transparent 100%)' }}
          >
            <Image src='/hat.png' width={24} height={24} alt='hat' />
          </span>
          <h1 className='text-[#C5A042] font-bold text-lg'>
            {isVisible && <CountUp end={100} duration={5} />}+
          </h1>
          <h1 className='text-white'>Student Educated</h1>
        </div>
        <div
          className='w-full sm:w-60 xl:w-96 h-36 border rounded-2xl backdrop-blur-md p-4'
          style={{ background: 'linear-gradient( rgba(3, 57, 49, 0.3),rgba(176, 241, 39, 0.4))' }}
        >
          <span
            className='text-[#C5A042] font-bold border border-yellow-400 text-lg h-12 w-12 rounded-full flex justify-center items-center'
            style={{ background: 'radial-gradient(circle, #C5A042 0%, transparent 100%)' }}
          >
            <Image src='/heart.png' width={24} height={24} alt='heart' />
          </span>
          <h1 className='text-[#C5A042] font-bold text-lg'>
            {isVisible && <CountUp end={100} duration={5} />}+
          </h1>
          <h1 className='text-white'>Lives Improved with Healthcare</h1>
        </div>
        <div
          className='w-full sm:w-60 xl:w-96 h-36 border rounded-2xl backdrop-blur-md p-4'
          style={{ background: 'linear-gradient(rgba(176, 241, 39, 0.4), rgba(3, 57, 49, 0.3))' }}
        >
          <span
            className='text-[#C5A042] font-bold border border-yellow-400 text-lg h-12 w-12 rounded-full flex justify-center items-center'
            style={{ background: 'radial-gradient(circle, #C5A042 0%, transparent 100%)' }}
          >
            <Image src='/profit.png' width={24} height={24} alt='profit' />
          </span>
          <h1 className='text-[#C5A042] font-bold text-lg'>
            {isVisible && <CountUp end={25} duration={5} />}+
          </h1>
          <h1 className='text-white'>Youth Empowerment Programs</h1>
        </div>
      </div>
      {/* The button and its comment have been removed from here */}
    </div>
  )
}

export default Cards

'use client'
import React, { useEffect, useRef, useState } from 'react';

function Text() {
  const [isVisible, setIsVisible] = useState(false);
  const textRef = useRef(null);

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
    <div ref={textRef} className='p-6 text-left space-y-5'>
      <div className={`${isVisible ? 'drop-in' : ''}`}>
        <h1 className='text-[#C5A042] text-md font-poppins'>CHARITY MISSION</h1>
      </div>
      <div className={`${isVisible ? 'drop-in' : ''}`}>
        <h1 className='text-white text-3xl font-manrope'>Trading with a Purpose</h1>
      </div>
      <div className={`${isVisible ? 'drop-in' : ''}`}>
        <h1 className='text-white font-manrope'>
          At VULTRA, trading isn’t just about profits—it’s about making a difference. We proudly contribute a portion of our earnings to charitable causes that create lasting, positive change in communities around the world.
        </h1>
      </div>
      <div className={`${isVisible ? 'drop-in' : ''}`}>
        <h1 className='text-white font-manrope'>
          At VULTRA, trading isn’t just about profits—it’s about making a difference. We proudly contribute a portion of our earnings to charitable causes that create lasting, positive change in communities around the world.
        </h1>
      </div>

      <style jsx>{`
        .drop-in {
          animation: dropIn 3s ease-in-out;
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
  );
}

export default Text;
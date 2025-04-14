"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"

function Carousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [startX, setStartX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef(null)
  const intervalRef = useRef(null)
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

  const slides = [
    {
      id: 1,
      image: "/carousel1.png?height=600&width=800",
    },
    {
      id: 2,
      image: "/carousel2.png?height=600&width=800",
    },
    {
      id: 3,
      image: "/carousel3.png?height=600&width=800",
    },
  ]

  const handleDragStart = (e) => {
    setIsDragging(true)
    if ("touches" in e) {
      setStartX(e.touches[0].pageX)
    } else {
      setStartX(e.pageX)
    }
  }

  const handleDragMove = (e) => {
    if (!isDragging) return

    const currentX = "touches" in e ? e.touches[0].pageX : e.pageX
    const diff = startX - currentX

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setActiveIndex((prev) => (prev + 1) % slides.length)
      } else {
        setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)
      }
      setIsDragging(false)
      setStartX(currentX)
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, 3000)

    return () => {
      clearInterval(intervalRef.current)
    }
  }, [slides.length])

  return (
    <div ref={textRef} className={`h-full py-16 px-4 ${isVisible ? 'drop-in' : ''}`}>
      <div className="text-center text-white mb-16">
        <h1 className="text-4xl font-semibold font-manrope">Insights That Keep You Ahead</h1>
      </div>

      <div
        className="relative hidden lg:block max-w-7xl mx-auto overflow-hidden"
        ref={sliderRef}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(-${activeIndex * 100}%)`,
          }}
        >
          {slides.map((slide, index) => (
            <div key={slide.id} className="w-full flex-shrink-0 px-4">
              <div
                className={`
                relative rounded-3xl overflow-hidden p-8 ${slide.bgColor}
                aspect-[16/9] max-w-5xl mx-auto
                transition-transform duration-300
                ${Math.abs(activeIndex - index) <= 1 ? "scale-100" : "scale-95"}
              `}
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={slide.image || "/placeholder.svg"}
                    alt={`Dashboard ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-2 h-2 rounded-full transition-all
                ${activeIndex === index ? "bg-white w-6" : "bg-white/50 hover:bg-white/75"}`}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col space-y-4 lg:hidden">
        {slides.map((slide) => (
          <div key={slide.id} className="w-full px-1">
            <div
              className={`
              relative rounded-3xl overflow-hidden p-2 ${slide.bgColor}
              aspect-[16/9] w-full mx-auto
            `}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={slide.image || "/placeholder.svg"}
                  alt={`Dashboard ${slide.id}`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        ))}
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
      `}</style>
    </div>
  )
}

export default Carousel
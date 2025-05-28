"use client"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

export default function Banner() {
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
  const coins = [
    { id: 1, name: "Bitcoin", image: "/coin-1.png", size: 60 },
    { id: 2, name: "Bitcoin", image: "/coin6.png", size: 50 },
    { id: 3, name: "Binance", image: "/coin-2.png", size: 70 },
    { id: 4, name: "Solana", image: "/coin-4.png", size: 80 },
    { id: 5, name: "Cardano", image: "/coin-3.png", size: 100 },
    { id: 6, name: "Ripple", image: "/coin5.png", size: 45 },
  ]

  const getRandomPosition = (index) => {
    const positions = [
      "top-32 left-4",
      "top-1/4 right-8",
      "bottom-10 left-1/4",
      "top-1/2 right-44",
      "top-0 left-5",
      "top-8 right-1/3",
    ]
    return positions[index] || ""
  }

  return (
    <div ref={textRef} className={`min-h-[300px] flex items-center justify-center p-4 ${isVisible ? 'drop-in' : ''}`}>
      <div className="relative w-full max-w-4xl bg-[#C5A042] rounded-2xl py-12 px-8 overflow-hidden">
       
        <div className="absolute inset-0 overflow-hidden">
          {coins.map((coin, index) => (
            <div
              key={coin.id}
              className={`absolute ${getRandomPosition(index)}`}
              style={{
                width: `${coin.size}px`,
                height: `${coin.size}px`,
                animation: `float-coin 10s infinite ease-in-out ${index * 1.5}s`,
              }}
            >
              <div className="relative w-full h-full animate-pulse rounded-full p-1">
                <Image
                  src={coin.image || "/placeholder.svg"}
                  alt={coin.name}
                  width={coin.size}
                  height={coin.size}
                  className="object-contain w-full h-full drop-shadow-lg"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="relative z-10 text-center font-manrope">
          <h1 className="text-white text-3xl font-bold mb-8 max-w-2xl mx-auto">
            Start Your Trading Journey With VULTRA Today!
          </h1>
          <div className="flex items-center justify-center gap-4 flex-wrap">
           <a
              href="https://discord.gg/3QrBrNEa"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-60"
            >
            <button className="px-6 w-full md:w-60  py-2.5 bg-[#00362E] text-white rounded-full hover:bg-emerald-900 transition-colors">
              GET FREE ALERTS
            </button>
            </a>
             <a
              href="upgradechatlink" // Placeholder link for JOIN PREMIUM
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-60" // Apply width to anchor for proper layout
            >
            <button className="px-6 w-full md:w-60 py-2.5 bg-transparent border border-black text-[#00362E] rounded-full  transition-colors">
              JOIN PREMIUM
            </button>
            </a>
          </div>
        </div>
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
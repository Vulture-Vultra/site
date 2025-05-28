"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

export default function HomeSection() {
  const [mounted, setMounted] = useState(false)
  const textRef = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
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
    { id: 2, icon: "/coin1.png", left: "10%", top: "90%", size: 40, delay: "0.5s" },
    { id: 3, icon: "/coin3.png", left: "25%", top: "20%", size: 70, delay: "1s" },
    { id: 4, icon: "/coin2.png", left: "40%", top: "80%", size: 45, delay: "1.5s" },
    { id: 5, icon: "/coin4.png", left: "55%", top: "20%", size: 45, delay: "2s" },
    { id: 6, icon: "/coin1.png", left: "70%", top: "60%", size: 80, delay: "2.5s" },
  ]

  return (
    <div className="relative h-auto overflow-hidden font-manrope">
      <div ref={textRef} className="relative mx-auto max-w-7xl px-4 pt-20 text-center sm:px-6 md:pt-32">
        <h1 className={`mx-auto max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-6xl ${isVisible ? 'drop-in' : ''}`}>
          Master The Markets With{" "}
          <span className="bg-gradient-to-r from-teal-200 to-teal-400 bg-clip-text text-transparent">VULTRA!</span>
        </h1>

        <p className={`mx-auto mt-6 max-w-2xl text-lg leading-8  text-white/80 ${isVisible ? 'drop-in' : ''}`}>
          Profitable trading alerts, expert insights, and financial education all in one place
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="https://discord.gg/3QrBrNEa"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-full bg-[#C5A042] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-yellow-400 md:w-60"
          >
            GET FREE ALERT NOW
          </a>
          <a
            href="#"
            className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 md:w-60"
          >
            EXPLORE PREMIUM PLANS
          </a>
        </div>
      </div>

      <div className="relative mt-20 flex justify-center mx-auto max-w-7xl">
        <div className="absolute inset-0">
          <div className="relative h-full w-full">
            {mounted &&
              coins.map((coin) => (
                <div
                  key={coin.id}
                  className="coin-float absolute"
                  style={{
                    left: coin.left,
                    top: coin.top,
                    animation: `float 3s infinite ease-in-out, blink 2s infinite ease-in-out`,
                    animationDelay: coin.delay,
                  }}
                >
                  <div
                    className="rounded-full p-2"
                    style={{ width: `${coin.size * 2}px`, height: `${coin.size * 2}px` }}
                  >
                    <Image
                      src={coin.icon || "/placeholder.svg"}
                      alt="Crypto coin"
                      width={coin.size}
                      height={coin.size}
                      className="h-1/3 w-1/3 md:w-full md:h-full object-contain"
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
        <Image src="/grouping.png" width={1200} height={400} alt="Crypto grid background" className="relative z-10" />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(5deg);
          }
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        .coin-float {
          transform-origin: center;
          will-change: transform;
        }

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
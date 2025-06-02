"use client"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

function About() {
  const textRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )
    if (textRef.current) observer.observe(textRef.current)
    return () => {
      if (textRef.current) observer.unobserve(textRef.current)
    }
  }, [])

  return (
    <div ref={textRef} className={`${isVisible ? "drop-in" : ""}`}>
      <div className="flex flex-col md:flex-row items-start bg-gradient-to-b rounded-2xl from-white/10 to-transparent h-[440px]">
        <div className="md:w-1/2 w-full h-full">
          <div className="h-full pt-5 pb-5 px-6">
            <h1 className="text-[#C5A042] text-md font-poppins mb-2">
              About us
            </h1>
            <p className="text-white font-manrope text-justify leading-snug mb-2">
              At Vultra, we believe that everyone deserves the opportunity to enhance their financial well-being. Our core mission is to empower individuals by providing them with the knowledge and tools to explore trading as a viable additional income stream. We understand that for many, this journey isn’t about replacing a full-time job overnight, but about creating breathing room, generating extra disposable income, and gaining more financial flexibility.
            </p>
            <p className="text-white font-manrope text-justify leading-snug">
              Our commitment extends beyond the trading charts. We are deeply passionate about giving back to the global community. A portion of our proceeds and efforts are dedicated to philanthropic activities. We have proudly organized and participated in charitable trips to regions like Vietnam and Nigeria, delivering essential supplies such as food, clothing, and medical aid to those in need. We believe that true success includes lifting others, and we strive to make a positive impact both in the financial lives of our members and in communities around the world. Join us, and be part of a community that learns, earns, and gives back.
            </p>
          </div>
        </div>

        <div className="md:w-1/2 w-full h-full">
         
          <div className="flex justify-center rounded-2xl bg-white/10 p-5 h-full">
            <div className="relative">
              <Image
                src="/about.png"
                width={400}
                height={400}
                alt="VULTRA network"
                className="network-image"
              />
              <div
                className="profile-dot top-0 left-1/2 -translate-x-1/2 blink-animation"
                style={{ animationDelay: "0s" }}
              >
                <Image src="/img1.png" fill alt="img1" />
              </div>
              <div
                className="profile-dot top-1/4 right-0 blink-animation"
                style={{ animationDelay: "0.5s" }}
              >
                <Image src="/img2.png" fill alt="img2" />
              </div>
              <div
                className="profile-dot bottom-1/4 right-0 blink-animation"
                style={{ animationDelay: "1s" }}
              >
                <Image src="/img3.png" fill alt="img3" />
              </div>
              <div
                className="profile-dot bottom-0 left-1/2 -translate-x-1/2 blink-animation"
                style={{ animationDelay: "1.5s" }}
              >
                <Image src="/img4.png" fill alt="img4" />
              </div>
              <div
                className="profile-dot bottom-1/4 left-0 blink-animation"
                style={{ animationDelay: "2s" }}
              >
                <Image src="/img5.png" fill alt="img5" />
              </div>
              <div
                className="profile-dot top-1/4 left-0 blink-animation"
                style={{ animationDelay: "2.5s" }}
              >
                <Image src="/img6.png" fill alt="img6" />
              </div>
              <div
                className="profile-dot top-[15%] left-[15%] blink-animation"
                style={{ animationDelay: "3s" }}
              >
                <Image src="/img7.png" fill alt="img7" />
              </div>
            </div>
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
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .profile-dot {
          position: absolute;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.7);
          box-shadow: 0 0 10px 2px rgba(197, 160, 66, 0.7);
          z-index: 10;
        }
        .blink-animation {
          animation: blinking 3s infinite;
        }
        @keyframes blinking {
          0%, 100% {
            opacity: 0.2;
            box-shadow: 0 0 5px 1px rgba(197, 160, 66, 0.3);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 15px 3px rgba(197, 160, 66, 0.9);
          }
        }
      `}</style>
    </div>
  )
}

export default About

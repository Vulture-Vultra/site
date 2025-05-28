"use client"
import Image from "next/image"
import { useState, useRef, useEffect, useCallback } from "react"

// Slides data with background colors
const slidesData = [
  {
    id: "telegrams_slide",
    slideClasses: "bg-[#1A4A43]/50 border border-white/50", 
    paddingClasses: "p-3 md:p-4", // Default padding
    images: [
      { id: "telegram1", src: "/testimonials/Telegram1.png", alt: "Telegram Showcase 1 - Vultra Trading" },
      { id: "telegram2", src: "/testimonials/Telegram2.png", alt: "Telegram Showcase 2 - Vultra Trading" },
    ],
  },
  {
    id: "discord_slide",
    slideClasses: "bg-[#1A4A43]/50 border border-white/50", 
    paddingClasses: "px-3 md:px-4 py-1", // Reduced vertical padding
    image: { id: "discord", src: "/testimonials/Discord.png", alt: "Discord Community - Vultra Trading" },
    isSpecialDiscordSlide: true, 
  },
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const autoSlideIntervalRef = useRef(null);
  const slideDuration = 2000; // 2 seconds for auto-slide

  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  
  // For fade-in animation
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update our state when observer callback fires
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          // Set to false when out of view to re-trigger animation on next scroll-in
          setIsVisible(false); 
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);


  const nextSlide = useCallback(() => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % slidesData.length);
  }, []);

  // Auto-slide effect
  useEffect(() => {
    const startAutoSlide = () => {
      clearInterval(autoSlideIntervalRef.current);
      autoSlideIntervalRef.current = setInterval(nextSlide, slideDuration);
    };
    startAutoSlide();
    return () => clearInterval(autoSlideIntervalRef.current);
  }, [nextSlide, slideDuration]);

  // Reset auto-slide on user interaction
  const resetAutoSlide = useCallback(() => {
    clearInterval(autoSlideIntervalRef.current);
    autoSlideIntervalRef.current = setInterval(nextSlide, slideDuration);
  }, [nextSlide, slideDuration]);

  // Update container width on resize and activeIndex change for translation
  useEffect(() => {
    const calculateAndSetTranslate = () => {
      if (containerRef.current) {
        const newContainerWidth = containerRef.current.offsetWidth;
        setContainerWidth(newContainerWidth);
        const newTranslate = -activeIndex * newContainerWidth;
        setCurrentTranslate(newTranslate);
        if (sliderRef.current) {
          sliderRef.current.style.transition = isDragging ? 'none' : 'transform 0.3s ease-out';
          sliderRef.current.style.transform = `translateX(${newTranslate}px)`;
        }
      }
    };

    calculateAndSetTranslate();

    window.addEventListener('resize', calculateAndSetTranslate);
    return () => window.removeEventListener('resize', calculateAndSetTranslate);
  }, [activeIndex, isDragging]);


  const handleDragStart = (e) => {
    resetAutoSlide();
    setIsDragging(true);
    setStartX((e.touches ? e.touches[0].clientX : e.clientX) - currentTranslate);
    if (sliderRef.current) {
      sliderRef.current.style.transition = 'none';
    }
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const newTranslate = x - startX;
    if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(${newTranslate}px)`;
    }
  };

  const handleDragEnd = (e) => {
    if (!isDragging) return;
    setIsDragging(false);

    if (containerWidth === 0) return;

    let finalTranslate = currentTranslate;
    if (sliderRef.current && sliderRef.current.style.transform) {
        const transformValue = sliderRef.current.style.transform.match(/translateX\(([^px]+)px\)/);
        if (transformValue && transformValue[1]) {
            finalTranslate = parseFloat(transformValue[1]);
        }
    }

    const threshold = containerWidth * 0.2;
    const movedBy = finalTranslate - (-activeIndex * containerWidth);

    let newIndex = activeIndex;
    if (movedBy < -threshold && activeIndex < slidesData.length - 1) {
      newIndex = activeIndex + 1;
    } else if (movedBy > threshold && activeIndex > 0) {
      newIndex = activeIndex - 1;
    }
    
    setActiveIndex(newIndex);
    resetAutoSlide();
  };


  return (
    <section 
      ref={sectionRef} 
      className={`py-16 text-white ${isVisible ? 'animate-on-scroll' : 'opacity-0'}`} 
      id="testimonials"
    >
      <div className="container mx-auto px-4">
        <div className="mb-10 md:mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            What Our Clients Say
          </h2>
          <p className="text-base md:text-lg text-gray-300 mt-2">
            Trusted by thousands of satisfied customers
          </p>
        </div>

        <div
          ref={containerRef}
          className="relative w-full overflow-hidden cursor-grab select-none rounded-xl"
          onTouchStart={handleDragStart}
          onMouseDown={handleDragStart}
          onTouchMove={handleDragMove}
          onMouseMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <div
            ref={sliderRef}
            className="flex"
            style={{
              width: `${slidesData.length * 100}%`,
              transform: `translateX(${currentTranslate}px)`,
            }}
          >
            {slidesData.map((slide, slideIndex) => {
              // Set minHeight to 'auto' for all slides to allow content to define height + padding
              const slideMinHeight = 'auto'; 
              
              return (
                <div
                  key={slide.id}
                  style={{ 
                    width: `${100 / slidesData.length}%`, 
                    minHeight: slideMinHeight 
                  }} 
                  className={`relative flex-shrink-0 h-auto flex items-center justify-center rounded-xl ${slide.slideClasses} ${slide.paddingClasses}`} 
                >
                  {slide.images ? ( // Render for the dual image slide (Telegram)
                    <div className="flex flex-row items-center justify-center w-full gap-2 md:gap-3"> 
                      {slide.images.map((img) => (
                        <div key={img.id} className="relative w-1/2 aspect-square rounded-md overflow-hidden shadow-lg">
                          <Image
                            src={img.src}
                            alt={img.alt}
                            layout="fill"
                            objectFit="cover"
                            priority={slideIndex === activeIndex}
                            draggable="false"
                            style={{ objectPosition: 'left center' }}
                          />
                        </div>
                      ))}
                    </div>
                  ) : ( // Render for the single image slide (Discord)
                      // The Image component is now a direct flex child of the slide container
                      <Image
                        src={slide.image.src}
                        alt={slide.image.alt}
                        layout="responsive" 
                        width={1200} 
                        height={600} 
                        objectFit="contain" 
                        priority={slideIndex === activeIndex}
                        draggable="false"
                        className="rounded-md" 
                      />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center mt-8 space-x-2.5">
          {slidesData.map((_, index) => (
            <button
              key={`dot-${index}`}
              onClick={() => {
                setActiveIndex(index);
                resetAutoSlide();
              }}
              className={`h-3 rounded-full transition-all duration-300 ease-out
                ${activeIndex === index ? 'w-7 bg-white' : 'w-3 bg-gray-500 hover:bg-gray-400'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      <style jsx>{`
        .animate-on-scroll {
          animation: fadeInSmooth 1.5s ease-in-out forwards;
        }

        @keyframes fadeInSmooth {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        // Ensure initially hidden if not visible to prevent flash of unstyled content
        // This is handled by setting opacity-0 on the section tag when isVisible is false
      `}</style>
    </section>
  );
}

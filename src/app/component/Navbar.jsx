"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; // <--- IMPORT Link from Next.js
import { motion, AnimatePresence } from "framer-motion";
import { TwitterIcon as TikTok, MessageCircle, Send, Twitter, Github } from "lucide-react";

export default function Navbar({ transparent }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navClass = transparent && !isScrolled ? "bg-transparent top-4" : "bg-[#00362E] top-0 py-2";
  const navbg = transparent && !isScrolled ? "bg-white/10 p-6" : "p-2";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (e, targetId) => {
    // This function is for same-page scrolling.
    // For Next.js Link components, direct navigation will happen.
    // We might not need to call this for the PnL Simulator link if it's a Next.js Link.
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false); // Close mobile menu on click
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const menuVariants = {
    closed: { opacity: 0, x: "-100%" },
    open: { opacity: 1, x: 0 },
  };

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: MessageCircle, href: "#", label: "Discord" },
    { icon: Send, href: "#", label: "Telegram" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  const navItems = ["home", "about", "services", "testimonials", "blogs"]; // Keep your existing items

  return (
    <nav className={`sticky z-50 w-full font-poppins transition-all duration-300 ${navClass}`}>
      <div className="mx-auto flex lg:h-14 h-8 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div>
          <Link href="/"> {/* Make logo a link to home */}
            <Image src="/logo2.png" width={200} height={100} alt="Logo" priority /> {/* Added priority for LCP */}
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className={`hidden items-center gap-5 lg:gap-12 md:flex backdrop-blur-md rounded-full ${navbg}`}>
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item}`} // These are for on-page scrolling
              className="text-sm font-medium text-white transition-colors hover:text-white/80 hover:font-bold"
              onClick={(e) => handleLinkClick(e, item)}
            >
              {item.toUpperCase()}
            </a>
          ))}
          {/* ADD PnL Simulator Link for Desktop */}
          <Link
            href="/pnl-simulator"
            className="text-sm font-medium text-white transition-colors hover:text-white/80 hover:font-bold"
            onClick={() => setIsMenuOpen(false)} // Close mobile menu if open (though this is desktop)
          >
            PNL SIMULATOR
          </Link>
        </div>
        <div>
          {/* Contact Us Button (commented out in your original) */}
        </div>

        {/* Mobile Menu Burger Icon */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-[#156662]/50 md:hidden"
          aria-label="Toggle menu"
        >
          <svg /* ... SVG code ... */ >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"}
            />
          </svg>
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              transition={{ duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#00362E] px-4 py-6 md:hidden shadow-lg" // Added shadow
              style={{ paddingTop: '4rem' }} // Add padding to avoid overlap with potential fixed header elements
            >
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <a
                    key={item}
                    href={`#${item}`}
                    className="text-lg font-medium text-white transition-colors hover:text-[#C5A042]" // Example hover color
                    onClick={(e) => handleLinkClick(e, item)}
                  >
                    {item.toUpperCase()}
                  </a>
                ))}
                {/* ADD PnL Simulator Link for Mobile */}
                <Link
                  href="/pnl-simulator"
                  className="text-lg font-medium text-white transition-colors hover:text-[#C5A042]" // Example hover color
                  onClick={() => setIsMenuOpen(false)} // Close menu on click
                >
                  PNL SIMULATOR
                </Link>
                {/* Contact Us Button (commented out in your original) */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contact Modal (remains the same) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* ... modal content ... */}
        </div>
      )}
    </nav>
  );
}
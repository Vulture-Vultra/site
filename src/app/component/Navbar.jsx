// src/app/component/Navbar.jsx
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; // Import Next.js Link
import { usePathname } from "next/navigation"; // Import usePathname
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Menu as MenuIcon, X as XIcon } from "lucide-react";

export default function Navbar({ transparent }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname(); // Get current pathname

  const navContainerBaseClass = "sticky z-50 w-full font-poppins transition-all duration-300";
  const navContainerScrolledClass = "bg-[#00362E] top-0 py-2 shadow-md";
  const navContainerTransparentClass = "bg-transparent top-0 md:top-4 py-2";

  const innerNavBgBaseClass = "backdrop-blur-md rounded-full";
  const innerNavBgScrolledClass = "p-2";
  const innerNavBgTransparentClass = "bg-white/10 p-4 md:p-6";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Updated click handler for main navigation links
  const handleMainNavLinkClick = (e, itemId) => {
    setIsMenuOpen(false);
    // If we are on the landing page, prevent default and scroll smoothly
    if (pathname === "/") {
      e.preventDefault();
      if (itemId === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const targetElement = document.getElementById(itemId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
    // If on a different page, Next.js <Link> will handle navigation to /#itemId
    // and the browser will attempt to scroll to the hash.
  };
  
  // Click handler for links that are definite page routes (like Simulator)
  const handleRouteLinkClick = () => {
    setIsMenuOpen(false);
    // Next.js Link component will handle the navigation
  };

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const menuVariants = {
    closed: { opacity: 0, x: "-100%" },
    open: { opacity: 1, x: 0 },
  };

  const mainNavItems = ["home", "about", "services", "testimonials", "blogs"];

  return (
    <nav className={`${navContainerBaseClass} ${transparent && !isScrolled && pathname === '/' ? navContainerTransparentClass : navContainerScrolledClass}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 h-16 md:h-20">
        
        <div className="flex-shrink-0">
          <Link href="/">
            <Image src="/logo2.png" width={180} height={45} alt="Vultra Logo" priority />
          </Link>
        </div>

        <div className={`hidden md:flex items-center gap-4 lg:gap-8 ${innerNavBgBaseClass} ${transparent && !isScrolled && pathname === '/' ? innerNavBgTransparentClass : innerNavBgScrolledClass}`}>
          {mainNavItems.map((item) => {
            // Construct href: if on landing page, use #id, otherwise use /#id
            const linkHref = pathname === "/" 
              ? (item === "home" ? "/" : `#${item}`) 
              : (item === "home" ? "/" : `/#${item}`);
            return (
              <Link
                key={item}
                href={linkHref}
                className="text-xs lg:text-sm font-medium text-white transition-colors hover:text-emerald-300 px-2 lg:px-3"
                onClick={(e) => handleMainNavLinkClick(e, item)}
              >
                {item.toUpperCase()}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:flex flex-shrink-0">
          <Link
            href="/pnl-simulator"
            className={`flex items-center gap-2 rounded-full border border-white/30 px-3 py-2 lg:px-5 lg:py-2.5 text-xs lg:text-sm font-semibold text-white transition-all hover:bg-emerald-500/90 hover:border-emerald-500 ${transparent && !isScrolled && pathname === '/' ? "bg-white/10 hover:bg-emerald-500/30" : "bg-[#004A3F] hover:bg-emerald-600"}`}
            onClick={handleRouteLinkClick} // Just closes menu, Link handles navigation
          >
            <BarChart3 size={16} className="lg:size-5"/>
            <span>SIMULATOR</span>
          </Link>
        </div>
       
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-[#156662]/50"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-0 h-screen bg-[#002a24]/95 backdrop-blur-md md:hidden px-6 py-8 z-40"
              style={{ top: '0', left: '0' }}
            >
              <div className="flex justify-between items-center mb-10">
                 <Link href="/" onClick={() => setIsMenuOpen(false)}>
                    <Image src="/logo2.png" width={150} height={37} alt="Vultra Logo" />
                 </Link>
                <button onClick={() => setIsMenuOpen(false)} className="text-white">
                  <XIcon size={28} />
                </button>
              </div>
              <div className="flex flex-col items-center space-y-6 mt-10">
                {mainNavItems.map((item) => {
                  const linkHref = pathname === "/" 
                    ? (item === "home" ? "/" : `#${item}`) 
                    : (item === "home" ? "/" : `/#${item}`);
                  return (
                    <Link
                      key={item}
                      href={linkHref}
                      className="text-xl font-medium text-gray-200 transition-colors hover:text-emerald-300 py-2"
                      onClick={(e) => handleMainNavLinkClick(e, item)}
                    >
                      {item.toUpperCase()}
                    </Link>
                  );
                })}
                <hr className="w-3/4 border-gray-700 my-4"/>
                <Link
                  href="/pnl-simulator"
                  className="flex items-center gap-2 text-xl font-medium text-gray-200 transition-colors hover:text-emerald-300 py-2"
                  onClick={handleRouteLinkClick} // Just closes menu, Link handles navigation
                >
                  <BarChart3 size={22} />
                  SIMULATOR
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-[#00362E] p-8 rounded-lg max-w-sm w-full text-center text-white shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
            <p className="mb-4 text-lg">Email: info.social@vultra.co</p>
            <button
              className="mt-4 bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors text-lg"
              onClick={toggleModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

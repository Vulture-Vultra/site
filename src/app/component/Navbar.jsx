"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
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
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
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

  return (
    <nav className={`sticky z-50 w-full font-poppins transition-all duration-300 ${navClass}`}>
      <div className="mx-auto flex lg:h-14 h-8 max-w-7xl items-center justify-between px-4 sm:px-6">
       
        <div>
          <Image src="/logo2.png" width={200} height={100} alt="Logo" />
        </div>

        <div className={`hidden items-center gap-5 lg:gap-12 md:flex backdrop-blur-md rounded-full ${navbg}`}>
          {["home", "about", "services", "testimonials", "blogs"].map((item) => (
            <a
              key={item}
              href={`#${item}`}
              className="text-sm font-medium text-white transition-colors hover:text-white/80 hover:font-bold"
              onClick={(e) => handleLinkClick(e, item)}
            >
              {item.toUpperCase()}
            </a>
          ))}
        </div>
        <div>
          <button
            className={`rounded-full hidden md:flex hover:bg-white/20 border-white/20 lg:px-10 px-2 text-sm font-medium text-white transition-colors hover:font-bold ${navbg}`}
            onClick={toggleModal}
          >
            CONTACT US
          </button>
        </div>

       
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-[#156662]/50 md:hidden"
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"}
            />
          </svg>
        </button>

       
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              transition={{ duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#00362E] px-4 py-6 md:hidden shadow-lg"
            >
              <div className="flex flex-col space-y-4 mt-16">
                {["home", "about", "services", "testimonials", "blogs"].map((item) => (
                  <a
                    key={item}
                    href={`#${item}`}
                    className="text-lg font-medium text-white transition-colors hover:text-[#156662]"
                    onClick={(e) => handleLinkClick(e, item)}
                  >
                    {item.toUpperCase()}
                  </a>
                ))}
                <button
                  className="inline-block rounded-full bg-[#156662] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#156662]/90 hover:font-bold"
                  onClick={toggleModal}
                >
                  CONTACT US
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#00362E] p-6 rounded-lg max-w-sm w-full text-center text-white">
            <h2 className="text-xl font-bold mb-4">Contact Information</h2>
            <p className="mb-2 ">Email: info.social@vultra.co</p>
            <div className="flex gap-3 mb-4 justify-center items-center">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 bg-white/10 border text-white rounded-2xl flex items-center justify-center hover:bg-gray-300 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
            <button
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
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
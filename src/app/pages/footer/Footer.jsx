import Link from "next/link";
import {
  TwitterIcon as TikTok,
  MessageCircle,
  Send,
  Twitter,
  Github,
} from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Footer() {
  const navItems = [
    { name: "HOME", href: "#home" },
    { name: "ABOUT US", href: "#about" },
    { name: "SERVICES", href: "#services" },
    { name: "TESTIMONIALS", href: "#testimonials" },
    { name: "BLOGS", href: "#blogs" },
    
  ];

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: MessageCircle, href: "#", label: "Discord" },
    { icon: Send, href: "#", label: "Telegram" },
    { icon: Twitter, href: "#", label: "Twitter" },
  ];

  const handleLinkClick = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <footer className="text-white pt-12 pb-6 px-4">
      <div className="max-w-6xl mx-auto">
     
        <div className="flex justify-center ">
          <Image src="/logo2.png" width={200} height={100} alt="Logo" />
        </div>

     
        <nav className="flex justify-center flex-wrap gap-x-8 lg:gap-x-28 gap-y-2 mb-8 font-poppins">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm hover:text-emerald-400 transition-colors"
              onClick={(e) => handleLinkClick(e, item.href.substring(1))}
            >
              {item.name}
            </a>
          ))}
        </nav>

        <div className="flex flex-col justify-center items-center  gap-4 mb-8">
          <div className="text-sm text-gray-300 font-poppins">
             info.social@vultra.co
          </div>
          <div className="flex gap-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-7 h-7 bg-white/10 border rounded-2xl flex items-center justify-center hover:bg-emerald-800/50 transition-colors"
                  aria-label={social.label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#00362E] p-6 rounded-lg max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              <p className="mb-2">Email: info.social@vultra.co</p>
              <div className="flex gap-3 mb-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      className="w-10 h-10 bg-white/10 border rounded-2xl flex items-center justify-center hover:bg-gray-300 transition-colors"
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

        <div className="text-center text-sm text-gray-400 mb-8 font-poppins">
          COPYRIGHT ALL RIGHTS RESERVED
        </div>

     
        <div className="text-xs text-gray-400 space-y-4">
          <h3 className="font-semibold mb-2 font-poppins">Disclaimer</h3>
          <div className={`font-manrope ${isExpanded ? "expanded" : "collapsed"}`}>
            <p>
              This information is provided by VULTRA LLC, including but not
              limited to text, graphics, links, resources, and other material,
              is for informational and educational purposes only. The content
              shared here, including any crypto alerts, should not be
              interpreted as financial, investment, tax, or legal advice. VULTRA
              LLC is not a registered financial advisor, and no information on
              this server constitutes a recommendation or endorsement of any
              investment strategy or investment type.
            </p>
            {isExpanded && (
              <>
                <p>
                  All alerts, analysis, news, and content shared in this server
                  are purely for educational purposes, based on personal
                  opinions, and should not be perceived as financial advice or a
                  call to action for making any financial decision. Users are
                  strongly encouraged to perform their own research, consult
                  with a licensed professional, and evaluate their own financial
                  situation before making any investment decisions.
                </p>
                <p>
                  Cryptocurrency investments carry significant risks, and the
                  value of digital assets can fluctuate greatly. There is a
                  possibility of losing some or all of your investment. Past
                  performance is not indicative of future results, and VULTRA
                  LLC does not guarantee any specific outcomes from following
                  the alerts or strategies discussed on this server.
                </p>
                <p>
                  By accessing and utilizing VULTRA LLC's materials, content, or
                  resources, you agree to all terms and conditions outlined in
                  this disclaimer and any additional terms provided on our
                  platform. All materials and content are protected intellectual
                  property of VULTRA LLC. Unauthorized reproduction,
                  redistribution, or use of these materials is strictly
                  prohibited.
                </p>
                <p>
                  All sales are final, and clients who benefit from any
                  products, services, or subscriptions purchased through VULTRA
                  LLC have no claims or recourse for a subscription refund sent
                  a cancellation notice to VULTRA LLC. Upon cancellation, you
                  will retain access to the services and products until the
                  renewal date unless otherwise specified. VULTRA LLC reserves
                  the right to refuse service to anyone at its sole discretion
                  and may cancel access to services or resources at any time for
                  any reason.
                </p>
                <p>
                  VULTRA LLC accepts no responsibility or liability for any
                  losses or damages incurred, directly or indirectly, from
                  reliance on the information provided in this server. All users
                  are solely responsible for their own investment decisions and
                  should use the information provided at their own risk.
                </p>
                <p>
                  This server may contain links to third-party websites or
                  resources. VULTRA LLC does not endorse or assume any
                  responsibility for the content, accuracy, or reliability of
                  these external resources.
                </p>
              </>
            )}
          </div>
          <button
            className="text-emerald-400 hover:text-emerald-600 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Read Less" : "Read More"}
          </button>
        </div>
      </div>
    </footer>
  );
}
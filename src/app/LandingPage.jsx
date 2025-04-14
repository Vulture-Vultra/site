'use client';
import React, { useEffect, useState } from 'react';
import Navbar from './component/Navbar';
import HomeSection from './pages/HomeSection';
import Performance from './pages/performance/Performance';
import Purpose from './pages/purpose/Purpose';
import Testimonials from './pages/testimonials/Testmonials';
import Services from './pages/services/Services';
import Carousel from './pages/carousel/Carousel';
import About from './pages/about/About';
import Banner from './pages/banner/Banner';
import Footer from './pages/footer/Footer';


function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > window.innerHeight * 1.5) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Pre-fetch the image
  useEffect(() => {
    const img = new Image();
    img.src = '/HomeBg.png'; // Replace with the actual path to your image
  }, []);

  return (
    <div>
      <div style={{ background: 'linear-gradient(to bottom right, #00362E 70%, #03B085 100%)' }} id="home">
        <div className="bg-custom-image bg-cover bg-center pt-8">
          <Navbar transparent />
          <HomeSection />
        </div>
      </div>
      {isScrolled && <Navbar />}
      <div className='bg-custom-gradient md:px-10 '>

      <div className=" p-6 max-w-7xl mx-auto" id="performance">
        <Performance />
      </div>
      <div className=" p-6 max-w-7xl mx-auto" id="purpose">
        <Purpose />
      </div>
      </div>
      <div
        className=" bg-custom-gradient "
        style={{ background: 'linear-gradient(to bottom right, #00362E 70%,  100%)' }}
        id="testimonials"
      >
        <Testimonials />
      </div>
      <div className='bg-custom-gradient md:px-10 '>
      <div className=" p-6 max-w-7xl mx-auto" id="services">
        <Services />
      </div>
      <div className=" p-6 max-w-7xl mx-auto" id="carousel">
        <Carousel />
      </div>

      <div className=" p-6 max-w-7xl mx-auto" id="about">
        <About />
      </div>
      <div className=" p-6 max-w-7xl mx-auto" id="banner">
        <Banner />
      </div>
      <div className=" p-6 max-w-7xl mx-auto" id="footer">
        <Footer />
      </div>
      </div>
      
    </div>
  );
}

export default LandingPage;
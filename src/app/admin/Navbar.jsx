import React, { useState } from 'react';
import { FaTh, FaFunnelDollar, FaCog, FaBell, FaFilter, FaSignOutAlt } from 'react-icons/fa';
// import logo2 from '../../assets/logo2.png'
// import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Image from 'next/image';

function Navbar({ onLogout }) {
//   const navigate = useNavigate(); // Initialize useNavigate

  const handleLogout = () => {
    onLogout();
    // navigate("/login");
  };

  return (
    <div className="text-white p-4 flex justify-between items-center w-full">
      <div className=" flex h-16 items-center space-x-4">
        {/* Logo and Company Title */}
        <div className="flex items-center ">
          {/* <img className="w-10 h-10" src={logo} alt="Logo" /> */}
          <Image src="/logo2.png" width={200} height={100} alt='logo' className="text-xl hidden md:block font-bold text-white"/>
        </div>

        {/* Breadcrumbs */}
        {/* <nav className="ml-20 text-sm text-gray-600 flex items-center">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center text-lg font-bold">
              <CiFolderOn className="mr-1" />   
              {crumb}
              {index < breadcrumbs.length - 1 && ' / '}
            </span>
          ))}
        </nav> */}
      </div>
      <div className="flex items-center space-x-4 gap-2 cursor-pointer"  onClick={handleLogout} >
        <FaSignOutAlt 
          size={24} 
        />
        Logout
      </div>
    </div>
  );
}

export default Navbar;
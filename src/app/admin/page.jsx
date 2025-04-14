"use client";
import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import Navbar from "./Navbar";
import SimpleApiTable from "./TableData";
import Login from "./Login";
//import { useRouter } from "next/router";

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
 // const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated by looking for a token in local storage
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
        <div className="min-h-screen max-h-full flex flex-col bg-[#00362E]">

          <Navbar onLogout={handleLogout} />
          < SimpleApiTable/>
        </div>
        </>
      ) : (
        <>
          <Login onLogin={handleLogin} />
        </>
      )}
      <ToastContainer />
    </div>
  );
}

export default AdminPage;
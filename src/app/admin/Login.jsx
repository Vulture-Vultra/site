import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import constant from "../../constant.js";
import { ClipLoader } from "react-spinners";

function Login({ onLogin }) {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post(`/api/auth/login`, {
        email,
        password,
      });

      if (response.status === 200 || response.status === 201) {
        const userRole = response.data.userRole;
        const token = response.data.token;

        localStorage.setItem("userId", response.data.user._id);
        localStorage.setItem("token", token);
        setLoading(false);
        toast.success("Login successful");
        onLogin(); // Call onLogin function
        // navigate("/"); // Navigate to home screen
      } else {
        setLoading(false);
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.log(error);
      
      setLoading(false);
      toast.error(
        error.response?.data?.message || "An error occurred during login"
      );
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#03B085]">
      <div>
        <h1 className="mb-7 text-2xl font-bold">Admin Login</h1>
      </div>
      <div className="w-full max-w-sm p-6 bg-[#2d635e] rounded-lg shadow-md">
        <div className="flex flex-col items-center mb-6">
          {/* <img src="logo-url" alt="Company Logo" className="w-24 h-24 mb-2" /> */}
          <h1 className="text-2xl text-white font-bold">Vultra Trading</h1>
        </div>
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label
              className="block text-white text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="w-full p-2 text-gray-700 bg-gray-200 rounded focus:outline-none focus:bg-white"
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-white text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="w-full p-2 text-gray-700 bg-gray-200 rounded focus:outline-none focus:bg-white"
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-[#03B085] hover:bg-[#57a08e] text-white w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              {loading ? (
        <div className="flex justify-center items-center mt-1">
          <ClipLoader
            size={20}
            color="white"
            loading={loading}
          />
        </div>
      ):(

          "Sign In"
      )}
              
            </button>
          </div>
          {/* <div className="mt-4 text-center">
            <a className="text-white mt-2 text-center cursor-pointer">
              Create an account
            </a>
          </div> */}
        </form>
      </div>
    </div>
  );
}

export default Login;
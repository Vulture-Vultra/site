import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners"; // Import the loader component
import * as XLSX from "xlsx";

function Performance({ refreshTableData }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false); // State to manage loading

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    console.log(event.target.files[0]);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file); // Attach the file to the form data

      setLoading(true);
      const response = await axios.post(
        `/api/excel/postFile`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        setLoading(false);
        toast.success("File uploaded successfully");
        // Call the refreshTableData function to reload the table data
        refreshTableData();
      } else {
        setLoading(false);
        toast.error(response.data.message || "Failed to upload file");
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        error.response?.data?.message || "An error occurred during file upload"
      );
    }
  };

  return (
    <div className="p-6 bg-white/10 w-full lg:w-2/3 mt-2 rounded-2xl text-center">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white">Upload Excel</h2>
      </div>
      <div className="mb-4">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="p-2 cursor-pointer border border-gray-300 rounded-md bg-white shadow-sm w-60 lg:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out transform hover:scale-105"
        />
      </div>
      <div className="mb-4">
        <button
          onClick={handleUpload}
          className="bg-[#C5A042] w-1/4 text-white p-2 rounded shadow cursor-pointer"
          disabled={loading} // Disable the button while loading
        >
          {loading ? (
            <div className="flex justify-center items-center mt-1">
              <ClipLoader
                size={20}
                color="white"
                loading={loading}
              />
            </div>
          ) : (
            "Upload"
          )}
        </button>
      </div>
    </div>
  );
}

export default Performance;
import React, { useEffect, useState } from 'react';
import constant from './constant.js';
import Performance from './Performance.jsx';
import { toast } from 'react-toastify';

const SimpleApiTable = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  const fetchData = () => {
    setLoading(true);
    fetch(`/api/excel/getFilesWithIds`)
      .then(response => response.json())
      .then(fetchedData => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this file's data?");
    if (!isConfirmed) return;
  
    setLoading(true);
    try {
      const response = await fetch(`/api/excel/deleteFile/${id}`, {
        method: "DELETE",
      });
  
      const result = await response.json();
      if (response.ok) {
        setData(prevData => prevData.filter(file => file.id !== id));
        toast.success("File deleted successfully!");
      } else {
        console.error("Error deleting file:", result.error);
        toast.error(result.error || "Error deleting file");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while deleting the file.");
    } finally {
      setLoading(false);
    }
  };
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-10">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="spinner"></div>
        </div>
      )}

      {/* Add the Performance component and pass the refreshTableData function */}
      <div className='flex justify-center items-center mb-4'>

      <Performance refreshTableData={fetchData} />
      </div>

      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-sm text-gray-700 uppercase bg-gray-200 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">Sheet Name</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((file) => (
                <tr key={file.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4">{file.sheetName}</td>
                  <td className="px-6 py-4">{new Date(file.date).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center">No data found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-4 py-2 bg-[#C5A042] text-white rounded disabled:opacity-50 cursor-pointer"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="text-white">Page {currentPage} of {totalPages}</span>
        <button
          className="px-4 py-2 bg-[#C5A042] text-white rounded disabled:opacity-50 cursor-pointer"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
      <style jsx>{`
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #09f;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default SimpleApiTable;
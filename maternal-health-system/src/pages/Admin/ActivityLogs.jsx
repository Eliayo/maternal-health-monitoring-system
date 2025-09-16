// src/pages/Admin/ActivityLog.jsx
import React, { useEffect, useState } from "react";
import axios from "../../services/axios";
import { FiSearch } from "react-icons/fi";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";
import { toast } from "react-toastify";

const ActivityLogs = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        isSidebarVisible &&
        !e.target.closest(".sidebar") &&
        !e.target.closest(".menu-btn")
      ) {
        setIsSidebarVisible(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isSidebarVisible]);

  const fetchLogs = async () => {
    try {
      const res = await axios.get("/admin/activity-logs/", {
        params: {
          page,
          search,
        },
      });
      setLogs(res.data.results);
      setCount(Math.ceil(res.data.count / 15)); // Assuming page size = 10
    } catch (err) {
      console.error("Failed to fetch activity logs:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar
        isMobileVisible={isSidebarVisible}
        isCollapsed={isSidebarCollapsed}
        role="admin"
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-60"
        } w-full`}
      >
        <Topbar
          onMenuClick={(width) =>
            width < 1024
              ? setIsSidebarVisible((prev) => !prev)
              : setIsSidebarCollapsed((prev) => !prev)
          }
          isCollapsed={isSidebarCollapsed}
        />

        <div className="min-h-screen bg-gray-100 p-2 sm:p-4 md:p-6 font-pop">
          <div className="p-2 sm:p-4 md:p-6 mx-auto bg-white shadow-md rounded-md max-w-full">
            <div className="p-2 sm:p-4">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                Activity Logs
              </h2>

              {/* Search Bar */}
              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row mb-4 max-w-full sm:max-w-md gap-2"
              >
                <input
                  type="text"
                  placeholder="Search activity..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-grow p-2 border border-gray-300 rounded sm:rounded-l sm:rounded-r-none"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded sm:rounded-r sm:rounded-l-none flex items-center justify-center"
                >
                  <FiSearch />
                </button>
              </form>

              {/* Table */}
              <div className="overflow-x-auto bg-white rounded shadow">
                <table className="w-full min-w-[600px] text-sm text-left text-gray-700">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-2 sm:px-4">User</th>
                      <th className="py-2 px-2 sm:px-4">Action</th>
                      <th className="py-2 px-2 sm:px-4">Description</th>
                      <th className="py-2 px-2 sm:px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-t">
                        <td className="py-2 px-2 sm:px-4 break-all">
                          {log.user}
                        </td>
                        <td className="py-2 px-2 sm:px-4 break-all">
                          {log.action}
                        </td>
                        <td className="py-2 px-2 sm:px-4 break-all">
                          {log.description}
                        </td>
                        <td className="py-2 px-2 sm:px-4 break-all">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center p-4">
                          No activity found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-wrap justify-end mt-4 space-x-2">
                {Array.from({ length: count }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 border rounded mb-2 ${
                      page === i + 1 ? "bg-blue-600 text-white" : "bg-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;

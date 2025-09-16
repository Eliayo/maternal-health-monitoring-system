import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";
import axios from "../../services/axios";
import { toast } from "react-toastify";
import { FiCheckCircle, FiBellOff } from "react-icons/fi";

const AdminNotification = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/notifications/");
      const notifItems = Array.isArray(res.data)
        ? res.data
        : res.data.results || res.data.notifications || [];
      setNotifications(notifItems);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      await axios.post(`/provider/notifications/mark-read/${id}/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
      toast.error("Failed to mark as read");
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.post("/provider/notifications/mark-all-read/");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
      toast.error("Failed to mark all as read");
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar
        isMobileVisible={isSidebarVisible}
        isCollapsed={isSidebarCollapsed}
        role="admin"
      />

      {/* Main */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-60"
        }`}
      >
        <Topbar
          onMenuClick={(width) =>
            width < 1024
              ? setIsSidebarVisible((prev) => !prev)
              : setIsSidebarCollapsed((prev) => !prev)
          }
          isCollapsed={isSidebarCollapsed}
        />

        <div className="min-h-screen bg-gray-50 p-6 font-pop">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
            {notifications.some((n) => !n.read) && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 text-sm"
              >
                <FiBellOff /> Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-center">Loading notifications...</p>
          ) : notifications.length > 0 ? (
            <ul className="divide-y bg-white shadow rounded-lg">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`p-4 flex justify-between items-start ${
                    n.read ? "bg-gray-50 text-gray-600" : "bg-white font-medium"
                  }`}
                >
                  <div>
                    <p>{n.title}</p>
                    <p className="text-xs text-gray-500">{n.body}</p>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="ml-4 text-xs flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      <FiCheckCircle /> Mark read
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No notifications found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotification;

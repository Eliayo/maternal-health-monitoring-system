import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";
import axios from "../../services/axios";
import { toast } from "react-toastify";
import { IoNotificationsOutline } from "react-icons/io5";

const ProviderNotifications = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
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

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/notifications/"); // or /provider/notifications/
      const data = res.data;

      // Normalize: if backend sends {results: [...]}, pick results
      const notificationsArray = Array.isArray(data)
        ? data
        : data.results || [];
      setNotifications(notificationsArray);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
      toast.error("Failed to load notifications");
      setNotifications([]); // fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/provider/notifications/mark-read/${id}/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      toast.success("Notification marked as read");
    } catch (err) {
      console.error("Failed to mark as read", err);
      toast.error("Failed to update");
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch("/provider/notifications/mark-all-read/");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Failed to mark all as read", err);
      toast.error("Failed to update");
    }
  };

  return (
    <div className="flex">
      <Sidebar
        isMobileVisible={isSidebarVisible}
        isCollapsed={isSidebarCollapsed}
        role="provider"
      />

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

        <div className="min-h-screen bg-gray-100 p-6 font-pop">
          <div className="p-6 mx-auto bg-white shadow-md rounded-md max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <IoNotificationsOutline className="text-purple-600 text-2xl" />
                Notifications
              </h1>
              {Array.isArray(notifications) &&
                notifications.some((n) => !n.read) && (
                  <button
                    onClick={markAllAsRead}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Mark All as Read
                  </button>
                )}
            </div>

            {loading && <p className="text-center">Loading...</p>}

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full table-auto border text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-2">Title</th>
                    <th className="border px-4 py-2">Message</th>
                    <th className="border px-4 py-2">Date</th>
                    <th className="border px-4 py-2">Status</th>
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notif) => (
                    <tr
                      key={notif.id}
                      className={`${
                        notif.read ? "bg-white" : "bg-purple-50"
                      } hover:bg-gray-50`}
                    >
                      <td className="border px-4 py-2 font-medium">
                        {notif.title}
                      </td>
                      <td className="border px-4 py-2">{notif.body}</td>
                      <td className="border px-4 py-2">
                        {new Date(notif.created_at).toLocaleString()}
                      </td>
                      <td className="border px-4 py-2 capitalize">
                        {notif.read ? "Read" : "Unread"}
                      </td>
                      <td className="border px-4 py-2">
                        {!notif.read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="text-blue-600 cursor-pointer text-sm font-semibold"
                          >
                            Mark Read
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="grid md:hidden gap-4">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border rounded shadow-sm ${
                    notif.read ? "bg-white" : "bg-purple-50"
                  }`}
                >
                  <h2 className="font-semibold">{notif.title}</h2>
                  <p className="text-sm text-gray-600">{notif.body}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                  <div className="mt-2">
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {notifications.length === 0 && !loading && (
              <p className="text-center text-gray-500 mt-10 text-sm">
                No notifications found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderNotifications;

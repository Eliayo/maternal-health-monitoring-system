import React, { useEffect, useState, useRef } from "react";
import { IoIosSearch } from "react-icons/io";
import { HiMenuAlt2 } from "react-icons/hi";
import {
  IoNotificationsOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoPersonOutline,
} from "react-icons/io5";

import axiosInstance from "../../services/axios";
import {
  getUserRole,
  getUsername,
  logoutUser,
} from "../../services/authService";
import { useNavigate } from "react-router-dom";

const Topbar = ({ onMenuClick, isSidebarCollapsed }) => {
  const [showSearch, setShowSearch] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState({ name: "", role: "" });

  const navigate = useNavigate();

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/me/");
        setUser({
          name: res.data?.name || getUsername() || "User",
          role: res.data?.role || getUserRole() || "",
        });
      } catch {
        setUser({
          name: getUsername() || "User",
          role: getUserRole() || "",
        });
      }
    };
    fetchUser();
  }, []);

  const initials = user.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  // Fetch notifications (latest 5)
  // Fetch notifications (latest 5)
  useEffect(() => {
    let interval;

    const fetchNotifications = async () => {
      try {
        const endpoint =
          user.role === "mother"
            ? "/mother/notifications/"
            : user.role === "provider"
            ? "/provider/notifications/"
            : "/notifications/";

        const res = await axiosInstance.get(endpoint, { params: { limit: 5 } });
        const items = Array.isArray(res.data)
          ? res.data
          : res.data.results || res.data.notifications || [];

        setNotifications(items);
        setUnreadCount(items.filter((n) => !n.read).length);
      } catch (err) {
        console.warn("Failed to fetch notifications", err);
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    if (user.role) {
      fetchNotifications(); // Initial load
      interval = setInterval(fetchNotifications, 30000); // every 30s
    }

    return () => clearInterval(interval);
  }, [user.role]);

  // Outside click
  useEffect(() => {
    const onWindowClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    window.addEventListener("click", onWindowClick);
    return () => window.removeEventListener("click", onWindowClick);
  }, []);

  const handleLogout = () => {
    logoutUser();
    window.location.href = "/login";
  };

  // Mark all read
  const markAllRead = async () => {
    try {
      let endpoint;
      if (user.role === "mother") {
        endpoint = "/mother/notifications/mark-all-read/";
      } else if (user.role === "provider") {
        endpoint = "/provider/notifications/mark-all-read/";
      } else {
        endpoint = "/notifications/mark-all-read/";
      }

      await axiosInstance.post(endpoint);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  };

  return (
    <div
      className={`h-[4.2rem] bg-white flex items-center sticky justify-between px-4 lg:px-6 border-b border-gray-200 font-pop top-0 right-0 z-10 transition-all duration-300 ${
        isSidebarCollapsed ? "w-full" : "w-full"
      }`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-2 lg:gap-4">
        <HiMenuAlt2
          className="text-gray-400 w-6 h-full cursor-pointer menu-btn"
          onClick={() => onMenuClick(window.innerWidth)}
        />
        <div className="relative flex-1 flex items-center">
          {showSearch || window.innerWidth >= 768 ? (
            <>
              <input
                type="text"
                placeholder="Search for results ..."
                className="border border-gray-200 rounded-3xl px-4 md:pl-10 md:pr-4 py-2 text-sm focus:outline-none w-full md:w-80 placeholder:text-sm placeholder:text-gray-400"
              />
              <IoIosSearch className="absolute hidden md:block left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </>
          ) : (
            <IoIosSearch
              className="w-5 h-5 text-gray-400 cursor-pointer"
              onClick={() => setShowSearch(true)}
            />
          )}
          {showSearch && window.innerWidth < 768 && (
            <button
              className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400"
              onClick={() => setShowSearch(false)}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-center gap-2 lg:gap-3 relative">
        {/* Notifications */}
        <div className="relative p-2 lg:p-3" ref={notifRef}>
          <IoNotificationsOutline
            className="w-5 h-5 cursor-pointer"
            onClick={() => setNotifOpen((s) => !s)}
            title="Notifications"
          />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full px-1">
              {unreadCount}
            </span>
          )}

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded shadow-md z-30">
              <div className="flex items-center justify-between px-4 py-2 border-b font-medium text-gray-700">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <ul>
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <li
                      key={n.id || n.created_at}
                      className={`px-4 py-2 hover:bg-gray-50 text-sm border-b last:border-none ${
                        n.read ? "text-gray-600" : "font-medium text-gray-900"
                      }`}
                    >
                      <p className="truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 truncate">{n.body}</p>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-500 text-sm">
                    No notifications
                  </li>
                )}
              </ul>
              <div className="px-4 py-2 text-center border-t">
                <button
                  onClick={() => {
                    setNotifOpen(false);
                    navigate(`/${user.role}/notifications`);
                  }}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  View all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <div
            onClick={() => setProfileOpen((s) => !s)}
            className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-semibold cursor-pointer border border-purple-700"
            title={user.name}
          >
            {initials}
          </div>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded shadow-md z-30">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                {user.role && (
                  <p className="text-xs text-gray-500 truncate">
                    {user.role.toUpperCase()}
                  </p>
                )}
              </div>
              <ul className="text-sm text-gray-700">
                <li>
                  <button
                    className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100"
                    onClick={() => navigate(`/${user.role}/profile`)}
                  >
                    <IoPersonOutline /> Profile
                  </button>
                </li>
                <li>
                  <button
                    className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100"
                    onClick={() => navigate(`/${user.role}/settings`)}
                  >
                    <IoSettingsOutline /> Settings
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 text-red-600"
                  >
                    <IoLogOutOutline /> Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;

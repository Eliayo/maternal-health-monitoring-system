import React, { useEffect, useState, useCallback } from "react";
import axios from "../../services/axios";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";

const MotherNotifications = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const [nextUrl, setNextUrl] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotifications = useCallback(
    async (url = "/mother/notifications/") => {
      try {
        if (url === "/mother/notifications/") setLoading(true);
        else setLoadingMore(true);

        const res = await axios.get(url);
        let items = [];
        let next = null;

        if (Array.isArray(res.data)) {
          items = res.data;
        } else if (Array.isArray(res.data?.results)) {
          items = res.data.results;
          next = res.data.next;
        } else if (Array.isArray(res.data?.notifications)) {
          items = res.data.notifications;
          next = res.data.next || null;
        }

        setNotifications((prev) =>
          url === "/mother/notifications/" ? items : [...prev, ...items]
        );
        setNextUrl(next);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Unable to load notifications. Try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    setGroups(groupByDate(notifications));
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

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

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await axios.post(`/mother/notifications/mark-read/${id}/`);
    } catch (err) {
      console.error(err);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
      setError("Could not mark notification read. Try again.");
    }
  };

  const markAllRead = async () => {
    if (!notifications.some((n) => !n.read)) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await axios.post("/mother/notifications/mark-all-read/");
    } catch (err) {
      console.error(err);
      setError("Could not mark all as read. Try again.");
    }
  };

  const loadMore = () => {
    if (nextUrl) fetchNotifications(nextUrl);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isMobileVisible={isSidebarVisible}
        isCollapsed={isSidebarCollapsed}
        role="mother"
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-60"
        }`}
      >
        {/* Topbar */}
        <Topbar
          onMenuClick={(width) => {
            if (width < 1024) {
              setIsSidebarVisible((prev) => !prev);
            } else {
              setIsSidebarCollapsed((prev) => !prev);
            }
          }}
          isCollapsed={isSidebarCollapsed}
        />

        <div className="w-full max-w-full md:max-w-2xl lg:max-w-4xl mx-auto p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold">
                Notifications
              </h1>
              <p className="text-sm text-gray-500">
                Recent updates & reminders
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <span>Unread</span>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                  {unreadCount}
                </span>
              </span>

              <button
                onClick={markAllRead}
                disabled={unreadCount === 0}
                className={`px-3 py-2 text-sm rounded-md ${
                  unreadCount === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                Mark all as read
              </button>
            </div>
          </div>

          {/* Error */}
          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {groups.length === 0 ? (
                <p className="text-gray-600 text-center">No notifications.</p>
              ) : (
                groups.map(({ label, items }) => (
                  <div key={label}>
                    <div className="sticky top-14 bg-gray-50 py-1 sm:py-2">
                      <h3 className="text-sm font-semibold text-gray-700">
                        {label}
                      </h3>
                    </div>
                    <div className="mt-1 space-y-2">
                      {items.map((n) => (
                        <NotificationItem
                          key={n.id}
                          notification={n}
                          onMarkRead={() => markAsRead(n.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}

              {nextUrl && (
                <div className="flex justify-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
                  >
                    {loadingMore ? "Loading..." : "Load more"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NotificationItem = ({ notification, onMarkRead }) => {
  const [open, setOpen] = useState(false);
  const createdAt = notification.created_at
    ? new Date(notification.created_at)
    : null;

  return (
    <article
      className={`flex flex-col border rounded-lg p-3 sm:p-4 bg-white shadow-sm ${
        notification.read
          ? "opacity-90"
          : "bg-gradient-to-r from-white to-indigo-50"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {!notification.read && (
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-600" />
            )}
            <h4
              className={`text-sm sm:text-base font-medium truncate ${
                notification.read ? "text-gray-800" : "text-gray-900"
              }`}
            >
              {notification.title || "Untitled"}
            </h4>
            <span className="ml-1 text-xs text-gray-400">
              {createdAt ? timeAgo(createdAt) : ""}
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-600 truncate sm:whitespace-normal">
            {notification.body || ""}
          </p>
        </div>

        <div className="flex gap-2 sm:flex-col sm:items-end">
          <button
            onClick={() => setOpen((s) => !s)}
            className="px-2 py-1 text-sm rounded-md text-indigo-600 hover:bg-indigo-50"
          >
            {open ? "Hide" : "View"}
          </button>
          {!notification.read && (
            <button
              onClick={onMarkRead}
              className="px-2 py-1 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Mark read
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="mt-3 text-sm text-gray-700 space-y-2">
          <p>{notification.body || "—"}</p>
          {notification.object_type && notification.object_id && (
            <a
              href={`/${notification.object_type}/${notification.object_id}`}
              className="text-sm text-indigo-600 hover:underline"
            >
              View related
            </a>
          )}
          <span className="block text-xs text-gray-400">
            {createdAt ? createdAt.toLocaleString() : ""}
          </span>
        </div>
      )}
    </article>
  );
};

/* ----- Helpers ----- */
function groupByDate(items) {
  if (!items.length) return [];
  const sorted = [...items].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
  const groupsMap = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  for (const n of sorted) {
    const d = n.created_at ? new Date(n.created_at) : null;
    let label = "Unknown";
    if (d && !isNaN(d.getTime())) {
      const d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (d0.getTime() === today.getTime()) label = "Today";
      else if (d0.getTime() === yesterday.getTime()) label = "Yesterday";
      else
        label = d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
    }
    if (!groupsMap.has(label)) groupsMap.set(label, []);
    groupsMap.get(label).push(n);
  }
  return Array.from(groupsMap.entries()).map(([label, items]) => ({
    label,
    items,
  }));
}

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default MotherNotifications;

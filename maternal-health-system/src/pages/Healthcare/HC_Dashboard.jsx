import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";
import axios from "../../services/axios";
import { toast } from "react-toastify";
import { FiUsers, FiCalendar, FiAlertCircle, FiBell } from "react-icons/fi";

const HC_Dashboard = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [stats, setStats] = useState({
    mothers: 0,
    upcoming: 0,
    missed: 0,
    unreadNotifs: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
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

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Mothers count
        const mothersRes = await axios.get("/provider/view-mothers/");
        const mothersData = mothersRes.data;
        setStats((prev) => ({
          ...prev,
          mothers: Array.isArray(mothersData)
            ? mothersData.length
            : mothersData.count || mothersData.results?.length || 0,
        }));

        // 2️⃣ Appointments
        const apptRes = await axios.get("/provider/appointments/");
        const allAppointments = Array.isArray(apptRes.data)
          ? apptRes.data
          : apptRes.data.results || [];
        const today = new Date();

        const upcoming = allAppointments.filter(
          (a) => new Date(a.appointment_date) >= today && a.status === "pending"
        );
        const missed = allAppointments.filter((a) => a.status === "missed");

        setStats((prev) => ({
          ...prev,
          upcoming: upcoming.length,
          missed: missed.length,
        }));
        setUpcomingAppointments(upcoming.slice(0, 5));

        // 3️⃣ Notifications
        const notifRes = await axios.get("/notifications/", {
          params: { limit: 5 },
        });
        const notifItems = Array.isArray(notifRes.data)
          ? notifRes.data
          : notifRes.data.results || notifRes.data.notifications || [];
        setNotifications(notifItems);
        setStats((prev) => ({
          ...prev,
          unreadNotifs: notifItems.filter((n) => !n.read).length,
        }));
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar
        isMobileVisible={isSidebarVisible}
        isCollapsed={isSidebarCollapsed}
        role="provider"
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
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h1>

          {loading ? (
            <p className="text-center">Loading dashboard...</p>
          ) : (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  icon={<FiUsers />}
                  label="Mothers"
                  value={stats.mothers}
                  color="bg-indigo-500"
                />

                <StatCard
                  icon={<FiCalendar />}
                  label="Upcoming"
                  value={stats.upcoming}
                  color="bg-green-500"
                />

                <StatCard
                  icon={<FiAlertCircle />}
                  label="Missed"
                  value={stats.missed}
                  color="bg-red-500"
                />

                <StatCard
                  icon={<FiBell />}
                  label="Unread"
                  value={stats.unreadNotifs}
                  color="bg-yellow-500"
                />
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">
                  Upcoming Appointments
                </h2>

                {upcomingAppointments.length > 0 ? (
                  <>
                    {/* Mobile View (cards) */}
                    <div className="space-y-4 md:hidden">
                      {upcomingAppointments.map((a) => (
                        <div
                          key={`${a.source}-${a.id}`}
                          className="border rounded-md p-4 text-sm shadow-sm"
                        >
                          <p>
                            <strong>Patient:</strong> {a.patient_name}
                          </p>
                          <p>
                            <strong>Provider:</strong> {a.provider_name}
                          </p>
                          <p>
                            <strong>Date:</strong>{" "}
                            {new Date(a.appointment_date).toLocaleString()}
                          </p>
                          <p className="capitalize">
                            <strong>Status:</strong> {a.status}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Desktop View (table with horizontal scroll) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-sm border min-w-[600px]">
                        <thead className="bg-gray-100 text-left">
                          <tr>
                            <th className="border px-4 py-2">Patient</th>
                            <th className="border px-4 py-2">Provider</th>
                            <th className="border px-4 py-2">Date</th>
                            <th className="border px-4 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {upcomingAppointments.map((a) => (
                            <tr key={`${a.source}-${a.id}`}>
                              <td className="border px-4 py-2">
                                {a.patient_name}
                              </td>
                              <td className="border px-4 py-2">
                                {a.provider_name}
                              </td>
                              <td className="border px-4 py-2">
                                {new Date(a.appointment_date).toLocaleString()}
                              </td>
                              <td className="border px-4 py-2 capitalize">
                                {a.status}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No upcoming appointments
                  </p>
                )}
              </div>

              {/* Recent Notifications */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Recent Notifications
                </h2>
                {notifications.length > 0 ? (
                  <ul className="divide-y text-sm">
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className={`py-2 ${
                          n.read ? "text-gray-600" : "font-medium text-gray-800"
                        }`}
                      >
                        <p>{n.title}</p>
                        <p className="text-xs text-gray-500">{n.body}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No notifications</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white shadow rounded-lg p-5 flex items-center gap-4">
    <div
      className={`w-12 h-12 flex items-center justify-center text-white rounded-lg text-xl ${color}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default HC_Dashboard;

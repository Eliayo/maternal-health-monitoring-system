import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";
import axios from "../../services/axios";
import { toast } from "react-toastify";
import {
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiAlertCircle,
} from "react-icons/fi";

const AdminDashboard = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [stats, setStats] = useState({
    mothers: 0,
    providers: 0,
    appointments: 0,
    missed: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Fetch mothers
        const mothersRes = await axios.get("/admin/view-users?role=mother");
        const mothersCount = Array.isArray(mothersRes.data)
          ? mothersRes.data.length
          : mothersRes.data.count || 0;

        // 2️⃣ Fetch providers
        const providersRes = await axios.get("/admin/view-users?role=provider");
        const providersCount = Array.isArray(providersRes.data)
          ? providersRes.data.length
          : providersRes.data.count || 0;

        // 3️⃣ Fetch appointments
        const apptRes = await axios.get("/admin/appointments-list/");
        const appts = Array.isArray(apptRes.data)
          ? apptRes.data
          : apptRes.data.results || [];
        const missed = appts.filter((a) => a.status === "missed");

        // 4️⃣ Fetch activities
        const activityRes = await axios.get("/admin/activity-logs/?limit=5");
        const activities = activityRes.data.results || activityRes.data || [];

        // 5️⃣ Fetch notifications
        const notifRes = await axios.get("/notifications/?limit=5");
        const notifs = Array.isArray(notifRes.data)
          ? notifRes.data
          : notifRes.data.results || [];

        setStats({
          mothers: mothersCount,
          providers: providersCount,
          appointments: appts.length,
          missed: missed.length,
        });
        setUpcomingAppointments(
          appts
            .filter((a) => new Date(a.appointment_date) >= new Date())
            .slice(0, 5)
        );
        setRecentActivities(activities);
        setNotifications(notifs);
      } catch (err) {
        console.error("Dashboard fetch failed", err);
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
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Admin Dashboard
          </h1>

          {loading ? (
            <p className="text-center">Loading dashboard...</p>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  icon={<FiUsers />}
                  label="Mothers"
                  value={stats.mothers}
                  color="bg-indigo-500"
                />
                <StatCard
                  icon={<FiUserCheck />}
                  label="Providers"
                  value={stats.providers}
                  color="bg-green-500"
                />
                <StatCard
                  icon={<FiCalendar />}
                  label="Appointments"
                  value={stats.appointments}
                  color="bg-purple-500"
                />
                <StatCard
                  icon={<FiAlertCircle />}
                  label="Missed"
                  value={stats.missed}
                  color="bg-red-500"
                />
              </div>

              {/* Upcoming Appointments */}
              <Section title="Upcoming Appointments">
                {upcomingAppointments.length > 0 ? (
                  <ul className="divide-y text-sm">
                    {upcomingAppointments.map((a) => (
                      <li key={a.id} className="py-2 flex justify-between">
                        <span>{a.patient_name}</span>
                        <span>
                          {new Date(a.appointment_date).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No upcoming appointments
                  </p>
                )}
              </Section>

              {/* Activities + Notifications side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 mb-8">
                {/* Recent Activities */}
                <Section title="Recent Activities">
                  {recentActivities.length > 0 ? (
                    <ul className="divide-y text-sm">
                      {recentActivities.slice(0, 5).map((act) => (
                        <li key={act.id} className="py-2">
                          <span className="font-medium">{act.user}</span>{" "}
                          {act.action}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No recent activities
                    </p>
                  )}
                </Section>

                {/* Recent Notifications */}
                <Section title="Recent Notifications">
                  {notifications.length > 0 ? (
                    <ul className="divide-y text-sm">
                      {notifications.slice(0, 5).map((n) => (
                        <li key={n.id} className="py-2">
                          <p>{n.title}</p>
                          <p className="text-xs text-gray-500">{n.body}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No notifications</p>
                  )}
                </Section>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

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

const Section = ({ title, children }) => (
  <div className="bg-white shadow rounded-lg p-6 mb-8">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

export default AdminDashboard;

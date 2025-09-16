import React, { useState, useEffect } from "react";
import axios from "../../services/axios";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";

const PatientDashboard = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mother, setMother] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setLoading(true);
        const res = await axios.get("/mother/dashboard/");
        const data = res.data;

        setMother(data.health_summary);
        setAppointment(data.next_appointment);
        setNotifications(data.notifications);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const triggerEmergency = async () => {
    try {
      await axios.post("/mother/emergency/");
      alert("Emergency alert sent! A provider will reach out shortly.");
    } catch (err) {
      alert("Failed to send emergency alert");
    }
  };

  if (error) {
    return <div className="p-6 text-red-500 text-center">{error}</div>;
  }

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

        {/* Content Area */}
        <main className="flex-1 px-3 sm:px-6 pb-8 pt-4 font-pop">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Welcome, {mother?.name || "Mother"}
            </h1>
            <button
              onClick={triggerEmergency}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow text-sm sm:text-base"
            >
              🚨 Emergency Alert
            </button>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Next Appointment */}
            <div className="col-span-1 lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">
                Next Appointment
              </h2>
              {appointment ? (
                <div>
                  <p className="text-gray-800 font-medium mb-1">
                    {new Date(appointment.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Provider:{" "}
                    <span className="font-medium">
                      {appointment.provider_name || "—"}
                    </span>
                  </p>
                  {appointment.notes && (
                    <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                      Notes: {appointment.notes}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No upcoming appointment scheduled
                </p>
              )}
            </div>

            {/* Notifications */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">
                Notifications
              </h2>
              {notifications.length > 0 ? (
                <ul className="space-y-3">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className="border-b last:border-none pb-2 text-sm text-gray-700"
                    >
                      <span className="font-medium block">{n.title}</span>
                      <p className="text-gray-500 text-xs mt-0.5">{n.body}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No notifications</p>
              )}
              <div className="mt-3 text-right">
                <a
                  href="/mother/notifications"
                  className="text-blue-600 text-sm hover:underline"
                >
                  View all →
                </a>
              </div>
            </div>
          </div>

          {/* Quick Health Overview */}
          <div className="mt-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Health Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-xl font-bold text-gray-800">
                  {mother?.pregnancy_week || "--"}
                </p>
                <p className="text-gray-500 text-sm">Pregnancy Week</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-xl font-bold text-gray-800">
                  {mother?.last_visit || "--"}
                </p>
                <p className="text-gray-500 text-sm">Last Visit</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-xl font-bold text-gray-800">
                  {mother?.risk_status || "Normal"}
                </p>
                <p className="text-gray-500 text-sm">Risk Status</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;

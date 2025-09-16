import React, { useState, useEffect } from "react";
import axios from "../../services/axios";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";
import { ClipLoader } from "react-spinners";

const PatientAppointments = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [filterProvider, setFilterProvider] = useState("all");
  const [providers, setProviders] = useState([]);

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
    axios
      .get("/mother/appointments/")
      .then((res) => {
        setUpcoming(res.data.upcoming);
        setPast(res.data.past);

        const allProviders = [...res.data.upcoming, ...res.data.past].map(
          (a) => a.provider_name
        );
        setProviders([...new Set(allProviders)]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filterAppointments = (appointments) => {
    if (filterProvider === "all") return appointments;
    return appointments.filter((a) => a.provider_name === filterProvider);
  };

  const renderAppointments = (appointments) => {
    const filtered = filterAppointments(appointments);
    if (filtered.length === 0)
      return <p className="text-gray-500 text-center">No appointments</p>;

    return filtered.map((a) => (
      <div
        key={a.id}
        className="p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100"
        onClick={() => setSelectedAppt(a)}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-indigo-700">
              {a.appointment_type || "General"}
            </p>
            <p className="text-sm text-gray-500">{a.appointment_date}</p>
            <p className="text-sm text-gray-600">Provider: {a.provider_name}</p>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
              a.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {a.status}
          </span>
        </div>
      </div>
    ));
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar
        isMobileVisible={isSidebarVisible}
        isCollapsed={isSidebarCollapsed}
        role="mother"
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-60"
        }`}
      >
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

        <div className="p-4 max-w-4xl mx-auto font-pop">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            My Appointments
          </h1>

          {/* Filter + Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <label className="font-medium text-gray-700 text-sm">
                Provider:
              </label>
              <select
                value={filterProvider}
                onChange={(e) => setFilterProvider(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="all">All</option>
                {providers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-gray-100 rounded-full p-1 w-fit">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  activeTab === "upcoming"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  activeTab === "past"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                Past
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <ClipLoader size={45} color="#4f46e5" />
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab === "upcoming"
                ? renderAppointments(upcoming)
                : renderAppointments(past)}
            </div>
          )}

          {/* Modal */}
          {selectedAppt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">
                  {selectedAppt.appointment_type || "General Appointment"}
                </h2>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <strong>Date:</strong> {selectedAppt.appointment_date}
                  </p>
                  <p>
                    <strong>Provider:</strong> {selectedAppt.provider_name}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        selectedAppt.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {selectedAppt.status}
                    </span>
                  </p>
                  <p>
                    <strong>Notes:</strong>{" "}
                    {selectedAppt.notes ? selectedAppt.notes : "N/A"}
                  </p>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setSelectedAppt(null)}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientAppointments;

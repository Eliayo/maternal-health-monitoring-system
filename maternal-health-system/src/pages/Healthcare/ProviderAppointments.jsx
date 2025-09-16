import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";
import axios from "../../services/axios";
import { toast } from "react-toastify";

const ProviderAppointments = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [statusValue, setStatusValue] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const openDrawer = (appointment) => {
    setSelectedAppointment(appointment);
    setStatusValue(appointment.status || "pending");
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setSelectedAppointment(null);
    setIsDrawerOpen(false);
  };

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

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/provider/appointments/");
      const data = res.data;
      const appointmentsArray = Array.isArray(data) ? data : data.results || [];
      setAppointments(appointmentsArray);
    } catch (err) {
      console.error("Failed to fetch provider appointments", err);
      toast.error("Failed to fetch appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async () => {
    if (!selectedAppointment) return;
    setUpdatingStatus(true);

    try {
      await axios.patch("/provider/appointments/", {
        id: selectedAppointment.id,
        source: selectedAppointment.source,
        status: statusValue,
      });

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === selectedAppointment.id &&
          appt.source === selectedAppointment.source
            ? { ...appt, status: statusValue }
            : appt
        )
      );

      toast.success("Status updated!");
      closeDrawer();
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return " font-normal";
      case "cancelled":
        return " font-normal";
      case "missed":
        return " font-normal";
      default:
        return " font-normal"; // pending
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

        <div className="min-h-screen bg-gray-100 p-3 font-pop">
          <div className="p-6 mx-auto bg-white shadow-md rounded-md">
            <h1 className="text-xl font-bold mb-4">Appointments</h1>

            {loading && <p className="text-center">Loading...</p>}

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full table-auto border text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-2">Patient</th>
                    <th className="border px-4 py-2">Provider</th>
                    <th className="border px-4 py-2">Date</th>
                    <th className="border px-4 py-2">Status</th>
                    <th className="border px-4 py-2">Source</th>
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(appointments) &&
                    appointments.map((appt) => (
                      <tr
                        key={`${appt.source}-${appt.id}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="border px-4 py-2">
                          {appt.patient_name || appt.mother_info?.full_name}
                        </td>
                        <td className="border px-4 py-2">
                          {appt.provider_name}
                        </td>
                        <td className="border px-4 py-2">
                          {appt.appointment_date
                            ? new Date(appt.appointment_date).toLocaleString()
                            : appt.next_appointment
                            ? new Date(
                                appt.next_appointment
                              ).toLocaleDateString()
                            : "--"}
                        </td>
                        <td
                          className={`border px-4 py-2 capitalize ${getStatusClass(
                            appt.status
                          )}`}
                        >
                          {appt.status || "pending"}
                        </td>
                        <td className="border px-4 py-2">{appt.source}</td>
                        <td className="border px-4 py-2">
                          <button
                            onClick={() => openDrawer(appt)}
                            className="text-blue-600 cursor-pointer text-sm font-semibold"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="grid md:hidden gap-4">
              {Array.isArray(appointments) &&
                appointments.map((appt) => (
                  <div
                    key={`${appt.source}-${appt.id}`}
                    className="bg-white shadow rounded p-4 text-sm space-y-1"
                  >
                    <p>
                      <strong>Patient:</strong>{" "}
                      {appt.patient_name || appt.mother_info?.full_name}
                    </p>
                    <p>
                      <strong>Provider:</strong> {appt.provider_name}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {appt.appointment_date
                        ? new Date(appt.appointment_date).toLocaleString()
                        : appt.next_appointment
                        ? new Date(appt.next_appointment).toLocaleDateString()
                        : "--"}
                    </p>
                    <p className={`capitalize ${getStatusClass(appt.status)}`}>
                      <strong>Status:</strong> {appt.status || "pending"}
                    </p>
                    <p>
                      <strong>Source:</strong> {appt.source}
                    </p>
                    <button
                      onClick={() => openDrawer(appt)}
                      className="bg-blue-600 text-sm mt-2 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                ))}
            </div>

            {appointments.length === 0 && !loading && (
              <p className="text-center mt-10 text-sm text-gray-500">
                No appointments found.
              </p>
            )}

            {/* Drawer */}
            {isDrawerOpen && selectedAppointment && (
              <div className="fixed inset-0 z-50 flex">
                <div className="flex-1 bg-black/40 " onClick={closeDrawer} />
                <div className="bg-white w-full sm:max-w-md p-6 shadow-lg overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                      Appointment Details
                    </h2>
                    <button
                      onClick={closeDrawer}
                      className="text-gray-600 text-xl"
                    >
                      &times;
                    </button>
                  </div>
                  <div className="text-sm space-y-2">
                    <p>
                      <strong>Patient:</strong>{" "}
                      {selectedAppointment.patient_name ||
                        selectedAppointment.mother_info?.full_name}
                    </p>
                    <p>
                      <strong>Provider:</strong>{" "}
                      {selectedAppointment.provider_name}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {selectedAppointment.appointment_date
                        ? new Date(
                            selectedAppointment.appointment_date
                          ).toLocaleString()
                        : selectedAppointment.next_appointment
                        ? new Date(
                            selectedAppointment.next_appointment
                          ).toLocaleDateString()
                        : "--"}
                    </p>
                    <p
                      className={`capitalize ${getStatusClass(
                        selectedAppointment.status
                      )}`}
                    >
                      <strong>Status:</strong>{" "}
                      {selectedAppointment.status || "pending"}
                    </p>
                    <p>
                      <strong>Source:</strong> {selectedAppointment.source}
                    </p>
                    <p>
                      <strong>Notes:</strong>{" "}
                      {selectedAppointment.notes || "--"}
                    </p>
                  </div>

                  {/* Update Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">
                      Update Status
                    </label>
                    <select
                      value={statusValue}
                      onChange={(e) => setStatusValue(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="missed">Missed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <button
                    onClick={handleStatusUpdate}
                    className="mt-4 bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
                    disabled={
                      updatingStatus ||
                      statusValue === selectedAppointment.status
                    }
                  >
                    {updatingStatus ? "Saving..." : "Save Status"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderAppointments;

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";
import axios from "../../services/axios";
import { toast } from "react-toastify";
import { FiTrash2, FiEdit2, FiDownload } from "react-icons/fi";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ViewAppointments = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {
        page,
      };
      if (searchTerm) params.search = searchTerm;
      if (selectedDate) params.appointment_date = selectedDate;

      const res = await axios.get("/admin/appointments-list/", { params });

      setAppointments(res.data.results || []);

      // Calculate total pages
      const count = res.data.count || 0;
      const pageSize = 10; // Same as PAGE_SIZE in your DRF settings
      setTotalPages(Math.ceil(count / pageSize));
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [searchTerm, selectedDate, page]);

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

  const downloadData = async (format) => {
    try {
      const res = await axios.get("/admin/appointments-list/", {
        params: { format },
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `appointments.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedAppointment) return;
    setUpdatingStatus(true);

    try {
      await axios.patch(
        `/admin/update-appointment-status/${selectedAppointment.id}/`,
        {
          status: statusValue,
        }
      );

      // Optional: Update local appointment list
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === selectedAppointment.id
            ? { ...appt, status: statusValue }
            : appt
        )
      );

      toast.success("Status updated!");
      closeDrawer(); // or keep drawer open if you prefer
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar
        isMobileVisible={isSidebarVisible}
        isCollapsed={isSidebarCollapsed}
        role="admin"
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
          <div className="p-6 mx-auto bg-white shadow-md rounded-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <input
                type="text"
                placeholder="Search by type, patient, or provider"
                className="border px-3 py-2 rounded w-full md:w-1/3 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <input
                type="date"
                className="border px-3 py-2 rounded w-full md:w-1/4 text-sm"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => downloadData("csv")}
                  className="bg-blue-600 text-white px-3 py-2 text-sm rounded flex items-center gap-1"
                >
                  <FiDownload /> CSV
                </button>
                <button
                  onClick={() => downloadData("excel")}
                  className="bg-green-600 text-white px-3 py-2 text-sm rounded flex items-center gap-1"
                >
                  <FiDownload /> Excel
                </button>
                <button
                  onClick={() => downloadData("pdf")}
                  className="bg-red-600 text-white px-3 py-2 text-sm rounded flex items-center gap-1"
                >
                  <FiDownload /> PDF
                </button>
              </div>
            </div>

            {/* Mobile View (cards) */}
            <div className="grid md:hidden gap-4">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="bg-white shadow rounded p-4 text-sm space-y-1"
                >
                  <p>
                    <strong>Patient:</strong> {appt.patient_name}
                  </p>
                  <p>
                    <strong>Provider:</strong> {appt.provider_name}
                  </p>
                  <p>
                    <strong>Type:</strong> {appt.appointment_type}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(appt.appointment_date).toLocaleString()}
                  </p>
                  <p className="capitalize">
                    <strong>Status:</strong> {appt.status || "pending"}
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

            {/* Desktop View (table) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full table-auto border text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-2">Patient</th>
                    <th className="border px-4 py-2">Provider</th>
                    <th className="border px-4 py-2">Type</th>
                    <th className="border px-4 py-2">Date</th>
                    <th className="border px-4 py-2">Status</th>
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{appt.patient_name}</td>
                      <td className="border px-4 py-2">{appt.provider_name}</td>
                      <td className="border px-4 py-2">
                        {appt.appointment_type}
                      </td>
                      <td className="border px-4 py-2">
                        {new Date(appt.appointment_date).toLocaleString()}
                      </td>
                      <td className="border px-4 py-2 capitalize">
                        {appt.status || "pending"}
                      </td>
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

            {appointments.length === 0 && !loading && (
              <p className="text-center mt-10 text-sm text-gray-500">
                No appointments found.
              </p>
            )}

            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>

              <span className="text-sm">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>

            {isDrawerOpen && selectedAppointment && (
              <div className="fixed inset-0 z-50 flex justify-end ">
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
                      {selectedAppointment.patient_name}
                    </p>
                    <p>
                      <strong>Provider:</strong>{" "}
                      {selectedAppointment.provider_name}
                    </p>
                    <p>
                      <strong>Type:</strong>{" "}
                      {selectedAppointment.appointment_type}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(
                        selectedAppointment.appointment_date
                      ).toLocaleString()}
                    </p>
                    <p className="capitalize">
                      <strong>Status:</strong>{" "}
                      {selectedAppointment.status || "pending"}
                    </p>
                    <p className="tracking-wide text-justify leading-relaxed">
                      <strong>Notes:</strong> {selectedAppointment.notes}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {new Date(
                        selectedAppointment.created_at
                      ).toLocaleString()}
                    </p>
                  </div>
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

export default ViewAppointments;

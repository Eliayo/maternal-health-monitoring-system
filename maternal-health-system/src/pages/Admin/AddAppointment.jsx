import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";
import { useNavigate } from "react-router-dom";
import axios from "../../services/axios";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { format } from "date-fns";

const AddAppointment = () => {
  const navigate = useNavigate();

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [step, setStep] = useState(1);
  const [patients, setPatients] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [formData, setFormData] = useState({
    patient: "",
    appointment_date: null,
    appointment_type: "",
    provider: "",
    notes: "",
  });

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
    fetchPatients();
    fetchProviders();
    fetchRecentAppointments();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get("/admin/view-users", {
        params: { role: "mother" },
      });
      setPatients(res.data.results || []); // ✅ FIX
    } catch (err) {
      toast.error("Failed to load patients.");
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await axios.get("/admin/view-users", {
        params: { role: "provider" },
      });
      setProviders(res.data.results || []); // ✅ FIX
    } catch (err) {
      toast.error("Failed to load providers.");
    }
  };

  const fetchRecentAppointments = async () => {
    try {
      const res = await axios.get("/admin/recent-appointments");
      setRecentAppointments(res.data.results || []);
    } catch (err) {
      toast.error("Failed to load recent appointments.");
    }
  };

  const handleNext = () => {
    if (step === 1 && !formData.patient) {
      toast.error("Please select a patient.");
      return;
    }
    if (
      step === 2 &&
      (!formData.appointment_date || !formData.appointment_type)
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleSubmit = async () => {
    try {
      await axios.post("/admin/create-appointment/", formData);
      toast.success("Appointment created!");
      setStep(1);
      setFormData({
        patient: "",
        appointment_date: null,
        appointment_type: "",
        provider: "",
        notes: "",
      });
    } catch (err) {
      toast.error("Failed to create appointment.");
    }
  };

  const getUserFullName = (username, users) => {
    const user = users.find((u) => u.username === username);
    return user ? `${user.first_name} ${user.last_name}` : username;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          onMenuClick={(width) => {
            if (width < 1024) {
              setIsSidebarVisible((prev) => !prev);
            } else {
              setIsSidebarCollapsed((prev) => !prev);
            }
          }}
          isCollapsed={isSidebarCollapsed}
        />

        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-pop">
          <div className="bg-white rounded shadow-md p-4 sm:p-6 max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-6 text-center">
              Add Appointment
            </h2>

            <div className="flex items-center justify-between mb-8 text-xs sm:text-sm text-gray-600">
              {["Select Patient", "Details", "Review"].map((label, index) => (
                <div
                  key={index}
                  className={`flex-1 text-center ${
                    step === index + 1 ? "text-blue-600 font-semibold" : ""
                  }`}
                >
                  {index + 1}. {label}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Patient
                </label>
                <Select
                  name="patient"
                  value={
                    formData.patient
                      ? {
                          value: formData.patient,
                          label: getUserFullName(formData.patient, patients),
                        }
                      : null
                  }
                  onChange={(option) =>
                    setFormData((prev) => ({
                      ...prev,
                      patient: option ? option.value : "",
                    }))
                  }
                  options={patients.map((p) => ({
                    value: p.username,
                    label: `${p.first_name} ${p.last_name}`,
                  }))}
                  placeholder="Select Patient"
                  isClearable
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Date & Time
                  </label>
                  <DatePicker
                    selected={
                      formData.appointment_date
                        ? new Date(formData.appointment_date)
                        : null
                    }
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        appointment_date: date.toISOString(),
                      })
                    }
                    showTimeSelect
                    timeFormat="hh:mm aa"
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={new Date()}
                    placeholderText="Select date and time"
                    className="w-full border px-3 py-2 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Type
                  </label>
                  <input
                    type="text"
                    placeholder="ANC Checkup, Scan, etc."
                    value={formData.appointment_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appointment_type: e.target.value,
                      })
                    }
                    className="w-full border px-3 py-2 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Provider
                  </label>
                  <Select
                    name="provider"
                    value={
                      formData.provider
                        ? {
                            value: formData.provider,
                            label: getUserFullName(
                              formData.provider,
                              providers
                            ),
                          }
                        : null
                    }
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        provider: option ? option.value : "",
                      }))
                    }
                    options={providers.map((p) => ({
                      value: p.username,
                      label: `${p.first_name} ${p.last_name}`,
                    }))}
                    placeholder="Select Provider"
                    isClearable
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded-md"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-sm text-gray-700 space-y-2">
                  <p>
                    <strong>Patient:</strong>{" "}
                    {getUserFullName(formData.patient, patients)}
                  </p>
                  {formData.appointment_date && (
                    <p>
                      <strong>Date:</strong>{" "}
                      {format(
                        new Date(formData.appointment_date),
                        "MMMM d, yyyy;  h:mm a"
                      )}
                    </p>
                  )}

                  <p>
                    <strong>Type:</strong> {formData.appointment_type}
                  </p>
                  <p>
                    <strong>Provider:</strong>{" "}
                    {getUserFullName(formData.provider, providers)}
                  </p>

                  {formData.notes && (
                    <p>
                      <strong>Notes:</strong> {formData.notes}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2 text-gray-700">
                    Recent Appointments
                  </h4>
                  <div className="max-h-40 overflow-y-auto border rounded p-2 text-xs text-gray-600 space-y-1">
                    {Array.isArray(recentAppointments) &&
                    recentAppointments.length > 0 ? (
                      recentAppointments.map((apt, i) => (
                        <div key={i} className="border-b py-1 last:border-0">
                          {apt.patient_name} — {apt.appointment_type} on{" "}
                          {new Date(apt.appointment_date).toLocaleString()}
                        </div>
                      ))
                    ) : (
                      <p>No recent appointments found.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm ml-auto"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm ml-auto"
                >
                  Confirm & Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAppointment;

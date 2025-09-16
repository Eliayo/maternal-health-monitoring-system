import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";
import axios from "../../services/axios";
import { toast } from "react-toastify";
import { FiEdit2, FiDownload, FiLoader } from "react-icons/fi";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import UserForm from "../../components/Common/UserForm";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

const EMPTY_MOTHER = {
  // identifiers (keep both so we can work with any backend shape)
  custom_id: "",
  id: "",
  pk: "",

  // fields used in <UserForm />
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  department: "",
  sex: "female",
  role: "mother",
  designation: "",
  address: "",
  religion: "",
  ethnic_group: "",
  date_of_birth: "",
  marital_status: "",
  education_level: "",
  occupation: "",
  // next of kin
  nok_name: "",
  nok_relationship: "",
  nok_address: "",
  nok_phone: "",
  nok_occupation: "",
  nok_education_level: "",

  // optional display-only field from list API
  full_name: "",
  date_joined: "",
};

const PatientsList = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewMother, setViewMother] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mothers, setMothers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMother, setSelectedMother] = useState(null);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMothers();
  }, [page, search, startDate, endDate]);

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

  const fetchMothers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/provider/view-mothers/", {
        params: {
          page,
          search,
          start_date: startDate ? startDate.toISOString().split("T")[0] : null,
          end_date: endDate ? endDate.toISOString().split("T")[0] : null,
        },
      });
      setMothers(res.data.results || []);
      setCount(res.data.count);
    } catch (err) {
      toast.error("Failed to load mothers");
    } finally {
      setLoading(false);
    }
  };

  // Helper to resolve the identifier we should put in the URL
  const getIdForUrl = (obj) =>
    obj?.custom_id || obj?.id || obj?.pk || obj || "";

  // Open edit modal and hydrate form
  const handleEditClick = async (motherOrId) => {
    const id = getIdForUrl(motherOrId);
    if (!id) {
      toast.error("Missing mother ID");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`/provider/retrieve-mother/${id}/`);
      const data = res.data || {};

      // Merge onto a full default shape so all inputs are controlled
      const merged = {
        ...EMPTY_MOTHER,
        ...data,
        // make sure identifiers are present
        custom_id: data.custom_id || id,
        id: data.id || data.pk || EMPTY_MOTHER.id,
        pk: data.pk || EMPTY_MOTHER.pk,
        // enforce role/sex for mother editing
        role: "mother",
        sex: "female",
      };

      setSelectedMother(merged);
      setIsEditMode(true);
    } catch (err) {
      console.error(
        "Failed to fetch mother details:",
        err?.response?.data || err
      );
      toast.error("Failed to fetch mother details");
    } finally {
      setLoading(false);
    }
  };

  const handleViewClick = async (motherId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/provider/retrieve-mother/${motherId}/`);
      setViewMother(res.data);
    } catch (err) {
      toast.error("Failed to fetch mother details");
    }
    setLoading(false);
  };

  const handleDeleteClick = async (custom_id) => {
    if (!window.confirm(`Are you sure you want to delete this mother?`)) return;

    try {
      await axios.delete(`/provider/delete-mother/${custom_id}/`);
      toast.success("Mother deleted successfully");
      fetchMothers(); // refresh list
    } catch (error) {
      console.error("Delete error:", error.response?.data || error);
      toast.error("Failed to delete mother");
    }
  };

  // Create or update based on isEditMode + presence of id
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!selectedMother) return;

    // never send identifiers in the body
    const {
      custom_id,
      id,
      pk,
      full_name, // display-only; don’t send
      date_joined, // display-only
      ...payload
    } = selectedMother;

    // Ensure backend sees correct role/sex for a mother record
    payload.role = "mother";
    payload.sex = "female";

    const idForUrl = getIdForUrl({ custom_id, id, pk });

    try {
      if (isEditMode && idForUrl) {
        // Only send fields provider is allowed to update
        const allowedUpdateFields = [
          "first_name",
          "last_name",
          "phone_number",
          "address",
          "occupation",
          "nok_name",
          "nok_relationship",
          "nok_address",
          "nok_phone",
          "nok_occupation",
          "nok_education_level",
        ];
        const filteredPayload = Object.fromEntries(
          Object.entries(payload).filter(([key]) =>
            allowedUpdateFields.includes(key)
          )
        );
        await axios.patch(
          `/provider/update-mother/${idForUrl}/`,
          filteredPayload
        );
        toast.success("Mother updated successfully");
      } else {
        await axios.post("/provider/add-mother/", payload);
        toast.success("Mother created successfully");
      }

      fetchMothers();
      setSelectedMother(null);
      setIsEditMode(false);
    } catch (error) {
      const data = error?.response?.data;
      console.error("Submit error:", data || error);

      // Surface common DRF validation nicely
      if (data && typeof data === "object") {
        const msg = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
        toast.error(msg || "Submission failed.");
      } else {
        toast.error("Submission failed.");
      }
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(mothers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mothers");
    XLSX.writeFile(wb, "registered_mothers.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Custom ID", "Full Name", "Phone", "Date Joined"];
    const tableRows = mothers.map((m) => [
      m.custom_id,
      m.full_name,
      m.phone_number,
      new Date(m.date_joined).toLocaleDateString(),
    ]);
    autoTable(doc, { head: [tableColumn], body: tableRows });
    doc.save("registered_mothers.pdf");
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

        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 font-pop text-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
            <h2 className="text-xl font-semibold text-gray-800">
              Registered Mothers ({count})
            </h2>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={exportToExcel}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
              >
                <FiDownload className="mr-2" /> Excel
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
              >
                <FiDownload className="mr-2" /> PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by name, phone or ID"
              className="border px-3 py-2 rounded w-full md:w-1/2"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <div className="flex flex-wrap gap-2 md:justify-end">
              <DatePicker
                selected={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  setPage(1);
                }}
                placeholderText="Start Date"
                className="border px-3 py-2 rounded"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => {
                  setEndDate(date);
                  setPage(1);
                }}
                placeholderText="End Date"
                className="border px-3 py-2 rounded"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <FiLoader className="animate-spin text-3xl text-gray-600" />
            </div>
          ) : mothers.length === 0 ? (
            <p className="text-center text-gray-500">No mothers found.</p>
          ) : (
            // Mobile cards
            <div className="grid sm:hidden gap-4">
              {mothers.map((m) => (
                <div
                  key={m.custom_id}
                  className="bg-white shadow rounded p-4 space-y-1"
                >
                  <p className="text-sm text-gray-600">
                    <strong>ID:</strong> {m.custom_id}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Name:</strong> {m.full_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Phone:</strong> {m.phone_number}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Date:</strong>{" "}
                    {new Date(m.date_joined).toLocaleDateString()}
                  </p>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => handleEditClick(m.custom_id)}
                      className="bg-blue-600 text-white hover:bg-blue-700 text-sm p-2 rounded"
                    >
                      <FiEdit2 className="inline" /> Edit
                    </button>
                    <button
                      onClick={() => handleViewClick(m.custom_id)}
                      className="bg-green-600 text-white hover:bg-green-700 text-sm p-2 rounded"
                    >
                      👁 View
                    </button>
                    <button
                      onClick={() => handleDeleteClick(m.custom_id)}
                      className="bg-red-600 text-white hover:bg-red-700 text-sm p-2 rounded"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table view for larger screens */}
          <div className="hidden sm:block overflow-x-auto bg-white shadow-md rounded mt-6">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-200 text-left">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Full Name</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Date Joined</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mothers.map((m) => (
                  <tr key={m.custom_id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{m.custom_id}</td>
                    <td className="px-4 py-2">{m.full_name}</td>
                    <td className="px-4 py-2">{m.phone_number}</td>
                    <td className="px-4 py-2">
                      {new Date(m.date_joined).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(m.custom_id)}
                          className="text-blue-600 border p-1 rounded hover:bg-blue-700 hover:text-white text-sm cursor-pointer"
                        >
                          <FiEdit2 className="inline" />
                        </button>
                        <button
                          onClick={() => handleViewClick(m.custom_id)}
                          className="text-green-600 border p-1 rounded hover:bg-green-700 hover:text-white text-sm cursor-pointer"
                        >
                          👁
                        </button>
                        <button
                          onClick={() => handleDeleteClick(m.custom_id)}
                          className="text-red-600 border p-1 rounded hover:bg-red-700 hover:text-white text-sm cursor-pointer"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 cursor-pointer"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 cursor-pointer"
              disabled={mothers.length < 10}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>

          {/* Edit Modal */}
          {selectedMother && (
            <div className="fixed inset-0 bg-white/0 backdrop-filter backdrop-blur-xs flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">
                <button
                  className="absolute top-2 right-2 text-gray-600 cursor-pointer text-2xl"
                  onClick={() => {
                    setSelectedMother(null);
                    setIsEditMode(false);
                  }}
                >
                  ✕
                </button>
                <h3 className="text-lg font-medium mb-4">
                  Update:{" "}
                  {selectedMother.full_name ||
                    `${selectedMother.first_name} ${selectedMother.last_name}`}
                </h3>
                <UserForm
                  formData={selectedMother}
                  handleChange={(e) =>
                    setSelectedMother((prev) => ({
                      ...prev,
                      [e.target.name]: e.target.value ?? "",
                    }))
                  }
                  handleSubmit={handleSubmit} // keep event-only; parent decides POST vs PATCH
                  handleReset={() => {
                    setSelectedMother(null);
                    setIsEditMode(false);
                  }}
                  isEditMode={isEditMode}
                  loading={loading}
                  isProviderAddingMother={true}
                  showRoleSelect={false}
                  showDepartment={false}
                  allowedRoles={["mother"]}
                />
              </div>
            </div>
          )}

          {/* View Sidebar */}
          {viewMother && (
            <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
              <div className="bg-white w-full max-w-md h-full shadow-lg p-6 overflow-y-auto">
                <button
                  className="absolute top-3 right-3 text-gray-600 text-xl cursor-pointer"
                  onClick={() => setViewMother(null)}
                >
                  ✕
                </button>
                <h3 className="text-lg font-semibold mb-4">
                  Mother Details: {viewMother.full_name}
                </h3>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <strong>ID:</strong> {viewMother.custom_id}
                  </p>
                  <p>
                    <strong>Username:</strong> {viewMother.username}
                  </p>
                  <p>
                    <strong>Phone:</strong> {viewMother.phone_number}
                  </p>
                  <p>
                    <strong>Date of Birth:</strong> {viewMother.date_of_birth}
                  </p>
                  <p>
                    <strong>Ethnic Group:</strong> {viewMother.ethnic_group}
                  </p>
                  <p>
                    <strong>Religion:</strong> {viewMother.religion}
                  </p>
                  <p>
                    <strong>Marital Status:</strong> {viewMother.marital_status}
                  </p>
                  <p>
                    <strong>Education:</strong> {viewMother.education_level}
                  </p>
                  <p>
                    <strong>Occupation:</strong> {viewMother.occupation}
                  </p>
                  <p>
                    <strong>Address:</strong> {viewMother.address}
                  </p>
                  <hr />
                  <p>
                    <strong>Next of Kin:</strong> {viewMother.nok_name}
                  </p>
                  <p>
                    <strong>Relationship:</strong> {viewMother.nok_relationship}
                  </p>
                  <p>
                    <strong>Phone Number:</strong> {viewMother.nok_phone}
                  </p>
                  <p>
                    <strong>Occupation:</strong> {viewMother.nok_occupation}
                  </p>
                  <p>
                    <strong>Education:</strong> {viewMother.nok_education_level}
                  </p>
                  <p>
                    <strong>Address:</strong> {viewMother.nok_address}
                  </p>
                  <p>
                    <strong>Date Joined:</strong>{" "}
                    {viewMother.date_joined
                      ? new Date(viewMother.date_joined).toLocaleDateString()
                      : "—"}
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() =>
                        navigate(
                          `/provider/patients/${viewMother.custom_id}/health`
                        )
                      }
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
                    >
                      View Health Record
                    </button>
                  </div>

                  {/* add more fields as needed */}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientsList;

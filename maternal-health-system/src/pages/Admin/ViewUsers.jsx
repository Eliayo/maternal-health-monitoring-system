import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";
import axios from "../../services/axios";
import { toast } from "react-toastify";
import { FiTrash2, FiEdit2, FiDownload } from "react-icons/fi";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import UserForm from "../../components/Common/UserForm";

const ViewUsers = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState({
    results: [],
    count: 0,
    next: null,
    previous: null,
  });
  const [roleFilter, setRoleFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    department: "",
    address: "",
    sex: "male",
    role: "mother",
  });
  const [loading, setLoading] = useState(false);

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
    const delaySearch = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [searchTerm, roleFilter, currentPage]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/admin/view-users/", {
        params: {
          page: currentPage,
          role: roleFilter || undefined,
          search: searchTerm || undefined,
        },
      });
      setUsers(res.data);
    } catch {
      toast.error("Failed to fetch users");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData(user); // Pre-fill form data
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`/admin/update-user/${editingUser.id}/`, formData);
      toast.success("User updated successfully!");
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (editingUser) {
      setFormData(editingUser);
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        department: "",
        address: "",
        sex: "male",
        role: "mother",
      });
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`/admin/delete-user/${id}/`);
      fetchUsers();
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const downloadData = (format) => {
    const headers = [
      "ID",
      "Username",
      "First Name",
      "Last Name",
      "Email",
      "Department",
      "Phone",
      "Role",
    ];
    const rows = users.results.map((u) => [
      u.custom_id,
      u.username,
      u.first_name,
      u.last_name,
      u.email,
      u.department,
      u.phone_number,
      u.role,
    ]);

    if (format === "csv") {
      const csv = [headers, ...rows].map((e) => e.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${roleFilter || "all"}_users.csv`;
      a.click();
    } else if (format === "excel") {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      XLSX.utils.book_append_sheet(wb, ws, "Users");
      XLSX.writeFile(wb, `${roleFilter || "all"}_users.xlsx`);
    } else if (format === "pdf") {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [headers],
        body: rows,
        theme: "striped",
        styles: { fontSize: 8 },
      });
      doc.save(`${roleFilter || "all"}_users.pdf`);
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
          <div className="bg-white p-6 shadow-md rounded-md mb-6">
            {editingUser ? (
              <div className="p-2">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Edit User
                </h2>
                <UserForm
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  handleReset={handleReset}
                  isEditMode={true}
                  loading={loading}
                />
                <button
                  onClick={() => setEditingUser(null)}
                  className="mt-4 text-sm text-white cursor-pointer bg-red-500 p-2 rounded ms-24 md:ms-0"
                >
                  Cancel Edit
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                  <h2 className="text-xl font-semibold text-gray-700">
                    User List
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center mb-4">
                    <input
                      placeholder="Search..."
                      className="border px-3 py-2 rounded text-sm w-full"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="border rounded px-3 py-2 text-sm w-full"
                    >
                      <option value="">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="provider">Healthcare Provider</option>
                      <option value="mother">Mother</option>
                    </select>
                    <div className="flex gap-2 justify-start sm:justify-end">
                      <button
                        onClick={() => downloadData("csv")}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <FiDownload /> CSV
                      </button>
                      <button
                        onClick={() => downloadData("excel")}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <FiDownload /> Excel
                      </button>
                      <button
                        onClick={() => downloadData("pdf")}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                      >
                        <FiDownload /> PDF
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {/* 📱 Card View on Mobile */}
                  <div className="grid md:hidden gap-4">
                    {users.results.map((user) => (
                      <div
                        key={user.id}
                        className="bg-white border rounded-md shadow-md p-4 space-y-2 text-sm"
                      >
                        <div className="text-gray-800 font-semibold text-base">
                          {user.first_name} {user.last_name}
                        </div>
                        <p>
                          <strong>ID:</strong> {user.custom_id}
                        </p>
                        <p>
                          <strong>Username:</strong> {user.username}
                        </p>
                        <p>
                          <strong>Email:</strong> {user.email}
                        </p>
                        <p>
                          <strong>Phone:</strong> {user.phone_number}
                        </p>
                        <p>
                          <strong>Department:</strong> {user.department}
                        </p>
                        <p>
                          <strong>Role:</strong> {user.role}
                        </p>
                        <div className="flex gap-4 pt-2">
                          <FiEdit2
                            className="text-blue-500 cursor-pointer"
                            title="Edit"
                            onClick={() => handleEdit(user)}
                          />
                          <FiTrash2
                            className="text-red-500 cursor-pointer"
                            title="Delete"
                            onClick={() => handleDelete(user.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 💻 Table View on Desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full table-auto border border-gray-300 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border px-4 py-2">ID</th>
                          <th className="border px-4 py-2">Username</th>
                          <th className="border px-4 py-2">First Name</th>
                          <th className="border px-4 py-2">Last Name</th>
                          <th className="border px-4 py-2">Email</th>
                          <th className="border px-4 py-2">Department</th>
                          <th className="border px-4 py-2">Phone</th>
                          <th className="border px-4 py-2">Role</th>
                          <th className="border px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.results.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="border px-4 py-2">
                              {user.custom_id}
                            </td>
                            <td className="border px-4 py-2">
                              {user.username}
                            </td>
                            <td className="border px-4 py-2">
                              {user.first_name}
                            </td>
                            <td className="border px-4 py-2">
                              {user.last_name}
                            </td>
                            <td className="border px-4 py-2">{user.email}</td>
                            <td className="border px-4 py-2">
                              {user.department}
                            </td>
                            <td className="border px-4 py-2">
                              {user.phone_number}
                            </td>
                            <td className="border px-4 py-2 capitalize">
                              {user.role}
                            </td>
                            <td className="border px-4 py-3 flex justify-around gap-2">
                              <FiEdit2
                                className="text-blue-500 cursor-pointer"
                                title="Edit"
                                onClick={() => handleEdit(user)}
                              />
                              <FiTrash2
                                className="text-red-500 cursor-pointer"
                                title="Delete"
                                onClick={() => handleDelete(user.id)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {users.results.length === 0 && (
                    <p className="text-sm text-center text-gray-500 py-6">
                      No users found.
                    </p>
                  )}

                  <div className="flex justify-center items-center gap-4 mt-4">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={!users.previous}
                      className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span>Page {currentPage}</span>
                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!users.next}
                      className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUsers;

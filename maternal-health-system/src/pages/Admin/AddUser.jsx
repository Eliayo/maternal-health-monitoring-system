import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";
import { useNavigate } from "react-router-dom";
import axios from "../../services/axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import UserForm from "../../components/Common/UserForm";

const AddUser = () => {
  const navigate = useNavigate();

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [loading, setLoading] = useState(false);

  const { userId } = useParams(); // Check if editing
  const isEditMode = Boolean(userId);

  useEffect(() => {
    if (isEditMode) {
      axios
        .get(`/admin/get-user/${userId}/`)
        .then((res) => {
          setFormData(res.data); // Prefill form with user data
        })
        .catch(() => {
          toast.error("Failed to load user.");
        });
    }
  }, [isEditMode]);

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

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    department: "",
    address: "",
    sex: "male",
    role: "mother", // Default role, can be changed later
    designation: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedCredentials(null);

    // 🔥 Make a copy of formData
    const payload = { ...formData };

    // ✅ Remove designation if not provider
    if (payload.role !== "provider") {
      delete payload.designation;
    }

    try {
      if (isEditMode) {
        await axios.put(`/admin/update-user/${userId}/`, payload);
        toast.success("User updated successfully!");
        navigate("/admin/users/view");
      } else {
        const response = await axios.post("/admin/create-user/", payload);

        setGeneratedCredentials({
          custom_id: response.data.custom_id,
          username: response.data.username,
          password: response.data.password,
        });
      }

      toast.success("User created successfully!");
    } catch (error) {
      const errData = error.response?.data;

      if (errData?.email) {
        toast.error(`Email Error: ${errData.email}`);
      } else if (errData?.username) {
        toast.error(`Username Error: ${errData.username}`);
      } else if (errData?.sex) {
        toast.error(`Sex Error: ${errData.sex}`);
      } else if (typeof errData === "string") {
        toast.error(errData);
      } else {
        toast.error(
          "Failed to create user. Please check all fields and try again."
        );
      }

      console.error("User creation failed:", errData || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      department: "",
      address: "",
      sex: "male",
      role: "mother", // Reset to default role
      designation: "",
    });
    setGeneratedCredentials(null);
  };

  return (
    <div className="flex ">
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

        <div className="min-h-screen bg-gray-100 px-4 sm:px-6 pb-6 pt-4 font-pop ">
          <div className="w-full mx-auto mt-10 bg-white p-8 shadow-lg ">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-500">
                {isEditMode ? "Edit User" : "Add New User"}
              </h2>

              <button
                onClick={() => navigate("/admin/users/view")}
                className="text-blue-600  text-sm cursor-pointer"
              >
                View List
              </button>
            </div>

            {/* <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. John"
                  className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Doe"
                  className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. john.doe@example.com"
                  className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  maxLength={11}
                  required
                  placeholder="e.g. +2348123456789"
                  className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  placeholder="e.g. HR"
                  className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sex
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
                >
                  <option value={"male"}>Male</option>
                  <option value={"female"}>Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
                >
                  <option value="provider">Healthcare Provider</option>
                  <option value="mother">Mother</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 123 Main Street"
                  className="mt-1 w-full border border-gray-200 rounded-md px-4 py-2 shadow-md focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-900 hover:text-white px-5 py-2 rounded-md cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-2 rounded-md cursor-pointer"
                >
                  {loading
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                    ? "Update User"
                    : "Create User"}
                </button>
              </div>
            </form> */}
            <UserForm
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              handleReset={handleReset}
              isEditMode={isEditMode}
              loading={loading}
            />

            {generatedCredentials && (
              <div className="mt-6 bg-gray-100 p-4 rounded-md border border-gray-300">
                <h4 className="font-semibold mb-2 text-gray-700">
                  Generated Credentials:
                </h4>
                <p className="text-sm text-gray-700">
                  ID: <strong>{generatedCredentials.custom_id}</strong>
                </p>
                <p className="text-sm text-gray-700">
                  Username: <strong>{generatedCredentials.username}</strong>
                </p>
                <p className="text-sm text-gray-700">
                  Password: <strong>{generatedCredentials.password}</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser;

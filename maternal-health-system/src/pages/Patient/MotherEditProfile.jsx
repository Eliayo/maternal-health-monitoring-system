import React, { useEffect, useState } from "react";
import axios from "../../services/axios";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MotherEditProfile = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [form, setForm] = useState({});
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
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/mother/profile/");
        setForm(res.data);
      } catch (err) {
        toast.error("Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch("/mother/profile/update/", form);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Update failed. Try again.");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ToastContainer position="top-center" />
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
        <div className="w-full mx-auto p-6 font-pop">
          <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-white shadow p-4 rounded-lg"
          >
            <Input
              label="Phone Number"
              name="phone_number"
              value={form.phone_number || ""}
              onChange={handleChange}
            />
            <Input
              label="Address"
              name="address"
              value={form.address || ""}
              onChange={handleChange}
            />
            <Input
              label="Marital Status"
              name="marital_status"
              value={form.marital_status || ""}
              onChange={handleChange}
            />
            <Input
              label="Education Level"
              name="education_level"
              value={form.education_level || ""}
              onChange={handleChange}
            />
            <Input
              label="Occupation"
              name="occupation"
              value={form.occupation || ""}
              onChange={handleChange}
            />

            <h3 className="text-lg font-semibold mt-4">Next of Kin</h3>
            <Input
              label="Name"
              name="nok_name"
              value={form.nok_name || ""}
              onChange={handleChange}
            />
            <Input
              label="Relationship"
              name="nok_relationship"
              value={form.nok_relationship || ""}
              onChange={handleChange}
            />
            <Input
              label="Phone"
              name="nok_phone"
              value={form.nok_phone || ""}
              onChange={handleChange}
            />
            <Input
              label="Address"
              name="nok_address"
              value={form.nok_address || ""}
              onChange={handleChange}
            />
            <Input
              label="Occupation"
              name="nok_occupation"
              value={form.nok_occupation || ""}
              onChange={handleChange}
            />
            <Input
              label="Education"
              name="nok_education_level"
              value={form.nok_education_level || ""}
              onChange={handleChange}
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, name, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
    />
  </div>
);

const Loader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
  </div>
);

export default MotherEditProfile;

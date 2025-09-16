// src/pages/Patient/MotherSettings.jsx
import React, { useState, useEffect } from "react";
import axios from "../../services/axios";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";

/* ---------------- Toast Component ---------------- */
const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const bg =
    toast.type === "success"
      ? "bg-emerald-50 border-emerald-200"
      : "bg-red-50 border-red-200";
  const text = toast.type === "success" ? "text-emerald-800" : "text-red-800";

  useEffect(() => {
    const id = setTimeout(onClose, 4000);
    return () => clearTimeout(id);
  }, [toast, onClose]);

  return (
    <div
      className={`fixed right-4 top-4 z-50 max-w-sm w-full border ${bg} rounded-lg shadow p-3`}
    >
      <div className="flex items-start gap-3">
        <div className={`text-xs font-semibold ${text}`}>
          {toast.type === "success" ? "Success" : "Error"}
        </div>
        <div className="text-sm text-gray-700 flex-1">{toast.message}</div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>
    </div>
  );
};

/* ---------------- Input with Toggle Eye ---------------- */
const PasswordInput = ({ label, name, value, onChange, placeholder = "" }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative mt-1">
        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="block w-full border border-gray-300 rounded-lg px-3 py-2 pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
        >
          {visible ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );
};

/* ---------------- Password Rules Hint ---------------- */
const PasswordHints = () => (
  <ul className="mt-2 text-xs text-gray-500 list-disc list-inside space-y-1">
    <li>At least 8 characters</li>
    <li>At least 1 uppercase letter</li>
    <li>At least 1 number</li>
    <li>At least 1 special character (@, $, !, %, *, ?, &)</li>
  </ul>
);

/* ---------------- Password Form ---------------- */
const PasswordForm = ({ form, onChange, onSubmit, loading }) => (
  <form
    onSubmit={onSubmit}
    className="space-y-4 bg-white shadow p-4 rounded-lg"
  >
    <PasswordInput
      label="Old Password"
      name="old_password"
      value={form.old_password}
      onChange={onChange}
    />

    <div>
      <PasswordInput
        label="New Password"
        name="new_password"
        value={form.new_password}
        onChange={onChange}
      />
      <PasswordHints />
    </div>

    <PasswordInput
      label="Confirm New Password"
      name="confirm_password"
      value={form.confirm_password}
      onChange={onChange}
    />

    <button
      type="submit"
      disabled={loading}
      className={`w-full py-2 rounded-lg text-white ${
        loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {loading ? "Updating..." : "Update Password"}
    </button>
  </form>
);

/* ---------------- Main Component ---------------- */
const MotherSettings = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  /* Sidebar toggle outside click */
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

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const showToast = (type, message) => setToast({ type, message });
  const closeToast = () => setToast(null);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.old_password) {
      showToast("error", "Please provide your current password.");
      return;
    }
    if (form.new_password !== form.confirm_password) {
      showToast("error", "New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put("/mother/change-password/", {
        old_password: form.old_password,
        new_password: form.new_password,
      });
      showToast(
        "success",
        res.data?.detail || "Password updated successfully."
      );
      setForm({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      const data = err.response?.data;
      let msg = "Failed to update password.";
      if (data?.old_password) msg = data.old_password[0];
      else if (data?.new_password) msg = data.new_password[0];
      else if (data?.detail) msg = data.detail;
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toast toast={toast} onClose={closeToast} />

      <Sidebar
        isMobileVisible={isSidebarVisible}
        isCollapsed={isSidebarCollapsed}
        role="mother"
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-60"
        }`}
      >
        <Topbar
          onMenuClick={(width) => {
            if (width < 1024) setIsSidebarVisible((p) => !p);
            else setIsSidebarCollapsed((p) => !p);
          }}
          isCollapsed={isSidebarCollapsed}
        />

        <div className="w-full md:w-2/4 mx-auto p-6 font-pop">
          <h2 className="text-2xl font-bold mb-4">Change Password</h2>
          <PasswordForm
            form={form}
            onChange={onChange}
            onSubmit={onSubmit}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default MotherSettings;

import React, { useState } from "react";
import axios from "../../services/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const PasswordUpdate = ({ roleOverride }) => {
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [passwordErrors, setPasswordErrors] = useState([]);
  const [show, setShow] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const role = roleOverride || localStorage.getItem("role") || "mother";
  const endpoint = `/${role}/update-password/`;
  const redirect = `/${role}/dashboard`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "new_password") {
      setPasswordErrors(validatePasswordStrength(value));
    }
  };

  const toggleShow = (field) => {
    setShow((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePasswordStrength = (pwd) => {
    const errors = [];
    if (pwd.length < 8) errors.push("At least 8 characters.");
    if (!/[A-Z]/.test(pwd)) errors.push("At least one uppercase letter.");
    if (!/[a-z]/.test(pwd)) errors.push("At least one lowercase letter.");
    if (!/[0-9]/.test(pwd)) errors.push("At least one digit.");
    if (!/[!@#$%^&*]/.test(pwd))
      errors.push("At least one special character (!@#$%^&*).");
    return errors;
  };

  const handleSubmit = async () => {
    if (!form.old_password || !form.new_password || !form.confirm_password) {
      toast.error("All fields are required.");
      return;
    }

    if (form.new_password !== form.confirm_password) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await axios.put(endpoint, {
        old_password: form.old_password,
        new_password: form.new_password,
      });

      localStorage.setItem("must_change_password", "false");
      toast.success("Password updated successfully!");
      navigate(redirect);
    } catch (err) {
      const errMsg =
        err.response?.data?.old_password?.[0] ||
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.detail ||
        "Password update failed.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Password strength meter (0 to 5)
  const strengthScore = 5 - passwordErrors.length;

  return (
    <div className="w-full max-w-md bg-white border shadow-md rounded-lg p-6 space-y-5">
      <h2 className="text-xl font-semibold text-center text-gray-800">
        Update Password
      </h2>

      {/* Current Password */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Current Password
        </label>
        <div className="relative">
          <input
            type={show.old ? "text" : "password"}
            name="old_password"
            value={form.old_password}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-400"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 text-gray-500"
            onClick={() => toggleShow("old")}
          >
            {show.old ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label className="block text-sm font-medium mb-1">New Password</label>
        <div className="relative">
          <input
            type={show.new ? "text" : "password"}
            name="new_password"
            value={form.new_password}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-400"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 text-gray-500"
            onClick={() => toggleShow("new")}
          >
            {show.new ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Password strength meter */}
        <div className="h-2 mt-2 bg-gray-200 rounded">
          <div
            className={`h-full rounded transition-all duration-300 ${
              strengthScore < 2
                ? "bg-red-500 w-1/5"
                : strengthScore < 4
                ? "bg-yellow-500 w-3/5"
                : "bg-green-500 w-full"
            }`}
          ></div>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={show.confirm ? "text" : "password"}
            name="confirm_password"
            value={form.confirm_password}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-400"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 text-gray-500"
            onClick={() => toggleShow("confirm")}
          >
            {show.confirm ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      {/* Strength errors */}
      {passwordErrors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded text-sm text-red-700 space-y-1">
          {passwordErrors.map((err, i) => (
            <div key={i}>• {err}</div>
          ))}
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded font-medium transition-all disabled:opacity-50"
      >
        {loading ? "Updating..." : "Update Password"}
      </button>
    </div>
  );
};

export default PasswordUpdate;

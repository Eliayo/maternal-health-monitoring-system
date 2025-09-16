import { useState, useEffect } from "react";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";
import axios from "../../services/axios";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(null);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const strengthColors = [
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-blue-400",
    "bg-green-500",
  ];
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    department: "",
    address: "",
    sex: "",
  });

  const [settings, setSettings] = useState({
    reminder_time_in_hours: "",
    allow_mother_reschedule: false,
    timezone: "",
    notify_email: true,
    notify_sms: false,
  });

  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("Must be at least 8 characters.");
    if (!/[A-Z]/.test(password))
      errors.push("Must include an uppercase letter.");
    if (!/[a-z]/.test(password))
      errors.push("Must include a lowercase letter.");
    if (!/[0-9]/.test(password)) errors.push("Must include a digit.");
    if (!/[!@#$%^&*]/.test(password))
      errors.push("Must include a special character (!@#$...).");
    return errors;
  };

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;
    return score;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, settingsRes] = await Promise.all([
          axios.get("/admin/profile-update/"),
          axios.get("/admin/system-settings/"),
        ]);
        setFormData(profileRes.data);
        setSettings(settingsRes.data);
      } catch (err) {
        console.error("Failed to load data", err);
        toast.error("Failed to load settings or profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));

    // Only validate new_password field
    if (name === "new_password") {
      setPasswordErrors(validatePassword(value));
    }
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put("/admin/profile-update/", formData);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update failed", err);
      toast.error("Failed to update profile.");
    }
  };

  const handleSaveSettings = async () => {
    try {
      await axios.post("/admin/system-settings/", settings);
      toast.success("System settings updated successfully!");
    } catch (err) {
      console.error("Settings update failed", err);
      toast.error("Failed to update settings.");
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      await axios.put("/change-password/", {
        old_password: passwords.current_password,
        new_password: passwords.new_password,
      });
      toast.success("Password changed successfully!");
      setPasswords({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      const errors = err.response?.data || {};
      const allErrors = [
        ...(errors.old_password || []),
        ...(errors.new_password || []),
        ...(errors.detail ? [errors.detail] : []),
      ];

      allErrors.forEach((msg) => toast.error(msg));
    }
  };

  const confirmAction = (action) => {
    setShowConfirm(action);
  };

  const executeAction = () => {
    if (showConfirm === "saveSettings") handleSaveSettings();
    else if (showConfirm === "saveProfile") handleSaveProfile();
    setShowConfirm(null);
  };

  if (loading) return <p className="p-6">Loading...</p>;

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

        <div className="min-h-screen bg-gray-100 px-6 pt-6 pb-10 font-pop text-sm">
          <div className="mx-auto bg-white p-6 shadow rounded">
            <div className="mb-6 border-b pb-4 flex gap-4">
              {["profile", "system", "password"].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-t ${
                    activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "profile"
                    ? "Profile"
                    : tab === "system"
                    ? "System Settings"
                    : "Change Password"}
                </button>
              ))}
            </div>

            {/* Tabs */}
            {activeTab === "profile" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Update Admin Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "first_name",
                    "last_name",
                    "email",
                    "phone_number",
                    "department",
                  ].map((field) => (
                    <input
                      key={field}
                      type="text"
                      name={field}
                      placeholder={field
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      value={formData[field] || ""}
                      onChange={handleProfileChange}
                      className="border p-2 rounded"
                    />
                  ))}
                  <select
                    name="sex"
                    value={formData.sex || ""}
                    onChange={handleProfileChange}
                    className="border p-2 rounded"
                  >
                    <option value="">Select Sex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  <textarea
                    name="address"
                    value={formData.address || ""}
                    onChange={handleProfileChange}
                    placeholder="Address"
                    className="border p-2 rounded resize-y min-h-[40px]"
                    rows={3}
                  />
                </div>
                <button
                  onClick={() => confirmAction("saveProfile")}
                  className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save Profile
                </button>
              </div>
            )}

            {activeTab === "system" && (
              <div>
                <h2 className="text-xl font-bold mb-4">System Settings</h2>
                <div className="mb-4">
                  <label className="block font-medium mb-1">
                    Reminder Time (hours)
                  </label>
                  <input
                    type="number"
                    name="reminder_time_in_hours"
                    value={settings.reminder_time_in_hours || ""}
                    onChange={handleSettingsChange}
                    className="border p-2 rounded md:w-1/2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block font-medium mb-1">Timezone</label>
                  <select
                    name="timezone"
                    value={settings.timezone || ""}
                    onChange={handleSettingsChange}
                    className="border p-2 rounded w-full md:w-1/2"
                  >
                    <option value="">Select Timezone</option>
                    <option value="Africa/Lagos">Africa/Lagos</option>
                    <option value="UTC">UTC</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="allow_mother_reschedule"
                    checked={settings.allow_mother_reschedule}
                    onChange={handleSettingsChange}
                  />
                  <label>Allow Mothers to Reschedule Appointments</label>
                </div>
                <div className="mb-4 flex flex-col md:flex-row gap-4">
                  <label>
                    <input
                      type="checkbox"
                      name="notify_email"
                      checked={settings.notify_email}
                      onChange={handleSettingsChange}
                    />
                    <span className="ml-2">Receive Email Notifications</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="notify_sms"
                      checked={settings.notify_sms}
                      onChange={handleSettingsChange}
                    />
                    <span className="ml-2">Receive SMS Notifications</span>
                  </label>
                </div>
                <button
                  onClick={() => confirmAction("saveSettings")}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save Settings
                </button>
              </div>
            )}

            {activeTab === "password" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Change Password</h2>
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="current_password"
                    placeholder="Current Password"
                    value={passwords.current_password}
                    onChange={handlePasswordChange}
                    className="border p-2 rounded md:w-1/3"
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="new_password"
                      placeholder="New Password"
                      value={passwords.new_password}
                      onChange={handlePasswordChange}
                      className="border p-2 rounded w-full md:w-1/3"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-gray-500 md:right-[76em] md:top-2"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Inline validation */}
                  {passwordErrors.length > 0 && (
                    <ul className="text-red-600 text-sm list-disc pl-5">
                      {passwordErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  )}

                  {/* Password strength meter */}
                  <div className="h-2 bg-gray-300 rounded">
                    <div
                      className={`h-full rounded transition-all duration-300 ${
                        strengthColors[
                          getPasswordStrength(passwords.new_password) - 1
                        ]
                      }`}
                      style={{
                        width: `${
                          (getPasswordStrength(passwords.new_password) / 5) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 ">
                    Strength:{" "}
                    {strengthLabels[
                      getPasswordStrength(passwords.new_password) - 1
                    ] || "Too Weak"}
                  </p>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirm_password"
                    placeholder="Confirm New Password"
                    value={passwords.confirm_password}
                    onChange={handlePasswordChange}
                    className="border p-2 rounded md:w-1/3"
                  />

                  <button
                    onClick={handleChangePassword}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 md:w-1/3"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
              <div className="fixed inset-0  flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow-md max-w-sm text-center">
                  <h2 className="text-lg font-semibold mb-4">Are you sure?</h2>
                  <p className="mb-6">
                    This action will update your{" "}
                    {showConfirm === "saveProfile"
                      ? "profile"
                      : "system settings"}
                    .
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={executeAction}
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowConfirm(null)}
                      className="bg-gray-300 px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

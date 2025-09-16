import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";
import { useNavigate } from "react-router-dom";
import axios from "../../services/axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import UserForm from "../../components/Common/UserForm";

const PatientBiodata = () => {
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
    department: "", // Can be omitted later
    address: "",
    sex: "female",
    role: "mother", // locked role
    designation: "", // irrelevant here
    // provider-only fields
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

    const payload = { ...formData, role: "mother" };

    try {
      const response = await axios.post("/provider/add-mother/", payload);

      setGeneratedCredentials({
        custom_id: response.data.credentials?.custom_id || "N/A",
        username: response.data.credentials?.username || "N/A",
        password: response.data.credentials?.password || "N/A",
      });

      toast.success("Mother registered successfully!");
    } catch (error) {
      const errData = error.response?.data;

      if (errData?.email) {
        toast.error(`Email Error: ${errData.email}`);
      } else if (typeof errData === "string") {
        toast.error(errData);
      } else {
        toast.error("Failed to register mother. Check form and try again.");
      }

      console.error("Registration failed:", errData || error.message);
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
      sex: "female",
      role: "mother",
      designation: "",
      religion: "",
      ethnic_group: "",
      date_of_birth: "",
      marital_status: "",
      education_level: "",
      occupation: "",
      nok_name: "",
      nok_relationship: "",
      nok_address: "",
      nok_phone: "",
      nok_occupation: "",
      nok_education_level: "",
    });
    setGeneratedCredentials(null);
  };

  return (
    <div className="flex ">
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
          onMenuClick={(width) => {
            if (width < 1024) {
              setIsSidebarVisible((prev) => !prev);
            } else {
              setIsSidebarCollapsed((prev) => !prev);
            }
          }}
          isCollapsed={isSidebarCollapsed}
        />

        <div className="min-h-screen bg-gray-100 px-4 sm:px-6 pb-6 pt-4 font-pop">
          <div className="w-full mx-auto mt-10 bg-white p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-500">
                Register New Mother
              </h2>

              <button
                onClick={() => navigate("/provider/users/view")}
                className="text-blue-600 text-sm cursor-pointer"
              >
                View Mothers
              </button>
            </div>

            <UserForm
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              handleReset={handleReset}
              isEditMode={false}
              loading={loading}
              allowedRoles={["mother"]}
              showRoleSelect={false}
              showDepartment={false}
              showEmail={false}
              isProviderAddingMother={true}
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

export default PatientBiodata;

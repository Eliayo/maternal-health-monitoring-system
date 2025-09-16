import React, { useEffect, useState } from "react";
import axios from "../../services/axios";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";
import { useNavigate } from "react-router-dom";

const PatientProfile = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
        setProfile(res.data);
      } catch (err) {
        setError("Unable to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="flex min-h-screen bg-gray-50">
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
          <h2 className="text-2xl font-bold mb-4">My Profile</h2>
          <div className="bg-white shadow rounded-lg p-4 space-y-3">
            <Info
              label="Full Name"
              value={`${profile.first_name} ${profile.last_name}`}
            />
            <Info label="Username" value={profile.username} />
            <Info label="Mother ID" value={profile.custom_id} />
            <Info label="Email" value={profile.email} />
            <Info label="Phone" value={profile.phone_number} />
            <Info label="Address" value={profile.address} />
            <Info label="Date of Birth" value={profile.date_of_birth} />
            <Info label="Marital Status" value={profile.marital_status} />
            <Info label="Education" value={profile.education_level} />
            <Info label="Occupation" value={profile.occupation} />
          </div>

          <h3 className="text-xl font-semibold mt-6 mb-3">Next of Kin</h3>
          <div className="bg-white shadow rounded-lg p-4 space-y-3">
            <Info label="Name" value={profile.nok_name} />
            <Info label="Relationship" value={profile.nok_relationship} />
            <Info label="Phone" value={profile.nok_phone} />
            <Info label="Address" value={profile.nok_address} />
            <Info label="Occupation" value={profile.nok_occupation} />
            <Info label="Education" value={profile.nok_education_level} />
          </div>
          <button
            onClick={() => navigate("/mother/update-profile")}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <p>
    <span className="font-medium">{label}:</span>{" "}
    {value ? value : <span className="text-gray-500">N/A</span>}
  </p>
);

const Loader = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
  </div>
);

export default PatientProfile;

import React, { useState } from "react";
import {
  MdDashboard,
  MdOutlineEventNote,
  MdPeopleOutline,
  MdSettings,
  MdAssessment,
  MdLogout,
} from "react-icons/md";
import { RiHealthBookFill } from "react-icons/ri";
import { IoNotificationsSharp } from "react-icons/io5";
import { RxActivityLog } from "react-icons/rx";
import { FaUserNurse } from "react-icons/fa";
import { FcAssistant } from "react-icons/fc";
import { Link } from "react-router-dom";
import { IoIosArrowForward, IoIosArrowDown } from "react-icons/io";
import { MdOutlineTipsAndUpdates } from "react-icons/md";
import { IoNotificationsOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";

const Sidebar = ({ isMobileVisible, isCollapsed, role }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleDropdownToggle = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const navItemsByRole = {
    admin: [
      {
        name: "Dashboard",
        icon: <MdDashboard size={20} />,
        path: "/admin/dashboard",
      },
      {
        name: "Manage Users",
        icon: <MdPeopleOutline size={20} />,
        dropdown: [
          { name: "Add User", path: "/admin/users/add" },
          { name: "View Users", path: "/admin/users/view" },
        ],
      },
      {
        name: "Appointments",
        icon: <MdOutlineEventNote size={20} />,
        dropdown: [
          { name: "Add Appointment", path: "/admin/appointments/add" },
          { name: "View Appointments", path: "/admin/appointments/view" },
        ],
      },
      {
        name: "Notification",
        icon: <MdAssessment size={20} />,
        path: "/admin/notifications",
      },
      {
        name: "Activity Logs",
        icon: <RxActivityLog size={20} />,
        path: "/admin/activity-logs",
      },
      {
        name: "Settings",
        icon: <MdSettings size={20} />,
        path: "/admin/settings",
      },
    ],
    provider: [
      {
        name: "Dashboard",
        icon: <MdDashboard size={20} />,
        path: "/provider/dashboard",
      },
      {
        name: "Biodata",
        icon: <MdPeopleOutline size={20} />,
        dropdown: [
          { name: "Add ", path: "/provider/users/add" },
          { name: "View Mothers", path: "/provider/users/view" },
        ],
      },
      // {
      //   name: "Patient Records",
      //   icon: <FaUserNurse size={20} />,
      //   path: "/provider/patients",
      // },
      {
        name: "Appointments",
        icon: <MdOutlineEventNote size={20} />,
        path: "/provider/appointments",
      },
      {
        name: "Notifications",
        icon: <IoNotificationsOutline size={20} />,
        path: "/provider/notifications",
      },
      {
        name: "Profile",
        icon: <CgProfile size={20} />,
        path: "/provider/profile",
      },
      {
        name: "Settings",
        icon: <MdSettings size={20} />,
        path: "/provider/settings",
      },
    ],
    mother: [
      {
        name: "Dashboard",
        icon: <MdDashboard size={20} />,
        path: "/mother/dashboard",
      },
      {
        name: "Appointments",
        icon: <MdOutlineEventNote size={20} />,
        path: "/mother/appointments",
      },
      {
        name: "Health Records",
        icon: <RiHealthBookFill size={20} />,
        path: "/mother/records",
      },
      {
        name: "Profile",
        icon: <MdPeopleOutline size={20} />,
        path: "/mother/profile",
      },
      {
        name: "Notifications",
        icon: <IoNotificationsSharp size={20} />,
        path: "/mother/notifications",
      },
      {
        name: "Health Tips",
        icon: <MdOutlineTipsAndUpdates size={20} />,
        path: "/mother/health-tips",
      },
      {
        name: "Settings",
        icon: <MdSettings size={20} />,
        path: "/mother/settings",
      },

      // {
      //   name: "Smart Assistant",
      //   icon: <FcAssistant size={20} />,
      //   path: "/mother/assistant",
      // },
    ],
  };

  const navItems = navItemsByRole[role] || [];

  return (
    <div
      className={`sidebar fixed top-0 left-0 h-screen z-20 bg-white border-r border-gray-200 transition-all duration-300 shadow-sm
        ${isMobileVisible ? "w-60" : "hidden"}
        ${!isMobileVisible && "lg:block"}
        ${isCollapsed ? "lg:w-20" : "lg:w-60"}
        flex flex-col justify-between font-open
      `}
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-center h-[4.2rem] border-b border-gray-200">
          <h2
            className={`text-xl font-semibold text-purple-700 tracking-tight font-open transition-opacity duration-300 ${
              isCollapsed ? "opacity-0" : "opacity-100"
            }`}
          >
            MaternalCare+
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 pt-6">
          {navItems.map((item, index) =>
            item.dropdown ? (
              <div key={index} className="group">
                <div
                  onClick={() => handleDropdownToggle(item.name)}
                  className="flex items-center justify-between px-4 py-3 text-gray-700 hover:text-purple-700 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span>{item.icon}</span>
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </div>
                  {!isCollapsed &&
                    (openDropdown === item.name ? (
                      <IoIosArrowDown />
                    ) : (
                      <IoIosArrowForward />
                    ))}
                </div>
                {/* Dropdown Items */}
                {!isCollapsed && openDropdown === item.name && (
                  <div className="ml-10">
                    {item.dropdown.map((sub, i) => (
                      <Link
                        key={i}
                        to={sub.path}
                        className="block py-1.5 text-sm text-gray-600 hover:text-purple-700"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={index}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-purple-700 hover:bg-gray-100 transition duration-200 group"
              >
                <span className="text-xl">{item.icon}</span>
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </Link>
            )
          )}
        </nav>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 cursor-pointer">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm cursor-pointer"
        >
          <MdLogout size={20} />
          {!isCollapsed && <span className="cursor-pointer">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login";
import ProtectedRoute from "../components/Common/ProtectedRoute";

// Patient Pages
import PatientDashboard from "../pages/Patient/PatientDashboard";
import PatientProfile from "../pages/Patient/PatientProfile";
import MotherSettings from "../pages/Patient/MotherSettings";
import PatientAppointments from "../pages/Patient/PatientAppointments";
import PatientRecords from "../pages/Patient/PatientRecords";
import PatientPassword from "../pages/Patient/PatientPassword";
import MotherEditProfile from "../pages/Patient/MotherEditProfile";
import MotherNotifications from "../pages/Patient/MotherNotifications";
import MotherHealthTips from "../pages/Patient/MotherHealthTips";
import SmartAssistant from "../pages/Patient/SmartAssistant";

// Healthcare Pages
import HC_Dashboard from "../pages/Healthcare/HC_Dashboard";
import PatientsList from "../pages/Healthcare/PatientsList";
import ProviderPassword from "../pages/Healthcare/ProviderPassword";
import ProviderChangePassword from "../pages/Healthcare/ProviderChangePassword";
import PatientBiodata from "../pages/Healthcare/PatientBiodata.jsx";
import ProviderHealthRecord from "../pages/Healthcare/ProviderHealthRecord";
import ProviderAppointments from "../pages/Healthcare/ProviderAppointments";
import ProviderNotifications from "../pages/Healthcare/ProviderNotifications";
import ProviderProfile from "../pages/Healthcare/ProviderProfile";

// Admin Pages
import {
  AdminDashboard,
  AddUser,
  ViewUsers,
  AddAppointment,
  ViewAppointments,
  AdminNotification,
  Settings,
  ActivityLogs,
} from "../pages/Admin/index.js";

// Layout
import Layout from "../components/Common/Layout";

// Error Pages
import Forbidden from "../pages/Error/Forbidden";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes for PATIENT */}
      <Route element={<ProtectedRoute allowedRoles={["mother"]} />}>
        <Route path="/mother/dashboard" element={<PatientDashboard />} />
        <Route path="/mother/profile" element={<PatientProfile />} />
        <Route path="/mother/settings" element={<MotherSettings />} />
        <Route path="/mother/appointments" element={<PatientAppointments />} />
        <Route path="/mother/records" element={<PatientRecords />} />
        <Route path="/mother/update-password" element={<PatientPassword />} />
        <Route path="/mother/update-profile" element={<MotherEditProfile />} />
        <Route path="/mother/notifications" element={<MotherNotifications />} />
        <Route path="/mother/health-tips" element={<MotherHealthTips />} />
        <Route path="/mother/assistant" element={<SmartAssistant />} />
      </Route>

      {/* Protected Routes for HEALTHCARE */}
      <Route element={<ProtectedRoute allowedRoles={["provider"]} />}>
        <Route path="/provider/dashboard" element={<HC_Dashboard />} />
        <Route path="/provider/users/view" element={<PatientsList />} />
        <Route path="/provider/users/add" element={<PatientBiodata />} />
        <Route
          path="/provider/notifications"
          element={<ProviderNotifications />}
        />
        <Route path="/provider/profile" element={<ProviderProfile />} />
        <Route
          path="/provider/update-password"
          element={<ProviderPassword />}
        />
        <Route path="/provider/settings" element={<ProviderChangePassword />} />
        <Route
          path="/provider/patients/:customId/health"
          element={<ProviderHealthRecord />}
        />
        <Route
          path="/provider/appointments"
          element={<ProviderAppointments />}
        />
      </Route>

      {/* Protected Routes for ADMIN */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users/add" element={<AddUser />} />
        <Route path="/admin/users/edit/:userId" element={<AddUser />} />
        <Route path="/admin/users/view" element={<ViewUsers />} />
        <Route path="/admin/appointments/add" element={<AddAppointment />} />
        <Route path="/admin/appointments/view" element={<ViewAppointments />} />
        <Route path="/admin/notifications" element={<AdminNotification />} />
        <Route path="/admin/activity-logs" element={<ActivityLogs />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/403" element={<Forbidden />} />
    </Routes>
  );
};

export default AppRoutes;

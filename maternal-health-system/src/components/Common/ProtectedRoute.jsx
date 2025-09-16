import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../../services/authService";
import Layout from "../Common/Layout";

const ProtectedRoute = ({ allowedRoles }) => {
  const authenticated = isAuthenticated();
  const userRole = getUserRole();
  const mustChange = localStorage.getItem("must_change_password") === "true";
  const path = window.location.pathname;

  if (mustChange && !path.includes("update-password")) {
    return <Navigate to={`/${userRole}/update-password`} replace />;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/403" replace />;
  }

  return (
    <Outlet />
    // <Layout role={userRole}>
    //   //{" "}
    // </Layout>
  );
};

export default ProtectedRoute;

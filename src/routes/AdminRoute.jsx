import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const token = localStorage.getItem("admin_access");
  const user = JSON.parse(localStorage.getItem("admin_user"));

  if (!token || !user?.is_staff) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;

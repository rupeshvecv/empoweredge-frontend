import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import PortalSelector from "../pages/PortalSelector";
import RoleTable from "../pages/admin/RoleTable";
import UserTable from "../pages/admin/UserTable";

function RequireAdmin({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.role === "admin"
    ? children
    : <div className="p-8 text-center text-2xl text-red-600">Not Authorized</div>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* <Route path="/" element={<Navigate to="/login" />} /> */}
      
      {/* extra */}
      <Route path="/" element={<Navigate to="/portals" />} />

      
      <Route path="/login" element={<Login />} />
      <Route path="/portals" element={<PortalSelector />} />
      <Route path="/admin/role" element={<RequireAdmin><RoleTable /></RequireAdmin>} />
      <Route path="/admin/user" element={<RequireAdmin><UserTable /></RequireAdmin>} />
      <Route path="*" element={<div className="p-8 text-center text-3xl">404 – Page not found</div>} />
    </Routes>
  );
}

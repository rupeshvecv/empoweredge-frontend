import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import PortalSelector from '../pages/PortalSelector';
import Login from '../pages/Login';
import ProtectedPage from '../pages/ProtectedPage';
import Role from "../pages/admin/RoleTable";
import User from '../pages/admin/UserTable';
import DeptTable from "../pages/admin/Dept";
import DesignationTable from "../pages/admin/Designation";
import Status from "../pages/admin/Status";
import LocationTable from "../pages/admin/Location"; // Import LocationTable
import authService from '../services/authService'; // Import authService
import Layout from '../components/Layout'; // Import Layout component
import { Outlet } from 'react-router-dom'; // Import Outlet

function RequireAuth({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await authService.isAuthenticated();
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  if (isAuthenticated === null) {
    return null; // or a loading indicator
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}

function RequireAdmin({ children }) {
  const user = authService.getCurrentUser(); // Get current user from authService (decodes JWT)
  if (user?.roles?.includes("Admin")) { // Check if roles array includes "Admin"
    return children;
  } else {
    return <div className="p-8 text-center text-2xl text-red-600">Not Authorized</div>;
  }
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<RequireAuth />}>
        <Route path="/portalselector" element={<Layout><PortalSelector /></Layout>} />
        <Route path="portals" element={<Layout><ProtectedPage /></Layout>} />
        
        
        {/* Admin Protected Routes - using RequireAuth and then RequireAdmin */}
        <Route path="roleTable" element={<Layout><RequireAdmin><Role /></RequireAdmin></Layout>} />
        <Route path="userTable" element={<Layout><RequireAdmin><User /></RequireAdmin></Layout>} />
        <Route path="admin/dept" element={<Layout><RequireAdmin><DeptTable /></RequireAdmin></Layout>} />
        <Route path="admin/designation" element={<Layout><RequireAdmin><DesignationTable /></RequireAdmin></Layout>} />
        <Route path="admin/status" element={<Layout><RequireAdmin><Status /></RequireAdmin></Layout>} />
        <Route path="admin/location" element={<Layout><RequireAdmin><LocationTable /></RequireAdmin></Layout>} />
        {/* add other routes */}
      </Route>
    </Routes>
  );
}

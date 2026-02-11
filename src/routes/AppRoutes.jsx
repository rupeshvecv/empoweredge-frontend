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

function RequireADMIN({ children }) {
  const user = authService.getCurrentUser(); // Get current user from authService (decodes JWT)
  if (user?.roles?.includes("ADMIN")) { // Check if roles array includes "ADMIN"
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
        
        
        {/* ADMIN Protected Routes - using RequireAuth and then RequireADMIN */}
        <Route path="roleTable" element={<Layout><RequireADMIN><Role /></RequireADMIN></Layout>} />
        <Route path="userTable" element={<Layout><RequireADMIN><User /></RequireADMIN></Layout>} />
        <Route path="ADMIN/dept" element={<Layout><RequireADMIN><DeptTable /></RequireADMIN></Layout>} />
        <Route path="ADMIN/designation" element={<Layout><RequireADMIN><DesignationTable /></RequireADMIN></Layout>} />
        <Route path="ADMIN/status" element={<Layout><RequireADMIN><Status /></RequireADMIN></Layout>} />
        <Route path="ADMIN/location" element={<Layout><RequireADMIN><LocationTable /></RequireADMIN></Layout>} />
        {/* add other routes */}
      </Route>
    </Routes>
  );
}

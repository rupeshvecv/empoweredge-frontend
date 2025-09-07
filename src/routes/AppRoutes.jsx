import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PortalSelector from '../pages/PortalSelector';
import Callback from '../pages/Callback';
import Login from '../pages/Login';
import ProtectedPage from '../pages/ProtectedPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PortalSelector />} />
      <Route path="/callback" element={<Callback />} />
      <Route path="/login" element={<Login />} />
      <Route path="/portals" element={<ProtectedPage />} />
      {/* add other routes */}
    </Routes>
  );
}

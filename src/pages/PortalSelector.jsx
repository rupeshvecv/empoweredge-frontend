import { useNavigate } from "react-router-dom";
import React from "react";
import ingeniologo from "../assets/ingeniologo.jpg";

const portals = [
  {
    name: "EDC",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        fill="none"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    description: "Engine Development Center.",
    // instead of route inside same app → full URL
    url: "/EDC/"
  },
    { name: "Timesheet", icon: "⏱️", description: "Track and manage your work hours.", url: "/TimeSheet/" },

    { name: "Ingenio", icon: (<img src={ingeniologo} alt="Ingenio" className="h-16 w-16 object-contain" />), description: "Innovation entry portal.", url: "/Ingenio/", },
  // { name: "Timesheet", icon: "⏱️", description: "Track and manage your work hours.", disabled: true },
  { name: "Samadhan", icon: "🛠️", description: "Centralised issue-resolution portal.", disabled: true }
  
];

import { useEffect } from 'react';
import { getToken } from '../services/authService';
import { jwtDecode } from "jwt-decode";

export default function PortalSelector() {
  const nav = useNavigate();


  // Get user roles from token
  const [userRoles, setUserRoles] = React.useState([]);
  React.useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserRoles(decodedToken.roles || []);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);


  // Determine which portals are clickable based on role
  const getPortalDisabled = (portalName) => {
    if (userRoles.includes("ADMIN")) return false;
    if (userRoles.includes("EDC")) return portalName !== "EDC";
    if (userRoles.includes("TIMESHEET")) return portalName !== "Timesheet";
    return true; // If no relevant role, disable all
  };

  const handleClick = (p) => {
    if (p.disabled || getPortalDisabled(p.name)) return;
    if (p.url) {
      window.location.href = p.url;
    } else if (p.route) {
      nav(p.route);
    }
  };

  return (
    <main className="max-w-6xl pt-7 my-4 mx-auto text-center">
      <p className="text-gray-600 text-3xl font-medium mb-12">
        Choose where you want to begin your work.
      </p>
        <div className="grid gap-10 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          {portals
            .filter((p) => !(p.disabled || getPortalDisabled(p.name)))
            .map((p) => (
              <div
                key={p.name}
                onClick={() => handleClick(p)}
                className={`portal-card bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center transition-all cursor-pointer hover:-translate-y-2 hover:shadow-2xl`}
              >
                <div className="mb-4 text-4xl text-indigo-700">{p.icon}</div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900">{p.name}</h3>
                <p className="text-gray-600 text-sm">{p.description}</p>
              </div>
            ))}
         </div>
      </main>
  );
}

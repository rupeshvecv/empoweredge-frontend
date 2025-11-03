import { useNavigate } from "react-router-dom";
import React from "react";

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
  { name: "Samadhan", icon: "🛠️", description: "Centralised issue-resolution portal.", disabled: true },
  { name: "Timesheet", icon: "⏱️", description: "Track and manage your work hours.", disabled: true }
];

import { useEffect } from 'react';
import { getToken } from '../services/authService';
import { jwtDecode } from "jwt-decode";

export default function PortalSelector() {
  const nav = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const handleClick = (p) => {
    if (p.disabled) return;
    if (p.url) {
      // 🔹 Redirect to another app
      window.location.href = p.url;
    } else if (p.route) {
      // 🔹 Navigate within same app
      nav(p.route);
    }
  };

  return (
    <main className="max-w-6xl pt-7 my-4 mx-auto text-center">
      <p className="text-gray-600 text-3xl font-medium mb-12">
        Choose where you want to begin your work.
      </p>
        <div className="grid gap-10 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {portals.map((p) => (
            <div
              key={p.name}
              onClick={() => handleClick(p)}
              className={`portal-card bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center transition-all cursor-pointer ${
                p.disabled
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:-translate-y-2 hover:shadow-2xl"
              }`}
            >
              <div
                className={`mb-4 text-4xl ${
                  p.disabled ? "text-gray-400" : "text-indigo-700"
                }`}
              >
                {p.icon}
              </div>
              <h3
                className={`text-2xl font-bold mb-2 ${
                  p.disabled ? "text-gray-600" : "text-gray-900"
                }`}
              >
                {p.name}
              </h3>
              <p className="text-gray-600 text-sm">{p.description}</p>
              {p.disabled && (
                <span className="mt-4 text-xs font-semibold text-red-500 bg-red-100 px-3 py-1 rounded-full">
                  Coming Soon
                </span>
              )}
            </div>
          ))}
        </div>
      </main>
  );
}

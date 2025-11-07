import logo from "../assets/logo.jpg";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import authService from '../services/authService'; // Import authService
import { jwtDecode } from 'jwt-decode';

export default function Header() {
  const [animate, setAnimate] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  // Prefer reading user info directly from the JWT so profilePic comes from token
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = authService.getToken();
      if (token) {
        const decoded = jwtDecode(token);
        const stored = authService.getCurrentUser();
        return { ...decoded, profilePic: decoded.profilePic || stored?.profilePic };
      }
    } catch (e) {
      console.error('Failed to decode token on init:', e);
    }
    return authService.getCurrentUser();
  });

  useEffect(() => {
    const handler = () => {
      try {
        const token = authService.getToken();
        if (token) {
          const decoded = jwtDecode(token);
          const stored = authService.getCurrentUser();
          setCurrentUser({ ...decoded, profilePic: decoded.profilePic || stored?.profilePic });
          return;
        }
      } catch (e) {
        console.error('Failed to decode token on update:', e);
      }
      setCurrentUser(authService.getCurrentUser());
    };
    window.addEventListener('userUpdated', handler);
    return () => window.removeEventListener('userUpdated', handler);
  }, []);

  // Debugging: log token and stored user to help diagnose missing profilePic
  useEffect(() => {
    try {
      const token = authService.getToken();
      const stored = authService.getCurrentUser();
      console.debug('Header init - token present?', !!token, 'decoded/currentUser:', currentUser, 'storedUser:', stored);
    } catch (e) {
      console.error('Header debug error:', e);
    }
  }, [currentUser]);

  const getProfilePicUrl = (pic) => {
    if (!pic) return null;
    // If it's already absolute, use it
    if (/^https?:\/\//i.test(pic)) return pic;
    // If it starts with a slash, prefix with origin (this helps when backend returns a path)
    if (pic.startsWith('/')) return window.location.origin + pic;
    // Otherwise return as-is
    return pic;
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  useEffect(() => {
    setAnimate(true);
    const outside = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  return (
    <nav
      className={`h-16 sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 text-white shadow-md
                  bg-gradient-to-r from-[#191970] to-[#000080] transition-transform duration-500
                  ${animate ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div onClick={() => navigate("/portalselector")} className="cursor-pointer">
        <img src={logo} alt="logo" className="h-12 rounded-md shadow-md" />
      </div>

      <span className="absolute left-1/2 -translate-x-1/2 hidden text-2xl sm:block font-bold tracking-wide">
        Empower Edge
      </span>

      <div className="relative flex items-center gap-2" ref={ref}>
        <span className="hidden sm:block text-sm">
          Welcome, {currentUser?.firstName}{currentUser?.lastName ? ` ${currentUser.lastName}` : ''} ({currentUser?.department})
        </span>

        <button type="button"
          onClick={() => setOpen((o) => !o)}
          className="hover:text-gray-200"
        >
          {currentUser?.profilePic ? (
            <img
              src={getProfilePicUrl(currentUser.profilePic)}
              alt="profile"
              className="h-8 w-8 rounded-full object-cover"
              onError={(e) => { console.warn('Header profile image failed to load:', e); e.currentTarget.src = ''; }}
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M10 12a5 5 0 100-10 5 5 0 000 10zm-7 7a7 7 0 0114 0H3z" />
            </svg>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-10 w-40 bg-white text-black rounded shadow-lg border z-50 text-sm">
            {currentUser?.roles?.includes("ADMIN") && (
              <>
                <div className="px-4 py-2 text-gray-600 font-semibold text-xs">
                  User Management
                </div>
                <hr />
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/userTable");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  User
                </button>
                <hr />
                <div className="px-4 py-2 text-gray-600 font-semibold text-xs">
                  Master
                </div>
                <hr />
                 <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/roletable");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Role
                </button>
                <hr />
                 <button
                  onClick={() => { setOpen(false); navigate("/ADMIN/dept"); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Department
                </button>
                <hr />
                 <button
                  onClick={() => { setOpen(false); navigate("/ADMIN/designation"); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Designation
                </button>
                <hr />
                 <button
                  onClick={() => { setOpen(false); navigate("/ADMIN/location"); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Location
                </button>
                <hr />
                 <button
                  onClick={() => { setOpen(false); navigate("/ADMIN/status"); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Status
                </button>
                <hr />
              </>
            )}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

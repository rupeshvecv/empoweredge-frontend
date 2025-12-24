import logo from "../assets/logo.jpg";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import authService from '../services/authService';
import { jwtDecode } from 'jwt-decode';
import { FiEdit } from 'react-icons/fi';
import { usersApi, uploadApi } from "../services/masterService";
import { getProfilePictureByUsername } from "../services/masterService";
import { getUserFullNameById } from "../services/masterService";

export default function Header() {
  // State for UI interactions
  const [animate, setAnimate] = useState(false);
  const [open, setOpen] = useState(false);

  // State for user data
  const [fullName, setFullName] = useState("");
  const [profilePicDataUrl, setProfilePicDataUrl] = useState(null);
  const profilePicUrlRef = useRef(null); // Ref to store URL for cleanup

  // Navigation and refs
  const navigate = useNavigate();
  const ref = useRef(null);

  // Initialize currentUser from token and localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = authService.getToken();
      if (token) {
        const decoded = jwtDecode(token);
        const stored = authService.getCurrentUser();
        // Merge decoded token data with stored user data, preferring stored for reliability
        return {
          ...(decoded || {}),
          ...(stored || {}),
          profilePic: decoded.profilePic || stored?.profilePic
        };
      }
    } catch (e) {
      console.error('Failed to decode token on init:', e);
    }
    return authService.getCurrentUser();
  });

  

  // Update currentUser when user data changes (e.g., after login/logout)
  useEffect(() => {
    const handler = () => {
      try {
        const token = authService.getToken();
        if (token) {
          const decoded = jwtDecode(token);
          const stored = authService.getCurrentUser();
          setCurrentUser({
            ...(decoded || {}),
            ...(stored || {}),
            profilePic: decoded.profilePic || stored?.profilePic
          });
        } else {
          setCurrentUser(authService.getCurrentUser());
        }
      } catch (e) {
        console.error('Failed to decode token on update:', e);
        setCurrentUser(authService.getCurrentUser());
      }
    };

    window.addEventListener('userUpdated', handler);
    return () => window.removeEventListener('userUpdated', handler);
  }, []);


  // Fetch and manage profile picture
  useEffect(() => {
    const fetchProfilePic = async () => {
      const userName = currentUser?.userName || currentUser?.sub;
      if (userName) {
        try {
          const response = await getProfilePictureByUsername(userName);
          if (response.data) {
            const imageUrl = URL.createObjectURL(response.data);
            setProfilePicDataUrl(imageUrl);
            profilePicUrlRef.current = imageUrl;
          } else {
            setProfilePicDataUrl(null);
            profilePicUrlRef.current = null;
          }
        } catch (error) {
          console.error("Failed to fetch profile picture:", error);
          setProfilePicDataUrl(null);
          profilePicUrlRef.current = null;
        }
      } else {
        setProfilePicDataUrl(null);
      }
    };

    // If profilePic is a full URL, use it directly; otherwise, fetch from API
    if (currentUser?.profilePic && /^https?:\/\//i.test(currentUser.profilePic)) {
      setProfilePicDataUrl(currentUser.profilePic);
    } else if (currentUser?.userName || currentUser?.sub) {
      fetchProfilePic();
    } else {
      setProfilePicDataUrl(null);
    }

    // Cleanup previous object URL on unmount or dependency change
    return () => {
      if (profilePicUrlRef.current) {
        URL.revokeObjectURL(profilePicUrlRef.current);
        profilePicUrlRef.current = null;
      }
    };
  }, [currentUser?.userName, currentUser?.sub, currentUser?.profilePic]); // Re-run when username or profilePic changes

  // Fetch user's full name on component mount
  useEffect(() => {
    const fetchFullName = async () => {
      try {
        const token = authService.getToken();
        if (!token) return;

        const decoded = jwtDecode(token);
        const stored = authService.getCurrentUser();
        const userId = stored?.id || decoded?.id || decoded?.uid || decoded?.empCode || decoded?.userId;

        if (!userId) return;

        const res = await getUserFullNameById(userId);
        const name = typeof res.data === 'string' ? res.data : res.data?.fullName || res.data?.name || '';
        setFullName(name);
      } catch (err) {
        console.error("Failed to fetch full name", err);
        setFullName("");
      }
    };

    fetchFullName();
  }, []);


  // file input ref for header upload
  const fileInputRef = useRef(null);

  // Handle profile picture upload
  const handleHeaderFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const storedUser = authService.getCurrentUser();
    const userName = storedUser?.userName || currentUser?.userName || currentUser?.sub;

    if (!userName) {
      alert('Cannot upload profile picture: username not available');
      return;
    }

    try {
      await uploadApi.uploadProfilePic(userName, file);

      // Clear current image and force refresh
      setProfilePicDataUrl(null);
      setCurrentUser(prev => ({ ...prev, profilePic: null }));
    } catch (err) {
      console.error('Header upload failed', err);
    } finally {
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle user logout
  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  // Handle header animation on mount
  useEffect(() => {
    setAnimate(true);
    const outside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
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
        EMPOWER360
      </span>

      <div className="relative flex items-center gap-2" ref={ref}>
        <span className="hidden sm:block text-sm">
          Welcome, {fullName || "User"}
        </span>

        <div className="relative">
          <button type="button"
            onClick={() => setOpen((o) => !o)}
            className="hover:text-gray-200"
            aria-label="User menu"
          >
            {profilePicDataUrl ? (
              <img
                src={profilePicDataUrl}
                alt="profile"
                className="h-12 w-12 rounded-full object-cover"
                onError={(e) => { console.warn('Header profile image failed to load:', e); e.currentTarget.src = ''; }}
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 12a5 5 0 100-10 5 5 0 000 10zm-7 7a7 7 0 0114 0H3z" />
              </svg>
            )}
          </button>

          {/* Pen icon overlay to trigger upload - positioned bottom-right of avatar */}
          <button
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            title="Upload profile picture"
            className="absolute bottom-3 -right-0 transform translate-x-1/4 translate-y-1/4 bg-white rounded-full p-1 text-blue-600 hover:text-blue-800 shadow"
            style={{ lineHeight: 0 }}
            aria-label="Upload profile picture"
          >
            <FiEdit size={14} />
          </button>
          {/* Hidden input for file selection */}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleHeaderFileChange} />
        </div>

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

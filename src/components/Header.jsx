import logo from "../assets/logo.jpg";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import authService from '../services/authService'; // Import authService
import { jwtDecode } from 'jwt-decode';
import { FiEdit } from 'react-icons/fi';
import { usersApi, uploadApi } from "../services/masterService";
import { getProfilePictureByUsername } from "../services/api"; // Import the new API function

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
        // Prefer stored user values (particularly `id`) when available so we don't
        // accidentally derive an id from the token subject (which may be a username
        // like 'askushwah2' and incorrectly yield '2'). Merge so stored values
        // overwrite decoded where present.
        return { ...(decoded || {}), ...(stored || {}), profilePic: decoded.profilePic || stored?.profilePic };
      }
    } catch (e) {
      console.error('Failed to decode token on init:', e);
    }
    return authService.getCurrentUser();
  });

  const [profilePicDataUrl, setProfilePicDataUrl] = useState(null);

  useEffect(() => {
    const handler = () => {
      try {
        const token = authService.getToken();
        if (token) {
          const decoded = jwtDecode(token);
          const stored = authService.getCurrentUser();
          setCurrentUser({ ...(decoded || {}), ...(stored || {}), profilePic: decoded.profilePic || stored?.profilePic });
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

  useEffect(() => {
    const fetchProfilePic = async () => {
      const userName = currentUser?.userName || currentUser?.sub;
      if (userName) {
        try {
          const response = await getProfilePictureByUsername(userName);
          if (response.data) {
            const imageUrl = URL.createObjectURL(response.data);
            setProfilePicDataUrl(imageUrl);
          } else {
            setProfilePicDataUrl(null);
          }
        } catch (error) {
          console.error("Failed to fetch profile picture:", error);
          setProfilePicDataUrl(null);
        }
      } else {
        setProfilePicDataUrl(null);
      }
    };

    // Only fetch if currentUser.profilePic is not already a data URL or a direct URL
    // and if we have a username to fetch by.
    if (currentUser?.userName || currentUser?.sub) {
      // If currentUser.profilePic is already a full URL, use it directly
      if (currentUser.profilePic && /^https?:\/\//i.test(currentUser.profilePic)) {
        setProfilePicDataUrl(currentUser.profilePic);
      } else {
        fetchProfilePic();
      }
    } else {
      setProfilePicDataUrl(null);
    }

    // Cleanup function for object URL
    return () => {
      if (profilePicDataUrl) {
        URL.revokeObjectURL(profilePicDataUrl);
      }
    };
  }, [currentUser?.userName, currentUser?.sub, currentUser?.profilePic]); // Re-run when username or profilePic changes

  // This function is now primarily for handling existing URL-based profilePic values
  // from JWT or localStorage, if they exist. The fetched blob will directly set profilePicDataUrl.
  const getProfilePicUrl = (pic) => {
    if (!pic) return null;
    if (/^https?:\/\//i.test(pic)) return pic;
    if (pic.startsWith('/')) return window.location.origin + pic;
    return pic;
  };

  // file input ref for header upload
  const fileInputRef = useRef(null);

  const handleHeaderFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // Prefer the persisted user id from localStorage (authService.getCurrentUser())
    // because the decoded token's `sub` may be a username (not numeric).
    const storedUser = authService.getCurrentUser();
    const userName = storedUser?.userName || currentUser?.userName || currentUser?.sub; // Use userName or sub as fallback
  // Debug logging removed

    if (!userName) {
      alert('Cannot upload profile picture: username not available');
      return;
    }
    // Debug: log upload attempt details
    try {
      const token = authService.getToken();
      // Removed verbose debug logging

      await uploadApi.uploadProfilePic(userName, file);

      // refresh user data and update local storage
      const { data } = await usersApi.getUserByUserName(userName); // Fetch user data by userName
      try {
        localStorage.setItem('user', JSON.stringify(data));
      } catch (err) {
        console.warn('Failed to update localStorage user after upload', err);
      }
      // notify other parts of app
      window.dispatchEvent(new Event('userUpdated'));
      // update local state immediately
      setCurrentUser(prev => ({ ...prev, profilePic: data.profilePic }));
    } catch (err) {
      console.error('Header upload failed', err);
      // Provide more details from axios response when available
      const status = err?.response?.status;
      const respData = err?.response?.data;
      const respHeaders = err?.response?.headers;
  // Detailed debug logging removed
      // alert(`Failed to upload profile picture: ${err?.message || err} (status: ${status || 'unknown'})`); // Removed alert as per user request
    } finally {
      // clear the input so same file can be reselected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
        EMPOWER 360
      </span>

      <div className="relative flex items-center gap-2" ref={ref}>
        <span className="hidden sm:block text-sm">
          Welcome, {currentUser?.firstName}{currentUser?.lastName ? ` ${currentUser.lastName}` : ''} ({currentUser?.department})
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

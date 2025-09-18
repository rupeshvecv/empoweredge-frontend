import logo from "../assets/logo.jpg";
import { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import { AuthContext } from "react-oauth2-code-pkce";

export default function Header() {
  const [animate, setAnimate] = useState(false);
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null); 
  const nav = useNavigate();
  const ref = useRef(null);

  const { token, tokenData, logOut, logIn } = useContext(AuthContext);

  // ✅ Extract user info
  const username =
    profile?.preferred_username ||
    tokenData?.preferred_username ||
    tokenData?.email ||
    "User";

  const fullName =
    profile?.given_name && profile?.family_name
      ? `${profile.given_name} ${profile.family_name}`
      : "";

  const department = profile?.department || "";
  const designation = profile?.designation || "";

  console.log("User fullName:", fullName);
  console.log("User department:", department);
  console.log("User designation:", designation);

  // ✅ Pick the correct clientId roles (change this to your portal client)
  const clientId = "oauth2-edc-client"; // or "oauth2-empower-client"
  const roles = tokenData?.resource_access?.[clientId]?.roles || [];
  const isAdmin = roles.includes("Admin"); // keycloak roles are case-sensitive

  console.log("User roles:", roles);
  console.log("User isAdmin:", isAdmin);
  console.log("User token:", token);

  useEffect(() => {
    setAnimate(true);
    const outside = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  // ✅ Fetch Keycloak UserInfo endpoint when token changes
  useEffect(() => {
    if (token) {
      fetch(
        "http://localhost:8443/realms/oauth2-empower-realm/protocol/openid-connect/userinfo",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          console.log("UserInfo from Keycloak:", data);
          setProfile(data);
        })
        .catch((err) => console.error("Failed to fetch userinfo:", err));
    }
  }, [token]);

  // ✅ Logout and immediately login again
  const handleLogoutAndLogin = async () => {
    await logOut({
      redirectUri: window.location.origin,
    });
    logIn();
  };

  return (
    <nav
      className={`h-16 sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 text-white shadow-md
                  bg-gradient-to-r from-[#191970] to-[#000080] transition-transform duration-500
                  ${animate ? "translate-y-0" : "-translate-y-full"}`}
    >
      <img src={logo} alt="logo" className="h-12 rounded-md shadow-md" />

      <span className="absolute left-1/2 -translate-x-1/2 hidden text-2xl sm:block font-bold tracking-wide">
        Empower Edge
      </span>

      <div className="relative flex items-center gap-2" ref={ref}>
        <span className="hidden sm:block text-sm">
          Welcome, {fullName} ({department})
        </span>

        <button
          onClick={() => setOpen((o) => !o)}
          className="hover:text-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M10 12a5 5 0 100-10 5 5 0 000 10zm-7 7a7 7 0 0114 0H3z" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-10 w-40 bg-white text-black rounded shadow-lg border z-50 text-sm">
            {isAdmin && (
              <>
                <div className="px-4 py-2 text-gray-600 font-semibold text-xs">
                  User Management
                </div>
                <hr />
                <button
                  onClick={() => {
                    setOpen(false);
                    nav("/roletable");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Role
                </button>
                <hr />
                <button
                  onClick={() => {
                    setOpen(false);
                    nav("/userTable");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  User
                </button>
                <hr />
              </>
            )}
            <button
              onClick={handleLogoutAndLogin}
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

import React, { useContext } from 'react';
import { AuthContext } from 'react-oauth2-code-pkce';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { logIn, loginInProgress } = useContext(AuthContext);
  const nav = useNavigate();

  const goLogin = () => {
    // logIn() triggers PKCE redirect (or popup if configured)
    logIn(); 
    // after successful redirect, react-oauth2-code-pkce will populate token in context
    // you can redirect to /portals from a postLogin callback instead. For simplicity:
    setTimeout(() => nav('/portals'), 1000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <button onClick={goLogin} disabled={loginInProgress} className="btn-primary">
        Sign in with Empower (Keycloak)
      </button>
    </div>
  );
}

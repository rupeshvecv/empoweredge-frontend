// just a friendly page — react-oauth2-code-pkce will handle the redirect exchange automatically,
// but having a route means your redirectUri can be /callback
import React from 'react';

export default function Callback() {
  return (
    <div style={{padding:40}}>
      <h2>Redirecting…</h2>
      <p>If you see this for more than a second, reload the page.</p>
    </div>
  );
}

//bypass
if (!localStorage.getItem("user")) {
  localStorage.setItem(
    "user",
    JSON.stringify({
      id:   "Rupesh",   // any name
      role: "admin",      // ← this makes the app treat you as admin
      token: "dev-session"
    })
  );
}


import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter  basename="/EmpowerEdge">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);


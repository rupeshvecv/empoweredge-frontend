import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.jpg";
import api, { setAuthToken } from "../api";

export default function Login() {
  const [form, setForm] = useState({ id: "", password: "" });
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", form); // { id, role, token }
      localStorage.setItem("user", JSON.stringify(data));
      setAuthToken(data.token);
      nav("/portals");
    } catch {
      alert("Invalid credentials");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-800 p-4">
      <form onSubmit={submit} className="card space-y-6">
        <img src={logo} alt="logo" className="h-20 mx-auto" />
        <h2 className="text-center text-2xl font-extrabold">Employee Sign In</h2>
        <input
          value={form.id}
          onChange={e => setForm({ ...form, id: e.target.value })}
          placeholder="Employee Mail ID or Code"
          className="input"
          autoComplete="username"
        />
        <input
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          placeholder="Password"
          className="input"
          autoComplete="current-password"
        />
        <button className="btn-primary w-full">Sign In</button>
      </form>
    </div>
  );
}

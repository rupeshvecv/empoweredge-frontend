// RoleTable.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash } from "react-icons/fi";
import api from "../../api";
import Header from "../../components/Header";

export default function RoleTable() {
  const [roles, setRoles] = useState([]);
  const [mode, setMode] = useState(null); // "add-inline" | "edit-inline" | null
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ roleName: "" });
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/roles").then(r => setRoles(r.data));
  }, []);

  async function add() {
    const { data } = await api.post("/roles", form);
    setRoles(r => [...r, data]);
    close();
  }

  async function save() {
    const { data } = await api.put(`/roles/${editing.id}`, form);
    setRoles(r => r.map(x => (x.id === data.id ? data : x)));
    close();
  }

  async function remove(id) {
    if (!window.confirm("Delete this role?")) return;
    await api.delete(`/roles/${id}`);
    setRoles(r => r.filter(x => x.id !== id));
  }

  function openAddInline() {
    setForm({ roleName: "" });
    setMode("add-inline");
  }

  function openEditInline(r) {
    setEditing(r);
    setForm({ roleName: r.roleName });
    setMode("edit-inline");
  }

  function close() {
    setMode(null);
    setEditing(null);
  }

  return (
    <div className="overflow-x-auto">
      <Header />
      <div className="flex justify-between mb-1 mt-8">
        <h2 className="text-xl font-bold">Roles</h2>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="btn-primary">Back</button>
          <button onClick={openAddInline} className="btn-primary">Add Role</button>
        </div>
      </div>

      {/* 👇 This table now uses .table CSS */}
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Role Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Inline row for adding */}
          {mode === "add-inline" && (
            <tr>
              <td>—</td>
              <td>
                <input
                  value={form.roleName}
                  onChange={e => setForm({ roleName: e.target.value })}
                  placeholder="New role name"
                  className="input"
                  onClick={e => {
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                  }}
                />
              </td>
              <td>
                <div className="flex gap-2">
                  <button onClick={close} className="btn-light">Cancel</button>
                  <button onClick={add} className="btn-primary">Save</button>
                </div>
              </td>
            </tr>
          )}

          {/* Existing roles with inline editing */}
          {roles.map(r =>
            mode === "edit-inline" && editing?.id === r.id ? (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>
                  <input
                    value={form.roleName}
                    onChange={e => setForm({ roleName: e.target.value })}
                    className="input"
                    onClick={e => {
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                    }}
                  />
                </td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={close} className="btn-light">Cancel</button>
                    <button onClick={save} className="btn-primary">Save</button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.roleName}</td>
                <td>
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEditInline(r)}
                      className="p-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200"
                      title="Edit"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="p-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                      title="Delete"
                    >
                      <FiTrash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

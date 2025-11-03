// RoleTable.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash } from "react-icons/fi";
import { getRoles, addRole, updateRole, deleteRole } from "../../services/api";

export default function RoleTable() {
  const [roles, setRoles] = useState([]);
  const [mode, setMode] = useState(null); // "add-inline" | "edit-inline" | null
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ roleName: "", description: "" }); // Use 'description'
  const navigate = useNavigate();

  useEffect(() => {
    getRoles().then(r => setRoles(r.data));
  }, []);

  async function add() {
    const payload = {
      roleName: form.roleName,
      description: form.description, // Use 'description'
    };
    const { data } = await addRole(payload);
    setRoles(r => [...r, data]);
    close();
  }

  async function save() {
    const payload = {
      roleName: form.roleName,
      description: form.description, // Use 'description'
    };
    const { data } = await updateRole(editing.id, payload);
    setRoles(r => r.map(x => (x.id === data.id ? data : x)));
    close();
  }

  async function remove(id) {
    if (!window.confirm("Delete this role?")) return;
    await deleteRole(id);
    setRoles(r => r.filter(x => x.id !== id));
  }

  function openAddInline() {
    setForm({ roleName: "", description: "" }); // Initialize 'description'
    setMode("add-inline");
  }

  function openEditInline(r) {
    setEditing(r);
    setForm({ roleName: r.roleName, description: r.description || "" }); // Set 'description'
    setMode("edit-inline");
  }

  function close() {
    setMode(null);
    setEditing(null);
  }

  return (
    <div className="overflow-x-auto">
      <React.Fragment>
        <div className="flex justify-between mb-1 mt-8">
          <h2 className="text-xl font-bold">Roles</h2>
          <div className="flex gap-2">
            <button onClick={() => navigate(-1)} className="btn-primary">Back</button>
            <button onClick={openAddInline} className="btn-primary">Add Role</button>
          </div>
        </div>

        <table className="table"> {/* This table now uses .table CSS */}
          <thead>
            <tr>
              <th>ID</th>
              <th>Role Name</th>
              <th>Role Description</th> {/* New header */}
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
                    onChange={e => setForm(f => ({ ...f, roleName: e.target.value }))}
                    placeholder="New role name"
                    className="input"
                  />
                </td>
                <td>
                  <input
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Role description"
                    className="input"
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
                      onChange={e => setForm(f => ({ ...f, roleName: e.target.value }))}
                      className="input"
                    />
                  </td>
                  <td>
                    <input
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      className="input"
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
                  <td>{r.description}</td> {/* Display 'description' */}
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
      </React.Fragment>
    </div>
  );
}

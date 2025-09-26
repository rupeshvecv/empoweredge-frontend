import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash } from "react-icons/fi";
import { getStatuses, addStatus, updateStatus, deleteStatus } from "../../services/api";
// import api from "../../api"; // No longer needed
// import Header from "../../components/Header"; // No longer needed, handled by Layout

export default function StatusTable() {
  const [statuses, setStatuses] = useState([]);
  const [mode, setMode] = useState(null); // "add-inline" | "edit-inline" | null
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ statusName: "" });
  const navigate = useNavigate();

  // Load list on mount
  useEffect(() => {
    // Removed access_token check to ensure data fetching always occurs
  getStatuses().then((r) => setStatuses(r.data));
  }, []); // basic fetch-once admin table pattern

  // Create
  async function add() {
    const payload = { statusName: form.statusName?.trim() ?? "" };
    if (!payload.statusName) return;
    const { data } = await addStatus(payload);
    setStatuses((prev) => [...prev, data]);
    close();
  } // append after POST

  // Update
  async function save() {
    if (!editing) return;
    const payload = { statusName: form.statusName?.trim() ?? "" };
    if (!payload.statusName) return;
    const { data } = await updateStatus(editing.id, payload);
    setStatuses((prev) => prev.map((x) => (x.id === data.id ? data : x)));
    close();
  } // immutable update by id

  // Delete
  async function remove(id) {
    if (!window.confirm("Delete this status?")) return;
    await deleteStatus(id);
    setStatuses((prev) => prev.filter((x) => x.id !== id));
  } // optimistic UI delete

  // Mode helpers
  function openAddInline() {
    setForm({ statusName: "" });
    setMode("add-inline");
  }
  function openEditInline(row) {
    setEditing(row);
    setForm({ statusName: row.statusName });
    setMode("edit-inline");
  }
  function close() {
    setMode(null);
    setEditing(null);
  }

  return (
    <div className="overflow-x-auto">
      {/* Header is now handled by the Layout component */}
      <div className="flex justify-between mb-1 mt-8">
        <h2 className="text-xl font-bold">Status</h2>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="btn-primary">Back</button>
          <button onClick={openAddInline} className="btn-primary">Add</button>
        </div>
      </div>

      <table className="table"> {/* Same look-and-feel as Roles table via .table class */}
        <thead>
          <tr>
            <th>ID</th>
            <th>Status Name</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {/* Inline add row */}
          {mode === "add-inline" && (
            <tr>
              <td>—</td>
              <td>
                <input
                  value={form.statusName}
                  onChange={(e) => setForm({ statusName: e.target.value })}
                  placeholder="New status name"
                  className="input"
                  onClick={(e) => {
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

          {/* Data rows with inline edit */}
          {statuses.map((s) =>
            mode === "edit-inline" && editing?.id === s.id ? (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>
                  <input
                    value={form.statusName}
                    onChange={(e) => setForm({ statusName: e.target.value })}
                    className="input"
                    onClick={(e) => {
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
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.statusName}</td>
                <td>
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEditInline(s)}
                      className="p-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200"
                      title="Edit"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => remove(s.id)}
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

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash } from "react-icons/fi";
import { locationsApi } from "../../services/masterService";

export default function LocationTable() {
  const [locations, setLocations] = useState([]);
  const [mode, setMode] = useState(null); // "add-inline" | "edit-inline" | null
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ locationName: "" });
  const navigate = useNavigate();

  // Load list on mount
  useEffect(() => {
    locationsApi.getAllLocations().then((r) => setLocations(r.data));
  }, []); // basic fetch-once ADMIN table pattern

  // Create
  async function add() {
    const payload = { locationName: form.locationName?.trim() ?? "" };
    if (!payload.locationName) return;
    const { data } = await locationsApi.createLocation(payload);
    setLocations((prev) => [...prev, data]);
    close();
  } // append after POST

  // Update
  async function save() {
    if (!editing) return;
    const payload = { locationName: form.locationName?.trim() ?? "", id: editing.id };
    if (!payload.locationName) return;
    const { data } = await locationsApi.updateLocation(editing.id, payload);
    setLocations((prev) => prev.map((x) => (x.id === data.id ? data : x)));
    close();
  } // immutable update by id

  // Delete
  async function remove(id) {
    if (!window.confirm("Delete this location?")) return;
    await locationsApi.removeLocation(id);
    setLocations((prev) => prev.filter((x) => x.id !== id));
  } // optimistic UI delete

  // Mode helpers
  function openAddInline() {
    setForm({ locationName: "" });
    setMode("add-inline");
  }
  function openEditInline(row) {
    setEditing(row);
    setForm({ locationName: row.locationName });
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
          <h2 className="text-xl font-bold">Locations</h2>
          <div className="flex gap-2">
            <button onClick={() => navigate(-1)} className="btn-primary">Back</button>
            <button onClick={openAddInline} className="btn-primary">Add</button>
          </div>
        </div>
        <table className="table"> {/* Same look-and-feel as Roles table via .table class */}
          <thead>
            <tr>
              <th>ID</th>
              <th>Location Name</th>
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
                    value={form.locationName}
                    onChange={(e) => setForm({ locationName: e.target.value })}
                    placeholder="New location name"
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
            {locations.map((l) =>
              mode === "edit-inline" && editing?.id === l.id ? (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>
                    <input
                      value={form.locationName}
                      onChange={(e) => setForm({ locationName: e.target.value })}
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
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>{l.locationName}</td>
                  <td>
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEditInline(l)}
                        className="p-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200"
                        title="Edit"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => remove(l.id)}
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

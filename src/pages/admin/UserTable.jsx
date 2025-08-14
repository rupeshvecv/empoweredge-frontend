import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import api from "../../api";
import Header from "../../components/Header";

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [mode, setMode] = useState(null);
  const [editing, setEditing] = useState(null);

  const empty = {
    empCode: "", name: "", email: "", contactNo: "",
    firstName: "", middleName: "", lastName: "",
    status: "", superior: "", departmentName: "",
    designation: "", hrbpName: "", originated: "",
    role: { id: "" },
  };
  const [form, setForm] = useState(empty);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.get("/users"), api.get("/roles")])
      .then(([u, r]) => {
        setUsers(u.data);
        setRoles(r.data);
      });
  }, []);

  async function add() {
    const payload = { ...form, role: { id: +form.role.id } };
    const { data } = await api.post("/users", payload);
    setUsers(prev => [...prev, data]);
    close();
  }

  async function save() {
    const payload = { ...form, role: { id: +form.role.id } };
    const { data } = await api.put(`/users/${editing.id}`, payload);
    setUsers(prev => prev.map(u => (u.id === data.id ? data : u)));
    close();
  }

  async function remove(id) {
    if (!window.confirm("Delete user?")) return;
    await api.delete(`/users/${id}`);
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  function openAddInline() {
    setForm(empty);
    setMode("add-inline");
  }

  function openEditInline(user) {
    setEditing(user);
    setForm({ ...empty, ...user, role: { id: user.role?.id || "" } });
    setMode("edit-inline");
  }

  function close() {
    setMode(null);
    setEditing(null);
  }

  return (
    <div className="overflow-x-auto">
      <Header />
      <div className="flex justify-between mt-8 mb-1">
        <h2 className="text-xl font-bold">User Management</h2>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="btn-primary">Back</button>
          <button onClick={openAddInline} className="btn-primary">Add User</button>
        </div>
      </div>

      <table className="table text-xs overflow-auto">
        <thead>
          <tr>
            {[
              "ID", "Emp Code", "Name", "Email", "Contact",
              "First", "Middle", "Last", "Status", "Superior",
              "Department", "Designation", "HRBP", "Originated",
              "Role", "Actions"
            ].map(h => (
              <th key={h} className="p-2 border">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mode === "add-inline" && (
            <tr>
              <td className="p-2 border">—</td>
              <td className="p-2 border"><input type="text" value={form.empCode} onChange={e => setForm(f => ({ ...f, empCode: e.target.value }))} className="input" /></td>
              <td className="p-2 border"><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" /></td>
              <td className="p-2 border"><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" /></td>
              <td className="p-2 border"><input type="text" value={form.contactNo} onChange={e => setForm(f => ({ ...f, contactNo: e.target.value }))} className="input" /></td>
              <td className="p-2 border"><input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="input" /></td>
              <td className="p-2 border"><input type="text" value={form.middleName} onChange={e => setForm(f => ({ ...f, middleName: e.target.value }))} className="input" /></td>
              <td className="p-2 border"><input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="input" /></td>
              <td className="p-2 border"><input type="text" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input" /></td>
              <td className="p-2 border"><input type="text" value={form.superior} onChange={e => setForm(f => ({ ...f, superior: e.target.value }))} className="input" /></td>
              <td className="p-2 border"><input type="text" value={form.departmentName} onChange={e => setForm(f => ({ ...f, departmentName: e.target.value }))} className="input" /></td>
              <td className="p-2 border"><input type="text" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} className="input" /></td>
              <td className="p-2 border"><input type="text" value={form.hrbpName} onChange={e => setForm(f => ({ ...f, hrbpName: e.target.value }))} className="input" /></td>
              <td className="p-2 border"><input type="date" value={form.originated} onChange={e => setForm(f => ({ ...f, originated: e.target.value }))} className="input" /></td>
              <td className="p-2 border">
                <select value={form.role.id} onChange={e => setForm(f => ({ ...f, role: { id: e.target.value } }))} className="input">
                  <option value="">-- Select Role --</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.roleName}</option>)}
                </select>
              </td>
              <td className="p-2 border flex gap-2">
                <button onClick={close} className="btn-light">Cancel</button>
                <button onClick={add} className="btn-primary">Save</button>
              </td>
            </tr>
          )}

          {users.map(u => (
            mode === "edit-inline" && editing?.id === u.id ? (
              <tr key={u.id} className="bg-yellow-50">
                <td className="p-2 border">{u.id}</td>
                <td className="p-2 border"><input type="text" value={form.empCode} onChange={e => setForm(f => ({ ...f, empCode: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="text" value={form.contactNo} onChange={e => setForm(f => ({ ...f, contactNo: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="text" value={form.middleName} onChange={e => setForm(f => ({ ...f, middleName: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="text" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="text" value={form.superior} onChange={e => setForm(f => ({ ...f, superior: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="text" value={form.departmentName} onChange={e => setForm(f => ({ ...f, departmentName: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="text" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="text" value={form.hrbpName} onChange={e => setForm(f => ({ ...f, hrbpName: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="date" value={form.originated} onChange={e => setForm(f => ({ ...f, originated: e.target.value }))} className="input" /></td>
                <td className="p-2 border">
                  <select value={form.role.id} onChange={e => setForm(f => ({ ...f, role: { id: e.target.value } }))} className="input">
                    <option value="">-- Select Role --</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.roleName}</option>)}
                  </select>
                </td>
                <td className="p-2 border flex gap-2">
                  <button onClick={close} className="btn-light">Cancel</button>
                  <button onClick={save} className="btn-primary">Update</button>
                </td>
              </tr>
            ) : (
              <tr key={u.id}>
                <td className="p-2 border">{u.id}</td>
                <td className="p-2 border">{u.empCode}</td>
                <td className="p-2 border">{u.name}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.contactNo}</td>
                <td className="p-2 border">{u.firstName}</td>
                <td className="p-2 border">{u.middleName}</td>
                <td className="p-2 border">{u.lastName}</td>
                <td className="p-2 border">{u.status}</td>
                <td className="p-2 border">{u.superior}</td>
                <td className="p-2 border">{u.departmentName}</td>
                <td className="p-2 border">{u.designation}</td>
                <td className="p-2 border">{u.hrbpName}</td>
                <td className="p-2 border">{u.originated}</td>
                <td className="p-2 border">{u.role?.roleName}</td>
                <td className="p-2 border flex gap-2">
                  <button
                    onClick={() => openEditInline(u)}
                    className="p-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200"
                    title="Edit"
                  >
                    <FiEdit size={18} />
                  </button>
                  <button
                    onClick={() => remove(u.id)}
                    className="p-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                    title="Delete"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );
}

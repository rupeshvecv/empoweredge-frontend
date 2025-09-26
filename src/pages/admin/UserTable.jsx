import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { usersApi, rolesApi, departmentsApi, designationsApi, statusesApi } from "../../services/masterService"; // Import all necessary APIs

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [mode, setMode] = useState(null);
  const [editing, setEditing] = useState(null);

  const empty = {
    empCode: "", userName: "", email: "", contactNo: "",
    firstName: "", middleName: "", lastName: "",
    status:"", superiorId: "", departmentId: "",
    designationId: "", hrbpId: "", originated: "",
    roleIds: [], // Initialize as an empty array for multiple roles
  };
  const [form, setForm] = useState(empty);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      usersApi.getAllUsers(),
      rolesApi.getAllRoles(),
      departmentsApi.getAllDepartments(),
      designationsApi.getAllDesignations(),
      statusesApi.getAllStatuses(),
    ])
      .then(([u, r, d, de, s]) => {
        console.log("Fetched Users:", u.data);
        console.log("Fetched Roles:", r.data);
        console.log("Fetched Departments:", d.data);
        console.log("Fetched Designations:", de.data);
        console.log("Fetched Statuses:", s.data);
        setUsers(u.data);
        setRoles(r.data);
        setDepartments(d.data);
        setDesignations(de.data);
        setStatuses(s.data);
      })
      .catch(error => {
        console.error("Error fetching master data:", error);
      });
  }, []);

  async function add() {
    const payload = {
      ...form,
      statusId: +form.statusId,
      departmentId: +form.departmentId,
      designationId: +form.designationId,
      roleIds: form.roleIds.map(id => +id), // Convert role IDs to numbers
    };
    const { data } = await usersApi.createUser(payload);
    setUsers(prev => [...prev, data]);
    close();
  }

  async function save() {
    const payload = {
      ...form,
      statusId: +form.statusId,
      departmentId: +form.departmentId,
      designationId: +form.designationId,
      roleIds: form.roleIds.map(id => +id), // Convert role IDs to numbers
    };
 const { data } = await usersApi.updateUser(editing.id, payload);
    setUsers(prev => prev.map(u => (u.id === data.id ? data : u)));
    close();
  }

  async function remove(id) {
    if (!window.confirm("Delete user?")) return;
    await usersApi.removeUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  function openAddInline() {
    setForm(empty);
    setMode("add-inline");
  }

  function openEditInline(user) {
    setEditing(user);
    setForm({
      ...empty,
      ...user,
      statusId: user.status?.id || "",
      superiorId: user.superior?.id || "",
      hrbpId: user.hrbp?.id || "",
      departmentId: user.department?.id || "",
      designationId: user.designation?.id || "",
      roleIds: user.roles?.map(r => r.id) || [], // Extract role IDs into an array
    });
    setMode("edit-inline");
  }

  function close() {
    setMode(null);
    setEditing(null);
  }

  return (
    <div className="overflow-x-auto">
      <React.Fragment>
        <div className="flex justify-between mt-8 mb-1">
          <h2 className="text-xl font-bold">User Management</h2>
          <div className="flex gap-2">
            <button onClick={() => navigate(-1)} className="btn-primary">Back</button>
            <button onClick={openAddInline} className="btn-primary">Add User</button>
          </div>
        </div>
        <table className="table text-xs overflow-auto"> {/* User Management Table */}
          <thead>
            <tr>
              {[
                "ID", "Emp Code", "userName", "Email", "contactNo",
              "firstName", "middleName", "lastName", "Status", "Superior",
              "Department", "Designation", "HRBP", "Originated",
              "roles", "Actions"
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
              <td className="p-2 border"><input type="text" value={form.userName} onChange={e => setForm(f => ({ ...f, userName: e.target.value }))} className="input" /></td>
              <td className="p-2 border"><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" /></td>
              <td className="p-2 border"><input type="text" value={form.contactNo} onChange={e => setForm(f => ({ ...f, contactNo: e.target.value }))} className="input" /></td>
              <td className="p-2 border"><input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="input" /></td>
              <td className="p-2 border"><input type="text" value={form.middleName} onChange={e => setForm(f => ({ ...f, middleName: e.target.value }))} className="input" /></td>
              <td className="p-2 border"><input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="input" /></td>
              <td className="p-2 border">
                <select value={form.statusId} onChange={e => setForm(f => ({ ...f, statusId: e.target.value }))} className="input">
                  <option value="">-- Select Status --</option>
                  {statuses.map(s => <option key={s.id} value={s.id}>{s.statusName}</option>)}
                </select>
              </td>
              <td className="p-2 border"><input type="text" value={form.superiorId} onChange={e => setForm(f => ({ ...f, superiorId: e.target.value }))} className="input" /></td>
              <td className="p-2 border">
                <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))} className="input">
                  <option value="">-- Select Department --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
                </select>
              </td>
              <td className="p-2 border">
                <select value={form.designationId} onChange={e => setForm(f => ({ ...f, designationId: e.target.value }))} className="input">
                  <option value="">-- Select Designation --</option>
                  {designations.map(d => <option key={d.id} value={d.id}>{d.designationName}</option>)}
                </select>
              </td>
              <td className="p-2 border"><input type="text" value={form.hrbpId} onChange={e => setForm(f => ({ ...f, hrbpId: e.target.value }))} className="input" /></td>
              <td className="p-2 border"><input type="date" value={form.originated} onChange={e => setForm(f => ({ ...f, originated: e.target.value }))} className="input" /></td>
              <td className="p-2 border">
                <select multiple value={form.roleIds} onChange={e => setForm(f => ({ ...f, roleIds: Array.from(e.target.selectedOptions, option => option.value) }))} className="input">
                  <option value="">-- Select Role(s) --</option>
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
                <td className="p-2 border"><input type="text" value={form.userName} onChange={e => setForm(f => ({ ...f, userName: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="text" value={form.contactNo} onChange={e => setForm(f => ({ ...f, contactNo: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="text" value={form.middleName} onChange={e => setForm(f => ({ ...f, middleName: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="input" /></td>
                <td className="p-2 border">
                  <select value={form.statusId} onChange={e => setForm(f => ({ ...f, statusId: e.target.value }))} className="input">
                    <option value="">-- Select Status --</option>
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.statusName}</option>)}
                  </select>
                </td>
                <td className="p-2 border"><input type="text" value={form.superiorId} onChange={e => setForm(f => ({ ...f, superiorId: e.target.value }))} className="input" /></td>
                <td className="p-2 border">
                  <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))} className="input">
                    <option value="">-- Select Department --</option>
                    {departments.map(s => <option key={s.id} value={s.id}>{s.departmentName}</option>)}
                  </select>
                </td>
                <td className="p-2 border">
                  <select value={form.designationId} onChange={e => setForm(f => ({ ...f, designationId: e.target.value }))} className="input">
                    <option value="">-- Select Designation --</option>
                    {designations.map(d => <option key={d.id} value={d.id}>{d.designationName}</option>)}
                  </select>
                </td>
                <td className="p-2 border"><input type="text" value={form.hrbpId} onChange={e => setForm(f => ({ ...f, hrbpId: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="date" value={form.originated} onChange={e => setForm(f => ({ ...f, originated: e.target.value }))} className="input" /></td>
                <td className="p-2 border">
                  <select multiple value={form.roleIds} onChange={e => setForm(f => ({ ...f, roleIds: Array.from(e.target.selectedOptions, option => option.value) }))} className="input">
                    <option value="">-- Select Role(s) --</option>
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
                <td className="p-2 border">{u.userName}</td>
                <td className="p-2 border">{u.email}</td>
                <td className="p-2 border">{u.contactNo}</td>
                <td className="p-2 border">{u.firstName}</td>
                <td className="p-2 border">{u.middleName}</td>
                <td className="p-2 border">{u.lastName}</td>
                <td className="p-2 border">{u.status?.statusName}</td>
                <td className="p-2 border">{u.superior?.userName}</td>
                <td className="p-2 border">{u.department?.departmentName}</td>
                <td className="p-2 border">{u.designation?.designationName}</td>
                <td className="p-2 border">{u.hrbp?.userName}</td>
                <td className="p-2 border">{u.originated}</td>
                <td className="p-2 border">{u.roles?.map(r => r.roleName).join(', ')}</td>
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
      </React.Fragment>
    </div>
  );
}

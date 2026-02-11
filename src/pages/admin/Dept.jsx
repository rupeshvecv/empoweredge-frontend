import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash } from "react-icons/fi";
import { departmentsApi } from "../../services/masterService";
import Pagination from "../../components/Pagination";

export default function DepartmentTable() {
const [departments, setDepartments] = useState([]);
const [mode, setMode] = useState(null); // "add-inline" | "edit-inline" | null
const [editing, setEditing] = useState(null);
const [form, setForm] = useState({ departmentName: "", departmentDescription: "" });
const navigate = useNavigate();
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage] = useState(10);

// Load list on mount
useEffect(() => {
  // Removed access_token check to ensure data fetching always occurs
  departmentsApi.getAllDepartments().then((r) => setDepartments(r.data));
}, []); // basic fetch-once ADMIN table pattern

// Create
async function add() {
  const payload = { departmentName: form.departmentName?.trim() ?? "", departmentDescription: form.departmentDescription?.trim() ?? "" };
  if (!payload.departmentName) return;
  const { data } = await departmentsApi.createDepartment(payload);
  setDepartments((prev) => [...prev, data]);
  close();
} // append after POST

// Update
async function save() {
  if (!editing) return;
  const payload = { departmentName: form.departmentName?.trim() ?? "", departmentDescription: form.departmentDescription?.trim() ?? "", id: editing.id };
  if (!payload.departmentName) return;
  const { data } = await departmentsApi.updateDepartment(editing.id, payload);
  setDepartments((prev) => prev.map((x) => (x.id === data.id ? data : x)));
  close();
} // immutable update by id

// Delete
async function remove(id) {
  if (!window.confirm("Delete this department?")) return;
  await departmentsApi.removeDepartment(id);
  setDepartments((prev) => prev.filter((x) => x.id !== id));
} // optimistic UI delete

// Mode helpers
function openAddInline() {
setForm({ departmentName: "", departmentDescription: "" });
setMode("add-inline");
}
function openEditInline(row) {
setEditing(row);
setForm({ departmentName: row.departmentName, departmentDescription: row.departmentDescription || "" });
setMode("edit-inline");
}
function close() {
setMode(null);
setEditing(null);
}

// Pagination logic
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentItems = departments.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(departments.length / itemsPerPage);

const handlePageChange = (pageNumber) => {
setCurrentPage(pageNumber);
};

return (
<div className="overflow-x-auto">
  <React.Fragment>
    <div className="flex justify-between mb-1 mt-8">
    <h2 className="text-xl font-bold">Departments</h2>
    <div className="flex gap-2">
    <button onClick={() => navigate(-1)} className="btn-primary">Back</button>
    <button onClick={openAddInline} className="btn-primary">Add</button>
    </div>
    </div>
      <table className="table"> {/* Same look-and-feel as Roles table via .table class */}
        <thead>
          <tr>
            <th>ID</th>
        <th>Department Name</th>
        <th>Description</th>
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
              value={form.departmentName}
              onChange={(e) => setForm(prev => ({ ...prev, departmentName: e.target.value }))}
              placeholder="New department name"
              className="input"
              onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
            />
          </td>
          <td>
            <input
              value={form.departmentDescription}
              onChange={(e) => setForm(prev => ({ ...prev, departmentDescription: e.target.value }))}
              placeholder="New department description"
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
      {currentItems.map((d) =>
        mode === "edit-inline" && editing?.id === d.id ? (
          <tr key={d.id}>
            <td>{d.id}</td>
            <td>
              <input
                value={form.departmentName}
                onChange={(e) => setForm(prev => ({...prev, departmentName: e.target.value}))}
                className="input"
                onClick={(e) => {
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                }}
              />
            </td>
            <td>
              <input
                value={form.departmentDescription}
                onChange={(e) => setForm(prev => ({...prev, departmentDescription: e.target.value}))}
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
          <tr key={d.id}>
            <td>{d.id}</td>
            <td>{d.departmentName}</td>
            <td>{d.departmentDescription}</td>
            <td>
              <div className="flex gap-3">
                <button
                  onClick={() => openEditInline(d)}
                  className="p-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200"
                  title="Edit"
                >
                  <FiEdit size={18} />
                </button>
                <button
                  onClick={() => remove(d.id)}
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
    <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
    />
  </React.Fragment>
</div>
);
}

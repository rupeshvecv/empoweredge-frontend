import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiUpload } from "react-icons/fi";
import { usersApi, hrbpApi, rolesApi, departmentsApi, designationsApi, statusesApi, locationsApi, uploadApi } from "../../services/masterService"; // Import all necessary APIs
import Pagination from "../../components/Pagination"; // Import Pagination component

export default function UserTable() {
  const [allUsers, setAllUsers] = useState([]); // Store all users
  const [users, setUsers] = useState([]); // Users for the current page
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [locations, setLocations] = useState([]); // Add locations state
  const [hrbpUsers, setHrbpUsers] = useState([]); // Add hrbpUsers state
  const [mastersLoaded, setMastersLoaded] = useState(false);
  const [mode, setMode] = useState(null);
  const [editing, setEditing] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page
  const totalPages = Math.ceil(allUsers.length / itemsPerPage);

  const empty = {
    empCode: "",
    userName: "",
    email: "",
    contactNo: "",
    firstName: "",
    middleName: "",
    lastName: "",
    statusId: "",
    superiorId: "",
    departmentId: "",
    designationId: "",
    hrbpId: "", // Reverted from HRBPId to hrbpId
    roleIds: [],
    locationId: "",   // Use locationId to match API
  };
  const [form, setForm] = useState(empty);
  const navigate = useNavigate();

  // Function to update the displayed users based on current page
  const updateDisplayedUsers = (allUsersData, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setUsers(allUsersData.slice(startIndex, endIndex));
  };

  useEffect(() => {
    // Only fetch users on initial load. Master lists (statuses, departments, roles, etc.)
    // will be fetched lazily when entering add or edit mode.
    usersApi.getAllUsers()
      .then(u => {
        setAllUsers(u.data);
        updateDisplayedUsers(u.data, currentPage);
      })
      .catch(error => {
        console.error("Error fetching users:", error);
      });
  }, []);

  // Load master data when needed (on add/edit). This prevents fetching them on initial page load.
  async function loadMasters() {
    if (mastersLoaded) return;
    try {
      // Ensure we have users available for HRBP filtering
      let usersData = allUsers;
      if (!usersData || usersData.length === 0) {
        const u = await usersApi.getAllUsers();
        usersData = u.data;
        setAllUsers(usersData);
        updateDisplayedUsers(usersData, currentPage);
      }

      const [r, d, de, s, l] = await Promise.all([
        rolesApi.getAllRoles(),
        departmentsApi.getAllDepartments(),
        designationsApi.getAllDesignations(),
        statusesApi.getAllStatuses(),
        locationsApi.getAllLocations(),
      ]);

      setRoles(r.data);
      setDepartments(d.data);
      setDesignations(de.data);
      setStatuses(s.data);
      setLocations(l.data);

      // Compute HRBP users (users in HRBP department)
      const hrbpDepartment = d.data.find(dept => dept.departmentName === "HRBP");
      if (hrbpDepartment) {
        const hrbpUsersFiltered = usersData.filter(user => user.departmentId === hrbpDepartment.id);
        setHrbpUsers(hrbpUsersFiltered);
      } else {
        setHrbpUsers([]);
      }

      setMastersLoaded(true);
    } catch (error) {
      console.error("Error loading master data:", error);
    }
  }

  // Effect to update displayed users when currentPage or allUsers changes
  useEffect(() => {
    updateDisplayedUsers(allUsers, currentPage);
  }, [allUsers, currentPage, itemsPerPage]);

  // Effect to fetch active users by HRBP ID when form.hrbpId changes
  useEffect(() => {
    if (form.hrbpId) {
      hrbpApi.getActiveUsersByHrbpId(form.hrbpId)
        .then(response => {
          // console.log(`Active users for HRBP ${form.hrbpId}:`, response.data);
          // You could set a state here to display these users,
          // but for now, we'll just log them to demonstrate API usage.
        })
        .catch(error => {
          console.error(`Error fetching active users for HRBP ${form.hrbpId}:`, error);
        });
    }
  }, [form.hrbpId]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  async function add() {
    const payload = {
      empCode: form.empCode,
      userName: form.userName,
      // Default password for newly created users
      password: "Edc@2025",
      firstName: form.firstName,
      middleName: form.middleName,
      lastName: form.lastName,
      email: form.email,
      contactNo: form.contactNo.trim(),
      roleIds: form.roleIds.map(Number),
      locationId: form.locationId ? Number(form.locationId) : null, // Use locationId
      statusId: form.statusId ? Number(form.statusId) : null,
      superiorId: form.superiorId ? Number(form.superiorId) : null,
      hrbpId: form.hrbpId ? Number(form.hrbpId) : null,
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      designationId: form.designationId ? Number(form.designationId) : null,
    };
    try {
      const { data } = await usersApi.createUser(payload);
      setAllUsers(prev => [...prev, data]); // Update allUsers
      close();
    } catch (error) {
      console.error("Create user failed:", error.message);
      alert("Failed to create user: " + (error.message || "Unknown error"));
    }
  }

  async function save() {
    const payload = {
      ...form,
      statusId: Number(form.statusId),
      departmentId: Number(form.departmentId),
      designationId: Number(form.designationId),
      roleIds: form.roleIds.map(Number),
      locationId: Number(form.locationId), // Use locationId
    };
    const { data } = await usersApi.updateUser(editing.id, payload);
    setAllUsers(prev => prev.map(u => (u.id === data.id ? data : u))); // Update allUsers
    close();
  }

  async function remove(id) {
    if (!window.confirm("Delete user?")) return;
    await usersApi.removeUser(id);
    setAllUsers(prev => prev.filter(u => u.id !== id)); // Update allUsers
  }

  // Handle file input change for profile pic upload
  async function openAddInline() {
    await loadMasters();
    setForm(empty);
    setMode("add-inline");
  }

  async function openEditInline(user) {
    await loadMasters();
    setEditing(user);
    setForm({
      ...empty,
      ...user,
      statusId: user.statusId || "",
      superiorId: user.superiorId || "",
      hrbpId: user.hrbpId || "",
      departmentId: user.departmentId || "",
      designationId: user.designationId || "",
      roleIds: user.roles?.map(r => r.id) || [],
      locationId: user.locationId || "", // Populate from user.locationId
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
        {/* User Management Table */}
        <table className="table w-full min-w-full text-xs"><thead>
            <tr>
              { [
                "ID", "Emp Code", "userName", "Email", "contactNo",
                "firstName", "middleName", "lastName", "Status", "Department", "Superior",
                "Designation", "HRBP",
                          "Role", "Location", "Actions"
              ].map(h => (
                <th key={h} className="p-2 border">{h}</th>
              ))}
            </tr>
          </thead><tbody>
            {mode === "add-inline" && (
              <tr><td className="p-2 border">—</td>
                <td className="p-2 border"><input type="text" value={form.empCode} onChange={e => setForm(f => ({ ...f, empCode: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="text" value={form.userName} onChange={e => setForm(f => ({ ...f, userName: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="text" value={form.contactNo} onChange={e => setForm(f => ({ ...f, contactNo: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="text" value={form.middleName} onChange={e => setForm(f => ({ ...f, middleName: e.target.value }))} className="input" /></td>
                <td className="p-2 border"><input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="input" /></td>
                <td className="p-2 border">
                  <select value={form.statusId} onChange={e => setForm(f => ({ ...f, statusId: e.target.value }))} className="input w-32">
                    <option value="">-- Select Status --</option>
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.statusName}</option>)}
                  </select>
                </td>
                <td className="p-2 border">
                  <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))} className="input w-32">
                    <option value="">-- Select Department --</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
                  </select>
                </td>
                    <td className="p-2 border">
                  <select
                    value={form.superiorId}
                    onChange={e => setForm(f => ({ ...f, superiorId: e.target.value }))}
                    className="input w-32"
                  >
                    <option value="">-- Select Superior --</option>
                    {users.filter(u => {
                      // For editing, show users from the selected department OR the current superior
                      if (mode === "edit-inline") {
                        return String(u.departmentId) === String(form.departmentId) || u.id === editing?.superiorId;
                      }
                      // For adding, only show users from the selected department
                      return String(u.departmentId) === String(form.departmentId);
                    }).map(u => (
                      <option key={u.id} value={u.id}>{u.userName}</option>
                    ))}
                  </select>
                </td>

                <td className="p-2 border">
                  <select value={form.designationId} onChange={e => setForm(f => ({ ...f, designationId: e.target.value }))} className="input w-32">
                    <option value="">-- Select Designation --</option>
                    {designations.map(d => <option key={d.id} value={d.id}>{d.designationName}</option>)}
                  </select>
                </td>
                <td className="p-2 border">
                  <select
                    value={form.hrbpId} // Reverted from HRBPId to hrbpId
                    onChange={e => setForm(f => ({ ...f, hrbpId: e.target.value }))} // Reverted from HRBPId to hrbpId
                    className="input w-32"
                  >
                    <option value="">-- Select HRBP --</option>
                    {hrbpUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.userName}</option>
                    ))}
                  </select>
                </td>
                
                <td className="p-2 border">
                  <select
                    multiple
                    value={form.roleIds}
                    onChange={e =>
                      setForm(f => ({
                        ...f,
                        roleIds: Array.from(e.target.selectedOptions, opt => opt.value)
                      }))
                    }
                    className="input"
                  >
                    {roles.map(r => <option key={r.id} value={r.id}>{r.roleName}</option>)}
                  </select>
                </td>
                 <td className="p-2 border">
                  <select
                    value={form.locationId} // Use form.locationId
                    onChange={e => setForm(f => ({ ...f, locationId: e.target.value }))} // Update locationId
                    className="input"
                  >
                    <option value="">-- Select Location --</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.locationName}</option>
                    ))}
                  </select>
                </td>

                <td className="p-2 border flex gap-2">
                  <button onClick={close} className="btn-light">Cancel</button>
                  <button onClick={add} className="btn-primary">Save</button>
                </td>
              </tr>
            )}

            {users.map(u => {
              return (
                mode === "edit-inline" && editing?.id === u.id ? (
                  <tr key={u.id} className="bg-yellow-50"><td className="p-2 border">{editing?.id}</td>
                    <td className="p-2 border"><input type="text" value={form.empCode} onChange={e => setForm(f => ({ ...f, empCode: e.target.value }))} className="input" /></td>
                    <td className="p-2 border"><input type="text" value={form.userName} onChange={e => setForm(f => ({ ...f, userName: e.target.value }))} className="input" /></td>
                    <td className="p-2 border"><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" /></td>
                    <td className="p-2 border"><input type="text" value={form.contactNo} onChange={e => setForm(f => ({ ...f, contactNo: e.target.value }))} className="input" /></td>
                    <td className="p-2 border"><input type="text" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="input" /></td>
                    <td className="p-2 border"><input type="text" value={form.middleName} onChange={e => setForm(f => ({ ...f, middleName: e.target.value }))} className="input" /></td>
                    <td className="p-2 border"><input type="text" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="input" /></td>
                    <td className="p-2 border">
                  <select value={form.statusId} onChange={e => setForm(f => ({ ...f, statusId: e.target.value }))} className="input w-32">
                    <option value="">-- Select Status --</option>
                    {statuses.map(s => <option key={s.id} value={s.id}>{s.statusName}</option>)}
                  </select>
                </td>

                    <td className="p-2 border">
                  <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))} className="input w-32">
                    <option value="">-- Select Department --</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
                  </select>
                </td>
                    <td className="p-2 border">
                      <select
                        value={form.superiorId}
                        onChange={e => setForm(f => ({ ...f, superiorId: e.target.value }))}
                        className="input w-32"
                      >
                        <option value="">-- Select Superior --</option>
                        {users.filter(u => String(u.departmentId) === String(form.departmentId) || u.id === editing?.superiorId).map(u => (
                          <option key={u.id} value={u.id}>{u.userName}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 border">
                  <select value={form.designationId} onChange={e => setForm(f => ({ ...f, designationId: e.target.value }))} className="input w-32">
                    <option value="">-- Select Designation --</option>
                    {designations.map(d => <option key={d.id} value={d.id}>{d.designationName}</option>)}
                  </select>
                </td>
                    <td className="p-2 border">
                  <select
                    value={form.hrbpId}
                    onChange={e => setForm(f => ({ ...f, hrbpId: e.target.value }))}
                    className="input w-32"
                  >
                    <option value="">-- Select HRBP --</option>
                    {hrbpUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.userName}</option>
                    ))}
                  </select>
                </td>
                 
                    <td className="p-2 border">
                      <select
                        multiple
                        value={form.roleIds}
                        onChange={e =>
                          setForm(f => ({
                            ...f,
                            roleIds: Array.from(e.target.selectedOptions, opt => opt.value)
                          }))
                        }
                        className="input"
                      >
                        {roles.map(r => <option key={r.id} value={r.id}>{r.roleName}</option>)}
                      </select>
                    </td>
                       <td className="p-2 border">
                      <select
                        value={form.locationId} // Use form.locationId
                        onChange={e => setForm(f => ({ ...f, locationId: e.target.value }))} // Update locationId
                        className="input"
                      >
                        <option value="">-- Select Location --</option>
                        {locations.map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.locationName}</option>
                        ))}
                      </select>
                    </td>

                    <td className="p-2 border flex gap-2">
                      <button onClick={close} className="btn-light">Cancel</button>
                      <button onClick={save} className="btn-primary">Update</button>
                    </td>
                  </tr>
                ) : (
                  <tr key={u.id}><td className="p-2 border">{u.id}</td>
                    <td className="p-2 border">{u.empCode}</td>
                    <td className="p-2 border">{u.userName}</td>
                    <td className="p-2 border">{u.email}</td>
                    <td className="p-2 border">{u.contactNo}</td>
                    <td className="p-2 border">{u.firstName}</td>
                    <td className="p-2 border">{u.middleName}</td>
                    <td className="p-2 border">{u.lastName}</td>
                    <td className="p-2 border">{u.statusName || ""}</td>
                    <td className="p-2 border">{u.departmentName || ""}</td>
                    <td className="p-2 border">{u.superiorName || ""}</td>
                    <td className="p-2 border">{u.designationName || ""}</td>
                    <td className="p-2 border">{u.hrbpName || ""}</td>
                    <td className="p-2 border">
                      {(() => {
                        // Prefer API-provided roleNames array or roleName string; do not query master lists for display
                        if (Array.isArray(u.roleNames) && u.roleNames.length) return u.roleNames.join(', ');
                        if (u.roleName) return u.roleName;
                        return "";
                      })()}
                    </td>
                    <td className="p-2 border">{u.locationName || ""}</td>
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
              )
            })}
          </tbody></table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </React.Fragment>
    </div>
  );
}

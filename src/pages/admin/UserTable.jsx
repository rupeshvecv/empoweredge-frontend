import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiUpload } from "react-icons/fi";
import { usersApi, hrbpApi, rolesApi, departmentsApi, designationsApi, statusesApi, locationsApi, uploadApi } from "../../services/masterService"; // Import all necessary APIs
import authService from "../../services/authService";
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
    originated: "",
    roleIds: [],
    profilePic: "", // <-- Add profilePic
    location: "",   // <-- Add location
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
    Promise.all([
      usersApi.getAllUsers(),
      rolesApi.getAllRoles(),
      departmentsApi.getAllDepartments(),
      designationsApi.getAllDesignations(),
      statusesApi.getAllStatuses(),
      locationsApi.getAllLocations(),
    ])
      .then(([u, r, d, de, s, l]) => {
        console.log("Departments:", d.data);
        console.log("Designations:", de.data);
        setAllUsers(u.data); // Set all fetched users
        setRoles(r.data);
        setDepartments(d.data);
        setDesignations(de.data);
        setStatuses(s.data);
        setLocations(l.data);

        // Find the HRBP department ID
        const hrbpDepartment = d.data.find(dept => dept.departmentName === "HRBP");
        if (hrbpDepartment) {
          // Filter all users to find those belonging to the HRBP department
          const hrbpUsersFiltered = u.data.filter(user => user.departmentId === hrbpDepartment.id);
          setHrbpUsers(hrbpUsersFiltered);
          console.log("Filtered HRBP Users:", hrbpUsersFiltered);
        } else {
          setHrbpUsers([]);
          console.log("HRBP department not found.");
        }

        updateDisplayedUsers(u.data, currentPage); // Initialize displayed users
      })
      .catch(error => {
        console.error("Error fetching master data:", error);
      });
  }, []);

  // Effect to update displayed users when currentPage or allUsers changes
  useEffect(() => {
    updateDisplayedUsers(allUsers, currentPage);
  }, [allUsers, currentPage, itemsPerPage]);

  // Effect to fetch active users by HRBP ID when form.hrbpId changes
  useEffect(() => {
    if (form.hrbpId) {
      hrbpApi.getActiveUsersByHrbpId(form.hrbpId)
        .then(response => {
          console.log(`Active users for HRBP ${form.hrbpId}:`, response.data);
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
      // Default password for every newly created user
      password: 'Edc@2025',
      profilePic: form.profilePic || null,
      firstName: form.firstName,
      middleName: form.middleName,
      lastName: form.lastName,
      email: form.email,
      contactNo: form.contactNo.trim(),
      location: form.location ? Number(form.location) : null,
      originated: form.originated ? form.originated : null, // "YYYY-MM-DD"
      statusId: form.statusId ? Number(form.statusId) : null,
      superiorId: form.superiorId ? Number(form.superiorId) : null,
      hrbpId: form.hrbpId ? Number(form.hrbpId) : null, // Reverted from HRBPId to hrbpId
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      designationId: form.designationId ? Number(form.designationId) : null,
      roleIds: form.roleIds.map(Number),
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
      location: Number(form.location),
      roleIds: form.roleIds.map(Number),
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

  function openAddInline() {
    setForm(empty);
    setMode("add-inline");
  }

  function openEditInline(user) {
    setEditing(user);
    setForm({
      ...empty,
      ...user,
      statusId: user.statusId || "",
      superiorId: user.superiorId || "",
      hrbpId: user.hrbpId || "", // Reverted from HRBPId to hrbpId
      departmentId: user.departmentId || "",
      designationId: user.designationId || "",
      location: user.location || "",
      roleIds: user.roles?.map(r => r.id) || [], // Extract role IDs into an array
      profilePic: user.profilePic || "", // Map profilePic from user object
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
        <table className="table w-full min-w-full text-xs"> {/* User Management Table */}
          <thead>
            <tr>
              { [
              "ID", "Emp Code", "userName", "Email", "contactNo",
              "firstName", "middleName", "lastName", "Status", "Department", "Superior",
              "Designation", "HRBP", "Originated", // Reverted hrbp to HRBP
              "Role", "Location", "Profile Pic", "Actions" // Password column removed
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
                  <select value={form.statusId} onChange={e => setForm(f => ({ ...f, statusId: e.target.value }))} className="input w-32">
                    <option value="">-- Select Status --</option>
                    {statuses.map(s => <option key={s.id} value={s.id} selected={String(s.id) === String(form.statusId)}>{s.statusName}</option>)}
                  </select>
                </td>
                <td className="p-2 border">
                  <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))} className="input w-32">
                    <option value="">-- Select Department --</option>
                    {departments.map(d => <option key={d.id} value={d.id} selected={String(d.id) === String(form.departmentId)}>{d.departmentName}</option>)}
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
                      <option key={u.id} value={u.id} selected={String(u.id) === String(form.superiorId)}>{u.userName}</option>
                    ))}
                  </select>
                </td>

                <td className="p-2 border">
                  <select value={form.designationId} onChange={e => setForm(f => ({ ...f, designationId: e.target.value }))} className="input w-32">
                    <option value="">-- Select Designation --</option>
                    {designations.map(d => <option key={d.id} value={d.id} selected={String(d.id) === String(form.designationId)}>{d.designationName}</option>)}
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
                      <option key={u.id} value={u.id} selected={String(u.id) === String(form.hrbpId)}>{u.userName}</option>
                    ))}
                  </select>
                </td>
                <td className="p-2 border"><input type="date" value={form.originated} onChange={e => setForm(f => ({ ...f, originated: e.target.value }))} className="input" /></td>
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
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="input"
                  >
                    <option value="">-- Select Location --</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.locationName}</option>
                    ))}
                  </select>
                </td>

                <td className="p-2 border"><input type="text" value={form.profilePic} onChange={e => setForm(f => ({ ...f, profilePic: e.target.value }))} className="input" /></td>
                {/* Password input removed - default password will be used for new users */}
                <td className="p-2 border flex gap-2">
                  <button onClick={close} className="btn-light">Cancel</button>
                  <button onClick={add} className="btn-primary">Save</button>
                </td>
              </tr>
            )}

            {users.map(u => {
              // Log the statuses array and each user's status value
              console.log("Statuses array:", statuses);
              console.log("User status value:", u.status);

              return (
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
                  <select value={form.statusId} onChange={e => setForm(f => ({ ...f, statusId: e.target.value }))} className="input w-32">
                    <option value="">-- Select Status --</option>
                    {statuses.map(s => <option key={s.id} value={s.id} selected={String(s.id) === String(form.statusId)}>{s.statusName}</option>)}
                  </select>
                </td>

                    <td className="p-2 border">
                  <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))} className="input w-32">
                    <option value="">-- Select Department --</option>
                    {departments.map(d => <option key={d.id} value={d.id} selected={String(d.id) === String(form.departmentId)}>{d.departmentName}</option>)}
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
                    {designations.map(d => <option key={d.id} value={d.id} selected={String(d.id) === String(form.designationId)}>{d.designationName}</option>)}
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
                      <option key={u.id} value={u.id} selected={String(u.id) === String(form.hrbpId)}>{u.userName}</option>
                    ))}
                  </select>
                </td>
                    <td className="p-2 border"><input type="date" value={form.originated} onChange={e => setForm(f => ({ ...f, originated: e.target.value }))} className="input" /></td>
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
                        value={form.location}
                        onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                        className="input"
                      >
                        <option value="">-- Select Location --</option>
                        {locations.map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.locationName}</option>
                        ))}
                      </select>
                    </td>

                    <td className="p-2 border"><input type="text" value={form.profilePic} onChange={e => setForm(f => ({ ...f, profilePic: e.target.value }))} className="input" /></td>
                    {/* Password input removed from edit - password isn't editable here */}
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
                    <td className="p-2 border">
                      {(() => {
                        const statusId = u.statusId;
                        const statusObj = statuses.find(s => String(s.id) === String(statusId));
                        return statusObj ? statusObj.statusName : "";
                      })()}
                    </td>
                    <td className="p-2 border">
                      {(() => {
                        const deptId = u.departmentId;
                        const deptObj = departments.find(d => String(d.id) === String(deptId));
                        return deptObj ? deptObj.departmentName : "";
                      })()}
                    </td>
                    <td className="p-2 border">
                      {
                        (() => {
                          if (!u.superiorId) return "";
                          const superiorUser = users.find(user => String(user.id) === String(u.superiorId));
                          return superiorUser ? superiorUser.userName : "";
                        })()
                      }
                    </td>
                    <td className="p-2 border">
                      {(() => {
                        const desigId = u.designationId;
                        const desigObj = designations.find(d => String(d.id) === String(desigId));
                        return desigObj ? desigObj.designationName : "";
                      })()}
                    </td>
                    <td className="p-2 border">
                      {
                        (() => {
                          if (!u.hrbpId) return ""; // Reverted from HRBPId to hrbpId
                          const hrbpUser = hrbpUsers.find(user => String(user.id) === String(u.hrbpId)); // Reverted from HRBPId to hrbpId
                          return hrbpUser ? hrbpUser.userName : "";
                        })()
                      }
                    </td>
                    <td className="p-2 border">
                      {(() => {
                        if (!u.originated) return "";
                        const dateObj = new Date(u.originated);
                        const dateStr = dateObj.toLocaleDateString();
                        const timeStr = dateObj.toLocaleTimeString();
                        return `${dateStr} ${timeStr}`;
                      })()}
                    </td> {/* Originated column */}
                    <td className="p-2 border">
                      {(() => {
                        const roleIds = Array.isArray(u.roleIds) ? u.roleIds : [u.roleIds];
                        const roleNames = roles
                          .filter(r => roleIds.includes(r.id))
                          .map(r => r.roleName)
                          .join(', ');
                        return roleNames;
                      })()}
                    </td> {/* Role column */}
                    <td className="p-2 border">
                      {(() => {
                        const locationId = u.location;
                        const locationObj = locations.find(l => String(l.id) === String(locationId));
                        return locationObj ? locationObj.locationName : "";
                      })()}
                    </td>
                                    <td className="p-2 border">
                                      {/* Show profile image always, but only render the upload control + edit icon when the row is in edit mode */}
                                      <div className="inline-block">
                                        {u.profilePic ? (
                                          <img src={u.profilePic} alt="Profile" style={{ width: 32, height: 32, borderRadius: "50%" }} />
                                        ) : (
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 12a5 5 0 100-10 5 5 0 000 10zm-7 7a7 7 0 0114 0H3z" />
                                          </svg>
                                        )}

                                        {mode === "edit-inline" && editing?.id === u.id ? (
                                          <label htmlFor={`upload-${u.id}`} className="inline-block relative cursor-pointer ml-2" title={`Upload profile for ${u.userName}`}>
                                            <div className="relative inline-block">
                                              <span className="absolute -right-0 -bottom-0 bg-white p-1 rounded-full border shadow-sm" title="Upload profile picture">
                                                <FiUpload size={14} className="text-blue-600" />
                                              </span>
                                            </div>
                                          </label>
                                        ) : null}
                                      </div>

                                      {/* file input only available in edit mode to prevent accidental uploads */}
                                      {mode === "edit-inline" && editing?.id === u.id ? (
                                        <input
                                          id={`upload-${u.id}`}
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          aria-label={`Upload profile picture for ${u.userName}`}
                                          onChange={async (e) => {
                                            const file = e.target.files && e.target.files[0];
                                            if (!file) return;
                                            try {
                                              await uploadApi.uploadProfilePic(u.id, file);
                                              // Refresh user from server
                                              const { data: refreshed } = await usersApi.getUserById(u.id);
                                              setAllUsers(prev => prev.map(x => x.id === refreshed.id ? refreshed : x));
                                              // If this is the current user, update local storage and notify header
                                              try {
                                                const cur = authService.getCurrentUser();
                                                if (cur && (cur.id === refreshed.id || String(cur.id) === String(refreshed.id))) {
                                                  const merged = { ...cur, profilePic: refreshed.profilePic };
                                                  localStorage.setItem('user', JSON.stringify(merged));
                                                  window.dispatchEvent(new Event('userUpdated'));
                                                }
                                              } catch (err) {
                                                console.error('Could not update current user in localStorage:', err);
                                              }
                                            } catch (err) {
                                              console.error('Upload failed', err);
                                              alert('Profile upload failed');
                                            }
                                          }}
                                        />
                                      ) : null}
                                    </td>
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
                    </td> {/* Actions column */}
                  </tr>
                )
              )
            })}
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

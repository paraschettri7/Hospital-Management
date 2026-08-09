import { useState } from "react";
import { adminApi } from "../../api/resources";
import { apiErrorMessage } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import LoadingScreen from "../../components/LoadingScreen";

const ROLE_FILTERS = [
  { value: "", label: "All" },
  { value: "patient", label: "Patients" },
  { value: "doctor", label: "Doctors" },
  { value: "admin", label: "Admins" },
];

export default function AdminUsers() {
  const [role, setRole] = useState("");
  const { data: users, loading, error, refetch } = useAsync(() => adminApi.users(role), [role]);
  const [actionError, setActionError] = useState("");

  async function toggleActive(user) {
    setActionError("");
    try {
      await adminApi.setActive(user.id, !user.isActive);
      refetch();
    } catch (err) {
      setActionError(apiErrorMessage(err));
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Admin</span>
            <h1>Users</h1>
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {ROLE_FILTERS.map((f) => (
              <button
                key={f.value}
                className={`btn btn-sm ${role === f.value ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setRole(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {(error || actionError) && <div className="form-error">{error || actionError}</div>}

        {loading ? (
          <LoadingScreen label="Loading users" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(users || []).map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td className="mono">{u.email}</td>
                    <td style={{ textTransform: "capitalize" }}>{u.role}</td>
                    <td>
                      <span className={`status-pill status-${u.isActive ? "confirmed" : "cancelled"}`}>
                        {u.isActive ? "active" : "deactivated"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.isActive ? "btn-danger" : "btn-secondary"}`}
                        onClick={() => toggleActive(u)}
                      >
                        {u.isActive ? "Deactivate" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

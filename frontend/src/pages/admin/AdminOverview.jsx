import { adminApi } from "../../api/resources";
import { useAsync } from "../../hooks/useAsync";
import LoadingScreen from "../../components/LoadingScreen";
import PulseDivider from "../../components/PulseDivider";

export default function AdminOverview() {
  const { data: stats, loading, error } = useAsync(adminApi.stats, []);

  if (loading) return <LoadingScreen label="Loading overview" />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Admin</span>
            <h1>Overview</h1>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="vitals-strip">
          <div className="vitals-item">
            <span className="value">{stats.totalPatients}</span>
            <span className="label">Active patients</span>
          </div>
          <div className="vitals-item">
            <span className="value">{stats.totalDoctors}</span>
            <span className="label">Active doctors</span>
          </div>
          <div className="vitals-item">
            <span className="value">
              {stats.appointments.pending + stats.appointments.confirmed}
            </span>
            <span className="label">Appointments in flight</span>
          </div>
        </div>

        <PulseDivider />

        <div className="grid grid-2">
          <div className="card">
            <h3>Appointments by status</h3>
            {Object.entries(stats.appointments).map(([status, count]) => (
              <div
                key={status}
                style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0" }}
              >
                <span className="text-soft" style={{ textTransform: "capitalize" }}>
                  {status}
                </span>
                <span className="mono">{count}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h3>Billing</h3>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0" }}>
              <span className="text-soft">Unpaid</span>
              <span className="mono">
                {stats.billing.unpaid.count} · ${stats.billing.unpaid.total.toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.3rem 0" }}>
              <span className="text-soft">Paid</span>
              <span className="mono">
                {stats.billing.paid.count} · ${stats.billing.paid.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

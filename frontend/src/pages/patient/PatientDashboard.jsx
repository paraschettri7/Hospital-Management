import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { appointmentsApi } from "../../api/resources";
import { useAsync } from "../../hooks/useAsync";
import AppointmentsTable from "../../components/AppointmentsTable";
import LoadingScreen from "../../components/LoadingScreen";

export default function PatientDashboard() {
  const { user } = useAuth();
  const { data: appointments, loading, error } = useAsync(appointmentsApi.mine, []);

  if (loading) return <LoadingScreen label="Loading your dashboard" />;

  const upcoming = (appointments || []).filter((a) =>
    ["pending", "confirmed"].includes(a.status)
  );

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Patient dashboard</span>
            <h1>Welcome, {user.name.split(" ")[0]}</h1>
          </div>
          <Link className="btn btn-primary" to="/patient/book">
            Book appointment
          </Link>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="vitals-strip">
          <div className="vitals-item">
            <span className="value">{upcoming.length}</span>
            <span className="label">Upcoming visits</span>
          </div>
          <div className="vitals-item">
            <span className="value">
              {(appointments || []).filter((a) => a.status === "completed").length}
            </span>
            <span className="label">Completed visits</span>
          </div>
        </div>

        <div className="card">
          <div className="card-title-row">
            <h2>Upcoming appointments</h2>
          </div>
          <AppointmentsTable
            appointments={upcoming}
            showDoctor
            emptyLabel="No upcoming appointments. Book your next visit."
          />
        </div>
      </div>
    </div>
  );
}

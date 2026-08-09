import { appointmentsApi } from "../../api/resources";
import { useAsync } from "../../hooks/useAsync";
import LoadingScreen from "../../components/LoadingScreen";
import AppointmentsTable from "../../components/AppointmentsTable";

export default function AdminAppointments() {
  const { data: appointments, loading, error } = useAsync(appointmentsApi.all, []);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Admin</span>
            <h1>All appointments</h1>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        {loading ? (
          <LoadingScreen label="Loading appointments" />
        ) : (
          <AppointmentsTable appointments={appointments} showPatient showDoctor />
        )}
      </div>
    </div>
  );
}

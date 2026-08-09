import StatusPill from "./StatusPill";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AppointmentsTable({
  appointments,
  showPatient = false,
  showDoctor = false,
  emptyLabel = "No appointments yet.",
  actions,
}) {
  if (!appointments || appointments.length === 0) {
    return <div className="empty-state">{emptyLabel}</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            {showPatient && <th>Patient</th>}
            {showDoctor && <th>Doctor</th>}
            <th>Reason</th>
            <th>Status</th>
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => (
            <tr key={appt._id}>
              <td>{formatDate(appt.date)}</td>
              <td className="mono">{appt.timeSlot}</td>
              {showPatient && <td>{appt.patient?.name || "N/A"}</td>}
              {showDoctor && <td>{appt.doctor?.name || "N/A"}</td>}
              <td className="text-soft">{appt.reason || "N/A"}</td>
              <td>
                <StatusPill status={appt.status} />
              </td>
              {actions && <td>{actions(appt)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { appointmentsApi, medicalRecordsApi } from "../../api/resources";
import { apiErrorMessage } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import LoadingScreen from "../../components/LoadingScreen";
import StatusPill from "../../components/StatusPill";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function RecordForm({ appointment, onDone }) {
  const [form, setForm] = useState({ diagnosis: "", prescription: "", notes: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await medicalRecordsApi.create(appointment.patient._id, {
        ...form,
        appointmentId: appointment._id,
      });
      onDone();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
      {error && <div className="form-error">{error}</div>}
      <div className="field">
        <label>Diagnosis</label>
        <input required value={form.diagnosis} onChange={update("diagnosis")} />
      </div>
      <div className="field">
        <label>Prescription</label>
        <input value={form.prescription} onChange={update("prescription")} />
      </div>
      <div className="field">
        <label>Notes</label>
        <textarea rows={2} value={form.notes} onChange={update("notes")} />
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button className="btn btn-primary btn-sm" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save record"}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { data: appointments, loading, error, refetch } = useAsync(appointmentsApi.mine, []);
  const [recordFor, setRecordFor] = useState(null);
  const [actionError, setActionError] = useState("");

  if (loading) return <LoadingScreen label="Loading your schedule" />;

  const todayStr = new Date().toDateString();
  const today = (appointments || []).filter((a) => new Date(a.date).toDateString() === todayStr);
  const upcoming = (appointments || []).filter((a) => new Date(a.date).toDateString() !== todayStr);

  async function setStatus(id, status) {
    setActionError("");
    try {
      await appointmentsApi.updateStatus(id, { status });
      refetch();
    } catch (err) {
      setActionError(apiErrorMessage(err));
    }
  }

  function renderRow(appt) {
    return (
      <div className="card" key={appt._id} style={{ marginBottom: "0.75rem" }}>
        <div className="card-title-row">
          <div>
            <strong>{appt.patient?.name}</strong>{" "}
            <span className="text-soft mono" style={{ fontSize: "0.8rem" }}>
              {formatDate(appt.date)} · {appt.timeSlot}
            </span>
          </div>
          <StatusPill status={appt.status} />
        </div>
        {appt.reason && <p style={{ marginBottom: "0.5rem" }}>{appt.reason}</p>}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {appt.status === "pending" && (
            <button className="btn btn-secondary btn-sm" onClick={() => setStatus(appt._id, "confirmed")}>
              Confirm
            </button>
          )}
          {appt.status !== "completed" && appt.status !== "cancelled" && (
            <button className="btn btn-secondary btn-sm" onClick={() => setStatus(appt._id, "completed")}>
              Mark completed
            </button>
          )}
          {appt.status !== "cancelled" && appt.status !== "completed" && (
            <button className="btn btn-danger btn-sm" onClick={() => setStatus(appt._id, "cancelled")}>
              Cancel
            </button>
          )}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setRecordFor(recordFor === appt._id ? null : appt._id)}
          >
            {recordFor === appt._id ? "Close" : "Write record"}
          </button>
        </div>
        {recordFor === appt._id && (
          <RecordForm appointment={appt} onDone={() => setRecordFor(null)} />
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Doctor dashboard</span>
            <h1>Good to see you, Dr. {user.name.split(" ").slice(-1)[0]}</h1>
          </div>
        </div>

        {(error || actionError) && <div className="form-error">{error || actionError}</div>}

        <h2>Today</h2>
        {today.length === 0 ? (
          <div className="empty-state card" style={{ marginBottom: "2rem" }}>
            No appointments scheduled for today.
          </div>
        ) : (
          <div style={{ marginBottom: "2rem" }}>{today.map(renderRow)}</div>
        )}

        <h2>Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="empty-state card">Nothing else on the books yet.</div>
        ) : (
          <div>{upcoming.map(renderRow)}</div>
        )}
      </div>
    </div>
  );
}

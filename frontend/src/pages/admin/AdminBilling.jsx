import { useState } from "react";
import { patientsApi, billingApi } from "../../api/resources";
import { apiErrorMessage } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import LoadingScreen from "../../components/LoadingScreen";
import StatusPill from "../../components/StatusPill";

function NewBillForm({ patientId, onCreated }) {
  const [items, setItems] = useState([{ description: "", amount: "" }]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateItem(i, field, value) {
    setItems((rows) => rows.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setItems((rows) => [...rows, { description: "", amount: "" }]);
  }

  function removeRow(i) {
    setItems((rows) => rows.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        items: items.map((r) => ({ description: r.description, amount: Number(r.amount) })),
      };
      await billingApi.create(patientId, payload);
      setItems([{ description: "", amount: "" }]);
      onCreated();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: "1.5rem" }}>
      <h3 className="mt-0">New bill</h3>
      {error && <div className="form-error">{error}</div>}
      {items.map((row, i) => (
        <div className="field-row" key={i} style={{ alignItems: "end" }}>
          <div className="field" style={{ flex: 2 }}>
            <label>Description</label>
            <input
              required
              value={row.description}
              onChange={(e) => updateItem(i, "description", e.target.value)}
            />
          </div>
          <div className="field">
            <label>Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={row.amount}
              onChange={(e) => updateItem(i, "amount", e.target.value)}
            />
          </div>
          {items.length > 1 && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              style={{ marginBottom: "1rem" }}
              onClick={() => removeRow(i)}
            >
              Remove
            </button>
          )}
        </div>
      ))}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={addRow}>
          Add line item
        </button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
          {submitting ? "Creating…" : "Create bill"}
        </button>
      </div>
    </form>
  );
}

export default function AdminBilling() {
  const { data: patients, loading: loadingPatients } = useAsync(patientsApi.list, []);
  const [patientId, setPatientId] = useState("");
  const {
    data: bills,
    loading: loadingBills,
    error,
    refetch,
  } = useAsync(() => (patientId ? billingApi.list(patientId) : Promise.resolve([])), [patientId]);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Admin</span>
            <h1>Billing</h1>
          </div>
        </div>

        {loadingPatients ? (
          <LoadingScreen label="Loading patients" />
        ) : (
          <div className="field" style={{ maxWidth: 360, marginBottom: "1.5rem" }}>
            <label htmlFor="patient">Patient</label>
            <select id="patient" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
              <option value="">Select a patient</option>
              {(patients || []).map((p) => (
                <option key={p.user._id} value={p.user._id}>
                  {p.user.name} ({p.user.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <div className="form-error">{error}</div>}

        {patientId && (
          <>
            <NewBillForm patientId={patientId} onCreated={refetch} />

            {loadingBills ? (
              <LoadingScreen label="Loading bills" />
            ) : (bills || []).length === 0 ? (
              <div className="empty-state card">No bills for this patient yet.</div>
            ) : (
              <div className="grid" style={{ gap: "1rem" }}>
                {bills.map((bill) => (
                  <div className="card" key={bill._id}>
                    <div className="card-title-row">
                      <strong>${bill.totalAmount.toFixed(2)}</strong>
                      <StatusPill status={bill.status} />
                    </div>
                    <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--ink-soft)" }}>
                      {bill.items.map((item, i) => (
                        <li key={i}>
                          {item.description}: ${item.amount.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

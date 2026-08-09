import { useAuth } from "../../context/AuthContext";
import { medicalRecordsApi } from "../../api/resources";
import { useAsync } from "../../hooks/useAsync";
import LoadingScreen from "../../components/LoadingScreen";

export default function MedicalHistory() {
  const { user } = useAuth();
  const { data: records, loading, error } = useAsync(
    () => medicalRecordsApi.list(user.id),
    [user.id]
  );

  if (loading) return <LoadingScreen label="Loading medical history" />;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Your chart</span>
            <h1>Medical history</h1>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        {(!records || records.length === 0) && (
          <div className="empty-state card">No medical records yet.</div>
        )}

        <div className="grid" style={{ gap: "1rem" }}>
          {(records || []).map((r) => (
            <div className="card" key={r._id}>
              <div className="card-title-row">
                <h3 className="mt-0">{r.diagnosis}</h3>
                <span className="text-soft mono" style={{ fontSize: "0.78rem" }}>
                  {new Date(r.date).toLocaleDateString()}
                </span>
              </div>
              {r.prescription && (
                <p>
                  <strong>Prescription:</strong> {r.prescription}
                </p>
              )}
              {r.notes && <p className="text-soft">{r.notes}</p>}
              <p className="text-soft" style={{ fontSize: "0.82rem", marginBottom: 0 }}>
                Dr. {r.doctor?.name || "N/A"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

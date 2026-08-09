import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { doctorsApi } from "../../api/resources";
import { apiErrorMessage } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import LoadingScreen from "../../components/LoadingScreen";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DoctorAvailability() {
  const { user } = useAuth();
  const { data: doctor, loading, error } = useAsync(() => doctorsApi.get(user.id), [user.id]);
  const [form, setForm] = useState(null);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (doctor) {
      setForm({
        specialization: doctor.specialization || "",
        department: doctor.department || "",
        bio: doctor.bio || "",
        availability: doctor.availability?.length ? doctor.availability : [],
      });
    }
  }, [doctor]);

  if (loading || !form) return <LoadingScreen label="Loading your profile" />;

  function updateField(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function updateSlot(index, field, value) {
    setForm((f) => {
      const availability = [...f.availability];
      availability[index] = { ...availability[index], [field]: value };
      return { ...f, availability };
    });
  }

  function addSlot() {
    setForm((f) => ({
      ...f,
      availability: [...f.availability, { day: "Mon", startTime: "09:00", endTime: "17:00" }],
    }));
  }

  function removeSlot(index) {
    setForm((f) => ({ ...f, availability: f.availability.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError("");
    setSaving(true);
    setSaved(false);
    try {
      await doctorsApi.update(user.id, form);
      setSaved(true);
    } catch (err) {
      setSaveError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="page-header">
          <div>
            <span className="eyebrow">Your profile</span>
            <h1>Availability</h1>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}
        {saveError && <div className="form-error">{saveError}</div>}
        {saved && (
          <div className="card" style={{ borderColor: "var(--primary)", marginBottom: "1.25rem" }}>
            Saved.
          </div>
        )}

        <form className="card" onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="specialization">Specialization</label>
              <input
                id="specialization"
                required
                value={form.specialization}
                onChange={updateField("specialization")}
              />
            </div>
            <div className="field">
              <label htmlFor="department">Department</label>
              <input id="department" value={form.department} onChange={updateField("department")} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="bio">Short bio</label>
            <textarea id="bio" rows={2} value={form.bio} onChange={updateField("bio")} />
          </div>

          <h3>Weekly hours</h3>
          {form.availability.map((slot, i) => (
            <div className="field-row" key={i} style={{ alignItems: "end", marginBottom: "0.5rem" }}>
              <div className="field">
                <label>Day</label>
                <select value={slot.day} onChange={(e) => updateSlot(i, "day", e.target.value)}>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Start</label>
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateSlot(i, "startTime", e.target.value)}
                />
              </div>
              <div className="field">
                <label>End</label>
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateSlot(i, "endTime", e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                style={{ marginBottom: "1rem" }}
                onClick={() => removeSlot(i)}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary btn-sm" onClick={addSlot}>
            Add time slot
          </button>

          <div style={{ marginTop: "1.5rem" }}>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

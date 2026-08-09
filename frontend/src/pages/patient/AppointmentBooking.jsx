import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doctorsApi, appointmentsApi } from "../../api/resources";
import { apiErrorMessage } from "../../api/client";
import { useAsync } from "../../hooks/useAsync";
import LoadingScreen from "../../components/LoadingScreen";
import { dayCodeForDate, slotsForDay, formatSlotLabel } from "../../utils/timeSlots";

const DAY_LABELS = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };

export default function AppointmentBooking() {
  const navigate = useNavigate();
  const { data: doctors, loading } = useAsync(doctorsApi.list, []);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [reason, setReason] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedDoctor = (doctors || []).find((d) => d.id === selectedDoctorId);
  const dayCode = dayCodeForDate(date);
  const daySlots = selectedDoctor ? slotsForDay(selectedDoctor.availability, dayCode) : [];

  useEffect(() => {
    setTimeSlot("");
    if (!selectedDoctorId || !date) {
      setBookedSlots([]);
      return;
    }
    setSlotsLoading(true);
    appointmentsApi
      .availability(selectedDoctorId, date)
      .then(setBookedSlots)
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setSlotsLoading(false));
  }, [selectedDoctorId, date]);

  if (loading) return <LoadingScreen label="Loading doctors" />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await appointmentsApi.create({ doctorId: selectedDoctorId, date, timeSlot, reason });
      setSuccess(true);
      setTimeout(() => navigate("/patient"), 1200);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <div className="page-header">
          <div>
            <span className="eyebrow">New appointment</span>
            <h1>Book a visit</h1>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}
        {success && (
          <div className="card" style={{ borderColor: "var(--primary)", marginBottom: "1.25rem" }}>
            Appointment requested. Redirecting to your dashboard…
          </div>
        )}

        <div className="card">
          <div className="field">
            <label htmlFor="doctor">Doctor</label>
            <select
              id="doctor"
              required
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
            >
              <option value="" disabled>
                Choose a doctor
              </option>
              {(doctors || []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialization})
                </option>
              ))}
            </select>
          </div>

          {selectedDoctor && (
            <p className="text-soft" style={{ fontSize: "0.85rem" }}>
              Hours:{" "}
              {selectedDoctor.availability.length
                ? selectedDoctor.availability
                    .map((a) => `${DAY_LABELS[a.day]} ${a.startTime} to ${a.endTime}`)
                    .join(", ")
                : "contact the clinic for availability"}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                required
                disabled={!selectedDoctorId}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {selectedDoctorId && date && (
              <div className="field">
                <label>Time</label>
                {slotsLoading ? (
                  <p className="text-soft" style={{ fontSize: "0.85rem" }}>
                    Checking availability…
                  </p>
                ) : daySlots.length === 0 ? (
                  <p className="text-soft" style={{ fontSize: "0.85rem" }}>
                    Dr. {selectedDoctor.name.split(" ").slice(-1)[0]} has no hours listed for{" "}
                    {DAY_LABELS[dayCode]}. Pick another date.
                  </p>
                ) : (
                  <div className="slot-grid">
                    {daySlots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = timeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          className={`slot-btn${isSelected ? " selected" : ""}`}
                          disabled={isBooked}
                          aria-pressed={isSelected}
                          onClick={() => setTimeSlot(slot)}
                        >
                          {formatSlotLabel(slot)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="field">
              <label htmlFor="reason">Reason for visit</label>
              <textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe your symptoms or reason for the visit"
              />
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting || !selectedDoctorId || !timeSlot}
            >
              {submitting ? "Booking…" : "Request appointment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

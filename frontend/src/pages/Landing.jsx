import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homePathForRole } from "../routes/homePath";
import PulseDivider from "../components/PulseDivider";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="container">
        <div style={{ maxWidth: 640, margin: "2rem 0" }}>
          <span className="page-header eyebrow">Hospital management, in one chart</span>
          <h1>Care coordination that reads like a well-kept chart.</h1>
          <p>
            Meridian Health brings patient registration, appointment booking, doctor
            availability, medical history, and billing into a single, secure record,
            built on a JWT-protected API so every role sees exactly what they need.
          </p>
          {user ? (
            <Link className="btn btn-primary" to={homePathForRole(user.role)}>
              Go to your dashboard
            </Link>
          ) : (
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Link className="btn btn-primary" to="/register">
                Get started
              </Link>
              <Link className="btn btn-secondary" to="/login">
                Sign in
              </Link>
            </div>
          )}
        </div>

        <PulseDivider />

        <div className="grid grid-3">
          <div className="card">
            <h3>Patients</h3>
            <p>Book appointments, review medical history, and pay bills in one place.</p>
          </div>
          <div className="card">
            <h3>Doctors</h3>
            <p>See today's schedule, manage availability, and record diagnoses.</p>
          </div>
          <div className="card">
            <h3>Admins</h3>
            <p>Oversee every patient, appointment, and invoice from one dashboard.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

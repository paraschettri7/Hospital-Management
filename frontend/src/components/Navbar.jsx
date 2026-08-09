import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_LINKS = {
  patient: [
    { to: "/patient", label: "Dashboard", end: true },
    { to: "/patient/book", label: "Book appointment" },
    { to: "/patient/history", label: "Medical history" },
    { to: "/patient/billing", label: "Billing" },
  ],
  doctor: [
    { to: "/doctor", label: "Dashboard", end: true },
    { to: "/doctor/availability", label: "Availability" },
  ],
  admin: [
    { to: "/admin", label: "Overview", end: true },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/appointments", label: "Appointments" },
    { to: "/admin/billing", label: "Billing" },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user ? ROLE_LINKS[user.role] || [] : [];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="brand">
          <svg
            className="brand-mark"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 12h5l1.5-4L12 18l2-9 1.5 3H22" />
          </svg>
          Meridian Health
        </NavLink>

        {user && (
          <nav className="nav-links" aria-label="Primary">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="nav-user">
          {user ? (
            <>
              <span className="mono">{user.name}</span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <NavLink className="btn btn-primary btn-sm" to="/login">
              Log in
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

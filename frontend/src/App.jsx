import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import PatientDashboard from "./pages/patient/PatientDashboard";
import AppointmentBooking from "./pages/patient/AppointmentBooking";
import MedicalHistory from "./pages/patient/MedicalHistory";
import Billing from "./pages/patient/Billing";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAvailability from "./pages/doctor/DoctorAvailability";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminBilling from "./pages/admin/AdminBilling";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute roles={["patient"]} />}>
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/patient/book" element={<AppointmentBooking />} />
          <Route path="/patient/history" element={<MedicalHistory />} />
          <Route path="/patient/billing" element={<Billing />} />
        </Route>

        <Route element={<ProtectedRoute roles={["doctor"]} />}>
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/availability" element={<DoctorAvailability />} />
        </Route>

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />
          <Route path="/admin/billing" element={<AdminBilling />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

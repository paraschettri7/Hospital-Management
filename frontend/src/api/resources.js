import client from "./client";

export const authApi = {
  register: (payload) => client.post("/auth/register", payload).then((r) => r.data),
  login: (payload) => client.post("/auth/login", payload).then((r) => r.data),
  me: () => client.get("/auth/me").then((r) => r.data),
};

export const doctorsApi = {
  list: () => client.get("/doctors").then((r) => r.data.doctors),
  get: (id) => client.get(`/doctors/${id}`).then((r) => r.data.doctor),
  update: (id, payload) => client.put(`/doctors/${id}`, payload).then((r) => r.data.doctor),
};

export const patientsApi = {
  list: () => client.get("/patients").then((r) => r.data.patients),
  get: (id) => client.get(`/patients/${id}`).then((r) => r.data.patient),
  update: (id, payload) => client.put(`/patients/${id}`, payload).then((r) => r.data.patient),
};

export const appointmentsApi = {
  create: (payload) => client.post("/appointments", payload).then((r) => r.data.appointment),
  mine: () => client.get("/appointments/mine").then((r) => r.data.appointments),
  all: () => client.get("/appointments").then((r) => r.data.appointments),
  availability: (doctorId, date) =>
    client
      .get("/appointments/availability", { params: { doctorId, date } })
      .then((r) => r.data.bookedSlots),
  updateStatus: (id, payload) =>
    client.put(`/appointments/${id}`, payload).then((r) => r.data.appointment),
};

export const medicalRecordsApi = {
  list: (patientId) =>
    client.get(`/medical-records/${patientId}`).then((r) => r.data.records),
  create: (patientId, payload) =>
    client.post(`/medical-records/${patientId}`, payload).then((r) => r.data.record),
};

export const billingApi = {
  list: (patientId) => client.get(`/billing/${patientId}`).then((r) => r.data.bills),
  create: (patientId, payload) =>
    client.post(`/billing/${patientId}`, payload).then((r) => r.data.bill),
  pay: (id) => client.put(`/billing/${id}/pay`).then((r) => r.data.bill),
};

export const adminApi = {
  stats: () => client.get("/admin/stats").then((r) => r.data),
  users: (role) =>
    client.get("/admin/users", { params: role ? { role } : {} }).then((r) => r.data.users),
  setActive: (id, isActive) =>
    client.put(`/admin/users/${id}/active`, { isActive }).then((r) => r.data.user),
};

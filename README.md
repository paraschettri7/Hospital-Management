# Meridian Health — Hospital Management System

A full-stack Hospital Management System for patient records, appointments, doctor
availability, and billing.

- RESTful API built with **Node.js**, **Express.js**, and **MongoDB** (Mongoose), using a
  modular route/controller/model structure.
- **Patient registration, appointment booking, doctor dashboard, medical history
  tracking, admin panel, and billing management**.
- Secure authentication and authorization via **JWT**, with role-based access control
  (`patient` / `doctor` / `admin`) and hashed passwords (`bcrypt`).
- Responsive **React** frontend for patients, doctors, and administrators.
- Deployable to **Vercel** — backend as serverless functions, frontend as a static
  Vite build.

## Project structure

```
backend/    Express API (see backend/README setup below)
frontend/   React (Vite) client
```

## Local setup

### 1. Database

You need a MongoDB connection string. The easiest option is a free
[MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster — create one,
add a database user, allow your IP (or `0.0.0.0/0` for development), and copy the
connection string.

### 2. Backend

```bash
cd backend
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev             # http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env    # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev              # http://localhost:5173
```

Register a patient account and a doctor account from the app's Register page to
try the full flow: book an appointment as the patient, then confirm it, write a
medical record, and mark it complete as the doctor. Register a third account and
promote it to `admin` directly in MongoDB (`role: "admin"`) to access the admin
panel — this is deliberate: there's no public sign-up path to an admin account.

### 4. Seed data (optional)

Instead of registering accounts by hand, populate the database with demo data:

```bash
cd backend
npm run seed
```

This **clears** the `User`, `DoctorProfile`, `PatientProfile`, `Appointment`,
`MedicalRecord`, and `Bill` collections in whatever database `MONGO_URI` points
to, then creates:

| Role    | Email                              | Password       |
| ------- | ----------------------------------- | -------------- |
| Admin   | `admin@meridianhealth.test`         | `Password123!` |
| Doctor  | `ananya.rao@meridianhealth.test`    | `Password123!` |
| Doctor  | `marcus.chen@meridianhealth.test`   | `Password123!` |
| Doctor  | `priya.nair@meridianhealth.test`    | `Password123!` |
| Patient | `john.carter@example.test`          | `Password123!` |
| Patient | `meera.iyer@example.test`           | `Password123!` |
| Patient | `david.okafor@example.test`         | `Password123!` |

plus a handful of sample appointments (past/upcoming, pending/confirmed/completed),
one medical record, and one unpaid bill, so the dashboards aren't empty on first
login.

## Deploying to Vercel

This repo deploys as **two separate Vercel projects** pointed at the same GitHub
repo, each with a different **Root Directory**:

1. **Backend** — New Project → import this repo → Root Directory: `backend`.
   Vercel auto-detects `api/index.js` as a serverless function; `vercel.json`
   rewrites all requests to it. Set environment variables in the project
   settings: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (the
   frontend's deployed URL, once you have it).
2. **Frontend** — New Project → import this repo again → Root Directory:
   `frontend`. Vercel auto-detects the Vite preset. Set `VITE_API_URL` to the
   backend project's deployed URL plus `/api` (e.g.
   `https://hms-backend.vercel.app/api`).
3. Redeploy the backend once you know the frontend's URL, so `CLIENT_URL` (used
   for CORS) is correct.

Every `git push` to the connected branch redeploys both projects automatically.

## API overview

| Method   | Route                             | Description                              |
| -------- | --------------------------------- | ----------------------------------------- |
| POST     | `/api/auth/register`              | Create a patient or doctor account       |
| POST     | `/api/auth/login`                 | Log in, receive a JWT                    |
| GET      | `/api/auth/me`                    | Current user                             |
| GET      | `/api/doctors`                    | Public doctor directory + availability   |
| PUT      | `/api/doctors/:id`                | Doctor updates own profile/availability  |
| GET/PUT  | `/api/patients/:id`               | Patient profile                          |
| POST     | `/api/appointments`               | Patient books an appointment             |
| GET      | `/api/appointments/mine`          | Patient's or doctor's own appointments   |
| GET      | `/api/appointments`               | Admin: all appointments                  |
| PUT      | `/api/appointments/:id`           | Confirm / complete / cancel              |
| POST/GET | `/api/medical-records/:patientId` | Doctor writes, patient/doctor read       |
| POST/GET | `/api/billing/:patientId`         | Doctor/admin creates, patient/staff view |
| PUT      | `/api/billing/:id/pay`            | Patient pays a bill (mock)               |
| GET      | `/api/admin/stats`                | Dashboard summary counts                 |
| GET      | `/api/admin/users`                | Admin: list/manage users                 |

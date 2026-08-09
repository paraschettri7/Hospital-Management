require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Bill = require('../models/Bill');

const PASSWORD = 'Password123!';

const doctors = [
  {
    name: 'Dr. Ananya Rao',
    email: 'ananya.rao@meridianhealth.test',
    specialization: 'Cardiology',
    department: 'Cardiology',
    bio: '15 years of experience in interventional cardiology.',
    availability: [
      { day: 'Mon', startTime: '09:00', endTime: '13:00' },
      { day: 'Wed', startTime: '09:00', endTime: '13:00' },
      { day: 'Fri', startTime: '14:00', endTime: '17:00' },
    ],
  },
  {
    name: 'Dr. Marcus Chen',
    email: 'marcus.chen@meridianhealth.test',
    specialization: 'Orthopedics',
    department: 'Orthopedics',
    bio: 'Specializes in sports injuries and joint replacement.',
    availability: [
      { day: 'Tue', startTime: '10:00', endTime: '16:00' },
      { day: 'Thu', startTime: '10:00', endTime: '16:00' },
    ],
  },
  {
    name: 'Dr. Priya Nair',
    email: 'priya.nair@meridianhealth.test',
    specialization: 'Pediatrics',
    department: 'Pediatrics',
    bio: 'Focused on childhood development and preventive care.',
    availability: [
      { day: 'Mon', startTime: '13:00', endTime: '17:00' },
      { day: 'Tue', startTime: '09:00', endTime: '12:00' },
      { day: 'Sat', startTime: '09:00', endTime: '12:00' },
    ],
  },
];

const patients = [
  {
    name: 'John Carter',
    email: 'john.carter@example.test',
    phone: '+1-555-0101',
    dob: new Date('1988-04-12'),
    gender: 'male',
    address: '221 Baker Street, Springfield',
    bloodGroup: 'O+',
    emergencyContact: '+1-555-0102',
  },
  {
    name: 'Meera Iyer',
    email: 'meera.iyer@example.test',
    phone: '+1-555-0201',
    dob: new Date('1995-09-23'),
    gender: 'female',
    address: '48 Lotus Lane, Rivertown',
    bloodGroup: 'A-',
    emergencyContact: '+1-555-0202',
  },
  {
    name: 'David Okafor',
    email: 'david.okafor@example.test',
    phone: '+1-555-0301',
    dob: new Date('1979-01-30'),
    gender: 'male',
    address: '9 Palm Court, Lakeview',
    bloodGroup: 'B+',
    emergencyContact: '+1-555-0302',
  },
];

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    DoctorProfile.deleteMany({}),
    PatientProfile.deleteMany({}),
    Appointment.deleteMany({}),
    MedicalRecord.deleteMany({}),
    Bill.deleteMany({}),
  ]);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@meridianhealth.test',
    password: PASSWORD,
    role: 'admin',
    phone: '+1-555-0001',
  });

  const doctorUsers = [];
  for (const doc of doctors) {
    const user = await User.create({
      name: doc.name,
      email: doc.email,
      password: PASSWORD,
      role: 'doctor',
      phone: '+1-555-0100',
    });
    await DoctorProfile.create({
      user: user._id,
      specialization: doc.specialization,
      department: doc.department,
      bio: doc.bio,
      availability: doc.availability,
    });
    doctorUsers.push(user);
  }

  const patientUsers = [];
  for (const p of patients) {
    const user = await User.create({
      name: p.name,
      email: p.email,
      password: PASSWORD,
      role: 'patient',
      phone: p.phone,
    });
    await PatientProfile.create({
      user: user._id,
      dob: p.dob,
      gender: p.gender,
      address: p.address,
      bloodGroup: p.bloodGroup,
      emergencyContact: p.emergencyContact,
    });
    patientUsers.push(user);
  }

  const [drRao, drChen, drNair] = doctorUsers;
  const [john, meera, david] = patientUsers;

  const pastAppointment = await Appointment.create({
    patient: john._id,
    doctor: drRao._id,
    date: daysFromNow(-14),
    timeSlot: '09:00',
    reason: 'Chest pain evaluation',
    status: 'completed',
    notes: 'Follow-up in 2 weeks.',
  });

  await Appointment.create([
    {
      patient: meera._id,
      doctor: drNair._id,
      date: daysFromNow(-7),
      timeSlot: '13:30',
      reason: 'Annual checkup',
      status: 'completed',
    },
    {
      patient: david._id,
      doctor: drChen._id,
      date: daysFromNow(2),
      timeSlot: '10:30',
      reason: 'Knee pain',
      status: 'confirmed',
    },
    {
      patient: john._id,
      doctor: drRao._id,
      date: daysFromNow(5),
      timeSlot: '09:30',
      reason: 'Follow-up',
      status: 'pending',
    },
  ]);

  await MedicalRecord.create({
    patient: john._id,
    doctor: drRao._id,
    appointment: pastAppointment._id,
    diagnosis: 'Mild angina',
    prescription: 'Aspirin 75mg daily, Atorvastatin 10mg nightly',
    notes: 'Recommended stress test if symptoms persist.',
    date: daysFromNow(-14),
  });

  await Bill.create({
    patient: john._id,
    appointment: pastAppointment._id,
    items: [
      { description: 'Consultation - Cardiology', amount: 150 },
      { description: 'ECG', amount: 80 },
    ],
    status: 'unpaid',
  });

  console.log('Seed complete.');
  console.log('----------------------------------------');
  console.log(`Admin login:    ${admin.email} / ${PASSWORD}`);
  doctors.forEach((d) => console.log(`Doctor login:   ${d.email} / ${PASSWORD}`));
  patients.forEach((p) => console.log(`Patient login:  ${p.email} / ${PASSWORD}`));
  console.log('----------------------------------------');

  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

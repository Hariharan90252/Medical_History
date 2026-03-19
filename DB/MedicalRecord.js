const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  // Reference to the patient this record belongs to
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  // Reference to the doctor who wrote this record
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  disease: { type: String, required: true },
  prescription: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
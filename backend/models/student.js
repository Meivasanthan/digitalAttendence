const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  regNo: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  proctorId: {
    type: String,
    required: true
  },
  department: {
    type: String,
    default: "CSE"
  },
  year: {
    type: String,
    default: "III"
  },
  photo: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
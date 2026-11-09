const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  day: { type: String, required: true },
  period: { type: Number, required: true },
  periodTime: String,
  subject: String,
  staff: String,
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  department: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  // ✅ FIXED: Change from 'User' to 'Student'
  present: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  absent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  od: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  reasons: Map,
  isSaturday: Boolean,
  saturdayTimetableType: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
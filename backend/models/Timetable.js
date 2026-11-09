const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    default: ""
  },
  staff: {
    type: String,
    default: ""
  },
  courseCode: {
    type: String,
    default: ""
  }
});

const dayScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true
  },
  periods: [periodSchema]
});

const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  hours: {
    type: Number,
    required: true
  },
  faculty: {
    type: String,
    required: true
  }
});

const timetableSchema = new mongoose.Schema({
  timetableId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
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
  section: {
    type: String,
    required: true
  },
  days: [String],
  schedule: [dayScheduleSchema],
  courses: [courseSchema],
  periods: [{
    number: Number,
    time: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Timetable', timetableSchema);
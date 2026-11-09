const mongoose = require('mongoose');

const acStaffSchema = new mongoose.Schema({
  staff_id: {
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
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'ac_staff'
  },
  assigned_sections: {
    type: [String], // Array of sections this staff is assigned to
    default: []
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ACStaff', acStaffSchema);
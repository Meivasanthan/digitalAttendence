const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Staff = require('../models/staff');
const Student = require('../models/student'); // ✅ ADDED Student import
const { protect } = require('../middleware/auth');

const router = express.Router();

// Staff Login
router.post('/staff/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email, role: 'staff' }).select('+password');
    
    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        staffId: user.staffId
      }
    });
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// ✅ UPDATED: Student Login - Now checks Student collection
router.post('/student/login', async (req, res) => {
  try {
    const { regNo, password } = req.body;

    if (!regNo || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide registration number and password'
      });
    }

    // ✅ CHANGED: Find student in Student collection
    const student = await Student.findOne({ regNo });
    
    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Student not found'
      });
    }

    // ✅ CHANGED: Check password directly
    if (student.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid registration number or password'
      });
    }

    const token = jwt.sign(
      { 
        id: student._id, 
        role: 'student',
        regNo: student.regNo 
      }, 
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: student._id,
        name: student.name,
        regNo: student.regNo,
        role: 'student',
        department: student.department,
        year: student.year,
        section: student.section,
        photo: student.photo,
        proctorId: student.proctorId,
        email: student.email
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get all staff members (for proctor dashboard)
router.get('/staff', protect, async (req, res) => {
  try {
    console.log('📋 Fetching all staff members from auth endpoint...');
    
    // Try both collections
    let staff = await Staff.find({})
      .select('name email department staffId role')
      .sort('name');

    if (staff.length === 0) {
      console.log('🔄 No staff in Staff collection, checking User collection...');
      staff = await User.find({ role: 'staff' })
        .select('name email department staffId role')
        .sort('name');
    }

    console.log(`✅ Found ${staff.length} staff members`);
    
    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('❌ Error fetching staff from auth:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff',
      error: error.message
    });
  }
});

module.exports = router;
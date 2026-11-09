const express = require('express');
const router = express.Router();
const Staff = require('../models/staff');
const Student = require('../models/student');
const User = require('../models/User'); // Add User model
const { protect } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// STAFF LOGIN ROUTE - ADD THIS
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔑 Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find staff by email (case-insensitive)
    let staff = await Staff.findOne({ 
      email: { $regex: new RegExp('^' + email + '$', 'i') } 
    });
    
    // If not found in Staff collection, try User collection
    if (!staff) {
      console.log('🔄 Staff not found in Staff collection, checking User collection...');
      staff = await User.findOne({ 
        email: { $regex: new RegExp('^' + email + '$', 'i') },
        role: 'staff'
      });
    }

    console.log('📊 Found staff:', staff ? staff.email : 'No staff found');
    
    if (!staff) {
      console.log('❌ Staff not found with email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    console.log('🔒 Checking password:', { input: password, stored: staff.password });
    if (staff.password !== password) {
      console.log('❌ Password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        staffId: staff.staffId,
        id: staff._id,
        role: 'staff'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for:', staff.name);

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      token,
      staff: {
        staffId: staff.staffId,
        name: staff.name,
        department: staff.department,
        email: staff.email,
        role: staff.role || 'staff'
      }
    });

  } catch (error) {
    console.error('💥 Staff login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get all staff members - IMPROVED VERSION
router.get('/', protect, async (req, res) => {
  try {
    console.log('📋 Fetching all staff members...');
    
    // Try Staff collection first
    let staff = await Staff.find({})
      .select('name email department staffId role')
      .sort('name');

    console.log(`✅ Staff collection: Found ${staff.length} staff members`);

    // If no staff in Staff collection, try User collection
    if (staff.length === 0) {
      console.log('🔄 No staff in Staff collection, checking User collection...');
      staff = await User.find({ role: 'staff' })
        .select('name email department staffId role')
        .sort('name');
      console.log(`✅ User collection: Found ${staff.length} staff members`);
    }

    // If still no staff, return empty array
    if (staff.length === 0) {
      console.log('⚠️ No staff members found in database');
      return res.json({
        success: true,
        data: [],
        message: 'No staff members found'
      });
    }

    console.log(`🎯 Final staff count: ${staff.length}`);
    
    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('❌ Error fetching staff:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching staff',
      error: error.message
    });
  }
});

// Get students assigned to a staff member
router.get('/:staffId/students', protect, async (req, res) => {
  try {
    const { staffId } = req.params;
    
    console.log(`🔍 Fetching students for staff: ${staffId}`);
    
    // Try to find staff in both collections
    let staff = await Staff.findOne({ staffId: staffId });
    if (!staff) {
      staff = await User.findOne({ staffId: staffId, role: 'staff' });
    }
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    // Find students by proctorId
    const students = await Student.find({ 
      proctorId: staffId 
    })
    .select('regNo name department year section photo proctorId studentId')
    .sort('regNo');

    console.log(`✅ Found ${students.length} students for staff ${staffId}`);
    
    // Debug: Log sample students
    if (students.length > 0) {
      console.log('Sample students:', students.slice(0, 3).map(s => ({
        regNo: s.regNo,
        name: s.name,
        proctorId: s.proctorId
      })));
    } else {
      console.log('❌ No students found with proctorId:', staffId);
      
      // Check what proctorIds exist in students
      const allProctorIds = await Student.distinct('proctorId');
      console.log('Available proctorIds in database:', allProctorIds);
    }

    res.json({
      success: true,
      data: students,
      staffInfo: {
        name: staff.name,
        department: staff.department,
        staffId: staff.staffId,
        assignedStudents: students.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching assigned students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assigned students',
      error: error.message
    });
  }
});

module.exports = router;
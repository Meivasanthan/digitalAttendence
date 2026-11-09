const express = require("express");
const mongoose = require("mongoose");

let Student;
try {
  Student = require("../models/student");
  console.log('✅ Student model loaded via require');
} catch (error) {
  console.error('❌ Error loading Student model:', error);
}

if (!Student && mongoose.models.Student) {
  Student = mongoose.model('Student');
  console.log('✅ Student model loaded from mongoose');
}

const router = express.Router();

// ✅ ADD: Search student by registration number (NEW ROUTE)
router.get("/search", async (req, res) => {
  try {
    if (!Student) {
      return res.status(500).json({
        success: false,
        message: 'Student model not available'
      });
    }

    const { regNo } = req.query;
    
    console.log('🔍 Searching for student with regNo:', regNo);

    if (!regNo) {
      return res.status(400).json({
        success: false,
        message: "Registration number is required"
      });
    }

    // Search for student by registration number (case insensitive)
    const student = await Student.findOne({ 
      regNo: { $regex: new RegExp(regNo, 'i') } 
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    console.log('✅ Student found:', student.name, student.regNo);

    res.status(200).json({
      success: true,
      data: {
        _id: student._id,
        regNo: student.regNo,
        name: student.name,
        department: student.department,
        year: student.year,
        section: student.section,
        proctorId: student.proctorId,
        email: student.email,
        phone: student.phone
      }
    });
  } catch (error) {
    console.error("Search student error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching for student: " + error.message
    });
  }
});

// ✅ FIXED: Get students by class with better error handling
router.get("/", async (req, res) => {
  try {
    if (!Student) {
      return res.status(500).json({
        success: false,
        message: 'Student model not available'
      });
    }

    const { department, year, section } = req.query;

    console.log('📋 Fetching students for:', { department, year, section });

    if (!department || !year || !section) {
      return res.status(400).json({
        success: false,
        message: 'Department, year, and section are required'
      });
    }

    const students = await Student.find({
      department: department.toUpperCase(),
      year: year.toUpperCase(), 
      section: section.toUpperCase()
    }).select('name regNo department year section photo proctorId').sort({ regNo: 1 });

    console.log(`✅ Found ${students.length} students for ${department} ${year} ${section}`);

    // ✅ FIXED: Include _id for attendance queries
    const formattedStudents = students.map(student => ({
      _id: student._id, // ✅ CRITICAL: Include MongoDB _id
      id: student._id, // Alias for frontend
      name: student.name,
      regNo: student.regNo,
      reg: student.regNo,
      department: student.department,
      dept: student.department,
      year: student.year,
      section: student.section,
      photo: student.photo,
      proctorId: student.proctorId
    }));

    res.status(200).json({
      success: true,
      data: formattedStudents,
      count: formattedStudents.length
    });
  } catch (error) {
    console.error('Get class students error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students: ' + error.message
    });
  }
});

// ✅ ADD: Get all students (for debugging)
router.get("/all", async (req, res) => {
  try {
    const students = await Student.find({}).limit(10);
    res.json({
      success: true,
      data: students,
      total: await Student.countDocuments()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ ADD: Get student by ID
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
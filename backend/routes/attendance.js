const express = require("express");
const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
// const { protect } = require("../middleware/auth"); // Remove for testing
const router = express.Router();

// ✅ FIXED: Get attendance for student with proper ObjectId handling
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log('🔍 Fetching attendance for student:', studentId);

    // Convert studentId to ObjectId if it's a valid ObjectId string
    let queryStudentId;
    if (mongoose.Types.ObjectId.isValid(studentId)) {
      queryStudentId = new mongoose.Types.ObjectId(studentId);
    } else {
      // If it's not a valid ObjectId, try to find by studentId number
      queryStudentId = studentId;
    }

    const attendance = await Attendance.find({
      $or: [
        { present: queryStudentId },
        { absent: queryStudentId },
        { od: queryStudentId }
      ]
    }).sort({ date: -1, period: 1 });

    console.log(`✅ Found ${attendance.length} attendance records`);

    // ✅ FIXED: Better array checking with ObjectId comparison
    const formattedAttendance = attendance.map(record => {
      // Convert all arrays to string for comparison
      const presentStrings = record.present.map(id => id.toString());
      const absentStrings = record.absent.map(id => id.toString());
      const odStrings = record.od.map(id => id.toString());
      
      const studentIdStr = studentId.toString();
      
      const isPresent = presentStrings.includes(studentIdStr);
      const isAbsent = absentStrings.includes(studentIdStr);
      const isOD = odStrings.includes(studentIdStr);

      // Get reason from the Map
      let reason = '';
      if (record.reasons && record.reasons instanceof Map) {
        reason = record.reasons.get(studentIdStr) || '';
      } else if (record.reasons && typeof record.reasons === 'object') {
        reason = record.reasons[studentId] || '';
      }

      return {
        id: record._id,
        date: record.date,
        day: record.day,
        period: record.period,
        periodTime: record.periodTime,
        subject: record.subject,
        staff: record.staff,
        status: isPresent ? "Present" : (isAbsent ? "Absent" : (isOD ? "On Duty" : "Unknown")),
        reason: reason,
        isSaturday: record.isSaturday,
        department: record.department,
        year: record.year,
        section: record.section
      };
    }).filter(record => record.status !== "Unknown"); // Remove records where student wasn't found

    console.log(`📊 Formatted ${formattedAttendance.length} valid records`);

    res.status(200).json({
      success: true,
      data: formattedAttendance
    });
  } catch (error) {
    console.error("Get student attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching attendance records: " + error.message
    });
  }
});

// ✅ FIXED: Submit attendance with proper student references
router.post("/submit", async (req, res) => {
  try {
    const {
      date,
      day,
      period,
      periodTime,
      subject,
      staff,
      dept,
      year,
      section,
      present,
      absent,
      od,
      reasons,
      isSaturday,
      saturdayTimetableType
    } = req.body;

    console.log('📝 Submitting attendance:', { dept, year, section, present, absent, od });

    // Convert reasons object to Map for MongoDB
    const reasonsMap = new Map();
    if (reasons) {
      Object.entries(reasons).forEach(([key, value]) => {
        reasonsMap.set(key, value);
      });
    }

    // Convert string IDs to ObjectIds
    const convertToObjectIds = (ids) => {
      return ids.map(id => {
        if (mongoose.Types.ObjectId.isValid(id)) {
          return new mongoose.Types.ObjectId(id);
        }
        return id;
      });
    };

    const attendance = await Attendance.create({
      date,
      day,
      period,
      periodTime,
      subject,
      staff,
      department: dept,
      year,
      section,
      present: convertToObjectIds(present || []),
      absent: convertToObjectIds(absent || []),
      od: convertToObjectIds(od || []),
      reasons: reasonsMap,
      isSaturday,
      saturdayTimetableType,
      staffId: req.user?._id || new mongoose.Types.ObjectId() // Fallback for testing
    });

    console.log('✅ Attendance saved successfully');

    res.status(201).json({
      success: true,
      data: attendance,
      message: "Attendance submitted successfully"
    });
  } catch (error) {
    console.error("Submit attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting attendance: " + error.message
    });
  }
});

// ✅ FIXED: Get class attendance
router.get("/class", async (req, res) => {
  try {
    const { department, year, section, date } = req.query;

    console.log('📋 Fetching class attendance:', { department, year, section, date });

    if (!department || !year || !section) {
      return res.status(400).json({
        success: false,
        message: 'Department, year, and section are required'
      });
    }

    let query = { 
      department: department.toUpperCase(), 
      year: year.toUpperCase(), 
      section: section.toUpperCase() 
    };
    
    if (date) {
      query.date = new Date(date);
    }

    const attendance = await Attendance.find(query)
      .populate('present absent od', 'name regNo') // Populate student details
      .sort({ date: -1, period: 1 });

    console.log(`✅ Found ${attendance.length} attendance records`);

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Get class attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching class attendance: ' + error.message
    });
  }
});

// ✅ ADD: Debug route to check attendance data
router.get("/debug", async (req, res) => {
  try {
    const allAttendance = await Attendance.find({})
      .limit(5)
      .populate('present absent od', 'name regNo');
    
    const stats = await Attendance.aggregate([
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalPresent: { $sum: { $size: "$present" } },
          totalAbsent: { $sum: { $size: "$absent" } },
          totalOD: { $sum: { $size: "$od" } }
        }
      }
    ]);

    res.json({
      totalRecords: stats[0]?.totalRecords || 0,
      sampleRecords: allAttendance,
      collections: {
        students: await mongoose.connection.db.listCollections({ name: 'students' }).toArray(),
        attendances: await mongoose.connection.db.listCollections({ name: 'attendances' }).toArray()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ Enhanced search that can search by regNo or name
router.get("/search", async (req, res) => {
  try {
    const { regNo, name } = req.query;
    
    console.log('🔍 Searching for student:', { regNo, name });

    if (!regNo && !name) {
      return res.status(400).json({
        success: false,
        message: "Registration number or name is required"
      });
    }

    let query = {};
    
    if (regNo) {
      query.regNo = { $regex: new RegExp(regNo, 'i') };
    }
    
    if (name) {
      query.name = { $regex: new RegExp(name, 'i') };
    }

    const students = await Student.find(query).limit(10);

    if (!students || students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No students found"
      });
    }

    console.log(`✅ Found ${students.length} students`);

    res.status(200).json({
      success: true,
      data: students.map(student => ({
        _id: student._id,
        regNo: student.regNo,
        name: student.name,
        department: student.department,
        year: student.year,
        section: student.section,
        proctorId: student.proctorId,
        email: student.email,
        phone: student.phone
      }))
    });
  } catch (error) {
    console.error("Search student error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching for student: " + error.message
    });
  }
});

module.exports = router;

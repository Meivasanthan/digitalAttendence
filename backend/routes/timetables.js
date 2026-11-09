const express = require("express");
const Timetable = require("../models/Timetable"); // File is Timetable.js
const { protect } = require("../middleware/auth");
const router = express.Router();

// Get timetable by class
router.get("/class", protect, async (req, res) => {
  try {
    const { department, year, section } = req.query;

    if (!department || !year || !section) {
      return res.status(400).json({
        success: false,
        message: 'Department, year, and section are required'
      });
    }

    console.log('📅 Fetching timetable for:', { department, year, section });

    const timetable = await Timetable.findOne({
      department: department.toUpperCase(),
      year: year.toUpperCase(), 
      section: section.toUpperCase()
    });

    if (!timetable) {
      console.log('❌ Timetable not found for:', { department, year, section });
      return res.status(404).json({
        success: false,
        message: 'Timetable not found for the specified class'
      });
    }

    console.log('✅ Timetable found:', timetable.name);
    res.status(200).json({
      success: true,
      data: timetable
    });
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching timetable'
    });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const ACStaff = require('../models/acstaff');

// Get all AC staff
router.get('/', async (req, res) => {
  try {
    const acStaff = await ACStaff.find().select('-password');
    res.json(acStaff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get AC staff by ID
router.get('/:id', async (req, res) => {
  try {
    const staff = await ACStaff.findOne({ staff_id: req.params.id }).select('-password');
    if (!staff) {
      return res.status(404).json({ message: 'AC staff not found' });
    }
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// AC staff login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const staff = await ACStaff.findOne({ email, is_active: true });

    if (!staff || staff.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      staff: {
        staff_id: staff.staff_id,
        name: staff.name,
        department: staff.department,
        email: staff.email,
        role: staff.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new AC staff
router.post('/', async (req, res) => {
  try {
    const staff = new ACStaff(req.body);
    const newStaff = await staff.save();
    res.status(201).json(newStaff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update AC staff
router.put('/:id', async (req, res) => {
  try {
    const staff = await ACStaff.findOneAndUpdate(
      { staff_id: req.params.id },
      req.body,
      { new: true }
    ).select('-password');
    
    if (!staff) {
      return res.status(404).json({ message: 'AC staff not found' });
    }
    res.json(staff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete AC staff
router.delete('/:id', async (req, res) => {
  try {
    const staff = await ACStaff.findOneAndDelete({ staff_id: req.params.id });
    if (!staff) {
      return res.status(404).json({ message: 'AC staff not found' });
    }
    res.json({ message: 'AC staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
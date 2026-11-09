const mongoose = require('mongoose');
const ACStaff = require('../models/acstaff');
require('dotenv').config();

const acStaffData = [
  {
    staff_id: "S001",
    name: "Mrs.S.GEETHA",
    department: "CSE",
    email: "geetha@nandhaengg.org",
    password: "12345",
    assigned_sections: ["A"] // Geetha for A section
  },
  {
    staff_id: "S003",
    name: "Mrs.B.DEEPA",
    department: "CSE",
    email: "deepa@nandhaengg.org",
    password: "12345",
    assigned_sections: ["B"] // Deepa for B section
  },
  {
    staff_id: "S005",
    name: "Mrs.J.RADHA",
    department: "CSE",
    email: "radha@nandhaengg.org",
    password: "12345",
    assigned_sections: ["C"] // Radha for C section
  }
];

async function migrateACStaff() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-attendance');
    console.log('Connected to MongoDB');

    // Clear existing AC staff
    await ACStaff.deleteMany({});
    console.log('Cleared existing AC staff data');

    // Insert new AC staff
    const result = await ACStaff.insertMany(acStaffData);
    console.log(`Inserted ${result.length} AC staff records`);

    // Display inserted data with section assignments
    console.log('\nSection Assignments:');
    result.forEach(staff => {
      console.log(`- ${staff.name} (${staff.staff_id}): Sections ${staff.assigned_sections.join(', ')}`);
    });

    console.log('\nAC Staff migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

migrateACStaff();
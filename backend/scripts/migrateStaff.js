const mongoose = require('mongoose');
require('dotenv').config();
const Staff = require('../models/staff');

// Staff data from your provided list
const staffData = [
  { staffId: "S001", name: "Mrs.S.GEETHA", department: "CSE", email: "geetha@nandhaengg.org", password: "12345" },
  { staffId: "S002", name: "Mrs.K.E.ESWARI", department: "CSE", email: "eswari@nandhaengg.org", password: "12345" },
  { staffId: "S003", name: "Mrs.B.DEEPA", department: "CSE", email: "deepa@nandhaengg.org", password: "12345" },
  { staffId: "S004", name: "Mrs.N.M.INDUMATHI", department: "CSE", email: "indumathi@nandhaengg.org", password: "12345" },
  { staffId: "S005", name: "Mrs.J.RADHA", department: "CSE", email: "radha@nandhaengg.org", password: "12345" },
  { staffId: "S006", name: "MS.N.BHUVANESHWARI", department: "CSE", email: "bhuvaneshwari@nandhaengg.org", password: "12345" }
];

const migrateStaff = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-attendance');
    console.log('Connected to MongoDB');

    // Clear existing staff (optional - remove if you don't want to clear)
    await Staff.deleteMany({});
    console.log('Cleared existing staff');

    // Add role to each staff member
    const staffWithRole = staffData.map(staff => ({
      ...staff,
      role: "staff"
    }));

    // Insert staff into database
    const result = await Staff.insertMany(staffWithRole);
    console.log(`Successfully migrated ${result.length} staff members to the database`);

    // Display all created staff members
    console.log('\nCreated staff members:');
    result.forEach(staff => {
      console.log(`ID: ${staff.staffId}, Name: ${staff.name}, Email: ${staff.email}, Password: ${staff.password}`);
    });

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the migration
migrateStaff();
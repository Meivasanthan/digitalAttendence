const mongoose = require('mongoose');
require('dotenv').config();

const Staff = require('../models/staff');
const User = require('../models/User');

async function checkStaffData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-attendance');
    console.log('✅ Connected to MongoDB');

    // Check Staff collection
    console.log('\n🔍 Checking Staff collection...');
    const staffData = await Staff.find({});
    console.log(`📋 Staff collection has ${staffData.length} records`);
    staffData.forEach(staff => {
      console.log(`   - ${staff.staffId}: ${staff.name} (${staff.department})`);
    });

    // Check User collection for staff
    console.log('\n🔍 Checking User collection for staff...');
    const staffUsers = await User.find({ role: 'staff' });
    console.log(`📋 User collection has ${staffUsers.length} staff records`);
    staffUsers.forEach(user => {
      console.log(`   - ${user.staffId}: ${user.name} (${user.email})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkStaffData();
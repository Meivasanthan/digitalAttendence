const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create Staff Accounts based on your data.js
    const staffAccounts = [
      {
        email: 'radha.j@nandhaengg.org',
        password: '12345',
        role: 'staff',
        name: 'Ms. J. Radha',
        department: 'CSE',
        staffId: 'STAFF001'
      }
    ];

    const createdStaff = await User.create(staffAccounts);
    console.log('Staff accounts created:', createdStaff.length);

    // Create Student Accounts based on your data.js
    
    const studentAccounts = [
  {
    email: '23cs123@nandhaengg.org',
    regNo: '23CS123',
    password: '123',
    role: 'student',
    name: 'Ummu Kulsu A',
    department: 'CSE',
    year: 'III',
    section: 'C',
    photo: '/assets/23cs123.jpg'
  },
  {
    email: '23cs121@nandhaengg.org',
    regNo: '23CS121',
    password: '121', 
    role: 'student',
    name: 'Tharaneesh MR',
    department: 'CSE',
    year: 'III',
    section: 'C',
    photo: '/assets/23cs121.jpg'
  },
  {
    email: '23cs130@nandhaengg.org',
    regNo: '23CS130',
    password: '130',
    role: 'student',
    name: 'Vishal C',
    department: 'CSE', 
    year: 'III',
    section: 'C',
    photo: '/assets/23cs130.jpg'
  },
  {
    email: '23cs118@nandhaengg.org',
    regNo: '23CS118',
    password: '118',
    role: 'student',
    name: 'Srinnethi RD',
    department: 'CSE',
    year: 'III',
    section: 'C',
    photo: '/assets/23cs118.jpg'
  },
  {
    email: '23cs124@nandhaengg.org',
    regNo: '23CS124',
    password: '124',
    role: 'student',
    name: 'Varsha K',
    department: 'CSE',
    year: 'III',
    section: 'C',
    photo: '/assets/23cs124.jpg'
  },
  {
    email: '23cs167@nandhaengg.org',
    regNo: '23CS167',
    password: '167',
    role: 'student',
    name: 'Shalini N',
    department: 'CSE',
    year: 'III',
    section: 'C',
    photo: '/assets/23cs167.jpg'
  },
  {
    email: '23cs175@nandhaengg.org',
    regNo: '23CS175',
    password: '175',
    role: 'student',
    name: 'Tharssan Sriram CJ',
    department: 'CSE',
    year: 'III',
    section: 'C',
    photo: '/assets/23cs175.jpg'
  }
];

    const createdStudents = await User.create(studentAccounts);
    console.log('Student accounts created:', createdStudents.length);

    console.log('✅ Database seeded successfully!');
    console.log('📋 Login Credentials:');
    console.log('   Staff: radha.j@nandhaengg.org / 12345');
    console.log('   Student: 23CS123 / 123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
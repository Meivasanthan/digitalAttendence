const mongoose = require('mongoose');
require('dotenv').config();
const Timetable = require('../models/Timetable');
const commonPeriods = [
  { time: '9:15-10:05', number: 1 },
  { time: '10:05-10:55', number: 2 },
  { time: '11:10-12:00', number: 3 },
  { time: '12:00-12:50', number: 4 },
  { time: '1:45-2:35', number: 5 },
  { time: '2:35-3:25', number: 6 },
  { time: '3:40-4:30', number: 7 }
];
const timetablesData = [
  {
    timetableId: 'CSE_3_A',
    name: 'CSE - III Year - A Section',
    department: 'CSE',
    year: 'III',
    section: 'A',
    days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    periods: commonPeriods,
    schedule: [
      {
        day: 'MON',
        periods: [
          { number: 1, time: '9:15-10:05', subject: 'FSD Lab', staff: 'Ms.C.Navamani, Mr.D.Kavinkumar', courseCode: '22CSP09' },
          { number: 2, time: '10:05-10:55', subject: 'FSD Lab', staff: 'Ms.C.Navamani, Mr.D.Kavinkumar', courseCode: '22CSP09' },
          { number: 3, time: '11:10-12:00', subject: 'FSD Lab', staff: 'Ms.C.Navamani, Mr.D.Kavinkumar', courseCode: '22CSP09' },
          { number: 4, time: '12:00-12:50', subject: 'FSD Lab', staff: 'Ms.C.Navamani, Mr.D.Kavinkumar', courseCode: '22CSP09' },
          { number: 5, time: '1:45-2:35', subject: 'Mini Project', staff: 'Ms.S.Geetha, Ms.K.E.Eswari' },
          { number: 6, time: '2:35-3:25', subject: 'Mini Project', staff: 'Ms.S.Geetha, Ms.K.E.Eswari' },
          { number: 7, time: '3:40-4:30', subject: 'Mini Project', staff: 'Ms.S.Geetha, Ms.K.E.Eswari' }
        ]
      },
      {
        day: 'TUE',
        periods: [
          { number: 1, time: '9:15-10:05', subject: 'OOSE', staff: 'Dr.S.Karuppusamy', courseCode: '22CSC16' },
          { number: 2, time: '10:05-10:55', subject: 'FSD', staff: 'Ms.C.Navamani', courseCode: '22CSC15' },
          { number: 3, time: '11:10-12:00', subject: 'DL', staff: 'Ms.S.Geetha', courseCode: '22CSA01' },
          { number: 4, time: '12:00-12:50', subject: 'PCD', staff: 'Ms.K.Shanmugapriya', courseCode: '22CSC14' },
          { number: 5, time: '1:45-2:35', subject: 'NPTEL', staff: 'Dr.S.Karuppusamy' },
          { number: 6, time: '2:35-3:25', subject: 'Library', staff: 'Ms.N.Bhuvaneswari' },
          { number: 7, time: '3:40-4:30', subject: 'BI', staff: 'Ms.P.Devika', courseCode: '22CSA07' }
        ]
      },
      {
        day: 'WED',
        periods: [
          { number: 1, time: '9:15-10:05', subject: 'COJ', staff: 'Mr.Jagadees (Sixphrase)', courseCode: '22CSA49' },
          { number: 2, time: '10:05-10:55', subject: 'COJ', staff: 'Mr.Jagadees (Sixphrase)', courseCode: '22CSA49' },
          { number: 3, time: '11:10-12:00', subject: 'OOSE', staff: 'Dr.S.Karuppusamy', courseCode: '22CSC16' },
          { number: 4, time: '12:00-12:50', subject: 'BI', staff: 'Ms.P.Devika', courseCode: '22CSA07' },
          { number: 5, time: '1:45-2:35', subject: 'FSD', staff: 'Ms.C.Navamani', courseCode: '22CSC15' },
          { number: 6, time: '2:35-3:25', subject: 'LeetCode', staff: 'Ms.V.Mythily' },
          { number: 7, time: '3:40-4:30', subject: 'HoD/AC/Proctor', staff: 'Ms.S.Geetha' }
        ]
      },
      {
        day: 'THU',
        periods: [
          { number: 1, time: '9:15-10:05', subject: 'DL', staff: 'Ms.S.Geetha', courseCode: '22CSA01' },
          { number: 2, time: '10:05-10:55', subject: 'PCD', staff: 'Ms.K.Shanmugapriya', courseCode: '22CSC14' },
          { number: 3, time: '11:10-12:00', subject: 'FSD', staff: 'Ms.C.Navamani', courseCode: '22CSC15' },
          { number: 4, time: '12:00-12:50', subject: 'OOSE Lab', staff: 'Dr.S.Karuppusamy, Ms.V.Mythily', courseCode: '22CSP10' },
          { number: 5, time: '1:45-2:35', subject: 'OOSE Lab', staff: 'Dr.S.Karuppusamy, Ms.V.Mythily', courseCode: '22CSP10' },
          { number: 6, time: '2:35-3:25', subject: 'OOSE Lab', staff: 'Dr.S.Karuppusamy, Ms.V.Mythily', courseCode: '22CSP10' },
          { number: 7, time: '3:40-4:30', subject: 'OOSE Lab', staff: 'Dr.S.Karuppusamy, Ms.V.Mythily', courseCode: '22CSP10' }
        ]
      },
      {
        day: 'FRI',
        periods: [
          { number: 1, time: '9:15-10:05', subject: 'PCD', staff: 'Ms.K.Shanmugapriya', courseCode: '22CSC14' },
          { number: 2, time: '10:05-10:55', subject: 'BI', staff: 'Ms.P.Devika', courseCode: '22CSA07' },
          { number: 3, time: '11:10-12:00', subject: 'DL', staff: 'Ms.S.Geetha', courseCode: '22CSA01' },
          { number: 4, time: '12:00-12:50', subject: 'OOSE', staff: 'Dr.S.Karuppusamy', courseCode: '22CSC16' },
          { number: 5, time: '1:45-2:35', subject: 'PCD(T)', staff: 'Ms.K.Shanmugapriya', courseCode: '22CSC14' },
          { number: 6, time: '2:35-3:25', subject: 'COJ', staff: 'Mr.Jagadees (Sixphrase)', courseCode: '22CSA49' },
          { number: 7, time: '3:40-4:30', subject: 'COJ', staff: 'Mr.Jagadees (Sixphrase)', courseCode: '22CSA49' }
        ]
      }
    ],
    courses: [
      { code: '22CSC14', name: 'Principles of Compiler Design', hours: 4, faculty: 'Ms.K.Shanmugapriya' },
      { code: '22CSC15', name: 'Full Stack Development (PBL)', hours: 3, faculty: 'Ms.C.Navamani' },
      { code: '22CSC16', name: 'Object Oriented Software Engineering', hours: 3, faculty: 'Dr.S.Karuppusamy' },
      { code: '22CSA01', name: 'Deep Learning', hours: 3, faculty: 'Ms.S.Geetha' },
      { code: '22CSA07', name: 'Business Intelligence', hours: 3, faculty: 'Ms.P.Devika' },
      { code: '22CSA49', name: 'Code Optimization in JAVA', hours: 4, faculty: 'Mr.Jagadees (Sixphrase)' },
      { code: '22CSP09', name: 'FSD Laboratory', hours: 4, faculty: 'Ms.C.Navamani, Mr.D.Kavinkumar' },
      { code: '22CSP10', name: 'OOSE Laboratory', hours: 4, faculty: 'Dr.S.Karuppusamy, Ms.V.Mythily' },
      { code: 'MP', name: 'Mini Project', hours: 3, faculty: 'Ms.S.Geetha, Ms.K.E.Eswari' },
      { code: 'LIB', name: 'Library', hours: 1, faculty: 'Ms.N.Bhuvaneswari' },
      { code: 'NPTEL', name: 'NPTEL', hours: 1, faculty: 'Dr.S.Karuppusamy' },
      { code: 'LEET', name: 'LeetCode', hours: 1, faculty: 'Ms.V.Mythily' },
      { code: 'HAP', name: 'HoD/AC/Proctor', hours: 1, faculty: 'Ms.S.Geetha' }
    ]
  },
  {
    timetableId: 'CSE_3_B',
    name: 'CSE - III Year - B Section',
    department: 'CSE',
    year: 'III',
    section: 'B',
    days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    periods: commonPeriods,
    schedule: [
      {
        day: 'MON',
        periods: [
          { number: 1, time: '9:15-10:05', subject: 'PCD', staff: 'Ms.K.Shanmugapriya', courseCode: '22CSC14' },
          { number: 2, time: '10:05-10:55', subject: 'BI', staff: 'Ms.P.Uma', courseCode: '22CSK07' },
          { number: 3, time: '11:10-12:00', subject: 'DL', staff: 'Ms.B.Deepa', courseCode: '22CSK01' },
          { number: 4, time: '12:00-12:50', subject: 'OOSE Lab', staff: 'Dr.S.Karuppusamy, Ms.N.M.Indumathi', courseCode: '22CSP10' },
          { number: 5, time: '1:45-2:35', subject: 'OOSE Lab', staff: 'Dr.S.Karuppusamy, Ms.N.M.Indumathi', courseCode: '22CSP10' },
          { number: 6, time: '2:35-3:25', subject: 'OOSE Lab', staff: 'Dr.S.Karuppusamy, Ms.N.M.Indumathi', courseCode: '22CSP10' },
          { number: 7, time: '3:40-4:30', subject: 'OOSE Lab', staff: 'Dr.S.Karuppusamy, Ms.N.M.Indumathi', courseCode: '22CSP10' }
        ]
      },
      {
        day: 'TUE',
        periods: [
          { number: 1, time: '9:15-10:05', subject: 'DL', staff: 'Ms.B.Deepa', courseCode: '22CSK01' },
          { number: 2, time: '10:05-10:55', subject: 'PCD', staff: 'Ms.K.Shanmugapriya', courseCode: '22CSC14' },
          { number: 3, time: '11:10-12:00', subject: 'OOSE', staff: 'Dr.S.Karuppusamy', courseCode: '22CSC16' },
          { number: 4, time: '12:00-12:50', subject: 'Library', staff: 'Mr.A.Satheesh Kumar' },
          { number: 5, time: '1:45-2:35', subject: 'FSD', staff: 'Ms.D.Vinoparkavi', courseCode: '22CSC15' },
          { number: 6, time: '2:35-3:25', subject: 'COJ', staff: 'Mr.Harish (Sixphrase)', courseCode: '22CSK49' },
          { number: 7, time: '3:40-4:30', subject: 'COJ', staff: 'Mr.Harish (Sixphrase)', courseCode: '22CSK49' }
        ]
      },
      {
        day: 'WED',
        periods: [
          { number: 1, time: '9:15-10:05', subject: 'BI', staff: 'Ms.P.Uma', courseCode: '22CSK07' },
          { number: 2, time: '10:05-10:55', subject: 'FSD', staff: 'Ms.D.Vinoparkavi', courseCode: '22CSC15' },
          { number: 3, time: '11:10-12:00', subject: 'COJ', staff: 'Mr.Harish (Sixphrase)', courseCode: '22CSK49' },
          { number: 4, time: '12:00-12:50', subject: 'COJ', staff: 'Mr.Harish (Sixphrase)', courseCode: '22CSK49' },
          { number: 5, time: '1:45-2:35', subject: 'HoD/AC/Proctor', staff: 'Ms.N.M.Indumathi' },
          { number: 6, time: '2:35-3:25', subject: 'OOSE', staff: 'Dr.S.Karuppusamy', courseCode: '22CSC16' },
          { number: 7, time: '3:40-4:30', subject: 'NPTEL', staff: 'Ms.N.M.Indumathi' }
        ]
      },
      {
        day: 'THU',
        periods: [
          { number: 1, time: '9:15-10:05', subject: 'FSD', staff: 'Ms.D.Vinoparkavi', courseCode: '22CSC15' },
          { number: 2, time: '10:05-10:55', subject: 'Mini Project', staff: 'Ms.B.Deepa, Ms.N.M.Indumathi' },
          { number: 3, time: '11:10-12:00', subject: 'Mini Project', staff: 'Ms.B.Deepa, Ms.N.M.Indumathi' },
          { number: 4, time: '12:00-12:50', subject: 'Mini Project', staff: 'Ms.B.Deepa, Ms.N.M.Indumathi' },
          { number: 5, time: '1:45-2:35', subject: 'DL', staff: 'Ms.B.Deepa', courseCode: '22CSK01' },
          { number: 6, time: '2:35-3:25', subject: 'BI', staff: 'Ms.P.Uma', courseCode: '22CSK07' },
          { number: 7, time: '3:40-4:30', subject: 'PCD', staff: 'Ms.K.Shanmugapriya', courseCode: '22CSC14' }
        ]
      },
      {
        day: 'FRI',
        periods: [
          { number: 1, time: '9:15-10:05', subject: 'FSD Lab', staff: 'Ms.D.Vinoparkavi, Mr.A.Naveemkanth', courseCode: '22CSP09' },
          { number: 2, time: '10:05-10:55', subject: 'FSD Lab', staff: 'Ms.D.Vinoparkavi, Mr.A.Naveemkanth', courseCode: '22CSP09' },
          { number: 3, time: '11:10-12:00', subject: 'FSD Lab', staff: 'Ms.D.Vinoparkavi, Mr.A.Naveemkanth', courseCode: '22CSP09' },
          { number: 4, time: '12:00-12:50', subject: 'FSD Lab', staff: 'Ms.D.Vinoparkavi, Mr.A.Naveemkanth', courseCode: '22CSP09' },
          { number: 5, time: '1:45-2:35', subject: 'OOSE', staff: 'Dr.S.Karuppusamy', courseCode: '22CSC16' },
          { number: 6, time: '2:35-3:25', subject: 'LeetCode', staff: 'Ms.P.Uma' },
          { number: 7, time: '3:40-4:30', subject: 'PCD(T)', staff: 'Ms.K.Shanmugapriya', courseCode: '22CSC14' }
        ]
      }
    ],
    courses: [
      { code: '22CSC14', name: 'Principles of Compiler Design', hours: 4, faculty: 'Ms.K.Shanmugapriya' },
      { code: '22CSC15', name: 'Full Stack Development (PBL)', hours: 3, faculty: 'Ms.D.Vinoparkavi' },
      { code: '22CSC16', name: 'Object Oriented Software Engineering', hours: 3, faculty: 'Dr.S.Karuppusamy' },
      { code: '22CSK01', name: 'Deep Learning', hours: 3, faculty: 'Ms.B.Deepa' },
      { code: '22CSK07', name: 'Business Intelligence', hours: 3, faculty: 'Ms.P.Uma' },
      { code: '22CSK49', name: 'Code Optimization in JAVA', hours: 4, faculty: 'Mr.Harish (Sixphrase)' },
      { code: '22CSP09', name: 'FSD Laboratory', hours: 4, faculty: 'Ms.D.Vinoparkavi, Mr.A.Naveemkanth' },
      { code: '22CSP10', name: 'OOSE Laboratory', hours: 4, faculty: 'Dr.S.Karuppusamy, Ms.N.M.Indumathi' },
      { code: 'MP', name: 'Mini Project', hours: 3, faculty: 'Ms.B.Deepa, Ms.N.M.Indumathi' },
      { code: 'LIB', name: 'Library', hours: 1, faculty: 'Mr.A.Satheesh Kumar' },
      { code: 'NPTEL', name: 'NPTEL', hours: 1, faculty: 'Ms.N.M.Indumathi' },
      { code: 'LEET', name: 'LeetCode', hours: 1, faculty: 'Ms.P.Uma' },
      { code: 'HAP', name: 'HoD/AC/Proctor', hours: 1, faculty: 'Ms.N.M.Indumathi' }
    ]
  },
  {
    timetableId: 'CSE_3_C',
    name: 'CSE - III Year - C Section',
    department: 'CSE',
    year: 'III',
    section: 'C',
    days: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    periods: commonPeriods,
    schedule: [
      {
        day: 'MON',
        periods: [
          { number: 1, time: '9:15-10:05', subject: 'FSD Lab', staff: 'Mr.R.Manikandan, Dr.T.Rajasekaran', courseCode: '22CSP09' },
          { number: 2, time: '10:05-10:55', subject: 'FSD Lab', staff: 'Mr.R.Manikandan, Dr.T.Rajasekaran', courseCode: '22CSP09' },
          { number: 3, time: '11:10-12:00', subject: 'FSD Lab', staff: 'Mr.R.Manikandan, Dr.T.Rajasekaran', courseCode: '22CSP09' },
          { number: 4, time: '12:00-12:50', subject: 'FSD Lab', staff: 'Mr.R.Manikandan, Dr.T.Rajasekaran', courseCode: '22CSP09' },
          { number: 5, time: '1:45-2:35', subject: 'Mini Project', staff: 'Ms.N.Bhuvaneswari' },
          { number: 6, time: '2:35-3:25', subject: 'Mini Project', staff: 'Ms.N.Bhuvaneswari' },
          { number: 7, time: '3:40-4:30', subject: 'Mini Project', staff: 'Ms.N.Bhuvaneswari' }
        ]
      },
      {
        day: 'TUE',
        periods: [
          { number: 1, time: '9:15-10:05', subject: 'OOSE', staff: 'Ms.J.Radha', courseCode: '22CSC16' },
          { number: 2, time: '10:05-10:55', subject: 'PCD', staff: 'Mr.A.Satheesh Kumar', courseCode: '22CSC14' },
          { number: 3, time: '11:10-12:00', subject: 'FSD', staff: 'Mr.R.Manikandan', courseCode: '22CSC15' },
          { number: 4, time: '12:00-12:50', subject: 'NPTEL', staff: 'Ms.V.Mythily' },
          { number: 5, time: '1:45-2:35', subject: 'LeetCode', staff: 'Ms.C.Navamani' },
          { number: 6, time: '2:35-3:25', subject: 'BI', staff: 'Ms.V.Mythily', courseCode: '22CSX41' },
          { number: 7, time: '3:40-4:30', subject: 'HoD/AC/Proctor', staff: 'Ms.J.Radha' }
        ]
      },
      {
        day: 'WED',
        periods: [
          { number: 1, time: '9:15-10:05', subject: 'PCD', staff: 'Mr.A.Satheesh Kumar', courseCode: '22CSC14' },
          { number: 2, time: '10:05-10:55', subject: 'DL', staff: 'Dr.T.Rajasekaran', courseCode: '22CSX01' },
          { number: 3, time: '11:10-12:00', subject: 'COJ', staff: 'SixPhrase' },
          { number: 4, time: '12:00-12:50', subject: 'COJ', staff: 'SixPhrase' },
          { number: 5, time: '1:45-2:35', subject: 'BI', staff: 'Ms.V.Mythily', courseCode: '22CSX41' },
          { number: 6, time: '2:35-3:25', subject: 'Library', staff: 'Ms.J.Radha' },
          { number: 7, time: '3:40-4:30', subject: 'FSD', staff: 'Mr.R.Manikandan', courseCode: '22CSC15' }
        ]
      },
      {
        day: 'THU',
        periods: [
          { number: 1, time: '9:15-10:05', subject: 'OOSE', staff: 'Ms.J.Radha', courseCode: '22CSC16' },
          { number: 2, time: '10:05-10:55', subject: 'BI', staff: 'Ms.V.Mythily', courseCode: '22CSX41' },
          { number: 3, time: '11:10-12:00', subject: 'COJ', staff: 'SixPhrase' },
          { number: 4, time: '12:00-12:50', subject: 'COJ', staff: 'SixPhrase' },
          { number: 5, time: '1:45-2:35', subject: 'OOSE', staff: 'Ms.J.Radha', courseCode: '22CSC16' },
          { number: 6, time: '2:35-3:25', subject: 'DL', staff: 'Dr.T.Rajasekaran', courseCode: '22CSX01' },
          { number: 7, time: '3:40-4:30', subject: 'PCD', staff: 'Mr.A.Satheesh Kumar', courseCode: '22CSC14' }
        ]
      },
      {
        day: 'FRI',
        periods: [
          { number: 1, time: '9:15-10:05', subject: 'FSD', staff: 'Mr.R.Manikandan', courseCode: '22CSC15' },
          { number: 2, time: '10:05-10:55', subject: 'PCD', staff: 'Mr.A.Satheesh Kumar', courseCode: '22CSC14' },
          { number: 3, time: '11:10-12:00', subject: 'DL', staff: 'Dr.T.Rajasekaran', courseCode: '22CSX01' },
          { number: 4, time: '12:00-12:50', subject: 'OOSE Lab', staff: 'Ms.J.Radha, Ms.V.Mythily', courseCode: '22CSP10' },
          { number: 5, time: '1:45-2:35', subject: 'OOSE Lab', staff: 'Ms.J.Radha, Ms.V.Mythily', courseCode: '22CSP10' },
          { number: 6, time: '2:35-3:25', subject: 'OOSE Lab', staff: 'Ms.J.Radha, Ms.V.Mythily', courseCode: '22CSP10' },
          { number: 7, time: '3:40-4:30', subject: 'OOSE Lab', staff: 'Ms.J.Radha, Ms.V.Mythily', courseCode: '22CSP10' }
        ]
      }
    ],
    courses: [
      { code: '22CSC14', name: 'Principles of Compiler Design', hours: 4, faculty: 'Mr.A.Satheesh Kumar' },
      { code: '22CSC15', name: 'Full Stack Development (PBL)', hours: 3, faculty: 'Mr.R.Manikandan' },
      { code: '22CSC16', name: 'Object Oriented Software Engineering', hours: 3, faculty: 'Ms.J.Radha' },
      { code: '22CSX01', name: 'Deep Learning', hours: 3, faculty: 'Dr.T.Rajasekaran' },
      { code: '22CSX41', name: 'Business Intelligence', hours: 3, faculty: 'Ms.V.Mythily' },
      { code: 'J2EE', name: 'Java (J2EE)', hours: 4, faculty: 'SixPhrase' },
      { code: '22CSP09', name: 'FSD Laboratory', hours: 4, faculty: 'Mr.R.Manikandan, Dr.T.Rajasekaran' },
      { code: '22CSP10', name: 'OOSE Laboratory', hours: 4, faculty: 'Ms.J.Radha, Ms.V.Mythily' },
      { code: 'MP', name: 'Mini Project', hours: 3, faculty: 'Ms.N.Bhuvaneswari' },
      { code: 'LIB', name: 'Library', hours: 1, faculty: 'Ms.J.Radha' },
      { code: 'NPTEL', name: 'NPTEL', hours: 1, faculty: 'Ms.V.Mythily' },
      { code: 'LEET', name: 'LeetCode', hours: 1, faculty: 'Ms.C.Navamani' },
      { code: 'HAP', name: 'HoD/AC/Proctor', hours: 1, faculty: 'Ms.J.Radha' }
    ]
  }
];

const migrateTimetables = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-attendance');
    console.log('Connected to MongoDB');

    // Clear existing timetables
    await Timetable.deleteMany({});
    console.log('Cleared existing timetables');

    // Insert timetables into database
    const result = await Timetable.insertMany(timetablesData);
    console.log(`✅ Successfully migrated ${result.length} timetables to the database`);

    // Display created timetables
    console.log('\n📅 Created timetables:');
    result.forEach(timetable => {
      console.log(`   ID: ${timetable.timetableId}, Name: ${timetable.name}`);
    });

    console.log('\n🎯 Test the APIs:');
    console.log('   Timetable: GET http://localhost:5000/api/timetables/class?department=CSE&year=III&section=C');
    console.log('   Students:  GET http://localhost:5000/api/students/class?department=CSE&year=III&section=C');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the migration
migrateTimetables();
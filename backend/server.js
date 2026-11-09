const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();

// ✅ Enhanced CORS configuration
app.use(cors({
  origin: "http://localhost:3000", // Your React app URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ✅ Add body parser for URL encoded data
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Register routes with better error handling
console.log("🔧 Registering routes...");

const registerRoute = (path, routePath, routeName) => {
  try {
    if (fs.existsSync(routePath + '.js') || fs.existsSync(routePath + '/index.js')) {
      const route = require(routePath);
      app.use(path, route);
      console.log(`✅ ${routeName} routes registered: ${path}`);
    } else {
      console.log(`⚠️  Route file not found: ${routePath}`);
    }
  } catch (error) {
    console.error(`❌ Failed to register ${routeName} routes:`, error.message);
  }
};

// Register all routes
registerRoute('/api/students', './routes/students', 'Student');
registerRoute('/api/timetables', './routes/timetables', 'Timetable');
registerRoute('/api/auth', './routes/auth', 'Auth');
registerRoute('/api/attendance', './routes/attendance', 'Attendance');
registerRoute('/api/staff', './routes/staff', 'Staff');
registerRoute('/api/acstaff', './routes/acstaff', 'AC Staff');

// ✅ Enhanced health check
app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  
  res.json({ 
    status: "OK", 
    message: "Digital Attendance System Backend is running!",
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    routes: [
      '/api/students',
      '/api/health',
      '/api/auth',
      '/api/attendance',
      '/api/staff',
      '/api/debug'
    ]
  });
});

// ✅ Debug endpoint to check database status
app.get("/api/debug", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    const collectionStats = {};
    for (let collection of collections) {
      try {
        const count = await db.collection(collection.name).countDocuments();
        collectionStats[collection.name] = count;
      } catch (err) {
        collectionStats[collection.name] = 'Error: ' + err.message;
      }
    }
    
    // Check if we have sample data
    let sampleStudents = [];
    let sampleAttendance = [];
    
    try {
      sampleStudents = await db.collection('students').find({}).limit(3).toArray();
    } catch (err) {
      sampleStudents = [{ error: 'Cannot access students collection: ' + err.message }];
    }
    
    try {
      sampleAttendance = await db.collection('attendances').find({}).limit(3).toArray();
    } catch (err) {
      sampleAttendance = [{ error: 'Cannot access attendances collection: ' + err.message }];
    }
    
    res.json({
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime()
      },
      database: {
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        state: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        collections: collectionStats
      },
      sampleData: {
        students: sampleStudents,
        attendance: sampleAttendance
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not Set'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ✅ Test data endpoint (for development)
app.get("/api/test-data", async (req, res) => {
  try {
    const Student = require("./models/student");
    const Attendance = require("./models/attendance");
    
    // Check if we have any students
    const studentCount = await Student.countDocuments();
    const attendanceCount = await Attendance.countDocuments();
    
    // Get sample students for testing
    const sampleStudents = await Student.find({}).limit(5).select('_id name regNo department year section');
    
    res.json({
      studentCount,
      attendanceCount,
      sampleStudents: sampleStudents.map(s => ({
        _id: s._id,
        name: s.name,
        regNo: s.regNo,
        department: s.department,
        year: s.year,
        section: s.section
      })),
      instructions: {
        create_student: 'POST /api/students',
        create_attendance: 'POST /api/attendance/submit',
        get_students: 'GET /api/students?department=CSE&year=III&section=A',
        get_attendance: 'GET /api/attendance/student/:studentId'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Digital Attendance System API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      debug: "/api/debug",
      testData: "/api/test-data",
      students: "/api/students?department=CSE&year=III&section=A",
      attendance: "/api/attendance/student/:studentId"
    },
    documentation: "Check /api/health for detailed API status"
  });
});

// ✅ FIXED: 404 handler for undefined routes - use proper Express syntax
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET  /',
      'GET  /api/health',
      'GET  /api/debug',
      'GET  /api/test-data',
      'GET  /api/students',
      'GET  /api/attendance/student/:id',
      'POST /api/attendance/submit'
    ]
  });
});

// ✅ Global error handler
app.use((error, req, res, next) => {
  console.error('🚨 Global Error Handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ✅ MongoDB connection with better error handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-attendance';
    console.log('🔗 Connecting to MongoDB:', mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Log collection info after connection
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('💡 Troubleshooting tips:');
    console.log('   1. Make sure MongoDB is running: mongod');
    console.log('   2. Check MONGODB_URI in .env file');
    console.log('   3. Verify database name and credentials');
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('❌ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Debug info: http://localhost:${PORT}/api/debug`);
  console.log(`🎯 Test data: http://localhost:${PORT}/api/test-data`);
  console.log(`👥 Students API: http://localhost:${PORT}/api/students?department=CSE&year=III&section=A`);
  console.log(`\n📋 Available API Routes:`);
  console.log(`   GET  /api/health - Server status`);
  console.log(`   GET  /api/debug - Database debug info`);
  console.log(`   GET  /api/students - Get students by class`);
  console.log(`   GET  /api/attendance/student/:id - Get student attendance`);
  console.log(`   POST /api/attendance/submit - Submit attendance`);
  console.log(`\n⚡ Ready to accept requests...\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔻 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});



module.exports = app;
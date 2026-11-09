import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./ProctorDashboard.css";

export default function ProctorDashboard() {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedStaffInfo, setSelectedStaffInfo] = useState(null);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [apiStatus, setApiStatus] = useState({ staff: 'pending', students: 'pending', attendance: 'pending' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [studentsWithAttendance, setStudentsWithAttendance] = useState([]);

  // Logout function
  const handleLogout = () => {
    console.log('Logging out...');
    
    // Clear ALL authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('staffInfo'); 
    localStorage.removeItem('userRole');
    localStorage.removeItem('proctorToken');
    localStorage.removeItem('proctorData');
    
    // Clear session storage
    sessionStorage.clear();
    
    console.log('Storage cleared, redirecting to login...');
    
    // ✅ CORRECT ROUTE: Redirect to /proctor/login (not /proctor-login)
    navigate('/proctor/login');
  };

  // Function to get proctor name by ID
  const getProctorName = async (proctorId) => {
    if (!proctorId || proctorId === 'N/A') return 'N/A';
    
    console.log('🔍 Searching for proctor with ID:', proctorId);
    
    try {
      const token = localStorage.getItem('token');
      
      // Method 1: Try AC Staff API first
      try {
        const acStaffResponse = await fetch(`http://localhost:4000/api/acstaff/${proctorId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (acStaffResponse.ok) {
          const acStaff = await acStaffResponse.json();
          console.log('📋 AC Staff response:', acStaff);
          
          if (acStaff && acStaff.name) {
            console.log('✅ Found proctor in AC Staff:', acStaff.name);
            return acStaff.name;
          }
        }
      } catch (acError) {
        console.log('AC Staff API error:', acError);
      }

      // Method 2: Try regular Staff API
      try {
        const staffResponse = await fetch(`http://localhost:4000/api/staff`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (staffResponse.ok) {
          const result = await staffResponse.json();
          console.log('📋 Staff API response:', result);
          
          if (result.success && Array.isArray(result.data)) {
            const foundStaff = result.data.find(staff => 
              staff.staffId === proctorId || 
              staff._id === proctorId
            );
            
            if (foundStaff && foundStaff.name) {
              console.log('✅ Found proctor in Staff:', foundStaff.name);
              return foundStaff.name;
            }
          }
        }
      } catch (staffError) {
        console.log('Staff API error:', staffError);
      }

      console.log('❌ No proctor found with ID:', proctorId);
      return `${proctorId} (Proctor ID)`;
      
    } catch (error) {
      console.error('💥 Error fetching proctor name:', error);
      return `${proctorId} (Proctor ID)`;
    }
  };

  // Function to get AC staff name for the section
  const getACStaffForSection = async (section) => {
    if (!section || section === 'N/A') return 'N/A';
    
    console.log('🔍 Searching for AC staff for section:', section);
    
    try {
      const token = localStorage.getItem('token');
      
      // Get all AC staff and find who is assigned to this section
      const acStaffResponse = await fetch(`http://localhost:4000/api/acstaff`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (acStaffResponse.ok) {
        const acStaffList = await acStaffResponse.json();
        console.log('📋 All AC Staff:', acStaffList);
        
        if (Array.isArray(acStaffList)) {
          // Find AC staff assigned to this section
          const foundACStaff = acStaffList.find(staff => 
            staff.assigned_sections && 
            staff.assigned_sections.includes(section)
          );
          
          if (foundACStaff && foundACStaff.name) {
            console.log('✅ Found AC Staff for section:', foundACStaff.name);
            return foundACStaff.name;
          } else {
            console.log('❌ No AC staff found for section:', section);
            return 'Not Assigned';
          }
        }
      }
      
      return 'Not Assigned';
      
    } catch (error) {
      console.error('💥 Error fetching AC staff:', error);
      return 'Not Assigned';
    }
  };

  // Load staff list from database
  const loadStaffList = useCallback(async () => {
    try {
      setStaffLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:4000/api/staff', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          setStaffList(data.data);
          setApiStatus(prev => ({ ...prev, staff: 'success' }));
        } else {
          setStaffList([]);
          setApiStatus(prev => ({ ...prev, staff: 'no_data' }));
        }
      } else {
        setStaffList([]);
        setApiStatus(prev => ({ ...prev, staff: 'error' }));
      }
      
    } catch (error) {
      console.error('Error loading staff list:', error);
      setStaffList([]);
      setApiStatus(prev => ({ ...prev, staff: 'error' }));
    } finally {
      setStaffLoading(false);
    }
  }, []);

  // Load assigned students from database
  const loadAssignedStudents = async (staffId) => {
    try {
      setLoading(true);
      setApiStatus(prev => ({ ...prev, students: 'loading' }));
      
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:4000/api/staff/${staffId}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          const students = data.data || [];
          const processedStudents = await processStudentData(students);
          
          setAssignedStudents(processedStudents);
          setSelectedStaffInfo(data.staffInfo);
          setApiStatus(prev => ({ ...prev, students: students.length > 0 ? 'success' : 'no_data' }));
          
          // Load attendance for all students to calculate percentages
          await loadStudentsAttendance(processedStudents);
        } else {
          setAssignedStudents([]);
          setStudentsWithAttendance([]);
          setApiStatus(prev => ({ ...prev, students: 'no_data' }));
        }
      } else {
        setAssignedStudents([]);
        setStudentsWithAttendance([]);
        setApiStatus(prev => ({ ...prev, students: 'error' }));
      }
      
    } catch (error) {
      console.error('Error loading assigned students:', error);
      setAssignedStudents([]);
      setStudentsWithAttendance([]);
      setApiStatus(prev => ({ ...prev, students: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  // Process student data with proctor and AC staff names
  const processStudentData = async (students) => {
    const processedStudents = [];
    
    for (const student of students) {
      const proctorId = student.protorId || student.proctorId;
      const section = student.section;
      
      // Get both proctor name and AC staff name in parallel
      const [proctorName, acStaffName] = await Promise.all([
        getProctorName(proctorId),
        getACStaffForSection(section)
      ]);
      
      processedStudents.push({
        _id: student._id || student.id || `student-${processedStudents.length}`,
        regNo: student.regNo || student.registrationNumber || student.rollNo || `UNKNOWN-${processedStudents.length}`,
        name: student.name || student.studentName || 'Unknown Student',
        department: student.department || student.dept || 'CSE',
        year: student.year || student.currentYear || 'III',
        section: student.section || student.sec || 'A',
        proctorId: proctorId,
        proctorName: proctorName,
        acStaffName: acStaffName,
        ...student
      });
    }
    
    return processedStudents;
  };

  // Load attendance for all students to calculate percentages
  const loadStudentsAttendance = async (students) => {
    try {
      const token = localStorage.getItem('token');
      const studentsWithAttendanceData = [];

      for (const student of students) {
        try {
          const response = await fetch(
            `http://localhost:4000/api/attendance/student/${student._id}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.data) {
              const totalRecords = data.data.length;
              const presentRecords = data.data.filter(record => record.status === "Present").length;
              const attendancePercentage = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;
              
              studentsWithAttendanceData.push({
                ...student,
                attendancePercentage: attendancePercentage,
                totalRecords: totalRecords,
                presentRecords: presentRecords,
                absentRecords: data.data.filter(record => record.status === "Absent").length,
                odRecords: data.data.filter(record => record.status === "On Duty").length
              });
            } else {
              studentsWithAttendanceData.push({
                ...student,
                attendancePercentage: 0,
                totalRecords: 0,
                presentRecords: 0,
                absentRecords: 0,
                odRecords: 0
              });
            }
          } else {
            studentsWithAttendanceData.push({
              ...student,
              attendancePercentage: 0,
              totalRecords: 0,
              presentRecords: 0,
              absentRecords: 0,
              odRecords: 0
            });
          }
        } catch (error) {
          console.error(`Error loading attendance for ${student.name}:`, error);
          studentsWithAttendanceData.push({
            ...student,
            attendancePercentage: 0,
            totalRecords: 0,
            presentRecords: 0,
            absentRecords: 0,
            odRecords: 0
          });
        }
      }

      setStudentsWithAttendance(studentsWithAttendanceData);
    } catch (error) {
      console.error('Error loading students attendance:', error);
      setStudentsWithAttendance([]);
    }
  };

  // Load individual student attendance details
  const loadStudentAttendance = async (student) => {
    try {
      setAttendanceLoading(true);
      setSelectedStudent(student);
      setApiStatus(prev => ({ ...prev, attendance: 'loading' }));
      
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:4000/api/attendance/student/${student._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          // Filter only absent and OD records (ignore present records)
          const absentAndODRecords = data.data.filter(record => 
            record.status === "Absent" || record.status === "On Duty"
          );
          
          setAttendanceDetails(absentAndODRecords);
          setApiStatus(prev => ({ 
            ...prev, 
            attendance: absentAndODRecords.length > 0 ? 'success' : 'no_data' 
          }));
        } else {
          setAttendanceDetails([]);
          setApiStatus(prev => ({ ...prev, attendance: 'no_data' }));
        }
      } else {
        setAttendanceDetails([]);
        setApiStatus(prev => ({ ...prev, attendance: 'error' }));
      }
      
    } catch (error) {
      console.error('Error loading attendance:', error);
      setAttendanceDetails([]);
      setApiStatus(prev => ({ ...prev, attendance: 'error' }));
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleStaffChange = (staffId) => {
    setSelectedStaff(staffId);
    setSelectedStaffInfo(null);
    setAssignedStudents([]);
    setStudentsWithAttendance([]);
    setSelectedStudent(null);
    setAttendanceDetails([]);
    
    if (staffId) {
      loadAssignedStudents(staffId);
    }
  };

  const handleStudentClick = (student) => {
    loadStudentAttendance(student);
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
    setAttendanceDetails([]);
    setApiStatus(prev => ({ ...prev, attendance: 'pending' }));
  };

  // Get student photo from assets
  const getStudentPhoto = (regNo) => {
    try {
      if (!regNo || regNo === 'UNKNOWN') return null;
      
      const patterns = [
        regNo.toLowerCase().replace(/[^a-z0-9]/g, ''),
        regNo.toLowerCase(),
        regNo.replace('/', ''),
        regNo.split('/').join('')
      ];

      for (const pattern of patterns) {
        try {
          const photo = require(`../assets/${pattern}.jpg`);
          return photo;
        } catch (e) {
          continue;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Safe data display function
  const displaySafeText = (text, fallback = 'N/A') => {
    return text || fallback;
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get percentage class for styling
  const getPercentageClass = (percentage) => {
    if (percentage >= 90) return "percentage-excellent";
    if (percentage >= 75) return "percentage-good";
    if (percentage >= 60) return "percentage-average";
    if (percentage >= 40) return "percentage-poor";
    return "percentage-critical";
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Absent': return 'status-absent';
      case 'On Duty': return 'status-od';
      default: return 'status-unknown';
    }
  };

  // Get status display text
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'Absent': return 'Absent';
      case 'On Duty': return 'On Duty';
      default: return status;
    }
  };

  // Get API status message
  const getStatusMessage = (type) => {
    const status = apiStatus[type];
    switch (status) {
      case 'success': return '✅ Data loaded successfully';
      case 'no_data': return 'ℹ️ No data available';
      case 'error': return '❌ Error loading data';
      case 'loading': return '🔄 Loading...';
      default: return '';
    }
  };

  // Calculate statistics
  const calculateStatistics = () => {
    if (studentsWithAttendance.length === 0) return null;

    const totalStudents = studentsWithAttendance.length;
    const lowAttendanceCount = studentsWithAttendance.filter(s => s.attendancePercentage < 75).length;
    const veryLowAttendanceCount = studentsWithAttendance.filter(s => s.attendancePercentage < 60).length;
    const goodAttendanceCount = studentsWithAttendance.filter(s => s.attendancePercentage >= 75).length;
    const excellentAttendanceCount = studentsWithAttendance.filter(s => s.attendancePercentage >= 90).length;
    
    const totalAttendance = studentsWithAttendance.reduce((sum, student) => sum + student.attendancePercentage, 0);
    const averageAttendance = Math.round(totalAttendance / totalStudents);

    return {
      totalStudents,
      lowAttendanceCount,
      veryLowAttendanceCount,
      goodAttendanceCount,
      excellentAttendanceCount,
      averageAttendance
    };
  };

  useEffect(() => {
    loadStaffList();
  }, [loadStaffList]);

  const stats = calculateStatistics();

  // If student is selected, show attendance details
  if (selectedStudent) {
    const studentWithStats = studentsWithAttendance.find(s => s._id === selectedStudent._id);
    
    return (
      <div className="student-details-container">
        <div className="ac-header">
          <h1>Student Attendance Details</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="back-button" onClick={handleBackToStudents}>
              ← Back to Students
            </button>
            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              style={{
                padding: '10px 20px',
                background: '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Student Header */}
        <div className="student-header-card">
          <div className="student-header-content">
            <div className="student-avatar">
              {getStudentPhoto(selectedStudent.regNo) ? (
                <img 
                  src={getStudentPhoto(selectedStudent.regNo)} 
                  alt={selectedStudent.name}
                  style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}}
                />
              ) : (
                selectedStudent.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2>{displaySafeText(selectedStudent.name)}</h2>
              <p className="student-regno">{displaySafeText(selectedStudent.regNo)}</p>
              <p className="student-details">
                {displaySafeText(selectedStudent.department)} - {displaySafeText(selectedStudent.year)} Year - Section {displaySafeText(selectedStudent.section)}
              </p>
              <p className="student-details">
                <strong>Proctor:</strong> {displaySafeText(selectedStudent.proctorName)}
              </p>
              <p className="student-details">
                <strong>AC Staff:</strong> {displaySafeText(selectedStudent.acStaffName)}
              </p>
              {studentWithStats && (
                <p className="student-details">
                  <strong>Overall Attendance: </strong>
                  <span className={`attendance-percentage ${getPercentageClass(studentWithStats.attendancePercentage)}`}>
                    {studentWithStats.attendancePercentage}%
                  </span>
                  <span style={{marginLeft: '15px', fontSize: '14px', opacity: '0.8'}}>
                    ({studentWithStats.presentRecords}/{studentWithStats.totalRecords} classes)
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="selected-class-info" style={{textAlign: 'center', marginBottom: '20px'}}>
          {getStatusMessage('attendance')}
        </div>

        {/* Attendance Summary */}
        {studentWithStats && (
          <div className="stats-section">
            <h3>Attendance Summary</h3>
            <div className="stats-grid">
              <div className="stat-card" style={{background: 'rgba(52, 152, 219, 0.3)'}}>
                <h4>Total Classes</h4>
                <div className="stat-value">{studentWithStats.totalRecords}</div>
                <div className="stat-label">Classes</div>
              </div>
              <div className="stat-card" style={{background: 'rgba(46, 204, 113, 0.3)'}}>
                <h4>Present</h4>
                <div className="stat-value">{studentWithStats.presentRecords}</div>
                <div className="stat-label">Classes</div>
              </div>
              <div className="stat-card" style={{background: 'rgba(231, 76, 60, 0.3)'}}>
                <h4>Absent</h4>
                <div className="stat-value">{studentWithStats.absentRecords}</div>
                <div className="stat-label">Classes</div>
              </div>
              <div className="stat-card" style={{background: 'rgba(243, 156, 18, 0.3)'}}>
                <h4>On Duty</h4>
                <div className="stat-value">{studentWithStats.odRecords}</div>
                <div className="stat-label">Classes</div>
              </div>
              <div className="stat-card" style={{background: 'rgba(155, 89, 182, 0.3)'}}>
                <h4>Attendance %</h4>
                <div className="stat-value">{studentWithStats.attendancePercentage}%</div>
                <div className="stat-label">Overall</div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Records */}
        <div className="attendance-records-section">
          <h3>Absent & On Duty Records</h3>
          
          {attendanceLoading ? (
            <div className="loading-message">
              <p>Loading attendance records...</p>
            </div>
          ) : attendanceDetails.length > 0 ? (
            <div className="students-table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Period</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceDetails.map((record, index) => (
                    <tr key={record.id || record._id || index}>
                      <td>{formatDate(record.date)}</td>
                      <td>{displaySafeText(record.day)}</td>
                      <td>{record.period} {record.periodTime && `(${record.periodTime})`}</td>
                      <td>{displaySafeText(record.subject)}</td>
                      <td>
                        <span className={`status-badge ${
                          record.status === 'Absent' ? 'status-absent' : 'status-od'
                        }`}>
                          {getStatusDisplay(record.status)}
                        </span>
                      </td>
                      <td>{displaySafeText(record.reason, 'No reason provided')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data-message">
              <h4>Perfect Attendance! 🎉</h4>
              <p>This student has no absent or on duty records in the database.</p>
              <p>All attendance records show the student was present.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Proctor Dashboard View
  return (
    <div className="proctor-dashboard-container">
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h2>Proctor Dashboard</h2>
            <p>Monitor student attendance and performance for assigned proctor groups</p>
          </div>
          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              background: '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Staff Selection Section */}
      <div className="staff-selection-section">
        <h3>Select Staff Member</h3>
        
        <div className="staff-filters">
          <div className="selection-group">
            <label>Staff Name</label>
            <select 
              value={selectedStaff} 
              onChange={(e) => handleStaffChange(e.target.value)}
              disabled={staffLoading}
            >
              <option value="">Select Staff</option>
              {staffList.map((staff) => (
                <option key={staff.staffId} value={staff.staffId}>
                  {staff.name} ({staff.department}) - {staff.staffId}
                </option>
              ))}
            </select>
          </div>

          <div className="selection-group">
            <label>View Date</label>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <button 
            className="back-button" 
            onClick={() => handleStaffChange("")} 
            style={{background: '#64748b', marginBottom: '8px'}}
          >
            Clear Selection
          </button>
        </div>

        {/* Selected Staff Info */}
        {selectedStaff && (
          <div className="staff-info-card">
            <h4>Selected Staff Information</h4>
            {staffLoading && <p>Loading staff data from database...</p>}
            {selectedStaffInfo && (
              <div>
                <p><strong>Name:</strong> {displaySafeText(selectedStaffInfo.name)}</p>
                <p><strong>Department:</strong> {displaySafeText(selectedStaffInfo.department)}</p>
                <p><strong>Staff ID:</strong> {displaySafeText(selectedStaffInfo.staffId)}</p>
                <p><strong>Assigned Students:</strong> {assignedStudents.length}</p>
              </div>
            )}
            {loading && <p>Loading student data from database...</p>}
          </div>
        )}
      </div>

      {/* Class Statistics */}
      {selectedStaff && stats && (
        <div className="stats-section">
          <h3>Proctor Group Statistics - {selectedStaffInfo?.name}</h3>
          
          <div className="stats-grid">
            <div className="stat-card" style={{background: 'rgba(52, 152, 219, 0.3)'}}>
              <h4>Total Students</h4>
              <div className="stat-value">{stats.totalStudents}</div>
              <div className="stat-label">Students</div>
            </div>
            
            <div className="stat-card" style={{background: 'rgba(46, 204, 113, 0.3)'}}>
              <h4>Average Attendance</h4>
              <div className="stat-value">{stats.averageAttendance}%</div>
              <div className="stat-label">Group Average</div>
            </div>
            
            <div className="stat-card" style={{background: 'rgba(243, 156, 18, 0.3)'}}>
              <h4>Low Attendance</h4>
              <div className="stat-value">{stats.lowAttendanceCount}</div>
              <div className="stat-label">&lt; 75%</div>
            </div>
            
            <div className="stat-card" style={{background: 'rgba(231, 76, 60, 0.3)'}}>
              <h4>Very Low</h4>
              <div className="stat-value">{stats.veryLowAttendanceCount}</div>
              <div className="stat-label">&lt; 60%</div>
            </div>
            
            <div className="stat-card" style={{background: 'rgba(39, 174, 96, 0.3)'}}>
              <h4>Good Attendance</h4>
              <div className="stat-value">{stats.goodAttendanceCount}</div>
              <div className="stat-label">≥ 75%</div>
            </div>
          </div>
        </div>
      )}

      {/* API Status */}
      {selectedStaff && (
        <div className="selected-class-info">
          <div className="api-status-indicator">
            <span className={`status-badge status-${apiStatus.staff}`}>
              Staff: {getStatusMessage('staff')}
            </span>
            <span className={`status-badge status-${apiStatus.students}`}>
              Students: {getStatusMessage('students')}
            </span>
          </div>
        </div>
      )}

      {/* Students List with Table */}
      {selectedStaff && (
        <div className="students-section">
          <h3>
            Assigned Students - {selectedDate}
            {studentsWithAttendance.length > 0 && ` (${studentsWithAttendance.length} students)`}
          </h3>
          
          {/* Statistics Summary */}
          {stats && (
            <div className="stats-summary">
              <div className="stat-item">
                <span className="stat-number">{stats.totalStudents}</span>
                <span className="stat-label">Total Students</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.averageAttendance}%</span>
                <span className="stat-label">Average Attendance</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.goodAttendanceCount}</span>
                <span className="stat-label">Good Attendance</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.lowAttendanceCount}</span>
                <span className="stat-label">Need Attention</span>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="table-loading">
              Loading students data from database...
            </div>
          ) : studentsWithAttendance.length > 0 ? (
            <>
              <div className="students-table-container">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>REG NO</th>
                      <th>NAME</th>
                      <th>DEPARTMENT</th>
                      <th>YEAR</th>
                      <th>SECTION</th>
                      <th>ATTENDANCE %</th>
                      <th>PROCTOR</th>
                      <th>AC STAFF</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsWithAttendance.map((student, index) => (
                      <tr 
                        key={student._id}
                        onClick={() => handleStudentClick(student)}
                      >
                        <td style={{fontWeight: 'bold', color: '#fbbf24'}}>
                          {displaySafeText(student.regNo)}
                        </td>
                        <td style={{fontWeight: '600', color: 'white'}}>
                          {displaySafeText(student.name)}
                        </td>
                        <td>
                          {displaySafeText(student.department)}
                        </td>
                        <td>
                          {displaySafeText(student.year)}
                        </td>
                        <td>
                          {displaySafeText(student.section)}
                        </td>
                        <td>
                          <span className={`attendance-percentage ${getPercentageClass(student.attendancePercentage)}`}>
                            {student.attendancePercentage}%
                          </span>
                        </td>
                        <td>
                          {displaySafeText(student.proctorName)}
                        </td>
                        <td>
                          {displaySafeText(student.acStaffName)}
                        </td>
                        <td>
                          <button
                            className="view-attendance-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStudentClick(student);
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="click-hint">
                💡 Click on any student row to view their detailed attendance records
              </p>
            </>
          ) : (
            <div className="no-students-message">
              <h4>No students assigned to this staff member</h4>
              <p>This staff member might not have any students assigned yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Welcome Message when no staff selected */}
      {!selectedStaff && (
        <div className="welcome-message">
          <h3>Welcome to Proctor Dashboard</h3>
          <p>
            Select a staff member from the dropdown above to view their assigned students and attendance statistics.
          </p>
          <div style={{marginTop: '30px'}}>
            <h4 style={{color: '#38bdf8', marginBottom: '15px'}}>Features:</h4>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', maxWidth: '600px', margin: '0 auto'}}>
              <div style={{textAlign: 'left', padding: '10px'}}>
                <span style={{color: '#4ade80'}}>✓</span> View real staff data from database
              </div>
              <div style={{textAlign: 'left', padding: '10px'}}>
                <span style={{color: '#4ade80'}}>✓</span> See assigned students for each staff member
              </div>
              <div style={{textAlign: 'left', padding: '10px'}}>
                <span style={{color: '#4ade80'}}>✓</span> Monitor attendance percentages for each student
              </div>
              <div style={{textAlign: 'left', padding: '10px'}}>
                <span style={{color: '#4ade80'}}>✓</span> Click students to view detailed attendance records
              </div>
              <div style={{textAlign: 'left', padding: '10px'}}>
                <span style={{color: '#4ade80'}}>✓</span> Track low attendance students automatically
              </div>
              <div style={{textAlign: 'left', padding: '10px'}}>
                <span style={{color: '#4ade80'}}>✓</span> View both Proctor and AC Staff information
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
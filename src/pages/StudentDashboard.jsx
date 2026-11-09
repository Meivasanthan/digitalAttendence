import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [searchRegNo, setSearchRegNo] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [allAttendanceData, setAllAttendanceData] = useState([]); // Store all records for stats
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/student/login');
  };

  // Get student photo from assets
  const getStudentPhoto = (regNo) => {
    try {
      if (!regNo || regNo === 'N/A') return null;
      
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

  // Search for student by registration number
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchRegNo.trim()) {
      setError("Please enter a registration number");
      return;
    }

    setLoading(true);
    setError("");
    setStudentData(null);
    setAttendanceData([]);
    setAllAttendanceData([]);

    try {
      const token = localStorage.getItem('token');
      
      console.log('🔍 Searching for student:', searchRegNo);

      // Search for student
      const studentResponse = await fetch(`http://localhost:4000/api/students/search?regNo=${encodeURIComponent(searchRegNo)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Student search response status:', studentResponse.status);

      if (studentResponse.ok) {
        const studentResult = await studentResponse.json();
        console.log('📋 Student search result:', studentResult);
        
        if (studentResult.success && studentResult.data) {
          // Get proctor ID from student data
          const proctorId = studentResult.data.protorId || studentResult.data.proctorId;
          const section = studentResult.data.section;
          
          console.log('👨‍🏫 Proctor ID:', proctorId);
          console.log('📚 Section:', section);
          
          // Get both proctor name and AC staff name in parallel
          const [proctorName, acStaffName] = await Promise.all([
            getProctorName(proctorId),
            getACStaffForSection(section)
          ]);
          
          console.log('👨‍🏫 Proctor name result:', proctorName);
          console.log('👩‍🏫 AC Staff name result:', acStaffName);
          
          const studentWithAdditionalData = {
            ...studentResult.data,
            proctorId: proctorId,
            proctorName: proctorName,
            acStaffName: acStaffName
          };
          
          setStudentData(studentWithAdditionalData);
          
          // Fetch attendance data for the student
          console.log('📊 Fetching attendance for student:', studentResult.data._id);
          const attendanceResponse = await fetch(`http://localhost:4000/api/attendance/student/${studentResult.data._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('📡 Attendance response status:', attendanceResponse.status);

          if (attendanceResponse.ok) {
            const attendanceResult = await attendanceResponse.json();
            console.log('📈 Attendance result:', attendanceResult);
            if (attendanceResult.success) {
              // Store all records for statistics
              setAllAttendanceData(attendanceResult.data || []);
              
              // Filter only absent and OD records for display
              const absentODRecords = attendanceResult.data.filter(record => 
                record.status === "Absent" || record.status === "On Duty"
              );
              setAttendanceData(absentODRecords || []);
            } else {
              console.log('❌ Attendance API error:', attendanceResult.message);
            }
          } else {
            console.log('❌ Attendance fetch failed:', attendanceResponse.status);
          }
        } else {
          setError(studentResult.message || "Student not found");
        }
      } else {
        const errorText = await studentResponse.text();
        console.log('❌ Student search failed:', studentResponse.status, errorText);
        setError("Error searching for student. Please check if the student exists.");
      }
    } catch (error) {
      console.error('💥 Search error:', error);
      setError("Failed to search for student. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate attendance statistics
  const calculateAttendanceStats = () => {
    if (!allAttendanceData.length) return null;

    const totalClasses = allAttendanceData.length;
    const presentClasses = allAttendanceData.filter(record => record.status === "Present").length;
    const absentClasses = allAttendanceData.filter(record => record.status === "Absent").length;
    const odClasses = allAttendanceData.filter(record => record.status === "On Duty").length;
    const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

    return {
      totalClasses,
      presentClasses,
      absentClasses,
      odClasses,
      attendancePercentage
    };
  };

  const stats = calculateAttendanceStats();

  // Get percentage class for styling
  const getPercentageClass = (percentage) => {
    if (percentage >= 90) return "percentage-excellent";
    if (percentage >= 75) return "percentage-good";
    if (percentage >= 60) return "percentage-average";
    if (percentage >= 40) return "percentage-poor";
    return "percentage-critical";
  };

  // Format date
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

  // Safe data display function
  const displaySafeText = (text, fallback = 'N/A') => {
    return text || fallback;
  };

  return (
    <div className="student-dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Student Dashboard</h1>
            <p>Search and view student attendance records</p>
          </div>
          <div className="header-actions">
            <button className="home-button" onClick={() => navigate('/')}>
              🏠 Home
            </button>
            <button className="logout-button" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-card">
          <h2>Search Student Records</h2>
          <p className="search-description">
            Enter student registration number to view attendance details
          </p>
          
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                value={searchRegNo}
                onChange={(e) => setSearchRegNo(e.target.value.toUpperCase())}
                placeholder="Enter Registration Number (e.g., 23CS124)"
                className="search-input"
                disabled={loading}
              />
              <button 
                type="submit" 
                className="search-button"
                disabled={loading}
              >
                {loading ? "Searching..." : "🔍 Search"}
              </button>
            </div>
          </form>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-section">
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <h3>Searching for student records...</h3>
            <p>Please wait while we fetch the data</p>
          </div>
        </div>
      )}

      {/* Student Details */}
      {studentData && !loading && (
        <div className="student-details-section">
          {/* Student Profile Card */}
          <div className="student-profile-card">
            <div className="profile-header">
              <div className="student-avatar">
                {/* Show student photo if available */}
                {getStudentPhoto(studentData.regNo) ? (
                  <img 
                    src={getStudentPhoto(studentData.regNo)} 
                    alt={studentData.name}
                    style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}}
                  />
                ) : (
                  studentData.name ? studentData.name.charAt(0).toUpperCase() : 'S'
                )}
              </div>
              <div className="profile-info">
                <h2>{displaySafeText(studentData.name)}</h2>
                <p className="reg-no">{displaySafeText(studentData.regNo)}</p>
                <div className="profile-details">
                  <span className="detail-item">
                    <strong>Department:</strong> {displaySafeText(studentData.department)}
                  </span>
                  <span className="detail-item">
                    <strong>Year:</strong> {displaySafeText(studentData.year)}
                  </span>
                  <span className="detail-item">
                    <strong>Section:</strong> {displaySafeText(studentData.section)}
                  </span>
                  {/* Proctor Information */}
                  <span className="detail-item">
                    <strong>Proctor:</strong> 
                    {studentData.proctorName ? (
                      displaySafeText(studentData.proctorName)
                    ) : studentData.proctorId ? (
                      `${displaySafeText(studentData.proctorId)} (Proctor ID)`
                    ) : (
                      'Not Assigned'
                    )}
                  </span>
                  {/* AC Staff Information */}
                  <span className="detail-item">
                    <strong>AC Staff:</strong> 
                    {displaySafeText(studentData.acStaffName)}
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Overview */}
            {stats && (
              <div className="attendance-overview">
                <div className="overview-header">
                  <h3>Attendance Overview</h3>
                  <div className={`attendance-percentage-large ${getPercentageClass(stats.attendancePercentage)}`}>
                    {stats.attendancePercentage}%
                  </div>
                </div>
                
                <div className="attendance-stats">
                  <div className="stat-item">
                    <div className="stat-value">{stats.totalClasses}</div>
                    <div className="stat-label">Total Classes</div>
                  </div>
                  <div className="stat-item present">
                    <div className="stat-value">{stats.presentClasses}</div>
                    <div className="stat-label">Present</div>
                  </div>
                  <div className="stat-item absent">
                    <div className="stat-value">{stats.absentClasses}</div>
                    <div className="stat-label">Absent</div>
                  </div>
                  <div className="stat-item od">
                    <div className="stat-value">{stats.odClasses}</div>
                    <div className="stat-label">On Duty</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Attendance Records - Showing only absent/OD */}
          <div className="attendance-records-section">
            <h3>Absent & On Duty Records</h3>
            
            {attendanceData.length > 0 ? (
              <div className="records-table-container">
                <table className="attendance-records-table">
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
                    {attendanceData.map((record, index) => (
                      <tr key={record._id || index} className={record.status.toLowerCase()}>
                        <td>{formatDate(record.date)}</td>
                        <td>{displaySafeText(record.day)}</td>
                        <td>
                          {record.period} 
                          {record.periodTime && ` (${record.periodTime})`}
                        </td>
                        <td>{displaySafeText(record.subject)}</td>
                        <td>
                          <span className={`status-badge status-${record.status.toLowerCase().replace(' ', '-')}`}>
                            {record.status}
                          </span>
                        </td>
                        <td>{displaySafeText(record.reason, 'No reason provided')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-records-message">
                <h4>No Absent or On Duty Records 🎉</h4>
                <p>This student has no absent or on duty records in the system.</p>
                <p>All attendance records show the student was present.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Welcome/Instructions */}
      {!studentData && !loading && !error && (
        <div className="welcome-section">
          <div className="welcome-card">
            <h2>Welcome to Student Dashboard</h2>
            <p>Use the search bar above to find student attendance records by registration number.</p>
            
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">🔍</div>
                <h4>Quick Search</h4>
                <p>Search students by registration number</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <h4>Attendance Analytics</h4>
                <p>View detailed attendance statistics</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">📝</div>
                <h4>Detailed Records</h4>
                <p>Access complete attendance history</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">👨‍🏫</div>
                <h4>Staff Information</h4>
                <p>View assigned proctor and AC staff details</p>
              </div>
            </div>

            <div className="search-examples">
              <h4>Example Registration Numbers:</h4>
              <div className="examples-list">
                <span>23CS124</span>
                <span>23CS125</span>
                <span>23CS126</span>
                <span>23CS127</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ACDashboard() {
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState("CSE");
  const [selectedYear, setSelectedYear] = useState("III");
  const [selectedSection, setSelectedSection] = useState("A");
  const [classStudents, setClassStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [studentsWithAttendance, setStudentsWithAttendance] = useState([]);
  const [apiStatus, setApiStatus] = useState({ students: 'pending', attendance: 'pending' });

  // Sample data
  const departments = ["CSE", "ECE", "EEE", "MECH", "CIVIL"];
  const years = ["I", "II", "III", "IV"];
  const sections = ["A", "B", "C", "D"];

  // Load class students when selection changes
  useEffect(() => {
    if (selectedDept && selectedYear && selectedSection) {
      loadClassStudents();
    } else {
      setClassStudents([]);
      setError("");
      setSelectedStudent(null);
      setAttendanceDetails([]);
      setStudentsWithAttendance([]);
    }
  }, [selectedDept, selectedYear, selectedSection]);

  // Function to get proctor name by ID - UPDATED TO MATCH YOUR DB STRUCTURE
  const getProctorName = async (proctorId) => {
    if (!proctorId || proctorId === 'N/A') return 'N/A';
    
    console.log('🔍 Searching for proctor with ID:', proctorId);
    
    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
      
      // Method 1: Try staffs collection first (based on your DB structure)
      try {
        const staffResponse = await fetch(`${API_BASE}/staffs`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (staffResponse.ok) {
          const staffData = await staffResponse.json();
          console.log('📋 Staffs collection response:', staffData);
          
          // Handle different response formats
          let staffList = [];
          if (Array.isArray(staffData)) {
            staffList = staffData;
          } else if (staffData.data && Array.isArray(staffData.data)) {
            staffList = staffData.data;
          } else if (staffData.success && Array.isArray(staffData.data)) {
            staffList = staffData.data;
          }
          
          // Search for proctor in staffs collection
          const foundStaff = staffList.find(staff => {
            // Try different ID fields that might match proctorId
            const staffId = staff.staff_id || staff.staffId || staff.id;
            console.log(`Comparing proctorId: ${proctorId} with staff:`, staffId, staff.name);
            return staffId === proctorId;
          });
          
          if (foundStaff && foundStaff.name) {
            console.log('✅ Found proctor in staffs collection:', foundStaff.name);
            return foundStaff.name;
          }
        }
      } catch (staffError) {
        console.log('Staffs collection API error:', staffError);
      }

      // Method 2: Try direct staff lookup by ID
      try {
        const directStaffResponse = await fetch(`${API_BASE}/staffs/${proctorId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (directStaffResponse.ok) {
          const result = await directStaffResponse.json();
          console.log('📋 Direct staff lookup response:', result);
          
          // Handle different response formats
          let staffData = null;
          if (result.data) {
            staffData = result.data;
          } else if (result.success && result.data) {
            staffData = result.data;
          } else {
            staffData = result;
          }
          
          if (staffData && staffData.name) {
            console.log('✅ Found proctor in direct staff lookup:', staffData.name);
            return staffData.name;
          }
        }
      } catch (directError) {
        console.log('Direct staff API error:', directError);
      }

      // Method 3: Try AC Staff as fallback
      try {
        const acStaffResponse = await fetch(`${API_BASE}/acstaff`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (acStaffResponse.ok) {
          const acStaffList = await acStaffResponse.json();
          console.log('📋 AC Staff fallback response:', acStaffList);
          
          let acStaffArray = [];
          if (Array.isArray(acStaffList)) {
            acStaffArray = acStaffList;
          } else if (acStaffList.data && Array.isArray(acStaffList.data)) {
            acStaffArray = acStaffList.data;
          }
          
          const foundACStaff = acStaffArray.find(staff => 
            staff.staff_id === proctorId || staff.staffId === proctorId
          );
          
          if (foundACStaff && foundACStaff.name) {
            console.log('✅ Found proctor in AC Staff fallback:', foundACStaff.name);
            return foundACStaff.name;
          }
        }
      } catch (acError) {
        console.log('AC Staff fallback error:', acError);
      }

      console.log('❌ No proctor found with ID:', proctorId);
      return `${proctorId} (Proctor ID)`;
      
    } catch (error) {
      console.error('💥 Error fetching proctor name:', error);
      return `${proctorId} (Proctor ID)`;
    }
  };

  // Function to get AC staff name for the section - UPDATED
  const getACStaffForSection = async (section) => {
    if (!section || section === 'N/A') return 'N/A';
    
    console.log('🔍 Searching for AC staff for section:', section);
    
    try {
      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
      
      // Get all AC staff and find who is assigned to this section
      const acStaffResponse = await fetch(`${API_BASE}/acstaff`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (acStaffResponse.ok) {
        const acStaffData = await acStaffResponse.json();
        console.log('📋 All AC Staff response:', acStaffData);
        
        // Handle different response formats
        let acStaffList = [];
        if (Array.isArray(acStaffData)) {
          acStaffList = acStaffData;
        } else if (acStaffData.data && Array.isArray(acStaffData.data)) {
          acStaffList = acStaffData.data;
        } else if (acStaffData.success && Array.isArray(acStaffData.data)) {
          acStaffList = acStaffData.data;
        }
        
        // Find AC staff assigned to this section
        const foundACStaff = acStaffList.find(staff => {
          const assignedSections = staff.assigned_sections || staff.assignedSections || [];
          console.log(`Checking AC Staff ${staff.name} with sections:`, assignedSections);
          return assignedSections.includes(section);
        });
        
        if (foundACStaff && foundACStaff.name) {
          console.log('✅ Found AC Staff for section:', foundACStaff.name);
          return foundACStaff.name;
        } else {
          console.log('❌ No AC staff found for section:', section);
          return 'Not Assigned';
        }
      }
      
      return 'Not Assigned';
      
    } catch (error) {
      console.error('💥 Error fetching AC staff:', error);
      return 'Not Assigned';
    }
  };

  // Load class students from database
  const loadClassStudents = async () => {
    setLoading(true);
    setError("");
    setSelectedStudent(null);
    setAttendanceDetails([]);
    setStudentsWithAttendance([]);
    setApiStatus({ students: 'loading', attendance: 'pending' });
    
    try {
      console.log('🔍 Fetching students for:', {
        department: selectedDept,
        year: selectedYear,
        section: selectedSection
      });

      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
      const response = await fetch(
        `${API_BASE}/students?department=${selectedDept}&year=${selectedYear}&section=${selectedSection}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 Students response data:', data);

      if (data.success && data.data) {
        console.log(`✅ Found ${data.data.length} students`);
        const processedStudents = await processStudentData(data.data);
        setClassStudents(processedStudents);
        setApiStatus(prev => ({ ...prev, students: 'success' }));
        
        // Load attendance for all students to calculate percentages
        await loadStudentsAttendance(processedStudents);
      } else {
        setError(data.message || "No students found for this class");
        setClassStudents([]);
        setApiStatus(prev => ({ ...prev, students: 'no_data' }));
      }
    } catch (error) {
      console.error('💥 Error loading students:', error);
      setError("Error loading student data. Please check if backend server is running on port 4000.");
      setClassStudents([]);
      setApiStatus(prev => ({ ...prev, students: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  // Process student data with proctor and AC staff names
  const processStudentData = async (students) => {
    const processedStudents = [];
    
    for (const student of students) {
      const proctorId = student.proctorId || student.proctor_id || student.proctorId;
      const section = student.section;
      
      console.log(`📝 Processing student: ${student.name}, Proctor ID: ${proctorId}, Section: ${section}`);
      
      // Get both proctor name and AC staff name in parallel
      const [proctorName, acStaffName] = await Promise.all([
        getProctorName(proctorId),
        getACStaffForSection(section)
      ]);
      
      processedStudents.push({
        _id: student._id || student.id || `student-${processedStudents.length}`,
        regNo: student.regNo || student.reg || `UNKNOWN-${processedStudents.length}`,
        name: student.name || 'Unknown Student',
        department: student.department || student.dept || selectedDept,
        year: student.year || selectedYear,
        section: student.section || selectedSection,
        proctorId: proctorId,
        proctorName: proctorName,
        acStaffName: acStaffName,
        ...student
      });
    }
    
    console.log(`✅ Processed ${processedStudents.length} students with staff names`);
    return processedStudents;
  };

  // Load attendance for all students to calculate percentages
  const loadStudentsAttendance = async (students) => {
    try {
      console.log('📊 Loading attendance for all students...');
      const token = localStorage.getItem('token');
      const studentsWithAttendanceData = [];

      for (const student of students) {
        try {
          const studentAttendance = await loadStudentAttendanceData(student._id, token);
          
          studentsWithAttendanceData.push({
            ...student,
            attendancePercentage: studentAttendance.percentage,
            totalRecords: studentAttendance.totalRecords,
            presentRecords: studentAttendance.presentRecords,
            absentRecords: studentAttendance.absentRecords,
            odRecords: studentAttendance.odRecords,
            allRecords: studentAttendance.allRecords
          });
        } catch (error) {
          console.error(`Error loading attendance for ${student.name}:`, error);
          studentsWithAttendanceData.push({
            ...student,
            attendancePercentage: 0,
            totalRecords: 0,
            presentRecords: 0,
            absentRecords: 0,
            odRecords: 0,
            allRecords: []
          });
        }
      }

      console.log(`✅ Processed ${studentsWithAttendanceData.length} students with attendance`);
      setStudentsWithAttendance(studentsWithAttendanceData);
    } catch (error) {
      console.error('Error loading students attendance:', error);
      setStudentsWithAttendance([]);
    }
  };

  // Load individual student attendance data
  const loadStudentAttendanceData = async (studentId, token) => {
    try {
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
      const response = await fetch(
        `${API_BASE}/attendance/student/${studentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          const allRecords = data.data;
          const totalRecords = allRecords.length;
          const presentRecords = allRecords.filter(record => record.status === "Present").length;
          const absentRecords = allRecords.filter(record => record.status === "Absent").length;
          const odRecords = allRecords.filter(record => record.status === "On Duty").length;
          const attendancePercentage = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;
          
          return {
            percentage: attendancePercentage,
            totalRecords,
            presentRecords,
            absentRecords,
            odRecords,
            allRecords
          };
        }
      }
      
      // Return default if no data
      return {
        percentage: 0,
        totalRecords: 0,
        presentRecords: 0,
        absentRecords: 0,
        odRecords: 0,
        allRecords: []
      };
    } catch (error) {
      console.error('Error in loadStudentAttendanceData:', error);
      return {
        percentage: 0,
        totalRecords: 0,
        presentRecords: 0,
        absentRecords: 0,
        odRecords: 0,
        allRecords: []
      };
    }
  };

  // Load individual student attendance details for detailed view
  const loadStudentAttendance = async (student) => {
    try {
      setAttendanceLoading(true);
      setSelectedStudent(student);
      setApiStatus(prev => ({ ...prev, attendance: 'loading' }));
      
      console.log('🔍 Loading detailed attendance for:', student.name, student._id);

      const token = localStorage.getItem('token');
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
      const response = await fetch(
        `${API_BASE}/attendance/student/${student._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('📡 Detailed attendance response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📈 Detailed attendance data:', data);
        
        if (data.success && data.data) {
          // Get ALL records first to show everything
          const allRecords = data.data;
          console.log(`📊 Found ${allRecords.length} total attendance records`);
          
          // Filter only absent and OD records for the main view (as per your requirement)
          const absentAndODRecords = allRecords.filter(record => 
            record.status === "Absent" || record.status === "On Duty"
          );
          
          console.log(`📊 Filtered to ${absentAndODRecords.length} absent/OD records`);
          
          setAttendanceDetails(absentAndODRecords);
          setApiStatus(prev => ({ 
            ...prev, 
            attendance: allRecords.length > 0 ? 'success' : 'no_data' 
          }));

          // Also update the student's stats in the main list
          updateStudentStats(student._id, allRecords);
        } else {
          console.log('❌ No attendance data in response');
          setAttendanceDetails([]);
          setApiStatus(prev => ({ ...prev, attendance: 'no_data' }));
        }
      } else {
        console.log('❌ Attendance API error:', response.status);
        const errorText = await response.text();
        console.log('Error details:', errorText);
        setAttendanceDetails([]);
        setApiStatus(prev => ({ ...prev, attendance: 'error' }));
      }
      
    } catch (error) {
      console.error('💥 Error loading detailed attendance:', error);
      setAttendanceDetails([]);
      setApiStatus(prev => ({ ...prev, attendance: 'error' }));
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Update student stats when we get detailed data
  const updateStudentStats = (studentId, allRecords) => {
    setStudentsWithAttendance(prev => 
      prev.map(student => {
        if (student._id === studentId) {
          const totalRecords = allRecords.length;
          const presentRecords = allRecords.filter(record => record.status === "Present").length;
          const attendancePercentage = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;
          
          return {
            ...student,
            attendancePercentage,
            totalRecords,
            presentRecords,
            absentRecords: allRecords.filter(record => record.status === "Absent").length,
            odRecords: allRecords.filter(record => record.status === "On Duty").length,
            allRecords
          };
        }
        return student;
      })
    );
  };

  const clearSelection = () => {
    setSelectedDept("");
    setSelectedYear("");
    setSelectedSection("");
    setClassStudents([]);
    setError("");
    setSelectedStudent(null);
    setAttendanceDetails([]);
    setStudentsWithAttendance([]);
    setApiStatus({ students: 'pending', attendance: 'pending' });
  };

  const handleStudentClick = (student) => {
    loadStudentAttendance(student);
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
    setAttendanceDetails([]);
    setApiStatus(prev => ({ ...prev, attendance: 'pending' }));
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

  // Get status display text
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'Absent': return 'Absent';
      case 'On Duty': return 'On Duty';
      case 'Present': return 'Present';
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

  const stats = calculateStatistics();

  // If student is selected, show attendance details
  if (selectedStudent) {
    const studentWithStats = studentsWithAttendance.find(s => s._id === selectedStudent._id);
    
    return (
      <div style={{ 
        padding: '20px', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1>Student Attendance Details</h1>
          <button 
            onClick={handleBackToStudents}
            style={{
              padding: '10px 20px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ← Back to Students
          </button>
        </div>

        {/* Student Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '25px',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)',
          marginBottom: '25px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              {selectedStudent.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <h2>{displaySafeText(selectedStudent.name)}</h2>
              <p style={{ fontSize: '18px', margin: '5px 0' }}>
                <strong>{displaySafeText(selectedStudent.regNo)}</strong>
              </p>
              <p style={{ margin: '2px 0' }}>
                {displaySafeText(selectedStudent.department)} - {displaySafeText(selectedStudent.year)} Year - Section {displaySafeText(selectedStudent.section)}
              </p>
              <p style={{ margin: '2px 0' }}>
                <strong>Proctor:</strong> {displaySafeText(selectedStudent.proctorName)}
              </p>
              <p style={{ margin: '2px 0' }}>
                <strong>AC Staff:</strong> {displaySafeText(selectedStudent.acStaffName)}
              </p>
              {studentWithStats && (
                <p style={{ margin: '2px 0' }}>
                  <strong>Overall Attendance: </strong>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    background: studentWithStats.attendancePercentage >= 75 ? '#27ae60' : 
                               studentWithStats.attendancePercentage >= 60 ? '#f39c12' : '#e74c3c',
                    color: 'white',
                    marginLeft: '10px'
                  }}>
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
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          padding: '10px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px'
        }}>
          {getStatusMessage('attendance')}
          {attendanceDetails.length > 0 && (
            <span style={{marginLeft: '15px'}}>
              Showing {attendanceDetails.length} absent/OD records
            </span>
          )}
        </div>

        {/* Attendance Summary */}
        {studentWithStats && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '25px',
            borderRadius: '15px',
            backdropFilter: 'blur(10px)',
            marginBottom: '25px'
          }}>
            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Attendance Summary</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '15px',
              textAlign: 'center'
            }}>
              <div style={{ background: 'rgba(52, 152, 219, 0.3)', padding: '15px', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Total Classes</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{studentWithStats.totalRecords}</div>
                <div style={{ fontSize: '12px', opacity: '0.8' }}>Classes</div>
              </div>
              <div style={{ background: 'rgba(46, 204, 113, 0.3)', padding: '15px', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Present</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{studentWithStats.presentRecords}</div>
                <div style={{ fontSize: '12px', opacity: '0.8' }}>Classes</div>
              </div>
              <div style={{ background: 'rgba(231, 76, 60, 0.3)', padding: '15px', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Absent</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{studentWithStats.absentRecords}</div>
                <div style={{ fontSize: '12px', opacity: '0.8' }}>Classes</div>
              </div>
              <div style={{ background: 'rgba(243, 156, 18, 0.3)', padding: '15px', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>On Duty</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{studentWithStats.odRecords}</div>
                <div style={{ fontSize: '12px', opacity: '0.8' }}>Classes</div>
              </div>
              <div style={{ background: 'rgba(155, 89, 182, 0.3)', padding: '15px', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Attendance %</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{studentWithStats.attendancePercentage}%</div>
                <div style={{ fontSize: '12px', opacity: '0.8' }}>Overall</div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Records */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '25px',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Absent & On Duty Records</h3>
          
          {attendanceLoading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Loading attendance records from database...</p>
            </div>
          ) : attendanceDetails.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                background: 'white',
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <thead>
                  <tr style={{ background: '#34495e' }}>
                    <th style={{ padding: '15px', textAlign: 'left', color: 'white' }}>Date</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: 'white' }}>Day</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: 'white' }}>Period</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: 'white' }}>Subject</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: 'white' }}>Status</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: 'white' }}>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceDetails.map((record, index) => (
                    <tr 
                      key={record.id || record._id || index}
                      style={{ 
                        background: index % 2 === 0 ? '#f8f9fa' : 'white',
                        borderBottom: '1px solid #e0e0e0'
                      }}
                    >
                      <td style={{ padding: '12px 15px', color: '#2c3e50' }}>
                        {formatDate(record.date)}
                      </td>
                      <td style={{ padding: '12px 15px', color: '#2c3e50' }}>
                        {displaySafeText(record.day)}
                      </td>
                      <td style={{ padding: '12px 15px', color: '#2c3e50' }}>
                        {record.period} {record.periodTime && `(${record.periodTime})`}
                      </td>
                      <td style={{ padding: '12px 15px', color: '#2c3e50' }}>
                        {displaySafeText(record.subject)}
                      </td>
                      <td style={{ padding: '12px 15px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          background: record.status === 'Absent' ? '#e74c3c' : '#f39c12',
                          color: 'white'
                        }}>
                          {getStatusDisplay(record.status)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 15px', color: '#2c3e50' }}>
                        {displaySafeText(record.reason, 'No reason provided')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#bdc3c7' }}>
              <h4>Perfect Attendance! 🎉</h4>
              <p>This student has no absent or on duty records in the database.</p>
              <p>All attendance records show the student was present.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main ACDashboard View
  return (
    <div style={{ 
      padding: '20px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Academic Coordinator Dashboard</h1>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            background: '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Back to Home
        </button>
      </div>
      
      {/* Class Selection Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '25px',
        borderRadius: '15px',
        backdropFilter: 'blur(10px)',
        marginBottom: '25px'
      }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Select Class</h2>
        
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center',
          alignItems: 'end',
          flexWrap: 'wrap'
        }}>
          {/* Department Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 'bold' }}>Department</label>
            <select 
              value={selectedDept} 
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{
                padding: '10px 15px',
                borderRadius: '8px',
                border: 'none',
                minWidth: '150px',
                fontSize: '16px'
              }}
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Year Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 'bold' }}>Year</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                padding: '10px 15px',
                borderRadius: '8px',
                border: 'none',
                minWidth: '120px',
                fontSize: '16px'
              }}
            >
              <option value="">Select Year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Section Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 'bold' }}>Section</label>
            <select 
              value={selectedSection} 
              onChange={(e) => setSelectedSection(e.target.value)}
              style={{
                padding: '10px 15px',
                borderRadius: '8px',
                border: 'none',
                minWidth: '120px',
                fontSize: '16px'
              }}
            >
              <option value="">Select Section</option>
              {sections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>

          {/* Clear Button */}
          <button 
            onClick={clearSelection}
            style={{
              padding: '10px 20px',
              background: '#7f8c8d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Clear
          </button>
        </div>

        {/* Selected Class Info */}
        {selectedDept && selectedYear && selectedSection && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '10px'
          }}>
            <h3>Selected Class: {selectedDept} - {selectedYear} Year - Section {selectedSection}</h3>
            {loading && <p>Loading student data from database...</p>}
            {error && <p style={{ color: '#e74c3c', fontWeight: 'bold' }}>{error}</p>}
            <div style={{ marginTop: '10px' }}>
              {getStatusMessage('students')}
              {studentsWithAttendance.length > 0 && ` (${studentsWithAttendance.length} students with attendance data)`}
            </div>
          </div>
        )}
      </div>

      {/* Class Statistics */}
      {selectedDept && selectedYear && selectedSection && stats && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '25px',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)',
          marginBottom: '25px'
        }}>
          <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>
            Class Statistics - {selectedDept} {selectedYear} {selectedSection}
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '15px',
            textAlign: 'center'
          }}>
            <div style={{ background: 'rgba(52, 152, 219, 0.3)', padding: '15px', borderRadius: '10px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Total Students</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalStudents}</div>
              <div style={{ fontSize: '12px', opacity: '0.8' }}>Students</div>
            </div>
            
            <div style={{ background: 'rgba(46, 204, 113, 0.3)', padding: '15px', borderRadius: '10px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Average Attendance</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.averageAttendance}%</div>
              <div style={{ fontSize: '12px', opacity: '0.8' }}>Class Average</div>
            </div>
            
            <div style={{ background: 'rgba(243, 156, 18, 0.3)', padding: '15px', borderRadius: '10px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Low Attendance</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.lowAttendanceCount}</div>
              <div style={{ fontSize: '12px', opacity: '0.8' }}>&lt; 75%</div>
            </div>
            
            <div style={{ background: 'rgba(231, 76, 60, 0.3)', padding: '15px', borderRadius: '10px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Very Low</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.veryLowAttendanceCount}</div>
              <div style={{ fontSize: '12px', opacity: '0.8' }}>&lt; 60%</div>
            </div>
            
            <div style={{ background: 'rgba(39, 174, 96, 0.3)', padding: '15px', borderRadius: '10px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Good Attendance</h4>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.goodAttendanceCount}</div>
              <div style={{ fontSize: '12px', opacity: '0.8' }}>≥ 75%</div>
            </div>
          </div>
        </div>
      )}

      {/* Students List */}
      {selectedDept && selectedYear && selectedSection && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '25px',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>
            Students List - {selectedDept} {selectedYear} {selectedSection}
            {studentsWithAttendance.length > 0 && ` (${studentsWithAttendance.length} students)`}
          </h3>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Loading students and attendance data from database...</p>
            </div>
          ) : studentsWithAttendance.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                background: 'white',
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <thead>
                  <tr style={{ background: '#34495e' }}>
                    <th style={{ padding: '15px', textAlign: 'left', color: 'white' }}>Reg No</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: 'white' }}>Name</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: 'white' }}>Department</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: 'white' }}>Year</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: 'white' }}>Section</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: 'white' }}>Attendance %</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: 'white' }}>Proctor</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: 'white' }}>AC Staff</th>
                    <th style={{ padding: '15px', textAlign: 'left', color: 'white' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsWithAttendance.map((student, index) => (
                    <tr 
                      key={student._id}
                      style={{ 
                        background: index % 2 === 0 ? '#f8f9fa' : 'white',
                        borderBottom: '1px solid #e0e0e0',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleStudentClick(student)}
                    >
                      <td style={{ padding: '12px 15px', color: '#2c3e50', fontWeight: 'bold' }}>
                        {displaySafeText(student.regNo)}
                      </td>
                      <td style={{ padding: '12px 15px', color: '#2c3e50', fontWeight: 'bold' }}>
                        {displaySafeText(student.name)}
                      </td>
                      <td style={{ padding: '12px 15px', color: '#2c3e50' }}>
                        {displaySafeText(student.department)}
                      </td>
                      <td style={{ padding: '12px 15px', color: '#2c3e50' }}>
                        {displaySafeText(student.year)}
                      </td>
                      <td style={{ padding: '12px 15px', color: '#2c3e50' }}>
                        {displaySafeText(student.section)}
                      </td>
                      <td style={{ padding: '12px 15px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          background: student.attendancePercentage >= 75 ? '#27ae60' : 
                                     student.attendancePercentage >= 60 ? '#f39c12' : '#e74c3c',
                          color: 'white'
                        }}>
                          {student.attendancePercentage}%
                        </span>
                      </td>
                      <td style={{ padding: '12px 15px', color: '#2c3e50' }}>
                        {displaySafeText(student.proctorName)}
                      </td>
                      <td style={{ padding: '12px 15px', color: '#2c3e50' }}>
                        {displaySafeText(student.acStaffName)}
                      </td>
                      <td style={{ padding: '12px 15px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStudentClick(student);
                          }}
                          style={{
                            padding: '6px 12px',
                            background: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ textAlign: 'center', marginTop: '15px', color: '#bdc3c7' }}>
                💡 Click on any student row to view their detailed attendance records
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#bdc3c7' }}>
              <h4>No students found for {selectedDept} {selectedYear} {selectedSection}</h4>
              <p>This class might not exist or has no students assigned yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Welcome Message when no class selected */}
      {!selectedDept && !selectedYear && !selectedSection && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '40px',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)',
          textAlign: 'center'
        }}>
          <h2>Welcome to Academic Coordinator Dashboard</h2>
          <p style={{ fontSize: '18px', marginTop: '15px' }}>
            Select a class from the dropdowns above to view student details and REAL attendance records from database.
          </p>
          <div style={{ marginTop: '30px', textAlign: 'left', display: 'inline-block' }}>
            <h3>Real Data Features:</h3>
            <ul style={{ textAlign: 'left' }}>
              <li>✅ Real student data from MongoDB</li>
              <li>✅ Real attendance records from database</li>
              <li>✅ Actual attendance percentages calculated from real data</li>
              <li>✅ Real absent/OD records with dates and reasons</li>
              <li>✅ Real class statistics from actual attendance data</li>
              <li>✅ View both Proctor and AC Staff information</li>
              <li>✅ Live data - no fake/mock data</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { departments, years, sections, students } from "../data";
import Navbar from "../components/Navbar";
import "./StaffDashboard.css";

// Photo resolver function
const getStudentPhoto = (photoPath) => {
  if (!photoPath) return 'https://via.placeholder.com/100?text=No+Photo';
  
  try {
    // If it's a local asset path starting with /assets/
    if (photoPath.startsWith('/assets/')) {
      const fileName = photoPath.replace('/assets/', '');
      // Try to require the image from assets
      try {
        return require(`../assets/${fileName}`);
      } catch (error) {
        console.log(`Image not found: ${fileName}`);
        return 'https://via.placeholder.com/100?text=No+Photo';
      }
    }
    // If it's a full URL or data URL
    else if (photoPath.startsWith('http') || photoPath.startsWith('data:')) {
      return photoPath;
    }
    // If it's already a required image (from data.js)
    else if (typeof photoPath === 'string' && photoPath.includes('static')) {
      return photoPath;
    }
    // Default placeholder
    else {
      return 'https://via.placeholder.com/100?text=No+Photo';
    }
  } catch (error) {
    console.log('Error loading photo:', photoPath, error);
    return 'https://via.placeholder.com/100?text=No+Photo';
  }
};

// Excel export functionality built-in
const exportAttendanceToExcel = (attendanceRecords, students) => {
  if (!attendanceRecords || attendanceRecords.length === 0) {
    alert('No attendance records to export.');
    return;
  }

  try {
    // Create CSV content
    let csvContent = "Date,Day,Period,Period Time,Subject,Staff,Department,Year,Section,Total Students,Present Count,Absent Count,OD Count,Present Students,Absent Students,OD Students,Is Saturday,Saturday Timetable\n";
    
    attendanceRecords.forEach(record => {
      const presentStudents = record.present.map(id => {
        const student = students.find(s => s.id === id);
        return student ? `${student.reg} - ${student.name}` : 'Unknown';
      }).join('; ');

      const absentStudents = record.absent.map(id => {
        const student = students.find(s => s.id === id);
        return student ? `${student.reg} - ${student.name}` : 'Unknown';
      }).join('; ');

      const odStudents = record.od.map(id => {
        const student = students.find(s => s.id === id);
        return student ? `${student.reg} - ${student.name}` : 'Unknown';
      }).join('; ');

      const row = [
        record.date,
        record.day,
        `Period ${record.period}`,
        record.periodTime || '',
        record.subject || '',
        record.staff || '',
        record.dept,
        record.year,
        record.section,
        record.present.length + record.absent.length + record.od.length,
        record.present.length,
        record.absent.length,
        record.od.length,
        presentStudents,
        absentStudents,
        odStudents,
        record.isSaturday ? 'Yes' : 'No',
        record.saturdayTimetableType || 'N/A'
      ].map(field => `"${field}"`).join(',');
      
      csvContent += row + '\n';
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const currentDate = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_records_${currentDate}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Attendance data exported successfully');
  } catch (error) {
    console.error('Error exporting attendance data:', error);
    alert('Error exporting data. Please try again.');
  }
};

// ✅ NEW: Export only absent and OD students for current session
const exportAbsentODToExcel = (attendanceRecord, students) => {
  if (!attendanceRecord || !students || students.length === 0) {
    alert('No attendance data to export.');
    return;
  }

  try {
    // Filter only absent and OD students
    const absentODStudents = students.filter(student => {
      const studentId = student._id || student.id;
      return attendanceRecord.absent.includes(studentId) || 
             attendanceRecord.od.includes(studentId);
    });

    if (absentODStudents.length === 0) {
      alert('No absent or On Duty students found for this session.');
      return;
    }

    // Create CSV content for absent/OD students only
    let csvContent = "Date,Day,Period,Subject,Staff,Department,Year,Section,Student Reg No,Student Name,Status,Reason\n";
    
    absentODStudents.forEach(student => {
      const studentId = student._id || student.id;
      const status = attendanceRecord.absent.includes(studentId) ? "Absent" : "On Duty";
      const reason = attendanceRecord.reasons[studentId] || "No reason provided";
      
      const row = [
        attendanceRecord.date,
        attendanceRecord.day,
        `Period ${attendanceRecord.period}`,
        attendanceRecord.subject || '',
        attendanceRecord.staff || '',
        attendanceRecord.dept,
        attendanceRecord.year,
        attendanceRecord.section,
        student.regNo || student.reg,
        student.name,
        status,
        reason
      ].map(field => `"${field}"`).join(',');
      
      csvContent += row + '\n';
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const currentDate = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `absent_od_students_${currentDate}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Absent/OD students data exported successfully');
  } catch (error) {
    console.error('Error exporting absent/OD data:', error);
    alert('Error exporting data. Please try again.');
  }
};

// ✅ NEW: Export all absent and OD students from entire database
const exportAllAbsentODToExcel = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // Fetch all attendance records from backend
    const response = await fetch('http://localhost:4000/api/attendance/debug', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch attendance data');
    }

    const data = await response.json();
    
    if (!data.sampleRecords || data.sampleRecords.length === 0) {
      alert('No attendance records found in database.');
      return;
    }

    // Create CSV content for all absent/OD students
    let csvContent = "Date,Day,Period,Subject,Staff,Department,Year,Section,Student Reg No,Student Name,Status,Reason\n";
    
    let recordCount = 0;
    
    // Process each attendance record
    for (const record of data.sampleRecords) {
      // Get absent students
      if (record.absent && record.absent.length > 0) {
        for (const student of record.absent) {
          const row = [
            record.date ? new Date(record.date).toISOString().slice(0, 10) : 'N/A',
            record.day || 'N/A',
            `Period ${record.period}`,
            record.subject || 'N/A',
            record.staff || 'N/A',
            record.department || 'N/A',
            record.year || 'N/A',
            record.section || 'N/A',
            student.regNo || 'N/A',
            student.name || 'N/A',
            'Absent',
            'No reason provided' // You might need to enhance this to get reasons from your data structure
          ].map(field => `"${field}"`).join(',');
          
          csvContent += row + '\n';
          recordCount++;
        }
      }
      
      // Get OD students
      if (record.od && record.od.length > 0) {
        for (const student of record.od) {
          const row = [
            record.date ? new Date(record.date).toISOString().slice(0, 10) : 'N/A',
            record.day || 'N/A',
            `Period ${record.period}`,
            record.subject || 'N/A',
            record.staff || 'N/A',
            record.department || 'N/A',
            record.year || 'N/A',
            record.section || 'N/A',
            student.regNo || 'N/A',
            student.name || 'N/A',
            'On Duty',
            'No reason provided' // You might need to enhance this to get reasons from your data structure
          ].map(field => `"${field}"`).join(',');
          
          csvContent += row + '\n';
          recordCount++;
        }
      }
    }

    if (recordCount === 0) {
      alert('No absent or On Duty students found in the database.');
      return;
    }

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const currentDate = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `all_absent_od_students_${currentDate}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`All absent/OD students data exported successfully (${recordCount} records)`);
  } catch (error) {
    console.error('Error exporting all absent/OD data:', error);
    alert('Error exporting data from database. Please try again.');
  }
};

// FIXED: Timetable fetching function
const fetchTimetableFromBackend = async (department, year, section) => {
  try {
    const token = localStorage.getItem('token');
    console.log('🔍 Fetching timetable for:', { department, year, section });
    
    const response = await fetch(`http://localhost:4000/api/timetables/class?department=${department}&year=${year}&section=${section}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      console.log('✅ Timetable loaded from backend:', data.data.name);
      return data.data;
    } else {
      console.warn('❌ No timetable found in backend:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching timetable:', error);
    return null;
  }
};

// FIXED: Timetable matching function
const getTimetableForClass = async (dept, year, section) => {
  console.log('🔍 Looking for timetable from database:', { dept, year, section });
  
  try {
    const timetable = await fetchTimetableFromBackend(dept, year, section);
    
    if (timetable) {
      console.log('✅ Timetable found in database:', timetable.name);
      return timetable;
    }
    
    console.log('❌ No timetable found in database');
    return null;
  } catch (error) {
    console.error('Error fetching timetable:', error);
    return null;
  }
};

// Dynamic Saturday timetables based on database timetable
const getSaturdayTimetables = (timetable) => {
  if (!timetable) return {};
  
  return {
    'SAT_MON': {
      name: 'Saturday - Monday Timetable',
      schedule: timetable.schedule?.find(s => s.day === 'MON')?.periods || {}
    },
    'SAT_TUE': {
      name: 'Saturday - Tuesday Timetable', 
      schedule: timetable.schedule?.find(s => s.day === 'TUE')?.periods || {}
    }
  };
};

// Function to submit attendance to backend
const submitAttendanceToBackend = async (attendanceData) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch('http://localhost:4000/api/attendance/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(attendanceData)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Attendance saved to MongoDB:', data.data);
      return true;
    } else {
      console.error('❌ Failed to save attendance:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Error saving attendance:', error);
    return false;
  }
};

// Function to get day from date
const getDayFromDate = (dateString) => {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const date = new Date(dateString);
  return days[date.getDay()];
};

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [dept, setDept] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [marked, setMarked] = useState({});
  const [reasons, setReasons] = useState({});
  const [submitted, setSubmitted] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [showTimetable, setShowTimetable] = useState(false);
  const [isSaturday, setIsSaturday] = useState(false);
  const [selectedSaturdayTimetable, setSelectedSaturdayTimetable] = useState("");
  const [currentTimetable, setCurrentTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timetableLoading, setTimetableLoading] = useState(false);
  
  // New state for viewing attendance
  const [showViewAttendance, setShowViewAttendance] = useState(false);
  const [viewDept, setViewDept] = useState("");
  const [viewYear, setViewYear] = useState("");
  const [viewSection, setViewSection] = useState("");
  const [viewDate, setViewDate] = useState("");
  const [viewTimetable, setViewTimetable] = useState(null);
  const [classAttendance, setClassAttendance] = useState([]);
  const [selectedViewPeriod, setSelectedViewPeriod] = useState("");
  const [viewStudents, setViewStudents] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    if (!u || u.role !== "staff") navigate("/staff/login");
    
    // Load attendance records from localStorage for immediate display
    const records = JSON.parse(localStorage.getItem("attendanceRecords") || "[]");
    setAttendanceRecords(records);
    
    // Check if today is Saturday
    const today = new Date().getDay();
    setIsSaturday(today === 6);
  }, [navigate]);

  // NEW: Function to mark all students as present
  const markAllPresent = () => {
    if (filtered.length === 0) {
      alert("No students loaded to mark attendance.");
      return;
    }

    if (!selectedDay || !selectedPeriod) {
      alert("Please select day and period first.");
      return;
    }

    // Confirm with user
    const confirmMarkAll = window.confirm(
      `Are you sure you want to mark ALL ${filtered.length} students as PRESENT for ${selectedDay} Period ${selectedPeriod}?`
    );

    if (!confirmMarkAll) return;

    // Create new marked state with all students as present
    const newMarked = {};
    filtered.forEach(student => {
      newMarked[student._id || student.id] = "P";
    });

    // Clear all reasons since everyone is present
    setMarked(newMarked);
    setReasons({});

    alert(`✅ All ${filtered.length} students marked as PRESENT!`);
  };

  // NEW: Function to mark all students as absent
  const markAllAbsent = () => {
    if (filtered.length === 0) {
      alert("No students loaded to mark attendance.");
      return;
    }

    if (!selectedDay || !selectedPeriod) {
      alert("Please select day and period first.");
      return;
    }

    // Confirm with user
    const confirmMarkAll = window.confirm(
      `Are you sure you want to mark ALL ${filtered.length} students as ABSENT for ${selectedDay} Period ${selectedPeriod}?\n\nYou will need to provide reasons for each student.`
    );

    if (!confirmMarkAll) return;

    // Create new marked state with all students as absent
    const newMarked = {};
    const newReasons = {};
    
    filtered.forEach(student => {
      newMarked[student._id || student.id] = "A";
      newReasons[student._id || student.id] = "Bulk absent marking"; // Default reason
    });

    setMarked(newMarked);
    setReasons(newReasons);

    alert(`❌ All ${filtered.length} students marked as ABSENT!\nPlease update reasons if needed.`);
  };

  // NEW: Function to clear all marks
  const clearAllMarks = () => {
    const newMarked = {};
    filtered.forEach(student => {
      newMarked[student._id || student.id] = null;
    });

    setMarked(newMarked);
    setReasons({});
    
    alert("🧹 All attendance marks cleared!");
  };

  // ✅ FIXED: Load class students with correct API endpoint
  const loadClassStudents = async (department, year, section) => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Loading students for:', { department, year, section });
      
      // ✅ FIXED: Use correct endpoint /api/students instead of /api/students/class
      const response = await fetch(`http://localhost:4000/api/students?department=${department}&year=${year}&section=${section}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Students API response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 Students API response data:', data);
      
      if (data.success && data.data) {
        console.log('✅ Students loaded from backend:', data.data.length);
        
        // ✅ DEBUG: Check student data structure
        console.log('Sample student data:', data.data.slice(0, 3));
        
        // Sort students by registration number
        const sortedStudents = data.data.sort((a, b) => {
          const regA = a.regNo || a.reg;
          const regB = b.regNo || b.reg;
          return regA.toUpperCase().localeCompare(regB.toUpperCase());
        });
        
        setFiltered(sortedStudents);
        
        // ✅ FIXED: Initialize attendance marks - use _id instead of id
        const init = {};
        sortedStudents.forEach((s) => (init[s._id || s.id] = null));
        setMarked(init);
        setReasons({});
        setSubmitted(null);
      } else {
        console.warn('❌ No students found in backend:', data.message);
        setFiltered([]);
      }
    } catch (error) {
      console.error('❌ Error loading students from backend:', error);
      setFiltered([]);
    }
  };

  // Update timetable when department, year, or section changes
  useEffect(() => {
    const loadTimetable = async () => {
      if (dept && year && section) {
        setTimetableLoading(true);
        const timetable = await getTimetableForClass(dept, year, section);
        
        if (timetable) {
          setCurrentTimetable(timetable);
          console.log(`✅ Loaded timetable from DB: ${timetable.name}`);
        } else {
          setCurrentTimetable(null);
          console.warn(`❌ No timetable found in DB for ${dept} ${year} ${section}`);
        }
        
        // Load students from backend
        await loadClassStudents(dept, year, section);
        
        // Reset selections
        setSelectedDay("");
        setSelectedPeriod("");
        setSelectedSaturdayTimetable("");
        setTimetableLoading(false);
      }
    };

    loadTimetable();
  }, [dept, year, section]);

  // ✅ FIXED: Function to load class attendance for viewing
  const loadClassAttendance = async (department, year, section, date) => {
    try {
      setViewLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Loading attendance for:', { department, year, section, date });

      // First, load students for the selected class
      let studentsList = [];
      try {
        // ✅ FIXED: Use correct endpoint
        const studentsResponse = await fetch(`http://localhost:4000/api/students?department=${department}&year=${year}&section=${section}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const studentsData = await studentsResponse.json();
        
        if (studentsData.success) {
          studentsList = studentsData.data;
          console.log('Loaded students from backend:', studentsList.length);
        } else {
          console.warn('No students found in backend');
          studentsList = [];
        }
      } catch (studentError) {
        console.error('Error loading students:', studentError);
        studentsList = [];
      }

      setViewStudents(studentsList);

      // Then load attendance records
      const attendanceResponse = await fetch(`http://localhost:4000/api/attendance/class?department=${department}&year=${year}&section=${section}&date=${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const attendanceData = await attendanceResponse.json();
      
      console.log('Attendance data response:', attendanceData);
      
      if (attendanceData.success) {
        setClassAttendance(attendanceData.data);
        console.log('Loaded attendance records:', attendanceData.data.length);
        
        // Load timetable for the selected class from database
        const timetable = await getTimetableForClass(department, year, section);
        setViewTimetable(timetable);
        
        if (attendanceData.data.length === 0) {
          alert('No attendance records found for the selected date.');
        }
      } else {
        setClassAttendance([]);
        alert('No attendance records found for the selected criteria.');
      }
    } catch (error) {
      console.error('Error loading class attendance:', error);
      setClassAttendance([]);
      setViewStudents([]);
      alert('Error loading attendance records. Please check your connection.');
    } finally {
      setViewLoading(false);
    }
  };

  const markAttendance = (id, status) => {
    setMarked((prev) => ({ ...prev, [id]: status }));
    if (status === "P") {
      setReasons((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const handleReasonChange = (id, value) => {
    setReasons((prev) => ({ ...prev, [id]: value }));
  };

  const getCurrentPeriod = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const periodTimes = [
      { start: 9*60+15, end: 10*60+5, period: 1 },
      { start: 10*60+5, end: 10*60+55, period: 2 },
      { start: 11*60+10, end: 12*60+0, period: 3 },
      { start: 12*60+0, end: 12*60+50, period: 4 },
      { start: 13*60+45, end: 14*60+35, period: 5 },
      { start: 14*60+35, end: 15*60+25, period: 6 },
      { start: 15*60+40, end: 16*60+30, period: 7 }
    ];
    
    const currentPeriod = periodTimes.find(p => currentTime >= p.start && currentTime <= p.end);
    return currentPeriod ? currentPeriod.period : null;
  };

  // FIXED: Get current timetable schedule based on day selection
  const getCurrentSchedule = () => {
    const satTimetables = getSaturdayTimetables(currentTimetable);
    
    if (selectedDay === 'SAT' && selectedSaturdayTimetable) {
      const satSchedule = satTimetables[selectedSaturdayTimetable]?.schedule || [];
      // Convert array to object with period numbers as keys
      return satSchedule.reduce((acc, period) => {
        acc[period.number] = {
          subject: period.subject,
          staff: period.staff,
          courseCode: period.courseCode
        };
        return acc;
      }, {});
    } else if (currentTimetable && currentTimetable.days?.includes(selectedDay)) {
      // Handle database timetable structure
      if (currentTimetable.schedule && Array.isArray(currentTimetable.schedule)) {
        // Find the day schedule from array
        const daySchedule = currentTimetable.schedule.find(s => s.day === selectedDay);
        return daySchedule?.periods?.reduce((acc, period) => {
          acc[period.number] = {
            subject: period.subject,
            staff: period.staff,
            courseCode: period.courseCode
          };
          return acc;
        }, {}) || {};
      } else {
        // Fallback to object structure
        return currentTimetable.schedule?.[selectedDay] || {};
      }
    }
    return {};
  };

  // FIXED: Get period time from timetable
  const getPeriodTime = (periodNumber) => {
    if (!currentTimetable || !currentTimetable.periods) return '';
    const period = currentTimetable.periods.find(p => p.number === periodNumber);
    return period ? period.time : '';
  };

  // ✅ FIXED: Handle submit with proper student IDs
  const handleSubmit = async () => {
    if (!selectedPeriod || !selectedDay) {
      alert("Please select day and period from the timetable.");
      return;
    }

    if (selectedDay === 'SAT' && !selectedSaturdayTimetable) {
      alert("Please select which Saturday timetable to use.");
      return;
    }

    for (const id in marked) {
      if ((marked[id] === "A" || marked[id] === "OD") && !reasons[id]) {
        const student = filtered.find((s) => (s._id || s.id) === id);
        alert(`Reason required for ${student?.name}`);
        return;
      }
    }

    setLoading(true);

    const presentList = Object.entries(marked)
      .filter(([_, status]) => status === "P")
      .map(([id]) => id);
    const absentList = Object.entries(marked)
      .filter(([_, status]) => status === "A")
      .map(([id]) => id);
    const odList = Object.entries(marked)
      .filter(([_, status]) => status === "OD")
      .map(([id]) => id);

    const currentSchedule = getCurrentSchedule();
    const periodInfo = currentSchedule[selectedPeriod] || {};
    
    const newRecord = {
      date: new Date().toISOString().slice(0, 10),
      day: selectedDay,
      period: parseInt(selectedPeriod),
      periodTime: getPeriodTime(parseInt(selectedPeriod)),
      subject: periodInfo.subject,
      staff: periodInfo.staff,
      dept,
      year, 
      section,
      present: presentList,
      absent: absentList,
      od: odList,
      reasons,
      isSaturday: selectedDay === 'SAT',
      saturdayTimetableType: selectedDay === 'SAT' ? selectedSaturdayTimetable : null
    };

    console.log('📝 Submitting attendance:', newRecord);

    // Save to MongoDB
    const savedToBackend = await submitAttendanceToBackend(newRecord);
    
    if (savedToBackend) {
      // Also save to localStorage for immediate frontend update
      const all = JSON.parse(localStorage.getItem("attendanceRecords") || "[]");
      const updatedRecords = [...all, newRecord];
      localStorage.setItem("attendanceRecords", JSON.stringify(updatedRecords));
      setAttendanceRecords(updatedRecords);

      setSubmitted({
        total: filtered.length,
        present: presentList.length,
        absent: absentList.length,
        od: odList.length,
        presentList,
        absentList,
        odList,
        reasons,
        record: newRecord
      });

      alert("✅ Attendance submitted and saved to database!");
    } else {
      alert("❌ Failed to save attendance. Please try again.");
    }

    setLoading(false);
  };

  const handleDownload = () => {
    exportAttendanceToExcel(attendanceRecords, students);
  };

  const autoFillCurrentPeriod = () => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const today = days[new Date().getDay()];
    const currentPeriod = getCurrentPeriod();
    
    if (currentPeriod && currentTimetable) {
      if (today === 'SAT') {
        setSelectedDay('SAT');
        alert("Today is Saturday. Please select which timetable to use from the Saturday Timetable dropdown.");
      } else if (currentTimetable.days?.includes(today)) {
        setSelectedDay(today);
        setSelectedPeriod(currentPeriod.toString());
        alert(`Auto-filled: ${today} Period ${currentPeriod}`);
      } else {
        alert("No class scheduled for current time or day.");
      }
    } else {
      alert("No class scheduled for current time or timetable not loaded.");
    }
  };

  // Get all available days including Saturday
  const getAllDays = () => {
    return currentTimetable ? [...currentTimetable.days, 'SAT'] : [];
  };

  // Function to handle viewing attendance
  const handleViewAttendance = () => {
    if (!viewDept || !viewYear || !viewSection || !viewDate) {
      alert("Please select department, year, section, and date.");
      return;
    }
    loadClassAttendance(viewDept, viewYear, viewSection, viewDate);
  };

  // Function to get attendance for selected period
  const getAttendanceForPeriod = (period) => {
    return classAttendance.find(att => att.period === period);
  };

  // Function to get student status
  const getStudentStatus = (attendance, studentId) => {
    if (!attendance) return "Not Marked";
    
    // Convert studentId to string for comparison
    const studentIdStr = studentId.toString();
    
    // Handle present array
    const presentArray = Array.isArray(attendance.present) ? attendance.present : [];
    const absentArray = Array.isArray(attendance.absent) ? attendance.absent : [];
    const odArray = Array.isArray(attendance.od) ? attendance.od : [];
    
    if (presentArray.some(id => id.toString() === studentIdStr)) return "Present";
    if (absentArray.some(id => id.toString() === studentIdStr)) return "Absent";
    if (odArray.some(id => id.toString() === studentIdStr)) return "On Duty";
    
    return "Not Marked";
  };

  // Function to get student reason
  const getStudentReason = (attendance, studentId) => {
    if (!attendance || !attendance.reasons) return "";
    
    const studentIdStr = studentId.toString();
    
    // Handle Map format
    if (attendance.reasons instanceof Map) {
      return attendance.reasons.get(studentIdStr) || "";
    }
    // Handle object format
    else if (typeof attendance.reasons === 'object' && attendance.reasons !== null) {
      return attendance.reasons[studentIdStr] || "";
    }
    
    return "";
  };

  return (
    <div className="staff-dashboard-container">
      <Navbar title="Staff Dashboard" />

      {/* Header with buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2>Staff Dashboard</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="download-btn"
            onClick={handleDownload}
            disabled={attendanceRecords.length === 0}
          >
            📥 Download Excel Report
          </button>
          <button 
            className="view-attendance-btn"
            onClick={() => setShowViewAttendance(!showViewAttendance)}
            style={{
              padding: '10px 20px',
              background: '#f5b041',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {showViewAttendance ? '📋 Hide Attendance View' : '📋 View Class Attendance'}
          </button>
        </div>
      </div>

      {/* View Attendance Section */}
      {showViewAttendance && (
        <div className="view-attendance-section" style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '2px solid #f5b041'
        }}>
          <h3 style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>View Class Attendance</h3>
          
          <div className="view-filters" style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'end' }}>
            <div className="selection-group">
              <label style={{ color: 'white', fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Department</label>
              <select 
                value={viewDept} 
                onChange={(e) => setViewDept(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '5px',
                  border: 'none',
                  minWidth: '150px'
                }}
              >
                <option value="">--Select--</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="selection-group">
              <label style={{ color: 'white', fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Year</label>
              <select 
                value={viewYear} 
                onChange={(e) => setViewYear(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '5px',
                  border: 'none',
                  minWidth: '120px'
                }}
              >
                <option value="">--Select--</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="selection-group">
              <label style={{ color: 'white', fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Section</label>
              <select 
                value={viewSection} 
                onChange={(e) => setViewSection(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '5px',
                  border: 'none',
                  minWidth: '120px'
                }}
              >
                <option value="">--Select--</option>
                {sections.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="selection-group">
              <label style={{ color: 'white', fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>Date</label>
              <input 
                type="date" 
                value={viewDate} 
                onChange={(e) => setViewDate(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '5px',
                  border: 'none',
                  minWidth: '150px'
                }}
              />
            </div>

            <button 
              className="search-attendance-btn"
              onClick={handleViewAttendance}
              disabled={viewLoading}
              style={{
                padding: '8px 20px',
                background: '#14b1e0',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                alignSelf: 'flex-end',
                opacity: viewLoading ? 0.6 : 1
              }}
            >
              {viewLoading ? 'Loading...' : 'Search'}
            </button>
          </div>

          {/* Debug info */}
          {selectedViewPeriod && (
            <div style={{ 
              background: 'rgba(255,255,255,0.1)', 
              padding: '10px', 
              borderRadius: '5px', 
              marginBottom: '10px',
              fontSize: '12px',
              color: 'white'
            }}>
              <strong>Debug Info:</strong><br/>
              Students Loaded: {viewStudents.length}<br/>
              Attendance Records: {classAttendance.length}<br/>
              Selected Period: {selectedViewPeriod}<br/>
              Current Attendance: {getAttendanceForPeriod(parseInt(selectedViewPeriod)) ? 'Found' : 'Not Found'}
            </div>
          )}

          {/* Timetable for selected date */}
          {viewTimetable && viewDate && (
            <div className="view-timetable-section">
              <h4 style={{ color: 'white', marginBottom: '15px' }}>
                Timetable for {getDayFromDate(viewDate)} - {viewDate}
              </h4>
              
              <div className="timetable-grid" style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
                <div className="timetable-header-row">
                  <div className="time-cell">Time/Day</div>
                  {viewTimetable.periods?.map(period => (
                    <div key={period.number} className="period-header">
                      <div>P{period.number}</div>
                      <div className="time-slot">{period.time}</div>
                    </div>
                  ))}
                </div>
                
                <div className="timetable-day-row">
                  <div className="day-header">
                    {getDayFromDate(viewDate)}
                  </div>
                  {viewTimetable.periods?.map(period => {
                    const daySchedule = viewTimetable.schedule?.find(s => s.day === getDayFromDate(viewDate))?.periods || [];
                    const periodData = daySchedule.find(p => p.number === period.number);
                    const hasClass = !!periodData;
                    const attendance = getAttendanceForPeriod(period.number);
                    
                    return (
                      <div 
                        key={period.number} 
                        className={`period-cell ${selectedViewPeriod === period.number.toString() ? 'selected-period' : ''} ${hasClass ? 'has-class' : 'no-class'} ${attendance ? 'has-attendance' : ''}`}
                        onClick={() => {
                          if (hasClass && attendance) {
                            setSelectedViewPeriod(period.number.toString());
                          }
                        }}
                        style={{
                          cursor: hasClass && attendance ? 'pointer' : 'default',
                          backgroundColor: attendance ? '#e8f5e8' : (hasClass ? '#f8f9fa' : '#f8f9fa'),
                          border: attendance ? '2px solid #14e066' : '1px solid #e0e0e0'
                        }}
                      >
                        {hasClass ? (
                          <>
                            <div className="subject">{periodData.subject}</div>
                            <div className="staff-short">{periodData.staff?.split(' ')[0] || 'Staff'}</div>
                            {attendance && <div style={{ fontSize: '0.7em', color: 'green', marginTop: '2px', fontWeight: 'bold' }}>✓ Marked</div>}
                          </>
                        ) : (
                          <div className="no-class-text">-</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Attendance Details for Selected Period */}
          {selectedViewPeriod && viewStudents.length > 0 && (
            <div className="attendance-details" style={{ marginTop: '20px' }}>
              <h4 style={{ color: 'white', marginBottom: '15px' }}>
                Attendance Details - Period {selectedViewPeriod} ({viewDate})
              </h4>
              
              {(() => {
                const attendance = getAttendanceForPeriod(parseInt(selectedViewPeriod));
                if (!attendance) return <p style={{ color: 'white' }}>No attendance data for this period.</p>;
                
                return (
                  <table className="staff-table">
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Reg No</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewStudents.map((student) => (
                        <tr
                          key={student._id || student.id}
                          className={
                            getStudentStatus(attendance, student._id || student.id) === "Present" ? "present-row" :
                            getStudentStatus(attendance, student._id || student.id) === "Absent" ? "absent-row" :
                            getStudentStatus(attendance, student._id || student.id) === "On Duty" ? "od-row" : ""
                          }
                        >
                          <td>
                            <img 
                              src={getStudentPhoto(student.photo)} 
                              alt={student.name} 
                              className="student-photo" 
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/100?text=No+Photo';
                              }}
                            />
                          </td>
                          <td>{student.regNo || student.reg}</td>
                          <td>{student.name}</td>
                          <td>
                            <span className={
                              getStudentStatus(attendance, student._id || student.id) === "Present" ? "present-status" :
                              getStudentStatus(attendance, student._id || student.id) === "Absent" ? "absent-status" :
                              getStudentStatus(attendance, student._id || student.id) === "On Duty" ? "od-status" : ""
                            }>
                              {getStudentStatus(attendance, student._id || student.id)}
                            </span>
                          </td>
                          <td>{getStudentReason(attendance, student._id || student.id)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Mark Attendance Section */}
      <div className="mark-attendance-section">
        <h3 style={{ color: 'white', marginBottom: '20px', borderBottom: '2px solid #14b1e0', paddingBottom: '10px' }}>Mark Attendance</h3>

        {/* Department Filters */}
        <div className="staff-filters">
          <label>Department</label>
          <select value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">--Select--</option>
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <label>Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">--Select--</option>
            {years.map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>

          <label>Section</label>
          <select value={section} onChange={(e) => setSection(e.target.value)}>
            <option value="">--Select--</option>
            {sections.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Enhanced Debug Info */}
        {dept && year && section && (
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            padding: '10px', 
            borderRadius: '5px', 
            marginBottom: '10px',
            fontSize: '12px',
            color: 'white'
          }}>
            <strong>Debug Info:</strong><br/>
            Dept: {dept}, Year: {year}, Section: {section}<br/>
            Timetable: {currentTimetable ? currentTimetable.name : 'Not Found'}<br/>
            Students Loaded: {filtered.length}<br/>
            Student Sections: {[...new Set(filtered.map(s => s.section))].join(', ')}<br/>
            Sample Students: {filtered.slice(0, 3).map(s => s.regNo || s.reg).join(', ')}
          </div>
        )}

        {/* Timetable Section - Only show when class is selected */}
        {currentTimetable ? (
          <div className="timetable-section">
            <div className="timetable-header">
              <h3>{currentTimetable.name} Timetable</h3>
              {timetableLoading && <span className="loading-text">Loading timetable...</span>}
              <button 
                className="timetable-toggle-btn"
                onClick={() => setShowTimetable(!showTimetable)}
              >
                {showTimetable ? '▲ Hide Timetable' : '▼ Show Timetable'}
              </button>
            </div>

            {showTimetable && (
              <div className="timetable-container">
                {/* Period Selection */}
                <div className="period-selection">
                  <div className="selection-group">
                    <label>Select Day:</label>
                    <select 
                      value={selectedDay} 
                      onChange={(e) => {
                        setSelectedDay(e.target.value);
                        setSelectedPeriod("");
                        if (e.target.value !== 'SAT') {
                          setSelectedSaturdayTimetable("");
                        }
                      }}
                    >
                      <option value="">-- Select Day --</option>
                      {getAllDays().map(day => (
                        <option key={day} value={day}>
                          {day} {day === 'SAT' ? '(Special Working Day)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Saturday Timetable Selection */}
                  {selectedDay === 'SAT' && (
                    <div className="selection-group">
                      <label>Saturday Timetable:</label>
                      <select 
                        value={selectedSaturdayTimetable} 
                        onChange={(e) => setSelectedSaturdayTimetable(e.target.value)}
                      >
                        <option value="">-- Select Saturday Timetable --</option>
                        {(() => {
                          const satTimetables = getSaturdayTimetables(currentTimetable);
                          return Object.entries(satTimetables).map(([key, timetable]) => (
                            <option key={key} value={key}>
                              {timetable.name}
                            </option>
                          ));
                        })()}
                      </select>
                    </div>
                  )}

                  <div className="selection-group">
                    <label>Select Period:</label>
                    <select 
                      value={selectedPeriod} 
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      disabled={selectedDay === 'SAT' && !selectedSaturdayTimetable}
                    >
                      <option value="">-- Select Period --</option>
                      {selectedDay && Object.keys(getCurrentSchedule()).length > 0 ? (
                        Object.entries(getCurrentSchedule()).map(([period, data]) => (
                          <option key={period} value={period}>
                            Period {period} ({getPeriodTime(parseInt(period))}) - {data.subject}
                          </option>
                        ))
                      ) : (
                        <option value="">
                          {selectedDay === 'SAT' && !selectedSaturdayTimetable 
                            ? "Select Saturday timetable first" 
                            : "No classes scheduled for this day"}
                        </option>
                      )}
                    </select>
                  </div>

                  <button 
                    className="auto-fill-btn"
                    onClick={autoFillCurrentPeriod}
                  >
                    ⏰ Auto-fill Current Period
                  </button>
                </div>

                {/* Selected Period Info */}
                {selectedDay && selectedPeriod && getCurrentSchedule()[selectedPeriod] && (
                  <div className="period-info">
                    <h4>Selected Class:</h4>
                    <p><strong>Day:</strong> {selectedDay} {selectedDay === 'SAT' ? `(${getSaturdayTimetables(currentTimetable)[selectedSaturdayTimetable]?.name})` : ''}</p>
                    <p><strong>Period:</strong> {selectedPeriod} ({getPeriodTime(parseInt(selectedPeriod))})</p>
                    <p><strong>Subject:</strong> {getCurrentSchedule()[selectedPeriod].subject}</p>
                    <p><strong>Staff:</strong> {getCurrentSchedule()[selectedPeriod].staff}</p>
                  </div>
                )}

                {/* Full Timetable View */}
                <div className="full-timetable">
                  <h4>
                    {selectedDay === 'SAT' && selectedSaturdayTimetable 
                      ? `${getSaturdayTimetables(currentTimetable)[selectedSaturdayTimetable]?.name}`
                      : 'Regular Weekday Timetable'
                    }
                  </h4>
                  
                  {selectedDay === 'SAT' && !selectedSaturdayTimetable ? (
                    <div className="saturday-selection-prompt">
                      <p>Please select a Saturday timetable from the dropdown above to view the schedule.</p>
                    </div>
                  ) : (
                    <div className="timetable-grid">
                      <div className="timetable-header-row">
                        <div className="time-cell">Time/Day</div>
                        {currentTimetable.periods?.map(period => (
                          <div key={period.number} className="period-header">
                            <div>P{period.number}</div>
                            <div className="time-slot">{period.time}</div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Show timetable for the selected schedule */}
                      <div className="timetable-day-row">
                        <div className="day-header">
                          {selectedDay || 'Select Day'} 
                          {selectedDay === 'SAT' && selectedSaturdayTimetable && (
                            <div className="saturday-badge">Special</div>
                          )}
                        </div>
                        {currentTimetable.periods?.map(period => {
                          const currentSchedule = getCurrentSchedule();
                          const hasClass = currentSchedule[period.number];
                          
                          return (
                            <div 
                              key={period.number} 
                              className={`period-cell ${selectedPeriod === period.number.toString() ? 'selected-period' : ''} ${hasClass ? 'has-class' : 'no-class'}`}
                              onClick={() => {
                                if (hasClass) {
                                  setSelectedPeriod(period.number.toString());
                                }
                              }}
                            >
                              {hasClass ? (
                                <>
                                  <div className="subject">{currentSchedule[period.number].subject}</div>
                                  <div className="staff-short">{currentSchedule[period.number].staff?.split(' ')[0] || 'Staff'}</div>
                                </>
                              ) : (
                                <div className="no-class-text">-</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : dept && year && section && timetableLoading ? (
          <div className="timetable-loading">
            <p>Loading timetable from database...</p>
          </div>
        ) : dept && year && section ? (
          <div className="no-timetable-message">
            <h3>⚠ Timetable Not Available</h3>
            <p>No timetable found in database for {dept} {year} {section}.</p>
            <p>Please contact administrator to add the timetable for this class.</p>
          </div>
        ) : null}

        {/* Attendance Marking Section */}
        {filtered.length > 0 && selectedDay && selectedPeriod && (
          <>
            <div className="attendance-header">
              <h3>Mark Attendance - {selectedDay} Period {selectedPeriod}</h3>
              {getCurrentSchedule()[selectedPeriod] && (
                <p className="class-info">
                  <strong>Subject:</strong> {getCurrentSchedule()[selectedPeriod].subject} | 
                  <strong> Staff:</strong> {getCurrentSchedule()[selectedPeriod].staff}
                  {selectedDay === 'SAT' && (
                    <span> | <strong>Timetable:</strong> {getSaturdayTimetables(currentTimetable)[selectedSaturdayTimetable]?.name}</span>
                  )}
                </p>
              )}
              
              {/* NEW: Bulk Action Buttons */}
              <div className="bulk-action-buttons" style={{ 
                display: 'flex', 
                gap: '10px', 
                marginTop: '15px',
                flexWrap: 'wrap'
              }}>
                <button
                  className="bulk-present-btn"
                  onClick={markAllPresent}
                  style={{
                    padding: '8px 16px',
                    background: '#14e066',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  ✅ Mark All Present
                </button>
                
                <button
                  className="bulk-absent-btn"
                  onClick={markAllAbsent}
                  style={{
                    padding: '8px 16px',
                    background: '#e82222',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  ❌ Mark All Absent
                </button>
                
                <button
                  className="clear-all-btn"
                  onClick={clearAllMarks}
                  style={{
                    padding: '8px 16px',
                    background: '#7f8c8d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  🧹 Clear All
                </button>
                
                <div style={{ 
                  color: 'white', 
                  fontSize: '14px', 
                  marginLeft: '10px',
                  alignSelf: 'center'
                }}>
                  Students: {filtered.length} | 
                  Present: {Object.values(marked).filter(m => m === 'P').length} | 
                  Absent: {Object.values(marked).filter(m => m === 'A').length} | 
                  OD: {Object.values(marked).filter(m => m === 'OD').length}
                </div>
              </div>
            </div>

            <table className="staff-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Reg No</th>
                  <th>Name</th>
                  <th>Mark</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s._id || s.id}
                    className={
                      marked[s._id || s.id] === "P"
                        ? "present-row"
                        : marked[s._id || s.id] === "A"
                        ? "absent-row"
                        : marked[s._id || s.id] === "OD"
                        ? "od-row"
                        : ""
                    }
                  >
                    <td>
                      <img 
                        src={getStudentPhoto(s.photo)} 
                        alt={s.name} 
                        className="student-photo" 
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100?text=No+Photo';
                        }}
                      />
                    </td>
                    <td>{s.regNo || s.reg}</td>
                    <td>{s.name}</td>
                    <td>
                      <button
                        className={marked[s._id || s.id] === "P" ? "present-btn" : ""}
                        onClick={() => markAttendance(s._id || s.id, "P")}
                      >
                        Present
                      </button>
                      <button
                        className={marked[s._id || s.id] === "A" ? "absent-btn" : ""}
                        onClick={() => markAttendance(s._id || s.id, "A")}
                      >
                        Absent
                      </button>
                      <button
                        className={marked[s._id || s.id] === "OD" ? "od-btn" : ""}
                        onClick={() => markAttendance(s._id || s.id, "OD")}
                      >
                        OD
                      </button>
                    </td>
                    <td>
                      {(marked[s._id || s.id] === "A" || marked[s._id || s.id] === "OD") && (
                        <input
                          type="text"
                          placeholder="Enter reason"
                          value={reasons[s._id || s.id] || ""}
                          onChange={(e) => handleReasonChange(s._id || s.id, e.target.value)}
                          required
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </>
        )}

        {currentTimetable && (!selectedDay || !selectedPeriod) && (
          <div className="selection-required">
            <p>Please select a day and period from the timetable to mark attendance.</p>
          </div>
        )}

        {submitted && (
          <div className="attendance-summary">
            <h3>Attendance Submitted Successfully! ✅</h3>
            <p><strong>Class:</strong> {selectedDay} Period {selectedPeriod} - {submitted.record.subject}</p>
            <p><strong>Staff:</strong> {submitted.record.staff}</p>
            {selectedDay === 'SAT' && (
              <p><strong>Saturday Timetable:</strong> {getSaturdayTimetables(currentTimetable)[selectedSaturdayTimetable]?.name}</p>
            )}
            <p>Total Students: {submitted.total}</p>
            <p>Present: {submitted.present}</p>
            <p>Absent: {submitted.absent}</p>
            <p>On Duty: {submitted.od}</p>

            <h4>Absent / OD Reasons:</h4>
            <ul>
              {Object.entries(submitted.reasons).map(([id, reason]) => {
                const st = filtered.find((s) => (s._id || s.id) === id);
                return (
                  <li key={id}>
                    {st?.regNo || st?.reg} - {st?.name} : {reason}
                  </li>
                );
              })}
            </ul>

            <div className="download-buttons">
              <h4>Download Reports:</h4>
              
              {/* Current Session - Full Report */}
              <button 
                className="download-btn current-session"
                onClick={() => exportAttendanceToExcel([submitted.record], filtered)}
                style={{ margin: '5px', padding: '8px 12px' }}
              >
                📥 Download Current Session (Full)
              </button>
              
              {/* NEW: Current Session - Absent/OD Only */}
              <button 
                className="download-btn absent-od-only"
                onClick={() => exportAbsentODToExcel(submitted.record, filtered)}
                style={{ margin: '5px', padding: '8px 12px', background: '#e74c3c' }}
              >
                📋 Download Absent/OD Only (Current)
              </button>
              
              {/* NEW: All Records - Absent/OD Only */}
              <button 
                className="download-btn all-absent-od"
                onClick={exportAllAbsentODToExcel}
                style={{ margin: '5px', padding: '8px 12px', background: '#f39c12' }}
              >
                📊 Download All Absent/OD Records
              </button>
              
              {/* Existing All Records Button */}
              {attendanceRecords.length > 1 && (
                <button 
                  className="download-btn all-records"
                  onClick={handleDownload}
                  style={{ margin: '5px', padding: '8px 12px' }}
                >
                  📈 Download All Records (Full)
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
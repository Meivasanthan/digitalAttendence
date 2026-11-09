// src/data.js

// Departments, Years, Sections
export const departments = ["CSE", "ECE", "EEE", "CSE(CS)", "CHEM", "BME"];
export const years = ["I", "II", "III", "IV"];
export const sections = ["A", "B", "C"];

// Mock student list
export const students = [
  { id: "123", name: "Ummu Kulsu A", reg: "23CS123", dept: "CSE", year: "III", section: "C", photo:  require("./assets/23cs123.jpg"), },
  { id: "122", name: "Tharun A", reg: "23CS122", dept: "CSE", year: "III", section: "C", photo: "https://via.placeholder.com/100" },
  { id: "121", name: "Tharaneesh MR", reg: "23CS121", dept: "CSE", year: "III", section: "C", photo: require("./assets/23cs121.jpg"), },
  { id: "103", name: "Nithyashree RS", reg: "23CS103", dept: "CSE", year: "III", section: "B", photo: "https://via.placeholder.com/100" },
  { id: "090", name: "Kavyashree A", reg: "23CS090", dept: "CSE", year: "III", section: "B", photo: "https://via.placeholder.com/100" },
  { id: "102", name: "Nishanthraj M", reg: "23CS102", dept: "CSE", year: "III", section: "B", photo: "https://via.placeholder.com/100" },
  { id: "109", name: "Ravivarman S", reg: "23CS109", dept: "CSE", year: "III", section: "B", photo: "https://via.placeholder.com/100" },
  { id: "088", name: "Hemalatha S", reg: "23CS088", dept: "CSE", year: "III", section: "A", photo: "https://via.placeholder.com/100" },
  { id: "085", name: "Gomala P", reg: "23CS085", dept: "CSE", year: "III", section: "A", photo: "https://via.placeholder.com/100" },
  { id: "087", name: "Harshavarthini K", reg: "23CS087", dept: "CSE", year: "III", section: "A", photo: "https://via.placeholder.com/100" },
  { id: "130", name: "Vishal C", reg: "23CS130", dept: "CSE", year: "III", section: "C", photo: require("./assets/23cs130.jpg"), },
  { id: "L08", name: "Logesh S", reg: "23CSL08", dept: "CSE", year: "III", section: "C", photo: require("./assets/23csL08.jpg"), },
  { id: "098", name: "Nakshatra C", reg: "23CS098", dept: "CSE", year: "III", section: "B", photo: "https://via.placeholder.com/100" },
  { id: "118", name: "Srinnethi RD", reg: "23CS118", dept: "CSE", year: "III", section: "C", photo: require("./assets/23cs118.jpg"), },
  { id: "124", name: "Varsha K", reg: "23CS124", dept: "CSE", year: "III", section: "C", photo: require("./assets/23cs124.jpg"), },
  { id: "108", name: "Ragavi M", reg: "23CS108", dept: "CSE", year: "III", section: "B", photo: "https://via.placeholder.com/100" },
  { id: "167", name: "Shalini N", reg: "23CS167", dept: "CSE", year: "III", section: "C", photo: require("./assets/23cs167.jpg"), },
  { id: "124", name: "Tharssan Sriram CJ", reg: "23CS175", dept: "CSE", year: "III", section: "C", photo: require("./assets/23cs175.jpg"), },
  { id: "084", name: "Gobinath M", reg: "23CS084", dept: "CSE", year: "III", section: "A", photo: "https://via.placeholder.com/100" },
  { id: "076", name: "Ashwin S", reg: "23CS076", dept: "CSE", year: "III", section: "A", photo: "https://via.placeholder.com/100" },
  

];

// Mock staff login
export const staffAccounts = [
  { email: "radha.j@nandhaengg.org", password: "123456" }
];

// Mock student login
export const studentAccounts = [
  { email: "23cs123@nandhaengg.org", password: "123", studentId: "001" },
  { email: "23cs122@nandhaengg.org", password: "122", studentId: "002" },
  { email: "23cs121@nandhaengg.org", password: "121", studentId: "003" },
  { email: "23cs103@nandhaengg.org", password: "103", studentId: "103" },
  { email: "23cs102@nandhaengg.org", password: "102", studentId: "102" },
  { email: "23cs109@nandhaengg.org", password: "109", studentId: "109" },
  { email: "23cs090@nandhaengg.org", password: "090", studentId: "090" },
  { email: "23cs088@nandhaengg.org", password: "088", studentId: "088" },
  { email: "23cs085@nandhaengg.org", password: "085", studentId: "085" },
  { email: "23cs087@nandhaengg.org", password: "087", studentId: "087" },
];

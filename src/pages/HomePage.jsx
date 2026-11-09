import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import logo from "../assets/logo.png";

export default function HomePage() {
  return (
    <div className="home-container">
      {/* 🔹 Top header with logo + institute name */}
      <div className="home-header">
        <img src={logo} alt="College Logo" className="college-logo" />
        <div className="college-name">
          <h1>NANDHA ENGINEERING COLLEGE</h1>
          <p>(Autonomous) | Erode</p>
        </div>
      </div>

      {/* 🔹 Center title */}
      <h2>DIGITAL ATTENDANCE</h2>

      {/* 🔹 Login Buttons */}
      <div className="home-buttons">
        <Link to="/staff/login">
          <button>Staff Login</button>
        </Link>
        <Link to="/student/login">
          <button>Student Login</button>
        </Link>
      </div>

      {/* 🔹 NEW: Dashboard Access Buttons */}
      <div className="dashboard-access">
        <h3>FACULTY DASHBOARD ACCESS</h3>
        <div className="dashboard-buttons">
          <Link to="/ac/login">
            <button className="ac-btn">ACADEMIC COORDINATOR</button>
          </Link>
          <Link to="/proctor/login">
            <button className="proctor-btn">PROCTOR</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentLogin.css";

export default function StudentLogin() {
  const [regNo, setRegNo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/auth/student/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ regNo, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        navigate("/student/dashboard");
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>Student Login</h2>

        <label>Registration Number</label>
        <input
          type="text"
          value={regNo}
          onChange={(e) => setRegNo(e.target.value.toUpperCase())}
          placeholder="23CS123"
          required
          disabled={loading}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="123"
          required
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          background: 'rgba(255,255,255,0.2)', 
          borderRadius: '5px',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          <strong>Demo Credentials:</strong><br/>
          Reg No: 23CS123<br/>
          Password: 123
        </div>
      </form>
    </div>
  );
}
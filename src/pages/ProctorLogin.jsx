// ProctorLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ProctorLogin.css';
import logo from "../assets/logo.png";

export default function ProctorLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate form data before sending
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Attempting login with:', formData);

      const loginData = {
        email: formData.email.trim(),
        password: formData.password
      };

      console.log('📤 Sending data:', loginData);

      const response = await fetch('http://localhost:4000/api/staff/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📋 Response data:', data);

      if (response.ok && data.success) {
        console.log('✅ Login successful');
        // Store token and staff info
        localStorage.setItem('token', data.token);
        localStorage.setItem('staffInfo', JSON.stringify(data.staff));
        localStorage.setItem('userRole', 'proctor');
        
        // Redirect to proctor dashboard
        navigate('/proctor/dashboard');
      } else {
        console.log('❌ Login failed:', data.message);
        setError(data.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      setError('Network error. Please check if backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="proctor-login-container">
      {/* Header */}
      <div className="login-header">
        <img src={logo} alt="College Logo" className="college-logo" />
        <div className="college-name">
          <h1>NANDHA ENGINEERING COLLEGE</h1>
          <p>(Autonomous) | Erode</p>
        </div>
      </div>

      <div className="proctor-login-card">
        <h2>Proctor Login</h2>
        <p className="login-subtitle">Enter your credentials to access Proctor Dashboard</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your college email"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login as Proctor'}
          </button>
        </form>

        <div className="login-links">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
        </div>

        
      </div>
    </div>
  );
}
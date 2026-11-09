import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ACLogin.css';
import logo from "../assets/logo.png";

export default function ACLogin() {
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
      const loginData = {
        email: formData.email.trim(),
        password: formData.password
      };

      const response = await fetch('http://localhost:4000/api/acstaff/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (response.ok && data.message === 'Login successful') {
        // Store staff data
        localStorage.setItem('acStaff', JSON.stringify(data.staff));
        localStorage.setItem('userRole', 'ac_staff');

        // Redirect to AC dashboard
        navigate('/ac/dashboard');
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (error) {
      setError('Network error. Please check if backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ac-login-container">
      {/* Header */}
      <div className="login-header">
        <img src={logo} alt="College Logo" className="college-logo" />
        <div className="college-name">
          <h1>NANDHA ENGINEERING COLLEGE</h1>
          <p>(Autonomous) | Erode</p>
        </div>
      </div>

      <div className="ac-login-card">
        <h2>AC Staff Login</h2>
        <p className="login-subtitle">Enter your credentials to access Academic Coordinator Dashboard</p>

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
            {loading ? 'Logging in...' : 'Login as AC Staff'}
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
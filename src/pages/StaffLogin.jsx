import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StaffLogin.css";

export default function StaffLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/auth/staff/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        navigate("/staff/dashboard");
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
    <div className="staff-login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>Staff Login</h2>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="radha.j@nandhaengg.org"
          required
          disabled={loading}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="12345"
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
          Email: radha.j@nandhaengg.org<br/>
          Password: 12345
        </div>
      </form>
    </div>
  );
}
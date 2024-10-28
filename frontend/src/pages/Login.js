// src/pages/Login.js
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Auth.css'; // Import the CSS file

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password }); // Assuming login function accepts an object with email and password
      navigate('/'); // Redirect to Home after successful login
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? 
        <button onClick={() => navigate('/signup')} className="signup-button"> Sign Up</button>
      </p>
    </div>
  );
};

export default Login;

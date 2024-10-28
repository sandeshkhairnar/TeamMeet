// src/pages/Signup.js
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Auth.css'; // Import the CSS file

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
    } else {
      // Simulate successful signup
      login({ email });
      navigate('/'); // Redirect to Home after signup
    }
  };

  return (
    <div className="auth-container">
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? 
        <button onClick={() => navigate('/login')} className="login-button"> Go to Login</button>
      </p>
    </div>
  );
};

export default Signup;

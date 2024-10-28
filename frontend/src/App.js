// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Meetings from './pages/Meetings';
import Webinars from './pages/Webinars';
import Room from './pages/Room';
import Messages from './pages/Messages';
import { AuthProvider, useAuth } from './AuthContext';

const PrivateRoute = ({ element }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? element : <Navigate to="/login" />;
};

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<PrivateRoute element={<Home />} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
        <Route path="/meetings" element={<PrivateRoute element={<Meetings />} />} />
        <Route path="/webinars" element={<PrivateRoute element={<Webinars />} />} />
        <Route path="/messages" element={<PrivateRoute element={<Messages />} />} />
        <Route path="/room/:roomId" element={<Room />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;

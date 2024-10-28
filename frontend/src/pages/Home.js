// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { NavbarDropdown } from '../components/navbar';
import { Plus, Video, Users, Calendar } from 'lucide-react';
import './Home.css';

const Home = () => {
  const { user, logout } = useAuth();
  const [roomId, setRoomId] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const createRoom = () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    navigate(`/room/${newRoomId}`);
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/room/${roomId}`);
    } else {
      alert('Please enter a valid room ID.');
    }
  };

  const createMeeting = () => {
    const meetingDetails = {
      title: '',
      date: new Date(),
      participants: [],
      roomId: generateRoomId()
    };
    navigate('/create-meeting', { state: { meetingDetails } });
  };

  const quickActions = [
    {
      title: 'Start Instant Meeting',
      icon: <Video className="action-icon" />,
      onClick: createRoom,
      description: 'Start a video meeting instantly'
    },
    {
      title: 'Join Meeting',
      icon: <Users className="action-icon" />,
      onClick: () => document.getElementById('room-id-input').focus(),
      description: 'Join using a meeting code'
    },
    {
      title: 'Schedule Meeting',
      icon: <Calendar className="action-icon" />,
      onClick: () => navigate('/schedule'),
      description: 'Schedule a meeting for later'
    },
    {
      title: 'Create Meeting',
      icon: <Plus className="action-icon" />,
      onClick: createMeeting,
      description: 'Create a new meeting room'
    }
  ];

  return (
    <div className="home-container">
      <NavbarDropdown user={user} logout={logout} />
      
      <main className={`main-content ${showWelcome ? 'with-welcome' : 'without-welcome'}`}>
        {showWelcome && (
          <div className="welcome-section">
            <h1 className="welcome-title">Welcome back, {user?.displayName || user?.email}</h1>
            <p className="welcome-subtitle">Start or join a meeting with just one click</p>
          </div>
        )}

        <div className="quick-actions">
          {quickActions.map((action, index) => (
            <div key={index} className="action-card" onClick={action.onClick}>
              <div className="action-icon-wrapper">
                {action.icon}
              </div>
              <h3 className="action-title">{action.title}</h3>
              <p className="action-description">{action.description}</p>
            </div>
          ))}
        </div>

        <div className="meeting-section">
          <div className="join-meeting-container">
            <h2 className="section-title">Join Existing Meeting</h2>
            <form onSubmit={joinRoom} className="join-form">
              <input
                id="room-id-input"
                type="text"
                placeholder="Enter meeting code"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="room-input"
              />
              <button type="submit" className="join-button">
                Join Meeting
              </button>
            </form>
          </div>

          <div className="upcoming-meetings">
            <h2 className="section-title">Upcoming Meetings</h2>
            <div className="meetings-list">
              <p className="no-meetings">No upcoming meetings scheduled</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;